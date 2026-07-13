export type DisciplineRating =  'ALL' | 'EXCELLENT' | 'VERY_GOOD' | 'GOOD' | 'NEEDS_IMPROVEMENT';

export type StatusFilter = 'ALL' | 'ON_TIME' | 'LATE' | 'ABSENT' | 'EXCUSED' | 'ESCAPY';

export type Modes = 'ALL' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
export enum Role { EMPLOYEE = 'EMPLOYEE', MANAGER = 'MANAGER' };

export interface PeriodScope {
  start: string; // ISO String (Date only, yyyy-MM-dd)
  end: string;   // ISO String (Date only, yyyy-MM-dd)
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface DashboardMeta {
  RatingOrginzation:number;
  OrginzationLabel:DisciplineRating;
  periodScope: string;
  totalSubordinates: number;
  activeShiftContext: string;
  pagination: PaginationMeta;
}

export interface AggregatedMetrics {
  totalPresent: number;
  totalLateOccurrences: number;
  totalExcused: number;
  totalAbsent: number;
  totalEscaped: number;
  totalEarlyLeaves: number;
  totalDeductedEmployeesCount: number;
}

export interface DailyBreakdownEntry {
  attendanceId:number;
  date: string;
  shift: string | null;
  status: string; // ON_TIME | LATE | ABSENT | EXCUSED | ESCAPY
  checkIn: string | null;
  checkOut: string | null;
  earlyLeaveMinutes: number;
  deduction: number;
  excuseNotes: string | null;
}

export interface EmployeeSummary {
 totalDays: number;
  presentDays: number;
  onTimeDays: number;
  lateDays: number;
  absentDays: number;
  excusedDays: number;
  escapedDays: number;
  earlyDepartureDays: number;
  deductionDays: number;
  totalDeductions: number;
  totalWorkedMinutes: number;
  totalWorkedHours: number;
  totalDelayMinutes: number;
  totalEarlyLeaveMinutes: number;
}

export interface RegistryEntry {
  employeeId: string;
  name: string;
  jobTitle: string; // jobTitle
  avatar: string; // imageProfile URL or empty string
  disciplineRating: DisciplineRating;
  summary: EmployeeSummary;
  dailyBreakdown: DailyBreakdownEntry[];
}

export interface OptimizedDashboardResponse {
  meta: DashboardMeta;
  aggregatedMetrics: AggregatedMetrics;
  registry: RegistryEntry[];
}
