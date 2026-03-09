import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
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
    const store = getStore();
    
    switch (reportType) {
      case 'patient-census': {
        let patients = store.patients;
        
        // Apply date filter
        patients = filterByDateRange(patients, dateRange, 'admittedDate');
        
        // Apply department filter if provided
        if (departmentId) {
          const dept = store.departments.find(d => d.id === departmentId);
          if (dept) {
            patients = patients.filter(p => p.ward === dept.name);
          }
        }
        
        return NextResponse.json(patients);
      }
      
      case 'revenue': {
        let invoices = store.invoices;
        invoices = filterByDateRange(invoices, dateRange, 'date');
        return NextResponse.json(invoices);
      }
      
      case 'lab-statistics': {
        let labOrders = store.labOrders;
        labOrders = filterByDateRange(labOrders, dateRange, 'orderedAt');
        return NextResponse.json(labOrders);
      }
      
      case 'occupancy': {
        let departments = store.departments;
        
        // Filter by department if provided
        if (departmentId) {
          departments = departments.filter(d => d.id === departmentId);
        }
        
        return NextResponse.json(departments);
      }
      
      case 'dashboard': {
        const stats: DashboardStats = {
          totalPatients: store.patients.length,
          inpatients: store.patients.filter(p => p.status !== 'Outpatient' && p.status !== 'Discharged').length,
          outpatients: store.patients.filter(p => p.status === 'Outpatient').length,
          criticalPatients: store.patients.filter(p => p.status === 'Critical').length,
          todayAppointments: store.appointments.filter(a => {
            const today = new Date().toDateString();
            return new Date(a.date).toDateString() === today;
          }).length,
          completedAppointments: store.appointments.filter(a => a.status === 'Completed').length,
          cancelledAppointments: store.appointments.filter(a => a.status === 'Cancelled').length,
          availableDoctors: store.doctors.filter(d => d.status === 'Available').length,
          onDutyNurses: store.nurses.filter(n => n.status === 'Available' || n.status === 'On Call').length,
          pendingLabResults: store.labOrders.filter(l => l.status !== 'Completed' && l.status !== 'Cancelled').length,
          emergencyCases: store.emergencyCases.filter(e => e.status === 'Incoming' || e.status === 'In Treatment').length,
          activeEmergencies: store.emergencyCases.filter(e => e.status === 'In Treatment').length,
          bedOccupancy: Math.round(
            (store.departments.reduce((sum, d) => sum + d.occupiedBeds, 0) /
              store.departments.reduce((sum, d) => sum + d.beds, 0)) * 100
          ),
          totalBeds: store.departments.reduce((sum, d) => sum + d.beds, 0),
          occupiedBeds: store.departments.reduce((sum, d) => sum + d.occupiedBeds, 0),
          availableBeds: store.departments.reduce((sum, d) => sum + d.beds - d.occupiedBeds, 0),
          pendingInvoices: store.invoices.filter(i => i.status === 'Pending' || i.status === 'Overdue').length,
          totalRevenue: store.invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total, 0),
          outstandingAmount: store.invoices.filter(i => i.status !== 'Paid' && i.status !== 'Cancelled')
            .reduce((sum, i) => sum + i.balance, 0),
          pendingPrescriptions: store.prescriptions.filter(p => p.status === 'Pending').length,
          lowStockMedications: store.medications.filter(m => m.stock < m.reorderLevel).length,
          scheduledSurgeries: store.surgeries?.filter(s => s.status === 'Scheduled').length || 0,
          pendingTasks: store.tasks.filter(t => t.status === 'To Do' || t.status === 'In Progress').length,
          occupancyByDepartment: store.departments.map(d => ({
            name: d.name,
            occupancy: Math.round((d.occupiedBeds / d.beds) * 100),
          })),
          patientTrend: [],
          revenueTrend: [],
          appointmentStats: [],
        };
        
        return NextResponse.json({
          stats,
          departments: store.departments,
          medications: store.medications,
        });
      }
      
      case 'patient-detail': {
        const patientId = searchParams.get('patientId');
        if (!patientId) {
          return NextResponse.json({ error: 'Patient ID required' }, { status: 400 });
        }
        
        const patient = store.patients.find(p => p.id === patientId);
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
        
        const invoice = store.invoices.find(i => i.id === invoiceId);
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
        
        const labOrder = store.labOrders.find(l => l.id === labId);
        if (!labOrder) {
          return NextResponse.json({ error: 'Lab order not found' }, { status: 404 });
        }
        
        return NextResponse.json(labOrder);
      }
      
      default:
        // Return all report types and counts
        return NextResponse.json({
          reportTypes: [
            { id: 'patient-census', name: 'Patient Census', count: store.patients.length },
            { id: 'revenue', name: 'Revenue Report', count: store.invoices.length },
            { id: 'lab-statistics', name: 'Lab Statistics', count: store.labOrders.length },
            { id: 'occupancy', name: 'Bed Occupancy', count: store.departments.length },
            { id: 'dashboard', name: 'Dashboard Overview', count: 1 },
          ],
          departments: store.departments.map(d => ({ id: d.id, name: d.name })),
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
