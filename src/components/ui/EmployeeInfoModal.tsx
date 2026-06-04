"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, UserCircle, Briefcase, Calendar as CalendarIcon, Clock, AlertCircle, CalendarX } from 'lucide-react';
import { useDashboardUIStore } from '@/store/useDashboardUIStore';
import Image from 'next/image';

export function EmployeeInfoModal() {
  const { isEmployeeInfoModalOpen, selectedEmployee, closeModals, openDetailedAttendanceModal } = useDashboardUIStore();

  // In a real app, we would fetch the specific employee details based on selectedEmployeeId.
  // For now, we use a placeholder or derived data.
  
  if (!isEmployeeInfoModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/20 backdrop-blur-sm" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline/10 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-outline/10">
            <h2 className="text-xl font-heading font-bold text-primary">بطاقة معلومات الموظف</h2>
            <button 
              onClick={closeModals}
              className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto">
            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
               {selectedEmployee?.avatar ? (
                    <Image src={selectedEmployee?.avatar} alt={selectedEmployee?.name} 
                    width={32} height={32} className="rounded-full object-cover" />
                ) : (
               selectedEmployee?.name.charAt(0)
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold font-sans text-on-surface">موظف #{selectedEmployee?.name}</h3>
                <div className="flex items-center gap-2 text-on-surface-variant text-sm mt-1">
                  <Briefcase size={14} />
                  <span>المسمى الوظيفي (تطوير)</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <h4 className="text-sm font-label font-bold text-outline mb-3 uppercase tracking-wide">ملخص الأداء الشهري</h4>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-surface-container-low p-4 rounded-xl">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <CalendarIcon size={16} />
                  <span className="text-sm font-medium">أيام الحضور</span>
                </div>
                <p className="text-2xl font-bold font-sans text-on-surface">{selectedEmployee?.summary?.presentDays||0}</p>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl">
                <div className="flex items-center gap-2 text-error mb-1">
                  <CalendarX size={16} />
                  <span className="text-sm font-medium">أيام الغياب</span>
                </div>
                <p className="text-2xl font-bold font-sans text-on-surface">{selectedEmployee?.summary?.absentDays||0}</p>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl">
                <div className="flex items-center gap-2 text-secondary mb-1">
                  <Clock size={16} />
                  <span className="text-sm font-medium">مرات التأخير</span>
                </div>
                <p className="text-2xl font-bold font-sans text-on-surface">{selectedEmployee?.summary?.lateDays||0}</p>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl">
                <div className="flex items-center gap-2 text-on-surface-variant mb-1">
                  <AlertCircle size={16} />
                  <span className="text-sm font-medium">الخصومات</span>
                </div>
                <p className="text-2xl font-bold font-sans text-on-surface">{selectedEmployee?.summary?.totalDeductionsInPeriod ||0}<span className="text-sm font-normal">ريال</span></p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button 
                onClick={() => selectedEmployee && openDetailedAttendanceModal(selectedEmployee)}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-medium font-sans hover:bg-primary-container transition-colors"
              >
                سجل الحضور التفصيلي
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
