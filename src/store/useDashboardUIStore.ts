import { PaginationMeta , RegistryEntry } from '@/types/dashboard-registry.types';
import { create } from 'zustand';

interface DashboardUIState {
  // Modals state
  isEmployeeInfoModalOpen: boolean;
  isDetailedAttendanceModalOpen: boolean;
  
  // Selected Data for Modals
  selectedEmployee: RegistryEntry | null;

  // Pagination 
  Pagination:PaginationMeta

  turnColumns:number;
  
  // Filtering & Search
  searchQuery: string;
  activeTab: 'ALL'| 'DAILY' | 'WEEKLY' | 'MONTHLY';
  dateAnchor: string;
  customStartDate: string;
  customEndDate: string;
  statusFilter: 'ALL'| 'EXCELLENT' | 'VERY_GOOD' | 'GOOD' | 'NEEDS_IMPROVEMENT';
  statusDaily : 'ALL' |'ON_TIME' | 'LATE' | 'ABSENT' | 'EXCUSED' | 'LEAVE';

  // Actions
  openEmployeeModal: (data: RegistryEntry) => void;
  openDetailedAttendanceModal: (data: RegistryEntry) => void;
  closeModals: () => void;
  // Filter & Search Actions
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: 'ALL'| 'DAILY' | 'WEEKLY' | 'MONTHLY') => void;
  setDateAnchor: (dateAnchor: string) => void;
  setCustomDate: (dateType: 'start'| 'end', date: string) => void;
  setStatusFilter: (status: 'ALL'| 'EXCELLENT' | 'VERY_GOOD' | 'GOOD' | 'NEEDS_IMPROVEMENT') => void;
  setStatusDaily: (status: 'ON_TIME' | 'LATE' | 'ABSENT' | 'EXCUSED' | 'LEAVE') => void;
  // Pagination
    setPagination: (pagination: PaginationMeta) => void;
  setCurrentPage:( actType:'next' | 'poved' , page:number) => void
  setTurnColumns:( actType:'next' | 'poved' , currentColumn:number) => void
}

export const useDashboardUIStore = create<DashboardUIState>((set) => ({
  isEmployeeInfoModalOpen: false,
  isDetailedAttendanceModalOpen: false,
  selectedEmployee: null,
  // Pagination
  Pagination:{page:1,limit:10,totalItems:10 ,totalPages:1},
  turnColumns:1,
  // Filter & Search State
  searchQuery: '',
  activeTab: 'ALL',
  dateAnchor: '',
  customStartDate: '',
  customEndDate: '',
  statusFilter: 'ALL',
  statusDaily: 'ALL',


  openEmployeeModal: (data) => set({ isEmployeeInfoModalOpen: true, selectedEmployee: data }),
  openDetailedAttendanceModal: (data) => set({ isDetailedAttendanceModalOpen: true, selectedEmployee: data }),
  closeModals: () => set({ 
    isEmployeeInfoModalOpen: false, 
    isDetailedAttendanceModalOpen: false, 
    selectedEmployee: null 
  }),
   //Pagination
   setPagination: (pagination: PaginationMeta) => set({ Pagination: pagination }),
     setCurrentPage: 
     (type , page ) =>  { 
     page = type === "next" ? page + 1 : page - 1
     set(({Pagination})=>({Pagination:{...Pagination,page}}))
             },
       setTurnColumns:
    (type ,currentColumn) => {
      currentColumn = type === "next" ? currentColumn + 1 :  currentColumn - 1
     set({turnColumns:currentColumn })
    },
  // Filter & Search Actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setDateAnchor: (dateAnchor) => set({ dateAnchor }),
  setCustomDate: (dateType, date) => set({ [dateType === 'start' ? 'customStartDate' : 'customEndDate']: date }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setStatusDaily: (status) => set({ statusDaily: status })
}));
