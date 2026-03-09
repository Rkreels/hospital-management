import React from 'react';
import { motion } from 'framer-motion';

const results = [
  { id: 'L-001', patient: 'John Doe', test: 'CBC', date: '2023-10-20', status: 'Completed' },
  { id: 'L-002', patient: 'Maria Gomez', test: 'Urinalysis', date: '2023-10-21', status: 'Pending' },
  { id: 'L-003', patient: 'Lee Chen', test: 'X-Ray', date: '2023-10-22', status: 'Completed' },
];

export default function LabResults() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Lab Results</h1>
          <p className="text-muted-foreground mt-1">Laboratory test status and recent results.</p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg inline-flex w-fit">
          Recent: {results.length}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl shadow-soft overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/30 text-muted-foreground border-b border-border">
            <tr>
              <th className="px-6 py-3 font-medium">ID</th>
              <th className="px-6 py-3 font-medium">Patient</th>
              <th className="px-6 py-3 font-medium">Test</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {results.map(r => (
              <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">{r.id}</td>
                <td className="px-6 py-4">{r.patient}</td>
                <td className="px-6 py-4">{r.test}</td>
                <td className="px-6 py-4">{r.date}</td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-medium ${r.status === 'Completed' ? 'text-green-700' : 'text-amber-700'}`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}