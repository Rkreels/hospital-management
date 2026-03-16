"use client";

import React, { useState, useEffect, useCallback } from "react";
import { db } from '../lib/store';
import { usePermission } from '../context/RoleContext';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { 
  Scissors, Clock, Users, AlertTriangle, CheckCircle2, Activity, 
  Calendar, User, Building2, Plus, ChevronRight, Play,
  CheckSquare, Square, Timer, Stethoscope, Heart,
  Sparkles, Zap, Ban, DoorOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { OperatingRoom, Surgery, Patient, Doctor, ChecklistItem } from "../types";

// Surgery status workflow
const SURGERY_STATUS_FLOW = ['Scheduled', 'Pre-Op', 'In Progress', 'Closing', 'Completed'] as const;
const ANESTHESIA_TYPES = ['General', 'Local', 'Regional', 'Sedation'] as const;

// Common procedures
const COMMON_PROCEDURES = [
  'Appendectomy', 'Cholecystectomy', 'Hernia Repair', 'Knee Replacement',
  'Hip Replacement', 'Cardiac Bypass', 'C-Section', 'Hysterectomy',
  'Prostatectomy', 'Thyroidectomy', 'Laparoscopic Surgery', 'Spine Surgery',
  'Brain Surgery', 'Lung Resection', 'Kidney Transplant', 'Liver Resection'
];

export default function OperatingRoomPage() {
  return (
    <OperatingRoomContent />
  );
}

function OperatingRoomContent() {
  const canEdit = usePermission('operating-room', 'edit');
  const canCreate = usePermission('operating-room', 'create');
  
  const [operatingRooms, setOperatingRooms] = useState<OperatingRoom[]>([]);
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [surgeryDetailOpen, setSurgeryDetailOpen] = useState(false);
  const [selectedSurgery, setSelectedSurgery] = useState<Surgery | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'timeline'>('overview');
  
  // New surgery form
  const [newSurgery, setNewSurgery] = useState({
    patientId: '',
    procedure: '',
    operatingRoomId: '',
    surgeonId: '',
    anesthesiologistId: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledStartTime: '08:00',
    scheduledEndTime: '10:00',
    anesthesiaType: '' as typeof ANESTHESIA_TYPES[number] | '',
    assistantSurgeons: [] as string[],
    nurses: [] as string[],
    notes: '',
  });
  
  // Statistics
  const [stats, setStats] = useState({
    totalORs: 0,
    availableORs: 0,
    inUseORs: 0,
    surgeriesToday: 0,
    inProgress: 0,
    scheduled: 0,
    completed: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const [orRes, surgeriesRes, patientsRes, doctorsRes] = await Promise.all([
        fetch('/api/operating-rooms'),
        fetch(`/api/surgeries?date=${today}`),
        fetch('/api/patients'),
        fetch('/api/doctors'),
      ]);
      
      const orData = await orRes;
      const surgeriesData = await surgeriesRes;
      const patientsData = await patientsRes;
      const doctorsData = await doctorsRes;
      
      setOperatingRooms(orData);
      setSurgeries(surgeriesData);
      setPatients(patientsData);
      setDoctors(doctorsData);
      
      // Calculate stats
      const allSurgeries = await fetch('/api/surgeries').then(r => r);
      const todaySurgeries = allSurgeries.filter((s: Surgery) => s.scheduledDate === today);
      
      setStats({
        totalORs: orData.length,
        availableORs: orData.filter((or: OperatingRoom) => or.status === 'Available').length,
        inUseORs: orData.filter((or: OperatingRoom) => or.status === 'In Use').length,
        surgeriesToday: todaySurgeries.length,
        inProgress: todaySurgeries.filter((s: Surgery) => s.status === 'In Progress').length,
        scheduled: todaySurgeries.filter((s: Surgery) => s.status === 'Scheduled' || s.status === 'Pre-Op').length,
        completed: todaySurgeries.filter((s: Surgery) => s.status === 'Completed').length,
      });
    } catch {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Schedule new surgery
  const handleScheduleSurgery = async () => {
    if (!newSurgery.patientId || !newSurgery.procedure || !newSurgery.operatingRoomId || !newSurgery.surgeonId) {
      return;
    }
    
    try {
      const response = await fetch('/api/surgeries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSurgery,
          anesthesiaType: newSurgery.anesthesiaType || 'General',
        }),
      });
      
      if (response.ok) {
        setScheduleDialogOpen(false);
        setNewSurgery({
          patientId: '',
          procedure: '',
          operatingRoomId: '',
          surgeonId: '',
          anesthesiologistId: '',
          scheduledDate: new Date().toISOString().split('T')[0],
          scheduledStartTime: '08:00',
          scheduledEndTime: '10:00',
          anesthesiaType: '',
          assistantSurgeons: [],
          nurses: [],
          notes: '',
        });
        fetchData();
      }
    } catch {
      console.error('Error scheduling surgery:', error);
    }
  };

  // Update surgery status
  const handleStatusChange = async (surgeryId: string, newStatus: string) => {
    try {
      await fetch('/api/surgeries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: surgeryId, status: newStatus }),
      });
      fetchData();
    } catch {
      console.error('Error updating surgery status:', error);
    }
  };

  // Update operating room status
  const handleRoomStatusChange = async (roomId: string, newStatus: string) => {
    try {
      await fetch('/api/operating-rooms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: roomId, status: newStatus }),
      });
      fetchData();
    } catch {
      console.error('Error updating room status:', error);
    }
  };

  // Quick action handlers
  const handleStartSurgery = async (surgery: Surgery) => {
    const now = new Date();
    const actualStart = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    await fetch('/api/surgeries', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: surgery.id, 
        status: 'In Progress',
        actualStartTime: actualStart 
      }),
    });
    // Update the OR status to In Use
    await fetch('/api/operating-rooms', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: surgery.operatingRoomId, status: 'In Use' }),
    });
    fetchData();
  };

  const handleCompleteSurgery = async (surgery: Surgery) => {
    const now = new Date();
    const actualEnd = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    await fetch('/api/surgeries', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: surgery.id, 
        status: 'Completed',
        actualEndTime: actualEnd 
      }),
    });
    // Update the OR status to Cleaning
    await fetch('/api/operating-rooms', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: surgery.operatingRoomId, status: 'Cleaning' }),
    });
    setSurgeryDetailOpen(false);
    fetchData();
  };

  const handleMarkForCleaning = async (roomId: string) => {
    await handleRoomStatusChange(roomId, 'Cleaning');
  };

  const handleCancelSurgery = async (surgeryId: string) => {
    await fetch('/api/surgeries', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: surgeryId, status: 'Cancelled' }),
    });
    setSurgeryDetailOpen(false);
    fetchData();
  };

  // Toggle checklist item
  const handleChecklistToggle = async (surgeryId: string, checklistItemId: string) => {
    const surgery = surgeries.find(s => s.id === surgeryId) || selectedSurgery;
    if (!surgery) return;
    
    const updatedChecklist = surgery.preOpChecklist.map(item =>
      item.id === checklistItemId ? { ...item, isCompleted: !item.isCompleted } : item
    );
    
    try {
      await fetch('/api/surgeries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: surgeryId, preOpChecklist: updatedChecklist }),
      });
      
      // Update local state
      if (selectedSurgery?.id === surgeryId) {
        setSelectedSurgery({ ...selectedSurgery, preOpChecklist: updatedChecklist });
      }
      fetchData();
    } catch {
      console.error('Error updating checklist:', error);
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-500';
      case 'In Use': return 'bg-red-500';
      case 'Cleaning': return 'bg-yellow-500';
      case 'Maintenance': return 'bg-gray-500';
      case 'Reserved': return 'bg-blue-500';
      case 'Scheduled': return 'bg-blue-500';
      case 'Pre-Op': return 'bg-purple-500';
      case 'In Progress': return 'bg-red-500';
      case 'Closing': return 'bg-orange-500';
      case 'Completed': return 'bg-green-500';
      case 'Cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  // Get surgeons
  const surgeons = doctors.filter(d => 
    d.specialty.includes('Surgery') || d.specialty.includes('Neuro') || d.specialty.includes('Cardio')
  );
  
  // Get anesthesiologists
  const anesthesiologists = doctors.filter(d => d.specialty === 'Anesthesiology');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Scissors className="w-7 h-7 text-primary" />
            Operating Room Management
          </h1>
          <p className="text-muted-foreground">Manage surgeries, operating rooms, and surgical workflows</p>
        </div>
        {canCreate && (
          <Button onClick={() => setScheduleDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Schedule Surgery
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900 border-teal-200 dark:border-teal-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-teal-600 dark:text-teal-400">Total ORs</p>
                  <p className="text-3xl font-bold text-teal-700 dark:text-teal-300">{stats.totalORs}</p>
                </div>
                <DoorOpen className="w-8 h-8 text-teal-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">Available</p>
                  <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{stats.availableORs}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900 border-rose-200 dark:border-rose-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-rose-600 dark:text-rose-400">In Use</p>
                  <p className="text-3xl font-bold text-rose-700 dark:text-rose-300">{stats.inUseORs}</p>
                </div>
                <Activity className="w-8 h-8 text-rose-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Surgeries Today</p>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.surgeriesToday}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Completed</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.completed}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {(['overview', 'schedule', 'timeline'] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab)}
            className="capitalize"
          >
            {tab}
          </Button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Operating Rooms Grid */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Operating Rooms
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {operatingRooms.map((room) => (
                  <Card key={room.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{room.name}</CardTitle>
                        <Badge className={`${getStatusColor(room.status)} text-white`}>
                          {room.status}
                        </Badge>
                      </div>
                      <CardDescription>{room.number} • {room.department}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Current Surgery */}
                      {(() => {
                        const currentSurgery = surgeries.find(s => s.operatingRoomId === room.id && s.status === 'In Progress');
                        return currentSurgery ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800"
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <Activity className="w-3 h-3 text-red-500" />
                              <p className="text-xs text-red-600 dark:text-red-400 font-medium">Current Surgery</p>
                            </div>
                            <p className="font-medium text-sm">{currentSurgery.procedure}</p>
                            <p className="text-xs text-muted-foreground">
                              {currentSurgery.patientName} • Dr. {currentSurgery.surgeonName}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Started: {currentSurgery.actualStartTime || currentSurgery.scheduledStartTime}
                            </p>
                          </motion.div>
                        ) : null;
                      })()}
                      
                      {/* Next Scheduled Surgery */}
                      {(() => {
                        const nextSurgery = surgeries
                          .filter(s => s.operatingRoomId === room.id && (s.status === 'Scheduled' || s.status === 'Pre-Op'))
                          .sort((a, b) => (a.scheduledStartTime || '').localeCompare(b.scheduledStartTime || ''))[0];
                        return nextSurgery ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800"
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <Clock className="w-3 h-3 text-blue-500" />
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Next Scheduled</p>
                            </div>
                            <p className="font-medium text-sm">{nextSurgery.procedure}</p>
                            <p className="text-xs text-muted-foreground">
                              {nextSurgery.patientName} • {nextSurgery.scheduledStartTime} - {nextSurgery.scheduledEndTime}
                            </p>
                          </motion.div>
                        ) : null;
                      })()}
                      
                      {/* Equipment */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Equipment</p>
                        <div className="flex flex-wrap gap-1">
                          {room.equipment?.slice(0, 3).map((eq, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {eq}
                            </Badge>
                          ))}
                          {(room.equipment?.length || 0) > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{(room.equipment?.length || 0) - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Features */}
                      {room.features && room.features.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Features</p>
                          <div className="flex flex-wrap gap-1">
                            {room.features.map((feature, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Capacity & Quick Actions */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>Capacity: {room.capacity}</span>
                        </div>
                        {canEdit && room.status === 'Available' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkForCleaning(room.id);
                            }}
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            Clean
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Todays Surgeries */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-primary" />
                Today&apos;s Surgeries
              </h2>
              {surgeries.length === 0 ? (
                <Card className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No surgeries scheduled for today</p>
                </Card>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {surgeries.map((surgery) => (
                    <Card 
                      key={surgery.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        setSelectedSurgery(surgery);
                        setSurgeryDetailOpen(true);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-2 h-12 rounded-full ${getStatusColor(surgery.status)}`} />
                            <div>
                              <p className="font-medium">{surgery.procedure}</p>
                              <p className="text-sm text-muted-foreground">
                                {surgery.patientName} • {surgery.operatingRoomName}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={`${getStatusColor(surgery.status)} text-white mb-1`}>
                              {surgery.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {surgery.scheduledStartTime} - {surgery.scheduledEndTime}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'schedule' && (
          <motion.div
            key="schedule"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Surgery Schedule</CardTitle>
                <CardDescription>View and manage scheduled surgeries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Surgery Status Workflow */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-3">Surgery Status Workflow</h3>
                    <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
                      {SURGERY_STATUS_FLOW.map((status, index) => (
                        <React.Fragment key={status}>
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(status)} text-white`}>
                              {index + 1}
                            </div>
                            <span className="text-xs mt-1">{status}</span>
                          </div>
                          {index < SURGERY_STATUS_FLOW.length - 1 && (
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Scheduled Surgeries List */}
                  <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {surgeries.map((surgery) => (
                      <div
                        key={surgery.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(surgery.status)}`} />
                          <div>
                            <p className="font-medium">{surgery.procedure}</p>
                            <p className="text-sm text-muted-foreground">
                              {surgery.patientName} • Dr. {surgery.surgeonName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {surgery.scheduledDate} • {surgery.scheduledStartTime} - {surgery.scheduledEndTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {canEdit && surgery.status !== 'Completed' && surgery.status !== 'Cancelled' && (
                            <Select
                              value={surgery.status}
                              onValueChange={(value) => handleStatusChange(surgery.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {SURGERY_STATUS_FLOW.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSurgery(surgery);
                              setSurgeryDetailOpen(true);
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'timeline' && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  Today&apos;s Surgery Timeline
                </CardTitle>
                <CardDescription>Visual timeline of surgeries scheduled for today</CardDescription>
              </CardHeader>
              <CardContent>
                {surgeries.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No surgeries scheduled for today</p>
                  </div>
                ) : (
                    <div className="relative">
                    {/* Timeline */}
                    <div className="space-y-4">
                      {surgeries
                        .sort((a, b) => (a.scheduledStartTime || '').localeCompare(b.scheduledStartTime || ''))
                        .map((surgery, index) => (
                          <div key={surgery.id} className="flex gap-4">
                            {/* Time marker */}
                            <div className="flex flex-col items-center">
                              <div className={`w-4 h-4 rounded-full ${getStatusColor(surgery.status)}`} />
                              {index < surgeries.length - 1 && (
                                <div className="w-0.5 h-full bg-border min-h-[80px]" />
                              )}
                            </div>
                            
                            {/* Content */}
                            <Card className="flex-1 mb-2">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium">{surgery.procedure}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {surgery.scheduledStartTime} - {surgery.scheduledEndTime}
                                    </p>
                                  </div>
                                  <Badge className={`${getStatusColor(surgery.status)} text-white`}>
                                    {surgery.status}
                                  </Badge>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    {surgery.patientName}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Stethoscope className="w-4 h-4" />
                                    Dr. {surgery.surgeonName}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Building2 className="w-4 h-4" />
                                    {surgery.operatingRoomName}
                                  </span>
                                  {surgery.anesthesiaType && (
                                    <span className="flex items-center gap-1">
                                      <Heart className="w-4 h-4" />
                                      {surgery.anesthesiaType}
                                    </span>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Surgery Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule New Surgery</DialogTitle>
            <DialogDescription>
              Fill in the details to schedule a new surgical procedure
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Patient Selection */}
            <div className="space-y-2">
              <Label>Patient *</Label>
              <Select
                value={newSurgery.patientId}
                onValueChange={(value) => setNewSurgery({ ...newSurgery, patientId: value })}
              >
                <SelectTrigger>
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

            {/* Procedure */}
            <div className="space-y-2">
              <Label>Procedure *</Label>
              <Select
                value={newSurgery.procedure}
                onValueChange={(value) => setNewSurgery({ ...newSurgery, procedure: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select procedure" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_PROCEDURES.map((proc) => (
                    <SelectItem key={proc} value={proc}>
                      {proc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Operating Room */}
            <div className="space-y-2">
              <Label>Operating Room *</Label>
              <Select
                value={newSurgery.operatingRoomId}
                onValueChange={(value) => setNewSurgery({ ...newSurgery, operatingRoomId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select OR" />
                </SelectTrigger>
                <SelectContent>
                  {operatingRooms
                    .filter(or => or.status === 'Available' || or.status === 'Cleaning')
                    .map((or) => (
                      <SelectItem key={or.id} value={or.id}>
                        {or.name} ({or.status})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Surgeon */}
            <div className="space-y-2">
              <Label>Surgeon *</Label>
              <Select
                value={newSurgery.surgeonId}
                onValueChange={(value) => setNewSurgery({ ...newSurgery, surgeonId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select surgeon" />
                </SelectTrigger>
                <SelectContent>
                  {surgeons.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.name} - {doc.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Anesthesiologist */}
            <div className="space-y-2">
              <Label>Anesthesiologist</Label>
              <Select
                value={newSurgery.anesthesiologistId}
                onValueChange={(value) => setNewSurgery({ ...newSurgery, anesthesiologistId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select anesthesiologist" />
                </SelectTrigger>
                <SelectContent>
                  {anesthesiologists.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.name}
                    </SelectItem>
                  ))}
                  {anesthesiologists.length === 0 && (
                    <SelectItem value="none" disabled>No anesthesiologists available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Anesthesia Type */}
            <div className="space-y-2">
              <Label>Anesthesia Type</Label>
              <Select
                value={newSurgery.anesthesiaType}
                onValueChange={(value) => setNewSurgery({ ...newSurgery, anesthesiaType: value as typeof ANESTHESIA_TYPES[number] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {ANESTHESIA_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={newSurgery.scheduledDate}
                onChange={(e) => setNewSurgery({ ...newSurgery, scheduledDate: e.target.value })}
              />
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <Label>Start Time *</Label>
              <Input
                type="time"
                value={newSurgery.scheduledStartTime}
                onChange={(e) => setNewSurgery({ ...newSurgery, scheduledStartTime: e.target.value })}
              />
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label>End Time *</Label>
              <Input
                type="time"
                value={newSurgery.scheduledEndTime}
                onChange={(e) => setNewSurgery({ ...newSurgery, scheduledEndTime: e.target.value })}
              />
            </div>

            {/* Notes */}
            <div className="col-span-2 space-y-2">
              <Label>Notes</Label>
              <Input
                placeholder="Additional notes or special instructions"
                value={newSurgery.notes}
                onChange={(e) => setNewSurgery({ ...newSurgery, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleSurgery} disabled={!newSurgery.patientId || !newSurgery.procedure || !newSurgery.operatingRoomId || !newSurgery.surgeonId}>
              Schedule Surgery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Surgery Detail Dialog */}
      <Dialog open={surgeryDetailOpen} onOpenChange={setSurgeryDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedSurgery && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedSurgery.procedure}</span>
                  <Badge className={`${getStatusColor(selectedSurgery.status)} text-white`}>
                    {selectedSurgery.status}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Surgery #{selectedSurgery.surgeryNumber}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Patient & Surgery Info */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Patient Information
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">Name:</span> {selectedSurgery.patientName}</p>
                        <p><span className="text-muted-foreground">Patient ID:</span> {selectedSurgery.patientId}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Location
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">OR:</span> {selectedSurgery.operatingRoomName}</p>
                        <p><span className="text-muted-foreground">Dept:</span> {selectedSurgery.department}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Schedule */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Schedule
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <p className="font-medium">{selectedSurgery.scheduledDate}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Time:</span>
                        <p className="font-medium">{selectedSurgery.scheduledStartTime} - {selectedSurgery.scheduledEndTime}</p>
                      </div>
                      {selectedSurgery.actualStartTime && (
                        <div>
                          <span className="text-muted-foreground">Actual Start:</span>
                          <p className="font-medium">{selectedSurgery.actualStartTime}</p>
                        </div>
                      )}
                      {selectedSurgery.actualEndTime && (
                        <div>
                          <span className="text-muted-foreground">Actual End:</span>
                          <p className="font-medium">{selectedSurgery.actualEndTime}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Team */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Surgical Team
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Surgeon:</span>
                        <span className="font-medium">{selectedSurgery.surgeonName}</span>
                      </div>
                      {selectedSurgery.anesthesiologistName && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Anesthesiologist:</span>
                          <span className="font-medium">{selectedSurgery.anesthesiologistName}</span>
                        </div>
                      )}
                      {selectedSurgery.anesthesiaType && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Anesthesia:</span>
                          <span className="font-medium">{selectedSurgery.anesthesiaType}</span>
                        </div>
                      )}
                      {selectedSurgery.assistantSurgeons && selectedSurgery.assistantSurgeons.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Assistants:</span>
                          <span className="font-medium">{selectedSurgery.assistantSurgeons.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Pre-Op Checklist */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4" />
                      Pre-Op Checklist
                    </h4>
                    <div className="space-y-2">
                      {['Pre-Op', 'Time Out', 'Sign Out'].map((category) => (
                        <div key={category}>
                          <p className="text-xs text-muted-foreground font-medium mb-1">{category}</p>
                          <div className="space-y-1">
                            {selectedSurgery.preOpChecklist
                              .filter(item => item.category === category)
                              .map((item) => (
                                <div
                                  key={item.id}
                                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                                    canEdit ? 'hover:bg-muted' : ''
                                  }`}
                                  onClick={() => canEdit && handleChecklistToggle(selectedSurgery.id, item.id)}
                                >
                                  {item.isCompleted ? (
                                    <CheckSquare className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Square className="w-4 h-4 text-muted-foreground" />
                                  )}
                                  <span className={item.isCompleted ? 'line-through text-muted-foreground' : ''}>
                                    {item.item}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Status Update */}
                {canEdit && selectedSurgery.status !== 'Completed' && selectedSurgery.status !== 'Cancelled' && (
                  <div className="space-y-2">
                    <Label>Update Status</Label>
                    <Select
                      value={selectedSurgery.status}
                      onValueChange={(value) => {
                        handleStatusChange(selectedSurgery.id, value);
                        setSelectedSurgery({ ...selectedSurgery, status: value as 'Scheduled' | 'Pre-Op' | 'In Progress' | 'Closing' | 'Completed' | 'Cancelled' | 'Postponed' });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SURGERY_STATUS_FLOW.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Quick Actions */}
                {canEdit && selectedSurgery.status !== 'Completed' && selectedSurgery.status !== 'Cancelled' && (
                  <Card className="border-primary/20">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        Quick Actions
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSurgery.status === 'Scheduled' && (
                          <Button 
                            size="sm" 
                            className="bg-purple-500 hover:bg-purple-600 text-white"
                            onClick={() => handleStartSurgery(selectedSurgery)}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Start Surgery
                          </Button>
                        )}
                        {selectedSurgery.status === 'Pre-Op' && (
                          <Button 
                            size="sm" 
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => handleStartSurgery(selectedSurgery)}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Begin Surgery
                          </Button>
                        )}
                        {selectedSurgery.status === 'In Progress' && (
                          <Button 
                            size="sm" 
                            className="bg-green-500 hover:bg-green-600 text-white"
                            onClick={() => handleCompleteSurgery(selectedSurgery)}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Complete Surgery
                          </Button>
                        )}
                        {selectedSurgery.status === 'Closing' && (
                          <Button 
                            size="sm" 
                            className="bg-green-500 hover:bg-green-600 text-white"
                            onClick={() => handleCompleteSurgery(selectedSurgery)}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Finalize
                          </Button>
                        )}
                        {(selectedSurgery.status === 'Scheduled' || selectedSurgery.status === 'Pre-Op') && (
                          <Button 
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelSurgery(selectedSurgery.id)}
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Cancel Surgery
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Additional Info */}
                {(selectedSurgery.complications || selectedSurgery.bloodLoss || selectedSurgery.postOpNotes) && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Post-Op Notes
                      </h4>
                      <div className="space-y-2 text-sm">
                        {selectedSurgery.complications && (
                          <p><span className="text-muted-foreground">Complications:</span> {selectedSurgery.complications}</p>
                        )}
                        {selectedSurgery.bloodLoss && (
                          <p><span className="text-muted-foreground">Blood Loss:</span> {selectedSurgery.bloodLoss} mL</p>
                        )}
                        {selectedSurgery.postOpNotes && (
                          <p><span className="text-muted-foreground">Notes:</span> {selectedSurgery.postOpNotes}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
