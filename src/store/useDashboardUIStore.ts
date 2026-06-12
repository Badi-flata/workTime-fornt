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

import { PaginationMeta, Modes } from '@/types/dashboard-registry.types';
import { create } from 'zustand';


interface DashboardUIState {
  // ── Pagination ─────────────────────────────────────────────────
  paginationDash: {pageDash:number, limitDash?:number, totalItemsDash?:number , totalPagesDash?:number};

  // ── View ───────────────────────────────────────────────────────
  /** عدد مجموعة الأعمدة النشطة (1 = ملخص، 2 = تفاصيل يومية) */
  turnColumnsDash: number;


  // ── Query Params → ترسل للباك-إند ─────────────────────────────
  activeTab: Modes;
  dateAnchor: string;
  customStartDate: string;
  customEndDate: string;

  
  // ── Actions: Pagination ────────────────────────────────────────
  setPaginationDash: (pagination:PaginationMeta ) => void;
  setCurrentPage: (direction: 'next' | 'prev', current: number) => void;

  // ── Actions: View ──────────────────────────────────────────────
  setTurnColumnsDash: (direction: 'next' | 'prev', current: number) => void;
 

  // ── Actions: Query ─────────────────────────────────────────────
  setActiveTab:  (tab: Modes) => void;
  setDateAnchor: (date: string) => void;
  setCustomDate: (type: 'start' | 'end', date: string) => void;
}

export const useDashboardUIStore = create<DashboardUIState>((set) => ({
  // ── Initial State ──────────────────────────────────────────────
 
  paginationDash: { pageDash:1, limitDash: 5, totalItemsDash: 0, totalPagesDash: 1 },

  turnColumnsDash: 1,
  
  activeTab: 'ALL',
  dateAnchor: '',
  customStartDate: '',
  customEndDate: '',

  
 

  // ── Pagination ──────────────────────────────────────────────────
  setPaginationDash: (pagination) => set({

    paginationDash:{pageDash:pagination.page,
    limitDash:pagination.limit,
     totalItemsDash:pagination.totalItems,
     totalPagesDash:pagination.totalPages} 
    }),

  setCurrentPage: (direction, current) =>
    set((state) => ({
      paginationDash: {
        ...state.paginationDash,
        pageDash: direction === 'next' ? current + 1 : Math.max(1, current - 1),
      },
    })),

  // ── View ────────────────────────────────────────────────────────
  setTurnColumnsDash: (direction, current) =>
    set({
      turnColumnsDash:
        direction === 'next'
          ? Math.min(2, current + 1)
          : Math.max(1, current - 1),
    }),

  
  // ── Query ───────────────────────────────────────────────────────
  setActiveTab: (tab) =>
    set({
      activeTab: tab,
      // نعيد ضبط العمود عند تغيير التبويب: DAILY → عمود التفاصيل (2)، غيره → ملخص (1)
      turnColumnsDash: tab === 'DAILY' ? 2 : 1,
    }),

  setDateAnchor: (date) => set({ dateAnchor: date }),

  setCustomDate: (type, date) =>
    set(type === 'start' ? { customStartDate: date } : { customEndDate: date }),
}));
