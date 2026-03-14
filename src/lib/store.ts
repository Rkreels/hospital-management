import {
  Patient,
  Doctor,
  Nurse,
  Appointment,
  Department,
  Medication,
  Prescription,
  LabTest,
  LabOrder,
  LabResult,
  Invoice,
  Admission,
  EmergencyCase,
  Task,
  Event,
  Document,
  Notification,
  Bed,
  Surgery,
  InventoryItem,
  DashboardStats,
  SurgeryTheater,
  LabTestCategory,
  Payment,
} from '@/types';
import {
  generatePatients,
  generateDoctors,
  generateNurses,
  generateAppointments,
  generateDepartments,
  generateMedications,
  generatePrescriptions,
  generateLabTests,
  generateLabOrders,
  generateLabResults,
  generateInvoices,
  generateAdmissions,
  generateEmergencyCases,
  generateTasks,
  generateEvents,
  generateDocuments,
  generateNotifications,
  generateBeds,
  generateSurgeries,
  generateInventory,
  generateSurgeryTheaters,
  generateLabCategories,
} from './data-generator';

// Helper to generate unique IDs
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Data cache
let cachedData: {
  patients: Patient[];
  doctors: Doctor[];
  nurses: Nurse[];
  appointments: Appointment[];
  departments: Department[];
  medications: Medication[];
  prescriptions: Prescription[];
  labTests: LabTest[];
  labOrders: LabOrder[];
  labResults: LabResult[];
  invoices: Invoice[];
  admissions: Admission[];
  emergencyCases: EmergencyCase[];
  tasks: Task[];
  events: Event[];
  documents: Document[];
  notifications: Notification[];
  beds: Bed[];
  surgeries: Surgery[];
  inventory: InventoryItem[];
  surgeryTheaters: SurgeryTheater[];
  labCategories: LabTestCategory[];
  payments: Payment[];
} | null = null;

// Activity log for dashboard
let activityLog: {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  department?: string;
  userId?: string;
}[] = [];

// Get or initialize data
function getData() {
  if (!cachedData) {
    console.log('Initializing comprehensive hospital data...');
    const startTime = Date.now();
    
    // Generate base data
    const patients = generatePatients();
    const doctors = generateDoctors(patients);
    const nurses = generateNurses();
    const departments = generateDepartments(doctors);
    const beds = generateBeds(departments);
    const medications = generateMedications();
    const labTests = generateLabTests();
    const appointments = generateAppointments(patients, doctors);
    const prescriptions = generatePrescriptions(patients, doctors, medications);
    const labOrders = generateLabOrders(patients, doctors, labTests);
    const labResults = generateLabResults(labOrders);
    const invoices = generateInvoices(patients);
    const admissions = generateAdmissions(patients, beds);
    const emergencyCases = generateEmergencyCases();
    const tasks = generateTasks();
    const events = generateEvents();
    const documents = generateDocuments(patients);
    const notifications = generateNotifications();
    const surgeries = generateSurgeries(patients, doctors);
    const inventory = generateInventory();
    const surgeryTheaters = generateSurgeryTheaters();
    const labCategories = generateLabCategories();
    
    cachedData = {
      patients,
      doctors,
      nurses,
      appointments,
      departments,
      medications,
      prescriptions,
      labTests,
      labOrders,
      labResults,
      invoices,
      admissions,
      emergencyCases,
      tasks,
      events,
      documents,
      notifications,
      beds,
      surgeries,
      inventory,
      surgeryTheaters,
      labCategories,
      payments: [],
    };
    
    // Initialize activity log
    activityLog = [
      { id: generateId('ACT'), type: 'admission', title: 'New patient admitted', description: 'John Smith admitted to Cardiology', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), department: 'Cardiology' },
      { id: generateId('ACT'), type: 'emergency', title: 'Emergency case resolved', description: 'Critical patient stabilized and transferred', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), department: 'Emergency' },
      { id: generateId('ACT'), type: 'lab', title: 'Lab results available', description: 'CBC results for Maria Gomez are ready', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), department: 'Laboratory' },
      { id: generateId('ACT'), type: 'discharge', title: 'Patient discharged', description: 'Robert Brown discharged from Orthopedics', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), department: 'Orthopedics' },
      { id: generateId('ACT'), type: 'surgery', title: 'Surgery completed', description: 'Appendectomy performed successfully', timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), department: 'Surgery' },
      { id: generateId('ACT'), type: 'pharmacy', title: 'Prescription dispensed', description: 'Medications dispensed for patient P-001', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), department: 'Pharmacy' },
      { id: generateId('ACT'), type: 'billing', title: 'Payment received', description: 'Invoice INV-001 paid in full', timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), department: 'Billing' },
      { id: generateId('ACT'), type: 'appointment', title: 'Appointment scheduled', description: 'Follow-up scheduled for next week', timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(), department: 'Outpatient' },
    ];
    
    console.log(`Data initialized in ${Date.now() - startTime}ms`);
  }
  return cachedData;
}

// In-memory data store
export const db = {
  // ============ DASHBOARD ============
  getDashboardStats(): DashboardStats {
    const data = getData();
    const today = new Date().toISOString().split('T')[0];
    
    const totalPatients = data.patients.length;
    const inpatients = data.patients.filter(p => !['Discharged', 'Outpatient'].includes(p.status)).length;
    const outpatients = data.patients.filter(p => p.status === 'Outpatient').length;
    
    const totalBeds = data.departments.reduce((sum, d) => sum + d.beds, 0);
    const occupiedBeds = data.departments.reduce((sum, d) => sum + d.occupiedBeds, 0);
    
    const totalRevenue = data.invoices
      .filter(i => i.status === 'Paid')
      .reduce((sum, i) => sum + i.total, 0);
    
    const outstandingAmount = data.invoices
      .filter(i => ['Pending', 'Overdue', 'Partial'].includes(i.status))
      .reduce((sum, i) => sum + i.balance, 0);
    
    return {
      totalPatients,
      inpatients,
      outpatients,
      criticalPatients: data.patients.filter(p => p.status === 'Critical').length,
      todayAppointments: data.appointments.filter(a => a.date === today || a.status === 'Scheduled').length,
      completedAppointments: data.appointments.filter(a => a.status === 'Completed').length,
      cancelledAppointments: data.appointments.filter(a => a.status === 'Cancelled').length,
      availableDoctors: data.doctors.filter(d => d.status === 'Available').length,
      onDutyNurses: data.nurses.filter(n => n.status === 'Available' || n.status === 'Busy').length,
      pendingLabResults: data.labResults.filter(l => l.status === 'Preliminary').length,
      emergencyCases: data.emergencyCases.filter(e => ['Incoming', 'Triage', 'In Treatment'].includes(e.status)).length,
      activeEmergencies: data.emergencyCases.filter(e => e.level === 'Critical' && ['Incoming', 'Triage'].includes(e.status)).length,
      bedOccupancy: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
      totalBeds,
      occupiedBeds,
      availableBeds: totalBeds - occupiedBeds,
      pendingInvoices: data.invoices.filter(i => ['Pending', 'Overdue'].includes(i.status)).length,
      totalRevenue,
      outstandingAmount,
      pendingPrescriptions: data.prescriptions.filter(p => p.status === 'Pending').length,
      lowStockMedications: data.medications.filter(m => m.status === 'Low Stock' || m.status === 'Out of Stock').length,
      scheduledSurgeries: data.surgeries.filter(s => ['Scheduled', 'Pre-Op'].includes(s.status)).length,
      pendingTasks: data.tasks.filter(t => t.status === 'To Do' || t.status === 'In Progress').length,
      occupancyByDepartment: data.departments.map(d => ({
        name: d.name,
        occupancy: d.beds > 0 ? Math.round((d.occupiedBeds / d.beds) * 100) : 0,
      })),
      patientTrend: generateTrendData(7, 'patients'),
      revenueTrend: generateTrendData(7, 'revenue'),
      appointmentStats: [
        { type: 'Consultation', count: data.appointments.filter(a => a.type === 'Consultation').length },
        { type: 'Follow-up', count: data.appointments.filter(a => a.type === 'Follow-up').length },
        { type: 'Emergency', count: data.appointments.filter(a => a.type === 'Emergency').length },
        { type: 'Routine', count: data.appointments.filter(a => a.type === 'Routine Checkup').length },
      ],
    };
  },

  getActivityLog(limit = 10) {
    return activityLog.slice(0, limit);
  },

  addActivity(activity: { type: string; title: string; description: string; department?: string; userId?: string }) {
    const newActivity = {
      id: generateId('ACT'),
      ...activity,
      timestamp: new Date().toISOString(),
    };
    activityLog.unshift(newActivity);
    return newActivity;
  },

  // ============ PATIENTS ============
  getPatients: (): Patient[] => [...getData().patients],
  getPatient: (id: string): Patient | undefined => getData().patients.find(p => p.id === id),
  getPatientByMRN: (mrn: string): Patient | undefined => getData().patients.find(p => p.mrn === mrn),
  addPatient: (patient: Omit<Patient, 'id' | 'mrn'>): Patient => {
    const data = getData();
    const mrn = `MRN${String(100000 + data.patients.length).padStart(6, '0')}`;
    const newPatient = { 
      ...patient, 
      id: generateId('P'),
      mrn,
    } as Patient;
    data.patients.unshift(newPatient);
    
    db.addActivity({
      type: 'admission',
      title: 'New patient registered',
      description: `${patient.name} registered in the system`,
      department: patient.ward,
    });
    
    return newPatient;
  },
  updatePatient: (id: string, patientData: Partial<Patient>): Patient | undefined => {
    const patients = getData().patients;
    const index = patients.findIndex(p => p.id === id);
    if (index !== -1) {
      patients[index] = { ...patients[index], ...patientData };
      return patients[index];
    }
    return undefined;
  },
  deletePatient: (id: string): boolean => {
    const patients = getData().patients;
    const index = patients.findIndex(p => p.id === id);
    if (index !== -1) {
      patients.splice(index, 1);
      return true;
    }
    return false;
  },
  searchPatients: (query: string): Patient[] => {
    const patients = getData().patients;
    const q = query.toLowerCase();
    return patients.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.primaryDiagnosis?.toLowerCase().includes(q)
    );
  },

  // ============ DOCTORS ============
  getDoctors: (): Doctor[] => [...getData().doctors],
  getDoctor: (id: string): Doctor | undefined => getData().doctors.find(d => d.id === id),
  addDoctor: (doctor: Omit<Doctor, 'id' | 'employeeId'>): Doctor => {
    const data = getData();
    const employeeId = `EMP${String(1000 + data.doctors.length).padStart(5, '0')}`;
    const newDoctor = { 
      ...doctor, 
      id: generateId('D'),
      employeeId,
    } as Doctor;
    data.doctors.unshift(newDoctor);
    return newDoctor;
  },
  updateDoctor: (id: string, doctorData: Partial<Doctor>): Doctor | undefined => {
    const doctors = getData().doctors;
    const index = doctors.findIndex(d => d.id === id);
    if (index !== -1) {
      doctors[index] = { ...doctors[index], ...doctorData };
      return doctors[index];
    }
    return undefined;
  },
  deleteDoctor: (id: string): boolean => {
    const doctors = getData().doctors;
    const index = doctors.findIndex(d => d.id === id);
    if (index !== -1) {
      doctors.splice(index, 1);
      return true;
    }
    return false;
  },

  // ============ NURSES ============
  getNurses: (): Nurse[] => [...getData().nurses],
  getNurse: (id: string): Nurse | undefined => getData().nurses.find(n => n.id === id),
  addNurse: (nurse: Omit<Nurse, 'id' | 'employeeId'>): Nurse => {
    const data = getData();
    const employeeId = `NUR${String(1000 + data.nurses.length).padStart(5, '0')}`;
    const newNurse = { 
      ...nurse, 
      id: generateId('N'),
      employeeId,
    } as Nurse;
    data.nurses.unshift(newNurse);
    
    db.addActivity({
      type: 'staff',
      title: 'New nurse added',
      description: `${nurse.name} added to ${nurse.department}`,
      department: nurse.department,
    });
    
    return newNurse;
  },
  updateNurse: (id: string, nurseData: Partial<Nurse>): Nurse | undefined => {
    const nurses = getData().nurses;
    const index = nurses.findIndex(n => n.id === id);
    if (index !== -1) {
      nurses[index] = { ...nurses[index], ...nurseData };
      return nurses[index];
    }
    return undefined;
  },
  deleteNurse: (id: string): boolean => {
    const nurses = getData().nurses;
    const index = nurses.findIndex(n => n.id === id);
    if (index !== -1) {
      nurses.splice(index, 1);
      return true;
    }
    return false;
  },

  // ============ APPOINTMENTS ============
  getAppointments: (): Appointment[] => [...getData().appointments],
  getAppointment: (id: string): Appointment | undefined => getData().appointments.find(a => a.id === id),
  getAppointmentsByDate: (date: string): Appointment[] => getData().appointments.filter(a => a.date === date),
  getAppointmentsByDoctor: (doctorId: string): Appointment[] => getData().appointments.filter(a => a.doctorId === doctorId),
  getAppointmentsByPatient: (patientId: string): Appointment[] => getData().appointments.filter(a => a.patientId === patientId),
  addAppointment: (appointment: Omit<Appointment, 'id' | 'appointmentNumber'>): Appointment => {
    const data = getData();
    const appointmentNumber = `APT${String(100000 + data.appointments.length).padStart(6, '0')}`;
    const newAppointment = { 
      ...appointment, 
      id: generateId('APT'),
      appointmentNumber,
      createdAt: new Date().toISOString(),
    } as Appointment;
    data.appointments.unshift(newAppointment);
    
    db.addActivity({
      type: 'appointment',
      title: 'Appointment scheduled',
      description: `${appointment.patientName} with ${appointment.doctorName}`,
      department: appointment.department,
    });
    
    return newAppointment;
  },
  updateAppointment: (id: string, appointmentData: Partial<Appointment>): Appointment | undefined => {
    const appointments = getData().appointments;
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...appointmentData, updatedAt: new Date().toISOString() };
      return appointments[index];
    }
    return undefined;
  },
  deleteAppointment: (id: string): boolean => {
    const appointments = getData().appointments;
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      appointments.splice(index, 1);
      return true;
    }
    return false;
  },

  // ============ DEPARTMENTS ============
  getDepartments: (): Department[] => [...getData().departments],
  getDepartment: (id: string): Department | undefined => getData().departments.find(d => d.id === id),
  updateDepartment: (id: string, deptData: Partial<Department>): Department | undefined => {
    const departments = getData().departments;
    const index = departments.findIndex(d => d.id === id);
    if (index !== -1) {
      departments[index] = { ...departments[index], ...deptData };
      return departments[index];
    }
    return undefined;
  },

  // ============ BEDS ============
  getBeds: (): Bed[] => [...getData().beds],
  getBed: (id: string): Bed | undefined => getData().beds.find(b => b.id === id),
  getBedsByDepartment: (deptId: string): Bed[] => getData().beds.filter(b => b.wardId === deptId),
  updateBed: (id: string, bedData: Partial<Bed>): Bed | undefined => {
    const beds = getData().beds;
    const index = beds.findIndex(b => b.id === id);
    if (index !== -1) {
      beds[index] = { ...beds[index], ...bedData };
      return beds[index];
    }
    return undefined;
  },

  // ============ MEDICATIONS ============
  getMedications: (): Medication[] => [...getData().medications],
  getMedication: (id: string): Medication | undefined => getData().medications.find(m => m.id === id),
  addMedication: (medication: Omit<Medication, 'id'>): Medication => {
    const data = getData();
    const newMedication = { ...medication, id: generateId('M') };
    data.medications.unshift(newMedication);
    return newMedication;
  },
  updateMedication: (id: string, medData: Partial<Medication>): Medication | undefined => {
    const medications = getData().medications;
    const index = medications.findIndex(m => m.id === id);
    if (index !== -1) {
      medications[index] = { ...medications[index], ...medData };
      return medications[index];
    }
    return undefined;
  },
  deleteMedication: (id: string): boolean => {
    const medications = getData().medications;
    const index = medications.findIndex(m => m.id === id);
    if (index !== -1) {
      medications.splice(index, 1);
      return true;
    }
    return false;
  },
  searchMedications: (query: string): Medication[] => {
    const medications = getData().medications;
    const q = query.toLowerCase();
    return medications.filter(m => 
      m.name.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    );
  },

  // ============ PRESCRIPTIONS ============
  getPrescriptions: (): Prescription[] => [...getData().prescriptions],
  getPrescription: (id: string): Prescription | undefined => getData().prescriptions.find(p => p.id === id),
  getPrescriptionsByPatient: (patientId: string): Prescription[] => getData().prescriptions.filter(p => p.patientId === patientId),
  addPrescription: (prescription: Omit<Prescription, 'id' | 'prescriptionNumber'>): Prescription => {
    const data = getData();
    const prescriptionNumber = `RX${String(100000 + data.prescriptions.length).padStart(6, '0')}`;
    const newPrescription = { 
      ...prescription, 
      id: generateId('RX'),
      prescriptionNumber,
    } as Prescription;
    data.prescriptions.unshift(newPrescription);
    return newPrescription;
  },
  updatePrescription: (id: string, prescriptionData: Partial<Prescription>): Prescription | undefined => {
    const prescriptions = getData().prescriptions;
    const index = prescriptions.findIndex(p => p.id === id);
    if (index !== -1) {
      prescriptions[index] = { ...prescriptions[index], ...prescriptionData };
      return prescriptions[index];
    }
    return undefined;
  },

  // ============ LAB TESTS ============
  getLabTests: (): LabTest[] => [...getData().labTests],
  getLabTest: (id: string): LabTest | undefined => getData().labTests.find(t => t.id === id),
  getLabCategories: (): LabTestCategory[] => [...getData().labCategories],

  // ============ LAB ORDERS ============
  getLabOrders: (): LabOrder[] => [...getData().labOrders],
  getLabOrder: (id: string): LabOrder | undefined => getData().labOrders.find(l => l.id === id),
  getLabOrdersByPatient: (patientId: string): LabOrder[] => getData().labOrders.filter(l => l.patientId === patientId),
  addLabOrder: (order: Omit<LabOrder, 'id' | 'orderNumber'>): LabOrder => {
    const data = getData();
    const orderNumber = `LAB${String(100000 + data.labOrders.length).padStart(6, '0')}`;
    const newOrder = { 
      ...order, 
      id: generateId('LO'),
      orderNumber,
      orderedAt: new Date().toISOString(),
    } as LabOrder;
    data.labOrders.unshift(newOrder);
    return newOrder;
  },
  updateLabOrder: (id: string, orderData: Partial<LabOrder>): LabOrder | undefined => {
    const labOrders = getData().labOrders;
    const index = labOrders.findIndex(l => l.id === id);
    if (index !== -1) {
      labOrders[index] = { ...labOrders[index], ...orderData };
      return labOrders[index];
    }
    return undefined;
  },

  // ============ LAB RESULTS ============
  getLabResults: (): LabResult[] => [...getData().labResults],
  getLabResult: (id: string): LabResult | undefined => getData().labResults.find(l => l.id === id),
  getLabResultsByPatient: (patientId: string): LabResult[] => getData().labResults.filter(l => l.patientId === patientId),

  // ============ INVOICES ============
  getInvoices: (): Invoice[] => [...getData().invoices],
  getInvoice: (id: string): Invoice | undefined => getData().invoices.find(i => i.id === id),
  getInvoicesByPatient: (patientId: string): Invoice[] => getData().invoices.filter(i => i.patientId === patientId),
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>): Invoice => {
    const data = getData();
    const invoiceNumber = `INV${String(100000 + data.invoices.length).padStart(6, '0')}`;
    const newInvoice = { 
      ...invoice, 
      id: generateId('INV'),
      invoiceNumber,
    } as Invoice;
    data.invoices.unshift(newInvoice);
    return newInvoice;
  },
  updateInvoice: (id: string, invoiceData: Partial<Invoice>): Invoice | undefined => {
    const invoices = getData().invoices;
    const index = invoices.findIndex(i => i.id === id);
    if (index !== -1) {
      invoices[index] = { ...invoices[index], ...invoiceData };
      return invoices[index];
    }
    return undefined;
  },
  deleteInvoice: (id: string): boolean => {
    const invoices = getData().invoices;
    const index = invoices.findIndex(i => i.id === id);
    if (index !== -1) {
      invoices.splice(index, 1);
      return true;
    }
    return false;
  },

  // ============ ADMISSIONS ============
  getAdmissions: (): Admission[] => [...getData().admissions],
  getAdmission: (id: string): Admission | undefined => getData().admissions.find(a => a.id === id),
  getAdmissionsByPatient: (patientId: string): Admission[] => getData().admissions.find(a => a.patientId === patientId) ? [getData().admissions.find(a => a.patientId === patientId)!] : [],
  addAdmission: (admission: Omit<Admission, 'id' | 'admissionNumber'>): Admission => {
    const data = getData();
    const admissionNumber = `ADM${String(100000 + data.admissions.length).padStart(6, '0')}`;
    const newAdmission = { 
      ...admission, 
      id: generateId('AD'),
      admissionNumber,
    } as Admission;
    data.admissions.unshift(newAdmission);
    return newAdmission;
  },
  updateAdmission: (id: string, admissionData: Partial<Admission>): Admission | undefined => {
    const admissions = getData().admissions;
    const index = admissions.findIndex(a => a.id === id);
    if (index !== -1) {
      admissions[index] = { ...admissions[index], ...admissionData };
      return admissions[index];
    }
    return undefined;
  },
  deleteAdmission: (id: string): boolean => {
    const admissions = getData().admissions;
    const index = admissions.findIndex(a => a.id === id);
    if (index !== -1) {
      admissions.splice(index, 1);
      return true;
    }
    return false;
  },

  // ============ EMERGENCY ============
  getEmergencyCases: (): EmergencyCase[] => [...getData().emergencyCases],
  getEmergencyCase: (id: string): EmergencyCase | undefined => getData().emergencyCases.find(e => e.id === id),
  addEmergencyCase: (emergencyCase: Omit<EmergencyCase, 'id' | 'caseNumber'>): EmergencyCase => {
    const data = getData();
    const caseNumber = `ER${String(100000 + data.emergencyCases.length).padStart(6, '0')}`;
    const newCase = { 
      ...emergencyCase, 
      id: generateId('ER'),
      caseNumber,
    } as EmergencyCase;
    data.emergencyCases.unshift(newCase);
    
    if (emergencyCase.level === 'Critical') {
      db.addActivity({
        type: 'emergency',
        title: 'Critical emergency case',
        description: emergencyCase.case || 'Critical patient incoming',
        department: 'Emergency',
      });
    }
    
    return newCase;
  },
  updateEmergencyCase: (id: string, caseData: Partial<EmergencyCase>): EmergencyCase | undefined => {
    const emergencyCases = getData().emergencyCases;
    const index = emergencyCases.findIndex(e => e.id === id);
    if (index !== -1) {
      emergencyCases[index] = { ...emergencyCases[index], ...caseData };
      return emergencyCases[index];
    }
    return undefined;
  },
  deleteEmergencyCase: (id: string): boolean => {
    const emergencyCases = getData().emergencyCases;
    const index = emergencyCases.findIndex(e => e.id === id);
    if (index !== -1) {
      emergencyCases.splice(index, 1);
      return true;
    }
    return false;
  },

  // ============ TASKS ============
  getTasks: (): Task[] => [...getData().tasks],
  getTask: (id: string): Task | undefined => getData().tasks.find(t => t.id === id),
  getTasksByAssignee: (assigneeId: string): Task[] => getData().tasks.filter(t => t.assignedToId === assigneeId),
  addTask: (task: Omit<Task, 'id'>): Task => {
    const data = getData();
    const newTask = { 
      ...task, 
      id: generateId('T'),
      createdAt: new Date().toISOString(),
    } as Task;
    data.tasks.unshift(newTask);
    return newTask;
  },
  updateTask: (id: string, taskData: Partial<Task>): Task | undefined => {
    const tasks = getData().tasks;
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...taskData };
      return tasks[index];
    }
    return undefined;
  },
  deleteTask: (id: string): boolean => {
    const tasks = getData().tasks;
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks.splice(index, 1);
      return true;
    }
    return false;
  },

  // ============ EVENTS ============
  getEvents: (): Event[] => [...getData().events],
  getEvent: (id: string): Event | undefined => getData().events.find(e => e.id === id),
  getEventsByDate: (date: string): Event[] => getData().events.filter(e => e.date === date),
  addEvent: (event: Omit<Event, 'id'>): Event => {
    const data = getData();
    const newEvent = { ...event, id: generateId('E') };
    data.events.unshift(newEvent);
    return newEvent;
  },
  updateEvent: (id: string, eventData: Partial<Event>): Event | undefined => {
    const events = getData().events;
    const index = events.findIndex(e => e.id === id);
    if (index !== -1) {
      events[index] = { ...events[index], ...eventData };
      return events[index];
    }
    return undefined;
  },
  deleteEvent: (id: string): boolean => {
    const events = getData().events;
    const index = events.findIndex(e => e.id === id);
    if (index !== -1) {
      events.splice(index, 1);
      return true;
    }
    return false;
  },

  // ============ DOCUMENTS ============
  getDocuments: (): Document[] => [...getData().documents],
  getDocument: (id: string): Document | undefined => getData().documents.find(d => d.id === id),
  getDocumentsByPatient: (patientId: string): Document[] => getData().documents.filter(d => d.patientId === patientId),
  addDocument: (document: Omit<Document, 'id' | 'uploadedAt' | 'version'>): Document => {
    const data = getData();
    const newDocument = { 
      ...document, 
      id: generateId('DOC'),
      uploadedAt: new Date().toISOString(),
      version: 1,
    };
    data.documents.unshift(newDocument);
    return newDocument;
  },
  updateDocument: (id: string, docData: Partial<Document>): Document | undefined => {
    const documents = getData().documents;
    const index = documents.findIndex(d => d.id === id);
    if (index !== -1) {
      documents[index] = { ...documents[index], ...docData };
      return documents[index];
    }
    return undefined;
  },
  deleteDocument: (id: string): boolean => {
    const documents = getData().documents;
    const index = documents.findIndex(d => d.id === id);
    if (index !== -1) {
      documents.splice(index, 1);
      return true;
    }
    return false;
  },

  // ============ NOTIFICATIONS ============
  getNotifications: (): Notification[] => [...getData().notifications],
  getUnreadNotifications: (): Notification[] => getData().notifications.filter(n => !n.isRead),
  markNotificationRead: (id: string): boolean => {
    const notifications = getData().notifications;
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
      notification.readAt = new Date().toISOString();
      return true;
    }
    return false;
  },
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>): Notification => {
    const data = getData();
    const newNotification = { 
      ...notification, 
      id: generateId('N'),
      createdAt: new Date().toISOString(),
    };
    data.notifications.unshift(newNotification);
    return newNotification;
  },

  // ============ SURGERIES ============
  getSurgeries: (): Surgery[] => [...getData().surgeries],
  getSurgery: (id: string): Surgery | undefined => getData().surgeries.find(s => s.id === id),
  getSurgeriesByPatient: (patientId: string): Surgery[] => getData().surgeries.filter(s => s.patientId === patientId),
  addSurgery: (surgery: Omit<Surgery, 'id' | 'surgeryNumber'>): Surgery => {
    const data = getData();
    const surgeryNumber = `SUR${String(100000 + data.surgeries.length).padStart(6, '0')}`;
    const newSurgery = { 
      ...surgery, 
      id: generateId('SUR'),
      surgeryNumber,
    } as Surgery;
    data.surgeries.unshift(newSurgery);
    return newSurgery;
  },
  updateSurgery: (id: string, surgeryData: Partial<Surgery>): Surgery | undefined => {
    const surgeries = getData().surgeries;
    const index = surgeries.findIndex(s => s.id === id);
    if (index !== -1) {
      surgeries[index] = { ...surgeries[index], ...surgeryData };
      return surgeries[index];
    }
    return undefined;
  },
  getSurgeryTheaters: (): SurgeryTheater[] => [...getData().surgeryTheaters],

  // ============ INVENTORY ============
  getInventory: (): InventoryItem[] => [...getData().inventory],
  getInventoryItem: (id: string): InventoryItem | undefined => getData().inventory.find(i => i.id === id),
  updateInventoryItem: (id: string, itemData: Partial<InventoryItem>): InventoryItem | undefined => {
    const inventory = getData().inventory;
    const index = inventory.findIndex(i => i.id === id);
    if (index !== -1) {
      inventory[index] = { ...inventory[index], ...itemData };
      return inventory[index];
    }
    return undefined;
  },

  // ============ PAYMENTS ============
  getPayments: (): Payment[] => [...getData().payments],
  getPayment: (id: string): Payment | undefined => getData().payments.find(p => p.id === id),
  getPaymentsByInvoice: (invoiceId: string): Payment[] => getData().payments.filter(p => p.invoiceId === invoiceId),
  addPayment: (payment: Omit<Payment, 'id'>): Payment => {
    const data = getData();
    const newPayment: Payment = {
      ...payment,
      id: generateId('PAY'),
    };
    data.payments.unshift(newPayment);
    
    // Update invoice paid amount and balance
    const invoice = data.invoices.find(i => i.id === payment.invoiceId);
    if (invoice) {
      invoice.paidAmount += payment.amount;
      invoice.balance = Math.max(0, invoice.total - invoice.paidAmount);
      invoice.payments = invoice.payments || [];
      invoice.payments.push(newPayment);
      
      // Update status
      if (invoice.balance <= 0) {
        invoice.status = 'Paid';
      } else if (invoice.paidAmount > 0) {
        invoice.status = 'Partial';
      }
    }
    
    db.addActivity({
      type: 'billing',
      title: 'Payment received',
      description: `Payment of $${payment.amount.toFixed(2)} received for invoice`,
      department: 'Billing',
    });
    
    return newPayment;
  },
  updatePayment: (id: string, paymentData: Partial<Payment>): Payment | undefined => {
    const payments = getData().payments;
    const index = payments.findIndex(p => p.id === id);
    if (index !== -1) {
      payments[index] = { ...payments[index], ...paymentData };
      return payments[index];
    }
    return undefined;
  },

  // ============ GLOBAL SEARCH ============
  globalSearch: (query: string) => {
    const data = getData();
    const q = query.toLowerCase();
    const results: { type: string; id: string; title: string; subtitle: string; url: string }[] = [];
    
    // Search patients
    data.patients.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.mrn.toLowerCase().includes(q)
    ).slice(0, 5).forEach(p => {
      results.push({ type: 'Patient', id: p.id, title: p.name, subtitle: p.mrn, url: '/patients' });
    });
    
    // Search doctors
    data.doctors.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.specialty.toLowerCase().includes(q)
    ).slice(0, 5).forEach(d => {
      results.push({ type: 'Doctor', id: d.id, title: d.name, subtitle: d.specialty, url: '/doctors' });
    });
    
    // Search medications
    data.medications.filter(m => 
      m.name.toLowerCase().includes(q) || 
      m.genericName.toLowerCase().includes(q)
    ).slice(0, 5).forEach(m => {
      results.push({ type: 'Medication', id: m.id, title: m.name, subtitle: m.category, url: '/pharmacy' });
    });
    
    // Search lab tests
    data.labTests.filter(t => 
      t.name.toLowerCase().includes(q)
    ).slice(0, 5).forEach(t => {
      results.push({ type: 'Lab Test', id: t.id, title: t.name, subtitle: t.category, url: '/lab-results' });
    });
    
    // Search appointments
    data.appointments.filter(a => 
      a.patientName.toLowerCase().includes(q)
    ).slice(0, 5).forEach(a => {
      results.push({ type: 'Appointment', id: a.id, title: a.patientName, subtitle: `${a.date} ${a.time}`, url: '/appointments' });
    });
    
    return results;
  },
};

// Helper function to generate trend data
function generateTrendData(days: number, type: 'patients' | 'revenue') {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      count: type === 'patients' ? Math.floor(Math.random() * 20) + 10 : undefined,
      revenue: type === 'revenue' ? Math.floor(Math.random() * 50000) + 10000 : undefined,
    });
  }
  
  return data;
}
