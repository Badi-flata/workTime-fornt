"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Download,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  X
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { API } from '@/services/apiClient';
import { DatePicker } from '@/components/ui/DatePicker';
import { useEmployeeRecordStore } from '@/store/useEmployeeRecordStore';
import { EmployeesLest } from '@/components/ui/EmployeesLest';
import { UserAvatar } from '@/components/ui/UserAvatar';



export default function EmployeesDirectoryPage() {


  const {
    // data
    employees , selectedEmployee , reportSummary  , attendanceRecords   ,
    //filter and search
    periodMode , searchQuery , searchDate ,
    // loading 
    isLoadingEmployees ,isLoadingReport ,
    // messages
    errorMessage ,successMessage,
    // filter actions
     setSearchDate,setPeriodMode,setSearchQuery,
     closeMessage,
    // data actions
    fetchMyEmployee  , applyEmployee , fetchEmployeeAttendanceReport
   } = useEmployeeRecordStore();



  // UI states
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true); // Collapses vertically
  
  // Sidebar Search & Pagination
  const [SidebarPage, setSidebarPage] = useState(1);
  const sidebarItemsPerPage = 5;

  // Report Filter states
  
  // Metric Cards Filter State
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'LATE' | 'EXCUSED'| 'ABSENT' | 'DEDUCTED'>('ALL');

  // Table pagination
  const [tablePage, setTablePage] = useState(1);
  const tableItemsPerPage = 5;

  // Load subordinate
  useEffect(() => {
    fetchMyEmployee();
  }, []);

  // Fetch report data when selected employee, period mode, or search date changes
  useEffect(() => {
    if (!selectedEmployee) return;
    const dateAnchor =  searchDate || new Date().toISOString().split('T')[0]
    const employeeId = selectedEmployee.id || selectedEmployee?.userId;
    const mode = periodMode || "MONTHLY"

    fetchEmployeeAttendanceReport(dateAnchor,mode,employeeId)

    setTablePage(1); // Reset table page to 1 on filter/employee change
  }, [selectedEmployee, periodMode, searchDate]);

   // Auto clear message after 5 seconds
    useEffect(() => {
      if (successMessage || errorMessage) {
        const timer = setTimeout(() => {
          closeMessage();
        }, 5000);
        return () => clearTimeout(timer);
      }
    }, [successMessage, errorMessage, closeMessage]);

  // Sidebar Filter logic
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const name = emp.user?.fullName?.toLowerCase() || '';
      const email = emp.user?.email?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }, [employees, searchQuery]);

  // Sidebar Pagination logic
  const TotalSidebarPages = Math.ceil(filteredEmployees.length / sidebarItemsPerPage);
  const paginatedEmployees = useMemo(() => {
    const start = (SidebarPage - 1) * sidebarItemsPerPage;
    return filteredEmployees.slice(start, start + sidebarItemsPerPage);
  }, [filteredEmployees, SidebarPage]);

  // Table Filtering logic based on searchDate & statusFilter
  const filteredRecords = useMemo(() => {
    let result = attendanceRecords;

    // if (searchDate) {
    //   result = result.filter(rec => rec.date === searchDate);
    //     setTablePage(1);
    // }

    if (statusFilter === 'PRESENT') {
      result = result.filter(rec => rec.status === 'ON_TIME' || rec.status === 'LATE');
      setTablePage(1);
    } else if (statusFilter === 'LATE') {
      result = result.filter(rec => rec.status === 'LATE');
     setTablePage(1);
    } else if (statusFilter === 'EXCUSED') {
      result = result.filter(rec => rec.status === 'EXCUSED');
       setTablePage(1);
    
    } else if (statusFilter === 'ABSENT') {
      result = result.filter(rec => rec.status === 'ABSENT');
       setTablePage(1);
    } else if (statusFilter === 'DEDUCTED') {
      result = result.filter(rec => (rec.deduction ?? 0) > 0);
     setTablePage(1);
    }

    return result;
  }, [attendanceRecords, searchDate, statusFilter]);

  const totalTablePages = Math.ceil(filteredRecords.length / tableItemsPerPage);
  const tableStartIndex = (tablePage - 1) * tableItemsPerPage;

  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice(tableStartIndex, tableStartIndex + tableItemsPerPage);
  }, [filteredRecords, tableStartIndex]);



const handlerApply= (userId:string)=>{
  if(!paginatedEmployees || paginatedEmployees.length === 0)return;
    const emp = paginatedEmployees?.find((dat)=> dat?.userId === userId)
    if(emp) {
      applyEmployee(emp);}
  else{
    return;
  }
}

  const handleSearchDateChange = (date: string) => {
    setSearchDate(date);
  };

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
    <div className="max-w-container-max mx-auto mb-11 pb-3 space-y-6" dir="rtl">
      
        {/* Notifications Banner */}
                <AnimatePresence>
                  {(errorMessage || errorMessage ) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`"mb-6 p-4 rounded-xl z-99 mx-[8%]  max-md:mx-[18%]  absolute w-[50%] ${errorMessage  ? 'bg-red-50 border border-red-200 text-red-800' :
                         'bg-emerald-50 border border-emerald-200 text-emerald-800'} flex items-center justify-between shadow-sm`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${errorMessage ? 'bg-red-500' : 'bg-emerald-500'} text-white flex items-center justify-center shrink-0`}>
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-sm">{successMessage || errorMessage }</span>
                      </div>
                      <button
                        onClick={() => { closeMessage(); }}
                        className={`text-${errorMessage  ? 'text-red-600' : 'text-emerald-600'} hover:${errorMessage  ? 'text-red-600' : 'text-emerald-600'} transition-colors p-1 cursor-pointer`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

      {/* Page Header (Lined breadcrumb style) */}
      <div className="border-b border-outline-variant/20 pb-4">
        <h2 className="font-heading text-[32px] font-bold text-primary tracking-tight">سجل الحضور للموظفين</h2>
        <p className="font-body text-[16px] text-on-surface-variant mt-1">عرض وتدقيق سجلات الحضور والانصراف التفصيلية للمرؤوسين</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ─── Right Column: Subordinates List Card (SummaryAttendances Style) ─── */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <EmployeesLest

          setFilter={setStatusFilter}
          setZomOutZomOnLestBar={setIsSidebarExpanded}
          setQuery={setSearchQuery}
          setSidebarPage={setSidebarPage}
          applyEmployee={handlerApply}

          Employees={paginatedEmployees}
          zomOutZomOnLestBar={isSidebarExpanded}
          currentUserId={selectedEmployee?.userId}
          sidebarPage={SidebarPage}
          isLoading={isLoadingEmployees}
          totalSidebarPages={TotalSidebarPages}
          Query={searchQuery}

           />
        </div>

        {/* ─── Left Column: Selected Employee Attendance Log (8 cols) ─── */}
        <div className="lg:col-span-8 flex flex-col">
          <AnimatePresence mode="wait">
            {!selectedEmployee ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]"
              >
                <Users size={64} className="text-primary/20 mb-4" />
                <h3 className="text-xl font-heading font-semibold text-primary mb-2">سجل الحضور التفصيلي</h3>
                <p className="text-sm text-outline max-w-sm">
                  الرجاء تحديد موظف من قائمة موظفيك الجانبية لاستعراض كروت إحصائياته وسجل حضوره وانصرافه بالتفصيل.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={selectedEmployee.userId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Selected Employee Header Card */}
                <div className="bg-surface-container-lowest border border-primary/10 rounded-xl p-6 md:p-8 flex flex-col sm:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                  <div className="absolute -right-24 -top-24 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="flex items-center gap-6 relative z-10">
                    <UserAvatar
                      src={selectedEmployee?.user?.imageProfile}
                      name={selectedEmployee?.user?.fullName}
                      size={72}
                      className="border-2 border-primary/20 shadow-inner"
                    />
                    <div>
                      <h2 className="font-headline text-[24px] md:text-[32px] font-bold text-primary tracking-tight">
                        {selectedEmployee?.user?.fullName}
                      </h2>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="font-label text-[12px] text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full border border-outline-variant/30">
                          {selectedEmployee.user?.jobTitle || 'موظف'}
                        </span>
                        <span className="font-label text-[12px] text-primary flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          نشط في النظام
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Switch Period Options */}
                  <div className="relative z-10 flex flex-col items-center sm:items-end  gap-2 w-full sm:w-auto">
                    <div className="flex items-center bg-surface-container-low p-1.5 rounded-lg border border-outline-variant/30 w-auto  justify-center">
                      <button
                        onClick={() => setPeriodMode('WEEKLY')}
                        className={`px-6 py-1.5 rounded-md text-xs font-semibold font-label transition-all cursor-pointer ${
                          periodMode === 'WEEKLY'
                            ? 'bg-surface-container-lowest shadow-sm text-primary font-bold border border-outline-variant/10'
                            : 'text-on-surface-variant hover:text-primary'
                        }`}
                      >
                        أسبوعي
                      </button>
                      <button
                        onClick={() => setPeriodMode('MONTHLY')}
                        className={`px-6 py-1.5 rounded-md text-xs font-semibold font-label transition-all cursor-pointer ${
                          periodMode === 'MONTHLY'
                            ? 'bg-surface-container-lowest shadow-sm text-primary font-bold border border-outline-variant/10'
                            : 'text-on-surface-variant hover:text-primary'
                        }`}
                      >
                        شهري
                      </button>
                    </div>
                    <span className="text-[11px] text-outline font-label">
                      {periodMode === 'WEEKLY' ? 'التقرير الأسبوعي للموظف' : 'التقرير الشهري للموظف'}
                    </span>
                  </div>
                </div>

                {/* Date Filter & Search Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-surface-container-lowest
                 p-4 rounded-xl border border-outline-variant/20 shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-6 bg-primary rounded-full" />
                    <h4 className="font-headline text-[18px] text-primary font-bold">فلترة سجل الحضور بتاريخ معين</h4>
                  </div>
                  {/* PRE-MADE DatePicker Component Integration */}
                  <div className="w-full md:w-auto max-md:mr-5 md:ml-5 self-center flex items-center gap-2">
                    {searchDate && (
                      <button
                        onClick={() => setSearchDate('')}
                        className="px-3 py-1.5 text-xs bg-error/10 text-error rounded-lg hover:bg-error/20 transition-all font-label cursor-pointer"
                      >
                        عرض جميع الأيام ✕
                      </button>
                    )}
                    <DatePicker value={searchDate} onChange={handleSearchDateChange} placeholder="تصفية بيوم معين"  className=' md:translate-x-20'/>
                  </div>
                </div>

                {/* Metrics Bento Grid with Interactive Filtering */}
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {/* Department & Shift Info Card (non-interactive) */}
                  <div className="col-span-2 max-lg:col-span-4 bg-surface-container-lowest border
                   border-outline-variant/20 rounded-xl p-5 flex flex-col justify-center gap-4 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-3">
                      <span className="material-symbols-outlined text-primary text-[24px]">corporate_fare</span>
                      <div>
                        <p className="font-label text-[11px] text-on-surface-variant">القسم التابع له</p>
                        <p className="font-body text-[14px] font-semibold text-on-surface">
                          {selectedEmployee.shift?.departments?.name || 'الهندسة والتطوير'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary text-[24px]">schedule</span>
                      <div>
                        <p className="font-label text-[11px] text-on-surface-variant">الوردية المخصصة</p>
                        <p className="font-body text-[14px] font-semibold text-on-surface">
                          {selectedEmployee.shift?.name || 'صباحية'} ({selectedEmployee.shift?.startTime || '08:00'} - {selectedEmployee.shift?.endTime || '16:00'})
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* discipline rating */}
               <div className='col-span-4 grid grid-cols-2 justify-between w-full gap-3 '>
                  {/* Present Days Card (Filters: status = ON_TIME / LATE) */}
                  <div 
                    onClick={() => setStatusFilter(prev => prev === 'PRESENT' ? 'ALL' : 'PRESENT')}
                    className={`bg-surface-container-lowest border rounded-xl p-5 flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm cursor-pointer ${
                      statusFilter === 'PRESENT' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-outline-variant/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-label text-[11px] text-on-surface-variant">أيام الحضور</p>
                      <span className="material-symbols-outlined text-primary text-[20px]">how_to_reg</span>
                    </div>
                    <div className="flex items-end gap-1.5">
                      <span className="font-headline text-[32px] font-bold text-primary leading-none">
                        {reportSummary?.presentDays || 0}
                      </span>
                      <span className="font-label text-[11px] text-on-surface-variant pb-1">
                        / {reportSummary?.totalDays || 0} يوم
                      </span>
                    </div>
                  </div>

                  {/* Late occurrences Card (Filters: status = LATE) */}
                  <div 
                    onClick={() => setStatusFilter(prev => prev === 'LATE' ? 'ALL' : 'LATE')}
                    className={`bg-surface-container-lowest border rounded-xl p-5 flex flex-col justify-between hover:border-secondary/40 transition-all shadow-sm cursor-pointer ${
                      statusFilter === 'LATE' ? 'border-secondary ring-2 ring-secondary/20 bg-secondary/5' : 'border-outline-variant/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-label text-[11px] text-on-surface-variant">مرات التأخير</p>
                      <span className="material-symbols-outlined text-amber-500 text-[20px]">pending_actions</span>
                    </div>
                    <div className="flex items-end gap-1.5">
                      <span className="font-headline text-[32px] font-bold text-amber-500 leading-none">
                        {reportSummary?.lateDays || 0}
                      </span>
                      <span className="font-label text-[11px] text-on-surface-variant pb-1">مرة</span>
                    </div>
                  </div>

                  {/* Excuses / Absent Card (Filters: status = EXCUSED / ABSENT) */}
                  <div 
                    onClick={() => setStatusFilter(prev => prev === 'EXCUSED' ? 'ALL' : 'EXCUSED')}
                    className={`bg-surface-container-lowest border rounded-xl p-5 flex flex-col justify-between hover:border-tertiary/40 transition-all shadow-sm cursor-pointer ${
                      statusFilter === 'EXCUSED' ? 'border-tertiary ring-2 ring-tertiary/20 bg-tertiary/5' : 'border-outline-variant/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-label text-[11px] text-on-surface-variant">أعذار مقبولة / غياب</p>
                      <span className="material-symbols-outlined text-tertiary text-[20px]">badge</span>
                    </div>
                    <div className="flex items-end gap-1.5">
                      <span className="font-headline text-[32px] font-bold text-tertiary leading-none">
                        {reportSummary?.excusedDays || 0}
                      </span>
                     <span className="font-label text-[10px] font-semibold text-tertiary/80 uppercase">يوم</span>
                    </div>
                  </div>

                  {/* Total Deductions Card (Filters: deduction > 0) */}
                  <div 
                    onClick={() => setStatusFilter(prev => prev === 'ABSENT' ? 'ALL' : 'ABSENT')}
                    className={`bg-surface-container-lowest border rounded-xl p-5 flex flex-col justify-between hover:border-orange-600/40 transition-all shadow-sm cursor-pointer bg-orange-600/5 ${
                      statusFilter === 'ABSENT' ? 'border-orange-600 ring-2 ring-orange-600/20 bg-orange-600/5' : 'border-outline-variant/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-label text-[11px] text-on-surface-variant">إجمالي ايام الغياب</p>
                      <span className="material-symbols-outlined text-orange-600 text-[20px]">not_interested</span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="font-headline text-[32px] font-bold text-orange-600 leading-none">
                        {reportSummary?.absentDays || 0}
                      </span>
                      <span className="font-label text-[10px] font-semibold text-orange-600/80 uppercase">مرة</span>
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
                        {reportSummary?.deductionDays || 0}
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
                        {reportSummary?.totalDeductions || 0}
                      </span>
                      <span className="font-label text-[10px] font-semibold text-error/80 uppercase">SAR</span>
                    </div>
                </div>
 
               </div>
             </div>

                {/* Detailed Data Table Section */}
                <div className="bg-surface-container-lowest px-6 w-full border border-outline-variant/20 rounded-xl overflow-hidden flex flex-col gap-6 shadow-sm">
                  <div className="p-5 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container/5">
                    <div className="flex flex-wrap items-center gap-4">
                      <h3 className="font-headline text-[20px] text-primary font-bold">سجلات الحضور اليومية المفصلة</h3>
                      
                      {/* Active Filter Reset indicator */}
                      {statusFilter !== 'ALL' && (
                        <button
                          onClick={() => setStatusFilter('ALL')}
                          className="p-3  bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs font-semibold rounded-md transition-colors cursor-pointer"
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
                    <button className="p-2 border border-outline-variant/30 rounded-md text-on-surface-variant hover:text-primary hover:border-primary/50 transition-colors flex items-center justify-center cursor-pointer shadow-sm bg-white">
                      <Download size={18} />
                    </button>
                  </div>

                  {isLoadingReport ? (
                    <div className="flex flex-col  items-center justify-center py-20 gap-3">
                      <div className="w-10 h-10 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
                      <span className="text-sm text-outline font-label">جاري جلب سجل الحضور...</span>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-scroll mx-auto mb-6  w-full rounded-lg">
                        <table className="chronicle-table min-w-full text-right font-sans" dir="rtl">
                          <thead>
                            <tr>
                              <th className="p-4 text-right text-primary font-semibold border-b border-outline-variant/20 font-label w-40">التاريخ</th>
                              <th className="p-4 text-right text-primary font-semibold border-b border-outline-variant/20 font-label w-24">الحالة</th>
                              <th className="p-4 text-right text-primary font-semibold border-b border-outline-variant/20 font-label w-24">الدخول</th>
                              <th className="p-4 text-right text-primary font-semibold border-b border-outline-variant/20 font-label w-24">الخروج</th>
                              <th className="p-4 text-right text-primary font-semibold border-b border-outline-variant/20 font-label w-28">ساعات العمل</th>
                              <th className="p-4 text-right text-primary font-semibold border-b border-outline-variant/20 font-label w-24">التأخير</th>
                              <th className="p-4 text-right text-primary font-semibold border-b border-outline-variant/20 font-label w-24">الخصم</th>
                              <th className="p-4 text-right text-primary font-semibold border-b border-outline-variant/20 font-label">الملاحظات والأعذار</th>
                            </tr>
                          </thead>
                          <tbody>
                            <AnimatePresence mode="wait">
                              {paginatedRecords.length > 0 || filteredRecords.length>0  ? (
                                (paginatedRecords.length > 0? paginatedRecords: filteredRecords).map((rec, index) => {
                                  const dayName = getDayName(rec.date);
                                  const formattedDate = formatDateString(rec.date);
                                  return (
                                    <motion.tr
                                      key={rec.attendanceId || rec.date}
                                      initial={{ opacity: 0, y: 8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0 }}
                                      transition={{ delay: index * 0.03, duration: 0.22 }}
                                      className="hover:bg-surface-container-low transition-colors"
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
                      {totalTablePages > 1 && (
                        <div className="p-4 border-t mb-5 border-outline-variant/10 flex items-center justify-between bg-surface/50 font-label" dir="rtl">
                          <span className="text-xs text-outline">
                            عرض {tableStartIndex + 1} إلى {Math.min(tableStartIndex + tableItemsPerPage, filteredRecords.length)} من {filteredRecords.length} سجل
                          </span>
                          
                          <div className="flex gap-2 items-center">
                            <button
                              onClick={() => setTablePage(p => Math.max(p - 1, 1))}
                              disabled={tablePage === 1}
                              className="p-1 rounded border border-outline-variant/30 hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-primary"
                            >
                              <ChevronRight size={16} />
                            </button>
                            
                            <div className="flex gap-1">
                              {Array.from({ length: totalTablePages }, (_, i) => i + 1).map(pageNo => (
                                <button
                                  key={pageNo}
                                  onClick={() => setTablePage(pageNo)}
                                  className={`w-7 h-7 rounded text-xs font-semibold transition-all cursor-pointer ${
                                    tablePage === pageNo
                                      ? 'bg-primary text-white font-bold'
                                      : 'border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container'
                                  }`}
                                >
                                  {pageNo}
                                </button>
                              ))}
                            </div>

                            <button
                              onClick={() => setTablePage(p => Math.min(p + 1, totalTablePages))}
                              disabled={tablePage === totalTablePages}
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
            )}
          </AnimatePresence>
        </div>
        
      </div>
    </div>
  );
}
