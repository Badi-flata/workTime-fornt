"use client";

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    direction: 'UP' | 'DOWN' | 'NEUTRAL';
    value: string;
  };
  variant?: 'primary' | 'secondary' | 'error' | 'surface';
  delay?: number;
}

const variantStyles = {
  primary: 'bg-primary/5 border-primary/20 text-primary',
  secondary: 'bg-secondary/5 border-secondary/20 text-secondary',
  error: 'bg-error/5 border-error/20 text-error',
  surface: 'bg-surface-container-lowest border-outline/10 text-on-surface'
};

export function StatCard({ title, value, icon, trend, variant = 'surface', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={clsx(
        "p-5 rounded-lg border flex flex-col justify-between font-sans shadow-sm",
        variantStyles[variant]
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-on-surface-variant font-label">{title}</h3>
        {icon && <div className="p-2 rounded-full bg-white/50">{icon}</div>}
      </div>
      
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-heading font-semibold">{value}</span>
        {trend && (
          <span className={clsx(
            "text-xs font-semibold px-2 py-1 rounded-full",
            trend.direction === 'UP' ? 'bg-primary/10 text-primary' : 
            trend.direction === 'DOWN' ? 'bg-error/10 text-error' : 
            'bg-outline/10 text-outline'
          )}>
            {trend.direction === 'UP' ? '↑' : trend.direction === 'DOWN' ? '↓' : '-'} {trend.value}
          </span>
        )}
      </div>
    </motion.div>
  );
}
