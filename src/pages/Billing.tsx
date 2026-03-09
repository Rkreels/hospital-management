import React from 'react';
import { motion } from 'framer-motion';

const invoices = [
  { id: 'INV-1001', patient: 'John Doe', total: '$1,250.00', status: 'Pending' },
  { id: 'INV-1002', patient: 'Maria Gomez', total: '$420.00', status: 'Paid' },
  { id: 'INV-1003', patient: 'Lee Chen', total: '$3,200.00', status: 'Insurance' },
];

export default function Billing() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Billing</h1>
          <p className="text-muted-foreground mt-1">Invoices, payments, and outstanding balances.</p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg inline-flex w-fit">
          Outstanding: {invoices.filter(i => i.status === 'Pending').length}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl shadow-soft p-4">
        <div className="space-y-3">
          {invoices.map(inv => (
            <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
              <div>
                <div className="font-medium text-foreground">{inv.id} — {inv.patient}</div>
                <div className="text-sm text-muted-foreground">{inv.status}</div>
              </div>
              <div className="text-sm font-medium">{inv.total}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}