"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, ChevronLeft, ChevronRight, Camera, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { useProfileStore } from '@/store/useProfileStore';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { getAvatarUrl } from '@/utils/imageUrl';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useDirectoryStore } from '@/store/useDirectoryStore';
import { DisciplineRating } from '@/types';

function AvatarCell({ name, avatar }: { name: string; avatar?: string }) {
  return (
    <div className="flex items-center gap-3">
      <UserAvatar src={avatar} name={name} size={32} />
      <span className="font-semibold text-on-surface whitespace-nowrap">{name}</span>
    </div>
  );
}
const RATING_COLOR: Record<string, string[]> = {
  EXCELLENT:         ['bg-primary/5 text-primary border border-primary/10','bg-primary','bg-outline/5 '],
  VERY_GOOD:         ['bg-secondary/5 text-secondary border border-secondary/10','bg-secondary','bg-outline/5 '],
  GOOD:              ['bg-orange-500/5  text-on-surface-variant border border-orange-500/10','bg-orange-500','bg-outline/5 '],
  NEEDS_IMPROVEMENT: ['bg-error/5  text-error border border-error/10','bg-error','bg-outline/5 '],
  "لا يوجد بيانات":  ['bg-gray/5  text-gray border border-gray/10','bg-gray','bg-outline/5 '],
};
const DISCIPLINE_LABELS: Record< string, string> = {
  "لا يوجد بيانات": "لا يوجد بيانات",
   EXCELLENT: 'ممتاز',
   VERY_GOOD: 'جيد جداً',
   GOOD: 'جيد',
   NEEDS_IMPROVEMENT: 'متدني',
};

export default function EmployeeProfilePage() {
   
    const {
    imageProfile,
    fullName,
    jobTitle,
    phone,
    role,
    email,
    createdAt,
    dsicipline,
    profile,
    error,
    isLoading,
    isUpdating,
    isUploadingAvatar,
    updateSuccessMessage,
    fetchProfile,
    updateProfile,
    uploadProfileImage,
    updateAvatarUrl,
    clearMessages,
  } = useProfileStore();

  const {SearchMyEmp , openEmployeeCard  }= useDirectoryStore()
 
  const [showSalary, setShowSalary] = useState(false);
  const [upd, setUpd] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client-side pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ── Form States ──────────────────────────────────────────────────
  const [formFullName, setFormFullName] = useState(fullName || '');
  const [formEmail, setFormEmail] = useState(email || '');
  const [formJobTitle, setFormJobTitle] = useState(jobTitle || '');
  const [formPhone, setFormPhone] = useState(phone || '');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    setFormFullName(fullName || '');
    setFormEmail(email || '');
    setFormJobTitle(jobTitle || '');
    setFormPhone(phone || '');
    setPreviewAvatar(null);
  }, [fullName, email, jobTitle, phone, imageProfile]);

  // Auto-dismiss success notification after 5 seconds
  useEffect(() => {
    if (updateSuccessMessage || formError || error) {
      const timer = setTimeout(() => {
        setFormError(null)
        clearMessages();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [updateSuccessMessage, clearMessages ,formError,error]);

  const handleEditToggle = () => {
    if (upd) {
      // Reset form fields
      setFormFullName(fullName || '');
      setFormEmail(email || '');
      setFormJobTitle(jobTitle || '');
      setFormPhone(phone || '');
      setFormError(null);
      setPreviewAvatar(null);
      clearMessages();
      setUpd(false);
    } else {
      clearMessages();
      setUpd(true);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormError('حجم الصورة يجب ألا يتجاوز 5 ميجابايت');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFormError('صيغة الملف غير مدعومة. يُسمح فقط بـ (JPG, PNG, WEBP)');
      return;
    }

    setFormError(null);

    // Create local object URL for instant preview feedback
    const localPreview = URL.createObjectURL(file);
    setPreviewAvatar(localPreview);

    const success = await uploadProfileImage(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (!success) {
      setPreviewAvatar(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formFullName.trim()) {
      setFormError('الاسم الكامل مطلوب');
      return;
    }
    if (!formJobTitle.trim()) {
      setFormError('المسمى الوظيفي مطلوب');
      return;
    }

    if (!formPhone.trim()) {
      setFormError('رقم الهاتف مطلوب');
      return;
    }

    if (!formEmail.trim() || !formEmail.includes('@gmail.com')) {
      setFormError('يرجى إدخال بريد إلكتروني صالح');
      return;
    }

    const success = await updateProfile({
      fullName: formFullName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      jobTitle: formJobTitle.trim(),
    });

    if (success) {
      setUpd(false);
    }
  };
  const handEmpCard = async(email:string) => {

    setFormError(null);

   if (!email.trim() ) {
      setFormError('يرجى إدخال بريد إلكتروني ');
      return;
    }
    // if (!email.trim() || !email.includes('@gmail.com')) {
    //   setFormError('يرجى إدخال بريد إلكتروني صالح');
    //   return;
    // }  
    await SearchMyEmp(email.trim())
    
  };

  const formattedJoiningDate = createdAt
    ? new Date(createdAt).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'غير محدد';

  const getRoleLabel = (roleName: string) => {
    switch (roleName) {
      case 'SUPER_ADMIN':
        return 'مدير النظام العام';
      case 'MANAGER':
        return 'مدير القسم';
      case 'EMPLOYEE':
        return 'موظف';
      default:
        return roleName;
    }
  };
  
  // Subordinates pagination logic
  const emp= dsicipline?.admin?.employeeRates
  const list= profile?.admin?.subordinates?.list
  const subordinatesList = [];
  if(emp !== undefined && list !== undefined && list?.length > 0){
  for (const empRate of emp){
    const empProfile= list.find((empProfile) => empProfile.id === empRate?.employeeId)
    
    subordinatesList.push({
      ...(empProfile || list[list.length -1] ),
      rate:empRate.rate,
      label:empRate.label
      
    })
  }
}

  const totalSubordinates = subordinatesList.length;
  const totalPages = Math.ceil(totalSubordinates / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubordinates = subordinatesList.slice(startIndex, startIndex + itemsPerPage);

  const displayAvatar = previewAvatar || imageProfile;
  const disciplineRate = role === "EMPLOYEE" && dsicipline?.employee?.rate !== undefined ? dsicipline?.employee?.rate + '%' :
   (role ==="SUPER_ADMIN" || role === "MANAGER") && dsicipline?.admin?.organizationRate !== undefined ? dsicipline?.admin?.organizationRate + "%" : '0%';
 
   const disciplineLabel = role === "EMPLOYEE" && dsicipline?.employee?.label !== undefined ?
    dsicipline?.employee?.label :
   (role === "SUPER_ADMIN" || role === "MANAGER") && dsicipline?.admin?.organizationLabel !== undefined ? 
    dsicipline?.admin?.organizationLabel :
     " لا يوجد بيانات ";


   console.log("discipline label",disciplineLabel)

  if (error && !fullName) {
    return (
      <div className="max-w-container-max mx-auto p-6 text-center mt-20">
        <div className="bg-error-container text-on-error-container p-6 rounded-lg border border-error/20 inline-block max-w-md shadow-sm">
          <span className="material-symbols-outlined text-[48px] text-error mb-2">error</span>
          <h3 className="font-headline text-[20px] font-bold mb-2">حدث خطأ أثناء تحميل البيانات</h3>
          <p className="font-body text-[14px] mb-4">{error}</p>
          <button 
            onClick={() => fetchProfile(true)} 
            className="px-5 py-2 bg-primary text-white rounded hover:bg-primary/95 transition-colors cursor-pointer"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {!isLoading ? (
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin-desktop px-3 md:px-5 pb-8 md:pb-10">
          {/* Notifications Banner */}
          <AnimatePresence>
            {(error || formError || updateSuccessMessage) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`"mb-6 p-4 rounded-xl z-99 mx-[8%]  max-md:mx-[18%]  absolute w-[50%] ${error || formError ? 'bg-red-50 border border-red-200 text-red-800' :
                   'bg-emerald-50 border border-emerald-200 text-emerald-800'} flex items-center justify-between shadow-sm`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${error || formError ? 'bg-red-500' : 'bg-emerald-500'} text-white flex items-center justify-center shrink-0`}>
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-sm">{formError || error || updateSuccessMessage}</span>
                </div>
                <button
                  onClick={() => { setFormError(null); clearMessages(); }}
                  className={`text-${error || formError ? 'text-red-600' : 'text-emerald-600'} hover:${error || formError ? 'text-red-600' : 'text-emerald-600'} transition-colors p-1 cursor-pointer`}
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Page Header */}
          <div className="mb-10 border-b border-outline-variant/20 pb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
              <h2 className="font-headline text-[32px] md:text-[48px] font-bold text-primary tracking-tight">
                الملف الشخصي للموظف
              </h2>
              <p className="font-body text-[18px] text-on-surface-variant mt-2">
                سجل البيانات المهنية والتفاصيل الوظيفية
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleEditToggle}
                className={`px-5 py-2.5 rounded-full font-label font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                  upd
                    ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                    : 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {upd ? 'close' : 'edit'}
                </span>
                {upd ? 'إلغاء التعديل' : 'تعديل البيانات'}
              </button>
              <button className="px-5 py-2.5 rounded-full bg-primary text-white font-label font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">description</span>
                طلب مستندات
              </button>
            </div>
          </div>

          {/* Hidden File Input for Avatar Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="hidden"
          />

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (Profile Summary - spans 4 cols on lg) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Avatar Card */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-8 flex flex-col items-center text-center relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/10 to-transparent"></div>
                
                {/* Interactive Avatar Container */}
                <div className="relative group mb-4 z-10">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-surface-variant flex items-center justify-center relative">
                    <UserAvatar
                      src={displayAvatar}
                      name={fullName}
                      size={128}
                      className="w-full h-full"
                    />

                    {/* Uploading Overlay */}
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-1 z-20">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                        <span className="text-[11px] font-semibold">جارِ الرفع...</span>
                      </div>
                    )}
                  </div>

                  {/* Camera Upload Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    title="تغيير الصورة الشخصية"
                    className="absolute bottom-0 left-0 bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary/90 transition-all border-2 border-white cursor-pointer disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="text-xs text-primary font-semibold hover:underline mb-2 cursor-pointer z-10"
                >
                  تغيير الصورة الشخصية
                </button>

                <h3 className="font-headline text-[24px] font-semibold text-primary mb-1 relative z-10">
                  {fullName || 'مستخدم جديد'}
                </h3>
                <p className="font-body text-[16px] text-on-surface-variant mb-4 relative z-10">
                  {jobTitle || 'لا يوجد مسمى وظيفي'}
                </p>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary font-label text-[12px] font-semibold mb-6 relative z-10">
                  <span className="material-symbols-outlined text-[15px]">badge</span>
                  {getRoleLabel(role)}
                </div> 

                <div className="w-full flex flex-col items-center gap-4 border-t border-outline-variant/10 pt-6 relative z-10">

                   {/* period Count Discipline */}
                  <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 m-2 rounded-lg border border-primary/10 select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-sans font-bold text-primary">
                        {role === "EMPLOYEE" && dsicipline?.employee?.periodCountDiscipline?
                        dsicipline?.employee?.periodCountDiscipline
                        :role === "SUPER_ADMIN" && dsicipline?.admin?.periodCountDiscipline ?
                        dsicipline?.admin?.periodCountDiscipline
                        :"لا يوجد بيانات"}
                    </span>
                  </div>

                 <div className=" w-full grid grid-cols-2 gap-4  ">

                  <div className="flex flex-col items-center">
                    <span className="font-headline text-[24px] font-bold text-primary">
                      {
                      disciplineRate
                      }
                    </span>
                    <span className="font-label text-[12px] text-on-surface-variant">معدل الانضباط</span>
                  </div>

                  {/* Label Discipline */}
                   <div className={`
                    flex  w-[70%] items-center gap-2 
                    ${RATING_COLOR[disciplineLabel]?.[0]}
                    px-3 py-1.5 rounded-lg  select-none `}>
                    <span className={`
                       w-1.5 h-1.5 rounded-full justify-self-start
                        ${RATING_COLOR[disciplineLabel]?.[1]} animate-pulse
                         `} />
                      <span className={` w-auto self-center
                      text-lg font-sans leading-5 font-medium 
                        ${RATING_COLOR[disciplineLabel]?.[2]} 
                        `}>
                      {DISCIPLINE_LABELS[disciplineLabel]}
                    </span> 
                  </div>
                </div>  
               
                </div>
              </div>

              {/* Contact Quick Info */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6 shadow-sm">
                <h4 className="font-headline text-[18px] text-primary font-semibold mb-4 border-b border-outline-variant/10 pb-2">
                  معلومات الاتصال
                </h4>
                <ul className="flex flex-col gap-4">
                  <li className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5 shrink-0">
                      <span className="material-symbols-outlined text-[18px]">call</span>
                    </div>
                    <div>
                      <p className="font-label text-[12px] text-on-surface-variant mb-0.5">رقم الجوال</p>
                      <p className="font-body text-[16px] text-on-surface font-medium" dir="ltr">{phone || 'غير محدد'}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5 shrink-0">
                      <span className="material-symbols-outlined text-[18px]">email</span>
                    </div>
                    <div>
                      <p className="font-label text-[12px] text-on-surface-variant mb-0.5">البريد الإلكتروني</p>
                      <p className="font-body text-[16px] text-on-surface font-medium" dir="ltr">{email || 'غير محدد'}</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column (Details / Edit Form - spans 8 cols on lg) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* EDIT FORM MODE */}
              <AnimatePresence mode="wait">
                {upd ? (
                  <motion.form
                    key="edit-form"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    onSubmit={handleSaveProfile}
                    className="bg-surface-container-lowest rounded-2xl border border-primary/30 p-6 md:p-8 shadow-md border-r-[5px] border-r-primary"
                  >
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/15">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        <h4 className="font-headline text-[24px] font-bold text-primary">
                          تعديل البيانات الشخصية
                        </h4>
                      </div>
                      <span className="text-xs text-on-surface-variant font-label">
                        الحقول المسموح بتحديثها
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                      {/* Full Name */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label text-[14px] font-semibold text-primary">
                          الاسم الكامل <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formFullName}
                          onChange={(e) => setFormFullName(e.target.value)}
                          placeholder="أدخل الاسم الكامل"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface outline-none bg-surface/50"
                        />
                      </div>

                      {/* Job Title */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label text-[14px] font-semibold text-primary">
                          المسمى الوظيفي
                        </label>
                        <input
                          type="text"
                          value={formJobTitle}
                          onChange={(e) => setFormJobTitle(e.target.value)}
                          placeholder="مثال: مهندس برمجيات / مسؤول مشتريات"
                          className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface outline-none bg-surface/50"
                        />
                      </div>

                      {/* Email */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label text-[14px] font-semibold text-primary">
                          البريد الإلكتروني <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          placeholder="user@example.com"
                          dir="ltr"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface outline-none bg-surface/50 text-right"
                        />
                      </div>

                      {/* Phone */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label text-[14px] font-semibold text-primary">
                          رقم الهاتف / الجوال
                        </label>
                        <input
                          type="tel"
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          placeholder="+9665xxxxxxxx"
                          dir="ltr"
                          className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface outline-none bg-surface/50 text-right"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 pt-5 border-t border-outline-variant/15 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleEditToggle}
                        disabled={isUpdating}
                        className="px-6 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-variant font-label font-semibold transition-all cursor-pointer disabled:opacity-50"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="px-7 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/95 font-label font-semibold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>جارِ الحفظ...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>حفظ التغييرات</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.form>
                ) : null}
              </AnimatePresence>

              {/* Basic Info Bento Card (View Mode) */}
              <div
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6 md:p-8 shadow-sm border-r-[4px]"
                style={{ borderRightColor: '#581c87' }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-[#581c87] rounded-full" />
                  <h4 className="font-headline text-[28px] font-bold text-[#581c87]">
                    البيانات الأساسية
                  </h4>
                </div>

                {(role === 'MANAGER' || role === 'SUPER_ADMIN') && profile?.admin ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                    <div className="flex flex-col gap-2">
                      <span className="font-body text-[16px] font-semibold text-secondary">
                        الأقسام المدارة
                      </span>
                      <div className="bg-secondary/5 border border-outline-variant/20 p-4 rounded-xl shadow-xs transition-all hover:border-primary/20">
                        <p className="font-body text-[20px] font-semibold text-[#581c87]">
                          {profile?.admin?.department?.names && profile.admin.department.names.length > 0
                            ? profile.admin.department.names.join('، ')
                            : 'لا توجد أقسام مدارة'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="font-body text-[16px] font-bold text-secondary">
                        الورديات المشرف عليها
                      </span>
                      <div className="bg-secondary/5 border border-outline-variant/20 p-4 rounded-xl shadow-xs transition-all hover:border-primary/20">
                        <p className="font-body text-[20px] font-semibold text-[#581c87]">
                          {profile?.admin?.shift?.names && profile.admin.shift.names.length > 0
                            ? profile.admin.shift.names.join('، ')
                            : 'لا توجد ورديات مشرف عليها'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-2">
                      <span className="font-body text-[16px] font-semibold text-secondary">
                        إجمالي الموظفين التابعين
                      </span>
                      <div className="bg-secondary/5 border border-outline-variant/20 p-4 rounded-xl shadow-xs transition-all hover:border-primary/20">
                        <p className="font-body text-[20px] font-semibold text-[#581c87]">
                          {profile?.admin?.subordinates?.length || 0} موظف
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                    <div className="flex flex-col gap-2">
                      <span className="font-body text-[16px] font-semibold text-secondary">القسم</span>
                      <div className="bg-secondary/3 border border-outline-variant/20 p-4 rounded-xl shadow-lg">
                        <p className="font-body text-[20px] font-semibold text-[#581c87]">
                          {profile?.employee?.departmentName || 'غير محدد'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="font-body text-[16px] font-semibold text-secondary">المدير المباشر</span>
                      <div className="bg-secondary/3 border border-outline-variant/20 p-4 rounded-xl shadow-lg">
                        <p className="font-body text-[20px] font-semibold text-[#581c87]">
                          {profile?.employee?.managerName || 'غير محدد'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="font-body text-[16px] font-semibold text-secondary">الوردية</span>
                      <div className="bg-secondary/3 shadow-lg border border-outline-variant/20 p-4 rounded-xl ">
                        <p className="font-body text-[20px] font-semibold text-[#581c87]">
                          {profile?.employee?.shiftName || 'غير محدد'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="font-body text-[16px] font-semibold text-secondary">معلومات التواصل للمدير</span>
                     
                    <div className=" shadow-lg border border-outline-variant/20 p-4 rounded-xl bg-secondary/3 flex flex-col justify-baseline gap-1">
                      <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mt-0.5 shrink-0">
                      <span className="material-symbols-outlined   text-[#581c87]  text-[18px]">call</span>
                     </div>
                    <div>
                      <p className="font-label text-[12px] text-on-surface-variant mb-0.5">رقم الهاتف</p>
                      <p className="font-body text-[16px] font-medium text-secondary" dir="ltr">{profile?.employee?.managerPhone || 'غير محدد'}</p>
                    </div>
                   </div>

                   <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mt-0.5 shrink-0">
                      <span className="material-symbols-outlined text-[#581c87] text-[18px]">email</span>
                    </div>
                    <div>
                      <p className="font-label text-[12px] text-on-surface-variant mb-0.5">البريد الإلكتروني</p>
                      <p className=" font-body text-[16px] font-medium text-secondary" dir="ltr">{profile?.employee?.managerEmail || 'غير محدد'}</p>
                    </div>
                   </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Role Specific Details Bento Card */}
              {role === 'EMPLOYEE' ? (
                <div
                  className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6 md:p-8 shadow-sm border-r-[4px]"
                  style={{ borderRightColor: '#064e3b' }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-emerald-700 rounded-full"></div>
                    <h4 className="font-headline text-[24px] font-bold text-primary">
                      التفاصيل الوظيفية والمالية
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                    <div className="flex flex-col gap-2">
                      <label className="font-label text-[14px] font-semibold text-primary/80">
                        حالة العمل الحالية
                      </label>
                      <div className="bg-emerald-50/60 border border-emerald-200/50 p-4 rounded-xl flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px] text-emerald-700">
                          {profile?.employee?.isWorking ? 'check_circle' : 'cancel'}
                        </span>
                        <span className="font-body text-[16px] font-semibold text-on-surface">
                          {profile?.employee?.isWorking ? 'نشط (على رأس العمل)' : 'غير نشط'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="font-label text-[14px] font-semibold text-primary/80">
                        الراتب الأساسي
                      </span>
                      <div className="bg-emerald-50/60 border border-emerald-200/50 p-4 rounded-xl flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                          payments
                        </span>
                        <span className="font-body text-[16px] font-semibold text-on-surface">
                          {showSalary ? `${profile?.employee?.salary} ر.س` : '*** ر.س'}
                        </span>
                        <button 
                          type="button"
                          onClick={() => setShowSalary(!showSalary)} 
                          className="mr-auto text-primary hover:text-primary-container text-[12px] font-label underline cursor-pointer"
                        >
                          {showSalary ? 'إخفاء' : 'عرض'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6 md:p-8 shadow-sm border-r-[4px]"
                  style={{ borderRightColor: '#064e3b' }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                    <h4 className="font-headline text-[24px] font-bold text-primary">موظفوني</h4>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-outline/10 shadow-xs">
                    <table className="chronicle-table min-w-full text-right" dir="rtl">
                      <thead>
                        <tr className="bg-surface-container-low">
                          <th className="p-4 text-right text-primary font-semibold border-b border-outline-variant/20 font-label">
                            الموظف
                          </th>
                          <th className="p-4 text-right text-primary font-semibold border-b border-outline-variant/20 font-label">
                            حالة الإنضباظية 
                          </th>
                          <th className="p-4 text-right text-primary font-semibold border-b border-outline-variant/20 font-label">
                            البريد الإلكتروني
                          </th>
                          <th className="p-4 text-right text-primary font-semibold border-b border-outline-variant/20 font-label">
                            رقم الهاتف
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence mode="wait">
                          {paginatedSubordinates.length > 0 ? (
                            paginatedSubordinates.map((sub, index) => (
                              
                              <motion.tr 
                                key={sub.email}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                onClick={()=> {
                                  console.log("yon on perss to:",sub.fullName)
                                  handEmpCard(sub.email)}
                                }
                                transition={{ delay: index * 0.04, duration: 0.22 }}
                                className="hover:bg-surface-container-low transition-colors cursor-pointer"
                              >
                                <td className="p-4 border-b border-outline-variant/10">
                                  <AvatarCell name={sub.fullName} />
                                </td>
                                <td className="p-4 border-b border-outline-variant/10 text-on-surface-variant font-sans tabular-nums" dir="ltr">
                                  <div className={`flex items-center gap-2 ${RATING_COLOR[sub.label][0]} px-3 py-1.5 rounded-lg  select-none`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${RATING_COLOR[sub.label][1]} animate-pulse`} />
                                        <span className={` text-sm font-sans leading-5 font-medium ${RATING_COLOR[sub.label][2]}`}>
                                       {DISCIPLINE_LABELS[sub.label] }
                                      </span>
                                    </div>
                                    
                                </td>
                                <td className="p-4 border-b border-outline-variant/10 text-on-surface-variant font-sans tabular-nums" dir="ltr">
                                  {sub.email}
                                </td>
                                <td className="p-4 border-b border-outline-variant/10 text-on-surface-variant font-sans tabular-nums" dir="ltr">
                                  {sub.phone}
                                </td>
                              </motion.tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="p-14 text-center text-outline">
                                لا يوجد موظفون تابعون تحت إشرافك حالياً.
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-6" dir="rtl">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-full border border-outline-variant/30 hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-primary"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      
                      <div className="flex gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNo) => (
                          <button
                            key={pageNo}
                            onClick={() => setCurrentPage(pageNo)}
                            className={`w-8 h-8 rounded-lg font-label font-semibold transition-all cursor-pointer ${
                              currentPage === pageNo
                                ? 'bg-primary text-white shadow-xs'
                                : 'border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container'
                            }`}
                          >
                            {pageNo}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-full border border-outline-variant/30 hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-primary"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 bg-surface/90 backdrop-blur-xs z-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
        </div>
      )}
    </motion.div>
  );
}
