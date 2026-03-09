import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

export default function Team() {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md p-8 bg-card border border-border rounded-2xl shadow-soft"
      >
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Users className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Coming soon</h1>
        <p className="text-muted-foreground mb-6">
          The team directory and profiles are under construction. Use Meku to generate content for this page.
        </p>
        <button className="px-6 py-2.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg font-medium transition-colors">
          Go Back
        </button>
      </motion.div>
    </div>
  );
}