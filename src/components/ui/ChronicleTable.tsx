"use client";

import { RegistryEntryOutput as RegistryEntry } from '@/types';
import { DailyEmployeeRow } from '@/store/useRegistryFilterStore';
import { motion, AnimatePresence } from 'framer-motion';
import  Image from 'next/image';

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

const RATING_COLOR: Record<string, string[]> = {
  EXCELLENT:         ['bg-primary/5 text-primary border border-primary/10','bg-primary','bg-outline/5 '],
  VERY_GOOD:         ['bg-secondary/5 text-secondary border border-secondary/10','bg-secondary','bg-outline/5 '],
  GOOD:              ['bg-orange-500/5  text-on-surface-variant border border-orange-500/10','bg-orange-500','bg-orange-500/5 '],
  NEEDS_IMPROVEMENT: ['bg-error/5  text-error border border-error/10','bg-error','bg-outline/5 '],
};

const RATING_LABEL: Record<string, string> = {
  EXCELLENT:         'ممتاز',
  VERY_GOOD:         'جيد جداً',
  GOOD:              'جيد',
  NEEDS_IMPROVEMENT: 'متدني',
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
  turnColumnsDash?: number;
  onRowClick?: (employeeId: string) => void;
}

// ─── Component ───────────────────────────────────────────────────

export function ChronicleTable({
  data = [],
  dailyData = [],
  isDaily = false,
  turnColumnsDash = 1,
  onRowClick,
}: ChronicleTableProps) {

  // اختر الأعمدة المناسبة
  const columns = isDaily
    ? COLS_DAILY
    : turnColumnsDash === 2
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
            {columns.map((col) => <th key={col} >{col}</th>)}
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
                key={`${row.employeeId}-${turnColumnsDash}`}
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
                <td className="text-on-surface-variant">{row.jobTitle}</td>

                {/* التقييم */}
                <td className='w-[140px]'>
                  <div className={`flex w-[min(90%,140px)] items-center gap-2 ${RATING_COLOR[row.disciplineRating][0]} px-2.5 py-1 rounded-lg select-none`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${RATING_COLOR[row.disciplineRating][1]} animate-pulse`} />
                    <span className={`font-label text-xs font-semibold leading-none ${RATING_COLOR[row.disciplineRating][2]}`}>
                      {RATING_LABEL[row.disciplineRating] || row.disciplineRating} 
                    </span>
                  </div>
                </td>

                {/* ── View 1: Summary ── */}
                {turnColumnsDash === 1 && (
                  <>
                    <td className="text-primary font-mono font-bold tabular-nums text-sm">{row.summary.presentDays}</td>
                    <td className="text-error font-mono font-bold tabular-nums text-sm">{row.summary.absentDays}</td>
                    <td className="text-secondary font-mono font-bold tabular-nums text-sm">{row.summary.lateDays}</td>
                    <td className="font-mono tabular-nums whitespace-nowrap">
                      {row.summary.totalDeductions > 0 ? (
                        <span className="text-error font-bold text-sm">
                          {row.summary.totalDeductions.toLocaleString('ar-SA')}
                          <span className="text-on-surface-variant text-xs font-normal mr-1 font-sans">ر.س</span>
                        </span>
                      ) : (
                        <span className="text-primary/60 text-xs font-label">لا خصومات</span>
                      )}
                    </td>
                  </>
                )}

                {/* ── View 2: Daily Breakdown (first entry) ── */}
                {turnColumnsDash === 2 && (() => {
                  const entry = row.dailyBreakdown?.[0];
                  return (
                    <>
                      <td className="font-mono tabular-nums text-on-surface-variant text-sm">{entry?.checkIn ? entry.checkIn : '—'}</td>
                      <td className="font-mono tabular-nums text-on-surface-variant text-sm">{entry?.checkOut ? entry.checkOut : '—'}</td>
                      <td className="text-on-surface-variant text-sm">{entry?.shift ?? '—'}</td>
                      <td className="font-mono tabular-nums text-on-surface-variant whitespace-nowrap text-xs">{entry?.date ?? '—'}</td>
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
