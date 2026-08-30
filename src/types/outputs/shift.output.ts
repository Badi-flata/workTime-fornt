export interface ShiftOutput {
  id: string;
  name: string;
  employees:{
    userId:string;
    id:string;
  }[]
  startTime: string;
  endTime: string;
  gracePeriodMinIn: number;
  gracePeriodMinOut: number;
  departmentsId?: string;
  departmentName?: string;
  employeeCount?: number;
  managerName?: string;
}
