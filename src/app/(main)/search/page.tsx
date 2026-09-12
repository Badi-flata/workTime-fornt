"use client";

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  UserPlus,
  Mail,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { useDirectoryStore } from '@/store/useDirectoryStore';
import { EmployeeInfoCardModal } from '@/components/ui/EmployeeInfoCardModal';
import { DirectoryUserOutput } from '@/types';
import { UserAvatar } from '@/components/ui/UserAvatar';

function SearchDirectoryContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ||'' ;

  const {
    searchResults,
    searchQuery,
    roleFilter,
    currentPage,
    totalPages,
    itemsPerPage,
    totalCount,
    isLoading,
    error,
    successMessage,
    searchDirectory,
    setSearchQuery,
    setRoleFilter,
    setCurrentPage,
    openEmployeeCard,
    clearMessages,
  } = useDirectoryStore();

  const [inputTerm, setInputTerm] = useState(initialQuery!);

  // Initial fetch or when role/page changes
  useEffect(() => {
    if(typeof window === 'undefined')return;
    if (initialQuery && !searchQuery) {
      setSearchQuery(initialQuery);
      setInputTerm(initialQuery);
    }
    searchDirectory({
      search_Word: initialQuery || searchQuery,
      role: roleFilter,
      page: currentPage,
    });
  }, [roleFilter, currentPage, searchDirectory, initialQuery ,searchQuery]);

  // Handle Search Input Submission
  const handleSearchSubmit = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const val = e.target.value;
    setSearchQuery(val);
    setInputTerm(val);
    searchDirectory({ search_Word: val, page:1 });
  };

  // Filter Pill clicks
  const handleRoleChange = (role: 'all' | 'EMPLOYEE' | 'MANAGER' | 'SUPER_ADMIN') => {
    
    setRoleFilter(role);
    searchDirectory({ role, page: 1 });
  };
  

const paginationSlice = searchResults;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-10"
      dir="rtl"
    >
      {/* ── Top Alert Messages ────────────────────────────────────────── */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={  { opacity: 0, y: -10 }}
            className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-xl flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2 font-label text-sm">
              <CheckCircle2 size={18} />
              <span>{successMessage}</span>
            </div>
            <button onClick={clearMessages} className="text-primary hover:opacity-70">
              <X size={16} />
            </button>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2 font-label text-sm">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            <button onClick={clearMessages} className="text-error hover:opacity-70">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Editorial Header Section ─────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto pt-2">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-2 tracking-tight">
          الدليل الشامل
        </h1>
        <p className="font-sans text-sm md:text-base text-on-surface-variant leading-relaxed">
          ابحث في قاعدة بيانات الموظفين والمدراء لتعيين الفرق وإدارة الهيكل التنظيمي بأسلوب منهجي موثق.
        </p>
      </div>

      {/* ── Central Search Bar & Filter Capsules ─────────────────────── */}
      <div className="max-w-2xl mx-auto space-y-5">
          <div className=" relative">
          <button
            type="submit"
            className=" absolute right-0 top-1/2 -translate-y-1/2 text-primary p-2 hover:opacity-80 transition-opacity"
            aria-label="بحث"
          >
            <Search size={24} />
          </button>
          <input
            type="text"
            value={inputTerm}
            onChange={handleSearchSubmit}
            placeholder="ابحث بالاسم، البريد، أو رقم الهاتف..."
            className="w-full bg-transparent border-0 border-b-2 border-outline-variant/60 focus:border-primary focus:ring-0 pl-4 pr-10 py-2.5 font-sans text-base md:text-lg text-on-surface placeholder:text-outline-variant/60 transition-colors"
          />
      </div>

        {/* Role Filter Capsules */}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => handleRoleChange('all')}
            className={`px-6 py-2 rounded-full font-label text-xs font-bold transition-all shadow-sm ${
              roleFilter === 'all'
                ? 'bg-primary text-on-primary shadow-md'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-primary/10 border border-outline-variant/20'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => handleRoleChange('EMPLOYEE')}
            className={`px-6 py-2 rounded-full font-label text-xs font-bold transition-all shadow-sm ${
              roleFilter === 'EMPLOYEE'
                ? 'bg-primary text-on-primary shadow-md'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-primary/10 border border-outline-variant/20'
            }`}
          >
            موظفون
          </button>
          <button
            onClick={() => handleRoleChange('SUPER_ADMIN')}
            className={`px-6 py-2 rounded-full font-label text-xs font-bold transition-all shadow-sm ${
             ( roleFilter === 'SUPER_ADMIN'||
              roleFilter === 'MANAGER')
                ? 'bg-primary text-on-primary shadow-md'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-primary/10 border border-outline-variant/20'
            }`}
          >
            مدراء
          </button>
        </div>
      </div>

      {/* ── Results Grid (3 Columns) ─────────────────────────────────── */}
      {isLoading ? (
        <div className="py-20 text-center text-outline font-label text-sm">
          جاري البحث في قاعدة البيانات واسترجاع السجلات...
        </div>
      ) : paginationSlice.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {
         paginationSlice.map((user: DirectoryUserOutput) => {
            const isEmployee = user.role === 'EMPLOYEE';
            const isManager = user.role === 'MANAGER' || user.role === 'SUPER_ADMIN';
            const isUnassigned = isEmployee && !user.employeeProfile?.managerId;
            const disciplineRateEmp  =  user?.employeeProfile?.disciplineRate?.rate  
            const organizationDisciplineRate  =  user?.adminProfile?.organizationDiscipline?.rate  

          // const disciplineLabelEmp =  user?.employeeProfile?.disciplineRate?.label 
          // const organizationDisciplineLabel =  user?.adminProfile?.organizationDiscipline?.label 

            const disciplineRate = isEmployee ? disciplineRateEmp : organizationDisciplineRate
          // const disciplineLabel = isEmployee ? disciplineLabelEmp : organizationDisciplineLabel
      // console.log(organizationDisciplineRate)
            return (
              <article
                key={user.id}
                className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group text-center shadow-sm relative p-6"
              >
                {/* Avatar */}
                <UserAvatar
                  src={user.imageProfile}
                  name={user.fullName}
                  size={128}
                  className="mx-auto mt-4 border-4 border-surface-container-low shadow-sm group-hover:scale-105 transition-transform duration-500"
                />

                {/* Role Badge */}
                <div className="mt-4 mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold font-label uppercase tracking-wider inline-block ${
                      isEmployee
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-primary text-on-primary'
                    }`}
                  >
                    {isEmployee ? 'موظف' : 'مدير'}
                  </span>
                </div>

                {/* Full Name & Job Title */}
                <h3 className="text-xl font-bold text-primary tracking-tight mb-1 font-heading">
                  {user.fullName}
                </h3>
                <p className="font-label text-xs text-secondary mb-4">
                  {user.jobTitle || (isManager ? 'مدير إداري' : 'موظف')} •{' '}
                  {user.employeeProfile?.department?.name ||
                    user.adminProfile?.managedDepartments?.[0]?.name ||
                    'الفرع الرئيسي'}
                </p>

                {/* Discipline Metric Card */}
                {isEmployee && (
                  <div className="bg-surface-container-low rounded-xl p-3 mb-5 text-right">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[11px] font-bold text-on-surface-variant/70 font-label">
                        معدل الانضباط
                      </span>
                      <span className="font-heading text-base font-bold text-primary">
                        {disciplineRate}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-l from-emerald-500 to-emerald-300 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, disciplineRate!))}%` }}
                      />
                    </div>
                  </div>
                )}

                {isManager && (
                  <div className='grid grid-cols-2 gap-2'>
                  <div className="bg-surface-container-low rounded-xl p-3 mb-5 text-right flex items-center justify-between">
                    <span className="text-[11px] font-bold text-on-surface-variant/70 font-label flex items-center gap-1">
                      <ShieldCheck size={14} className="text-primary" />
                      الأقسام المدارة
                    </span>
                    <span className="font-heading text-sm font-bold text-primary">
                      {user.adminProfile?.managedDepartments?.length || 1} قسم
                    </span>

                  </div>

                  <div className="bg-surface-container-low rounded-xl p-3 mb-5 text-right">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[11px] font-bold text-on-surface-variant/70 font-label">
                        معدل الانضباط
                      </span>
                      <span className="font-heading text-base font-bold text-primary">
                        {disciplineRate}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-l from-emerald-500 to-emerald-300 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, disciplineRate!))}%` }}
                      />
                    </div>
                  </div>
                  </div>
                )}

                {/* Email Info */}
                <div className="space-y-1 mb-6 text-on-surface-variant mt-auto text-xs font-sans flex items-center justify-center gap-2">
                  <Mail size={14} className="text-outline" />
                  <span>{user.email}</span>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => openEmployeeCard(user)}
                  className={`w-full py-2.5 rounded-xl font-label text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                    isUnassigned
                      ? 'border border-secondary text-secondary hover:bg-secondary hover:text-white'
                      : isManager
                      ? 'bg-primary text-on-primary hover:bg-primary/90'
                      : 'border border-outline-variant text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {isUnassigned ? (
                    <>
                      <UserPlus size={16} />
                      <span>إضافة للفريق</span>
                    </>
                  ) : isManager ? (
                    <>
                      <Users size={16} />
                      <span>تعيين كمدير</span>
                    </>
                  ) : (
                    <>
                      <Eye size={16} />
                      <span>عرض التفاصيل</span>
                    </>
                  )}
                </button>
              </article>
            );
          })}
        </div>
      ) : 
        (
        <div className="py-16 text-center text-outline font-label text-sm bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
          لم يتم العثور على أي نتائج مطابقة لمعايير البحث الحالية.
        </div>
        )}

           {/* ── Pagination Footer ─────────────────────────────────────────── */}
                    {totalPages > 1 && (
                        <div
                         className="p-2 border-t mb-15 sticky bottom-20  z-50 max-sm:scale-[0.85] max-sm:min-w-87.5 
                        max-w-[95%] max-md:mx-1 mx-auto shrink-0  shadow-outline/30 border-outline-variant/10 flex  gap-1 flex-col items-center 
                        justify-center bg-white/90  rounded-4xl shadow-2xl font-label" 
                        dir="rtl">
                         <div className='bg-white'>
                           <span className="text-lg  max-[670px]:my-2 max-sm:translate-x-3.5  text-primary">
                             {currentPage} / {totalPages}  ({totalCount} سجل)
                          </span>
                          </div>
                          
                          <div className="flex gap-2 fp p-2 max-sm:scale-[0.75]  max-sm:translate-x-3.5 justify-center ">
                            <button
                              onClick={() => setCurrentPage((p:number) => Math.max(p - 1, 1))}
                              disabled={currentPage === 1}
                              className=" pr-2.75 -translate-y-2  ml-2 w-10 h-12 rounded border-2 bg-surface border-outline-variant/30 text-center hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-primary"
                            >
                              <ChevronRight size={16} />
                            </button>
                            
                            <div className="flex pb-4 gap-2">
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNo => (
                                <button
                                  key={pageNo}
                                  onClick={() => setCurrentPage(pageNo)}
                                  className={`w-8 h-8 rounded-full shadow-lg  shadow-outline/30 hover:shadow-outline/50 transition-all duration-200 cursor-pointer text-xs font-semibold ${
                                    currentPage === pageNo
                                      ? 'bg-primary text-white font-bold'
                                      : 'border border-outline-variant/30 text-on-surface-variant bg-on-surface/5 hover:bg-surface-container'
                                  }`}
                                >
                                  {pageNo}
                                </button>
                              ))}
                            </div>

                            <button
                              onClick={() => setCurrentPage((p:number) => Math.min(p + 1, totalPages)
                              )}
                              disabled={currentPage === totalPages}
                              className="pr-2.75 -translate-y-2  mr-2 w-10 h-12 rounded border-2 bg-surface border-outline-variant/30 hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-primary"
                            >
                              <ChevronLeft size={16} />
                            </button>
                          </div>
                        </div>
                      )}

      {/* ── Integrated Employee Info Card Modal ──────────────────────── */}
      <EmployeeInfoCardModal />
    </motion.div>
  );
}

export default function DirectorySearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-outline">جاري التحميل...</div>}>
      <SearchDirectoryContent />
    </Suspense>
  );
}
