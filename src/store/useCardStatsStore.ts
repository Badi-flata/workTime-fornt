import { create } from 'zustand';
import { API } from '../services/apiClient';
import { AggregatedMetrics, DashboardMeta, RegistryEntry } from '../types/dashboard-registry.types';
import { AxiosError } from 'axios';

interface FetchParams {
  mode: string;
  page?: string;
  limit?: string;
  dateAnchor?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  excludeBreakdown?: boolean;
}

interface CardStatsState {
  meta: DashboardMeta | null;
  metrics: AggregatedMetrics | null;
  registry: RegistryEntry[];
  isLoading: boolean;
  error: string | null;
  modalRegistry: RegistryEntry[];
  modalIsLoading: boolean;

  fetchCardMetrics: (params: FetchParams) => Promise<void>;
  fetchModalRegistry: (params: FetchParams) => Promise<void>;
  setLivePulseData: (data: Partial<AggregatedMetrics>) => void;
}

export const useCardStatsStore = create<CardStatsState>((set) => ({
  meta: null,
  metrics: null,
  registry: [],
  isLoading: false,
  error: null,
  modalRegistry: [],
  modalIsLoading: false,

  fetchCardMetrics: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await API.managing.getDashboardRegistry(params);
      const { meta, aggregatedMetrics, registry } = response.data;
      
      set({ 
        meta: meta ?? null,
        metrics: aggregatedMetrics ?? null, 
        registry: registry ?? [],
        isLoading: false 
      });
    } catch (err: unknown) {
      let message = 'فشل في جلب بيانات لوحة التحكم';
      
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          message = 'غير مصرّح: يجب تسجيل الدخول أولاً بحساب مدير (SUPER_ADMIN)';
        } else if (err.response?.status === 403) {
          message = 'ممنوع: لا تملك صلاحية الوصول لهذه البيانات';
        } else if (err.code === 'ERR_NETWORK') {
          message = 'لا يمكن الاتصال بالخادم — تأكد من تشغيل الباك-إند على المنفذ 3030';
        } else {
          message = err.response?.data?.message || err.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      
      set({ error: message, isLoading: false });
    }
  },

  fetchModalRegistry: async (params) => {
    set({ modalIsLoading: true, error: null });
    try {
      const response = await API.managing.getDashboardRegistry(params);
      const { registry } = response.data;
      set({ 
        modalRegistry: registry ?? [],
        modalIsLoading: false 
      });
    } catch (err: unknown) {
      let message = 'فشل في جلب سجلات الموظفين للبطاقة';
      if (err instanceof AxiosError) {
        message = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({ error: message, modalIsLoading: false });
    }
  },

  setLivePulseData: (data) => {
    set((state) => ({
      metrics: state.metrics ? { ...state.metrics, ...data } : null
    }));
  }
}));
