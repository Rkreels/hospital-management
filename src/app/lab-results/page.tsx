"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MoreVertical, Eye, FlaskConical, CheckCircle, Clock } from "lucide-react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface LabResult {
  id: string;
  patientId: string;
  patientName: string;
  test: string;
  date: string;
  status: "Pending" | "Completed" | "Cancelled";
  results?: string;
  technician?: string;
}

export default function LabResultsPage() {
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingResult, setViewingResult] = useState<LabResult | null>(null);

  useEffect(() => {
    fetchLabResults();
  }, []);

  const fetchLabResults = async () => {
    try {
      const res = await fetch("/api/lab-results");
      const data = await res.json();
      setLabResults(data);
    } catch (error) {
      toast.error("Failed to fetch lab results");
    }
  };

  const handleStatusChange = async (id: string, newStatus: "Pending" | "Completed" | "Cancelled") => {
    try {
      const res = await fetch("/api/lab-results", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        toast.success("Lab result status updated");
        fetchLabResults();
      }
    } catch (error) {
      toast.error("Failed to update lab result");
    }
  };

  const filteredResults = labResults.filter(
    (r) =>
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.test.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Lab Results
            </h1>
            <p className="text-muted-foreground mt-1">
              Laboratory test status and recent results.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
              Pending: {labResults.filter((r) => r.status === "Pending").length}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {labResults.filter((r) => r.status === "Pending").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {labResults.filter((r) => r.status === "Completed").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-bold">{labResults.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search lab results..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-transparent focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 rounded-xl transition-all outline-none text-sm"
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/30 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-medium">ID</th>
                      <th className="px-6 py-4 font-medium">Patient</th>
                      <th className="px-6 py-4 font-medium">Test</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredResults.map((r) => (
                      <tr
                        key={r.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-foreground">
                          {r.id}
                        </td>
                        <td className="px-6 py-4">{r.patientName}</td>
                        <td className="px-6 py-4">{r.test}</td>
                        <td className="px-6 py-4">{r.date}</td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              r.status === "Completed"
                                ? "success"
                                : r.status === "Pending"
                                ? "warning"
                                : "destructive"
                            }
                          >
                            {r.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewingResult(r)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {r.status === "Pending" && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(r.id, "Completed")}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark as Completed
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredResults.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  No lab results found.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* View Lab Result Dialog */}
        <Dialog open={!!viewingResult} onOpenChange={() => setViewingResult(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lab Result Details</DialogTitle>
            </DialogHeader>
            {viewingResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Test ID</p>
                    <p className="font-medium">{viewingResult.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Patient</p>
                    <p className="font-medium">{viewingResult.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Test Type</p>
                    <p className="font-medium">{viewingResult.test}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{viewingResult.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge
                      variant={
                        viewingResult.status === "Completed"
                          ? "success"
                          : viewingResult.status === "Pending"
                          ? "warning"
                          : "destructive"
                      }
                    >
                      {viewingResult.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Technician</p>
                    <p className="font-medium">{viewingResult.technician || "N/A"}</p>
                  </div>
                </div>
                {viewingResult.results && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Results</p>
                    <div className="p-4 bg-muted rounded-lg">
                      <p>{viewingResult.results}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
