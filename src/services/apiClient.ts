import axios from 'axios';
import {
  OptimizedDashboardResponse,
  Modes,
  LoginInput,
  SignUpInput,
  ProfileUpdateInput,
  CheckInInput,
  CheckOutInput,
  SubmitExcuseInput,
  AttendanceSourceParams,
  AddEmployeeInput,
  AuditEmployeeInput,
  ShiftCreateInput,
  ShiftUpdateInput,
  DepartmentCreateInput,
  DepartmentUpdateInput,
  BoundedPeriodReportOutput,
  PaginationParams,
  FullProfileResponse,
  ShiftOutput,
  DepartmentOutput,
  DepartmentListItemOutput,
  SearchDirectoryParams,
  DirectorySearchResponse,
  AssignEmployeeInput,
  ApiSuccessResponse,
  EmployeeDashboardMeta
} from '../types';
import { useAuthStore } from '../store/useAuthStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030";
  
export const apiClient = axios.create({
  baseURL: API_URL,
});

// Request Interceptor for Auth Token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response Interceptor — معالجة 401 تلقائياً
apiClient.interceptors.response.use(
  (response) => (response.data.timestamp ? response.data : response),
  (error) => {
    if (error.response?.status === 401) {
      // تنظيف حالة المصادقة وإعادة التوجيه لتسجيل الدخول
      if (typeof window !== 'undefined') {
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);

// Centralized API Endpoints mapped cleanly to Backend routes
export const API = {
  // 🔓 Public Route APIs
  public: {
    logUp: (data: SignUpInput) => apiClient.post('/users/logUp', data),
    loginIn: (data: LoginInput) => apiClient.post('/users/loginIn', data),
  },
  
  // 👥 Authenticated User APIs
  users: {
    search: (params?: SearchDirectoryParams | string) => {
      if (typeof params === 'string') {
        return apiClient.get<DirectorySearchResponse>('/users/search_Word', { params: { search_Word: params } });
      }
      return apiClient.get<DirectorySearchResponse>('/users/search_Word', { params });
    },
    updateMyProfile: (data: ProfileUpdateInput) => apiClient.patch('/users/update-my-profile', data),
    uploadAvatar: (formData: FormData) =>
      apiClient.post<{ statusCode: number; message: string; data: { imageProfile: string; user: any } }>(
        '/users/upload-avatar',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      ),
    updateAvatar: (imageProfile: string) =>
      apiClient.patch<{ statusCode: number; message: string; data: { imageProfile: string; user: any } }>(
        '/users/update-avatar',
        { imageProfile }
      ),
    deleteMyProfile: () => apiClient.delete('/users/delete-my-profile'),
    getProfile: () => apiClient.get<FullProfileResponse>('/users/profile'),
  },

  // 👷 Employee Exclusive APIs
  employee: {
    setManager: (data: { managerId: string }) => apiClient.post('/employee/set-manager', data),
    updateProfile: (data: ProfileUpdateInput) => apiClient.patch('/employee/update-profile', data),
    getTodayStatus: () => apiClient.get('/employee/today-status'),
    getMyDashboard: (mode:Modes,dateAnchor:string,employeeId?:string) => apiClient.get<EmployeeDashboardMeta>('/employee/my-dashboard',{ params: { mode, dateAnchor, employeeId } }),
    getDisciplineRate: (days?:number) => apiClient.get('/employee/discipline-rate', { params: { days } }),
  },

  // 👷 Employee Attendance APIs
  attendance: {
    checkIn: (payload: CheckInInput) => apiClient.post('/attendance/check-in', payload),
    checkOut: (payload: CheckOutInput) => apiClient.post('/attendance/check-out', payload),
    fetchSourceData: (params?: AttendanceSourceParams) => apiClient.get('/attendance/shift', { params }),
    submitExcuse: (data: SubmitExcuseInput) => apiClient.post('/attendance/submit-excuse', data),
    getPeriodReport: (params: { dateAnchor?: string; mode: Modes; employeeId?: string }) => 
      apiClient.get<BoundedPeriodReportOutput>('/attendance/bounded-period-report', { params }),
  },
  
  // 👑 Manager Exclusive APIs
  managing: {
    getDashboardRegistry: (params?: { 
      mode?: Modes; 
      page?: number | string; 
      limit?: number | string; 
      dateAnchor?: string; 
      startDate?: string; 
      endDate?: string;
      status?: string;
      excludeBreakdown?: boolean | string;
    }) => 
      apiClient.get<OptimizedDashboardResponse>('/managing/dashboard-registry', { params }),
    
    getPeriodReport: (data: { dateAnchor?: string; mode: Modes; employeeId?: string; startDate?: string }) => 
      apiClient.get<BoundedPeriodReportOutput>(`/managing/employee-bounded-report/${data.employeeId || ''}`, { 
        params: { startDate: data.dateAnchor || data.startDate, mode: data.mode } 
      }),

    addEmployee: (id?: string, data?: Partial<AssignEmployeeInput> | Partial<AddEmployeeInput>) => 
      apiClient.post(`/managing/add-employee/${id}`, data),
    truneToDepartmentEmployee: (id: string, data?:Partial<AddEmployeeInput>) => 
      apiClient.post(`/managing/trune-to-department/${id}`, data),

    firedEmployee: (id: string) => apiClient.delete(`/managing/fired-employee/${id}`),
    getMyEmployees: (params?: PaginationParams) => apiClient.get('/managing/my-employees', { params }),
    
    // Employee Management & Reports
    auditEmployee: (params: { email?: string; employeeId?: string }, data: AuditEmployeeInput) => 
      apiClient.patch('/managing/audit-employee', data, { params }),
    getEmployeeDisciplineRate: (employeeProfileId: string, days?: number) => 
      apiClient.get(`/managing/discipline-rate/${employeeProfileId}`, { params: { days } }),
    
    // Excuses & Deductions
    getPendingExcuses: () => apiClient.get('/managing/pending-excuses'),
    approveExcuse: (id: string) => apiClient.post(`/managing/approve-excuse/${id}`),
    autoCheckout: () => apiClient.post('/managing/auto-check'),
    salaryDeduction: (employeeId: string) => apiClient.post(`/managing/salary-deduction/${employeeId}`),
  },

  // 🏢 Department & Shifts APIs (Unified)
  department: {
    create: (data: DepartmentCreateInput) => apiClient.post('/department', data),
    getAll: () => apiClient.get<DepartmentOutput[]>('/department'),
    getById: (id: string) => apiClient.get<DepartmentOutput>(`/department/${id}`),
    update: (id: string, data: DepartmentUpdateInput) => apiClient.patch(`/department/${id}`, data),
    delete: (id: string) => apiClient.delete(`/department/${id}`),
    getListNames: () => apiClient.get<DepartmentListItemOutput[]>('/department/list/names'),
    
    // Shifts APIs within Department scope
    createShift: (data: ShiftCreateInput) => apiClient.post('/department/shifts', data),
    getShifts: () => apiClient.get<ShiftOutput[]>('/department/shifts'),
    updateShift: (id: string, data: ShiftUpdateInput) => apiClient.patch(`/department/shifts/${id}`, data),
    deleteShift: (id: string) => apiClient.delete(`/department/shifts/${id}`),
  }
};
