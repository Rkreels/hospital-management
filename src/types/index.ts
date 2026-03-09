// Hospital Management Types

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  ward: string;
  status: 'Stable' | 'Critical' | 'Under Observation' | 'Recovering' | 'Discharged';
  admittedDate: string;
  diagnosis?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  availability: string;
  department: string;
  status: 'Available' | 'On Leave' | 'Busy' | 'Off Duty';
  patientsCount: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  department: string;
  type: 'Consultation' | 'Follow-up' | 'Emergency' | 'Routine Checkup';
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';
  notes?: string;
}

export interface Department {
  id: string;
  name: string;
  beds: number;
  occupiedBeds: number;
  head: string;
  status: 'Operational' | 'Under Maintenance' | 'Full';
  floor: number;
}

export interface Medication {
  id: string;
  name: string;
  stock: number;
  unit: string;
  manufacturer: string;
  price: number;
  expiryDate: string;
  reorderLevel: number;
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  services: string[];
  total: number;
  status: 'Pending' | 'Paid' | 'Insurance' | 'Overdue';
  date: string;
  dueDate: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  patientName: string;
  test: string;
  date: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  results?: string;
  technician?: string;
}

export interface Admission {
  id: string;
  patientId: string;
  patientName: string;
  type: 'Emergency' | 'Elective' | 'Newborn' | 'Transfer';
  priority: 'Critical' | 'High' | 'Normal' | 'Low';
  status: 'Waiting' | 'Admitted' | 'In Progress';
  bedNumber?: string;
  admittedBy?: string;
}

export interface EmergencyCase {
  id: string;
  case: string;
  patientName?: string;
  eta: string;
  level: 'Critical' | 'Serious' | 'Minor';
  status: 'Incoming' | 'In Treatment' | 'Discharged' | 'Admitted';
  assignedDoctor?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'High' | 'Medium' | 'Low';
  due: string;
  assignedTo: string;
  category: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'meeting' | 'surgery' | 'appointment' | 'other';
  description?: string;
  attendees?: string[];
}

export interface DashboardStats {
  totalPatients: number;
  criticalPatients: number;
  todayAppointments: number;
  availableDoctors: number;
  pendingLabResults: number;
  emergencyCases: number;
  bedOccupancy: number;
  pendingInvoices: number;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}
