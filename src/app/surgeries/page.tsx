"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  Calendar,
  Clock,
  Users,
  Building2,
  Stethoscope,
  Syringe,
  CheckCircle2,
  Circle,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  AlertTriangle,
  Building,
  Timer,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Surgery, SurgeryTheater, SurgeryTeam, PreOpChecklistItem, Patient, Doctor } from "@/types";

// Status badge color mapping
const statusColors: Record<string, string> = {
  Scheduled: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Pre-Op": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "In Progress": "bg-purple-500/10 text-purple-600 border-purple-500/20",
  Completed: "bg-green-500/10 text-green-600 border-green-500/20",
  Cancelled: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  Postponed: "bg-orange-500/10 text-orange-600 border-orange-500/20",
};

// Anesthesia type labels
const anesthesiaTypes = [
  { value: "General", label: "General Anesthesia" },
  { value: "Regional", label: "Regional Anesthesia" },
  { value: "Local", label: "Local Anesthesia" },
  { value: "MAC", label: "Monitored Anesthesia Care (MAC)" },
  { value: "None", label: "No Anesthesia" },
];

// Default pre-op checklist items
const defaultPreOpChecklist = [
  { item: "Consent form signed", completed: false },
  { item: "NPO status verified", completed: false },
  { item: "Allergies documented", completed: false },
  { item: "Lab results reviewed", completed: false },
  { item: "IV access established", completed: false },
  { item: "Pre-medication given", completed: false },
  { item: "Patient identity verified", completed: false },
  { item: "Surgical site marked", completed: false },
];

export default function SurgeriesPage() {
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [theaters, setTheaters] = useState<SurgeryTheater[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedSurgery, setSelectedSurgery] = useState<Surgery | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Form state for new surgery
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    procedure: "",
    procedureCode: "",
    department: "",
    theaterId: "",
    theaterName: "",
    scheduledDate: "",
    scheduledTime: "",
    estimatedDuration: 60,
    anesthesiaType: "General" as const,
    preOpDiagnosis: "",
    team: [] as SurgeryTeam[],
  });

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [surgeriesRes, theatersRes, patientsRes, doctorsRes] = await Promise.all([
          fetch("/api/surgeries"),
          fetch("/api/theaters"),
          fetch("/api/patients"),
          fetch("/api/doctors"),
        ]);

        const surgeriesData = await surgeriesRes.json();
        const theatersData = await theatersRes.json();
        const patientsData = await patientsRes.json();
        const doctorsData = await doctorsRes.json();

        setSurgeries(Array.isArray(surgeriesData) ? surgeriesData : []);
        setTheaters(Array.isArray(theatersData) ? theatersData : []);
        setPatients(Array.isArray(patientsData) ? patientsData : []);
        setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load surgeries data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtered surgeries
  const filteredSurgeries = useMemo(() => {
    return surgeries.filter((surgery) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        surgery.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surgery.procedure.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surgery.surgeryNumber.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" || surgery.status === statusFilter;

      // Date range filter
      const matchesDateRange =
        (dateFrom === "" || surgery.scheduledDate >= dateFrom) &&
        (dateTo === "" || surgery.scheduledDate <= dateTo);

      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [surgeries, searchQuery, statusFilter, dateFrom, dateTo]);

  // Theater availability summary
  const theaterSummary = useMemo(() => {
    const summary = theaters.map((theater) => {
      const todaySurgeries = surgeries.filter(
        (s) => s.theaterId === theater.id && s.scheduledDate === new Date().toISOString().split("T")[0]
      );
      return {
        ...theater,
        todayCount: todaySurgeries.length,
        inUse: todaySurgeries.some((s) => s.status === "In Progress"),
      };
    });
    return summary;
  }, [theaters, surgeries]);

  // Statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return {
      total: surgeries.length,
      scheduled: surgeries.filter((s) => s.status === "Scheduled").length,
      inProgress: surgeries.filter((s) => s.status === "In Progress").length,
      today: surgeries.filter((s) => s.scheduledDate === today).length,
      completed: surgeries.filter((s) => s.status === "Completed").length,
      cancelled: surgeries.filter((s) => s.status === "Cancelled").length,
    };
  }, [surgeries]);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (!formData.patientId || !formData.procedure || !formData.scheduledDate || !formData.theaterId) {
        toast.error("Please fill in all required fields");
        return;
      }

      const surgeryData = {
        ...formData,
        consentFormSigned: false,
        preOpChecklist: defaultPreOpChecklist.map((item, idx) => ({
          id: `CHK-${idx}`,
          ...item,
        })),
      };

      if (editMode && selectedSurgery) {
        const res = await fetch("/api/surgeries", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedSurgery.id, ...surgeryData }),
        });
        const updated = await res.json();
        setSurgeries(surgeries.map((s) => (s.id === selectedSurgery.id ? updated : s)));
        toast.success("Surgery updated successfully");
      } else {
        const res = await fetch("/api/surgeries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(surgeryData),
        });
        const newSurgery = await res.json();
        setSurgeries([newSurgery, ...surgeries]);
        toast.success("Surgery scheduled successfully");
      }

      setScheduleDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save surgery:", error);
      toast.error("Failed to save surgery");
    }
  };

  // Handle status update
  const handleStatusUpdate = async (surgeryId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/surgeries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: surgeryId, status: newStatus }),
      });
      const updated = await res.json();
      setSurgeries(surgeries.map((s) => (s.id === surgeryId ? updated : s)));
      toast.success(`Surgery status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update surgery status");
    }
  };

  // Handle delete (cancel)
  const handleDelete = async (surgeryId: string) => {
    try {
      const res = await fetch(`/api/surgeries?id=${surgeryId}`, {
        method: "DELETE",
      });
      const updated = await res.json();
      setSurgeries(surgeries.map((s) => (s.id === surgeryId ? updated : s)));
      toast.success("Surgery cancelled successfully");
    } catch (error) {
      console.error("Failed to cancel surgery:", error);
      toast.error("Failed to cancel surgery");
    }
  };

  // Toggle checklist item
  const handleChecklistToggle = async (surgeryId: string, itemId: string) => {
    const surgery = surgeries.find((s) => s.id === surgeryId);
    if (!surgery) return;

    const updatedChecklist = surgery.preOpChecklist.map((item) =>
      item.id === itemId
        ? { ...item, completed: !item.completed, completedBy: "Current User", completedAt: new Date().toISOString() }
        : item
    );

    try {
      const res = await fetch("/api/surgeries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: surgeryId, preOpChecklist: updatedChecklist }),
      });
      const updated = await res.json();
      setSurgeries(surgeries.map((s) => (s.id === surgeryId ? updated : s)));
    } catch (error) {
      console.error("Failed to update checklist:", error);
      toast.error("Failed to update checklist");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      patientId: "",
      patientName: "",
      procedure: "",
      procedureCode: "",
      department: "",
      theaterId: "",
      theaterName: "",
      scheduledDate: "",
      scheduledTime: "",
      estimatedDuration: 60,
      anesthesiaType: "General",
      preOpDiagnosis: "",
      team: [],
    });
    setEditMode(false);
    setSelectedSurgery(null);
  };

  // Handle patient selection
  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    if (patient) {
      setFormData({
        ...formData,
        patientId: patient.id,
        patientName: patient.name,
        department: patient.ward,
      });
    }
  };

  // Handle theater selection
  const handleTheaterSelect = (theaterId: string) => {
    const theater = theaters.find((t) => t.id === theaterId);
    if (theater) {
      setFormData({
        ...formData,
        theaterId: theater.id,
        theaterName: theater.name,
      });
    }
  };

  // Open edit dialog
  const openEditDialog = (surgery: Surgery) => {
    setSelectedSurgery(surgery);
    setFormData({
      patientId: surgery.patientId,
      patientName: surgery.patientName,
      procedure: surgery.procedure,
      procedureCode: surgery.procedureCode,
      department: surgery.department,
      theaterId: surgery.theaterId,
      theaterName: surgery.theaterName,
      scheduledDate: surgery.scheduledDate,
      scheduledTime: surgery.scheduledTime,
      estimatedDuration: surgery.estimatedDuration,
      anesthesiaType: surgery.anesthesiaType,
      preOpDiagnosis: surgery.preOpDiagnosis,
      team: surgery.team,
    });
    setEditMode(true);
    setScheduleDialogOpen(true);
  };

  // Open details dialog
  const openDetailsDialog = (surgery: Surgery) => {
    setSelectedSurgery(surgery);
    setDetailsDialogOpen(true);
  };

  // Calculate checklist progress
  const getChecklistProgress = (checklist: PreOpChecklistItem[]) => {
    if (!checklist || checklist.length === 0) return 0;
    const completed = checklist.filter((item) => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  };

  // Get team members by role
  const getTeamByRole = (team: SurgeryTeam[], role: string) => {
    return team.filter((t) => t.role === role);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Activity className="w-8 h-8 text-primary" />
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Activity className="w-7 h-7 text-primary" />
              Surgeries
            </h1>
            <p className="text-muted-foreground">Manage surgical procedures and theater schedules</p>
          </div>
          <Button onClick={() => { resetForm(); setScheduleDialogOpen(true); }} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Schedule Surgery
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Total", value: stats.total, color: "text-foreground", icon: Activity },
            { label: "Scheduled", value: stats.scheduled, color: "text-blue-600", icon: Calendar },
            { label: "In Progress", value: stats.inProgress, color: "text-purple-600", icon: Timer },
            { label: "Today", value: stats.today, color: "text-amber-600", icon: Clock },
            { label: "Completed", value: stats.completed, color: "text-green-600", icon: CheckCircle2 },
            { label: "Cancelled", value: stats.cancelled, color: "text-gray-600", icon: AlertTriangle },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Theater Availability Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              Surgery Theater Availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {theaterSummary.map((theater) => (
                <motion.div
                  key={theater.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-3 rounded-lg border ${
                    theater.status === "Available"
                      ? "bg-green-500/5 border-green-500/20"
                      : theater.status === "In Use"
                      ? "bg-purple-500/5 border-purple-500/20"
                      : "bg-amber-500/5 border-amber-500/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{theater.name}</span>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        theater.status === "Available"
                          ? "bg-green-500"
                          : theater.status === "In Use"
                          ? "bg-purple-500 animate-pulse"
                          : "bg-amber-500"
                      }`}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {theater.status}
                    {theater.todayCount > 0 && ` • ${theater.todayCount} today`}
                  </p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by patient, procedure, or surgery number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Pre-Op">Pre-Op</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Postponed">Postponed</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  type="date"
                  placeholder="From"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full sm:w-36"
                />
                <Input
                  type="date"
                  placeholder="To"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full sm:w-36"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Surgeries List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredSurgeries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card>
                  <CardContent className="p-8 text-center">
                    <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg">No surgeries found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters or schedule a new surgery
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              filteredSurgeries.map((surgery, idx) => (
                <motion.div
                  key={surgery.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.03 }}
                  layout
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row">
                        {/* Status indicator */}
                        <div
                          className={`w-full lg:w-2 h-2 lg:h-auto ${
                            surgery.status === "Scheduled"
                              ? "bg-blue-500"
                              : surgery.status === "Pre-Op"
                              ? "bg-amber-500"
                              : surgery.status === "In Progress"
                              ? "bg-purple-500"
                              : surgery.status === "Completed"
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />

                        <div className="flex-1 p-4 lg:p-6">
                          {/* Header */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-mono text-muted-foreground">
                                  {surgery.surgeryNumber}
                                </span>
                                <Badge className={statusColors[surgery.status]}>
                                  {surgery.status}
                                </Badge>
                              </div>
                              <h3 className="text-lg font-semibold">{surgery.procedure}</h3>
                              <p className="text-muted-foreground">{surgery.procedureCode}</p>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openDetailsDialog(surgery)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditDialog(surgery)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(surgery.id, "In Progress")}
                                  disabled={surgery.status === "In Progress"}
                                >
                                  <Activity className="w-4 h-4 mr-2" />
                                  Start Surgery
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(surgery.id, "Completed")}
                                  disabled={surgery.status === "Completed"}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Mark Complete
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(surgery.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Cancel Surgery
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Info Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                            {/* Patient */}
                            <div className="flex items-start gap-2">
                              <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Patient</p>
                                <p className="font-medium">{surgery.patientName}</p>
                              </div>
                            </div>

                            {/* Date & Time */}
                            <div className="flex items-start gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Scheduled</p>
                                <p className="font-medium">
                                  {new Date(surgery.scheduledDate).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {surgery.scheduledTime}
                                </p>
                              </div>
                            </div>

                            {/* Theater */}
                            <div className="flex items-start gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Theater</p>
                                <p className="font-medium">{surgery.theaterName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {surgery.department}
                                </p>
                              </div>
                            </div>

                            {/* Duration */}
                            <div className="flex items-start gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Duration</p>
                                <p className="font-medium">{surgery.estimatedDuration} min</p>
                                {surgery.actualDuration && (
                                  <p className="text-sm text-muted-foreground">
                                    Actual: {surgery.actualDuration} min
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Anesthesia */}
                            <div className="flex items-start gap-2">
                              <Syringe className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Anesthesia</p>
                                <p className="font-medium">{surgery.anesthesiaType}</p>
                              </div>
                            </div>
                          </div>

                          {/* Surgery Team */}
                          <div className="mb-4">
                            <p className="text-xs text-muted-foreground mb-2">Surgical Team</p>
                            <div className="flex flex-wrap gap-2">
                              {getTeamByRole(surgery.team, "Lead Surgeon").map((t) => (
                                <Badge key={t.surgeonId} variant="outline" className="bg-primary/5">
                                  <Stethoscope className="w-3 h-3 mr-1" />
                                  {t.surgeonName} (Lead)
                                </Badge>
                              ))}
                              {getTeamByRole(surgery.team, "Assistant Surgeon").map((t) => (
                                <Badge key={t.surgeonId} variant="outline">
                                  {t.surgeonName} (Asst.)
                                </Badge>
                              ))}
                              {getTeamByRole(surgery.team, "Anesthesiologist").map((t) => (
                                <Badge key={t.surgeonId} variant="outline" className="bg-purple-500/5">
                                  <Syringe className="w-3 h-3 mr-1" />
                                  {t.surgeonName} (Anesth.)
                                </Badge>
                              ))}
                              {getTeamByRole(surgery.team, "Scrub Nurse").map((t) => (
                                <Badge key={t.surgeonId} variant="outline" className="bg-green-500/5">
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  {t.surgeonName}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Pre-Op Checklist Progress */}
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs text-muted-foreground">Pre-Op Checklist</p>
                                <p className="text-xs font-medium">
                                  {getChecklistProgress(surgery.preOpChecklist)}%
                                </p>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${getChecklistProgress(surgery.preOpChecklist)}%`,
                                  }}
                                  className={`h-full rounded-full ${
                                    getChecklistProgress(surgery.preOpChecklist) === 100
                                      ? "bg-green-500"
                                      : "bg-amber-500"
                                  }`}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              {surgery.consentFormSigned ? (
                                <Badge variant="outline" className="bg-green-500/10 text-green-600">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Consent Signed
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-500/10 text-amber-600">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Consent Pending
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Schedule Surgery Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Surgery" : "Schedule New Surgery"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Patient Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Patient *</Label>
              <Select
                value={formData.patientId}
                onValueChange={handlePatientSelect}
                disabled={editMode}
              >
                <SelectTrigger className="col-span-3">
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

            {/* Procedure Details */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Procedure *</Label>
              <Input
                className="col-span-3"
                placeholder="e.g., Appendectomy"
                value={formData.procedure}
                onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Procedure Code</Label>
              <Input
                className="col-span-3"
                placeholder="e.g., CPT-44950"
                value={formData.procedureCode}
                onChange={(e) => setFormData({ ...formData, procedureCode: e.target.value })}
              />
            </div>

            {/* Theater Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Theater *</Label>
              <Select value={formData.theaterId} onValueChange={handleTheaterSelect}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select theater" />
                </SelectTrigger>
                <SelectContent>
                  {theaters.map((theater) => (
                    <SelectItem key={theater.id} value={theater.id}>
                      {theater.name} - {theater.department} ({theater.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Department</Label>
              <Input
                className="col-span-3"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Date *</Label>
              <Input
                type="date"
                className="col-span-3"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Time *</Label>
              <Input
                type="time"
                className="col-span-3"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Duration (min)</Label>
              <Input
                type="number"
                className="col-span-3"
                value={formData.estimatedDuration}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 60 })
                }
              />
            </div>

            {/* Anesthesia */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Anesthesia</Label>
              <Select
                value={formData.anesthesiaType}
                onValueChange={(value) =>
                  setFormData({ ...formData, anesthesiaType: value as typeof formData.anesthesiaType })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {anesthesiaTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pre-Op Diagnosis */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Pre-Op Diagnosis</Label>
              <Input
                className="col-span-3"
                placeholder="Diagnosis before surgery"
                value={formData.preOpDiagnosis}
                onChange={(e) => setFormData({ ...formData, preOpDiagnosis: e.target.value })}
              />
            </div>

            {/* Lead Surgeon */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Lead Surgeon</Label>
              <Select
                value={formData.team.find(t => t.role === "Lead Surgeon")?.surgeonId || ""}
                onValueChange={(value) => {
                  const doctor = doctors.find(d => d.id === value);
                  if (doctor) {
                    const otherTeam = formData.team.filter(t => t.role !== "Lead Surgeon");
                    setFormData({
                      ...formData,
                      team: [...otherTeam, { surgeonId: doctor.id, surgeonName: doctor.name, role: "Lead Surgeon" }]
                    });
                  }
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select lead surgeon" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.slice(0, 30).map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Anesthesiologist */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Anesthesiologist</Label>
              <Select
                value={formData.team.find(t => t.role === "Anesthesiologist")?.surgeonId || ""}
                onValueChange={(value) => {
                  const doctor = doctors.find(d => d.id === value);
                  if (doctor) {
                    const otherTeam = formData.team.filter(t => t.role !== "Anesthesiologist");
                    setFormData({
                      ...formData,
                      team: [...otherTeam, { surgeonId: doctor.id, surgeonName: doctor.name, role: "Anesthesiologist" }]
                    });
                  }
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select anesthesiologist" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.slice(0, 30).map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{editMode ? "Update" : "Schedule"} Surgery</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Surgery Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Surgery Details</DialogTitle>
          </DialogHeader>

          {selectedSurgery && (
            <div className="space-y-6 py-4">
              {/* Header Info */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-mono text-muted-foreground">
                    {selectedSurgery.surgeryNumber}
                  </p>
                  <h3 className="text-xl font-bold">{selectedSurgery.procedure}</h3>
                </div>
                <Badge className={statusColors[selectedSurgery.status]}>
                  {selectedSurgery.status}
                </Badge>
              </div>

              {/* Patient Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Patient Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedSurgery.patientName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="font-medium">{selectedSurgery.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Theater</p>
                    <p className="font-medium">{selectedSurgery.theaterName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Anesthesia</p>
                    <p className="font-medium">{selectedSurgery.anesthesiaType}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Schedule */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Schedule</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {new Date(selectedSurgery.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="font-medium">{selectedSurgery.scheduledTime}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Est. Duration</p>
                    <p className="font-medium">{selectedSurgery.estimatedDuration} min</p>
                  </div>
                  {selectedSurgery.actualDuration && (
                    <div>
                      <p className="text-xs text-muted-foreground">Actual Duration</p>
                      <p className="font-medium">{selectedSurgery.actualDuration} min</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Surgical Team */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Surgical Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedSurgery.team.map((member) => (
                      <div
                        key={member.surgeonId}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {member.surgeonName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{member.surgeonName}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pre-Op Checklist */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Pre-Op Checklist ({getChecklistProgress(selectedSurgery.preOpChecklist)}%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedSurgery.preOpChecklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleChecklistToggle(selectedSurgery.id, item.id)}
                      >
                        <div className="flex items-center gap-2">
                          {item.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                          )}
                          <span className={item.completed ? "line-through text-muted-foreground" : ""}>
                            {item.item}
                          </span>
                        </div>
                        {item.completed && item.completedBy && (
                          <span className="text-xs text-muted-foreground">
                            by {item.completedBy}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedSurgery.notes && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{selectedSurgery.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => { setDetailsDialogOpen(false); openEditDialog(selectedSurgery!); }}>
              Edit Surgery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
