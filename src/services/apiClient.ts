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

// استخراج رابط الـ Backend ديناميكياً حسب وضع التشغيل (Production/Publishing vs Local Development)
const getApiBaseUrl = (): string => {
  const isProd =
    process.env.NODE_ENV === 'production' ||
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');

  if (isProd) {
    return (
      process.env.NEXT_PUBLIC_API_PUBLISH_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'https://api.example.com'
    );
  }

  // في وضع التطوير المحلي:
  return (
    process.env.NEXT_PUBLIC_API_DEV_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3030'
  );
};

const API_URL = getApiBaseUrl();
  
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

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor — معالجة 401 والتجديد الصامت للتوكن مع تحرير الطلبات (Request Queue)
apiClient.interceptors.response.use(
  (response) => (response.data.timestamp ? response.data : response),
  async (error) => {
    const originalRequest = error.config;

    // إذا كان الخطأ 401 والطلب لم تتم محاولة تجديده مسبقاً
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/users/loginIn') && !originalRequest.url?.includes('/users/refresh-token')) {
      if (isRefreshing) {
        // تعليق الطلب في الطابور لحين انتهاء عملية التجديد
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

      if (!refreshToken) {
        if (typeof window !== 'undefined') useAuthStore.getState().logout();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${API_URL}/users/refresh-token`, { refresh_token: refreshToken });
        const data = res.data?.data || res.data;
        const newAccessToken = data.access_token;
        const newRefreshToken = data.refresh_token;

        if (typeof window !== 'undefined') {
          useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);
        }

        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;
        if (typeof window !== 'undefined') {
          useAuthStore.getState().logout();
        }
        return Promise.reject(refreshErr);
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
    getSettings: () => apiClient.get('/managing/settings'),
    updateSettings: (data: {
      autoCheckoutEnabled?: boolean;
      dailyDeductionEnabled?: boolean;
      delayDeductionEnabled?: boolean;
      earlyLeaveDeductionEnabled?: boolean;
      deductDelayImmediately?: boolean;
    }) => apiClient.patch('/managing/settings', data),
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
