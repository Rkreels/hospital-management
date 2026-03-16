'use client';

import React, { useState } from 'react';
import { db } from '../lib/store';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Building2,
  User,
  Bell,
  Settings as SettingsIcon,
  Shield,
  Database,
  Info,
  Save,
  RefreshCw,
  Download,
  Trash2,
  Clock,
  Phone,
  Mail,
  Globe,
  AlertTriangle,
  CheckCircle,
  Key,
  FileText,
} from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { UserRole } from '../types';

// Types for settings
interface HospitalSettings {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  workingHours: {
    weekdays: string;
    weekends: string;
  };
  emergencyNumber: string;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  appointmentReminders: boolean;
  labResults: boolean;
  emergencyAlerts: boolean;
  lowStockAlerts: boolean;
  billingNotifications: boolean;
  criticalValueAlerts: boolean;
}

interface SystemSettingsType {
  appointmentSlotDuration: number;
  defaultTaxRate: number;
  currency: string;
  lowStockThreshold: number;
  expiryAlertDays: number;
  autoReorder: boolean;
}

interface RoleInfo {
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

export default function SettingsPage() {
  const { currentRole, availableRoles, userName } = useRole();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Hospital Settings State
  const [hospitalSettings, setHospitalSettings] = useState<HospitalSettings>({
    name: 'HospitalHub Medical Center',
    code: 'HMC-001',
    address: '123 Healthcare Avenue, Medical District, City 12345',
    phone: '+1 (555) 123-4567',
    email: 'contact@hospitalhub.com',
    website: 'www.hospitalhub.com',
    workingHours: {
      weekdays: '08:00 - 20:00',
      weekends: '09:00 - 17:00',
    },
    emergencyNumber: '+1 (555) 911-1234',
  });

  // User Preferences State
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    theme: 'system',
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    appointmentReminders: true,
    labResults: true,
    emergencyAlerts: true,
    lowStockAlerts: true,
    billingNotifications: true,
    criticalValueAlerts: true,
  });

  // System Settings State
  const [systemSettings, setSystemSettings] = useState<SystemSettingsType>({
    appointmentSlotDuration: 30,
    defaultTaxRate: 8.5,
    currency: 'USD',
    lowStockThreshold: 50,
    expiryAlertDays: 30,
    autoReorder: false,
  });

  // Role definitions
  const roles: Record<UserRole, RoleInfo> = {
    admin: {
      name: 'Administrator',
      description: 'Full system access with all permissions',
      permissions: ['All Modules', 'User Management', 'System Configuration', 'Reports & Analytics', 'Audit Logs'],
      userCount: 3,
    },
    doctor: {
      name: 'Doctor',
      description: 'Clinical access for patient care and prescriptions',
      permissions: ['Patient Records', 'Appointments', 'Prescriptions', 'Lab Orders', 'Medical Reports'],
      userCount: 25,
    },
    nurse: {
      name: 'Nurse',
      description: 'Patient care and vital signs management',
      permissions: ['Patient Records (View/Edit)', 'Vital Signs', 'Task Management', 'Admissions'],
      userCount: 45,
    },
    receptionist: {
      name: 'Receptionist',
      description: 'Front desk operations and appointments',
      permissions: ['Appointments', 'Patient Registration', 'Billing (Create)', 'Calendar'],
      userCount: 12,
    },
    pharmacist: {
      name: 'Pharmacist',
      description: 'Medication dispensing and inventory',
      permissions: ['Pharmacy', 'Inventory', 'Prescriptions', 'Reports'],
      userCount: 8,
    },
    lab_technician: {
      name: 'Lab Technician',
      description: 'Lab tests and results management',
      permissions: ['Lab Orders', 'Lab Results', 'Reports', 'Documents'],
      userCount: 10,
    },
    hr_manager: {
      name: 'HR Manager',
      description: 'Staff and training management',
      permissions: ['Staff Management', 'Training', 'Reports', 'Documents'],
      userCount: 4,
    },
    finance_manager: {
      name: 'Finance Manager',
      description: 'Billing and financial reports',
      permissions: ['Billing (Full)', 'Reports', 'Financial Analytics', 'Documents'],
      userCount: 5,
    },
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSaving(false);
    setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });

    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleResetDemoData = () => {
    if (confirm('Are you sure you want to reset all demo data? This action cannot be undone.')) {
      // Simulate reset
      alert('Demo data has been reset successfully!');
    }
  };

  const handleExportData = () => {
    // Simulate export
    alert('Data export started. You will receive an email when ready.');
  };

  const handleClearCache = () => {
    // Simulate cache clear
    alert('Cache cleared successfully!');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your hospital system settings and preferences
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saveMessage && (
              <div className={`flex items-center gap-2 text-sm ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {saveMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {saveMessage.text}
              </div>
            )}
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="hospital" className="space-y-6">
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full h-auto p-1">
            <TabsTrigger value="hospital" className="flex items-center gap-2 text-xs sm:text-sm">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Hospital</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2 text-xs sm:text-sm">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 text-xs sm:text-sm">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2 text-xs sm:text-sm">
              <SettingsIcon className="w-4 h-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2 text-xs sm:text-sm">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Roles</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2 text-xs sm:text-sm">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2 text-xs sm:text-sm">
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">About</span>
            </TabsTrigger>
          </TabsList>

          {/* Hospital Settings Tab */}
          <TabsContent value="hospital" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Hospital Information
                </CardTitle>
                <CardDescription>
                  Basic information about your hospital facility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="hospitalName">Hospital Name</Label>
                    <Input
                      id="hospitalName"
                      value={hospitalSettings.name}
                      onChange={(e) => setHospitalSettings({ ...hospitalSettings, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hospitalCode">Hospital Code</Label>
                    <Input
                      id="hospitalCode"
                      value={hospitalSettings.code}
                      onChange={(e) => setHospitalSettings({ ...hospitalSettings, code: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={hospitalSettings.address}
                    onChange={(e) => setHospitalSettings({ ...hospitalSettings, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      value={hospitalSettings.phone}
                      onChange={(e) => setHospitalSettings({ ...hospitalSettings, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={hospitalSettings.email}
                      onChange={(e) => setHospitalSettings({ ...hospitalSettings, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      value={hospitalSettings.website}
                      onChange={(e) => setHospitalSettings({ ...hospitalSettings, website: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Working Hours
                </CardTitle>
                <CardDescription>
                  Set your hospital&apos;s operating hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="weekdayHours">Weekdays (Mon-Fri)</Label>
                    <Input
                      id="weekdayHours"
                      value={hospitalSettings.workingHours.weekdays}
                      onChange={(e) => setHospitalSettings({
                        ...hospitalSettings,
                        workingHours: { ...hospitalSettings.workingHours, weekdays: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weekendHours">Weekends (Sat-Sun)</Label>
                    <Input
                      id="weekendHours"
                      value={hospitalSettings.workingHours.weekends}
                      onChange={(e) => setHospitalSettings({
                        ...hospitalSettings,
                        workingHours: { ...hospitalSettings.workingHours, weekends: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Emergency Contact
                </CardTitle>
                <CardDescription>
                  Emergency contact number for urgent situations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-w-md">
                  <Label htmlFor="emergencyNumber">Emergency Hotline</Label>
                  <Input
                    id="emergencyNumber"
                    value={hospitalSettings.emergencyNumber}
                    onChange={(e) => setHospitalSettings({ ...hospitalSettings, emergencyNumber: e.target.value })}
                    className="border-destructive/30 focus:border-destructive"
                  />
                  <p className="text-sm text-muted-foreground">
                    This number will be displayed on emergency alerts and patient communications
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  User Preferences
                </CardTitle>
                <CardDescription>
                  Customize your personal settings and display preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">Current User</p>
                    <p className="text-sm text-muted-foreground">{userName}</p>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {currentRole.replace('_', ' ')}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Theme</Label>
                      <p className="text-sm text-muted-foreground">Select your preferred color theme</p>
                    </div>
                    <Select
                      value={userPreferences.theme}
                      onValueChange={(value: 'light' | 'dark' | 'system') =>
                        setUserPreferences({ ...userPreferences, theme: value })
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Language</Label>
                      <p className="text-sm text-muted-foreground">Select your preferred language</p>
                    </div>
                    <Select
                      value={userPreferences.language}
                      onValueChange={(value) =>
                        setUserPreferences({ ...userPreferences, language: value })
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Timezone</Label>
                      <p className="text-sm text-muted-foreground">Set your local timezone</p>
                    </div>
                    <Select
                      value={userPreferences.timezone}
                      onValueChange={(value) =>
                        setUserPreferences({ ...userPreferences, timezone: value })
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Date Format</Label>
                      <p className="text-sm text-muted-foreground">Choose how dates are displayed</p>
                    </div>
                    <Select
                      value={userPreferences.dateFormat}
                      onValueChange={(value) =>
                        setUserPreferences({ ...userPreferences, dateFormat: value })
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Push Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Notification Types</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="space-y-0.5">
                        <Label>Appointment Reminders</Label>
                        <p className="text-sm text-muted-foreground">Upcoming appointment alerts</p>
                      </div>
                      <Switch
                        checked={notificationSettings.appointmentReminders}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, appointmentReminders: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="space-y-0.5">
                        <Label>Lab Results</Label>
                        <p className="text-sm text-muted-foreground">Alerts when lab results are ready</p>
                      </div>
                      <Switch
                        checked={notificationSettings.labResults}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, labResults: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-destructive/5">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                          Emergency Alerts
                        </Label>
                        <p className="text-sm text-muted-foreground">Critical emergency notifications</p>
                      </div>
                      <Switch
                        checked={notificationSettings.emergencyAlerts}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, emergencyAlerts: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="space-y-0.5">
                        <Label>Low Stock Alerts</Label>
                        <p className="text-sm text-muted-foreground">Pharmacy inventory warnings</p>
                      </div>
                      <Switch
                        checked={notificationSettings.lowStockAlerts}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, lowStockAlerts: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="space-y-0.5">
                        <Label>Billing Notifications</Label>
                        <p className="text-sm text-muted-foreground">Payment and invoice alerts</p>
                      </div>
                      <Switch
                        checked={notificationSettings.billingNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, billingNotifications: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-destructive/5">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                          Critical Value Alerts
                        </Label>
                        <p className="text-sm text-muted-foreground">Lab critical value notifications</p>
                      </div>
                      <Switch
                        checked={notificationSettings.criticalValueAlerts}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, criticalValueAlerts: checked })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5 text-primary" />
                  System Configuration
                </CardTitle>
                <CardDescription>
                  Configure system-wide settings and defaults
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="slotDuration">Appointment Slot Duration (minutes)</Label>
                    <Select
                      value={systemSettings.appointmentSlotDuration.toString()}
                      onValueChange={(value) =>
                        setSystemSettings({ ...systemSettings, appointmentSlotDuration: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={systemSettings.currency}
                      onValueChange={(value) =>
                        setSystemSettings({ ...systemSettings, currency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      step="0.1"
                      value={systemSettings.defaultTaxRate}
                      onChange={(e) =>
                        setSystemSettings({ ...systemSettings, defaultTaxRate: parseFloat(e.target.value) })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lowStock">Low Stock Threshold</Label>
                    <Input
                      id="lowStock"
                      type="number"
                      value={systemSettings.lowStockThreshold}
                      onChange={(e) =>
                        setSystemSettings({ ...systemSettings, lowStockThreshold: parseInt(e.target.value) })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiryDays">Expiry Alert (Days Before)</Label>
                    <Input
                      id="expiryDays"
                      type="number"
                      value={systemSettings.expiryAlertDays}
                      onChange={(e) =>
                        setSystemSettings({ ...systemSettings, expiryAlertDays: parseInt(e.target.value) })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="space-y-0.5">
                      <Label>Auto Reorder</Label>
                      <p className="text-sm text-muted-foreground">Automatically reorder when stock is low</p>
                    </div>
                    <Switch
                      checked={systemSettings.autoReorder}
                      onCheckedChange={(checked) =>
                        setSystemSettings({ ...systemSettings, autoReorder: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Role Management Tab */}
          <TabsContent value="roles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Role Management
                </CardTitle>
                <CardDescription>
                  View roles and their associated permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Key className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Current Role: <span className="capitalize">{currentRole.replace('_', ' ')}</span></p>
                      <p className="text-sm text-muted-foreground">{roles[currentRole].description}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="max-h-96 overflow-y-auto space-y-4 custom-scrollbar">
                    {availableRoles.map((role) => {
                      const roleInfo = roles[role.value];
                      const isCurrentRole = role.value === currentRole;

                      return (
                        <div
                          key={role.value}
                          className={`p-4 rounded-lg border ${isCurrentRole ? 'border-primary bg-primary/5' : 'border-border'}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{role.label}</h4>
                                {isCurrentRole && (
                                  <Badge variant="default" className="text-xs">Current</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{roleInfo.description}</p>
                            </div>
                            <Badge variant="secondary">{roleInfo.userCount} users</Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {roleInfo.permissions.map((permission, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Management Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Manage your data and system maintenance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border border-border space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Reset Demo Data</h4>
                        <p className="text-sm text-muted-foreground">Restore default demo data</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleResetDemoData}
                    >
                      Reset Demo Data
                    </Button>
                  </div>

                  <div className="p-4 rounded-lg border border-border space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Download className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Export All Data</h4>
                        <p className="text-sm text-muted-foreground">Download complete data backup</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleExportData}
                    >
                      Export Data
                    </Button>
                  </div>

                  <div className="p-4 rounded-lg border border-border space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Clear Cache</h4>
                        <p className="text-sm text-muted-foreground">Clear system cache and temp files</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleClearCache}
                    >
                      Clear Cache
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Storage Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Database Size</p>
                      <p className="text-2xl font-bold">245 MB</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Documents</p>
                      <p className="text-2xl font-bold">1.2 GB</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Cache</p>
                      <p className="text-2xl font-bold">85 MB</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Total Records</p>
                      <p className="text-2xl font-bold">12,456</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  About HospitalHub
                </CardTitle>
                <CardDescription>
                  System information and credits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-heading font-bold text-3xl">H</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading font-bold">HospitalHub</h3>
                    <p className="text-muted-foreground">Hospital Management System</p>
                    <Badge variant="secondary" className="mt-2">Version 2.0.0</Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Version Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Application Version</span>
                        <span className="font-medium">2.0.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Database Version</span>
                        <span className="font-medium">1.8.5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">API Version</span>
                        <span className="font-medium">v2.1</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span className="font-medium">March 2024</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      License Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">License Type</span>
                        <span className="font-medium">Enterprise</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">License Holder</span>
                        <span className="font-medium">HospitalHub Medical Center</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valid Until</span>
                        <span className="font-medium">Dec 31, 2025</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Support Plan</span>
                        <span className="font-medium">Premium 24/7</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Credits & Acknowledgments</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-sm font-medium">Next.js</p>
                      <p className="text-xs text-muted-foreground">Framework</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-sm font-medium">Tailwind CSS</p>
                      <p className="text-xs text-muted-foreground">Styling</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-sm font-medium">shadcn/ui</p>
                      <p className="text-xs text-muted-foreground">Components</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-sm font-medium">Prisma</p>
                      <p className="text-xs text-muted-foreground">Database</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="text-center text-sm text-muted-foreground">
                  <p>© 2024 HospitalHub. All rights reserved.</p>
                  <p className="mt-1">Built with care for healthcare professionals.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
