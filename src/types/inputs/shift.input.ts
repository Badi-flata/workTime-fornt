export interface ShiftCreateInput {
  name: string;
  startTime: string; // e.g. "08:00"
  endTime: string;   // e.g. "16:00"
  gracePeriodMinIn?: number;  // Default: 15 minutes
  gracePeriodMinOut?: number; // Default: 30 minutes
  departmentsId: string;
  managerName?: string;
}

export type ShiftUpdateInput = Partial<ShiftCreateInput>;
