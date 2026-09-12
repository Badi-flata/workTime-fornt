/**
 * useCardUIStore
 * ──────────────
 * مسؤول عن حالة واجهة المستخدم:
 * - النوافذ المنبثقة والموظف المحدد
 * - التنقل بين الصفحات والأعمدة
 */

import { RegistryEntryOutput, DailyBreakdownOutput } from '@/types';
import { create } from 'zustand';
import { StatisticFilter } from '@/components/ui/StatCard';

interface useCardUIState {
  // ── Modals ─────────────────────────────────────────────────────
  isEmployeeInfoModalOpen: boolean;
  isDetailedAttendanceModalOpen: boolean;
  selectedEmployee: RegistryEntryOutput | null;
  isStatisticEmployeesCardOpen: boolean;
  StatisticsEmployee: RegistryEntryOutput[] | [];
  statisticFilter: StatisticFilter;
  // ── PeriodScope ─────────────────────────────────────────────────
  periodScope: string | undefined;
  // ── Pagination ─────────────────────────────────────────────────
  paginationCard: { pageCard: number; limitCard?: number; totalItemsCard?: number };
  
  statisData: { fil: StatisticFilter | undefined; totalItemsCard: number | 0 };
  // ── View ───────────────────────────────────────────────────────
  /** عدد مجموعة الأعمدة النشطة (1 = ملخص، 2 = تفاصيل يومية) */
  turnColumnsCard: number;
  isSidebarCollapsed: boolean;

  // ── Actions: Modals ────────────────────────────────────────────
  openEmployeeModal: (employee: RegistryEntryOutput) => void;
  openDetailedAttendanceModal: (employee: RegistryEntryOutput) => void;
  closeModals: () => void;
  openStatisticEmployeesCard: (
    employees: RegistryEntryOutput[],
    statistFilter: StatisticFilter | undefined,
    periodScope: string | undefined,
    totalItems: number | 0,
    page: number | 1
  ) => void;

  setStatisCardFilt: (
    data: RegistryEntryOutput[],
    Fil: StatisticFilter | 'ON_TIME',
    totalItemsCard: number | 0,
    page: number | 1
  ) => void;
  // ── Actions: Pagination ────────────────────────────────────────
  setPaginationCard: (pageCard: number, totalItemsCard?: number, limitCard?: number) => void;
  setTogglePageCard: (direction: 'next' | 'prev', current: number) => void;

  // ── Actions: View ──────────────────────────────────────────────
  setTurnColumnsCard: (direction: 'next' | 'prev', current: number) => void;
  toggleSidebar: () => void;
}

// ── Resolve clicked Statistic Card → open modal ─────────────────────
const statisfilterCard = (
  data: RegistryEntryOutput[],
  fil: StatisticFilter | 'ON_TIME'
) => {
  let result = [...data];
  if (fil === 'DEDUCTED') {
    result = result.filter((e) =>
      e.dailyBreakdown.some((d: DailyBreakdownOutput) => (d.deduction ?? 0) > 0)
    );
  } else if (fil === 'EARLY_LEAVE') {
    result = result.filter((e) =>
      e.dailyBreakdown.some((d: DailyBreakdownOutput) => (d.earlyLeaveMinutes ?? 0) > 0)
    );
  } else {
    result = result.filter((e) =>
      e.dailyBreakdown.some((d: DailyBreakdownOutput) => d.status === fil)
    );
  }
  if (result.length > 0) return result;
  return [];
};

export const useCardUIStore = create<useCardUIState>((set) => ({
  // ── Initial State ──────────────────────────────────────────────
  isEmployeeInfoModalOpen: false,
  isDetailedAttendanceModalOpen: false,
  selectedEmployee: null,
  isStatisticEmployeesCardOpen: false,
  StatisticsEmployee: [],
  
  paginationCard: { pageCard: 1, limitCard: 5, totalItemsCard: 0 },
  
  statisData: { fil: undefined, totalItemsCard: 0 },

  turnColumnsCard: 1,
  isSidebarCollapsed: true,

  statisticFilter: 'ON_TIME',
  periodScope: '',

  // ── Modals ──────────────────────────────────────────────────────
  openEmployeeModal: (employee) =>
    set({ isEmployeeInfoModalOpen: true, selectedEmployee: employee }),

  openDetailedAttendanceModal: (employee) =>
    set({ isDetailedAttendanceModalOpen: true, selectedEmployee: employee }),

  openStatisticEmployeesCard: (
    employees,
    statistFilter = 'ON_TIME',
    periodScope,
    totalItems = 0,
    page = 1
  ) =>
    set({
      isStatisticEmployeesCardOpen: true,
      statisticFilter: statistFilter,
      periodScope: periodScope,
      paginationCard: {
        totalItemsCard: totalItems,
        pageCard: page,
      },
    }),

  closeModals: () =>
    set({
      isEmployeeInfoModalOpen: false,
      isDetailedAttendanceModalOpen: false,
      selectedEmployee: null,
      isStatisticEmployeesCardOpen: false,
    }),

  setStatisCardFilt: (data, Fil = 'ON_TIME', totalItemsCard = 0, page = 1) =>
    set({
      StatisticsEmployee: statisfilterCard(data, Fil),
      statisData: { fil: Fil, totalItemsCard: totalItemsCard },
      paginationCard: {
        pageCard: page,
        totalItemsCard: totalItemsCard,
      },
    }),

  // ── Pagination ──────────────────────────────────────────────────
  setPaginationCard: (pageCard, totalItemsCard = 0, limitCard = 5) =>
    set({
      paginationCard: {
        pageCard,
        totalItemsCard,
        limitCard,
      },
    }),

  setTogglePageCard: (direction, current) =>
    set((state) => ({
      paginationCard: {
        ...state.paginationCard,
        pageCard: direction === 'next' ? current + 1 : Math.max(1, current - 1),
      },
    })),

  // ── View ────────────────────────────────────────────────────────
  setTurnColumnsCard: (direction, current) =>
    set({
      turnColumnsCard: direction === 'next' ? current + 1 : Math.max(1, current - 1),
    }),

  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}));
