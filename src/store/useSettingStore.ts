import { create } from 'zustand';
import { API } from '@/services/apiClient';
import { ManagingErrorCatch } from '@/services/errorHandler';

export type EventSettings = {
  autoCheckoutEnabled: boolean;
  isActiveDeduction: boolean;
  combineDeductionsOnEndShift: boolean;
  delayDeductionEnabled: boolean;
  earlyLeaveDeductionEnabled: boolean;
  absentDeductionEnabled: boolean;
};

interface SettingState {
  isAutomaticProcess: boolean;
  eventsSetting?: EventSettings;
  messageSuccessd?: string | null;
  isLoading: boolean;
  error: string;
  fetchEventsSettting: () => Promise<void>;
  clearMessages: () => void;
  applyEventsSettings: (even: Partial<EventSettings>) => void;
  updateEventsSetting: (eventsSetting: Partial<EventSettings>) => Promise<void>;
  tirggrAutomaticProcess: (tir: boolean) => void;
}

export const useSettingStore = create<SettingState>((set, get) => ({
  isAutomaticProcess: false,
  eventsSetting: undefined,
  messageSuccessd: '',
  isLoading: false,
  error: '',

  clearMessages: () => {
    set({ error: '', messageSuccessd: null });
  },

  applyEventsSettings: (even) => {
    const current = get().eventsSetting;
    set({
      eventsSetting: {
        autoCheckoutEnabled: even.autoCheckoutEnabled !== undefined ? even.autoCheckoutEnabled : (current?.autoCheckoutEnabled ?? true),
        isActiveDeduction: even.isActiveDeduction !== undefined ? even.isActiveDeduction : (current?.isActiveDeduction ?? false),
        combineDeductionsOnEndShift: even.combineDeductionsOnEndShift !== undefined ? even.combineDeductionsOnEndShift : (current?.combineDeductionsOnEndShift ?? false),
        delayDeductionEnabled: even.delayDeductionEnabled !== undefined ? even.delayDeductionEnabled : (current?.delayDeductionEnabled ?? true),
        earlyLeaveDeductionEnabled: even.earlyLeaveDeductionEnabled !== undefined ? even.earlyLeaveDeductionEnabled : (current?.earlyLeaveDeductionEnabled ?? true),
        absentDeductionEnabled: even.absentDeductionEnabled !== undefined ? even.absentDeductionEnabled : (current?.absentDeductionEnabled ?? true),
      },
    });
  },

  tirggrAutomaticProcess: (tir) => {
    set({ isAutomaticProcess: tir });
  },

  fetchEventsSettting: async () => {
    set({ isLoading: true, error: '' });

    try {
      const res: any = await API.managing.getSettings();
      const payload = res?.data?.data || res?.data || res;
      const admin = payload?.autoCheckoutEnabled !== undefined ? payload : (payload?.data || {});
      const message = res?.message || res?.data?.message || 'تم جلب بيانات الإعدادات بنجاح';

      set({
        messageSuccessd: message,
        eventsSetting: {
          autoCheckoutEnabled: admin.autoCheckoutEnabled !== false,
          isActiveDeduction: admin.isActiveDeduction !== false,
          combineDeductionsOnEndShift: admin.combineDeductionsOnEndShift !== false,
          delayDeductionEnabled: admin.delayDeductionEnabled !== false,
          earlyLeaveDeductionEnabled: admin.earlyLeaveDeductionEnabled !== false,
          absentDeductionEnabled: admin.absentDeductionEnabled !== false,
        },
        isLoading: false,
      });
    } catch (err: unknown) {
      const formattedError = ManagingErrorCatch.settingEvents(err);
      set({
        error: formattedError.userFriendlyMessage,
        isLoading: false,
      });
    }
  },

  updateEventsSetting: async (newSettings) => {
    // 1. التحديث الفوري للحالة المحلية (Optimistic Update) لضمان استجابة المفاتيح الفورية
    const prevSettings = get().eventsSetting;
    const mergedSettings: EventSettings = {
      autoCheckoutEnabled: newSettings.autoCheckoutEnabled !== undefined ? newSettings.autoCheckoutEnabled : (prevSettings?.autoCheckoutEnabled ?? true),
      isActiveDeduction: newSettings.isActiveDeduction !== undefined ? newSettings.isActiveDeduction : (prevSettings?.isActiveDeduction ?? true),
      combineDeductionsOnEndShift: newSettings.combineDeductionsOnEndShift !== undefined ? newSettings.combineDeductionsOnEndShift : (prevSettings?.combineDeductionsOnEndShift ?? false),
      delayDeductionEnabled: newSettings.delayDeductionEnabled !== undefined ? newSettings.delayDeductionEnabled : (prevSettings?.delayDeductionEnabled ?? true),
      earlyLeaveDeductionEnabled: newSettings.earlyLeaveDeductionEnabled !== undefined ? newSettings.earlyLeaveDeductionEnabled : (prevSettings?.earlyLeaveDeductionEnabled ?? true),
      absentDeductionEnabled: newSettings.absentDeductionEnabled !== undefined ? newSettings.absentDeductionEnabled : (prevSettings?.absentDeductionEnabled ?? true),
    };

    set({
      eventsSetting: mergedSettings,
      isLoading: true,
      error: '',
    });

    try {
      const res: any = await API.managing.updateSettings(newSettings);
      const payload = res?.data?.data || res?.data || res;
      const updated = payload?.autoCheckoutEnabled !== undefined ? payload : (payload?.data || {});
      const message = res?.message || res?.data?.message || 'تم تحديث الإعدادات بنجاح';

      set({
        messageSuccessd: message,
        eventsSetting: {
          autoCheckoutEnabled: updated.autoCheckoutEnabled !== false,
          isActiveDeduction: updated.isActiveDeduction !== false,
          combineDeductionsOnEndShift: updated.combineDeductionsOnEndShift !== false,
          delayDeductionEnabled: updated.delayDeductionEnabled !== false,
          earlyLeaveDeductionEnabled: updated.earlyLeaveDeductionEnabled !== false,
          absentDeductionEnabled: updated.absentDeductionEnabled !== false,
        },
        isLoading: false,
      });
    } catch (err: unknown) {
      // إعادة الحالة السابقة عند الفشل (Rollback)
      if (prevSettings) {
        set({ eventsSetting: prevSettings });
      }
      const formattedError = ManagingErrorCatch.updateSettingEvents(err);
      set({
        error: formattedError.userFriendlyMessage,
        isLoading: false,
      });
      throw err;
    }
  },
}));