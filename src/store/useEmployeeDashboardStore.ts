import { DailyBreakdownEntry, EmployeeDashboardMeta, EmployeeSummary } from "@/types";
import {create} from 'zustand';
import { API } from '@/services/apiClient';
import { AuthErrorCatch } from '@/services/errorHandler';
import { globalCache, createSecureCacheKey } from '@/utils/cacheManager';
import { format } from "date-fns";


interface ProfileState {

  imageProfile?: string;
  periodLabel?: string;
  fullName: string;
  jobTitle?: string;
  email: string;
  phone: string;
  managerName?: string;
  departmentName?: string;
  shift:string
  salary:string;
  dsicipline?:{
     rate: number ;
     label: string | "لا يوجد بيانات";
     periodCountDiscipline: string | "لا يوجد بيانات"; 
  } | null;
  summary:EmployeeSummary |null
  daysLog:DailyBreakdownEntry[]|[]
  dateAnchor:string;
  mode: "WEEKLY"|"MONTHLY" |"DAILY";
  currentPage:number;
  messageSuccessd?: string | null;
  isLoading: boolean;
  error: string;
  fetchDashboardEmployee: (mode:"WEEKLY"|"MONTHLY" |"DAILY",dateAnchor:string,employeeId?:string) => Promise<void>;
  clearMessages: () => void;
  setFiltersDate: (dateAnchor:string) => void;
  setFiltersMode: (mode: "WEEKLY"|"MONTHLY" |"DAILY") => void;
  togglePage: (page:number) => void;
}

export const useEmployeeDashboardStore = create<ProfileState>((set, get) => ({
  imageProfile: '',
  fullName: '',
  jobTitle: '',
  email: '',
  periodLabel: '',
  phone: '',
  shift:"",
  salary:"",
  dsicipline:null,
  messageSuccessd: '',
  summary: null,
  daysLog: [],
  dateAnchor: format(new Date(), "yyyy-MM-dd"),
  mode: "WEEKLY",
  currentPage:1,
  isLoading: false,
  error: '',

  clearMessages: () => {
    set({ error: '', messageSuccessd: null });
  },
  setFiltersDate: (dateAnchor) => {
    set({ dateAnchor: dateAnchor });
  },
setFiltersMode: (mode) => {
    set({ mode:mode });
  },
  togglePage: (page) => {
    set({ currentPage:page });
  },

  fetchDashboardEmployee: async (mode ,dateAnchor,employeeId) => {
    set({ isLoading: true, error: '' });

    const cacheKey = createSecureCacheKey('emp_dash', {
      mode: mode || 'DEFAULT',
      dateAnchor: dateAnchor || 'DEFAULT',
      employeeId: employeeId || 'self'
    });
    
    const cached = globalCache.get<any>(cacheKey);
    if (cached) {
      set({ ...cached, isLoading: false });
      return;
    }

    try {
      const res = await API.employee.getMyDashboard(mode ,dateAnchor,employeeId);
      const { periodLabel, profile , disciplineRate , summary , daysLog , messageSuccessd } = res.data as EmployeeDashboardMeta;

      if (!profile || !res.data) {
        set({ messageSuccessd: 'لم يتم العثور على بيانات المستخدم', isLoading: false });
        return;
      }

      const statePayload: Partial<ProfileState> = {
          periodLabel,
          messageSuccessd,
        imageProfile: profile.imageProfile,
        fullName: profile.fullName,
        jobTitle: profile.jobTitle,
        email: profile.email,
        phone: profile.phone,
        managerName: profile.managerName,
        departmentName: profile.departmentName,
        shift:profile.shift,
        salary:profile.salary,
        ...(disciplineRate ? { dsicipline: { 
            rate:disciplineRate.rate
             , label: disciplineRate.label 
             , periodCountDiscipline: disciplineRate.periodCountDiscipline
             }} : {dsicipline:null}) ,
        summary: summary,
        daysLog:daysLog,
        // profile
        isLoading:false,
      
          }

      globalCache.set(cacheKey, statePayload, 'emp_dash', 5);
      set(statePayload as any);
    } catch (err: unknown) {
      const formattedError = AuthErrorCatch.profile(err);
      const stale = globalCache.getStale<any>(cacheKey);
      set({
        ...(stale || {}),
        error: formattedError.userFriendlyMessage,
        isLoading: false,
      });
    }
  },

 
  
}));