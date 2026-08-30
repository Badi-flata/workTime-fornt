/**
 * useRegistryFilterStore
 * ──────────────────────
 * متجر مستقل ومعاد الاستخدام لفلترة بيانات السجل.
 * يمكن استيراده في أي صفحة أو مكون بدون أن يتداخل مع حالة الـ UI.
 */

import { create } from 'zustand';
import {
  DisciplineRating,
  Modes,
  RegistryEntryOutput,
  StatusFilter,
} from '@/types';

// ─── شكل موظف يومي مُبسَّط للعرض السريع في وضع DAILY ───
export interface DailyEmployeeRow {
  employeeId: string;
  name: string;
  jobTitle: string;
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
  searchDate: string;
  statusFilter: StatusFilter;
  disciplineFilter: DisciplineRating;
  totalPagesFiltered: number;
  dailyPage: number;
  
  // ── البيانات المفلترة ───────────────────────────────────────────
  filteredRegistry: RegistryEntryOutput[];
  filteredDailyRows: DailyEmployeeRow[];

  // ── Actions ──────────────────────────────────────────────────────
  setSearchDate: (date: string) => void;
  setStatusFilter: (status: StatusFilter) => void;
  setDisciplineFilter: (rating: DisciplineRating) => void;
  setDailyPage: (action: 'next' | 'prev' | 'reset' | number, max?: number) => void;
  resetFilters: () => void;

  applyFilters: (
    data: RegistryEntryOutput[],
    mode: Modes,
    pagination?: { pageDash: number; limitDash?: number }
  ) => void;
}

/** استخراج أسطر اليوم اليومية لموظف واحد مع الفلتر */
function extractDailyRows(
  entry: RegistryEntryOutput,
  statusFilter: StatusFilter,
  searchDate: string
): DailyEmployeeRow[] {
  const rows: DailyEmployeeRow[] = [];

  for (const day of entry.dailyBreakdown) {
    if (searchDate && day.date !== searchDate) continue;
    if (statusFilter !== 'ALL' && day.status !== statusFilter) continue;

    rows.push({
      employeeId: entry.employeeId,
      name: entry.name,
      jobTitle: entry.jobTitle,
      avatar: entry.avatar,
      disciplineRating: entry.disciplineRating,
      checkIn: day.checkIn,
      checkOut: day.checkOut,
      status: day.status,
      shift: day.shift || day.shiftName || null,
      dayDeduction: day.deduction || 0,
      excuseNotes: day.excuseNotes || day.adminNotes || null,
      date: day.date,
    });
  }

  return rows;
}

export const useRegistryFilterStore = create<RegistryFilterState>((set, get) => ({
  searchDate: '',
  statusFilter: 'ALL',
  disciplineFilter: 'ALL',
  totalPagesFiltered: 1,
  dailyPage: 1,
  filteredRegistry: [],
  filteredDailyRows: [],

  setSearchDate: (date) => set({ searchDate: date }),
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
      const rows: DailyEmployeeRow[] = [];
      for (const entry of data) {
        rows.push(...extractDailyRows(entry, statusFilter, searchDate));
      }

      const totalItems = rows.length;
      const limit = pagination?.limitDash || 5;
      const totalPagesFiltered = Math.ceil(totalItems / limit) || 1;

      const validPage = Math.min(dailyPage, totalPagesFiltered);
      if (validPage !== dailyPage) {
        set({ dailyPage: validPage });
      }

      let result = rows.slice((validPage - 1) * limit, validPage * limit);

      if (searchDate) {
        result = result.filter((e) => e.date === searchDate);
      }
      set({ filteredDailyRows: result, totalPagesFiltered, filteredRegistry: [] });
    } else {
      let result = [...data];
      if (disciplineFilter !== 'ALL') {
        result = result.filter((e) => e.disciplineRating === disciplineFilter);
      }
      set({ filteredRegistry: result, filteredDailyRows: [], totalPagesFiltered: 1 });
    }
  },
}));
