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
  InvoiceItem,
  Admission,
  EmergencyCase,
  Task,
  Event,
  Document,
  Notification,
  Bed,
  Surgery,
  InventoryItem,
  InsuranceClaim,
  UserRole,
  Allergy,
  MedicalHistoryEntry,
  SurgeryHistory,
  Immunization,
  EmergencyContact,
  InsuranceInfo,
  VitalSigns,
  PatientVisit,
  PatientMedication,
  DoctorSchedule,
  DoctorQualification,
  LabTestCategory,
  SurgeryTheater,
} from '@/types';

// ============ UTILITY FUNCTIONS ============
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number, decimals = 2): number => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const randomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};
const randomPhone = (): string => `+1 (${randomInt(200, 999)}) ${randomInt(100, 999)}-${randomInt(1000, 9999)}`;
const randomEmail = (name: string): string => {
  const clean = name.toLowerCase().replace(/[^a-z]/g, '.');
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
  return `${clean}@${randomItem(domains)}`;
};
const generateId = (prefix: string): string => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============ DATA SETS ============
const FIRST_NAMES_MALE = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
  'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua',
  'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan',
  'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon',
  'Benjamin', 'Samuel', 'Raymond', 'Gregory', 'Frank', 'Alexander', 'Patrick', 'Jack', 'Dennis', 'Jerry'
];

const FIRST_NAMES_FEMALE = [
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan', 'Jessica', 'Sarah', 'Karen',
  'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle',
  'Dorothy', 'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia',
  'Kathleen', 'Amy', 'Angela', 'Shirley', 'Anna', 'Brenda', 'Pamela', 'Emma', 'Nicole', 'Helen',
  'Samantha', 'Katherine', 'Christine', 'Debra', 'Rachel', 'Carolyn', 'Janet', 'Catherine', 'Maria', 'Heather'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const DIAGNOSES = [
  'Acute Myocardial Infarction', 'Pneumonia', 'Type 2 Diabetes Mellitus', 'Hypertension', 'Cerebrovascular Accident',
  'Chronic Obstructive Pulmonary Disease', 'Acute Appendicitis', 'Fracture of Femur', 'Acute Kidney Injury',
  'Community-Acquired Pneumonia', 'Congestive Heart Failure', 'Atrial Fibrillation', 'Deep Vein Thrombosis',
  'Pulmonary Embolism', 'Sepsis', 'Acute Pancreatitis', 'Cholecystitis', 'Diverticulitis',
  'Gastrointestinal Hemorrhage', 'Urinary Tract Infection', 'Cellulitis', 'Osteomyelitis',
  'Meningitis', 'Encephalitis', 'Status Epilepticus', 'Diabetic Ketoacidosis', 'Hyperosmolar Hyperglycemic State',
  'Asthma Exacerbation', 'COPD Exacerbation', 'Acute Liver Failure', 'Bowel Obstruction', 'Perforated Peptic Ulcer',
  'Ruptured Appendix', 'Ectopic Pregnancy', 'Placental Abruption', 'Pre-eclampsia', 'Postpartum Hemorrhage',
  'Neonatal Sepsis', 'Respiratory Distress Syndrome', 'Intraventricular Hemorrhage', 'Necrotizing Enterocolitis'
];

const SPECIALTIES = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Obstetrics & Gynecology', 'Oncology',
  'Pulmonology', 'Gastroenterology', 'Nephrology', 'Endocrinology', 'Rheumatology', 'Dermatology',
  'Psychiatry', 'Radiology', 'Anesthesiology', 'Emergency Medicine', 'Internal Medicine', 'Family Medicine',
  'General Surgery', 'Neurosurgery', 'Cardiothoracic Surgery', 'Urology', 'Ophthalmology', 'ENT',
  'Plastic Surgery', 'Pathology', 'Physical Medicine', 'Infectious Disease', 'Allergy & Immunology'
];

const DEPARTMENTS_DATA = [
  { name: 'Emergency', code: 'ER', floor: 1, beds: 20, emergency: true },
  { name: 'Cardiology', code: 'CAR', floor: 3, beds: 30, emergency: false },
  { name: 'Neurology', code: 'NEU', floor: 4, beds: 25, emergency: false },
  { name: 'Orthopedics', code: 'ORT', floor: 5, beds: 35, emergency: false },
  { name: 'Pediatrics', code: 'PED', floor: 2, beds: 40, emergency: false },
  { name: 'Obstetrics & Gynecology', code: 'OBG', floor: 3, beds: 30, emergency: false },
  { name: 'Oncology', code: 'ONC', floor: 6, beds: 25, emergency: false },
  { name: 'ICU', code: 'ICU', floor: 2, beds: 20, emergency: false },
  { name: 'Surgery', code: 'SUR', floor: 4, beds: 15, emergency: false },
  { name: 'Radiology', code: 'RAD', floor: 1, beds: 5, emergency: false },
  { name: 'Laboratory', code: 'LAB', floor: 1, beds: 0, emergency: false },
  { name: 'Pharmacy', code: 'PHR', floor: 1, beds: 0, emergency: false },
];

const MEDICATION_NAMES = [
  { name: 'Amoxicillin', generic: 'Amoxicillin', category: 'Antibiotics', form: 'Capsule', strength: '500mg' },
  { name: 'Azithromycin', generic: 'Azithromycin', category: 'Antibiotics', form: 'Tablet', strength: '250mg' },
  { name: 'Ciprofloxacin', generic: 'Ciprofloxacin', category: 'Antibiotics', form: 'Tablet', strength: '500mg' },
  { name: 'Metformin', generic: 'Metformin HCl', category: 'Antidiabetic', form: 'Tablet', strength: '500mg' },
  { name: 'Glipizide', generic: 'Glipizide', category: 'Antidiabetic', form: 'Tablet', strength: '5mg' },
  { name: 'Insulin Glargine', generic: 'Insulin Glargine', category: 'Antidiabetic', form: 'Injection', strength: '100U/mL' },
  { name: 'Lisinopril', generic: 'Lisinopril', category: 'Antihypertensive', form: 'Tablet', strength: '10mg' },
  { name: 'Amlodipine', generic: 'Amlodipine Besylate', category: 'Antihypertensive', form: 'Tablet', strength: '5mg' },
  { name: 'Losartan', generic: 'Losartan Potassium', category: 'Antihypertensive', form: 'Tablet', strength: '50mg' },
  { name: 'Metoprolol', generic: 'Metoprolol Succinate', category: 'Antihypertensive', form: 'Tablet', strength: '50mg' },
  { name: 'Atorvastatin', generic: 'Atorvastatin Calcium', category: 'Antilipidemic', form: 'Tablet', strength: '20mg' },
  { name: 'Simvastatin', generic: 'Simvastatin', category: 'Antilipidemic', form: 'Tablet', strength: '40mg' },
  { name: 'Omeprazole', generic: 'Omeprazole', category: 'GI Drugs', form: 'Capsule', strength: '20mg' },
  { name: 'Pantoprazole', generic: 'Pantoprazole Sodium', category: 'GI Drugs', form: 'Tablet', strength: '40mg' },
  { name: 'Ondansetron', generic: 'Ondansetron', category: 'Anti-emetic', form: 'Tablet', strength: '4mg' },
  { name: 'Ibuprofen', generic: 'Ibuprofen', category: 'NSAIDs', form: 'Tablet', strength: '400mg' },
  { name: 'Acetaminophen', generic: 'Acetaminophen', category: 'Analgesic', form: 'Tablet', strength: '500mg' },
  { name: 'Tramadol', generic: 'Tramadol HCl', category: 'Analgesic', form: 'Tablet', strength: '50mg' },
  { name: 'Morphine', generic: 'Morphine Sulfate', category: 'Opioid', form: 'Injection', strength: '10mg/mL' },
  { name: 'Fentanyl', generic: 'Fentanyl Citrate', category: 'Opioid', form: 'Patch', strength: '25mcg/hr' },
  { name: 'Salbutamol', generic: 'Albuterol Sulfate', category: 'Bronchodilator', form: 'Inhaler', strength: '100mcg' },
  { name: 'Montelukast', generic: 'Montelukast Sodium', category: 'Respiratory', form: 'Tablet', strength: '10mg' },
  { name: 'Prednisone', generic: 'Prednisone', category: 'Corticosteroid', form: 'Tablet', strength: '10mg' },
  { name: 'Dexamethasone', generic: 'Dexamethasone', category: 'Corticosteroid', form: 'Injection', strength: '4mg/mL' },
  { name: 'Cetirizine', generic: 'Cetirizine HCl', category: 'Antihistamine', form: 'Tablet', strength: '10mg' },
  { name: 'Loratadine', generic: 'Loratadine', category: 'Antihistamine', form: 'Tablet', strength: '10mg' },
  { name: 'Clopidogrel', generic: 'Clopidogrel Bisulfate', category: 'Antiplatelet', form: 'Tablet', strength: '75mg' },
  { name: 'Aspirin', generic: 'Aspirin', category: 'Antiplatelet', form: 'Tablet', strength: '81mg' },
  { name: 'Warfarin', generic: 'Warfarin Sodium', category: 'Anticoagulant', form: 'Tablet', strength: '5mg' },
  { name: 'Heparin', generic: 'Heparin Sodium', category: 'Anticoagulant', form: 'Injection', strength: '5000U/mL' },
  { name: 'Levothyroxine', generic: 'Levothyroxine Sodium', category: 'Thyroid', form: 'Tablet', strength: '50mcg' },
  { name: 'Diazepam', generic: 'Diazepam', category: 'Sedative', form: 'Tablet', strength: '5mg' },
  { name: 'Lorazepam', generic: 'Lorazepam', category: 'Sedative', form: 'Injection', strength: '2mg/mL' },
  { name: 'Sertraline', generic: 'Sertraline HCl', category: 'Antidepressant', form: 'Tablet', strength: '50mg' },
  { name: 'Fluoxetine', generic: 'Fluoxetine HCl', category: 'Antidepressant', form: 'Capsule', strength: '20mg' },
  { name: 'Furosemide', generic: 'Furosemide', category: 'Diuretic', form: 'Tablet', strength: '40mg' },
  { name: 'Spironolactone', generic: 'Spironolactone', category: 'Diuretic', form: 'Tablet', strength: '25mg' },
  { name: 'Pantoprazole IV', generic: 'Pantoprazole Sodium', category: 'GI Drugs', form: 'Injection', strength: '40mg' },
  { name: 'Dopamine', generic: 'Dopamine HCl', category: 'Vasopressor', form: 'Injection', strength: '200mg/5mL' },
  { name: 'Norepinephrine', generic: 'Norepinephrine Bitartrate', category: 'Vasopressor', form: 'Injection', strength: '4mg/mL' },
  { name: 'Epinephrine', generic: 'Epinephrine', category: 'Emergency', form: 'Injection', strength: '1mg/mL' },
  { name: 'Atropine', generic: 'Atropine Sulfate', category: 'Emergency', form: 'Injection', strength: '0.5mg/mL' },
  { name: 'Naloxone', generic: 'Naloxone HCl', category: 'Emergency', form: 'Injection', strength: '0.4mg/mL' },
  { name: 'Amiodarone', generic: 'Amiodarone HCl', category: 'Antiarrhythmic', form: 'Injection', strength: '50mg/mL' },
  { name: 'Adenosine', generic: 'Adenosine', category: 'Antiarrhythmic', form: 'Injection', strength: '3mg/mL' },
  { name: 'Digoxin', generic: 'Digoxin', category: 'Cardiac', form: 'Tablet', strength: '0.25mg' },
  { name: 'Ceftriaxone', generic: 'Ceftriaxone Sodium', category: 'Antibiotics', form: 'Injection', strength: '1g' },
  { name: 'Vancomycin', generic: 'Vancomycin HCl', category: 'Antibiotics', form: 'Injection', strength: '1g' },
  { name: 'Meropenem', generic: 'Meropenem', category: 'Antibiotics', form: 'Injection', strength: '1g' },
];

const LAB_TESTS_DATA = [
  { name: 'Complete Blood Count (CBC)', code: 'CBC', category: 'Hematology', price: 45, tat: 2, specimen: 'Whole Blood' },
  { name: 'Comprehensive Metabolic Panel', code: 'CMP', category: 'Chemistry', price: 85, tat: 4, specimen: 'Serum' },
  { name: 'Basic Metabolic Panel', code: 'BMP', category: 'Chemistry', price: 55, tat: 2, specimen: 'Serum' },
  { name: 'Lipid Panel', code: 'LIPID', category: 'Chemistry', price: 65, tat: 4, specimen: 'Serum' },
  { name: 'Liver Function Test', code: 'LFT', category: 'Chemistry', price: 75, tat: 4, specimen: 'Serum' },
  { name: 'Thyroid Panel (TSH, T3, T4)', code: 'THY', category: 'Endocrinology', price: 120, tat: 24, specimen: 'Serum' },
  { name: 'HbA1c', code: 'HBA1C', category: 'Chemistry', price: 55, tat: 4, specimen: 'Whole Blood' },
  { name: 'Urinalysis', code: 'UA', category: 'Urinalysis', price: 25, tat: 1, specimen: 'Urine' },
  { name: 'Urine Culture', code: 'UCULT', category: 'Microbiology', price: 75, tat: 48, specimen: 'Urine' },
  { name: 'Blood Culture', code: 'BC', category: 'Microbiology', price: 120, tat: 72, specimen: 'Whole Blood' },
  { name: 'PT/INR', code: 'PTINR', category: 'Coagulation', price: 35, tat: 2, specimen: 'Plasma' },
  { name: 'PTT', code: 'PTT', category: 'Coagulation', price: 30, tat: 2, specimen: 'Plasma' },
  { name: 'D-Dimer', code: 'DDIMER', category: 'Coagulation', price: 85, tat: 2, specimen: 'Plasma' },
  { name: 'Cardiac Troponin I', code: 'TROP', category: 'Cardiac', price: 95, tat: 1, specimen: 'Serum' },
  { name: 'BNP', code: 'BNP', category: 'Cardiac', price: 110, tat: 2, specimen: 'Serum' },
  { name: 'CK-MB', code: 'CKMB', category: 'Cardiac', price: 65, tat: 2, specimen: 'Serum' },
  { name: 'Creatinine', code: 'CREAT', category: 'Chemistry', price: 20, tat: 1, specimen: 'Serum' },
  { name: 'BUN', code: 'BUN', category: 'Chemistry', price: 18, tat: 1, specimen: 'Serum' },
  { name: 'Electrolytes', code: 'LYTES', category: 'Chemistry', price: 35, tat: 1, specimen: 'Serum' },
  { name: 'Glucose Fasting', code: 'GLUF', category: 'Chemistry', price: 15, tat: 1, specimen: 'Serum' },
  { name: 'Glucose Random', code: 'GLUR', category: 'Chemistry', price: 15, tat: 1, specimen: 'Serum' },
  { name: 'HIV Antibody', code: 'HIV', category: 'Serology', price: 45, tat: 24, specimen: 'Serum' },
  { name: 'Hepatitis B Surface Antigen', code: 'HBSAG', category: 'Serology', price: 40, tat: 24, specimen: 'Serum' },
  { name: 'Hepatitis C Antibody', code: 'HCV', category: 'Serology', price: 45, tat: 24, specimen: 'Serum' },
  { name: 'CRP', code: 'CRP', category: 'Chemistry', price: 35, tat: 2, specimen: 'Serum' },
  { name: 'ESR', code: 'ESR', category: 'Hematology', price: 20, tat: 2, specimen: 'Whole Blood' },
  { name: 'Blood Type and Rh', code: 'BTYP', category: 'Immunohematology', price: 30, tat: 2, specimen: 'Whole Blood' },
  { name: 'Iron Studies', code: 'IRON', category: 'Chemistry', price: 85, tat: 4, specimen: 'Serum' },
  { name: 'Vitamin B12', code: 'B12', category: 'Chemistry', price: 65, tat: 24, specimen: 'Serum' },
  { name: 'Vitamin D', code: 'VITD', category: 'Chemistry', price: 75, tat: 24, specimen: 'Serum' },
];

const PROCEDURES = [
  'Appendectomy', 'Cholecystectomy', 'Hernia Repair', 'CABG', 'Valve Replacement',
  'Total Hip Replacement', 'Total Knee Replacement', 'Spinal Fusion', 'Craniotomy',
  'Carotid Endarterectomy', 'Lung Resection', 'Liver Resection', 'Kidney Transplant',
  'Heart Transplant', 'Bone Marrow Transplant', 'Cataract Surgery', 'C-section',
  'Hysterectomy', 'Prostatectomy', 'Mastectomy', 'Lumpectomy', 'Thyroidectomy',
  'Gastric Bypass', 'Colon Resection', 'Aortic Aneurysm Repair'
];

const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
const STATES = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'GA', 'NC'];

// ============ GENERATORS ============

export function generateAllergies(): Allergy[] {
  const substances = ['Penicillin', 'Sulfa drugs', 'Aspirin', 'Ibuprofen', 'Latex', 'Peanuts', 'Shellfish', 'Eggs', 'Milk', 'Soy', 'Wheat', 'Contrast dye', 'Codeine', 'Morphine'];
  const reactions = ['Rash', 'Anaphylaxis', 'Hives', 'Swelling', 'Difficulty breathing', 'Nausea', 'Dizziness', 'Itching'];
  const severities: Allergy['severity'][] = ['Mild', 'Moderate', 'Severe', 'Life-threatening'];
  
  const count = randomInt(0, 4);
  const allergies: Allergy[] = [];
  const usedSubstances = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    let substance = randomItem(substances);
    while (usedSubstances.has(substance)) {
      substance = randomItem(substances);
    }
    usedSubstances.add(substance);
    
    allergies.push({
      id: generateId('ALG'),
      substance,
      severity: randomItem(severities),
      reaction: randomItem(reactions),
      diagnosedDate: randomDate(new Date(2015, 0, 1), new Date(2023, 11, 31)),
    });
  }
  
  return allergies;
}

export function generateMedicalHistory(): MedicalHistoryEntry[] {
  const conditions = [
    'Hypertension', 'Type 2 Diabetes', 'Hyperlipidemia', 'Coronary Artery Disease', 'Heart Failure',
    'Atrial Fibrillation', 'Asthma', 'COPD', 'Chronic Kidney Disease', 'Hypothyroidism',
    'Osteoarthritis', 'Rheumatoid Arthritis', 'Gout', 'GERD', 'Peptic Ulcer Disease',
    'Anxiety Disorder', 'Depression', 'Bipolar Disorder', 'Epilepsy', 'Migraine',
    'Previous Stroke', 'Previous MI', 'Previous DVT', 'Previous PE', 'Cancer (Remission)'
  ];
  const statuses: MedicalHistoryEntry['status'][] = ['Active', 'Resolved', 'Chronic'];
  
  const count = randomInt(1, 5);
  const history: MedicalHistoryEntry[] = [];
  const usedConditions = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    let condition = randomItem(conditions);
    while (usedConditions.has(condition)) {
      condition = randomItem(conditions);
    }
    usedConditions.add(condition);
    
    const status = condition.includes('Previous') ? 'Resolved' : randomItem(statuses);
    
    history.push({
      id: generateId('MH'),
      condition,
      diagnosisDate: randomDate(new Date(2010, 0, 1), new Date(2023, 11, 31)),
      status,
      notes: status === 'Chronic' ? 'Requires ongoing management' : undefined,
    });
  }
  
  return history;
}

export function generateSurgeryHistory(): SurgeryHistory[] {
  const procedures = ['Appendectomy', 'Cholecystectomy', 'Hernia Repair', 'C-section', 'Knee Surgery', 'Hip Replacement', 'Cardiac Catheterization', 'CABG', 'Tonsillectomy', 'Hysterectomy'];
  
  const count = randomInt(0, 3);
  const surgeries: SurgeryHistory[] = [];
  
  for (let i = 0; i < count; i++) {
    surgeries.push({
      id: generateId('SH'),
      procedure: randomItem(procedures),
      date: randomDate(new Date(2000, 0, 1), new Date(2023, 11, 31)),
      surgeon: `Dr. ${randomItem(FIRST_NAMES_MALE)} ${randomItem(LAST_NAMES)}`,
      hospital: 'HospitalHub Medical Center',
      complications: Math.random() > 0.8 ? 'Minor wound infection' : undefined,
    });
  }
  
  return surgeries;
}

export function generateImmunizations(): Immunization[] {
  const vaccines = [
    { name: 'COVID-19 (Pfizer)', doses: 2 },
    { name: 'Influenza', doses: 1 },
    { name: 'Tetanus/Diphtheria', doses: 1 },
    { name: 'Pneumococcal', doses: 1 },
    { name: 'Hepatitis B', doses: 3 },
    { name: 'MMR', doses: 2 },
    { name: 'Varicella', doses: 2 },
    { name: 'Shingles (Shingrix)', doses: 2 },
  ];
  
  const count = randomInt(3, 6);
  const immunizations: Immunization[] = [];
  
  for (let i = 0; i < count; i++) {
    const vaccine = randomItem(vaccines);
    immunizations.push({
      id: generateId('IMM'),
      vaccine: vaccine.name,
      date: randomDate(new Date(2020, 0, 1), new Date(2024, 11, 31)),
      administeredBy: `Dr. ${randomItem(FIRST_NAMES_MALE)} ${randomItem(LAST_NAMES)}`,
      batchNumber: `B${randomInt(10000, 99999)}`,
    });
  }
  
  return immunizations;
}

export function generateEmergencyContacts(): EmergencyContact[] {
  const relationships = ['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other'];
  const contacts: EmergencyContact[] = [];
  const count = randomInt(1, 3);
  
  for (let i = 0; i < count; i++) {
    const isPrimary = i === 0;
    const firstName = randomItem([...FIRST_NAMES_MALE, ...FIRST_NAMES_FEMALE]);
    
    contacts.push({
      id: generateId('EC'),
      name: `${firstName} ${randomItem(LAST_NAMES)}`,
      relationship: randomItem(relationships),
      phone: randomPhone(),
      email: Math.random() > 0.3 ? randomEmail(firstName) : undefined,
      isPrimary,
    });
  }
  
  return contacts;
}

export function generateInsurance(): InsuranceInfo {
  const providers = ['Blue Cross Blue Shield', 'Aetna', 'Cigna', 'UnitedHealthcare', 'Humana', 'Kaiser Permanente', 'Medicare', 'Medicaid'];
  const provider = randomItem(providers);
  
  return {
    provider,
    policyNumber: `${provider.substring(0, 3).toUpperCase()}${randomInt(100000, 999999)}`,
    groupNumber: `GRP${randomInt(10000, 99999)}`,
    holderName: '', // Will be set based on patient
    holderRelation: 'Self',
    validFrom: randomDate(new Date(2023, 0, 1), new Date(2023, 6, 1)),
    validTo: randomDate(new Date(2024, 6, 1), new Date(2025, 11, 31)),
    coveragePercentage: randomItem([70, 80, 90, 100]),
    copayAmount: randomItem([15, 20, 25, 30, 50]),
  };
}

export function generateVitalSigns(doctorName: string): VitalSigns[] {
  const vitals: VitalSigns[] = [];
  const count = randomInt(3, 8);
  
  for (let i = 0; i < count; i++) {
    const height = randomInt(150, 190);
    const weight = randomInt(50, 100);
    
    vitals.push({
      bloodPressure: `${randomInt(100, 140)}/${randomInt(60, 90)}`,
      heartRate: randomInt(60, 100),
      temperature: randomFloat(36.1, 37.8, 1),
      respiratoryRate: randomInt(12, 20),
      oxygenSaturation: randomInt(95, 100),
      weight,
      height,
      bmi: parseFloat((weight / ((height / 100) ** 2)).toFixed(1)),
      recordedAt: randomDate(new Date(2023, 0, 1), new Date(2024, 11, 31)),
      recordedBy: doctorName,
    });
  }
  
  return vitals.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
}

export function generatePatientMedications(): PatientMedication[] {
  const meds = MEDICATION_NAMES.slice(0, 30);
  const count = randomInt(1, 5);
  const medications: PatientMedication[] = [];
  const usedMeds = new Set<string>();
  
  const frequencies = ['Once daily', 'Twice daily', 'Three times daily', 'As needed', 'Every 4 hours', 'Every 8 hours'];
  const statuses: PatientMedication['status'][] = ['Active', 'Completed', 'Discontinued'];
  
  for (let i = 0; i < count; i++) {
    let med = randomItem(meds);
    while (usedMeds.has(med.name)) {
      med = randomItem(meds);
    }
    usedMeds.add(med.name);
    
    medications.push({
      id: generateId('PM'),
      medication: med.name,
      dosage: med.strength,
      frequency: randomItem(frequencies),
      startDate: randomDate(new Date(2023, 0, 1), new Date(2024, 6, 1)),
      endDate: Math.random() > 0.6 ? randomDate(new Date(2024, 6, 1), new Date(2024, 11, 31)) : undefined,
      prescribedBy: `Dr. ${randomItem(FIRST_NAMES_MALE)} ${randomItem(LAST_NAMES)}`,
      status: Math.random() > 0.3 ? 'Active' : randomItem(statuses),
      instructions: `Take with food. ${Math.random() > 0.5 ? 'Avoid alcohol.' : ''}`,
    });
  }
  
  return medications;
}

export function generatePatientVisits(): PatientVisit[] {
  const visits: PatientVisit[] = [];
  const types: PatientVisit['type'][] = ['Outpatient', 'Inpatient', 'Emergency', 'Follow-up'];
  const statuses: PatientVisit['status'][] = ['Completed', 'In Progress', 'Cancelled'];
  const complaints = ['Chest pain', 'Shortness of breath', 'Abdominal pain', 'Headache', 'Fever', 'Cough', 'Back pain', 'Leg swelling', 'Dizziness', 'Fatigue'];
  
  const count = randomInt(3, 10);
  
  for (let i = 0; i < count; i++) {
    visits.push({
      id: generateId('PV'),
      date: randomDate(new Date(2022, 0, 1), new Date(2024, 11, 31)),
      type: randomItem(types),
      department: randomItem(DEPARTMENTS_DATA).name,
      doctor: `Dr. ${randomItem(FIRST_NAMES_MALE)} ${randomItem(LAST_NAMES)}`,
      chiefComplaint: randomItem(complaints),
      diagnosis: randomItem(DIAGNOSES),
      status: i === 0 ? 'In Progress' : randomItem(statuses),
    });
  }
  
  return visits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function generatePatients(): Patient[] {
  const patients: Patient[] = [];
  const bloodTypes: Patient['bloodType'][] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
  const statuses: Patient['status'][] = ['Stable', 'Critical', 'Under Observation', 'Recovering', 'Discharged', 'Outpatient'];
  const genders: Patient['gender'][] = ['Male', 'Female', 'Other'];
  const maritalStatuses: Patient['maritalStatus'][] = ['Single', 'Married', 'Divorced', 'Widowed'];
  
  for (let i = 0; i < 50; i++) {
    const gender = randomItem(genders);
    const firstName = gender === 'Female' ? randomItem(FIRST_NAMES_FEMALE) : randomItem(FIRST_NAMES_MALE);
    const lastName = randomItem(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const age = randomInt(1, 95);
    const city = randomItem(CITIES);
    const state = randomItem(STATES);
    
    const insurance = generateInsurance();
    insurance.holderName = name;
    
    const status = randomItem(statuses);
    const isAdmitted = !['Discharged', 'Outpatient'].includes(status);
    
    patients.push({
      id: generateId('P'),
      mrn: `MRN${String(100000 + i).padStart(6, '0')}`,
      name,
      dateOfBirth: randomDate(new Date(1929, 0, 1), new Date(2023, 0, 1)),
      age,
      gender,
      bloodType: randomItem(bloodTypes),
      phone: randomPhone(),
      email: randomEmail(name),
      address: `${randomInt(100, 9999)} ${randomItem(['Main', 'Oak', 'Pine', 'Maple', 'Cedar', 'Elm'])} ${randomItem(['St', 'Ave', 'Blvd', 'Dr', 'Ln'])}`,
      city,
      state,
      zipCode: String(randomInt(10000, 99999)),
      country: 'United States',
      ward: isAdmitted ? randomItem(DEPARTMENTS_DATA).name : '',
      roomNumber: isAdmitted ? String(randomInt(100, 500)) : undefined,
      bedNumber: isAdmitted ? String(randomInt(1, 4)) : undefined,
      status,
      admittedDate: isAdmitted ? randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31)) : '',
      dischargeDate: status === 'Discharged' ? randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31)) : undefined,
      primaryDiagnosis: randomItem(DIAGNOSES),
      secondaryDiagnoses: Math.random() > 0.5 ? [randomItem(DIAGNOSES), randomItem(DIAGNOSES)] : undefined,
      attendingDoctorId: '',
      attendingDoctorName: '',
      allergies: generateAllergies(),
      medicalHistory: generateMedicalHistory(),
      surgeryHistory: generateSurgeryHistory(),
      immunizations: generateImmunizations(),
      emergencyContacts: generateEmergencyContacts(),
      insurance,
      vitalSigns: [],
      currentMedications: generatePatientMedications(),
      visitHistory: generatePatientVisits(),
      maritalStatus: randomItem(maritalStatuses),
      occupation: randomItem(['Engineer', 'Teacher', 'Nurse', 'Doctor', 'Lawyer', 'Accountant', 'Retired', 'Student', 'Business Owner', 'Manager', 'Technician', 'Sales', 'Unemployed']),
      nationality: 'American',
      language: randomItem(['English', 'Spanish', 'Chinese', 'French', 'German', 'Korean', 'Japanese']),
      organDonor: Math.random() > 0.6,
    });
  }
  
  return patients;
}

export function generateDoctors(patients: Patient[]): Doctor[] {
  const doctors: Doctor[] = [];
  const statuses: Doctor['status'][] = ['Available', 'On Leave', 'Busy', 'Off Duty', 'On Call'];
  
  for (let i = 0; i < 50; i++) {
    const firstName = randomItem([...FIRST_NAMES_MALE, ...FIRST_NAMES_FEMALE]);
    const lastName = randomItem(LAST_NAMES);
    const name = `Dr. ${firstName} ${lastName}`;
    const specialty = randomItem(SPECIALTIES);
    const department = DEPARTMENTS_DATA.find(d => 
      d.name.toLowerCase().includes(specialty.toLowerCase().split(' ')[0]) ||
      specialty.toLowerCase().includes(d.name.toLowerCase().split(' ')[0])
    ) || randomItem(DEPARTMENTS_DATA);
    
    const schedule: DoctorSchedule[] = [];
    for (let day = 0; day < 7; day++) {
      if (Math.random() > 0.2) {
        schedule.push({
          id: generateId('DS'),
          dayOfWeek: day,
          startTime: '08:00',
          endTime: '17:00',
          isAvailable: true,
          roomNumber: String(randomInt(100, 500)),
        });
      }
    }
    
    const qualifications: DoctorQualification[] = [
      { id: generateId('DQ'), degree: 'MD', institution: 'Harvard Medical School', year: randomInt(2000, 2015), specialization: specialty },
      { id: generateId('DQ'), degree: 'Residency', institution: 'Johns Hopkins Hospital', year: randomInt(2005, 2020), specialization: specialty },
    ];
    
    doctors.push({
      id: generateId('D'),
      employeeId: `EMP${String(1000 + i).padStart(5, '0')}`,
      name,
      specialty,
      subSpecialties: Math.random() > 0.5 ? [randomItem(SPECIALTIES)] : undefined,
      phone: randomPhone(),
      email: randomEmail(name.replace('Dr. ', '')),
      department: department.name,
      departmentId: department.code,
      status: randomItem(statuses),
      availability: 'Mon-Fri 9AM-5PM',
      patientsCount: randomInt(5, 50),
      consultationFee: randomItem([100, 150, 200, 250, 300, 400, 500]),
      licenseNumber: `MD-${randomInt(100000, 999999)}`,
      education: `${randomItem(['Harvard', 'Johns Hopkins', 'Stanford', 'Yale', 'UCLA', 'UCSF'])} Medical School`,
      experience: randomInt(2, 30),
      languages: ['English', ...(Math.random() > 0.5 ? [randomItem(['Spanish', 'Chinese', 'French', 'Hindi'])] : [])],
      bio: `Board-certified ${specialty} specialist with extensive experience in diagnosing and treating a wide range of conditions.`,
      qualifications,
      schedule,
      leaves: [],
      ratings: randomFloat(3.5, 5.0, 1),
      totalReviews: randomInt(10, 500),
      hireDate: randomDate(new Date(2010, 0, 1), new Date(2023, 11, 31)),
    });
  }
  
  // Update patients with attending doctors
  patients.forEach(patient => {
    const matchingDoctors = doctors.filter(d => d.department === patient.ward);
    if (matchingDoctors.length > 0) {
      const doctor = randomItem(matchingDoctors);
      patient.attendingDoctorId = doctor.id;
      patient.attendingDoctorName = doctor.name;
      patient.vitalSigns = generateVitalSigns(doctor.name);
    } else {
      const doctor = randomItem(doctors);
      patient.attendingDoctorId = doctor.id;
      patient.attendingDoctorName = doctor.name;
      patient.vitalSigns = generateVitalSigns(doctor.name);
    }
  });
  
  return doctors;
}

export function generateNurses(): Nurse[] {
  const nurses: Nurse[] = [];
  const statuses: Nurse['status'][] = ['Available', 'On Leave', 'Busy', 'Off Duty', 'On Call'];
  const shifts: Nurse['shift'][] = ['Morning', 'Afternoon', 'Night', 'Rotating'];
  
  for (let i = 0; i < 50; i++) {
    const firstName = randomItem([...FIRST_NAMES_FEMALE, ...FIRST_NAMES_FEMALE, ...FIRST_NAMES_MALE]);
    const lastName = randomItem(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const department = randomItem(DEPARTMENTS_DATA);
    
    nurses.push({
      id: generateId('N'),
      employeeId: `NUR${String(1000 + i).padStart(5, '0')}`,
      name,
      department: department.name,
      departmentId: department.code,
      phone: randomPhone(),
      email: randomEmail(name),
      status: randomItem(statuses),
      shift: randomItem(shifts),
      licenseNumber: `RN-${randomInt(100000, 999999)}`,
      specialization: Math.random() > 0.5 ? randomItem(['ICU', 'Emergency', 'Pediatric', 'Oncology', 'Cardiac']) : undefined,
      yearsOfExperience: randomInt(1, 25),
      assignedWard: department.name,
      assignedPatients: [],
      hireDate: randomDate(new Date(2010, 0, 1), new Date(2023, 11, 31)),
    });
  }
  
  return nurses;
}

export function generateDepartments(doctors: Doctor[]): Department[] {
  return DEPARTMENTS_DATA.map((dept, i) => {
    const headDoctor = doctors.find(d => d.department === dept.name) || doctors[i];
    const occupiedBeds = randomInt(0, Math.floor(dept.beds * 0.9));
    
    return {
      id: dept.code,
      code: dept.code,
      name: dept.name,
      description: `${dept.name} department providing comprehensive care`,
      beds: dept.beds,
      occupiedBeds,
      availableBeds: dept.beds - occupiedBeds,
      head: headDoctor?.name || `Dr. ${randomItem(FIRST_NAMES_MALE)} ${randomItem(LAST_NAMES)}`,
      headId: headDoctor?.id || '',
      status: occupiedBeds >= dept.beds ? 'Full' : occupiedBeds >= dept.beds * 0.8 ? 'Operational' : 'Operational',
      floor: dept.floor,
      location: `Building A, Floor ${dept.floor}`,
      phone: `+1 (555) ${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
      email: `${dept.name.toLowerCase().replace(/[^a-z]/g, '')}@hospitalhub.com`,
      staff: {
        doctorCount: randomInt(3, 15),
        nurseCount: randomInt(5, 30),
        technicianCount: randomInt(2, 10),
        totalStaff: randomInt(15, 50),
      },
      services: [`${dept.name} Consultation`, `${dept.name} Procedures`, `${dept.name} Diagnostics`],
      operatingHours: dept.emergency ? '24/7' : 'Mon-Fri 8AM-6PM',
      emergencyServices: dept.emergency,
    };
  });
}

export function generateBeds(departments: Department[]): Bed[] {
  const beds: Bed[] = [];
  const types: Bed['type'][] = ['General', 'ICU', 'Private', 'Semi-Private', 'Pediatric', 'Maternity'];
  const statuses: Bed['status'][] = ['Available', 'Occupied', 'Reserved', 'Maintenance', 'Cleaning'];
  
  departments.forEach(dept => {
    if (dept.beds > 0) {
      for (let i = 1; i <= dept.beds; i++) {
        const status = i <= dept.occupiedBeds ? 'Occupied' : randomItem(statuses.filter(s => s !== 'Occupied'));
        
        beds.push({
          id: generateId('B'),
          bedNumber: `${dept.code}-${String(i).padStart(3, '0')}`,
          wardId: dept.id,
          wardName: dept.name,
          roomNumber: String(randomInt(100 + dept.floor * 100, 199 + dept.floor * 100)),
          type: dept.name === 'ICU' ? 'ICU' : dept.name === 'Pediatrics' ? 'Pediatric' : randomItem(types),
          status,
          features: ['Oxygen', 'Call Button', ...(Math.random() > 0.5 ? ['TV', 'Phone'] : [])],
          dailyRate: dept.name === 'ICU' ? 1500 : dept.name === 'Private' ? 800 : 400,
        });
      }
    }
  });
  
  return beds;
}

export function generateAppointments(patients: Patient[], doctors: Doctor[]): Appointment[] {
  const appointments: Appointment[] = [];
  const types: Appointment['type'][] = ['Consultation', 'Follow-up', 'Emergency', 'Routine Checkup', 'Procedure', 'Telemedicine'];
  const statuses: Appointment['status'][] = ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show', 'Rescheduled'];
  const priorities: Appointment['priority'][] = ['Normal', 'Urgent', 'Emergency'];
  
  for (let i = 0; i < 50; i++) {
    const patient = randomItem(patients);
    const doctor = randomItem(doctors);
    const status = randomItem(statuses);
    const date = randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31));
    const time = `${String(randomInt(8, 17)).padStart(2, '0')}:${randomItem(['00', '15', '30', '45'])}`;
    
    appointments.push({
      id: generateId('APT'),
      appointmentNumber: `APT${String(100000 + i).padStart(6, '0')}`,
      patientId: patient.id,
      patientName: patient.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      departmentId: doctor.departmentId,
      department: doctor.department,
      date,
      time,
      endTime: `${String(parseInt(time.split(':')[0]) + 1).padStart(2, '0')}:${time.split(':')[1]}`,
      duration: randomItem([15, 30, 45, 60]),
      type: randomItem(types),
      status,
      reason: randomItem(['Regular checkup', 'Follow-up visit', 'New symptoms', 'Lab results review', 'Prescription refill', 'Pain management']),
      notes: Math.random() > 0.5 ? 'Patient reported improvement' : undefined,
      diagnosis: status === 'Completed' ? randomItem(DIAGNOSES) : undefined,
      followUpDate: status === 'Completed' ? randomDate(new Date(2025, 0, 1), new Date(2025, 3, 31)) : undefined,
      createdBy: randomItem(['System', 'Dr. Smith', 'Reception']),
      createdAt: date,
      reminderSent: Math.random() > 0.3,
      priority: randomItem(priorities),
    });
  }
  
  return appointments;
}

export function generateMedications(): Medication[] {
  const medications: Medication[] = [];
  const statuses: Medication['status'][] = ['In Stock', 'Low Stock', 'Out of Stock', 'Expired', 'Discontinued'];
  const controlledLevels: Medication['controlledLevel'][] = ['Schedule II', 'Schedule III', 'Schedule IV', 'Schedule V'];
  
  MEDICATION_NAMES.forEach((med, i) => {
    const stock = randomInt(0, 500);
    const reorderLevel = randomInt(20, 50);
    const price = randomFloat(5, 500, 2);
    const expiryDate = randomDate(new Date(2025, 0, 1), new Date(2027, 11, 31));
    
    let status: Medication['status'] = 'In Stock';
    if (stock === 0) status = 'Out of Stock';
    else if (stock < reorderLevel) status = 'Low Stock';
    else if (new Date(expiryDate) < new Date()) status = 'Expired';
    
    medications.push({
      id: generateId('M'),
      name: med.name,
      genericName: med.generic,
      brandName: Math.random() > 0.5 ? med.name : undefined,
      category: med.category,
      categoryId: med.category.substring(0, 3).toUpperCase(),
      description: `${med.name} is used for treating various conditions`,
      dosageForm: med.form as Medication['dosageForm'],
      strength: med.strength,
      unit: med.form === 'Injection' ? 'vial' : med.form === 'Inhaler' ? 'inhaler' : 'pack',
      stock,
      minStock: reorderLevel,
      maxStock: randomInt(200, 1000),
      reorderLevel,
      price,
      costPrice: price * 0.6,
      manufacturer: randomItem(['Pfizer', 'Johnson & Johnson', 'Novartis', 'Roche', 'Merck', 'Abbott', 'GSK']),
      supplierId: `SUP-${randomInt(100, 999)}`,
      supplierName: randomItem(['MedSupply Co', 'PharmaDist', 'HealthCare Supplies', 'MediLogistics']),
      location: `Shelf ${String.fromCharCode(65 + (i % 26))}-${randomInt(1, 10)}`,
      expiryDate,
      manufacturingDate: randomDate(new Date(2022, 0, 1), new Date(2024, 11, 31)),
      batchNumber: `B${randomInt(100000, 999999)}`,
      requiresPrescription: ['Antibiotics', 'Opioid', 'Sedative', 'Antidepressant'].includes(med.category),
      controlledSubstance: med.category === 'Opioid',
      controlledLevel: med.category === 'Opioid' ? randomItem(controlledLevels) : undefined,
      storageConditions: med.form === 'Injection' ? '2-8°C' : 'Room temperature',
      sideEffects: ['Nausea', 'Headache', 'Dizziness', 'Fatigue'].slice(0, randomInt(1, 3)),
      contraindications: ['Pregnancy', 'Allergy to components'].slice(0, randomInt(1, 2)),
      interactions: Math.random() > 0.5 ? ['May interact with blood thinners'] : undefined,
      lastRestocked: randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31)),
      status,
    });
  });
  
  return medications;
}

export function generatePrescriptions(patients: Patient[], doctors: Doctor[], medications: Medication[]): Prescription[] {
  const prescriptions: Prescription[] = [];
  const frequencies = ['Once daily', 'Twice daily', 'Three times daily', 'As needed', 'Every 4 hours', 'Every 8 hours', 'Every 12 hours'];
  const statuses: Prescription['status'][] = ['Pending', 'Dispensed', 'Partially Dispensed', 'Cancelled'];
  
  for (let i = 0; i < 50; i++) {
    const patient = randomItem(patients);
    const doctor = randomItem(doctors);
    const itemCount = randomInt(1, 5);
    const items = [];
    
    for (let j = 0; j < itemCount; j++) {
      const med = randomItem(medications);
      items.push({
        id: generateId('PI'),
        medicationId: med.id,
        medicationName: med.name,
        dosage: med.strength,
        frequency: randomItem(frequencies),
        duration: `${randomInt(3, 30)} days`,
        quantity: randomInt(10, 100),
        instructions: 'Take with food',
        refills: randomInt(0, 3),
        refillsRemaining: randomInt(0, 3),
      });
    }
    
    prescriptions.push({
      id: generateId('RX'),
      prescriptionNumber: `RX${String(100000 + i).padStart(6, '0')}`,
      patientId: patient.id,
      patientName: patient.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      date: randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31)),
      diagnosis: randomItem(DIAGNOSES),
      items,
      status: randomItem(statuses),
      validUntil: randomDate(new Date(2024, 11, 1), new Date(2025, 6, 30)),
    });
  }
  
  return prescriptions;
}

export function generateLabTests(): LabTest[] {
  const tests: LabTest[] = [];
  
  LAB_TESTS_DATA.forEach(test => {
    tests.push({
      id: generateId('LT'),
      code: test.code,
      name: test.name,
      category: test.category,
      categoryId: test.category.substring(0, 3).toUpperCase(),
      description: `Laboratory test for ${test.name}`,
      specimenType: test.specimen,
      preparationInstructions: Math.random() > 0.5 ? 'Fasting required' : undefined,
      price: test.price,
      turnaroundTime: test.tat,
      referenceRangeLow: randomInt(10, 100),
      referenceRangeHigh: randomInt(100, 500),
      referenceRangeUnit: randomItem(['mg/dL', 'IU/L', 'g/dL', '%', 'cells/uL']),
      criticalLow: randomInt(5, 50),
      criticalHigh: randomInt(500, 1000),
      status: 'Active',
    });
  });
  
  return tests;
}

export function generateLabOrders(patients: Patient[], doctors: Doctor[], labTests: LabTest[]): LabOrder[] {
  const orders: LabOrder[] = [];
  const priorities: LabOrder['priority'][] = ['Routine', 'Urgent', 'STAT'];
  const statuses: LabOrder['status'][] = ['Ordered', 'Sample Collected', 'In Progress', 'Completed', 'Cancelled'];
  
  for (let i = 0; i < 50; i++) {
    const patient = randomItem(patients);
    const doctor = randomItem(doctors);
    const testCount = randomInt(1, 5);
    const selectedTests = [];
    
    for (let j = 0; j < testCount; j++) {
      const test = randomItem(labTests);
      selectedTests.push({
        id: generateId('LOT'),
        testId: test.id,
        testName: test.name,
        status: randomItem(['Pending', 'In Progress', 'Completed'] as const),
        result: Math.random() > 0.5 ? `${randomInt(10, 200)} ${test.referenceRangeUnit}` : undefined,
        numericResult: Math.random() > 0.5 ? randomInt(10, 200) : undefined,
        unit: test.referenceRangeUnit,
        isAbnormal: Math.random() > 0.8,
        isCritical: Math.random() > 0.95,
        referenceRange: `${test.referenceRangeLow}-${test.referenceRangeHigh} ${test.referenceRangeUnit}`,
      });
    }
    
    orders.push({
      id: generateId('LO'),
      orderNumber: `LAB${String(100000 + i).padStart(6, '0')}`,
      patientId: patient.id,
      patientName: patient.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      tests: selectedTests,
      priority: randomItem(priorities),
      status: randomItem(statuses),
      orderedAt: randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31)),
      diagnosis: randomItem(DIAGNOSES),
    });
  }
  
  return orders;
}

export function generateLabResults(labOrders: LabOrder[]): LabResult[] {
  const results: LabResult[] = [];
  
  labOrders.forEach(order => {
    if (order.status === 'Completed') {
      results.push({
        id: generateId('LR'),
        resultNumber: `RES${order.orderNumber.substring(3)}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        patientId: order.patientId,
        patientName: order.patientName,
        patientAge: randomInt(20, 80),
        patientGender: randomItem(['Male', 'Female']),
        doctorId: order.doctorId,
        doctorName: order.doctorName,
        tests: order.tests,
        status: 'Final',
        reportedAt: order.orderedAt,
        verifiedBy: `Dr. ${randomItem(FIRST_NAMES_MALE)} ${randomItem(LAST_NAMES)}`,
        verifiedAt: order.orderedAt,
        interpretation: Math.random() > 0.5 ? 'Values within normal limits' : 'Abnormal findings noted',
      });
    }
  });
  
  return results;
}

export function generateInvoices(patients: Patient[]): Invoice[] {
  const invoices: Invoice[] = [];
  const statuses: Invoice['status'][] = ['Draft', 'Pending', 'Partial', 'Paid', 'Overdue', 'Cancelled', 'Insurance Pending'];
  const serviceTypes: InvoiceItem['type'][] = ['Service', 'Procedure', 'Supply', 'Medication', 'Lab', 'Room'];
  
  for (let i = 0; i < 50; i++) {
    const patient = randomItem(patients);
    const itemCount = randomInt(2, 6);
    const items: InvoiceItem[] = [];
    let subtotal = 0;
    
    const services = [
      { desc: 'Consultation', price: 150 },
      { desc: 'Laboratory Tests', price: 250 },
      { desc: 'X-Ray', price: 350 },
      { desc: 'MRI Scan', price: 1500 },
      { desc: 'Room Charge (Daily)', price: 400 },
      { desc: 'Medication', price: 120 },
      { desc: 'Procedure', price: 2000 },
      { desc: 'Surgery', price: 5000 },
      { desc: 'Anesthesia', price: 800 },
      { desc: 'Physical Therapy', price: 150 },
    ];
    
    for (let j = 0; j < itemCount; j++) {
      const service = randomItem(services);
      const qty = randomInt(1, 5);
      const itemTotal = service.price * qty;
      subtotal += itemTotal;
      
      items.push({
        id: generateId('II'),
        description: service.desc,
        code: `SVC${String(1000 + j).padStart(5, '0')}`,
        quantity: qty,
        unitPrice: service.price,
        discount: 0,
        tax: 0,
        total: itemTotal,
        type: randomItem(serviceTypes),
        date: randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31)),
      });
    }
    
    const discount = randomFloat(0, subtotal * 0.1, 2);
    const tax = (subtotal - discount) * 0.08;
    const total = subtotal - discount + tax;
    const paidAmount = Math.random() > 0.5 ? total * randomFloat(0, 1, 2) : 0;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    invoices.push({
      id: generateId('INV'),
      invoiceNumber: `INV${String(100000 + i).padStart(6, '0')}`,
      patientId: patient.id,
      patientName: patient.name,
      patientMRN: patient.mrn,
      items,
      subtotal,
      discount,
      tax,
      total,
      paidAmount,
      balance: total - paidAmount,
      status,
      date: randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31)),
      dueDate: randomDate(new Date(2024, 6, 1), new Date(2025, 3, 31)),
      payments: [],
      createdBy: 'System',
    });
  }
  
  return invoices;
}

export function generateAdmissions(patients: Patient[], beds: Bed[]): Admission[] {
  const admissions: Admission[] = [];
  const types: Admission['type'][] = ['Emergency', 'Elective', 'Newborn', 'Transfer', 'Observation'];
  const priorities: Admission['priority'][] = ['Critical', 'High', 'Normal', 'Low'];
  const statuses: Admission['status'][] = ['Waiting', 'Admitted', 'In Progress', 'Discharge Pending', 'Discharged', 'Cancelled'];
  
  const admittedPatients = patients.filter(p => !['Discharged', 'Outpatient'].includes(p.status));
  
  admittedPatients.forEach((patient, i) => {
    const availableBeds = beds.filter(b => b.wardName === patient.ward);
    const bed = availableBeds.length > 0 ? randomItem(availableBeds) : randomItem(beds);
    
    const admittedAt = patient.admittedDate || randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31));
    
    admissions.push({
      id: generateId('AD'),
      admissionNumber: `ADM${String(100000 + i).padStart(6, '0')}`,
      patientId: patient.id,
      patientName: patient.name,
      type: randomItem(types),
      priority: patient.status === 'Critical' ? 'Critical' : randomItem(priorities),
      status: patient.status === 'Discharged' ? 'Discharged' : 'Admitted',
      bedId: bed?.id,
      bedNumber: bed?.bedNumber,
      wardId: bed?.wardId,
      wardName: bed?.wardName || patient.ward,
      roomNumber: bed?.roomNumber,
      admittedBy: `Dr. ${randomItem(FIRST_NAMES_MALE)} ${randomItem(LAST_NAMES)}`,
      admittedByRole: 'Doctor',
      admittingDoctor: patient.attendingDoctorName,
      admittingDoctorId: patient.attendingDoctorId,
      admittingDiagnosis: patient.primaryDiagnosis,
      admittedAt,
      expectedDischarge: randomDate(new Date(2024, 11, 1), new Date(2025, 2, 28)),
      lengthOfStay: Math.floor((new Date().getTime() - new Date(admittedAt).getTime()) / (1000 * 60 * 60 * 24)),
      consentForms: ['Admission Consent', 'Treatment Consent'],
      estimatedCost: randomInt(5000, 50000),
    });
  });
  
  return admissions;
}

export function generateEmergencyCases(): EmergencyCase[] {
  const emergencies: EmergencyCase[] = [];
  const levels: EmergencyCase['level'][] = ['Critical', 'Serious', 'Moderate', 'Minor'];
  const statuses: EmergencyCase['status'][] = ['Incoming', 'Triage', 'In Treatment', 'Observation', 'Discharged', 'Admitted', 'Transferred'];
  const cases = [
    'Cardiac Arrest', 'Stroke', 'Severe Trauma', 'Respiratory Distress', 'Anaphylaxis',
    'Severe Bleeding', 'Fracture', 'Burns', 'Overdose', 'Seizure', 'Chest Pain',
    'Abdominal Pain', 'High Fever', 'Severe Headache', 'Loss of Consciousness'
  ];
  
  for (let i = 0; i < 50; i++) {
    const level = randomItem(levels);
    const status = randomItem(statuses);
    
    emergencies.push({
      id: generateId('ER'),
      caseNumber: `ER${String(100000 + i).padStart(6, '0')}`,
      case: randomItem(cases),
      description: 'Patient presented with acute symptoms requiring immediate attention',
      eta: `${randomInt(1, 15)} min`,
      level,
      triageScore: level === 'Critical' ? 1 : level === 'Serious' ? 2 : level === 'Moderate' ? 3 : 4,
      status,
      assignedDoctor: `Dr. ${randomItem(FIRST_NAMES_MALE)} ${randomItem(LAST_NAMES)}`,
      treatmentArea: randomItem(['Trauma Bay', 'Cardiac Bay', 'General ER', 'Pediatric ER']),
      chiefComplaint: 'Acute distress',
      treatments: [],
      bystanderName: randomItem(FIRST_NAMES_MALE) + ' ' + randomItem(LAST_NAMES),
      bystanderPhone: randomPhone(),
    });
  }
  
  return emergencies;
}

export function generateSurgeries(patients: Patient[], doctors: Doctor[]): Surgery[] {
  const surgeries: Surgery[] = [];
  const statuses: Surgery['status'][] = ['Scheduled', 'Pre-Op', 'In Progress', 'Completed', 'Cancelled', 'Postponed'];
  const anesthesiaTypes: Surgery['anesthesiaType'][] = ['General', 'Regional', 'Local', 'MAC', 'None'];
  
  for (let i = 0; i < 30; i++) {
    const patient = randomItem(patients);
    const surgeon = doctors.find(d => d.specialty.includes('Surgery')) || randomItem(doctors);
    const procedure = randomItem(PROCEDURES);
    const date = randomDate(new Date(2024, 0, 1), new Date(2025, 3, 31));
    
    surgeries.push({
      id: generateId('SUR'),
      surgeryNumber: `SUR${String(100000 + i).padStart(6, '0')}`,
      patientId: patient.id,
      patientName: patient.name,
      procedure,
      procedureCode: `CPT${randomInt(10000, 69999)}`,
      department: surgeon.department,
      theaterId: `OT${randomInt(1, 10)}`,
      theaterName: `Operating Theater ${randomInt(1, 10)}`,
      scheduledDate: date,
      scheduledTime: `${String(randomInt(7, 16)).padStart(2, '0')}:00`,
      estimatedDuration: randomInt(30, 300),
      status: randomItem(statuses),
      team: [
        { surgeonId: surgeon.id, surgeonName: surgeon.name, role: 'Lead Surgeon' },
        { surgeonId: '', surgeonName: `Dr. ${randomItem(FIRST_NAMES_MALE)} ${randomItem(LAST_NAMES)}`, role: 'Assistant Surgeon' },
        { surgeonId: '', surgeonName: `Dr. ${randomItem(FIRST_NAMES_MALE)} ${randomItem(LAST_NAMES)}`, role: 'Anesthesiologist' },
      ],
      anesthesiaType: randomItem(anesthesiaTypes),
      preOpDiagnosis: randomItem(DIAGNOSES),
      consentFormSigned: Math.random() > 0.1,
      preOpChecklist: [
        { id: generateId('POC'), item: 'Patient ID verified', completed: true },
        { id: generateId('POC'), item: 'Consent form signed', completed: true },
        { id: generateId('POC'), item: 'Allergies checked', completed: true },
        { id: generateId('POC'), item: 'NPO status confirmed', completed: Math.random() > 0.2 },
        { id: generateId('POC'), item: 'Site marked', completed: Math.random() > 0.3 },
      ],
    });
  }
  
  return surgeries;
}

export function generateTasks(): Task[] {
  const tasks: Task[] = [];
  const statuses: Task['status'][] = ['To Do', 'In Progress', 'Done', 'Cancelled'];
  const priorities: Task['priority'][] = ['Critical', 'High', 'Medium', 'Low'];
  const categories = ['Patient Care', 'Administrative', 'Follow-up', 'Documentation', 'Medication', 'Lab', 'Emergency', 'Routine'];
  const assignees = ['Dr. Sarah Johnson', 'Emily Davis', 'Michael Brown', 'Jennifer Wilson', 'David Martinez', 'Lisa Anderson'];
  
  for (let i = 0; i < 50; i++) {
    tasks.push({
      id: generateId('T'),
      title: randomItem([
        'Review patient lab results',
        'Update patient records',
        'Schedule follow-up appointment',
        'Prepare discharge summary',
        'Order medication refill',
        'Complete patient assessment',
        'Submit insurance claim',
        'Process admission paperwork',
        'Coordinate with specialist',
        'Update inventory records',
      ]),
      description: 'Task needs to be completed by the end of the day',
      status: randomItem(statuses),
      priority: randomItem(priorities),
      due: randomDate(new Date(2024, 0, 1), new Date(2025, 3, 31)),
      assignedTo: randomItem(assignees),
      assignedToId: generateId('U'),
      assignedBy: 'System',
      category: randomItem(categories),
      createdAt: randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31)),
    });
  }
  
  return tasks;
}

export function generateEvents(): Event[] {
  const events: Event[] = [];
  const types: Event['type'][] = ['meeting', 'surgery', 'appointment', 'training', 'conference', 'other'];
  const statuses: Event['status'][] = ['Scheduled', 'Completed', 'Cancelled', 'Postponed'];
  
  const eventTitles = [
    'Department Meeting', 'Surgery Planning', 'Grand Rounds', 'Staff Training',
    'Case Conference', 'Board Meeting', 'Quality Review', 'Safety Committee',
    'Research Discussion', 'Patient Care Conference', 'Shift Handover', 'Team Briefing'
  ];
  
  for (let i = 0; i < 50; i++) {
    const date = randomDate(new Date(2024, 0, 1), new Date(2025, 3, 31));
    const startHour = randomInt(8, 16);
    
    events.push({
      id: generateId('E'),
      title: randomItem(eventTitles),
      date,
      startTime: `${String(startHour).padStart(2, '0')}:00`,
      endTime: `${String(startHour + 1).padStart(2, '0')}:00`,
      type: randomItem(types),
      location: `Room ${randomInt(100, 500)}`,
      attendees: [
        { id: generateId('EA'), name: `Dr. ${randomItem(FIRST_NAMES_MALE)} ${randomItem(LAST_NAMES)}`, status: 'Accepted' },
        { id: generateId('EA'), name: `${randomItem(FIRST_NAMES_FEMALE)} ${randomItem(LAST_NAMES)}`, status: 'Pending' },
      ],
      organizer: `Dr. ${randomItem(FIRST_NAMES_MALE)} ${randomItem(LAST_NAMES)}`,
      organizerId: generateId('U'),
      status: randomItem(statuses),
      isAllDay: false,
      reminder: 15,
    });
  }
  
  return events;
}

export function generateDocuments(patients: Patient[]): Document[] {
  const documents: Document[] = [];
  const types: Document['type'][] = ['pdf', 'image', 'spreadsheet', 'document', 'other'];
  const categories: Document['category'][] = ['Patient Record', 'Lab Report', 'Imaging', 'Consent Form', 'Insurance', 'Administrative', 'Policy', 'Training', 'Other'];
  const accessLevels: Document['accessLevel'][] = ['Public', 'Internal', 'Restricted', 'Confidential'];
  
  const docNames = [
    'Patient Consent Form', 'Discharge Summary', 'Lab Report', 'X-Ray Image',
    'CT Scan Report', 'MRI Results', 'Surgery Report', 'Pathology Report',
    'Hospital Policy Manual', 'Training Materials', 'Staff Guidelines',
    'Quality Assurance Report', 'Patient Satisfaction Survey', 'Insurance Form'
  ];
  
  for (let i = 0; i < 50; i++) {
    const type = randomItem(types);
    const patient = Math.random() > 0.4 ? randomItem(patients) : null;
    
    documents.push({
      id: generateId('DOC'),
      name: randomItem(docNames),
      type,
      category: randomItem(categories),
      size: randomInt(10000, 10000000),
      mimeType: type === 'pdf' ? 'application/pdf' : type === 'image' ? 'image/jpeg' : 'application/octet-stream',
      url: `/documents/${generateId('file')}.${type === 'pdf' ? 'pdf' : type === 'image' ? 'jpg' : 'doc'}`,
      patientId: patient?.id,
      patientName: patient?.name,
      uploadedAt: randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31)),
      uploadedBy: `Dr. ${randomItem(FIRST_NAMES_MALE)} ${randomItem(LAST_NAMES)}`,
      uploadedById: generateId('U'),
      tags: ['medical', 'patient'],
      version: 1,
      accessLevel: randomItem(accessLevels),
    });
  }
  
  return documents;
}

export function generateInventory(): InventoryItem[] {
  const items: InventoryItem[] = [];
  const categories = ['Medical Supplies', 'Equipment', 'Pharmaceuticals', 'Office Supplies', 'Linens', 'Food Service', 'Maintenance'];
  const statuses: InventoryItem['status'][] = ['In Stock', 'Low Stock', 'Out of Stock', 'Expired', 'On Order'];
  
  const inventoryNames = [
    'Surgical Gloves', 'Syringes', 'IV Catheters', 'Bandages', 'Gauze Pads',
    'Face Masks', 'Hand Sanitizer', 'Thermometers', 'Blood Pressure Cuffs',
    'Stethoscopes', 'Wheelchairs', 'Crutches', 'Hospital Beds', 'IV Poles',
    'Oxygen Masks', 'Nebulizers', 'Surgical Instruments', 'Lab Equipment',
    'X-Ray Film', 'Ultrasound Gel', 'ECG Electrodes', 'Catheters', 'Drainage Bags'
  ];
  
  inventoryNames.forEach((name, i) => {
    const quantity = randomInt(0, 500);
    const minStock = randomInt(20, 50);
    const status: InventoryItem['status'] = quantity === 0 ? 'Out of Stock' : quantity < minStock ? 'Low Stock' : 'In Stock';
    
    items.push({
      id: generateId('INV'),
      name,
      category: randomItem(categories),
      sku: `SKU${String(10000 + i).padStart(6, '0')}`,
      description: `${name} for hospital use`,
      quantity,
      unit: name.includes('Gloves') || name.includes('Masks') ? 'box' : 'pieces',
      minStock,
      maxStock: randomInt(200, 1000),
      reorderLevel: minStock,
      reorderQuantity: randomInt(50, 200),
      unitCost: randomFloat(5, 500, 2),
      totalValue: 0,
      location: `Storage Room ${randomInt(1, 5)}`,
      supplier: randomItem(['MedSupply Co', 'HealthCare Dist', 'MediLogistics']),
      supplierId: `SUP-${randomInt(100, 999)}`,
      lastRestocked: randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31)),
      status,
    });
  });
  
  items.forEach(item => {
    item.totalValue = item.quantity * item.unitCost;
  });
  
  return items;
}

export function generateNotifications(): Notification[] {
  const notifications: Notification[] = [];
  const types: Notification['type'][] = ['Alert', 'Reminder', 'Info', 'Warning', 'Emergency'];
  const priorities: Notification['priority'][] = ['Low', 'Medium', 'High', 'Critical'];
  const categories: Notification['category'][] = ['Patient', 'Appointment', 'Lab', 'Pharmacy', 'Billing', 'Emergency', 'System', 'Task'];
  
  const notificationTemplates = [
    { title: 'New Emergency Case', message: 'Critical patient incoming - ETA 5 min', category: 'Emergency', type: 'Emergency' },
    { title: 'Lab Results Ready', message: 'CBC results for patient are now available', category: 'Lab', type: 'Info' },
    { title: 'Appointment Reminder', message: 'You have an appointment in 30 minutes', category: 'Appointment', type: 'Reminder' },
    { title: 'Low Stock Alert', message: 'Medication stock is below reorder level', category: 'Pharmacy', type: 'Warning' },
    { title: 'Patient Discharged', message: 'Patient has been successfully discharged', category: 'Patient', type: 'Info' },
    { title: 'Critical Lab Value', message: 'Critical potassium level detected', category: 'Lab', type: 'Emergency' },
    { title: 'Task Due', message: 'You have pending tasks due today', category: 'Task', type: 'Reminder' },
    { title: 'Invoice Overdue', message: 'Invoice payment is past due date', category: 'Billing', type: 'Warning' },
  ];
  
  for (let i = 0; i < 30; i++) {
    const template = randomItem(notificationTemplates);
    
    notifications.push({
      id: generateId('N'),
      type: template.type as Notification['type'],
      title: template.title,
      message: template.message,
      category: template.category as Notification['category'],
      priority: randomItem(priorities),
      isRead: Math.random() > 0.3,
      createdAt: randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31)),
    });
  }
  
  return notifications;
}

export function generateSurgeryTheaters(): SurgeryTheater[] {
  const theaters: SurgeryTheater[] = [];
  const statuses: SurgeryTheater['status'][] = ['Available', 'In Use', 'Cleaning', 'Maintenance', 'Reserved'];
  
  for (let i = 1; i <= 10; i++) {
    theaters.push({
      id: `OT${i}`,
      name: `Operating Theater ${i}`,
      number: `OT-${String(i).padStart(2, '0')}`,
      department: randomItem(['General Surgery', 'Cardiac Surgery', 'Neurosurgery', 'Orthopedics']),
      status: randomItem(statuses),
      features: ['LED Lighting', 'Laparoscopic Equipment', 'C-Arm', 'Anesthesia Machine'],
    });
  }
  
  return theaters;
}

export function generateLabCategories(): LabTestCategory[] {
  return [
    { id: 'HEM', name: 'Hematology', description: 'Blood and blood disorders', turnAroundTime: '2-4 hours' },
    { id: 'CHE', name: 'Chemistry', description: 'Chemical analysis of body fluids', turnAroundTime: '2-4 hours' },
    { id: 'END', name: 'Endocrinology', description: 'Hormone testing', turnAroundTime: '24 hours' },
    { id: 'MIC', name: 'Microbiology', description: 'Infectious disease testing', turnAroundTime: '48-72 hours' },
    { id: 'COA', name: 'Coagulation', description: 'Blood clotting studies', turnAroundTime: '2 hours' },
    { id: 'CAR', name: 'Cardiac', description: 'Cardiac biomarkers', turnAroundTime: '1-2 hours' },
    { id: 'SER', name: 'Serology', description: 'Immune system testing', turnAroundTime: '24 hours' },
    { id: 'URI', name: 'Urinalysis', description: 'Urine testing', turnAroundTime: '1 hour' },
    { id: 'IMM', name: 'Immunohematology', description: 'Blood banking', turnAroundTime: '2 hours' },
  ];
}
