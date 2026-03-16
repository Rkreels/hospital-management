"use client";

import React, { useState, useEffect } from "react";
import { db } from '../lib/store';
import { motion } from "framer-motion";
import { Search, ClipboardList, Bed, UserPlus } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

interface Admission {
  id: string;
  patientId: string;
  patientName: string;
  type: "Emergency" | "Elective" | "Newborn" | "Transfer";
  priority: "Critical" | "High" | "Normal" | "Low";
  status: "Waiting" | "Admitted" | "In Progress";
  bedNumber?: string;
  admittedBy?: string;
}

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const fetchAdmissions = async () => {
    try {
      const data = db.getAdmissions();
      setAdmissions(data);
    } catch {
      console.error("Failed to fetch admissions");
    }
  };

  const filteredAdmissions = admissions.filter(
    (a) =>
      a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "destructive";
      case "High":
        return "warning";
      case "Normal":
        return "info";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Admitted":
        return "success";
      case "In Progress":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Admissions
            </h1>
            <p className="text-muted-foreground mt-1">
              Current admissions queue and bed assignment.
            </p>
          </div>
          <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
            Queue: {admissions.length}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold">
                  {admissions.filter((a) => a.priority === "Critical").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold">
                  {admissions.filter((a) => a.priority === "High").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Waiting</p>
                <p className="text-2xl font-bold">
                  {admissions.filter((a) => a.status === "Waiting").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admitted</p>
                <p className="text-2xl font-bold">
                  {admissions.filter((a) => a.status === "Admitted").length}
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
              placeholder="Search admissions..."
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
                {filteredAdmissions.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/30 transition-colors border"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          item.priority === "Critical"
                            ? "bg-red-100"
                            : item.priority === "High"
                            ? "bg-amber-100"
                            : "bg-blue-100"
                        }`}
                      >
                        <ClipboardList
                          className={`w-6 h-6 ${
                            item.priority === "Critical"
                              ? "text-red-600"
                              : item.priority === "High"
                              ? "text-amber-600"
                              : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {item.patientName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.id} • {item.type}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {item.bedNumber && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Bed className="w-4 h-4" />
                          {item.bedNumber}
                        </div>
                      )}
                      <Badge
                        variant={getStatusColor(item.status) as "success" | "warning" | "secondary"}
                      >
                        {item.status}
                      </Badge>
                      <Badge
                        variant={
                          getPriorityColor(item.priority) as "destructive" | "warning" | "info" | "secondary"
                        }
                      >
                        {item.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
                {filteredAdmissions.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground">
                    No admissions found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
  );
}
