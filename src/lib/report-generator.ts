// PDF Report Generator Utilities for Hospital Management System
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Patient, Invoice, LabOrder, DashboardStats, Department, Medication } from '@/types';

// Hospital header configuration
const HOSPITAL_NAME = 'City General Hospital';
const HOSPITAL_ADDRESS = '123 Healthcare Avenue, Medical District';
const HOSPITAL_PHONE = 'Phone: (555) 123-4567';
const HOSPITAL_EMAIL = 'Email: info@citygeneralhospital.com';

// Color scheme
const COLORS = {
  primary: [41, 98, 255] as const,    // Blue
  secondary: [30, 64, 175] as const,  // Darker blue
  accent: [16, 185, 129] as const,    // Green
  danger: [239, 68, 68] as const,     // Red
  warning: [245, 158, 11] as const,   // Amber
  text: [31, 41, 55] as const,        // Dark gray
  lightText: [107, 114, 128] as const, // Gray
  border: [209, 213, 219] as const,   // Light gray
};

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Format date
const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format date short
const formatDateShort = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Add hospital header to PDF
const addHospitalHeader = (doc: jsPDF, title: string): number => {
  const _pageWidth = doc.internal.pageSize.getWidth();
  
  // Hospital logo area (text-based)
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Hospital name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(HOSPITAL_NAME, pageWidth / 2, 14, { align: 'center' });
  
  // Hospital address
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${HOSPITAL_ADDRESS} | ${HOSPITAL_PHONE} | ${HOSPITAL_EMAIL}`, pageWidth / 2, 24, { align: 'center' });
  
  // Report title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, 32, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(...COLORS.text);
  
  return 45; // Return Y position for content start
};

// Add footer to PDF
const addFooter = (doc: jsPDF, pageNumber: number, totalPages: number) => {
  const _pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.lightText);
  doc.setFont('helvetica', 'normal');
  
  // Footer line
  doc.setDrawColor(...COLORS.border);
  doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
  
  // Generated timestamp
  doc.text(
    `Generated on: ${new Date().toLocaleString()}`,
    15,
    pageHeight - 10
  );
  
  // Page number
  doc.text(
    `Page ${pageNumber} of ${totalPages}`,
    pageWidth - 15,
    pageHeight - 10,
    { align: 'right' }
  );
};

// Generate Patient Report PDF
export const generatePatientReport = (patient: Patient): jsPDF => {
  const doc = new jsPDF();
  let yPos = addHospitalHeader(doc, 'PATIENT REPORT');
  
  const _pageWidth = doc.internal.pageSize.getWidth();
  const _contentWidth = pageWidth - 30;
  
  // Report generation info
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.lightText);
  doc.text(`Report Date: ${formatDate(new Date())}`, 15, yPos);
  doc.text(`MRN: ${patient.mrn}`, pageWidth - 15, yPos, { align: 'right' });
  yPos += 10;
  
  // Patient Information Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('Patient Information', 15, yPos);
  yPos += 2;
  
  doc.setDrawColor(...COLORS.primary);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 8;
  
  // Patient details in two columns
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.text);
  
  const leftColX = 15;
  const rightColX = pageWidth / 2 + 5;
  
  // Left column
  doc.setFont('helvetica', 'bold');
  doc.text('Full Name:', leftColX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.name, leftColX + 30, yPos);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Date of Birth:', leftColX, yPos + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(patient.dateOfBirth), leftColX + 30, yPos + 7);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Gender:', leftColX, yPos + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.gender, leftColX + 30, yPos + 14);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Blood Type:', leftColX, yPos + 21);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.bloodType, leftColX + 30, yPos + 21);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Phone:', leftColX, yPos + 28);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.phone, leftColX + 30, yPos + 28);
  
  // Right column
  doc.setFont('helvetica', 'bold');
  doc.text('Status:', rightColX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.status, rightColX + 25, yPos);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Ward:', rightColX, yPos + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.ward, rightColX + 25, yPos + 7);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Room:', rightColX, yPos + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.roomNumber || 'N/A', rightColX + 25, yPos + 14);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Admitted:', rightColX, yPos + 21);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDateShort(patient.admittedDate), rightColX + 25, yPos + 21);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Email:', rightColX, yPos + 28);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.email, rightColX + 25, yPos + 28);
  
  yPos += 42;
  
  // Address
  doc.setFont('helvetica', 'bold');
  doc.text('Address:', leftColX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${patient.address}, ${patient.city}, ${patient.state} ${patient.zipCode}`, leftColX + 30, yPos);
  yPos += 12;
  
  // Primary Diagnosis Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('Medical Information', 15, yPos);
  yPos += 2;
  doc.setDrawColor(...COLORS.primary);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Primary Diagnosis:', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.primaryDiagnosis, 55, yPos);
  yPos += 10;
  
  if (patient.secondaryDiagnoses && patient.secondaryDiagnoses.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Secondary Diagnoses:', 15, yPos);
    yPos += 5;
    patient.secondaryDiagnoses.forEach((diagnosis, index) => {
      doc.setFont('helvetica', 'normal');
      doc.text(`${index + 1}. ${diagnosis}`, 20, yPos + (index * 5));
    });
    yPos += patient.secondaryDiagnoses.length * 5 + 5;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.text('Attending Doctor:', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.attendingDoctorName, 55, yPos);
  yPos += 12;
  
  // Allergies Section
  if (patient.allergies && patient.allergies.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.danger);
    doc.text('Allergies', 15, yPos);
    yPos += 2;
    doc.setDrawColor(...COLORS.danger);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 8;
    
    const allergyData = patient.allergies.map(allergy => [
      allergy.substance,
      allergy.severity,
      allergy.reaction,
      formatDateShort(allergy.diagnosedDate)
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Substance', 'Severity', 'Reaction', 'Diagnosed']],
      body: allergyData,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 15, right: 15 },
    });
    
    // @ts-expect-error - autoTable adds lastY to doc
    yPos = doc.lastAutoTable.lastY + 10;
  }
  
  // Current Medications
  if (patient.currentMedications && patient.currentMedications.length > 0) {
    // Check if we need a new page
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text('Current Medications', 15, yPos);
    yPos += 2;
    doc.setDrawColor(...COLORS.primary);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 5;
    
    const medicationData = patient.currentMedications.map(med => [
      med.medication,
      med.dosage,
      med.frequency,
      med.status,
      med.prescribedBy
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Medication', 'Dosage', 'Frequency', 'Status', 'Prescribed By']],
      body: medicationData,
      theme: 'striped',
      headStyles: { fillColor: [41, 98, 255], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 15, right: 15 },
    });
    
    // @ts-expect-error - autoTable adds lastY to doc
    yPos = doc.lastAutoTable.lastY + 10;
  }
  
  // Vital Signs (latest)
  if (patient.vitalSigns && patient.vitalSigns.length > 0) {
    const latestVitals = patient.vitalSigns[patient.vitalSigns.length - 1];
    
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text('Latest Vital Signs', 15, yPos);
    yPos += 2;
    doc.setDrawColor(...COLORS.primary);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    
    const vitalSignsData = [
      ['Blood Pressure', latestVitals.bloodPressure || 'N/A'],
      ['Heart Rate', `${latestVitals.heartRate || 'N/A'} bpm`],
      ['Temperature', `${latestVitals.temperature || 'N/A'} °F`],
      ['Respiratory Rate', `${latestVitals.respiratoryRate || 'N/A'} /min`],
      ['Oxygen Saturation', `${latestVitals.oxygenSaturation || 'N/A'}%`],
      ['Weight', `${latestVitals.weight || 'N/A'} kg`],
      ['BMI', latestVitals.bmi?.toString() || 'N/A'],
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [['Measurement', 'Value']],
      body: vitalSignsData,
      theme: 'grid',
      headStyles: { fillColor: [41, 98, 255], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 60 },
      },
      margin: { left: 15 },
    });
    
    // @ts-expect-error - autoTable adds lastY to doc
    yPos = doc.lastAutoTable.lastY + 5;
    
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.lightText);
    doc.text(`Recorded on: ${formatDate(latestVitals.recordedAt)} by ${latestVitals.recordedBy}`, 15, yPos);
  }
  
  // Add footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  return doc;
};

// Generate Invoice Report PDF
export const generateInvoiceReport = (invoice: Invoice): jsPDF => {
  const doc = new jsPDF();
  let yPos = addHospitalHeader(doc, 'INVOICE / RECEIPT');
  
  const _pageWidth = doc.internal.pageSize.getWidth();
  
  // Invoice details
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.lightText);
  doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 15, yPos);
  doc.text(`Date: ${formatDate(invoice.date)}`, pageWidth - 15, yPos, { align: 'right' });
  yPos += 10;
  
  // Patient Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('Bill To:', 15, yPos);
  yPos += 2;
  doc.setDrawColor(...COLORS.primary);
  doc.line(15, yPos, 50, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'normal');
  doc.text(`Patient Name: ${invoice.patientName}`, 15, yPos);
  yPos += 6;
  doc.text(`MRN: ${invoice.patientMRN}`, 15, yPos);
  yPos += 6;
  doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, 15, yPos);
  yPos += 15;
  
  // Invoice Items Table
  const itemsData = invoice.items.map((item, index) => [
    (index + 1).toString(),
    item.description,
    item.code,
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    formatCurrency(item.discount),
    formatCurrency(item.total),
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['#', 'Description', 'Code', 'Qty', 'Unit Price', 'Discount', 'Total']],
    body: itemsData,
    theme: 'striped',
    headStyles: { fillColor: [41, 98, 255], fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 50 },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 25, halign: 'right' },
      6: { cellWidth: 30, halign: 'right' },
    },
    margin: { left: 15, right: 15 },
  });
  
  // @ts-expect-error - autoTable adds lastY to doc
  yPos = doc.lastAutoTable.lastY + 10;
  
  // Totals section
  const totalsX = pageWidth - 80;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  doc.text('Subtotal:', totalsX, yPos);
  doc.text(formatCurrency(invoice.subtotal), pageWidth - 15, yPos, { align: 'right' });
  yPos += 7;
  
  if (invoice.discount > 0) {
    doc.setTextColor(...COLORS.accent);
    doc.text('Discount:', totalsX, yPos);
    doc.text(`-${formatCurrency(invoice.discount)}`, pageWidth - 15, yPos, { align: 'right' });
    yPos += 7;
  }
  
  doc.setTextColor(...COLORS.text);
  doc.text('Tax:', totalsX, yPos);
  doc.text(formatCurrency(invoice.tax), pageWidth - 15, yPos, { align: 'right' });
  yPos += 7;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setDrawColor(...COLORS.primary);
  doc.line(totalsX, yPos, pageWidth - 15, yPos);
  yPos += 7;
  
  doc.text('Total:', totalsX, yPos);
  doc.text(formatCurrency(invoice.total), pageWidth - 15, yPos, { align: 'right' });
  yPos += 10;
  
  // Payment status
  doc.setFontSize(10);
  if (invoice.status === 'Paid') {
    doc.setTextColor(...COLORS.accent);
    doc.text('STATUS: PAID', totalsX, yPos);
  } else if (invoice.paidAmount > 0) {
    doc.setTextColor(...COLORS.warning);
    doc.text(`Paid: ${formatCurrency(invoice.paidAmount)}`, totalsX, yPos);
    yPos += 6;
    doc.text(`Balance: ${formatCurrency(invoice.balance)}`, totalsX, yPos);
  } else {
    doc.setTextColor(...COLORS.danger);
    doc.text(`Balance Due: ${formatCurrency(invoice.balance)}`, totalsX, yPos);
  }
  
  yPos += 15;
  doc.setTextColor(...COLORS.text);
  
  // Payment History
  if (invoice.payments && invoice.payments.length > 0) {
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text('Payment History', 15, yPos);
    yPos += 2;
    doc.setDrawColor(...COLORS.primary);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 5;
    
    const paymentsData = invoice.payments.map(payment => [
      formatDateShort(payment.paidAt),
      formatCurrency(payment.amount),
      payment.method,
      payment.reference || '-',
      payment.receivedBy,
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Amount', 'Method', 'Reference', 'Received By']],
      body: paymentsData,
      theme: 'striped',
      headStyles: { fillColor: [41, 98, 255], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 15, right: 15 },
    });
  }
  
  // Notes
  if (invoice.notes) {
    // @ts-expect-error - autoTable adds lastY to doc
    yPos = (doc.lastAutoTable?.lastY || yPos) + 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text('Notes:', 15, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.notes, 15, yPos);
  }
  
  // Add footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  return doc;
};

// Generate Lab Report PDF
export const generateLabReport = (labOrder: LabOrder): jsPDF => {
  const doc = new jsPDF();
  let yPos = addHospitalHeader(doc, 'LABORATORY REPORT');
  
  const _pageWidth = doc.internal.pageSize.getWidth();
  
  // Report info
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.lightText);
  doc.text(`Order Number: ${labOrder.orderNumber}`, 15, yPos);
  doc.text(`Report Date: ${formatDate(new Date())}`, pageWidth - 15, yPos, { align: 'right' });
  yPos += 10;
  
  // Patient Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('Patient Information', 15, yPos);
  yPos += 2;
  doc.setDrawColor(...COLORS.primary);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'normal');
  
  doc.text(`Patient Name: ${labOrder.patientName}`, 15, yPos);
  doc.text(`Order Date: ${formatDateShort(labOrder.orderedAt)}`, pageWidth - 15, yPos, { align: 'right' });
  yPos += 6;
  doc.text(`Ordering Physician: ${labOrder.doctorName}`, 15, yPos);
  doc.text(`Priority: ${labOrder.priority}`, pageWidth - 15, yPos, { align: 'right' });
  yPos += 6;
  doc.text(`Status: ${labOrder.status}`, 15, yPos);
  yPos += 12;
  
  if (labOrder.diagnosis) {
    doc.setFont('helvetica', 'bold');
    doc.text('Clinical Diagnosis:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(labOrder.diagnosis, 60, yPos);
    yPos += 10;
  }
  
  // Test Results Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('Test Results', 15, yPos);
  yPos += 2;
  doc.setDrawColor(...COLORS.primary);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 5;
  
  const testResultsData = labOrder.tests.map(test => {
    let resultDisplay = test.result || test.numericResult?.toString() || 'Pending';
    if (test.unit && test.numericResult) {
      resultDisplay = `${test.numericResult} ${test.unit}`;
    }
    
    let flag = '';
    if (test.isCritical) {
      flag = 'CRITICAL';
    } else if (test.isAbnormal) {
      flag = 'Abnormal';
    }
    
    return [
      test.testName,
      resultDisplay,
      test.referenceRange || '-',
      test.status,
      flag,
    ];
  });
  
  autoTable(doc, {
    startY: yPos,
    head: [['Test Name', 'Result', 'Reference Range', 'Status', 'Flag']],
    body: testResultsData,
    theme: 'striped',
    headStyles: { fillColor: [41, 98, 255], fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 35 },
      2: { cellWidth: 40 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25 },
    },
    didParseCell: function(data) {
      if (data.column.index === 4 && data.cell.text[0] === 'CRITICAL') {
        data.cell.styles.textColor = [239, 68, 68];
        data.cell.styles.fontStyle = 'bold';
      } else if (data.column.index === 4 && data.cell.text[0] === 'Abnormal') {
        data.cell.styles.textColor = [245, 158, 11];
      }
    },
    margin: { left: 15, right: 15 },
  });
  
  // @ts-expect-error - autoTable adds lastY to doc
  yPos = doc.lastAutoTable.lastY + 15;
  
  // Timestamps
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.lightText);
  
  if (labOrder.collectedAt) {
    doc.text(`Sample Collected: ${formatDate(labOrder.collectedAt)}`, 15, yPos);
    if (labOrder.collectedBy) {
      doc.text(`by ${labOrder.collectedBy}`, 70, yPos);
    }
    yPos += 5;
  }
  
  if (labOrder.completedAt) {
    doc.text(`Completed: ${formatDate(labOrder.completedAt)}`, 15, yPos);
    yPos += 5;
  }
  
  if (labOrder.notes) {
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text('Notes:', 15, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.lightText);
    doc.text(labOrder.notes, 15, yPos);
  }
  
  // Disclaimer
  yPos = 260;
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.lightText);
  doc.text('This report is computer generated and valid only with authorized signature.', 15, yPos);
  doc.text('Please correlate clinically. For any queries, contact the laboratory.', 15, yPos + 4);
  
  // Add footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  return doc;
};

// Generate Dashboard Report PDF
export const generateDashboardReport = (stats: DashboardStats, departments?: Department[], medications?: Medication[]): jsPDF => {
  const doc = new jsPDF();
  let yPos = addHospitalHeader(doc, 'HOSPITAL OVERVIEW REPORT');
  
  const _pageWidth = doc.internal.pageSize.getWidth();
  
  // Report period
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.lightText);
  doc.text(`Report Generated: ${new Date().toLocaleString()}`, 15, yPos);
  yPos += 12;
  
  // Key Statistics Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('Key Statistics', 15, yPos);
  yPos += 2;
  doc.setDrawColor(...COLORS.primary);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 8;
  
  // Stats cards - 4 columns
  const statsCards = [
    { label: 'Total Patients', value: stats.totalPatients, color: COLORS.primary },
    { label: 'Inpatients', value: stats.inpatients, color: COLORS.secondary },
    { label: 'Outpatients', value: stats.outpatients, color: COLORS.accent },
    { label: 'Critical', value: stats.criticalPatients, color: COLORS.danger },
    { label: 'Today\'s Appointments', value: stats.todayAppointments, color: COLORS.primary },
    { label: 'Available Doctors', value: stats.availableDoctors, color: COLORS.accent },
    { label: 'On Duty Nurses', value: stats.onDutyNurses, color: COLORS.secondary },
    { label: 'Emergency Cases', value: stats.emergencyCases, color: COLORS.danger },
  ];
  
  const cardWidth = (pageWidth - 50) / 4;
  const cardHeight = 20;
  let cardX = 15;
  let cardY = yPos;
  
  statsCards.forEach((card, index) => {
    if (index > 0 && index % 4 === 0) {
      cardX = 15;
      cardY += cardHeight + 5;
    }
    
    // Card background
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 2, 2, 'F');
    
    // Left border accent
    doc.setFillColor(...card.color);
    doc.rect(cardX, cardY, 3, cardHeight, 'F');
    
    // Label
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.lightText);
    doc.setFont('helvetica', 'normal');
    doc.text(card.label, cardX + 5, cardY + 7);
    
    // Value
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.text(card.value.toString(), cardX + 5, cardY + 15);
    
    cardX += cardWidth + 5;
  });
  
  yPos = cardY + cardHeight + 15;
  
  // Bed Occupancy Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('Bed Occupancy', 15, yPos);
  yPos += 2;
  doc.setDrawColor(...COLORS.primary);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 8;
  
  // Occupancy stats
  const occupancyData = [
    ['Total Beds', stats.totalBeds.toString()],
    ['Occupied', stats.occupiedBeds.toString()],
    ['Available', stats.availableBeds.toString()],
    ['Occupancy Rate', `${stats.bedOccupancy}%`],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value']],
    body: occupancyData,
    theme: 'grid',
    headStyles: { fillColor: [41, 98, 255], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 40, halign: 'center' },
    },
    margin: { left: 15 },
  });
  
  // @ts-expect-error - autoTable adds lastY to doc
  yPos = doc.lastAutoTable.lastY + 12;
  
  // Financial Overview
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('Financial Overview', 15, yPos);
  yPos += 2;
  doc.setDrawColor(...COLORS.primary);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 8;
  
  const financialData = [
    ['Total Revenue', formatCurrency(stats.totalRevenue)],
    ['Outstanding Amount', formatCurrency(stats.outstandingAmount)],
    ['Pending Invoices', stats.pendingInvoices.toString()],
    ['Pending Prescriptions', stats.pendingPrescriptions.toString()],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Category', 'Amount/Count']],
    body: financialData,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 50, halign: 'right' },
    },
    margin: { left: 15 },
  });
  
  // @ts-expect-error - autoTable adds lastY to doc
  yPos = doc.lastAutoTable.lastY + 12;
  
  // Department Occupancy
  if (departments && departments.length > 0) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text('Department Occupancy', 15, yPos);
    yPos += 2;
    doc.setDrawColor(...COLORS.primary);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 5;
    
    const deptData = departments.map(dept => [
      dept.name,
      dept.beds.toString(),
      dept.occupiedBeds.toString(),
      `${Math.round((dept.occupiedBeds / dept.beds) * 100)}%`,
      dept.head,
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Department', 'Beds', 'Occupied', 'Rate', 'Head']],
      body: deptData,
      theme: 'striped',
      headStyles: { fillColor: [41, 98, 255], fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      margin: { left: 15, right: 15 },
    });
    
    // @ts-expect-error - autoTable adds lastY to doc
    yPos = doc.lastAutoTable.lastY + 10;
  }
  
  // Low Stock Medications
  if (medications && medications.length > 0) {
    const lowStockMeds = medications.filter(m => m.stock < m.reorderLevel);
    
    if (lowStockMeds.length > 0) {
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.danger);
      doc.text('Low Stock Medications', 15, yPos);
      yPos += 2;
      doc.setDrawColor(...COLORS.danger);
      doc.line(15, yPos, pageWidth - 15, yPos);
      yPos += 5;
      
      const medData = lowStockMeds.slice(0, 10).map(med => [
        med.name,
        med.category,
        med.stock.toString(),
        med.reorderLevel.toString(),
        med.status,
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Medication', 'Category', 'Stock', 'Reorder Level', 'Status']],
        body: medData,
        theme: 'striped',
        headStyles: { fillColor: [239, 68, 68], fontSize: 8 },
        bodyStyles: { fontSize: 7 },
        margin: { left: 15, right: 15 },
      });
    }
  }
  
  // Add footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  return doc;
};

// Generate Patient Census Report
export const generatePatientCensusReport = (patients: Patient[], dateRange?: { start: Date; end: Date }): jsPDF => {
  const doc = new jsPDF('landscape');
  let yPos = addHospitalHeader(doc, 'PATIENT CENSUS REPORT');
  
  const _pageWidth = doc.internal.pageSize.getWidth();
  
  // Date range
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.lightText);
  if (dateRange) {
    doc.text(`Period: ${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`, 15, yPos);
  } else {
    doc.text(`Generated: ${new Date().toLocaleString()}`, 15, yPos);
  }
  doc.text(`Total Patients: ${patients.length}`, pageWidth - 15, yPos, { align: 'right' });
  yPos += 10;
  
  // Summary stats
  const statusCounts = patients.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const genderCounts = patients.reduce((acc, p) => {
    acc[p.gender] = (acc[p.gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'normal');
  
  let summaryX = 15;
  Object.entries(statusCounts).forEach(([status, count]) => {
    doc.text(`${status}: ${count}`, summaryX, yPos);
    summaryX += 50;
  });
  yPos += 8;
  
  summaryX = 15;
  Object.entries(genderCounts).forEach(([gender, count]) => {
    doc.text(`${gender}: ${count}`, summaryX, yPos);
    summaryX += 50;
  });
  yPos += 10;
  
  // Patient table
  const patientData = patients.map(p => [
    p.mrn,
    p.name,
    p.gender,
    p.age.toString(),
    p.ward,
    p.roomNumber || '-',
    p.status,
    p.primaryDiagnosis.substring(0, 30),
    p.attendingDoctorName,
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['MRN', 'Name', 'Gender', 'Age', 'Ward', 'Room', 'Status', 'Diagnosis', 'Attending Doctor']],
    body: patientData,
    theme: 'striped',
    headStyles: { fillColor: [41, 98, 255], fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    margin: { left: 10, right: 10 },
    styles: { cellPadding: 2 },
  });
  
  // Add footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  return doc;
};

// Generate Revenue Report
export const generateRevenueReport = (invoices: Invoice[], dateRange?: { start: Date; end: Date }): jsPDF => {
  const doc = new jsPDF('landscape');
  let yPos = addHospitalHeader(doc, 'REVENUE REPORT');
  
  const _pageWidth = doc.internal.pageSize.getWidth();
  
  // Date range
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.lightText);
  if (dateRange) {
    doc.text(`Period: ${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`, 15, yPos);
  } else {
    doc.text(`Generated: ${new Date().toLocaleString()}`, 15, yPos);
  }
  yPos += 10;
  
  // Summary
  const totalRevenue = invoices.reduce((sum, i) => sum + i.total, 0);
  const totalPaid = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalOutstanding = invoices.reduce((sum, i) => sum + i.balance, 0);
  const paidCount = invoices.filter(i => i.status === 'Paid').length;
  const pendingCount = invoices.filter(i => i.status === 'Pending').length;
  const _overdueCount = invoices.filter(i => i.status === 'Overdue').length;
  
  // Summary boxes
  const boxWidth = 55;
  const boxHeight = 25;
  let boxX = 15;
  
  const summaryBoxes = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), color: COLORS.primary },
    { label: 'Collected', value: formatCurrency(totalPaid), color: COLORS.accent },
    { label: 'Outstanding', value: formatCurrency(totalOutstanding), color: COLORS.danger },
    { label: 'Paid Invoices', value: paidCount.toString(), color: COLORS.accent },
    { label: 'Pending', value: pendingCount.toString(), color: COLORS.warning },
  ];
  
  summaryBoxes.forEach(box => {
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(boxX, yPos, boxWidth, boxHeight, 2, 2, 'F');
    doc.setFillColor(...box.color);
    doc.rect(boxX, yPos, 3, boxHeight, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.lightText);
    doc.setFont('helvetica', 'normal');
    doc.text(box.label, boxX + 6, yPos + 9);
    
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.text(box.value, boxX + 6, yPos + 18);
    
    boxX += boxWidth + 5;
  });
  
  yPos += boxHeight + 15;
  
  // Invoice table
  const invoiceData = invoices.map(i => [
    i.invoiceNumber,
    i.patientName,
    i.patientMRN,
    formatDateShort(i.date),
    formatCurrency(i.total),
    formatCurrency(i.paidAmount),
    formatCurrency(i.balance),
    i.status,
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Invoice #', 'Patient', 'MRN', 'Date', 'Total', 'Paid', 'Balance', 'Status']],
    body: invoiceData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129], fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    margin: { left: 10, right: 10 },
    didParseCell: function(data) {
      if (data.column.index === 7) {
        if (data.cell.text[0] === 'Paid') {
          data.cell.styles.textColor = [16, 185, 129];
        } else if (data.cell.text[0] === 'Overdue') {
          data.cell.styles.textColor = [239, 68, 68];
        } else if (data.cell.text[0] === 'Pending') {
          data.cell.styles.textColor = [245, 158, 11];
        }
      }
    },
  });
  
  // Add footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  return doc;
};

// Generate Lab Statistics Report
export const generateLabStatisticsReport = (labOrders: LabOrder[], dateRange?: { start: Date; end: Date }): jsPDF => {
  const doc = new jsPDF();
  let yPos = addHospitalHeader(doc, 'LABORATORY STATISTICS REPORT');
  
  const _pageWidth = doc.internal.pageSize.getWidth();
  
  // Date range
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.lightText);
  if (dateRange) {
    doc.text(`Period: ${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`, 15, yPos);
  } else {
    doc.text(`Generated: ${new Date().toLocaleString()}`, 15, yPos);
  }
  yPos += 10;
  
  // Summary
  const completed = labOrders.filter(l => l.status === 'Completed').length;
  const pending = labOrders.filter(l => l.status === 'Pending' || l.status === 'In Progress').length;
  const statOrders = labOrders.filter(l => l.priority === 'STAT').length;
  const criticalResults = labOrders.filter(l => l.tests.some(t => t.isCritical)).length;
  
  const summaryData = [
    ['Total Orders', labOrders.length.toString()],
    ['Completed', completed.toString()],
    ['Pending/In Progress', pending.toString()],
    ['STAT Orders', statOrders.toString()],
    ['Critical Results', criticalResults.toString()],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Count']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [41, 98, 255], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 40, halign: 'center' },
    },
    margin: { left: 15 },
  });
  
  // @ts-expect-error - autoTable adds lastY to doc
  yPos = doc.lastAutoTable.lastY + 12;
  
  // Test type breakdown
  const testTypeCounts: Record<string, number> = {};
  labOrders.forEach(order => {
    order.tests.forEach(test => {
      testTypeCounts[test.testName] = (testTypeCounts[test.testName] || 0) + 1;
    });
  });
  
  const testBreakdown = Object.entries(testTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name, count]) => [name, count.toString()]);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('Test Volume by Type', 15, yPos);
  yPos += 2;
  doc.setDrawColor(...COLORS.primary);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 5;
  
  autoTable(doc, {
    startY: yPos,
    head: [['Test Name', 'Count']],
    body: testBreakdown,
    theme: 'striped',
    headStyles: { fillColor: [41, 98, 255], fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 15, right: 15 },
  });
  
  // @ts-expect-error - autoTable adds lastY to doc
  yPos = doc.lastAutoTable.lastY + 12;
  
  // Recent orders
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('Recent Lab Orders', 15, yPos);
  yPos += 2;
  doc.setDrawColor(...COLORS.primary);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 5;
  
  const recentOrders = labOrders.slice(0, 10).map(order => [
    order.orderNumber,
    order.patientName,
    order.tests.map(t => t.testName).slice(0, 2).join(', ') + (order.tests.length > 2 ? '...' : ''),
    order.priority,
    order.status,
    formatDateShort(order.orderedAt),
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Order #', 'Patient', 'Tests', 'Priority', 'Status', 'Date']],
    body: recentOrders,
    theme: 'striped',
    headStyles: { fillColor: [41, 98, 255], fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    margin: { left: 15, right: 15 },
  });
  
  // Add footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  return doc;
};

// Generate Occupancy Report
export const generateOccupancyReport = (departments: Department[]): jsPDF => {
  const doc = new jsPDF();
  let yPos = addHospitalHeader(doc, 'BED OCCUPANCY REPORT');
  
  const _pageWidth = doc.internal.pageSize.getWidth();
  
  // Generated timestamp
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.lightText);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 15, yPos);
  yPos += 10;
  
  // Overall summary
  const totalBeds = departments.reduce((sum, d) => sum + d.beds, 0);
  const totalOccupied = departments.reduce((sum, d) => sum + d.occupiedBeds, 0);
  const overallOccupancy = Math.round((totalOccupied / totalBeds) * 100);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('Overall Summary', 15, yPos);
  yPos += 2;
  doc.setDrawColor(...COLORS.primary);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 8;
  
  const summaryData = [
    ['Total Beds', totalBeds.toString()],
    ['Occupied Beds', totalOccupied.toString()],
    ['Available Beds', (totalBeds - totalOccupied).toString()],
    ['Overall Occupancy', `${overallOccupancy}%`],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [41, 98, 255], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 40, halign: 'center' },
    },
    margin: { left: 15 },
  });
  
  // @ts-expect-error - autoTable adds lastY to doc
  yPos = doc.lastAutoTable.lastY + 12;
  
  // Department breakdown
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('Department Breakdown', 15, yPos);
  yPos += 2;
  doc.setDrawColor(...COLORS.primary);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 5;
  
  const deptData = departments.map(d => {
    const occupancy = Math.round((d.occupiedBeds / d.beds) * 100);
    return [
      d.name,
      d.beds.toString(),
      d.occupiedBeds.toString(),
      (d.beds - d.occupiedBeds).toString(),
      `${occupancy}%`,
      d.head,
      d.status,
    ];
  });
  
  autoTable(doc, {
    startY: yPos,
    head: [['Department', 'Total', 'Occupied', 'Available', 'Rate', 'Head', 'Status']],
    body: deptData,
    theme: 'striped',
    headStyles: { fillColor: [41, 98, 255], fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    didParseCell: function(data) {
      if (data.column.index === 4) {
        const rate = parseInt(data.cell.text[0]);
        if (rate >= 90) {
          data.cell.styles.textColor = [239, 68, 68];
        } else if (rate >= 75) {
          data.cell.styles.textColor = [245, 158, 11];
        } else {
          data.cell.styles.textColor = [16, 185, 129];
        }
      }
      if (data.column.index === 6) {
        if (data.cell.text[0] === 'Full') {
          data.cell.styles.textColor = [239, 68, 68];
        } else if (data.cell.text[0] === 'Operational') {
          data.cell.styles.textColor = [16, 185, 129];
        }
      }
    },
    margin: { left: 15, right: 15 },
  });
  
  // Add footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  return doc;
};

// Helper function to download PDF
export const downloadPDF = (doc: jsPDF, filename: string) => {
  doc.save(filename);
};

// Helper function to open PDF in new window for preview
export const previewPDF = (doc: jsPDF) => {
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
};
