import React from 'react';
import { motion } from 'framer-motion';

const queue = [
  { id: 'A-001', name: 'Newborn — Maria Gomez', priority: 'Normal' },
  { id: 'A-002', name: 'Trauma — Unnamed', priority: 'High' },
  { id: 'A-003', name: 'Elective — John Doe', priority: 'Low' },
];

export default function Admissions() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Admissions</h1>
          <p className="text-muted-foreground mt-1">Current admissions queue and bed assignment.</p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg inline-flex w-fit">
          Queue: {queue.length}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl shadow-soft p-4">
        <div className="space-y-3">
          {queue.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
              <div>
                <div className="font-medium text-foreground">{item.name}</div>
                <div className="text-sm text-muted-foreground">{item.id}</div>
              </div>
              <div className={`text-sm font-medium ${item.priority === 'High' ? 'text-destructive' : 'text-foreground'}`}>{item.priority}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}