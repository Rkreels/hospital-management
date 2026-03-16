"use client";

import React, { useState, useEffect, useRef } from "react";
import { db } from '../lib/store';
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, MoreVertical, Edit, Trash2, AlertTriangle, Pill,
  Package, Clock, DollarSign, Building2, AlertCircle, FileText,
  Printer, ShoppingCart, Eye, Check, Filter, RefreshCw, ArrowUpDown, Info
} from "lucide-react";
import StatCard from "../components/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import type { Medication, Prescription, DrugInteraction, PrescriptionItem } from "../types";

// Tab type
type TabType = "inventory" | "prescriptions" | "alerts";

// Mock drug interactions for simulation
const mockDrugInteractions: DrugInteraction[] = [
  { drugName: "Warfarin", severity: "Severe", description: "Increased risk of bleeding" },
  { drugName: "Aspirin", severity: "Moderate", description: "May increase bleeding risk" },
  { drugName: "Ibuprofen", severity: "Moderate", description: "Reduced antihypertensive effect" },
  { drugName: "Metformin", severity: "Mild", description: "May enhance hypoglycemic effect" },
  { drugName: "Cimetidine", severity: "Mild", description: "May increase drug levels" },
];

const initialMedicationForm = {
  name: "",
  genericName: "",
  brandName: "",
  category: "",
  form: "Tablet" as const,
  strength: "",
  unit: "",
  stock: "",
  minStock: "",
  reorderLevel: "",
  manufacturer: "",
  price: "",
  costPrice: "",
  expiryDate: "",
  batchNumber: "",
  storageConditions: "",
  requiresPrescription: true,
  controlledSubstance: false,
  sideEffects: "",
  contraindications: "",
  drugInteractions: [] as DrugInteraction[],
  dosageInstructions: "",
  location: "",
  supplierId: "",
  supplierName: "",
};

const medicationForms = ["Tablet", "Capsule", "Injection", "Syrup", "Ointment", "Drops", "Inhaler", "Patch", "Other"] as const;
const medicationCategories = [
  "Antibiotic", "ACE Inhibitor", "Antidiabetic", "Statin", "Proton Pump Inhibitor",
  "NSAID", "Analgesic", "Antiplatelet", "Bronchodilator", "Beta Blocker",
  "Calcium Channel Blocker", "Anticoagulant", "Diuretic", "Antihistamine", "Other"
];

export default function PharmacyPage() {
  useRole(); // Role context for future role-based permissions
  const [activeTab, setActiveTab] = useState<TabType>("inventory");
  
  // Medications state
  const [medications, setMedications] = useState<Medication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: "name", direction: 'asc' });
  
  // Dialog states
  const [isMedicationDialogOpen, setIsMedicationDialogOpen] = useState(false);
  const [isPrescriptionDialogOpen, setIsPrescriptionDialogOpen] = useState(false);
  const [isDispenseDialogOpen, setIsDispenseDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isInteractionsDialogOpen, setIsInteractionsDialogOpen] = useState(false);
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);
  const [isReorderDialogOpen, setIsReorderDialogOpen] = useState(false);
  
  // Form data
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [medicationForm, setMedicationForm] = useState(initialMedicationForm);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  
  // Prescriptions state
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [dispensingItem, setDispensingItem] = useState<PrescriptionItem | null>(null);
  const [dispenseQuantity, setDispenseQuantity] = useState(0);
  const [checkingInteractions, setCheckingInteractions] = useState(false);
  const [detectedInteractions, setDetectedInteractions] = useState<DrugInteraction[]>([]);
  
  // Ref for printing
  const labelRef = useRef<HTMLDivElement>(null);

  // Fetch data
  useEffect(() => {
    fetchMedications();
    fetchPrescriptions();
  }, []);

  const fetchMedications = async () => {
    try {
      const data = db.getMedications();
      setMedications(data);
    } catch {
      toast.error("Failed to fetch medications");
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const data = db.getPrescriptions();
      setPrescriptions(data);
    } catch {
      toast.error("Failed to fetch prescriptions");
    }
  };

  // Calculated values
  const lowStockMedications = medications.filter(m => m.stock <= m.reorderLevel);
  const expiringMedications = medications.filter(m => {
    const expiry = new Date(m.expiryDate);
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    return expiry <= ninetyDaysFromNow;
  });
  const expiredMedications = medications.filter(m => new Date(m.expiryDate) < new Date());
  const pendingPrescriptions = prescriptions.filter(p => p.status === "Pending");
  // Calculate inventory value for potential reporting
  const _totalInventoryValue = medications.reduce((sum, m) => sum + (m.price * m.stock), 0);

  // Filter and sort medications
  const filteredMedications = medications
    .filter(m => {
      const matchesSearch = 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || m.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Medication];
      const bValue = b[sortConfig.key as keyof Medication];
      if (aValue === undefined || bValue === undefined) return 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

  // Handlers
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleMedicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...medicationForm,
        stock: parseInt(medicationForm.stock) || 0,
        minStock: parseInt(medicationForm.minStock) || 0,
        reorderLevel: parseInt(medicationForm.reorderLevel) || 0,
        price: parseFloat(medicationForm.price) || 0,
        costPrice: parseFloat(medicationForm.costPrice) || 0,
        sideEffects: medicationForm.sideEffects.split(',').map(s => s.trim()).filter(Boolean),
        contraindications: medicationForm.contraindications.split(',').map(s => s.trim()).filter(Boolean),
        lastRestocked: new Date().toISOString(),
      };

      if (editingMedication) {
        const updated = db.updateMedication(editingMedication.id, payload);
        if (updated) {
          toast.success("Medication updated successfully");
          fetchMedications();
          resetMedicationForm();
        }
      } else {
        const newMed = db.addMedication(payload);
        if (newMed) {
          toast.success("Medication added successfully");
          fetchMedications();
          resetMedicationForm();
        }
      }
    } catch {
      toast.error("Failed to save medication");
    }
  };

  const handleDeleteMedication = async (id: string) => {
    if (confirm("Are you sure you want to delete this medication?")) {
      try {
        const deleted = db.deleteMedication(id);
        if (deleted) {
          toast.success("Medication deleted successfully");
          fetchMedications();
        }
      } catch {
        toast.error("Failed to delete medication");
      }
    }
  };

  const handleReorder = async (medication: Medication) => {
    try {
      const updated = db.updateMedication(medication.id, {
        stock: medication.reorderLevel * 3,
      });
      if (updated) {
        toast.success(`Reordered ${medication.name}. Stock updated to ${medication.reorderLevel * 3}`);
        fetchMedications();
        setIsReorderDialogOpen(false);
        setSelectedMedication(null);
      }
    } catch {
      toast.error("Failed to reorder medication");
    }
  };

  const handleDispenseItem = async () => {
    if (!selectedPrescription || !dispensingItem) return;
    
    try {
      const updatedItems = selectedPrescription.items.map(item => {
        if (item.id === dispensingItem.id) {
          return {
            ...item,
            dispensedQuantity: dispenseQuantity,
            isDispensed: dispenseQuantity >= item.quantity,
          };
        }
        return item;
      });

      const allDispensed = updatedItems.every(item => item.isDispensed);
      
      const updated = db.updatePrescription(selectedPrescription.id, {
        items: updatedItems,
        status: allDispensed ? "Dispensed" : "Partially Dispensed",
        dispensedBy: "Pharmacist",
        dispensedAt: new Date().toISOString(),
      });

      if (updated) {
        toast.success("Medication dispensed successfully");
        setIsDispenseDialogOpen(false);
        setDispensingItem(null);
        setDispenseQuantity(0);
        fetchPrescriptions();
        fetchMedications();
      }
    } catch {
      toast.error("Failed to dispense medication");
    }
  };

  const checkDrugInteractions = async (_medicationId: string) => {
    setCheckingInteractions(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate random interactions
    const interactions = mockDrugInteractions
      .filter(() => Math.random() > 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 1);
    
    setDetectedInteractions(interactions);
    setCheckingInteractions(false);
    return interactions;
  };

  const handlePrintLabel = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && selectedPrescription && dispensingItem) {
      const medication = medications.find(m => m.id === dispensingItem.medicationId);
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Prescription Label</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; }
            .hospital-name { font-size: 18px; font-weight: bold; }
            .section { margin-bottom: 12px; }
            .label { font-weight: bold; color: #666; font-size: 12px; }
            .value { font-size: 14px; }
            .medication-name { font-size: 20px; font-weight: bold; color: #1a1a1a; }
            .dosage { font-size: 16px; color: #333; margin: 8px 0; padding: 8px; background: #f5f5f5; border-radius: 4px; }
            .warning { background: #fff3cd; padding: 8px; border-radius: 4px; margin-top: 10px; font-size: 12px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="hospital-name">HospitalHub Medical Center</div>
            <div style="font-size: 12px; color: #666;">123 Medical Center Drive, Healthcare City</div>
            <div style="font-size: 12px; color: #666;">Phone: (555) 123-4567</div>
          </div>
          
          <div class="section">
            <div class="label">Patient:</div>
            <div class="value">${selectedPrescription.patientName}</div>
          </div>
          
          <div class="section">
            <div class="label">Prescriber:</div>
            <div class="value">${selectedPrescription.doctorName}</div>
          </div>
          
          <div class="section">
            <div class="label">Date:</div>
            <div class="value">${new Date(selectedPrescription.date).toLocaleDateString()}</div>
          </div>
          
          <div class="medication-name">${dispensingItem.medicationName}</div>
          <div class="dosage">
            <strong>Dosage:</strong> ${dispensingItem.dosage}<br>
            <strong>Frequency:</strong> ${dispensingItem.frequency}<br>
            <strong>Duration:</strong> ${dispensingItem.duration}
          </div>
          
          <div class="section">
            <div class="label">Quantity:</div>
            <div class="value">${dispenseQuantity} ${medication?.unit || 'units'}</div>
          </div>
          
          <div class="section">
            <div class="label">Instructions:</div>
            <div class="value">${dispensingItem.instructions}</div>
          </div>
          
          ${medication?.storageConditions ? `
          <div class="warning">
            <strong>Storage:</strong> ${medication.storageConditions}
          </div>
          ` : ''}
          
          <div class="warning">
            <strong>⚠ Warning:</strong> Keep out of reach of children. Take as directed.
          </div>
          
          <script>window.print(); window.close();</script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
    setIsLabelDialogOpen(false);
  };

  const resetMedicationForm = () => {
    setMedicationForm(initialMedicationForm);
    setEditingMedication(null);
    setIsMedicationDialogOpen(false);
  };

  const openEditMedicationDialog = (medication: Medication) => {
    setEditingMedication(medication);
    setMedicationForm({
      name: medication.name,
      genericName: medication.genericName,
      brandName: medication.brandName || "",
      category: medication.category,
      form: medication.form,
      strength: medication.strength,
      unit: medication.unit,
      stock: medication.stock.toString(),
      minStock: medication.minStock.toString(),
      reorderLevel: medication.reorderLevel.toString(),
      manufacturer: medication.manufacturer,
      price: medication.price.toString(),
      costPrice: medication.costPrice?.toString() || "",
      expiryDate: medication.expiryDate,
      batchNumber: medication.batchNumber || "",
      storageConditions: medication.storageConditions || "",
      requiresPrescription: medication.requiresPrescription,
      controlledSubstance: medication.controlledSubstance,
      sideEffects: medication.sideEffects?.join(", ") || "",
      contraindications: medication.contraindications?.join(", ") || "",
      drugInteractions: medication.drugInteractions || [],
      dosageInstructions: medication.dosageInstructions || "",
      location: medication.location || "",
      supplierId: medication.supplierId || "",
      supplierName: medication.supplierName || "",
    });
    setIsMedicationDialogOpen(true);
  };

  const getStockStatus = (medication: Medication) => {
    if (medication.stock === 0) return { variant: "destructive" as const, label: "Out of Stock" };
    if (medication.stock <= medication.minStock) return { variant: "destructive" as const, label: "Critical" };
    if (medication.stock <= medication.reorderLevel) return { variant: "warning" as const, label: "Low Stock" };
    return { variant: "success" as const, label: "In Stock" };
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Pharmacy Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Medication inventory, prescriptions, and dispensing
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => { fetchMedications(); fetchPrescriptions(); }}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => { resetMedicationForm(); setIsMedicationDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Medication
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Medications"
            value={medications.length}
            icon={Pill}
            delay={0}
          />
          <StatCard
            title="Low Stock Alerts"
            value={lowStockMedications.length}
            icon={AlertTriangle}
            delay={0.1}
          />
          <StatCard
            title="Expiring Soon"
            value={expiringMedications.length}
            icon={Clock}
            delay={0.2}
          />
          <StatCard
            title="Pending Prescriptions"
            value={pendingPrescriptions.length}
            icon={FileText}
            delay={0.3}
          />
        </div>

        {/* Alert Banners */}
        <AnimatePresence>
          {(lowStockMedications.length > 0 || expiringMedications.length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {lowStockMedications.length > 0 && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="p-4 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="font-medium text-amber-800">
                        {lowStockMedications.length} medications are low on stock
                      </span>
                      <span className="text-amber-600 ml-2">
                        ({lowStockMedications.slice(0, 3).map(m => m.name).join(', ')}
                        {lowStockMedications.length > 3 && '...'})
                      </span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setActiveTab("alerts")}>
                      View All
                    </Button>
                  </CardContent>
                </Card>
              )}
              {expiringMedications.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="font-medium text-red-800">
                        {expiringMedications.length} medications expiring within 90 days
                      </span>
                      <span className="text-red-600 ml-2">
                        ({expiredMedications.length} already expired)
                      </span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setActiveTab("alerts")}>
                      View All
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex gap-4">
            {[
              { id: "inventory", label: "Inventory", icon: Package },
              { id: "prescriptions", label: "Prescriptions", icon: FileText },
              { id: "alerts", label: "Alerts", icon: AlertCircle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.id === "alerts" && (lowStockMedications.length + expiringMedications.length) > 0 && (
                  <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-xs">
                    {lowStockMedications.length + expiringMedications.length}
                  </Badge>
                )}
                {tab.id === "prescriptions" && pendingPrescriptions.length > 0 && (
                  <Badge variant="info" className="ml-1 px-1.5 py-0 text-xs">
                    {pendingPrescriptions.length}
                  </Badge>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Search by name, generic name, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[200px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {medicationCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Inventory Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/30 text-muted-foreground border-b border-border">
                        <tr>
                          <th className="px-4 py-3 font-medium">
                            <button onClick={() => handleSort("name")} className="flex items-center gap-1 hover:text-foreground">
                              Medication <ArrowUpDown className="w-3 h-3" />
                            </button>
                          </th>
                          <th className="px-4 py-3 font-medium">Category</th>
                          <th className="px-4 py-3 font-medium">Form/Strength</th>
                          <th className="px-4 py-3 font-medium">
                            <button onClick={() => handleSort("stock")} className="flex items-center gap-1 hover:text-foreground">
                              Stock <ArrowUpDown className="w-3 h-3" />
                            </button>
                          </th>
                          <th className="px-4 py-3 font-medium">Price</th>
                          <th className="px-4 py-3 font-medium">Expiry</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredMedications.map((med) => {
                          const stockStatus = getStockStatus(med);
                          const daysUntilExpiry = getDaysUntilExpiry(med.expiryDate);
                          
                          return (
                            <tr
                              key={med.id}
                              className={`hover:bg-muted/30 transition-colors ${
                                stockStatus.variant === "destructive" ? "bg-destructive/5" : ""
                              }`}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="p-2 rounded-lg bg-primary/10">
                                    <Pill className="w-4 h-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground">{med.name}</p>
                                    <p className="text-xs text-muted-foreground">{med.genericName}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant="secondary">{med.category}</Badge>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-muted-foreground">{med.form}</span>
                                <span className="text-xs text-muted-foreground ml-1">({med.strength})</span>
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <span className={`font-medium ${
                                    stockStatus.variant === "destructive" ? "text-destructive" : 
                                    stockStatus.variant === "warning" ? "text-amber-600" : "text-foreground"
                                  }`}>
                                    {med.stock} {med.unit}
                                  </span>
                                  <p className="text-xs text-muted-foreground">
                                    Min: {med.minStock} | Reorder: {med.reorderLevel}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-3 font-medium">
                                ${med.price.toFixed(2)}
                              </td>
                              <td className="px-4 py-3">
                                <span className={daysUntilExpiry <= 30 ? "text-destructive font-medium" : ""}>
                                  {new Date(med.expiryDate).toLocaleDateString()}
                                </span>
                                {daysUntilExpiry <= 90 && daysUntilExpiry > 0 && (
                                  <p className="text-xs text-amber-600">{daysUntilExpiry} days left</p>
                                )}
                                {daysUntilExpiry <= 0 && (
                                  <p className="text-xs text-destructive">Expired</p>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => { setSelectedMedication(med); setIsDetailsDialogOpen(true); }}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openEditMedicationDialog(med)}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {med.stock <= med.reorderLevel && (
                                      <DropdownMenuItem onClick={() => { setSelectedMedication(med); setIsReorderDialogOpen(true); }}>
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        Reorder
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteMedication(med.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {filteredMedications.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                      No medications found.
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Prescriptions Tab */}
          {activeTab === "prescriptions" && (
            <motion.div
              key="prescriptions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Prescription Queue</CardTitle>
                  <CardDescription>
                    View and dispense pending prescriptions
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/30 text-muted-foreground border-b border-border">
                        <tr>
                          <th className="px-4 py-3 font-medium">Rx #</th>
                          <th className="px-4 py-3 font-medium">Patient</th>
                          <th className="px-4 py-3 font-medium">Doctor</th>
                          <th className="px-4 py-3 font-medium">Date</th>
                          <th className="px-4 py-3 font-medium">Items</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {prescriptions.map((rx) => (
                          <tr key={rx.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">
                              {rx.id.substring(0, 10)}
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium">{rx.patientName}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {rx.doctorName}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {new Date(rx.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="secondary">{rx.items.length} items</Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant={
                                  rx.status === "Dispensed" ? "success" :
                                  rx.status === "Partially Dispensed" ? "warning" :
                                  rx.status === "Cancelled" ? "destructive" : "info"
                                }
                              >
                                {rx.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => { setSelectedPrescription(rx); setIsPrescriptionDialogOpen(true); }}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {rx.status !== "Dispensed" && rx.status !== "Cancelled" && (
                                    <>
                                      <DropdownMenuItem onClick={() => { setSelectedPrescription(rx); setIsPrescriptionDialogOpen(true); }}>
                                        <Check className="w-4 h-4 mr-2" />
                                        Dispense
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={async () => {
                                        setSelectedPrescription(rx);
                                        const interactions = await checkDrugInteractions(rx.items[0]?.medicationId || "");
                                        setDetectedInteractions(interactions);
                                        setIsInteractionsDialogOpen(true);
                                      }}>
                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                        Check Interactions
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
                  {prescriptions.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                      No prescriptions found.
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Alerts Tab */}
          {activeTab === "alerts" && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Low Stock Alerts */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <CardTitle>Low Stock Medications</CardTitle>
                    <Badge variant="warning">{lowStockMedications.length}</Badge>
                  </div>
                  <CardDescription>
                    Medications that need to be reordered
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left text-sm">
                      <tbody className="divide-y divide-border">
                        {lowStockMedications.map((med) => (
                          <tr key={med.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Pill className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{med.name}</p>
                                  <p className="text-xs text-muted-foreground">{med.category}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-destructive font-medium">
                                {med.stock} / {med.reorderLevel}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button size="sm" onClick={() => { setSelectedMedication(med); setIsReorderDialogOpen(true); }}>
                                <ShoppingCart className="w-3 h-3 mr-1" />
                                Reorder
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {lowStockMedications.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      No low stock medications
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expiring Medications */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-red-600" />
                    <CardTitle>Expiring Medications</CardTitle>
                    <Badge variant="destructive">{expiringMedications.length}</Badge>
                  </div>
                  <CardDescription>
                    Medications expiring within 90 days
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left text-sm">
                      <tbody className="divide-y divide-border">
                        {expiringMedications
                          .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
                          .map((med) => {
                            const days = getDaysUntilExpiry(med.expiryDate);
                            return (
                              <tr key={med.id} className={`hover:bg-muted/30 ${days <= 0 ? "bg-destructive/10" : ""}`}>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <Pill className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                      <p className="font-medium">{med.name}</p>
                                      <p className="text-xs text-muted-foreground">Batch: {med.batchNumber || "N/A"}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={days <= 30 ? "text-destructive font-medium" : "text-amber-600"}>
                                    {new Date(med.expiryDate).toLocaleDateString()}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <Badge variant={days <= 0 ? "destructive" : days <= 30 ? "warning" : "info"}>
                                    {days <= 0 ? "Expired" : `${days} days`}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                  {med.stock} units
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                  {expiringMedications.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      No expiring medications
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Medication Form Dialog */}
        <Dialog open={isMedicationDialogOpen} onOpenChange={setIsMedicationDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMedication ? "Edit Medication" : "Add New Medication"}
              </DialogTitle>
              <DialogDescription>
                Enter the medication details below
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleMedicationSubmit}>
              <div className="grid gap-4 py-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={medicationForm.name}
                      onChange={(e) => setMedicationForm({ ...medicationForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genericName">Generic Name *</Label>
                    <Input
                      id="genericName"
                      value={medicationForm.genericName}
                      onChange={(e) => setMedicationForm({ ...medicationForm, genericName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brandName">Brand Name</Label>
                    <Input
                      id="brandName"
                      value={medicationForm.brandName}
                      onChange={(e) => setMedicationForm({ ...medicationForm, brandName: e.target.value })}
                    />
                  </div>
                </div>

                {/* Category & Form */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={medicationForm.category}
                      onValueChange={(value) => setMedicationForm({ ...medicationForm, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {medicationCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="form">Form *</Label>
                    <Select
                      value={medicationForm.form}
                      onValueChange={(value: typeof medicationForm.form) => setMedicationForm({ ...medicationForm, form: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {medicationForms.map(form => (
                          <SelectItem key={form} value={form}>{form}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="strength">Strength *</Label>
                    <Input
                      id="strength"
                      value={medicationForm.strength}
                      onChange={(e) => setMedicationForm({ ...medicationForm, strength: e.target.value })}
                      placeholder="e.g., 500mg"
                      required
                    />
                  </div>
                </div>

                {/* Stock Info */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock *</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={medicationForm.stock}
                      onChange={(e) => setMedicationForm({ ...medicationForm, stock: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <Input
                      id="unit"
                      value={medicationForm.unit}
                      onChange={(e) => setMedicationForm({ ...medicationForm, unit: e.target.value })}
                      placeholder="tablet, vial, etc."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minStock">Min Stock *</Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={medicationForm.minStock}
                      onChange={(e) => setMedicationForm({ ...medicationForm, minStock: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reorderLevel">Reorder Level *</Label>
                    <Input
                      id="reorderLevel"
                      type="number"
                      value={medicationForm.reorderLevel}
                      onChange={(e) => setMedicationForm({ ...medicationForm, reorderLevel: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={medicationForm.price}
                      onChange={(e) => setMedicationForm({ ...medicationForm, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costPrice">Cost Price ($)</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      step="0.01"
                      value={medicationForm.costPrice}
                      onChange={(e) => setMedicationForm({ ...medicationForm, costPrice: e.target.value })}
                    />
                  </div>
                </div>

                {/* Manufacturer & Supplier */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manufacturer">Manufacturer *</Label>
                    <Input
                      id="manufacturer"
                      value={medicationForm.manufacturer}
                      onChange={(e) => setMedicationForm({ ...medicationForm, manufacturer: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplierName">Supplier</Label>
                    <Input
                      id="supplierName"
                      value={medicationForm.supplierName}
                      onChange={(e) => setMedicationForm({ ...medicationForm, supplierName: e.target.value })}
                    />
                  </div>
                </div>

                {/* Expiry & Batch */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date *</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={medicationForm.expiryDate}
                      onChange={(e) => setMedicationForm({ ...medicationForm, expiryDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="batchNumber">Batch Number</Label>
                    <Input
                      id="batchNumber"
                      value={medicationForm.batchNumber}
                      onChange={(e) => setMedicationForm({ ...medicationForm, batchNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location/Shelf</Label>
                    <Input
                      id="location"
                      value={medicationForm.location}
                      onChange={(e) => setMedicationForm({ ...medicationForm, location: e.target.value })}
                      placeholder="e.g., A-12"
                    />
                  </div>
                </div>

                {/* Storage & Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="storageConditions">Storage Conditions</Label>
                  <Input
                    id="storageConditions"
                    value={medicationForm.storageConditions}
                    onChange={(e) => setMedicationForm({ ...medicationForm, storageConditions: e.target.value })}
                    placeholder="e.g., Store at room temperature, protect from light"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dosageInstructions">Dosage Instructions</Label>
                  <Input
                    id="dosageInstructions"
                    value={medicationForm.dosageInstructions}
                    onChange={(e) => setMedicationForm({ ...medicationForm, dosageInstructions: e.target.value })}
                    placeholder="e.g., Take with food"
                  />
                </div>

                {/* Side Effects & Contraindications */}
                <div className="space-y-2">
                  <Label htmlFor="sideEffects">Side Effects (comma-separated)</Label>
                  <Input
                    id="sideEffects"
                    value={medicationForm.sideEffects}
                    onChange={(e) => setMedicationForm({ ...medicationForm, sideEffects: e.target.value })}
                    placeholder="e.g., Nausea, Headache, Dizziness"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contraindications">Contraindications (comma-separated)</Label>
                  <Input
                    id="contraindications"
                    value={medicationForm.contraindications}
                    onChange={(e) => setMedicationForm({ ...medicationForm, contraindications: e.target.value })}
                    placeholder="e.g., Pregnancy, Liver disease"
                  />
                </div>

                {/* Checkboxes */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={medicationForm.requiresPrescription}
                      onChange={(e) => setMedicationForm({ ...medicationForm, requiresPrescription: e.target.checked })}
                      className="rounded border-input"
                    />
                    <span className="text-sm">Requires Prescription</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={medicationForm.controlledSubstance}
                      onChange={(e) => setMedicationForm({ ...medicationForm, controlledSubstance: e.target.checked })}
                      className="rounded border-input"
                    />
                    <span className="text-sm">Controlled Substance</span>
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetMedicationForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingMedication ? "Update" : "Add"} Medication
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Medication Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" />
                Medication Details
              </DialogTitle>
            </DialogHeader>
            {selectedMedication && (
              <div className="space-y-6 py-4">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Pill className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{selectedMedication.name}</h3>
                    <p className="text-muted-foreground">{selectedMedication.genericName}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge>{selectedMedication.category}</Badge>
                      <Badge variant="secondary">{selectedMedication.form}</Badge>
                      {selectedMedication.requiresPrescription && (
                        <Badge variant="info">Rx Required</Badge>
                      )}
                      {selectedMedication.controlledSubstance && (
                        <Badge variant="destructive">Controlled</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Basic Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Brand Name</p>
                      <p className="font-medium">{selectedMedication.brandName || "N/A"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Strength</p>
                      <p className="font-medium">{selectedMedication.strength}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Manufacturer</p>
                      <p className="font-medium">{selectedMedication.manufacturer}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Supplier</p>
                      <p className="font-medium">{selectedMedication.supplierName || "N/A"}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Stock Info */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Stock Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold">{selectedMedication.stock}</p>
                        <p className="text-sm text-muted-foreground">Current Stock</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-amber-600">{selectedMedication.reorderLevel}</p>
                        <p className="text-sm text-muted-foreground">Reorder Level</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{selectedMedication.minStock}</p>
                        <p className="text-sm text-muted-foreground">Min Stock</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Restocked:</span>
                      <span>{new Date(selectedMedication.lastRestocked).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Pricing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold">${selectedMedication.price.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Selling Price</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">${(selectedMedication.costPrice || 0).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Cost Price</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Expiry & Storage */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Storage & Expiry
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expiry Date:</span>
                      <span className={getDaysUntilExpiry(selectedMedication.expiryDate) <= 90 ? "text-destructive font-medium" : ""}>
                        {new Date(selectedMedication.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Batch Number:</span>
                      <span>{selectedMedication.batchNumber || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span>{selectedMedication.location || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Storage Conditions:</span>
                      <span>{selectedMedication.storageConditions || "Standard storage"}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Side Effects */}
                {selectedMedication.sideEffects && selectedMedication.sideEffects.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Side Effects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedMedication.sideEffects.map((effect, i) => (
                          <Badge key={i} variant="secondary">{effect}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Contraindications */}
                {selectedMedication.contraindications && selectedMedication.contraindications.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Contraindications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedMedication.contraindications.map((contra, i) => (
                          <Badge key={i} variant="warning">{contra}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Drug Interactions */}
                {selectedMedication.drugInteractions && selectedMedication.drugInteractions.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Drug Interactions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedMedication.drugInteractions.map((interaction, i) => (
                        <div key={i} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{interaction.drugName}</span>
                            <Badge variant={
                              interaction.severity === "Severe" ? "destructive" :
                              interaction.severity === "Moderate" ? "warning" : "secondary"
                            }>
                              {interaction.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{interaction.description}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Dosage Instructions */}
                {selectedMedication.dosageInstructions && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Dosage Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedMedication.dosageInstructions}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => { setIsDetailsDialogOpen(false); openEditMedicationDialog(selectedMedication!); }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Prescription Details/Dispense Dialog */}
        <Dialog open={isPrescriptionDialogOpen} onOpenChange={setIsPrescriptionDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Prescription Details
              </DialogTitle>
            </DialogHeader>
            {selectedPrescription && (
              <div className="space-y-4 py-4">
                {/* Patient & Doctor Info */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Patient</p>
                      <p className="font-medium text-lg">{selectedPrescription.patientName}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Prescriber</p>
                      <p className="font-medium text-lg">{selectedPrescription.doctorName}</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-muted-foreground">Date: </span>
                    <span>{new Date(selectedPrescription.date).toLocaleDateString()}</span>
                  </div>
                  <Badge variant={
                    selectedPrescription.status === "Dispensed" ? "success" :
                    selectedPrescription.status === "Partially Dispensed" ? "warning" : "info"
                  }>
                    {selectedPrescription.status}
                  </Badge>
                </div>

                {selectedPrescription.diagnosis && (
                  <div className="p-3 bg-muted rounded-lg">
                    <span className="text-sm text-muted-foreground">Diagnosis: </span>
                    <span className="font-medium">{selectedPrescription.diagnosis}</span>
                  </div>
                )}

                {/* Prescription Items */}
                <div className="space-y-3">
                  <h4 className="font-medium">Prescribed Items</h4>
                  {selectedPrescription.items.map((item) => {
                    const medication = medications.find(m => m.id === item.medicationId);
                    const stockStatus = medication ? getStockStatus(medication) : null;
                    
                    return (
                      <Card key={item.id} className={item.isDispensed ? "opacity-60" : ""}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{item.medicationName}</span>
                                {item.isDispensed && (
                                  <Badge variant="success" className="text-xs">
                                    <Check className="w-3 h-3 mr-1" />
                                    Dispensed
                                  </Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <span>Dosage: {item.dosage}</span>
                                <span>Frequency: {item.frequency}</span>
                                <span>Duration: {item.duration}</span>
                                <span>Qty: {item.quantity}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">
                                Instructions: {item.instructions}
                              </p>
                              {medication && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant={stockStatus?.variant || "secondary"}>
                                    Stock: {medication.stock} {medication.unit}
                                  </Badge>
                                  <span className="text-sm">Price: ${item.price.toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                            {!item.isDispensed && selectedPrescription.status !== "Cancelled" && (
                              <Button
                                size="sm"
                                disabled={!medication || medication.stock < item.quantity}
                                onClick={() => {
                                  setDispensingItem(item);
                                  setDispenseQuantity(item.quantity);
                                  setIsDispenseDialogOpen(true);
                                }}
                              >
                                Dispense
                              </Button>
                            )}
                          </div>
                          {item.dispensedQuantity > 0 && !item.isDispensed && (
                            <div className="mt-2 pt-2 border-t text-sm text-muted-foreground">
                              Already dispensed: {item.dispensedQuantity} of {item.quantity}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-medium">Total Value:</span>
                  <span className="text-xl font-bold">
                    ${selectedPrescription.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPrescriptionDialogOpen(false)}>
                Close
              </Button>
              {selectedPrescription?.status !== "Dispensed" && selectedPrescription?.status !== "Cancelled" && (
                <Button onClick={async () => {
                  if (selectedPrescription) {
                    const interactions = await checkDrugInteractions(selectedPrescription.items[0]?.medicationId || "");
                    setDetectedInteractions(interactions);
                    setIsInteractionsDialogOpen(true);
                  }
                }}>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Check Interactions
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dispense Confirmation Dialog */}
        <Dialog open={isDispenseDialogOpen} onOpenChange={setIsDispenseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dispense Medication</DialogTitle>
              <DialogDescription>
                Confirm dispensing details
              </DialogDescription>
            </DialogHeader>
            {dispensingItem && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <p><span className="text-muted-foreground">Medication:</span> <span className="font-medium">{dispensingItem.medicationName}</span></p>
                  <p><span className="text-muted-foreground">Prescribed Qty:</span> {dispensingItem.quantity}</p>
                  <p><span className="text-muted-foreground">Dosage:</span> {dispensingItem.dosage}</p>
                  <p><span className="text-muted-foreground">Instructions:</span> {dispensingItem.instructions}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dispenseQty">Quantity to Dispense</Label>
                  <Input
                    id="dispenseQty"
                    type="number"
                    value={dispenseQuantity}
                    onChange={(e) => setDispenseQuantity(parseInt(e.target.value) || 0)}
                    max={dispensingItem.quantity}
                    min={1}
                  />
                  <p className="text-sm text-muted-foreground">
                    Prescribed: {dispensingItem.quantity} | Remaining: {dispensingItem.quantity - dispensingItem.dispensedQuantity}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsDispenseDialogOpen(false); setDispensingItem(null); }}>
                Cancel
              </Button>
              <Button onClick={() => { setIsDispenseDialogOpen(false); setIsLabelDialogOpen(true); }}>
                <Printer className="w-4 h-4 mr-2" />
                Dispense & Print Label
              </Button>
              <Button onClick={handleDispenseItem}>
                <Check className="w-4 h-4 mr-2" />
                Dispense Only
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Drug Interactions Dialog */}
        <Dialog open={isInteractionsDialogOpen} onOpenChange={setIsInteractionsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {checkingInteractions ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : detectedInteractions.length > 0 ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                ) : (
                  <Check className="w-5 h-5 text-green-600" />
                )}
                Drug Interaction Check
              </DialogTitle>
            </DialogHeader>
            {checkingInteractions ? (
              <div className="py-8 text-center text-muted-foreground">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p>Checking for potential drug interactions...</p>
              </div>
            ) : detectedInteractions.length > 0 ? (
              <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">
                  The following potential interactions were detected:
                </p>
                {detectedInteractions.map((interaction, i) => (
                  <Card key={i} className={
                    interaction.severity === "Severe" ? "border-destructive bg-destructive/5" :
                    interaction.severity === "Moderate" ? "border-amber-300 bg-amber-50" : ""
                  }>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{interaction.drugName}</span>
                        <Badge variant={
                          interaction.severity === "Severe" ? "destructive" :
                          interaction.severity === "Moderate" ? "warning" : "secondary"
                        }>
                          {interaction.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{interaction.description}</p>
                    </CardContent>
                  </Card>
                ))}
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <Info className="w-4 h-4 inline mr-2" />
                  Please consult with the prescribing physician before dispensing if there are moderate or severe interactions.
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Check className="w-12 h-12 mx-auto mb-2 text-green-600" />
                <p className="font-medium text-green-600">No Interactions Detected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This prescription appears to be safe to dispense.
                </p>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsInteractionsDialogOpen(false)}>
                Close
              </Button>
              {detectedInteractions.length > 0 && !checkingInteractions && (
                <Button onClick={() => { setIsInteractionsDialogOpen(false); setIsPrescriptionDialogOpen(true); }}>
                  Proceed Anyway
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Print Label Dialog */}
        <Dialog open={isLabelDialogOpen} onOpenChange={setIsLabelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Print Prescription Label</DialogTitle>
            </DialogHeader>
            {selectedPrescription && dispensingItem && (
              <div ref={labelRef} className="border rounded-lg p-6 space-y-4 bg-white">
                <div className="text-center border-b pb-3">
                  <p className="font-bold text-lg">HospitalHub Medical Center</p>
                  <p className="text-xs text-gray-600">123 Medical Center Drive, Healthcare City</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-600">Patient:</span> <span className="font-medium">{selectedPrescription.patientName}</span></div>
                  <div><span className="text-gray-600">Date:</span> {new Date(selectedPrescription.date).toLocaleDateString()}</div>
                  <div><span className="text-gray-600">Prescriber:</span> {selectedPrescription.doctorName}</div>
                  <div><span className="text-gray-600">Qty:</span> {dispenseQuantity}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="font-bold text-lg">{dispensingItem.medicationName}</p>
                  <p className="text-sm">{dispensingItem.dosage} - {dispensingItem.frequency}</p>
                  <p className="text-sm text-gray-600">{dispensingItem.instructions}</p>
                </div>
                <p className="text-xs text-center text-gray-500 border-t pt-3">
                  Keep out of reach of children. Take as directed.
                </p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLabelDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePrintLabel}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reorder Dialog */}
        <Dialog open={isReorderDialogOpen} onOpenChange={setIsReorderDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reorder Medication</DialogTitle>
              <DialogDescription>
                Confirm reorder for low stock medication
              </DialogDescription>
            </DialogHeader>
            {selectedMedication && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <p><span className="text-muted-foreground">Medication:</span> <span className="font-medium">{selectedMedication.name}</span></p>
                  <p><span className="text-muted-foreground">Current Stock:</span> <span className="text-destructive font-medium">{selectedMedication.stock}</span></p>
                  <p><span className="text-muted-foreground">Reorder Level:</span> {selectedMedication.reorderLevel}</p>
                  <p><span className="text-muted-foreground">Supplier:</span> {selectedMedication.supplierName || "Primary Supplier"}</p>
                </div>
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="font-medium">Order Quantity: {selectedMedication.reorderLevel * 3}</p>
                  <p className="text-sm text-muted-foreground">
                    Estimated new stock level after reorder: {selectedMedication.stock + selectedMedication.reorderLevel * 3}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsReorderDialogOpen(false); setSelectedMedication(null); }}>
                Cancel
              </Button>
              <Button onClick={() => handleReorder(selectedMedication!)}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Confirm Reorder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
