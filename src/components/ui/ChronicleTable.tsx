"use client";

import { RegistryEntry } from '@/types/dashboard-registry.types';
import { DailyEmployeeRow } from '@/store/useRegistryFilterStore';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// ─── Shared column config ───────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  ON_TIME:  'bg-primary/10 text-primary',
  LATE:     'bg-secondary/10 text-secondary',
  ABSENT:   'bg-error/10 text-error',
  EXCUSED:  'bg-outline/10 text-on-surface-variant',
  ESCAPY:   'bg-error/20 text-error',
};

const STATUS_LABEL: Record<string, string> = {
  ON_TIME:  'حاضر',
  LATE:     'متأخر',
  ABSENT:   'غياب',
  EXCUSED:  'معذور',
  ESCAPY:   'هروب',
};

const RATING_COLOR: Record<string, string> = {
  EXCELLENT:         'bg-primary/10 text-primary',
  VERY_GOOD:         'bg-secondary/10 text-secondary',
  GOOD:              'bg-outline/10 text-on-surface-variant',
  NEEDS_IMPROVEMENT: 'bg-error/10 text-error',
};

const RATING_LABEL: Record<string, string> = {
  EXCELLENT:         'ممتاز',
  VERY_GOOD:         'جيد جداً',
  GOOD:              'جيد',
  NEEDS_IMPROVEMENT: 'يحتاج تحسين',
};

// ─── Column definitions ─────────────────────────────────────────

const COLS_SUMMARY   = ['الموظف', 'التخصص / المنصب', 'التقييم', 'الحضور', 'الغياب', 'التأخير', 'الخصومات'];
const COLS_BREAKDOWN = ['الموظف', 'التخصص / المنصب', 'التقييم', 'وقت الدخول', 'وقت الخروج', 'الوردية', 'التاريخ'];
const COLS_DAILY     = ['الموظف', 'التاريخ', 'الحالة', 'وقت الدخول', 'وقت الخروج', 'الوردية', 'الخصم (ر.س)'];

// ─── Avatar cell ─────────────────────────────────────────────────

function AvatarCell({ name, avatar }: { name: string; avatar: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center
                      text-primary font-bold text-sm shrink-0 overflow-hidden">
        {avatar ? (
          <Image src={avatar} alt={name} width={32} height={32} className="rounded-full object-cover" />
        ) : (
          name.charAt(0)
        )}
      </div>
      <span className="font-semibold text-on-surface whitespace-nowrap">{name}</span>
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────────────

interface ChronicleTableProps {
  /** البيانات في وضع ALL / WEEKLY / MONTHLY */
  data?: RegistryEntry[];
  /** البيانات المُبسَّطة في وضع DAILY */
  dailyData?: DailyEmployeeRow[];
  /** هل نحن في وضع DAILY؟ */
  isDaily?: boolean;
  /** مجموعة الأعمدة: 1 = ملخص، 2 = تفاصيل يومية (يُستخدم فقط مع data) */
  turnColumns?: number;
  onRowClick?: (employeeId: string) => void;
}

// ─── Component ───────────────────────────────────────────────────

export function ChronicleTable({
  data = [],
  dailyData = [],
  isDaily = false,
  turnColumns = 1,
  onRowClick,
}: ChronicleTableProps) {

  // اختر الأعمدة المناسبة
  const columns = isDaily
    ? COLS_DAILY
    : turnColumns === 2
      ? COLS_BREAKDOWN
      : COLS_SUMMARY;

  // هل يوجد بيانات؟
  const hasData = isDaily ? dailyData.length > 0 : data.length > 0;

  return (
    <div className="overflow-x-auto rounded-lg border border-outline/10 shadow-sm">
      <table className="chronicle-table">

        {/* ── Header ── */}
        <thead>
          <tr>
            {columns.map((col) => <th key={col}>{col}</th>)}
          </tr>
        </thead>

        {/* ── Body ── */}
        <tbody>
          <AnimatePresence mode="wait">

            {/* ══ DAILY rows ══ */}
            {isDaily && dailyData.map((row, idx) => (
              <motion.tr
                key={`${row.employeeId}-${row.date}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.22 }}
                onClick={() => onRowClick?.(row.employeeId)}
                className="hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                {/* الموظف */}
                <td><AvatarCell name={row.name} avatar={row.avatar} /></td>

                {/* التاريخ */}
                <td className="text-on-surface-variant tabular-nums">{row.date}</td>

                {/* الحالة */}
                <td>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold font-label ${STATUS_COLOR[row.status] || ''}`}>
                    {STATUS_LABEL[row.status] || row.status}
                  </span>
                </td>

                {/* وقت الدخول */}
                <td className="tabular-nums text-on-surface-variant">{row.checkIn ?? '—'}</td>

                {/* وقت الخروج */}
                <td className="tabular-nums text-on-surface-variant">{row.checkOut ?? '—'}</td>

                {/* الوردية */}
                <td className="text-on-surface-variant">{row.shift ?? '—'}</td>

                {/* الخصم */}
                <td>
                  {row.dayDeduction > 0 ? (
                    <span className="text-error font-bold tabular-nums">
                      {row.dayDeduction.toLocaleString('ar-SA')}
                    </span>
                  ) : (
                    <span className="text-primary/60 text-xs font-label">لا خصم</span>
                  )}
                </td>
              </motion.tr>
            ))}

            {/* ══ Summary / Breakdown rows ══ */}
            {!isDaily && data.map((row, idx) => (
              <motion.tr
                key={`${row.employeeId}-${turnColumns}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.22 }}
                onClick={() => onRowClick?.(row.employeeId)}
                className="hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                {/* الموظف */}
                <td><AvatarCell name={row.name} avatar={row.avatar} /></td>

                {/* المنصب */}
                <td className="text-on-surface-variant">{row.role}</td>

                {/* التقييم */}
                <td>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold font-label ${RATING_COLOR[row.disciplineRating] || ''}`}>
                    {RATING_LABEL[row.disciplineRating] || row.disciplineRating}
                  </span>
                </td>

                {/* ── View 1: Summary ── */}
                {turnColumns === 1 && (
                  <>
                    <td className="text-primary font-bold tabular-nums">{row.summary.presentDays}</td>
                    <td className="text-error font-bold tabular-nums">{row.summary.absentDays}</td>
                    <td className="text-secondary font-bold tabular-nums">{row.summary.lateDays}</td>
                    <td className="tabular-nums whitespace-nowrap">
                      {row.summary.totalDeductionsInPeriod > 0 ? (
                        <span className="text-error font-bold">
                          {row.summary.totalDeductionsInPeriod.toLocaleString('ar-SA')}
                          <span className="text-on-surface-variant text-xs font-normal mr-1">ر.س</span>
                        </span>
                      ) : (
                        <span className="text-primary/60 text-xs font-label">لا خصومات</span>
                      )}
                    </td>
                  </>
                )}

                {/* ── View 2: Daily Breakdown (first entry) ── */}
                {turnColumns === 2 && (() => {
                  const entry = row.dailyBreakdown?.[0];
                  return (
                    <>
                      <td className="tabular-nums text-on-surface-variant">{entry?.checkIn ? entry.checkIn : '—'}</td>
                      <td className="tabular-nums text-on-surface-variant">{entry?.checkOut ? entry.checkOut : '—'}</td>
                      <td className="text-on-surface-variant">{entry?.shift ?? '—'}</td>
                      <td className="tabular-nums text-on-surface-variant whitespace-nowrap">{entry?.date ?? '—'}</td>
                    </>
                  );
                })()}
              </motion.tr>
            ))}
          </AnimatePresence>

          {/* ── Empty state ── */}
          {!hasData && (
            <tr>
              <td colSpan={columns.length} className="text-center py-14 text-outline">
                لا توجد سجلات مطابقة
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
