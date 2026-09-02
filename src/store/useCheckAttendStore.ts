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
    endTime: string;
    gracePeriodMinIn: number;
    gracePeriodMinOut: number;
  } | null;
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
    totalWorkHours: number;
    lateMinutes?: number;
    earlyLeaveMinutes?: number;
  };
  dailyMetrics?: {
    totalWorkHours: number;
    lateMinutes?: number;
    earlyLeaveMinutes?: number;
  };
  periodSummary?: AttendanceSummaryOutput;
  days?: DailyBreakdownOutput[];
}

export interface CheckAttendState {
  mainSourceData: MainSourceData | null;
  checkValue: CheckValue | null;
  matercis: AttendanceMetrics | null;
  metrics?: AttendanceMetrics | null;
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

  CheckIn: (att: CheckInInput) => Promise<void>;
  CheckOut: (depar: CheckOutInput) => Promise<void>;
  fetchSourceData: (employeeId?: string, date?: string) => Promise<void>;
  PeriodSummary: (input: { dateAnchor?: string; mode: Modes; employeeId?: string }) => Promise<void>;
  applyDay: (datt: DailyBreakdownOutput) => void;
}

export const useCheckAttendStore = create<CheckAttendState>((set, get) => ({
  mainSourceData: null,
  checkValue: null,
  matercis: null,
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
    set({ isLoading: true, error: null });
    try {
      const res = await API.attendance.checkIn(att);
      const data = res.data?.data || res.data;
      const excuses = data?.excuses;

      // Invalidate attendance caches so fresh data is fetched next
      globalCache.invalidateTag('attendance');

      set({
        message: res.data?.message || res.data?.Message || 'تم تسجيل الحضور بنجاح',
        checkValue: {
          attendanceId: data?.id,
          checkIn: format(parseISO(att.checkIn), 'HH:mm'),
          notes: data?.notes,
          status: data?.status,
          excused: excuses ? [...excuses] : [],
        },
        isLoading: false,
      });
    } catch (err: unknown) {
      const formattedError = AttendanceErrorCatch.checkIn(err);
      set({ error: formattedError.userFriendlyMessage, isLoading: false });
    }
  },

  CheckOut: async (depar) => {
    set({ isLoading: true, error: null });
    try {
      const res = await API.attendance.checkOut(depar);
      const data = res.data?.data || res.data;
      const excuses = data?.excuses;

      // Invalidate attendance caches upon mutation
      globalCache.invalidateTag('attendance');

      set((state) => ({
        checkValue: {
          ...state.checkValue,
          checkOut: typeof depar.checkOut === 'string' ? depar.checkOut : format(depar.checkOut, 'HH:mm'),
          notes: data?.employeeNote || data?.notes || '',
          status: data?.status,
          excused: excuses ? [...excuses] : state.checkValue?.excused || [],
        },
        matercis: {
          ...state.matercis,
          dalyMate: {
            totalWorkHours: data?.totalWorkedHours ?? 0,
            lateMinutes: data?.lateMinutes ?? 0,
            earlyLeaveMinutes: data?.earlyLeaveMinutes ?? 0,
          },
        },
        isLoading: false,
      }));
    } catch (err: unknown) {
      const formattedError = AttendanceErrorCatch.checkOut(err);
      set({ error: formattedError.userFriendlyMessage, isLoading: false });
    }
  },

  fetchSourceData: async ( date?: string,employeeId?: string) => {
    const cacheKey = createSecureCacheKey('attendance_source', {  date,employeeId });
    const cached = globalCache.get<MainSourceData>(cacheKey);
    if (cached) {
      set({ mainSourceData: cached });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await API.attendance.fetchSourceData({ date, employeeId });
      const {data , message }= res.data;
  
     console.log('res:',res)
      if (data) {
        globalCache.set(cacheKey, data, 'attendance', 5);
        set({ 
          mainSourceData: data, 
          message,
          isLoading: false 
        });
      } else {
        set({ mainSourceData: null, isLoading: false });
      }
    } catch (err: unknown) {
      const formattedError = AttendanceErrorCatch.report(err);
      // Fallback to stale cached data if network failed
      const stale = globalCache.getStale<MainSourceData>(cacheKey);
      set({
        mainSourceData: stale || null,
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
    }));
  },
}));
