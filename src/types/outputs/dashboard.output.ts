import { DisciplineRating } from '../common/rating.types';
import { PaginationMeta } from '../common/pagination.types';
import { AttendanceSummaryOutput, DailyBreakdownOutput } from './attendance.output';

export interface DashboardMetaOutput {
  RatingOrginzation: number;
  OrginzationLabel: DisciplineRating;
  periodScope: string;
  totalSubordinates: number;
  activeShiftContext: string;
  pagination: PaginationMeta;
}

export interface AggregatedMetricsOutput {
  totalPresent: number;
  totalLateOccurrences: number;
  totalExcused: number;
  totalAbsent: number;
  totalEscaped: number;
  totalEarlyLeaves: number;
  totalDeductedEmployeesCount: number;
}

export interface RegistryEntryOutput {
  employeeId: string;
  name: string;
  jobTitle: string;
  isWorking: boolean;
  avatar: string;
  disciplineRating: DisciplineRating;
  summary: AttendanceSummaryOutput;
  dailyBreakdown: DailyBreakdownOutput[];
}

export interface EmployeeDashboardOutput {
  periodLabel:string;
  messageSuccessd:string;
  profile: {
    imageProfile:string;
    fullName: string;
    jobTitle: string;
    phone: string;
    email: string;
    managerName: string;
    departmentName: string;
    salary:string;
    shift:string;
  };
  disciplineRate: {
    rate: number;
    label: string;
    periodCountDiscipline: string;
  } |null;
  summary: AttendanceSummaryOutput;
  daysLog: DailyBreakdownOutput[];
}

export interface OptimizedDashboardResponse {
  meta: DashboardMetaOutput;
  aggregatedMetrics: AggregatedMetricsOutput;
  registry: RegistryEntryOutput[];
}

// Backward-compatibility Aliases
export type RegistryEntry = RegistryEntryOutput;
export type DashboardMeta = DashboardMetaOutput;
export type EmployeeDashboardMeta = EmployeeDashboardOutput;
export type AggregatedMetrics = AggregatedMetricsOutput;
export type DailyBreakdownEntry = DailyBreakdownOutput;
export type EmployeeSummary = AttendanceSummaryOutput;
