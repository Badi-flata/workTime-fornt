import { create } from 'zustand';
import { API } from '../services/apiClient';
import { 
  AggregatedMetricsOutput, 
  DashboardMetaOutput, 
  RegistryEntryOutput, 
  Modes 
} from '../types';
import { ManagingErrorCatch } from '../services/errorHandler';
import { globalCache, createSecureCacheKey } from '../utils/cacheManager';

interface FetchParams {
  mode: Modes;
  page?: string | number;
  limit?: string | number;
  dateAnchor?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  excludeBreakdown?: boolean;
}

interface CardStatsState {
  meta: DashboardMetaOutput | null;
  metrics: AggregatedMetricsOutput | null;
  registry: RegistryEntryOutput[];
  isLoading: boolean;
  error: string | null;
  modalRegistry: RegistryEntryOutput[];
  modalIsLoading: boolean;

  fetchCardMetrics: (params: FetchParams) => Promise<void>;
  fetchModalRegistry: (params: FetchParams) => Promise<void>;
  setLivePulseData: (data: Partial<AggregatedMetricsOutput>) => void;
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
    const cacheKey = createSecureCacheKey('card_stats_metrics', {
      mode: params.mode,
      dateAnchor: params.dateAnchor,
      page: params.page,
      status: params.status,
    });

    const cached = globalCache.get<{
      meta: DashboardMetaOutput;
      metrics: AggregatedMetricsOutput;
      registry: RegistryEntryOutput[];
    }>(cacheKey);

    if (cached) {
      set({
        meta: cached.meta,
        metrics: cached.metrics,
        registry: cached.registry,
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await API.managing.getDashboardRegistry(params as any);
      const { meta, aggregatedMetrics, registry } = response.data;
      
      const payload = {
        meta: meta ?? null,
        metrics: aggregatedMetrics ?? null,
        registry: registry ?? [],
      };

      globalCache.set(cacheKey, payload, 'managing', 5);

      set({ 
        ...payload,
        isLoading: false 
      });
    } catch (err: unknown) {
      const formattedError = ManagingErrorCatch.dashboard(err);
      const stale = globalCache.getStale<{
        meta: DashboardMetaOutput;
        metrics: AggregatedMetricsOutput;
        registry: RegistryEntryOutput[];
      }>(cacheKey);

      set({ 
        meta: stale?.meta || null,
        metrics: stale?.metrics || null,
        registry: stale?.registry || [],
        error: formattedError.userFriendlyMessage, 
        isLoading: false 
      });
    }
  },

  fetchModalRegistry: async (params) => {
    const cacheKey = createSecureCacheKey('card_stats_modal', {
      mode: params.mode,
      dateAnchor: params.dateAnchor,
      status: params.status,
      limit: params.limit,
    });

    const cached = globalCache.get<RegistryEntryOutput[]>(cacheKey);
    if (cached) {
      set({ modalRegistry: cached, modalIsLoading: false });
      return;
    }

    set({ modalIsLoading: true, error: null });
    try {
      const response = await API.managing.getDashboardRegistry(params as any);
      const { registry } = response.data;
      const list = registry ?? [];

      globalCache.set(cacheKey, list, 'managing', 5);

      set({ 
        modalRegistry: list,
        modalIsLoading: false 
      });
    } catch (err: unknown) {
      const formattedError = ManagingErrorCatch.dashboard(err);
      const stale = globalCache.getStale<RegistryEntryOutput[]>(cacheKey);
      set({ 
        modalRegistry: stale || [],
        error: formattedError.userFriendlyMessage, 
        modalIsLoading: false 
      });
    }
  },

  setLivePulseData: (data) => {
    set((state) => ({
      metrics: state.metrics ? { ...state.metrics, ...data } : null
    }));
  }
}));
