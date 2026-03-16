const fs = require('fs');
const path = require('path');

const conversions = [
  { from: 'page', to: 'Dashboard' },
  { from: 'patients', to: 'Patients' },
  { from: 'doctors', to: 'Doctors' },
  { from: 'nurses', to: 'Nurses' },
  { from: 'appointments', to: 'Appointments' },
  { from: 'departments', to: 'Departments' },
  { from: 'pharmacy', to: 'Pharmacy' },
  { from: 'prescriptions', to: 'Prescriptions' },
  { from: 'lab-results', to: 'LabResults' },
  { from: 'billing', to: 'Billing' },
  { from: 'admissions', to: 'Admissions' },
  { from: 'emergency', to: 'Emergency' },
  { from: 'tasks', to: 'Tasks' },
  { from: 'calendar', to: 'Calendar' },
  { from: 'documents', to: 'Documents' },
  { from: 'inventory', to: 'Inventory' },
  { from: 'surgeries', to: 'Surgeries' },
  { from: 'reports', to: 'Reports' },
  { from: 'settings', to: 'Settings' },
  { from: 'operating-room', to: 'OperatingRoom' },
  { from: 'staff', to: 'Staff' }
];

const srcDir = 'C:/Users/Admin/Downloads/hospital-management/src/app';
const destDir = 'C:/Users/Admin/Downloads/hospital-management-vite/src/pages';

conversions.forEach(({ from, to }) => {
  const srcPath = from === 'page' ? path.join(srcDir, 'page.tsx') : path.join(srcDir, from, 'page.tsx');
  const destPath = path.join(destDir, to + '.tsx');
  
  if (fs.existsSync(srcPath)) {
    let content = fs.readFileSync(srcPath, 'utf8');
    
    // Replace next/link with react-router-dom
    content = content.replace(/import Link from "next\/link"/g, 'import { Link } from "react-router-dom"');
    content = content.replace(/import \{ Link \} from "next\/link"/g, 'import { Link } from "react-router-dom"');
    
    // Replace next/navigation with react-router-dom
    content = content.replace(/import \{ usePathname, useRouter, useParams, useSearchParams \} from "next\/navigation"/g, 'import { useNavigate, useLocation, useParams, useSearchParams } from "react-router-dom"');
    content = content.replace(/import \{ usePathname, useRouter \} from "next\/navigation"/g, 'import { useNavigate, useLocation } from "react-router-dom"');
    content = content.replace(/import \{ useRouter, useParams \} from "next\/navigation"/g, 'import { useNavigate, useParams } from "react-router-dom"');
    content = content.replace(/import \{ useRouter \} from "next\/navigation"/g, 'import { useNavigate } from "react-router-dom"');
    content = content.replace(/useRouter\(\)/g, 'useNavigate()');
    content = content.replace(/usePathname\(\)/g, 'useLocation().pathname');
    content = content.replace(/router\.push\(/g, 'navigate(');
    content = content.replace(/router\.replace\(/g, 'navigate(');
    content = content.replace(/const router = useRouter\(\)/g, 'const navigate = useNavigate()');
    
    // Add db import at the top if not present
    if (!content.includes("from '../lib/store'")) {
      content = content.replace(/(import .+ from ['"]react['"];)/, "$1\nimport { db } from '../lib/store';");
    }
    
    // Replace fetch patterns - comprehensive replacements
    content = content.replace(/const res = await fetch\(\"([^"]+)\"\);[\s\n]*const data = await res\.json\(\);/g, (match, apiPath) => {
      const entity = apiPath.replace('/api/', '').replace(/\?.*/, '');
      const singular = entity.replace(/s$/, '');
      const funcName = 'db.get' + singular.charAt(0).toUpperCase() + singular.slice(1).replace(/-([a-z])/g, g => g[1].toUpperCase());
      return 'const data = ' + funcName + '();';
    });
    
    content = content.replace(/const res = await fetch\('([^']+)'\);[\s\n]*const data = await res\.json\(\);/g, (match, apiPath) => {
      const entity = apiPath.replace('/api/', '').replace(/\?.*/, '');
      const singular = entity.replace(/s$/, '');
      const funcName = 'db.get' + singular.charAt(0).toUpperCase() + singular.slice(1).replace(/-([a-z])/g, g => g[1].toUpperCase());
      return 'const data = ' + funcName + '();';
    });
    
    // More specific replacements for common patterns
    const apiReplacements = [
      ['/api/dashboard', 'db.getDashboardStats()'],
      ['/api/activity', 'db.getActivityLog()'],
      ['/api/appointments', 'db.getAppointments()'],
      ['/api/patients', 'db.getPatients()'],
      ['/api/doctors', 'db.getDoctors()'],
      ['/api/nurses', 'db.getNurses()'],
      ['/api/departments', 'db.getDepartments()'],
      ['/api/pharmacy', 'db.getMedications()'],
      ['/api/medications', 'db.getMedications()'],
      ['/api/prescriptions', 'db.getPrescriptions()'],
      ['/api/lab-results', 'db.getLabResults()'],
      ['/api/lab-orders', 'db.getLabOrders()'],
      ['/api/billing', 'db.getInvoices()'],
      ['/api/invoices', 'db.getInvoices()'],
      ['/api/admissions', 'db.getAdmissions()'],
      ['/api/emergency', 'db.getEmergencyCases()'],
      ['/api/tasks', 'db.getTasks()'],
      ['/api/events', 'db.getEvents()'],
      ['/api/documents', 'db.getDocuments()'],
      ['/api/inventory', 'db.getInventory()'],
      ['/api/surgeries', 'db.getSurgeries()'],
      ['/api/theaters', 'db.getSurgeryTheaters()'],
      ['/api/notifications', 'db.getNotifications()'],
    ];
    
    apiReplacements.forEach(([api, dbCall]) => {
      const regex = new RegExp('const res = await fetch\\([^)]*' + api.replace('/', '\\/') + '[^)]*\\);[\\s\\n]*const data = await res\\.json\\(\\);', 'g');
      content = content.replace(regex, 'const data = ' + dbCall);
    });
    
    // Remove remaining .json() calls
    content = content.replace(/\.json\(\)/g, '');
    
    // Fix the @ imports
    content = content.replace(/@\/components/g, '../components');
    content = content.replace(/@\/types/g, '../types');
    content = content.replace(/@\/lib/g, '../lib');
    content = content.replace(/@\/hooks/g, '../hooks');
    content = content.replace(/@\/context/g, '../context');
    
    // Replace toast import
    content = content.replace(/import \{ toast \} from "sonner"/g, 'import { toast } from "react-toastify"');
    
    // Fix any remaining fetch patterns that may have broken
    content = content.replace(/const \s*=\s*\(/g, '// Error: ');
    
    fs.writeFileSync(destPath, content);
    console.log('Converted:', to);
  } else {
    console.log('Not found:', srcPath);
  }
});
console.log('Done!');
