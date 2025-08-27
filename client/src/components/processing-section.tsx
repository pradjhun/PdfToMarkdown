import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ConversionSettings } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProcessingSectionProps {
  selectedFile: File | null;
  settings: ConversionSettings;
  onSettingsChange: (settings: ConversionSettings) => void;
  onConversionStart: (id: string) => void;
}

export default function ProcessingSection({
  selectedFile,
  settings,
  onSettingsChange,
  onConversionStart,
}: ProcessingSectionProps) {
  const { toast } = useToast();

  const convertMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error("No file selected");

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("settings", JSON.stringify(settings));

      const response = await apiRequest("POST", "/api/convert", formData);
      return response.json();
    },
    onSuccess: (data) => {
      onConversionStart(data.id);
      toast({
        title: "Conversion Started",
        description: "Your PDF is being converted to Markdown.",
      });
    },
    onError: (error) => {
      toast({
        title: "Conversion Failed",
        description: error instanceof Error ? error.message : "Failed to start conversion",
        variant: "destructive",
      });
    },
  });

  const handleStartConversion = () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a PDF file first.",
        variant: "destructive",
      });
      return;
    }
    convertMutation.mutate();
  };

  const updateSettings = (key: keyof ConversionSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <section className="mb-8">
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Conversion Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Output Format
              </label>
              <Select
                value={settings.outputFormat}
                onValueChange={(value: "standard" | "github" | "commonmark") =>
                  updateSettings("outputFormat", value)
                }
              >
                <SelectTrigger className="w-full" data-testid="select-output-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Markdown</SelectItem>
                  <SelectItem value="github">GitHub Flavored Markdown</SelectItem>
                  <SelectItem value="commonmark">CommonMark</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="preserve-formatting"
                checked={settings.preserveFormatting}
                onCheckedChange={(checked) =>
                  updateSettings("preserveFormatting", checked)
                }
                data-testid="checkbox-preserve-formatting"
              />
              <label htmlFor="preserve-formatting" className="text-sm text-card-foreground">
                Preserve original formatting
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="extract-images"
                checked={settings.extractImages}
                onCheckedChange={(checked) =>
                  updateSettings("extractImages", checked)
                }
                data-testid="checkbox-extract-images"
              />
              <label htmlFor="extract-images" className="text-sm text-card-foreground">
                Extract embedded images
              </label>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Text Extraction Method
              </label>
              <Select
                value={settings.extractionMethod}
                onValueChange={(value: "auto" | "ocr" | "text-only") =>
                  updateSettings("extractionMethod", value)
                }
              >
                <SelectTrigger className="w-full" data-testid="select-extraction-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  <SelectItem value="ocr">OCR (for scanned PDFs)</SelectItem>
                  <SelectItem value="text-only">Text extraction only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-metadata"
                checked={settings.includeMetadata}
                onCheckedChange={(checked) =>
                  updateSettings("includeMetadata", checked)
                }
                data-testid="checkbox-include-metadata"
              />
              <label htmlFor="include-metadata" className="text-sm text-card-foreground">
                Include document metadata
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleStartConversion}
            disabled={!selectedFile || convertMutation.isPending}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium flex items-center space-x-2"
            data-testid="button-start-conversion"
          >
            <RefreshCw className={`w-5 h-5 ${convertMutation.isPending ? "animate-spin" : ""}`} />
            <span>{convertMutation.isPending ? "Converting..." : "Convert to Markdown"}</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
