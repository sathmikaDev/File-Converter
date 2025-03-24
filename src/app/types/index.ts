export type FileFormat =
  | "jpeg"
  | "png"
  | "webp"
  | "doc"
  | "docx"
  | "txt"
  | "html"
  | "pdf";

export interface ConversionOptions {
  outputFormat: FileFormat;
  quality?: number; // For image formats
}

export interface ConversionResult {
  success: boolean;
  downloadUrl?: string;
  error?: string;
}
