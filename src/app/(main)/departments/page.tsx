"use client";

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Clock,
  Edit2,
  Trash2,
  Search,
  Users,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Info,
  Lock,
} from 'lucide-react';
import { useDeptShiftStore } from '@/store/useDeptShiftStore';
import { DepartmentRegistryRow } from '@/types';
import { is } from 'date-fns/locale';

export default function DepartmentsShiftsPage() {
  const {
    departments,
    departmentNames,
    shifts,
    isLoading,
    isSubmitting,
    error,
    successMessage,
    searchQuery,
    currentPage,
    itemsPerPage,
    editingDepartment,
    editingShift,
    fetchDepartments,
    fetchDepartmentNames,
    assignEmployeeToManager,
    truneToDepartmentEmployee,
    fetchShifts,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    createShift,
    updateShift,
    deleteShift,
    setSearchQuery,
    setCurrentPage,
    setEditingDepartment,
    setEditingShift,
    clearMessages,
  } = useDeptShiftStore();

  // ── Form States ──────────────────────────────────────────────────
  const [deptName, setDeptName] = useState('');
  const [deptDescription, setDeptDescription] = useState('');
  const [deptMonthlyWorkingDays, setDeptMonthlyWorkingDays] = useState<number>(22);
  const [deptWeekendDays, setDeptWeekendDays] = useState<number[]>([5, 6]);
  const [deptMonthlyHolidays, setDeptMonthlyHolidays] = useState<number>(0);
  const [deptLatePenalty, setDeptLatePenalty] = useState<number>(50);
  const [deptEarlyLeavePenalty, setDeptEarlyLeavePenalty] = useState<number>(50);
  const [deptAbsentPenalty, setDeptAbsentPenalty] = useState<number>(100);

  // ── Form Shift States ──────────────────────────────────────────────────
  const [shiftName, setShiftName] = useState('');
  const [shiftStartTime, setShiftStartTime] = useState('08:00');
  const [shiftEndTime, setShiftEndTime] = useState('16:00');
  const [shiftGraceIn, setShiftGraceIn] = useState<number>(15);
  const [shiftGraceOut, setShiftGraceOut] = useState<number>(30);
  const [shiftDeptId, setShiftDeptId] = useState('');

   // ── Form emplyee editing ──────────────────────────────────────────────────
 
  const [empId, setEmpId] = useState('');
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empSalary, setEmpSalary] = useState<number|null>(500);
  const [empJobTitle, setEmpJobTitle] = useState('');

  const emp = departments?.flatMap((emp) => emp.employees)

  const [editingEmpDepart, setEditEmpDepart] = useState<{ id?: string; name?: string; description?: string | undefined; shifts: { id: string; name: string;  }[]; }|null>(null);
  const [editingEmpShift, setEditEmpShift] = useState<{ id?: string; name?: string;   }|null>(null);
 const [statusEmpHandler,setStatusEmpHandler]=useState<"ADDING" | "TRUNNING">("TRUNNING");
  // ── Initial Fetch ────────────────────────────────────────────────
  const [shiftOrDeprt,setShiftOrDeprt]=useState<"DEPARTMENT" | "SHIFT">("DEPARTMENT");
  const [update,setUpdate]=useState(false);
  // ── custom message to proess submit  update or create  ──────────────────────────────
  const [customMessage,setCustomMessage]=useState('')

  // useEffect(()=>{
  //   console.log("seletc department employee",editingEmpDepart)
  //   console.log("seletc department shift employee",editingEmpShift)
  //   console.log("department employees",departments)
  // },[editingEmpDepart,editingEmpShift,departments])

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'department' | 'shift';
    id: string;
    name: string;
    employeeCount?: number;
  } | null>(null);

  // ── Initial Fetch ────────────────────────────────────────────────
  useEffect(() => {
    fetchDepartments();
    fetchDepartmentNames();
    fetchShifts();
  }, [fetchDepartments, fetchDepartmentNames, fetchShifts]);

  // Sync editing department to form
  useEffect(() => {
    if (editingDepartment) {
      setDeptName(editingDepartment.name);
      setDeptDescription(editingDepartment.description || '');
      setDeptMonthlyWorkingDays(editingDepartment.monthlyWorkingDays ?? 22);
      setDeptWeekendDays(editingDepartment.weekendDays && editingDepartment.weekendDays.length > 0 ? editingDepartment.weekendDays : [5, 6]);
      setDeptMonthlyHolidays(editingDepartment.monthlyHolidays ?? 0);
      setDeptLatePenalty(editingDepartment.latePenaltyAmount ?? 50);
      setDeptEarlyLeavePenalty(editingDepartment.earlyLeavePenaltyAmount ?? 50);
      setDeptAbsentPenalty(editingDepartment.absentPenaltyAmount ?? 100);
    } else {
      setDeptName('');
      setDeptDescription('');
      setDeptMonthlyWorkingDays(22);
      setDeptWeekendDays([5, 6]);
      setDeptMonthlyHolidays(0);
      setDeptLatePenalty(50);
      setDeptEarlyLeavePenalty(50);
      setDeptAbsentPenalty(100);
    }
  }, [editingDepartment]);

  // Sync editing shift to form
  useEffect(() => {
    if (editingShift) {
      setShiftName(editingShift.name);
      setShiftStartTime(editingShift.startTime);
      setShiftEndTime(editingShift.endTime);
      setShiftGraceIn(editingShift.gracePeriodMinIn ?? 15);
      setShiftGraceOut(editingShift.gracePeriodMinOut ?? 30);
      setShiftDeptId(editingShift.departmentsId || '');
    } else {
      setShiftName('');
      setShiftStartTime('08:00');
      setShiftEndTime('16:00');
      setShiftGraceIn(15);
      setShiftGraceOut(30);
      setShiftDeptId('');
    }
  }, [editingShift]);

  // Auto clear message after 5 seconds
  useEffect(() => {
    if (successMessage || error || customMessage) {
      const timer = setTimeout(() => {
        clearMessages();
        setCustomMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, clearMessages ,customMessage]);

  // ── Filtered & Paginated Registry ────────────────────────────────
  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return departments;
    const q = searchQuery.toLowerCase();
    return departments.filter( (dept) =>
        dept.name.toLowerCase().includes(q) ||
        (dept.description && dept.description.toLowerCase().includes(q)) ||
        dept.shifts.some((s) => s.name.toLowerCase().includes(q))
    );
  }, [departments, searchQuery]);

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDepartments = filteredDepartments.slice(startIndex, startIndex + itemsPerPage);

  const totalActiveShifts = useMemo(() => {
    return departments.reduce((acc, curr) => acc + (curr.shifts?.length || 0), 0);
  }, [departments]);

  // ── Handlers create and update department and shift  ─────────────────────────────────────────────────────
  const handleDepartmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) {
      setCustomMessage('الرجاء ادخال اسم القسم')
      return;
    }
    if(shiftOrDeprt !== "DEPARTMENT"){
      setCustomMessage('لإجارء عملية تحديث او اضافة القسم  يجب ان في حالة القسم ')
      return;
    }
    if (editingDepartment && update && shiftOrDeprt ==="DEPARTMENT") {
      await updateDepartment(editingDepartment.id, {
        name: deptName.trim(),
        description: deptDescription.trim() || undefined,
        monthlyWorkingDays: Number(deptMonthlyWorkingDays) || 22,
        weekendDays: deptWeekendDays,
        monthlyHolidays: Number(deptMonthlyHolidays) || 0,
        latePenaltyAmount: Number(deptLatePenalty) || 50,
        earlyLeavePenaltyAmount: Number(deptEarlyLeavePenalty) || 50,
        absentPenaltyAmount: Number(deptAbsentPenalty) || 100,
      });
    } else if (shiftOrDeprt ==="DEPARTMENT") {
      const ok = await createDepartment({
        name: deptName.trim(),
        description: deptDescription.trim() || undefined,
        monthlyWorkingDays: Number(deptMonthlyWorkingDays) || 22,
        weekendDays: deptWeekendDays,
        monthlyHolidays: Number(deptMonthlyHolidays) || 0,
        latePenaltyAmount: Number(deptLatePenalty) || 50,
        earlyLeavePenaltyAmount: Number(deptEarlyLeavePenalty) || 50,
        absentPenaltyAmount: Number(deptAbsentPenalty) || 100,
      });
      if (ok) {
        setDeptName('');
        setDeptDescription('');
        setDeptMonthlyWorkingDays(22);
        setDeptWeekendDays([5, 6]);
        setDeptMonthlyHolidays(0);
        setDeptLatePenalty(50);
        setDeptEarlyLeavePenalty(50);
        setDeptAbsentPenalty(100);
      }
    }
  };

  const handleShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftName.trim() ){
       e.preventDefault();
      setCustomMessage('الرجاء اختيار الوردية')
      return;
    } 
    if(!shiftDeptId ){
       e.preventDefault();
      setCustomMessage('الرجاء إختيار القسم')
      return;
    }

    if  (!shiftStartTime) { 
      e.preventDefault();
      setCustomMessage('الرجاء ادخال وقت البدء')
      return;
    }

    if (!shiftEndTime) {
       e.preventDefault();
      setCustomMessage('الرجاء ادخال وقت الانتهاء')
      return;
    }

    if(shiftOrDeprt !== "SHIFT"){
       e.preventDefault();
      setCustomMessage('لإجارء عملية تحديث او اضافة لوردية يجب ان تكون في حالة الوردية ')
      return;
    } 

    if (editingShift && update && shiftOrDeprt ==="SHIFT") {
      await updateShift(editingShift.id, {
        name: shiftName.trim(),
        startTime: shiftStartTime,
        endTime: shiftEndTime,
        gracePeriodMinIn: Number(shiftGraceIn),
        gracePeriodMinOut: Number(shiftGraceOut),
        departmentsId: shiftDeptId,
      });
    } else if(shiftOrDeprt ==="SHIFT") {
      const ok = await createShift({
        name: shiftName.trim(),
        startTime: shiftStartTime,
        endTime: shiftEndTime,
        gracePeriodMinIn: Number(shiftGraceIn),
        gracePeriodMinOut: Number(shiftGraceOut),
        departmentsId: shiftDeptId,
      });
      if (ok) {
        setShiftName('');
        setShiftStartTime('08:00');
        setShiftEndTime('16:00');
        setShiftGraceIn(15);
        setShiftGraceOut(30);
        setShiftDeptId('');
      }
    }
  };

  const confirmDeleteAction = async () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'department') {
      await deleteDepartment(deleteConfirm.id);
    } else {
      await deleteShift(deleteConfirm.id);
    }
    setDeleteConfirm(null);
  };

const handleAddEmpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim() ){
       e.preventDefault();
      setCustomMessage('الرجاء اختيار الموظف')
      return;
    } 
    if(!editingEmpShift || !editingEmpShift.id){
       e.preventDefault();
      setCustomMessage('الرجاء إختيار الوردية')
      return;
    }

    if  (!editingEmpDepart || !editingEmpDepart.id) { 
      e.preventDefault();
      setCustomMessage('الرجاء اختيار القسم')
      return;
    }

    if (!empEmail.trim() ) {
       e.preventDefault();
      setCustomMessage('الرجاء ادخال البريد الالكتروني')
      return;
    }

    
     const isFound = departments.find(ele => ele.employees?.some(emp => emp?.user?.email === empEmail.trim()))
     const emp= isFound?.employees?.find(emp => emp?.user?.email === empEmail.trim())
     const shift = isFound?.shifts.find(ele => ele.employees?.some(emp => (emp?.userId === emp.userId|| emp?.id === emp.id)))
     if(isFound && statusEmpHandler ==="ADDING"){
      setCustomMessage(`
         هذا الموظف موجود بالفعل في قسم:${isFound.name},
         والوردية:${shift?.name} ,
         وسمه :${emp?.user?.fullName},
         " قم تنقفل الموظف بدلاً من  ذلك"
          `)
      return;
     }
     console.log("is Found :",!!isFound)
    if (editingEmpShift && editingEmpDepart && !isFound && statusEmpHandler ==="ADDING") {
      await assignEmployeeToManager({ 
        email: empEmail.trim(),
        shiftId: editingEmpShift.id,
        departmentId: editingEmpDepart.id,
      });
    } else if(statusEmpHandler === "TRUNNING" && (editingEmpShift || shift?.id) && isFound && editingEmpDepart?.id ) {
      const ok = await truneToDepartmentEmployee(empId,{
         shiftId:editingEmpShift.id ,
        departmentId: editingEmpDepart.id,
      });
      if (ok) {
        setEmpName('');
        setEmpEmail('');
        setEmpId('');
        setEmpJobTitle('');
        setEmpSalary(null);
        setEmpPhone('');
        setEditEmpDepart(null)
        setEditEmpShift(null)
      }
    }else {
      e.preventDefault();
      setCustomMessage(' هذا الموظف غير مسجل لديك  ')
      return;
    }
    
  };
// ── departmtent and shift actions ─────────────────────────────────────────────────────

  const selectEditDepartment = (id: string) => {
    const department = paginatedDepartments.find((d) => d.id === id);
        const shift = department?.shifts.find((s) => s.id === id);
    setShiftDeptId(id)
    if (department) {
 
      setEditingDepartment(department);
    }else{
        setEditingDepartment(null);
    }
  };
 


  const selectEditShift = (id: string) => {
    const departmentShift = paginatedDepartments.find((s) => s.shifts.some((s) => s.id === id));
    const shift = departmentShift?.shifts.find((s) => s.id === id);
    if (shift && departmentShift) {
      setEditingShift(shift);
      setEditingDepartment(departmentShift)
      
    }else{
        setEditingShift(null);
    }
  };

  // ── employees actions ─────────────────────────────────────────────────────

  const selectEditEmplyee = (id: string) => {
    const employee = emp?.find((d) => d?.id === id);
    const departmentShift = departments.find((d) => d.employees?.find(e => e.id === id || e.userId === id)) || departments[0];
    const shift = departmentShift?.shifts.find((s) => s.employees?.find(e => e.id === id || e.userId === id)) || departments[0];
    const shortShift  : { id: string; name: string;}[] | [] = departmentShift?.shifts.map(e =>({ id:e.id,name:e.name})) || [];
  
    if( !employee?.user || !employee ){
      setCustomMessage("لم يتم إجاد الموظف")
      return;
  }
  if(!departmentShift){
      setCustomMessage("لم يتم إجاد القسم")
      return;
  }
    if (employee?.user && departmentShift && shift) {

      setEmpId(employee.id ||employee.userId)
      setEmpName(employee.user?.fullName)
      setEmpEmail(employee.user?.email)
      setEmpPhone(employee.user?.phone)
      setEmpJobTitle(employee.user?.jobTitle)

      setEditEmpDepart({
        id:departmentShift?.id,
        name:departmentShift?.name,
        shifts:shortShift
      });
      setEditEmpShift({
        id:shift?.id,
        name:shift?.name
      });
    }
  };


  const selectEditEmpShift = (id: string) => {
    const shift = editingEmpDepart?.shifts.find((d) => d.id === id);
    if(!shift){
      setCustomMessage("لم يتم إجاد الوردية")
      return;
    }
    setEditEmpShift({
      id:shift?.id,
      name:shift?.name
    });
  };


  const selectEditEmpDepart = (id: string) => {
    const editDepart = departments?.find((d) => d.id === id);
        const shift = editDepart?.shifts[0];
    if(!editDepart){
      setCustomMessage("لم يتم إجاد القسم")
      return;
    }
    setEditEmpShift({
      id:shift?.id,
      name:shift?.name
    });
    setEditEmpDepart(editDepart);
  };

 

  // console.log("department name:",deptName)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
      dir="rtl"
    >
      {/* ── Top Notifications ────────────────────────────────────────── */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-primary/10 border border-primary/20
             text-primary px-4 py-3 rounded-xl flex items-center
              justify-between shadow-sm"
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

        {(error || customMessage) &&(
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-error/10 border border-error/20 text-error
             px-4 py-3 rounded-xl flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2 font-label text-sm">
              <AlertCircle size={18} />
              <span>{error || customMessage}</span>
            </div>
            <button onClick={clearMessages} className="text-error hover:opacity-70">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header & KPI Statistics ──────────────────────────────────── */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary tracking-tight">
            إدارة الأقسام والورديات
          </h1>
          <p className="text-on-surface-variant mt-2 max-w-2xl text-sm md:text-base font-sans">
            تكوين الهيكل التنظيمي وتحديد جداول العمل الخاصة بالفرق بأسلوب منهجي وموثق.
          </p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          {/* Total Departments Card */}
          <div className="flex-1 md:flex-initial bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-4 shadow-sm flex items-center gap-3.5 min-w-[170px]">
            <div className="bg-primary/10 p-2.5 rounded-lg text-primary">
              <Building2 size={22} />
            </div>
            <div>
              <p className="font-label text-xs text-on-surface-variant">إجمالي الأقسام</p>
              <p className="font-heading text-2xl font-bold text-primary">
                {departments.length}
              </p>
            </div>
          </div>

          {/* Active Shifts Card */}
          <div className="flex-1 md:flex-initial bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-4 shadow-sm flex items-center gap-3.5 min-w-[170px]">
            <div className="bg-primary/10 p-2.5 rounded-lg text-primary">
              <Clock size={22} />
            </div>
            <div>
              <p className="font-label text-xs text-on-surface-variant">الورديات النشطة</p>
              <p className="font-heading text-2xl font-bold text-primary">
                {totalActiveShifts}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Layout: Forms (4 cols) & Registry (8 cols) ─────────── */}
      <div className="grid grid-cols-1 mb-15 xl:grid-cols-12 gap-8">
        
        {/* ── Left Forms Column ──────────────────────────────────────── */}
        <div className="xl:col-span-4 flex flex-col gap-8  order-2 xl:order-1">

          {/* Toggle Bar */}
           <div className="relative flex flex-col w-[95%] mx-auto rounded-[14px] border border-secondary/30
            bg-surface-container-lowest p-3 z-10  self-start   gap-2  md:w-auto">

              <h2 className=" p-2 self-center text-secondary font-label">
                  الأدوات
              </h2>
              <div  className='grid  p-2 grid-cols-2 gap-2.5' >
                <div className="flex items-center w-[180px]  bg-surface-container-low p-1.5
                  rounded-lg border border-outline-variant/30  md:w-auto justify-center">
                      <button
                        onClick={() => setShiftOrDeprt("DEPARTMENT")}
                        className={`px-6 py-1.5 rounded-md text-xs font-semibold font-label transition-all cursor-pointer ${
                          shiftOrDeprt === "DEPARTMENT"
                            ? 'bg-surface-container-lowest shadow-sm text-primary font-bold border border-outline-variant/10'
                            : 'text-on-surface-variant hover:text-primary'
                        }`}
                      >
                        قسم
                      </button>
                      <button
                        onClick={() => setShiftOrDeprt('SHIFT')}
                        className={`px-6 py-1.5 rounded-md text-xs font-semibold font-label transition-all cursor-pointer ${
                          shiftOrDeprt === 'SHIFT'
                            ? 'bg-surface-container-lowest shadow-sm text-primary font-bold border border-outline-variant/10'
                            : 'text-on-surface-variant hover:text-primary'
                        }`}
                      >
                        وردية
                      </button>
                  </div>

                <div className="flex self-center   justify-center gap-3">
              <button
                onClick={ () => {
                  setUpdate((prev)=>!prev)
                  if(shiftOrDeprt ==="DEPARTMENT"){
                    setEditingDepartment(null);
                  }else{
                    setEditingShift(null);
                  }
                } }
                className={`px-5 py-2.5 rounded-full font-label font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                  update
                    ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                    : 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {update? 'close' : 'edit'}
                </span>
                {update ? 'إلغاء التعديل' : 'تعديل البيانات'}
              </button>
                </div>

                 <div className="flex items-center w-[180px]  bg-surface-container-low p-1.5
                  rounded-lg border border-outline-variant/30  md:w-auto justify-center">
                      <button
                        onClick={() => setStatusEmpHandler("ADDING")}
                        className={`px-6 py-1.5 rounded-md text-xs font-semibold font-label transition-all cursor-pointer ${
                          statusEmpHandler === "ADDING"
                            ? 'bg-surface-container-lowest shadow-sm text-primary font-bold border border-outline-variant/10'
                            : 'text-on-surface-variant hover:text-primary'
                        }`}
                      >
                        إضافة
                      </button>
                      <button
                        onClick={() => setStatusEmpHandler("TRUNNING")}
                        className={`px-6 py-1.5 rounded-md text-xs font-semibold font-label transition-all cursor-pointer ${
                          statusEmpHandler === "TRUNNING"
                            ? 'bg-surface-container-lowest shadow-sm text-primary font-bold border border-outline-variant/10'
                            : 'text-on-surface-variant hover:text-primary'
                        }`}
                      >
                        نقل
                      </button>
                  </div>

              </div>
             </div>

          {/* Card 1: Create / Edit Department */}
         {shiftOrDeprt==="DEPARTMENT" ? (
           <div className="bg-surface-container-lowest rounded-2xl border border-primary/10 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Building2 size={20} />
                </div>
                <h2 className="font-heading text-xl font-bold text-primary">
                  { update ? 'تعديل بيانات القسم' : 'إنشاء قسم جديد'}
                </h2>
              </div>
              
            </div>

            <form onSubmit={handleDepartmentSubmit} className="flex flex-col gap-5">
              
             { update  &&(
              <div>
                <label className="block font-label text-sm text-on-surface-variant mb-1">
                  ربط بقسم <span className="text-error">*</span>
                </label>
                <select
                value={ editingDepartment !== undefined ? editingDepartment?.id:filteredDepartments[0]?.id}
                  onChange={(e) => {
                     selectEditDepartment(e.target.value);
                      }}
                  className="w-full bg-transparent border-0 border-b border-outline-variant/60 focus:border-primary focus:ring-0 px-0 py-2 text-on-surface transition-colors font-sans text-sm"
                  required
                >
                  <option className='bg-surface-container-lowest 
                   text-on-background text-sm'
                    value="" disabled>
                    اختر القسم...
                  </option>
                  {filteredDepartments.length > 0 && filteredDepartments.map((d) => (
                    <option 
                      key={d.id} value={d.id}>
                      {d.name === deptName? deptName + " (القسم الحالي)" : d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

               <div>
                <label className="block font-label text-sm text-on-surface-variant mb-1">
                  اسم القسم <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="مثال: قسم الهندسة"
                  className="w-full bg-transparent border-0 border-b border-outline-variant/60 focus:border-primary focus:ring-0 px-0 py-2 text-on-surface placeholder:text-outline/50 transition-colors font-sans text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-label text-sm text-on-surface-variant mb-1">
                  الوصف
                </label>
                <textarea
                  value={deptDescription}
                  onChange={(e) => setDeptDescription(e.target.value)}
                  placeholder="وصف موجز لدور القسم وأهدافه..."
                  rows={2}
                  className="w-full bg-transparent border-0 border-b border-outline-variant/60 focus:border-primary focus:ring-0 px-0 py-2 text-on-surface placeholder:text-outline/50 transition-colors resize-none font-sans text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-sm text-on-surface-variant mb-1">
                    أيام العمل المستهدفة شهرياً
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={deptMonthlyWorkingDays}
                    onChange={(e) => setDeptMonthlyWorkingDays(Number(e.target.value))}
                    placeholder="22"
                    className="w-full bg-transparent border-0 border-b border-outline-variant/60 focus:border-primary focus:ring-0 px-0 py-2 text-on-surface placeholder:text-outline/50 transition-colors font-sans text-sm"
                  />
                </div>
                <div>
                  <label className="block font-label text-sm text-on-surface-variant mb-1">
                    الإجازات والعطلات الشهرية (أيام)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={15}
                    value={deptMonthlyHolidays}
                    onChange={(e) => setDeptMonthlyHolidays(Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-transparent border-0 border-b border-outline-variant/60 focus:border-primary focus:ring-0 px-0 py-2 text-on-surface placeholder:text-outline/50 transition-colors font-sans text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label text-sm text-on-surface-variant mb-2">
                  أيام عطلة نهاية الأسبوع للقسم
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { day: 5, label: 'الجمعة' },
                    { day: 6, label: 'السبت' },
                    { day: 0, label: 'الأحد' },
                    { day: 1, label: 'الاثنين' },
                    { day: 2, label: 'الثلاثاء' },
                    { day: 3, label: 'الأربعاء' },
                    { day: 4, label: 'الخميس' },
                  ].map(({ day, label }) => {
                    const isSelected = deptWeekendDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => {
                          if (isSelected) {
                            setDeptWeekendDays(deptWeekendDays.filter((d) => d !== day));
                          } else {
                            setDeptWeekendDays([...deptWeekendDays, day].sort());
                          }
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-surface-container text-on-surface-variant border-outline-variant/40 hover:border-primary/50'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <label className="block font-label text-sm font-semibold text-primary mb-2">
                  قواعد الخصومات المالية للقسم (بالعملة المحلية)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-label text-xs text-on-surface-variant mb-1">
                      خصم التأخير
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={deptLatePenalty}
                      onChange={(e) => setDeptLatePenalty(Number(e.target.value))}
                      placeholder="50"
                      className="w-full bg-transparent border-0 border-b border-outline-variant/60 focus:border-primary focus:ring-0 px-0 py-1.5 text-on-surface placeholder:text-outline/50 transition-colors font-sans text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-label text-xs text-on-surface-variant mb-1">
                      خصم الخروج المبكر
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={deptEarlyLeavePenalty}
                      onChange={(e) => setDeptEarlyLeavePenalty(Number(e.target.value))}
                      placeholder="50"
                      className="w-full bg-transparent border-0 border-b border-outline-variant/60 focus:border-primary focus:ring-0 px-0 py-1.5 text-on-surface placeholder:text-outline/50 transition-colors font-sans text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-label text-xs text-on-surface-variant mb-1">
                      خصم الغياب
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={deptAbsentPenalty}
                      onChange={(e) => setDeptAbsentPenalty(Number(e.target.value))}
                      placeholder="100"
                      className="w-full bg-transparent border-0 border-b border-outline-variant/60 focus:border-primary focus:ring-0 px-0 py-1.5 text-on-surface placeholder:text-outline/50 transition-colors font-sans text-sm"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-outline mt-1.5">
                  ملاحظة: إذا تُركت القيمة 0، سيتم احتساب الخصم ديناميكياً بناءً على الراتب وساعات العمل.
                </p>
              </div>

              <div className="mt-2 text-left">
                <button
                  type="submit"
                  disabled={isSubmitting || !deptName.trim()}
                  className="bg-primary text-white px-6 py-2.5 rounded-xl font-label text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isSubmitting
                    ? 'جاري المعالجة...'
                    : update  
                    ? 'تحديث القسم'
                    : 'حفظ القسم'}
                </button>
              </div>
            </form>
          </div>
        ) :
        (
          <> {/* Card 2: Create / Edit Shift */}
          <div className="bg-surface-container-lowest rounded-2xl border border-primary/10 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Clock size={20} />
                </div>
                <h2 className="font-heading text-xl font-bold text-primary">
                  {update  ? 'تعديل بيانات الوردية' : 'إضافة وردية جديدة'}
                </h2>
              </div>
             
            </div>

            <form onSubmit={handleShiftSubmit} className="flex flex-col gap-5">
                <div>
                <label className="block font-label text-sm text-on-surface-variant mb-1">
                  ربط بقسم <span className="text-error">*</span>
                </label>
                <select
                value={ editingDepartment !== undefined ? editingDepartment?.id:filteredDepartments[0]?.id}
                  onChange={(e) => selectEditDepartment(e.target.value)}
                  className="w-full bg-transparent border-0 border-b
                  border-outline-variant/60 focus:border-primary 
                  focus:ring-0 px-0 py-2 text-on-surface transition-colors 
                  font-sans text-sm"
                  required
                >
                  <option value="" disabled>
                    اختر القسم...
                  </option>
                  {departmentNames.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name === deptName? deptName + " (القسم الحالي)" : d.name}
                    </option>
                  ))}
                </select>
              </div>

             { update  &&(
              <div>
                <label className="block font-label text-sm text-on-surface-variant mb-1">
                  ربط بالوريدية <span className="text-error">*</span>
                </label>
                <select
                  value={editingShift !== undefined ? editingShift?.id: editingDepartment === null ? "اختر القسم أولاً": "لا توجد ورديات في هذا القسم"}
                  onChange={(e) => {
                     selectEditShift(e.target.value);
                      }}
                  className="w-full bg-transparent border-0 border-b border-outline-variant/60 focus:border-primary focus:ring-0 px-0 py-2 text-on-surface transition-colors font-sans text-sm"
                  required
                >
                  <option className='bg-surface-container-lowest 
                   text-secondary text-sm'
                    value="" disabled>
                    اختر الوردية...
                  </option>
                  { 
                  editingDepartment&&
                  editingDepartment?.shifts.length > 0  ?
                  editingDepartment.shifts.map((sh) => (
                        <option 
                      key={sh.id} value={sh.id}>
                      {sh.name}
                         </option>
                    )):
                     editingDepartment !== null && editingDepartment?.shifts.length === 0||
                       filteredDepartments.flatMap(d => d.shifts.map(s => s.id)).includes(shiftDeptId) ===false ? 
                        <option value='لا توجد ورديات في هذا القسم'   className='bg-surface-container-lowest 
                      text-on-background text-sm' >
                          لا توجد ورديات في هذا القسم
                          </option>
                    :
                    <option value='اختر القسم أولاً'   className='bg-surface-container-lowest 
                   text-on-background text-sm' >اختر القسم أولاً</option>
                  }
                </select>
              </div>
            )}

              <div>
                <label className="block font-label text-sm text-on-surface-variant mb-1">
                  اسم الوردية <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={shiftName}
                  onChange={(e) => setShiftName(e.target.value)}
                  placeholder="مثال: الوردية الصباحية"
                  className="w-full bg-transparent border-0 border-b border-outline-variant/60 focus:border-primary focus:ring-0 px-0 py-2 text-on-surface placeholder:text-outline/50 transition-colors font-sans text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-sm text-on-surface-variant mb-1">
                    وقت البدء <span className="text-error">*</span>
                  </label>
                  <input
                    type="time"
                    value={shiftStartTime}
                    onChange={(e) => setShiftStartTime(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-outline-variant/60 focus:border-primary focus:ring-0 px-0 py-2 text-on-surface transition-colors font-mono text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-label text-sm text-on-surface-variant mb-1">
                    وقت الانتهاء <span className="text-error">*</span>
                  </label>
                  <input
                    type="time"
                    value={shiftEndTime}
                    onChange={(e) => setShiftEndTime(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-outline-variant/60 focus:border-primary focus:ring-0 px-0 py-2 text-on-surface transition-colors font-mono text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-sm text-on-surface-variant mb-1">
                    سماح الدخول (د)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={shiftGraceIn}
                    onChange={(e) => setShiftGraceIn(Number(e.target.value))}
                    className="w-full bg-transparent border-0 border-b border-outline-variant/60 focus:border-primary focus:ring-0 px-0 py-2 text-on-surface transition-colors font-sans text-sm"
                  />
                </div>
                <div>
                  <label className="block font-label text-sm text-on-surface-variant mb-1">
                    سماح الخروج (د)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={shiftGraceOut}
                    onChange={(e) => setShiftGraceOut(Number(e.target.value))}
                    className="w-full bg-transparent border-0 border-b border-outline-variant/60 focus:border-primary focus:ring-0 px-0 py-2 text-on-surface transition-colors font-sans text-sm"
                  />
                </div>
              </div>

           
              <div className="mt-2 text-left">
                <button
                  type="submit"
                  disabled={isSubmitting || !shiftName.trim() || !shiftDeptId}
                  className="bg-primary text-white px-6 py-2.5 rounded-xl font-label text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isSubmitting
                    ? 'جاري المعالجة...'
                    :  update
                    ? 'تحديث الوردية'
                    : 'تهيئة الوردية'}
                </button>
              </div>
            </form>
          </div> 
          </>
        )}

        {/* employees editing cords */}
         {statusEmpHandler ==="ADDING" ? (
           <div className="bg-surface-container-lowest rounded-2xl border border-primary/10 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Building2 size={20} />
                </div>
                <h2 className="font-heading text-xl font-bold text-primary">
                إضافة الموظق  
                </h2>
              </div>
              
            </div>

            <form onSubmit={handleAddEmpSubmit} className="flex flex-col gap-5">
              
            {/* select department and shift to connect with employee */}
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block font-label text-sm text-on-surface-variant mb-1">
                      ربط بالقسم <span className="text-error">*</span>
                    </label>
                    <select
                      value={editingEmpDepart?.id? editingEmpDepart?.id : "اختار القسم أولاً"}
                      onChange={(e) => {
                        selectEditEmpDepart(e.target.value);
                          }}
                      className="w-full bg-transparent border-0 border-b border-outline-variant/60 focus:border-primary focus:ring-0 px-0 py-2 text-on-surface transition-colors font-sans text-sm"
                      required
                    >
                      <option className='bg-surface-container-lowest 
                      text-secondary text-sm'
                        value="" disabled>
                        اختر الوردية...
                      </option>
                      { 
                      departmentNames &&
                      departmentNames.length > 0  ?
                      departmentNames?.map((sh) => (
                            <option 
                          key={sh.id} value={sh.id}>
                          {sh.name}
                            </option>
                        )):
                        <option value='اختر القسم أولاً'   className='bg-surface-container-lowest 
                      text-on-background text-sm' >اختر القسم أولاً</option>
                      }
                    </select>
                  </div>

                <div>
                <label className="block font-label text-sm text-on-surface-variant mb-1">
                  ربط بالوريدية <span className="text-error">*</span>
                </label>
                <select
                  value={editingShift?.id? editingShift?.id : "اختر القسم أولاً"}
                  onChange={(e) => {
                     selectEditEmpShift(e.target.value);
                      }}
                  className="w-full bg-transparent border-0 border-b border-outline-variant/60 focus:border-primary focus:ring-0 px-0 py-2 text-on-surface transition-colors font-sans text-sm"
                  required
                >
                  <option className='bg-surface-container-lowest 
                   text-secondary text-sm'
                    value="" disabled>
                    اختر الوردية...
                  </option>
                  { 
                  editingEmpDepart &&
                  editingEmpDepart?.shifts.length > 0  ?
                  editingEmpDepart.shifts.map((sh) => (
                        <option 
                      key={sh.id} value={sh.id}>
                      {sh.name}
                         </option>
                    )):
                     editingEmpDepart !== null && editingEmpDepart?.shifts.length === 0 || 
                       filteredDepartments.flatMap(d => d.shifts.map(s => s.id)).includes(shiftDeptId) === false ? 
                        <option value='لا توجد ورديات في هذا القسم' 
                          className='bg-surface-container-lowest 
                        text-on-background text-sm' >
                          لا توجد ورديات في هذا القسم
                          </option>
                    :
                    <option value='اختر القسم أولاً'   className='bg-surface-container-lowest 
                   text-on-background text-sm' >اختر القسم أولاً</option>
                  }
                </select>
              </div>
            </div>
               {/* adding employee info and to find user by his email*/}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-sm text-on-surface-variant mb-1">
                   البريد الالكتروني <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    min="0"
                    max="120"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-outline-variant/60 focus:border-primary focus:ring-0 px-0 py-2 text-on-surface transition-colors font-sans text-sm"
                  />
                </div>
             

                <div>
                <label className="block font-label text-xs text-on-surface-variant mb-1 flex items-center gap-1">
                  <span>الراتب الشهري الأساسي</span>
                  <Lock size={12} className="text-outline" />
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={empSalary !== null ? empSalary : 500}
                    onChange={(e) => setEmpSalary(Number(e.target.value))}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-2 px-3 pl-10 text-on-surface font-sans text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-sans text-outline">
                    ر.س
                  </span>
                </div>
              </div>

            </div>
              <div className="mt-2 text-left">
                <button
                  type="submit"
                  disabled={isSubmitting || !empEmail.trim()}
                  className="bg-primary text-white px-6 py-2.5 rounded-xl font-label text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isSubmitting
                    ? 'جاري المعالجة...'
                    :  'تأكيد الإضافة'
                    }
                </button>
              </div>
            </form>
          </div>
        ) :
        (
          <> {/* Card 2: Create / Edit employees */}
           <div className="bg-surface-container-lowest rounded-2xl border border-primary/10 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Building2 size={20} />
                </div>
                <h2 className="font-heading text-xl font-bold text-primary">
                   نقفل الموظف  
                </h2>
              </div>
              
            </div>

            <form onSubmit={handleAddEmpSubmit} className="flex flex-col gap-5">
              
              <div>
                <label className="block font-label text-sm text-on-surface-variant mb-1">
                   تحديد الموظف <span className="text-error">*</span>
                </label>
                <select
                value={ empId ? empId:" إختار موظف أولاً"}
                  onChange={(e) => {
                     selectEditEmplyee(e.target.value);
                    window.scrollTo({ top :0, behavior: 'smooth' });
                      }}
                  className="w-full bottom- bg-transparent border-0 border-b border-outline-variant/60 focus:border-primary focus:ring-0 px-0 py-2 text-on-surface transition-colors font-sans text-sm"
                  required
                >
                  <option className='bg-surface-container-lowest 
                   text-on-background text-sm'
                     value=" إختار موظف اوالاً"> إختار موظف اوالاً</option>
                  { emp.length > 0 && emp.flatMap(e => e?.user).length > 0  ? emp.map((d) => (
                    <option 
                      key={d?.id} value={d?.id}>
                      {d?.user?.fullName === empName? empName + " (الموظف الحالي)" : d?.user?.fullName}
                    </option>
                  )) :<option value=" مامن موظفين لديك"> مامن موظفين لديك</option>}
                </select>
              </div>

            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block font-label text-sm text-on-surface-variant mb-1">
                      ربط بالقسم <span className="text-error">*</span>
                    </label>
                    <select
                      value={editingEmpDepart?.id? editingEmpDepart?.id : "اختار القسم أولاً"}
                      onChange={(e) => {
                        selectEditEmpDepart(e.target.value);
                          }}
                      className="w-full bg-transparent border-0 border-b border-outline-variant/60 focus:border-primary focus:ring-0 px-0 py-2 text-on-surface transition-colors font-sans text-sm"
                      required
                    >
                      <option className='bg-surface-container-lowest 
                      text-secondary text-sm'
                        value="" disabled>
                        اختر الوردية...
                      </option>
                      { 
                      departmentNames &&
                      departmentNames.length > 0  ?
                      departmentNames?.map((sh) => (
                            <option 
                          key={sh.id} value={sh.id}>
                          {sh.name}
                            </option>
                        )):
                        <option value='اختر القسم أولاً'   className='bg-surface-container-lowest 
                      text-on-background text-sm' >اختر القسم أولاً</option>
                      }
                    </select>
                  </div>

                <div>
                <label className="block font-label text-sm text-on-surface-variant mb-1">
                  ربط بالوريدية <span className="text-error">*</span>
                </label>
                <select
                  value={editingEmpShift?.id? editingEmpShift?.id : "اختر القسم أولاً"}
                  onChange={(e) => {
                     selectEditEmpShift(e.target.value);
                      }}
                  className="w-full bg-transparent border-0 border-b border-outline-variant/60 focus:border-primary focus:ring-0 px-0 py-2 text-on-surface transition-colors font-sans text-sm"
                  required
                >
                  <option className='bg-surface-container-lowest 
                   text-secondary text-sm'
                    value="" disabled>
                    اختر الوردية...
                  </option>
                  { 
                  editingEmpDepart &&
                  editingEmpDepart?.shifts.length > 0  ?
                  editingEmpDepart.shifts.map((sh) => (
                        <option 
                      key={sh.id} value={sh.id}>
                      {sh.name}
                         </option>
                    )):
                     editingEmpDepart !== null && editingEmpDepart?.shifts.length === 0 || 
                       filteredDepartments.flatMap(d => d.shifts.map(s => s.id)).includes(shiftDeptId) === false ? 
                        <option value='لا توجد ورديات في هذا القسم' 
                          className='bg-surface-container-lowest 
                        text-on-background text-sm' >
                          لا توجد ورديات في هذا القسم
                          </option>
                    :
                    <option value='اختر القسم أولاً'   className='bg-surface-container-lowest 
                   text-on-background text-sm' >اختر القسم أولاً</option>
                  }
                </select>
              </div>
              </div>
 
              <div className="grid grid-cols-2 gap-4">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-sm text-on-surface-variant mb-1">
                   البريد الالكتروني 
                  </label>
                  <input
                    type="text"
                    min="0"
                    max="270"
                    value={empEmail}
                    disabled={true}
                    // onChange={(e) => setEmpEmail(e.target.value)}
                    className="w-full bg-transparent border-0 border-b
                     border-outline-variant/60 focus:border-primary 
                     focus:ring-0 px-0 py-2 text-on-surface transition-colors 
                      font-sans text-sm"
                  />
                </div>
              </div>

                <div>
                <label className="block font-label text-xs text-on-surface-variant
                 mb-1 flex items-center gap-1">
                  <span>الموسم الوظيفي</span>
                  
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={empJobTitle}
                    // onChange={(e) => setEmpSalary(Number(e.target.value))}
                    disabled={true}
                    className="w-full bg-transparent border-0 border-b
                     border-outline-variant/60 focus:border-primary 
                     focus:ring-0 px-0 py-2 text-on-surface transition-colors 
                      font-sans text-sm"
                  />
                  
                </div>
              </div>

            </div>
              <div className="mt-2 text-left">
                <button
                  type="submit"
                  disabled={isSubmitting || !empId}
                  className="bg-primary text-white px-6 py-2.5 rounded-xl font-label text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isSubmitting
                    ? 'جاري المعالجة...'
                    : 'تأكيد التحديث'
                    }
                </button>
              </div>
            </form>
          </div>
          </>
        )}
        </div>

        


        {/* ── Right Departments Registry Table Column ───────────────── */}
        <div className="xl:col-span-8 order-1 xl:order-2">
          <div className="bg-surface-container-lowest rounded-2xl border border-primary/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
            
            {/* Table Header & Search */}
            <div className="p-6 border-b border-outline-variant/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-bright/50">
              <h2 className="font-heading text-2xl text-primary font-bold flex items-center gap-2.5">
                <Layers size={24} />
                <span>سجل الأقسام</span>
              </h2>

              <div className="relative w-full sm:w-64">
                <Search
                  size={18}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline-variant"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث عن قسم أو وردية..."
                  className="w-full pl-3 pr-10 py-2 rounded-xl border border-outline-variant/30 bg-surface text-sm font-sans focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-secondary/5">
                    <th className="py-4 px-6 font-label text-xs text-on-surface-variant font-semibold border-b border-outline-variant/20">
                      اسم القسم
                    </th>
                    <th className="py-4 px-6 font-label text-xs text-on-surface-variant font-semibold border-b border-outline-variant/20">
                      الوردية المرتبطة
                    </th>
                    <th className="py-4 px-6 font-label text-xs text-on-surface-variant font-semibold border-b border-outline-variant/20">
                      ساعات العمل
                    </th>
                    <th className="py-4 px-6 font-label text-xs text-on-surface-variant font-semibold border-b border-outline-variant/20">
                      إجمالي الموظفين
                    </th>
                    <th className="py-4 px-6 font-label text-xs text-on-surface-variant font-semibold border-b border-outline-variant/20 text-center">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="text-on-surface divide-y divide-outline-variant/10">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-outline font-label text-sm">
                        جاري جلب سجل الأقسام والورديات...
                      </td>
                    </tr>
                  ) : paginatedDepartments.length > 0 ? (
                    paginatedDepartments.map((dept) => (
                      <tr
                        key={dept.id}
                        className="hover:bg-surface-container-low/50 transition-colors group"
                      >
                        {/* Department Name & Description */}
                        <td className="py-4 px-6 align-middle">
                          <div className="font-semibold text-on-surface text-sm">
                            {dept.name}
                          </div>
                          {dept.description && (
                            <div className="text-xs text-on-surface-variant/80 mt-0.5 max-w-xs truncate">
                              {dept.description}
                            </div>
                          )}
                        </td>

                        {/* Shift Badges */}
                        <td className="py-4 px-6 align-middle">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {dept.shifts.length > 0 ? (
                              dept.shifts.map((s, idx) => (
                                <span
                                  key={s.id || idx}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold font-label ${
                                    idx % 3 === 0
                                      ? 'bg-primary/10 text-primary'
                                      : idx % 3 === 1
                                      ? 'bg-secondary/10 text-secondary'
                                      : 'bg-tertiary/10 text-tertiary'
                                  }`}
                                >
                                  {s.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-outline/70 italic font-sans">
                                لا توجد ورديات
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Shift Working Hours */}
                        <td className="py-4 px-6 align-middle font-mono text-xs tabular-nums text-on-surface-variant">
                          {dept.shifts.length > 0 ? (
                            dept.shifts.map((s) => (
                              <div key={s.id} className="leading-relaxed">
                                {s.startTime} - {s.endTime}
                              </div>
                            ))
                          ) : (
                            <span className="text-outline">---</span>
                          )}
                        </td>

                        {/* Employee Count */}
                        <td className="py-4 px-6 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary font-sans text-sm tabular-nums">
                              {dept.employeeCount}
                            </span>
                            <Users size={16} className="text-outline" />
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 align-middle text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => {
                                setEditingDepartment(dept);
                                setUpdate(true);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                              title="تعديل القسم"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  type: 'department',
                                  id: dept.id,
                                  name: dept.name,
                                  employeeCount: dept.employeeCount,
                                })
                              }
                              className="p-1.5 text-error/80 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                              title="حذف القسم"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-outline font-label text-sm">
                        {searchQuery
                          ? 'لا توجد أقسام أو ورديات مطابقة لكلمات البحث.'
                          : 'لم يتم إنشاء أي أقسام بعد. يمكنك إنشاء قسمك الأول من النموذج الجانبي.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination Footer */}
            <div className="p-4 border-t border-outline-variant/10 flex justify-between items-center text-sm text-on-surface-variant bg-surface-bright/30">
              <span className="font-label text-xs">
                {filteredDepartments.length > 0
                  ? `عرض ${startIndex + 1} إلى ${Math.min(
                      startIndex + itemsPerPage,
                      filteredDepartments.length
                    )} من ${filteredDepartments.length} قسم`
                  : '0 قسم'}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-outline-variant/20
                   hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed 
                   transition-colors"
                  aria-label="السابق"
                >
                  <ChevronRight size={16} />
                </button>
                <span className="text-xs font-bold px-2 text-primary font-mono">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg border border-outline-variant/20 hover:bg-surface-container
                   disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="التالي"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ── Delete Confirmation Modal ───────────────────────────────── */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/30 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest rounded-2xl border border-outline/10 p-6 max-w-md w-full shadow-xl space-y-4"
            >
              <div className="flex items-center gap-3 text-error">
                <div className="p-2.5 rounded-full bg-error/10">
                  <AlertCircle size={24} />
                </div>
                <h3 className="font-heading text-lg font-bold">تأكيد عملية الحذف</h3>
              </div>

              <p className="font-sans text-sm text-on-surface-variant">
                هل أنت متأكد من رغبتك في حذف{' '}
                <strong className="text-on-surface">{deleteConfirm.name}</strong>؟
              </p>

              {(deleteConfirm.employeeCount ?? 0) > 0 && (
                <div className="bg-error/10 border border-error/20 p-3 rounded-xl text-xs text-error font-label flex items-start gap-2">
                  <Info size={16} className="shrink-0 mt-0.5" />
                  <span>
                    تنبيه: يحتوي هذا القسم على {deleteConfirm.employeeCount} موظف. لن
                    يسمح النظام بحذفه إلا بعد إعادة تعيين الموظفين لأقسام أخرى.
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl border border-outline-variant/40 text-on-surface-variant font-label text-sm hover:bg-surface-container transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmDeleteAction}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-error text-white font-label text-sm font-semibold hover:bg-error/90 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري الحذف...' : 'نعم، حذف'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
