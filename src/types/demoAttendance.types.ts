export interface DemoShiftDefinition {
  shiftId: string;
  name: string;
  startTime: string; // HH:mm:ss أو HH:mm
  endTime: string;   // HH:mm:ss أو HH:mm
  gracePeriodMinIn: number;
  gracePeriodMinOut: number;
  isDemo: true;
}

export interface DemoAttendanceValue {
  id?: string;
  attendanceId?: string;
  checkIn?: string;
  checkOut?: string;
  status?: string;
  notes?: string;
  totalWorkedHours?: number;
  earlyLeaveMinutes?: number;
  lateMinutes?: number;
  excused?: any[];
}

export interface todayReport{
           id: string;
           date:string;
          status: string;
          shiftId:string;
          shiftName:string;
          departmentName:string;
          checkIn: string;
          checkOut: string;
}

export interface DemoSourceData {
  periodDate: string;
  name: string;
  departmentName: string;
  managerName: string;
  demoShift: DemoShiftDefinition;
  demoCheckValue: DemoAttendanceValue | null;
  todayReport: todayReport | null;
}

export interface DemoCheckInInput {
  shiftId: string;
  employeeId?: string;
  checkIn: string;
  notes?: string;
}

export interface DemoCheckOutInput {
  attendId: string;
  shiftId: string;
  employeeId?: string;
  checkOut: Date | string;
  notes?: string;
}
