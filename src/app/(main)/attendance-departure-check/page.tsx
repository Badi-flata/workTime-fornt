"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCheckAttendStore } from '../../../store/useCheckAttendStore';
import { ModesTabs } from '../../../components/ui/ModesTabs';
import { ShiftCountdown } from '@/components/ui/ShiftCountdown';
import { DatePicker } from '@/components/ui/DatePicker';
import { SummaryAttendances } from '../../../components/ui/summaryAttendances';
import { format } from 'date-fns';
import clsx from 'clsx';
import {
  getOrCreateDemoShift,
  computeAttendanceLockStatus,
  ShiftDefinition,
  ShiftPhase,
  AttendanceLockStatus,
} from '@/utils/shiftTimingEngine';

const TAB_LABEL: Record<string, string> = {
  WEEKLY: 'أسبوعي',
  MONTHLY: 'شهري',
};

const STATUS_LABELS: Record<string, string> = {
  ON_TIME: 'حاضر (في الموعد)',
  LATE: 'متأخر',
  ABSENT: 'غياب',
  EXCUSED: 'معذور',
  ESCAPY: 'انصراف مبكر / خروج غير مصرح',
};

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  ON_TIME: { bg: 'bg-[#e6f4ea] border-[#0d652d]/20', text: 'text-[#0d652d]', icon: 'check_circle' },
  LATE: { bg: 'bg-[#fef7e0] border-[#b06000]/20', text: 'text-[#b06000]', icon: 'warning' },
  ABSENT: { bg: 'bg-[#fce8e6] border-[#c5221f]/20', text: 'text-[#c5221f]', icon: 'cancel' },
  EXCUSED: { bg: 'bg-[#e8f0fe] border-[#1a73e8]/20', text: 'text-[#1a73e8]', icon: 'info' },
  ESCAPY: { bg: 'bg-[#fce8e6] border-[#c5221f]/20', text: 'text-[#c5221f]', icon: 'logout' },
};

export default function AttendanceReportsPage() {
  const { user } = useAuthStore();
  const role = user?.role === 'SUPER_ADMIN';

  const [showShiftDetails, setShowShiftDetails] = useState(false);
  const [hideMessage, setHideMessage] = useState(false);
  const [hideError, setHideError] = useState(false);
  const [notes, setNotes] = useState('');

  // Real-time ticking clock (1-second tick)
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Ephemeral toast for locked button clicks (auto-dismiss after 4 seconds)
  const [lockToast, setLockToast] = useState<{ message: string; type: 'checkIn' | 'checkOut' } | null>(null);
  const lockToastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerLockToast = useCallback((reason: string, type: 'checkIn' | 'checkOut') => {
    if (lockToastTimerRef.current) clearTimeout(lockToastTimerRef.current);
    setLockToast({ message: reason, type });
    lockToastTimerRef.current = setTimeout(() => {
      setLockToast(null);
    }, 4000);
  }, []);

  // Ephemeral notification banner for phase transitions (auto-dismiss after 5 seconds)
  const [phaseAlert, setPhaseAlert] = useState<{
    message: string;
    phase: ShiftPhase;
    color: string;
    bgColor: string;
  } | null>(null);
  const phaseAlertTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handlePhaseChange = useCallback((newPhase: ShiftPhase, phaseLabel: string) => {
    let alertMsg = '';
    let color = '#1a73e8';
    let bgColor = '#e8f0fe';

    if (newPhase === 'PREPARATION') {
      alertMsg = 'اقترب موعد العمل! بدأت فترة التحضير لبدء الوردية.';
      color = '#1a73e8';
      bgColor = '#e8f0fe';
    } else if (newPhase === 'GRACE_IN') {
      alertMsg = 'بدأ وقت الوردية! فترة سماح تسجيل الحضور متاحة الآن.';
      color = '#0d652d';
      bgColor = '#e6f4ea';
    } else if (newPhase === 'SHIFT_WORK') {
      alertMsg = 'انتهت فترة سماح الدخول؛ تسجيل الحضور الآن يُسجل كـ (متأخر).';
      color = '#b06000';
      bgColor = '#fef7e0';
    } else if (newPhase === 'GRACE_OUT') {
      alertMsg = 'انتهت ساعات العمل المقررة! فترة سماح تسجيل الانصراف نشطة الآن.';
      color = '#0d652d';
      bgColor = '#e6f4ea';
    } else if (newPhase === 'SHIFT_ENDED') {
      alertMsg = 'انتهت ساعات العمل وفترات السماح المعتمدة لهذه الوردية.';
      color = '#c5221f';
      bgColor = '#fce8e6';
    }

    if (alertMsg) {
      if (phaseAlertTimerRef.current) clearTimeout(phaseAlertTimerRef.current);
      setPhaseAlert({ message: alertMsg, phase: newPhase, color, bgColor });
      phaseAlertTimerRef.current = setTimeout(() => {
        setPhaseAlert(null);
      }, 5000);
    }
  }, []);

  const {
    shiftMode,
    setShiftMode,
    
    matercis,
    dateAnchor,
    mainSourceData,
    currentPage,
    checkValue,
    demoSourceData,
    demoCheckValue,
    todayReport,
    error,
    isLoading,
    employeeIds,
    activeTab,
    message,
    PeriodSummary,
    fetchSourceData,
    fetchDemoShift,
    setActiveTab,
    applyDay,
    setDateAnchor,
    CheckIn,
    CheckOut,
    demoCheckIn,
    demoCheckOut,
    setTogglePage,
    setEmployeeIds,
  } = useCheckAttendStore();

  const isDemo = shiftMode === 'DEMO';

  // ── Source & Attendance Hydration (Strictly decoupled by shiftMode) ─────────────────────────
  const officialShiftRaw = mainSourceData?.shiftdata || mainSourceData?.shift || null;
  const officialShift: ShiftDefinition | null = officialShiftRaw
    ? {
        shiftId: officialShiftRaw.shiftId,
        name: officialShiftRaw.name,
        startTime: officialShiftRaw.startTime,
        endTime: officialShiftRaw.endTime,
        gracePeriodMinIn: officialShiftRaw.gracePeriodMinIn ?? 15,
        gracePeriodMinOut: officialShiftRaw.gracePeriodMinOut ?? 30,
        isDemo: false,
      }
    : null;

  // Active check value and flags based on current mode
  const currentCheckValue = isDemo ? demoCheckValue : checkValue;
  const hasCheckedIn = Boolean(currentCheckValue?.checkIn && currentCheckValue?.checkIn !== '00:00' && currentCheckValue?.checkIn !== null);
  const hasCheckedOut = Boolean(currentCheckValue?.checkOut && currentCheckValue?.checkOut !== '00:00' && currentCheckValue?.checkOut !== null);

  // 10-Minute Dynamic Simulation Shift from demoSourceData or fallback engine
  const backendDemo = demoSourceData?.demoShift;
  const demoShift: ShiftDefinition = useMemo(() => {
    return getOrCreateDemoShift(hasCheckedIn,todayReport , dateAnchor, backendDemo ? {
      shiftId: backendDemo.shiftId,
      name: backendDemo.name,
      startTime: backendDemo.startTime,
      endTime: backendDemo.endTime,
      gracePeriodMinIn: backendDemo.gracePeriodMinIn,
      gracePeriodMinOut: backendDemo.gracePeriodMinOut,
      isDemo: true,
    } : null);
  }, [hasCheckedIn, dateAnchor, backendDemo]);

  // Active shift: purely isolated
  const activeShift: ShiftDefinition = (isDemo || !officialShift) ? demoShift : officialShift;
  
  // Real-time button lock & shift timing calculation
  const lockStatus: AttendanceLockStatus = useMemo(() => {
    return computeAttendanceLockStatus({
      currentTime,
      dateAnchor: dateAnchor || format(currentTime, 'yyyy-MM-dd'),
      shift: activeShift,
      hasCheckedIn,
      hasCheckedOut,
      status: currentCheckValue?.status,
      todayReport: todayReport 
    });
  }, [currentTime, dateAnchor, activeShift,
     hasCheckedIn, hasCheckedOut, currentCheckValue?.status]);

  const name = isDemo ? (demoSourceData?.name || mainSourceData?.name || '') : (mainSourceData?.name || '');
  const managerName = isDemo ? (demoSourceData?.managerName || mainSourceData?.managerName || '') : (mainSourceData?.managerName || '');
  const periodDate = isDemo ? (demoSourceData?.periodDate || format(new Date(), 'yyyy-MM-dd')) : (mainSourceData?.periodDate || format(new Date(), 'yyyy-MM-dd'));
  const departmentName = isDemo ? (demoSourceData?.departmentName || mainSourceData?.departmentName || '') : (mainSourceData?.departmentName || '');

  // ── Default Report for Today ───────────────────────────────────────────────────────────
  const toDayReport = {
    attendanceId: currentCheckValue?.attendanceId || (currentCheckValue as any)?.id,
    date: periodDate,
    name,
    managerName,
    departmentName,
    shiftId: activeShift?.shiftId,
    shiftName: activeShift?.name,
    shiftStart: activeShift?.startTime,
    shiftEnd: activeShift?.endTime,
    graceIn: activeShift?.gracePeriodMinIn,
    graceOut: activeShift?.gracePeriodMinOut,
    checkIn: currentCheckValue?.checkIn || '00:00',
    checkOut: currentCheckValue?.checkOut || '00:00',
    notes: currentCheckValue?.notes || '---',
    status: currentCheckValue?.status || '-',
    excused: currentCheckValue?.excused || [],
    lateMinutes:  (matercis?.dalyMate?.lateMinutes || 0),
    earlyLeaveMinutes:  (matercis?.dalyMate?.earlyLeaveMinutes || 0),
    totalWorkedHours: (matercis?.dalyMate?.totalWorkedHours || 0),
  };

  // ── Initial Setup & Super Admin Employees ───────────────────────────────────────────────────────────
  useEffect(() => {
    const todayDate = format(new Date(), 'yyyy-MM-dd');
    setDateAnchor(todayDate);

    if (role && typeof window !== 'undefined') {
      const data = window.localStorage.getItem('employeeId');
      const id = data && data !== '' ? JSON.parse(data as string) : [];
      setEmployeeIds(id);
    }
  }, [role, setDateAnchor, setEmployeeIds]);

  const { periodLabel, days } = !!matercis ? matercis : {};
  const targetEmployeeId = role && employeeIds && employeeIds.length > 0 ? employeeIds[4] : '';

  // Data fetching triggered strictly according to active shiftMode
  useEffect(() => {
    if (typeof window == 'undefined')return;
    if ( role && !targetEmployeeId)return;

    if ( role && targetEmployeeId) {
      if(isDemo){
      fetchDemoShift(targetEmployeeId || undefined);
      console.log("demo target employee id: ",targetEmployeeId)
     }else{
        fetchSourceData(dateAnchor, targetEmployeeId);
        console.log("source data target employee id: ",targetEmployeeId)
     }
      } else {
        fetchSourceData(dateAnchor);
         console.log("source data target employee id: ",targetEmployeeId)
      }
    
  }, [isDemo,  role, targetEmployeeId, dateAnchor ,fetchSourceData ,fetchDemoShift]);

  useEffect(() => { 
   if (typeof window == 'undefined')return;
    if ( role && !targetEmployeeId)return;

    if (role && targetEmployeeId) {
      PeriodSummary({ dateAnchor, mode: activeTab, employeeId: targetEmployeeId });
      console.log("period summary dome")
    } else{
      PeriodSummary({ dateAnchor, mode: activeTab });
       console.log(" period summary official ")
    }
  }, [isDemo,dateAnchor, activeTab, role, targetEmployeeId, PeriodSummary]);

  // ── Handle Check In and Check Out Actions (Strictly Decoupled) ───────────────────────────
  const handleCheckIn = () => {
    if (!activeShift?.shiftId) return;
    if (isDemo) {
      demoCheckIn({
        employeeId: targetEmployeeId,
        shiftId: activeShift.shiftId,
        checkIn: new Date().toISOString(),
        notes: notes,
      });
    } else {
      CheckIn({
        employeeId: targetEmployeeId,
        shiftId: activeShift.shiftId,
        checkIn: new Date().toISOString(),
        notes: notes,
      });
    }
    setNotes('');
  };

  const handleCheckOut = async () => {
    if (!activeShift?.shiftId) return;
    try {
      if (isDemo) {
        await demoCheckOut({
          attendId: currentCheckValue?.attendanceId || (currentCheckValue as any)?.id || '',
          employeeId: targetEmployeeId,
          shiftId: activeShift.shiftId,
          checkOut: new Date(),
          notes: notes,
        });
      } else {
        await CheckOut({
          attendId: currentCheckValue?.attendanceId || '',
          employeeId: targetEmployeeId,
          shiftId: activeShift.shiftId,
          checkOut: new Date(),
          notes: notes,
        });
      }
      setNotes('');
    } catch (e) {
      console.error(e);
    }
  };

  // Auto-hide feedback message
  useEffect(() => {
    if (!message) return;
    const timerHidden = setTimeout(() => {
      setHideMessage(true);
    }, 6000);
    setHideMessage(false);
    return () => clearTimeout(timerHidden);
  }, [message]);

  // Auto-hide error alert
  useEffect(() => {
    if (!error) return;
    setHideError(false);
    const timerError = setTimeout(() => {
      setHideError(true);
    }, 7000);
    return () => clearTimeout(timerError);
  }, [error]);

  const handlerApply = (id: string) => {
    if (!days || days.length === 0) return;
    const day = days.find((dat) => dat?.attendanceId === id);
    if (day) {
      applyDay(day);
    }
  };

  const handleReturnToToday = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    setDateAnchor(todayStr);
    if (role && targetEmployeeId) {
      fetchSourceData(todayStr, targetEmployeeId);
      PeriodSummary({ dateAnchor: todayStr, mode: activeTab, employeeId: targetEmployeeId });
    } else {
      fetchSourceData(todayStr);
      PeriodSummary({ dateAnchor: todayStr, mode: activeTab });
    }
  };

  // console.log("acheckValue",activeShift.shiftId);

  const currentStatus = checkValue?.status || (hasCheckedIn ? 'ON_TIME' : '-');
  const statusTheme = STATUS_COLORS[currentStatus] || {
    bg: 'bg-surface-container-high border-outline-variant/30',
    text: 'text-on-surface',
    icon: 'info',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-12"
      dir="rtl"
    >
      {/* ── Main Content Container ─────────────────────────────────────────────────────────── */}
      <div className="p-4 md:p-margin-desktop flex-1">
        <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Center: Action & Daily Details (8 Cols) ─────────────────────────────────────── */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* ── Action Center Card ────────────────────────────────────────────────────────── */}
            <section className="bg-white rounded-2xl p-6 md:p-8 editorial-border relative overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.02)]">
              <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

              {/* Header: Date + Shift Selector Toggle */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-outline-variant/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 select-none">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-sans font-bold text-primary">
                      {dateAnchor || periodDate}
                    </span>
                  </div>

                  <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant font-sans">
                    {activeShift?.name}
                  </span>
                </div>

                {/* Toggle for 10-Minute Demo Shift vs Official Assigned Shift */}
                <div className="flex items-center gap-2 bg-surface-container-low px-2.5 py-1 rounded-xl border border-outline-variant/30">
                  <span className="text-[11px] font-bold text-on-surface-variant">الوردية:</span>
                  <button
                    type="button"
                    onClick={() => setShiftMode('OFFICIAL')}
                    disabled={!officialShift}
                    className={clsx(
                      'text-xs px-2.5 py-1 rounded-lg font-bold transition-all',
                      !isDemo && officialShift
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-outline hover:text-on-surface disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed'
                    )}
                    title={officialShift ? 'استخدام الوردية الرسمية للموظف' : 'لا توجد وردية رسمية معينة'}
                  >
                    رسمية
                  </button>
                  <button
                    type="button"
                    onClick={() => setShiftMode('DEMO')}
                    className={clsx(
                      'text-xs px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer',
                      isDemo || !officialShift
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-outline hover:text-on-surface'
                    )}
                    title="تجربة الوردية التفاعلية (10 دقائق)"
                  >
                    <span className="material-symbols-outlined text-[14px]">bolt</span>
                    تجريبية (10 د)
                  </button>
                </div>
              </div>

              {/* Dynamic Ephemeral Phase Transition Alert Banner (Shown for 5 seconds) */}
              <AnimatePresence>
                {phaseAlert && (
                  <motion.div
                    initial={{ opacity: 0, y: -16, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.95 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="relative z-20 mb-6 p-4 rounded-xl border flex items-center gap-3 shadow-md"
                    style={{ backgroundColor: phaseAlert.bgColor, borderColor: phaseAlert.color }}
                  >
                    <span
                      className="material-symbols-outlined text-2xl shrink-0 animate-bounce"
                      style={{ color: phaseAlert.color }}
                    >
                      notifications_active
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-bold font-sans" style={{ color: phaseAlert.color }}>
                        تنبيه انتقال المرحلة الزمنية
                      </p>
                      <p className="text-sm font-body-md text-on-surface font-medium">
                        {phaseAlert.message}
                      </p>
                    </div>
                    <button
                      onClick={() => setPhaseAlert(null)}
                      className="text-outline hover:text-on-surface p-1 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
                      title="إغلاق التنبيه"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Dynamic Ephemeral Locked Button Click Toast (Shown on button click for 4 seconds) */}
              <AnimatePresence>
                {lockToast && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.97 }}
                    transition={{ duration: 0.3 }}
                    className="relative z-20 mb-6 p-3.5 rounded-xl bg-[#fef7e0] border border-[#b06000]/30 text-[#b06000] flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-xl">lock_clock</span>
                      <span className="text-sm font-bold font-sans">
                        {lockToast.message}
                      </span>
                    </div>
                    <button
                      onClick={() => setLockToast(null)}
                      className="text-[#b06000] hover:text-on-surface p-1 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Countdown Circular Arc with Real-Time Shift Timing */}
              <div className="relative z-10 flex flex-col items-center">
                <ShiftCountdown
                  shift={activeShift}
                  currentTime={currentTime}
                  dateAnchor={dateAnchor}
                  hasCheckedIn={hasCheckedIn}
                  hasCheckedOut={hasCheckedOut}
                  attendanceStatus={checkValue?.status}
                  lockStatus={lockStatus}
                  todayReport={todayReport}
                  onPhaseChange={handlePhaseChange}
                />

                {/* ── Interactive Action Buttons (Check-In & Check-Out) ───────────────────── */}
                <div className="flex flex-col items-center gap-5 w-full">
                  <div className="flex gap-10 justify-center items-center">
                    {/* 1. زر الحضور (Check-In Button) */}
                    <div className="flex flex-col items-center gap-2">
                      {lockStatus.checkIn.isCompleted ? (
                        <button
                          disabled
                          className="w-16 h-16 rounded-full bg-[#e6f4ea] text-[#0d652d] flex items-center justify-center cursor-default shadow-sm border border-[#0d652d]/20 transition-all"
                          title="تم تسجيل الحضور اليوم بنجاح"
                        >
                          <span
                            className="material-symbols-outlined text-3xl"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check_circle
                          </span>
                        </button>
                      ) : lockStatus.checkIn.isLocked ? (
                        <button
                          onClick={() => triggerLockToast(lockStatus.checkIn.reason, 'checkIn')}
                          className="w-16 h-16 rounded-full border-2 border-dashed border-outline-variant/50 bg-surface-container-low text-outline flex items-center justify-center hover:bg-error-container/10 hover:border-error/40 hover:text-error transition-all shadow-sm cursor-pointer group relative"
                          title={lockStatus.checkIn.reason}
                        >
                          <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">
                            lock
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={handleCheckIn}
                          disabled={isLoading}
                          className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary-container text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/25 cursor-pointer"
                          title={lockStatus.checkIn.title}
                        >
                          <span
                            className="material-symbols-outlined text-3xl"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            login
                          </span>
                        </button>
                      )}
                      <span className="text-xs font-bold text-on-surface-variant font-sans">
                        تسجيل حضور
                      </span>
                    </div>

                    {/* 2. زر الانصراف (Check-Out Button) */}
                    <div className="flex flex-col items-center gap-2">
                      {lockStatus.checkOut.isCompleted ? (
                        <button
                          disabled
                          className="w-16 h-16 rounded-full bg-[#e6f4ea] text-[#0d652d] flex items-center justify-center cursor-default shadow-sm border border-[#0d652d]/20 transition-all"
                          title="تم تسجيل الانصراف لهذا اليوم"
                        >
                          <span
                            className="material-symbols-outlined text-3xl"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check_circle
                          </span>
                        </button>
                      ) : lockStatus.checkOut.isLocked ? (
                        <button
                          onClick={() => triggerLockToast(lockStatus.checkOut.reason, 'checkOut')}
                          className="w-16 h-16 rounded-full border-2 border-dashed border-outline-variant/50 bg-surface-container-low text-outline flex items-center justify-center hover:bg-error-container/10 hover:border-error/40 hover:text-error transition-all shadow-sm cursor-pointer group relative"
                          title={lockStatus.checkOut.reason}
                        >
                          <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">
                            lock
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={handleCheckOut}
                          disabled={isLoading}
                          className="w-16 h-16 rounded-full bg-gradient-to-r from-secondary to-on-secondary-container text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-secondary/25 cursor-pointer animate-pulse"
                          title={lockStatus.checkOut.title}
                        >
                          <span
                            className="material-symbols-outlined text-3xl"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            logout
                          </span>
                        </button>
                      )}
                      <span className="text-xs font-bold text-on-surface-variant font-sans">
                        تسجيل انصراف
                      </span>
                    </div>
                  </div>

                  {/* Backend Error Alert (Displayed independently from message) */}
                  {error && !hideError && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 p-3.5 rounded-xl bg-error-container/15 border border-error/30 text-error flex items-center justify-between gap-3 text-sm max-w-md shadow-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-base shrink-0">error</span>
                        <span className="font-medium font-sans">{error}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHideError(true)}
                        className="text-error/70 hover:text-error shrink-0 cursor-pointer"
                        title="إغلاق التنبيه"
                      >
                        <span className="material-symbols-outlined text-base">close</span>
                      </button>
                    </motion.div>
                  )}

                  {/* Backend Success / Feedback Message */}
                  {message && !hideMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 p-3.5 rounded-xl bg-[#e6f4ea] border border-[#0d652d]/25 text-[#0d652d] flex items-center justify-between gap-3 text-sm max-w-md shadow-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
                        <span className="font-medium font-sans">{message}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHideMessage(true)}
                        className="text-[#0d652d]/70 hover:text-[#0d652d] shrink-0 cursor-pointer"
                        title="إغلاق التنبيه"
                      >
                        <span className="material-symbols-outlined text-base">close</span>
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </section>

            {/* Date Search Picker (Full width on mobile, inline on desktop) */}
            <div className="z-20 w-full sm:w-72">
              <DatePicker
                value={dateAnchor}
                onChange={setDateAnchor}
                placeholder="بحث بتاريخ معين"
              />
            </div>

            {/* ── Reorganized Section: Daily Attendance Summary (ملخص الحضور اليومي) ────────── */}
            <section className="bg-white rounded-2xl p-6 md:p-8 editorial-border shadow-[0_20px_40px_rgba(0,0,0,0.02)]">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/20 pb-4 mb-6">
                <div>
                  <h3 className="font-headline-md text-headline-md text-primary font-bold">
                    ملخص الحضور اليومي
                  </h3>
                  <p className="text-xs text-outline mt-0.5">
                    البيانات الحيوية ومواعيد البصمات المقيدة لليوم
                  </p>
                </div>

                {/* Primary Daily Status Badge */}
                <div
                  className={clsx(
                    'flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-sans font-bold text-xs shadow-sm',
                    statusTheme.bg,
                    statusTheme.text
                  )}
                >
                  <span className="material-symbols-outlined text-base">{statusTheme.icon}</span>
                  <span>{STATUS_LABELS[currentStatus] || currentStatus}</span>
                </div>
              </div>

              {/* 1. Primary Direct Glance Cards (High-Priority Employee Information) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {/* Card 1: Check-in Timestamp */}
                <div className="bg-[#e6f4ea]/40 border border-[#0d652d]/15 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-outline font-sans">بصمة الحضور</span>
                    <div className="w-8 h-8 rounded-lg bg-[#e6f4ea] text-[#0d652d] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">login</span>
                    </div>
                  </div>
                  <div className="font-display-sm text-display-sm font-bold text-[#0d652d] font-sans">
                    {checkValue?.checkIn || '--:--'}
                  </div>
                  <span className="text-[11px] text-outline mt-1 font-label">
                    {hasCheckedIn ? 'تم التسجيل بنجاح' : 'في انتظار الحضور'}
                  </span>
                </div>

                {/* Card 2: Check-out Timestamp */}
                <div className="bg-[#fce8e6]/30 border border-[#c5221f]/15 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-outline font-sans">بصمة الانصراف</span>
                    <div className="w-8 h-8 rounded-lg bg-[#fce8e6] text-[#c5221f] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                    </div>
                  </div>
                  <div className="font-display-sm text-display-sm font-bold text-[#c5221f] font-sans">
                    {checkValue?.checkOut || '--:--'}
                  </div>
                  <span className="text-[11px] text-outline mt-1 font-label">
                    {hasCheckedOut ? 'تم الانصراف بنجاح' : 'لم يسجل الانصراف بعد'}
                  </span>
                </div>

                {/* Card 3: Actual Worked Hours */}
                <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-outline font-sans">ساعات العمل الفعلية</span>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
                    </div>
                  </div>
                  <div className="font-display-sm text-display-sm font-bold text-primary font-sans">
                    {toDayReport.totalWorkedHours !== undefined ? `${toDayReport.totalWorkedHours} س` : '0.00 س'}
                  </div>
                  <span className="text-[11px] text-outline mt-1 font-label">
                    إجمالي الإنجاز لليوم
                  </span>
                </div>

                {/* Card 4: Official Shift Window */}
                <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-outline font-sans">مواعيد العمل المقررة</span>
                    <div className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">schedule</span>
                    </div>
                  </div>
                  <div className="font-headline-sm text-headline-sm font-bold text-on-surface font-sans">
                    {`${activeShift?.startTime || '--:--'} - ${activeShift?.endTime || '--:--'}`}
                  </div>
                  <span className="text-[11px] text-outline mt-1 font-label">
                    الوردية: {activeShift?.name}
                  </span>
                </div>
              </div>

              {/* Late / Early Leave Alert Bar (if applicable) */}
              {(toDayReport.lateMinutes > 0 || toDayReport.earlyLeaveMinutes > 0) && (
                <div className="mb-8 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-amber-800">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-amber-700">timer</span>
                    <span className="text-xs font-bold font-sans">تنبيه الفروقات الزمنية:</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium font-sans">
                    {toDayReport.lateMinutes > 0 && (
                      <span className="bg-amber-100 px-2 py-1 rounded-md text-amber-900">
                        التأخير: <strong>{toDayReport.lateMinutes}</strong> دقيقة
                      </span>
                    )}
                    {toDayReport.earlyLeaveMinutes > 0 && (
                      <span className="bg-red-100 px-2 py-1 rounded-md text-red-900">
                        خروج مبكر: <strong>{toDayReport.earlyLeaveMinutes}</strong> دقيقة
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* 2. Secondary Accordion: Expandable Administrative & System Details */}
              <div className="pt-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setShowShiftDetails(!showShiftDetails)}
                  className="w-full flex items-center justify-between bg-surface-container-low hover:bg-surface-container rounded-xl px-5 py-3.5 transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]">badge</span>
                    </div>
                    <span className="font-label-md text-label-md text-on-surface font-bold">
                      {showShiftDetails
                        ? 'إخفاء التفاصيل الإدارية والوردية'
                        : 'عرض التفاصيل الكاملة لليوم / الوردية (المدير، القسم، فترات السماح)'}
                    </span>
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
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                        {/* Group A: Employee & Administration */}
                        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20">
                          <h4 className="font-label-md text-label-md text-primary font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">corporate_fare</span>
                            بيانات الموظف والإدارة
                          </h4>
                          <ul className="space-y-3.5">
                            <li className="flex items-center justify-between text-sm py-1 border-b border-outline-variant/10">
                              <span className="text-outline">اسم الموظف:</span>
                              <span className="font-bold text-on-surface">{name || '--'}</span>
                            </li>
                            <li className="flex items-center justify-between text-sm py-1 border-b border-outline-variant/10">
                              <span className="text-outline">المدير المباشر:</span>
                              <span className="font-bold text-on-surface">{managerName || '--'}</span>
                            </li>
                            <li className="flex items-center justify-between text-sm py-1 border-b border-outline-variant/10">
                              <span className="text-outline">القسم / الإدارة:</span>
                              <span className="font-bold text-on-surface">{departmentName || '--'}</span>
                            </li>
                            <li className="flex items-center justify-between text-sm py-1">
                              <span className="text-outline">ملاحظات البصمة:</span>
                              <span className="font-medium text-on-surface">{checkValue?.notes || 'لا توجد'}</span>
                            </li>
                          </ul>
                        </div>

                        {/* Group B: Shift Specs & Grace Periods */}
                        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20">
                          <h4 className="font-label-md text-label-md text-primary font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">more_time</span>
                            معايير الوردية وفترات السماح
                          </h4>
                          <ul className="space-y-3.5">
                            <li className="flex items-center justify-between text-sm py-1 border-b border-outline-variant/10">
                              <span className="text-outline">اسم الوردية:</span>
                              <span className="font-bold text-on-surface">{activeShift?.name}</span>
                            </li>
                            <li className="flex items-center justify-between text-sm py-1 border-b border-outline-variant/10">
                              <span className="text-outline">سماحية تسجيل الحضور:</span>
                              <span className="font-bold text-[#0d652d]">{activeShift?.gracePeriodMinIn ?? 15} دقيقة</span>
                            </li>
                            <li className="flex items-center justify-between text-sm py-1 border-b border-outline-variant/10">
                              <span className="text-outline">سماحية تسجيل الانصراف:</span>
                              <span className="font-bold text-[#b06000]">{activeShift?.gracePeriodMinOut ?? 30} دقيقة</span>
                            </li>
                            <li className="flex items-center justify-between text-sm py-1">
                              <span className="text-outline">طبيعة الوردية:</span>
                              <span className="font-bold text-on-surface">
                                {activeShift?.isDemo ? 'تجريبية تفاعلية (10 د)' : 'رسمية نظامية'}
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Administrative Notes Box */}
              <div className="mt-8 pt-6 border-t border-outline-variant/20">
                <label
                  htmlFor="checkout-notes"
                  className="block font-label-md text-label-md text-on-surface-variant font-bold mb-2"
                >
                  ملاحظات إدارية (اختياري)
                </label>
                <textarea
                  className="w-full bg-surface-bright border border-outline-variant/40 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary resize-none px-4 py-3 font-body-md text-body-md transition-colors placeholder-outline"
                  id="checkout-notes"
                  placeholder="أضف أي ملاحظات قبل تسجيل الحضور أو الانصراف..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </section>
          </div>

          {/* ── Sidebar: Weekly / Monthly Summary (4 Cols) ─────────────────────────────────── */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="flex flex-row items-center justify-between">
              <ModesTabs
                className="w-[min(58%,180px)] justify-around"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                TAB_LABEL={TAB_LABEL}
              />

              <button
                onClick={handleReturnToToday}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-container text-white flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20 cursor-pointer font-sans text-xs font-bold"
                title="الرجوع إلى بيانات وسجل اليوم الحالي"
              >
                <span className="material-symbols-outlined text-[18px]">today</span>
                <span>سجل اليوم</span>
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
