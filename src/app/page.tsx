"use client";

import React from "react";
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
} from "lucide-react";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Fetch data from API
async function getDashboardData() {
  const res = await fetch("/api/dashboard");
  if (!res.ok) return null;
  return res.json();
}

export default function DashboardPage() {
  const [stats, setStats] = React.useState({
    totalPatients: 0,
    criticalPatients: 0,
    todayAppointments: 0,
    availableDoctors: 0,
    pendingLabResults: 0,
    emergencyCases: 0,
    bedOccupancy: 0,
    pendingInvoices: 0,
  });

  const [recentActivity, setRecentActivity] = React.useState([
    {
      id: 1,
      title: "New patient admitted - John Doe",
      type: "admission",
      time: "2 hours ago",
      department: "Cardiology",
    },
    {
      id: 2,
      title: "Emergency case resolved",
      type: "emergency",
      time: "4 hours ago",
      department: "Emergency",
    },
    {
      id: 3,
      title: "Lab results available - Maria Gomez",
      type: "lab",
      time: "Yesterday",
      department: "Pathology",
    },
    {
      id: 4,
      title: "Patient discharged - Robert Smith",
      type: "discharge",
      time: "Yesterday",
      department: "Orthopedics",
    },
  ]);

  const [upcomingAppointments, setUpcomingAppointments] = React.useState<
    { id: string | number; patient: string; doctor: string; time: string; department: string }[]
  >([
    {
      id: 1,
      patient: "John Doe",
      doctor: "Dr. Sarah Smith",
      time: "09:30 AM",
      department: "Cardiology",
    },
    {
      id: 2,
      patient: "Aisha Khan",
      doctor: "Dr. Ravi Patel",
      time: "11:00 AM",
      department: "Orthopedics",
    },
    {
      id: 3,
      patient: "Maria Gomez",
      doctor: "Dr. Emily Lee",
      time: "02:00 PM",
      department: "Maternity",
    },
  ]);

  React.useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data) setStats(data);
      });

    fetch("/api/appointments?limit=3")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data)) {
          setUpcomingAppointments(
            data.map((a: { id: string; patientName: string; doctorName: string; time: string; department: string }, index: number) => ({
              id: a.id || index + 1,
              patient: a.patientName,
              doctor: a.doctorName,
              time: a.time,
              department: a.department,
            }))
          );
        }
      });
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Welcome back, Dr. Morgan
            </h1>
            <p className="text-muted-foreground mt-1">
              Here&apos;s what&apos;s happening at the hospital today.
            </p>
          </div>
          <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg inline-flex w-fit">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            trend="+5%"
            trendUp={true}
            icon={Users}
            delay={0.1}
          />
          <StatCard
            title="Critical Patients"
            value={stats.criticalPatients}
            icon={AlertTriangle}
            delay={0.2}
          />
          <StatCard
            title="Today's Appointments"
            value={stats.todayAppointments}
            icon={Calendar}
            delay={0.3}
          />
          <StatCard
            title="Available Doctors"
            value={stats.availableDoctors}
            icon={Stethoscope}
            delay={0.4}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Pending Lab Results
                    </p>
                    <p className="text-2xl font-bold">{stats.pendingLabResults}</p>
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
                  <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                    <Ambulance className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Emergency Cases
                    </p>
                    <p className="text-2xl font-bold">{stats.emergencyCases}</p>
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
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Bed className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Bed Occupancy
                    </p>
                    <p className="text-2xl font-bold">{stats.bedOccupancy}%</p>
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
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Pending Invoices
                    </p>
                    <p className="text-2xl font-bold">{stats.pendingInvoices}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <Link href="/appointments">
                    <Button variant="ghost" size="sm">
                      View all <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingAppointments.map((apt, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{apt.patient}</p>
                            <p className="text-sm text-muted-foreground">
                              {apt.doctor} • {apt.department}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{apt.time}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {recentActivity.map((activity, i) => (
                      <div key={activity.id} className="flex gap-4 relative">
                        {i !== recentActivity.length - 1 && (
                          <div className="absolute left-2.5 top-8 bottom-[-24px] w-px bg-border"></div>
                        )}
                        <div
                          className={`w-5 h-5 rounded-full border-2 border-background flex items-center justify-center flex-shrink-0 mt-0.5 z-10 ${
                            activity.type === "emergency"
                              ? "bg-red-100 border-red-200"
                              : activity.type === "admission"
                              ? "bg-blue-100 border-blue-200"
                              : activity.type === "discharge"
                              ? "bg-green-100 border-green-200"
                              : "bg-amber-100 border-amber-200"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              activity.type === "emergency"
                                ? "bg-red-500"
                                : activity.type === "admission"
                                ? "bg-blue-500"
                                : activity.type === "discharge"
                                ? "bg-green-500"
                                : "bg-amber-500"
                            }`}
                          ></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {activity.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{activity.department}</span>
                            <span>•</span>
                            <span>{activity.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
