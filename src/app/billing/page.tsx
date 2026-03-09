"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, MoreVertical, Eye, Edit, Trash2, DollarSign,
  CreditCard, FileText, Download, Filter, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle, Clock, Building2, Calendar, ChevronDown,
  ChevronUp, Receipt, Banknote, Wallet, Shield, X, Check
} from "lucide-react";
import Layout from "@/components/Layout";
import PaymentDialog from "@/components/PaymentDialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useRole } from "@/lib/role-context";
import { toast } from "sonner";
import PaymentDialog from "@/components/PaymentDialog";

// Types
interface InvoiceService {
  id: string;
  description: string;
  category: 'Consultation' | 'Procedure' | 'Lab Test' | 'Medication' | 'Room' | 'Equipment' | 'Other';
  quantity: number;
  unitPrice: number;
  total: number;
  discount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  patientMrn?: string;
  patientMRN?: string;
  services: InvoiceService[];
  items?: InvoiceService[];
  subtotal: number;
  discount: number;
  discountReason?: string;
  tax: number;
  total: number;
  paidAmount: number;
  outstandingAmount: number;
  balance: number;
  status: 'Pending' | 'Paid' | 'Insurance' | 'Overdue' | 'Partially Paid' | 'Partial' | 'Cancelled' | 'Insurance Pending' | 'Draft';
  date: string;
  dueDate: string;
  insuranceClaimId?: string;
  paymentPlanId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  payments?: Payment[];
}

interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  amount: number;
  method: 'Cash' | 'Credit Card' | 'Debit Card' | 'Insurance' | 'Bank Transfer' | 'Check';
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  transactionId?: string;
  checkNumber?: string;
  bankName?: string;
  processedBy: string;
  processedAt: string;
  notes?: string;
  createdAt: string;
}

interface InsuranceClaim {
  id: string;
  claimNumber: string;
  invoiceId: string;
  patientId: string;
  patientName: string;
  insuranceProvider: string;
  policyNumber: string;
  claimAmount: number;
  approvedAmount?: number;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Partially Approved' | 'Rejected' | 'Paid';
  submissionDate?: string;
  approvalDate?: string;
  rejectionReason?: string;
  documents?: string[];
  processedBy?: string;
  createdAt: string;
}

interface PaymentPlan {
  id: string;
  invoiceId: string;
  patientId: string;
  patientName: string;
  totalAmount: number;
  installments: PaymentInstallment[];
  status: 'Active' | 'Completed' | 'Defaulted' | 'Cancelled';
  createdAt: string;
}

interface PaymentInstallment {
  id: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'Pending' | 'Paid' | 'Overdue';
  paymentId?: string;
}

interface Patient {
  id: string;
  name: string;
  mrn: string;
  insurance?: {
    provider: string;
    policyNumber: string;
  };
}

type QuickFilter = 'all' | 'Pending' | 'Overdue' | 'Paid' | 'Insurance';

const serviceCategories = ['Consultation', 'Procedure', 'Lab Test', 'Medication', 'Room', 'Equipment', 'Other'] as const;
const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Insurance', 'Bank Transfer', 'Check'] as const;

const initialServiceForm: Omit<InvoiceService, 'id'> = {
  description: '',
  category: 'Consultation',
  quantity: 1,
  unitPrice: 0,
  total: 0,
  discount: 0,
};

const initialInvoiceForm = {
  patientId: '',
  patientName: '',
  services: [] as InvoiceService[],
  discount: 0,
  discountReason: '',
  notes: '',
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
};

export default function BillingPage() {
  const { currentRole } = useRole();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [insuranceClaims, setInsuranceClaims] = useState<InsuranceClaim[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const [isPaymentPlanDialogOpen, setIsPaymentPlanDialogOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [selectedInvoiceForClaim, setSelectedInvoiceForClaim] = useState<Invoice | null>(null);
  const [selectedInvoiceForPlan, setSelectedInvoiceForPlan] = useState<Invoice | null>(null);
  const [viewingPayments, setViewingPayments] = useState<Invoice | null>(null);
  const [viewingClaim, setViewingClaim] = useState<InsuranceClaim | null>(null);
  const [viewingPlan, setViewingPlan] = useState<PaymentPlan | null>(null);

  // Form states
  const [invoiceForm, setInvoiceForm] = useState(initialInvoiceForm);
  const [serviceForm, setServiceForm] = useState(initialServiceForm);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: 'Cash' as Payment['method'],
    transactionId: '',
    checkNumber: '',
    bankName: '',
    notes: '',
  });
  const [claimForm, setClaimForm] = useState({
    insuranceProvider: '',
    policyNumber: '',
    claimAmount: 0,
  });
  const [planForm, setPlanForm] = useState({
    numberOfInstallments: 3,
    startDate: new Date().toISOString().split('T')[0],
  });

  // Active tab state
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'claims' | 'plans'>('invoices');

  // Revenue data for charts
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number; collected: number }[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [invoicesRes, paymentsRes, claimsRes, plansRes, patientsRes] = await Promise.all([
        fetch('/api/billing'),
        fetch('/api/payments'),
        fetch('/api/insurance-claims'),
        fetch('/api/payment-plans'),
        fetch('/api/patients'),
      ]);

      if (invoicesRes.ok) setInvoices(await invoicesRes.json());
      if (paymentsRes.ok) setPayments(await paymentsRes.json());
      if (claimsRes.ok) setInsuranceClaims(await claimsRes.json());
      if (plansRes.ok) setPaymentPlans(await plansRes.json());
      if (patientsRes.ok) {
        const patientData = await patientsRes.json();
        setPatients(patientData.map((p: Patient) => ({
          id: p.id,
          name: p.name,
          mrn: p.mrn,
          insurance: p.insurance,
        })));
      }

      // Generate revenue data for last 6 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const today = new Date();
      const revData = [];
      for (let i = 5; i >= 0; i--) {
        const monthIndex = (today.getMonth() - i + 12) % 12;
        const year = today.getFullYear() - (today.getMonth() - i < 0 ? 1 : 0);
        revData.push({
          month: `${months[monthIndex]} ${year}`,
          revenue: Math.floor(Math.random() * 100000) + 50000,
          collected: Math.floor(Math.random() * 80000) + 40000,
        });
      }
      setRevenueData(revData);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    let filtered = invoices;
    
    if (quickFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === quickFilter);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.patientName.toLowerCase().includes(q) ||
        inv.patientMrn?.toLowerCase().includes(q) ||
        inv.status.toLowerCase().includes(q)
      );
    }
    
    return filtered;
  }, [invoices, quickFilter, searchQuery]);

  // Summary statistics
  const stats = useMemo(() => {
    const pending = invoices.filter(i => i.status === 'Pending').reduce((sum, i) => sum + i.outstandingAmount, 0);
    const overdue = invoices.filter(i => i.status === 'Overdue').reduce((sum, i) => sum + i.outstandingAmount, 0);
    const paid = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total, 0);
    const insurance = invoices.filter(i => i.status === 'Insurance').reduce((sum, i) => sum + i.outstandingAmount, 0);
    const totalOutstanding = pending + overdue + insurance;
    
    return {
      pendingCount: invoices.filter(i => i.status === 'Pending').length,
      overdueCount: invoices.filter(i => i.status === 'Overdue').length,
      paidCount: invoices.filter(i => i.status === 'Paid').length,
      insuranceCount: invoices.filter(i => i.status === 'Insurance').length,
      pendingAmount: pending,
      overdueAmount: overdue,
      paidAmount: paid,
      insuranceAmount: insurance,
      totalOutstanding,
      totalRevenue: invoices.reduce((sum, i) => sum + i.total, 0),
    };
  }, [invoices]);

  // Invoice CRUD operations
  const handleCreateInvoice = async () => {
    try {
      const subtotal = invoiceForm.services.reduce((sum, s) => sum + s.total, 0);
      const discount = invoiceForm.discount;
      const tax = subtotal * 0.08;
      const total = subtotal - discount + tax;

      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...invoiceForm,
          subtotal,
          discount,
          tax,
          total,
          paidAmount: 0,
          outstandingAmount: total,
          status: 'Pending',
          date: new Date().toISOString().split('T')[0],
          createdBy: 'System',
        }),
      });

      if (res.ok) {
        toast.success("Invoice created successfully");
        fetchData();
        resetInvoiceForm();
      } else {
        toast.error("Failed to create invoice");
      }
    } catch {
      toast.error("Failed to create invoice");
    }
  };

  const handleUpdateInvoice = async () => {
    if (!editingInvoice) return;
    try {
      const subtotal = invoiceForm.services.reduce((sum, s) => sum + s.total, 0);
      const discount = invoiceForm.discount;
      const tax = subtotal * 0.08;
      const total = subtotal - discount + tax;

      const res = await fetch('/api/billing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingInvoice.id,
          ...invoiceForm,
          subtotal,
          discount,
          tax,
          total,
          outstandingAmount: total - editingInvoice.paidAmount,
        }),
      });

      if (res.ok) {
        toast.success("Invoice updated successfully");
        fetchData();
        resetInvoiceForm();
      } else {
        toast.error("Failed to update invoice");
      }
    } catch {
      toast.error("Failed to update invoice");
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
      const res = await fetch('/api/billing', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success("Invoice deleted successfully");
        fetchData();
      } else {
        toast.error("Failed to delete invoice");
      }
    } catch {
      toast.error("Failed to delete invoice");
    }
  };

  // Payment operations
  const handleRecordPayment = async () => {
    if (!selectedInvoiceForPayment) return;
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: selectedInvoiceForPayment.id,
          invoiceNumber: selectedInvoiceForPayment.invoiceNumber,
          patientId: selectedInvoiceForPayment.patientId,
          patientName: selectedInvoiceForPayment.patientName,
          ...paymentForm,
          status: 'Completed',
          processedBy: 'System',
          processedAt: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        toast.success("Payment recorded successfully");
        fetchData();
        setIsPaymentDialogOpen(false);
        setSelectedInvoiceForPayment(null);
        setPaymentForm({
          amount: 0,
          method: 'Cash',
          transactionId: '',
          checkNumber: '',
          bankName: '',
          notes: '',
        });
      } else {
        toast.error("Failed to record payment");
      }
    } catch {
      toast.error("Failed to record payment");
    }
  };

  // Insurance claim operations
  const handleSubmitClaim = async () => {
    if (!selectedInvoiceForClaim) return;
    try {
      const res = await fetch('/api/insurance-claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: selectedInvoiceForClaim.id,
          patientId: selectedInvoiceForClaim.patientId,
          patientName: selectedInvoiceForClaim.patientName,
          ...claimForm,
          status: 'Submitted',
          submissionDate: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        toast.success("Insurance claim submitted successfully");
        fetchData();
        setIsClaimDialogOpen(false);
        setSelectedInvoiceForClaim(null);
        setClaimForm({ insuranceProvider: '', policyNumber: '', claimAmount: 0 });
      } else {
        toast.error("Failed to submit claim");
      }
    } catch {
      toast.error("Failed to submit claim");
    }
  };

  const handleUpdateClaimStatus = async (id: string, status: InsuranceClaim['status'], approvedAmount?: number) => {
    try {
      const res = await fetch('/api/insurance-claims', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status,
          approvedAmount,
          approvalDate: status === 'Approved' || status === 'Paid' ? new Date().toISOString() : undefined,
        }),
      });

      if (res.ok) {
        toast.success(`Claim ${status.toLowerCase()}`);
        fetchData();
      } else {
        toast.error("Failed to update claim");
      }
    } catch {
      toast.error("Failed to update claim");
    }
  };

  // Payment plan operations
  const handleCreatePaymentPlan = async () => {
    if (!selectedInvoiceForPlan) return;
    try {
      const installmentAmount = selectedInvoiceForPlan.outstandingAmount / planForm.numberOfInstallments;
      const installments: PaymentInstallment[] = [];
      
      for (let i = 0; i < planForm.numberOfInstallments; i++) {
        const dueDate = new Date(planForm.startDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        installments.push({
          id: `INST-${Date.now()}-${i}`,
          amount: installmentAmount,
          dueDate: dueDate.toISOString().split('T')[0],
          status: 'Pending',
        });
      }

      const res = await fetch('/api/payment-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: selectedInvoiceForPlan.id,
          patientId: selectedInvoiceForPlan.patientId,
          patientName: selectedInvoiceForPlan.patientName,
          totalAmount: selectedInvoiceForPlan.outstandingAmount,
          installments,
          status: 'Active',
        }),
      });

      if (res.ok) {
        toast.success("Payment plan created successfully");
        fetchData();
        setIsPaymentPlanDialogOpen(false);
        setSelectedInvoiceForPlan(null);
        setPlanForm({ numberOfInstallments: 3, startDate: new Date().toISOString().split('T')[0] });
      } else {
        toast.error("Failed to create payment plan");
      }
    } catch {
      toast.error("Failed to create payment plan");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Invoice Number', 'Patient Name', 'MRN', 'Date', 'Due Date', 'Subtotal', 'Discount', 'Tax', 'Total', 'Paid', 'Outstanding', 'Status'];
    const rows = filteredInvoices.map(inv => [
      inv.invoiceNumber,
      inv.patientName,
      inv.patientMrn || '',
      inv.date,
      inv.dueDate,
      inv.subtotal.toFixed(2),
      inv.discount.toFixed(2),
      inv.tax.toFixed(2),
      inv.total.toFixed(2),
      inv.paidAmount.toFixed(2),
      inv.outstandingAmount.toFixed(2),
      inv.status,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  };

  // Helper functions
  const resetInvoiceForm = () => {
    setInvoiceForm(initialInvoiceForm);
    setServiceForm(initialServiceForm);
    setEditingInvoice(null);
    setIsInvoiceDialogOpen(false);
  };

  const addServiceToInvoice = () => {
    const total = serviceForm.quantity * serviceForm.unitPrice - serviceForm.discount;
    const newService: InvoiceService = {
      id: `SVC-${Date.now()}`,
      ...serviceForm,
      total,
    };
    setInvoiceForm(prev => ({
      ...prev,
      services: [...prev.services, newService],
    }));
    setServiceForm(initialServiceForm);
  };

  const removeServiceFromInvoice = (id: string) => {
    setInvoiceForm(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== id),
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Pending': return 'warning';
      case 'Overdue': return 'destructive';
      case 'Insurance': return 'info';
      case 'Partially Paid': return 'secondary';
      case 'Cancelled': return 'secondary';
      default: return 'secondary';
    }
  };

  const getClaimStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Approved': return 'success';
      case 'Partially Approved': return 'warning';
      case 'Submitted': return 'info';
      case 'Under Review': return 'info';
      case 'Rejected': return 'destructive';
      case 'Draft': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPlanStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Active': return 'info';
      case 'Defaulted': return 'destructive';
      case 'Cancelled': return 'secondary';
      default: return 'secondary';
    }
  };

  const canEdit = currentRole === 'admin' || currentRole === 'finance_manager' || currentRole === 'receptionist';
  const canDelete = currentRole === 'admin' || currentRole === 'finance_manager';
  const canApprove = currentRole === 'admin' || currentRole === 'finance_manager';

  // Calculate max height for chart bars
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue));

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Billing & Finance
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage invoices, payments, insurance claims, and payment plans
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            {canEdit && (
              <Button onClick={() => {
                resetInvoiceForm();
                setIsInvoiceDialogOpen(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">{stats.pendingCount}</p>
                <p className="text-xs text-muted-foreground">${stats.pendingAmount.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-xl font-bold">{stats.overdueCount}</p>
                <p className="text-xs text-muted-foreground">${stats.overdueAmount.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-xl font-bold">{stats.paidCount}</p>
                <p className="text-xs text-muted-foreground">${stats.paidAmount.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Insurance</p>
                <p className="text-xl font-bold">{stats.insuranceCount}</p>
                <p className="text-xs text-muted-foreground">${stats.insuranceAmount.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Outstanding</p>
                <p className="text-xl font-bold">${stats.totalOutstanding.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg">Revenue Overview (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex items-end gap-4 h-48">
              {revenueData.map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-1 items-end h-36">
                    <div
                      className="flex-1 bg-primary/20 rounded-t transition-all duration-300 hover:bg-primary/30"
                      style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                      title={`Billed: $${data.revenue.toLocaleString()}`}
                    />
                    <div
                      className="flex-1 bg-green-500/60 rounded-t transition-all duration-300 hover:bg-green-500/70"
                      style={{ height: `${(data.collected / maxRevenue) * 100}%` }}
                      title={`Collected: $${data.collected.toLocaleString()}`}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">{data.month}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary/20 rounded" />
                <span className="text-muted-foreground">Billed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500/60 rounded" />
                <span className="text-muted-foreground">Collected</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex gap-6">
            {[
              { id: 'invoices', label: 'Invoices', icon: FileText },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'claims', label: 'Insurance Claims', icon: Shield },
              { id: 'plans', label: 'Payment Plans', icon: Calendar },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {activeTab === 'invoices' && (
            <div className="flex gap-2 flex-wrap">
              {(['all', 'Pending', 'Overdue', 'Paid', 'Insurance'] as QuickFilter[]).map(filter => (
                <Button
                  key={filter}
                  variant={quickFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setQuickFilter(filter)}
                >
                  {filter === 'all' ? 'All' : filter}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'invoices' && (
            <motion.div
              key="invoices"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/30 text-muted-foreground border-b border-border">
                        <tr>
                          <th className="px-6 py-4 font-medium">Invoice #</th>
                          <th className="px-6 py-4 font-medium">Patient</th>
                          <th className="px-6 py-4 font-medium">Date</th>
                          <th className="px-6 py-4 font-medium">Due Date</th>
                          <th className="px-6 py-4 font-medium text-right">Total</th>
                          <th className="px-6 py-4 font-medium text-right">Paid</th>
                          <th className="px-6 py-4 font-medium text-right">Outstanding</th>
                          <th className="px-6 py-4 font-medium">Status</th>
                          <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredInvoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4 font-medium text-foreground">
                              {inv.invoiceNumber}
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium">{inv.patientName}</p>
                                {inv.patientMrn && (
                                  <p className="text-xs text-muted-foreground">{inv.patientMrn}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">{inv.date}</td>
                            <td className="px-6 py-4">{inv.dueDate}</td>
                            <td className="px-6 py-4 text-right font-medium">
                              ${inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 text-right text-green-600">
                              ${inv.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 text-right text-amber-600">
                              ${inv.outstandingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant={getStatusColor(inv.status) as "success" | "warning" | "destructive" | "info" | "secondary"}>
                                {inv.status}
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
                                  <DropdownMenuItem onClick={() => setViewingInvoice(inv)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setViewingPayments(inv)}>
                                    <Receipt className="w-4 h-4 mr-2" />
                                    Payment History
                                  </DropdownMenuItem>
                                  {canEdit && inv.status !== 'Paid' && inv.status !== 'Cancelled' && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => {
                                        const patient = patients.find(p => p.id === inv.patientId);
                                        setInvoiceForm({
                                          patientId: inv.patientId,
                                          patientName: inv.patientName,
                                          services: inv.services,
                                          discount: inv.discount,
                                          discountReason: inv.discountReason || '',
                                          notes: inv.notes || '',
                                          dueDate: inv.dueDate,
                                        });
                                        setEditingInvoice(inv);
                                        setIsInvoiceDialogOpen(true);
                                      }}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Invoice
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => {
                                        setSelectedInvoiceForPayment(inv);
                                        setPaymentForm(prev => ({ ...prev, amount: inv.outstandingAmount }));
                                        setIsPaymentDialogOpen(true);
                                      }}>
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        Record Payment
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => {
                                        setSelectedInvoiceForClaim(inv);
                                        const patient = patients.find(p => p.id === inv.patientId);
                                        setClaimForm({
                                          insuranceProvider: patient?.insurance?.provider || '',
                                          policyNumber: patient?.insurance?.policyNumber || '',
                                          claimAmount: inv.outstandingAmount,
                                        });
                                        setIsClaimDialogOpen(true);
                                      }}>
                                        <Shield className="w-4 h-4 mr-2" />
                                        Submit Insurance Claim
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => {
                                        setSelectedInvoiceForPlan(inv);
                                        setIsPaymentPlanDialogOpen(true);
                                      }}>
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Create Payment Plan
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {canDelete && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteInvoice(inv.id)}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Invoice
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
                  {filteredInvoices.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                      No invoices found.
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'payments' && (
            <motion.div
              key="payments"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/30 text-muted-foreground border-b border-border">
                        <tr>
                          <th className="px-6 py-4 font-medium">Payment ID</th>
                          <th className="px-6 py-4 font-medium">Invoice #</th>
                          <th className="px-6 py-4 font-medium">Patient</th>
                          <th className="px-6 py-4 font-medium">Amount</th>
                          <th className="px-6 py-4 font-medium">Method</th>
                          <th className="px-6 py-4 font-medium">Status</th>
                          <th className="px-6 py-4 font-medium">Date</th>
                          <th className="px-6 py-4 font-medium">Processed By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {payments.filter(p =>
                          searchQuery ? p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) : true
                        ).map((payment) => (
                          <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4 font-medium">{payment.id}</td>
                            <td className="px-6 py-4">{payment.invoiceNumber}</td>
                            <td className="px-6 py-4">{payment.patientName}</td>
                            <td className="px-6 py-4 font-bold text-green-600">
                              ${payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="outline">{payment.method}</Badge>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant={payment.status === 'Completed' ? 'success' : payment.status === 'Failed' ? 'destructive' : 'secondary'}>
                                {payment.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">{payment.processedAt?.split('T')[0]}</td>
                            <td className="px-6 py-4">{payment.processedBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {payments.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                      No payments recorded.
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'claims' && (
            <motion.div
              key="claims"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/30 text-muted-foreground border-b border-border">
                        <tr>
                          <th className="px-6 py-4 font-medium">Claim #</th>
                          <th className="px-6 py-4 font-medium">Patient</th>
                          <th className="px-6 py-4 font-medium">Provider</th>
                          <th className="px-6 py-4 font-medium">Claim Amount</th>
                          <th className="px-6 py-4 font-medium">Approved</th>
                          <th className="px-6 py-4 font-medium">Status</th>
                          <th className="px-6 py-4 font-medium">Submitted</th>
                          <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {insuranceClaims.filter(c =>
                          searchQuery ? c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) : true
                        ).map((claim) => (
                          <tr key={claim.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4 font-medium">{claim.claimNumber}</td>
                            <td className="px-6 py-4">{claim.patientName}</td>
                            <td className="px-6 py-4">{claim.insuranceProvider}</td>
                            <td className="px-6 py-4">
                              ${claim.claimAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 text-green-600">
                              {claim.approvedAmount ? `$${claim.approvedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant={getClaimStatusColor(claim.status) as "success" | "warning" | "destructive" | "info" | "secondary"}>
                                {claim.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">{claim.submissionDate?.split('T')[0] || '-'}</td>
                            <td className="px-6 py-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setViewingClaim(claim)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {canApprove && claim.status === 'Submitted' && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleUpdateClaimStatus(claim.id, 'Under Review')}>
                                        <Clock className="w-4 h-4 mr-2" />
                                        Mark Under Review
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {canApprove && claim.status === 'Under Review' && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleUpdateClaimStatus(claim.id, 'Approved', claim.claimAmount)}>
                                        <Check className="w-4 h-4 mr-2" />
                                        Approve Full
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleUpdateClaimStatus(claim.id, 'Partially Approved', claim.claimAmount * 0.7)}>
                                        <Check className="w-4 h-4 mr-2" />
                                        Approve Partial (70%)
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleUpdateClaimStatus(claim.id, 'Rejected')}>
                                        <X className="w-4 h-4 mr-2" />
                                        Reject
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {canApprove && (claim.status === 'Approved' || claim.status === 'Partially Approved') && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleUpdateClaimStatus(claim.id, 'Paid', claim.approvedAmount)}>
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        Mark as Paid
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
                  {insuranceClaims.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                      No insurance claims found.
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'plans' && (
            <motion.div
              key="plans"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/30 text-muted-foreground border-b border-border">
                        <tr>
                          <th className="px-6 py-4 font-medium">Plan ID</th>
                          <th className="px-6 py-4 font-medium">Patient</th>
                          <th className="px-6 py-4 font-medium">Total Amount</th>
                          <th className="px-6 py-4 font-medium">Installments</th>
                          <th className="px-6 py-4 font-medium">Paid</th>
                          <th className="px-6 py-4 font-medium">Remaining</th>
                          <th className="px-6 py-4 font-medium">Status</th>
                          <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {paymentPlans.filter(p =>
                          searchQuery ? p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) : true
                        ).map((plan) => {
                          const paidInstallments = plan.installments.filter(i => i.status === 'Paid').length;
                          const paidAmount = plan.installments.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);
                          const remaining = plan.totalAmount - paidAmount;
                          
                          return (
                            <tr key={plan.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-6 py-4 font-medium">{plan.id}</td>
                              <td className="px-6 py-4">{plan.patientName}</td>
                              <td className="px-6 py-4 font-medium">
                                ${plan.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-green-600 font-medium">{paidInstallments}</span>
                                <span className="text-muted-foreground"> / {plan.installments.length}</span>
                              </td>
                              <td className="px-6 py-4 text-green-600">
                                ${paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-6 py-4 text-amber-600">
                                ${remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant={getPlanStatusColor(plan.status) as "success" | "warning" | "destructive" | "info" | "secondary"}>
                                  {plan.status}
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
                                    <DropdownMenuItem onClick={() => setViewingPlan(plan)}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Installments
                                    </DropdownMenuItem>
                                    {canApprove && plan.status === 'Active' && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => {
                                          const inv = invoices.find(i => i.id === plan.invoiceId);
                                          if (inv) {
                                            setSelectedInvoiceForPayment(inv);
                                            setPaymentForm(prev => ({
                                              ...prev,
                                              amount: plan.installments.find(i => i.status === 'Pending')?.amount || 0,
                                            }));
                                            setIsPaymentDialogOpen(true);
                                          }
                                        }}>
                                          <DollarSign className="w-4 h-4 mr-2" />
                                          Record Installment Payment
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {paymentPlans.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                      No payment plans found.
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create/Edit Invoice Dialog */}
        <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}</DialogTitle>
              <DialogDescription>
                {editingInvoice ? 'Update invoice details below.' : 'Fill in the invoice details below.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Patient Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select
                    value={invoiceForm.patientId}
                    onValueChange={(value) => {
                      const patient = patients.find(p => p.id === value);
                      setInvoiceForm(prev => ({
                        ...prev,
                        patientId: value,
                        patientName: patient?.name || '',
                      }));
                    }}
                    disabled={!!editingInvoice}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name} ({patient.mrn})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Services */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Services</Label>
                </div>
                
                {/* Add Service Form */}
                <div className="grid grid-cols-6 gap-2 items-end bg-muted/30 p-3 rounded-lg">
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Input
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Service name"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Category</Label>
                    <Select
                      value={serviceForm.category}
                      onValueChange={(value: InvoiceService['category']) => setServiceForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      value={serviceForm.quantity}
                      onChange={(e) => setServiceForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Unit Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={serviceForm.unitPrice}
                      onChange={(e) => setServiceForm(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                      className="h-9"
                    />
                  </div>
                  <Button size="sm" onClick={addServiceToInvoice} disabled={!serviceForm.description}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Services List */}
                {invoiceForm.services.length > 0 && (
                  <div className="border rounded-lg divide-y">
                    {invoiceForm.services.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-3 text-sm">
                        <div className="flex-1">
                          <p className="font-medium">{service.description}</p>
                          <p className="text-xs text-muted-foreground">{service.category} × {service.quantity}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-medium">${service.total.toFixed(2)}</p>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeServiceFromInvoice(service.id)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Discount and Notes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={invoiceForm.discount}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discount Reason</Label>
                  <Input
                    value={invoiceForm.discountReason}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, discountReason: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional notes"
                />
              </div>

              {/* Totals */}
              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${invoiceForm.services.reduce((sum, s) => sum + s.total, 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Discount</span>
                  <span className="text-red-600">-${invoiceForm.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (8%)</span>
                  <span>${(invoiceForm.services.reduce((sum, s) => sum + s.total, 0) * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>
                    ${(invoiceForm.services.reduce((sum, s) => sum + s.total, 0) - invoiceForm.discount + invoiceForm.services.reduce((sum, s) => sum + s.total, 0) * 0.08).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetInvoiceForm}>Cancel</Button>
              <Button onClick={editingInvoice ? handleUpdateInvoice : handleCreateInvoice}>
                {editingInvoice ? 'Update' : 'Create'} Invoice
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Invoice Dialog */}
        <Dialog open={!!viewingInvoice} onOpenChange={() => setViewingInvoice(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
            </DialogHeader>
            {viewingInvoice && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Invoice Number</Label>
                    <p className="font-medium">{viewingInvoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Patient</Label>
                    <p className="font-medium">{viewingInvoice.patientName}</p>
                    {viewingInvoice.patientMrn && (
                      <p className="text-xs text-muted-foreground">{viewingInvoice.patientMrn}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Date</Label>
                    <p className="font-medium">{viewingInvoice.date}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Due Date</Label>
                    <p className="font-medium">{viewingInvoice.dueDate}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Status</Label>
                    <Badge variant={getStatusColor(viewingInvoice.status) as "success" | "warning" | "destructive" | "info" | "secondary"}>
                      {viewingInvoice.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Created By</Label>
                    <p className="font-medium">{viewingInvoice.createdBy}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-muted-foreground text-xs mb-2 block">Services</Label>
                  <div className="border rounded-lg divide-y">
                    {viewingInvoice.services.map((service) => (
                      <div key={service.id} className="flex justify-between p-3 text-sm">
                        <div>
                          <p className="font-medium">{service.description}</p>
                          <p className="text-xs text-muted-foreground">{service.category} × {service.quantity} @ ${service.unitPrice.toFixed(2)}</p>
                        </div>
                        <p className="font-medium">${service.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${viewingInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  {viewingInvoice.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Discount {viewingInvoice.discountReason && `(${viewingInvoice.discountReason})`}</span>
                      <span className="text-red-600">-${viewingInvoice.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${viewingInvoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>${viewingInvoice.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Paid</span>
                    <span>${viewingInvoice.paidAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-amber-600 font-bold">
                    <span>Outstanding</span>
                    <span>${viewingInvoice.outstandingAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Payment History Dialog */}
        <Dialog open={!!viewingPayments} onOpenChange={() => setViewingPayments(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Payment History</DialogTitle>
              <DialogDescription>
                {viewingPayments?.invoiceNumber} - {viewingPayments?.patientName}
              </DialogDescription>
            </DialogHeader>
            {viewingPayments && (
              <div className="space-y-4">
                {payments.filter(p => p.invoiceId === viewingPayments.id).length > 0 ? (
                  <div className="border rounded-lg divide-y">
                    {payments.filter(p => p.invoiceId === viewingPayments.id).map(payment => (
                      <div key={payment.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-green-600">${payment.amount.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">{payment.method}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={payment.status === 'Completed' ? 'success' : 'secondary'}>
                              {payment.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">{payment.processedAt?.split('T')[0]}</p>
                          </div>
                        </div>
                        {payment.transactionId && (
                          <p className="text-xs text-muted-foreground mt-2">Ref: {payment.transactionId}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No payments recorded yet.
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Record Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                {selectedInvoiceForPayment?.invoiceNumber} - Outstanding: ${selectedInvoiceForPayment?.outstandingAmount.toFixed(2)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  min="0"
                  max={selectedInvoiceForPayment?.outstandingAmount}
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select
                  value={paymentForm.method}
                  onValueChange={(value: Payment['method']) => setPaymentForm(prev => ({ ...prev, method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(method => (
                      <SelectItem key={method} value={method}>{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {paymentForm.method === 'Credit Card' || paymentForm.method === 'Debit Card' ? (
                <div className="space-y-2">
                  <Label>Transaction ID</Label>
                  <Input
                    value={paymentForm.transactionId}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, transactionId: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
              ) : paymentForm.method === 'Check' ? (
                <>
                  <div className="space-y-2">
                    <Label>Check Number</Label>
                    <Input
                      value={paymentForm.checkNumber}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, checkNumber: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input
                      value={paymentForm.bankName}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, bankName: e.target.value }))}
                    />
                  </div>
                </>
              ) : null}
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleRecordPayment}>Record Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Insurance Claim Dialog */}
        <Dialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Submit Insurance Claim</DialogTitle>
              <DialogDescription>
                {selectedInvoiceForClaim?.invoiceNumber} - {selectedInvoiceForClaim?.patientName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Insurance Provider</Label>
                <Input
                  value={claimForm.insuranceProvider}
                  onChange={(e) => setClaimForm(prev => ({ ...prev, insuranceProvider: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Policy Number</Label>
                <Input
                  value={claimForm.policyNumber}
                  onChange={(e) => setClaimForm(prev => ({ ...prev, policyNumber: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Claim Amount</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={claimForm.claimAmount}
                  onChange={(e) => setClaimForm(prev => ({ ...prev, claimAmount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsClaimDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmitClaim}>Submit Claim</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Plan Dialog */}
        <Dialog open={isPaymentPlanDialogOpen} onOpenChange={setIsPaymentPlanDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Create Payment Plan</DialogTitle>
              <DialogDescription>
                {selectedInvoiceForPlan?.patientName} - Outstanding: ${selectedInvoiceForPlan?.outstandingAmount.toFixed(2)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Number of Installments</Label>
                <Select
                  value={planForm.numberOfInstallments.toString()}
                  onValueChange={(value) => setPlanForm(prev => ({ ...prev, numberOfInstallments: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 6, 12].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n} installments</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={planForm.startDate}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Each installment: ${(selectedInvoiceForPlan ? selectedInvoiceForPlan.outstandingAmount / planForm.numberOfInstallments : 0).toFixed(2)}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentPlanDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreatePaymentPlan}>Create Plan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Claim Dialog */}
        <Dialog open={!!viewingClaim} onOpenChange={() => setViewingClaim(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Insurance Claim Details</DialogTitle>
            </DialogHeader>
            {viewingClaim && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Claim Number</Label>
                    <p className="font-medium">{viewingClaim.claimNumber}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Patient</Label>
                    <p className="font-medium">{viewingClaim.patientName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Insurance Provider</Label>
                    <p className="font-medium">{viewingClaim.insuranceProvider}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Policy Number</Label>
                    <p className="font-medium">{viewingClaim.policyNumber}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Claim Amount</Label>
                    <p className="font-medium">${viewingClaim.claimAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Approved Amount</Label>
                    <p className="font-medium text-green-600">
                      {viewingClaim.approvedAmount ? `$${viewingClaim.approvedAmount.toFixed(2)}` : 'Pending'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Status</Label>
                    <Badge variant={getClaimStatusColor(viewingClaim.status) as "success" | "warning" | "destructive" | "info" | "secondary"}>
                      {viewingClaim.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Submission Date</Label>
                    <p className="font-medium">{viewingClaim.submissionDate?.split('T')[0] || '-'}</p>
                  </div>
                </div>
                {viewingClaim.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                    <Label className="text-red-600 text-xs">Rejection Reason</Label>
                    <p className="text-sm text-red-700">{viewingClaim.rejectionReason}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* View Payment Plan Dialog */}
        <Dialog open={!!viewingPlan} onOpenChange={() => setViewingPlan(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Payment Plan Details</DialogTitle>
            </DialogHeader>
            {viewingPlan && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Patient</Label>
                    <p className="font-medium">{viewingPlan.patientName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Total Amount</Label>
                    <p className="font-medium">${viewingPlan.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Status</Label>
                    <Badge variant={getPlanStatusColor(viewingPlan.status) as "success" | "warning" | "destructive" | "info" | "secondary"}>
                      {viewingPlan.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Installments</Label>
                    <p className="font-medium">
                      {viewingPlan.installments.filter(i => i.status === 'Paid').length} / {viewingPlan.installments.length} paid
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs mb-2 block">Installment Schedule</Label>
                  <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                    {viewingPlan.installments.map((installment, i) => (
                      <div key={installment.id} className="flex justify-between items-center p-3">
                        <div>
                          <p className="font-medium">Installment {i + 1}</p>
                          <p className="text-xs text-muted-foreground">Due: {installment.dueDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${installment.amount.toFixed(2)}</p>
                          <Badge variant={
                            installment.status === 'Paid' ? 'success' :
                            installment.status === 'Overdue' ? 'destructive' : 'warning'
                          }>
                            {installment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
