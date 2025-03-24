"use client";

import React, { useState } from "react";
import FileUpload from "./FileUpload";
import { FileFormat } from "@/app/types";

export default function ConversionForm() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<FileFormat>("pdf");
  const [quality, setQuality] = useState(90);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a PDF file to convert");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("outputFormat", outputFormat);
      formData.append("quality", quality.toString());

      console.log("here");
      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Conversion failed");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger the download
      const a = document.createElement("a");
      a.href = url;
      a.download = `converted.${outputFormat}`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">PDF Converter</h2>

      <form onSubmit={handleConvert}>
        <FileUpload onFileSelected={handleFileSelected} />

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="outputFormat">
            Output Format
          </label>
          <select
            id="outputFormat"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value as FileFormat)}
          >
            <optgroup label="Images">
              <option value="jpeg">JPEG Image</option>
              <option value="png">PNG Image</option>
              <option value="webp">WebP Image</option>
            </optgroup>
            <optgroup label="Documents">
              <option value="doc">DOC (Microsoft Word)</option>
              <option value="docx">DOCX (Microsoft Word)</option>
              <option value="txt">TXT (Plain Text)</option>
              <option value="html">HTML (Web Page)</option>
            </optgroup>
          </select>
        </div>

        {["jpeg", "png", "webp"].includes(outputFormat) && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="quality">
              Quality: {quality}%
            </label>
            <input
              id="quality"
              type="range"
              min="10"
              max="100"
              step="5"
              className="w-full"
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
            />
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isLoading || !file}
        >
          {isLoading ? "Converting..." : "Convert PDF"}
        </button>
      </form>
    </div>
  );
}
