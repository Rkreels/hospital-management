"use client";

import React, { useState, useEffect, useCallback } from "react";
import { db } from '../lib/store';
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useRole } from '../context/RoleContext';
import { toast } from "react-toastify";
import {
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  FlaskConical,
  Clock,
  CheckCircle,
  AlertTriangle,
  TestTube,
  FileText,
  Printer,
  ArrowRight,
  AlertCircle,
  Activity,
  Calendar,
  User,
  Building2,
  Check,
} from "lucide-react";
import type {
  LabOrder,
  LabTest,
  LabResult,
  LabOrderTest,
  Patient,
  Doctor,
  Priority,
  LabOrderStatus,
  ReferenceRange,
} from "../types";

// Status workflow configuration
const statusWorkflow: LabOrderStatus[] = ["Ordered", "Sample Collected", "In Progress", "Completed"];
const statusColors: Record<LabOrderStatus, string> = {
  Ordered: "bg-blue-100 text-blue-700 border-blue-200",
  "Sample Collected": "bg-amber-100 text-amber-700 border-amber-200",
  "In Progress": "bg-purple-100 text-purple-700 border-purple-200",
  Completed: "bg-green-100 text-green-700 border-green-200",
  Cancelled: "bg-gray-100 text-gray-700 border-gray-200",
};

const priorityColors: Record<Priority, string> = {
  Critical: "bg-red-500 text-white",
  High: "bg-orange-500 text-white",
  Normal: "bg-blue-500 text-white",
  Low: "bg-gray-500 text-white",
  Urgent: "bg-yellow-500 text-white",
  Routine: "bg-green-500 text-white",
  STAT: "bg-purple-500 text-white",
};

const flagColors: Record<string, string> = {
  Normal: "text-green-600",
  Low: "text-amber-600",
  High: "text-amber-600",
  "Critical Low": "text-red-600 bg-red-50 px-2 py-1 rounded font-bold",
  "Critical High": "text-red-600 bg-red-50 px-2 py-1 rounded font-bold",
};

export default function LabResultsPage() {
  // Role context available for permission checks
  useRole();
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"orders" | "catalog" | "results">("orders");
  
  // Dialog states
  const [showNewOrderDialog, setShowNewOrderDialog] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showCatalogDialog, setShowCatalogDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  
  // New order form
  const [newOrder, setNewOrder] = useState({
    patientId: "",
    doctorId: "",
    tests: [] as string[],
    priority: "Normal" as Priority,
    diagnosis: "",
    notes: "",
  });
  
  // Results entry
  const [testResults, setTestResults] = useState<{
    id: string;
    parameter: string;
    value: string;
    unit: string;
    flag: string;
    referenceMin?: number;
    referenceMax?: number;
  }[]>([]);
  const [selectedTestForResults, setSelectedTestForResults] = useState<LabOrderTest | null>(null);

  // Statistics
  const [stats, setStats] = useState({
    pending: 0,
    todayOrders: 0,
    completedToday: 0,
    criticalResults: 0,
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersRes, testsRes, patientsRes, doctorsRes] = await Promise.all([
          fetch("/api/lab-results"),
          fetch("/api/lab-tests"),
          fetch("/api/patients"),
          fetch("/api/doctors"),
        ]);
        
        const ordersData = await ordersRes;
        const testsData = await testsRes;
        const patientsData = await patientsRes;
        const doctorsData = await doctorsRes;
        
        setLabOrders(ordersData);
        setLabTests(testsData);
        setPatients(patientsData);
        setDoctors(doctorsData);
        
        // Calculate statistics
        const today = new Date().toISOString().split("T")[0];
        const pending = ordersData.filter((o: LabOrder) => 
          o.status !== "Completed" && o.status !== "Cancelled"
        ).length;
        const todayOrders = ordersData.filter((o: LabOrder) => 
          o.createdAt?.split("T")[0] === today
        ).length;
        const completedToday = ordersData.filter((o: LabOrder) => 
          o.status === "Completed" && o.reportReadyAt?.split("T")[0] === today
        ).length;
        const criticalResults = ordersData.filter((o: LabOrder) => 
          o.tests?.some((t: LabOrderTest) => 
            t.results?.some((r: { flag?: string }) => 
              r.flag?.includes("Critical")
            )
          )
        ).length;
        
        setStats({ pending, todayOrders, completedToday, criticalResults });
      } catch {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Refresh orders
  const refreshOrders = useCallback(async () => {
    try {
      const data = db.getLabResult();
      setLabOrders(data);
      
      // Recalculate stats
      const today = new Date().toISOString().split("T")[0];
      setStats({
        pending: data.filter((o: LabOrder) => o.status !== "Completed" && o.status !== "Cancelled").length,
        todayOrders: data.filter((o: LabOrder) => o.createdAt?.split("T")[0] === today).length,
        completedToday: data.filter((o: LabOrder) => o.status === "Completed" && o.reportReadyAt?.split("T")[0] === today).length,
        criticalResults: data.filter((o: LabOrder) => 
          o.tests?.some((t: LabOrderTest) => 
            t.results?.some((r: { flag?: string }) => r.flag?.includes("Critical"))
          )
        ).length,
      });
    } catch {
      toast.error("Failed to refresh orders");
    }
  }, []);

  // Create new order
  const handleCreateOrder = async () => {
    if (!newOrder.patientId || !newOrder.doctorId || newOrder.tests.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const selectedTests = labTests.filter(t => newOrder.tests.includes(t.id));
    
    try {
      const res = await fetch("/api/lab-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: newOrder.patientId,
          doctorId: newOrder.doctorId,
          tests: selectedTests.map(t => ({
            testId: t.id,
            testName: t.name,
            testCode: t.code,
          })),
          priority: newOrder.priority,
          diagnosis: newOrder.diagnosis,
          notes: newOrder.notes,
        }),
      });
      
      if (res.ok) {
        toast.success("Lab order created successfully");
        setShowNewOrderDialog(false);
        setNewOrder({
          patientId: "",
          doctorId: "",
          tests: [],
          priority: "Normal",
          diagnosis: "",
          notes: "",
        });
        refreshOrders();
      } else {
        const error = await res;
        toast.error(error.error || "Failed to create order");
      }
    } catch {
      toast.error("Failed to create order");
    }
  };

  // Update order status
  const handleStatusUpdate = async (orderId: string, newStatus: LabOrderStatus) => {
    try {
      const res = await fetch("/api/lab-results", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      
      if (res.ok) {
        toast.success(`Status updated to ${newStatus}`);
        refreshOrders();
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  // Cancel order
  const handleCancelOrder = async (orderId: string) => {
    try {
      const res = await fetch("/api/lab-results", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId }),
      });
      
      if (res.ok) {
        toast.success("Lab order cancelled");
        refreshOrders();
      }
    } catch {
      toast.error("Failed to cancel order");
    }
  };

  // Calculate result flag based on reference range
  const calculateFlag = (
    value: number,
    refRange: ReferenceRange
  ): "Normal" | "Low" | "High" | "Critical Low" | "Critical High" => {
    if (refRange.minCritical !== undefined && value < refRange.minCritical) {
      return "Critical Low";
    }
    if (refRange.maxCritical !== undefined && value > refRange.maxCritical) {
      return "Critical High";
    }
    if (refRange.minNormal !== undefined && value < refRange.minNormal) {
      return "Low";
    }
    if (refRange.maxNormal !== undefined && value > refRange.maxNormal) {
      return "High";
    }
    return "Normal";
  };

  // Enter test results
  const handleEnterResults = async () => {
    if (!selectedOrder || !selectedTestForResults) return;
    
    try {
      const res = await fetch("/api/lab-results", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedOrder.id,
          testId: selectedTestForResults.id,
          results: testResults,
        }),
      });
      
      if (res.ok) {
        toast.success("Results saved successfully");
        setShowResultsDialog(false);
        setSelectedTestForResults(null);
        setTestResults([]);
        refreshOrders();
      }
    } catch {
      toast.error("Failed to save results");
    }
  };

  // Print result report
  const handlePrintReport = (order: LabOrder) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lab Report - ${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .info-item { margin-bottom: 10px; }
            .label { color: #6b7280; font-size: 12px; text-transform: uppercase; }
            .value { font-size: 14px; font-weight: 500; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
            th { background: #f3f4f6; }
            .critical { color: #dc2626; font-weight: bold; }
            .high { color: #d97706; }
            .low { color: #d97706; }
            .normal { color: #059669; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>HospitalHub Laboratory</h1>
              <p>Lab Report</p>
            </div>
            <div style="text-align: right;">
              <p><strong>Report #: ${order.orderNumber}</strong></p>
              <p>${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <div class="info-grid">
            <div>
              <div class="info-item">
                <div class="label">Patient Name</div>
                <div class="value">${order.patientName}</div>
              </div>
              <div class="info-item">
                <div class="label">Age / Gender</div>
                <div class="value">${order.patientAge || "N/A"} / ${order.patientGender || "N/A"}</div>
              </div>
            </div>
            <div>
              <div class="info-item">
                <div class="label">Ordering Physician</div>
                <div class="value">${order.doctorName}</div>
              </div>
              <div class="info-item">
                <div class="label">Priority</div>
                <div class="value">${order.priority}</div>
              </div>
            </div>
          </div>
          
          ${order.tests.map(test => `
            <h2 style="color: #374151; margin-top: 30px;">${test.testName} (${test.testCode})</h2>
            ${test.results && test.results.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Result</th>
                    <th>Unit</th>
                    <th>Reference Range</th>
                    <th>Flag</th>
                  </tr>
                </thead>
                <tbody>
                  ${test.results.map(r => `
                    <tr>
                      <td>${r.parameter}</td>
                      <td class="${r.flag?.toLowerCase().includes('critical') ? 'critical' : r.flag?.toLowerCase() === 'high' ? 'high' : r.flag?.toLowerCase() === 'low' ? 'low' : 'normal'}">${r.value}</td>
                      <td>${r.unit}</td>
                      <td>${r.referenceMin} - ${r.referenceMax}</td>
                      <td class="${r.flag?.toLowerCase().includes('critical') ? 'critical' : r.flag?.toLowerCase() === 'high' ? 'high' : r.flag?.toLowerCase() === 'low' ? 'low' : 'normal'}">${r.flag || "Normal"}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            ` : "<p style='color: #6b7280;'>Results pending...</p>"}
          `).join("")}
          
          <div class="footer">
            <p>This is a computer-generated report. For clinical interpretation, please consult your physician.</p>
            <p>Report generated on: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  // Initialize results entry form
  const openResultsEntry = (order: LabOrder, test: LabOrderTest) => {
    setSelectedOrder(order);
    setSelectedTestForResults(test);
    
    // Get reference ranges from the test catalog
    const catalogTest = labTests.find(t => t.id === test.testId);
    if (catalogTest && catalogTest.referenceRanges) {
      setTestResults(
        catalogTest.referenceRanges.map(ref => ({
          id: `LR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          parameter: ref.parameter,
          value: "",
          unit: ref.unit,
          flag: "Normal" as const,
          referenceMin: ref.minNormal,
          referenceMax: ref.maxNormal,
        }))
      );
    } else {
      setTestResults([]);
    }
    
    setShowResultsDialog(true);
  };

  // Update result value and calculate flag
  const updateResultValue = (index: number, value: string) => {
    setTestResults(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value };
      
      // Calculate flag if value is numeric
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        const catalogTest = labTests.find(t => t.id === selectedTestForResults?.testId);
        if (catalogTest && catalogTest.referenceRanges) {
          const refRange = catalogTest.referenceRanges[index];
          if (refRange) {
            updated[index].flag = calculateFlag(numValue, refRange);
          }
        }
      }
      
      return updated;
    });
  };

  // Filter orders
  const filteredOrders = labOrders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.doctorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Check for critical results
  const hasCriticalResults = (order: LabOrder) => {
    return order.tests.some(t => 
      t.results?.some(r => r.flag?.includes("Critical"))
    );
  };

  // Get all completed results
  const completedResults = labOrders.filter(o => o.status === "Completed");

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Lab Results Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage lab orders, enter results, and track critical values
            </p>
          </div>
          <Button onClick={() => setShowNewOrderDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Lab Order
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today&apos;s Orders</p>
                <p className="text-2xl font-bold">{stats.todayOrders}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold">{stats.completedToday}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-red-600">Critical Results</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalResults}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Critical Alert Banner */}
        {stats.criticalResults > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-red-600">Critical Values Detected</p>
              <p className="text-sm text-red-500">
                {stats.criticalResults} order(s) have critical results that require immediate attention
              </p>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-2">
          <Button
            variant={activeTab === "orders" ? "default" : "ghost"}
            onClick={() => setActiveTab("orders")}
          >
            <FlaskConical className="w-4 h-4 mr-2" />
            Lab Orders
          </Button>
          <Button
            variant={activeTab === "results" ? "default" : "ghost"}
            onClick={() => setActiveTab("results")}
          >
            <FileText className="w-4 h-4 mr-2" />
            Results
          </Button>
          <Button
            variant={activeTab === "catalog" ? "default" : "ghost"}
            onClick={() => setActiveTab("catalog")}
          >
            <TestTube className="w-4 h-4 mr-2" />
            Test Catalog
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-transparent focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 rounded-xl transition-all outline-none text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Ordered">Ordered</SelectItem>
              <SelectItem value="Sample Collected">Sample Collected</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Activity className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-muted/30 text-muted-foreground border-b border-border">
                          <tr>
                            <th className="px-6 py-4 font-medium">Order #</th>
                            <th className="px-6 py-4 font-medium">Patient</th>
                            <th className="px-6 py-4 font-medium">Doctor</th>
                            <th className="px-6 py-4 font-medium">Tests</th>
                            <th className="px-6 py-4 font-medium">Priority</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Date</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {filteredOrders.map((order) => (
                            <tr
                              key={order.id}
                              className={`hover:bg-muted/30 transition-colors ${
                                hasCriticalResults(order) ? "bg-red-50" : ""
                              }`}
                            >
                              <td className="px-6 py-4 font-medium">
                                <div className="flex items-center gap-2">
                                  {order.orderNumber}
                                  {hasCriticalResults(order) && (
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  {order.patientName}
                                </div>
                              </td>
                              <td className="px-6 py-4">{order.doctorName}</td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                  {order.tests.slice(0, 2).map((test) => (
                                    <Badge key={test.id} variant="outline" className="text-xs">
                                      {test.testCode}
                                    </Badge>
                                  ))}
                                  {order.tests.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{order.tests.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[order.priority]}`}>
                                  {order.priority}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded border text-xs font-medium ${statusColors[order.status]}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-muted-foreground">
                                {new Date(order.createdAt || new Date().toISOString()).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedOrder(order);
                                      setShowViewDialog(true);
                                    }}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    {order.status !== "Completed" && order.status !== "Cancelled" && (
                                      <>
                                        <DropdownMenuSeparator />
                                        {/* Status workflow */}
                                        {statusWorkflow.map((status, index) => {
                                          const currentIndex = statusWorkflow.indexOf(order.status);
                                          if (index > currentIndex) {
                                            return (
                                              <DropdownMenuItem
                                                key={status}
                                                onClick={() => handleStatusUpdate(order.id, status)}
                                              >
                                                <ArrowRight className="w-4 h-4 mr-2" />
                                                Set {status}
                                              </DropdownMenuItem>
                                            );
                                          }
                                          return null;
                                        })}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => {
                                          setSelectedOrder(order);
                                          if (order.tests[0]) {
                                            openResultsEntry(order, order.tests[0]);
                                          }
                                        }}>
                                          <Edit className="w-4 h-4 mr-2" />
                                          Enter Results
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {order.status === "Completed" && (
                                      <DropdownMenuItem onClick={() => handlePrintReport(order)}>
                                        <Printer className="w-4 h-4 mr-2" />
                                        Print Report
                                      </DropdownMenuItem>
                                    )}
                                    {order.status !== "Completed" && order.status !== "Cancelled" && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() => handleCancelOrder(order.id)}
                                          className="text-destructive"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Cancel Order
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {filteredOrders.length === 0 && (
                      <div className="p-12 text-center text-muted-foreground">
                        No lab orders found.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Completed Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {completedResults.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No completed results yet.
                        </p>
                      ) : (
                        completedResults.map((order) => (
                          <div
                            key={order.id}
                            className={`border rounded-lg p-4 ${
                              hasCriticalResults(order) ? "border-red-300 bg-red-50" : "border-border"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div>
                                  <p className="font-medium">{order.patientName}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {order.orderNumber} • {new Date(order.createdAt || new Date().toISOString()).toLocaleDateString()}
                                  </p>
                                </div>
                                {hasCriticalResults(order) && (
                                  <Badge variant="destructive">Critical Values</Badge>
                                )}
                              </div>
                              <Button variant="outline" size="sm" onClick={() => handlePrintReport(order)}>
                                <Printer className="w-4 h-4 mr-2" />
                                Print
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {order.tests.map((test) => (
                                <div key={test.id} className="bg-muted/50 rounded-lg p-3">
                                  <p className="font-medium text-sm mb-2">{test.testName}</p>
                                  {test.results && test.results.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                      {test.results.map((result) => (
                                        <div key={result.id} className="flex items-center justify-between">
                                          <span className="text-muted-foreground">{result.parameter}:</span>
                                          <span className={flagColors[result.flag || "Normal"]}>
                                            {result.value} {result.unit}
                                            {result.flag && result.flag !== "Normal" && (
                                              <span className="ml-1 text-xs">({result.flag})</span>
                                            )}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-muted-foreground text-sm">No results recorded</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "catalog" && (
              <motion.div
                key="catalog"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {labTests.map((test) => (
                    <Card
                      key={test.id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => {
                        setSelectedTest(test);
                        setShowCatalogDialog(true);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{test.name}</p>
                            <p className="text-sm text-muted-foreground">{test.code}</p>
                          </div>
                          <Badge variant="outline">{test.category}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <TestTube className="w-4 h-4" />
                            {test.sampleType}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {test.turnaroundTime}h
                          </span>
                        </div>
                        <div className="mt-2 text-sm">
                          <span className="text-primary font-medium">${test.price.toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* New Lab Order Dialog */}
        <Dialog open={showNewOrderDialog} onOpenChange={setShowNewOrderDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Lab Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Patient *</Label>
                  <Select
                    value={newOrder.patientId}
                    onValueChange={(value) => setNewOrder({ ...newOrder, patientId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.slice(0, 50).map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name} ({patient.mrn})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ordering Doctor *</Label>
                  <Select
                    value={newOrder.doctorId}
                    onValueChange={(value) => setNewOrder({ ...newOrder, doctorId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.slice(0, 50).map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tests *</Label>
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                  {labTests.map((test) => (
                    <label
                      key={test.id}
                      className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newOrder.tests.includes(test.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewOrder({ ...newOrder, tests: [...newOrder.tests, test.id] });
                          } else {
                            setNewOrder({ ...newOrder, tests: newOrder.tests.filter((id) => id !== test.id) });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="flex-1">{test.name}</span>
                      <span className="text-sm text-muted-foreground">{test.code}</span>
                      <span className="text-sm font-medium">${test.price.toFixed(2)}</span>
                    </label>
                  ))}
                </div>
                {newOrder.tests.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {newOrder.tests.length} test(s) selected
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={newOrder.priority}
                    onValueChange={(value: Priority) => setNewOrder({ ...newOrder, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Diagnosis</Label>
                  <Input
                    value={newOrder.diagnosis}
                    onChange={(e) => setNewOrder({ ...newOrder, diagnosis: e.target.value })}
                    placeholder="Clinical diagnosis"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                  placeholder="Additional notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewOrderDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateOrder}>Create Order</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Results Entry Dialog */}
        <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Enter Test Results</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedOrder && (
                <div className="bg-muted rounded-lg p-3 mb-4">
                  <p className="font-medium">{selectedOrder.patientName}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.orderNumber}</p>
                </div>
              )}
              
              {/* Test selector */}
              {selectedOrder && selectedOrder.tests.length > 1 && (
                <div className="space-y-2">
                  <Label>Select Test</Label>
                  <Select
                    value={selectedTestForResults?.id || ""}
                    onValueChange={(value) => {
                      const test = selectedOrder.tests.find(t => t.id === value);
                      if (test) {
                        openResultsEntry(selectedOrder, test);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select test" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedOrder.tests.filter(t => t.status !== "Completed").map((test) => (
                        <SelectItem key={test.id} value={test.id}>
                          {test.testName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedTestForResults && (
                <div className="border rounded-lg p-4">
                  <p className="font-medium mb-3">{selectedTestForResults.testName}</p>
                  <div className="space-y-3">
                    {testResults.map((result, index) => (
                      <div key={result.id} className="grid grid-cols-4 gap-2 items-center">
                        <div>
                          <Label className="text-sm">{result.parameter}</Label>
                          <p className="text-xs text-muted-foreground">
                            {result.referenceMin} - {result.referenceMax} {result.unit}
                          </p>
                        </div>
                        <Input
                          type="text"
                          value={result.value}
                          onChange={(e) => updateResultValue(index, e.target.value)}
                          placeholder="Value"
                          className={result.flag?.includes("Critical") ? "border-red-500" : ""}
                        />
                        <span className="text-sm text-muted-foreground">{result.unit}</span>
                        <span className={`text-sm font-medium ${flagColors[result.flag || "Normal"]}`}>
                          {result.flag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResultsDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEnterResults}>Save Results</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Order Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Lab Order Details</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order Number</p>
                    <p className="font-medium">{selectedOrder.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <span className={`px-2 py-1 rounded border text-xs font-medium ${statusColors[selectedOrder.status]}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Patient</p>
                    <p className="font-medium">{selectedOrder.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Doctor</p>
                    <p className="font-medium">{selectedOrder.doctorName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[selectedOrder.priority]}`}>
                      {selectedOrder.priority}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">{new Date(selectedOrder.createdAt || new Date().toISOString()).toLocaleString()}</p>
                  </div>
                </div>

                {selectedOrder.diagnosis && (
                  <div>
                    <p className="text-sm text-muted-foreground">Diagnosis</p>
                    <p className="font-medium">{selectedOrder.diagnosis}</p>
                  </div>
                )}

                {selectedOrder.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="font-medium">{selectedOrder.notes}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tests</p>
                  <div className="space-y-2">
                    {selectedOrder.tests.map((test) => (
                      <div key={test.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">{test.testName}</p>
                            <p className="text-sm text-muted-foreground">{test.testCode}</p>
                          </div>
                          <Badge
                            variant={test.status === "Completed" ? "success" : "warning"}
                          >
                            {test.status}
                          </Badge>
                        </div>
                        {test.results && test.results.length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-muted-foreground">
                                  <th className="text-left py-1">Parameter</th>
                                  <th className="text-left py-1">Result</th>
                                  <th className="text-left py-1">Reference</th>
                                  <th className="text-left py-1">Flag</th>
                                </tr>
                              </thead>
                              <tbody>
                                {test.results.map((result) => (
                                  <tr key={result.id}>
                                    <td className="py-1">{result.parameter}</td>
                                    <td className={`py-1 ${flagColors[result.flag || "Normal"]}`}>
                                      {result.value} {result.unit}
                                    </td>
                                    <td className="py-1 text-muted-foreground">
                                      {result.referenceMin} - {result.referenceMax}
                                    </td>
                                    <td className={`py-1 ${flagColors[result.flag || "Normal"]}`}>
                                      {result.flag}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Workflow */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Status Workflow</p>
                  <div className="flex items-center gap-2">
                    {statusWorkflow.map((status, index) => (
                      <React.Fragment key={status}>
                        <div
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                            statusWorkflow.indexOf(selectedOrder.status) >= index
                              ? statusColors[status]
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {statusWorkflow.indexOf(selectedOrder.status) > index ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                          {status}
                        </div>
                        {index < statusWorkflow.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                Close
              </Button>
              {selectedOrder?.status === "Completed" && (
                <Button onClick={() => {
                  if (selectedOrder) {
                    handlePrintReport(selectedOrder);
                  }
                }}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print Report
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Test Catalog Dialog */}
        <Dialog open={showCatalogDialog} onOpenChange={setShowCatalogDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Test Details</DialogTitle>
            </DialogHeader>
            {selectedTest && (
              <div className="space-y-4 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{selectedTest.name}</h3>
                    <p className="text-muted-foreground">{selectedTest.code}</p>
                  </div>
                  <Badge>{selectedTest.category}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <TestTube className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Sample Type</p>
                      <p className="font-medium">{selectedTest.sampleType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Turnaround Time</p>
                      <p className="font-medium">{selectedTest.turnaroundTime} hours</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium">{selectedTest.department || "Laboratory"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-medium text-lg text-primary">${selectedTest.price.toFixed(2)}</p>
                  </div>
                </div>

                {selectedTest.preparations && selectedTest.preparations.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Patient Preparations</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {selectedTest.preparations.map((prep, index) => (
                        <li key={index}>{prep}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Reference Ranges</p>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left">Parameter</th>
                          <th className="px-4 py-2 text-left">Unit</th>
                          <th className="px-4 py-2 text-left">Normal Range</th>
                          <th className="px-4 py-2 text-left">Critical Range</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTest.referenceRanges?.map((range, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2 font-medium">{range.parameter}</td>
                            <td className="px-4 py-2">{range.unit}</td>
                            <td className="px-4 py-2">
                              {range.minNormal} - {range.maxNormal}
                            </td>
                            <td className="px-4 py-2 text-red-600">
                              {range.minCritical !== undefined && (
                                <span>&lt; {range.minCritical}</span>
                              )}
                              {range.minCritical !== undefined && range.maxCritical !== undefined && " / "}
                              {range.maxCritical !== undefined && (
                                <span>&gt; {range.maxCritical}</span>
                              )}
                              {!range.minCritical && !range.maxCritical && "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setShowCatalogDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
