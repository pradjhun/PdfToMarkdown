import { useQuery } from "@tanstack/react-query";
import { Conversion } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useEffect } from "react";

interface ProgressInfo {
  currentStep?: string;
  library?: string;
  extractedTextLength?: number;
  markdownLength?: number;
  method?: string;
  imagesFound?: number;
  imagesSaved?: number;
  currentPage?: number;
  lastSavedImage?: string;
  imagesDirectory?: string;
  imageExtractionEnabled?: boolean;
}

interface StatusSectionProps {
  conversionId: string;
}

export default function StatusSection({ conversionId }: StatusSectionProps) {
  const { data: conversion, isLoading } = useQuery<Conversion>({
    queryKey: ["/api/conversions", conversionId],
    enabled: !!conversionId,
  });

  const { data: pollingData } = useQuery<Conversion>({
    queryKey: ["/api/conversions", conversionId, "poll"],
    refetchInterval: conversion?.status === "processing" ? 1000 : false,
    enabled: !!conversionId && (conversion?.status === "processing" || conversion?.status === "pending"),
  });

  // Use polling data if it's more recent than main query data
  const currentConversion = pollingData || conversion;

  // Refresh main query when polling detects completion
  useEffect(() => {
    if (pollingData && (pollingData.status === "completed" || pollingData.status === "error")) {
      queryClient.invalidateQueries({ queryKey: ["/api/conversions", conversionId] });
      // Force immediate refetch to ensure UI updates
      queryClient.refetchQueries({ queryKey: ["/api/conversions", conversionId] });
    }
  }, [pollingData?.status, conversionId]);

  if (isLoading || !currentConversion) {
    return (
      <section className="mb-8">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-foreground">Conversion Status</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-chart-3 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-chart-3">Loading...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const getStatusInfo = () => {
    const progressInfo = currentConversion?.progressInfo as ProgressInfo;
    
    // Force 100% if conversion is completed regardless of cached status
    if (currentConversion.status === "completed" || progressInfo?.currentStep === "Completed") {
      return {
        color: "chart-2",
        text: "Completed",
        progress: 100,
        message: "Conversion successful",
      };
    }
    
    switch (currentConversion.status) {
      case "pending":
        return {
          color: "chart-3",
          text: "Pending...",
          progress: 10,
          message: "Preparing for conversion",
        };
      case "processing":
        // Calculate dynamic progress based on processing steps
        let progress = 20; // Base progress for starting
        if (progressInfo?.library) progress = 40; // Library detected
        if (progressInfo?.extractedTextLength) progress = 60; // Text extracted
        if (progressInfo?.imagesSaved !== undefined && progressInfo.imagesSaved > 0) progress = 70; // Images extracted
        if (progressInfo?.markdownLength) progress = 85; // Markdown generated
        if (progressInfo?.currentStep === "Conversion completed") progress = 95; // Almost done
        
        return {
          color: "chart-3",
          text: "Processing...",
          progress,
          message: progressInfo?.currentStep || "Converting PDF to Markdown",
        };
      case "error":
        return {
          color: "destructive",
          text: "Error",
          progress: 0,
          message: currentConversion.errorMessage || "Conversion failed",
        };
      default:
        return {
          color: "chart-2",
          text: "Completed",
          progress: 100,
          message: "Conversion successful",
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <section className="mb-8" data-testid="status-section">
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-card-foreground">Conversion Status</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 bg-${statusInfo.color} rounded-full ${currentConversion.status === "processing" ? "animate-pulse" : ""}`}></div>
            <span className={`text-sm font-medium text-${statusInfo.color}`} data-testid="text-status">
              {statusInfo.text}
            </span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span data-testid="text-current-step">{statusInfo.message}</span>
            <span data-testid="text-progress-percentage">{statusInfo.progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="progress-bar bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${statusInfo.progress}%` }}
              data-testid="progress-bar"
            ></div>
          </div>
        </div>
        
        {/* Status Messages */}
        {/* Detailed Progress Information */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
            <span className="text-muted-foreground">PDF loaded successfully</span>
          </div>
          
          {/* Progress Info */}
          {currentConversion.progressInfo && typeof currentConversion.progressInfo === 'object' && (
            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
              <div className="text-xs font-medium text-card-foreground mb-2">Processing Details:</div>
              
              {(currentConversion.progressInfo as ProgressInfo).currentStep && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Current Step:</span>
                  <span className="font-medium text-foreground">{(currentConversion.progressInfo as ProgressInfo).currentStep}</span>
                </div>
              )}
              
              {(currentConversion.progressInfo as ProgressInfo).library && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Using Library:</span>
                  <span className="font-medium text-foreground">{(currentConversion.progressInfo as ProgressInfo).library}</span>
                </div>
              )}
              
              {(currentConversion.progressInfo as ProgressInfo).method && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Extraction Method:</span>
                  <span className="font-medium text-foreground">{(currentConversion.progressInfo as ProgressInfo).method}</span>
                </div>
              )}
              
              {(currentConversion.progressInfo as ProgressInfo).extractedTextLength && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Text Extracted:</span>
                  <span className="font-medium text-foreground">{(currentConversion.progressInfo as ProgressInfo).extractedTextLength?.toLocaleString()} chars</span>
                </div>
              )}
              
              {(currentConversion.progressInfo as ProgressInfo).markdownLength && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Markdown Generated:</span>
                  <span className="font-medium text-foreground">{(currentConversion.progressInfo as ProgressInfo).markdownLength?.toLocaleString()} chars</span>
                </div>
              )}
              
              {(currentConversion.progressInfo as ProgressInfo).imageExtractionEnabled && (
                <div className="border-t border-muted-foreground/20 pt-2 mt-2">
                  <div className="text-xs font-medium text-card-foreground mb-1">Image Extraction:</div>
                  
                  {(currentConversion.progressInfo as ProgressInfo).imagesFound !== undefined && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Images Found:</span>
                      <span className="font-medium text-foreground">{(currentConversion.progressInfo as ProgressInfo).imagesFound}</span>
                    </div>
                  )}
                  
                  {(currentConversion.progressInfo as ProgressInfo).imagesSaved !== undefined && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Images Saved:</span>
                      <span className="font-medium text-foreground">{(currentConversion.progressInfo as ProgressInfo).imagesSaved}</span>
                    </div>
                  )}
                  
                  {(currentConversion.progressInfo as ProgressInfo).currentPage && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Current Page:</span>
                      <span className="font-medium text-foreground">{(currentConversion.progressInfo as ProgressInfo).currentPage}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Step Indicators */}
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${conversion.status === "processing" || conversion.status === "completed" ? "bg-chart-2" : "bg-border"}`}></div>
            <span className="text-muted-foreground">
              Extracting text content
              {(conversion.progressInfo as ProgressInfo)?.library && ` (${(conversion.progressInfo as ProgressInfo).library})`}
            </span>
          </div>
          
          {/* Image extraction step - only show if enabled */}
          {(conversion.progressInfo as ProgressInfo)?.imageExtractionEnabled && (
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                (conversion.progressInfo as ProgressInfo)?.imagesSaved !== undefined && (conversion.progressInfo as ProgressInfo).imagesSaved! > 0 ? "bg-chart-2" : 
                conversion.status === "processing" ? "bg-chart-3 animate-pulse" : "bg-border"
              }`}></div>
              <span className="text-muted-foreground">
                Extracting images
                {(conversion.progressInfo as ProgressInfo)?.imagesSaved !== undefined && 
                 ` (${(conversion.progressInfo as ProgressInfo).imagesSaved} saved)`}
              </span>
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${
              conversion.status === "completed" ? "bg-chart-2" : 
              conversion.status === "processing" ? "bg-chart-3 animate-pulse" : "bg-border"
            }`}></div>
            <span className="text-muted-foreground">Converting to Markdown format</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${conversion.status === "completed" ? "bg-chart-2" : "bg-border"}`}></div>
            <span className="text-muted-foreground">Optimizing output</span>
          </div>
        </div>

        {conversion.status === "error" && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-destructive mb-2">Conversion Failed</h4>
                <p className="text-destructive/80" data-testid="text-error-message">
                  {conversion.errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
