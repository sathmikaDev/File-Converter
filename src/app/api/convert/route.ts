// src/app/api/convert/route.ts
import { NextRequest, NextResponse } from "next/server";
import { convertPdf } from "@/app/utils/converters";
import { ConversionOptions } from "@/app/types";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Get conversion options
    const outputFormat = formData.get("outputFormat") as string;
    const quality = Number(formData.get("quality")) || 90;

    // Validate output format
    const validFormats = ["jpeg", "png", "webp", "doc", "docx", "txt", "html"];
    if (!validFormats.includes(outputFormat)) {
      return NextResponse.json(
        { error: "Invalid output format" },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Conversion options
    const options: ConversionOptions = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      outputFormat: outputFormat as any,
      quality: quality,
    };

    // Perform conversion
    const resultBuffer = await convertPdf(fileBuffer, options);

    // Set appropriate Content-Type
    const contentTypeMap: Record<string, string> = {
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      txt: "text/plain",
      html: "text/html",
    };

    // Prepare response with appropriate headers
    const response = new NextResponse(resultBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentTypeMap[outputFormat],
        "Content-Disposition": `attachment; filename="converted.${outputFormat}"`,
      },
    });

    return response;
  } catch (error) {
    console.error("Conversion error:", error);
    return NextResponse.json(
      { error: "Conversion failed: " + (error as Error).message },
      { status: 500 }
    );
  }
}
