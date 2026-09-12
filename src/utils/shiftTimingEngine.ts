import { todayReport } from '@/types/demoAttendance.types';
import { format } from 'date-fns';

export type ShiftPhase =
  | 'PAST_REPORT'
  | 'FUTURE_REPORT'
  | 'NO_SHIFT'
  | "TODAY_IS_CHECKED_IN_OFFICIAL_SHIFT"
  | 'OFF_WORK_BEFORE'
  | 'PREPARATION'
  | 'GRACE_IN'
  | 'SHIFT_WORK'
  | 'GRACE_OUT'
  | 'SHIFT_ENDED';

export interface ButtonLockState {
  isLocked: boolean;
  isCompleted: boolean;
  canClick: boolean;
  title: string;
  reason: string;
  badgeText?: string;
  badgeColor?: string;
  icon: string;
}

export interface AttendanceLockStatus {
  phase: ShiftPhase;
  phaseLabel: string;
  phaseColor: string;
  phaseBgColor: string;
  targetTime: Date | null;
  totalDurationMs: number;
  remainingMs: number;
  isToday: boolean;
  checkIn: ButtonLockState;
  checkOut: ButtonLockState;
}

export interface ShiftDefinition {
  shiftId: string;
  name: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  gracePeriodMinIn: number;
  gracePeriodMinOut: number;
  isDemo?: boolean;
}

/**
 * دالة إنشاء أو جلب الوردية التفاعلية الذكية (10 دقائق)
 * - إذا لم يسجل المستخدم الحضور لليوم: تتجدد الوردية عند كل Refresh لتبدأ من الآن وتستمر 10 دقائق
 * - إذا سجل الحضور: يتم تثبيتها طوال اليوم حتى اليوم التالي
 */
export function getOrCreateDemoShift(
  hasCheckedIn: boolean,
  todayReport: todayReport | null,
  dateAnchor?: string,
  backendDemoShift?: ShiftDefinition | null
): ShiftDefinition {

  const ifTodayReportExist = !!todayReport  && backendDemoShift &&
                            todayReport.shiftId !== backendDemoShift?.shiftId && dateAnchor === todayReport.date


  // If backend provided a real persistent demo shift with a database shiftId, prioritize it!
  if (backendDemoShift?.shiftId && backendDemoShift.shiftId !== 'demo-shift-10min') {
    return {
      shiftId: backendDemoShift.shiftId,
      name: backendDemoShift.name || 'الوردية التفاعلية التجريبية (10 دقائق)',
      startTime: backendDemoShift.startTime,
      endTime: backendDemoShift.endTime,
      gracePeriodMinIn: backendDemoShift.gracePeriodMinIn ?? 2,
      gracePeriodMinOut: backendDemoShift.gracePeriodMinOut ?? 2,
      isDemo: true,
    };
  }

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const storageKey = `worktime_demo_shift_${todayStr}`;

  if (typeof window !== 'undefined') {
    try {
      const savedRaw = localStorage.getItem(storageKey);
      if (savedRaw) {
        const saved: ShiftDefinition = JSON.parse(savedRaw);
        // إذا كان المستخدم قد سجل الحضور، نلتزم بالوردية المحفوظة ثابتاً طوال اليوم
        if (hasCheckedIn) {
          return saved;
        }
      }
    } catch {
      // ignore
    }
  }

  // إنشاء وردية جديدة مدتها 10 دقائق تبدأ من الآن (احتياطي في حال عدم الرد من السيرفر)
  // التوزيع: 1 دقيقة تحضير، 2 دقيقة سماح دخول، 5 دقائق دوام رسمي، 2 دقيقة سماح انصراف
  const now = new Date();
  const startTimeDate = new Date(now.getTime() + 1 * 60 * 1000); // يبدأ الدوام بعد دقيقة تحضير
  const endTimeDate = new Date(startTimeDate.getTime() + 7 * 60 * 1000); // ينتهي الدوام بعد 7 دقائق

  const newShift: ShiftDefinition = {
    shiftId: 'demo-shift-10min',
    name: 'الوردية التفاعلية التجريبية (10 دقائق)',
    startTime: format(startTimeDate, 'HH:mm:ss'),
    endTime: format(endTimeDate, 'HH:mm:ss'),
    gracePeriodMinIn: 2, // دقيقتان سماح دخول
    gracePeriodMinOut: 2, // دقيقتان سماح انصراف
    isDemo: true,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(storageKey, JSON.stringify(newShift));
    } catch {
      // ignore
    }
  }

  return newShift;
}

/**
 * محرك فحص المرحلة الزمنية وحالات أقفال أزرار الحضور والانصراف الموحد
 */
export function computeAttendanceLockStatus(params: {
  currentTime: Date;
  dateAnchor: string;
  shift: ShiftDefinition | null;
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  status?: string;
  todayReport: todayReport | null;
}): AttendanceLockStatus {
  const { currentTime, dateAnchor, shift, hasCheckedIn, hasCheckedOut, status, todayReport } = params;
  const todayStr = format(currentTime, 'yyyy-MM-dd');
  const isToday = !dateAnchor || dateAnchor === todayStr;
  const ifTodayReportExist = !!todayReport && todayReport.shiftId !== shift?.shiftId && dateAnchor === todayReport.date
  // 1. فحص ما إذا كان السجل المعروض ليس ليوم العمل الحالي
  if (!isToday) {
    const isPast = dateAnchor < todayStr;
    const phase: ShiftPhase = isPast ? 'PAST_REPORT' : 'FUTURE_REPORT';
    const phaseLabel = isPast ? 'سجل حضور وانصراف سابق' : 'تاريخ مستقبلي';
    return {
      phase,
      phaseLabel,
      phaseColor: '#5f6368',
      phaseBgColor: '#f1f3f4',
      targetTime: null,
      totalDurationMs: 0,
      remainingMs: 0,
      isToday: false,
      checkIn: {
        isLocked: true,
        isCompleted: hasCheckedIn,
        canClick: false,
        title: 'لا يمكن تسجيل الحضور في غير تاريخ اليوم الحالي',
        reason: 'لا يمكن تسجيل الحضور في غير تاريخ اليوم الحالي',
        badgeText: 'تاريخ غير متاح',
        badgeColor: 'bg-outline-variant/30 text-outline',
        icon: hasCheckedIn ? 'check_circle' : 'lock',
      },
      checkOut: {
        isLocked: true,
        isCompleted: hasCheckedOut,
        canClick: false,
        title: 'لا يمكن تسجيل الانصراف في غير تاريخ اليوم الحالي',
        reason: 'لا يمكن تسجيل الانصراف في غير تاريخ اليوم الحالي',
        badgeText: 'تاريخ غير متاح',
        badgeColor: 'bg-outline-variant/30 text-outline',
        icon: hasCheckedOut ? 'check_circle' : 'lock',
      },
    };
  }
  // 3. فحص ما إذا كان السجل المعروض ليس ليوم العمل الحالي
  if (ifTodayReportExist) {

    const phase: ShiftPhase ="TODAY_IS_CHECKED_IN_OFFICIAL_SHIFT"
    const isHoleCheckToday= !!todayReport?.checkIn && !!todayReport?.checkOut
    const phaseLabel =`  حضور مسجل في وردية:${todayReport?.shiftName} الرسمية`
    return {
      phase,
      phaseLabel,
      phaseColor: '#5f6368',
      phaseBgColor: '#f1f3f4',
      targetTime: null,
      totalDurationMs: 0,
      remainingMs: 0,
      isToday: false,
      checkIn: {
        isLocked: true,
        isCompleted: !!todayReport?.checkIn,
        canClick: false,
        title: ` حضور مسجل بلفعل في: ${todayReport.shiftName} `,
        reason: isHoleCheckToday
          ?  ` عذراً لايمكن استخدم الوردية التفعلية لتسجلك حضوراليوم كملاً في وردية  :${todayReport.shiftName} التبع لقسم:${todayReport.departmentName}`
          :
          `عذراً لايمكن استخدم الوردية التفعلية لتسجلت حضورك اليوم لكونك مسجلاً في وردية:${todayReport.shiftName} التبع لقسم:${todayReport.departmentName}`,
        badgeText: ' سجل حضور مسجل بلفعل ',
        badgeColor: 'bg-outline-variant/30 text-outline',
        icon: !!todayReport?.checkIn ? 'check_circle' : 'lock',
      },
      checkOut: {
        isLocked: true,
        isCompleted: !!todayReport?.checkOut,
        canClick: false,
        title: ` انصراف مسجل بلفعل في: ${todayReport.shiftName} `,
        reason: isHoleCheckToday
          ?  ` عذراً لايمكن استخدم الوردية التفعلية لتسجلك حضوراليوم كملاً في وردية  :${todayReport.shiftName} التبع لقسم:${todayReport.departmentName}`
          :
          `عذراً لايمكن استخدم الوردية التفعلية لتسجلت حضورك اليوم في وردية:${todayReport.shiftName} التبع لقسم:${todayReport.departmentName}`,
        badgeText: ' سجل حضور مسجل بلفعل ',
        badgeColor: 'bg-outline-variant/30 text-outline',
        icon: !!todayReport.checkOut ? 'check_circle' : 'lock',
      },
    };
  }

  // 3. إذا لم تكن هناك وردية معينة للموظف
  if (!shift || !shift.startTime || !shift.endTime) {
    return {
      phase: 'NO_SHIFT',
      phaseLabel: 'لا توجد وردية معينة',
      phaseColor: '#d93025',
      phaseBgColor: '#fce8e6',
      targetTime: null,
      totalDurationMs: 0,
      remainingMs: 0,
      isToday: true,
      checkIn: {
        isLocked: true,
        isCompleted: hasCheckedIn,
        canClick: false,
        title: 'لم يتم تعيين وردية عمل لك لهذا اليوم',
        reason: 'لم يتم تعيين وردية عمل لك لهذا اليوم، يرجى مراجعة المسؤول',
        badgeText: 'لا توجد وردية',
        badgeColor: 'bg-error-container/20 text-error',
        icon: 'block',
      },
      checkOut: {
        isLocked: true,
        isCompleted: hasCheckedOut,
        canClick: false,
        title: 'لم يتم تعيين وردية عمل لك لهذا اليوم',
        reason: 'لم يتم تعيين وردية عمل لك لهذا اليوم',
        badgeText: 'لا توجد وردية',
        badgeColor: 'bg-error-container/20 text-error',
        icon: 'block',
      },
    };
  }

  // 3. احتساب الحدود الزمنية لمراحل الوردية لليوم الحالي
  const sParts = shift.startTime.split(':');
  const sHours = parseInt(sParts[0], 10) || 0;
  const sMinutes = parseInt(sParts[1], 10) || 0;
  const sSeconds = parseInt(sParts[2], 10) || 0;

  const eParts = shift.endTime.split(':');
  const eHours = parseInt(eParts[0], 10) || 0;
  const eMinutes = parseInt(eParts[1], 10) || 0;
  const eSeconds = parseInt(eParts[2], 10) || 0;

  const S = new Date(currentTime);
  S.setHours(sHours, sMinutes, sSeconds, 0);

  const E = new Date(currentTime);
  E.setHours(eHours, eMinutes, eSeconds, 0);
  if (E.getTime() < S.getTime()) {
    E.setDate(E.getDate() + 1); // وردية ليلية تعبر منتصف الليل
  }

  // مدة التحضير: 1 دقيقة للوردية التجريبية أو 30 دقيقة للوردية العادية
  const prepMinutes = shift.isDemo ? 1 : 30;
  const pStart = new Date(S.getTime() - prepMinutes * 60 * 1000);
  const gInEnd = new Date(S.getTime() + (shift.gracePeriodMinIn || 15) * 60 * 1000);
  const gOutEnd = new Date(E.getTime() + (shift.gracePeriodMinOut || 30) * 60 * 1000);

  const nowMs = currentTime.getTime();

  let phase: ShiftPhase = 'OFF_WORK_BEFORE';
  let phaseLabel = 'خارج أوقات العمل';
  let phaseColor = '#5f6368';
  let phaseBgColor = '#f1f3f4';
  let targetTime: Date | null = null;
  let totalDurationMs = 0;

  if (nowMs < pStart.getTime()) {
    phase = 'OFF_WORK_BEFORE';
    phaseLabel = 'خارج أوقات العمل (قبل الدوام)';
    phaseColor = '#5f6368';
    phaseBgColor = '#f1f3f4';
    targetTime = pStart;
    totalDurationMs = 0;
  } else if (nowMs >= pStart.getTime() && nowMs < S.getTime()) {
    phase = 'PREPARATION';
    phaseLabel = 'التحضير لبدء الوردية';
    phaseColor = '#1a73e8';
    phaseBgColor = '#e8f0fe';
    targetTime = S;
    totalDurationMs = S.getTime() - pStart.getTime();
  } else if (nowMs >= S.getTime() && nowMs < gInEnd.getTime()) {
    phase = 'GRACE_IN';
    phaseLabel = 'فترة سماح تسجيل الحضور';
    phaseColor = '#b06000';
    phaseBgColor = '#fef7e0';
    targetTime = gInEnd;
    totalDurationMs = gInEnd.getTime() - S.getTime();
  } else if (nowMs >= gInEnd.getTime() && nowMs < E.getTime()) {
    phase = 'SHIFT_WORK';
    phaseLabel = 'ساعات العمل الرسمية';
    phaseColor = '#0d652d';
    phaseBgColor = '#e6f4ea';
    targetTime = E;
    totalDurationMs = E.getTime() - gInEnd.getTime();
  } else if (nowMs >= E.getTime() && nowMs < gOutEnd.getTime()) {
    phase = 'GRACE_OUT';
    phaseLabel = 'فترة سماح تسجيل الانصراف';
    phaseColor = '#c5221f';
    phaseBgColor = '#fce8e6';
    targetTime = gOutEnd;
    totalDurationMs = gOutEnd.getTime() - E.getTime();
  } else {
    phase = 'SHIFT_ENDED';
    phaseLabel = 'انتهت الوردية وفترة السماح';
    phaseColor = '#5f6368';
    phaseBgColor = '#fce8e6';
    targetTime = null;
    totalDurationMs = 0;
  }

  const remainingMs = targetTime ? Math.max(0, targetTime.getTime() - nowMs) : 0;

  // 4. بناء حالة زر الحضور (Check-In Button Lock Logic)
  let checkIn: ButtonLockState;
  if (hasCheckedIn) {
    checkIn = {
      isLocked: false,
      isCompleted: true,
      canClick: false,
      title: 'تم تسجيل الحضور بنجاح',
      reason: 'لقد قمت بتسجيل الحضور لهذا اليوم بالفعل',
      badgeText: 'تم الحضور',
      badgeColor: 'bg-[#e6f4ea] text-[#0d652d]',
      icon: 'check_circle',
    };
  } else if (status === 'ABSENT') {
    checkIn = {
      isLocked: true,
      isCompleted: false,
      canClick: false,
      title: 'تم تسجيلك كغائب لهذا اليوم',
      reason: 'تم تسجيلك كغائب لهذا اليوم؛ يمكنك تقديم طلب عذر رسمي للإدارة',
      badgeText: 'غائب',
      badgeColor: 'bg-error-container/20 text-error',
      icon: 'lock',
    };
  } else if (phase === 'OFF_WORK_BEFORE') {
    checkIn = {
      isLocked: true,
      isCompleted: false,
      canClick: false,
      title: 'لم يحن وقت العمل بعد',
      reason: `لم يحن وقت العمل بعد (يبدأ التحضير عند الساعة ${format(pStart, 'HH:mm')})`,
      badgeText: 'مغلق حتى بدء الدوام',
      badgeColor: 'bg-outline-variant/30 text-outline',
      icon: 'lock',
    };
  } else if (phase === 'PREPARATION') {
    checkIn = {
      isLocked: true,
      isCompleted: false,
      canClick: false,
      title: 'فترة التحضير لبدء الوردية',
      reason: `فترة التحضير جارية؛ يتاح تسجيل الدخول عند حلول الساعة ${shift.startTime}`,
      badgeText: 'تحضير للدوام',
      badgeColor: 'bg-primary-container/20 text-primary',
      icon: 'lock_clock',
    };
  } else if (phase === 'GRACE_IN' || phase === 'SHIFT_WORK') {
    checkIn = {
      isLocked: false,
      isCompleted: false,
      canClick: true,
      title: phase === 'GRACE_IN' ? 'تسجيل حضور (في الموعد)' : 'تسجيل حضور (متأخر)',
      reason: phase === 'GRACE_IN' ? 'فترة سماح الدخول نشطة الآن' : 'وقت الدوام الرسمي نشط الآن (تسجيل متأخر)',
      badgeText: phase === 'GRACE_IN' ? 'متاح (في الموعد)' : 'متاح (متأخر)',
      badgeColor: phase === 'GRACE_IN' ? 'bg-[#e6f4ea] text-[#0d652d]' : 'bg-[#fef7e0] text-[#b06000]',
      icon: 'login',
    };
  } else {
    // GRACE_OUT أو SHIFT_ENDED
    checkIn = {
      isLocked: true,
      isCompleted: false,
      canClick: false,
      title: 'لا يمكن تسجيل الحضور بعد انتهاء وقت الوردية',
      reason: 'انتهت ساعات الدوام الرسمي لهذه الوردية؛ لا يمكن تسجيل الحضور الآن',
      badgeText: 'انتهى وقت الدوام',
      badgeColor: 'bg-error-container/20 text-error',
      icon: 'lock',
    };
  }

  // 5. بناء حالة زر الانصراف (Check-Out Button Lock Logic)
  let checkOut: ButtonLockState;
  if (hasCheckedOut) {
    checkOut = {
      isLocked: false,
      isCompleted: true,
      canClick: false,
      title: 'تم تسجيل الانصراف بنجاح',
      reason: 'لقد قمت بتسجيل الانصراف لهذا اليوم بالفعل',
      badgeText: 'تم الانصراف',
      badgeColor: 'bg-[#e6f4ea] text-[#0d652d]',
      icon: 'check_circle',
    };
  } else if (!hasCheckedIn) {
    checkOut = {
      isLocked: true,
      isCompleted: false,
      canClick: false,
      title: 'يرجى تسجيل الحضور أولاً',
      reason: 'لا يمكن تسجيل الانصراف قبل تسجيل الحضور أولاً',
      badgeText: 'يتطلب تسجيل حضور',
      badgeColor: 'bg-outline-variant/30 text-outline',
      icon: 'lock',
    };
  } else if (phase === 'OFF_WORK_BEFORE' || phase === 'PREPARATION' || phase === 'GRACE_IN' || phase === 'SHIFT_WORK') {
    checkOut = {
      isLocked: true,
      isCompleted: false,
      canClick: false,
      title: 'لا يمكن تسجيل الانصراف قبل انتهاء وقت العمل',
      reason: `لا يمكن تسجيل الانصراف قبل انتهاء ساعات العمل المقررة (عند ${shift.endTime}) إلا بإذن مسبق من الإدارة`,
      badgeText: 'مغلق حتى نهاية الدوام',
      badgeColor: 'bg-outline-variant/30 text-outline',
      icon: 'lock_clock',
    };
  } else if (phase === 'GRACE_OUT') {
    checkOut = {
      isLocked: false,
      isCompleted: false,
      canClick: true,
      title: 'تسجيل انصراف',
      reason: 'فترة سماح تسجيل الانصراف نشطة الآن؛ يمكنك تسجيل خروجك',
      badgeText: 'متاح الآن',
      badgeColor: 'bg-[#e6f4ea] text-[#0d652d]',
      icon: 'logout',
    };
  } else {
    // SHIFT_ENDED
    checkOut = {
      isLocked: true,
      isCompleted: false,
      canClick: false,
      title: 'انتهت فترة سماح تسجيل الانصراف',
      reason: 'انتهت فترة السماح المحددة لتسجيل الانصراف وتم إغلاق الوردية تلقائياً',
      badgeText: 'انتهت فترة السماح',
      badgeColor: 'bg-error-container/20 text-error',
      icon: 'lock',
    };
  }

  return {
    phase,
    phaseLabel,
    phaseColor,
    phaseBgColor,
    targetTime,
    totalDurationMs,
    remainingMs,
    isToday: true,
    checkIn,
    checkOut,
  };
}
