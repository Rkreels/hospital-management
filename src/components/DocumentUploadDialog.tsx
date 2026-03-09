"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  File,
  FileText,
  FileImage,
  FileSpreadsheet,
  Film,
  Music,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string;
  patientName?: string;
  onSuccess: () => void;
}

const categories = [
  "Patient Record",
  "Lab Report",
  "Imaging",
  "Consent Form",
  "Insurance",
  "Administrative",
  "Policy",
  "Training",
  "Other",
];

const accessLevels = [
  { value: "Public", label: "Public - All staff" },
  { value: "Internal", label: "Internal - Hospital staff" },
  { value: "Restricted", label: "Restricted - Department only" },
  { value: "Confidential", label: "Confidential - Authorized only" },
];

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return <FileText className="w-8 h-8 text-red-500" />;
    case "image":
      return <FileImage className="w-8 h-8 text-blue-500" />;
    case "spreadsheet":
      return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
    case "video":
      return <Film className="w-8 h-8 text-purple-500" />;
    case "audio":
      return <Music className="w-8 h-8 text-pink-500" />;
    default:
      return <File className="w-8 h-8 text-gray-500" />;
  }
};

const getFileType = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(ext || "")) return "image";
  if (["xls", "xlsx", "csv"].includes(ext || "")) return "spreadsheet";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext || "")) return "video";
  if (["mp3", "wav", "ogg", "m4a"].includes(ext || "")) return "audio";
  return "document";
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function DocumentUploadDialog({
  open,
  onOpenChange,
  patientId,
  patientName,
  onSuccess,
}: DocumentUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>("Patient Record");
  const [accessLevel, setAccessLevel] = useState<string>("Internal");
  const [tags, setTags] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      formData.append("accessLevel", accessLevel);
      formData.append("tags", tags);
      formData.append("notes", notes);
      if (patientId) formData.append("patientId", patientId);
      if (patientName) formData.append("patientName", patientName);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Document uploaded successfully");
        onSuccess();
        handleClose();
      } else {
        toast.error("Failed to upload document");
      }
    } catch (error) {
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setCategory("Patient Record");
    setAccessLevel("Internal");
    setTags("");
    setNotes("");
    onOpenChange(false);
  };

  const fileType = file ? getFileType(file.name) : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Document
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex items-center gap-4">
                {getFileIcon(fileType || "")}
                <div className="flex-1 text-left">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFile(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-medium">Drag and drop your file here</p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </Button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Patient Info */}
          {patientName && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Patient:</span>
              <Badge variant="secondary">{patientName}</Badge>
            </div>
          )}

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Access Level */}
          <div className="space-y-2">
            <Label>Access Level</Label>
            <Select value={accessLevel} onValueChange={setAccessLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accessLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags (comma-separated)</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="urgent, follow-up, results"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this document"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? (
              "Uploading..."
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
