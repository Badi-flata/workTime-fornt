export interface ExcuseOutput {
  id?: string;
  type: string;
  reason: string;
  isApproved?: boolean;
}

export interface DailyBreakdownOutput {
  attendanceId: string | number;
  date: string;
  status: string;
  shift?: string | null;
  shiftName?: string;
  shiftStart?: string;
  shiftEnd?: string;
  graceIn?: number;
  graceOut?: number;
  name?: string;
  managerName?: string;
  departmentName?: string;
  checkIn: string | null;
  checkOut: string | null;
  earlyLeaveMinutes?: number;
  lateMinutes?: number;
  totalWorkedHours?: number ;
  totalWorkedMinutes?: number;
  deduction?: number;
  excuseNotes?: string | null;
  adminNotes?: string | null;
  notes?: string | null;
  excuses?: ExcuseOutput[];
}

export interface AttendanceSummaryOutput {
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

export interface BoundedPeriodReportOutput {
  periodLabel: string;
  summary: AttendanceSummaryOutput;
  records: DailyBreakdownOutput[];
  label?: string;
  rate?: number;
}
