import { ShiftOutput } from './shift.output';

export interface DepartmentListItemOutput {
  id: string;
  name: string;
}

export interface DepartmentOutput {
  id: string;
  name: string;
  description?: string;
  monthlyWorkingDays?: number;
  weekendDays?: number[];
  monthlyHolidays?: number;
  latePenaltyAmount?: number;
  earlyLeavePenaltyAmount?: number;
  absentPenaltyAmount?: number;
  managerId?: string;
  createdAt?: string;
  _count?: {
    employees: number;
  };
  shift?: ShiftOutput[];
  employees?: {
    id: string;
    userId: string;
    user?: {
      fullName: string;
      email: string;
      phone: string;
      jobTitle: string;
    };
  }[];
}

export interface DepartmentRegistryRow {
  id: string;
  name: string;
  description?: string;
  monthlyWorkingDays?: number;
  weekendDays?: number[];
  monthlyHolidays?: number;
  latePenaltyAmount?: number;
  earlyLeavePenaltyAmount?: number;
  absentPenaltyAmount?: number;
  shifts: ShiftOutput[];
  employees?:{
    id: string;
    userId: string;
    user?: {
      fullName: string;
      email: string;
      phone: string;
      jobTitle: string;
    };
  }[];
  employeeCount: number;
}
