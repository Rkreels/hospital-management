import React from 'react';
import { motion } from 'framer-motion';

const appointments = [
  { id: 1, patient: 'John Doe', doctor: 'Dr. Smith', time: 'Today 09:30', department: 'Cardiology' },
  { id: 2, patient: 'Aisha Khan', doctor: 'Dr. Patel', time: 'Today 11:00', department: 'Orthopedics' },
  { id: 3, patient: 'Maria Gomez', doctor: 'Dr. Lee', time: 'Tomorrow 10:00', department: 'Maternity' },
  { id: 4, patient: 'Lee Chen', doctor: 'Dr. Ahmed', time: 'Tomorrow 14:00', department: 'Geriatrics' },
];

export default function Appointments() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground mt-1">Upcoming patient appointments and schedules.</p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg inline-flex w-fit">
          Next: {appointments[0].time}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl shadow-soft p-4"
      >
        <div className="space-y-3">
          {appointments.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
              <div className="flex-1">
                <div className="font-medium text-foreground">{a.patient}</div>
                <div className="text-sm text-muted-foreground">{a.doctor} • {a.department}</div>
              </div>
              <div className="text-sm text-muted-foreground">{a.time}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}