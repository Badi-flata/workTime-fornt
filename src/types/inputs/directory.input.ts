export interface SearchDirectoryParams {
  search_Word?: string;
  word?: string;
  page?: number;
  limit?: number;
  role?: 'all' | 'EMPLOYEE' | 'MANAGER'|"SUPER_ADMIN";
  includeDiscipline?: boolean;
}

export interface AssignEmployeeInput {
  employeeUserId?: string;
  name?: string; 
  email: string; 
  phone?: string | undefined; 
  jobTitle?: string | undefined; 
  departmentId: string;
  shiftId: string;
  salary?: number;
}
