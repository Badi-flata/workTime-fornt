"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Building2,
  Clock,
  Check,
  Lock,
  FileText,
  UserPlus,
  Edit,
  Briefcase,
  CheckCircle2,
  UserX,
  CheckCircle,
} from 'lucide-react';
import { useDirectoryStore } from '@/store/useDirectoryStore';
import { useDeptShiftStore } from '@/store/useDeptShiftStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import { UserAvatar } from '@/components/ui/UserAvatar';
import clsx from 'clsx';

export function EmployeeInfoCardModal() {
  const { isInfoModalOpen, selectedUser, isAssigning,error,successMessage, closeEmployeeCard, clearMessages, assignEmployeeToManager, setManagerForEmployee , firedEmployee } = useDirectoryStore();
  const { departmentNames, shifts, fetchDepartmentNames, fetchShifts } = useDeptShiftStore();
  const { user: currentUser } = useAuthStore();
  const { fetchProfile } = useProfileStore();

  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedShiftId, setSelectedShiftId] = useState<string>('');
  const [messageError, setMessageError] = useState<string>('');
  const [customSalary, setCustomSalary] = useState<number>(500);

  // Load departments and shifts for assignment dropdowns
  useEffect(() => {
    if (isInfoModalOpen) {
      fetchDepartmentNames();
      fetchShifts();
    }
  }, [isInfoModalOpen, fetchDepartmentNames, fetchShifts]);

  // Sync initial employee data to form
  useEffect(() => {
    if (selectedUser?.employeeProfile) {
      const emp = selectedUser.employeeProfile;
      setSelectedDeptId(emp.departmentId || (departmentNames[0]?.id ?? ''));
      setSelectedShiftId(emp.shiftId || (shifts[0]?.id ?? ''));
      setCustomSalary(emp.salary || 500);
    }
  }, [selectedUser, departmentNames, shifts]);

   useEffect(() => {
  if (successMessage|| (error|| messageError)) {
    const timer = setTimeout(() => {
      if(successMessage||(error|| messageError)) {

        if(error|| messageError)closeEmployeeCard();
         clearMessages()
         }else{
          setMessageError("")
         }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, clearMessages, error, messageError]);

  if (!isInfoModalOpen || !selectedUser) return null;
  // selected elements role
  const isEmployee = selectedUser.role === 'EMPLOYEE';
  const isManager = selectedUser.role === 'MANAGER' || selectedUser.role === 'SUPER_ADMIN';

  // current user role
  const isCurrentUserAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'MANAGER';
  const isCurrentUserEmployee = currentUser?.role === 'EMPLOYEE';
  // status of selected user
  const isUnassignedEmployee = isEmployee && !selectedUser.employeeProfile?.managerId;
  const isMyEmployee = isCurrentUserAdmin && selectedUser.employeeProfile?.managerId === currentUser?.id;
  
  const disciplineRate  = isCurrentUserEmployee ? selectedUser.employeeProfile?.disciplineRate?.rate ?? 95 : selectedUser.adminProfile?.organizationDiscipline?.rate ?? 95;
  const disciplineLabel = isCurrentUserEmployee ? selectedUser.employeeProfile?.disciplineRate?.label ?? 'ممتاز' : selectedUser.adminProfile?.organizationDiscipline?.label ?? 'ممتاز';

  const handleConfirmAssignment = async () => {
    if (!selectedUser) {
      setMessageError('يرجى اختيار l');
      return;
    }
    if (!selectedDeptId) {
      setMessageError('يرجى اختيار القسم');
      return;
    }
    if (!selectedShiftId) {
      setMessageError('يرجى اختيار الوردية');
      return;
    }
    if (customSalary < 500) {
      setMessageError('يرجى إدخال راتب لا يقل عن 500');
      return;
    } 
    if (isMyEmployee) {
      setMessageError('  هذا الموظف تبع لك بالفعل ');
      return;
    }
    if (!isUnassignedEmployee ) {
      setMessageError(' هذا الموظف تبع لمدير بالفعل ');
      return;
    }
    await assignEmployeeToManager({
      employeeUserId: selectedUser.id,
      name:selectedUser.fullName,
      email:selectedUser.email,
      phone:selectedUser.phone,
      jobTitle:selectedUser.jobTitle,
      departmentId: selectedDeptId ,
      shiftId: selectedShiftId ,
      salary: customSalary ? Number(customSalary) : undefined,
    });
  };

  const handleSetAsMyManager = async () => {
    if (!selectedUser) {
      setMessageError('يرجى اختيار ملف مدير أولا');
      return;
    }
    if (!isManager && (!selectedUser.id || !selectedUser.adminProfile?.id)) {
      setMessageError('يجب انيكون الملف لمدير للأتمام العملية ');
      return;
    }
    if (!isCurrentUserEmployee) {
      setMessageError(' هذه العملية خاص بالموظفين ');
      return;
    }

   const adminId =  selectedUser?.adminProfile?.userId ||selectedUser.id

    await setManagerForEmployee(adminId);
  };

  const handleFireEmployee = async () => {

      if (!selectedUser) {
      setMessageError('يرجى اختيار ملف الموظف أولا');
      return;
    }
    if (isManager && (!selectedUser.id || !selectedUser.employeeProfile?.id)) {
      setMessageError('يجب انيكون الملف لمدير للأتمام العملية ');
      return;
    }
    if (!isCurrentUserAdmin) {
      setMessageError(' هذه العملية خاص بالمدير ');
      return;
    }
    if (!isUnassignedEmployee &&!isMyEmployee) {
      setMessageError('  هذا الموظف ليس تبع لك ');
      return;
    }
    if ( isUnassignedEmployee ) {
      setMessageError('هذا لموظف ليس تبع اي مدير ');
      return;
    }

    const employeeId =  selectedUser?.employeeProfile?.userId || selectedUser.id;

    await firedEmployee(employeeId);
      await fetchProfile()
  };


  console.log("is my employee", isMyEmployee);
  console.log("isn't assinge to any manager", isUnassignedEmployee);
  console.log("my manager id", disciplineRate);
  // console.log("message", (messageError||error! ||successMessage!));

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-90 flex items-center justify-center p-4 sm:p-6 bg-inverse-surface/40 backdrop-blur-md"
        dir="rtl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-[0px_20px_40px_rgba(0,0,0,0.06)] border border-primary/10 overflow-hidden flex flex-col relative"
        >
          {/* Close Button */}
          <button
            onClick={closeEmployeeCard}
            className="absolute top-6 left-6 text-on-surface-variant hover:text-primary transition-colors z-10 bg-surface-container-low hover:bg-surface-container-high rounded-full p-2"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>

          {/* Header Section */}
          <div className="p-8 pb-4 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            {/* Avatar & Status Badge */}
            <div className="relative shrink-0">
              <UserAvatar
                src={selectedUser.imageProfile}
                name={selectedUser.fullName}
                size={112}
                className="border-4 border-surface-container-lowest shadow-md z-10 relative"
              />
              <div
                className="absolute bottom-1 right-1 w-6 h-6 bg-primary-container border-2 border-surface-container-lowest rounded-full flex items-center justify-center z-20 text-white"
                title="نشط"
              >
                <Check size={12} strokeWidth={3} />
              </div>
            </div>

            {/* Primary Info */}
            <div className="flex-1 text-right w-full">
              <div className="flex items-center justify-start gap-3 mb-2">
                <span
                  className={`px-3 py-1 rounded-full font-label text-xs font-semibold tracking-wide ${
                    isUnassignedEmployee
                      ? 'bg-amber-500/10 text-amber-800 border border-amber-500/20'
                      : isEmployee
                      ? 'bg-emerald-500/10 text-emerald-800 border border-emerald-500/20'
                      : 'bg-primary text-on-primary'
                  }`}
                >
                  {isUnassignedEmployee
                    ? 'غير مسجل لمدير'
                    : isEmployee
                    ? 'موظف مسجل'
                    : 'مدير / مسؤول'}
                </span>
              </div>

              <h2 className="font-heading text-2xl sm:text-3xl text-on-surface font-bold leading-tight mb-1">
                {selectedUser.fullName}
              </h2>
              <p className="font-sans text-sm text-on-surface-variant flex items-center gap-1.5">
                <Briefcase size={14} className="text-secondary" />
                <span>{selectedUser.jobTitle || (isManager ? 'مدير إداري' : 'موظف')}</span>
              </p>

              {/* Department Dropdown / Display */}
              {isCurrentUserAdmin && isUnassignedEmployee ? (
                <div className="mt-3 relative max-w-xs">
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-1.5 pr-8 pl-4 text-on-surface font-sans text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                  >
                    <option value="" disabled>
                      اختر القسم المراد التعيين فيه...
                    </option>
                    {departmentNames?.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <Building2
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
                  />
                </div>
              ) : (
                <p className="text-xs text-secondary font-label mt-2 flex items-center gap-1">
                  <Building2 size={13} />
                  <span>
                    {selectedUser.employeeProfile?.department?.name ||
                      selectedUser.adminProfile?.managedDepartments?.[0]?.name ||
                      'بدون قسم مخصص'}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="px-8">
            <hr className="border-t border-outline-variant/20" />
          </div>

          {/* Administrative Notice Banner */}
          {isUnassignedEmployee && isCurrentUserAdmin && (
            <div className="px-6 py-2.5 bg-primary/5 border-r-4 border-primary mx-8 my-4 rounded-lg">
              <p className="text-xs font-sans text-on-surface-variant flex items-center gap-2">
                <Edit size={14} className="text-primary shrink-0" />
                <span>تخصيص البيانات الإدارية (القسم، الوردية، والراتب) قبل تأكيد الإضافة للفريق:</span>
              </p>
            </div>
          )}

          {/* Content Body - Data Grid */}
          <div className="p-8 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Administrative Data Group */}
            <div className="space-y-4">
              {/* Salary Field */}
              <div>
                <label className="block font-label text-xs text-on-surface-variant mb-1 flex items-center gap-1">
                  <span>الراتب الشهري الأساسي</span>
                  <Lock size={12} className="text-outline" />
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={customSalary}
                    onChange={(e) => setCustomSalary(Number(e.target.value))}
                    disabled={!isUnassignedEmployee || !isCurrentUserAdmin}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-2 px-3 pl-10 text-on-surface font-sans text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-sans text-outline">
                    ر.س
                  </span>
                </div>
              </div>

              {/* Shift Field */}
              <div>
                <label className="block font-label text-xs text-on-surface-variant mb-1 flex items-center gap-1">
                  <span>المناوبة المخصصة</span>
                  <Lock size={12} className="text-outline" />
                </label>
                <div className="relative">
                  {isUnassignedEmployee && isCurrentUserAdmin ? (
                    <select
                      value={selectedShiftId}
                      onChange={(e) => setSelectedShiftId(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-2 pr-8 pl-3 text-on-surface font-sans text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                    >
                      <option value="" disabled>
                        اختر الوردية...
                      </option>
                      {shifts.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.startTime} - {s.endTime})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-2 pr-8 pl-3 text-on-surface font-sans text-xs">
                      {selectedUser.employeeProfile?.shift?.name
                        ? `${selectedUser.employeeProfile.shift.name} (${selectedUser.employeeProfile.shift.startTime} - ${selectedUser.employeeProfile.shift.endTime})`
                        : 'وردية العمل الافتراضية'}
                    </div>
                  )}
                  <Clock
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Performance & Contract Data Group */}
            <div className="space-y-4">
              {/* Discipline Metric */}
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-label text-xs text-on-surface-variant">
                    معدل الانضباط (الشهر الحالي)
                  </span>
                  <span className="font-heading text-lg font-bold text-primary">
                    {disciplineRate}% <span className="text-xs text-secondary">({disciplineLabel})</span>
                  </span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, disciplineRate))}%` }}
                  />
                </div>
              </div>

              {/* Contract Status */}
              <div>
                <span className="block font-label text-xs text-on-surface-variant mb-1 flex items-center gap-1">
                  <span>حالة العقد</span>
                  <Lock size={12} className="text-outline" />
                </span>
                <div className="flex items-center gap-2 p-2 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs font-sans text-on-surface">
                  <FileText size={16} className="text-secondary" />
                  <span>دوام كامل (مستمر)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-surface-container-low p-5 px-8 flex flex-col
           justify-between items-center border-t border-outline-variant/20">
            
          <div className="flex justify-between items-center gap-3 w-full">
           {isCurrentUserAdmin && isMyEmployee && isEmployee &&( 
            <button
              onClick={handleFireEmployee}
              className="px-6 py-2.5 rounded-xl bg-error text-on-primary font-label text-xs font-bold shadow-sm hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <UserX size={16} />
              <span>{isAssigning ? 'جاري الفصل...' : 'فصل الموظف'}</span>
            </button>
          )}
 
              {/* Conditional Action Buttons */}
                <div className='flex flex-col items-center gap-2 '>
              {isCurrentUserAdmin && isUnassignedEmployee == true && isEmployee && (
                <button
                  onClick={handleConfirmAssignment}
                  disabled={isAssigning}
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label text-xs font-bold shadow-sm hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <UserPlus size={16} />
                  <span>{isAssigning ? 'جاري الإضافة...' : 'قم بالإضافة للفريق'}</span>
                </button>
              )}

           
              {isCurrentUserAdmin && isEmployee &&  isMyEmployee ===true && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-100 bg-emerald-800 px-4 py-2 rounded-xl font-label font-semibold">
                <CheckCircle size={16} />
                <span>مسجل ضمن فريق عملك</span>
              </div>
              )}

              {isCurrentUserAdmin && isEmployee && isUnassignedEmployee === false && isMyEmployee ===false && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-100/80 px-4 py-2 rounded-xl font-label font-semibold">
                  <CheckCircle2 size={16} />
                  <span>مسجل ضمن فريق عمل</span>
                </div>
              )}

              {isCurrentUserEmployee && isManager && (
                <button
                  onClick={handleSetAsMyManager}
                  disabled={isAssigning}
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label text-xs font-bold shadow-sm hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <UserPlus size={16} />
                  <span>{isAssigning ? 'جاري التعيين...' : 'تعيين كمدير مسؤول'}</span>
                </button>
              )}
              </div>
            </div>
                {/* عرض رسالة الخطأ إن وجدت */}
              { (error||messageError !== ""  || successMessage) &&  (
                <motion.div  
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: (error||messageError !== ""  || successMessage)? 1: 0, ...(error?{x:20} :{y: 0}) }}
                transition={{ duration: 0.7, delay:0.3 }}
                 className={clsx(`
                  m-3 p-4 transition-all ease-in-out duration-300
                   delay-150 rounded-lg 
                ${(error||messageError !== ""  ) ? "bg-error-container/15 text-error border-error-container/40 " : " bg-primary-container/5 text-primary border-primary-container/40"} border-2 
                 flex items-center justify-center
                 gap-2 text-sm max-w-sm text-center
                 ${(error||messageError !== ""  || successMessage) ? '' : 'hidden'}`,
               
                )}>
                  <span className="material-symbols-outlined text-base">{(error || messageError !== '')? "error" : "check_circle"}</span>
                  <span>{error || messageError || successMessage}</span>
                </motion.div>
              )}
             
            
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
