export type AttendanceStatus =
  | 'ON_TIME'
  | 'LATE'
  | 'ABSENT'
  | 'EXCUSED'
  | 'ESCAPY'
  | 'EARLY_LEAVE';

export type StatusFilter =
  | 'ALL'
  | 'ON_TIME'
  | 'LATE'
  | 'ABSENT'
  | 'EXCUSED'
  | 'ESCAPY'
  | 'DEDUCTED'
  | 'EARLY_LEAVE';

export const STATUS_LABELS: Record<string, string> = {
  ON_TIME: 'حاضر',
  LATE: 'متأخر',
  ABSENT: 'غياب',
  EXCUSED: 'معذور',
  ESCAPY: 'خروج مبكر',
  EARLY_LEAVE: 'خروج مبكر',
};
