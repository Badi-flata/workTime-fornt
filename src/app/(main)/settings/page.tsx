"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  User, 
  Sliders, 
  Play, 
  Trash2, 
  LogOut, 
  AlertTriangle, 
  Check, 
  X, 
  Loader2, 
  Languages, 
  Moon, 
  BellRing,
  HelpCircle,
  Copy
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingStore } from '@/store/useSettingStore';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { API } from '@/services/apiClient';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const {messageSuccessd, eventsSetting,tirggrAutomaticProcess , error, isLoading
    , fetchEventsSettting ,updateEventsSetting , applyEventsSettings }= useSettingStore()
    const isManagerOrAdmin = user?.role === 'MANAGER' || user?.role === 'SUPER_ADMIN';
   
   
    // Fetch Manager Settings on Mount
  useEffect(() => {
    if (isManagerOrAdmin) {
      fetchEventsSettting();
    }
  }, [isManagerOrAdmin, fetchEventsSettting]);
  


  
  
  
  // Local states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAutoChecking, setIsAutoChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Feedback messages
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Manager automation settings state
  // active actions
  const [dailyAutoCheck, setDailyAutoCheck] = useState<boolean>(true);
  const [isActiveDeduction, setActiveDeduction] = useState<boolean>(true);
  // deductions actions configuration
  const [combineDeductionsOnEndShift, setCombineDeductionsOnEndShift] = useState<boolean>(false);
  const [delayDeduction, setDelayDeduction] = useState<boolean>(true);
  const [earlyLeaveDeduction, setEarlyLeaveDeduction] = useState<boolean>(true);
  const [absentDeduction, setAbsentDeduction] = useState<boolean>(true);
  
  
  
  useEffect(() => {
     if (!eventsSetting) return;
 
       // active actions
       setDailyAutoCheck(eventsSetting.autoCheckoutEnabled !== false );
       setActiveDeduction(eventsSetting.isActiveDeduction !==false);
       // deductions actions configuration
       setCombineDeductionsOnEndShift(eventsSetting.combineDeductionsOnEndShift !==false);
       setDelayDeduction(eventsSetting.delayDeductionEnabled!==false);
       setEarlyLeaveDeduction(eventsSetting.earlyLeaveDeductionEnabled!==false);
       setAbsentDeduction(eventsSetting.absentDeductionEnabled!==false);
     
   }, [eventsSetting]);
 

  // Handle Switch Toggle & Auto Save
  const handleToggleSetting = async (key: string, value: boolean) => {
      // active actions
    if (key === 'autoCheckout') setDailyAutoCheck(value);
    if (key === 'activeDeduction') setActiveDeduction(value);
    // deductions actions configuration
    if (key === 'combineDeductionsOnEndShift') setCombineDeductionsOnEndShift(value);
    if (key === 'delayDeduction') setDelayDeduction(value);
    if (key === 'earlyLeaveDeduction') setEarlyLeaveDeduction(value);
    if (key === 'absentDeduction') setAbsentDeduction(value);

    try {
   updateEventsSetting({
        // active actions
        autoCheckoutEnabled: key === 'autoCheckout' ? value : dailyAutoCheck,
        isActiveDeduction: key === 'activeDeduction' ? value : isActiveDeduction,
        // deductions actions configuration
        combineDeductionsOnEndShift: key === 'combineDeductionsOnEndShift' ? value : combineDeductionsOnEndShift,
        delayDeductionEnabled: key === 'delayDeduction' ? value : delayDeduction,
        earlyLeaveDeductionEnabled: key === 'earlyLeaveDeduction' ? value : earlyLeaveDeduction,
        absentDeductionEnabled: key === 'absentDeduction' ? value : absentDeduction,
      });
      
      
      setSuccessMsg("تم حفظ الإعدادات الاتمتة التلقائية بنجاح");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setErrorMsg('تعذر حفظ الإعدادات، يرجى المحاولة لاحقاً');
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  // Copy User ID helper
  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Logout handler
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await API.users.deleteMyProfile();
      setShowDeleteModal(false);
      logout();
      router.push('/login');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'حدث خطأ أثناء محاولة حذف الحساب. يرجى المحاولة لاحقاً.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Trigger automatic check handler (Manager option)
  const handleTriggerAutoCheck = async () => {
    setIsAutoChecking(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = (await API.managing.autoCheckout(true)) as any;
      const data = res?.data || res;
      const message = res?.message || data?.message || 'تم تشغيل دورة الانصراف التلقائي بنجاح وجاري فحص وتحديث سجلات الموظفين.';
      setSuccessMsg(message);
      setTimeout(() => setSuccessMsg(null), 6000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'فشل تشغيل دورة الانصراف التلقائي. تأكد من صلاحيات حسابك.');
      setTimeout(() => setErrorMsg(null), 6000);
    } finally {
      setIsAutoChecking(false);
    }
  };



  // Role translation helper
  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'مسؤول النظام (Super Admin)';
      case 'MANAGER':
        return 'مدير المنشأة (Manager)';
      case 'EMPLOYEE':
        return 'موظف (Employee)';
      default:
        return 'موظف';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6"
      dir="rtl"
    >
      {/* Page Header */}
      <header className="flex items-center gap-3 border-b border-outline-variant/20 pb-6">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Settings size={28} />
        </div>
        <div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-on-surface tracking-tight">إعدادات النظام والضبط</h2>
          <p className="text-on-surface-variant font-body text-sm md:text-base mt-1">تخصيص تفضيلات حسابك وإدارة دورات الأتمتة والعمليات التلقائية للمنشأة.</p>
        </div>
      </header>

      {/* Notifications and Feedback Alerts */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#e6f4ea] text-[#137333] border border-[#137333]/20 rounded-xl p-4 flex items-start gap-3 shadow-sm"
          >
            <Check className="mt-0.5 shrink-0" size={18} />
            <div className="text-sm font-semibold">{successMsg}</div>
          </motion.div>
        )}
        
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-error/10 text-error border border-error/20 rounded-xl p-4 flex items-start gap-3 shadow-sm"
          >
            <AlertTriangle className="mt-0.5 shrink-0" size={18} />
            <div className="text-sm font-semibold">{errorMsg}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Account Information Details */}
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-6 flex flex-col justify-between gap-5 shadow-sm hover:border-primary/20 transition-all duration-300">
          <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/20">
            <User size={20} className="text-primary" />
            <h4 className="font-heading text-lg font-bold text-on-surface">معلومات الحساب الحالية</h4>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-5 items-center bg-surface-container-low/40 p-4 rounded-xl border border-outline-variant/10">
            <UserAvatar 
              src={user?.avatar}
              name={user?.name}
              size={64}
              className="border-2 border-primary/20 shadow-inner"
            />
            <div className="text-center sm:text-right space-y-1">
              <h5 className="font-heading text-lg font-bold text-on-surface">{user?.name || 'مستخدم النظام'}</h5>
              <p className="text-xs font-semibold text-primary">{getRoleLabel(user?.role)}</p>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                <span className="text-[11px] font-mono text-outline select-all truncate max-w-[200px]" title={user?.id}>
                  ID: {user?.id}
                </span>
                <button 
                  onClick={handleCopyId}
                  className="p-1 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded transition-colors"
                  title="نسخ المعرف"
                >
                  {copied ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-sm font-body text-on-surface-variant">
            <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
              <span className="text-outline">حالة الحساب</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#e6f4ea] text-[#137333]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#137333] animate-pulse" />
                نشط ومعتمد
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-outline">نوع الترخيص وتطبيق المنشأة</span>
              <span className="font-semibold text-on-surface">إصدار Chronicle التجاري</span>
            </div>
          </div>
        </div>

        {/* Card 2: General Preferences (Disabled/Mockups as requested) */}
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-6 flex flex-col justify-between gap-5 shadow-sm hover:border-primary/20 transition-all duration-300">
          <div className="flex items-center gap-2.5 pb-3 border-b border-outline-variant/20">
            <Sliders size={20} className="text-primary" />
            <h4 className="font-heading text-lg font-bold text-on-surface">التفضيلات العامة</h4>
          </div>

          <div aria-disabled="true" className="space-y-5 flex-1 flex flex-col justify-center opacity-65">
            {/* Language Selector */}
            <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/10">
              <div className="flex items-center gap-2.5">
                <Languages size={18} className="text-outline" />
                <div>
                  <p className="text-sm font-bold text-on-surface">لغة الواجهة</p>
                  <p className="text-xs text-outline">تحديد اللغة المفضلة لعرض النظام.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-1 rounded bg-surface-container text-outline">العربية</span>
                <span className="text-[10px] bg-outline/10 text-outline border border-outline/25 px-1.5 py-0.5 rounded font-label">غير متوفر</span>
              </div>
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/10">
              <div className="flex items-center gap-2.5">
                <Moon size={18} className="text-outline" />
                <div>
                  <p className="text-sm font-bold text-on-surface">المظهر الداكن (Dark Mode)</p>
                  <p className="text-xs text-outline">تفعيل المظهر الليلي لتقليل إجهاد العين.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Visual toggle switch (disabled state) */}
                <div className="w-10 h-6 bg-outline-variant/50 rounded-full p-1 cursor-not-allowed">
                  <div className="bg-white w-4 h-4 rounded-full shadow-sm" />
                </div>
                <span className="text-[10px] bg-outline/10 text-outline border border-outline/25 px-1.5 py-0.5 rounded font-label">غير متوفر</span>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2.5">
                <BellRing size={18} className="text-outline" />
                <div>
                  <p className="text-sm font-bold text-on-surface">التنبيهات الفورية والبريد</p>
                  <p className="text-xs text-outline">إرسال تقارير الحضور الأسبوعية عبر البريد الإلكتروني.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Visual toggle switch (disabled state) */}
                <div className="w-10 h-6 bg-primary/20 rounded-full p-1 flex justify-end cursor-not-allowed">
                  <div className="bg-primary w-4 h-4 rounded-full shadow-sm" />
                </div>
                <span className="text-[10px] bg-outline/10 text-outline border border-outline/25 px-1.5 py-0.5 rounded font-label">غير متوفر</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Manager Exclusive Automations (Always present, conditionally active or showing notice) */}
        <div className={`col-span-1 lg:col-span-2 bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-6 flex flex-col justify-between gap-5 shadow-sm hover:border-primary/20 transition-all duration-300`}>
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
            <div className="flex items-center gap-2.5">
              <Play size={20} className="text-primary" />
              <h4 className="font-heading text-lg font-bold text-on-surface">إدارة دورات الأتمتة وجدولة المنشأة</h4>
            </div>
            {isManagerOrAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                نشط للـ الإدارة
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-surface-container text-outline border border-outline-variant/25">
                حساب موظف (للقراءة فقط)
              </span>
            )}
          </div>

          {!isManagerOrAdmin ? (
            // Notice for normal employees
            <div className="p-8 border border-dashed border-outline-variant/40 rounded-xl text-center flex flex-col items-center justify-center gap-3">
              <HelpCircle size={40} className="text-outline/40" />
              <h5 className="font-heading text-base font-bold text-on-surface">هذه الإعدادات مخصصة للإدارة فقط</h5>
              <p className="text-xs text-on-surface-variant/70 max-w-lg leading-relaxed">
                تتيح لوحة الأتمتة لمدراء المنشأة تفعيل وضبط دورات الفحص التلقائي للحضور وتأكيد الانصراف، وجدولة الخصومات اليومية للموظفين. يمكنك مراجعة مديرك المباشر لأي استفسارات.
              </p>
            </div>
          ) : (
            // Full control panel for managers
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Automation 1: Auto-Checkout (Automatic Check) */}
              <div className="border border-outline-variant/20 p-5 rounded-xl bg-surface-container-low/20 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex justify-between items-start">
                    <h5 className="font-heading text-[15px] font-bold text-primary">دورة الانصراف التلقائي (Automatic Check)</h5>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {dailyAutoCheck ? 'نشط تلقائياً' : 'معطل'}
                      </span>
                      {/* Active switch to toggle schedule */}
                      <button 
                        onClick={() => handleToggleSetting('autoCheckout', !dailyAutoCheck)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${
                          dailyAutoCheck ? 'bg-primary flex justify-end' : 'bg-outline-variant/70 flex justify-start'
                        }`}
                      >
                        <div className="bg-white w-4 h-4 rounded-full shadow-sm" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                    تقوم هذه الدورة بفحص كافة الموظفين الذين انتهت فترات عملهم مع انتهاء فترة السماح ولم يسجلوا خروجهم، وتحديث حالتهم والانصراف تلقائياً.
                  </p>
                </div>
                
                <div className="pt-2 border-t border-outline-variant/10 flex justify-between items-center gap-3">
                  <span className="text-[10px] text-outline font-label">
                    مجدولة فور انتهاء فترة السماح لكل وردية
                  </span>
                  
                  <button
                    onClick={handleTriggerAutoCheck}
                    disabled={isAutoChecking}
                    className="px-4 py-2 bg-primary text-white border border-primary/20 text-xs font-bold rounded-lg hover:bg-primary-container transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shrink-0"
                  >
                    {isAutoChecking ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        جاري التشغيل...
                      </>
                    ) : (
                      <>
                        <Play size={14} />
                        تشغيل يدوي فوري
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Automation 2: Daily Salary Deduction Process (salary deduction) */}
              <div className="border border-outline-variant/20 p-5 rounded-xl bg-surface-container-low/20 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex justify-between items-start">
                    <h5 className="font-heading text-[15px] font-bold text-secondary">الخصومات والاحتساب اليومي (Salary Deductions)</h5>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                        {isActiveDeduction ? 'نشط تلقائياً' : 'معطل'}
                      </span>
                      {/* Active switch to toggle schedule */}
                      <button 
                        onClick={() =>{
                          
                           handleToggleSetting('activeDeduction', !isActiveDeduction)
                           console.log('isActiveDeduction', isActiveDeduction)
                          }}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${
                          isActiveDeduction ? 'bg-secondary flex justify-end' : 'bg-outline-variant/70 flex justify-start'
                        }`}
                      >
                        <div className="bg-white w-4 h-4 rounded-full shadow-sm" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                    تطبيق وتخصيص الخصومات اليومية على رواتب الموظفين (تأخير الحضور أو الخروج المبكر دون إذن).
                  </p>

                  {/* Granular deduction controls */}
                  <div className="mt-3 pt-3 border-t border-outline-variant/10 space-y-2.5 text-xs">
                    {/* Late deduction */}
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant font-medium">خصم التأخير عن الحضور (Late Deduction)</span>
                      <button
                        onClick={() => handleToggleSetting('delayDeduction', !delayDeduction)}
                        className={`w-7 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${delayDeduction ? 'bg-primary flex justify-end' : 'bg-outline-variant/70 flex justify-start'}`}
                      >
                        <div className="bg-white w-3 h-3 rounded-full shadow-xs" />
                      </button>
                    </div>

                    {/* Early leave deduction */}
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant font-medium">خصم الانصراف المبكر والهروب (Early/Escapy)</span>
                      <button
                        onClick={() => handleToggleSetting('earlyLeaveDeduction', !earlyLeaveDeduction)}
                        className={`w-7 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${earlyLeaveDeduction ? 'bg-primary flex justify-end' : 'bg-outline-variant/70 flex justify-start'}`}
                      >
                        <div className="bg-white w-3 h-3 rounded-full shadow-xs" />
                      </button>
                    </div>

                    {/* Absent deduction */}
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant font-medium">خصم الغياب لليوم غير المسجل (Absent Deduction)</span>
                      <button
                        onClick={() => handleToggleSetting('absentDeduction', !absentDeduction)}
                        className={`w-7 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${absentDeduction ? 'bg-primary flex justify-end' : 'bg-outline-variant/70 flex justify-start'}`}
                      >
                        <div className="bg-white w-3 h-3 rounded-full shadow-xs" />
                      </button>
                    </div>

                    {/* Combine deductions at end of shift */}
                    <div className="flex justify-between items-center pt-1 border-t border-outline-variant/10">
                      <span className="text-on-surface-variant font-medium">دمج الخصومات معاً بنهاية الوردية (Combine Deductions)</span>
                      <button
                        onClick={() => handleToggleSetting('combineDeductionsOnEndShift', !combineDeductionsOnEndShift)}
                        className={`w-7 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${combineDeductionsOnEndShift ? 'bg-secondary flex justify-end' : 'bg-outline-variant/70 flex justify-start'}`}
                      >
                        <div className="bg-white w-3 h-3 rounded-full shadow-xs" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-outline-variant/10 flex justify-between items-center gap-3">
                  <span className="text-[10px] text-outline font-label">
                    مجدولة يومياً: نهاية اليوم
                  </span>
                  
                  {/* Status Indicator */}
                  <span className="text-xs font-semibold text-secondary flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                    {isActiveDeduction ? 'المجدول نشط' : 'المجدول متوقف'}
                  </span>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Card 4: Danger Zone (Logout & Delete Account) */}
        <div className="col-span-1 lg:col-span-2 bg-[#fdf2f2] border border-error/20 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-error/10 rounded-lg text-error">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 className="font-heading text-lg font-bold text-[#93000a]">منطقة التحكم والحسابات الحساسة</h4>
              <p className="text-xs text-error/80 mt-1">تسجيل الخروج من المنصة أو حذف ملفك الشخصي نهائياً من قاعدة بيانات المنشأة.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            {/* Log Out */}
            <button
              onClick={handleLogout}
              className="flex-1 md:flex-initial px-5 py-2.5 bg-white border border-outline-variant/30 text-on-surface hover:bg-surface-container-low text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <LogOut size={16} />
              تسجيل الخروج
            </button>
            
            {/* Delete Account */}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex-1 md:flex-initial px-5 py-2.5 bg-error text-white border border-error/20 hover:bg-[#93000a] text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Trash2 size={16} />
              حذف الحساب نهائياً
            </button>
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal (Framer Motion) */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-md bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-xl z-10 text-right"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/10 text-error mb-4">
                <AlertTriangle size={24} />
                <h3 className="font-heading text-lg font-bold">تأكيد حذف الحساب نهائياً</h3>
              </div>
              
              <div className="space-y-3 text-sm text-on-surface-variant font-body leading-relaxed">
                <p className="font-semibold text-on-surface">تحذير: أنت على وشك حذف حساب الموظف الخاص بك بشكل كامل.</p>
                <p>سيؤدي هذا الإجراء إلى:</p>
                <ul className="list-disc list-inside space-y-1 pr-2">
                  <li>إزالة كافة سجلات الحضور الشخصية.</li>
                  <li>حذف الملف التعريفي والبيانات المالية من خوادم النظام.</li>
                  <li>إلغاء تنشيط ترخيص الدخول الخاص بك فوراً.</li>
                </ul>
                <p className="text-xs font-bold text-error/90 mt-2 bg-error/5 p-2.5 rounded border border-error/10">
                  ⚠️ هذا الإجراء نهائي ولا يمكن التراجع عنه أو استعادة البيانات المحذوفة بأي شكل.
                </p>
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-outline-variant/10">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-surface-container text-on-surface-variant border border-outline-variant/30 text-xs font-bold rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-50"
                >
                  إلغاء التراجع
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-error text-white border border-error/20 text-xs font-bold rounded-lg hover:bg-[#93000a] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      جاري الحذف...
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      نعم، احذف حسابي
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
