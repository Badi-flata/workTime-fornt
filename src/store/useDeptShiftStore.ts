import { create } from 'zustand';
import { API } from '@/services/apiClient';
import {
  DepartmentOutput,
  DepartmentListItemOutput,
  DepartmentRegistryRow,
  DepartmentCreateInput,
  DepartmentUpdateInput,
  ShiftOutput,
  ShiftCreateInput,
  ShiftUpdateInput,
  AddEmployeeInput,
  AssignEmployeeInput,
} from '@/types';
import { DepartmentErrorCatch, ShiftErrorCatch } from '@/services/errorHandler';
import { globalCache, createSecureCacheKey } from '@/utils/cacheManager';

interface DeptShiftState {
  // Data
  departments: DepartmentRegistryRow[];
  departmentNames: DepartmentListItemOutput[];
  shifts: ShiftOutput[];

  // Pagination & Filtering
  searchQuery: string;
  currentPage: number;
  itemsPerPage: number;

  // Editing state
  editingDepartment: DepartmentRegistryRow | null;
  editingShift: ShiftOutput | null;

  // UI Status
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;

  // Actions
  fetchDepartments: () => Promise<void>;
  fetchDepartmentNames: () => Promise<void>;
  fetchShifts: () => Promise<void>;
  truneToDepartmentEmployee:(userId:string, data:AddEmployeeInput)=>Promise<boolean>;
  assignEmployeeToManager: (input: AssignEmployeeInput) => Promise<boolean>;

  createDepartment: (data: DepartmentCreateInput) => Promise<boolean>;
  updateDepartment: (id: string, data: DepartmentUpdateInput) => Promise<boolean>;
  deleteDepartment: (id: string) => Promise<boolean>;

  createShift: (data: ShiftCreateInput) => Promise<boolean>;
  updateShift: (id: string, data: ShiftUpdateInput) => Promise<boolean>;
  deleteShift: (id: string) => Promise<boolean>;

  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  setEditingDepartment: (dept: DepartmentRegistryRow | null) => void;
  setEditingShift: (shift: ShiftOutput | null) => void;
  clearMessages: () => void;
}

export const useDeptShiftStore = create<DeptShiftState>((set, get) => ({
  departments: [],
  departmentNames: [],
  shifts: [],

  searchQuery: '',
  currentPage: 1,
  itemsPerPage: 4,

  editingDepartment: null,
  editingShift: null,

  isLoading: false,
  isSubmitting: false,
  error: null,
  successMessage: null,

  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setEditingDepartment: (dept) => set({ editingDepartment: dept }),
  setEditingShift: (shift) => set({ editingShift: shift }),
  clearMessages: () => set({ error: null, successMessage: null }),

  fetchDepartments: async () => {
    const cacheKey = createSecureCacheKey('dept_all', {});
    const cached = globalCache.get<DepartmentRegistryRow[]>(cacheKey);

    if (cached) {
      set({ departments: cached, isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await API.department.getAll();
      const rawData = res.data || [];
      const employee = rawData.map((d: DepartmentOutput) => d.employees?.filter(user=>user.user)) || [];

      // Map backend response into DepartmentRegistryRow
      const mapped: DepartmentRegistryRow[] = rawData.map((d: DepartmentOutput) => ({
        id: d.id,
        name: d.name,
        description: d.description || '',
        shifts: (d.shift || []).map((s) => ({
          id: s.id,
          name: s.name,
          employees:s.employees || [],
          startTime: s.startTime,
          endTime: s.endTime,
          gracePeriodMinIn: s.gracePeriodMinIn,
          gracePeriodMinOut: s.gracePeriodMinOut,
          departmentsId: d.id,
          departmentName: d.name,
        })),
        employees:d.employees ,
        employeeCount: d._count?.employees || 0,
      }));

      globalCache.set(cacheKey, mapped, 'department', 5);
      set({ departments: mapped, isLoading: false });
    } catch (err: unknown) {
      const formatted = DepartmentErrorCatch.fetch(err);
      const stale = globalCache.getStale<DepartmentRegistryRow[]>(cacheKey);
      set({
        departments: stale || [],
        error: formatted.userFriendlyMessage,
        isLoading: false,
      });
    }
  },

  fetchDepartmentNames: async () => {
    const cacheKey = createSecureCacheKey('dept_names', {});
    const cached = globalCache.get<DepartmentListItemOutput[]>(cacheKey);

    if (cached) {
      set({ departmentNames: cached });
      return;
    }

    try {
      const res = await API.department.getListNames();
      const data = res.data || [];
      globalCache.set(cacheKey, data, 'department', 5);
      set({ departmentNames: data  });
    } catch (err: unknown) {
      const formatted = DepartmentErrorCatch.names(err);
      const stale = globalCache.getStale<DepartmentListItemOutput[]>(cacheKey);
      set({
        departmentNames: stale || [],
        error: formatted.userFriendlyMessage,
      });
    }
  },

  fetchShifts: async () => {
    const cacheKey = createSecureCacheKey('shifts_all', {});
    const cached = globalCache.get<ShiftOutput[]>(cacheKey);

    if (cached) {
      set({ shifts: cached });
      return;
    }

    try {
      const res = await API.department.getShifts();
      const data = res.data || [];
      globalCache.set(cacheKey, data, 'shift', 5);
      set({ shifts: data });
    } catch (err: unknown) {
      const formatted = ShiftErrorCatch.fetch(err);
      const stale = globalCache.getStale<ShiftOutput[]>(cacheKey);
      set({
        shifts: stale || [],
        error: formatted.userFriendlyMessage,
      });
    }
  },

  createDepartment: async (data) => {
    set({ isSubmitting: true, error: null, successMessage: null });
    try {
      const res = await API.department.create(data);
      globalCache.invalidateTag('department');

      set({
        successMessage: res.data?.message || 'تم إنشاء القسم بنجاح',
        isSubmitting: false,
      });

      await get().fetchDepartments();
      await get().fetchDepartmentNames();
      return true;
    } catch (err: unknown) {
      const formatted = DepartmentErrorCatch.create(err);
      set({ error: formatted.userFriendlyMessage, isSubmitting: false });
      return false;
    }
  },

  updateDepartment: async (id, data) => {
    set({ isSubmitting: true, error: null, successMessage: null });
    try {
      const res = await API.department.update(id, data);
      globalCache.invalidateTag('department');

      set({
        successMessage: res.data?.message || 'تم تحديث القسم بنجاح',
        editingDepartment: null,
        isSubmitting: false,
      });

      await get().fetchDepartments();
      await get().fetchDepartmentNames();
      return true;
    } catch (err: unknown) {
      const formatted = DepartmentErrorCatch.update(err);
      set({ error: formatted.userFriendlyMessage, isSubmitting: false });
      return false;
    }
  },

   assignEmployeeToManager: async (input) => {
    set({ isSubmitting: true, error: null, successMessage: null });
    try {
      const res = await API.managing.addEmployee(input.employeeUserId, {
        name: input.name,
        email: input.email,
        phone: input.phone,
        jobTitle: input.jobTitle,
        departmentId: input.departmentId,
        shiftId: input.shiftId,
        salary: input.salary,
      });

      globalCache.invalidateTag('shift');
      globalCache.invalidateTag('department');

      const message = res.data?.message || 'تمت إضافة الموظف إلى فريقك بنجاح';
      set({ successMessage: message, isSubmitting: false });

      // Refresh directory list
       await get().fetchDepartments();
      await get().fetchDepartmentNames()
      
       
      return true;
    } catch (err: unknown) {
      const formatted = DepartmentErrorCatch.addWorker(err);
      set({ error: formatted.userFriendlyMessage, isSubmitting: false });
      return false;
    }
  },

   truneToDepartmentEmployee: async (id, input) => {
      set({ isSubmitting: true, error: null, successMessage: null });
      try {
        const res = await API.managing.truneToDepartmentEmployee(id, {
          departmentId: input.departmentId,
          shiftId: input.shiftId,
        });
  
      globalCache.invalidateTag('shift');
      globalCache.invalidateTag('department');
  
        const message = res.data?.message || 'تمت نقل الموظف إلى قسم: و الوردية: بنجاح';
        set({ successMessage: message, isSubmitting: false });
  
        // Refresh department list
          await get().fetchDepartments();
          await get().fetchDepartmentNames();
        
         
        return true;
      } catch (err: unknown) {
        const formatted = DepartmentErrorCatch.truneToDepartment(err);
        set({ error: formatted.userFriendlyMessage, isSubmitting: false });
        return false;
      }
    },

  deleteDepartment: async (id) => {
    set({ isSubmitting: true, error: null, successMessage: null });
    try {
      const res = await API.department.delete(id);
      globalCache.invalidateTag('department');

      set({
        successMessage: res.data?.message || 'تم حذف القسم بنجاح',
        isSubmitting: false,
      });

      await get().fetchDepartments();
      await get().fetchDepartmentNames();
      return true;
    } catch (err: unknown) {
      const formatted = DepartmentErrorCatch.delete(err);
      set({ error: formatted.userFriendlyMessage, isSubmitting: false });
      return false;
    }
  },

  createShift: async (data) => {
    set({ isSubmitting: true, error: null, successMessage: null });
    try {
      const res = await API.department.createShift(data);
      globalCache.invalidateTag('shift');
      globalCache.invalidateTag('department');

      set({
        successMessage: res.data?.message || 'تم إنشاء الوردية بنجاح',
        isSubmitting: false,
      });

      await get().fetchDepartments();
      await get().fetchShifts();
      return true;
    } catch (err: unknown) {
      const formatted = ShiftErrorCatch.create(err);
      set({ error: formatted.userFriendlyMessage, isSubmitting: false });
      return false;
    }
  },

  updateShift: async (id, data) => {
    set({ isSubmitting: true, error: null, successMessage: null });
    try {
      const res = await API.department.updateShift(id, data);
      globalCache.invalidateTag('shift');
      globalCache.invalidateTag('department');

      set({
        successMessage: res.data?.message || 'تم تحديث الوردية بنجاح',
        editingShift: null,
        isSubmitting: false,
      });

      await get().fetchDepartments();
      await get().fetchShifts();
      return true;
    } catch (err: unknown) {
      const formatted = ShiftErrorCatch.update(err);
      set({ error: formatted.userFriendlyMessage, isSubmitting: false });
      return false;
    }
  },

  deleteShift: async (id) => {
    set({ isSubmitting: true, error: null, successMessage: null });
    try {
      const res = await API.department.deleteShift(id);
      globalCache.invalidateTag('shift');
      globalCache.invalidateTag('department');

      set({
        successMessage: res.data?.message || 'تم حذف الوردية بنجاح',
        isSubmitting: false,
      });

      await get().fetchDepartments();
      await get().fetchShifts();
      return true;
    } catch (err: unknown) {
      const formatted = ShiftErrorCatch.delete(err);
      set({ error: formatted.userFriendlyMessage, isSubmitting: false });
      return false;
    }
  },
}));
