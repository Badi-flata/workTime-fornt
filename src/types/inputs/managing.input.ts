import { Modes } from '../common/date-modes.types';
export * from './shift.input';

export interface AddEmployeeInput {
  shiftId: string;
  departmentId: string;
  salary?: number;
}

export interface AuditEmployeeInput {
  employeeId?: string;
  email?: string;
  salary?: number;
  isWorking?: boolean;
  shiftId?: string;
  jobTitle?: string;
  attendanceId?: string;
  employeestatus?: string;
  adminNotes?: string;
}

export interface SalaryDeductionInput {
  periodStart?: string;
  periodEnd?: string;
}

export interface PeriodReportQueryInput {
  dateAnchor?: string;
  startDate?: string;
  mode: Modes;
  employeeId?: string;
}
