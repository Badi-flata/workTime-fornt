"use client";

import { UserAvatar } from '@/components/ui/UserAvatar';
import { useEmployeeRecordStore } from '@/store/useEmployeeRecordStore';
import { useProfileStore } from '@/store/useProfileStore';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ChevronLeft, ChevronRight, Download, LayoutDashboard, X } from 'lucide-react';
import { useEmployeeDashboardStore } from '@/store/useEmployeeDashboardStore';
import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/useAuthStore';
import { DatePicker } from '@/components/ui/DatePicker';
import { GeneralEvaluationCard } from '@/components/ui/GeneralEvaluationCard';
import { ModesTabs } from '@/components/ui/ModesTabs';

// ── Label maps ────────────────────────────────────────────────────
  const TAB_LABEL: Record<string, string> = {
    ALL: 'الكل', DAILY: 'يومي', WEEKLY: 'أسبوعي', MONTHLY: 'شهري',  
  };

  const STATUS_LABELS: Record<string, string> = {
    ALL: 'الكل', ON_TIME: 'حاضر', LATE: 'متأخر',
    ABSENT: 'غياب', EXCUSED: 'معذور', ESCAPY: 'هروب',
    DEDUCTED: 'مخصوم', EARLY_LEAVE: 'خروج مبكر',
  };

  const DISCIPLINE_LABELS: Record<string, string> = {
    ALL: 'الكل', EXCELLENT: 'ممتاز', VERY_GOOD: 'جيد جداً',
    GOOD: 'جيد', NEEDS_IMPROVEMENT: 'متدني',
  };


export default function EmployeeDashboardPage() {

   const { 
    periodLabel,
    fullName, imageProfile, jobTitle,phone , email,departmentName, 
    managerName ,shift,salary,

    dsicipline, summary , daysLog, mode, dateAnchor,
     messageSuccessd , isLoading, error, 
    
     fetchDashboardEmployee , 
     clearMessages,
     setFiltersDate,
     setFiltersMode,
     
   } = useEmployeeDashboardStore()
 const {user }= useAuthStore()

 const [customMessage , setCustomMessage] = useState<string|null>(null)
 const [currentPage , setCurrentPage] = useState<number>(1)
 const [searchQueryDate , setSearchQueryDate] = useState<string>("")
 const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'LATE' | 'EXCUSED'| 'ABSENT' | 'DEDUCTED'>('ALL');
 const [EmplsIds, setEmplsIds] = useState<string[]>([]);

 const roleAdmin = user?.role === "SUPER_ADMIN"
 const days = summary?.totalDays|| 0
 useEffect(()=>{
  if(roleAdmin && typeof window !== 'undefined'){
      const data = window.localStorage.getItem("employeeId")
      const id = data && data !== "" ? JSON.parse(data as string) : [];
      setEmplsIds(id);
    }
   },[roleAdmin])

   
   const targetEmployeeId =  roleAdmin && EmplsIds && EmplsIds.length > 0 ? EmplsIds[0] : (user?.id || "") ;
   
  

    
    useEffect( ()=> {
   if (typeof window === 'undefined' )return;

     if(EmplsIds.length > 0 && targetEmployeeId){
      fetchDashboardEmployee(mode,dateAnchor,targetEmployeeId);
    
     }else{
      fetchDashboardEmployee(mode,dateAnchor)
    
     }
   },[mode,dateAnchor,targetEmployeeId ,fetchDashboardEmployee]);



   // Filter Date &  Attendance Reports Logic ـــــــــــــــــــــــــــــــــ
    const filteredAttendanceReports = useMemo(() => {
     if (!searchQueryDate.trim()) return daysLog;
     const filt= daysLog.filter(atte => {
       const date = atte.date || '';
       const query = searchQueryDate;
       return Date.parse(date) === Date.parse(query) ;
   });

   // setTotalDays(filt.length)
   return filt;
 }, [daysLog, searchQueryDate ]);

  // Auto clear message after 5 seconds
  useEffect(() => {
    if (messageSuccessd || error  ) {
      const timer = setTimeout(() => {
        clearMessages();
       
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [messageSuccessd, error, clearMessages ]);

 // Table Filtering logic based on searchDate & statusFilter
 const filteredRecords = useMemo(() => {
   let result = filteredAttendanceReports;

   if (searchQueryDate) {
     result = result.filter(rec => rec.date === searchQueryDate);
            setCurrentPage(1);

   }

   if (statusFilter === 'PRESENT') {
     result = result.filter(rec => rec.status === 'ON_TIME' || rec.status === 'LATE');
      setCurrentPage(1);

   } else if (statusFilter === 'LATE') {
     result = result.filter(rec => rec.status === 'LATE');
      setCurrentPage(1);
 
   } else if (statusFilter === 'EXCUSED') {
     result = result.filter(rec => rec.status === 'EXCUSED' );
      setCurrentPage(1);

   } else if (statusFilter === 'ABSENT') {
     result = result.filter(rec => rec.status === 'ABSENT');
      setCurrentPage(1);
     
   } else if (statusFilter === 'DEDUCTED') {
     result = result.filter(rec => (rec.deduction ?? 0) > 0);
      setCurrentPage(1);
   }
    //  setTotalDays(result.length)
   return result;
 }, [filteredAttendanceReports, searchQueryDate, statusFilter ]);

  

    const itemsPerPage = 5;
    const totalPages = Math.ceil( filteredRecords?.length  / itemsPerPage );

    const attendanceReports = useMemo(() =>{
    const startIndex = (currentPage- 1) * itemsPerPage;
    return filteredRecords?.slice(startIndex, startIndex + itemsPerPage) || [];
      },[filteredRecords,currentPage ,searchQueryDate,statusFilter]);
  
    

 // format Date and day name ــــــــــــــــــــــــــــــــــــ
 const getDayName = (dateStr: string) => {
    try {
      const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const date = new Date(dateStr);
      return days[date.getDay()];
    } catch {
      return '';
    }
  };

    const formatDateString = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ar-EG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };
   
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ON_TIME':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-semibold bg-[#e6f4ea] text-[#137333] border border-[#137333]/20">
            حاضر
          </span>
        );
      case 'LATE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-semibold bg-[#fef7e0] text-[#b06000] border border-[#b06000]/20">
            متأخر
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-semibold bg-error/10 text-error border border-error/20">
            غياب
          </span>
        );
      case 'EXCUSED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-semibold bg-[#e8f0fe] text-[#1a73e8] border border-[#1a73e8]/20">
            معذور
          </span>
        );
      case 'ESCAPY':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-semibold bg-[#fce8e6] text-[#c5221f] border border-[#c5221f]/20">
            خروج مبكر
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-semibold bg-outline/10 text-on-surface-variant border border-outline/20">
            {status}
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
    >
      
  {/* Notifications Banner */}
          <AnimatePresence>
            {(error  ||  messageSuccessd) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`"mb-6 p-4 rounded-xl z-99 mx-[8%]  max-md:mx-[18%]  absolute w-[50%] ${error  ? 'bg-red-50 border border-red-200 text-red-800' :
                   'bg-emerald-50 border border-emerald-200 text-emerald-800'} flex items-center justify-between shadow-sm`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${error  ? 'bg-red-500' : 'bg-emerald-500'} text-white flex items-center justify-center shrink-0`}>
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-sm">{error ||  messageSuccessd}</span>
                </div>
                <button
                  onClick={() => {  clearMessages(); }}
                  className={`text-${error  ? 'text-red-600' : 'text-emerald-600'} hover:${error  ? 'text-red-600' : 'text-emerald-600'} transition-colors p-1 cursor-pointer`}
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

      {/* Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/20 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-6 bg-primary rounded-full" />
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-on-surface tracking-tight">لوحة تحكم الموظف</h2>
          </div>
          <p className="text-on-surface-variant font-body text-sm md:text-base">ملخص الأداء والبيانات الشخصية وسجلات الحضور والإنصراف الفردية.</p>
        </div>
        <div className="flex flex-col items-center sm:items-end gap-1.5">
          <span className="text-sm text-outline font-label uppercase tracking-wider">{`تحديث: ${periodLabel}`}</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
            النطاق الحالي: {TAB_LABEL[mode] || mode}
          </span>
        </div>
      </header>

      {/* Profile Banner Card */}
      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all duration-300 hover:border-primary/20">
        {/* Decorative blur effect */}
        <div className="absolute -right-24 -top-24 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-24 -bottom-24 w-64 h-64 bg-secondary-container/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
          <UserAvatar
            src={imageProfile}
            name={fullName}
            size={80}
            className="border-2 border-primary/20 shadow-sm shrink-0"
          />
          <div className="min-w-0">
            <h2 className="font-heading text-xl md:text-2xl font-bold text-primary tracking-tight truncate">
              {fullName}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="font-label text-xs text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full border border-outline-variant/30 font-medium">
                {jobTitle || 'موظف'}
              </span>
              <span className="font-label text-xs text-primary flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                نشط في النظام
              </span>
            </div>
          </div>
        </div>

        {/* Department & Manager Info */}
        <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full md:w-auto mt-2 md:mt-0">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs md:text-sm font-medium text-on-surface-variant w-full sm:w-auto">
            <span className="material-symbols-outlined text-[18px] text-primary">badge</span>
            <span className="text-outline">المدير المباشر:</span>
            <span className="font-bold text-on-surface">{managerName || 'غير محدد'}</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs md:text-sm font-medium text-on-surface-variant w-full sm:w-auto">
            <span className="material-symbols-outlined text-[18px] text-primary">corporate_fare</span>
            <span className="text-outline">القسم:</span>
            <span className="font-bold text-on-surface">{departmentName || 'غير محدد' }</span>
          </div>
        </div>
      </div>

      {/* Bento Grid: Personal Details, Attendance Summary, Discipline Evaluation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Personal Details */}
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-6 flex flex-col justify-between gap-5 shadow-sm hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/20">
            <span className="w-1.5 h-5 bg-primary rounded-full" />
            <h4 className="font-heading text-lg font-bold text-on-surface">التفاصيل الشخصية والعملية</h4>
          </div>
          
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {/* Email */}
            <div className="flex items-center justify-between gap-2 py-1.5 border-b border-outline-variant/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">mail</span>
                <span className="text-on-surface-variant text-sm font-medium">البريد الإلكتروني</span>
              </div>
              <span className="text-on-surface font-sans text-sm break-all font-semibold" title={email}>{email || '—'}</span>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between gap-2 py-1.5 border-b border-outline-variant/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">phone</span>
                <span className="text-on-surface-variant text-sm font-medium">رقم الهاتف</span>
              </div>
              <span className="text-on-surface font-mono text-sm font-semibold">{phone || '—'}</span>
            </div>

            {/* Shift */}
            <div className="flex items-center justify-between gap-2 py-1.5 border-b border-outline-variant/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">work_history</span>
                <span className="text-on-surface-variant text-sm font-medium">الوردية الحالية</span>
              </div>
              <span className="text-on-surface text-sm font-semibold">{shift || '—'}</span>
            </div>

            {/* Salary */}
            <div className="flex items-center justify-between gap-2 py-1.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">payments</span>
                <span className="text-on-surface-variant text-sm font-medium">الراتب الأساسي</span>
              </div>
              <span className="text-on-surface font-mono text-sm font-bold">{salary || '—'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Attendance Summary */}
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-6 flex flex-col justify-between gap-5 shadow-sm hover:border-secondary/30 transition-all duration-300">
          <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/20">
            <span className="w-1.5 h-5 bg-secondary rounded-full" />
            <h4 className="font-heading text-lg font-bold text-on-surface">ملخص الفترة الحالية</h4>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {/* Total Scheduled Days */}
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
              <span className="text-on-surface-variant text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
                أيام العمل المقررة
              </span>
              <span className="font-heading font-bold text-lg text-on-surface">{summary?.totalDays ?? 0} يوم</span>
            </div>

            {/* Present Days */}
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
              <span className="text-on-surface-variant text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">task_alt</span>
                أيام الحضور الفعلي
              </span>
              <span className="font-heading font-bold text-lg text-on-surface">
                {summary?.onTimeDays ?? 0}
                <span className="text-sm font-normal text-outline"> / {summary?.totalDays ?? 0} يوم</span>
              </span>
            </div>

            {/* Total Worked Hours */}
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
              <span className="text-on-surface-variant text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">query_builder</span>
                إجمالي ساعات العمل
              </span>
              <span className="font-heading font-bold text-lg text-on-surface">
                {summary?.totalWorkedHours ?? 0} <span className="text-xs font-normal text-outline">ساعة</span>
              </span>
            </div>

            {/* Total Delay Minutes */}
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-error">history</span>
                إجمالي دقائق التأخير
              </span>
              <span className="font-heading font-bold text-lg text-error">
                {summary?.totalDelayMinutes ?? 0} <span className="text-xs font-normal text-outline">دقيقة</span>
              </span>
            </div>
            
            {/* Attendance Rate Progress bar */}
            <div className="pt-2">
              <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-500" 
                  style={{ width: `${summary?.totalDays ? Math.round(((summary?.onTimeDays ?? 0) / summary.totalDays) * 100) : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-outline mt-1 font-label">
                <span>معدل نسبة الحضور</span>
                <span>
                  {summary?.totalDays ? Math.round(((summary?.onTimeDays ?? 0) / summary.totalDays) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Discipline Rate */}
        <div className="md:col-span-2 lg:col-span-1 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 px-1">
            <span className="w-1.5 h-5 bg-tertiary rounded-full" />
            <h4 className="font-heading text-lg font-bold text-on-surface">معدل الانضباط العام</h4>
          </div>
          <div className="flex-1">
            <GeneralEvaluationCard
              disciplineRate={dsicipline?.rate ?? 0} 
              overallRating={dsicipline?.label}
            />
          </div>
        </div>
      </div>

      {/* Date Filter & Tools Line */}
      <div className="flex flex-col lg:flex-row w-full justify-between items-center gap-6 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-[0_2px_10px_rgba(0,0,0,0.01)] transition-all duration-300 hover:border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-primary rounded-full" />
          <h4 className="font-heading text-base md:text-lg text-primary font-bold">تصفية سجل الحضور وتحديد النطاق</h4>
        </div>
        
        <div className="flex flex-col sm:flex-row md:justify-around items-center gap-4 w-full lg:w-auto">
          {/* Filters Modes Switcher */}
          <div className="flex flex-col items-center sm:items-end gap-1 w-auto sm:w-auto">
            <div className="flex items-center bg-surface-container-low p-1.5 rounded-lg border border-outline-variant/30 w-full sm:w-auto justify-center">
              <button
                onClick={() => setFiltersMode('WEEKLY')}
                className={`px-5 py-1.5 rounded-md text-xs font-bold font-label transition-all duration-200 cursor-pointer ${
                  mode === 'WEEKLY'
                    ? 'bg-surface-container-lowest shadow-sm text-primary font-black border border-outline-variant/10'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                أسبوعي
              </button>
              <button
                onClick={() => setFiltersMode('MONTHLY')}
                className={`px-5 py-1.5 rounded-md text-xs font-bold font-label transition-all duration-200 cursor-pointer ${
                  mode === 'MONTHLY'
                    ? 'bg-surface-container-lowest shadow-sm text-primary font-black border border-outline-variant/10'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                شهري
              </button>
            </div>
          </div>

          {/* Date Picker */}
          <div className="relative w-full sm:w-auto flex justify-center">
            <DatePicker 
              value={dateAnchor} 
              onChange={setFiltersDate} 
              placeholder="تصفية يوم معين" 
              className="w-full sm:w-auto animate-none"
            />
          </div>
        </div>
      </div>

        {/* deductions filter cards */}
          <div
              className="col-span-4 lg:col-span-6 bg-surface-container-lowest border
              border-outline-variant/20 rounded-xl p-5 flex max-[450px]:flex-col  justify-between max-md:justify-center gap-4 shadow-sm">
            <div 
            onClick={() => setStatusFilter(prev => prev === 'DEDUCTED' ? 'ALL' : 'DEDUCTED')}
            className={`bg-surface-container-lowest shrink-1 border rounded-xl p-5 flex flex-col justify-between hover:border-error/40 transition-all shadow-sm cursor-pointer w-2/2 bg-error-container/5 ${
                statusFilter === 'DEDUCTED' ? 'border-error ring-2 ring-error/20 bg-error/5' : 'border-outline-variant/20'
              }`} >
                <div className="flex justify-between items-start mb-2">
                <p className="font-label text-[11px] text-on-surface-variant">إجمالي أيام الخصم</p>
                <span className="material-symbols-outlined text-error text-[20px]">calendar_month</span>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="font-headline text-[32px] font-bold text-error leading-none">
                  {summary?.deductionDays || 0}
                </span>
                <span className="font-label text-[10px] font-semibold text-error/80 uppercase">أيام</span>
              </div>
            </div>

            <div 
            className={`bg-surface-container-lowest shrink-0 border rounded-xl p-5 
            flex flex-col justify-between hover:border-error/40 transition-all
            shadow-sm cursor-pointer w-1/3 max-[450px]:w-2/2 bg-error-container/5 `
              }>
                <div className="flex justify-between items-start w-full mb-2">
                <p className="font-label text-[11px] text-on-surface-variant">إجمالي الخصومات</p>
                <span className="material-symbols-outlined text-error text-[20px]">payments</span>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="font-headline text-[32px] font-bold text-error leading-none">
                  {summary?.totalDeductions || 0}
                </span>
                <span className="font-label text-[10px] font-semibold text-error/80 uppercase">SAR</span>
              </div>
          </div>

          </div>

      {/* Metrics Cards (Clickable Filters) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Present Days Card */}
        <div 
          onClick={() => setStatusFilter(prev => prev === 'PRESENT' ? 'ALL' : 'PRESENT')}
          className={`bg-surface-container-lowest border rounded-xl p-5 flex flex-col justify-between hover:border-primary/40 transition-all duration-200 shadow-sm cursor-pointer ${
            statusFilter === 'PRESENT' 
              ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
              : 'border-outline-variant/20 hover:bg-surface-container-low/30'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <p className="font-label text-xs font-bold text-on-surface-variant">أيام الحضور</p>
            <span className="material-symbols-outlined text-primary text-[20px]">how_to_reg</span>
          </div>
          <div className="flex items-end gap-1.5">
            <span className="font-heading text-2xl md:text-3xl font-bold text-primary leading-none">
              {summary?.onTimeDays || 0}
            </span>
            <span className="font-label text-xs text-on-surface-variant pb-1">
              / {summary?.totalDays || 0} يوم
            </span>
          </div>
        </div>

        {/* Late occurrences Card */}
        <div 
          onClick={() => setStatusFilter(prev => prev === 'LATE' ? 'ALL' : 'LATE')}
          className={`bg-surface-container-lowest border rounded-xl p-5 flex flex-col justify-between hover:border-secondary/40 transition-all duration-200 shadow-sm cursor-pointer ${
            statusFilter === 'LATE' 
              ? 'border-secondary ring-2 ring-secondary/20 bg-secondary/5' 
              : 'border-outline-variant/20 hover:bg-surface-container-low/30'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <p className="font-label text-xs font-bold text-on-surface-variant">مرات التأخير</p>
            <span className="material-symbols-outlined text-secondary text-[20px]">pending_actions</span>
          </div>
          <div className="flex items-end gap-1.5">
            <span className="font-heading text-2xl md:text-3xl font-bold text-secondary leading-none">
              {summary?.lateDays || 0}
            </span>
            <span className="font-label text-xs text-on-surface-variant pb-1">مرة</span>
          </div>
        </div>

        {/* Excuses / Absent Card */}
        <div 
          onClick={() => setStatusFilter(prev => prev === 'EXCUSED' ? 'ALL' : 'EXCUSED')}
          className={`bg-surface-container-lowest border rounded-xl p-5 flex flex-col justify-between hover:border-tertiary/40 transition-all duration-200 shadow-sm cursor-pointer ${
            statusFilter === 'EXCUSED' 
              ? 'border-tertiary ring-2 ring-tertiary/20 bg-tertiary/5' 
              : 'border-outline-variant/20 hover:bg-surface-container-low/30'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <p className="font-label text-xs font-bold text-on-surface-variant">أعذار مقبولة / غياب</p>
            <span className="material-symbols-outlined text-tertiary text-[20px]">event_busy</span>
          </div>
          <div className="flex items-end gap-1.5">
            <span className="font-heading text-2xl md:text-3xl font-bold text-tertiary leading-none">
              {summary?.excusedDays || 0}
            </span>
            <span className="font-label text-xs text-on-surface-variant pb-1">
              ({summary?.absentDays || 0} غياب)
            </span>
          </div>
        </div>

       
      </div>

      {/* Detailed Data Table Section  */}
      <div className="bg-surface-container-lowest p-6 mb-8 w-full border border-outline-variant/20 rounded-xl overflow-hidden flex flex-col gap-6 shadow-sm">
        <div className="p-4 border-b border-outline-variant/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container/5 rounded-t-lg">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-heading text-lg md:text-xl text-primary font-bold">سجلات الحضور اليومية المفصلة</h3>
            
            {/* Active Filter Reset indicator */}
            {statusFilter !== 'ALL' && (
              <button
                onClick={() => setStatusFilter('ALL')}
                className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-[11px] font-bold rounded-md transition-colors cursor-pointer"
              >
                إعادة تعيين الفلتر النشط ({
                  statusFilter === 'PRESENT' ? 'الحاضرين' :
                  statusFilter === 'LATE' ? 'المتأخرين' :
                  statusFilter === 'EXCUSED' ? 'المعذورين' :
                  statusFilter === 'ABSENT' ? 'الغائبين' :
                  statusFilter === 'DEDUCTED' ? 'المخصوم منهم' : ''
                }) ✕
              </button>
            )}
          </div>
          <button className="p-2 border border-outline-variant/30 rounded-md text-on-surface-variant hover:text-primary hover:border-primary/50 transition-colors flex items-center justify-center cursor-pointer shadow-sm bg-white shrink-0">
            <Download size={18} />
          </button>
        </div>

        {isLoading && filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
            <span className="text-sm text-outline font-label">جاري جلب سجل الحضور...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto w-full rounded-lg">
              <table className="chronicle-table m-auto w-auto text-right font-sans" dir="rtl">
                <thead>
                  <tr>
                    <th className="p-4 text-right text-primary font-bold border-b border-outline-variant/20 font-label w-40">التاريخ</th>
                    <th className="p-4 text-right text-primary font-bold border-b border-outline-variant/20 font-label w-24">الحالة</th>
                    <th className="p-4 text-right text-primary font-bold border-b border-outline-variant/20 font-label w-24">الدخول</th>
                    <th className="p-4 text-right text-primary font-bold border-b border-outline-variant/20 font-label w-24">الخروج</th>
                    <th className="p-4 text-right text-primary font-bold border-b border-outline-variant/20 font-label w-28">ساعات العمل</th>
                    <th className="p-4 text-right text-primary font-bold border-b border-outline-variant/20 font-label w-24">التأخير</th>
                    <th className="p-4 text-right text-primary font-bold border-b border-outline-variant/20 font-label w-24">الخصم</th>
                    <th className="p-4 text-right text-primary font-bold border-b border-outline-variant/20 font-label">الملاحظات والأعذار</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="wait">
                    {(attendanceReports.length > 0 || filteredRecords.length > 0) ? (
                      (attendanceReports.length > 0 ? attendanceReports : filteredRecords).map((rec, index) => {
                        const dayName = getDayName(rec.date);
                        const formattedDate = formatDateString(rec.date);
                        return (
                          <motion.tr
                            key={rec.attendanceId || rec.date}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: index * 0.03, duration: 0.22 }}
                            className="hover:bg-surface-container-low transition-colors animate-none"
                          >
                            <td className="p-4 border-b border-outline-variant/10 align-middle">
                              <div className="flex flex-col">
                                <span className="font-semibold text-on-surface">{dayName}</span>
                                <span className="font-label text-[12px] text-outline mt-0.5">{formattedDate}</span>
                              </div>
                            </td>
                            <td className="p-4 border-b border-outline-variant/10 align-middle font-label">
                              {getStatusBadge(rec.status)}
                            </td>
                            <td className="p-4 border-b border-outline-variant/10 font-sans text-sm tabular-nums text-on-surface-variant align-middle" dir="ltr">
                              {rec.checkIn || '—'}
                            </td>
                            <td className="p-4 border-b border-outline-variant/10 font-sans text-sm tabular-nums text-on-surface-variant align-middle" dir="ltr">
                              {rec.checkOut || '—'}
                            </td>
                            <td className="p-4 border-b border-outline-variant/10 font-sans text-sm tabular-nums text-on-surface-variant align-middle" dir="ltr">
                              {rec.totalWorkedHours ? `${rec.totalWorkedHours} ساعة` : '—'}
                            </td>
                            <td className="p-4 border-b border-outline-variant/10 font-sans text-sm tabular-nums text-on-surface-variant align-middle" dir="ltr">
                              {(rec.lateMinutes ?? 0) > 0 ? `${rec.lateMinutes} دقيقة` : '—'}
                            </td>
                            <td className="p-4 border-b border-outline-variant/10 font-sans text-sm tabular-nums text-error font-bold align-middle" dir="ltr">
                              {(rec.deduction ?? 0) > 0 ? `${rec.deduction} ر.س` : '—'}
                            </td>
                            <td className="p-4 border-b border-outline-variant/10 text-on-surface-variant text-sm align-middle font-label">
                              {rec.excuseNotes || rec.adminNotes || '—'}
                            </td>
                          </motion.tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-16 text-center text-outline font-label text-sm">
                          لا توجد سجلات حضور مسجلة للموظف في هذه الفئة.
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Table Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-label bg-surface/50" dir="rtl">
                <span className="text-xs text-outline">
                  عرض {(currentPage - 1) * itemsPerPage + 1} إلى {Math.min((currentPage - 1) * itemsPerPage + itemsPerPage, filteredRecords.length)} من {filteredRecords.length} سجل
                </span>
                
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded border border-outline-variant/30 hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-primary"
                  >
                    <ChevronRight size={16} />
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNo => (
                      <button
                        key={pageNo}
                        onClick={() => setCurrentPage(pageNo)}
                        className={`w-7 h-7 rounded text-xs font-semibold transition-all cursor-pointer ${
                          currentPage === pageNo
                            ? 'bg-primary text-white font-bold'
                            : 'border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        {pageNo}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded border border-outline-variant/30 hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-primary"
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </motion.div>
  );
}
