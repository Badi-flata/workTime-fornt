"use client";

import { RegistryEntry  } from '@/types/dashboard-registry.types';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface ChronicleTableProps {
  data: RegistryEntry[];
  //Filter
  

  /** Which column-set to display: 1 = summary view, 2 = daily breakdown view */
  turnColumns?: number;
  onRowClick?: (data: RegistryEntry) => void;
}

const statusColorMap: Record<string, string> = {
  EXCELLENT: 'bg-primary/10 text-primary',
  VERY_GOOD: 'bg-secondary/10 text-secondary',
  GOOD: 'bg-outline/10 text-on-surface-variant',
  NEEDS_IMPROVEMENT: 'bg-error/10 text-error'
};

const ratingTextMap: Record<string, string> = {
  EXCELLENT: 'ممتاز',
  VERY_GOOD: 'جيد جداً',
  GOOD: 'جيد',
  NEEDS_IMPROVEMENT: 'يحتاج تحسين'
};

/** Column definitions for each view mode */
const COLUMNS_VIEW_1 = ['الموظف', 'التخصص / المنصب', 'التقييم', 'الحضور', 'الغياب', 'التأخير', 'إجمالي الخصومات'];
const COLUMNS_VIEW_2 = ['الموظف', 'التخصص / المنصب', 'التقييم', 'وقت الدخول', 'وقت الخروج', 'الوردية', 'التاريخ'];

export function ChronicleTable({ data, onRowClick, turnColumns = 1 }: ChronicleTableProps) {
  const columns = turnColumns === 1 ? COLUMNS_VIEW_1 : COLUMNS_VIEW_2;
  
  return (
    <div className="overflow-x-auto rounded-lg border border-outline/10 shadow-sm">
      <table className="chronicle-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="wait">
            {data.map((row, idx) => (
              <motion.tr
                key={`${row.employeeId}-${turnColumns}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.25 }}
                onClick={() => onRowClick?.(row)}
                className="hover:bg-surface-container-low transition-colors cursor-pointer group"
                >
                {/* — Column: Employee Name & Avatar (shared) — */}
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0 overflow-hidden">
                      {row.avatar ? (
                        <Image src={row.avatar} alt={row.name} width={32} height={32} className="rounded-full object-cover" />
                      ) : (
                        row.name.charAt(0)
                      )}
                    </div>
                    <span className="font-semibold  text-on-surface whitespace-nowrap">{row.name}</span>
                  </div>
                </td>

                {/* — Column: Role (shared) — */}
                <td className="text-on-surface-variant">{row.role}</td>

                {/* — Column: Rating Badge (shared) — */}
                <td>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold font-label ${statusColorMap[row.disciplineRating] || ''}`}>
                    {ratingTextMap[row.disciplineRating] || row.disciplineRating}
                  </span>
                </td>

                {/* — View 1: Summary columns — */}
                {turnColumns === 1 && (
                  <>
                    <td className="text-primary font-bold">{row.summary.presentDays}</td>
                    <td className="text-error font-bold">{row.summary.absentDays}</td>
                    <td className="text-secondary font-bold">{row.summary.lateDays}</td>
                    <td className="font-heading whitespace-nowrap">{row.summary.totalDeductionsInPeriod} <span className="text-on-surface-variant text-xs">ر.س</span></td>
                  </>
                )}

                {/* — View 2: Daily Breakdown columns — */}
                {turnColumns === 2 && (() => {
                  const entry = row.dailyBreakdown?.[0];
                  return (
                    <>
                      <td className="text-on-surface-variant">{entry?.checkIn ?? '---'}</td>
                      <td className="text-on-surface-variant">{entry?.checkOut ?? '---'}</td>
                      <td className="text-on-surface-variant">{entry?.shift ?? '---'}</td>
                      <td className="text-on-surface-variant whitespace-nowrap">{entry?.date ?? '---'}</td>
                    </>
                  );
                })()}
              </motion.tr>
            ))}
          </AnimatePresence>

          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-outline">
                لا توجد سجلات مطابقة للبحث
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
