import { useRef } from "react";
import { Upload, X, FileText } from "lucide-react";

interface UploadSectionProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onRemoveFile: () => void;
}

export default function UploadSection({ selectedFile, onFileSelect, onRemoveFile }: UploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove("dragover");
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === "application/pdf") {
      onFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add("dragover");
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove("dragover");
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <section className="mb-8">
      <div className="bg-card rounded-lg border border-border p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-card-foreground mb-2">Upload PDF Document</h2>
          <p className="text-muted-foreground">Select a PDF file to convert to Markdown format</p>
        </div>

        {!selectedFile ? (
          <div
            className="upload-zone border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary hover:bg-accent/50 cursor-pointer transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
            data-testid="upload-zone"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium text-card-foreground">Drop your PDF file here</p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
              </div>
              <button
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                data-testid="button-choose-file"
              >
                Choose File
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={handleFileInputChange}
              data-testid="input-file"
            />
          </div>
        ) : (
          <div className="mt-6 p-4 bg-muted rounded-lg border border-border" data-testid="file-info">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground" data-testid="text-filename">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-muted-foreground" data-testid="text-filesize">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <button
                className="text-muted-foreground hover:text-destructive"
                onClick={onRemoveFile}
                data-testid="button-remove-file"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
