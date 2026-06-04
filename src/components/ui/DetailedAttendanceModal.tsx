"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, Clock, ArrowRightLeft  , ChevronRight , ChevronLeft} from 'lucide-react';
import { useDashboardUIStore } from '@/store/useDashboardUIStore';
import { useState } from 'react';
import '../../app/globals.css';

export function DetailedAttendanceModal() {
  const { isDetailedAttendanceModalOpen, selectedEmployee , closeModals, openEmployeeModal } = useDashboardUIStore();
  const [currentPage, setCurrentPage] = useState(1);
  // Mock data for the detailed breakdown
  const dailyBreakdown  = selectedEmployee?.dailyBreakdown || [];
  
  if (!isDetailedAttendanceModalOpen) return null;
  
  // Pagination 
  const totalItems = dailyBreakdown.length;
  const limit = 1

  const totalPages = Math.ceil(totalItems / limit);
  const paginatedData = dailyBreakdown.slice((currentPage - 1) * limit, currentPage * limit);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev:number)=>prev + 1)
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev:number)=>prev - 1)
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50  flex items-center justify-center p-4 bg-on-surface/20 backdrop-blur-sm" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline/10 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-outline/10 bg-surface">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => selectedEmployee && openEmployeeModal(selectedEmployee)}
                className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors flex items-center gap-2"
              >
                <ArrowRightLeft size={18} />
              </button>
              <div>
                <h2 className="text-xl font-heading font-bold text-primary">سجل الحضور التفصيلي</h2>
                <p className="text-sm text-on-surface-variant font-sans">الموظف : {selectedEmployee?.name}</p>
              </div> 
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-baseline items-center gap-4">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage <= 1}
                    className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline/10 hover:bg-surface-container hover:border-outline transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="الصفحة السابقة"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <span className="text-sm font-heading font-medium text-on-surface-variant">
                    صفحة <strong className="text-primary">{currentPage}</strong> من <strong>{totalPages}</strong>
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages}
                    className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline/10 hover:bg-surface-container hover:border-outline transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="الصفحة التالية"
                  >
                    <ChevronLeft size={18} />
                  </button>
                </div>
              )}
            </div>
            <button 
            onClick={()=>{ closeModals() ; setCurrentPage(1)}}
              className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Table Content */}
          <div className="overflow-auto flex-1 p-6">
            <table className="chronicle-table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>الحالة</th>
                  <th>وقت الدخول</th>
                  <th>وقت الخروج</th>
                  <th>الملاحظات / الأعذار</th>
                  <th>الخصم (ريال)</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((day, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CalendarIcon size={16} className="text-outline" />
                        <span>{day.date}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        day.status === 'ON_TIME' ? 'bg-primary/10 text-primary' :
                        day.status === 'LATE' ? 'bg-secondary/10 text-secondary' :
                        day.status === 'ABSENT' ? 'bg-error/10 text-error' :
                        day.status === 'EXCUSED' ? 'bg-surface-container-highest text-on-surface-variant' :
                        'bg-error/10 text-error'
                      }`}>
                        {day.status === 'ON_TIME' ? 'منضبط' :
                         day.status === 'LATE' ? 'متأخر' :
                         day.status === 'ABSENT' ? 'غائب' :
                         day.status === 'EXCUSED' ? 'معذور' : 'هروب'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <Clock size={16} />
                        <span>{day.checkIn || '---'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <Clock size={16} />
                        <span>{day.checkOut || '---'}</span>
                      </div>
                    </td>
                    <td className="text-on-surface-variant text-sm">
                      {day.excuseNotes || '---'}
                    </td>
                    <td className="font-bold font-sans">
                      {day.dayDeduction > 0 ? (
                        <span className="text-error">{day.dayDeduction}</span>
                      ) : (
                        <span className="text-outline">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
