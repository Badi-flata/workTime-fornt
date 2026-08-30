export interface DirectoryUserOutput {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'SUPER_ADMIN';
  imageProfile?: string;
  createdAt: string;
  employeeProfile?: {
    id: string;
    userId?: string;
    isWorking: boolean;
    salary: number;
    managerId?: string | null;
    departmentId?: string | null;
    shiftId?: string | null;
    department?: { id: string; name: string; description?: string } | null;
    shift?: { id: string; name: string; startTime: string; endTime: string; gracePeriodMinIn?: number; gracePeriodMinOut?: number } | null;
    disciplineRate?: { rate: number; label: string ;periodCountDiscipline:string };
  } | null;
  adminProfile?: {
    id: string;
    userId?: string;
    managedDepartments?: {
      id: string;
      name: string;
      description?: string;
      shift?: { id: string; name: string; startTime: string; endTime: string }[];
      organizationDiscipline?: { rate: number; label: string }[]
    }[];
    subordinates?: { id: string; user?: { fullName: string } ; discipline?: { rate: number; label: string }}[];
    organizationDiscipline?: { rate: number; label: string ;periodCountDiscipline:string }
  } | null;
}

export interface DirectorySearchResponse {
  data: DirectoryUserOutput[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
