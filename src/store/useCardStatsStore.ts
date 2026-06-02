import { create } from 'zustand';
import { API } from '../services/apiClient';
import { AggregatedMetrics } from '../types/dashboard-registry.types';

interface CardStatsState {
  metrics: AggregatedMetrics | null;
  registry: import('../types/dashboard-registry.types').RegistryEntry[];
  isLoading: boolean;
  error: string | null;

  fetchCardMetrics: (params: { start: string; end: string; mode: string }) => Promise<void>;
  setLivePulseData: (data: Partial<AggregatedMetrics>) => void;
}

export const useCardStatsStore = create<CardStatsState>((set) => ({
  metrics: null,
  registry: [],
  isLoading: false,
  error: null,

  fetchCardMetrics: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await API.managing.getDashboardRegistry(params);
      if (response.data && response.data.aggregatedMetrics && response.data.registry) {
        set({ 
          metrics: response.data.aggregatedMetrics, 
          registry: response.data.registry,
          isLoading: false 
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch card metrics';
      set({ error: message, isLoading: false });
    }
  },

  setLivePulseData: (data) => {
    set((state) => ({
      metrics: state.metrics ? { ...state.metrics, ...data } : null
    }));
  }
}));
