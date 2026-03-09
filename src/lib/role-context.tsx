"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, RolePermissions } from '@/types';

// Role-based permissions
const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canViewPatients: true,
    canEditPatients: true,
    canDeletePatients: true,
    canViewDoctors: true,
    canEditDoctors: true,
    canViewAppointments: true,
    canCreateAppointments: true,
    canViewBilling: true,
    canProcessPayments: true,
    canViewPharmacy: true,
    canDispenseMedication: true,
    canViewLabResults: true,
    canOrderLabs: true,
    canViewEmergency: true,
    canManageEmergency: true,
    canViewReports: true,
    canGenerateReports: true,
    canViewDocuments: true,
    canUploadDocuments: true,
    canManageUsers: true,
    canViewDashboard: true,
    canManageInventory: true,
    canViewSchedule: true,
    canCreatePrescriptions: true,
    canViewSurgery: true,
    canManageSurgery: true,
  },
  doctor: {
    canViewPatients: true,
    canEditPatients: true,
    canDeletePatients: false,
    canViewDoctors: true,
    canEditDoctors: false,
    canViewAppointments: true,
    canCreateAppointments: true,
    canViewBilling: true,
    canProcessPayments: false,
    canViewPharmacy: true,
    canDispenseMedication: false,
    canViewLabResults: true,
    canOrderLabs: true,
    canViewEmergency: true,
    canManageEmergency: true,
    canViewReports: true,
    canGenerateReports: true,
    canViewDocuments: true,
    canUploadDocuments: true,
    canManageUsers: false,
    canViewDashboard: true,
    canManageInventory: false,
    canViewSchedule: true,
    canCreatePrescriptions: true,
    canViewSurgery: true,
    canManageSurgery: true,
  },
  nurse: {
    canViewPatients: true,
    canEditPatients: true,
    canDeletePatients: false,
    canViewDoctors: true,
    canEditDoctors: false,
    canViewAppointments: true,
    canCreateAppointments: false,
    canViewBilling: false,
    canProcessPayments: false,
    canViewPharmacy: true,
    canDispenseMedication: false,
    canViewLabResults: true,
    canOrderLabs: false,
    canViewEmergency: true,
    canManageEmergency: true,
    canViewReports: true,
    canGenerateReports: false,
    canViewDocuments: true,
    canUploadDocuments: true,
    canManageUsers: false,
    canViewDashboard: true,
    canManageInventory: false,
    canViewSchedule: true,
    canCreatePrescriptions: false,
    canViewSurgery: true,
    canManageSurgery: false,
  },
  receptionist: {
    canViewPatients: true,
    canEditPatients: true,
    canDeletePatients: false,
    canViewDoctors: true,
    canEditDoctors: false,
    canViewAppointments: true,
    canCreateAppointments: true,
    canViewBilling: true,
    canProcessPayments: true,
    canViewPharmacy: false,
    canDispenseMedication: false,
    canViewLabResults: false,
    canOrderLabs: false,
    canViewEmergency: true,
    canManageEmergency: false,
    canViewReports: true,
    canGenerateReports: false,
    canViewDocuments: true,
    canUploadDocuments: false,
    canManageUsers: false,
    canViewDashboard: true,
    canManageInventory: false,
    canViewSchedule: true,
    canCreatePrescriptions: false,
    canViewSurgery: false,
    canManageSurgery: false,
  },
  pharmacist: {
    canViewPatients: true,
    canEditPatients: false,
    canDeletePatients: false,
    canViewDoctors: true,
    canEditDoctors: false,
    canViewAppointments: false,
    canCreateAppointments: false,
    canViewBilling: true,
    canProcessPayments: true,
    canViewPharmacy: true,
    canDispenseMedication: true,
    canViewLabResults: false,
    canOrderLabs: false,
    canViewEmergency: false,
    canManageEmergency: false,
    canViewReports: true,
    canGenerateReports: true,
    canViewDocuments: true,
    canUploadDocuments: false,
    canManageUsers: false,
    canViewDashboard: true,
    canManageInventory: true,
    canViewSchedule: false,
    canCreatePrescriptions: false,
    canViewSurgery: false,
    canManageSurgery: false,
  },
  lab_tech: {
    canViewPatients: true,
    canEditPatients: false,
    canDeletePatients: false,
    canViewDoctors: true,
    canEditDoctors: false,
    canViewAppointments: false,
    canCreateAppointments: false,
    canViewBilling: false,
    canProcessPayments: false,
    canViewPharmacy: false,
    canDispenseMedication: false,
    canViewLabResults: true,
    canOrderLabs: false,
    canViewEmergency: false,
    canManageEmergency: false,
    canViewReports: true,
    canGenerateReports: true,
    canViewDocuments: true,
    canUploadDocuments: true,
    canManageUsers: false,
    canViewDashboard: true,
    canManageInventory: false,
    canViewSchedule: false,
    canCreatePrescriptions: false,
    canViewSurgery: false,
    canManageSurgery: false,
  },
  billing: {
    canViewPatients: true,
    canEditPatients: false,
    canDeletePatients: false,
    canViewDoctors: true,
    canEditDoctors: false,
    canViewAppointments: true,
    canCreateAppointments: false,
    canViewBilling: true,
    canProcessPayments: true,
    canViewPharmacy: false,
    canDispenseMedication: false,
    canViewLabResults: false,
    canOrderLabs: false,
    canViewEmergency: false,
    canManageEmergency: false,
    canViewReports: true,
    canGenerateReports: true,
    canViewDocuments: true,
    canUploadDocuments: false,
    canManageUsers: false,
    canViewDashboard: true,
    canManageInventory: false,
    canViewSchedule: false,
    canCreatePrescriptions: false,
    canViewSurgery: false,
    canManageSurgery: false,
  },
  patient: {
    canViewPatients: false,
    canEditPatients: false,
    canDeletePatients: false,
    canViewDoctors: true,
    canEditDoctors: false,
    canViewAppointments: true,
    canCreateAppointments: true,
    canViewBilling: true,
    canProcessPayments: true,
    canViewPharmacy: false,
    canDispenseMedication: false,
    canViewLabResults: true,
    canOrderLabs: false,
    canViewEmergency: false,
    canManageEmergency: false,
    canViewReports: false,
    canGenerateReports: false,
    canViewDocuments: true,
    canUploadDocuments: false,
    canManageUsers: false,
    canViewDashboard: true,
    canManageInventory: false,
    canViewSchedule: false,
    canCreatePrescriptions: false,
    canViewSurgery: false,
    canManageSurgery: false,
  },
};

// Default users for each role
const DEFAULT_USERS: Record<UserRole, User> = {
  admin: {
    id: 'U-ADMIN-001',
    name: 'Alex Morgan',
    email: 'admin@hospitalhub.com',
    role: 'admin',
    department: 'Administration',
    phone: '+1 (555) 100-0001',
  },
  doctor: {
    id: 'U-DOC-001',
    name: 'Dr. Sarah Johnson',
    email: 'doctor@hospitalhub.com',
    role: 'doctor',
    department: 'Cardiology',
    specialization: 'Interventional Cardiology',
    phone: '+1 (555) 100-0002',
    licenseNumber: 'MD-123456',
  },
  nurse: {
    id: 'U-NUR-001',
    name: 'Emily Davis',
    email: 'nurse@hospitalhub.com',
    role: 'nurse',
    department: 'Emergency',
    phone: '+1 (555) 100-0003',
    licenseNumber: 'RN-789012',
  },
  receptionist: {
    id: 'U-REC-001',
    name: 'Michael Brown',
    email: 'reception@hospitalhub.com',
    role: 'receptionist',
    department: 'Front Desk',
    phone: '+1 (555) 100-0004',
  },
  pharmacist: {
    id: 'U-PHAR-001',
    name: 'Jennifer Wilson',
    email: 'pharmacy@hospitalhub.com',
    role: 'pharmacist',
    department: 'Pharmacy',
    phone: '+1 (555) 100-0005',
    licenseNumber: 'RPH-345678',
  },
  lab_tech: {
    id: 'U-LAB-001',
    name: 'David Martinez',
    email: 'lab@hospitalhub.com',
    role: 'lab_tech',
    department: 'Laboratory',
    phone: '+1 (555) 100-0006',
    licenseNumber: 'MLS-901234',
  },
  billing: {
    id: 'U-BILL-001',
    name: 'Lisa Anderson',
    email: 'billing@hospitalhub.com',
    role: 'billing',
    department: 'Finance',
    phone: '+1 (555) 100-0007',
  },
  patient: {
    id: 'U-PAT-001',
    name: 'John Doe',
    email: 'patient@hospitalhub.com',
    role: 'patient',
    phone: '+1 (555) 100-0008',
  },
};

interface RoleContextType {
  currentUser: User;
  currentRole: UserRole;
  permissions: RolePermissions;
  switchRole: (role: UserRole) => void;
  getRoleLabel: (role: UserRole) => string;
  getRoleColor: (role: UserRole) => string;
  hasPermission: (permission: keyof RolePermissions) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USERS.admin);

  useEffect(() => {
    // Load saved role from sessionStorage
    const savedRole = sessionStorage.getItem('simulatedRole') as UserRole | null;
    if (savedRole && DEFAULT_USERS[savedRole]) {
      setCurrentUser(DEFAULT_USERS[savedRole]);
    }
  }, []);

  const switchRole = (role: UserRole) => {
    const user = DEFAULT_USERS[role];
    setCurrentUser(user);
    sessionStorage.setItem('simulatedRole', role);
  };

  const getRoleLabel = (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
      admin: 'Administrator',
      doctor: 'Doctor',
      nurse: 'Nurse',
      receptionist: 'Receptionist',
      pharmacist: 'Pharmacist',
      lab_tech: 'Lab Technician',
      billing: 'Billing Staff',
      patient: 'Patient',
    };
    return labels[role];
  };

  const getRoleColor = (role: UserRole): string => {
    const colors: Record<UserRole, string> = {
      admin: 'bg-purple-100 text-purple-700 border-purple-200',
      doctor: 'bg-blue-100 text-blue-700 border-blue-200',
      nurse: 'bg-pink-100 text-pink-700 border-pink-200',
      receptionist: 'bg-green-100 text-green-700 border-green-200',
      pharmacist: 'bg-amber-100 text-amber-700 border-amber-200',
      lab_tech: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      billing: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      patient: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[role];
  };

  const hasPermission = (permission: keyof RolePermissions): boolean => {
    return ROLE_PERMISSIONS[currentUser.role][permission];
  };

  const value: RoleContextType = {
    currentUser,
    currentRole: currentUser.role,
    permissions: ROLE_PERMISSIONS[currentUser.role],
    switchRole,
    getRoleLabel,
    getRoleColor,
    hasPermission,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

// Simple permission hook for checking specific permissions
export function usePermission(_module: string, action: string): boolean {
  const { hasPermission, permissions } = useRole();
  
  // Map module/action to permission keys
  const permissionMap: Record<string, keyof RolePermissions> = {
    'operating-room_edit': 'canManageSurgery',
    'operating-room_create': 'canManageSurgery',
    'reports_export': 'canGenerateReports',
    'staff_edit': 'canManageUsers',
    'staff_delete': 'canManageUsers',
    'staff_create': 'canManageUsers',
  };
  
  const key = permissionMap[`${_module}_${action}`];
  if (key) {
    return hasPermission(key);
  }
  
  // Fallback: check if action matches any permission key
  const actionToPermission: Record<string, keyof RolePermissions> = {
    edit: 'canEditPatients',
    delete: 'canDeletePatients',
    create: 'canCreateAppointments',
    export: 'canGenerateReports',
  };
  
  if (actionToPermission[action]) {
    return permissions[actionToPermission[action]];
  }
  
  return false;
}

export { ROLE_PERMISSIONS, DEFAULT_USERS };
export type { RoleContextType };
