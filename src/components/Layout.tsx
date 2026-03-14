"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Users,
  Bell,
  Search,
  Menu,
  X,
  Settings,
  CreditCard,
  Activity,
  AlertCircle,
  Pill,
  FlaskConical,
  ClipboardList,
  Plus,
  Building,
  Briefcase,
  FolderOpen,
  BarChart3,
  Stethoscope,
  HeartPulse,
  ChevronDown,
  Wifi,
  WifiOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/lib/role-context";
import { UserRole } from "@/types";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationPanel } from "@/components/NotificationPanel";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_tech', 'billing', 'patient'] },
  { name: "Patients", href: "/patients", icon: Users, roles: ['admin', 'doctor', 'nurse', 'receptionist', 'billing', 'patient'] },
  { name: "Appointments", href: "/appointments", icon: CalendarIcon, roles: ['admin', 'doctor', 'nurse', 'receptionist', 'patient'] },
  { name: "Doctors", href: "/doctors", icon: Stethoscope, roles: ['admin', 'doctor', 'nurse', 'receptionist', 'patient'] },
  { name: "Nurses", href: "/nurses", icon: HeartPulse, roles: ['admin', 'nurse'] },
  { name: "Departments", href: "/departments", icon: Building, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
  { name: "Pharmacy", href: "/pharmacy", icon: Pill, roles: ['admin', 'doctor', 'pharmacist', 'nurse'] },
  { name: "Lab Results", href: "/lab-results", icon: FlaskConical, roles: ['admin', 'doctor', 'nurse', 'lab_tech', 'patient'] },
  { name: "Billing", href: "/billing", icon: CreditCard, roles: ['admin', 'billing', 'receptionist', 'patient'] },
  { name: "Admissions", href: "/admissions", icon: ClipboardList, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
  { name: "Emergency", href: "/emergency", icon: AlertCircle, roles: ['admin', 'doctor', 'nurse'] },
  { name: "Surgeries", href: "/surgeries", icon: Activity, roles: ['admin', 'doctor', 'nurse'] },
  { name: "Inventory", href: "/inventory", icon: Briefcase, roles: ['admin', 'pharmacist'] },
  { name: "Reports", href: "/reports", icon: BarChart3, roles: ['admin', 'doctor', 'billing'] },
  { name: "Tasks", href: "/tasks", icon: ClipboardList, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
  { name: "Calendar", href: "/calendar", icon: CalendarIcon, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
  { name: "Documents", href: "/documents", icon: FolderOpen, roles: ['admin', 'doctor', 'nurse', 'lab_tech'] },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ type: string; id: string; title: string; subtitle: string; url: string }[]>([]);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, currentRole, switchRole, getRoleLabel, getRoleColor, hasPermission } = useRole();
  
  // Real-time notifications hook
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead
  } = useNotifications(currentRole, currentUser.id);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSearchResults(data.slice(0, 8));
      } catch {
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleNavigate = (url: string) => {
    router.push(url);
  };

  const filteredNavigation = navigation.filter(item => item.roles.includes(currentRole));

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-heading font-bold text-xl">
                H
              </span>
            </div>
            <div>
              <span className="text-xl font-heading font-bold text-sidebar-foreground">
                HospitalHub
              </span>
              <p className="text-xs text-muted-foreground">Management System</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? "text-primary"
                      : "group-hover:text-primary/70"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
          <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-sidebar-accent/30 rounded-xl">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`}
                alt={currentUser.name}
              />
              <AvatarFallback>{currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {currentUser.name}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-xs ${getRoleColor(currentRole)}`}>
                  {getRoleLabel(currentRole)}
                </Badge>
                {isConnected ? (
                  <Wifi className="w-3 h-3 text-green-500" title="Connected" />
                ) : (
                  <WifiOff className="w-3 h-3 text-muted-foreground" title="Disconnected" />
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex-shrink-0 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 lg:px-6 z-30 sticky top-0">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="max-w-md w-full hidden sm:flex items-center relative">
              <Search className="w-5 h-5 text-muted-foreground absolute left-3" />
              <Input
                type="text"
                placeholder="Search patients, doctors, medications..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 bg-muted/50 border-transparent focus:bg-background focus:border-ring"
              />
              {/* Search Results Dropdown */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto"
                  >
                    {searchResults.map((result, i) => (
                      <Link
                        key={`${result.type}-${result.id}-${i}`}
                        href={result.url}
                        onClick={() => {
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-muted transition-colors border-b border-border last:border-0"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">{result.type[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{result.title}</p>
                          <p className="text-xs text-muted-foreground">{result.type} • {result.subtitle}</p>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Role Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden md:flex gap-2">
                  <Badge variant="outline" className={getRoleColor(currentRole)}>
                    {getRoleLabel(currentRole)}
                  </Badge>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_tech', 'billing', 'patient'] as UserRole[]).map((role) => (
                  <DropdownMenuItem
                    key={role}
                    onClick={() => switchRole(role)}
                    className={currentRole === role ? 'bg-muted' : ''}
                  >
                    <Badge variant="outline" className={getRoleColor(role)}>
                      {getRoleLabel(role)}
                    </Badge>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Real-time Notification Bell */}
            <DropdownMenu open={notificationPanelOpen} onOpenChange={setNotificationPanelOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-destructive text-destructive-foreground rounded-full text-xs font-medium flex items-center justify-center"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.span>
                  )}
                  {!isConnected && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-amber-500 rounded-full border border-background" title="Reconnecting..." />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-96 p-0 max-h-[500px]">
                <NotificationPanel
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onClose={() => setNotificationPanelOpen(false)}
                  onNavigate={handleNavigate}
                />
              </DropdownMenuContent>
            </DropdownMenu>
            
            {hasPermission('canEditPatients') && (
              <Link href="/patients">
                <Button className="hidden sm:flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Patient
                </Button>
              </Link>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
