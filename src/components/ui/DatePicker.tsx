"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, X, Calendar as CalendarIcon } from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { arSA } from 'date-fns/locale';

interface DatePickerProps {
  value: string; // yyyy-MM-dd
  onChange: (date: string) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder = 'بحث بتاريخ معين' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? parseISO(value) : new Date());
  
  const popoverRef = useRef<HTMLDivElement>(null);

  // تحديث التقويم ليطابق القيمة عند فتح النافذة
  useEffect(() => {
    if (isOpen && value) {
      setCurrentMonth(parseISO(value));
    }
  }, [isOpen, value]);

  // إغلاق النافذة عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // ─── منطق التقويم ──────────────────────────────────────────────────────────

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // الأحد هو بداية الأسبوع
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const dateFormat = 'yyyy-MM-dd';
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const selectedDateObj = value ? parseISO(value) : null;

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleDateClick = (date: Date) => {
    onChange(format(date, dateFormat));
    setIsOpen(false);
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  // ─── التصيير ───────────────────────────────────────────────────────────────

  return (
    <div className="relative flex items-center group" ref={popoverRef}>
      {/* ── حقل العرض (Trigger) ── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center w-full min-w-[180px] h-9 rounded-lg border
                   bg-surface-container-low text-sm font-sans transition-all text-right
                   ${isOpen ? 'border-primary ring-1 ring-primary/50 shadow-sm' : 'border-outline/20 hover:border-outline/40 shadow-sm'}
                   ${value ? 'text-on-surface' : 'text-outline'}`}
      >
        <Search size={16} className="absolute right-3 text-outline pointer-events-none" />
        
        <span className="pr-10 pl-9 w-full overflow-hidden text-ellipsis whitespace-nowrap">
          {value ? format(selectedDateObj!, 'dd MMMM yyyy', { locale: arSA }) : placeholder}
        </span>

        {value && (
          <div
            onClick={clearDate}
            className="absolute left-2 p-1 rounded-full bg-surface-container-highest text-on-surface-variant 
                       hover:bg-error/10 hover:text-error transition-colors cursor-pointer z-10"
            title="مسح التاريخ"
          >
            <X size={14} />
          </div>
        )}
      </button>

      {/* ── نافذة التقويم المنبثقة (Popover) ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 z-50 w-72 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] 
                       border border-outline/10 p-4 font-sans origin-top-right"
          >
            {/* Header: Month & Navigation */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={nextMonth} // لأن الواجهة عربي (RTL)، زر اليمين يعود للشهر السابق، واليسار للتالي.
                className="p-1.5 rounded-md hover:bg-surface-container-low text-on-surface-variant transition-colors"
                title="الشهر السابق"
              >
                <ChevronRight size={18} />
              </button>
              
              <h3 className="font-heading font-semibold text-primary select-none">
                {format(currentMonth, 'MMMM yyyy', { locale: arSA })}
              </h3>
              
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-md hover:bg-surface-container-low text-on-surface-variant transition-colors"
                title="الشهر التالي"
              >
                <ChevronLeft size={18} />
              </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'].map((day, idx) => (
                <div key={idx} className="text-center text-xs font-bold font-label text-outline mb-1 select-none">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                const isSelected = selectedDateObj && isSameDay(day, selectedDateObj);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isTodayDate = isToday(day);

                return (
                  <button
                    key={idx}
                    onClick={() => handleDateClick(day)}
                    disabled={!isCurrentMonth}
                    className={`
                      h-9 w-full flex justify-center items-center rounded-lg text-sm transition-all relative
                      ${!isCurrentMonth ? 'text-outline/40 cursor-not-allowed' : 'hover:bg-primary/10 text-on-surface cursor-pointer'}
                      ${isSelected ? 'bg-primary text-white font-bold shadow-md hover:bg-primary' : ''}
                      ${isTodayDate && !isSelected ? 'text-primary font-bold bg-primary/5' : ''}
                    `}
                  >
                    {format(day, 'd')}
                    {isTodayDate && !isSelected && (
                      <span className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 pt-3 border-t border-outline/10 flex justify-between">
              <button
                onClick={() => handleDateClick(new Date())}
                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <CalendarIcon size={12} />
                اليوم
              </button>
              <button
                onClick={(e) => clearDate(e as any)}
                className="text-xs font-bold text-error hover:text-error/80 transition-colors"
              >
                مسح
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
