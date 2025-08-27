import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertConversionSchema, conversionSettingsSchema } from "@shared/schema";
import { z } from "zod";

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload and start conversion
  app.post("/api/convert", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const settings = req.body.settings ? JSON.parse(req.body.settings) : {};
      const validatedSettings = conversionSettingsSchema.parse(settings);

      const conversion = await storage.createConversion({
        filename: req.file.originalname,
        originalSize: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`,
        status: "pending",
        settings: validatedSettings,
        markdownContent: null,
        errorMessage: null,
      });

      // Start conversion process
      processConversion(conversion.id, req.file.path, validatedSettings);

      res.json(conversion);
    } catch (error) {
      console.error("Error starting conversion:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  // Get conversion status
  app.get("/api/conversions/:id", async (req, res) => {
    try {
      const conversion = await storage.getConversion(req.params.id);
      if (!conversion) {
        return res.status(404).json({ message: "Conversion not found" });
      }
      res.json(conversion);
    } catch (error) {
      console.error("Error fetching conversion:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Download markdown file
  app.get("/api/conversions/:id/download", async (req, res) => {
    try {
      const conversion = await storage.getConversion(req.params.id);
      if (!conversion || conversion.status !== "completed" || !conversion.markdownContent) {
        return res.status(404).json({ message: "Conversion not found or not completed" });
      }

      const filename = conversion.filename.replace(".pdf", ".md");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", "text/markdown");
      res.send(conversion.markdownContent);
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // List conversions
  app.get("/api/conversions", async (req, res) => {
    try {
      const conversions = await storage.getConversions();
      res.json(conversions);
    } catch (error) {
      console.error("Error fetching conversions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function processConversion(conversionId: string, filePath: string, settings: any) {
  try {
    console.log(`Starting conversion for ${conversionId} with file ${filePath}`);
    await storage.updateConversion(conversionId, { status: "processing" });

    const pythonScript = path.join(process.cwd(), "server", "convert_pdf.py");
    const python = spawn("python3", [pythonScript, filePath, JSON.stringify(settings)]);

    let output = "";
    let error = "";
    let isProcessed = false;

    // Set a timeout to prevent hanging
    const timeout = setTimeout(async () => {
      if (!isProcessed) {
        console.log(`Conversion timeout for ${conversionId}`);
        python.kill();
        await storage.updateConversion(conversionId, {
          status: "error",
          errorMessage: "Conversion timed out after 120 seconds",
        });
        isProcessed = true;
      }
    }, 120000); // 2 minutes timeout

    python.stdout.on("data", (data) => {
      output += data.toString();
      console.log(`Python stdout: ${data.toString().substring(0, 100)}...`);
    });

    python.stderr.on("data", (data) => {
      error += data.toString();
      console.error(`Python stderr: ${data.toString()}`);
    });

    python.on("close", async (code) => {
      if (isProcessed) return; // Already handled by timeout
      isProcessed = true;
      clearTimeout(timeout);

      console.log(`Python process closed with code ${code} for ${conversionId}`);
      
      // Clean up uploaded file
      try {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up file: ${filePath}`);
      } catch (e) {
        console.error("Error cleaning up file:", e);
      }

      if (code === 0 && output.trim()) {
        console.log(`Conversion successful for ${conversionId}, output length: ${output.length}`);
        await storage.updateConversion(conversionId, {
          status: "completed",
          markdownContent: output,
        });
      } else {
        console.error(`Conversion failed for ${conversionId}, code: ${code}, error: ${error}`);
        await storage.updateConversion(conversionId, {
          status: "error",
          errorMessage: error || `Conversion failed with exit code ${code}`,
        });
      }
    });

    python.on("error", async (err) => {
      if (isProcessed) return;
      isProcessed = true;
      clearTimeout(timeout);
      
      console.error("Python process error:", err);
      await storage.updateConversion(conversionId, {
        status: "error",
        errorMessage: `Failed to start conversion process: ${err.message}`,
      });
    });
  } catch (error) {
    console.error("Error in processConversion:", error);
    await storage.updateConversion(conversionId, {
      status: "error",
      errorMessage: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}
