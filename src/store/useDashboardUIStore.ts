import { create } from 'zustand';

interface DashboardUIState {
  // Modals state
  isEmployeeInfoModalOpen: boolean;
  isDetailedAttendanceModalOpen: boolean;
  
  // Selected Data for Modals
  selectedEmployeeId: string | null;
  
  // Filtering & Search
  searchQuery: string;
  activeTab: 'DAILY' | 'WEEKLY' | 'MONTHLY';

  // Actions
  openEmployeeModal: (id: string) => void;
  openDetailedAttendanceModal: (id: string) => void;
  closeModals: () => void;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: 'DAILY' | 'WEEKLY' | 'MONTHLY') => void;
}

export const useDashboardUIStore = create<DashboardUIState>((set) => ({
  isEmployeeInfoModalOpen: false,
  isDetailedAttendanceModalOpen: false,
  selectedEmployeeId: null,
  searchQuery: '',
  activeTab: 'DAILY',

  openEmployeeModal: (id) => set({ isEmployeeInfoModalOpen: true, selectedEmployeeId: id }),
  openDetailedAttendanceModal: (id) => set({ isDetailedAttendanceModalOpen: true, selectedEmployeeId: id }),
  closeModals: () => set({ 
    isEmployeeInfoModalOpen: false, 
    isDetailedAttendanceModalOpen: false, 
    selectedEmployeeId: null 
  }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveTab: (tab) => set({ activeTab: tab })
}));
