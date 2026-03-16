"use client";

import React, { useState, useEffect, useCallback } from "react";
import { db } from '../lib/store';
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  AlertTriangle,
  Ambulance,
  Clock,
  User,
  Plus,
  Phone,
  Activity,
  Heart,
  Thermometer,
  Droplets,
  Wind,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Car,
  Navigation,
  Radio,
  Stethoscope,
  BedDouble,
  ArrowRightLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "react-toastify";
import { useRole } from '../context/RoleContext';
import { EmergencyCase, Ambulance as AmbulanceType, Doctor, VitalSigns, VitalSign } from "../types";

type EmergencyStatus = "Incoming" | "In Treatment" | "Discharged" | "Admitted" | "Transferred";
type EmergencyLevel = "Critical" | "Serious" | "Minor";
type ESILevel = 1 | 2 | 3 | 4 | 5;

interface ExtendedEmergencyCase extends EmergencyCase {
  waitingTime?: string;
  lastUpdated?: string;
}

export default function EmergencyPage() {
  const { currentRole } = useRole();
  const [emergencyCases, setEmergencyCases] = useState<ExtendedEmergencyCase[]>([]);
  const [ambulances, setAmbulances] = useState<AmbulanceType[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [, setIsLoading] = useState(true);

  // Dialog states
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [isVitalsOpen, setIsVitalsOpen] = useState(false);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<ExtendedEmergencyCase | null>(null);
  const [selectedAmbulance, setSelectedAmbulance] = useState<AmbulanceType | null>(null);
  const [actionType, setActionType] = useState<string>("");

  // Form states
  const [newCaseForm, setNewCaseForm] = useState({
    patientName: "",
    patientAge: "",
    patientGender: "Male",
    case: "",
    description: "",
    arrivalMode: "Walk-in",
    triageScore: 3 as ESILevel,
    level: "Serious" as EmergencyLevel,
    patientPhone: "",
  });

  const [vitalsForm, setVitalsForm] = useState({
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    heartRate: "",
    temperature: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    weight: "",
    painLevel: "",
    notes: "",
  });

  const [dispatchForm, setDispatchForm] = useState({
    destination: "",
    emergencyCaseId: "",
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [emergenciesRes, ambulancesRes, doctorsRes] = await Promise.all([
        fetch("/api/emergency"),
        fetch("/api/ambulances"),
        fetch("/api/doctors"),
      ]);

      const emergenciesData = await emergenciesRes;
      const ambulancesData = await ambulancesRes;
      const doctorsData = await doctorsRes;

      // Add calculated waiting time
      const enhancedEmergencies = emergenciesData.map((e: ExtendedEmergencyCase) => ({
        ...e,
        waitingTime: calculateWaitingTime(e.createdAt || new Date().toISOString()),
        lastUpdated: new Date().toLocaleTimeString(),
      }));

      setEmergencyCases(enhancedEmergencies);
      setAmbulances(ambulancesData);
      setDoctors(doctorsData);
    } catch {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load emergency data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Refresh data every 30 seconds for real-time feel
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const calculateWaitingTime = (createdAt: string): string => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);
    if (diffMinutes < 60) return `${diffMinutes} min`;
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getESIColor = (score?: number): string => {
    switch (score) {
      case 1:
        return "bg-red-600 text-white";
      case 2:
        return "bg-orange-500 text-white";
      case 3:
        return "bg-yellow-500 text-black";
      case 4:
        return "bg-green-500 text-white";
      case 5:
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const getLevelColor = (level: string): string => {
    switch (level) {
      case "Critical":
        return "destructive";
      case "Serious":
        return "warning";
      default:
        return "success";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Incoming":
        return "destructive";
      case "In Treatment":
        return "warning";
      case "Admitted":
        return "info";
      case "Transferred":
        return "secondary";
      default:
        return "success";
    }
  };

  const getAmbulanceStatusColor = (status: string): string => {
    switch (status) {
      case "Available":
        return "success";
      case "Dispatched":
      case "Transporting":
        return "warning";
      case "On Scene":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleCreateCase = async () => {
    if (!newCaseForm.patientName || !newCaseForm.case) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const res = await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCaseForm,
          patientAge: parseInt(newCaseForm.patientAge) || undefined,
          status: "Incoming",
          eta: newCaseForm.arrivalMode === "Walk-in" ? "Arrived" : "15 min",
        }),
      });

      if (res.ok) {
        toast.success("Emergency case created successfully");
        setIsNewCaseOpen(false);
        setNewCaseForm({
          patientName: "",
          patientAge: "",
          patientGender: "Male",
          case: "",
          description: "",
          arrivalMode: "Walk-in",
          triageScore: 3,
          level: "Serious",
          patientPhone: "",
        });
        fetchData();
      } else {
        toast.error("Failed to create emergency case");
      }
    } catch {
      toast.error("Failed to create emergency case");
    }
  };

  const handleStatusChange = async (id: string, newStatus: EmergencyStatus) => {
    try {
      const res = await fetch("/api/emergency", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Status updated to ${newStatus}`);
        fetchData();
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleAssignDoctor = async (caseId: string, doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    if (!doctor) return;

    try {
      const res = await fetch("/api/emergency", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: caseId,
          assignedDoctorId: doctorId,
          assignedDoctor: doctor.name,
        }),
      });
      if (res.ok) {
        toast.success(`Assigned to ${doctor.name}`);
        fetchData();
      }
    } catch {
      toast.error("Failed to assign doctor");
    }
  };

  const handleRecordVitals = async () => {
    if (!selectedCase) return;

    const newVital: VitalSign = {
      id: `VS-${Date.now()}`,
      recordedAt: new Date().toISOString(),
      recordedBy: "Current User",
      bloodPressureSystolic: parseInt(vitalsForm.bloodPressureSystolic) || 0,
      bloodPressureDiastolic: parseInt(vitalsForm.bloodPressureDiastolic) || 0,
      heartRate: parseInt(vitalsForm.heartRate) || 0,
      temperature: parseFloat(vitalsForm.temperature) || 0,
      respiratoryRate: parseInt(vitalsForm.respiratoryRate) || 0,
      oxygenSaturation: parseInt(vitalsForm.oxygenSaturation) || 0,
      weight: parseFloat(vitalsForm.weight) || 0,
      painLevel: parseInt(vitalsForm.painLevel) || 0,
      notes: vitalsForm.notes,
    };

    try {
      const res = await fetch("/api/emergency", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedCase.id,
          vitalSigns: [...(selectedCase.vitalSigns || []), newVital],
        }),
      });
      if (res.ok) {
        toast.success("Vitals recorded successfully");
        setIsVitalsOpen(false);
        setVitalsForm({
          bloodPressureSystolic: "",
          bloodPressureDiastolic: "",
          heartRate: "",
          temperature: "",
          respiratoryRate: "",
          oxygenSaturation: "",
          weight: "",
          painLevel: "",
          notes: "",
        });
        fetchData();
      }
    } catch {
      toast.error("Failed to record vitals");
    }
  };

  const handleDispatchAmbulance = async () => {
    if (!selectedAmbulance || !dispatchForm.destination) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const res = await fetch("/api/ambulances", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedAmbulance.id,
          status: "Dispatched",
          destination: dispatchForm.destination,
          dispatchedAt: new Date().toISOString(),
          eta: `${Math.floor(Math.random() * 20 + 5)} min`,
          currentCaseId: dispatchForm.emergencyCaseId || undefined,
        }),
      });
      if (res.ok) {
        toast.success(`Ambulance ${selectedAmbulance.vehicleNumber} dispatched`);
        setIsDispatchOpen(false);
        setDispatchForm({ destination: "", emergencyCaseId: "" });
        fetchData();
      }
    } catch {
      toast.error("Failed to dispatch ambulance");
    }
  };

  const handleQuickAction = async () => {
    if (!selectedCase || !actionType) return;

    switch (actionType) {
      case "begin_treatment":
        await handleStatusChange(selectedCase.id, "In Treatment");
        break;
      case "admit":
        await handleStatusChange(selectedCase.id, "Admitted");
        break;
      case "discharge":
        await handleStatusChange(selectedCase.id, "Discharged");
        break;
      case "transfer":
        await handleStatusChange(selectedCase.id, "Transferred");
        break;
    }
    setIsActionOpen(false);
    setSelectedCase(null);
    setActionType("");
  };

  const filteredCases = emergencyCases.filter((e) => {
    const matchesSearch =
      e.case.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.patientName && e.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      e.caseNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    const matchesLevel = levelFilter === "all" || e.level === levelFilter;
    return matchesSearch && matchesStatus && matchesLevel;
  });

  // Statistics
  const activeCases = emergencyCases.filter(
    (e) => e.status === "Incoming" || e.status === "In Treatment"
  ).length;
  const criticalCases = emergencyCases.filter((e) => e.level === "Critical").length;
  const waitingPatients = emergencyCases.filter((e) => e.status === "Incoming").length;
  const availableAmbulances = ambulances.filter((a) => a.status === "Available").length;

  const canEdit = currentRole === "admin" || currentRole === "doctor" || currentRole === "nurse" || currentRole === "receptionist";
  const canCreate = currentRole === "admin" || currentRole === "receptionist" || currentRole === "nurse";

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-2">
              Emergency Department
              <Badge variant="destructive" className="animate-pulse">
                LIVE
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time emergency case management and ambulance tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            {canCreate && (
              <Button onClick={() => setIsNewCaseOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Case
              </Button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Active Cases</p>
                    <p className="text-3xl font-bold text-red-700">{activeCases}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-xl">
                    <Activity className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-red-300 bg-gradient-to-br from-red-100 to-red-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-700 font-medium">Critical Cases</p>
                    <p className="text-3xl font-bold text-red-800">{criticalCases}</p>
                  </div>
                  <div className="p-3 bg-red-200 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-red-700 animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600 font-medium">Waiting Patients</p>
                    <p className="text-3xl font-bold text-amber-700">{waitingPatients}</p>
                  </div>
                  <div className="p-3 bg-amber-100 rounded-xl">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Ambulances Available</p>
                    <p className="text-3xl font-bold text-green-700">{availableAmbulances}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Ambulance className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Emergency Cases List */}
          <div className="xl:col-span-2 space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search cases by patient, case type, or case number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-transparent focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 rounded-xl transition-all outline-none text-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Incoming">Incoming</SelectItem>
                  <SelectItem value="In Treatment">In Treatment</SelectItem>
                  <SelectItem value="Admitted">Admitted</SelectItem>
                  <SelectItem value="Discharged">Discharged</SelectItem>
                  <SelectItem value="Transferred">Transferred</SelectItem>
                </SelectContent>
              </Select>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="Serious">Serious</SelectItem>
                  <SelectItem value="Minor">Minor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cases List */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Emergency Cases</span>
                    <Badge variant="outline">{filteredCases.length} cases</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                    <AnimatePresence>
                      {filteredCases.map((e, index) => (
                        <motion.div
                          key={e.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                            e.level === "Critical"
                              ? "border-red-300 bg-red-50/50"
                              : e.level === "Serious"
                              ? "border-amber-200 bg-amber-50/50"
                              : "border-border bg-card"
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* Left side - Case Info */}
                            <div className="flex items-start gap-4">
                              {/* Triage Score Circle */}
                              <div
                                className={`w-14 h-14 rounded-full flex flex-col items-center justify-center text-xs font-bold ${getESIColor(
                                  e.triageScore
                                )}`}
                              >
                                <span className="text-lg">{e.triageScore || "-"}</span>
                                <span className="text-[10px]">ESI</span>
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-foreground">
                                    {e.case}
                                  </span>
                                  {e.level === "Critical" && (
                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3" />
                                      URGENT
                                    </span>
                                  )}
                                  <Badge variant={getLevelColor(e.level) as "destructive" | "warning" | "success"}>
                                    {e.level}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  <span className="font-mono">{e.caseNumber}</span>
                                  {" • "}
                                  {e.patientName || "Unknown Patient"}
                                  {e.patientAge && ` (${e.patientAge}y)`}
                                  {e.patientGender && ` ${e.patientGender.charAt(0)}`}
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Wait: {e.waitingTime}
                                  </span>
                                  {e.arrivalMode && (
                                    <span className="flex items-center gap-1">
                                      <Car className="w-3 h-3" />
                                      {e.arrivalMode}
                                    </span>
                                  )}
                                  {e.eta && e.status === "Incoming" && (
                                    <span className="flex items-center gap-1">
                                      <Navigation className="w-3 h-3" />
                                      ETA: {e.eta}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right side - Status & Actions */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                              {/* Assigned Doctor */}
                              {e.assignedDoctor ? (
                                <div className="flex items-center gap-1 text-sm bg-primary/10 px-2 py-1 rounded-lg">
                                  <User className="w-4 h-4 text-primary" />
                                  <span className="text-primary font-medium">
                                    {e.assignedDoctor}
                                  </span>
                                </div>
                              ) : canEdit && e.status === "Incoming" ? (
                                <Select onValueChange={(val) => handleAssignDoctor(e.id, val)}>
                                  <SelectTrigger className="w-40 h-8 text-xs">
                                    <SelectValue placeholder="Assign Doctor" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {doctors
                                      .filter((d) => d.status === "Available")
                                      .map((d) => (
                                        <SelectItem key={d.id} value={d.id}>
                                          {d.name}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              ) : null}

                              <Badge
                                variant={getStatusColor(e.status) as "destructive" | "warning" | "info" | "success" | "secondary"}
                              >
                                {e.status}
                              </Badge>

                              {/* Quick Actions */}
                              {canEdit && (
                                <div className="flex items-center gap-1">
                                  {e.status === "Incoming" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8"
                                      onClick={() => {
                                        setSelectedCase(e);
                                        setIsVitalsOpen(true);
                                      }}
                                    >
                                      <Activity className="w-3 h-3 mr-1" />
                                      Vitals
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8"
                                    onClick={() => {
                                      setSelectedCase(e);
                                      setIsActionOpen(true);
                                    }}
                                  >
                                    Actions
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {filteredCases.length === 0 && (
                      <div className="p-12 text-center text-muted-foreground">
                        <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No emergency cases found.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Sidebar - Ambulance Tracking */}
          <div className="space-y-4">
            {/* Ambulance Fleet */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Ambulance className="w-5 h-5" />
                    Ambulance Fleet
                  </span>
                  <Badge variant="outline">
                    {ambulances.filter((a) => a.status === "Available").length}/{ambulances.length} Available
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {ambulances.map((ambulance) => (
                    <div
                      key={ambulance.id}
                      className={`p-3 rounded-lg border ${
                        ambulance.status === "Available"
                          ? "bg-green-50/50 border-green-200"
                          : ambulance.status === "Maintenance"
                          ? "bg-gray-50 border-gray-200"
                          : "bg-amber-50/50 border-amber-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              ambulance.status === "Available"
                                ? "bg-green-100"
                                : ambulance.status === "Maintenance"
                                ? "bg-gray-100"
                                : "bg-amber-100"
                            }`}
                          >
                            <Ambulance
                              className={`w-4 h-4 ${
                                ambulance.status === "Available"
                                  ? "text-green-600"
                                  : ambulance.status === "Maintenance"
                                  ? "text-gray-600"
                                  : "text-amber-600"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{ambulance.vehicleNumber}</p>
                            <p className="text-xs text-muted-foreground">{ambulance.type}</p>
                          </div>
                        </div>
                        <Badge
                          variant={getAmbulanceStatusColor(ambulance.status) as "success" | "warning" | "destructive" | "secondary"}
                        >
                          {ambulance.status}
                        </Badge>
                      </div>

                      {ambulance.status !== "Maintenance" && (
                        <>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {ambulance.driverName}
                            </span>
                            {ambulance.driverPhone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {ambulance.driverPhone}
                              </span>
                            )}
                          </div>

                          {ambulance.status !== "Available" && (
                            <div className="flex items-center gap-2 text-xs bg-amber-100/50 p-2 rounded">
                              <Navigation className="w-3 h-3 text-amber-600" />
                              <span className="text-amber-700">
                                {ambulance.destination || "En route"}
                                {ambulance.eta && ` • ETA: ${ambulance.eta}`}
                              </span>
                            </div>
                          )}

                          {ambulance.status === "Available" && canEdit && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full h-7 mt-2 text-xs"
                              onClick={() => {
                                setSelectedAmbulance(ambulance);
                                setIsDispatchOpen(true);
                              }}
                            >
                              <Radio className="w-3 h-3 mr-1" />
                              Dispatch
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Triage Legend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  ESI Triage Level
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {[
                    { level: 1, label: "Resuscitation", color: "bg-red-600", desc: "Immediate life-saving intervention" },
                    { level: 2, label: "Emergent", color: "bg-orange-500", desc: "High risk, confused/lethargic" },
                    { level: 3, label: "Urgent", color: "bg-yellow-500", desc: "Stable but needs multiple resources" },
                    { level: 4, label: "Less Urgent", color: "bg-green-500", desc: "Stable, needs one resource" },
                    { level: 5, label: "Non-Urgent", color: "bg-blue-500", desc: "Stable, needs no resources" },
                  ].map((item) => (
                    <div key={item.level} className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${item.color}`}
                      >
                        {item.level}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Today&apos;s Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold">{emergencyCases.length}</p>
                    <p className="text-xs text-muted-foreground">Total Cases</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold">
                      {emergencyCases.filter((e) => e.status === "Discharged").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Discharged</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold">
                      {emergencyCases.filter((e) => e.status === "Admitted").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Admitted</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold">
                      {Math.round(
                        (emergencyCases.filter((e) => e.status === "Discharged").length /
                          Math.max(emergencyCases.length, 1)) *
                          100
                      )}
                      %
                    </p>
                    <p className="text-xs text-muted-foreground">Discharge Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* New Case Dialog */}
      <Dialog open={isNewCaseOpen} onOpenChange={setIsNewCaseOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New Emergency Case
            </DialogTitle>
            <DialogDescription>
              Register a new emergency case. All critical information should be captured.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">Patient Name *</Label>
                <Input
                  id="patientName"
                  value={newCaseForm.patientName}
                  onChange={(e) =>
                    setNewCaseForm({ ...newCaseForm, patientName: e.target.value })
                  }
                  placeholder="Enter patient name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientAge">Age</Label>
                <Input
                  id="patientAge"
                  type="number"
                  value={newCaseForm.patientAge}
                  onChange={(e) =>
                    setNewCaseForm({ ...newCaseForm, patientAge: e.target.value })
                  }
                  placeholder="Age"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientGender">Gender</Label>
                <Select
                  value={newCaseForm.patientGender}
                  onValueChange={(val) =>
                    setNewCaseForm({ ...newCaseForm, patientGender: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientPhone">Phone</Label>
                <Input
                  id="patientPhone"
                  value={newCaseForm.patientPhone}
                  onChange={(e) =>
                    setNewCaseForm({ ...newCaseForm, patientPhone: e.target.value })
                  }
                  placeholder="Phone number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="case">Case Type *</Label>
              <Select
                value={newCaseForm.case}
                onValueChange={(val) => setNewCaseForm({ ...newCaseForm, case: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select case type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cardiac Arrest">Cardiac Arrest</SelectItem>
                  <SelectItem value="Stroke">Stroke</SelectItem>
                  <SelectItem value="Trauma">Trauma</SelectItem>
                  <SelectItem value="Respiratory Distress">Respiratory Distress</SelectItem>
                  <SelectItem value="Severe Bleeding">Severe Bleeding</SelectItem>
                  <SelectItem value="Overdose">Overdose</SelectItem>
                  <SelectItem value="Seizure">Seizure</SelectItem>
                  <SelectItem value="Anaphylaxis">Anaphylaxis</SelectItem>
                  <SelectItem value="Fracture">Fracture</SelectItem>
                  <SelectItem value="Burns">Burns</SelectItem>
                  <SelectItem value="Chest Pain">Chest Pain</SelectItem>
                  <SelectItem value="Abdominal Pain">Abdominal Pain</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newCaseForm.description}
                onChange={(e) =>
                  setNewCaseForm({ ...newCaseForm, description: e.target.value })
                }
                placeholder="Brief description of the emergency"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Arrival Mode</Label>
                <Select
                  value={newCaseForm.arrivalMode}
                  onValueChange={(val) =>
                    setNewCaseForm({ ...newCaseForm, arrivalMode: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Walk-in">Walk-in</SelectItem>
                    <SelectItem value="Ambulance">Ambulance</SelectItem>
                    <SelectItem value="Helicopter">Helicopter</SelectItem>
                    <SelectItem value="Police">Police</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>ESI Level</Label>
                <Select
                  value={newCaseForm.triageScore.toString()}
                  onValueChange={(val) =>
                    setNewCaseForm({
                      ...newCaseForm,
                      triageScore: parseInt(val) as ESILevel,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Resuscitation</SelectItem>
                    <SelectItem value="2">2 - Emergent</SelectItem>
                    <SelectItem value="3">3 - Urgent</SelectItem>
                    <SelectItem value="4">4 - Less Urgent</SelectItem>
                    <SelectItem value="5">5 - Non-Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select
                  value={newCaseForm.level}
                  onValueChange={(val) =>
                    setNewCaseForm({ ...newCaseForm, level: val as EmergencyLevel })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="Serious">Serious</SelectItem>
                    <SelectItem value="Minor">Minor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewCaseOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCase}>Create Case</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Vitals Dialog */}
      <Dialog open={isVitalsOpen} onOpenChange={setIsVitalsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Record Vital Signs
            </DialogTitle>
            <DialogDescription>
              {selectedCase?.patientName} - {selectedCase?.case}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  Blood Pressure (Systolic)
                </Label>
                <Input
                  type="number"
                  value={vitalsForm.bloodPressureSystolic}
                  onChange={(e) =>
                    setVitalsForm({ ...vitalsForm, bloodPressureSystolic: e.target.value })
                  }
                  placeholder="120"
                />
              </div>
              <div className="space-y-2">
                <Label>Blood Pressure (Diastolic)</Label>
                <Input
                  type="number"
                  value={vitalsForm.bloodPressureDiastolic}
                  onChange={(e) =>
                    setVitalsForm({ ...vitalsForm, bloodPressureDiastolic: e.target.value })
                  }
                  placeholder="80"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Activity className="w-4 h-4 text-pink-500" />
                  Heart Rate
                </Label>
                <Input
                  type="number"
                  value={vitalsForm.heartRate}
                  onChange={(e) =>
                    setVitalsForm({ ...vitalsForm, heartRate: e.target.value })
                  }
                  placeholder="72"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Thermometer className="w-4 h-4 text-orange-500" />
                  Temperature
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={vitalsForm.temperature}
                  onChange={(e) =>
                    setVitalsForm({ ...vitalsForm, temperature: e.target.value })
                  }
                  placeholder="37.0"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Wind className="w-4 h-4 text-cyan-500" />
                  Resp. Rate
                </Label>
                <Input
                  type="number"
                  value={vitalsForm.respiratoryRate}
                  onChange={(e) =>
                    setVitalsForm({ ...vitalsForm, respiratoryRate: e.target.value })
                  }
                  placeholder="16"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  SpO2 (%)
                </Label>
                <Input
                  type="number"
                  value={vitalsForm.oxygenSaturation}
                  onChange={(e) =>
                    setVitalsForm({ ...vitalsForm, oxygenSaturation: e.target.value })
                  }
                  placeholder="98"
                />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={vitalsForm.weight}
                  onChange={(e) =>
                    setVitalsForm({ ...vitalsForm, weight: e.target.value })
                  }
                  placeholder="70"
                />
              </div>
              <div className="space-y-2">
                <Label>Pain Level (0-10)</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={vitalsForm.painLevel}
                  onChange={(e) =>
                    setVitalsForm({ ...vitalsForm, painLevel: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={vitalsForm.notes}
                onChange={(e) => setVitalsForm({ ...vitalsForm, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVitalsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordVitals}>Save Vitals</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispatch Ambulance Dialog */}
      <Dialog open={isDispatchOpen} onOpenChange={setIsDispatchOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ambulance className="w-5 h-5" />
              Dispatch Ambulance
            </DialogTitle>
            <DialogDescription>
              {selectedAmbulance?.vehicleNumber} - {selectedAmbulance?.type}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Destination / Pickup Location</Label>
              <Input
                value={dispatchForm.destination}
                onChange={(e) =>
                  setDispatchForm({ ...dispatchForm, destination: e.target.value })
                }
                placeholder="Enter address or location"
              />
            </div>
            <div className="space-y-2">
              <Label>Link to Emergency Case (Optional)</Label>
              <Select
                value={dispatchForm.emergencyCaseId}
                onValueChange={(val) =>
                  setDispatchForm({ ...dispatchForm, emergencyCaseId: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select case (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {emergencyCases
                    .filter((e) => e.status === "Incoming")
                    .map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.caseNumber} - {e.patientName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg text-sm">
              <p className="font-medium mb-1">Crew:</p>
              <p className="text-muted-foreground">
                Driver: {selectedAmbulance?.driverName}
                {selectedAmbulance?.driverPhone && ` (${selectedAmbulance.driverPhone})`}
              </p>
              {selectedAmbulance?.paramedicName && (
                <p className="text-muted-foreground">
                  Paramedic: {selectedAmbulance.paramedicName}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDispatchOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDispatchAmbulance}>
              <Radio className="w-4 h-4 mr-2" />
              Dispatch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Action Dialog */}
      <Dialog open={isActionOpen} onOpenChange={setIsActionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Actions</DialogTitle>
            <DialogDescription>
              {selectedCase?.patientName} - {selectedCase?.case} ({selectedCase?.caseNumber})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {selectedCase?.status === "Incoming" && (
              <Button
                variant="outline"
                className="justify-start h-12"
                onClick={() => setActionType("begin_treatment")}
              >
                <Stethoscope className="w-5 h-5 mr-3 text-green-600" />
                <div className="text-left">
                  <p className="font-medium">Begin Treatment</p>
                  <p className="text-xs text-muted-foreground">Start treating this patient</p>
                </div>
              </Button>
            )}
            {(selectedCase?.status === "Incoming" || selectedCase?.status === "In Treatment") && (
              <>
                <Button
                  variant="outline"
                  className="justify-start h-12"
                  onClick={() => setActionType("admit")}
                >
                  <BedDouble className="w-5 h-5 mr-3 text-blue-600" />
                  <div className="text-left">
                    <p className="font-medium">Admit to Ward</p>
                    <p className="text-xs text-muted-foreground">Transfer patient to inpatient care</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-12"
                  onClick={() => setActionType("discharge")}
                >
                  <CheckCircle2 className="w-5 h-5 mr-3 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium">Discharge</p>
                    <p className="text-xs text-muted-foreground">Patient is stable and can go home</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-12"
                  onClick={() => setActionType("transfer")}
                >
                  <ArrowRightLeft className="w-5 h-5 mr-3 text-orange-600" />
                  <div className="text-left">
                    <p className="font-medium">Transfer</p>
                    <p className="text-xs text-muted-foreground">Transfer to another facility</p>
                  </div>
                </Button>
              </>
            )}
          </div>
          {actionType && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionType("")}>
                Cancel
              </Button>
              <Button onClick={handleQuickAction}>
                <ArrowRight className="w-4 h-4 mr-2" />
                Confirm
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
