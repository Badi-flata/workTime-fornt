import axios from 'axios';
import { OptimizedDashboardResponse } from '../types/dashboard-registry.types';
import { useAuthStore } from '../store/useAuthStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030"
  
export const apiClient = axios.create({
  baseURL: API_URL,
});
 
// Temporary dev token for seamless frontend testing
 const DEV_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ij8_Pz8gPz8_Pz8_PyIsInVzZXJJZCI6IjcxYzA2NThhLTk5NWMtNDA0My05N2I1LWJlMWY5Yzc0NjRkOCIsInJvbGUiOiJTVVBFUl9BRE1JTiIsImlhdCI6MTc4MDU4OTAyMiwiZXhwIjoxNzgzMTgxMDIyfQ.uMTHLvZWJqIeDj32YldQBS5_-Rw-dqPriaIC_rQH-hw";

// Request Interceptor for Auth Token
apiClient.interceptors.request.use((config) => {
  // Attempt to get token from Zustand auth store first, fallback to DEV_TOKEN

  const storeToken = typeof window !== 'undefined' ? useAuthStore.getState().token : null;
  const token = storeToken || DEV_TOKEN;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Shared payload/param types
interface LoginPayload { password: string ; email: string }
interface SignUpPayload { name: string; phone: string; password: string; role: string; department: string; email: string; jobTitle?: string }
interface ProfileUpdatePayload { name?: string; phone?: string; imageProfile?: string }
interface ShiftPayload { name: string; startTime: string; endTime: string; gracePeriodMinIn?: number; gracePeriodMinOut?: number; departmentId: string }
interface AuditPayload { employeeProfileId: string; shiftId: string; departmentId: string; salary?: number }
interface ExcusePayload { type: 'IN' | 'OUT'; notes: string }
interface DepartmentPayload { name: string; description?: string }
interface EmployeeAddPayload { shiftId: string; departmentId: string; salary?: number }
interface DeductionPayload { periodStart: string; periodEnd: string }

// Centralized API Endpoints mapped directly from Backend README
export const API = {
  // 🔓 Public Route APIs
  public: {
    logUp: (data: SignUpPayload) => apiClient.post('/users/logUp', data),
    loginIn: (data: LoginPayload) => apiClient.post('/users/loginIn', data),
  },
  
  // 👥 Authenticated User APIs
  users: {
    search: (word: string) => apiClient.get(`/users/search_Word?word=${word}`),
    updateMyProfile: (data: ProfileUpdatePayload) => apiClient.patch('/users/updateMyProfile', data),
    deleteMyProfile: () => apiClient.delete('/users/deleteMyProfile'),
  },

  // 👷 Employee Exclusive APIs
  employee: {
    getProfile: () => apiClient.get('/employee/profile'),
    setManager: (data: { managerId: string }) => apiClient.post('/employee/set-manager', data),
    updateProfile: (data: ProfileUpdatePayload) => apiClient.patch('/employee/update-profile', data),
    getTodayStatus: () => apiClient.get('/employee/today-status'),
    getWeeklyReport: () => apiClient.get('/employee/weekly-report'),
    getMonthlyReport: () => apiClient.get('/employee/monthly-report'),
    getMyDashboard: () => apiClient.get('/employee/my-dashboard'),
    getDisciplineRate: () => apiClient.get('/employee/discipline-rate'),
  },

  // 👷 Employee Attendance APIs
  attendance: {
    checkIn: () => apiClient.post('/attendance/check-in'),
    checkOut: () => apiClient.post('/attendance/check-out'),
    submitExcuse: (data: ExcusePayload) => apiClient.post('/attendance/submit-excuse', data),
  },

  // 👑 Manager Exclusive APIs
  managing: {
    getDashboard: () => apiClient.get('/managing/dashboard'),
    getDashboardRegistry: (params?: { mode?: string; page?: string; limit?: string; dateAnchor?: string; startDate?: string; endDate?: string }) => 
      apiClient.get<OptimizedDashboardResponse>('/managing/dashboard-registry', { params }),
    addEmployee: (id: string, data: EmployeeAddPayload) => apiClient.post(`/managing/add-employee/${id}`, data),
    deleteEmployee: (id: string) => apiClient.delete(`/managing/delete-employee/${id}`),
    getMyEmployees: () => apiClient.get('/managing/my-employees'),
    
    // Shifts Management
    makeAShift: (data: ShiftPayload) => apiClient.post('/managing/make-a-shift', data),
    getShifts: () => apiClient.get('/managing/shifts'),
    updateShift: (id: string, data: Partial<ShiftPayload>) => apiClient.patch(`/managing/shifts/${id}`, data),
    deleteShift: (id: string) => apiClient.delete(`/managing/shifts/${id}`),
    
    // Employee Management & Reports
    auditEmployee: (data: AuditPayload) => apiClient.patch('/managing/audit-employee', data),
    getEmployeeWeeklyReport: (id: string) => apiClient.get(`/managing/employee-weekly-report/${id}`),
    getEmployeeMonthlyReport: (id: string) => apiClient.get(`/managing/employee-monthly-report/${id}`),
    getEmployeeDisciplineRate: (employeeProfileId: string) => apiClient.get(`/managing/discipline-rate/${employeeProfileId}`),
    
    // Excuses & Deductions
    getPendingExcuses: () => apiClient.get('/managing/pending-excuses'),
    approveExcuse: (id: string) => apiClient.post(`/managing/approve-excuse/${id}`),
    autoCheckout: () => apiClient.post('/managing/auto-checkout'),
    salaryDeduction: (employeeId: string, data: DeductionPayload) => apiClient.post(`/managing/salary-deduction/${employeeId}`, data),
  },

  // 🏢 Department APIs
  department: {
    create: (data: DepartmentPayload) => apiClient.post('/department', data),
    getAll: () => apiClient.get('/department'),
    getById: (id: string) => apiClient.get(`/department/${id}`),
    update: (id: string, data: Partial<DepartmentPayload>) => apiClient.patch(`/department/${id}`, data),
    delete: (id: string) => apiClient.delete(`/department/${id}`),
    getListNames: () => apiClient.get('/department/list/names'),
  }
};
