import { create } from 'zustand';

interface GeneralStatsState {
  disciplineRate: number;
  overallRating: 'EXCELLENT' | 'VERY_GOOD' | 'GOOD' | 'NEEDS_IMPROVEMENT' | null;
  isLoading: boolean;
  error: string | null;

  fetchGeneralStats: () => Promise<void>;
  updateRating: (rating: 'EXCELLENT' | 'VERY_GOOD' | 'GOOD' | 'NEEDS_IMPROVEMENT') => void;
}

export const useGeneralStatsStore = create<GeneralStatsState>((set) => ({
  disciplineRate: 0,
  overallRating: null,
  isLoading: false,
  error: null,

  fetchGeneralStats: async () => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with real API call when backend provides general discipline endpoint
      // const response = await API.managing.getEmployeeDisciplineRate(employeeProfileId);
      
      // Temporary simulated response until backend is connected
      const simulatedRate = 92; 
      const simulatedRating = 'EXCELLENT' as const;

      set({ disciplineRate: simulatedRate, overallRating: simulatedRating, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch general stats';
      set({ error: message, isLoading: false });
    }
  },

  updateRating: (rating) => {
    set({ overallRating: rating });
  }
}));
