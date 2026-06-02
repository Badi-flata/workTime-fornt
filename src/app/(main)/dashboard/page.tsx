"use client";

import { useEffect } from 'react';
import { Fragment } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { GeneralEvaluationCard } from '@/components/ui/GeneralEvaluationCard';
import { ChronicleTable } from '@/components/ui/ChronicleTable';
import { useGeneralStatsStore } from '@/store/useGeneralStatsStore';
import { useCardStatsStore } from '@/store/useCardStatsStore';
import { useDashboardUIStore } from '@/store/useDashboardUIStore';
import { Users, Clock, AlertTriangle, CalendarX2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { disciplineRate, overallRating, fetchGeneralStats } = useGeneralStatsStore();
  const { metrics, registry, fetchCardMetrics } = useCardStatsStore();
  const { activeTab, setActiveTab, openEmployeeModal } = useDashboardUIStore();

  useEffect(() => {
    // Initial data fetch simulating dashboard mount
    fetchGeneralStats();
    fetchCardMetrics({ start: '2026-06-01', end: '2026-06-30', mode: 'MONTHLY' });
  }, [fetchGeneralStats, fetchCardMetrics]);

  // Uses the actual registry data from backend, if available.
  // Fallback to empty array if no backend is running yet.
  const tableData = registry || [];

  return (
    <Fragment>
      <div className="space-y-8 pb-12">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary mb-2">لوحة التحكم بسجلات الحضور</h1>
            <p className="text-on-surface-variant font-sans">نظرة عامة على أداء الموظفين وإحصائيات الانضباط.</p>
          </div>
          
          <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline/10">
            {['DAILY', 'WEEKLY', 'MONTHLY'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'DAILY' | 'WEEKLY' | 'MONTHLY')}
                className={`px-4 py-2 rounded-md font-label font-bold text-sm transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                {tab === 'DAILY' ? 'يومي' : tab === 'WEEKLY' ? 'أسبوعي' : 'شهري'}
              </button>
            ))}
          </div>
        </div>

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
            <p className="text-3xl font-bold font-sans mb-1">42 / 50</p>
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
          </div>
          <ChronicleTable data={tableData} onRowClick={openEmployeeModal} />
        </motion.div>
      </div>
    </Fragment>
  );
}
