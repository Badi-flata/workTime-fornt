"use client";

import { ReactNode, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingStore } from '@/store/useSettingStore';
import { API } from '@/services/apiClient';

interface AutomaticProcessProps {
  children?: ReactNode;
}

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // فحص دوري كل 15 دقيقة للتأكد من الورديات المنتهية
const MIN_TRIGGER_INTERVAL_MS = 20 * 60 * 1000; // تشغيل الانصراف التلقائي بفاصل زمني لا يقل عن ساعة واحدة

export function AutomaticProcess({ children }: AutomaticProcessProps) {
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const { eventsSetting, fetchEventsSettting, tirggrAutomaticProcess } = useSettingStore();
  const isRunningRef = useRef(false);

  const isManagerOrAdmin =
    isAuthenticated && (user?.role === 'MANAGER' || user?.role === 'SUPER_ADMIN');

  // 1. تحميل تفضيلات الأتمتة للمدير إذا لم تكن محملة
  useEffect(() => {
    if (isInitialized && isManagerOrAdmin && !eventsSetting) {
      fetchEventsSettting().catch(() => {});
    }
  }, [isInitialized, isManagerOrAdmin, eventsSetting, fetchEventsSettting]);

  // 2. الفحص الدوري العام التلقائي (Global Background Supervisor)
  useEffect(() => {
    if (!isInitialized || !isManagerOrAdmin) return;

    const runAutomatedShiftCheck = async () => {
      // إذا كان المفتاح معطلاً من قِبل المدير في صفحة الإعدادات
      if (eventsSetting && eventsSetting.autoCheckoutEnabled === false) {
        console.log('ℹ️ [AutomaticProcess] الانصراف التلقائي متوقف بناءً على إعدادات المدير.');
        return;
      }

      if (isRunningRef.current) return;

      const now = Date.now();
      const lastCheckStr = localStorage.getItem('last_auto_checkout_time');
      const lastCheck = lastCheckStr ? parseInt(lastCheckStr, 10) : 0;

      // التأكد من مرور ساعة على الأقل منذ آخر فحص لتجنب تكرار الطلبات
      if (now - lastCheck < MIN_TRIGGER_INTERVAL_MS) {
        return;
      }

      isRunningRef.current = true;
      tirggrAutomaticProcess(true);

      try {
        console.log('🔄 [AutomaticProcess] جاري فحص الورديات المنتهية وتشغيل الانصراف التلقائي...');
        const res = await API.managing.autoCheckout();
        localStorage.setItem('last_auto_checkout_time', now.toString());
        console.log('✅ [AutomaticProcess] تم تشغيل دورة الانصراف التلقائي بنجاح:', res);
      } catch (err) {
        console.warn('⚠️ [AutomaticProcess] تعذر استكمال دورة الفحص التلقائي في الخلفية:', err);
      } finally {
        isRunningRef.current = false;
        tirggrAutomaticProcess(false);
      }
    };

    // تشغيل الفحص عند بدء التحميل
    runAutomatedShiftCheck();

    // تشغيل المؤقت الدوري (كل 15 دقيقة يتحقق مما إذا مرّت ساعة ويشغل العملية)
    const intervalId = setInterval(runAutomatedShiftCheck, CHECK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [isInitialized, isManagerOrAdmin, eventsSetting, tirggrAutomaticProcess]);

  return <>{children}</>;
}

export default AutomaticProcess;
