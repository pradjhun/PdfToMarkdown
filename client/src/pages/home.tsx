import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import UploadSection from "@/components/upload-section";
import ProcessingSection from "@/components/processing-section";
import StatusSection from "@/components/status-section";
import ResultsSection from "@/components/results-section";
import { ConversionSettings } from "@shared/schema";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [conversionId, setConversionId] = useState<string | null>(null);
  const [settings, setSettings] = useState<ConversionSettings>({
    outputFormat: "standard",
    preserveFormatting: true,
    extractImages: false,
    extractionMethod: "auto",
    includeMetadata: false,
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setConversionId(null); // Reset any previous conversion
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setConversionId(null);
  };

  const handleConversionStart = (id: string) => {
    setConversionId(id);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        <UploadSection
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onRemoveFile={handleRemoveFile}
        />
        
        <ProcessingSection
          selectedFile={selectedFile}
          settings={settings}
          onSettingsChange={setSettings}
          onConversionStart={handleConversionStart}
        />
        
        {conversionId && (
          <>
            <StatusSection conversionId={conversionId} />
            <ResultsSection conversionId={conversionId} />
          </>
        )}
        
        {/* Info Section */}
        <section>
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Supported Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-card-foreground">File Support</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-chart-2 rounded-full"></div>
                    <span>PDF files up to 50MB</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-chart-2 rounded-full"></div>
                    <span>Text-based and scanned PDFs</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-chart-2 rounded-full"></div>
                    <span>Multi-page documents</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-card-foreground">Output Options</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-chart-2 rounded-full"></div>
                    <span>Standard Markdown format</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-chart-2 rounded-full"></div>
                    <span>Preserved text formatting</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-chart-2 rounded-full"></div>
                    <span>Downloadable .md files</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
