import React from 'react';
import { motion } from 'framer-motion';

const patients = [
  { id: 'P-001', name: 'John Doe', age: 45, ward: 'Cardiology', status: 'Stable' },
  { id: 'P-002', name: 'Maria Gomez', age: 32, ward: 'Maternity', status: 'Under Observation' },
  { id: 'P-003', name: 'Lee Chen', age: 67, ward: 'Geriatrics', status: 'Critical' },
  { id: 'P-004', name: 'Aisha Khan', age: 28, ward: 'Orthopedics', status: 'Recovering' },
];

export default function Patients() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground mt-1">List of current inpatients and status overview.</p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg inline-flex w-fit">
          Total: {patients.length}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl shadow-soft overflow-hidden"
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/30 text-muted-foreground border-b border-border">
            <tr>
              <th className="px-6 py-3 font-medium">Patient ID</th>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Age</th>
              <th className="px-6 py-3 font-medium">Ward</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {patients.map((p, i) => (
              <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">{p.id}</td>
                <td className="px-6 py-4">{p.name}</td>
                <td className="px-6 py-4">{p.age}</td>
                <td className="px-6 py-4"><span className="text-xs bg-muted px-2 py-1 rounded-md">{p.ward}</span></td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-medium ${
                    p.status === 'Critical' ? 'text-destructive' : p.status === 'Stable' ? 'text-green-700' : 'text-amber-700'
                  }`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}