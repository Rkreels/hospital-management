import React from 'react';
import { motion } from 'framer-motion';

const doctors = [
  { id: 'D-101', name: 'Dr. Sarah Smith', specialty: 'Cardiology', availability: 'Mon-Fri' },
  { id: 'D-102', name: 'Dr. Ravi Patel', specialty: 'Orthopedics', availability: 'Tue-Thu' },
  { id: 'D-103', name: 'Dr. Emily Lee', specialty: 'Ob/Gyn', availability: 'Mon-Wed-Fri' },
  { id: 'D-104', name: 'Dr. Omar Ahmed', specialty: 'Geriatrics', availability: 'By Appointment' },
];

export default function Doctors() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Doctors</h1>
          <p className="text-muted-foreground mt-1">Directory of on-site doctors and specialties.</p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg inline-flex w-fit">
          Total: {doctors.length}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {doctors.map((doc) => (
          <div key={doc.id} className="bg-card border border-border rounded-2xl p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">{doc.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{doc.specialty}</p>
              </div>
              <div className="text-xs text-muted-foreground">{doc.availability}</div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}