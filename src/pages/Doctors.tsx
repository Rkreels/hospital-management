"use client";

import React, { useState, useEffect } from "react";
import { db } from '../lib/store';
import { motion } from "framer-motion";
import { Plus, Search, MoreVertical, Edit, Trash2, UserCheck, Phone, Mail } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
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

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  availability: string;
  department: string;
  status: "Available" | "On Leave" | "Busy" | "Off Duty";
  patientsCount: number;
}

const initialFormData = {
  name: "",
  specialty: "",
  phone: "",
  email: "",
  availability: "",
  department: "",
  status: "Available" as "Available" | "On Leave" | "Busy" | "Off Duty",
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const data = db.getDoctors();
      setDoctors(data);
    } catch {
      toast.error("Failed to fetch doctors");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        const updated = db.updateDoctor(editingDoctor.id, formData);
        if (updated) {
          toast.success("Doctor updated successfully");
          fetchDoctors();
          resetForm();
        }
      } else {
        const newDoctor = db.addDoctor({
          ...formData,
          patientsCount: 0,
        });
        if (newDoctor) {
          toast.success("Doctor added successfully");
          fetchDoctors();
          resetForm();
        }
      }
    } catch {
      toast.error("Failed to save doctor");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this doctor?")) {
      try {
        const deleted = db.deleteDoctor(id);
        if (deleted) {
          toast.success("Doctor deleted successfully");
          fetchDoctors();
        }
      } catch {
        toast.error("Failed to delete doctor");
      }
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingDoctor(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      specialty: doctor.specialty,
      phone: doctor.phone,
      email: doctor.email,
      availability: doctor.availability,
      department: doctor.department,
      status: doctor.status,
    });
    setIsDialogOpen(true);
  };

  const filteredDoctors = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "success";
      case "Busy":
        return "warning";
      case "On Leave":
        return "info";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Doctors
            </h1>
            <p className="text-muted-foreground mt-1">
              Directory of on-site doctors and specialties.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
              Total: {doctors.length}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Doctor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingDoctor
                      ? "Update doctor information below."
                      : "Fill in the doctor details below."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
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
                        <Label htmlFor="specialty">Specialty</Label>
                        <Input
                          id="specialty"
                          value={formData.specialty}
                          onChange={(e) =>
                            setFormData({ ...formData, specialty: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
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
                        <Label htmlFor="email">Email</Label>
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
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={formData.department}
                          onChange={(e) =>
                            setFormData({ ...formData, department: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="availability">Availability</Label>
                        <Input
                          id="availability"
                          value={formData.availability}
                          onChange={(e) =>
                            setFormData({ ...formData, availability: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: "Available" | "On Leave" | "Busy" | "Off Duty") =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Available">Available</SelectItem>
                          <SelectItem value="Busy">Busy</SelectItem>
                          <SelectItem value="On Leave">On Leave</SelectItem>
                          <SelectItem value="Off Duty">Off Duty</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingDoctor ? "Update" : "Add"} Doctor
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search doctors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredDoctors.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{doc.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {doc.specialty}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(doc)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(doc.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {doc.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    {doc.email}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {doc.availability}
                  </span>
                  <Badge
                    variant={getStatusColor(doc.status) as "success" | "warning" | "info" | "secondary"}
                  >
                    {doc.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredDoctors.length === 0 && (
            <div className="col-span-full p-12 text-center text-muted-foreground">
              No doctors found.
            </div>
          )}
        </motion.div>
      </div>
    );
  }
