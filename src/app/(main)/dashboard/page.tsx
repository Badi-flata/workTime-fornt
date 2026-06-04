"use client";

import { useEffect } from 'react';
import { Fragment } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { RegistryEntry  } from '@/types/dashboard-registry.types';
import { GeneralEvaluationCard } from '@/components/ui/GeneralEvaluationCard';
import { ChronicleTable } from '@/components/ui/ChronicleTable';
import { useGeneralStatsStore } from '@/store/useGeneralStatsStore';
import { useCardStatsStore } from '@/store/useCardStatsStore';
import { useDashboardUIStore } from '@/store/useDashboardUIStore';
import { Users, Clock, AlertTriangle, CalendarX2, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { join } from 'path';

export default function DashboardPage() {
  const { disciplineRate, overallRating, fetchGeneralStats } = useGeneralStatsStore();
  const { meta, metrics, registry, isLoading, error, fetchCardMetrics } = useCardStatsStore();
  const {
    activeTab, turnColumns,statusDiscipline,
    Pagination: { page }, statusFilter, dataFilter,
    setPagination, setCurrentPage, setTurnColumns,
     setActiveTab, openEmployeeModal,setStatusFilter,
     setStatusDiscipline,setDataFilter
  } = useDashboardUIStore();
    
  // Fetch data on mount and when activeTab or page changes
  useEffect(() => {
    fetchGeneralStats();
  }, [fetchGeneralStats]);

  useEffect(() => {
    // Map frontend tab names to backend mode values
  
    fetchCardMetrics({ 
      mode: activeTab || 'ALL',
      page: String(page),
      limit: '5',
      dateAnchor:'2026-05-31'
    });
  }, [activeTab, page, fetchCardMetrics]);

  // Sync pagination meta from backend response
  useEffect(() => {
    if (meta?.pagination) {
      setPagination(meta.pagination);
    }
  }, [meta?.pagination, setPagination]);

   useEffect(() => {
    setDataFilter(registry,activeTab,statusFilter,statusDiscipline)
    
  }, [registry, statusDiscipline,statusFilter, setDataFilter])
  
  const tableData = dataFilter || [];
  

  
  return (
    <Fragment>
      <div className="space-y-8 pb-12">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary mb-2">لوحة التحكم بسجلات الحضور</h1>
            <p className="text-on-surface-variant font-sans">نظرة عامة على أداء الموظفين وإحصائيات الانضباط.</p>
          </div>
          
          <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline/10">
            {['ALL', 'DAILY', 'WEEKLY', 'MONTHLY'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'ALL' | 'DAILY' | 'WEEKLY' | 'MONTHLY')}
                className={`px-4 py-2 rounded-md font-label font-bold text-sm transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                {tab === 'DAILY' ? 'يومي' : tab === 'WEEKLY' ? 'أسبوعي' : tab === 'MONTHLY' ? 'شهري' : 'الكل'}
              </button>
            ))}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-error/10 border border-error/20 text-error rounded-lg p-4 text-sm font-sans"
          >
            <strong>خطأ في جلب البيانات:</strong> {error}
            <p className="text-xs mt-1 text-on-surface-variant">تأكد من تشغيل الخادم وتسجيل الدخول بحساب مدير (SUPER_ADMIN).</p>
          </motion.div>
        )}

        {/* Top Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="الحضور اليوم" 
            value={metrics?.totalPresent || 0} 
            icon={<Users className="text-primary" size={20} />} 
            variant="primary"
            trend={{ direction: 'UP', value: '12%' }}
            delay={0.1}
          />
          <StatCard 
            title="حالات التأخير" 
            value={metrics?.totalLateOccurrences || 0} 
            icon={<Clock className="text-error" size={20} />} 
            variant="surface"
            trend={{ direction: 'DOWN', value: '5%' }}
            delay={0.2}
          />
          <StatCard 
            title="غياب بدون عذر" 
            value={metrics?.totalAbsent || 0} 
            icon={<CalendarX2 className="text-error" size={20} />} 
            variant="error"
            delay={0.3}
          />
          <StatCard 
            title="الخصومات النشطة" 
            value={metrics?.totalDeductedEmployeesCount || 0} 
            icon={<AlertTriangle className="text-secondary" size={20} />} 
            variant="secondary"
            delay={0.4}
          />
        </div>

        {/* General Stats and Pulse Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GeneralEvaluationCard disciplineRate={disciplineRate} overallRating={overallRating} />
          </div>
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.5, delay: 0.2 }}
             className="bg-primary text-white rounded-xl p-6 shadow-md flex flex-col justify-center items-center text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="w-4 h-4 bg-error rounded-full mb-4 animate-pulse shadow-[0_0_15px_rgba(186,26,26,0.6)]"></div>
            <h3 className="text-lg font-heading font-semibold mb-2">نبض الحضور الحي</h3>
            <p className="text-3xl font-bold font-sans mb-1">{metrics?.totalPresent || 0} / {meta?.totalSubordinates || 0}</p>
            <p className="text-primary-fixed-dim text-sm font-label">موظف متواجد الآن</p>
          </motion.div>
        </div>

        {/* Registry Table Section */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.4 }}
           className="bg-surface-container-lowest rounded-xl border border-outline/10 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-heading font-semibold text-primary">السجل الموحد للموظفين</h2>
            
            {/* Column View Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant font-label ml-2">
                {turnColumns === 1 ? 'عرض الملخص' : 'عرض التفاصيل اليومية'}
              </span>
              <button
                onClick={() => setTurnColumns("poved", turnColumns)}
                disabled={turnColumns === 1}
                className="p-1.5 rounded-md bg-surface-container-low border border-outline/10 hover:bg-surface-container hover:border-outline transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="العرض السابق"
              >
                <ChevronRight size={16} />
              </button>
              <span className="text-sm font-bold font-label text-primary min-w-[20px] text-center">{turnColumns}</span>
              <button
                onClick={() => setTurnColumns("next", turnColumns)}
                disabled={turnColumns === 2}
                className="p-1.5 rounded-md bg-surface-container-low border border-outline/10 hover:bg-surface-container hover:border-outline transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="العرض التالي"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <span className="mr-3 text-on-surface-variant font-sans">جاري تحميل البيانات...</span>
            </div>
          ) : (<>
          <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline/10">
            {activeTab === 'DAILY' ? (['ALL',"ON_TIME","LATE","ABSENT","EXCUSED","ESCAPY"].map((stat) => (
              <button
                key={stat}
                onClick={() => setStatusFilter(stat as 'ALL' | 'ON_TIME' | 'LATE' | 'ABSENT' | 'EXCUSED' | 'ESCAPY')}
                className={`px-4 py-2 rounded-md font-label font-bold text-sm transition-all ${
                  statusFilter === stat 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                {
                 stat === 'ON_TIME' ? 'حاضر' :
                 stat === 'LATE' ? 'متأخر' :
                 stat === 'ABSENT' ? 'غياب' :
                 stat === 'EXCUSED' ? 'عذر' :
                 stat === 'ESCAPY' ?'هروب' :
                  'الكل'
                 }
              </button>
            ))
          )
          :
          (['ALL', 'EXCELLENT' , 'VERY_GOOD' , 'GOOD' , 'NEEDS_IMPROVEMENT'].map((stat) => (
              <button
                key={stat}
                onClick={() => setStatusDiscipline(stat as 'ALL'| 'EXCELLENT' | 'VERY_GOOD' | 'GOOD' | 'NEEDS_IMPROVEMENT')}
                className={`px-4 py-2 rounded-md font-label font-bold text-sm transition-all ${
                  statusDiscipline === stat 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                { 
                 stat === 'EXCELLENT' ?  'ممتاز':
                  stat === 'VERY_GOOD' ? 'جيد جداً' :
                  stat === 'GOOD' ? 'جيد' :
                   stat === 'NEEDS_IMPROVEMENT' ? 'يحتاج تحسين' :
                    'الكل'
                   }
              </button>
            )))
        }
          </div>

            <ChronicleTable data={tableData} onRowClick={openEmployeeModal} turnColumns={turnColumns} /></>
          )}
        </motion.div>

        {/* Pagination Controls */}
        {meta?.pagination && meta.pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage("poved", page)}
              disabled={page <= 1}
              className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline/10 hover:bg-surface-container hover:border-outline transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="الصفحة السابقة"
            >
              <ChevronRight size={18} />
            </button>
            <span className="text-sm font-heading font-medium text-on-surface-variant">
              صفحة <strong className="text-primary">{page}</strong> من <strong>{meta.pagination.totalPages}</strong>
            </span>
            <button
              onClick={() => setCurrentPage("next", page)}
              disabled={page >= meta.pagination.totalPages}
              className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline/10 hover:bg-surface-container hover:border-outline transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="الصفحة التالية"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        )}
      </div>
    </Fragment>
  );
}
