"use client";

import React, { useState, useEffect, useMemo } from "react";
import { db } from '../lib/store';
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, MoreVertical, Eye, Edit, Trash2, Users, UserCheck,
  UserX, Building2, Calendar, Clock, Award, Download, X, Check, AlertCircle,
  Briefcase, GraduationCap, CalendarDays
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
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
import { useRole, usePermission } from '../context/RoleContext';
import { toast } from "react-toastify";
import { Staff, Certification, StaffSchedule, AttendanceRecord, LeaveRecord } from "../types";

const roles = ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_technician', 'hr_manager', 'finance_manager'] as const;
const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology', 'Emergency', 'ICU', 'Surgery', 'Maternity', 'Radiology', 'Pathology', 'Pharmacy'] as const;
const statuses = ['Active', 'On Leave', 'Terminated', 'Suspended'] as const;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const leaveTypes = ['Annual', 'Sick', 'Conference', 'Personal', 'Other'] as const;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const shiftTypes = ['Morning', 'Afternoon', 'Night'] as const;

const roleLabels: Record<string, string> = {
  admin: 'Administrator',
  doctor: 'Doctor',
  nurse: 'Nurse',
  receptionist: 'Receptionist',
  pharmacist: 'Pharmacist',
  lab_technician: 'Lab Technician',
  hr_manager: 'HR Manager',
  finance_manager: 'Finance Manager',
};

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const initialStaffForm = {
  name: '',
  role: 'nurse' as Staff['role'],
  department: 'Cardiology',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: 'Male' as 'Male' | 'Female' | 'Other',
  address: '',
  emergencyContactName: '',
  emergencyContactRelationship: '',
  emergencyContactPhone: '',
  joinDate: new Date().toISOString().split('T')[0],
  status: 'Active' as Staff['status'],
  qualifications: [] as string[],
  certifications: [] as Certification[],
  salary: 0,
};

const initialCertificationForm = {
  name: '',
  issuingAuthority: '',
  issueDate: '',
  expiryDate: '',
  certificateNumber: '',
};

// Generate fake leave records
const generateLeaveRecords = (): LeaveRecord[] => {
  const leaves: LeaveRecord[] = [];
  const types: LeaveRecord['type'][] = ['Annual', 'Sick', 'Conference', 'Personal', 'Other'];
  const statuses: LeaveRecord['status'][] = ['Pending', 'Approved', 'Rejected'];
  
  for (let i = 0; i < 5; i++) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 60) - 10);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 10) + 1);
    
    leaves.push({
      id: `LEAVE-${Date.now()}-${i}`,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      type: types[Math.floor(Math.random() * types.length)],
      reason: ['Family emergency', 'Medical appointment', 'Vacation', 'Conference attendance', 'Personal matters'][Math.floor(Math.random() * 5)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      approvedBy: Math.random() > 0.5 ? 'Admin User' : undefined,
    });
  }
  
  return leaves;
};

// Generate fake attendance records
const generateAttendanceRecords = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const statuses: AttendanceRecord['status'][] = ['Present', 'Absent', 'Late', 'Early Leave', 'On Leave'];
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    if (date.getDay() === 0 || date.getDay() === 6) continue; // Skip weekends
    
    const status = Math.random() > 0.2 ? 'Present' : statuses[Math.floor(Math.random() * statuses.length)];
    const checkIn = status === 'Present' || status === 'Late' 
      ? `${8 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` 
      : undefined;
    const checkOut = status === 'Present' || status === 'Early Leave'
      ? `${17 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
      : undefined;
    
    records.push({
      id: `ATT-${Date.now()}-${i}`,
      date: date.toISOString().split('T')[0],
      checkIn,
      checkOut,
      status,
      notes: status === 'Late' ? 'Traffic delay' : undefined,
    });
  }
  
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Generate fake schedule
const generateSchedule = (): StaffSchedule[] => {
  return [1, 2, 3, 4, 5].map(day => ({
    id: `SCH-${day}`,
    dayOfWeek: day,
    startTime: '08:00',
    endTime: '17:00',
    shift: ['Morning', 'Afternoon', 'Night'][Math.floor(Math.random() * 3)] as StaffSchedule['shift'],
  }));
};

export default function StaffManagementPage() {
  const { currentRole } = useRole();
  const canEdit = usePermission('staff', 'edit');
  const canDelete = usePermission('staff', 'delete');
  const canCreate = usePermission('staff', 'create');
  
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog states
  const [viewingStaff, setViewingStaff] = useState<Staff | null>(null);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [selectedStaffForLeave, _setSelectedStaffForLeave] = useState<Staff | null>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'directory' | 'leaves'>('directory');
  
  // Form states
  const [staffForm, setStaffForm] = useState(initialStaffForm);
  const [certificationForm, setCertificationForm] = useState(initialCertificationForm);
  const [newQualification, setNewQualification] = useState('');
  
  // Leave records for management
  const [allLeaveRecords, setAllLeaveRecords] = useState<(LeaveRecord & { staffId: string; staffName: string })[]>([]);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const doctors = db.getDoctors();
      const nurses = db.getNurses();
      
      const data: Staff[] = [...doctors, ...nurses].map(s => ({
        ...s,
        role: s.role || (doctors.some(d => d.id === s.id) ? 'doctor' : 'nurse') as Staff['role'],
        certifications: (s as unknown as Staff).certifications || [],
        qualifications: (s as unknown as Staff).qualifications || [],
        schedule: (s as unknown as Staff).schedule || generateSchedule(),
        attendance: (s as unknown as Staff).attendance || generateAttendanceRecords(),
        leaveBalance: (s as unknown as Staff).leaveBalance || { annual: 15, sick: 10, personal: 5 },
      }));
      
      setStaffList(data);
      
      // Generate all leave records for leave management
      const leaves: (LeaveRecord & { staffId: string; staffName: string })[] = [];
      data.forEach(staff => {
        const staffLeaves = generateLeaveRecords();
        staffLeaves.forEach(leave => {
          leaves.push({ ...leave, staffId: staff.id, staffName: staff.name });
        });
      });
      setAllLeaveRecords(leaves);
    } catch {
      toast.error("Failed to fetch staff data");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered staff
  const filteredStaff = useMemo(() => {
    let filtered = staffList;
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(s => s.role === roleFilter);
    }
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(s => s.department === departmentFilter);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.employeeId.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.department?.toLowerCase().includes(q)
      );
    }
    
    return filtered;
  }, [staffList, roleFilter, departmentFilter, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = staffList.length;
    const active = staffList.filter(s => s.status === 'Active').length;
    const onLeave = staffList.filter(s => s.status === 'On Leave').length;
    const byDepartment = departments.map(dept => ({
      department: dept,
      count: staffList.filter(s => s.department === dept).length,
    })).filter(d => d.count > 0);
    
    return { total, active, onLeave, byDepartment };
  }, [staffList]);

  // CRUD operations
  const handleCreateStaff = async () => {
    try {
      if (staffForm.role === 'doctor') {
        const newDoctor = db.addDoctor({
          name: staffForm.name,
          department: staffForm.department,
          email: staffForm.email,
          phone: staffForm.phone,
          specialty: staffForm.department,
          status: staffForm.status as 'Available' | 'On Leave' | 'Busy' | 'Off Duty',
          availability: '9:00 AM - 5:00 PM',
          patientsCount: 0,
        });
        if (newDoctor) {
          toast.success("Staff member created successfully");
          fetchStaff();
          resetForm();
        }
      } else if (staffForm.role === 'nurse') {
        const newNurse = db.addNurse({
          name: staffForm.name,
          department: staffForm.department,
          email: staffForm.email,
          phone: staffForm.phone,
          status: staffForm.status as 'Available' | 'On Leave' | 'Busy' | 'Off Duty',
          shift: 'Morning',
        });
        if (newNurse) {
          toast.success("Staff member created successfully");
          fetchStaff();
          resetForm();
        }
      } else {
        toast.error("Unsupported role for staff creation");
      }
    } catch {
      toast.error("Failed to create staff member");
    }
  };

  const handleUpdateStaff = async () => {
    if (!editingStaff) return;
    try {
      const isDoctor = db.getDoctors().some(d => d.id === editingStaff.id);
      const isNurse = db.getNurses().some(n => n.id === editingStaff.id);
      
      if (isDoctor) {
        const updated = db.updateDoctor(editingStaff.id, {
          name: staffForm.name,
          department: staffForm.department,
          email: staffForm.email,
          phone: staffForm.phone,
          specialty: staffForm.department,
          status: staffForm.status as 'Available' | 'On Leave' | 'Busy' | 'Off Duty',
        });
        if (updated) {
          toast.success("Staff member updated successfully");
          fetchStaff();
          resetForm();
        }
      } else if (isNurse) {
        const updated = db.updateNurse(editingStaff.id, {
          name: staffForm.name,
          department: staffForm.department,
          email: staffForm.email,
          phone: staffForm.phone,
          status: staffForm.status as 'Available' | 'On Leave' | 'Busy' | 'Off Duty',
        });
        if (updated) {
          toast.success("Staff member updated successfully");
          fetchStaff();
          resetForm();
        }
      } else {
        toast.error("Staff member not found");
      }
    } catch {
      toast.error("Failed to update staff member");
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;
    try {
      const isDoctor = db.getDoctors().some(d => d.id === id);
      const isNurse = db.getNurses().some(n => n.id === id);
      
      let deleted = false;
      if (isDoctor) {
        deleted = db.deleteDoctor(id);
      } else if (isNurse) {
        deleted = db.deleteNurse(id);
      }
      
      if (deleted) {
        toast.success("Staff member deleted successfully");
        fetchStaff();
      } else {
        toast.error("Failed to delete staff member");
      }
    } catch {
      toast.error("Failed to delete staff member");
    }
  };

  const handleLeaveAction = async (staffId: string, leaveId: string, action: 'approve' | 'reject') => {
    setAllLeaveRecords(prev => prev.map(leave => {
      if (leave.staffId === staffId && leave.id === leaveId) {
        return {
          ...leave,
          status: action === 'approve' ? 'Approved' : 'Rejected',
          approvedBy: 'Admin User',
        };
      }
      return leave;
    }));
    toast.success(`Leave request ${action}d successfully`);
  };

  // Helper functions
  const resetForm = () => {
    setStaffForm(initialStaffForm);
    setCertificationForm(initialCertificationForm);
    setNewQualification('');
    setEditingStaff(null);
    setIsStaffDialogOpen(false);
  };

  const openEditDialog = (staff: Staff) => {
    setStaffForm({
      name: staff.name,
      role: staff.role,
      department: staff.department || 'Cardiology',
      email: staff.email,
      phone: staff.phone,
      dateOfBirth: staff.dateOfBirth || '',
      gender: staff.gender || 'Male',
      address: staff.address || '',
      emergencyContactName: staff.emergencyContact?.name || '',
      emergencyContactRelationship: staff.emergencyContact?.relationship || '',
      emergencyContactPhone: staff.emergencyContact?.phone || '',
      joinDate: staff.joinDate,
      status: staff.status,
      qualifications: staff.qualifications || [],
      certifications: staff.certifications || [],
      salary: staff.salary || 0,
    });
    setEditingStaff(staff);
    setIsStaffDialogOpen(true);
  };

  const addQualification = () => {
    if (newQualification.trim()) {
      setStaffForm(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, newQualification.trim()],
      }));
      setNewQualification('');
    }
  };

  const removeQualification = (index: number) => {
    setStaffForm(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index),
    }));
  };

  const addCertification = () => {
    if (certificationForm.name.trim()) {
      setStaffForm(prev => ({
        ...prev,
        certifications: [...prev.certifications, {
          id: `CERT-${Date.now()}`,
          ...certificationForm,
        }],
      }));
      setCertificationForm(initialCertificationForm);
    }
  };

  const removeCertification = (id: string) => {
    setStaffForm(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c.id !== id),
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'On Leave': return 'warning';
      case 'Terminated': return 'destructive';
      case 'Suspended': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'doctor': return 'default';
      case 'nurse': return 'secondary';
      case 'admin': return 'destructive';
      default: return 'outline';
    }
  };

  const exportToCSV = () => {
    const headers = ['Employee ID', 'Name', 'Role', 'Department', 'Email', 'Phone', 'Join Date', 'Status'];
    const rows = filteredStaff.map(s => [
      s.employeeId,
      s.name,
      roleLabels[s.role] || s.role,
      s.department || '',
      s.email,
      s.phone,
      s.joinDate,
      s.status,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff-directory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  };

  // Leave management filter
  const pendingLeaves = allLeaveRecords.filter(l => l.status === 'Pending');
  const filteredLeaves = selectedStaffForLeave 
    ? allLeaveRecords.filter(l => l.staffId === selectedStaffForLeave.id)
    : allLeaveRecords;

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Staff Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage staff directory, leaves, and attendance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            {canCreate && (
              <Button onClick={() => {
                resetForm();
                setIsStaffDialogOpen(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On Leave</p>
                <p className="text-2xl font-bold">{stats.onLeave}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold">{stats.byDepartment.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Department Distribution */}
        <Card className="p-4">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff by Department</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="flex flex-wrap gap-2">
              {stats.byDepartment.map(d => (
                <Badge key={d.department} variant="outline" className="px-3 py-1">
                  {d.department}: {d.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex gap-6">
            {[
              { id: 'directory', label: 'Staff Directory', icon: Users },
              { id: 'leaves', label: 'Leave Management', icon: CalendarDays },
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
                {tab.id === 'leaves' && pendingLeaves.length > 0 && (
                  <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-xs">
                    {pendingLeaves.length}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {activeTab === 'directory' && (
            <div className="flex gap-2 flex-wrap">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>
                      {roleLabels[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'directory' && (
            <motion.div
              key="directory"
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
                          <th className="px-6 py-4 font-medium">Employee</th>
                          <th className="px-6 py-4 font-medium">Role</th>
                          <th className="px-6 py-4 font-medium">Department</th>
                          <th className="px-6 py-4 font-medium">Contact</th>
                          <th className="px-6 py-4 font-medium">Join Date</th>
                          <th className="px-6 py-4 font-medium">Status</th>
                          <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredStaff.map((staff) => (
                          <tr key={staff.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.name}`} />
                                  <AvatarFallback>{(staff.name || '').split(' ').map(n => n[0]).join('').substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{staff.name}</p>
                                  <p className="text-xs text-muted-foreground">{staff.employeeId}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant={getRoleBadgeVariant(staff.role)}>
                                {roleLabels[staff.role]}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">{staff.department}</td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm">{staff.email}</p>
                                <p className="text-xs text-muted-foreground">{staff.phone}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">{staff.joinDate}</td>
                            <td className="px-6 py-4">
                              <Badge variant={getStatusColor(staff.status) as "success" | "warning" | "destructive" | "secondary"}>
                                {staff.status}
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
                                  <DropdownMenuItem onClick={() => {
                                    setViewingStaff(staff);
                                    setIsDetailsDialogOpen(true);
                                  }}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {canEdit && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => openEditDialog(staff)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Staff
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {canDelete && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteStaff(staff.id)}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Staff
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
                  {filteredStaff.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                      No staff members found.
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'leaves' && (
            <motion.div
              key="leaves"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Leave Requests</CardTitle>
                  <CardDescription>Review and manage staff leave requests</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/30 text-muted-foreground border-b border-border">
                        <tr>
                          <th className="px-6 py-4 font-medium">Staff</th>
                          <th className="px-6 py-4 font-medium">Type</th>
                          <th className="px-6 py-4 font-medium">Duration</th>
                          <th className="px-6 py-4 font-medium">Reason</th>
                          <th className="px-6 py-4 font-medium">Status</th>
                          <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredLeaves.map((leave) => (
                          <tr key={leave.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${leave.staffName}`} />
                                  <AvatarFallback>{(leave.staffName || '').split(' ').map(n => n[0]).join('').substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{leave.staffName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="outline">{leave.type}</Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p>{leave.startDate}</p>
                                <p className="text-xs text-muted-foreground">to {leave.endDate}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">{leave.reason}</td>
                            <td className="px-6 py-4">
                              <Badge variant={
                                leave.status === 'Approved' ? 'success' :
                                leave.status === 'Rejected' ? 'destructive' :
                                'warning'
                              }>
                                {leave.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {leave.status === 'Pending' && (currentRole === 'admin' || currentRole === 'hr_manager') ? (
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleLeaveAction(leave.staffId, leave.id, 'approve')}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleLeaveAction(leave.staffId, leave.id, 'reject')}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  {leave.approvedBy && `By ${leave.approvedBy}`}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredLeaves.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                      No leave requests found.
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Staff Form Dialog */}
        <Dialog open={isStaffDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsStaffDialogOpen(true); }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
              <DialogDescription>
                {editingStaff ? 'Update staff information' : 'Enter details for the new staff member'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={staffForm.name}
                      onChange={(e) => setStaffForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={staffForm.email}
                      onChange={(e) => setStaffForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={staffForm.phone}
                      onChange={(e) => setStaffForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={staffForm.dateOfBirth}
                      onChange={(e) => setStaffForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={staffForm.gender} onValueChange={(v) => setStaffForm(prev => ({ ...prev, gender: v as 'Male' | 'Female' | 'Other' }))}>
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
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={staffForm.address}
                      onChange={(e) => setStaffForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Full address"
                    />
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Employment Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select value={staffForm.role} onValueChange={(v) => setStaffForm(prev => ({ ...prev, role: v as Staff['role'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role} value={role}>{roleLabels[role]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select value={staffForm.department} onValueChange={(v) => setStaffForm(prev => ({ ...prev, department: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joinDate">Join Date *</Label>
                    <Input
                      id="joinDate"
                      type="date"
                      value={staffForm.joinDate}
                      onChange={(e) => setStaffForm(prev => ({ ...prev, joinDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select value={staffForm.status} onValueChange={(v) => setStaffForm(prev => ({ ...prev, status: v as Staff['status'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={staffForm.salary}
                      onChange={(e) => setStaffForm(prev => ({ ...prev, salary: parseFloat(e.target.value) || 0 }))}
                      placeholder="Annual salary"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Emergency Contact
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyName">Name</Label>
                    <Input
                      id="emergencyName"
                      value={staffForm.emergencyContactName}
                      onChange={(e) => setStaffForm(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                      placeholder="Contact name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyRelation">Relationship</Label>
                    <Input
                      id="emergencyRelation"
                      value={staffForm.emergencyContactRelationship}
                      onChange={(e) => setStaffForm(prev => ({ ...prev, emergencyContactRelationship: e.target.value }))}
                      placeholder="e.g., Spouse"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Phone</Label>
                    <Input
                      id="emergencyPhone"
                      value={staffForm.emergencyContactPhone}
                      onChange={(e) => setStaffForm(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Qualifications */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Qualifications
                </h4>
                <div className="flex gap-2">
                  <Input
                    value={newQualification}
                    onChange={(e) => setNewQualification(e.target.value)}
                    placeholder="Add qualification (e.g., MD, RN, BSc)"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addQualification())}
                  />
                  <Button type="button" variant="outline" onClick={addQualification}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {staffForm.qualifications.map((qual, i) => (
                    <Badge key={i} variant="secondary" className="pr-1">
                      {qual}
                      <button
                        type="button"
                        onClick={() => removeQualification(i)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Certifications
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={certificationForm.name}
                    onChange={(e) => setCertificationForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Certification name"
                  />
                  <Input
                    value={certificationForm.issuingAuthority}
                    onChange={(e) => setCertificationForm(prev => ({ ...prev, issuingAuthority: e.target.value }))}
                    placeholder="Issuing authority"
                  />
                  <Input
                    type="date"
                    value={certificationForm.issueDate}
                    onChange={(e) => setCertificationForm(prev => ({ ...prev, issueDate: e.target.value }))}
                    placeholder="Issue date"
                  />
                  <Input
                    type="date"
                    value={certificationForm.expiryDate}
                    onChange={(e) => setCertificationForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                    placeholder="Expiry date"
                  />
                  <Input
                    value={certificationForm.certificateNumber}
                    onChange={(e) => setCertificationForm(prev => ({ ...prev, certificateNumber: e.target.value }))}
                    placeholder="Certificate #"
                  />
                  <Button type="button" variant="outline" onClick={addCertification}>Add Certification</Button>
                </div>
                <div className="space-y-2">
                  {staffForm.certifications.map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{cert.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {cert.issuingAuthority} | {cert.issueDate}
                          {cert.expiryDate && ` | Expires: ${cert.expiryDate}`}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCertification(cert.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={editingStaff ? handleUpdateStaff : handleCreateStaff}>
                {editingStaff ? 'Update' : 'Create'} Staff Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Staff Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Staff Details</DialogTitle>
            </DialogHeader>
            
            {viewingStaff && (
              <div className="space-y-6 py-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${viewingStaff.name}`} />
                    <AvatarFallback className="text-2xl">{(viewingStaff.name || '').split(' ').map(n => n[0]).join('').substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-bold">{viewingStaff.name}</h3>
                    <p className="text-muted-foreground">{viewingStaff.employeeId}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={getRoleBadgeVariant(viewingStaff.role)}>{roleLabels[viewingStaff.role]}</Badge>
                      <Badge variant={getStatusColor(viewingStaff.status) as "success" | "warning" | "destructive" | "secondary"}>{viewingStaff.status}</Badge>
                    </div>
                  </div>
                </div>

                {/* Personal Info */}
                <Card className="p-4">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium">{viewingStaff.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-medium">{viewingStaff.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Department</p>
                        <p className="font-medium">{viewingStaff.department}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Join Date</p>
                        <p className="font-medium">{viewingStaff.joinDate}</p>
                      </div>
                      {viewingStaff.dateOfBirth && (
                        <div>
                          <p className="text-xs text-muted-foreground">Date of Birth</p>
                          <p className="font-medium">{viewingStaff.dateOfBirth}</p>
                        </div>
                      )}
                      {viewingStaff.gender && (
                        <div>
                          <p className="text-xs text-muted-foreground">Gender</p>
                          <p className="font-medium">{viewingStaff.gender}</p>
                        </div>
                      )}
                      {viewingStaff.address && (
                        <div className="col-span-2">
                          <p className="text-xs text-muted-foreground">Address</p>
                          <p className="font-medium">{viewingStaff.address}</p>
                        </div>
                      )}
                    </div>
                    {viewingStaff.emergencyContact && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Emergency Contact</p>
                        <p className="font-medium">{viewingStaff.emergencyContact.name} ({viewingStaff.emergencyContact.relationship}) - {viewingStaff.emergencyContact.phone}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Qualifications & Certifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <CardHeader className="p-0 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Qualifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 pt-4">
                      <div className="flex flex-wrap gap-2">
                        {viewingStaff.qualifications?.map((qual, i) => (
                          <Badge key={i} variant="secondary">{qual}</Badge>
                        ))}
                        {(!viewingStaff.qualifications || viewingStaff.qualifications.length === 0) && (
                          <p className="text-sm text-muted-foreground">No qualifications recorded</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="p-4">
                    <CardHeader className="p-0 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Certifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 pt-4">
                      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                        {viewingStaff.certifications?.map((cert) => (
                          <div key={cert.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                            <div>
                              <p className="font-medium text-sm">{cert.name}</p>
                              <p className="text-xs text-muted-foreground">{cert.issuingAuthority}</p>
                            </div>
                            {cert.expiryDate && (
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Expires</p>
                                <p className="text-xs font-medium">{cert.expiryDate}</p>
                              </div>
                            )}
                          </div>
                        ))}
                        {(!viewingStaff.certifications || viewingStaff.certifications.length === 0) && (
                          <p className="text-sm text-muted-foreground">No certifications recorded</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Schedule */}
                <Card className="p-4">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Weekly Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-4">
                    <div className="grid grid-cols-5 gap-2">
                      {viewingStaff.schedule?.sort((a, b) => a.dayOfWeek - b.dayOfWeek).map((sch) => (
                        <div key={sch.id} className="p-3 bg-muted/50 rounded text-center">
                          <p className="font-medium text-sm">{dayNames[sch.dayOfWeek]}</p>
                          <p className="text-xs text-muted-foreground">{sch.startTime} - {sch.endTime}</p>
                          <Badge variant="outline" className="mt-1 text-xs">{sch.shift}</Badge>
                        </div>
                      ))}
                      {(!viewingStaff.schedule || viewingStaff.schedule.length === 0) && (
                        <p className="text-sm text-muted-foreground col-span-5">No schedule defined</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Attendance */}
                <Card className="p-4">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Recent Attendance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-4">
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-background">
                          <tr className="border-b">
                            <th className="text-left py-2 font-medium">Date</th>
                            <th className="text-left py-2 font-medium">Check In</th>
                            <th className="text-left py-2 font-medium">Check Out</th>
                            <th className="text-left py-2 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewingStaff.attendance?.slice(0, 10).map((att) => (
                            <tr key={att.id} className="border-b">
                              <td className="py-2">{att.date}</td>
                              <td className="py-2">{att.checkIn || '-'}</td>
                              <td className="py-2">{att.checkOut || '-'}</td>
                              <td className="py-2">
                                <Badge variant={
                                  att.status === 'Present' ? 'success' :
                                  att.status === 'Absent' ? 'destructive' :
                                  att.status === 'Late' ? 'warning' :
                                  'secondary'
                                } className="text-xs">
                                  {att.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Leave Balance */}
                {viewingStaff.leaveBalance && (
                  <Card className="p-4">
                    <CardHeader className="p-0 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        Leave Balance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 pt-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-muted/50 rounded">
                          <p className="text-2xl font-bold text-blue-600">{viewingStaff.leaveBalance.annual}</p>
                          <p className="text-xs text-muted-foreground">Annual Leave</p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded">
                          <p className="text-2xl font-bold text-red-600">{viewingStaff.leaveBalance.sick}</p>
                          <p className="text-xs text-muted-foreground">Sick Leave</p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded">
                          <p className="text-2xl font-bold text-green-600">{viewingStaff.leaveBalance.personal}</p>
                          <p className="text-xs text-muted-foreground">Personal Leave</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <DialogFooter>
              {canEdit && (
                <Button onClick={() => {
                  setIsDetailsDialogOpen(false);
                  openEditDialog(viewingStaff!);
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Staff
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
