export interface DepartmentCreateInput {
  name: string;
  description?: string;
  monthlyWorkingDays?: number;
  weekendDays?: number[];
  monthlyHolidays?: number;
  latePenaltyAmount?: number;
  earlyLeavePenaltyAmount?: number;
  absentPenaltyAmount?: number;
}

export type DepartmentUpdateInput = Partial<DepartmentCreateInput>;
