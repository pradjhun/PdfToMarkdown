# Overview

This is a full-stack PDF to Markdown converter application built with React, TypeScript, Express.js, and Python. The application allows users to upload PDF files and convert them to Markdown format with customizable conversion settings. It features a modern UI built with shadcn/ui components and Tailwind CSS, with real-time conversion status tracking and preview capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for the main application framework
- **Vite** as the build tool and development server with hot module replacement
- **Wouter** for client-side routing (lightweight React Router alternative)
- **shadcn/ui** component library built on Radix UI primitives for consistent design
- **Tailwind CSS** with custom CSS variables for theming and responsive design
- **TanStack Query** for server state management, caching, and API interactions
- **React Hook Form** with Zod validation for form handling

## Backend Architecture
- **Express.js** server with TypeScript for API endpoints
- **Multer** middleware for handling PDF file uploads with size limits (50MB)
- **Python integration** using child processes to execute PDF conversion scripts
- **In-memory storage** implementation with interfaces for easy database migration
- **Drizzle ORM** configured for PostgreSQL with schema definitions

## Data Storage
- **PostgreSQL** database configured through Drizzle ORM
- **Neon Database** serverless PostgreSQL integration
- **Schema-based** data modeling with conversions table tracking file metadata, status, and settings
- **File system** temporary storage for uploaded PDFs during processing

## PDF Processing Pipeline
- **Python-based** conversion using PyPDF2 and pdfplumber libraries
- **Multi-method extraction** supporting text-based PDFs and OCR fallback
- **Configurable settings** including output format, formatting preservation, and extraction methods
- **Asynchronous processing** with status tracking (pending → processing → completed/error)

## Authentication & Session Management
- **Express sessions** with PostgreSQL session store using connect-pg-simple
- **Cookie-based** session management for user tracking
- **Middleware** for request logging and error handling

## API Design
- **RESTful endpoints** for file upload, conversion tracking, and result retrieval
- **JSON responses** with standardized error handling
- **File streaming** for download functionality
- **Real-time status** polling for conversion progress

## Error Handling & Validation
- **Zod schemas** for runtime type validation on both client and server
- **Comprehensive error boundaries** with user-friendly error messages
- **File type validation** ensuring only PDF uploads are accepted
- **Process isolation** for Python conversion scripts to prevent server crashes

# External Dependencies

## Database Services
- **Neon Database** - Serverless PostgreSQL hosting platform
- **Drizzle Kit** - Database migration and schema management tools

## UI Component Libraries
- **Radix UI** - Headless component primitives for accessibility
- **shadcn/ui** - Pre-built component library with Tailwind integration
- **Lucide React** - Icon library for consistent iconography

## File Processing
- **PyPDF2** - Python library for PDF text extraction
- **pdfplumber** - Advanced PDF processing with table and layout support
- **Multer** - Node.js middleware for handling multipart/form-data

## Development Tools
- **Replit** - Cloud development environment with custom plugins
- **TypeScript** - Static type checking across the full stack
- **ESBuild** - Fast bundling for production builds

## Styling & Design
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing with autoprefixer
- **Google Fonts** - Web fonts including Architects Daughter, DM Sans, Fira Code, and Geist Mono

## State Management & Networking
- **TanStack Query** - Server state management with caching strategies
- **React Hook Form** - Form state management with validation
- **Wouter** - Minimal client-side routing solution