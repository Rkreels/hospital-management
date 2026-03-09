"use client";

import React from "react";
import { motion } from "framer-motion";
import { BarChart, FileText, Download, TrendingUp, Users, Bed, DollarSign } from "lucide-react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  const reports = [
    {
      title: "Admissions Overview",
      description: "Daily admissions and bed occupancy trends.",
      icon: BarChart,
      type: "operational",
    },
    {
      title: "Billing Summary",
      description: "Outstanding invoices and payment rates.",
      icon: DollarSign,
      type: "financial",
    },
    {
      title: "Patient Demographics",
      description: "Age, gender, and condition distribution.",
      icon: Users,
      type: "clinical",
    },
    {
      title: "Bed Utilization",
      description: "Department-wise bed occupancy analysis.",
      icon: Bed,
      type: "operational",
    },
    {
      title: "Revenue Report",
      description: "Monthly revenue trends and projections.",
      icon: TrendingUp,
      type: "financial",
    },
    {
      title: "Lab Results Summary",
      description: "Test completion rates and turnaround time.",
      icon: FileText,
      type: "clinical",
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "operational":
        return "bg-blue-100 text-blue-600";
      case "financial":
        return "bg-green-100 text-green-600";
      case "clinical":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Reports
            </h1>
            <p className="text-muted-foreground mt-1">
              Operational and clinical reports.
            </p>
          </div>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {reports.map((report, index) => (
            <motion.div
              key={report.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${getTypeColor(report.type)}`}>
                      <report.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {report.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {report.description}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Generate PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-foreground">156</p>
                <p className="text-sm text-muted-foreground">Total Patients (Month)</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-foreground">89%</p>
                <p className="text-sm text-muted-foreground">Bed Occupancy</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-foreground">$245K</p>
                <p className="text-sm text-muted-foreground">Revenue (Month)</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-foreground">4.2</p>
                <p className="text-sm text-muted-foreground">Avg. Stay (Days)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
