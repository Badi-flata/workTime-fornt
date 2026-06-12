"use client";

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import clsx from 'clsx';

export type StatisticFilter = "ON_TIME" | "LATE" | "ABSENT" | "DEDUCTED" | "ESCAPY" | "EXCUSED" | "EARLY_LEAVE";

interface StatCardProps {
  title: string;
  value?:  number | 0;
  text?:string;
  numberSize?:number;
  limit?:number
  icon?: ReactNode;
  trend?: {
    direction: 'UP' | 'DOWN' | 'NEUTRAL';
    value: string;
  };
  className?:string;
  variant?: 'primary' | 'secondary' | 'error' | 'surface' |"missing" ;
  delay?: number;
  statisticFilter?: StatisticFilter;
  onClick?: (filter: StatisticFilter | undefined ,totalItemsCard: number |undefined ) => void;

}

const variantStyles = {
  primary:   'bg-surface-container-lowest shadow primary border border-r-[6px] border-r-primary border-t-outline/15 border-b-outline/15 border-l-outline/15',
  secondary: 'bg-surface-container-lowest shadow secondary border border-r-[6px] border-r-secondary border-t-outline/15 border-b-outline/15 border-l-outline/15',
  missing:   'bg-surface-container-lowest shadow missing border border-r-[6px] border-r-missing border-t-outline/15 border-b-outline/15 border-l-outline/15',
  error:     'bg-surface-container-lowest shadow error border border-r-[6px] border-r-error border-t-outline/15 border-b-outline/15 border-l-outline/15',
  surface:   'bg-surface-container-lowest shadow surface border border-r-[6px] border-r-[#faa73b] border-t-outline/15 border-b-outline/15 border-l-outline/15'
}
const colors_text = {
  primary:   ' text-[#3a987f]',
  secondary: 'text-[#4059aa]',
  missing:   'text-[#6c757d]',
  error:     ' text-error',
  surface:   ' text-orange-500'
}
const color = {
  primary:   ' shadow-[0_8px_20px_-4px_rgba(0,53,39,0.35)] ',
  secondary: ' shadow-[0_8px_20px_-4px_rgba(64,89,170,0.35)] ',
  missing:   ' shadow-[0_8px_20px_-4px_rgba(108,117,125,0.35)] ',
  error:     ' shadow-[0_8px_20px_-4px_rgba(186,26,26,0.35)] ',
  surface:   ' shadow-[0_8px_20px_-4px_rgba(250,167,59,0.35)] '
}

export function StatCard({numberSize  , title, value, icon, trend, variant = 'surface', delay = 0,
                         statisticFilter, onClick , className ="" , text ,limit }: StatCardProps) {
  
  return (
    <div 
      className={`${className} relative z-50 transition-all duration-300 ease hover:-translate-x-1 hover:-translate-y-1.5 z-20 w-full`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        onClick={() => onClick?.(statisticFilter , value)}
        className={clsx(
          `p-5 rounded-2xl border w-full h-full flex flex-col justify-between font-sans shadow-sm min-h-[160px]`,
          onClick ? 'cursor-pointer' : '',
          variantStyles[variant]
        )}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-3xl  ${colors_text[variant]} font-light font-sans`}>{title}</h3>
          {icon && <div className={`p-2 rounded-full bg-white/70 ${color[variant]}`}>{icon}</div>}
        </div>

        {text && (
          <div className="justify-self-center text-right text-2xl font-medium text-on-surface self-start py-2">
            <p className="leading-tight">{text}</p>
          </div>
        )}

        <div className="flex justify-between items-end gap-3 mt-auto">
          <div>
            {limit ? (
              <div className="flex items-baseline gap-1 font-heading font-extrabold" dir="ltr">
                <span className="text-sm font-medium text-slate-400">/ {limit}</span>
                <span style={numberSize ? { fontSize: numberSize } : undefined} className={`text-3xl ${colors_text[variant]}`}>
                  {value}
                </span>
              </div>
            ) : (
              value !== undefined && (
                <span className={`text-4xl font-heading font-extrabold ${colors_text[variant]}`}>
                  {value}
                </span>
              )
            )}
          </div>
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
    </div>
  );
}
