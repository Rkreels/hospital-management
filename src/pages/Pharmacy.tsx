import React from 'react';
import { motion } from 'framer-motion';

const meds = [
  { id: 'M-001', name: 'Amoxicillin', stock: 120, unit: 'capsules' },
  { id: 'M-002', name: 'Paracetamol', stock: 300, unit: 'tablets' },
  { id: 'M-003', name: 'Insulin', stock: 34, unit: 'vials' },
  { id: 'M-004', name: 'Lisinopril', stock: 80, unit: 'tablets' },
];

export default function Pharmacy() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Pharmacy</h1>
          <p className="text-muted-foreground mt-1">Medication inventory and quick lookup.</p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg inline-flex w-fit">
          Low stock: {meds.filter(m => m.stock < 50).length}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl shadow-soft overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/30 text-muted-foreground border-b border-border">
            <tr>
              <th className="px-6 py-3 font-medium">Code</th>
              <th className="px-6 py-3 font-medium">Medication</th>
              <th className="px-6 py-3 font-medium">Stock</th>
              <th className="px-6 py-3 font-medium">Unit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {meds.map(m => (
              <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">{m.id}</td>
                <td className="px-6 py-4">{m.name}</td>
                <td className={`px-6 py-4 font-medium ${m.stock < 50 ? 'text-destructive' : 'text-foreground'}`}>{m.stock}</td>
                <td className="px-6 py-4">{m.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}