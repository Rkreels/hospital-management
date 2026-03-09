import React from 'react';
import { motion } from 'framer-motion';

const departments = [
  { id: 1, name: 'Emergency', beds: 14 },
  { id: 2, name: 'Cardiology', beds: 28 },
  { id: 3, name: 'Orthopedics', beds: 22 },
  { id: 4, name: 'Maternity', beds: 18 },
  { id: 5, name: 'Radiology', beds: 8 },
];

export default function Departments() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Departments</h1>
          <p className="text-muted-foreground mt-1">Overview of hospital departments and capacity.</p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg inline-flex w-fit">
          Departments: {departments.length}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((d) => (
          <div key={d.id} className="bg-card border border-border rounded-2xl p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-foreground">{d.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">Beds: {d.beds}</p>
              </div>
              <div className="text-sm text-muted-foreground">Status: <span className="ml-1 font-medium text-green-700">Operational</span></div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}