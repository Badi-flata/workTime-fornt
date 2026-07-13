"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCheckAttendStore } from '../../../store/useCheckAttendStore';
import { ModesTabs } from '../../../components/ui/ModesTabs';
import { ShiftCountdown } from '@/components/ui/ShiftCountdown';
import { DatePicker } from '@/components/ui/DatePicker';
import { SummaryAttendances } from '../../../components/ui/summaryAttendances';
import { format } from 'date-fns';
import clsx from 'clsx';

const TAB_LABEL: Record<string, string> = {
  WEEKLY: ' أسبوعي',
  MONTHLY: 'شهري',
};
const STATUS_LABELS: Record<string, string> = {
   ON_TIME: 'حاضر مبكر', LATE: 'متأخر',
  ABSENT: 'غياب', EXCUSED: 'معذور', ESCAPY: 'هروب',
};
export default function AttendanceReportsPage() {
  const { user } = useAuthStore();

  const [showShiftDetails, setShowShiftDetails] = useState(false);
  const [hideMessage, setHideMessage] = useState(false);
  
  const [shiftEnd, setShiftEnd] = useState(false);
  const [hasNearWorkTime, setHasNearWorkTime] = useState(false);

  const [notes, setNotes] = useState("");
   const [garceOut, setGarceOut] = useState(false);// Client-side time state
 
  const {
    matercis, dateAnchor,mainSourceData, currentPage,
    checkValue,error, isLoading ,employeeIds , activeTab,
    message, 
    PeriodSummary, fetchSourceData, setActiveTab,
    applyDay,setDateAnchor,
     CheckIn, CheckOut, setTogglePage, setEmployeeIds
  } = useCheckAttendStore();

   // ── get default or source data to today ───────────────────────────────────────────────────────────

  const role = user?.role === "SUPER_ADMIN";

  const getCachValue    = typeof window !== 'undefined' ? window.localStorage.getItem("checkValue") : null;
  const cachCheckValue  = getCachValue ? JSON.parse(getCachValue) : (checkValue || undefined);
  
  const getCachDalyMate = typeof window !== 'undefined' ? window.localStorage.getItem("dalyMate") : null;
  const cachDalyMate    = getCachDalyMate ? JSON.parse(getCachDalyMate) : (matercis?.dalyMate || undefined);

  const getCachSource   = typeof window !== 'undefined' ? window.localStorage.getItem("sourceData") : null;
  const cachSourceData  = getCachSource ? JSON.parse(getCachSource) : (mainSourceData || null);
  
  const shiftdata = cachSourceData?.shiftdata || cachSourceData?.shift || null;

  const name = cachSourceData?.name || '';
  const managerName = cachSourceData?.managerName || '';
  const periodDate  = cachSourceData?.periodDate || '';
  const departmentName = cachSourceData?.departmentName || '';

   // ── back to default report for this day  ───────────────────────────────────────────────────────────
  const toDayRerpot= {
    attendanceId:cachCheckValue?.attendanceId,
     date: periodDate,
      name,
      managerName,
      departmentName,
      shiftId:shiftdata?.shiftId,
      shiftName:shiftdata?.name,
      shiftStart:shiftdata?.startTime,
      shiftEnd:shiftdata?.endTime,
      graceIn:shiftdata?.gracePeriodMinIn,
      graceOut:shiftdata?.gracePeriodMinOut,
      
      checkIn:cachCheckValue?.checkIn || "00:00",
      checkOut:cachCheckValue?.checkOut || "00:00",
      notes:cachCheckValue?.notes || "---",
      status:cachCheckValue?.status || "-",
      excused:cachCheckValue?.excused || [],

      lateMinutes:cachDalyMate?.lateMinutes || 0,
      earlyLeaveMinutes:cachDalyMate?.earlyLeaveMinutes || 0,
      totalWorkedHours:cachDalyMate?.totalWorkedHours || 0,

  }

  // ── get employees Ids to select  for SUPER_ADMIN and anchor date default ───────────────────────────────────────────────────────────

  useEffect(()=>{
     const todayDate = format(new Date(), 'yyyy-MM-dd');
     setDateAnchor(todayDate);
     
     if(role && typeof window !== 'undefined'){
       const data = window.localStorage.getItem("employeeId")
       const id = data && data !== "" ? JSON.parse(data as string) : [];
       console.log("ids:",id)
       setEmployeeIds(id)
     }
   },[role])
    
    const { periodLabel, days } = !!matercis ? matercis : {};
    
 // ── get employees Ids to select  for SUPER_ADMIN ───────────────────────────────────────────────────────────
    
    const targetEmployeeId =  role && employeeIds && employeeIds.length > 0 ? employeeIds[2] : (user?.id || "") ;
   
  useEffect(() => {
    if (role && targetEmployeeId) {
      fetchSourceData(targetEmployeeId, dateAnchor);
      console.log('role is SUPER_ADMIN on fetchSourceData for employee:', targetEmployeeId);
    } else if (!role) {
      fetchSourceData(undefined, dateAnchor);
    }
   
  }, [fetchSourceData, setDateAnchor, role, targetEmployeeId, dateAnchor]);

  useEffect(() => {
    if (role && targetEmployeeId) {
      PeriodSummary({ dateAnchor, mode: activeTab, employeeId: targetEmployeeId });
      console.log('role is SUPER_ADMIN on periodSummary for employee:', targetEmployeeId);
    } else if (!role) {
      PeriodSummary({ dateAnchor, mode: activeTab });
    };
  }, [dateAnchor,setActiveTab, activeTab, role, targetEmployeeId, PeriodSummary]);



// ── handle Check in and check out actions for Employee and SUPER_ADMIN ───────────────────────────────────
  const handleCheckIn = () => {
    if (!mainSourceData?.shiftdata?.shiftId) return;
    CheckIn({
        employeeId:targetEmployeeId,
        shifId: mainSourceData.shiftdata.shiftId,
        checkIn: dateAnchor,
        notes: notes,
      });
      setNotes("");
   
  }

  const handleCheckOut = async () => {
    if (!mainSourceData?.shiftdata?.shiftId) return;
    try {
      await CheckOut({
        attendId: checkValue?.attendanceId || "",
        employeeId:targetEmployeeId,
        shifId: mainSourceData.shiftdata.shiftId,
        checkOut: new Date(),
        notes: notes,
      });
      setNotes("");
    } catch (e) {
      console.error(e);
    }
  };

     const hasCheckedIn = checkValue?.checkIn && checkValue?.checkIn !== "00:00" && checkValue?.checkIn !== null;
     const hasCheckedOut = checkValue?.checkOut && checkValue?.checkOut !== "00:00" 
      const hasMessage = !!message 

// ── hidden message after 6 seconds ───────────────────────────────────────────────────────────

 useEffect(() => {
  if(!hasMessage)return;
  const timerHidde = setTimeout(() => {
    setHideMessage(true)
   }, 6 *1000);

   setHideMessage(false)
  return () => clearTimeout(timerHidde);
  
 }, [hasMessage ,message]);

 const handlerApply= (id:string)=>{
  if(days && days.length >=1){
    const day = days?.find((dat)=> dat?.attendanceId === id)
    if(day) applyDay(day);
  }else{
    return;
  }
}
    
// ── get excuses and shift data ────────────────────────────────────────────────────────────
    
    const reason = checkValue?.excused?.map((item: { reason: string }) => item.reason).join(' ,')
    const type = checkValue?.excused?.map((item: { type: string }) => item.type).join(' ,')
    const shift = mainSourceData?.shiftdata

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-12" dir="rtl"
    >

{/* <!-- mian content --> */}
  <div className="p-4 md:p-margin-desktop flex-1">
    <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
    {/* <!-- Center: Action & Daily Details (8 Cols) --> */}
      <div className="lg:col-span-8 flex flex-col gap-8">
      {/* <!-- Action Center Card --> */}
        <section className="bg-white rounded-xl p-8 editorial-border relative overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.02)]">
        <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
          <div className="relative z-10 flex flex-col items-center">
            {mainSourceData?.periodDate && (
            <div className="flex scale-[1] items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-sans font-bold text-primary">
                {mainSourceData?.periodDate}
              </span>
            </div>
          )}
           <h3 className="font-headline-md text-headline-md text-on-surface-variant mb-6">الوقت الحالي</h3>
            <ShiftCountdown
              // shiftStartTime={shift?.startTime}
              // shiftEndTime={shift?.endTime}
              // gracePeriodMinIn={shift?.gracePeriodMinIn}
              // gracePeriodMinOut={shift?.gracePeriodMinOut}
              // periodOfTime={dateAnchor}
              garceOut={setGarceOut}
              shiftEnded={setShiftEnd}
              workTimNear={setHasNearWorkTime}
            />

            <div className="flex flex-col items-center gap-4 w-full">
              <div className="flex gap-8 justify-center">
                {/* زر الحضور (Check-In) */}
                {
                   hasCheckedIn ? (
                  <button 
                    disabled 
                    className="w-16 h-16 rounded-full bg-surface-container-high text-primary flex items-center justify-center cursor-default shadow-sm border border-outline-variant/20"
                    title="تم تسجيل الحضور"
                  >
                    <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                  </button>
                )  
                :
                   checkValue?.status== "ABSENT" ? (
                   <div className="relative group">
                    <button 
                      disabled 
                      className="w-16 h-16 rounded-full border border-outline-variant text-on-surface-variant flex items-center justify-center cursor-not-allowed opacity-50"
                      title="تم تسجيلك كغائب "
                    >
                      <span className="material-symbols-outlined text-3xl"></span>
                    </button>
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-full flex items-center justify-center pointer-events-none">
                      <span className="material-symbols-outlined text-outline/50">lock</span>
                    </div>
                  </div>
                )  
                :
               hasNearWorkTime?(
                 <div className="relative group">
                    <button 
                      disabled 
                      className="w-16 h-16 rounded-full border border-outline-variant text-on-surface-variant flex items-center justify-center cursor-not-allowed opacity-50"
                      title="  لم يحن وقت العمل بعد"
                    >
                      <span className="material-symbols-outlined text-3xl">lock</span>
                    </button>
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-full flex items-center justify-center pointer-events-none">
                      <span className="material-symbols-outlined text-outline/50">lock</span>
                    </div>
                  </div>
               )
               :
               shiftEnd ? (
                      <div className="relative group">
                    <button 
                      disabled 
                      className="w-16 h-16 rounded-full border border-outline-variant text-on-surface-variant flex items-center justify-center cursor-not-allowed opacity-50"
                      title="لا يمكن تسجيل الحضور بعد انتهاء الوردية"
                    >
                      <span className="material-symbols-outlined text-3xl">logout</span>
                    </button>
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-full flex items-center justify-center pointer-events-none">
                      <span className="material-symbols-outlined text-outline/50">lock</span>
                    </div>
                  </div>
                ) 
                : (
                  <button 
                    onClick={handleCheckIn}
                    disabled={isLoading}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary-container text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer"
                    title="تسجيل حضور"
                  >
                    <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>login</span>
                  </button>
                )}

                {/* زر الانصراف (Check-Out) */}
                {
                hasCheckedOut ? (
                  <button 
                    disabled 
                    className="w-16 h-16 rounded-full bg-surface-container-high text-[#0d652d] flex items-center justify-center cursor-default shadow-sm border border-outline-variant/20"
                    title="تم تسجيل الانصراف"
                  >
                    <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                  </button>
                ) :
                !hasCheckedIn ? (
                  <div className="relative group">
                    <button 
                      disabled 
                      className="w-16 h-16 rounded-full border border-outline-variant text-on-surface-variant flex items-center justify-center cursor-not-allowed opacity-50"
                      title="يرجى تسجيل الحضور أولاً"
                    >
                      <span className="material-symbols-outlined text-3xl">logout</span>
                    </button>
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-full flex items-center justify-center pointer-events-none">
                      <span className="material-symbols-outlined text-outline/50">lock</span>
                    </div>
                  </div>
                ) :
                !garceOut ? (
                      <div className="relative group">
                    <button 
                      disabled 
                      className="w-16 h-16 rounded-full border border-outline-variant text-on-surface-variant flex items-center justify-center cursor-not-allowed opacity-50"
                      title="لا يمكن تسجيل الإنصراف قبل أنتهاء فترة العمل الا بعدإذن من المدير "
                    >
                      <span className="material-symbols-outlined text-3xl">logout</span>
                    </button>
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-full flex items-center justify-center pointer-events-none">
                      <span className="material-symbols-outlined text-outline/50">lock</span>
                    </div>
                  </div>
                ) :
                shiftEnd ? (
                      <div className="relative group">
                    <button 
                      disabled 
                      className="w-16 h-16 rounded-full border border-outline-variant text-on-surface-variant flex items-center justify-center cursor-not-allowed opacity-50"
                      title="لا يمكن تسجيل انصراف بعد انتهاء فتراة سماح لتسجيل الانصراف"
                    >
                      <span className="material-symbols-outlined text-3xl">logout</span>
                    </button>
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-full flex items-center justify-center pointer-events-none">
                      <span className="material-symbols-outlined text-outline/50">lock</span>
                    </div>
                  </div>
                ) 
                :  (
                  <button 
                    onClick={handleCheckOut}
                    disabled={isLoading}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-secondary to-on-secondary-container text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-secondary/20 cursor-pointer animate-pulse"
                    title="تسجيل انصراف"
                  >
                    <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>logout</span>
                  </button>
                )}
              </div>

              {/* عرض رسالة الخطأ إن وجدت */}
              { !hideMessage && !message && error &&  (
                <motion.div  
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: hideMessage? 0: 1, ...(hideMessage?{x:20} :{y: 0}) }}
                transition={{ duration: 0.4, delay:1.3 }}
                 className={clsx(`mt-2 p-4 transition-all ease-in-out duration-300 delay-150 rounded-lg 
                bg-error-container/10 border border-error-container/20 
                text-error flex items-center gap-2 text-sm max-w-sm text-center`,
                hideMessage && 'opacity-[0]'
                )}>
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{error}</span>
                </motion.div>
              )}
              {  message &&  
              (
                <motion.div  
                initial={{ opacity: 0, ...(hideMessage?{y:0,x:0} :{y: 20,x:20})}}
                animate={{ opacity: hideMessage? 0: 1, ...(hideMessage?{y:20,x:20} :{y: 0,x:0})}}
                transition={{ duration: 0.4, delay:0.6 }}
                 className={clsx(`mt-2 p-4 transition-all ease-in-out duration-300  rounded-lg 
                bg-primary-container/10 border border-primary-container/20 
                text-primary flex items-center gap-2 text-sm max-w-sm text-center`,
                hideMessage && 'hidden'
             
                )}>
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{message}</span>
                </motion.div>
              )
              }
            </div>
          </div>
        </section>

         <div className="z-20 w-[20%] ">
              <DatePicker 
                value={dateAnchor} 
                onChange={setDateAnchor} 
                placeholder="بحث بتاريخ معين"
              />
            </div>
    <section className="bg-white rounded-xl p-8 editorial-border">
      <h3 className="font-headline-md text-headline-md text-primary mb-6 border-b border-outline-variant/20 pb-4">ملخص الحضور اليومي</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-label-md text-label-md text-on-surface-variant mb-4 opacity-70">بيانات الموظف والوردية</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#e8f0fe] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#1a73e8] text-[20px]">shield_person</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface">{mainSourceData?.managerName || '--'}</p>
                  <p className="font-body-md text-body-md text-outline text-sm">اسم المدير المباشر</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface">{mainSourceData?.name||'--'}</p>
                  <p className="font-body-md text-body-md text-outline text-sm">اسم الموظف</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#fef7e0] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#b06000] text-[20px]">alarm</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface">{`الدخول: ${shift?.startTime||'--'}  |  الخروج: ${shift?.endTime||'--'}`}</p>
                  <p className="font-body-md text-body-md text-outline text-sm">توقيت العمل الرسمي</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-tertiary-fixed flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-tertiary text-[20px]">corporate_fare</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface">{mainSourceData?.departmentName||'--'}</p>
                  <p className="font-body-md text-body-md text-outline text-sm">القسم التابع له</p>
                </div>
              </li>
            </ul>
          </div>
          <div>
          <h4 className="font-label-md text-label-md text-on-surface-variant mb-4 opacity-70">سجل اليوم الفعلي</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>done_all</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-primary">{mainSourceData?.shiftdata?.name || '--'}</p>
                  <p className="font-body-md text-body-md text-outline text-sm">اسم الوردية الحالية</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#e6f4ea] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#0d652d] text-[20px]">login</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface">{checkValue?.checkIn|| "---"}</p>
                  <p className="font-body-md text-body-md text-outline text-sm">وقت تسجيل الحضور</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#fce8e6] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#c5221f] text-[20px]">logout</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface">{checkValue?.checkOut|| "---"}</p>
                  <p className="font-body-md text-body-md text-outline text-sm">وقت تسجيل الانصراف</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-secondary-fixed flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-secondary text-[20px]">hourglass_full</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface">{matercis?.dalyMate?.totalWorkHours !== undefined ? `${matercis.dalyMate.totalWorkHours} ساعة` : '--'}</p>
                  <p className="font-body-md text-body-md text-outline text-sm">إجمالي ساعات العمل الفعلية</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Full-width expandable details toggle */}
        <div className="mt-8 pt-6 border-t border-outline-variant/20">
          <button 
            onClick={() => setShowShiftDetails(!showShiftDetails)}
            className="w-full flex items-center justify-between bg-surface-container-low hover:bg-surface-container rounded-xl px-5 py-4 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[20px]">info</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface">{showShiftDetails ? 'إخفاء التفاصيل الكاملة' : 'عرض التفاصيل الكاملة لليوم'}</span>
            </div>
            <motion.span 
              animate={{ rotate: showShiftDetails ? 180 : 0 }}
              className="material-symbols-outlined text-primary text-[22px]"
            >
              expand_more
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {showShiftDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface-variant mb-4 opacity-70">الحالة والأعذار</h4>
                    <ul className="space-y-4">
                      <li className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          checkValue?.status === 'ON_TIME' ? 'bg-[#e6f4ea]' :
                          checkValue?.status === 'LATE' ? 'bg-[#fef7e0]' :
                          checkValue?.status === 'ABSENT' ? 'bg-[#fce8e6]' :
                          checkValue?.status === 'EXCUSED' ? 'bg-[#e8f0fe]' :
                          checkValue?.status === 'ESCAPY' ? 'bg-[#fce8e6]' : 'bg-surface-container-high'
                        }`}>
                          <span className={`material-symbols-outlined text-[20px] ${
                            checkValue?.status === 'ON_TIME' ? 'text-[#0d652d]' :
                            checkValue?.status === 'LATE' ? 'text-[#b06000]' :
                            checkValue?.status === 'ABSENT' ? 'text-[#c5221f]' :
                            checkValue?.status === 'EXCUSED' ? 'text-[#1a73e8]' :
                            checkValue?.status === 'ESCAPY' ? 'text-[#c5221f]' : 'text-outline'
                          }`}>info</span>
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface">{STATUS_LABELS[checkValue?.status ||'ON_TIME']}</p>
                          <p className="font-body-md text-body-md text-outline text-sm">حالة الدوام</p>
                        </div>
                      </li>
                      { (type || reason) && (
                        <li className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#e8f0fe] flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[#1a73e8] text-[20px]">assignment_late</span>
                          </div>
                          <div>
                            <p className="font-label-md text-label-md text-on-surface">{reason ||"---"}</p>
                            <p className="font-body-md text-body-md text-outline text-sm">تفاصيل العذر المقترن</p>
                          </div>
                        </li>
                      )}
                      { checkValue?.status === 'LATE' && (
                        <li className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#fef7e0] flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[#b06000] text-[20px]">schedule</span>
                          </div>
                          <div>
                            <p className="font-label-md text-label-md text-on-surface">{matercis?.dalyMate?.lateMinutes||'--'} دقيقة</p>
                            <p className="font-body-md text-body-md text-outline text-sm">دقائق التأخير الإجمالية</p>
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface-variant mb-4 opacity-70">تفاصيل الوردية والملاحظات</h4>
                    <ul className="space-y-4">
                      <li className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-outline text-[20px]">description</span>
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface">{checkValue?.notes||'--'}</p>
                          <p className="font-body-md text-body-md text-outline text-sm">ملاحظات التحضير</p>
                        </div>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#fef7e0] flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[#b06000] text-[20px]">hourglass_empty</span>
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface">{`سماحية الحضور: ${shift?.gracePeriodMinIn||'--'} د ، سماحية الانصراف: ${shift?.gracePeriodMinOut||'--'} د`}</p>
                          <p className="font-body-md text-body-md text-outline text-sm">فترات السماحية المعتمدة</p>
                        </div>
                      </li>
                      { (checkValue?.status === 'ESCAPY' || type === "EARLY_DEPARTURE") && (
                        <li className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#fce8e6] flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[#c5221f] text-[20px]">error</span>
                          </div>
                          <div>
                            <p className="font-label-md text-label-md text-on-surface">{matercis?.dalyMate?.earlyLeaveMinutes||'--'} دقيقة</p>
                            <p className="font-body-md text-body-md text-outline text-sm">دقائق الانصراف المبكر</p>
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      {/* <!-- Notes Section --> */}
      <div className="mt-8 pt-6 border-t border-outline-variant/20">
      <label className="block font-label-md text-label-md text-on-surface-variant mb-2" >ملاحظات إدارية (اختياري)</label>
      <textarea 
        className="w-full bg-surface-bright border-b border-outline-variant focus:border-primary focus:ring-0 resize-none px-4 py-3 font-body-md text-body-md transition-colors placeholder-outline" 
        id="checkout-notes" 
        placeholder="أضف أي ملاحظات قبل الانصراف..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
      />
      </div>
   </section>
      </div>
    {/* <!-- Sidebar: Weekly Summary (4 Cols) --> */}
      <div className="lg:col-span-4">
        <div className='flex flex-row items-center justify-between'>
         <ModesTabs 
         className='w-[min(58%,180px)] my-3 justify-around'
         activeTab={activeTab}
          setActiveTab={setActiveTab} 
           TAB_LABEL={TAB_LABEL}  />

            <button 
                    onClick={()=> {
                      applyDay(toDayRerpot)
                      console.log("Success")
                    }}
                    // disabled={isLoading}
                    className="w-13 h-13 rounded-2xl bg-linear-to-r   from-white to-slate-200 text-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer"
                    title="الرجوع الى بيانات اليوم"
                  >
                    <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>login</span>
                  </button>
                  </div>

        <SummaryAttendances
        periodLabel={periodLabel}
        isLoading={isLoading}
        activeTab={activeTab}
         onClickTob={handlerApply}
        setTogglePage={setTogglePage}
        data={days}
        page={currentPage}
      />
      </div>
    </div>
  </div>
    </motion.div>
  );
}
