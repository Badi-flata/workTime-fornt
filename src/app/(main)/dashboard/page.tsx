"use client";

import { useEffect, useCallback } from 'react';
import { StatCard , StatisticFilter  } from '@/components/ui/StatCard';
import { GeneralEvaluationCard } from '@/components/ui/GeneralEvaluationCard';
import { ChronicleTable } from '@/components/ui/ChronicleTable';
import { DatePicker } from '@/components/ui/DatePicker';
import { useGeneralStatsStore } from '@/store/useGeneralStatsStore';
import { useCardStatsStore } from '@/store/useCardStatsStore';
import { useDashboardUIStore } from '@/store/useDashboardUIStore';
import { useRegistryFilterStore } from '@/store/useRegistryFilterStore';
import {
  Users, Clock, AlertTriangle, CalendarX2,
  ChevronRight, ChevronLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modes, StatusFilter, DisciplineRating } from '@/types/dashboard-registry.types';
import { useCardUIStore } from '@/store/useCardUIStore';

// ── Label maps ────────────────────────────────────────────────────
const TAB_LABEL: Record<Modes, string> = {
  ALL: 'الكل', DAILY: 'يومي', WEEKLY: 'أسبوعي', MONTHLY: 'شهري',
};

const STATUS_LABELS: Record<StatusFilter, string> = {
  ALL: 'الكل', ON_TIME: 'حاضر', LATE: 'متأخر',
  ABSENT: 'غياب', EXCUSED: 'معذور', ESCAPY: 'هروب',
};

const DISCIPLINE_LABELS: Record<DisciplineRating, string> = {
  ALL: 'الكل', EXCELLENT: 'ممتاز', VERY_GOOD: 'جيد جداً',
  GOOD: 'جيد', NEEDS_IMPROVEMENT: 'يحتاج تحسين',
};

// ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  // ── Stores ────────────────────────────────────────────────────
  const { fetchGeneralStats } = useGeneralStatsStore();
  const { meta, metrics, registry, isLoading, error, fetchCardMetrics } = useCardStatsStore();

  const {
    activeTab, 
    turnColumnsDash,
    paginationDash: { pageDash ,limitDash ,totalPagesDash  },
    setTurnColumnsDash, setCurrentPage,
    setPaginationDash,  setActiveTab,
  } = useDashboardUIStore();

  const {
    openEmployeeModal,
    openStatisticEmployeesCard,
  }= useCardUIStore()

  const {
    searchDate, statusFilter, disciplineFilter,
    filteredRegistry, filteredDailyRows, totalPagesFiltered, dailyPage,
    setSearchDate, setStatusFilter, setDisciplineFilter, setDailyPage,
    applyFilters, resetFilters,
  } = useRegistryFilterStore();

  // ── Fetch on mount / tab / page change ───────────────────────
  useEffect(() => { fetchGeneralStats(); }, [fetchGeneralStats]);

  useEffect(() => {
    fetchCardMetrics({
      mode: activeTab,
      page: String(pageDash),
      limit: '5',
      dateAnchor: searchDate,
    });
  }, [activeTab, pageDash, searchDate, fetchCardMetrics]);

  // ── Sync pagination meta ─────────────────────────────────────
  useEffect(() => {
    if (meta?.pagination) setPaginationDash(meta.pagination);
  }, [meta?.pagination, setPaginationDash]);

  // ── Re-apply filters whenever source data or filters change ──
  useEffect(() => {
    applyFilters(registry, activeTab, { pageDash, limitDash });
  }, [registry, activeTab, statusFilter, disciplineFilter, searchDate, dailyPage, pageDash, limitDash, applyFilters]);

  // ── Reset filters on tab change ───────────────────────────────
  useEffect(() => {
    resetFilters();
  }, [activeTab, resetFilters]);

  // ── Resolve clicked employee → open modal ─────────────────────
  const handleRowClick = useCallback((employeeId: string) => {
    const employee = registry.find((r) => r.employeeId === employeeId);
    if (employee) openEmployeeModal(employee);
  }, [registry, openEmployeeModal]);

  // ── Resolve clicked Statistic Card → open modal ─────────────────────
  const handleCardClick = useCallback((fil: StatisticFilter | undefined, totalItemsCard: number | undefined) => {
    if (fil && totalItemsCard !== undefined) {
      openStatisticEmployeesCard([], fil, meta?.periodScope, totalItemsCard, 1);
    }
  }, [openStatisticEmployeesCard, meta?.periodScope]);
  // ── Derived data ──────────────────────────────────────────────
  const isDaily = activeTab === 'DAILY';
  const showFilterBar = !isLoading;
  const TotalPages = isDaily ? totalPagesFiltered : (meta?.pagination?.totalPages || totalPagesDash);

  if (isLoading && registry.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-md" dir="rtl">
        <div className="relative flex flex-col items-center space-y-4">
          {/* Animated Logo */}
          <div className="w-24 h-24 relative">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="silverRingGrad" x1="50" y1="82" x2="0" y2="22" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="50%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
                <linearGradient id="emeraldRingGrad" x1="50" y1="22" x2="100" y2="82" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#0f452f" />
                  <stop offset="50%" stopColor="#1b7550" />
                  <stop offset="100%" stopColor="#2bbb76" />
                </linearGradient>
                <linearGradient id="checkmarkGrad" x1="85" y1="22" x2="36" y2="58" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#105739" />
                  <stop offset="100%" stopColor="#3cd18c" />
                </linearGradient>
              </defs>
              
              {/* Outer Ring & Clock Ticks - spinning smoothly */}
              <g className="animate-[spin_4s_linear_infinite]" style={{ transformOrigin: '50px 50px' }}>
                <path
                  d="M 50 82 A 30 30 0 0 1 50 22"
                  stroke="url(#silverRingGrad)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M 50 22 A 30 30 0 0 1 50 82"
                  stroke="url(#emeraldRingGrad)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <circle cx="50" cy="27" r="2" fill="#94a3b8" />
                <circle cx="74" cy="52" r="2" fill="#1b7550" />
                <circle cx="50" cy="77" r="2" fill="#64748b" />
                <circle cx="26" cy="52" r="2" fill="#94a3b8" />
              </g>
              
              {/* Checkmark & Center Pin - pulsing softly in place */}
              <g className="animate-[pulse_2s_ease-in-out_infinite]" style={{ transformOrigin: '50px 50px' }}>
                <path
                  d="M36,44 L50,58 L85,22"
                  fill="none"
                  stroke="url(#checkmarkGrad)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="50" cy="58" r="3" fill="#136141" />
              </g>
            </svg>
          </div>
          
          {/* Text */}
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-heading font-extrabold text-[#1b7550] tracking-wider">
              WORK<span className="text-[#1e1e1e]">TIME</span>
            </h2>
            <p className="text-xs font-sans font-bold text-slate-500 mt-1 animate-pulse">
              جاري تحميل سجل الحضور...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12" dir="rtl">

      {/* ── Page header + Mode Tabs ── */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold text-primary mb-1">
            لوحة التحكم بسجلات الحضور
          </h1>
          <p className="text-primary/50 font-medium text-lg">
            نظرة عامة على أداء الموظفين وإحصائيات الانضباط.
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex lg:scale-[1.3] lg:translate-x-[14%] bg-surface-container-low rounded-lg p-1 border-2 border-secondary/15 hover:border-secondary">
          {(Object.keys(TAB_LABEL) as Modes[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md font-label font-bold text-sm transition-all ${
                activeTab === tab
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              {TAB_LABEL[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error Banner ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-error/10 border border-error/20 text-error rounded-lg p-4 text-sm font-sans"
          >
            <strong>خطأ في جلب البيانات:</strong> {error}
            <p className="text-xs mt-1 text-on-surface-variant">
              تأكد من تشغيل الخادم وتسجيل الدخول بحساب مدير (SUPER_ADMIN).
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stat Cards ── */}
      <div className="space-y-6">
        {/* Row 1 (3 wider cards) */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[180px] bg-surface-container-lowest border border-outline/10 rounded-2xl p-5 flex flex-col justify-between animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="h-5 w-28 bg-surface-container-highest rounded" />
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest" />
                </div>
                <div className="h-10 w-20 bg-surface-container-highest rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="إجمالي الحضور" 
              value={metrics?.totalPresent || 0}
              icon={<Users className="text-primary" size={20} />}
              variant="primary" 
              statisticFilter='ON_TIME'
              onClick={handleCardClick}
              delay={0.1}
              trend={{ direction: 'UP', value: '٥٪ عن الأسبوع الماضي' }}
            />
            <StatCard
              title="القسم والوردية" 
              text={meta?.activeShiftContext || 'الإدارة العامة'}
              icon={<Clock className="text-error" size={20} />}
              variant="surface" 
              delay={0.2}
            />
            <StatCard
              title="عداد الإجازات" 
              value={metrics?.totalExcused || 0}
              icon={<CalendarX2 className="text-[#3a987f]" size={20} />}
              variant="primary" 
              delay={0.3}
              text="إجمالي طلبات الإجازة هذا الأسبوع"
            />
          </div>
        )}

        {/* Row 2 (4 smaller cards) */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[150px] bg-surface-container-lowest border border-outline/10 rounded-2xl p-5 flex flex-col justify-between animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="h-5 w-24 bg-surface-container-highest rounded" />
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest" />
                </div>
                <div className="h-8 w-16 bg-surface-container-highest rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="حالات التأخير" 
              value={metrics?.totalLateOccurrences || 0}
              icon={<Clock className="text-error" size={20} />}
              statisticFilter="LATE"
              onClick={handleCardClick}
              limit={meta?.totalSubordinates || 0}
              numberSize={36}
              variant="surface" 
              trend={{ direction: 'DOWN', value: '٥٪' }} 
              delay={0.1}
            />
            <StatCard
              title="أعذار مقبولة" 
              value={metrics?.totalExcused || 0}
              icon={<CalendarX2 className="text-[#4059aa]" size={20} />}
              statisticFilter="EXCUSED"
              onClick={handleCardClick}
              limit={metrics?.totalExcused || 0}
              numberSize={36}
              variant="secondary" 
              delay={0.2}
            />
            <StatCard
              title="خروج مبكر" 
              value={metrics?.totalEarlyLeaves || 0}
              icon={<Clock className="text-[#f65c5c]" size={20} />}
              statisticFilter="EARLY_LEAVE"
              onClick={handleCardClick}
              limit={meta?.totalSubordinates || 0}
              numberSize={36}
              variant="missing" 
              delay={0.3}
            />
            <StatCard
              title="عدد المخصوم منهم" 
              value={metrics?.totalDeductedEmployeesCount || 0}
              icon={<AlertTriangle className="text-[#f65c5c]" size={20} />}
              statisticFilter="DEDUCTED"
              onClick={handleCardClick}
              limit={meta?.totalSubordinates || 0}
              numberSize={36}
              variant="error" 
              delay={0.4}
            />
          </div>
        )}
      </div>

      {/* ── Evaluation + Live Pulse ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="bg-surface-container-lowest border border-outline/10 rounded-xl p-6 flex items-center gap-6 animate-pulse">
              <div className="w-32 h-32 rounded-full border-[10px] border-surface-container-highest" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-40 bg-surface-container-highest rounded" />
                <div className="h-4 w-full bg-surface-container-highest rounded" />
                <div className="h-4 w-5/6 bg-surface-container-highest rounded" />
              </div>
            </div>
          ) : (
            <GeneralEvaluationCard disciplineRate={meta?.RatingOrginzation} overallRating={meta?.OrginzationLabel} />
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-primary text-white rounded-xl p-6 shadow-md flex flex-col
                     justify-center items-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl" />
          <div className="w-4 h-4 bg-error rounded-full mb-4 animate-pulse shadow-[0_0_15px_rgba(186,26,26,0.6)]" />
          <h3 className="text-lg font-heading font-semibold mb-2">نبض الحضور الحي</h3>
          <p className="text-3xl font-bold font-sans mb-1">
            {metrics?.totalPresent || 0} / {meta?.totalSubordinates || 0}
          </p>
          <p className="text-white/70 text-sm font-label">موظف متواجد الآن</p>
        </motion.div>
      </div>

      {/* ── Registry Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.35 }}
        className="bg-surface-container-lowest rounded-xl border border-outline/10 p-6"
      >
        {/* Table header */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
          <h2 className="text-xl font-heading font-semibold text-primary">
            {isDaily ? 'السجل اليومي المفصّل' : 'السجل الموحد للموظفين'}
          </h2>
          {meta?.periodScope && (
            <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-sans font-bold text-primary">
                {meta.periodScope}
              </span>
            </div>
          )}
          
          {/* Column toggle — مخفي في وضع DAILY لأن الأعمدة ثابتة */}
          {!isDaily && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant font-label ml-2">
                {turnColumnsDash === 1 ? 'عرض الملخص' : 'عرض التفاصيل'}
              </span>
              <button
                onClick={() => setTurnColumnsDash('prev', turnColumnsDash)}
                disabled={turnColumnsDash === 1}
                className="p-1.5 rounded-md bg-surface-container-low border border-outline/10
                           hover:bg-surface-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="العرض السابق"
              >
                <ChevronRight size={16} />
              </button>
              <span className="text-sm font-bold font-label text-primary min-w-[20px] text-center">
                {turnColumnsDash}
              </span>
              <button
                onClick={() => setTurnColumnsDash('next', turnColumnsDash)}
                disabled={turnColumnsDash === 2}
                className="p-1.5 rounded-md bg-surface-container-low border border-outline/10
                           hover:bg-surface-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="العرض التالي"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Filter bar */}
        {showFilterBar && (
          <div className="flex flex-wrap gap-3 mb-5">
            {/* ── Date search ── */}
            <div className="z-20">
              <DatePicker 
                value={searchDate} 
                onChange={setSearchDate} 
                placeholder="بحث بتاريخ معين"
              />
            </div>

            {/* ── DAILY: Status filter tabs ── */}
            {isDaily && (
              <div className="flex bg-surface-container-low rounded-lg p-0.5 border border-outline/10 flex-wrap">
                {(Object.keys(STATUS_LABELS) as StatusFilter[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-md font-label font-bold text-xs transition-all ${
                      statusFilter === s
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            )}

            {/* ── ALL / WEEKLY / MONTHLY: Discipline filter tabs ── */}
            {!isDaily && (
              <div className="flex bg-surface-container-low rounded-lg p-0.5 border border-outline/10 flex-wrap">
                {(Object.keys(DISCIPLINE_LABELS) as DisciplineRating[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDisciplineFilter(d)}
                    className={`px-3 py-1.5 rounded-md font-label font-bold text-xs transition-all ${
                      disciplineFilter === d
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                  >
                    {DISCIPLINE_LABELS[d]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Table Skeleton or Data */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="flex justify-between border-b border-outline/10 pb-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 w-20 bg-surface-container-highest rounded" />
              ))}
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-outline/5">
                <div className="flex items-center gap-3 w-1/4">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest" />
                  <div className="h-4 w-24 bg-surface-container-highest rounded" />
                </div>
                <div className="h-4 w-20 bg-surface-container-highest rounded" />
                <div className="h-6 w-16 bg-surface-container-highest rounded-full" />
                <div className="h-4 w-12 bg-surface-container-highest rounded" />
                <div className="h-4 w-8 bg-surface-container-highest rounded" />
              </div>
            ))}
          </div>
        ) : (
          <ChronicleTable
            data={filteredRegistry}
            dailyData={filteredDailyRows}
            isDaily={isDaily}
            turnColumnsDash={turnColumnsDash}
            onRowClick={handleRowClick}
          />
        )}
      </motion.div>

      {/* ── Pagination ── */}
      {TotalPages && TotalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => isDaily ? setDailyPage('prev') : setCurrentPage('prev', pageDash)}
            disabled={isDaily ? dailyPage <= 1 : pageDash <= 1}
            className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline/10
                       hover:bg-surface-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="الصفحة السابقة"
          >
            <ChevronRight size={18} />
          </button>
          <span className="text-sm font-heading font-medium text-on-surface-variant">
            صفحة <strong className="text-primary">{isDaily ? dailyPage : pageDash}</strong> من{' '}
            <strong>{TotalPages}</strong>
          </span>
          <button
            onClick={() => isDaily ? setDailyPage('next', TotalPages) : setCurrentPage('next', pageDash)}
            disabled={isDaily ? dailyPage >= TotalPages : pageDash >= TotalPages}
            className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline/10
                       hover:bg-surface-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="الصفحة التالية"
          > 
            <ChevronLeft size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
