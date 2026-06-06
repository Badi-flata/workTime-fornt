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

import { PaginationMeta, RegistryEntry, Modes } from '@/types/dashboard-registry.types';
import { create } from 'zustand';

interface DashboardUIState {
  // ── Modals ─────────────────────────────────────────────────────
  isEmployeeInfoModalOpen: boolean;
  isDetailedAttendanceModalOpen: boolean;
  selectedEmployee: RegistryEntry | null;

  // ── Pagination ─────────────────────────────────────────────────
  pagination: PaginationMeta;

  // ── View ───────────────────────────────────────────────────────
  /** عدد مجموعة الأعمدة النشطة (1 = ملخص، 2 = تفاصيل يومية) */
  turnColumns: number;

  // ── Query Params → ترسل للباك-إند ─────────────────────────────
  activeTab: Modes;
  dateAnchor: string;
  customStartDate: string;
  customEndDate: string;

  // ── Actions: Modals ────────────────────────────────────────────
  openEmployeeModal: (employee: RegistryEntry) => void;
  openDetailedAttendanceModal: (employee: RegistryEntry) => void;
  closeModals: () => void;

  // ── Actions: Pagination ────────────────────────────────────────
  setPagination: (pagination: PaginationMeta) => void;
  setCurrentPage: (direction: 'next' | 'prev', current: number) => void;

  // ── Actions: View ──────────────────────────────────────────────
  setTurnColumns: (direction: 'next' | 'prev', current: number) => void;

  // ── Actions: Query ─────────────────────────────────────────────
  setActiveTab:  (tab: Modes) => void;
  setDateAnchor: (date: string) => void;
  setCustomDate: (type: 'start' | 'end', date: string) => void;
}

export const useDashboardUIStore = create<DashboardUIState>((set) => ({
  // ── Initial State ──────────────────────────────────────────────
  isEmployeeInfoModalOpen: false,
  isDetailedAttendanceModalOpen: false,
  selectedEmployee: null,

  pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 1 },

  turnColumns: 1,

  activeTab: 'ALL',
  dateAnchor: '',
  customStartDate: '',
  customEndDate: '',

  // ── Modals ──────────────────────────────────────────────────────
  openEmployeeModal: (employee) =>
    set({ isEmployeeInfoModalOpen: true, selectedEmployee: employee }),

  openDetailedAttendanceModal: (employee) =>
    set({ isDetailedAttendanceModalOpen: true, selectedEmployee: employee }),

  closeModals: () =>
    set({
      isEmployeeInfoModalOpen: false,
      isDetailedAttendanceModalOpen: false,
      selectedEmployee: null,
    }),

  // ── Pagination ──────────────────────────────────────────────────
  setPagination: (pagination) => set({ pagination }),

  setCurrentPage: (direction, current) =>
    set((state) => ({
      pagination: {
        ...state.pagination,
        page: direction === 'next' ? current + 1 : Math.max(1, current - 1),
      },
    })),

  // ── View ────────────────────────────────────────────────────────
  setTurnColumns: (direction, current) =>
    set({
      turnColumns:
        direction === 'next'
          ? Math.min(2, current + 1)
          : Math.max(1, current - 1),
    }),

  // ── Query ───────────────────────────────────────────────────────
  setActiveTab: (tab) =>
    set({
      activeTab: tab,
      // نعيد ضبط العمود عند تغيير التبويب: DAILY → عمود التفاصيل (2)، غيره → ملخص (1)
      turnColumns: tab === 'DAILY' ? 2 : 1,
    }),

  setDateAnchor: (date) => set({ dateAnchor: date }),

  setCustomDate: (type, date) =>
    set(type === 'start' ? { customStartDate: date } : { customEndDate: date }),
}));
