import { create } from 'zustand';
import { API } from '@/services/apiClient';
import { format, parseISO } from 'date-fns';
import { 
  Modes,
  CheckInInput,
  CheckOutInput,
  ExcuseInput,
  AttendanceSourceParams,
  DailyBreakdownOutput,
  AttendanceSummaryOutput,
  BoundedPeriodReportOutput
} from '@/types';
import { 
  DemoSourceData, 
  DemoShiftDefinition, 
  DemoAttendanceValue, 
  DemoCheckInInput, 
  DemoCheckOutInput, 
  todayReport
} from '@/types/demoAttendance.types';
import { AttendanceErrorCatch } from '@/services/errorHandler';
import { globalCache, createSecureCacheKey } from '@/utils/cacheManager';

interface MainSourceData {
  periodDate: string;
  name: string;
  managerName: string;
  departmentName: string;
  shiftdata: {
    shiftId: string;
    name: string;
    startTime: string;
    endTime:   string;
    gracePeriodMinIn: number;
    gracePeriodMinOut: number;
  } | null;
  shift?: {
    shiftId: string;
    name: string;
    startTime: string;
    endTime: string;
    gracePeriodMinIn: number;
    gracePeriodMinOut: number;
  } | null;
  CheckValue?: {
    id: string;
    status: string;
    checkIn: string | null;
    checkOut: string | null;
    excused: any[];
    notes: string | null;
    totalWorkedHours: number;
    earlyLeaveMinutes: number;
    lateMinutes: number;
  } | null;
  checkValue?: any;
}

interface CheckValue {
  attendanceId?: string;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
  status?: string;
  excused?: ExcuseInput[] | null;
}

interface AttendanceMetrics {
  periodLabel?: string;
  dalyMate?: {
    totalWorkedHours: number;
    lateMinutes?: number;
    earlyLeaveMinutes?: number;
  };
  dailyMetrics?: {
    totalWorkedHours: number;
    lateMinutes?: number;
    earlyLeaveMinutes?: number;
  };
  periodSummary?: AttendanceSummaryOutput;
  days?: DailyBreakdownOutput[];
}

export interface CheckAttendState {
  // Mode switcher
  shiftMode: 'OFFICIAL' | 'DEMO';
  setShiftMode: (mode: 'OFFICIAL' | 'DEMO') => void;

  // Official Shift State
  mainSourceData: MainSourceData | null;
  checkValue: CheckValue | null;
  matercis: AttendanceMetrics | null;
  metrics?: AttendanceMetrics | null;

  // Dedicated Demo Shift State
  demoSourceData: DemoSourceData | null;
  demoCheckValue: DemoAttendanceValue | null;
  todayReport: todayReport | null;

  message?: string;
  activeTab: Modes;
  dateAnchor: string;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  employeeIds?: string[];

  setTogglePage: (type: string, page: number) => void;
  setEmployeeIds: (ids: string[]) => void;
  setActiveTab: (tab: Modes) => void;
  setDateAnchor: (date: string) => void;

  // Official Actions
  CheckIn: (att: CheckInInput) => Promise<void>;
  CheckOut: (depar: CheckOutInput) => Promise<void>;
  fetchSourceData: (date?: string, employeeId?: string) => Promise<void>;
  PeriodSummary: (input: { dateAnchor?: string; mode: Modes; employeeId?: string }) => Promise<void>;
  applyDay: (datt: DailyBreakdownOutput) => void;

  // Dedicated Demo Actions
  fetchDemoShift: (employeeId?: string) => Promise<void>;
  demoCheckIn: (payload: DemoCheckInInput) => Promise<void>;
  demoCheckOut: (payload: DemoCheckOutInput) => Promise<void>;
}

export const useCheckAttendStore = create<CheckAttendState>((set, get) => ({
  shiftMode: 'OFFICIAL',
  setShiftMode: (mode) => set({ shiftMode: mode }),

  mainSourceData: null,
  checkValue: null,
  matercis: null,

  demoSourceData: null,
  demoCheckValue: null,
  todayReport: null,

  activeTab: 'WEEKLY',
  currentPage: 1,
  message: '',
  dateAnchor: '',
  employeeIds: [],
  error: null,
  isLoading: false,

  setEmployeeIds: (ids) => set({ employeeIds: ids }),
  setDateAnchor: (date) => set({ dateAnchor: date }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setTogglePage: (direction, current) =>
    set({
      currentPage: direction === 'next' ? current + 1 : Math.max(1, current - 1),
    }),

  CheckIn: async (att) => {
    set({ isLoading: true, error: null, message: '' });
    try {
      const res = await API.attendance.checkIn(att);
      const data = res.data?.data !== undefined && res.data.data !== res.data ? res.data.data : res.data;
      const excuses = data?.excuses;

      // Invalidate attendance and dashboard caches so fresh data is fetched immediately
      globalCache.invalidateTag('attendance');
      globalCache.invalidateTag('emp_dash');
      globalCache.invalidateTag('managing');

      const checkInFormatted = data?.checkIn
        ? format(new Date(data.checkIn), 'HH:mm')
        : format(new Date(), 'HH:mm');

      set({
        message: res.data?.message || (res as any)?.message || 'تم تسجيل الحضور بنجاح',
        error: null,
        checkValue: {
          attendanceId: data?.id,
          checkIn: checkInFormatted,
          checkOut: data?.checkOut ? format(new Date(data.checkOut), 'HH:mm') : undefined,
          notes: data?.employeeNote || data?.notes || att.notes || '',
          status: data?.status || 'ON_TIME',
          excused: excuses ? [...excuses] : [],
        },
        matercis: {
          dalyMate: {
            totalWorkedHours: data?.totalWorkedHours ?? 0,
            lateMinutes: data?.lateMinutes ?? 0,
            earlyLeaveMinutes: data?.earlyLeaveMinutes ?? 0,
          },
        },
        isLoading: false,
      });
    } catch (err: unknown) {
      const formattedError = AttendanceErrorCatch.checkIn(err);
      set({ error: formattedError.userFriendlyMessage, message: '', isLoading: false });
    }
  },

  CheckOut: async (depar) => {
    set({ isLoading: true, error: null, message: '' });
    try {
      const res = await API.attendance.checkOut(depar);
      const data = res.data?.data !== undefined && res.data.data !== res.data ? res.data.data : res.data;
      const excuses = data?.excuses;

      // Invalidate attendance and dashboard caches upon mutation
      globalCache.invalidateTag('attendance');
      globalCache.invalidateTag('emp_dash');
      globalCache.invalidateTag('managing');

      const checkOutFormatted = data?.checkOut
        ? format(new Date(data.checkOut), 'HH:mm')
        : (typeof depar.checkOut === 'string' ? depar.checkOut : format(depar.checkOut, 'HH:mm'));

      set((state) => ({
        message: res.data?.message || (res as any)?.message || 'تم تسجيل الإنصراف بنجاح',
        error: null,
        checkValue: {
          ...state.checkValue,
          checkOut: checkOutFormatted,
          notes: data?.employeeNote || data?.notes || '',
          status: data?.status,
          excused: excuses ? [...excuses] : state.checkValue?.excused || [],
        },
        matercis: {
          ...state.matercis,
          dalyMate: {
            totalWorkedHours: data?.totalWorkedHours ?? 0,
            lateMinutes: data?.lateMinutes ?? 0,
            earlyLeaveMinutes: data?.earlyLeaveMinutes ?? 0,
          },
        },
        isLoading: false,
      }));
    } catch (err: unknown) {
      const formattedError = AttendanceErrorCatch.checkOut(err);
      set({ error: formattedError.userFriendlyMessage, message: '', isLoading: false });
    }
  },

  fetchSourceData: async ( date?: string,employeeId?: string) => {
    const cacheKey = createSecureCacheKey('attendance_source', {  date,employeeId });
    const cached = globalCache.get<MainSourceData>(cacheKey);
    if (cached) {
      const serverCheck = cached.CheckValue || cached.checkValue;
      set({ 
        mainSourceData: cached,
        checkValue: serverCheck ? {
          attendanceId: serverCheck.id || serverCheck.attendanceId,
          checkIn: serverCheck.checkIn || undefined,
          checkOut: serverCheck.checkOut || undefined,
          notes: serverCheck.notes || undefined,
          status: serverCheck.status,
          excused: serverCheck.excused || [],
        } : null,
        matercis: serverCheck ? {
          dalyMate: {
            totalWorkedHours: serverCheck.totalWorkedHours ?? 0,
            lateMinutes: serverCheck.lateMinutes ?? 0,
            earlyLeaveMinutes: serverCheck.earlyLeaveMinutes ?? 0,
          }
        } : null,
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await API.attendance.fetchSourceData({ date, employeeId });
      const raw = res.data;
      const data: MainSourceData = raw?.data !== undefined && raw.data !== raw ? raw.data : raw;
      const message = (res as any).message || raw?.message || 'تم جلب البيانات الأولية بنجاح';
  
      if (data) {
        globalCache.set(cacheKey, data, 'attendance', 5);
        const serverCheck = data.CheckValue || data.checkValue;
        set({ 
          mainSourceData: {
            ...data,
            shiftdata: data.shiftdata || data.shift || null,
          },
          checkValue: serverCheck ? {
            attendanceId: serverCheck.id || serverCheck.attendanceId,
            checkIn: serverCheck.checkIn || undefined,
            checkOut: serverCheck.checkOut || undefined,
            notes: serverCheck.notes || undefined,
            status: serverCheck.status,
            excused: serverCheck.excused || [],
          } : null,
          matercis: serverCheck ? {
            dalyMate: {
              totalWorkedHours: serverCheck.totalWorkedHours ?? 0,
              lateMinutes: serverCheck.lateMinutes ?? 0,
              earlyLeaveMinutes: serverCheck.earlyLeaveMinutes ?? 0,
            }
          } : null,
          message,
          isLoading: false 
        });
      } else {
        set({ mainSourceData: null, checkValue: null, isLoading: false });
      }
    } catch (err: unknown) {
      const formattedError = AttendanceErrorCatch.report(err);
      // Fallback to stale cached data if network failed
      const stale = globalCache.getStale<MainSourceData>(cacheKey);
      const staleCheck = stale?.CheckValue || stale?.checkValue;
      set({
        mainSourceData: stale || null,
        checkValue: staleCheck ? {
          attendanceId: staleCheck.id || staleCheck.attendanceId,
          checkIn: staleCheck.checkIn || undefined,
          checkOut: staleCheck.checkOut || undefined,
          notes: staleCheck.notes || undefined,
          status: staleCheck.status,
          excused: staleCheck.excused || [],
        } : null,
        error: formattedError.userFriendlyMessage,
        isLoading: false,
      });
    }
  },

  PeriodSummary: async (input) => {
    const cacheKey = createSecureCacheKey('attendance_period', {
      employeeId: input.employeeId,
      mode: input.mode,
      dateAnchor: input.dateAnchor,
    });

    const cached = globalCache.get<BoundedPeriodReportOutput>(cacheKey);
    if (cached) {
      set({
        matercis: {
          periodLabel: cached.periodLabel,
          periodSummary: cached.summary,
          days: cached.records,
        },
      });
      return;
    }

    set({ isLoading: true, error: null });
    try {
    const res = await API.attendance.getPeriodReport(input);
      const data = res.data;

      if (data && data.records) {
        globalCache.set(cacheKey, data, 'attendance', 5);
        set({
          matercis: {
            periodLabel: data.periodLabel,
            periodSummary: data.summary,
            days: data.records,
          },
          isLoading: false,
        });
      } else {
        set({ matercis: null, isLoading: false });
      }
    } catch (err: unknown) {
      const formattedError = AttendanceErrorCatch.report(err);
      const stale = globalCache.getStale<BoundedPeriodReportOutput>(cacheKey);
      set({
        matercis: stale
          ? {
              periodLabel: stale.periodLabel,
              periodSummary: stale.summary,
              days: stale.records,
            }
          : null,
        error: formattedError.userFriendlyMessage,
        isLoading: false,
      });
    }
  },

  applyDay: (datt) => {
    set((state) => ({
      checkValue: {
        ...state.checkValue,
        attendanceId: String(datt.attendanceId),
        checkIn: datt.checkIn || undefined,
        checkOut: datt.checkOut || undefined,
        notes: datt.notes || undefined,
        status: datt.status,

      },
      matercis: {
        ...state.matercis,
        dalyMate: {

          totalWorkedHours: datt.totalWorkedHours?? 0,
          lateMinutes: datt.lateMinutes,
          earlyLeaveMinutes: datt.earlyLeaveMinutes,
        },
      },
    }));
  },

  fetchDemoShift: async (employeeId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await API.attendance.fetchDemoShift({ employeeId });
      const raw: any = res.data;
      const data: DemoSourceData = raw?.data !== undefined && raw.data !== raw ? raw.data : raw;
      if (data) {
        set({
          demoSourceData: data,
          demoCheckValue: data.demoCheckValue || null,
          todayReport: data.todayReport || null,
          isLoading: false,
        });
      } else {
        set({ demoSourceData: null, demoCheckValue: null, isLoading: false });
      }
    } catch (err: unknown) {
      const formattedError = AttendanceErrorCatch.report(err);
      set({ error: formattedError.userFriendlyMessage, isLoading: false });
    }
  },

  demoCheckIn: async (payload: DemoCheckInInput) => {
    set({ isLoading: true, error: null, message: '' });
    try {
      const res = await API.attendance.demoCheckIn(payload);
      const data = res.data?.data !== undefined && res.data.data !== res.data ? res.data.data : res.data;
      
      const checkInFormatted = data?.checkIn
        ? format(new Date(data.checkIn), 'HH:mm')
        : format(new Date(), 'HH:mm');

      set((state) => ({
        message: res.data?.message || (res as any)?.message || 'تم تسجيل الحضور في الوردية التجريبية بنجاح',
        error: null,
        demoCheckValue: {
          id: data?.id,
          attendanceId: data?.id,
          checkIn: checkInFormatted,
          checkOut: data?.checkOut ? format(new Date(data.checkOut), 'HH:mm') : undefined,
          notes: data?.employeeNote || data?.notes || payload.notes || '',
          status: data?.status || 'ON_TIME',
          totalWorkedHours: data?.totalWorkedHours ?? 0,
          earlyLeaveMinutes: data?.earlyLeaveMinutes ?? 0,
          lateMinutes: data?.lateMinutes ?? 0,
          excused: data?.excuses || [],
        },
        isLoading: false,
      }));
    } catch (err: unknown) {
      const formattedError = AttendanceErrorCatch.checkIn(err);
      set({ error: formattedError.userFriendlyMessage, message: '', isLoading: false });
    }
  },

  demoCheckOut: async (payload: DemoCheckOutInput) => {
    set({ isLoading: true, error: null, message: '' });
    try {
      const res = await API.attendance.demoCheckOut(payload);
      const data = res.data?.data !== undefined && res.data.data !== res.data ? res.data.data : res.data;

      const checkOutFormatted = data?.checkOut
        ? format(new Date(data.checkOut), 'HH:mm')
        : (typeof payload.checkOut === 'string' ? payload.checkOut : format(payload.checkOut, 'HH:mm'));

      set((state) => ({
        message: res.data?.message || (res as any)?.message || 'تم تسجيل الانصراف من الوردية التجريبية بنجاح',
        error: null,
        demoCheckValue: {
          ...state.demoCheckValue,
          checkOut: checkOutFormatted,
          notes: data?.employeeNote || data?.notes || '',
          status: data?.status,
          totalWorkedHours: data?.totalWorkedHours ?? 0,
          earlyLeaveMinutes: data?.earlyLeaveMinutes ?? 0,
          lateMinutes: data?.lateMinutes ?? 0,
        },
        isLoading: false,
      }));
    } catch (err: unknown) {
      const formattedError = AttendanceErrorCatch.checkOut(err);
      set({ error: formattedError.userFriendlyMessage, message: '', isLoading: false });
    }
  },
}));
