import React from 'react';
import { motion } from 'framer-motion';

const triage = [
  { id: 'E-1', case: 'Chest pain', eta: '5 min', level: 'Critical' },
  { id: 'E-2', case: 'Broken arm', eta: '15 min', level: 'Serious' },
  { id: 'E-3', case: 'Minor cut', eta: '30 min', level: 'Minor' },
];

export default function Emergency() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Emergency Triage</h1>
          <p className="text-muted-foreground mt-1">Active emergency cases and triage ETA.</p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg inline-flex w-fit">
          Active: {triage.length}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl shadow-soft p-4">
        <div className="space-y-3">
          {triage.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
              <div>
                <div className="font-medium text-foreground">{t.case}</div>
                <div className="text-sm text-muted-foreground">{t.id} • ETA: {t.eta}</div>
              </div>
              <div className={`text-sm font-medium ${t.level === 'Critical' ? 'text-destructive' : t.level === 'Serious' ? 'text-amber-700' : 'text-green-700'}`}>{t.level}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}