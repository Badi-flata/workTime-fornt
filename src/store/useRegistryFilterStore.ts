/**
 * useRegistryFilterStore
 * ──────────────────────
 * متجر مستقل ومعاد الاستخدام لفلترة بيانات السجل.
 * يمكن استيراده في أي صفحة أو مكون بدون أن يتداخل مع حالة الـ UI.
 *
 * المنطق:
 *  - ALL / WEEKLY / MONTHLY → فلترة حسب تقييم الانضباط (disciplineFilter)
 *  - DAILY                  → فلترة حسب حالة الحضور (statusFilter) + تاريخ (searchDate)
 */

import { create } from 'zustand';
import {
  DisciplineRating,
  Modes,
  RegistryEntry,
  StatusFilter,
} from '@/types/dashboard-registry.types';

// ─── شكل موظف يومي مُبسَّط للعرض السريع في وضع DAILY ───
export interface DailyEmployeeRow {
  employeeId: string;
  name: string;
  role: string;
  avatar: string;
  disciplineRating: DisciplineRating;
  /** وقت دخول اليوم المحدد */
  checkIn: string | null;
  /** وقت خروج اليوم المحدد */
  checkOut: string | null;
  /** حالة الحضور في اليوم المحدد */
  status: string;
  /** اسم الوردية */
  shift: string | null;
  /** الخصم المطبّق على هذا اليوم */
  dayDeduction: number;
  /** ملاحظات العذر */
  excuseNotes: string | null;
  /** تاريخ السجل */
  date: string;
}

interface RegistryFilterState {
  // ── عوامل الفلترة ──────────────────────────────────────────────
  /** تاريخ البحث (يُستخدم في DAILY لعرض يوم معين) yyyy-MM-dd */
  searchDate: string;
  /** فلتر الحالة — يعمل في وضع DAILY فقط */
  statusFilter: StatusFilter;
  /** فلتر الانضباط — يعمل في ALL / WEEKLY / MONTHLY */
  disciplineFilter: DisciplineRating;
  totalPagesFiltered: number;
  dailyPage: number;
  // ── البيانات المفلترة ───────────────────────────────────────────
  /** نتيجة الفلترة في وضع ALL / WEEKLY / MONTHLY */
  filteredRegistry: RegistryEntry[];
  /** نتيجة الفلترة المُبسّطة في وضع DAILY */
  filteredDailyRows: DailyEmployeeRow[];

  // ── Actions ──────────────────────────────────────────────────────
  setSearchDate: (date: string) => void;
  setStatusFilter: (status: StatusFilter) => void;
  setDisciplineFilter: (rating: DisciplineRating) => void;
  setDailyPage: (action: 'next' | 'prev' | 'reset' | number, max?: number) => void;
  resetFilters: () => void;

  /**
   * الدالة الرئيسية — تأخذ البيانات الخام والوضع الحالي
   * وتُنتج filteredRegistry أو filteredDailyRows حسب الوضع.
   */
  applyFilters: (data: RegistryEntry[], mode: Modes, pagination?: { pageDash: number; limitDash?: number }) => void;
}



/** استخراج أسطر اليوم اليومية لموظف واحد مع الفلتر */
function extractDailyRows(
  entry: RegistryEntry,
  statusFilter: StatusFilter,
  searchDate: string,
): DailyEmployeeRow[] {
  const rows: DailyEmployeeRow[] = [];

  for (const day of entry.dailyBreakdown) {
    // فلتر التاريخ — إذا تم تحديده يعرض فقط السجلات المطابقة
    if (searchDate && day.date !== searchDate) continue;

    // فلتر الحالة — ALL يعرض الكل
    if (statusFilter !== 'ALL' && day.status !== statusFilter) continue;

    rows.push({
      employeeId: entry.employeeId,
      name: entry.name,
      role: entry.role,
      avatar: entry.avatar,
      disciplineRating: entry.disciplineRating,
      checkIn: day.checkIn,
      checkOut: day.checkOut,
      status: day.status,
      shift: day.shift,
      dayDeduction: day.deduction,
      excuseNotes: day.excuseNotes,
      date: day.date,
    });
  }

  return rows;
}

// ─── إنشاء المتجر ────────────────────────────────────────────────

export const useRegistryFilterStore = create<RegistryFilterState>((set, get) => ({
  // ── Initial State ──────────────────────────────────────────────
  searchDate: '',
  statusFilter: 'ALL',
  disciplineFilter: 'ALL',
  totalPagesFiltered: 1,
  dailyPage: 1,
  filteredRegistry: [],
  filteredDailyRows: [],

  // ── Actions ──────────────────────────────────────────────────

  setSearchDate: (date) => {
    set({ searchDate: date });
  },

  setStatusFilter: (status) => set({ statusFilter: status }),

  setDisciplineFilter: (rating) => set({ disciplineFilter: rating, dailyPage: 1 }),

  setDailyPage: (action, max) =>
    set((state) => {
      let p = state.dailyPage;
      if (typeof action === 'number') {
        p = action;
      } else {
        if (action === 'next' && max && p < max) p++;
        if (action === 'prev' && p > 1) p--;
        if (action === 'reset') p = 1;
      }
      return { dailyPage: p };
    }),

  resetFilters: () =>
    set({
      searchDate: '',
      statusFilter: 'ALL',
      totalPagesFiltered: 1,
      dailyPage: 1,
      disciplineFilter: 'ALL',
      filteredRegistry: [],
      filteredDailyRows: [],
    }),

  applyFilters: (data, mode, pagination) => {
    const { statusFilter, disciplineFilter, searchDate, dailyPage } = get();

    if (mode === 'DAILY') {
      // ── وضع DAILY: أسطر مُبسَّطة لكل يوم مع فلتر الحالة ──────
      const rows: DailyEmployeeRow[] = [];
      for (const entry of data) {
        rows.push(...extractDailyRows(entry, statusFilter, searchDate));
      }
      
      const totalItems = rows.length;
      const limit = pagination?.limitDash||5;
      const totalPagesFiltered = Math.ceil(totalItems / limit) || 1;
      
      // Ensure dailyPage doesn't exceed new max
      const validPage = Math.min(dailyPage, totalPagesFiltered);
       if (validPage !== dailyPage) {
        set({ dailyPage: validPage });
         }
     
      const paginatedData = rows.slice((validPage - 1) * limit, validPage * limit);

      set({ filteredDailyRows: paginatedData, totalPagesFiltered, filteredRegistry: [] });
    } else {
      // ── وضع ALL / WEEKLY / MONTHLY: فلترة حسب الانضباط ─────────
      let result = [...data];

      // فلتر الانضباط
      if (disciplineFilter !== 'ALL') {
        result = result.filter((e) => e.disciplineRating === disciplineFilter);
      }

      // فلتر التاريخ (اختياري) — نُبقي فقط الموظفين الذين لهم سجل في ذلك التاريخ
      if (searchDate) {
        result = result.filter((e) =>
          e.dailyBreakdown.some((d) => d.date === searchDate),
        );
      }

      set({ filteredRegistry: result, filteredDailyRows: [], totalPagesFiltered: 1 });
    }
  },
}));
