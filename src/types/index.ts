// Hospital Management Types - Comprehensive Simulation

// ============ USER & ROLES ============
export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'pharmacist' | 'lab_tech' | 'billing' | 'patient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  specialization?: string;
  phone?: string;
  licenseNumber?: string;
}

export interface RolePermissions {
  canViewPatients: boolean;
  canEditPatients: boolean;
  canDeletePatients: boolean;
  canViewDoctors: boolean;
  canEditDoctors: boolean;
  canViewAppointments: boolean;
  canCreateAppointments: boolean;
  canViewBilling: boolean;
  canProcessPayments: boolean;
  canViewPharmacy: boolean;
  canDispenseMedication: boolean;
  canViewLabResults: boolean;
  canOrderLabs: boolean;
  canViewEmergency: boolean;
  canManageEmergency: boolean;
  canViewReports: boolean;
  canGenerateReports: boolean;
  canViewDocuments: boolean;
  canUploadDocuments: boolean;
  canManageUsers: boolean;
  canViewDashboard: boolean;
  canManageInventory: boolean;
  canViewSchedule: boolean;
  canCreatePrescriptions: boolean;
  canViewSurgery: boolean;
  canManageSurgery: boolean;
}

// ============ PATIENT ============
export interface VitalSigns {
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  weight: number;
  height: number;
  bmi: number;
  recordedAt: string;
  recordedBy: string;
}

export interface VitalSign {
  id: string;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  weight: number;
  painLevel?: number;
  notes?: string;
  recordedAt: string;
  recordedBy: string;
}

export interface Allergy {
  id: string;
  substance: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Life-threatening';
  reaction: string;
  diagnosedDate: string;
}

export interface MedicalHistoryEntry {
  id: string;
  condition: string;
  diagnosisDate: string;
  status: 'Active' | 'Resolved' | 'Chronic';
  notes?: string;
  treatingDoctor?: string;
}

export interface SurgeryHistory {
  id: string;
  procedure: string;
  date: string;
  surgeon: string;
  hospital: string;
  complications?: string;
}

export interface Immunization {
  id: string;
  vaccine: string;
  date: string;
  administeredBy: string;
  batchNumber?: string;
  nextDose?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  holderName: string;
  holderRelation: string;
  validFrom: string;
  validTo: string;
  coveragePercentage: number;
  copayAmount: number;
}

export interface PatientVisit {
  id: string;
  date: string;
  type: 'Outpatient' | 'Inpatient' | 'Emergency' | 'Follow-up';
  department: string;
  doctor: string;
  chiefComplaint: string;
  diagnosis: string;
  notes?: string;
  status: 'Completed' | 'In Progress' | 'Cancelled';
}

export interface PatientMedication {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  status: 'Active' | 'Completed' | 'Discontinued';
  instructions?: string;
}

export interface Patient {
  id: string;
  mrn: string;
  name: string;
  dateOfBirth: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  ward: string;
  roomNumber?: string;
  bedNumber?: string;
  status: 'Stable' | 'Critical' | 'Under Observation' | 'Recovering' | 'Discharged' | 'Outpatient';
  admittedDate: string;
  dischargeDate?: string;
  primaryDiagnosis: string;
  secondaryDiagnoses?: string[];
  attendingDoctorId: string;
  attendingDoctorName: string;
  primaryNurseId?: string;
  allergies: Allergy[];
  medicalHistory: MedicalHistoryEntry[];
  surgeryHistory: SurgeryHistory[];
  immunizations: Immunization[];
  emergencyContacts: EmergencyContact[];
  insurance: InsuranceInfo;
  vitalSigns: VitalSigns[];
  currentMedications: PatientMedication[];
  visitHistory: PatientVisit[];
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  occupation: string;
  nationality: string;
  language: string;
  religion?: string;
  organDonor: boolean;
  photo?: string;
}

// ============ DOCTOR ============
export interface DoctorSchedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  roomNumber: string;
}

export interface DoctorLeave {
  id: string;
  startDate: string;
  endDate: string;
  type: 'Annual' | 'Sick' | 'Conference' | 'Personal' | 'Other';
  reason?: string;
  approvedBy?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface DoctorQualification {
  id: string;
  degree: string;
  institution: string;
  year: number;
  specialization?: string;
}

export interface Doctor {
  id: string;
  employeeId: string;
  name: string;
  specialty: string;
  subSpecialties?: string[];
  phone: string;
  email: string;
  department: string;
  departmentId: string;
  status: 'Available' | 'On Leave' | 'Busy' | 'Off Duty' | 'On Call';
  availability: string;
  patientsCount: number;
  consultationFee: number;
  licenseNumber: string;
  education: string;
  experience: number;
  languages: string[];
  bio?: string;
  qualifications: DoctorQualification[];
  schedule: DoctorSchedule[];
  leaves: DoctorLeave[];
  ratings: number;
  totalReviews: number;
  hireDate: string;
  photo?: string;
}

// ============ NURSE ============
export interface Nurse {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  departmentId: string;
  phone: string;
  email: string;
  status: 'Available' | 'On Leave' | 'Busy' | 'Off Duty' | 'On Call';
  shift: 'Morning' | 'Afternoon' | 'Night' | 'Rotating';
  licenseNumber: string;
  specialization?: string;
  yearsOfExperience: number;
  assignedWard?: string;
  assignedPatients: string[];
  hireDate: string;
  photo?: string;
}

// ============ APPOINTMENT ============
export type AppointmentStatus = 'Scheduled' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show' | 'Rescheduled';
export type AppointmentType = 'Consultation' | 'Follow-up' | 'Emergency' | 'Routine Checkup' | 'Procedure' | 'Telemedicine';

export interface TimeSlot {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Appointment {
  id: string;
  appointmentNumber: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  departmentId: string;
  department: string;
  date: string;
  time: string;
  endTime?: string;
  duration: number;
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  chiefComplaint?: string;
  notes?: string;
  diagnosis?: string;
  prescriptionId?: string;
  labOrders?: string[];
  followUpDate?: string;
  queueNumber?: number;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  reminderSent: boolean;
  priority: 'Normal' | 'Urgent' | 'Emergency';
}

// ============ DEPARTMENT ============
export interface DepartmentStaff {
  doctorCount: number;
  nurseCount: number;
  technicianCount: number;
  totalStaff: number;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  beds: number;
  occupiedBeds: number;
  availableBeds: number;
  head: string;
  headId: string;
  status: 'Operational' | 'Under Maintenance' | 'Full' | 'Closed';
  floor: number;
  location: string;
  phone: string;
  email: string;
  staff: DepartmentStaff;
  services: string[];
  operatingHours: string;
  emergencyServices: boolean;
  icon?: string;
  color?: string;
}

// ============ BED ============
export interface Bed {
  id: string;
  bedNumber: string;
  wardId: string;
  wardName: string;
  roomNumber: string;
  type: 'General' | 'ICU' | 'Private' | 'Semi-Private' | 'Pediatric' | 'Maternity';
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance' | 'Cleaning';
  patientId?: string;
  patientName?: string;
  admittedAt?: string;
  features: string[];
  dailyRate: number;
}

// ============ PHARMACY ============
export interface MedicationCategory {
  id: string;
  name: string;
  description?: string;
}

export interface MedicationSupplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  leadTime: number;
}

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  brandName?: string;
  category: string;
  categoryId: string;
  description: string;
  dosageForm: 'Tablet' | 'Capsule' | 'Injection' | 'Syrup' | 'Cream' | 'Ointment' | 'Drops' | 'Inhaler' | 'Suppository' | 'Patch' | 'Solution';
  strength: string;
  unit: string;
  stock: number;
  minStock: number;
  maxStock: number;
  reorderLevel: number;
  price: number;
  costPrice: number;
  manufacturer: string;
  supplierId: string;
  supplierName: string;
  location: string;
  expiryDate: string;
  manufacturingDate: string;
  batchNumber: string;
  requiresPrescription: boolean;
  controlledSubstance: boolean;
  controlledLevel?: 'Schedule I' | 'Schedule II' | 'Schedule III' | 'Schedule IV' | 'Schedule V';
  storageConditions: string;
  sideEffects?: string[];
  contraindications?: string[];
  interactions?: string[];
  lastRestocked: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expired' | 'Discontinued';
}

export interface PrescriptionItem {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
  refills: number;
  refillsRemaining: number;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentId?: string;
  date: string;
  diagnosis: string;
  items: PrescriptionItem[];
  status: 'Pending' | 'Dispensed' | 'Partially Dispensed' | 'Cancelled';
  dispensedBy?: string;
  dispensedAt?: string;
  notes?: string;
  validUntil: string;
}

// ============ LAB ============
export interface LabTestCategory {
  id: string;
  name: string;
  description?: string;
  turnAroundTime: string;
}

export interface LabTest {
  id: string;
  code: string;
  name: string;
  category: string;
  categoryId: string;
  description: string;
  specimenType: string;
  sampleType?: string;
  preparations?: string[];
  preparationInstructions?: string;
  price: number;
  turnaroundTime: number;
  referenceRangeLow: number;
  referenceRangeHigh: number;
  referenceRangeUnit: string;
  referenceRanges?: { parameter: string; min: number; max: number; unit: string; minNormal?: number; maxNormal?: number; minCritical?: number; maxCritical?: number }[];
  criticalLow?: number;
  criticalHigh?: number;
  status: 'Active' | 'Inactive';
  department?: string;
}

export interface LabOrderTest {
  id: string;
  testId: string;
  testName: string;
  testCode?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  result?: string;
  numericResult?: number;
  unit?: string;
  isAbnormal?: boolean;
  isCritical?: boolean;
  referenceRange?: string;
  results?: { id?: string; parameter?: string; value?: string; unit?: string; referenceMin?: number; referenceMax?: number; flag?: string }[];
  notes?: string;
  performedBy?: string;
  verifiedBy?: string;
  completedAt?: string;
}

export interface LabOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  doctorId: string;
  doctorName: string;
  tests: LabOrderTest[];
  priority: 'Routine' | 'Urgent' | 'STAT';
  status: 'Ordered' | 'Sample Collected' | 'In Progress' | 'Completed' | 'Cancelled';
  orderedAt: string;
  createdAt?: string;
  collectedAt?: string;
  completedAt?: string;
  reportReadyAt?: string;
  collectedBy?: string;
  notes?: string;
  diagnosis?: string;
  clinicalNotes?: string;
}

export interface LabResult {
  id: string;
  resultNumber: string;
  orderId: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  doctorId: string;
  doctorName: string;
  tests: LabOrderTest[];
  status: 'Preliminary' | 'Final' | 'Corrected' | 'Cancelled';
  reportedAt: string;
  value?: string;
  flag?: string;
  parameter?: string;
  referenceMin?: number;
  referenceMax?: number;
  unit?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
  interpretation?: string;
}

export type Priority = 'Critical' | 'High' | 'Normal' | 'Low' | 'Routine' | 'Urgent' | 'STAT';
export type LabOrderStatus = 'Ordered' | 'Sample Collected' | 'In Progress' | 'Completed' | 'Cancelled';

export interface ReferenceRange {
  parameter?: string;
  minNormal?: number;
  maxNormal?: number;
  minCritical?: number;
  maxCritical?: number;
  min?: number;
  max?: number;
  unit?: string;
}

// ============ BILLING ============
export interface BillingCode {
  code: string;
  description: string;
  category: string;
  price: number;
  type: 'Service' | 'Procedure' | 'Supply' | 'Medication' | 'Lab' | 'Room';
}

export interface InvoiceItem {
  id: string;
  description: string;
  code: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
  type: 'Service' | 'Procedure' | 'Supply' | 'Medication' | 'Lab' | 'Room';
  date: string;
  providerId?: string;
  providerName?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: 'Cash' | 'Credit Card' | 'Debit Card' | 'Check' | 'Bank Transfer' | 'Insurance';
  reference?: string;
  paidAt: string;
  receivedBy: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  patientMRN: string;
  admissionId?: string;
  appointmentId?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  balance: number;
  status: 'Draft' | 'Pending' | 'Partial' | 'Paid' | 'Overdue' | 'Cancelled' | 'Insurance Pending';
  insuranceClaimId?: string;
  date: string;
  dueDate: string;
  payments: Payment[];
  createdBy: string;
  notes?: string;
}

// ============ ADMISSION ============
export interface Admission {
  id: string;
  admissionNumber: string;
  patientId: string;
  patientName: string;
  type: 'Emergency' | 'Elective' | 'Newborn' | 'Transfer' | 'Observation';
  priority: 'Critical' | 'High' | 'Normal' | 'Low';
  status: 'Waiting' | 'Admitted' | 'In Progress' | 'Discharge Pending' | 'Discharged' | 'Cancelled';
  bedId?: string;
  bedNumber?: string;
  wardId?: string;
  wardName?: string;
  roomNumber?: string;
  admittedBy: string;
  admittedByRole: string;
  admittingDoctor: string;
  admittingDoctorId: string;
  admittingDiagnosis: string;
  admittedAt: string;
  expectedDischarge?: string;
  actualDischarge?: string;
  dischargeSummary?: string;
  dischargeInstructions?: string;
  lengthOfStay?: number;
  preAdmissionNotes?: string;
  consentForms: string[];
  estimatedCost?: number;
}

// ============ EMERGENCY ============
export interface EmergencyCase {
  id: string;
  caseNumber: string;
  patientName?: string;
  patientId?: string;
  patientAge?: number;
  patientGender?: string;
  patientPhone?: string;
  case: string;
  description: string;
  eta: string;
  arrivalTime?: string;
  arrivalMode?: string;
  arrivalDate?: string;
  level: 'Critical' | 'Serious' | 'Moderate' | 'Minor';
  triageScore?: number;
  status: 'Incoming' | 'Triage' | 'In Treatment' | 'Observation' | 'Discharged' | 'Admitted' | 'Transferred' | 'Deceased';
  assignedDoctor?: string;
  assignedDoctorId?: string;
  assignedNurse?: string;
  bedNumber?: string;
  treatmentArea?: string;
  chiefComplaint: string;
  vitalSigns?: VitalSign[];
  allergies?: string[];
  currentMedications?: string[];
  treatments: EmergencyTreatment[];
  disposition?: string;
  dispositionTime?: string;
  ambulanceNumber?: string;
  bystanderName?: string;
  bystanderPhone?: string;
  notes?: string;
  createdAt?: string;
}

export interface EmergencyTreatment {
  id: string;
  treatment: string;
  administeredAt: string;
  administeredBy: string;
  notes?: string;
}

export interface Ambulance {
  id: string;
  vehicleNumber: string;
  licensePlate: string;
  driverName: string;
  driverPhone: string;
  status: 'Available' | 'Dispatched' | 'On Call' | 'Maintenance' | 'Out of Service';
  type?: string;
  currentLocation?: string;
  destination?: string;
  eta?: string;
  patientName?: string;
  assignedAt?: string;
  estimatedReturn?: string;
  paramedicName?: string;
}

// ============ SURGERY ============
export interface SurgeryTheater {
  id: string;
  name: string;
  number: string;
  department: string;
  status: 'Available' | 'In Use' | 'Cleaning' | 'Maintenance' | 'Reserved';
  features: string[];
  equipment?: string[];
  capacity?: number;
  currentSurgeryId?: string;
}

export type OperatingRoom = SurgeryTheater;

export interface SurgeryTeam {
  surgeonId: string;
  surgeonName: string;
  role: 'Lead Surgeon' | 'Assistant Surgeon' | 'Anesthesiologist' | 'Scrub Nurse' | 'Circulating Nurse' | 'Surgical Tech';
}

export interface PreOpChecklistItem {
  id: string;
  item: string;
  category?: string;
  completed: boolean;
  isCompleted?: boolean;
  completedBy?: string;
  completedAt?: string;
}

export type ChecklistItem = PreOpChecklistItem;

export interface Surgery {
  id: string;
  surgeryNumber: string;
  patientId: string;
  patientName: string;
  procedure: string;
  procedureCode: string;
  department: string;
  theaterId: string;
  operatingRoomId?: string;
  operatingRoomName?: string;
  theaterName: string;
  scheduledDate: string;
  scheduledTime: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  surgeonName?: string;
  anesthesiologistName?: string;
  assistantSurgeons?: string[];
  estimatedDuration: number;
  actualDuration?: number;
  status: 'Scheduled' | 'Pre-Op' | 'In Progress' | 'Closing' | 'Completed' | 'Cancelled' | 'Postponed';
  team: SurgeryTeam[];
  anesthesiaType: 'General' | 'Regional' | 'Local' | 'MAC' | 'None';
  preOpDiagnosis: string;
  postOpDiagnosis?: string;
  postOpNotes?: string;
  complications?: string;
  bloodLoss?: number;
  specimens?: string[];
  implants?: string[];
  notes?: string;
  consentFormSigned: boolean;
  preOpChecklist: PreOpChecklistItem[];
}

// ============ INVENTORY ============
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  sku: string;
  description: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  reorderLevel: number;
  reorderQuantity: number;
  unitCost: number;
  totalValue: number;
  location: string;
  supplier: string;
  supplierId: string;
  lastRestocked: string;
  nextRestock?: string;
  expiryDate?: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expired' | 'On Order';
  assetTag?: string;
  serialNumber?: string;
  warrantyExpiry?: string;
  maintenanceSchedule?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
}

// ============ TASK ============
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Done' | 'Cancelled';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  due: string;
  assignedTo: string;
  assignedToId: string;
  assignedBy: string;
  category: string;
  department?: string;
  relatedPatientId?: string;
  relatedPatientName?: string;
  completedAt?: string;
  completedBy?: string;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

// ============ CALENDAR EVENT ============
export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'meeting' | 'surgery' | 'appointment' | 'training' | 'conference' | 'other';
  location?: string;
  department?: string;
  attendees: EventAttendee[];
  organizer: string;
  organizerId: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Postponed';
  isAllDay: boolean;
  recurrence?: 'None' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  reminder?: number;
  notes?: string;
}

export interface EventAttendee {
  id: string;
  name: string;
  email?: string;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Tentative';
}

// ============ DOCUMENT ============
export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'spreadsheet' | 'document' | 'video' | 'audio' | 'other';
  category: 'Patient Record' | 'Lab Report' | 'Imaging' | 'Consent Form' | 'Insurance' | 'Administrative' | 'Policy' | 'Training' | 'Other';
  size: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  patientId?: string;
  patientName?: string;
  appointmentId?: string;
  uploadedAt: string;
  uploadedBy: string;
  uploadedById: string;
  department?: string;
  tags: string[];
  version: number;
  previousVersions?: DocumentVersion[];
  accessLevel: 'Public' | 'Internal' | 'Restricted' | 'Confidential';
  expiresAt?: string;
  notes?: string;
}

export interface DocumentVersion {
  version: number;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
  notes?: string;
}

// ============ NOTIFICATION ============
export interface Notification {
  id: string;
  type: 'Alert' | 'Reminder' | 'Info' | 'Warning' | 'Emergency';
  title: string;
  message: string;
  category: 'Patient' | 'Appointment' | 'Lab' | 'Pharmacy' | 'Billing' | 'Emergency' | 'System' | 'Task';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  targetUserId?: string;
  targetRole?: UserRole;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: string;
  expiresAt?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

// ============ DASHBOARD STATS ============
export interface DashboardStats {
  totalPatients: number;
  inpatients: number;
  outpatients: number;
  criticalPatients: number;
  todayAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  availableDoctors: number;
  onDutyNurses: number;
  pendingLabResults: number;
  emergencyCases: number;
  activeEmergencies: number;
  bedOccupancy: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  pendingInvoices: number;
  totalRevenue: number;
  outstandingAmount: number;
  pendingPrescriptions: number;
  lowStockMedications: number;
  scheduledSurgeries: number;
  pendingTasks: number;
  occupancyByDepartment: { name: string; occupancy: number }[];
  patientTrend: { date: string; count: number }[];
  revenueTrend: { date: string; revenue: number }[];
  appointmentStats: { type: string; count: number }[];
}

// ============ API RESPONSE ============
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============ SEARCH ============
export interface SearchResult {
  type: 'Patient' | 'Doctor' | 'Appointment' | 'Invoice' | 'LabResult' | 'Medication' | 'Document';
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  url: string;
  icon: string;
}
