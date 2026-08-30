export type DisciplineRating =
  | 'ALL'
  | 'EXCELLENT'
  | 'VERY_GOOD'
  | 'GOOD'
  | 'NEEDS_IMPROVEMENT';

export const RATING_LABELS: Record<string, string> = {
  EXCELLENT: 'ممتاز',
  VERY_GOOD: 'جيد جداً',
  GOOD: 'جيد',
  NEEDS_IMPROVEMENT: 'متدني',
};
