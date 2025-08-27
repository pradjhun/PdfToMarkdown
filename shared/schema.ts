import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const conversions = pgTable("conversions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalSize: text("original_size").notNull(),
  status: varchar("status").notNull().$type<"pending" | "processing" | "completed" | "error">(),
  settings: jsonb("settings"),
  markdownContent: text("markdown_content"),
  errorMessage: text("error_message"),
  progressInfo: jsonb("progress_info"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConversionSchema = createInsertSchema(conversions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const progressInfoSchema = z.object({
  currentStep: z.string().optional(),
  library: z.string().optional(),
  extractedTextLength: z.number().optional(),
  markdownLength: z.number().optional(),
  method: z.string().optional(),
  imagesFound: z.number().optional(),
  imagesSaved: z.number().optional(),
  currentPage: z.number().optional(),
  lastSavedImage: z.string().optional(),
  imagesDirectory: z.string().optional(),
  imageExtractionEnabled: z.boolean().optional(),
});

export type InsertConversion = z.infer<typeof insertConversionSchema>;
export type Conversion = typeof conversions.$inferSelect;

export const conversionSettingsSchema = z.object({
  outputFormat: z.enum(["standard", "github", "commonmark"]).default("standard"),
  preserveFormatting: z.boolean().default(true),
  extractImages: z.boolean().default(false),
  extractionMethod: z.enum(["auto", "ocr", "text-only"]).default("auto"),
  includeMetadata: z.boolean().default(false),
});

export type ConversionSettings = z.infer<typeof conversionSettingsSchema>;
