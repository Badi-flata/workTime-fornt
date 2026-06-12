"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X,  ChevronRight , ChevronLeft} from 'lucide-react';
import { useCardStatsStore } from '@/store/useCardStatsStore';
import { StatisticFilter } from '@/components/ui/StatCard';
import { useDashboardUIStore } from '@/store/useDashboardUIStore';

import { useEffect } from 'react';

import Image from 'next/image';

import '../../app/globals.css';
import { useCardUIStore } from '@/store/useCardUIStore';

const STATUS_LABELS: Record<string, string> = {
  "ON_TIME": 'الحاضرين',
  "LATE": 'المتأخرين',
  "ABSENT": 'الغيابات', 
  "EXCUSED": 'المعذورين',
  "DEDUCTED": 'المخصوم منهم',
  "ESCAPY": 'الهروبين',
  "EARLY_LEAVE": 'المغادرين مبكراً',
};
const STATUS_column: Record<StatisticFilter, string> = {
  "ON_TIME":'ايام الحاضر',
  "LATE": ' ايام المتأخر ',
  "ABSENT": 'ايام الغياب', 
  "EXCUSED": 'ايام العذر',
  "DEDUCTED": 'ايام الخصم',
  "ESCAPY": 'ايام الهروب',
  "EARLY_LEAVE": 'أيام الخروج المبكر',
}; 
// Status Label
const STATUS_LABEL: Record<string, string> = {
  ON_TIME:  'حاضر',
  LATE:     'متأخر',
  ABSENT:   'غياب',
  EXCUSED:  'معذور',
  ESCAPY:   'هروب',
  EARLY_LEAVE: 'خروج مبكر',
};


const STATUS_COLOR: Record<string, string> = {
  ON_TIME:  'bg-primary/10 text-primary',
  LATE:     'bg-secondary/10 text-secondary',
  ABSENT:   'bg-error/10 text-error',
  EXCUSED:  'bg-outline/10 text-on-surface-variant',
  ESCAPY:   'bg-error/20 text-error',
  DEDUCTED:   'bg-error/20 text-error',
  EARLY_LEAVE: 'bg-orange-100 text-orange-700',
};

const COUNT_COLOR: Record<string, string> = {
  ON_TIME:  "text-primary font-bold tabular-nums",
  LATE:     "text-secondary font-bold tabular-nums" ,
  ABSENT:   "text-error font-bold tabular-nums" ,
  EXCUSED:  "bg-outline/10  font-bold tabular-nums text-on-surface-variant",
  ESCAPY:   "bg-error/20  font-bold tabular-nums text-error" ,
  DEDUCTED: "bg-error/20  font-bold tabular-nums text-error",
  EARLY_LEAVE: "text-orange-700 font-bold tabular-nums",
};
// Rating Label
const RATING_LABEL: Record<string, string> = {
  EXCELLENT:         'ممتاز',
  VERY_GOOD:         'جيد جداً',
  GOOD:              'جيد',
  NEEDS_IMPROVEMENT: 'يحتاج تحسين',
};

const RATING_COLOR: Record<string, string> = {
    EXCELLENT:         'bg-primary/10 text-primary',
    VERY_GOOD:         'bg-secondary/10 text-secondary',
    GOOD:              'bg-outline/10 text-on-surface-variant',
    NEEDS_IMPROVEMENT: 'bg-error/10 text-error',
};

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

export function StatisticEmployeeCard() {
   // ── Stores ────────────────────────────────────────────────────
    const { isStatisticEmployeesCardOpen,
       paginationCard:{pageCard , totalItemsCard }  ,periodScope,  
     closeModals, statisticFilter ,turnColumnsCard , setTogglePageCard , setTurnColumnsCard} = useCardUIStore();
     
     const { activeTab, dateAnchor } = useDashboardUIStore();
     const { modalRegistry, modalIsLoading, fetchModalRegistry } = useCardStatsStore();

     useEffect(() => {
       if (isStatisticEmployeesCardOpen) {
         fetchModalRegistry({
           mode: activeTab,
           dateAnchor: dateAnchor,
           status: statisticFilter,
           limit: String(totalItemsCard || 50),
           excludeBreakdown: true,
         });
       }
     }, [isStatisticEmployeesCardOpen, activeTab, dateAnchor, statisticFilter, totalItemsCard, fetchModalRegistry]);
  
    if(!isStatisticEmployeesCardOpen) return null;

// ── Columns  ────────────────────────────────────────────────────
    const countColumn = STATUS_column[statisticFilter]
    const COLS_FRST   = ['الموظف', 'التخصص / المنصب','الحالة', 'التقييم', `${countColumn}`];
    const COLS_LEST   = [ 'وقت الدخول', 'وقت الخروج','العذر','الخصم(ريال)'];
// ── Columns Turns  ──────────────────────────────────────────────────── 
    const TurnColumnsCard = turnColumnsCard 
    const Columns     = TurnColumnsCard  === 1 ? COLS_FRST : COLS_LEST;
  
// ── Pagination  ────────────────────────────────────────────────────

  const TotalItems = modalRegistry.length;
  const Limit = 5
  const PageCard = pageCard !== undefined ? pageCard : 1
  const TotalPages = Math.ceil(TotalItems / Limit);
  const paginatedData = modalRegistry.slice((PageCard - 1) * Limit, PageCard * Limit);

  console.log("Items Card:", modalRegistry.length)
  console.log("Items Card:", pageCard)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex-col  flex items-center justify-center p-4 bg-on-surface/20 backdrop-blur-sm" dir="rtl">
        {/* main div */}
        <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
          className="main bg-surface-container-lowest p-6 rounded-2xl shadow-xl border border-outline/10 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
            <div className="flex mb-3 items-center justify-between gap-4">
             
              <div>
                <h2 className="text-xl font-heading font-bold text-primary">{`سجلات ${STATUS_LABELS[statisticFilter]}`}</h2>
              </div> 
              {periodScope && (
            <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-sans font-bold text-primary">
                {periodScope}
              </span>
            </div>
          )}
  
           {/* buttons turu Columns */}
            {Columns.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant font-label ml-2">
                {TurnColumnsCard === 1 ? 'عرض الملخص' : 'عرض تفاصيل أضفية'}
              </span>
              <button
                onClick={() => setTurnColumnsCard('prev', TurnColumnsCard)}
                disabled={TurnColumnsCard === 1}
                className="p-1.5 rounded-md bg-surface-container-low border border-outline/10
                           hover:bg-surface-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="العرض السابق"
              >
                <ChevronRight size={16} />
              </button>
              <span className="text-sm font-bold font-label text-primary min-w-[20px] text-center">
                {TurnColumnsCard}
              </span>
              <button
                onClick={() => setTurnColumnsCard('next', TurnColumnsCard)}
                disabled={TurnColumnsCard === 2}
                className="p-1.5 rounded-md bg-surface-container-low border border-outline/10
                           hover:bg-surface-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="العرض التالي"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          )}
          {/* CloseCard */}
             <>
            <button 
              onClick={()=>{ closeModals()  }}
              className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors"
              >
                <X size={20} />
            </button>
            </>
          </div>

          {/* Table Content */}
          <div className="overflow-auto rounded-4xl bg-slate-200  flex-1 p-6">
            <table className="chronicle-table rounded-2xl ">
              <thead>
               <tr>
                {Columns.map((col, index) => (
                  <th key={index}>{col}</th>
                ))}
               </tr>
              </thead>
              <tbody>
                
            {modalIsLoading ?(
              <tr>
                <td colSpan={Columns.length}>
                  <div className="space-y-4 py-8 animate-pulse">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex justify-between items-center h-12 bg-white/40 rounded-xl px-6">
                        <div className="flex items-center gap-3 w-1/3">
                          <div className="w-8 h-8 rounded-full bg-white/60" />
                          <div className="h-4 w-24 bg-white/60 rounded" />
                        </div>
                        <div className="h-4 w-20 bg-white/60 rounded" />
                        <div className="h-6 w-16 bg-white/60 rounded-full" />
                        <div className="h-4 w-12 bg-white/60 rounded" />
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            )
            :
            paginatedData && paginatedData.length > 0 ? paginatedData.map((employee, index) => (

                  <motion.tr key={`${employee.employeeId}-${index}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.22 }}
                    className="hover:bg-surface-container-lowest transition-colors">
               {TurnColumnsCard === 1  ? (
<>
                      {/* الموظف */}
                      <td><AvatarCell name={employee?.name} avatar={employee?.avatar} /></td>
                    
                    {/* المنصب */}
                      <td className="text-on-surface-variant">{employee?.role||'-'}</td>

                    {/* الحالة */}
                        {statisticFilter === "DEDUCTED" ? (  
                          <td>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold font-label bg-error/10 text-error`}>
                          مخصومنه
                        </span>
                        </td>):(
                        <td>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold font-label ${STATUS_COLOR[statisticFilter] || ''}`}>
                            {STATUS_LABEL[statisticFilter] || employee?.dailyBreakdown[0]?.status ||'-'}
                        </span>
                        </td>) }

                    {/* التقيم */}
                      <td>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold font-label ${RATING_COLOR[employee?.disciplineRating] || ''}`}>
                            {RATING_LABEL[employee?.disciplineRating]  || '---'}
                        </span>
                      </td>
                    {/* عداد ايام التي تكرار فيها الحالة */}
                      <td>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold font-label ${COUNT_COLOR[statisticFilter] || ''}`}>
                            {
                            statisticFilter === "ON_TIME"  ? employee?.summary.presentDays :
                            statisticFilter === "LATE"     ? employee?.summary.lateDays    :
                            statisticFilter === "ABSENT"   ? employee?.summary.absentDays  :
                            statisticFilter === "DEDUCTED" ?(
                              <span className="text-error font-bold">
                                  {employee?.summary.totalDeductionsInPeriod.toLocaleString('ar-SA')}
                                <span className="text-on-surface-variant text-xs font-normal mr-1">ر.س</span>
                              </span>
                              ) :
                            statisticFilter === "ESCAPY"   ? employee?.summary.escapedDays :
                            statisticFilter === "EXCUSED"   ? employee?.summary.excusedDays :
                            statisticFilter === "EARLY_LEAVE" ? employee?.summary.earlyDepartureDays :
                            employee?.summary.presentDays ||'-'}
                        </span>
                      </td>
                     </>) : (
                     (() => {
                  const entry = employee.dailyBreakdown?.[0];
                  return (
                    <>
                      <td className="tabular-nums text-on-surface-variant">{entry?.checkIn ? entry.checkIn : '—'}</td>
                      <td className="tabular-nums text-on-surface-variant">{entry?.checkOut ? entry.checkOut : '—'}</td>
                      <td className="text-on-surface-variant">{entry?.excuseNotes !== null ? entry?.excuseNotes: '—'}</td>
                      <td>{ statisticFilter !== "DEDUCTED" ?
                              <span className="text-error font-bold">
                          {employee?.summary.totalDeductionsInPeriod.toLocaleString('ar-SA')}
                          <span className="text-on-surface-variant text-xs font-normal mr-1">ر.س</span>
                        </span>:"-"}</td>
                    </>
                  );
                })()
              )}
                  </motion.tr>
                
              )):
              (
               <tr>
              <td colSpan={Columns.length} className="text-center py-14 text-outline">
                لا توجد سجلات مطابقة
              </td>
              </tr>
              )
               }
              
              </tbody>
            </table>
  
            {/* ── Pagination ── */}
      {TotalPages > 1 && (
        <div className="flex justify-center mt-3 items-center gap-4">
          <button
            onClick={() => setTogglePageCard('prev', PageCard)}
            disabled={ PageCard <= 1}
            className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline/10
                       hover:bg-surface-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="الصفحة السابقة"
          >
            <ChevronRight size={18} />
          </button>
          <span className="text-sm font-heading font-medium text-on-surface-variant">
            صفحة <strong className="text-primary">{PageCard}</strong> من{' '}
            <strong>{TotalPages}</strong>
          </span>
          <button
            onClick={() =>  setTogglePageCard('next', PageCard)}
            disabled={ PageCard >= TotalPages}
            className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline/10
                       hover:bg-surface-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="الصفحة التالية"
          > 
            <ChevronLeft size={18} />
          </button>
        </div>
      )}
              </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
