import { create } from 'zustand';

interface GeneralStatsState {
  disciplineRate: number;
  overallRating: 'EXCELLENT' | 'VERY_GOOD' | 'GOOD' | 'NEEDS_IMPROVEMENT' | null;
  isLoading: boolean;
  error: string | null;

  fetchGeneralStats: () => Promise<void>;
  updateRating: (rating: 'EXCELLENT' | 'VERY_GOOD' | 'GOOD' | 'NEEDS_IMPROVEMENT') => void;
  reset: () => void;
}

/**
 * useGeneralStatsStore — Store خام لإحصائيات الانضباط العامة
 * يمكن استخدامه مستقبلاً لعمليات Discipline مفصولة
 * مثل: تقييم قسم كامل أو تقييم المؤسسة ككل
 */
export const useGeneralStatsStore = create<GeneralStatsState>((set) => ({
  disciplineRate: 0,
  overallRating: null,
  isLoading: false,
  error: null,

  fetchGeneralStats: async () => {
    // TODO: ربط بـ API عند توفر endpoint مخصص للإحصائيات العامة
    // مثل: GET /managing/organization-discipline?mode=MONTHLY
    set({ isLoading: false, error: null });
  },

  updateRating: (rating) => {
    set({ overallRating: rating });
  },

  reset: () => {
    set({ disciplineRate: 0, overallRating: null, isLoading: false, error: null });
  },
}));
