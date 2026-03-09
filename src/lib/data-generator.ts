// Data Generator for Hospital Management System
// Generates 50+ items per section with proper data relations

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
} from '@/types';

// Helper functions
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};
const randomTime = (): string => {
  const hours = randomInt(8, 17);
  const minutes = [0, 15, 30, 45][randomInt(0, 3)];
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Data pools
const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth',
  'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen',
  'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra',
  'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa', 'Timothy', 'Deborah',
  'Ronald', 'Stephanie', 'Edward', 'Rebecca', 'Jason', 'Sharon', 'Jeffrey', 'Laura', 'Ryan', 'Cynthia'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
  'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes'
];

const doctorSpecialties = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Obstetrics', 'Oncology', 'Radiology',
  'Emergency Medicine', 'Internal Medicine', 'Dermatology', 'Psychiatry', 'Surgery', 'Urology',
  'Gastroenterology', 'Pulmonology', 'Endocrinology', 'Nephrology', 'Rheumatology', 'Ophthalmology', 'Anesthesiology'
];

const departmentNames = [
  'Emergency', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Obstetrics', 'Oncology',
  'Radiology', 'Surgery', 'ICU', 'Psychiatry', 'Dermatology'
];

const diagnoses = [
  'Hypertension', 'Diabetes Type 2', 'Pneumonia', 'Fracture', 'Migraine', 'Arthritis',
  'Bronchitis', 'Asthma', 'Heart Disease', 'Kidney Stones', 'Appendicitis', 'Gastritis',
  'Anemia', 'Depression', 'Anxiety', 'COPD', 'Stroke', 'Cancer', 'Infection', 'Trauma',
  'Hepatitis', 'Thyroid Disorder', 'Osteoporosis', 'Gout', 'Epilepsy', 'Parkinsons',
  'Alzheimers', 'Dementia', 'Schizophrenia', 'Bipolar Disorder'
];

const medications = [
  { name: 'Amoxicillin', unit: 'capsules', price: 15.99, manufacturer: 'PharmaCorp' },
  { name: 'Paracetamol', unit: 'tablets', price: 8.99, manufacturer: 'MediLife' },
  { name: 'Ibuprofen', unit: 'tablets', price: 12.50, manufacturer: 'PainRelief Inc' },
  { name: 'Insulin Glargine', unit: 'vials', price: 145.00, manufacturer: 'BioMed' },
  { name: 'Lisinopril', unit: 'tablets', price: 22.50, manufacturer: 'HeartCare' },
  { name: 'Metformin', unit: 'tablets', price: 12.00, manufacturer: 'DiabetesCare' },
  { name: 'Omeprazole', unit: 'capsules', price: 18.75, manufacturer: 'GastroHealth' },
  { name: 'Atorvastatin', unit: 'tablets', price: 35.00, manufacturer: 'CholestCorp' },
  { name: 'Levothyroxine', unit: 'tablets', price: 28.00, manufacturer: 'ThyroidPharm' },
  { name: 'Amlodipine', unit: 'tablets', price: 19.99, manufacturer: 'CardioMed' },
  { name: 'Metoprolol', unit: 'tablets', price: 24.50, manufacturer: 'HeartCare' },
  { name: 'Gabapentin', unit: 'capsules', price: 32.00, manufacturer: 'NeuroPharm' },
  { name: 'Prednisone', unit: 'tablets', price: 15.00, manufacturer: 'ImmunoCorp' },
  { name: 'Albuterol', unit: 'inhalers', price: 45.00, manufacturer: 'RespirCare' },
  { name: 'Sertraline', unit: 'tablets', price: 28.50, manufacturer: 'MentalHealth Inc' },
  { name: 'Losartan', unit: 'tablets', price: 26.00, manufacturer: 'KidneyCare' },
  { name: 'Clopidogrel', unit: 'tablets', price: 42.00, manufacturer: 'HeartSafe' },
  { name: 'Pantoprazole', unit: 'tablets', price: 21.00, manufacturer: 'GastroMed' },
  { name: 'Diazepam', unit: 'tablets', price: 18.00, manufacturer: 'CalmPharm' },
  { name: 'Furosemide', unit: 'tablets', price: 14.50, manufacturer: 'Diurex' }
];

const labTests = [
  'CBC (Complete Blood Count)', 'CMP (Comprehensive Metabolic Panel)', 'Lipid Panel',
  'Thyroid Panel', 'HbA1c', 'Urinalysis', 'Blood Glucose', 'Liver Function Test',
  'Kidney Function Test', 'Electrolytes Panel', 'Cardiac Enzymes', 'Blood Type',
  'Iron Studies', 'Vitamin D Level', 'B12 Level', 'CRP (C-Reactive Protein)',
  'ESR (Erythrocyte Sedimentation Rate)', 'PT/INR', 'D-Dimer', 'Troponin'
];

const taskCategories = ['Patient Care', 'Admin', 'Records', 'Scheduling', 'Maintenance', 'Training'];
const taskTitles = [
  'Review patient charts', 'Schedule follow-up appointments', 'Update medical records',
  'Order supplies', 'Complete discharge paperwork', 'Prepare surgery room',
  'Equipment maintenance check', 'Staff meeting preparation', 'Training session',
  'Insurance verification', 'Patient follow-up calls', 'Medication inventory',
  'Lab results review', 'Quality assurance check', 'Shift handover preparation',
  'Report generation', 'Policy review', 'Safety inspection', 'Equipment calibration',
  'Patient education session'
];

const eventTypes: ('meeting' | 'surgery' | 'appointment' | 'other')[] = ['meeting', 'surgery', 'appointment', 'other'];
const eventTitles = [
  'Department Meeting', 'Surgery - Appendectomy', 'Surgery - Bypass', 'Board Meeting',
  'Staff Training', 'Patient Consultation', 'Case Review', 'Treatment Planning',
  'Grand Rounds', 'Morbidity Conference', 'Journal Club', 'Safety Committee',
  'Quality Review', 'Ethics Committee', 'Research Meeting', 'Team Building'
];

const emergencyCases = [
  'Chest Pain', 'Stroke Symptoms', 'Car Accident', 'Fall Injury', 'Difficulty Breathing',
  'Severe Bleeding', 'Allergic Reaction', 'Seizure', 'Abdominal Pain', 'Head Injury',
  'Drug Overdose', 'Cardiac Arrest', 'Fracture', 'Burns', 'Gunshot Wound',
  'Stabbing', 'Drowning', 'Electric Shock', 'Poisoning', 'Anaphylaxis'
];

const services = [
  'Consultation', 'ECG', 'X-Ray', 'MRI', 'CT Scan', 'Blood Test', 'Surgery',
  'Anesthesia', 'Room Charge', 'Medication', 'Physical Therapy', 'Lab Work',
  'Ultrasound', 'Endoscopy', 'Dialysis', 'Chemotherapy', 'Radiation Therapy',
  'Emergency Care', 'ICU Stay', 'Nursing Care'
];

// Generate 50 patients
export function generatePatients(): Patient[] {
  const patients: Patient[] = [];
  const statuses: Patient['status'][] = ['Stable', 'Critical', 'Under Observation', 'Recovering', 'Discharged'];
  const genders: Patient['gender'][] = ['Male', 'Female', 'Other'];

  for (let i = 1; i <= 50; i++) {
    const firstName = firstNames[randomInt(0, firstNames.length - 1)];
    const lastName = lastNames[randomInt(0, lastNames.length - 1)];
    const ward = departmentNames[randomInt(0, departmentNames.length - 1)];
    
    patients.push({
      id: `P-${i.toString().padStart(3, '0')}`,
      name: `${firstName} ${lastName}`,
      age: randomInt(18, 85),
      gender: randomItem(genders),
      phone: `555-${randomInt(1000, 9999)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      ward,
      status: randomItem(statuses),
      admittedDate: randomDate(new Date(2024, 0, 1), new Date(2024, 1, 28)),
      diagnosis: randomItem(diagnoses)
    });
  }
  return patients;
}

// Generate 50 doctors
export function generateDoctors(): Doctor[] {
  const doctors: Doctor[] = [];
  const statuses: Doctor['status'][] = ['Available', 'On Leave', 'Busy', 'Off Duty'];
  const availabilities = ['Mon-Fri', 'Tue-Thu', 'Mon-Wed-Fri', 'By Appointment', '24/7 On Call', 'Mon-Thu', 'Weekdays'];

  for (let i = 1; i <= 50; i++) {
    const firstName = firstNames[randomInt(0, firstNames.length - 1)];
    const lastName = lastNames[randomInt(0, lastNames.length - 1)];
    const specialty = doctorSpecialties[randomInt(0, doctorSpecialties.length - 1)];
    const department = departmentNames.find(d => d === specialty) || departmentNames[randomInt(0, departmentNames.length - 1)];
    
    doctors.push({
      id: `D-${i.toString().padStart(3, '0')}`,
      name: `Dr. ${firstName} ${lastName}`,
      specialty,
      phone: `555-${randomInt(1000, 9999)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@hospital.com`,
      availability: randomItem(availabilities),
      department,
      status: randomItem(statuses),
      patientsCount: randomInt(1, 25)
    });
  }
  return doctors;
}

// Generate 50 appointments with relations to patients and doctors
export function generateAppointments(patients: Patient[], doctors: Doctor[]): Appointment[] {
  const appointments: Appointment[] = [];
  const types: Appointment['type'][] = ['Consultation', 'Follow-up', 'Emergency', 'Routine Checkup'];
  const statuses: Appointment['status'][] = ['Scheduled', 'Completed', 'Cancelled', 'No Show'];
  const today = new Date();

  for (let i = 1; i <= 50; i++) {
    const patient = patients[randomInt(0, patients.length - 1)];
    const doctor = doctors.find(d => d.department === patient.ward) || doctors[randomInt(0, doctors.length - 1)];
    const appointmentDate = new Date(today);
    appointmentDate.setDate(appointmentDate.getDate() + randomInt(-7, 14));
    
    appointments.push({
      id: `A-${i.toString().padStart(3, '0')}`,
      patientId: patient.id,
      patientName: patient.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      date: appointmentDate.toISOString().split('T')[0],
      time: randomTime(),
      department: doctor.department,
      type: randomItem(types),
      status: randomItem(statuses),
      notes: ''
    });
  }
  return appointments;
}

// Generate departments
export function generateDepartments(doctors: Doctor[]): Department[] {
  const deptList: Department[] = [];
  
  departmentNames.forEach((name, i) => {
    const head = doctors.find(d => d.department === name) || doctors[randomInt(0, doctors.length - 1)];
    const beds = randomInt(15, 40);
    
    deptList.push({
      id: `DEP-${(i + 1).toString().padStart(3, '0')}`,
      name,
      beds,
      occupiedBeds: randomInt(0, beds),
      head: head.name,
      status: Math.random() > 0.1 ? 'Operational' : randomItem(['Under Maintenance', 'Full'] as const),
      floor: Math.ceil((i + 1) / 3)
    });
  });
  
  return deptList;
}

// Generate 50 medications
export function generateMedications(): Medication[] {
  const meds: Medication[] = [];

  for (let i = 0; i < 50; i++) {
    const med = medications[i % medications.length];
    const stock = randomInt(0, 500);
    
    meds.push({
      id: `M-${(i + 1).toString().padStart(3, '0')}`,
      name: med.name,
      stock,
      unit: med.unit,
      manufacturer: med.manufacturer,
      price: med.price + randomInt(-5, 10),
      expiryDate: randomDate(new Date(2024, 6, 1), new Date(2026, 11, 31)),
      reorderLevel: randomInt(30, 100)
    });
  }
  return meds;
}

// Generate 50 invoices
export function generateInvoices(patients: Patient[]): Invoice[] {
  const invoices: Invoice[] = [];
  const statuses: Invoice['status'][] = ['Pending', 'Paid', 'Insurance', 'Overdue'];

  for (let i = 1; i <= 50; i++) {
    const patient = patients[randomInt(0, patients.length - 1)];
    const numServices = randomInt(1, 4);
    const invoiceServices = [];
    for (let j = 0; j < numServices; j++) {
      invoiceServices.push(services[randomInt(0, services.length - 1)]);
    }
    const date = randomDate(new Date(2024, 0, 1), new Date(2024, 1, 28));
    const dueDate = new Date(date);
    dueDate.setDate(dueDate.getDate() + 30);
    
    invoices.push({
      id: `INV-${(1000 + i).toString()}`,
      patientId: patient.id,
      patientName: patient.name,
      services: invoiceServices,
      total: randomInt(100, 10000),
      status: randomItem(statuses),
      date,
      dueDate: dueDate.toISOString().split('T')[0]
    });
  }
  return invoices;
}

// Generate 50 lab results
export function generateLabResults(patients: Patient[]): LabResult[] {
  const results: LabResult[] = [];
  const statuses: LabResult['status'][] = ['Pending', 'Completed', 'Cancelled'];

  for (let i = 1; i <= 50; i++) {
    const patient = patients[randomInt(0, patients.length - 1)];
    const status = randomItem(statuses);
    
    results.push({
      id: `L-${i.toString().padStart(3, '0')}`,
      patientId: patient.id,
      patientName: patient.name,
      test: randomItem(labTests),
      date: randomDate(new Date(2024, 0, 1), new Date(2024, 1, 28)),
      status,
      results: status === 'Completed' ? randomItem(['Normal', 'Abnormal', 'Borderline', 'Positive', 'Negative']) : undefined,
      technician: `Lab Tech ${firstNames[randomInt(0, firstNames.length - 1)]}`
    });
  }
  return results;
}

// Generate 50 admissions
export function generateAdmissions(patients: Patient[]): Admission[] {
  const admissions: Admission[] = [];
  const types: Admission['type'][] = ['Emergency', 'Elective', 'Newborn', 'Transfer'];
  const priorities: Admission['priority'][] = ['Critical', 'High', 'Normal', 'Low'];
  const statuses: Admission['status'][] = ['Waiting', 'Admitted', 'In Progress'];

  for (let i = 1; i <= 50; i++) {
    const patient = patients[randomInt(0, patients.length - 1)];
    
    admissions.push({
      id: `AD-${i.toString().padStart(3, '0')}`,
      patientId: patient.id,
      patientName: `${patient.name} - ${patient.ward}`,
      type: randomItem(types),
      priority: randomItem(priorities),
      status: randomItem(statuses),
      bedNumber: Math.random() > 0.3 ? `${patient.ward.charAt(0)}-${randomInt(100, 300)}` : undefined,
      admittedBy: Math.random() > 0.5 ? `Dr. ${firstNames[randomInt(0, firstNames.length - 1)]} ${lastNames[randomInt(0, lastNames.length - 1)]}` : undefined
    });
  }
  return admissions;
}

// Generate 50 emergency cases
export function generateEmergencyCases(): EmergencyCase[] {
  const cases: EmergencyCase[] = [];
  const levels: EmergencyCase['level'][] = ['Critical', 'Serious', 'Minor'];
  const statuses: EmergencyCase['status'][] = ['Incoming', 'In Treatment', 'Discharged', 'Admitted'];

  for (let i = 1; i <= 50; i++) {
    cases.push({
      id: `E-${i.toString().padStart(3, '0')}`,
      case: randomItem(emergencyCases),
      patientName: Math.random() > 0.3 ? `${firstNames[randomInt(0, firstNames.length - 1)]} ${lastNames[randomInt(0, lastNames.length - 1)]}` : 'Unknown',
      eta: `${randomInt(1, 45)} min`,
      level: randomItem(levels),
      status: randomItem(statuses),
      assignedDoctor: Math.random() > 0.3 ? `Dr. ${firstNames[randomInt(0, firstNames.length - 1)]} ${lastNames[randomInt(0, lastNames.length - 1)]}` : undefined
    });
  }
  return cases;
}

// Generate 50 tasks
export function generateTasks(): Task[] {
  const tasks: Task[] = [];
  const statuses: Task['status'][] = ['To Do', 'In Progress', 'Done'];
  const priorities: Task['priority'][] = ['High', 'Medium', 'Low'];
  const dueOptions = ['Today', 'Tomorrow', 'This Week', 'Next Week', 'Jan 25', 'Jan 30', 'Feb 5', 'Feb 10'];
  const assignees = ['Dr. Smith', 'Nurse Johnson', 'Admin Staff', 'Reception', 'Tech Team', 'Dr. Wilson', 'Nurse Williams', 'Lab Tech Mike'];

  for (let i = 1; i <= 50; i++) {
    tasks.push({
      id: `T-${i.toString().padStart(3, '0')}`,
      title: randomItem(taskTitles),
      description: `Task description for item ${i}`,
      status: randomItem(statuses),
      priority: randomItem(priorities),
      due: randomItem(dueOptions),
      assignedTo: randomItem(assignees),
      category: randomItem(taskCategories)
    });
  }
  return tasks;
}

// Generate 50 events
export function generateEvents(): Event[] {
  const events: Event[] = [];
  const today = new Date();

  for (let i = 1; i <= 50; i++) {
    const eventDate = new Date(today);
    eventDate.setDate(eventDate.getDate() + randomInt(-7, 30));
    const startHour = randomInt(8, 16);
    
    events.push({
      id: `EV-${i.toString().padStart(3, '0')}`,
      title: randomItem(eventTitles),
      date: eventDate.toISOString().split('T')[0],
      startTime: `${startHour.toString().padStart(2, '0')}:00`,
      endTime: `${(startHour + randomInt(1, 3)).toString().padStart(2, '0')}:00`,
      type: randomItem(eventTypes),
      description: `Event description for item ${i}`,
      attendees: [firstNames[randomInt(0, firstNames.length - 1)], firstNames[randomInt(0, firstNames.length - 1)]]
    });
  }
  return events;
}
