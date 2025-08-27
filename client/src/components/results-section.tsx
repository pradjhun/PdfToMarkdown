import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Conversion } from "@shared/schema";

interface ResultsSectionProps {
  conversionId: string;
}

export default function ResultsSection({ conversionId }: ResultsSectionProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "raw">("preview");
  
  const { data: conversion, isLoading } = useQuery<Conversion>({
    queryKey: ["/api/conversions", conversionId],
    refetchInterval: conversion?.status === "processing" ? 1000 : false,
    enabled: !!conversionId,
  });

  if (isLoading || !conversion || conversion.status !== "completed" || !conversion.markdownContent) {
    return null;
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/conversions/${conversionId}/download`);
      if (!response.ok) throw new Error("Download failed");
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = conversion.filename.replace(".pdf", ".md");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const renderPreview = () => {
    const lines = conversion.markdownContent!.split('\n');
    const elements: JSX.Element[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) {
        elements.push(<div key={i} className="h-4" />);
        continue;
      }
      
      // Skip HTML comments (page markers)
      if (line.startsWith('<!--')) {
        continue;
      }
      
      // Headers
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-2xl font-bold text-foreground mb-4 mt-6">
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-xl font-semibold text-foreground mb-3 mt-5">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-lg font-medium text-foreground mb-2 mt-4">
            {line.substring(4)}
          </h3>
        );
      }
      // List items
      else if (line.startsWith('- ')) {
        elements.push(
          <li key={i} className="text-muted-foreground mb-1 ml-4">
            • {line.substring(2)}
          </li>
        );
      }
      // Quotes
      else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={i} className="border-l-4 border-border pl-4 italic text-muted-foreground mb-4">
            {line.substring(2)}
          </blockquote>
        );
      }
      // Regular paragraphs
      else {
        elements.push(
          <p key={i} className="text-foreground mb-3 leading-relaxed">
            {line}
          </p>
        );
      }
    }
    
    return <div className="prose prose-sm max-w-none">{elements}</div>;
  };

  return (
    <section className="mb-8" data-testid="results-section">
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="border-b border-border bg-muted/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-card-foreground">Converted Markdown</h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Conversion completed</span>
              </div>
              <Button
                onClick={handleDownload}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium flex items-center space-x-2"
                data-testid="button-download"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Tabs for Preview/Raw */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            <button
              className={`py-3 border-b-2 text-sm font-medium transition-colors ${
                activeTab === "preview"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("preview")}
              data-testid="button-tab-preview"
            >
              Preview
            </button>
            <button
              className={`py-3 border-b-2 text-sm font-medium transition-colors ${
                activeTab === "raw"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("raw")}
              data-testid="button-tab-raw"
            >
              Raw Markdown
            </button>
          </nav>
        </div>
        
        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto" data-testid="content-area">
          {activeTab === "preview" ? (
            renderPreview()
          ) : (
            <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
              {conversion.markdownContent}
            </pre>
          )}
        </div>
      </div>
    </section>
  );
}
