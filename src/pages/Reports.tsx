import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, FileText } from 'lucide-react';

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">Operational and clinical reports.</p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg inline-flex w-fit">
          Generate PDF
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <BarChart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Admissions Overview</h3>
              <p className="text-sm text-muted-foreground mt-1">Daily admissions and bed occupancy trends.</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Billing Summary</h3>
              <p className="text-sm text-muted-foreground mt-1">Outstanding invoices and payment rates.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}