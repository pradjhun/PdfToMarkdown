#!/usr/bin/env python3
import sys
import json
import PyPDF2
import pdfplumber
import re
from typing import Dict, Any, List

def extract_text_pypdf2(pdf_path: str) -> str:
    """Extract text using PyPDF2 - good for text-based PDFs."""
    text = ""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page_num, page in enumerate(pdf_reader.pages):
                page_text = page.extract_text()
                if page_text:
                    text += f"\n<!-- Page {page_num + 1} -->\n"
                    text += page_text + "\n"
    except Exception as e:
        raise Exception(f"PyPDF2 extraction failed: {str(e)}")
    return text

def extract_text_pdfplumber(pdf_path: str) -> str:
    """Extract text using pdfplumber - better for complex layouts."""
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if page_text:
                    text += f"\n<!-- Page {page_num + 1} -->\n"
                    text += page_text + "\n"
    except Exception as e:
        raise Exception(f"pdfplumber extraction failed: {str(e)}")
    return text

def clean_text(text: str) -> str:
    """Clean and normalize extracted text."""
    # Remove excessive whitespace
    text = re.sub(r'\n\s*\n\s*\n', '\n\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    
    # Remove page break artifacts
    text = re.sub(r'\n-+\n', '\n', text)
    text = re.sub(r'\n=+\n', '\n', text)
    
    return text.strip()

def convert_to_markdown(text: str, settings: Dict[str, Any]) -> str:
    """Convert extracted text to markdown format."""
    lines = text.split('\n')
    markdown_lines = []
    
    for line in lines:
        line = line.strip()
        if not line:
            markdown_lines.append('')
            continue
            
        # Handle page comments
        if line.startswith('<!-- Page'):
            if settings.get('includeMetadata', False):
                markdown_lines.append(line)
            continue
        
        # Detect headings based on formatting patterns
        if is_heading(line):
            level = detect_heading_level(line)
            markdown_lines.append('#' * level + ' ' + clean_heading(line))
        elif is_list_item(line):
            markdown_lines.append('- ' + line)
        elif is_quote(line):
            markdown_lines.append('> ' + line)
        else:
            markdown_lines.append(line)
    
    return '\n'.join(markdown_lines)

def is_heading(line: str) -> bool:
    """Detect if a line is likely a heading."""
    # Heuristics for heading detection
    if len(line) < 3:
        return False
    
    # Check for all caps (common in headings)
    if line.isupper() and len(line) < 100:
        return True
    
    # Check for numbered sections
    if re.match(r'^\d+\.?\s+[A-Z]', line):
        return True
    
    # Check for short lines that end without punctuation
    if len(line) < 80 and not line.endswith(('.', '!', '?', ',')):
        # Check if next line characteristics suggest this is a heading
        return True
    
    return False

def detect_heading_level(line: str) -> int:
    """Determine heading level based on content."""
    # Number-based sections
    if re.match(r'^\d+\.\s+', line):
        return 2
    if re.match(r'^\d+\.\d+\s+', line):
        return 3
    if re.match(r'^\d+\.\d+\.\d+\s+', line):
        return 4
    
    # Length-based heuristic
    if len(line) < 30:
        return 1
    elif len(line) < 50:
        return 2
    else:
        return 3

def clean_heading(line: str) -> str:
    """Clean heading text."""
    # Remove leading numbers and dots
    line = re.sub(r'^\d+\.?\s*', '', line)
    return line.strip()

def is_list_item(line: str) -> bool:
    """Check if line is a list item."""
    return re.match(r'^\s*[-•*]\s+', line) is not None

def is_quote(line: str) -> bool:
    """Check if line is a quote."""
    return line.startswith('"') or line.startswith('"') or line.startswith('"')

def main():
    if len(sys.argv) != 3:
        print("Usage: python convert_pdf.py <pdf_path> <settings_json>", file=sys.stderr)
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    settings_json = sys.argv[2]
    
    try:
        settings = json.loads(settings_json)
    except json.JSONDecodeError:
        print("Invalid settings JSON", file=sys.stderr)
        sys.exit(1)
    
    try:
        # Choose extraction method based on settings
        extraction_method = settings.get('extractionMethod', 'auto')
        
        if extraction_method == 'auto':
            # Try pdfplumber first, fallback to PyPDF2
            try:
                text = extract_text_pdfplumber(pdf_path)
                if not text.strip():
                    text = extract_text_pypdf2(pdf_path)
            except:
                text = extract_text_pypdf2(pdf_path)
        elif extraction_method == 'text-only':
            text = extract_text_pypdf2(pdf_path)
        else:  # pdfplumber for OCR and complex layouts
            text = extract_text_pdfplumber(pdf_path)
        
        if not text.strip():
            raise Exception("No text could be extracted from the PDF")
        
        # Clean the extracted text
        text = clean_text(text)
        
        # Convert to markdown
        markdown = convert_to_markdown(text, settings)
        
        # Output the markdown
        print(markdown)
        
    except Exception as e:
        print(f"Conversion error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
