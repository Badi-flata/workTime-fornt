/**
 * useDashboardUIStore
 * ───────────────────
 * مسؤول فقط عن حالة واجهة المستخدم:
 * - النوافذ المنبثقة والموظف المحدد
 * - التنقل بين الصفحات والأعمدة
 * - التبويب النشط (ALL / DAILY / WEEKLY / MONTHLY)
 * - نقطة تثبيت التاريخ (dateAnchor) لإرسالها للباك-إند
 *
 * الفلترة انتقلت إلى useRegistryFilterStore (منفصل ومُعاد الاستخدام)
 */

import { RegistryEntry } from '@/types/dashboard-registry.types';
import { create } from 'zustand';
import { StatisticFilter } from '@/components/ui/StatCard';

interface useCardUIState {
  // ── Modals ─────────────────────────────────────────────────────
  isEmployeeInfoModalOpen: boolean;
  isDetailedAttendanceModalOpen: boolean;
  selectedEmployee: RegistryEntry | null;
  isStatisticEmployeesCardOpen: boolean;
  StatisticsEmployee:RegistryEntry[] | [];
  statisticFilter:StatisticFilter 
  // ── PeriodScope ─────────────────────────────────────────────────
  periodScope: string |undefined
  // ── Pagination ─────────────────────────────────────────────────
  paginationCard: {pageCard:number, limitCard?:number, totalItemsCard?:number };
  
  statisData:{fil:  StatisticFilter | undefined ,
     totalItemsCard: number | 0}
  // ── View ───────────────────────────────────────────────────────
  /** عدد مجموعة الأعمدة النشطة (1 = ملخص، 2 = تفاصيل يومية) */
  turnColumnsCard: number ;
  isSidebarCollapsed: boolean;

 

  // ── Actions: Modals ────────────────────────────────────────────
  openEmployeeModal: (employee: RegistryEntry) => void;
  openDetailedAttendanceModal: (employee: RegistryEntry) => void;
  closeModals: () => void;
  openStatisticEmployeesCard:(employees:RegistryEntry[] , statistFilter:StatisticFilter |undefined
    ,periodScope:string |undefined ,totalItems:number |0 ,page:number|1 )=> void

      setStatisCardFilt: (data:RegistryEntry[], Fil:  StatisticFilter | "ON_TIME" ,
     totalItemsCard: number | 0 ,page:number| 1)=> void,
  // ── Actions: Pagination ────────────────────────────────────────
  setPaginationCard: (pageCard:number, totalItemsCard?:number , limitCard?:number) => void;
  setTogglePageCard: (direction: 'next' | 'prev', current: number) => void;

  // ── Actions: View ──────────────────────────────────────────────
  setTurnColumnsCard: (direction: 'next' | 'prev', current: number) => void;
  toggleSidebar: () => void;

  
}

 // ── Resolve clicked Statistic Card → open modal ─────────────────────
  const statisfilterCard = (data:  RegistryEntry[]  ,
     fil: StatisticFilter | "ON_TIME") => {
   let result = [...data]
   if(fil === "DEDUCTED"){
    result  = result.filter((e) =>
          e.dailyBreakdown.some((d) => d.dayDeduction > 0),
        );
    } else if (fil === "EARLY_LEAVE") {
      result  = result.filter((e) =>
            e.dailyBreakdown.some((d) => d.earlyLeaveMinutes > 0),
          );
    } else  {
      
      result  = result.filter((e) =>
          e.dailyBreakdown.some((d) => d.status === fil),
        );
    }
    if (result.length > 0) return result
  }

export const useCardUIStore = create<useCardUIState>((set) => ({
  // ── Initial State ──────────────────────────────────────────────
  isEmployeeInfoModalOpen: false,
  isDetailedAttendanceModalOpen: false,
  selectedEmployee: null,
  isStatisticEmployeesCardOpen: false,
  StatisticsEmployee:[],
  
  paginationCard: { pageCard: 1, limitCard: 5, totalItemsCard: 0,},
  
  statisData:{fil:undefined , totalItemsCard:0},

  turnColumnsCard: 1,
  isSidebarCollapsed: false,

  statisticFilter:'ON_TIME',
  periodScope:'',


  // ── Modals ──────────────────────────────────────────────────────
  openEmployeeModal: (employee) =>
    set({ isEmployeeInfoModalOpen: true, selectedEmployee: employee ,paginationCard:{pageCard:1} }),

  openDetailedAttendanceModal: (employee) =>
    set({ isDetailedAttendanceModalOpen: true, selectedEmployee: employee , paginationCard:{pageCard:1} }),

  openStatisticEmployeesCard: (employees ,statistFilter, periodScope ,totalItemsCard ,page ) =>
    set({ isStatisticEmployeesCardOpen: true,
        StatisticsEmployee: employees, 
        statisticFilter:statistFilter,
        periodScope: periodScope,  
        paginationCard:{pageCard:page ,totalItemsCard} }),

  closeModals: () =>{
    set({
      isEmployeeInfoModalOpen: false,
      isDetailedAttendanceModalOpen: false,
      selectedEmployee: null,
      turnColumnsCard:1,
      statisData:{fil:undefined , totalItemsCard:0},
      paginationCard: {pageCard:1 ,limitCard:5 , totalItemsCard:0},
      isStatisticEmployeesCardOpen: false,
      StatisticsEmployee:[],
    })},

  // ── Pagination ──────────────────────────────────────────────────
  setPaginationCard: (  pageCard, totalItemsCard, limitCard ) => set({ 
     paginationCard:{pageCard ,  totalItemsCard, limitCard} 
  }),

  setStatisCardFilt: (data,fil , totalCard ,page) =>{
  const result = statisfilterCard(data,fil)

    set({
      StatisticsEmployee:result,
      statisticFilter:fil,
      paginationCard:{
      pageCard:page,
      totalItemsCard:totalCard
    }})},

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
      turnColumnsCard:
        direction === 'next'
          ? Math.min(2, current + 1)
          : Math.max(1, current - 1),
    }),

  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

 

}));
