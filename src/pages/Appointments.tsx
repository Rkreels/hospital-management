"use client";

import React, { useState, useEffect, useMemo } from "react";
import { db } from '../lib/store';
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  Clock,
  List,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  User,
  Building2,
  Phone,
  FileText,
  CheckSquare,
  Square,
  Play,
  UserX,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
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
  DropdownMenuLabel,
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
import type { Appointment, AppointmentStatus, AppointmentType, Patient, Doctor, Department, TimeSlot } from "../types";

type ViewMode = "list" | "week" | "day";

const appointmentTypes: AppointmentType[] = [
  "Consultation",
  "Follow-up",
  "Emergency",
  "Routine Checkup",
  "Telemedicine",
  "Procedure",
];

const appointmentStatuses: AppointmentStatus[] = [
  "Scheduled",
  "Confirmed",
  "In Progress",
  "Completed",
  "Cancelled",
  "No Show",
];

const durationOptions = [15, 30, 45, 60, 90, 120];

const getStatusColor = (status: AppointmentStatus): string => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "Cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "No Show":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "In Progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Confirmed":
      return "bg-teal-100 text-teal-800 border-teal-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: AppointmentStatus) => {
  switch (status) {
    case "Completed":
      return <CheckCircle2 className="w-4 h-4" />;
    case "Cancelled":
      return <XCircle className="w-4 h-4" />;
    case "No Show":
      return <UserX className="w-4 h-4" />;
    case "In Progress":
      return <Play className="w-4 h-4" />;
    case "Confirmed":
      return <CheckCircle2 className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const getTypeColor = (type: AppointmentType): string => {
  switch (type) {
    case "Emergency":
      return "bg-red-50 text-red-700 border-red-200";
    case "Follow-up":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "Consultation":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Procedure":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Telemedicine":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    default:
      return "bg-green-50 text-green-700 border-green-200";
  }
};

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00",
];

interface AppointmentFormData {
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  departmentId: string;
  department: string;
  date: string;
  time: string;
  duration: number;
  type: AppointmentType;
  status: AppointmentStatus;
  chiefComplaint: string;
  notes: string;
}

const initialFormData: AppointmentFormData = {
  patientId: "",
  patientName: "",
  doctorId: "",
  doctorName: "",
  departmentId: "",
  department: "",
  date: new Date().toISOString().split("T")[0],
  time: "09:00",
  duration: 30,
  type: "Consultation",
  status: "Scheduled",
  chiefComplaint: "",
  notes: "",
};

export default function AppointmentsPage() {
  useRole(); // Role context for permissions
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<AppointmentFormData>(initialFormData);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);

  // Patient search
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  // Fetch data
  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchDoctors();
    fetchDepartments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = db.getAppointments();
      setAppointments(data);
    } catch {
      toast.error("Failed to fetch appointments");
    }
  };

  const fetchPatients = async () => {
    try {
      const data = db.getPatients();
      setPatients(data);
    } catch {
      toast.error("Failed to fetch patients");
    }
  };

  const fetchDoctors = async () => {
    try {
      const data = db.getDoctors();
      setDoctors(data);
    } catch {
      toast.error("Failed to fetch doctors");
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = db.getDepartments();
      setDepartments(data);
    } catch {
      toast.error("Failed to fetch departments");
    }
  };

  const fetchAvailableSlots = async (doctorId: string, date: string) => {
    if (!doctorId || !date) return;
    setLoadingSlots(true);
    try {
      const data = db.getAppointments()
      setAvailableSlots(data);
    } catch {
      toast.error("Failed to fetch available slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const matchesSearch =
        searchQuery === "" ||
        a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      const matchesType = typeFilter === "all" || a.type === typeFilter;
      const matchesDate = dateFilter === "" || a.date === dateFilter;

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [appointments, searchQuery, statusFilter, typeFilter, dateFilter]);

  // Today's appointments
  const today = new Date().toISOString().split("T")[0];
  const todayAppointments = useMemo(() => {
    return filteredAppointments.filter((a) => a.date === today);
  }, [filteredAppointments, today]);

  // Overdue/missed appointments
  const overdueAppointments = useMemo(() => {
    const now = new Date();
    return appointments.filter((a) => {
      if (a.status === "Scheduled" || a.status === "Confirmed") {
        const appointmentDate = new Date(`${a.date}T${a.time}`);
        return appointmentDate < now;
      }
      return false;
    });
  }, [appointments]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: appointments.length,
      today: todayAppointments.length,
      scheduled: appointments.filter((a) => a.status === "Scheduled").length,
      confirmed: appointments.filter((a) => a.status === "Confirmed").length,
      inProgress: appointments.filter((a) => a.status === "In Progress").length,
      completed: appointments.filter((a) => a.status === "Completed").length,
      cancelled: appointments.filter((a) => a.status === "Cancelled").length,
      overdue: overdueAppointments.length,
    };
  }, [appointments, todayAppointments, overdueAppointments]);

  // Calendar navigation
  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const navigateDate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(currentDate.getDate() + direction * 7);
    } else if (viewMode === "day") {
      newDate.setDate(currentDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Form handlers
  const handlePatientSelect = (patient: Patient) => {
    setFormData({
      ...formData,
      patientId: patient.id,
      patientName: patient.name,
    });
    setPatientSearchQuery(patient.name);
    setShowPatientDropdown(false);
  };

  const handleDoctorChange = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    if (doctor) {
      setFormData({
        ...formData,
        doctorId: doctor.id,
        doctorName: doctor.name,
        department: doctor.department,
        departmentId: doctor.departmentId || "",
      });
      if (formData.date) {
        fetchAvailableSlots(doctor.id, formData.date);
      }
    }
  };

  const handleDateChange = (date: string) => {
    setFormData({ ...formData, date });
    if (formData.doctorId) {
      fetchAvailableSlots(formData.doctorId, date);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientId || !formData.doctorId || !formData.date || !formData.time) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingAppointment) {
        const res = await fetch("/api/appointments", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingAppointment.id,
            ...formData,
          }),
        });
        if (res.ok) {
          toast.success("Appointment updated successfully");
          fetchAppointments();
          resetForm();
        }
      } else {
        const res = await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          toast.success("Appointment scheduled successfully");
          fetchAppointments();
          resetForm();
        }
      }
    } catch {
      toast.error("Failed to save appointment");
    }
  };

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        toast.success(`Appointment marked as ${status}`);
        fetchAppointments();
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      try {
        const res = await fetch("/api/appointments", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (res.ok) {
          toast.success("Appointment cancelled successfully");
          fetchAppointments();
        }
      } catch {
        toast.error("Failed to cancel appointment");
      }
    }
  };

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedIds.length === filteredAppointments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAppointments.map((a) => a.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkStatusChange = async (status: AppointmentStatus) => {
    if (selectedIds.length === 0) {
      toast.error("No appointments selected");
      return;
    }

    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch("/api/appointments", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status }),
          })
        )
      );
      toast.success(`${selectedIds.length} appointments updated to ${status}`);
      setSelectedIds([]);
      setIsBulkMode(false);
      fetchAppointments();
    } catch {
      toast.error("Failed to update appointments");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error("No appointments selected");
      return;
    }

    if (confirm(`Are you sure you want to cancel ${selectedIds.length} appointments?`)) {
      try {
        await Promise.all(
          selectedIds.map((id) =>
            fetch("/api/appointments", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id }),
            })
          )
        );
        toast.success(`${selectedIds.length} appointments cancelled`);
        setSelectedIds([]);
        setIsBulkMode(false);
        fetchAppointments();
      } catch {
        toast.error("Failed to cancel appointments");
      }
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingAppointment(null);
    setIsDialogOpen(false);
    setPatientSearchQuery("");
    setAvailableSlots([]);
  };

  const openEditDialog = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName,
      departmentId: appointment.departmentId || "",
      department: appointment.department,
      date: appointment.date,
      time: appointment.time,
      duration: appointment.duration,
      type: appointment.type,
      status: appointment.status,
      chiefComplaint: appointment.chiefComplaint || "",
      notes: appointment.notes || "",
    });
    setPatientSearchQuery(appointment.patientName);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Filter doctors by department
  const filteredDoctors = useMemo(() => {
    if (!formData.department) return doctors;
    return doctors.filter((d) => d.department === formData.department);
  }, [doctors, formData.department]);

  // Filter patients by search
  const filteredPatients = useMemo(() => {
    if (!patientSearchQuery) return patients.slice(0, 10);
    return patients
      .filter((p) => p.name.toLowerCase().includes(patientSearchQuery.toLowerCase()))
      .slice(0, 10);
  }, [patients, patientSearchQuery]);

  // Get appointments for a specific date and time
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getAppointmentsForSlot = (date: string, time: string) => {
    return filteredAppointments.filter(
      (a) => a.date === date && a.time <= time && time < a.time
    );
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: string) => {
    return filteredAppointments.filter((a) => a.date === date);
  };

  // Render list view
  const renderListView = () => (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/30 text-muted-foreground border-b border-border">
              <tr>
                {isBulkMode && (
                  <th className="px-4 py-4 font-medium w-12">
                    <button onClick={handleSelectAll} className="p-1">
                      {selectedIds.length === filteredAppointments.length ? (
                        <CheckSquare className="w-5 h-5 text-primary" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                )}
                <th className="px-6 py-4 font-medium">Queue</th>
                <th className="px-6 py-4 font-medium">Patient</th>
                <th className="px-6 py-4 font-medium">Doctor</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAppointments.map((appointment) => {
                const isToday = appointment.date === today;
                const isOverdue = overdueAppointments.some((a) => a.id === appointment.id);

                return (
                  <motion.tr
                    key={appointment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`hover:bg-muted/30 transition-colors ${
                      isToday ? "bg-primary/5" : ""
                    } ${isOverdue ? "bg-red-50" : ""}`}
                  >
                    {isBulkMode && (
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleSelectOne(appointment.id)}
                          className="p-1"
                        >
                          {selectedIds.includes(appointment.id) ? (
                            <CheckSquare className="w-5 h-5 text-primary" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-primary">
                        #{appointment.queueNumber || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${appointment.patientName}`}
                          />
                          <AvatarFallback>
                            {appointment.patientName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{appointment.patientName}</div>
                          {appointment.patientPhone && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {appointment.patientPhone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">{appointment.doctorName}</div>
                        <div className="text-xs text-muted-foreground">
                          {appointment.department}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className={`font-medium ${isToday ? "text-primary" : ""}`}>
                          {isToday && <span className="mr-1">Today</span>}
                          {new Date(appointment.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {appointment.time} ({appointment.duration} min)
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={getTypeColor(appointment.type)}
                      >
                        {appointment.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(appointment.status)} flex items-center gap-1 w-fit`}
                      >
                        {getStatusIcon(appointment.status)}
                        {appointment.status}
                      </Badge>
                      {isOverdue && (
                        <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Overdue
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setIsDetailsOpen(true);
                            }}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(appointment)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Change Status
                          </DropdownMenuLabel>
                          {appointmentStatuses.map((status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => handleStatusChange(appointment.id, status)}
                              disabled={appointment.status === status}
                            >
                              {getStatusIcon(status)}
                              <span className="ml-2">{status}</span>
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(appointment.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Cancel Appointment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredAppointments.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            No appointments found.
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Render week view
  const renderWeekView = () => {
    const weekDates = getWeekDates();
    const weekDatesStr = weekDates.map((d) => d.toISOString().split("T")[0]);

    return (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* Header */}
              <div className="grid grid-cols-8 border-b border-border bg-muted/20">
                <div className="p-4 border-r border-border text-center font-medium text-muted-foreground">
                  Time
                </div>
                {weekDates.map((date, index) => {
                  const isToday = date.toISOString().split("T")[0] === today;
                  return (
                    <div
                      key={index}
                      className={`p-4 border-r border-border last:border-0 text-center ${
                        isToday ? "bg-primary/10" : ""
                      }`}
                    >
                      <div className="text-xs text-muted-foreground">
                        {date.toLocaleDateString("en-US", { weekday: "short" })}
                      </div>
                      <div className={`text-lg font-semibold ${isToday ? "text-primary" : ""}`}>
                        {date.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time slots */}
              <div className="relative" style={{ maxHeight: "600px", overflowY: "auto" }}>
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className="grid grid-cols-8 border-b border-border/50 min-h-[60px]"
                  >
                    <div className="p-2 border-r border-border text-xs text-muted-foreground text-center">
                      {time}
                    </div>
                    {weekDatesStr.map((date, dayIndex) => {
                      const dayAppointments = getAppointmentsForDate(date);
                      const slotAppointments = dayAppointments.filter((a) => {
                        const appointmentHour = a.time ? parseInt(a.time.split(":")[0]) : 0;
                        const slotHour = time ? parseInt(time.split(":")[0]) : 0;
                        return appointmentHour === slotHour;
                      });

                      return (
                        <div
                          key={dayIndex}
                          className={`border-r border-border/50 last:border-0 p-1 min-h-[60px] ${
                            date === today ? "bg-primary/5" : ""
                          }`}
                        >
                          {slotAppointments.map((appointment) => (
                            <motion.div
                              key={appointment.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setIsDetailsOpen(true);
                              }}
                              className={`rounded-md p-2 mb-1 cursor-pointer text-xs border ${getTypeColor(
                                appointment.type
                              )}`}
                            >
                              <div className="font-medium truncate">
                                {appointment.patientName}
                              </div>
                              <div className="text-[10px] opacity-75 truncate">
                                {appointment.doctorName}
                              </div>
                              <Badge
                                variant="outline"
                                className={`mt-1 text-[10px] ${getStatusColor(appointment.status)}`}
                              >
                                {appointment.status}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render day view
  const renderDayView = () => {
    const currentDateStr = currentDate.toISOString().split("T")[0];
    const dayAppointments = getAppointmentsForDate(currentDateStr);
    const isToday = currentDateStr === today;

    return (
      <Card>
        <CardContent className="p-0">
            <div className="grid grid-cols-2 gap-0 divide-x divide-border">
            {/* Time slots */}
            <div className="relative" style={{ maxHeight: "600px", overflowY: "auto" }}>
              {timeSlots.map((time) => {
                const slotAppointments = dayAppointments.filter((a) => {
                  const appointmentHour = a.time ? parseInt(a.time.split(":")[0]) : 0;
                  const slotHour = time ? parseInt(time.split(":")[0]) : 0;
                  return appointmentHour === slotHour;
                });

                return (
                  <div
                    key={time}
                    className="flex border-b border-border/50 min-h-[80px]"
                  >
                    <div className="w-20 p-3 border-r border-border text-sm text-muted-foreground font-medium">
                      {time}
                    </div>
                    <div className="flex-1 p-2 space-y-1">
                      {slotAppointments.map((appointment) => (
                        <motion.div
                          key={appointment.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setIsDetailsOpen(true);
                          }}
                          className={`rounded-lg p-3 cursor-pointer border ${getTypeColor(
                            appointment.type
                          )}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${appointment.patientName}`}
                                />
                                <AvatarFallback>
                                  {appointment.patientName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{appointment.patientName}</div>
                                <div className="text-xs opacity-75">
                                  {appointment.doctorName} • {appointment.duration} min
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={getStatusColor(appointment.status)}
                            >
                              {appointment.status}
                            </Badge>
                          </div>
                          {appointment.chiefComplaint && (
                            <div className="mt-2 text-xs opacity-75">
                              {appointment.chiefComplaint}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Day summary */}
            <div className="p-6">
              <h3 className="font-semibold mb-4">
                {currentDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
                {isToday && (
                  <Badge className="ml-2 bg-primary">Today</Badge>
                )}
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">{dayAppointments.length}</div>
                    <div className="text-sm text-muted-foreground">Total Appointments</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">
                      {dayAppointments.filter((a) => a.status === "Completed").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Queue Status</h4>
                  {dayAppointments.slice(0, 5).map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">#{a.queueNumber}</span>
                        <span className="text-sm">{a.patientName}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={getStatusColor(a.status)}
                      >
                        {a.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Appointment Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Schedule, manage, and track patient appointments
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isBulkMode && selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusChange("Confirmed")}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Confirm ({selectedIds.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="text-destructive"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Cancel ({selectedIds.length})
                </Button>
              </div>
            )}
            <Button
              variant={isBulkMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setIsBulkMode(!isBulkMode);
                setSelectedIds([]);
              }}
            >
              {isBulkMode ? (
                <>
                  <X className="w-4 h-4 mr-1" />
                  Exit Bulk
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4 mr-1" />
                  Bulk Actions
                </>
              )}
            </Button>
            <Button onClick={openNewDialog}>
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </Card>
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="text-2xl font-bold text-primary">{stats.today}</div>
            <div className="text-xs text-muted-foreground">Today</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
            <div className="text-xs text-muted-foreground">Scheduled</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-teal-600">{stats.confirmed}</div>
            <div className="text-xs text-muted-foreground">Confirmed</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-indigo-600">{stats.inProgress}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-xs text-muted-foreground">Cancelled</div>
          </Card>
          <Card className={`p-4 ${stats.overdue > 0 ? "bg-red-50 border-red-200" : ""}`}>
            <div className="text-2xl font-bold text-red-600 flex items-center gap-1">
              {stats.overdue > 0 && <AlertTriangle className="w-5 h-5" />}
              {stats.overdue}
            </div>
            <div className="text-xs text-muted-foreground">Overdue</div>
          </Card>
        </div>

        {/* Overdue Alert */}
        {overdueAppointments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="font-medium text-red-800">
                  {overdueAppointments.length} Overdue Appointments
                </h4>
                <p className="text-sm text-red-600">
                  The following appointments have passed their scheduled time:
                  {overdueAppointments.slice(0, 3).map((a, i) => (
                    <span key={a.id}>
                      {i > 0 && ", "}
                      {" "}{a.patientName} ({a.date} {a.time})
                    </span>
                  ))}
                  {overdueAppointments.length > 3 && ` and ${overdueAppointments.length - 3} more`}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto border-red-300 text-red-700 hover:bg-red-100"
                onClick={() => setStatusFilter("Scheduled")}
              >
                View All
              </Button>
            </div>
          </motion.div>
        )}

        {/* Filters and View Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {appointmentStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {appointmentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-40"
            />

            {(statusFilter !== "all" || typeFilter !== "all" || dateFilter || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter("all");
                  setTypeFilter("all");
                  setDateFilter("");
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {viewMode !== "list" && (
              <div className="flex items-center bg-muted rounded-lg p-1 mr-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateDate(-1)}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToToday}
                  className="h-8 px-3"
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateDate(1)}
                  className="h-8 w-8"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-md"
              >
                <List className="w-4 h-4 mr-1" />
                List
              </Button>
              <Button
                variant={viewMode === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("week")}
                className="rounded-md"
              >
                <Grid3X3 className="w-4 h-4 mr-1" />
                Week
              </Button>
              <Button
                variant={viewMode === "day" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("day")}
                className="rounded-md"
              >
                <CalendarIcon className="w-4 h-4 mr-1" />
                Day
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {viewMode === "list" && renderListView()}
            {viewMode === "week" && renderWeekView()}
            {viewMode === "day" && renderDayView()}
          </motion.div>
        </AnimatePresence>

        {/* Appointment Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAppointment ? "Edit Appointment" : "Schedule New Appointment"}
              </DialogTitle>
              <DialogDescription>
                {editingAppointment
                  ? "Update appointment details below."
                  : "Fill in the appointment details to schedule a new appointment."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {/* Patient Selection */}
                <div className="space-y-2">
                  <Label>Patient *</Label>
                  <div className="relative">
                    <div className="relative">
                      <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        placeholder="Search patient by name..."
                        value={patientSearchQuery}
                        onChange={(e) => {
                          setPatientSearchQuery(e.target.value);
                          setShowPatientDropdown(true);
                        }}
                        onFocus={() => setShowPatientDropdown(true)}
                        className="pl-9"
                      />
                    </div>
                    {showPatientDropdown && filteredPatients.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredPatients.map((patient) => (
                          <button
                            key={patient.id}
                            type="button"
                            onClick={() => handlePatientSelect(patient)}
                            className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-3"
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{patient.name}</div>
                              <div className="text-xs text-muted-foreground">
                                MRN: {patient.mrn} • {patient.gender}, {patient.age} yrs
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {formData.patientId && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{formData.patientName}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-auto h-6 w-6 p-0"
                        onClick={() => {
                          setFormData({ ...formData, patientId: "", patientName: "" });
                          setPatientSearchQuery("");
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Department Selection */}
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) =>
                      setFormData({ ...formData, department: value, doctorId: "", doctorName: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            {dept.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Doctor Selection */}
                <div className="space-y-2">
                  <Label>Doctor *</Label>
                  <Select
                    value={formData.doctorId}
                    onValueChange={handleDoctorChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredDoctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.name}`}
                              />
                              <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div>{doctor.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {doctor.specialty} • {doctor.status}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      min={today}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time *</Label>
                    {loadingSlots ? (
                      <div className="flex items-center justify-center h-10 border rounded-lg">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <Select
                        value={formData.time}
                        onValueChange={(value) =>
                          setFormData({ ...formData, time: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSlots
                            .filter((slot) => slot.isAvailable)
                            .map((slot) => (
                              <SelectItem key={slot.id} value={slot.startTime}>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  {slot.startTime}
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type="time"
                        value={formData.time}
                        onChange={(e) =>
                          setFormData({ ...formData, time: e.target.value })
                        }
                        required
                      />
                    )}
                  </div>
                </div>

                {/* Duration & Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Select
                      value={formData.duration.toString()}
                      onValueChange={(value) =>
                        setFormData({ ...formData, duration: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {durationOptions.map((d) => (
                          <SelectItem key={d} value={d.toString()}>
                            {d} minutes
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Appointment Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: AppointmentType) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {appointmentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Status (for editing) */}
                {editingAppointment && (
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: AppointmentStatus) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {appointmentStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(status)}
                              {status}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Chief Complaint */}
                <div className="space-y-2">
                  <Label>Chief Complaint</Label>
                  <Input
                    value={formData.chiefComplaint}
                    onChange={(e) =>
                      setFormData({ ...formData, chiefComplaint: e.target.value })
                    }
                    placeholder="Reason for visit..."
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAppointment ? "Update" : "Schedule"} Appointment
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Appointment Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedAppointment.patientName}`}
                      />
                      <AvatarFallback>
                        {selectedAppointment.patientName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedAppointment.patientName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Queue #{selectedAppointment.queueNumber}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(selectedAppointment.status)} text-sm`}
                  >
                    {selectedAppointment.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="text-xs text-muted-foreground">Date</Label>
                    <p className="font-medium">{selectedAppointment.date}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Time</Label>
                    <p className="font-medium">
                      {selectedAppointment.time} ({selectedAppointment.duration} min)
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Doctor</Label>
                    <p className="font-medium">{selectedAppointment.doctorName}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Department</Label>
                    <p className="font-medium">{selectedAppointment.department}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Type</Label>
                    <Badge
                      variant="outline"
                      className={getTypeColor(selectedAppointment.type)}
                    >
                      {selectedAppointment.type}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">ID</Label>
                    <p className="font-medium font-mono text-sm">
                      {selectedAppointment.id}
                    </p>
                  </div>
                </div>

                {selectedAppointment.chiefComplaint && (
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Chief Complaint
                    </Label>
                    <p className="mt-1">{selectedAppointment.chiefComplaint}</p>
                  </div>
                )}

                {selectedAppointment.notes && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Notes</Label>
                    <p className="mt-1">{selectedAppointment.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsDetailsOpen(false);
                      openEditDialog(selectedAppointment);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      handleStatusChange(selectedAppointment.id, "In Progress");
                      setIsDetailsOpen(false);
                    }}
                    disabled={selectedAppointment.status === "In Progress"}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      handleStatusChange(selectedAppointment.id, "Completed");
                      setIsDetailsOpen(false);
                    }}
                    disabled={selectedAppointment.status === "Completed"}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }
