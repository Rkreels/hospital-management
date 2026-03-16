"use client";

import React, { useState, useEffect } from "react";
import { db } from '../lib/store';
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Eye,
  Pill,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
} from "lucide-react";
import Layout from "../components/Layout";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useRole } from '../context/RoleContext';
import { toast } from "react-toastify";

interface PrescriptionItem {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
  refills: number;
  refillsRemaining: number;
}

interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  items: PrescriptionItem[];
  status: "Pending" | "Dispensed" | "Partially Dispensed" | "Cancelled";
  dispensedBy?: string;
  dispensedAt?: string;
  notes?: string;
  validUntil: string;
}

interface Patient {
  id: string;
  name: string;
  mrn: string;
}

interface Medication {
  id: string;
  name: string;
  genericName: string;
  strength: string;
  category: string;
  price: number;
  stock: number;
}

const frequencies = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Four times daily",
  "Every 4 hours",
  "Every 6 hours",
  "Every 8 hours",
  "Every 12 hours",
  "As needed",
  "Before meals",
  "After meals",
  "At bedtime",
];

const durations = [
  "3 days",
  "5 days",
  "7 days",
  "10 days",
  "14 days",
  "21 days",
  "28 days",
  "30 days",
  "60 days",
  "90 days",
  "As needed",
];

export default function PrescriptionsPage() {
  const { hasPermission, _currentRole } = useRole();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingPrescription, setViewingPrescription] = useState<Prescription | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [prescriptionItems, setPrescriptionItems] = useState<Partial<PrescriptionItem>[]>([
    { medicationId: "", medicationName: "", dosage: "", frequency: "", duration: "", quantity: 1, instructions: "", refills: 0 },
  ]);

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
    fetchMedications();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const data = db.getPrescription();
      setPrescriptions(data);
    } catch {
      toast.error("Failed to fetch prescriptions");
    }
  };

  const fetchPatients = async () => {
    try {
      const data = db.getPatient();
      setPatients(data.slice(0, 100));
    } catch {
      // Silent fail
    }
  };

  const fetchMedications = async () => {
    try {
      const data = db.getPharmacy();
      setMedications(data.filter((m: Medication) => m.stock > 0));
    } catch {
      // Silent fail
    }
  };

  const handleAddMedicationItem = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      { medicationId: "", medicationName: "", dosage: "", frequency: "", duration: "", quantity: 1, instructions: "", refills: 0 },
    ]);
  };

  const handleRemoveMedicationItem = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const handleMedicationSelect = (index: number, medicationId: string) => {
    const med = medications.find((m) => m.id === medicationId);
    if (med) {
      const newItems = [...prescriptionItems];
      newItems[index] = {
        ...newItems[index],
        medicationId: med.id,
        medicationName: med.name,
        dosage: med.strength,
      };
      setPrescriptionItems(newItems);
    }
  };

  const updateMedicationItem = (index: number, field: string, value: string | number) => {
    const newItems = [...prescriptionItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setPrescriptionItems(newItems);
  };

  // Check for drug interactions
  const checkInteractions = (): string[] => {
    const interactions: string[] = [];
    const selectedMeds = prescriptionItems.filter((item) => item.medicationName);
    
    // Simple interaction check - in real app, this would query a drug database
    const knownInteractions: Record<string, string[]> = {
      "Warfarin": ["Aspirin", "Ibuprofen", "Amoxicillin"],
      "Metformin": ["Furosemide"],
      "Digoxin": ["Furosemide", "Amiodarone"],
      "Lisinopril": ["Potassium supplements"],
    };

    selectedMeds.forEach((med1, i) => {
      selectedMeds.forEach((med2, j) => {
        if (i < j && med1.medicationName && med2.medicationName) {
          const name1 = med1.medicationName.split(" ")[0];
          const name2 = med2.medicationName.split(" ")[0];
          
          if (knownInteractions[name1]?.includes(name2) || knownInteractions[name2]?.includes(name1)) {
            interactions.push(`Potential interaction between ${med1.medicationName} and ${med2.medicationName}`);
          }
        }
      });
    });

    return interactions;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const interactions = checkInteractions();
    if (interactions.length > 0) {
      const proceed = confirm(`Warning: ${interactions.join("\n")}\n\nDo you want to proceed anyway?`);
      if (!proceed) return;
    }

    const validItems = prescriptionItems.filter((item) => item.medicationId && item.frequency);
    if (!selectedPatient || validItems.length === 0) {
      toast.error("Please select a patient and add at least one medication");
      return;
    }

    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient,
          diagnosis,
          notes,
          items: validItems.map((item) => ({
            ...item,
            id: `PI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            refillsRemaining: item.refills || 0,
          })),
          date: new Date().toISOString().split("T")[0],
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        }),
      });

      if (res.ok) {
        toast.success("Prescription created successfully");
        setIsDialogOpen(false);
        resetForm();
        fetchPrescriptions();
      } else {
        toast.error("Failed to create prescription");
      }
    } catch {
      toast.error("Failed to create prescription");
    }
  };

  const handleDispense = async (id: string) => {
    try {
      const res = await fetch("/api/prescriptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Dispensed", dispensedAt: new Date().toISOString() }),
      });

      if (res.ok) {
        toast.success("Prescription dispensed successfully");
        fetchPrescriptions();
      } else {
        toast.error("Failed to dispense prescription");
      }
    } catch {
      toast.error("Failed to dispense prescription");
    }
  };

  const resetForm = () => {
    setSelectedPatient("");
    setDiagnosis("");
    setNotes("");
    setPrescriptionItems([
      { medicationId: "", medicationName: "", dosage: "", frequency: "", duration: "", quantity: 1, instructions: "", refills: 0 },
    ]);
  };

  const filteredPrescriptions = prescriptions.filter((p) => {
    const matchesSearch =
      p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.prescriptionNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Dispensed":
        return "bg-green-100 text-green-700 border-green-200";
      case "Pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Partially Dispensed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const summary = {
    total: prescriptions.length,
    pending: prescriptions.filter((p) => p.status === "Pending").length,
    dispensed: prescriptions.filter((p) => p.status === "Dispensed").length,
    today: prescriptions.filter((p) => p.date === new Date().toISOString().split("T")[0]).length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Prescriptions</h1>
            <p className="text-muted-foreground mt-1">Manage patient prescriptions and medications</p>
          </div>
          {hasPermission("canCreatePrescriptions") && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Prescription
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Prescription</DialogTitle>
                  <DialogDescription>Fill in the prescription details below</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Patient *</Label>
                        <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                          <SelectContent>
                            {patients.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} ({p.mrn})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Diagnosis</Label>
                        <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Primary diagnosis" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Medications *</Label>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddMedicationItem}>
                          <Plus className="w-4 h-4 mr-1" /> Add Medication
                        </Button>
                      </div>

                      {prescriptionItems.map((item, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Medication #{index + 1}</span>
                            {prescriptionItems.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMedicationItem(index)}
                                className="text-red-500"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Medication</Label>
                              <Select
                                value={item.medicationId || ""}
                                onValueChange={(value) => handleMedicationSelect(index, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select medication" />
                                </SelectTrigger>
                                <SelectContent>
                                  {medications.map((m) => (
                                    <SelectItem key={m.id} value={m.id}>
                                      {m.name} ({m.strength}) - ${m.price}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Dosage</Label>
                              <Input
                                value={item.dosage || ""}
                                onChange={(e) => updateMedicationItem(index, "dosage", e.target.value)}
                                placeholder="e.g., 500mg"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Frequency</Label>
                              <Select
                                value={item.frequency || ""}
                                onValueChange={(value) => updateMedicationItem(index, "frequency", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  {frequencies.map((f) => (
                                    <SelectItem key={f} value={f}>
                                      {f}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Duration</Label>
                              <Select
                                value={item.duration || ""}
                                onValueChange={(value) => updateMedicationItem(index, "duration", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  {durations.map((d) => (
                                    <SelectItem key={d} value={d}>
                                      {d}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Quantity</Label>
                              <Input
                                type="number"
                                min={1}
                                value={item.quantity || 1}
                                onChange={(e) => updateMedicationItem(index, "quantity", parseInt(e.target.value))}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Refills</Label>
                              <Input
                                type="number"
                                min={0}
                                max={11}
                                value={item.refills || 0}
                                onChange={(e) => updateMedicationItem(index, "refills", parseInt(e.target.value))}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Instructions</Label>
                            <Input
                              value={item.instructions || ""}
                              onChange={(e) => updateMedicationItem(index, "instructions", e.target.value)}
                              placeholder="e.g., Take with food"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes" />
                    </div>

                    {checkInteractions().length > 0 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700 font-medium mb-1">
                          <AlertTriangle className="w-4 h-4" />
                          Drug Interactions Warning
                        </div>
                        <ul className="text-sm text-red-600 list-disc list-inside">
                          {checkInteractions().map((interaction, i) => (
                            <li key={i}>{interaction}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Prescription</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{summary.total}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{summary.pending}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dispensed</p>
                <p className="text-2xl font-bold">{summary.dispensed}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-bold">{summary.today}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search prescriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Dispensed">Dispensed</SelectItem>
              <SelectItem value="Partially Dispensed">Partially Dispensed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Prescriptions List */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/30 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-medium">Rx Number</th>
                      <th className="px-6 py-4 font-medium">Patient</th>
                      <th className="px-6 py-4 font-medium">Doctor</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium">Medications</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredPrescriptions.map((rx) => (
                      <tr key={rx.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium">{rx.prescriptionNumber}</td>
                        <td className="px-6 py-4">{rx.patientName}</td>
                        <td className="px-6 py-4">{rx.doctorName}</td>
                        <td className="px-6 py-4">{rx.date}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            {rx.items.length} item{rx.items.length > 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={getStatusColor(rx.status)}>
                            {rx.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setViewingPrescription(rx)}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            {hasPermission("canDispenseMedication") && rx.status === "Pending" && (
                              <Button variant="outline" size="sm" onClick={() => handleDispense(rx.id)}>
                                <Pill className="w-4 h-4 mr-1" />
                                Dispense
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredPrescriptions.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">No prescriptions found.</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* View Prescription Dialog */}
        <Dialog open={!!viewingPrescription} onOpenChange={() => setViewingPrescription(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Prescription Details</DialogTitle>
            </DialogHeader>
            {viewingPrescription && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Rx Number</p>
                    <p className="font-medium">{viewingPrescription.prescriptionNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{viewingPrescription.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Patient</p>
                    <p className="font-medium">{viewingPrescription.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prescriber</p>
                    <p className="font-medium">{viewingPrescription.doctorName}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Diagnosis</p>
                    <p className="font-medium">{viewingPrescription.diagnosis || "Not specified"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Medications</p>
                  <div className="space-y-2">
                    {viewingPrescription.items.map((item, i) => (
                      <div key={i} className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{item.medicationName}</p>
                          <Badge variant="outline">{item.quantity} units</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.dosage} • {item.frequency} • {item.duration}
                        </p>
                        {item.instructions && <p className="text-sm text-muted-foreground mt-1">{item.instructions}</p>}
                        <p className="text-xs text-muted-foreground mt-1">Refills remaining: {item.refillsRemaining}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <Badge variant="outline" className={getStatusColor(viewingPrescription.status)}>
                    {viewingPrescription.status}
                  </Badge>
                  <p className="text-sm text-muted-foreground">Valid until: {viewingPrescription.validUntil}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
