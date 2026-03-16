"use client";

import React, { useState, useEffect } from "react";
import { db } from '../lib/store';
import { motion } from "framer-motion";
import {
  Users,
  AlertTriangle,
  Calendar,
  Stethoscope,
  FlaskConical,
  Ambulance,
  Bed,
  CreditCard,
  ArrowRight,
  TrendingUp,
  Activity,
  Pill,
  Building,
  ClipboardList,
  UserCheck,
  HeartPulse,
  DollarSign,
  BarChart3,
  PieChart,
  RefreshCw,
} from "lucide-react";
import StatCard from "../components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Link } from "react-router-dom";
import { useRole } from '../context/RoleContext';
import { UserRole, DashboardStats, Appointment } from "@types";

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  department: string;
  timestamp: string;
}

export default function DashboardPage() {
  const { currentUser, currentRole, switchRole, getRoleLabel, getRoleColor, hasPermission } = useRole();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const dashboardStats = db.getDashboardStats() || {};
        const appointments = (db.getAppointments() || []).slice(0, 5);
        const activities = [
          ...(db.getAdmissions() || []).slice(0, 2).map(a => ({
            id: a.id,
            type: 'admission',
            title: `New admission: ${a.patientName}`,
            department: a.department,
            timestamp: a.admissionDate
          })),
          ...(db.getEmergencyCases() || []).slice(0, 2).map(e => ({
            id: e.id,
            type: 'emergency',
            title: `Emergency case: ${e.caseType}`,
            department: e.department,
            timestamp: e.timestamp
          })),
          ...(db.getLabResults() || []).slice(0, 1).map(l => ({
            id: l.id,
            type: 'lab',
            title: `Lab result: ${l.testName}`,
            department: 'Laboratory',
            timestamp: l.timestamp
          }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        setStats(dashboardStats);
        setRecentActivity(activities);
        setUpcomingAppointments(appointments);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "emergency":
        return <Ambulance className="w-4 h-4 text-red-500" />;
      case "admission":
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      case "discharge":
        return <HeartPulse className="w-4 h-4 text-green-500" />;
      case "lab":
        return <FlaskConical className="w-4 h-4 text-amber-500" />;
      case "surgery":
        return <Activity className="w-4 h-4 text-purple-500" />;
      case "pharmacy":
        return <Pill className="w-4 h-4 text-pink-500" />;
      case "billing":
        return <CreditCard className="w-4 h-4 text-emerald-500" />;
      case "appointment":
        return <Calendar className="w-4 h-4 text-cyan-500" />;
      default:
        return <ClipboardList className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "emergency":
        return "bg-red-100 border-red-200";
      case "admission":
        return "bg-blue-100 border-blue-200";
      case "discharge":
        return "bg-green-100 border-green-200";
      case "lab":
        return "bg-amber-100 border-amber-200";
      case "surgery":
        return "bg-purple-100 border-purple-200";
      case "pharmacy":
        return "bg-pink-100 border-pink-200";
      case "billing":
        return "bg-emerald-100 border-emerald-200";
      case "appointment":
        return "bg-cyan-100 border-cyan-200";
      default:
        return "bg-gray-100 border-gray-200";
    }
  };

  const roles: UserRole[] = ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_tech', 'billing', 'patient'];

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-muted animate-pulse rounded-xl" />
          <div className="h-64 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Welcome Header with Role Switcher */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Here&apos;s what&apos;s happening at the hospital today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Role Switcher Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <UserCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Role</p>
                    <Badge variant="outline" className={`${getRoleColor(currentRole)} text-base px-3 py-1`}>
                      {getRoleLabel(currentRole)}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground mr-2">Switch Role:</span>
                  {roles.map((role) => (
                    <Button
                      key={role}
                      variant={currentRole === role ? "default" : "outline"}
                      size="sm"
                      onClick={() => switchRole(role)}
                      className="text-xs"
                    >
                      {getRoleLabel(role)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Stats Grid */}
        {hasPermission('canViewDashboard') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Patients"
              value={stats.totalPatients}
              subtitle={`${stats.inpatients} inpatients, ${stats.outpatients} outpatients`}
              trend="+12%"
              trendUp={true}
              icon={Users}
              delay={0.1}
            />
            <StatCard
              title="Critical Patients"
              value={stats.criticalPatients}
              subtitle="Requires immediate attention"
              icon={AlertTriangle}
              delay={0.2}
              variant="danger"
            />
            <StatCard
              title="Today's Appointments"
              value={stats.todayAppointments}
              subtitle={`${stats.completedAppointments} completed`}
              trend="+8%"
              trendUp={true}
              icon={Calendar}
              delay={0.3}
            />
            <StatCard
              title="Available Doctors"
              value={stats.availableDoctors}
              subtitle={`${stats.onDutyNurses} nurses on duty`}
              icon={Stethoscope}
              delay={0.4}
            />
          </div>
        )}

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pending Labs</p>
                  <p className="text-xl font-bold">{stats.pendingLabResults}</p>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                  <Ambulance className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Emergencies</p>
                  <p className="text-xl font-bold">{stats.emergencyCases}</p>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Bed className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bed Occupancy</p>
                  <p className="text-xl font-bold">{stats.bedOccupancy}%</p>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pending Bills</p>
                  <p className="text-xl font-bold">{stats.pendingInvoices}</p>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Prescriptions</p>
                  <p className="text-xl font-bold">{stats.pendingPrescriptions}</p>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Surgeries</p>
                  <p className="text-xl font-bold">{stats.scheduledSurgeries}</p>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 text-cyan-600 rounded-lg">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pending Tasks</p>
                  <p className="text-xl font-bold">{stats.pendingTasks}</p>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="text-xl font-bold">${(stats.totalRevenue / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bed Occupancy by Department */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary" />
                    Bed Occupancy by Department
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.occupancyByDepartment.slice(0, 6).map((dept, _i) => (
                      <div key={dept.name} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{dept.name}</span>
                          <span className={dept.occupancy >= 90 ? "text-red-500 font-medium" : "text-muted-foreground"}>
                            {dept.occupancy}%
                          </span>
                        </div>
                        <Progress 
                          value={dept.occupancy} 
                          className={`h-2 ${dept.occupancy >= 90 ? "[&>div]:bg-red-500" : dept.occupancy >= 70 ? "[&>div]:bg-amber-500" : "[&>div]:bg-green-500"}`}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Upcoming Appointments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Upcoming Appointments
                  </CardTitle>
                  <Link href="/appointments">
                    <Button variant="ghost" size="sm">
                      View all <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingAppointments.slice(0, 5).map((apt, i) => (
                      <div
                        key={apt.id || i}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{apt.patientName}</p>
                            <p className="text-sm text-muted-foreground">
                              {apt.doctorName} • {apt.department}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-medium">{apt.time}</p>
                            <p className="text-xs text-muted-foreground">{apt.date}</p>
                          </div>
                          <Badge variant={
                            apt.type === 'Emergency' ? 'destructive' :
                            apt.type === 'Follow-up' ? 'secondary' :
                            'outline'
                          }>
                            {apt.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Appointment Type Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    Appointment Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.appointmentStats.map((stat, _i) => (
                      <div key={stat.type} className="text-center p-4 bg-muted rounded-xl">
                        <div className="text-3xl font-bold text-foreground">{stat.count}</div>
                        <div className="text-sm text-muted-foreground mt-1">{stat.type}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Activity & Quick Stats */}
          <div className="space-y-6">
            {/* Revenue Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-8 h-8 opacity-80" />
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      <TrendingUp className="w-3 h-3 mr-1" /> +15%
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                  <p className="text-emerald-100 mt-1">Total Revenue</p>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-100">Outstanding</span>
                      <span className="font-medium">${stats.outstandingAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Bed Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bed className="w-5 h-5 text-primary" />
                    Bed Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Beds</span>
                      <span className="font-bold">{stats.totalBeds}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Occupied</span>
                      <span className="font-bold text-amber-600">{stats.occupiedBeds}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Available</span>
                      <span className="font-bold text-green-600">{stats.availableBeds}</span>
                    </div>
                    <div className="pt-2">
                      <Progress value={stats.bedOccupancy} className="h-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="w-5 h-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, i) => (
                      <div key={activity.id || i} className="flex gap-3 relative">
                        {i !== recentActivity.length - 1 && (
                          <div className="absolute left-2 top-8 bottom-[-16px] w-px bg-border"></div>
                        )}
                        <div
                          className={`w-5 h-5 rounded-full border-2 border-background flex items-center justify-center flex-shrink-0 mt-0.5 z-10 ${getActivityColor(activity.type)}`}
                        >
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {activity.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{activity.department}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(activity.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  {hasPermission('canCreateAppointments') && (
                    <Link href="/appointments">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Calendar className="w-4 h-4" />
                        New Appointment
                      </Button>
                    </Link>
                  )}
                  {hasPermission('canEditPatients') && (
                    <Link href="/patients">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Users className="w-4 h-4" />
                        Add Patient
                      </Button>
                    </Link>
                  )}
                  {hasPermission('canViewLabResults') && (
                    <Link href="/lab-results">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <FlaskConical className="w-4 h-4" />
                        Lab Orders
                      </Button>
                    </Link>
                  )}
                  {hasPermission('canViewEmergency') && (
                    <Link href="/emergency">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Ambulance className="w-4 h-4" />
                        Emergency
                      </Button>
                    </Link>
                  )}
                  {hasPermission('canViewPharmacy') && (
                    <Link href="/pharmacy">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Pill className="w-4 h-4" />
                        Pharmacy
                      </Button>
                    </Link>
                  )}
                  {hasPermission('canGenerateReports') && (
                    <Link href="/reports">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Reports
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}
