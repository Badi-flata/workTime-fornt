import { DisciplineRating } from '../common/rating.types';

export interface UserOutput {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  jobTitle?: string;
  role: string;
  imageProfile?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeProfileOutput {
  id: string;
  userId: string;
  salary?: number;
  salaryDeduction?: number;
  isWorking?: boolean;
  managerId?: string;
  shiftId?: string;
  user?: UserOutput;
  shift?: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    departments?: {
      id: string;
      name: string;
    };
  };
  department?: {
    id: string;
    name: string;
  };
  disciplineRate?: number;
  disciplineRating?: DisciplineRating;
}

export interface AdminProfileOutput {
  id: string;
  userId: string;
  companyName?: string;
  user?: UserOutput;
  subordinates?: EmployeeProfileOutput[];
}

export interface FullProfileResponse {
  user: UserOutput & {
    employeeProfile?: EmployeeProfileOutput | null;
    adminProfile?: AdminProfileOutput | null;
  };
}
