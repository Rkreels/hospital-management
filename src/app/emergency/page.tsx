"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, AlertTriangle, Ambulance, Clock, User } from "lucide-react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface EmergencyCase {
  id: string;
  case: string;
  patientName?: string;
  eta: string;
  level: "Critical" | "Serious" | "Minor";
  status: "Incoming" | "In Treatment" | "Discharged" | "Admitted";
  assignedDoctor?: string;
}

export default function EmergencyPage() {
  const [emergencyCases, setEmergencyCases] = useState<EmergencyCase[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchEmergencyCases();
  }, []);

  const fetchEmergencyCases = async () => {
    try {
      const res = await fetch("/api/emergency");
      const data = await res.json();
      setEmergencyCases(data);
    } catch (error) {
      console.error("Failed to fetch emergency cases");
    }
  };

  const handleStatusChange = async (id: string, newStatus: "Incoming" | "In Treatment" | "Discharged" | "Admitted") => {
    try {
      const res = await fetch("/api/emergency", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        toast.success("Emergency case status updated");
        fetchEmergencyCases();
      }
    } catch (error) {
      toast.error("Failed to update emergency case");
    }
  };

  const filteredCases = emergencyCases.filter(
    (e) =>
      e.case.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.patientName && e.patientName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Critical":
        return "destructive";
      case "Serious":
        return "warning";
      default:
        return "success";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Incoming":
        return "destructive";
      case "In Treatment":
        return "warning";
      case "Admitted":
        return "info";
      default:
        return "success";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Emergency Triage
            </h1>
            <p className="text-muted-foreground mt-1">
              Active emergency cases and triage ETA.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="destructive" className="flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              Active: {emergencyCases.filter((e) => e.status === "Incoming").length}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-red-600">Critical</p>
                <p className="text-2xl font-bold text-red-700">
                  {emergencyCases.filter((e) => e.level === "Critical").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-amber-200 bg-amber-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-amber-600">Serious</p>
                <p className="text-2xl font-bold text-amber-700">
                  {emergencyCases.filter((e) => e.level === "Serious").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Ambulance className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Incoming</p>
                <p className="text-2xl font-bold">
                  {emergencyCases.filter((e) => e.status === "Incoming").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Treatment</p>
                <p className="text-2xl font-bold">
                  {emergencyCases.filter((e) => e.status === "In Treatment").length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search emergency cases..."
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
            <CardContent className="p-4">
              <div className="space-y-3">
                {filteredCases.map((e) => (
                  <div
                    key={e.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors border ${
                      e.level === "Critical"
                        ? "border-red-200 bg-red-50/50"
                        : e.level === "Serious"
                        ? "border-amber-200 bg-amber-50/50"
                        : "border"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          e.level === "Critical"
                            ? "bg-red-100"
                            : e.level === "Serious"
                            ? "bg-amber-100"
                            : "bg-green-100"
                        }`}
                      >
                        <AlertTriangle
                          className={`w-6 h-6 ${
                            e.level === "Critical"
                              ? "text-red-600"
                              : e.level === "Serious"
                              ? "text-amber-600"
                              : "text-green-600"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="font-medium text-foreground flex items-center gap-2">
                          {e.case}
                          {e.level === "Critical" && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full animate-pulse">
                              URGENT
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {e.id} • ETA: {e.eta}
                          {e.patientName && ` • Patient: ${e.patientName}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {e.assignedDoctor && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <User className="w-4 h-4" />
                          {e.assignedDoctor}
                        </div>
                      )}
                      <Badge
                        variant={getLevelColor(e.level) as "destructive" | "warning" | "success"}
                      >
                        {e.level}
                      </Badge>
                      <Badge
                        variant={getStatusColor(e.status) as "destructive" | "warning" | "info" | "success"}
                      >
                        {e.status}
                      </Badge>
                      {e.status === "Incoming" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(e.id, "In Treatment")}
                        >
                          Begin Treatment
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {filteredCases.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground">
                    No emergency cases found.
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
