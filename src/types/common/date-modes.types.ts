export type Modes = 'ALL' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export enum Role {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface PeriodScope {
  start: string; // ISO Date (yyyy-MM-dd)
  end: string;   // ISO Date (yyyy-MM-dd)
}

export interface PeriodFilterParams {
  dateAnchor?: string;
  mode: Modes;
  employeeId?: string;
  startDate?: string;
  endDate?: string;
}
