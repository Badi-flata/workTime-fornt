export interface ExcuseInput {
  type: 'LATE' | 'ABSENT' | 'EARLY_DEPARTURE' | 'IN' | 'OUT';
  reason: string;
  notes?: string;
}

export interface CheckInInput {
  shiftId: string;
  employeeId?: string;
  checkIn: string;
  notes?: string;
  excused?: {
    type: 'LATE' | 'ABSENT';
    reason: string;
  };
}

export interface CheckOutInput {
  attendId: string;
  shiftId: string;
  employeeId?: string;
  checkOut: Date | string;
  notes?: string;
  excused?: {
    type: 'EARLY_DEPARTURE' | 'ABSENT';
    reason: string;
  } | null;
}

export interface SubmitExcuseInput {
  attendanceId?: string;
  type: 'IN' | 'OUT' | 'LATE' | 'ABSENT' | 'EARLY_DEPARTURE';
  reason?: string;
  notes?: string;
}

export interface AttendanceSourceParams {
  date?: string;
   employeeId?: string;
}
