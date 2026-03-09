// Data Export Utilities
import type { Patient, Appointment, Invoice, Medication, LabResult, Surgery } from '@/types';

interface CSVRow {
  [key: string]: string | number | boolean | undefined;
}

export function exportToCSV(data: CSVRow[], filename: string) {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Convert data to CSV format
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that need quoting
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToJSON(data: unknown, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportPatientsToCSV(patients: Patient[]) {
  const data = patients.map(p => ({
    MRN: p.mrn,
    Name: p.name,
    Age: p.age,
    Gender: p.gender,
    Phone: p.phone,
    Email: p.email,
    Status: p.status,
    Ward: p.ward,
    Diagnosis: p.primaryDiagnosis,
    AdmittedDate: p.admittedDate,
    BloodType: p.bloodType,
  }));
  exportToCSV(data, 'patients');
}

export function exportAppointmentsToCSV(appointments: Appointment[]) {
  const data = appointments.map(a => ({
    AppointmentNumber: a.appointmentNumber,
    PatientName: a.patientName,
    DoctorName: a.doctorName,
    Department: a.department,
    Date: a.date,
    Time: a.time,
    Type: a.type,
    Status: a.status,
    Reason: a.reason,
  }));
  exportToCSV(data, 'appointments');
}

export function exportInvoicesToCSV(invoices: Invoice[]) {
  const data = invoices.map(i => ({
    InvoiceNumber: i.invoiceNumber,
    PatientName: i.patientName,
    PatientMRN: i.patientMRN,
    Date: i.date,
    DueDate: i.dueDate,
    Total: i.total,
    PaidAmount: i.paidAmount,
    Balance: i.balance,
    Status: i.status,
  }));
  exportToCSV(data, 'invoices');
}

export function exportMedicationsToCSV(medications: Medication[]) {
  const data = medications.map(m => ({
    Name: m.name,
    GenericName: m.genericName,
    Category: m.category,
    Stock: m.stock,
    Unit: m.unit,
    Price: m.price,
    Status: m.status,
    ExpiryDate: m.expiryDate,
    Manufacturer: m.manufacturer,
  }));
  exportToCSV(data, 'medications');
}

interface LabResultExport extends LabResult {
  tests: Array<{ testName: string }>;
}

export function exportLabResultsToCSV(labResults: LabResultExport[]) {
  const data = labResults.map(l => ({
    ResultNumber: l.resultNumber,
    PatientName: l.patientName,
    TestType: l.tests?.map(t => t.testName).join('; '),
    Date: l.reportedAt,
    Status: l.status,
    Doctor: l.doctorName,
  }));
  exportToCSV(data, 'lab-results');
}

export function exportSurgeriesToCSV(surgeries: Surgery[]) {
  const data = surgeries.map(s => ({
    SurgeryNumber: s.surgeryNumber,
    PatientName: s.patientName,
    Procedure: s.procedure,
    Department: s.department,
    ScheduledDate: s.scheduledDate,
    ScheduledTime: s.scheduledTime,
    Status: s.status,
    Theater: s.theaterName,
    Anesthesia: s.anesthesiaType,
  }));
  exportToCSV(data, 'surgeries');
}
