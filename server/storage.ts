import { type Conversion, type InsertConversion } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  
  // Conversion methods
  createConversion(conversion: InsertConversion): Promise<Conversion>;
  getConversion(id: string): Promise<Conversion | undefined>;
  updateConversion(id: string, updates: Partial<Conversion>): Promise<Conversion | undefined>;
  getConversions(): Promise<Conversion[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, any>;
  private conversions: Map<string, Conversion>;

  constructor() {
    this.users = new Map();
    this.conversions = new Map();
  }

  async getUser(id: string): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createConversion(insertConversion: InsertConversion): Promise<Conversion> {
    const id = randomUUID();
    const now = new Date();
    const conversion: Conversion = {
      id,
      filename: insertConversion.filename,
      originalSize: insertConversion.originalSize,
      status: insertConversion.status as "pending" | "processing" | "completed" | "error",
      settings: insertConversion.settings || null,
      markdownContent: insertConversion.markdownContent || null,
      errorMessage: insertConversion.errorMessage || null,
      createdAt: now,
      updatedAt: now,
    };
    this.conversions.set(id, conversion);
    return conversion;
  }

  async getConversion(id: string): Promise<Conversion | undefined> {
    return this.conversions.get(id);
  }

  async updateConversion(id: string, updates: Partial<Conversion>): Promise<Conversion | undefined> {
    const existing = this.conversions.get(id);
    if (!existing) return undefined;

    const updated: Conversion = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.conversions.set(id, updated);
    return updated;
  }

  async getConversions(): Promise<Conversion[]> {
    return Array.from(this.conversions.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }
}

export const storage = new MemStorage();
