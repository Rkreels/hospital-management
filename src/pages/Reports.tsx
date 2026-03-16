"use client";

import React, { useState, useEffect, useCallback } from "react";
import { db } from '../lib/store';
import { motion, AnimatePresence } from "framer-motion";
import { usePermission, useRole } from '../context/RoleContext';
import { Patient, Invoice, Department, Medication, LabOrder, TrendData, DashboardStats } from "../types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Users,
  DollarSign,
  BedDouble,
  Activity,
  Pill,
  FlaskConical,
  Download,
  Printer,
  Mail,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  BarChart3,
  PieChart,
  RefreshCw,
  Check,
  AlertTriangle,
  Send,
  FileSpreadsheet,
  FileDown,
  FileText,
  Eye,
  Building2,
} from "lucide-react";
import { toast } from "react-toastify";

// Import PDF generators (client-side compatible wrapper)
const generatePDFReport = async (type: string, data: unknown) => {
  // Dynamic import for jsPDF (client-side)
  const jsPDF = (await import('jspdf')).default;
  const autoTable = (await import('jspdf-autotable')).default;
  
  // Hospital header configuration
  const HOSPITAL_NAME = 'City General Hospital';
  const HOSPITAL_ADDRESS = '123 Healthcare Avenue, Medical District';
  const HOSPITAL_PHONE = 'Phone: (555) 123-4567';
  
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatDate = (date: string | Date) => 
    new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const formatDateShort = (date: string | Date) => 
    new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  
  const addHospitalHeader = (doc: jsPDF, title: string): number => {
    const _pageWidth = doc.internal.pageSize.getWidth();
    doc.setFillColor(41, 98, 255);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(HOSPITAL_NAME, pageWidth / 2, 14, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${HOSPITAL_ADDRESS} | ${HOSPITAL_PHONE}`, pageWidth / 2, 24, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 32, { align: 'center' });
    doc.setTextColor(31, 41, 55);
    return 45;
  };
  
  const addFooter = (doc: jsPDF, pageNumber: number, totalPages: number) => {
    const _pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'normal');
    doc.setDrawColor(209, 213, 219);
    doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, pageHeight - 10);
    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
  };

  switch (type) {
    case 'patient-census': {
      const patients = data as Patient[];
      const doc = new jsPDF('landscape');
      let yPos = addHospitalHeader(doc, 'PATIENT CENSUS REPORT');
      const _pageWidth = doc.internal.pageSize.getWidth();
      
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 15, yPos);
      doc.text(`Total Patients: ${patients.length}`, pageWidth - 15, yPos, { align: 'right' });
      yPos += 10;
      
      const patientData = patients.map(p => [
        p.mrn, p.name, p.gender, p.age.toString(), p.ward, p.roomNumber || '-',
        p.status, p.primaryDiagnosis.substring(0, 30), p.attendingDoctorName
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['MRN', 'Name', 'Gender', 'Age', 'Ward', 'Room', 'Status', 'Diagnosis', 'Attending Doctor']],
        body: patientData,
        theme: 'striped',
        headStyles: { fillColor: [41, 98, 255], fontSize: 8 },
        bodyStyles: { fontSize: 7 },
        margin: { left: 10, right: 10 },
        styles: { cellPadding: 2 },
      });
      
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(doc, i, totalPages);
      }
      return doc;
    }
    
    case 'revenue': {
      const invoices = data as Invoice[];
      const doc = new jsPDF('landscape');
      let yPos = addHospitalHeader(doc, 'REVENUE REPORT');
      const _pageWidth = doc.internal.pageSize.getWidth();
      
      const totalRevenue = invoices.reduce((sum, i) => sum + i.total, 0);
      const totalPaid = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
      const totalOutstanding = invoices.reduce((sum, i) => sum + i.balance, 0);
      
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 15, yPos);
      yPos += 10;
      
      // Summary boxes
      const boxWidth = 55;
      const boxHeight = 25;
      let boxX = 15;
      
      const summaryBoxes = [
        { label: 'Total Revenue', value: formatCurrency(totalRevenue), color: [41, 98, 255] },
        { label: 'Collected', value: formatCurrency(totalPaid), color: [16, 185, 129] },
        { label: 'Outstanding', value: formatCurrency(totalOutstanding), color: [239, 68, 68] },
        { label: 'Total Invoices', value: invoices.length.toString(), color: [245, 158, 11] },
      ];
      
      summaryBoxes.forEach(box => {
        doc.setFillColor(249, 250, 251);
        doc.roundedRect(boxX, yPos, boxWidth, boxHeight, 2, 2, 'F');
        doc.setFillColor(...box.color);
        doc.rect(boxX, yPos, 3, boxHeight, 'F');
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.setFont('helvetica', 'normal');
        doc.text(box.label, boxX + 6, yPos + 9);
        doc.setFontSize(11);
        doc.setTextColor(31, 41, 55);
        doc.setFont('helvetica', 'bold');
        doc.text(box.value, boxX + 6, yPos + 18);
        boxX += boxWidth + 5;
      });
      
      yPos += boxHeight + 15;
      
      const invoiceData = invoices.map(i => [
        i.invoiceNumber, i.patientName, i.patientMRN, formatDateShort(i.date),
        formatCurrency(i.total), formatCurrency(i.paidAmount), formatCurrency(i.balance), i.status
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Invoice #', 'Patient', 'MRN', 'Date', 'Total', 'Paid', 'Balance', 'Status']],
        body: invoiceData,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129], fontSize: 8 },
        bodyStyles: { fontSize: 7 },
        margin: { left: 10, right: 10 },
      });
      
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(doc, i, totalPages);
      }
      return doc;
    }
    
    case 'lab-statistics': {
      const labOrders = data as LabOrder[];
      const doc = new jsPDF();
      let yPos = addHospitalHeader(doc, 'LABORATORY STATISTICS REPORT');
      const _pageWidth = doc.internal.pageSize.getWidth();
      
      const completed = labOrders.filter(l => l.status === 'Completed').length;
      const pending = labOrders.filter(l => l.status === 'Pending' || l.status === 'In Progress').length;
      
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 15, yPos);
      yPos += 10;
      
      const summaryData = [
        ['Total Orders', labOrders.length.toString()],
        ['Completed', completed.toString()],
        ['Pending/In Progress', pending.toString()],
      ];
      
      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Count']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [41, 98, 255], fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 40, halign: 'center' } },
        margin: { left: 15 },
      });
      
      // @ts-expect-error - autoTable adds lastY to doc
      yPos = doc.lastAutoTable.lastY + 12;
      
      const ordersData = labOrders.slice(0, 20).map(order => [
        order.orderNumber, order.patientName,
        order.tests.map(t => t.testName).slice(0, 2).join(', ') + (order.tests.length > 2 ? '...' : ''),
        order.priority, order.status, formatDateShort(order.orderedAt)
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Order #', 'Patient', 'Tests', 'Priority', 'Status', 'Date']],
        body: ordersData,
        theme: 'striped',
        headStyles: { fillColor: [41, 98, 255], fontSize: 8 },
        bodyStyles: { fontSize: 7 },
        margin: { left: 15, right: 15 },
      });
      
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(doc, i, totalPages);
      }
      return doc;
    }
    
    case 'occupancy': {
      const departments = data as Department[];
      const doc = new jsPDF();
      let yPos = addHospitalHeader(doc, 'BED OCCUPANCY REPORT');
      const _pageWidth = doc.internal.pageSize.getWidth();
      
      const totalBeds = departments.reduce((sum, d) => sum + d.beds, 0);
      const totalOccupied = departments.reduce((sum, d) => sum + d.occupiedBeds, 0);
      const overallOccupancy = Math.round((totalOccupied / totalBeds) * 100);
      
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 15, yPos);
      yPos += 10;
      
      const summaryData = [
        ['Total Beds', totalBeds.toString()],
        ['Occupied Beds', totalOccupied.toString()],
        ['Available Beds', (totalBeds - totalOccupied).toString()],
        ['Overall Occupancy', `${overallOccupancy}%`],
      ];
      
      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [41, 98, 255], fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 40, halign: 'center' } },
        margin: { left: 15 },
      });
      
      // @ts-expect-error - autoTable adds lastY to doc
      yPos = doc.lastAutoTable.lastY + 12;
      
      const deptData = departments.map(d => {
        const occupancy = Math.round((d.occupiedBeds / d.beds) * 100);
        return [d.name, d.beds.toString(), d.occupiedBeds.toString(), (d.beds - d.occupiedBeds).toString(), `${occupancy}%`, d.head, d.status];
      });
      
      autoTable(doc, {
        startY: yPos,
        head: [['Department', 'Total', 'Occupied', 'Available', 'Rate', 'Head', 'Status']],
        body: deptData,
        theme: 'striped',
        headStyles: { fillColor: [41, 98, 255], fontSize: 8 },
        bodyStyles: { fontSize: 7 },
        margin: { left: 15, right: 15 },
      });
      
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(doc, i, totalPages);
      }
      return doc;
    }
    
    case 'dashboard': {
      const { stats, _departments, _medications } = data as { stats: DashboardStats; departments: Department[]; medications: Medication[] };
      const doc = new jsPDF();
      let yPos = addHospitalHeader(doc, 'HOSPITAL OVERVIEW REPORT');
      const _pageWidth = doc.internal.pageSize.getWidth();
      
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(`Report Generated: ${new Date().toLocaleString()}`, 15, yPos);
      yPos += 12;
      
      // Stats cards
      const statsCards = [
        { label: 'Total Patients', value: stats.totalPatients, color: [41, 98, 255] },
        { label: 'Inpatients', value: stats.inpatients, color: [30, 64, 175] },
        { label: 'Critical', value: stats.criticalPatients, color: [239, 68, 68] },
        { label: 'Available Doctors', value: stats.availableDoctors, color: [16, 185, 129] },
      ];
      
      const cardWidth = (pageWidth - 50) / 4;
      const cardHeight = 20;
      let cardX = 15;
      
      statsCards.forEach(card => {
        doc.setFillColor(249, 250, 251);
        doc.roundedRect(cardX, yPos, cardWidth, cardHeight, 2, 2, 'F');
        doc.setFillColor(...card.color);
        doc.rect(cardX, yPos, 3, cardHeight, 'F');
        doc.setFontSize(7);
        doc.setTextColor(107, 114, 128);
        doc.setFont('helvetica', 'normal');
        doc.text(card.label, cardX + 5, yPos + 7);
        doc.setFontSize(12);
        doc.setTextColor(31, 41, 55);
        doc.setFont('helvetica', 'bold');
        doc.text(card.value.toString(), cardX + 5, yPos + 15);
        cardX += cardWidth + 5;
      });
      
      yPos += cardHeight + 15;
      
      // Bed occupancy
      const occupancyData = [
        ['Total Beds', stats.totalBeds.toString()],
        ['Occupied', stats.occupiedBeds.toString()],
        ['Available', stats.availableBeds.toString()],
        ['Occupancy Rate', `${stats.bedOccupancy}%`],
      ];
      
      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Value']],
        body: occupancyData,
        theme: 'grid',
        headStyles: { fillColor: [41, 98, 255], fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 15 },
      });
      
      // @ts-expect-error - autoTable adds lastY to doc
      yPos = doc.lastAutoTable.lastY + 12;
      
      // Financial
      const financialData = [
        ['Total Revenue', formatCurrency(stats.totalRevenue)],
        ['Outstanding', formatCurrency(stats.outstandingAmount)],
        ['Pending Invoices', stats.pendingInvoices.toString()],
      ];
      
      autoTable(doc, {
        startY: yPos,
        head: [['Category', 'Amount']],
        body: financialData,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 15 },
      });
      
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(doc, i, totalPages);
      }
      return doc;
    }
    
    default:
      throw new Error('Unknown report type');
  }
};

// Types
interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  color: string;
}

interface TrendIndicator {
  value: number;
  direction: "up" | "down" | "neutral";
  percentage: string;
}

interface QuickStat {
  id: string;
  label: string;
  value: string | number;
  trend?: TrendIndicator;
  icon: React.ElementType;
  color: string;
  suffix?: string;
}

interface ScheduledReport {
  id: string;
  name: string;
  type: string;
  frequency: string;
  nextRun: string;
  recipients: string[];
  status: "active" | "paused";
}

interface ReportData {
  patientStats: {
    admissions: number;
    discharges: number;
    total: number;
    byGender: { male: number; female: number; other: number };
    byAge: { label: string; count: number }[];
    byStatus: { label: string; count: number }[];
  };
  financial: {
    revenue: number;
    collections: number;
    outstanding: number;
    byMonth: { month: string; revenue: number; collections: number }[];
    byCategory: { category: string; amount: number }[];
  };
  operational: {
    bedOccupancy: number;
    totalBeds: number;
    occupiedBeds: number;
    byDepartment: { name: string; occupancy: number; total: number; occupied: number }[];
  };
  clinical: {
    diagnoses: { name: string; count: number }[];
    procedures: { name: string; count: number }[];
    outcomes: { type: string; count: number }[];
  };
  pharmacy: {
    totalItems: number;
    lowStock: number;
    expiring: number;
    dispensed: number;
    byCategory: { category: string; count: number }[];
  };
  lab: {
    totalTests: number;
    completed: number;
    pending: number;
    avgTurnaround: number;
    byType: { type: string; count: number; avgTime: number }[];
  };
}

// Report types configuration
const reportTypes: ReportType[] = [
  { id: "patient", name: "Patient Statistics", description: "Admissions, discharges, and demographics", icon: Users, category: "Clinical", color: "bg-blue-500" },
  { id: "financial", name: "Financial Reports", description: "Revenue, collections, and outstanding", icon: DollarSign, category: "Finance", color: "bg-emerald-500" },
  { id: "operational", name: "Operational Reports", description: "Bed occupancy and department stats", icon: BedDouble, category: "Operations", color: "bg-amber-500" },
  { id: "clinical", name: "Clinical Reports", description: "Diagnoses, procedures, and outcomes", icon: Activity, category: "Clinical", color: "bg-rose-500" },
  { id: "pharmacy", name: "Pharmacy Reports", description: "Stock, expiring, and dispensed items", icon: Pill, category: "Pharmacy", color: "bg-purple-500" },
  { id: "lab", name: "Lab Reports", description: "Test volume and turnaround time", icon: FlaskConical, category: "Laboratory", color: "bg-cyan-500" },
];

// PDF Report types
const pdfReportTypes = [
  { id: "patient-census", name: "Patient Census Report", icon: Users, description: "Complete list of all patients with details" },
  { id: "revenue", name: "Revenue Report", icon: DollarSign, description: "Financial summary with invoice details" },
  { id: "lab-statistics", name: "Lab Statistics Report", icon: FlaskConical, description: "Laboratory test volume and statistics" },
  { id: "occupancy", name: "Bed Occupancy Report", icon: BedDouble, description: "Department-wise bed occupancy analysis" },
  { id: "dashboard", name: "Hospital Overview Report", icon: Building2, description: "Comprehensive hospital statistics summary" },
];

// Date range options
const _dateRangeOptions = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "quarter", label: "This Quarter" },
  { id: "year", label: "This Year" },
  { id: "custom", label: "Custom Range" },
];

// Simple Bar Chart Component
const SimpleBarChart: React.FC<{ data: { label: string; value: number }[]; height?: number; color?: string }> = ({ data, height = 200, color = "#3b82f6" }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end justify-between h-full gap-2 px-2">
        {data.map((item, index) => (
          <motion.div key={item.label} className="flex flex-col items-center flex-1" initial={{ height: 0 }} animate={{ height: "100%" }} transition={{ delay: index * 0.1, duration: 0.5 }}>
            <motion.div className="w-full rounded-t-md transition-all hover:opacity-80" style={{ backgroundColor: color, height: `${(item.value / maxValue) * 100}%`, minHeight: item.value > 0 ? "4px" : "0" }} initial={{ height: 0 }} animate={{ height: `${(item.value / maxValue) * 100}%` }} transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }} />
            <span className="text-xs text-muted-foreground mt-2 truncate w-full text-center">{item.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Simple Line Chart Component
const SimpleLineChart: React.FC<{ data: { label: string; value: number }[]; height?: number; color?: string; showDots?: boolean }> = ({ data, height = 200, color = "#10b981", showDots = true }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const range = maxValue - minValue || 1;
  const width = 100;
  const pointSpacing = width / (data.length - 1 || 1);
  const points = data.map((item, index) => ({ x: index * pointSpacing, y: height - ((item.value - minValue) / range) * (height - 40) - 20, value: item.value, label: item.label }));
  const pathD = points.reduce((acc, point, index) => index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`, "");
  const areaD = `${pathD} L ${points[points.length - 1]?.x || 0} ${height - 10} L ${points[0]?.x || 0} ${height - 10} Z`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs><linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0.05" /></linearGradient></defs>
      {[0, 25, 50, 75, 100].map(percent => <line key={percent} x1="0" y1={height - 10 - (percent / 100) * (height - 40)} x2={width} y2={height - 10 - (percent / 100) * (height - 40)} stroke="currentColor" strokeOpacity="0.1" />)}
      <motion.path d={areaD} fill={`url(#gradient-${color})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} />
      <motion.path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
      {showDots && points.map((point, index) => <motion.circle key={index} cx={point.x} cy={point.y} r="3" fill={color} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: index * 0.05 + 0.5 }} />)}
    </svg>
  );
};

// Simple Pie Chart Component
const SimplePieChart: React.FC<{ data: { label: string; value: number; color?: string }[]; size?: number }> = ({ data, size = 160 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const radius = size / 2 - 10;
  const center = size / 2;
  const defaultColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
  let currentAngle = -90;
  const segments = data.map((item, index) => {
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return { ...item, startAngle, endAngle: currentAngle, color: item.color || defaultColors[index % defaultColors.length] };
  });
  const createArcPath = (startAngle: number, endAngle: number) => {
    const start = { x: center + radius * Math.cos((endAngle * Math.PI) / 180), y: center + radius * Math.sin((endAngle * Math.PI) / 180) };
    const end = { x: center + radius * Math.cos((startAngle * Math.PI) / 180), y: center + radius * Math.sin((startAngle * Math.PI) / 180) };
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    return `M ${center} ${center} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
  };
  return (
    <div className="relative">
      <svg width={size} height={size}>
        {segments.map((segment, index) => <motion.path key={index} d={createArcPath(segment.startAngle, segment.endAngle)} fill={segment.color} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: index * 0.1, duration: 0.3 }} style={{ transformOrigin: `${center}px ${center}px` }} />)}
      </svg>
    </div>
  );
};

// Main Component
export default function ReportsPage() {
  const { currentRole: _currentRole } = useRole();
  const canExport = usePermission("reports", "export");

  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateRange, _setDateRange] = useState("month");
  const [_customDateStart, _setCustomDateStart] = useState("");
  const [_customDateEnd, _setCustomDateEnd] = useState("");
  const [_showCustomDate, _setShowCustomDate] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [_activeChartType, _setActiveChartType] = useState<"bar" | "line" | "pie">("bar");
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  
  // PDF Report states
  const [selectedPdfReport, setSelectedPdfReport] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [pdfDateStart, setPdfDateStart] = useState("");
  const [pdfDateEnd, setPdfDateEnd] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Data for PDF reports
  const [patients, setPatients] = useState<Patient[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  // Fetch report data
  const fetchReportData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, trendsRes, patientsRes, invoicesRes, departmentsRes, medicationsRes, labOrdersRes] = await Promise.all([
        fetch("/api/dashboard"), fetch("/api/dashboard/trends?days=30"), fetch("/api/patients"),
        fetch("/api/billing"), fetch("/api/departments"), fetch("/api/pharmacy"), fetch("/api/lab-results"),
      ]);
      const stats = await statsRes;
      const trends = await trendsRes;
      const patientsData: Patient[] = await patientsRes;
      const invoicesData: Invoice[] = await invoicesRes;
      const departmentsData: Department[] = await departmentsRes;
      const medicationsData: Medication[] = await medicationsRes;
      const labOrdersData: LabOrder[] = await labOrdersRes;
      
      setPatients(patientsData);
      setInvoices(invoicesData);
      setDepartments(departmentsData);
      setMedications(medicationsData);
      setLabOrders(labOrdersData);
      setDashboardStats(stats);
      
      const malePatients = patientsData.filter(p => p.gender === "Male").length;
      const femalePatients = patientsData.filter(p => p.gender === "Female").length;
      const otherPatients = patientsData.filter(p => p.gender === "Other").length;
      const ageGroups = [{ label: "0-18", min: 0, max: 18 }, { label: "19-35", min: 19, max: 35 }, { label: "36-50", min: 36, max: 50 }, { label: "51-65", min: 51, max: 65 }, { label: "65+", min: 66, max: 200 }];
      const byAge = ageGroups.map(group => ({ label: group.label, count: patientsData.filter(p => p.age >= group.min && p.age <= group.max).length }));
      const statusCounts: Record<string, number> = {};
      patientsData.forEach(p => { statusCounts[p.status] = (statusCounts[p.status] || 0) + 1; });
      const byStatus = Object.entries(statusCounts).map(([label, count]) => ({ label, count }));
      const paidInvoices = invoicesData.filter(i => i.status === "Paid");
      const pendingInvoices = invoicesData.filter(i => i.status === "Pending" || i.status === "Overdue");
      const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.total, 0);
      const totalOutstanding = pendingInvoices.reduce((sum, i) => sum + i.outstandingAmount, 0);
      const deptOccupancy = departmentsData.map(d => ({ name: d.name, occupancy: Math.round((d.occupiedBeds / d.beds) * 100), total: d.beds, occupied: d.occupiedBeds }));
      const lowStockMeds = medicationsData.filter(m => m.stock < m.reorderLevel);
      const expiringMeds = medicationsData.filter(m => { const expiryDate = new Date(m.expiryDate); const threeMonthsFromNow = new Date(); threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3); return expiryDate < threeMonthsFromNow; });
      const categoryCounts: Record<string, number> = {};
      medicationsData.forEach(m => { categoryCounts[m.category] = (categoryCounts[m.category] || 0) + 1; });
      const pharmacyByCategory = Object.entries(categoryCounts).map(([category, count]) => ({ category, count }));
      const completedLabs = labOrdersData.filter(l => l.status === "Completed");
      const pendingLabs = labOrdersData.filter(l => l.status !== "Completed" && l.status !== "Cancelled");
      const labTypeCounts: Record<string, { count: number; totalTime: number }> = {};
      labOrdersData.forEach(order => { order.tests?.forEach(test => { if (!labTypeCounts[test.testName]) { labTypeCounts[test.testName] = { count: 0, totalTime: 0 }; } labTypeCounts[test.testName].count++; }); });
      const labByType = Object.entries(labTypeCounts).map(([type, data]) => ({ type, count: data.count, avgTime: Math.round(Math.random() * 24 + 2) }));

      setReportData({
        patientStats: { admissions: stats.totalPatients || patientsData.length, discharges: Math.round(patientsData.length * 0.3), total: patientsData.length, byGender: { male: malePatients, female: femalePatients, other: otherPatients }, byAge, byStatus },
        financial: { revenue: totalRevenue, collections: totalRevenue * 0.85, outstanding: totalOutstanding, byMonth: trends.slice(-6).map((t: TrendData) => ({ month: new Date(t.date).toLocaleDateString("en-US", { month: "short" }), revenue: t.revenue, collections: t.revenue * 0.85 })), byCategory: [{ category: "Consultations", amount: totalRevenue * 0.35 }, { category: "Procedures", amount: totalRevenue * 0.25 }, { category: "Lab Tests", amount: totalRevenue * 0.2 }, { category: "Medications", amount: totalRevenue * 0.15 }, { category: "Room Charges", amount: totalRevenue * 0.05 }] },
        operational: { bedOccupancy: stats.bedOccupancy || 75, totalBeds: stats.totalBeds || 200, occupiedBeds: stats.occupiedBeds || 150, byDepartment: deptOccupancy },
        clinical: { diagnoses: [{ name: "Hypertension", count: Math.round(patientsData.length * 0.15) || 1 }, { name: "Diabetes", count: Math.round(patientsData.length * 0.12) || 1 }, { name: "Respiratory Infection", count: Math.round(patientsData.length * 0.1) || 1 }, { name: "Cardiac Disease", count: Math.round(patientsData.length * 0.08) || 1 }, { name: "Gastrointestinal", count: Math.round(patientsData.length * 0.07) || 1 }], procedures: [{ name: "X-Ray", count: 45 }, { name: "MRI", count: 23 }, { name: "CT Scan", count: 31 }, { name: "ECG", count: 67 }, { name: "Ultrasound", count: 38 }], outcomes: [{ type: "Recovered", count: Math.round(patientsData.length * 0.45) }, { type: "Improving", count: Math.round(patientsData.length * 0.3) }, { type: "Stable", count: Math.round(patientsData.length * 0.15) }, { type: "Critical", count: Math.round(patientsData.length * 0.1) }] },
        pharmacy: { totalItems: medicationsData.length, lowStock: lowStockMeds.length, expiring: expiringMeds.length, dispensed: Math.round(medicationsData.length * 1.5), byCategory: pharmacyByCategory.slice(0, 6) },
        lab: { totalTests: labOrdersData.length, completed: completedLabs.length, pending: pendingLabs.length, avgTurnaround: 4.5, byType: labByType.slice(0, 5) },
      });
    } catch {
      console.error("Failed to fetch report data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchReportData(); }, [fetchReportData, dateRange]);

  const quickStats: QuickStat[] = reportData ? [
    { id: "patients", label: "Total Patients", value: reportData.patientStats.total, trend: { value: 12, direction: "up", percentage: "12%" }, icon: Users, color: "text-blue-500" },
    { id: "revenue", label: "Revenue (MTD)", value: `$${(reportData.financial.revenue / 1000).toFixed(0)}K`, trend: { value: 8, direction: "up", percentage: "8%" }, icon: DollarSign, color: "text-emerald-500" },
    { id: "occupancy", label: "Bed Occupancy", value: `${reportData.operational.bedOccupancy}%`, trend: { value: -3, direction: "down", percentage: "3%" }, icon: BedDouble, color: "text-amber-500" },
    { id: "pending-labs", label: "Pending Lab Results", value: reportData.lab.pending, trend: { value: 5, direction: "up", percentage: "5%" }, icon: FlaskConical, color: "text-cyan-500" },
    { id: "low-stock", label: "Low Stock Items", value: reportData.pharmacy.lowStock, trend: { value: -15, direction: "down", percentage: "15%" }, icon: AlertTriangle, color: "text-red-500" },
    { id: "avg-stay", label: "Avg. Stay (Days)", value: "4.2", trend: { value: 2, direction: "down", percentage: "2%" }, icon: Clock, color: "text-purple-500" },
  ] : [];

  const scheduledReports: ScheduledReport[] = [
    { id: "1", name: "Weekly Patient Census", type: "patient", frequency: "Weekly - Monday 8:00 AM", nextRun: "2024-01-15", recipients: ["admin@hospital.com", "cfo@hospital.com"], status: "active" },
    { id: "2", name: "Monthly Financial Summary", type: "financial", frequency: "Monthly - 1st day", nextRun: "2024-02-01", recipients: ["finance@hospital.com"], status: "active" },
    { id: "3", name: "Daily Pharmacy Stock Report", type: "pharmacy", frequency: "Daily - 6:00 AM", nextRun: "2024-01-10", recipients: ["pharmacy@hospital.com"], status: "paused" },
    { id: "4", name: "Weekly Lab Performance", type: "lab", frequency: "Weekly - Friday 5:00 PM", nextRun: "2024-01-12", recipients: ["lab@hospital.com", "quality@hospital.com"], status: "active" },
  ];

  // Export handlers
  const handleExportCSV = () => { setExportSuccess("CSV"); setTimeout(() => setExportSuccess(null), 3000); };
  const handleExportPDF = () => { setExportSuccess("PDF"); setTimeout(() => setExportSuccess(null), 3000); };
  const handlePrint = () => { window.print(); };
  const handleEmailReport = () => { setExportSuccess("Email"); setTimeout(() => setExportSuccess(null), 3000); };

  // PDF Generation handlers
  const handleGeneratePDF = async (preview: boolean = false) => {
    if (!selectedPdfReport) {
      toast.error("Please select a report type");
      return;
    }

    setIsGeneratingPdf(true);
    try {
      let reportData: unknown;
      let filename: string;
      const dateStr = new Date().toISOString().split('T')[0];

      switch (selectedPdfReport) {
        case 'patient-census':
          reportData = selectedDepartment === 'all' ? patients : patients.filter(p => departments.find(d => d.id === selectedDepartment)?.name === p.ward);
          filename = `patient-census-${dateStr}.pdf`;
          break;
        case 'revenue':
          reportData = invoices;
          filename = `revenue-report-${dateStr}.pdf`;
          break;
        case 'lab-statistics':
          reportData = labOrders;
          filename = `lab-statistics-${dateStr}.pdf`;
          break;
        case 'occupancy':
          reportData = selectedDepartment === 'all' ? departments : departments.filter(d => d.id === selectedDepartment);
          filename = `occupancy-report-${dateStr}.pdf`;
          break;
        case 'dashboard':
          reportData = { stats: dashboardStats, departments, medications };
          filename = `hospital-overview-${dateStr}.pdf`;
          break;
        default:
          throw new Error('Unknown report type');
      }

      const doc = await generatePDFReport(selectedPdfReport, reportData);

      if (preview) {
        const pdfBlob = doc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        setPreviewUrl(url);
        setShowPreviewDialog(true);
      } else {
        doc.save(filename);
        toast.success(`Report downloaded: ${filename}`);
      }
    } catch {
      console.error('PDF generation error:', error);
      toast.error("Failed to generate PDF report");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Render report content
  const renderReportContent = () => {
    if (!reportData || !selectedReport) return null;
    const report = reportTypes.find(r => r.id === selectedReport);
    if (!report) return null;

    switch (selectedReport) {
      case "patient":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Admissions</p><p className="text-2xl font-bold">{reportData.patientStats.admissions}</p></div><Users className="w-8 h-8 text-blue-500 opacity-50" /></div></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Discharges</p><p className="text-2xl font-bold">{reportData.patientStats.discharges}</p></div><Users className="w-8 h-8 text-emerald-500 opacity-50" /></div></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Patients</p><p className="text-2xl font-bold">{reportData.patientStats.total}</p></div><Users className="w-8 h-8 text-purple-500 opacity-50" /></div></CardContent></Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card><CardHeader><CardTitle className="text-base">Patient Demographics by Gender</CardTitle></CardHeader><CardContent className="flex flex-col items-center"><SimplePieChart data={[{ label: "Male", value: reportData.patientStats.byGender.male, color: "#3b82f6" }, { label: "Female", value: reportData.patientStats.byGender.female, color: "#ec4899" }, { label: "Other", value: reportData.patientStats.byGender.other, color: "#8b5cf6" }]} size={180} /><div className="flex gap-6 mt-4"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-sm">Male ({reportData.patientStats.byGender.male})</span></div><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-pink-500" /><span className="text-sm">Female ({reportData.patientStats.byGender.female})</span></div><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500" /><span className="text-sm">Other ({reportData.patientStats.byGender.other})</span></div></div></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-base">Patients by Age Group</CardTitle></CardHeader><CardContent><SimpleBarChart data={reportData.patientStats.byAge} height={200} color="#3b82f6" /></CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle className="text-base">Patient Status Distribution</CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b"><th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th><th className="text-right py-3 px-4 font-medium text-muted-foreground">Count</th><th className="text-right py-3 px-4 font-medium text-muted-foreground">Percentage</th></tr></thead><tbody>{reportData.patientStats.byStatus.map((status) => (<tr key={status.label} className="border-b last:border-0 hover:bg-muted/50"><td className="py-3 px-4"><Badge variant="outline">{status.label}</Badge></td><td className="text-right py-3 px-4 font-medium">{status.count}</td><td className="text-right py-3 px-4 text-muted-foreground">{((status.count / reportData.patientStats.total) * 100).toFixed(1)}%</td></tr>))}</tbody></table></div></CardContent></Card>
          </div>
        );
      case "financial":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold">${reportData.financial.revenue.toLocaleString()}</p></div><DollarSign className="w-8 h-8 text-emerald-500 opacity-50" /></div></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Collections</p><p className="text-2xl font-bold">${reportData.financial.collections.toLocaleString()}</p></div><DollarSign className="w-8 h-8 text-blue-500 opacity-50" /></div></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Outstanding</p><p className="text-2xl font-bold text-red-500">${reportData.financial.outstanding.toLocaleString()}</p></div><DollarSign className="w-8 h-8 text-red-500 opacity-50" /></div></CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle className="text-base">Revenue vs Collections (6 Months)</CardTitle></CardHeader><CardContent><div className="space-y-4"><SimpleLineChart data={reportData.financial.byMonth.map(m => ({ label: m.month, value: m.revenue / 1000 }))} height={200} color="#10b981" /><div className="flex justify-center gap-6"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-sm text-muted-foreground">Revenue</span></div><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-sm text-muted-foreground">Collections</span></div></div></div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Revenue by Category</CardTitle></CardHeader><CardContent><div className="space-y-4">{reportData.financial.byCategory.map((cat, index) => (<div key={cat.category} className="space-y-2"><div className="flex justify-between text-sm"><span>{cat.category}</span><span className="font-medium">${cat.amount.toLocaleString()}</span></div><div className="h-2 bg-muted rounded-full overflow-hidden"><motion.div className="h-full bg-emerald-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${(cat.amount / reportData.financial.revenue) * 100}%` }} transition={{ delay: index * 0.1, duration: 0.5 }} /></div></div>))}</div></CardContent></Card>
          </div>
        );
      case "operational":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Bed Occupancy</p><p className="text-2xl font-bold">{reportData.operational.bedOccupancy}%</p></div><BedDouble className="w-8 h-8 text-amber-500 opacity-50" /></div></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Beds</p><p className="text-2xl font-bold">{reportData.operational.totalBeds}</p></div><BedDouble className="w-8 h-8 text-blue-500 opacity-50" /></div></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Occupied Beds</p><p className="text-2xl font-bold">{reportData.operational.occupiedBeds}</p></div><BedDouble className="w-8 h-8 text-red-500 opacity-50" /></div></CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle className="text-base">Department Bed Occupancy</CardTitle></CardHeader><CardContent><SimpleBarChart data={reportData.operational.byDepartment.slice(0, 8).map(d => ({ label: d.name.substring(0, 10), value: d.occupancy }))} height={200} color="#f59e0b" /></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Department Statistics</CardTitle></CardHeader><CardContent><div className="overflow-x-auto max-h-80 overflow-y-auto custom-scrollbar"><table className="w-full"><thead className="sticky top-0 bg-background"><tr className="border-b"><th className="text-left py-3 px-4 font-medium text-muted-foreground">Department</th><th className="text-right py-3 px-4 font-medium text-muted-foreground">Total Beds</th><th className="text-right py-3 px-4 font-medium text-muted-foreground">Occupied</th><th className="text-right py-3 px-4 font-medium text-muted-foreground">Occupancy</th></tr></thead><tbody>{reportData.operational.byDepartment.map((dept) => (<tr key={dept.name} className="border-b last:border-0 hover:bg-muted/50"><td className="py-3 px-4 font-medium">{dept.name}</td><td className="text-right py-3 px-4">{dept.total}</td><td className="text-right py-3 px-4">{dept.occupied}</td><td className="text-right py-3 px-4"><Badge variant={dept.occupancy > 80 ? "destructive" : dept.occupancy > 60 ? "default" : "secondary"}>{dept.occupancy}%</Badge></td></tr>))}</tbody></table></div></CardContent></Card>
          </div>
        );
      case "clinical":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card><CardHeader><CardTitle className="text-base">Top Diagnoses</CardTitle></CardHeader><CardContent><SimpleBarChart data={reportData.clinical.diagnoses.map(d => ({ label: d.name.substring(0, 12), value: d.count }))} height={200} color="#ef4444" /></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-base">Patient Outcomes</CardTitle></CardHeader><CardContent className="flex flex-col items-center"><SimplePieChart data={reportData.clinical.outcomes.map((o, i) => ({ label: o.type, value: o.count, color: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"][i] }))} size={160} /><div className="grid grid-cols-2 gap-4 mt-4">{reportData.clinical.outcomes.map((o, i) => (<div key={o.type} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"][i] }} /><span className="text-sm">{o.type} ({o.count})</span></div>))}</div></CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle className="text-base">Procedures Performed</CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b"><th className="text-left py-3 px-4 font-medium text-muted-foreground">Procedure</th><th className="text-right py-3 px-4 font-medium text-muted-foreground">Count</th></tr></thead><tbody>{reportData.clinical.procedures.map((proc) => (<tr key={proc.name} className="border-b last:border-0 hover:bg-muted/50"><td className="py-3 px-4">{proc.name}</td><td className="text-right py-3 px-4 font-medium">{proc.count}</td></tr>))}</tbody></table></div></CardContent></Card>
          </div>
        );
      case "pharmacy":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Items</p><p className="text-2xl font-bold">{reportData.pharmacy.totalItems}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Low Stock</p><p className="text-2xl font-bold text-red-500">{reportData.pharmacy.lowStock}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Expiring Soon</p><p className="text-2xl font-bold text-amber-500">{reportData.pharmacy.expiring}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Dispensed</p><p className="text-2xl font-bold text-emerald-500">{reportData.pharmacy.dispensed}</p></CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle className="text-base">Inventory by Category</CardTitle></CardHeader><CardContent><SimplePieChart data={reportData.pharmacy.byCategory.map(c => ({ label: c.category, value: c.count }))} size={180} /></CardContent></Card>
          </div>
        );
      case "lab":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Tests</p><p className="text-2xl font-bold">{reportData.lab.totalTests}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Completed</p><p className="text-2xl font-bold text-emerald-500">{reportData.lab.completed}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold text-amber-500">{reportData.lab.pending}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Avg Turnaround</p><p className="text-2xl font-bold text-blue-500">{reportData.lab.avgTurnaround}h</p></CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle className="text-base">Test Volume by Type</CardTitle></CardHeader><CardContent><SimpleBarChart data={reportData.lab.byType.map(t => ({ label: t.type.substring(0, 10), value: t.count }))} height={200} color="#06b6d4" /></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Turnaround Time by Test</CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b"><th className="text-left py-3 px-4 font-medium text-muted-foreground">Test Type</th><th className="text-right py-3 px-4 font-medium text-muted-foreground">Count</th><th className="text-right py-3 px-4 font-medium text-muted-foreground">Avg Time (hrs)</th></tr></thead><tbody>{reportData.lab.byType.map((test) => (<tr key={test.type} className="border-b last:border-0 hover:bg-muted/50"><td className="py-3 px-4">{test.type}</td><td className="text-right py-3 px-4 font-medium">{test.count}</td><td className="text-right py-3 px-4">{test.avgTime}</td></tr>))}</tbody></table></div></CardContent></Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground">Generate and export comprehensive hospital reports</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchReportData()}>
              <RefreshCw className="w-4 h-4 mr-2" />Refresh
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickStats.map((stat, index) => (
            <motion.div key={stat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    {stat.trend && (
                      <span className={`text-xs flex items-center ${stat.trend.direction === "up" ? "text-emerald-500" : stat.trend.direction === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                        {stat.trend.direction === "up" ? <ArrowUpRight className="w-3 h-3" /> : stat.trend.direction === "down" ? <ArrowDownRight className="w-3 h-3" /> : null}
                        {stat.trend.percentage}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold mt-2">{stat.value}{stat.suffix}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* PDF Report Generation Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="w-5 h-5" />
              PDF Report Generation
            </CardTitle>
            <CardDescription>Generate downloadable PDF reports with professional formatting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Report Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {pdfReportTypes.map((report) => (
                <motion.div
                  key={report.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPdfReport === report.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-border hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedPdfReport(report.id)}
                >
                  <report.icon className={`w-6 h-6 mb-2 ${selectedPdfReport === report.id ? 'text-blue-500' : 'text-muted-foreground'}`} />
                  <p className="font-medium text-sm">{report.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-end pt-4 border-t">
              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <div className="flex gap-2">
                  <Input type="date" value={pdfDateStart} onChange={(e) => setPdfDateStart(e.target.value)} className="w-36" placeholder="Start" />
                  <Input type="date" value={pdfDateEnd} onChange={(e) => setPdfDateEnd(e.target.value)} className="w-36" placeholder="End" />
                </div>
              </div>

              {/* Department Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleGeneratePDF(true)} disabled={!selectedPdfReport || isGeneratingPdf}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={() => handleGeneratePDF(false)} disabled={!selectedPdfReport || isGeneratingPdf}>
                  {isGeneratingPdf ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Reports Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Report Type Selection */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Report Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reportTypes.map((report) => (
                <motion.button
                  key={report.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    selectedReport === report.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${report.color} ${selectedReport === report.id ? 'bg-white/20' : ''}`}>
                      <report.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{report.name}</p>
                      <p className={`text-xs ${selectedReport === report.id ? 'text-white/80' : 'text-muted-foreground'}`}>{report.category}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </CardContent>
          </Card>

          {/* Report Content */}
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  {selectedReport ? reportTypes.find(r => r.id === selectedReport)?.name : 'Select a Report'}
                </CardTitle>
                <CardDescription>
                  {selectedReport ? reportTypes.find(r => r.id === selectedReport)?.description : 'Choose a report type from the left panel'}
                </CardDescription>
              </div>
              {selectedReport && canExport && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleExportCSV}><FileSpreadsheet className="w-4 h-4 mr-2" />Export as CSV</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportPDF}><FileDown className="w-4 h-4 mr-2" />Export as PDF</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handlePrint}><Printer className="w-4 h-4 mr-2" />Print Report</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleEmailReport}><Mail className="w-4 h-4 mr-2" />Email Report</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : selectedReport ? (
                renderReportContent()
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No Report Selected</p>
                  <p className="text-muted-foreground">Select a report type from the left panel to view analytics</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Scheduled Reports */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Scheduled Reports</CardTitle>
              <CardDescription>Automated reports delivered to your inbox</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowScheduleDialog(true)}>
              <Calendar className="w-4 h-4 mr-2" />Schedule New
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduledReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${reportTypes.find(r => r.id === report.type)?.color || 'bg-gray-500'}`}>
                      {(() => { const Icon = reportTypes.find(r => r.id === report.type)?.icon || FileText; return <Icon className="w-4 h-4 text-white" />; })()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{report.name}</p>
                      <p className="text-xs text-muted-foreground">{report.frequency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Next: {new Date(report.nextRun).toLocaleDateString()}</p>
                      <Badge variant={report.status === "active" ? "default" : "secondary"} className="text-xs">{report.status}</Badge>
                    </div>
                    <Button variant="ghost" size="sm"><Send className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export Success Toast */}
        <AnimatePresence>
          {exportSuccess && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-4 right-4 bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <Check className="w-5 h-5" />
              Report exported as {exportSuccess} successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview Dialog */}
        <Dialog open={showPreviewDialog} onOpenChange={(open) => { setShowPreviewDialog(open); if (!open && previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); } }}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>PDF Preview</DialogTitle>
              <DialogDescription>Preview your report before downloading</DialogDescription>
            </DialogHeader>
            {previewUrl && (
              <iframe src={previewUrl} className="w-full h-[60vh] rounded-lg border" title="PDF Preview" />
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>Close</Button>
              <Button onClick={() => { handleGeneratePDF(false); setShowPreviewDialog(false); }}>
                <Download className="w-4 h-4 mr-2" />Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Dialog */}
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Report</DialogTitle>
              <DialogDescription>Set up automated report delivery</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Name</label>
                <Input placeholder="Enter report name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select report type" /></SelectTrigger>
                  <SelectContent>{reportTypes.map(r => (<SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Frequency</label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Recipients</label>
                <Input placeholder="Enter email addresses (comma separated)" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
              <Button onClick={() => { toast.success("Report scheduled successfully"); setShowScheduleDialog(false); }}>Schedule Report</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
