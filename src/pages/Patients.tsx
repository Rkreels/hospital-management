"use client";

import React, { useState, useEffect, useMemo } from "react";
import { db } from '../lib/store';
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MoreVertical, Edit, Trash2, Eye, UserPlus,
  Phone, Mail, MapPin, Calendar, Droplets, AlertTriangle,
  Pill, Activity, FileText, X,
  Stethoscope, Building2, CreditCard, User, HeartPulse,
  Plus, FileSpreadsheet, Syringe, History,
  ClipboardList
} from "lucide-react";
import Layout from "../components/Layout";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
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
import { toast } from "react-toastify";
import { useRole } from '../context/RoleContext';
import type { 
  Patient, 
  PatientStatus, 
  Gender, 
  VitalSigns,
  Allergy,
  PatientMedication,
  EmergencyContact
} from "../types";

// Status configuration
const statusConfig: Record<PatientStatus, { color: string; bgColor: string; borderColor: string }> = {
  Stable: { color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-200" },
  Critical: { color: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200" },
  "Under Observation": { color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
  Recovering: { color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  Discharged: { color: "text-gray-700", bgColor: "bg-gray-50", borderColor: "border-gray-200" },
  Outpatient: { color: "text-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
};

const severityConfig: Record<string, { color: string; bgColor: string; borderColor: string }> = {
  Mild: { color: "text-yellow-700", bgColor: "bg-yellow-100", borderColor: "border-yellow-300" },
  Moderate: { color: "text-orange-700", bgColor: "bg-orange-100", borderColor: "border-orange-300" },
  Severe: { color: "text-red-700", bgColor: "bg-red-100", borderColor: "border-red-300" },
  "Life-threatening": { color: "text-red-900", bgColor: "bg-red-200", borderColor: "border-red-400" },
};

const medicationStatusConfig: Record<string, { color: string; bgColor: string }> = {
  Active: { color: "text-green-700", bgColor: "bg-green-100" },
  Completed: { color: "text-blue-700", bgColor: "bg-blue-100" },
  Discontinued: { color: "text-gray-700", bgColor: "bg-gray-100" },
};

// Initial form data
const initialFormData = {
  name: "",
  age: "",
  gender: "Male" as Gender,
  dateOfBirth: "",
  bloodGroup: "",
  phone: "",
  email: "",
  address: "",
  ward: "",
  roomNumber: "",
  bedNumber: "",
  status: "Stable" as PatientStatus,
  primaryDiagnosis: "",
  notes: "",
  emergencyContactName: "",
  emergencyContactRelationship: "",
  emergencyContactPhone: "",
  insuranceProvider: "",
  insurancePolicyNumber: "",
  insuranceHolderName: "",
};

const initialVitalForm = {
  bloodPressureSystolic: "",
  bloodPressureDiastolic: "",
  heartRate: "",
  temperature: "",
  respiratoryRate: "",
  oxygenSaturation: "",
  weight: "",
  notes: "",
};

const initialAllergyForm = {
  substance: "",
  severity: "Mild" as Allergy['severity'],
  reaction: "",
};

const initialMedicationForm = {
  medication: "",
  dosage: "",
  frequency: "",
  startDate: new Date().toISOString().split('T')[0],
  endDate: "",
  prescribedBy: "",
  instructions: "",
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [wardFilter, setWardFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialogs
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isVitalsDialogOpen, setIsVitalsDialogOpen] = useState(false);
  const [isAllergyDialogOpen, setIsAllergyDialogOpen] = useState(false);
  const [isMedicationDialogOpen, setIsMedicationDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Selected items
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
  
  // Forms
  const [formData, setFormData] = useState(initialFormData);
  const [vitalForm, setVitalForm] = useState(initialVitalForm);
  const [allergyForm, setAllergyForm] = useState(initialAllergyForm);
  const [medicationForm, setMedicationForm] = useState(initialMedicationForm);
  
  // Permissions using useRole hook
  const { currentUser, hasPermission } = useRole();
  const canCreate = hasPermission('canEditPatients');
  const canEdit = hasPermission('canEditPatients');
  const canDelete = hasPermission('canDeletePatients');
  const canRecordVitals = ['doctor', 'nurse'].includes(currentUser.role);
  const canManageMedications = ['doctor'].includes(currentUser.role);
  const canManageAllergies = ['doctor', 'nurse'].includes(currentUser.role);

  // Fetch patients
  useEffect(() => {
    fetchPatients();
  }, []);

  // Filter patients
  useEffect(() => {
    let result = patients;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.mrn.toLowerCase().includes(q) ||
        p.ward.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q) ||
        (p.primaryDiagnosis && p.primaryDiagnosis.toLowerCase().includes(q))
      );
    }
    
    if (statusFilter !== "all") {
      result = result.filter(p => p.status === statusFilter);
    }
    
    if (genderFilter !== "all") {
      result = result.filter(p => p.gender === genderFilter);
    }
    
    if (wardFilter !== "all") {
      result = result.filter(p => p.ward === wardFilter);
    }
    
    setFilteredPatients(result);
  }, [patients, searchQuery, statusFilter, genderFilter, wardFilter]);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const data = db.getPatient();
      setPatients(data);
      setFilteredPatients(data);
    } catch {
      toast.error("Failed to fetch patients");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatientDetails = async (id: string) => {
    try {
      const data = db.getPatients()
      return data;
    } catch {
      toast.error("Failed to fetch patient details");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const patientData = {
        ...formData,
        age: parseInt(formData.age) || 0,
        emergencyContacts: formData.emergencyContactName ? [{
          id: `EC-${Date.now()}`,
          name: formData.emergencyContactName,
          relationship: formData.emergencyContactRelationship,
          phone: formData.emergencyContactPhone,
          isPrimary: true,
        }] : [],
        insurance: formData.insuranceProvider ? {
          provider: formData.insuranceProvider,
          policyNumber: formData.insurancePolicyNumber,
          holderName: formData.insuranceHolderName,
          holderRelation: "Self",
          validFrom: new Date().toISOString().split('T')[0],
          validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          coveragePercentage: 80,
          copayAmount: 20,
        } : undefined,
        admittedDate: editingPatient?.admittedDate || new Date().toISOString().split('T')[0],
        allergies: editingPatient?.allergies || [],
        currentMedications: editingPatient?.currentMedications || [],
        vitalSigns: editingPatient?.vitalSigns || [],
        medicalHistory: editingPatient?.medicalHistory || [],
        visitHistory: editingPatient?.visitHistory || [],
        surgeryHistory: editingPatient?.surgeryHistory || [],
        immunizations: editingPatient?.immunizations || [],
      };

      if (editingPatient) {
        const res = await fetch("/api/patients", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingPatient.id, ...patientData }),
        });
        if (res.ok) {
          toast.success("Patient updated successfully");
          fetchPatients();
          resetForm();
        }
      } else {
        const res = await fetch("/api/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patientData),
        });
        if (res.ok) {
          toast.success("Patient added successfully");
          fetchPatients();
          resetForm();
        }
      }
    } catch {
      toast.error("Failed to save patient");
    }
  };

  const handleDelete = async () => {
    if (!deletingPatient) return;
    try {
      const res = await fetch("/api/patients", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletingPatient.id }),
      });
      if (res.ok) {
        toast.success("Patient deleted successfully");
        fetchPatients();
        setIsDeleteDialogOpen(false);
        setDeletingPatient(null);
      }
    } catch {
      toast.error("Failed to delete patient");
    }
  };

  const handleAddVitals = async () => {
    if (!viewingPatient) return;
    try {
      const newVital: VitalSigns = {
        bloodPressure: `${vitalForm.bloodPressureSystolic}/${vitalForm.bloodPressureDiastolic}`,
        heartRate: parseInt(vitalForm.heartRate) || 0,
        temperature: parseFloat(vitalForm.temperature) || 0,
        respiratoryRate: parseInt(vitalForm.respiratoryRate) || 0,
        oxygenSaturation: parseInt(vitalForm.oxygenSaturation) || 0,
        weight: parseFloat(vitalForm.weight) || 0,
        height: 0,
        bmi: 0,
        recordedAt: new Date().toISOString(),
        recordedBy: currentUser.name,
      };
      
      const updatedVitals = [newVital, ...(viewingPatient.vitalSigns || [])];
      const res = await fetch("/api/patients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: viewingPatient.id,
          vitalSigns: updatedVitals,
        }),
      });
      if (res.ok) {
        toast.success("Vitals recorded successfully");
        const updated = await fetchPatientDetails(viewingPatient.id);
        if (updated) setViewingPatient(updated);
        setVitalForm(initialVitalForm);
        setIsVitalsDialogOpen(false);
      }
    } catch {
      toast.error("Failed to record vitals");
    }
  };

  const handleAddAllergy = async () => {
    if (!viewingPatient || !allergyForm.substance) return;
    try {
      const newAllergy: Allergy = {
        id: `ALG-${Date.now()}`,
        substance: allergyForm.substance,
        severity: allergyForm.severity,
        reaction: allergyForm.reaction,
        diagnosedDate: new Date().toISOString().split('T')[0],
      };
      
      const updatedAllergies = [...(viewingPatient.allergies || []), newAllergy];
      const res = await fetch("/api/patients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: viewingPatient.id,
          allergies: updatedAllergies,
        }),
      });
      if (res.ok) {
        toast.success("Allergy added successfully");
        const updated = await fetchPatientDetails(viewingPatient.id);
        if (updated) setViewingPatient(updated);
        setAllergyForm(initialAllergyForm);
        setIsAllergyDialogOpen(false);
      }
    } catch {
      toast.error("Failed to add allergy");
    }
  };

  const handleRemoveAllergy = async (allergyId: string) => {
    if (!viewingPatient) return;
    try {
      const updatedAllergies = viewingPatient.allergies.filter(a => a.id !== allergyId);
      const res = await fetch("/api/patients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: viewingPatient.id,
          allergies: updatedAllergies,
        }),
      });
      if (res.ok) {
        toast.success("Allergy removed successfully");
        const updated = await fetchPatientDetails(viewingPatient.id);
        if (updated) setViewingPatient(updated);
      }
    } catch {
      toast.error("Failed to remove allergy");
    }
  };

  const handleAddMedication = async () => {
    if (!viewingPatient || !medicationForm.medication) return;
    try {
      const newMedication: PatientMedication = {
        id: `MED-${Date.now()}`,
        medication: medicationForm.medication,
        dosage: medicationForm.dosage,
        frequency: medicationForm.frequency,
        startDate: medicationForm.startDate,
        endDate: medicationForm.endDate || undefined,
        prescribedBy: medicationForm.prescribedBy || currentUser.name,
        status: 'Active',
        instructions: medicationForm.instructions,
      };
      
      const updatedMedications = [...(viewingPatient.currentMedications || []), newMedication];
      const res = await fetch("/api/patients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: viewingPatient.id,
          currentMedications: updatedMedications,
        }),
      });
      if (res.ok) {
        toast.success("Medication added successfully");
        const updated = await fetchPatientDetails(viewingPatient.id);
        if (updated) setViewingPatient(updated);
        setMedicationForm(initialMedicationForm);
        setIsMedicationDialogOpen(false);
      }
    } catch {
      toast.error("Failed to add medication");
    }
  };

  const handleDiscontinueMedication = async (medicationId: string) => {
    if (!viewingPatient) return;
    try {
      const updatedMedications = viewingPatient.currentMedications.map(m => 
        m.id === medicationId ? { ...m, status: 'Discontinued' as const, endDate: new Date().toISOString().split('T')[0] } : m
      );
      const res = await fetch("/api/patients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: viewingPatient.id,
          currentMedications: updatedMedications,
        }),
      });
      if (res.ok) {
        toast.success("Medication discontinued successfully");
        const updated = await fetchPatientDetails(viewingPatient.id);
        if (updated) setViewingPatient(updated);
      }
    } catch {
      toast.error("Failed to discontinue medication");
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingPatient(null);
    setIsFormDialogOpen(false);
  };

  const openEditDialog = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      age: patient.age.toString(),
      gender: patient.gender,
      dateOfBirth: patient.dateOfBirth || "",
      bloodGroup: patient.bloodType || "",
      phone: patient.phone,
      email: patient.email,
      address: patient.address || "",
      ward: patient.ward,
      roomNumber: patient.roomNumber || "",
      bedNumber: patient.bedNumber || "",
      status: patient.status,
      primaryDiagnosis: patient.primaryDiagnosis || "",
      notes: "",
      emergencyContactName: patient.emergencyContacts?.[0]?.name || "",
      emergencyContactRelationship: patient.emergencyContacts?.[0]?.relationship || "",
      emergencyContactPhone: patient.emergencyContacts?.[0]?.phone || "",
      insuranceProvider: patient.insurance?.provider || "",
      insurancePolicyNumber: patient.insurance?.policyNumber || "",
      insuranceHolderName: patient.insurance?.holderName || "",
    });
    setIsFormDialogOpen(true);
  };

  const openViewDialog = async (patient: Patient) => {
    const details = await fetchPatientDetails(patient.id);
    if (details) {
      setViewingPatient(details);
      setIsDetailDialogOpen(true);
    }
  };

  // Get unique wards for filter
  const wards = useMemo(() => {
    const uniqueWards = [...new Set(patients.map(p => p.ward).filter(Boolean))];
    return uniqueWards.sort();
  }, [patients]);

  // Statistics
  const stats = useMemo(() => ({
    total: patients.length,
    critical: patients.filter(p => p.status === "Critical").length,
    stable: patients.filter(p => p.status === "Stable").length,
    recovering: patients.filter(p => p.status === "Recovering").length,
    observation: patients.filter(p => p.status === "Under Observation").length,
  }), [patients]);

  // Calculate age from DOB
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const calculateAge = (dob: string) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Patient Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive patient records and care management
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => { resetForm(); setIsFormDialogOpen(true); }}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Patients</div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </Card>
          <Card className="p-4 border-red-200 bg-red-50/50">
            <div className="text-sm text-red-600">Critical</div>
            <div className="text-2xl font-bold mt-1 text-red-700">{stats.critical}</div>
          </Card>
          <Card className="p-4 border-amber-200 bg-amber-50/50">
            <div className="text-sm text-amber-600">Under Observation</div>
            <div className="text-2xl font-bold mt-1 text-amber-700">{stats.observation}</div>
          </Card>
          <Card className="p-4 border-blue-200 bg-blue-50/50">
            <div className="text-sm text-blue-600">Recovering</div>
            <div className="text-2xl font-bold mt-1 text-blue-700">{stats.recovering}</div>
          </Card>
          <Card className="p-4 border-green-200 bg-green-50/50">
            <div className="text-sm text-green-600">Stable</div>
            <div className="text-2xl font-bold mt-1 text-green-700">{stats.stable}</div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search by name, MRN, ward, or diagnosis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="Stable">Stable</SelectItem>
                  <SelectItem value="Under Observation">Under Observation</SelectItem>
                  <SelectItem value="Recovering">Recovering</SelectItem>
                  <SelectItem value="Discharged">Discharged</SelectItem>
                  <SelectItem value="Outpatient">Outpatient</SelectItem>
                </SelectContent>
              </Select>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={wardFilter} onValueChange={setWardFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Ward" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wards</SelectItem>
                  {wards.map(ward => (
                    <SelectItem key={ward} value={ward}>{ward}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(statusFilter !== "all" || genderFilter !== "all" || wardFilter !== "all" || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("all");
                    setGenderFilter("all");
                    setWardFilter("all");
                    setSearchQuery("");
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Patient List */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  <p className="text-muted-foreground mt-4">Loading patients...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/30 text-muted-foreground border-b border-border">
                      <tr>
                        <th className="px-6 py-4 font-medium">Patient</th>
                        <th className="px-6 py-4 font-medium">MRN</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium">Ward/Room</th>
                        <th className="px-6 py-4 font-medium">Diagnosis</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <AnimatePresence>
                        {filteredPatients.map((patient, index) => (
                          <motion.tr
                            key={patient.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`} />
                                  <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-foreground">{patient.name}</p>
                                  <p className="text-xs text-muted-foreground">{patient.age}y, {patient.gender}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-sm">{patient.mrn}</td>
                            <td className="px-6 py-4">
                              <Badge
                                className={`${statusConfig[patient.status].bgColor} ${statusConfig[patient.status].color} ${statusConfig[patient.status].borderColor} border`}
                              >
                                {patient.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-xs bg-muted px-2 py-1 rounded-md w-fit">{patient.ward || 'N/A'}</span>
                                {patient.roomNumber && (
                                  <span className="text-xs text-muted-foreground mt-1">Room {patient.roomNumber}{patient.bedNumber && ` / Bed ${patient.bedNumber}`}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate">
                              {patient.primaryDiagnosis || "-"}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => openViewDialog(patient)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Full Profile
                                  </DropdownMenuItem>
                                  {canEdit && (
                                    <DropdownMenuItem onClick={() => openEditDialog(patient)}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit Patient
                                    </DropdownMenuItem>
                                  )}
                                  {canRecordVitals && (
                                    <DropdownMenuItem onClick={() => { setViewingPatient(patient); setIsVitalsDialogOpen(true); }}>
                                      <Activity className="w-4 h-4 mr-2" />
                                      Record Vitals
                                    </DropdownMenuItem>
                                  )}
                                  {canDelete && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => { setDeletingPatient(patient); setIsDeleteDialogOpen(true); }}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Patient
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
              {!isLoading && filteredPatients.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No patients found matching your criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Add/Edit Patient Dialog */}
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPatient ? "Edit Patient" : "Add New Patient"}</DialogTitle>
              <DialogDescription>
                {editingPatient ? "Update patient information" : "Fill in patient details"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 py-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value: Gender) => setFormData({ ...formData, gender: value })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bloodGroup">Blood Type</Label>
                      <Select
                        value={formData.bloodGroup}
                        onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
                      >
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                          <SelectItem value="Unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>

                {/* Hospital Information */}
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Hospital Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ward">Ward</Label>
                      <Input
                        id="ward"
                        value={formData.ward}
                        onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: PatientStatus) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Stable">Stable</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                          <SelectItem value="Under Observation">Under Observation</SelectItem>
                          <SelectItem value="Recovering">Recovering</SelectItem>
                          <SelectItem value="Discharged">Discharged</SelectItem>
                          <SelectItem value="Outpatient">Outpatient</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roomNumber">Room Number</Label>
                      <Input
                        id="roomNumber"
                        value={formData.roomNumber}
                        onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bedNumber">Bed Number</Label>
                      <Input
                        id="bedNumber"
                        value={formData.bedNumber}
                        onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryDiagnosis">Primary Diagnosis</Label>
                    <Input
                      id="primaryDiagnosis"
                      value={formData.primaryDiagnosis}
                      onChange={(e) => setFormData({ ...formData, primaryDiagnosis: e.target.value })}
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Emergency Contact</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">Name</Label>
                      <Input
                        id="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                      <Input
                        id="emergencyContactRelationship"
                        value={formData.emergencyContactRelationship}
                        onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">Phone</Label>
                      <Input
                        id="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Insurance Information */}
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Insurance Information</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="insuranceProvider">Provider</Label>
                      <Input
                        id="insuranceProvider"
                        value={formData.insuranceProvider}
                        onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
                      <Input
                        id="insurancePolicyNumber"
                        value={formData.insurancePolicyNumber}
                        onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="insuranceHolderName">Holder Name</Label>
                      <Input
                        id="insuranceHolderName"
                        value={formData.insuranceHolderName}
                        onChange={(e) => setFormData({ ...formData, insuranceHolderName: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPatient ? "Update" : "Add"} Patient
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Patient Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-hidden flex flex-col">
            {viewingPatient && (
              <>
                <DialogHeader className="flex-shrink-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${viewingPatient.name}`} />
                        <AvatarFallback className="text-xl">{viewingPatient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <DialogTitle className="text-xl">{viewingPatient.name}</DialogTitle>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="font-mono">{viewingPatient.mrn}</span>
                          <span>•</span>
                          <span>{viewingPatient.age} years, {viewingPatient.gender}</span>
                          {viewingPatient.bloodType && viewingPatient.bloodType !== 'Unknown' && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Droplets className="w-3 h-3 text-red-500" />
                                {viewingPatient.bloodType}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge className={`${statusConfig[viewingPatient.status].bgColor} ${statusConfig[viewingPatient.status].color} ${statusConfig[viewingPatient.status].borderColor} border text-sm px-3 py-1`}>
                      {viewingPatient.status}
                    </Badge>
                  </div>
                </DialogHeader>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden mt-4">
                  <TabsList className="grid grid-cols-6 w-full flex-shrink-0">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="history">Medical History</TabsTrigger>
                    <TabsTrigger value="medications">Medications</TabsTrigger>
                    <TabsTrigger value="vitals">Vitals</TabsTrigger>
                    <TabsTrigger value="visits">Visits</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                  </TabsList>

                  <div className="flex-1 overflow-y-auto mt-4 pr-2" style={{ maxHeight: 'calc(90vh - 280px)' }}>
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4 m-0">
                      {/* Quick Info Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="p-4">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                            <Building2 className="w-4 h-4" />
                            Ward
                          </div>
                          <div className="font-medium">{viewingPatient.ward || 'Outpatient'}</div>
                          {viewingPatient.roomNumber && (
                            <div className="text-xs text-muted-foreground">Room {viewingPatient.roomNumber} {viewingPatient.bedNumber && `/ Bed ${viewingPatient.bedNumber}`}</div>
                          )}
                        </Card>
                        <Card className="p-4">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                            <Stethoscope className="w-4 h-4" />
                            Attending Doctor
                          </div>
                          <div className="font-medium">{viewingPatient.attendingDoctorName || "Not assigned"}</div>
                        </Card>
                        <Card className="p-4">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                            <Calendar className="w-4 h-4" />
                            Admitted
                          </div>
                          <div className="font-medium">{viewingPatient.admittedDate ? new Date(viewingPatient.admittedDate).toLocaleDateString() : 'N/A'}</div>
                        </Card>
                        <Card className="p-4">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                            <HeartPulse className="w-4 h-4" />
                            Primary Diagnosis
                          </div>
                          <div className="font-medium text-sm">{viewingPatient.primaryDiagnosis || "Not specified"}</div>
                        </Card>
                      </div>

                      {/* Secondary Diagnoses */}
                      {viewingPatient.secondaryDiagnoses && viewingPatient.secondaryDiagnoses.length > 0 && (
                        <Card className="p-4">
                          <h4 className="font-medium mb-3">Secondary Diagnoses</h4>
                          <div className="flex flex-wrap gap-2">
                            {viewingPatient.secondaryDiagnoses.map((diag, idx) => (
                              <Badge key={idx} variant="outline">{diag}</Badge>
                            ))}
                          </div>
                        </Card>
                      )}

                      {/* Contact Information */}
                      <Card className="p-4">
                        <h4 className="font-medium mb-3">Contact Information</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{viewingPatient.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span>{viewingPatient.email}</span>
                          </div>
                          {viewingPatient.address && (
                            <div className="flex items-center gap-2 col-span-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span>{viewingPatient.address}, {viewingPatient.city}, {viewingPatient.state} {viewingPatient.zipCode}</span>
                            </div>
                          )}
                        </div>
                      </Card>

                      {/* Emergency Contacts */}
                      {viewingPatient.emergencyContacts && viewingPatient.emergencyContacts.length > 0 && (
                        <Card className="p-4 border-orange-200 bg-orange-50/50">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            Emergency Contacts
                          </h4>
                          <div className="space-y-3">
                            {viewingPatient.emergencyContacts.map((contact) => (
                              <div key={contact.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-4">
                                  <span className="font-medium">{contact.name}</span>
                                  <span className="text-muted-foreground">{contact.relationship}</span>
                                  {contact.isPrimary && (
                                    <Badge variant="outline" className="text-xs">Primary</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="w-3 h-3 text-muted-foreground" />
                                  <span>{contact.phone}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      )}

                      {/* Insurance Information */}
                      {viewingPatient.insurance && (
                        <Card className="p-4">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                            Insurance Information
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Provider:</span>
                              <div className="font-medium">{viewingPatient.insurance.provider}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Policy #:</span>
                              <div className="font-medium">{viewingPatient.insurance.policyNumber}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Coverage:</span>
                              <div className="font-medium">{viewingPatient.insurance.coveragePercentage}%</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Copay:</span>
                              <div className="font-medium">${viewingPatient.insurance.copayAmount}</div>
                            </div>
                          </div>
                        </Card>
                      )}

                      {/* Allergies */}
                      <Card className="p-4 border-red-200 bg-red-50/50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium flex items-center gap-2 text-red-700">
                            <AlertTriangle className="w-4 h-4" />
                            Allergies ({viewingPatient.allergies?.length || 0})
                          </h4>
                          {canManageAllergies && (
                            <Button size="sm" variant="outline" onClick={() => setIsAllergyDialogOpen(true)}>
                              <Plus className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                        {viewingPatient.allergies && viewingPatient.allergies.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {viewingPatient.allergies.map((allergy) => (
                              <div
                                key={allergy.id}
                                className={`px-3 py-1.5 rounded-lg text-sm border ${severityConfig[allergy.severity]?.bgColor} ${severityConfig[allergy.severity]?.borderColor}`}
                              >
                                <span className={`font-medium ${severityConfig[allergy.severity]?.color}`}>
                                  {allergy.substance}
                                </span>
                                <span className="text-muted-foreground mx-2">•</span>
                                <span className="text-xs">{allergy.reaction}</span>
                                <Badge variant="outline" className="ml-2 text-xs">{allergy.severity}</Badge>
                                {canManageAllergies && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0 ml-2"
                                    onClick={() => handleRemoveAllergy(allergy.id)}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No known allergies</p>
                        )}
                      </Card>
                    </TabsContent>

                    {/* Medical History Tab */}
                    <TabsContent value="history" className="space-y-4 m-0">
                      {/* Medical Conditions */}
                      <Card className="p-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <ClipboardList className="w-4 h-4" />
                          Medical Conditions
                        </h4>
                        {viewingPatient.medicalHistory && viewingPatient.medicalHistory.length > 0 ? (
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {viewingPatient.medicalHistory.map((entry) => (
                              <div key={entry.id} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
                                <div>
                                  <div className="font-medium">{entry.condition}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Diagnosed: {new Date(entry.diagnosisDate).toLocaleDateString()}
                                    {entry.treatingDoctor && ` • Dr. ${entry.treatingDoctor}`}
                                  </div>
                                  {entry.notes && (
                                    <div className="text-sm mt-1 text-muted-foreground">{entry.notes}</div>
                                  )}
                                </div>
                                <Badge variant={
                                  entry.status === "Active" ? "destructive" :
                                  entry.status === "Chronic" ? "default" : "secondary"
                                }>
                                  {entry.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">No medical history recorded</p>
                        )}
                      </Card>

                      {/* Surgery History */}
                      <Card className="p-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <History className="w-4 h-4" />
                          Surgery History
                        </h4>
                        {viewingPatient.surgeryHistory && viewingPatient.surgeryHistory.length > 0 ? (
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {viewingPatient.surgeryHistory.map((surgery) => (
                              <div key={surgery.id} className="p-3 bg-muted/30 rounded-lg">
                                <div className="flex items-start justify-between">
                                  <div className="font-medium">{surgery.procedure}</div>
                                  <div className="text-sm text-muted-foreground">{new Date(surgery.date).toLocaleDateString()}</div>
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  Surgeon: {surgery.surgeon} • {surgery.hospital}
                                </div>
                                {surgery.complications && (
                                  <div className="text-sm text-amber-600 mt-1">Complications: {surgery.complications}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">No surgery history recorded</p>
                        )}
                      </Card>

                      {/* Immunizations */}
                      <Card className="p-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Syringe className="w-4 h-4" />
                          Immunizations
                        </h4>
                        {viewingPatient.immunizations && viewingPatient.immunizations.length > 0 ? (
                          <div className="grid gap-2 max-h-48 overflow-y-auto">
                            {viewingPatient.immunizations.map((imm) => (
                              <div key={imm.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                                <div>
                                  <span className="font-medium">{imm.vaccine}</span>
                                  {imm.batchNumber && <span className="text-muted-foreground ml-2">(Batch: {imm.batchNumber})</span>}
                                </div>
                                <div className="text-muted-foreground">{new Date(imm.date).toLocaleDateString()}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">No immunizations recorded</p>
                        )}
                      </Card>
                    </TabsContent>

                    {/* Medications Tab */}
                    <TabsContent value="medications" className="space-y-4 m-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Current Medications ({viewingPatient.currentMedications?.length || 0})</h4>
                        {canManageMedications && (
                          <Button size="sm" onClick={() => setIsMedicationDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-1" />
                            Add Medication
                          </Button>
                        )}
                      </div>
                      {viewingPatient.currentMedications && viewingPatient.currentMedications.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {viewingPatient.currentMedications.map((med) => (
                            <Card key={med.id} className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-primary/10 rounded-lg">
                                    <Pill className="w-5 h-5 text-primary" />
                                  </div>
                                  <div>
                                    <div className="font-medium">{med.medication}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {med.dosage} • {med.frequency}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Started: {new Date(med.startDate).toLocaleDateString()}
                                      {med.endDate && ` • Ends: ${new Date(med.endDate).toLocaleDateString()}`}
                                    </div>
                                    {med.instructions && (
                                      <div className="text-xs text-muted-foreground mt-1 italic">{med.instructions}</div>
                                    )}
                                    <div className="text-xs text-muted-foreground mt-1">Prescribed by: {med.prescribedBy}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={`${medicationStatusConfig[med.status]?.bgColor} ${medicationStatusConfig[med.status]?.color}`}>
                                    {med.status}
                                  </Badge>
                                  {med.status === 'Active' && canManageMedications && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-muted-foreground"
                                      onClick={() => handleDiscontinueMedication(med.id)}
                                    >
                                      Discontinue
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <Card className="p-8 text-center text-muted-foreground">
                          <Pill className="w-12 h-12 mx-auto mb-4 opacity-30" />
                          <p>No current medications.</p>
                        </Card>
                      )}
                    </TabsContent>

                    {/* Vitals Tab */}
                    <TabsContent value="vitals" className="space-y-4 m-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Vital Signs</h4>
                        {canRecordVitals && (
                          <Button size="sm" variant="outline" onClick={() => setIsVitalsDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-1" />
                            Record Vitals
                          </Button>
                        )}
                      </div>
                      {viewingPatient.vitalSigns && viewingPatient.vitalSigns.length > 0 ? (
                        <>
                          {/* Latest Vitals Highlight */}
                          <Card className="p-4 border-primary/20 bg-primary/5">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Activity className="w-4 h-4 text-primary" />
                              Latest Vitals
                              <Badge variant="outline" className="ml-auto">
                                {new Date(viewingPatient.vitalSigns[0].recordedAt).toLocaleString()}
                              </Badge>
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <div className="text-xs text-muted-foreground">Blood Pressure</div>
                                <div className="text-lg font-semibold">
                                  {viewingPatient.vitalSigns[0].bloodPressure}
                                  <span className="text-xs font-normal ml-1">mmHg</span>
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Heart Rate</div>
                                <div className="text-lg font-semibold">
                                  {viewingPatient.vitalSigns[0].heartRate}
                                  <span className="text-xs font-normal ml-1">bpm</span>
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Temperature</div>
                                <div className="text-lg font-semibold">
                                  {viewingPatient.vitalSigns[0].temperature}
                                  <span className="text-xs font-normal ml-1">°C</span>
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">SpO2</div>
                                <div className="text-lg font-semibold">
                                  {viewingPatient.vitalSigns[0].oxygenSaturation}
                                  <span className="text-xs font-normal ml-1">%</span>
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Respiratory Rate</div>
                                <div className="text-lg font-semibold">
                                  {viewingPatient.vitalSigns[0].respiratoryRate}
                                  <span className="text-xs font-normal ml-1">/min</span>
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Weight</div>
                                <div className="text-lg font-semibold">
                                  {viewingPatient.vitalSigns[0].weight}
                                  <span className="text-xs font-normal ml-1">kg</span>
                                </div>
                              </div>
                              <div className="col-span-2">
                                <div className="text-xs text-muted-foreground">Recorded By</div>
                                <div className="text-sm">{viewingPatient.vitalSigns[0].recordedBy}</div>
                              </div>
                            </div>
                          </Card>

                          {/* Vitals History Chart (Last 5 readings) */}
                          {viewingPatient.vitalSigns.length > 1 && (
                            <Card className="p-4">
                              <h4 className="font-medium mb-3">Vitals History (Last 5 Readings)</h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead className="bg-muted/30">
                                    <tr>
                                      <th className="px-3 py-2 text-left">Date</th>
                                      <th className="px-3 py-2 text-left">BP</th>
                                      <th className="px-3 py-2 text-left">HR</th>
                                      <th className="px-3 py-2 text-left">Temp</th>
                                      <th className="px-3 py-2 text-left">RR</th>
                                      <th className="px-3 py-2 text-left">SpO2</th>
                                      <th className="px-3 py-2 text-left">Wt</th>
                                      <th className="px-3 py-2 text-left">By</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-border">
                                    {viewingPatient.vitalSigns.slice(0, 5).map((vital) => (
                                      <tr key={vital.id} className="hover:bg-muted/20">
                                        <td className="px-3 py-2">{new Date(vital.recordedAt).toLocaleDateString()}</td>
                                        <td className="px-3 py-2">{vital.bloodPressure}</td>
                                        <td className="px-3 py-2">{vital.heartRate}</td>
                                        <td className="px-3 py-2">{vital.temperature}°C</td>
                                        <td className="px-3 py-2">{vital.respiratoryRate}</td>
                                        <td className="px-3 py-2">{vital.oxygenSaturation}%</td>
                                        <td className="px-3 py-2">{vital.weight}kg</td>
                                        <td className="px-3 py-2 text-muted-foreground">{vital.recordedBy}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </Card>
                          )}
                        </>
                      ) : (
                        <Card className="p-8 text-center text-muted-foreground">
                          <Activity className="w-12 h-12 mx-auto mb-4 opacity-30" />
                          <p>No vital signs recorded yet.</p>
                        </Card>
                      )}
                    </TabsContent>

                    {/* Visits Tab */}
                    <TabsContent value="visits" className="space-y-4 m-0">
                      <h4 className="font-medium">Visit History ({viewingPatient.visitHistory?.length || 0})</h4>
                      {viewingPatient.visitHistory && viewingPatient.visitHistory.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {viewingPatient.visitHistory.map((visit) => (
                            <Card key={visit.id} className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-muted rounded-lg">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <div className="font-medium">{new Date(visit.date).toLocaleDateString()}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {visit.type} • {visit.department}
                                    </div>
                                    <div className="text-sm mt-2">
                                      <span className="text-muted-foreground">Chief Complaint:</span> {visit.chiefComplaint}
                                    </div>
                                    {visit.diagnosis && (
                                      <div className="text-sm">
                                        <span className="text-muted-foreground">Diagnosis:</span> {visit.diagnosis}
                                      </div>
                                    )}
                                    {visit.notes && (
                                      <div className="text-sm text-muted-foreground mt-1">{visit.notes}</div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge variant={visit.status === 'Completed' ? 'default' : 'secondary'}>
                                    {visit.status}
                                  </Badge>
                                  <div className="text-sm text-muted-foreground mt-1">{visit.doctor}</div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <Card className="p-8 text-center text-muted-foreground">
                          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                          <p>No visit history recorded.</p>
                        </Card>
                      )}
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="space-y-4 m-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Patient Documents</h4>
                        <Button size="sm" variant="outline" disabled>
                          <FileSpreadsheet className="w-4 h-4 mr-1" />
                          Upload Document
                        </Button>
                      </div>
                      <Card className="p-8 text-center text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>No documents uploaded yet.</p>
                        <p className="text-sm mt-1">Document management feature coming soon.</p>
                      </Card>
                    </TabsContent>
                  </div>
                </Tabs>

                {/* Footer Actions */}
                <DialogFooter className="mt-4 pt-4 border-t flex-shrink-0">
                  {canEdit && (
                    <>
                      <Button variant="outline" onClick={() => { setIsDetailDialogOpen(false); openEditDialog(viewingPatient); }}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Patient
                      </Button>
                      {canRecordVitals && (
                        <Button variant="outline" onClick={() => setIsVitalsDialogOpen(true)}>
                          <Activity className="w-4 h-4 mr-2" />
                          Record Vitals
                        </Button>
                      )}
                    </>
                  )}
                  <Button variant="secondary" onClick={() => setIsDetailDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Record Vitals Dialog */}
        <Dialog open={isVitalsDialogOpen} onOpenChange={setIsVitalsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Record Vital Signs</DialogTitle>
              <DialogDescription>
                {viewingPatient?.name} - {viewingPatient?.mrn}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Systolic BP (mmHg)</Label>
                  <Input
                    type="number"
                    value={vitalForm.bloodPressureSystolic}
                    onChange={(e) => setVitalForm({ ...vitalForm, bloodPressureSystolic: e.target.value })}
                    placeholder="120"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Diastolic BP (mmHg)</Label>
                  <Input
                    type="number"
                    value={vitalForm.bloodPressureDiastolic}
                    onChange={(e) => setVitalForm({ ...vitalForm, bloodPressureDiastolic: e.target.value })}
                    placeholder="80"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heart Rate (bpm)</Label>
                  <Input
                    type="number"
                    value={vitalForm.heartRate}
                    onChange={(e) => setVitalForm({ ...vitalForm, heartRate: e.target.value })}
                    placeholder="72"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Temperature (°C)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={vitalForm.temperature}
                    onChange={(e) => setVitalForm({ ...vitalForm, temperature: e.target.value })}
                    placeholder="36.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Respiratory Rate (/min)</Label>
                  <Input
                    type="number"
                    value={vitalForm.respiratoryRate}
                    onChange={(e) => setVitalForm({ ...vitalForm, respiratoryRate: e.target.value })}
                    placeholder="16"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SpO2 (%)</Label>
                  <Input
                    type="number"
                    value={vitalForm.oxygenSaturation}
                    onChange={(e) => setVitalForm({ ...vitalForm, oxygenSaturation: e.target.value })}
                    placeholder="98"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={vitalForm.weight}
                    onChange={(e) => setVitalForm({ ...vitalForm, weight: e.target.value })}
                    placeholder="70"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsVitalsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddVitals}>Record Vitals</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Allergy Dialog */}
        <Dialog open={isAllergyDialogOpen} onOpenChange={setIsAllergyDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Add Allergy</DialogTitle>
              <DialogDescription>
                Record a new allergy for {viewingPatient?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Substance *</Label>
                <Input
                  value={allergyForm.substance}
                  onChange={(e) => setAllergyForm({ ...allergyForm, substance: e.target.value })}
                  placeholder="e.g., Penicillin"
                />
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select
                  value={allergyForm.severity}
                  onValueChange={(value: Allergy['severity']) => setAllergyForm({ ...allergyForm, severity: value })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mild">Mild</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Severe">Severe</SelectItem>
                    <SelectItem value="Life-threatening">Life-threatening</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reaction</Label>
                <Input
                  value={allergyForm.reaction}
                  onChange={(e) => setAllergyForm({ ...allergyForm, reaction: e.target.value })}
                  placeholder="e.g., Skin rash, difficulty breathing"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAllergyDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddAllergy} disabled={!allergyForm.substance}>Add Allergy</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Medication Dialog */}
        <Dialog open={isMedicationDialogOpen} onOpenChange={setIsMedicationDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Medication</DialogTitle>
              <DialogDescription>
                Prescribe a new medication for {viewingPatient?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Medication Name *</Label>
                <Input
                  value={medicationForm.medication}
                  onChange={(e) => setMedicationForm({ ...medicationForm, medication: e.target.value })}
                  placeholder="e.g., Amoxicillin"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dosage</Label>
                  <Input
                    value={medicationForm.dosage}
                    onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })}
                    placeholder="e.g., 500mg"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Input
                    value={medicationForm.frequency}
                    onChange={(e) => setMedicationForm({ ...medicationForm, frequency: e.target.value })}
                    placeholder="e.g., 3 times daily"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={medicationForm.startDate}
                    onChange={(e) => setMedicationForm({ ...medicationForm, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Input
                    type="date"
                    value={medicationForm.endDate}
                    onChange={(e) => setMedicationForm({ ...medicationForm, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Instructions</Label>
                <Input
                  value={medicationForm.instructions}
                  onChange={(e) => setMedicationForm({ ...medicationForm, instructions: e.target.value })}
                  placeholder="e.g., Take with food"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMedicationDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddMedication} disabled={!medicationForm.medication}>Add Medication</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Delete Patient</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {deletingPatient?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
