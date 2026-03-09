"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: LucideIcon;
  delay?: number;
}

export default function StatCard({
  title,
  value,
  trend,
  trendUp,
  icon: Icon,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="p-6 hover:shadow-md transition-shadow duration-300">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <h3 className="text-3xl font-heading font-bold text-foreground">
              {value}
            </h3>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Icon className="w-6 h-6" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            <span
              className={`font-medium ${
                trendUp ? "text-green-600" : "text-destructive"
              }`}
            >
              {trend}
            </span>
            <span className="text-muted-foreground ml-2">vs last week</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
