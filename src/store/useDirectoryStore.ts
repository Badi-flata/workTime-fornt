import { create } from 'zustand';
import { API } from '@/services/apiClient';
import {
  DirectoryUserOutput,
  SearchDirectoryParams,
  AssignEmployeeInput,
} from '@/types';
import { DirectoryErrorCatch } from '@/services/errorHandler';
import { globalCache, createSecureCacheKey } from '@/utils/cacheManager';
import { SetStateAction } from 'react';

interface DirectoryState {
  // Data
  searchResults: DirectoryUserOutput[];
  quickResults: DirectoryUserOutput[];
  selectedUser: DirectoryUserOutput | null;
  isInfoModalOpen: boolean;

  // Filters & Pagination
  searchQuery: string;
  roleFilter: 'all' | 'EMPLOYEE' | 'MANAGER'|"SUPER_ADMIN";
  currentPage: number;
  totalPages: number;
  totalCount: number;
  itemsPerPage: number;

  // UI Status
  isLoading: boolean;
  isQuickLoading: boolean;
  isAssigning: boolean;
  error: string | null;
  successMessage: string | null;

  // Actions
  searchDirectory: (params?: Partial<SearchDirectoryParams>) => Promise<boolean>;
  quickSearchTopBar: (query: string) => Promise<void>;
  assignEmployeeToManager: (input: AssignEmployeeInput) => Promise<boolean>;
  setManagerForEmployee: (managerUserId: string) => Promise<boolean>;

  openEmployeeCard: (user: DirectoryUserOutput) => void;
  closeEmployeeCard: () => void;
  setSearchQuery: (query: string) => void;
  setRoleFilter: (role: 'all' | 'EMPLOYEE' | 'MANAGER'|'SUPER_ADMIN' ) => void;
  setCurrentPage: (value: SetStateAction<number>) => void;
  firedEmployee: (id: string) => Promise<boolean>; 
  clearMessages: () => void;
  SearchMyEmp: (email:string) => Promise<void> ;
}

export const useDirectoryStore = create<DirectoryState>((set, get) => ({
  searchResults: [],
  quickResults: [],
  selectedUser: null,
  isInfoModalOpen: false,

  searchQuery: '',
  roleFilter: 'all',
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  itemsPerPage: 6,

  isLoading: false,
  isQuickLoading: false,
  isAssigning: false,
  error: null,
  successMessage: null,

  SearchMyEmp: async (email) => 
    { 
    set({ isAssigning: true, error: null, successMessage: null });

      globalCache.invalidateTag('directory');
    try {
      await get().searchDirectory({search_Word:email})
      const result = get().searchResults.find(ele => ele.email === email.trim());
      if(result){
        set((
            {searchResults: [result]}
          ))
          get().openEmployeeCard(result);
          set({
            isAssigning: false,
           successMessage:`تم إيجادالموظف : ${result.fullName} بنجاح `
          })
      }else{
        set({
          error:"لم يتم إيجدالموظف",
          isAssigning: false,
        })
       ;
      }
    
    } catch (err) {
      const formatted = DirectoryErrorCatch.search(err);

      set({
        searchResults:[],
        error: formatted.userFriendlyMessage,
        isLoading: false,
      });
     ;
    }
    },
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  setRoleFilter: (role) => set({ roleFilter:     role, currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: (typeof page === 'function' ? page(get().currentPage) : page) }),
  clearMessages: () => set({ error: null, successMessage: null }),
  
  openEmployeeCard: (user) => set({ selectedUser: user, isInfoModalOpen: true }),
  closeEmployeeCard: () => set({ isInfoModalOpen: false, selectedUser: null }),

  searchDirectory: async (customParams) => {
    const { searchQuery, roleFilter, currentPage, itemsPerPage } = get();

    const queryParams: SearchDirectoryParams = {
      search_Word: customParams?.search_Word !== undefined ? customParams.search_Word : searchQuery,
      role: customParams?.role !== undefined ? customParams.role : roleFilter,
      page: customParams?.page !== undefined ? customParams.page : currentPage,
      limit: customParams?.limit !== undefined ? customParams.limit : itemsPerPage,
      includeDiscipline: true,
    };

    const cacheKey = createSecureCacheKey('dir_search', {
      search_Word: queryParams.search_Word,
      role: queryParams.role,
      page: queryParams.page,
      limit: queryParams.limit,
      includeDiscipline: queryParams.includeDiscipline ? 1 : 0,
    });
    const cached = globalCache.get<{ data: DirectoryUserOutput[]; meta: any }>(cacheKey);

    if (cached) {
      set({
        searchResults: cached.data,
        totalPages: cached.meta.totalPages || 1,
        totalCount: cached.meta.total || 0,
        isLoading: false,
      });
      return true;
    }

    set({ isLoading: true, error: null });

    try {
      const res = await API.users.search(queryParams);
      const data = res.data?.data || [];
      const meta = res.data?.meta || { total: data.length, page: queryParams.page, limit: queryParams.limit, totalPages: 1 };

      globalCache.set(cacheKey, { data, meta }, 'directory', 5);
  
      set({
        searchResults: data,
        totalPages: meta.totalPages || 1,
        totalCount: meta.total || 0,
        isLoading: false,
      });

      return true;
    } catch (err: unknown) {
      const formatted = DirectoryErrorCatch.search(err);
      const stale = globalCache.getStale<{ data: DirectoryUserOutput[]; meta: any }>(cacheKey);

      set({
        searchResults: stale?.data || [],
        totalPages: stale?.meta?.totalPages || 1,
        totalCount: stale?.meta?.total || 0,
        error: formatted.userFriendlyMessage,
        isLoading: false,
      });
      return false;
    }
  },

  quickSearchTopBar: async (query: string) => {
    if (!query || query.trim() === '') {
      set({ quickResults: [], isQuickLoading: false });
      return;
    }

    set({ isQuickLoading: true });
    try {
      const res = await API.users.search({
        search_Word: query.trim(),
        limit: 5,
        page: 1,
        includeDiscipline: true,
      });
      set({ quickResults: res.data?.data || [], isQuickLoading: false });
    } catch (err) {
      const formatted = DirectoryErrorCatch.search(err);
      set({ quickResults: [], isQuickLoading: false, error: formatted.userFriendlyMessage });
    }
  },

  assignEmployeeToManager: async (input) => {
    set({ isAssigning: true, error: null, successMessage: null });
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

      globalCache.invalidateTag('directory');
      globalCache.invalidateTag('department');

      const message = res.data?.message || `تمت نقل الموظف إلى قسم: ${res.data?.department.name} و الوردية: ${res.data?.shift.name} بنجاح`;
      set({ successMessage: message, isAssigning: false });

      // Refresh directory list
      await get().searchDirectory();
      await get().quickSearchTopBar(get().searchQuery);
      // Update selectedUser with the newly assigned manager state
      const currentSelected = get().searchResults.find((user) => (user.id === input.employeeUserId|| user.employeeProfile?.userId === input.employeeUserId));
      if (currentSelected) {
        set({
          selectedUser: {
            ...currentSelected,
            employeeProfile: {
              ...currentSelected.employeeProfile!,
              departmentId: input.departmentId,
              shiftId: input.shiftId,
              salary: input.salary ?? currentSelected.employeeProfile?.salary ?? 500,
            },
          },
        });
      }
       
      return true;
    } catch (err: unknown) {
      const formatted = DirectoryErrorCatch.assignEmployee(err);
      set({ error: formatted.userFriendlyMessage, isAssigning: false });
      return false;
    }
  },

  setManagerForEmployee: async (managerUserId: string) => {
    set({ isAssigning: true, error: null, successMessage: null });
    try {
      const res = await API.employee.setManager({ managerId: managerUserId });
      globalCache.invalidateTag('directory');
      globalCache.invalidateTag('attendance');
      globalCache.invalidateTag('profile');

      set({
        successMessage: (res.data as any)?.message || 'تم تعيين المدير بنجاح',
        isAssigning: false,
      });

      await get().searchDirectory();
      await get().quickSearchTopBar(get().searchQuery);
     
      const currentSelected = get().searchResults.find((user) => (user.id === managerUserId|| user.employeeProfile?.managerId === managerUserId));
      if (currentSelected) {
        set({
          selectedUser: {
            ...currentSelected,
            adminProfile: {
              ...currentSelected.adminProfile!,
            },
          },
        });
      }

      return true;
    } catch (err: unknown) {
      const formatted = DirectoryErrorCatch.setManager(err);
      set({ error: formatted.userFriendlyMessage, isAssigning: false });
      return false;
    }
  },

  firedEmployee: async (id: string) => {
    set({ isAssigning: true, error: null, successMessage: null });
    try {
      const res = await API.managing.firedEmployee(id);
      globalCache.invalidateTag('directory');
      globalCache.invalidateTag('attendance');
      globalCache.invalidateTag('profile');
      set({
        successMessage: (res.data as any)?.message || 'تم فصل الموظف بنجاح',
        isAssigning: false,
      });

      await get().searchDirectory();
      await get().quickSearchTopBar(get().searchQuery);

      const currentSelected = get().searchResults.find((user) => (user.id === id|| user.employeeProfile?.userId === id));
      if (currentSelected) {
        set({
          selectedUser: {
            ...currentSelected,
            employeeProfile: {
              ...currentSelected.employeeProfile!,
            },
          },
        });
      }
      return true;
    } catch (err: unknown) {
      const formatted = DirectoryErrorCatch.setManager(err);
      set({ error: formatted.userFriendlyMessage, isAssigning: false });
      return false;
    }
  },

}));
