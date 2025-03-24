"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { toast, Toaster } from "sonner";
import {
  FileIcon,
  FileTextIcon,
  FileImageIcon,
  FileAudioIcon,
  FileVideoIcon,
  FileArchiveIcon,
  ArrowDownToLine,
  Trash2,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

// File type categories
const fileCategories = {
  image: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ],
  document: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/markdown",
    "text/html",
  ],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/flac"],
  video: ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"],
  archive: [
    "application/zip",
    "application/x-rar-compressed",
    "application/x-tar",
    "application/gzip",
  ],
};

// Get file category from mime type
const getFileCategory = (mimeType: string) => {
  for (const [category, types] of Object.entries(fileCategories)) {
    if (types.includes(mimeType)) {
      return category;
    }
  }
  return "other";
};

// Get file icon based on category
const getFileIcon = (category: string) => {
  switch (category) {
    case "image":
      return <FileImageIcon className="h-10 w-10 text-blue-500" />;
    case "document":
      return <FileTextIcon className="h-10 w-10 text-green-500" />;
    case "audio":
      return <FileAudioIcon className="h-10 w-10 text-purple-500" />;
    case "video":
      return <FileVideoIcon className="h-10 w-10 text-red-500" />;
    case "archive":
      return <FileArchiveIcon className="h-10 w-10 text-yellow-500" />;
    default:
      return <FileIcon className="h-10 w-10 text-gray-500" />;
  }
};

interface UploadedFile {
  id: string;
  category: string;
  name: string;
  size: string; // human-readable
  type: string;
  rawFile: File; // optionally store the original File object if needed
}

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  );
};

export default function FileUploader() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  useEffect(() => {
    console.log("files =>", files);
  }, [files]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => {
      console.log(file, "file here");
      const category = getFileCategory(file.type);

      return {
        id: Math.random().toString(36).substring(2, 9),
        category,
        name: file.name,
        size: formatBytes(file.size),
        type: file.type,
        rawFile: file, // optional: keep reference to original File
      };
    });

    setFiles((prev) => [...prev, ...newFiles]);

    toast.success("Files added", {
      description: `${acceptedFiles.length} file(s) have been added.`,
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleClearAll = () => {
    setFiles([]);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="mb-6">
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <ArrowDownToLine className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-1">
              {isDragActive
                ? "Drop the files here..."
                : "Drag & drop files here, or click to select files"}
            </p>
            <p className="text-sm text-muted-foreground">
              Support for images, documents, audio, video, and archives (max
              100MB)
            </p>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Uploaded Files ({files.length})
            </h2>
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>

          <div className="space-y-3">
            {files.map((file) => {
              const category = file.category;

              return (
                <Card key={file.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {getFileIcon(category)}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <p
                              className="font-medium truncate"
                              title={file.name}
                            >
                              {file.name}
                            </p>
                            <div className="text-sm text-muted-foreground">
                              {file.size}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2 sm:mt-0">
                            <div className="w-[180px]">
                              <Select>
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Select a fruit" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Fruits</SelectLabel>
                                    <SelectItem value="apple">Apple</SelectItem>
                                    <SelectItem value="banana">
                                      Banana
                                    </SelectItem>
                                    <SelectItem value="blueberry">
                                      Blueberry
                                    </SelectItem>
                                    <SelectItem value="grapes">
                                      Grapes
                                    </SelectItem>
                                    <SelectItem value="pineapple">
                                      Pineapple
                                    </SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 flex-shrink-0"
                              onClick={() => handleRemoveFile(file.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <Toaster richColors position="top-right" />
    </div>
  );
}
