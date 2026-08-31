import { create } from 'zustand';
import { API } from '@/services/apiClient';
import { 
  EmployeeProfileOutput,
  AttendanceSummaryOutput,
  DailyBreakdownOutput,
  BoundedPeriodReportOutput
} from '@/types';
import { ManagingErrorCatch } from '@/services/errorHandler';
import { globalCache, createSecureCacheKey } from '@/utils/cacheManager';

export type Employee = EmployeeProfileOutput;

export interface EmployeeRecordStore {
  // Employees
  employees: EmployeeProfileOutput[];
  selectedEmployee: EmployeeProfileOutput | null;
  
  // Attendance records
  attendanceRecords: DailyBreakdownOutput[];
  reportSummary: AttendanceSummaryOutput | null;
  disciplineRate?: number;
  disciplineLabel?: string;

  // Filter items
  searchQuery: string;
  periodMode: 'WEEKLY' | 'MONTHLY';
  searchDate: string;

  // Loading status
  isLoadingEmployees: boolean;
  isLoadingReport: boolean;

  // Notifications
  successMessage: string | null;
  errorMessage: string | null;

  // Set filter actions
  setSearchDate: (date: string) => void;
  setPeriodMode: (mode: 'WEEKLY' | 'MONTHLY') => void;
  setSearchQuery: (query: string) => void;

  // Data actions
  fetchMyEmployee: () => Promise<void>;
  closeMessage :()=> void
  fetchEmployeeAttendanceReport: (dateAnchor: string, mode: 'WEEKLY' | 'MONTHLY', employeeId: string) => Promise<void>;
  applyEmployee: (emplo: EmployeeProfileOutput) => void;
}

export const useEmployeeRecordStore = create<EmployeeRecordStore>((set, get) => ({
  employees: [],
  selectedEmployee: null,
  attendanceRecords: [],
  reportSummary: null,
  disciplineRate: 0,
  disciplineLabel: 'NEEDS_IMPROVEMENT',

  searchQuery: '',
  periodMode: 'MONTHLY',
  searchDate: '',

  isLoadingEmployees: false,
  isLoadingReport: false,
  successMessage: null,
  errorMessage: null,

  setSearchDate: (date) => set({ searchDate: date }),
  setPeriodMode: (mode) => set({ periodMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  closeMessage: () => set({ successMessage: null, errorMessage: null }),

  fetchMyEmployee: async () => {
    const cacheKey = createSecureCacheKey('managing_subordinates', {});
    const cached = globalCache.get<EmployeeProfileOutput[]>(cacheKey);
    if (cached) {
      set({
        employees: cached,
        selectedEmployee: cached[0] || null,
        isLoadingEmployees: false,
      });
      return;
    }

    try {
      set({ isLoadingEmployees: true, errorMessage: null });
      const res = await API.managing.getMyEmployees();
      const result = res;
      
      if (result) {
        const employeesList = Array.isArray(result.data) ? result.data : [];
        globalCache.set(cacheKey, employeesList, 'managing', 5);
        set({
          employees: employeesList,
          selectedEmployee: employeesList[0] || null,
          isLoadingEmployees: false,
        });
      } else {
        set({
          errorMessage: null,
          employees: [],
          selectedEmployee: null,
          isLoadingEmployees: false,
        });
      }
    } catch (err: unknown) {
      const formattedError = ManagingErrorCatch.subordinates(err);
      const stale = globalCache.getStale<EmployeeProfileOutput[]>(cacheKey);
      set({
        errorMessage: formattedError.userFriendlyMessage,
        isLoadingEmployees: false,
        employees: stale || [],
        selectedEmployee: stale ? stale[0] : null,
      });
    }
  },

  fetchEmployeeAttendanceReport: async (dateAnchor, mode, employeeId) => {
    const cacheKey = createSecureCacheKey('managing_employee_report', { employeeId, mode, dateAnchor });
    const cached = globalCache.get<BoundedPeriodReportOutput>(cacheKey);
    if (cached) {
      set({
        attendanceRecords: cached.records || [],
        reportSummary: cached.summary || null,
        disciplineLabel: cached.label || 'GOOD',
        disciplineRate: cached.rate || 85,
        isLoadingReport: false,
      });
      return;
    }

    try {
      set({ isLoadingReport: true, errorMessage: null });
      const res = await API.managing.getPeriodReport({ dateAnchor, mode, employeeId });
      const result = res.data;

      if (result && result.records && result.summary) {
        globalCache.set(cacheKey, result, 'managing', 5);
        set({
          attendanceRecords: result.records,
          reportSummary: result.summary,
          disciplineLabel: result.label,
          disciplineRate: result.rate,
          successMessage: 'تم جلب تقرير الحضور والملخص بنجاح',
          isLoadingReport: false,
        });
      } else {
        set({
          errorMessage: null,
          attendanceRecords: [],
          reportSummary: null,
          isLoadingReport: false,
        });
      }
    } catch (err: unknown) {
      const formattedError = ManagingErrorCatch.report(err);
      const stale = globalCache.getStale<BoundedPeriodReportOutput>(cacheKey);
      set({
        errorMessage: formattedError.userFriendlyMessage,
        isLoadingReport: false,
        attendanceRecords: stale ? stale.records : [],
        reportSummary: stale ? stale.summary : null,
      });
    }
  },

  applyEmployee: (emplo) => {
    set({ selectedEmployee: emplo });
  },
}));
