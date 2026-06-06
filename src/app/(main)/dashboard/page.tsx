"use client";

import { useEffect, useCallback } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { GeneralEvaluationCard } from '@/components/ui/GeneralEvaluationCard';
import { ChronicleTable } from '@/components/ui/ChronicleTable';
import { DatePicker } from '@/components/ui/DatePicker';
import { useGeneralStatsStore } from '@/store/useGeneralStatsStore';
import { useCardStatsStore } from '@/store/useCardStatsStore';
import { useDashboardUIStore } from '@/store/useDashboardUIStore';
import { useRegistryFilterStore } from '@/store/useRegistryFilterStore';
import {
  Users, Clock, AlertTriangle, CalendarX2,
  ChevronRight, ChevronLeft, Search, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modes, StatusFilter, DisciplineRating } from '@/types/dashboard-registry.types';

// ── Mode → backend param ──────────────────────────────────────────
const MODE_MAP: Record<Modes, string> = {
  ALL:     'ALL',
  DAILY:   'daily',
  WEEKLY:  'weekly',
  MONTHLY: 'monthly',
};

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
  const { disciplineRate, overallRating, fetchGeneralStats } = useGeneralStatsStore();
  const { meta, metrics, registry, isLoading, error, fetchCardMetrics } = useCardStatsStore();

  const {
    activeTab, turnColumns,
    pagination: { page ,limit ,totalPages  },
    setPagination, setCurrentPage, setTurnColumns, setActiveTab,
    openEmployeeModal,
  } = useDashboardUIStore();

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
      page: String(page),
      limit:'5',
      dateAnchor: searchDate,
    });
  }, [activeTab, page, searchDate, fetchCardMetrics]);

  // ── Sync pagination meta ─────────────────────────────────────
  useEffect(() => {
    if (meta?.pagination) setPagination(meta.pagination);
  }, [meta?.pagination, setPagination]);

  // ── Re-apply filters whenever source data or filters change ──
  useEffect(() => {
    applyFilters(registry, activeTab, { page, limit });
  }, [registry, activeTab, statusFilter, disciplineFilter, searchDate, dailyPage, page, applyFilters]);

  // ── Reset filters on tab change ───────────────────────────────
  useEffect(() => { resetFilters(); }, [activeTab, resetFilters]);

  // ── Resolve clicked employee → open modal ─────────────────────
  const handleRowClick = useCallback((employeeId: string) => {
    const employee = registry.find((r) => r.employeeId === employeeId);
    if (employee) openEmployeeModal(employee);
  }, [registry, openEmployeeModal]);

  // ── Derived data ──────────────────────────────────────────────
  const isDaily = activeTab === 'DAILY';
  const showFilterBar = !isLoading;
  const TotalPages = isDaily ? totalPagesFiltered : (meta?.pagination?.totalPages || totalPages);

  return (
    <div className="space-y-8 pb-12">

      {/* ── Page header + Mode Tabs ── */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary mb-1">
            لوحة التحكم بسجلات الحضور
          </h1>
          <p className="text-on-surface-variant font-sans text-sm">
            نظرة عامة على أداء الموظفين وإحصائيات الانضباط.
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline/10">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="الحضور" value={metrics?.totalPresent || 0}
          icon={<Users className="text-primary" size={20} />}
          variant="primary" trend={{ direction: 'UP', value: '12%' }} delay={0.1}
        />
        <StatCard
          title="حالات التأخير" value={metrics?.totalLateOccurrences || 0}
          icon={<Clock className="text-error" size={20} />}
          variant="surface" trend={{ direction: 'DOWN', value: '5%' }} delay={0.2}
        />
        <StatCard
          title="غياب بدون عذر" value={metrics?.totalAbsent || 0}
          icon={<CalendarX2 className="text-error" size={20} />}
          variant="error" delay={0.3}
        />
        <StatCard
          title="الخصومات النشطة" value={metrics?.totalDeductedEmployeesCount || 0}
          icon={<AlertTriangle className="text-secondary" size={20} />}
          variant="secondary" delay={0.4}
        />
      </div>

      {/* ── Evaluation + Live Pulse ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GeneralEvaluationCard disciplineRate={disciplineRate} overallRating={overallRating} />
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
                {turnColumns === 1 ? 'عرض الملخص' : 'عرض التفاصيل'}
              </span>
              <button
                onClick={() => setTurnColumns('prev', turnColumns)}
                disabled={turnColumns === 1}
                className="p-1.5 rounded-md bg-surface-container-low border border-outline/10
                           hover:bg-surface-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="العرض السابق"
              >
                <ChevronRight size={16} />
              </button>
              <span className="text-sm font-bold font-label text-primary min-w-[20px] text-center">
                {turnColumns}
              </span>
              <button
                onClick={() => setTurnColumns('next', turnColumns)}
                disabled={turnColumns === 2}
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

        {/* Loading spinner */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16 gap-3">
            <div className="w-7 h-7 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-on-surface-variant font-sans text-sm">جاري تحميل البيانات...</span>
          </div>
        ) : (
          <ChronicleTable
            data={filteredRegistry}
            dailyData={filteredDailyRows}
            isDaily={isDaily}
            turnColumns={turnColumns}
            onRowClick={handleRowClick}
          />
        )}
      </motion.div>

      {/* ── Pagination ── */}
      {TotalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => isDaily ? setDailyPage('prev') : setCurrentPage('prev', page)}
            disabled={isDaily ? dailyPage <= 1 : page <= 1}
            className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline/10
                       hover:bg-surface-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="الصفحة السابقة"
          >
            <ChevronRight size={18} />
          </button>
          <span className="text-sm font-heading font-medium text-on-surface-variant">
            صفحة <strong className="text-primary">{isDaily ? dailyPage : page}</strong> من{' '}
            <strong>{TotalPages}</strong>
          </span>
          <button
            onClick={() => isDaily ? setDailyPage('next', TotalPages) : setCurrentPage('next', page)}
            disabled={isDaily ? dailyPage >= TotalPages : page >= TotalPages}
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
