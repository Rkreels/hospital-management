"use client";

import React, { useState, useEffect } from "react";
import { db } from '../lib/store';
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  HeartPulse,
  Phone,
  Mail,
  Clock,
  Building,
  Award,
  Calendar,
  Users,
  UserCheck,
  Moon,
  Sun,
  Sunset,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
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
  DialogTrigger,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Nurse } from "../types";

const initialFormData = {
  name: "",
  department: "",
  departmentId: "",
  phone: "",
  email: "",
  status: "Available" as Nurse["status"],
  shift: "Morning" as Nurse["shift"],
  licenseNumber: "",
  specialization: "",
  yearsOfExperience: 0,
  assignedWard: "",
  assignedPatients: [] as string[],
  hireDate: new Date().toISOString().split("T")[0],
};

const shiftOptions: Nurse["shift"][] = ["Morning", "Afternoon", "Night", "Rotating"];
const statusOptions: Nurse["status"][] = ["Available", "On Leave", "Busy", "Off Duty", "On Call"];

const departments = [
  { id: "dept-1", name: "Emergency" },
  { id: "dept-2", name: "Cardiology" },
  { id: "dept-3", name: "Orthopedics" },
  { id: "dept-4", name: "Pediatrics" },
  { id: "dept-5", name: "Neurology" },
  { id: "dept-6", name: "Oncology" },
  { id: "dept-7", name: "Surgery" },
  { id: "dept-8", name: "ICU" },
];

export default function NursesPage() {
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterShift, setFilterShift] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNurse, setEditingNurse] = useState<Nurse | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNurses();
  }, []);

  const fetchNurses = async () => {
    setIsLoading(true);
    try {
      const data = db.getNurses();
      setNurses(data);
    } catch {
      toast.error("Failed to fetch nurses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dept = departments.find(d => d.name === formData.department);
      const submitData = {
        ...formData,
        departmentId: dept?.id || "",
        yearsOfExperience: Number(formData.yearsOfExperience),
      };

      if (editingNurse) {
        const res = await fetch("/api/nurses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingNurse.id, ...submitData }),
        });
        if (res.ok) {
          toast.success("Nurse updated successfully");
          fetchNurses();
          resetForm();
        }
      } else {
        const res = await fetch("/api/nurses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        });
        if (res.ok) {
          toast.success("Nurse added successfully");
          fetchNurses();
          resetForm();
        }
      }
    } catch {
      toast.error("Failed to save nurse");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this nurse?")) {
      try {
        const res = await fetch("/api/nurses", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (res.ok) {
          toast.success("Nurse deleted successfully");
          fetchNurses();
        }
      } catch {
        toast.error("Failed to delete nurse");
      }
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingNurse(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (nurse: Nurse) => {
    setEditingNurse(nurse);
    setFormData({
      name: nurse.name,
      department: nurse.department,
      departmentId: nurse.departmentId,
      phone: nurse.phone,
      email: nurse.email,
      status: nurse.status,
      shift: nurse.shift,
      licenseNumber: nurse.licenseNumber,
      specialization: nurse.specialization || "",
      yearsOfExperience: nurse.yearsOfExperience,
      assignedWard: nurse.assignedWard || "",
      assignedPatients: nurse.assignedPatients,
      hireDate: nurse.hireDate,
    });
    setIsDialogOpen(true);
  };

  const filteredNurses = nurses.filter((nurse) => {
    const matchesSearch =
      nurse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nurse.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nurse.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      filterDepartment === "all" || nurse.department === filterDepartment;
    const matchesShift =
      filterShift === "all" || nurse.shift === filterShift;
    const matchesStatus =
      filterStatus === "all" || nurse.status === filterStatus;
    return matchesSearch && matchesDepartment && matchesShift && matchesStatus;
  });

  // Summary statistics
  const totalNurses = nurses.length;
  const onDutyNurses = nurses.filter(
    (n) => n.status === "Available" || n.status === "Busy" || n.status === "On Call"
  ).length;
  const onLeaveNurses = nurses.filter((n) => n.status === "On Leave").length;
  const morningShift = nurses.filter((n) => n.shift === "Morning").length;
  const afternoonShift = nurses.filter((n) => n.shift === "Afternoon").length;
  const nightShift = nurses.filter((n) => n.shift === "Night").length;
  const rotatingShift = nurses.filter((n) => n.shift === "Rotating").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Busy":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "On Leave":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Off Duty":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      case "On Call":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getShiftIcon = (shift: string) => {
    switch (shift) {
      case "Morning":
        return <Sun className="w-4 h-4 text-amber-500" />;
      case "Afternoon":
        return <Sunset className="w-4 h-4 text-orange-500" />;
      case "Night":
        return <Moon className="w-4 h-4 text-indigo-500" />;
      case "Rotating":
        return <RefreshCw className="w-4 h-4 text-teal-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case "Morning":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "Afternoon":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "Night":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";
      case "Rotating":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              Nurses Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage nursing staff, shifts, and assignments
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Nurse
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingNurse ? "Edit Nurse" : "Add New Nurse"}
                </DialogTitle>
                <DialogDescription>
                  {editingNurse
                    ? "Update nurse information below."
                    : "Fill in the nurse details below."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">License Number *</Label>
                      <Input
                        id="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, licenseNumber: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department *</Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) =>
                          setFormData({ ...formData, department: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.name}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assignedWard">Assigned Ward</Label>
                      <Input
                        id="assignedWard"
                        value={formData.assignedWard}
                        onChange={(e) =>
                          setFormData({ ...formData, assignedWard: e.target.value })
                        }
                        placeholder="e.g., Ward A, ICU-B"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shift">Shift *</Label>
                      <Select
                        value={formData.shift}
                        onValueChange={(value: Nurse["shift"]) =>
                          setFormData({ ...formData, shift: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                        <SelectContent>
                          {shiftOptions.map((shift) => (
                            <SelectItem key={shift} value={shift}>
                              {shift}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: Nurse["status"]) =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        value={formData.specialization}
                        onChange={(e) =>
                          setFormData({ ...formData, specialization: e.target.value })
                        }
                        placeholder="e.g., Critical Care, Pediatric"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                      <Input
                        id="yearsOfExperience"
                        type="number"
                        min="0"
                        value={formData.yearsOfExperience}
                        onChange={(e) =>
                          setFormData({ ...formData, yearsOfExperience: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hireDate">Hire Date</Label>
                    <Input
                      id="hireDate"
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) =>
                        setFormData({ ...formData, hireDate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingNurse ? "Update" : "Add"} Nurse
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 border-rose-200 dark:border-rose-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-lg">
                    <Users className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Nurses</p>
                    <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">{totalNurses}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                    <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">On Duty</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{onDutyNurses}</p>
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
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">On Leave</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{onLeaveNurses}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                    <Sun className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Morning</p>
                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{morningShift}</p>
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
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                    <Sunset className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Afternoon</p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{afternoonShift}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 border-indigo-200 dark:border-indigo-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                    <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Night</p>
                    <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{nightShift}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 border-teal-200 dark:border-teal-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-lg">
                    <RefreshCw className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rotating</p>
                    <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">{rotatingShift}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Shift Schedule Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Shift Schedule Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {shiftOptions.map((shift) => {
                const shiftNurses = nurses.filter((n) => n.shift === shift);
                const availableInShift = shiftNurses.filter(
                  (n) => n.status === "Available" || n.status === "On Call"
                ).length;
                return (
                  <div
                    key={shift}
                    className="p-4 rounded-xl border border-border bg-muted/30"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {getShiftIcon(shift)}
                      <span className="font-medium">{shift} Shift</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-medium">{shiftNurses.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Available:</span>
                        <span className="font-medium text-green-600">{availableInShift}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                          style={{
                            width: `${
                              shiftNurses.length > 0
                                ? (availableInShift / shiftNurses.length) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search nurses by name, license, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterDepartment} onValueChange={setFilterDepartment}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.name}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterShift} onValueChange={setFilterShift}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Shift" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shifts</SelectItem>
              {shiftOptions.map((shift) => (
                <SelectItem key={shift} value={shift}>
                  {shift}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nurses Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-muted rounded-full mb-4" />
                  <div className="h-4 w-32 bg-muted rounded mb-2" />
                  <div className="h-3 w-24 bg-muted rounded mb-4" />
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-muted rounded" />
                    <div className="h-3 w-3/4 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredNurses.map((nurse) => (
                <motion.div
                  key={nurse.id}
                  variants={itemVariants}
                  layout
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-14 w-14 border-2 border-primary/20">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${nurse.name}&backgroundColor=ffdfbf`}
                              alt={nurse.name}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-white">
                              {nurse.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {nurse.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {nurse.employeeId}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(nurse)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(nurse.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building className="w-4 h-4 text-primary/70" />
                          <span>{nurse.department}</span>
                          {nurse.assignedWard && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded">
                              {nurse.assignedWard}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4 text-primary/70" />
                          <span>{nurse.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4 text-primary/70" />
                          <span className="truncate">{nurse.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Award className="w-4 h-4 text-primary/70" />
                          <span>License: {nurse.licenseNumber}</span>
                        </div>
                        {nurse.specialization && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <HeartPulse className="w-4 h-4 text-primary/70" />
                            <span>{nurse.specialization}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 text-primary/70" />
                          <span>{nurse.yearsOfExperience} years experience</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                          {getShiftIcon(nurse.shift)}
                          <Badge variant="outline" className={getShiftColor(nurse.shift)}>
                            {nurse.shift}
                          </Badge>
                        </div>
                        <Badge className={getStatusColor(nurse.status)}>
                          {nurse.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!isLoading && filteredNurses.length === 0 && (
          <div className="text-center py-12">
            <HeartPulse className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No nurses found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    );
  }
