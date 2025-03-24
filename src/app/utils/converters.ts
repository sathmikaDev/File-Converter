// import { exec } from 'child_process';
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import PDFParser from "pdf-parse";
import { ConversionOptions, FileFormat } from "../types";
import sharp from "sharp";
import { Poppler } from "node-poppler";
import LibreOffice from "libreoffice-convert";
import { v4 as uuidv4 } from "uuid";
// import { exec } from 'child_process';

// const execAsync = promisify(exec);
const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);
const libreofficeConvert = promisify(LibreOffice.convert);

// Initialize Poppler for PDF processing
const poppler = new Poppler();

// Setup temp directory
const TEMP_DIR = path.join(process.cwd(), "temp");
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Convert PDF to image formats
export async function convertPdfToImage(
  pdfBuffer: Buffer,
  options: ConversionOptions
): Promise<Buffer> {
  const { outputFormat, quality = 90 } = options;

  // Generate unique filenames
  const tempId = uuidv4();
  const tempPdfPath = path.join(TEMP_DIR, `${tempId}.pdf`);

  try {
    // Save PDF to temp file
    await writeFileAsync(tempPdfPath, pdfBuffer);

    // Use Poppler to convert PDF to images
    const pngOutputPath = path.join(TEMP_DIR, `${tempId}-%d.png`);
    await poppler.pdfToCairo(tempPdfPath, pngOutputPath, {
      pngFile: true,
      singleFile: true,
      firstPageToConvert: 1,
      lastPageToConvert: 1,
    });

    // Read the generated PNG file
    const pngFilePath = path.join(TEMP_DIR, `${tempId}-1.png`);
    const pngBuffer = await readFileAsync(pngFilePath);

    // Convert to requested image format
    let outputBuffer: Buffer;
    const sharpImage = sharp(pngBuffer);

    switch (outputFormat) {
      case "jpeg":
        outputBuffer = await sharpImage.jpeg({ quality }).toBuffer();
        break;
      case "png":
        outputBuffer = await sharpImage
          .png({ quality: quality / 100 })
          .toBuffer();
        break;
      case "webp":
        outputBuffer = await sharpImage.webp({ quality }).toBuffer();
        break;
      default:
        throw new Error(`Unsupported image format: ${outputFormat}`);
    }

    // Clean up temporary files
    await unlinkAsync(tempPdfPath);
    await unlinkAsync(pngFilePath);

    return outputBuffer;
  } catch (error) {
    console.error("Error converting PDF to image:", error);
    throw error;
  }
}

// Convert PDF to document formats
export async function convertPdfToDocument(
  pdfBuffer: Buffer,
  options: ConversionOptions
): Promise<Buffer> {
  const { outputFormat } = options;
  const tempId = uuidv4();
  const tempPdfPath = path.join(TEMP_DIR, `${tempId}.pdf`);

  try {
    // Save PDF to temp file
    await writeFileAsync(tempPdfPath, pdfBuffer);

    switch (outputFormat) {
      case "txt": {
        // Use pdf-parse to extract text
        const data = await PDFParser(pdfBuffer);
        return Buffer.from(data.text);
      }

      case "html": {
        // Use pdf-parse and convert to simple HTML
        const data = await PDFParser(pdfBuffer);
        const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Converted PDF</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    pre { white-space: pre-wrap; }
  </style>
</head>
<body>
  <pre>${data.text}</pre>
</body>
</html>`;
        return Buffer.from(htmlContent);
      }

      case "doc":
      case "docx": {
        // First convert PDF to HTML using poppler
        const htmlOutputPath = path.join(TEMP_DIR, `${tempId}.html`);
        await poppler.pdfToHtml(tempPdfPath, htmlOutputPath, {
          extractHidden: true,
          noFrames: true,
        });

        // Read the HTML file
        const htmlBuffer = await readFileAsync(htmlOutputPath);

        // Use LibreOffice to convert HTML to DOC/DOCX
        const outputFormat2 = outputFormat === "doc" ? "doc" : "docx";
        const result = await libreofficeConvert(
          htmlBuffer,
          outputFormat2,
          undefined
        );

        // Clean up temporary files
        await unlinkAsync(htmlOutputPath);

        return result;
      }

      default:
        throw new Error(`Unsupported document format: ${outputFormat}`);
    }
  } catch (error) {
    console.error("Error converting PDF to document:", error);
    throw error;
  } finally {
    // Clean up temporary PDF file
    try {
      await unlinkAsync(tempPdfPath);
    } catch (error) {
      console.error("Error cleaning up temporary files:", error);
    }
  }
}

// Remove any references to specific test files
export async function convertPdf(
  pdfBuffer: Buffer,
  options: ConversionOptions
): Promise<Buffer> {
  const { outputFormat } = options;

  const imageFormats: FileFormat[] = ["jpeg", "png", "webp"];
  const documentFormats: FileFormat[] = ["doc", "docx", "txt", "html"];

  if (imageFormats.includes(outputFormat)) {
    return convertPdfToImage(pdfBuffer, options);
  } else if (documentFormats.includes(outputFormat)) {
    return convertPdfToDocument(pdfBuffer, options);
  } else {
    throw new Error(`Unsupported output format: ${outputFormat}`);
  }
}
