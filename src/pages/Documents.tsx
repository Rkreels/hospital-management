"use client";

import React, { useState } from "react";
import { db } from '../lib/store';
import { motion } from "framer-motion";
import { FileText, Search, Upload, File, FileImage, FileSpreadsheet, Download, Eye } from "lucide-react";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

interface Document {
  id: string;
  name: string;
  type: "pdf" | "image" | "spreadsheet" | "document";
  size: string;
  uploadedAt: string;
  uploadedBy: string;
}

const mockDocuments: Document[] = [
  { id: "1", name: "Patient Consent Form", type: "pdf", size: "245 KB", uploadedAt: "2024-01-20", uploadedBy: "Dr. Smith" },
  { id: "2", name: "Hospital Policy Manual", type: "document", size: "1.2 MB", uploadedAt: "2024-01-18", uploadedBy: "Admin" },
  { id: "3", name: "X-Ray Image - John Doe", type: "image", size: "3.5 MB", uploadedAt: "2024-01-22", uploadedBy: "Radiology" },
  { id: "4", name: "Financial Report Q4", type: "spreadsheet", size: "890 KB", uploadedAt: "2024-01-15", uploadedBy: "Finance" },
  { id: "5", name: "Staff Training Materials", type: "pdf", size: "2.1 MB", uploadedAt: "2024-01-19", uploadedBy: "HR" },
];

export default function DocumentsPage() {
  const [documents] = useState<Document[]>(mockDocuments);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocuments = documents.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-500" />;
      case "image":
        return <FileImage className="w-5 h-5 text-blue-500" />;
      case "spreadsheet":
        return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "pdf":
        return "destructive";
      case "image":
        return "info";
      case "spreadsheet":
        return "success";
      default:
        return "secondary";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Documents
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize hospital documents.
            </p>
          </div>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">PDFs</p>
                <p className="text-2xl font-bold">
                  {documents.filter((d) => d.type === "pdf").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <FileImage className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Images</p>
                <p className="text-2xl font-bold">
                  {documents.filter((d) => d.type === "image").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Spreadsheets</p>
                <p className="text-2xl font-bold">
                  {documents.filter((d) => d.type === "spreadsheet").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                <File className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Other</p>
                <p className="text-2xl font-bold">
                  {documents.filter((d) => d.type === "document").length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/30 transition-colors border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        {getTypeIcon(doc.type)}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {doc.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {doc.size} • Uploaded by {doc.uploadedBy} on{" "}
                          {doc.uploadedAt}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          getTypeBadge(doc.type) as "destructive" | "info" | "success" | "secondary"
                        }
                      >
                        {doc.type.toUpperCase()}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredDocuments.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground">
                    No documents found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
