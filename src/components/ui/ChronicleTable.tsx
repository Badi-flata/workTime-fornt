"use client";

import { RegistryEntry } from '@/types/dashboard-registry.types';
import { motion } from 'framer-motion';

interface ChronicleTableProps {
  data: RegistryEntry[];
  onRowClick?: (id: string) => void;
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

export function ChronicleTable({ data, onRowClick }: ChronicleTableProps) {
  return (
    <div className="overflow-x-auto  rounded-lg border border-outline/10 shadow-sm">
      <table className="chronicle-table">
        <thead>
          <tr>
            <th>الموظف</th>
            <th>المنصب / الوردية</th>
            <th>التقييم العام</th>
            <th>أيام الحضور</th>
            <th>الغياب</th>
            <th>إجمالي الخصومات</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <motion.tr 
              key={row.employeeId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onRowClick && onRowClick(row.employeeId)}
              className="hover:bg-surface-container-low transition-colors cursor-pointer group"
            >
              <td>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {row.avatar ? <img src={row.avatar} alt={row.name} className="rounded-full" /> : row.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-on-surface">{row.name}</span>
                </div>
              </td>
              <td className="text-on-surface-variant">{row.role}</td>
              <td>
                <span className={`px-2 py-1 rounded-md text-xs font-bold font-label ${statusColorMap[row.disciplineRating]}`}>
                  {ratingTextMap[row.disciplineRating]}
                </span>
              </td>
              <td className="text-primary font-bold">{row.summary.presentDays}</td>
              <td className="text-error font-bold">{row.summary.absentDays}</td>
              <td className="font-heading">{row.summary.totalDeductionsInPeriod} ر.س</td>
            </motion.tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-12 text-outline">
                لا توجد سجلات مطابقة للبحث
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
