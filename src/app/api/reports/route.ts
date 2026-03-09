import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { DashboardStats } from '@/types';

// Helper function to parse date range
function parseDateRange(start?: string, end?: string): { start: Date; end: Date } | undefined {
  if (!start || !end) return undefined;
  
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return undefined;
  
  return { start: startDate, end: endDate };
}

// Helper function to filter by date range
function filterByDateRange<T extends { date?: string; admittedDate?: string; orderedAt?: string; createdAt?: string }>(
  items: T[],
  dateRange?: { start: Date; end: Date },
  dateField?: keyof T
): T[] {
  if (!dateRange) return items;
  
  return items.filter(item => {
    const dateValue = dateField ? item[dateField] : (item.date || item.admittedDate || item.orderedAt || item.createdAt);
    if (!dateValue) return false;
    
    const itemDate = new Date(dateValue as string);
    return itemDate >= dateRange.start && itemDate <= dateRange.end;
  });
}

// GET handler for fetching report data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reportType = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const departmentId = searchParams.get('departmentId');
    
    const dateRange = parseDateRange(startDate || undefined, endDate || undefined);
    
    switch (reportType) {
      case 'patient-census': {
        let patients = db.getPatients();
        
        // Apply date filter
        patients = filterByDateRange(patients, dateRange, 'admittedDate');
        
        // Apply department filter if provided
        if (departmentId) {
          const dept = db.getDepartment(departmentId);
          if (dept) {
            patients = patients.filter(p => p.ward === dept.name);
          }
        }
        
        return NextResponse.json(patients);
      }
      
      case 'revenue': {
        let invoices = db.getInvoices();
        invoices = filterByDateRange(invoices, dateRange, 'date');
        return NextResponse.json(invoices);
      }
      
      case 'lab-statistics': {
        let labOrders = db.getLabOrders();
        labOrders = filterByDateRange(labOrders, dateRange, 'orderedAt');
        return NextResponse.json(labOrders);
      }
      
      case 'occupancy': {
        let departments = db.getDepartments();
        
        // Filter by department if provided
        if (departmentId) {
          departments = departments.filter(d => d.id === departmentId);
        }
        
        return NextResponse.json(departments);
      }
      
      case 'dashboard': {
        const patients = db.getPatients();
        const appointments = db.getAppointments();
        const doctors = db.getDoctors();
        const nurses = db.getNurses();
        const labOrders = db.getLabOrders();
        const emergencyCases = db.getEmergencyCases();
        const departments = db.getDepartments();
        const invoices = db.getInvoices();
        const prescriptions = db.getPrescriptions();
        const medications = db.getMedications();
        const surgeries = db.getSurgeries();
        const tasks = db.getTasks();
        
        const stats: DashboardStats = {
          totalPatients: patients.length,
          inpatients: patients.filter(p => p.status !== 'Outpatient' && p.status !== 'Discharged').length,
          outpatients: patients.filter(p => p.status === 'Outpatient').length,
          criticalPatients: patients.filter(p => p.status === 'Critical').length,
          todayAppointments: appointments.filter(a => {
            const today = new Date().toDateString();
            return new Date(a.date).toDateString() === today;
          }).length,
          completedAppointments: appointments.filter(a => a.status === 'Completed').length,
          cancelledAppointments: appointments.filter(a => a.status === 'Cancelled').length,
          availableDoctors: doctors.filter(d => d.status === 'Available').length,
          onDutyNurses: nurses.filter(n => n.status === 'Available' || n.status === 'On Call').length,
          pendingLabResults: labOrders.filter(l => l.status !== 'Completed' && l.status !== 'Cancelled').length,
          emergencyCases: emergencyCases.filter(e => e.status === 'Incoming' || e.status === 'In Treatment').length,
          activeEmergencies: emergencyCases.filter(e => e.status === 'In Treatment').length,
          bedOccupancy: Math.round(
            (departments.reduce((sum, d) => sum + d.occupiedBeds, 0) /
              departments.reduce((sum, d) => sum + d.beds, 0)) * 100
          ),
          totalBeds: departments.reduce((sum, d) => sum + d.beds, 0),
          occupiedBeds: departments.reduce((sum, d) => sum + d.occupiedBeds, 0),
          availableBeds: departments.reduce((sum, d) => sum + d.beds - d.occupiedBeds, 0),
          pendingInvoices: invoices.filter(i => i.status === 'Pending' || i.status === 'Overdue').length,
          totalRevenue: invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total, 0),
          outstandingAmount: invoices.filter(i => i.status !== 'Paid' && i.status !== 'Cancelled')
            .reduce((sum, i) => sum + i.balance, 0),
          pendingPrescriptions: prescriptions.filter(p => p.status === 'Pending').length,
          lowStockMedications: medications.filter(m => m.stock < m.reorderLevel).length,
          scheduledSurgeries: surgeries?.filter(s => s.status === 'Scheduled').length || 0,
          pendingTasks: tasks.filter(t => t.status === 'To Do' || t.status === 'In Progress').length,
          occupancyByDepartment: departments.map(d => ({
            name: d.name,
            occupancy: Math.round((d.occupiedBeds / d.beds) * 100),
          })),
          patientTrend: [],
          revenueTrend: [],
          appointmentStats: [],
        };
        
        return NextResponse.json({
          stats,
          departments,
          medications,
        });
      }
      
      case 'patient-detail': {
        const patientId = searchParams.get('patientId');
        if (!patientId) {
          return NextResponse.json({ error: 'Patient ID required' }, { status: 400 });
        }
        
        const patient = db.getPatient(patientId);
        if (!patient) {
          return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }
        
        return NextResponse.json(patient);
      }
      
      case 'invoice-detail': {
        const invoiceId = searchParams.get('invoiceId');
        if (!invoiceId) {
          return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 });
        }
        
        const invoice = db.getInvoice(invoiceId);
        if (!invoice) {
          return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }
        
        return NextResponse.json(invoice);
      }
      
      case 'lab-detail': {
        const labId = searchParams.get('labId');
        if (!labId) {
          return NextResponse.json({ error: 'Lab Order ID required' }, { status: 400 });
        }
        
        const labOrder = db.getLabOrder(labId);
        if (!labOrder) {
          return NextResponse.json({ error: 'Lab order not found' }, { status: 404 });
        }
        
        return NextResponse.json(labOrder);
      }
      
      default:
        // Return all report types and counts
        return NextResponse.json({
          reportTypes: [
            { id: 'patient-census', name: 'Patient Census', count: db.getPatients().length },
            { id: 'revenue', name: 'Revenue Report', count: db.getInvoices().length },
            { id: 'lab-statistics', name: 'Lab Statistics', count: db.getLabOrders().length },
            { id: 'occupancy', name: 'Bed Occupancy', count: db.getDepartments().length },
            { id: 'dashboard', name: 'Dashboard Overview', count: 1 },
          ],
          departments: db.getDepartments().map(d => ({ id: d.id, name: d.name })),
        });
    }
  } catch (error) {
    console.error('Report API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
