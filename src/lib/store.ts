import {
  Patient,
  Doctor,
  Appointment,
  Department,
  Medication,
  Invoice,
  LabResult,
  Admission,
  EmergencyCase,
  Task,
  Event,
  DashboardStats,
} from '@/types';
import { 
  generatePatients, 
  generateDoctors, 
  generateAppointments, 
  generateDepartments, 
  generateMedications,
  generateInvoices,
  generateLabResults,
  generateAdmissions,
  generateEmergencyCases,
  generateTasks,
  generateEvents
} from './data-generator';

// Helper to generate unique IDs
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Data cache
let cachedData: {
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  departments: Department[];
  medications: Medication[];
  invoices: Invoice[];
  labResults: LabResult[];
  admissions: Admission[];
  emergencyCases: EmergencyCase[];
  tasks: Task[];
  events: Event[];
} | null = null;

// Get or initialize data
function getData() {
  if (!cachedData) {
    console.log('Initializing data...');
    const startTime = Date.now();
    const patients = generatePatients();
    const doctors = generateDoctors();
    cachedData = {
      patients,
      doctors,
      appointments: generateAppointments(patients, doctors),
      departments: generateDepartments(doctors),
      medications: generateMedications(),
      invoices: generateInvoices(patients),
      labResults: generateLabResults(patients),
      admissions: generateAdmissions(patients),
      emergencyCases: generateEmergencyCases(),
      tasks: generateTasks(),
      events: generateEvents()
    };
    console.log(`Data initialized in ${Date.now() - startTime}ms`);
  }
  return cachedData;
}

// In-memory data store
export const db = {
  // Dashboard stats
  getDashboardStats(): DashboardStats {
    const data = getData();
    const today = new Date().toISOString().split('T')[0];
    
    return {
      totalPatients: data.patients.filter(p => p.status !== 'Discharged').length,
      criticalPatients: data.patients.filter(p => p.status === 'Critical').length,
      todayAppointments: data.appointments.filter(a => a.date === today || a.status === 'Scheduled').length,
      availableDoctors: data.doctors.filter(d => d.status === 'Available').length,
      pendingLabResults: data.labResults.filter(l => l.status === 'Pending').length,
      emergencyCases: data.emergencyCases.filter(e => e.status === 'Incoming').length,
      bedOccupancy: Math.round((data.departments.reduce((sum, d) => sum + d.occupiedBeds, 0) / data.departments.reduce((sum, d) => sum + d.beds, 0)) * 100),
      pendingInvoices: data.invoices.filter(i => i.status === 'Pending' || i.status === 'Overdue').length,
    };
  },

  // Patients
  getPatients: (): Patient[] => [...getData().patients],
  getPatient: (id: string): Patient | undefined => getData().patients.find(p => p.id === id),
  addPatient: (patient: Omit<Patient, 'id'>): Patient => {
    const newPatient = { ...patient, id: generateId('P') };
    getData().patients.unshift(newPatient);
    return newPatient;
  },
  updatePatient: (id: string, data: Partial<Patient>): Patient | undefined => {
    const patients = getData().patients;
    const index = patients.findIndex(p => p.id === id);
    if (index !== -1) {
      patients[index] = { ...patients[index], ...data };
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

  // Doctors
  getDoctors: (): Doctor[] => [...getData().doctors],
  getDoctor: (id: string): Doctor | undefined => getData().doctors.find(d => d.id === id),
  addDoctor: (doctor: Omit<Doctor, 'id'>): Doctor => {
    const newDoctor = { ...doctor, id: generateId('D') };
    getData().doctors.unshift(newDoctor);
    return newDoctor;
  },
  updateDoctor: (id: string, data: Partial<Doctor>): Doctor | undefined => {
    const doctors = getData().doctors;
    const index = doctors.findIndex(d => d.id === id);
    if (index !== -1) {
      doctors[index] = { ...doctors[index], ...data };
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

  // Appointments
  getAppointments: (): Appointment[] => [...getData().appointments],
  getAppointment: (id: string): Appointment | undefined => getData().appointments.find(a => a.id === id),
  addAppointment: (appointment: Omit<Appointment, 'id'>): Appointment => {
    const newAppointment = { ...appointment, id: generateId('A') };
    getData().appointments.unshift(newAppointment);
    return newAppointment;
  },
  updateAppointment: (id: string, data: Partial<Appointment>): Appointment | undefined => {
    const appointments = getData().appointments;
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...data };
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

  // Departments
  getDepartments: (): Department[] => [...getData().departments],
  getDepartment: (id: string): Department | undefined => getData().departments.find(d => d.id === id),
  updateDepartment: (id: string, data: Partial<Department>): Department | undefined => {
    const departments = getData().departments;
    const index = departments.findIndex(d => d.id === id);
    if (index !== -1) {
      departments[index] = { ...departments[index], ...data };
      return departments[index];
    }
    return undefined;
  },

  // Medications
  getMedications: (): Medication[] => [...getData().medications],
  getMedication: (id: string): Medication | undefined => getData().medications.find(m => m.id === id),
  addMedication: (medication: Omit<Medication, 'id'>): Medication => {
    const newMedication = { ...medication, id: generateId('M') };
    getData().medications.unshift(newMedication);
    return newMedication;
  },
  updateMedication: (id: string, data: Partial<Medication>): Medication | undefined => {
    const medications = getData().medications;
    const index = medications.findIndex(m => m.id === id);
    if (index !== -1) {
      medications[index] = { ...medications[index], ...data };
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

  // Invoices
  getInvoices: (): Invoice[] => [...getData().invoices],
  getInvoice: (id: string): Invoice | undefined => getData().invoices.find(i => i.id === id),
  addInvoice: (invoice: Omit<Invoice, 'id'>): Invoice => {
    const newInvoice = { ...invoice, id: generateId('INV') };
    getData().invoices.unshift(newInvoice);
    return newInvoice;
  },
  updateInvoice: (id: string, data: Partial<Invoice>): Invoice | undefined => {
    const invoices = getData().invoices;
    const index = invoices.findIndex(i => i.id === id);
    if (index !== -1) {
      invoices[index] = { ...invoices[index], ...data };
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

  // Lab Results
  getLabResults: (): LabResult[] => [...getData().labResults],
  getLabResult: (id: string): LabResult | undefined => getData().labResults.find(l => l.id === id),
  addLabResult: (labResult: Omit<LabResult, 'id'>): LabResult => {
    const newLabResult = { ...labResult, id: generateId('L') };
    getData().labResults.unshift(newLabResult);
    return newLabResult;
  },
  updateLabResult: (id: string, data: Partial<LabResult>): LabResult | undefined => {
    const labResults = getData().labResults;
    const index = labResults.findIndex(l => l.id === id);
    if (index !== -1) {
      labResults[index] = { ...labResults[index], ...data };
      return labResults[index];
    }
    return undefined;
  },
  deleteLabResult: (id: string): boolean => {
    const labResults = getData().labResults;
    const index = labResults.findIndex(l => l.id === id);
    if (index !== -1) {
      labResults.splice(index, 1);
      return true;
    }
    return false;
  },

  // Admissions
  getAdmissions: (): Admission[] => [...getData().admissions],
  getAdmission: (id: string): Admission | undefined => getData().admissions.find(a => a.id === id),
  addAdmission: (admission: Omit<Admission, 'id'>): Admission => {
    const newAdmission = { ...admission, id: generateId('AD') };
    getData().admissions.unshift(newAdmission);
    return newAdmission;
  },
  updateAdmission: (id: string, data: Partial<Admission>): Admission | undefined => {
    const admissions = getData().admissions;
    const index = admissions.findIndex(a => a.id === id);
    if (index !== -1) {
      admissions[index] = { ...admissions[index], ...data };
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

  // Emergency Cases
  getEmergencyCases: (): EmergencyCase[] => [...getData().emergencyCases],
  getEmergencyCase: (id: string): EmergencyCase | undefined => getData().emergencyCases.find(e => e.id === id),
  addEmergencyCase: (emergencyCase: Omit<EmergencyCase, 'id'>): EmergencyCase => {
    const newEmergencyCase = { ...emergencyCase, id: generateId('E') };
    getData().emergencyCases.unshift(newEmergencyCase);
    return newEmergencyCase;
  },
  updateEmergencyCase: (id: string, data: Partial<EmergencyCase>): EmergencyCase | undefined => {
    const emergencyCases = getData().emergencyCases;
    const index = emergencyCases.findIndex(e => e.id === id);
    if (index !== -1) {
      emergencyCases[index] = { ...emergencyCases[index], ...data };
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

  // Tasks
  getTasks: (): Task[] => [...getData().tasks],
  getTask: (id: string): Task | undefined => getData().tasks.find(t => t.id === id),
  addTask: (task: Omit<Task, 'id'>): Task => {
    const newTask = { ...task, id: generateId('T') };
    getData().tasks.unshift(newTask);
    return newTask;
  },
  updateTask: (id: string, data: Partial<Task>): Task | undefined => {
    const tasks = getData().tasks;
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...data };
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

  // Events
  getEvents: (): Event[] => [...getData().events],
  getEvent: (id: string): Event | undefined => getData().events.find(e => e.id === id),
  addEvent: (event: Omit<Event, 'id'>): Event => {
    const newEvent = { ...event, id: generateId('EV') };
    getData().events.unshift(newEvent);
    return newEvent;
  },
  updateEvent: (id: string, data: Partial<Event>): Event | undefined => {
    const events = getData().events;
    const index = events.findIndex(e => e.id === id);
    if (index !== -1) {
      events[index] = { ...events[index], ...data };
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
  }
};
