import { useQuery } from "@tanstack/react-query";
import { Conversion } from "@shared/schema";

interface StatusSectionProps {
  conversionId: string;
}

export default function StatusSection({ conversionId }: StatusSectionProps) {
  const { data: conversion, isLoading } = useQuery<Conversion>({
    queryKey: ["/api/conversions", conversionId],
    enabled: !!conversionId,
  });

  const { refetch } = useQuery<Conversion>({
    queryKey: ["/api/conversions", conversionId, "poll"],
    refetchInterval: conversion?.status === "processing" ? 1000 : false,
    enabled: !!conversionId && conversion?.status === "processing",
  });

  if (isLoading || !conversion) {
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
    switch (conversion.status) {
      case "pending":
        return {
          color: "chart-3",
          text: "Pending...",
          progress: 10,
          message: "Preparing for conversion",
        };
      case "processing":
        return {
          color: "chart-3",
          text: "Processing...",
          progress: 65,
          message: "Converting PDF to Markdown",
        };
      case "completed":
        return {
          color: "chart-2",
          text: "Completed",
          progress: 100,
          message: "Conversion successful",
        };
      case "error":
        return {
          color: "destructive",
          text: "Error",
          progress: 0,
          message: conversion.errorMessage || "Conversion failed",
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
            <div className={`w-3 h-3 bg-${statusInfo.color} rounded-full ${conversion.status === "processing" ? "animate-pulse" : ""}`}></div>
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
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
            <span className="text-muted-foreground">PDF loaded successfully</span>
          </div>
          {conversion.status === "processing" || conversion.status === "completed" ? (
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
              <span className="text-muted-foreground">Extracting text content</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-border rounded-full"></div>
              <span className="text-muted-foreground">Extracting text content</span>
            </div>
          )}
          {conversion.status === "completed" ? (
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
              <span className="text-muted-foreground">Converting to Markdown format</span>
            </div>
          ) : conversion.status === "processing" ? (
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-chart-3 rounded-full animate-pulse"></div>
              <span className="text-muted-foreground">Converting to Markdown format</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-border rounded-full"></div>
              <span className="text-muted-foreground">Converting to Markdown format</span>
            </div>
          )}
          {conversion.status === "completed" ? (
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
              <span className="text-muted-foreground">Optimizing output</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-border rounded-full"></div>
              <span className="text-muted-foreground">Optimizing output</span>
            </div>
          )}
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
