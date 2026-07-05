import { create } from 'zustand';
import {API} from '@/services/apiClient'
import { format } from 'date-fns';
import { AxiosError } from 'axios';
import { Modes } from '@/types/dashboard-registry.types';



interface attendance { 
  employeeId?:string;
    shifId: string;
     checkIn: string;
      notes?:string;
       excused?:{type:"LATE"|"ABSENT",reason:string} 
    }

interface departure{ 
    employeeId?:string;
    attendId:string; 
    shifId: string;
    checkOut: Date;
    notes?:string;
    excused?:{type:"EARLY_DEPARTURE"|"ABSENT",
    reason:string}|null
 }

interface Matercis{
  periodLabel?:string
  dalyMate?:{
    totalWorkHours:number
    lateMinutes?:number
    earlyLeaveMinutes?:number
  },
  periodSummary?:{
    totalDays: number|0;
    presentDays: number|0;
    onTimeDays: number|0;
    lateDays: number|0;
    absentDays: number|0;
    excusedDays: number|0;
    escapedDays: number|0;
    earlyDepartureDays: number|0;
    deductionDays: number|0;
    totalDeductions: number|0;
    totalWorkedMinutes: number|0;
    totalWorkedHours: number|0;
    totalDelayMinutes: number|0;
    totalEarlyLeaveMinutes: number|0;
  }
  days?: { date: string; status: string; checkIn: string | null; checkOut: string | null; excuseNotes: string | null; earlyLeaveMinutes?: number }[]
}

interface excuse{
  type:"LATE"|"ABSENT"|"EARLY_DEPARTURE"
  reason:string
}

interface PeriodParams {
  dateAnchor?: string;
  mode: Modes;
  employeeId?:string
}

interface mainSourceData{
name:string;
managerName:string
departmentName:string
shiftdata:{
    shiftId:string
    name:string
    startTime:string
    endTime:string
    gracePeriodMinIn:number
    gracePeriodMinOut:number
}|null  
}

interface CheckValue{
  id?:string;

  checkIn?:string;
  checkOut?:string;
  notes?:string;
  status?:string
   excused?:excuse[]|null,
}

export interface checkAttendState {
  mainSourceData:mainSourceData|null
  checkValue:CheckValue|null
  matercis:Matercis | null;
  message?:string
  activeTab: Modes;
  dateAnchor: string;

  currentPage:number;

  isLoading :boolean
  error:string | null
  employeeIds?: string[]

  setTogglePage:(type:string,page:number) => void;
  setEmployeeIds: (ids: string[]) => void;
  setActiveTab:  (tab: Modes) => void;
    setDateAnchor: (date: string) => void;

  CheckIn: (att:attendance) => Promise<void>;
  CheckOut: (depar:departure) => Promise<void>;
  fetchSourceData: (employeeId?:string ,date?:string) => Promise<void>;
  PeriodSummary: (input:PeriodParams) => Promise<void>;
  applyDay: (datt: {
    id?: string;
    name?: string;
    managerName?: string;
    departmentName?: string;
    shiftId?: string;
    shiftName?: string;
    shiftStart?: string;
    shiftEnd?: string;
    graceIn?: number;
    graceOut?: number;
    checkIn?: string | null;
    checkOut?: string | null;
    notes?: string | null;
    status?: string;
    excuses?: excuse[];
    totalWorkedHours?: number;
    earlyLeaveMinutes?: number;
    lateMinutes?: number;
  }) => void
}

export const useCheckAttendStore = create<checkAttendState>((set, get) => ({
  mainSourceData:null,
  checkValue:null,
  matercis:null,
  activeTab:'WEEKLY',
  currentPage:1,
  message:'',
   dateAnchor: "",
   employeeIds:[],
  error:null,
  isLoading:false,

  setEmployeeIds: (ids) => set({ employeeIds: ids }),
  setDateAnchor: (date) => set({ dateAnchor: date }),

  setActiveTab: (tab) =>
    set({
      activeTab: tab,
    }),
      setTogglePage: (direction, current) =>
    set( ({
      currentPage: 
         direction === 'next' ? current + 1 : Math.max(1, current - 1),
     
    })),

  CheckIn:  async (att) => {
    set({isLoading:true ,error:null})
    try{
       const { data:{Message , data}}  = await API.attendance.checkIn(att)
       const {excuses} = data
       set({
       
        message:Message,
        checkValue:{
          id:data.id,
          checkIn:format(att.checkIn,'HH:mm'),
          notes:data.notes,
          status:data.status,
          excused: excuses ? [...excuses] : [],
        },
        isLoading: false
       });
    }catch(err:unknown){
      let message = 'فشل في تسجيل الحضور ';
            if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          message = 'غير مصرّح: يجب تسجيل الدخول أولاً بحساب موظف (EMPLOYEE)';
        } else if (err.response?.status === 403) {
          message = 'ممنوع: لا تملك صلاحية الوصول لهذه البيانات';
        } else if (err.code === 'ERR_NETWORK') {
          message = 'لا يمكن الاتصال بالخادم — تأكد من تشغيل الباك-إند على المنفذ 3030';
        } else {
          message = err.response?.data?.systemMessage || err.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({error:message,isLoading:false})
    }
   
  },

 CheckOut:  async (depar) => {
    set({isLoading:true ,error:null})
    try{
        const { data:{ data }}  = await API.attendance.checkOut(depar) 
       const {excuses} = data
       set((state) => ({
         checkValue: {
           ...state.checkValue,
           checkOut: format(depar.checkOut,'HH:mm'),
           notes: data.employeeNote || data.notes || '',
           status: data.status, 
           excused: excuses ? [...excuses] : state.checkValue?.excused || [],
         },
         matercis: {
           ...state.matercis,
           dalyMate: {
             totalWorkHours: data.totalWorkedHours ?? 0,
             lateMinutes: data.lateMinutes ?? 0,
             earlyLeaveMinutes: data.earlyLeaveMinutes ?? 0,
           }
         },
         isLoading: false
       }));
    }catch(err:unknown){
     let message ="فشل في تسجيل الانصراف "
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          message = 'غير مصرّح: يجب تسجيل الدخول أولاً بحساب مدير (SUPER_ADMIN)';
        } else if (err.response?.status === 403) {
          message = 'ممنوع: لا تملك صلاحية الوصول لهذه البيانات';
        } else if (err.code === 'ERR_NETWORK') {
          message = 'لا يمكن الاتصال بالخادم — تأكد من تشغيل الباك-إند على المنفذ 3030';
        } else {
          message = err.response?.data?.message || err.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({error:message,isLoading:false})
    }
   
  },
  
  fetchSourceData:  async (employeeId ,date) => {
    set({isLoading:true ,error:null})
    try{

       const  repsonse  = await API.attendance.fetchSourceData({employeeId ,date}) 
       const {data , message}=repsonse.data
       const {CheckValue} = data
       if(!data) {
         set({error:"لم يتم العثور على بيانات الوردية",isLoading:false});
         return;
       }

       set({
         message: message,
        mainSourceData:{
          name: data.name,
          managerName: data.managerName,
          departmentName: data.departmentName,
          shiftdata: data.shift || null,
        },
     ...( CheckValue&& { checkValue:{
    id: CheckValue.id,
    checkIn: CheckValue.checkIn,
    checkOut:CheckValue.checkOut ,
    notes: CheckValue.notes,
    status: CheckValue.status,
    excused: CheckValue.excuses
  } }),

   ...(CheckValue && {matercis: {
    dalyMate:{
      totalWorkHours: CheckValue.totalWorkedHours,
      lateMinutes: CheckValue.lateMinutes,
      earlyLeaveMinutes: CheckValue.earlyLeaveMinutes,
    } 
  }}),
        isLoading: false
       });
const {mainSourceData,checkValue,matercis} = get()
       if(mainSourceData !== null){
    window.localStorage.removeItem("sourceData")
    window.localStorage.setItem("sourceData",JSON.stringify(mainSourceData))
    }
    window.localStorage.removeItem("checkValue")
    if(checkValue !== null){
    window.localStorage.setItem("checkValue",JSON.stringify(checkValue))
    }
    if(matercis !== null && matercis.dalyMate !== undefined){
      window.localStorage.removeItem("dalyMate")
      window.localStorage.setItem("dalyMate",JSON.stringify(matercis?.dalyMate))
    }
    }catch(err:unknown){
      let message = 'فشل في جلب  البيانات الاولية لسجيل الاتحضير';
            if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          message = 'غير مصرّح: يجب تسجيل الدخول أولاً بحساب موظف (EMPLOYEE)';
        } else if (err.response?.status === 403) {
          message = 'ممنوع: لا تملك صلاحية الوصول لهذه البيانات';
        } else if (err.code === 'ERR_NETWORK') {
          message = 'لا يمكن الاتصال بالخادم — تأكد من تشغيل الباك-إند على المنفذ 3030';
        } else {
          message = err.response?.data?.message || err.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({error:message,isLoading:false})
    }
   
  },

  PeriodSummary: async (input) => {
     set({isLoading:true ,error:null})
    try{
       const repsonse  = await API.attendance.getPeriodReport(input) 
       if(!repsonse)set({error:"لم يتم العثور على بيانات الوردية",isLoading:false});

       if(input.mode=== "DAILY"){
       const data = repsonse.data
       const excuses = data.excuses || []
       // DAILY response is raw attendance record — does NOT contain employee/shift metadata.
       // Only update checkValue and matercis, preserve mainSourceData from fetchSourceData.
       set({
       checkValue:{
        id:data.id,
        checkIn:data.checkIn,
        checkOut:data.checkOut,
        notes:data.employeeNote || data.notes || '',
        status:data.status,
        excused:[...excuses],
       },

       matercis:{
        dalyMate:{
          totalWorkHours:data.totalWorkedHours || 0,
          earlyLeaveMinutes:data.earlyLeaveMinutes || 0,
          lateMinutes:data.lateMinutes || 0
        }
       },
       isLoading: false
       })
      }else{
                
       const { periodLabel, records, summary}  =  repsonse.data
       set({
          matercis:{
            periodLabel,
            periodSummary:{...summary},
            days: records ? [...records] : []
          },
          isLoading: false
         });
         }
    }catch(err:unknown){
      let message = 'فشل في جلب  سجلات الحضور والانصراف  ';
            if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          message = 'غير مصرّح: يجب تسجيل الدخول أولاً بحساب موظف (EMPLOYEE)';
        } else if (err.response?.status === 403) {
          message = 'ممنوع: لا تملك صلاحية الوصول لهذه البيانات';
        } else if (err.code === 'ERR_NETWORK') {
          message = 'لا يمكن الاتصال بالخادم — تأكد من تشغيل الباك-إند على المنفذ 3030';
        } else {
          message = err.response?.data?.message || err.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({error:message,isLoading:false})
    }
   
  },

  applyDay:  (data)=>{
    set({isLoading:true, error:null,})
    try{

       if(!data)set({error:"لم يتم العثور على بيانات الوردية",isLoading:false});
       const {excuses} = data
        set({
         mainSourceData:{
         name:data.name || '',
         managerName:data.managerName || '',
         departmentName:data.departmentName || '',
         shiftdata:{
           shiftId:data.shiftId || '',
           name:data.shiftName || '',
           startTime:data.shiftStart || '',
           endTime:data.shiftEnd || '',
           gracePeriodMinIn:data.graceIn || 0,
           gracePeriodMinOut:data.graceOut || 0,
         }
        },
        checkValue:{
         id:data.id || undefined,
         checkIn:data.checkIn || undefined,
         checkOut:data.checkOut || undefined,
         notes:data.notes || undefined,
         status:data.status || 'ABSENT',
         excused: excuses ? [...excuses] : undefined,
        },

        matercis:{
         dalyMate:{
           totalWorkHours:data.totalWorkedHours || 0,
           earlyLeaveMinutes:data.earlyLeaveMinutes || 0,
           lateMinutes:data.lateMinutes || 0
         }
        },
        isLoading: false
        });


    }catch(err:unknown){
      let message = 'فشل في جلب  البيانات الاولية لسجيل الاتحضير';
            if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          message = 'غير مصرّح: يجب تسجيل الدخول أولاً بحساب موظف (EMPLOYEE)';
        } else if (err.response?.status === 403) {
          message = 'ممنوع: لا تملك صلاحية الوصول لهذه البيانات';
        } else if (err.code === 'ERR_NETWORK') {
          message = 'لا يمكن الاتصال بالخادم — تأكد من تشغيل الباك-إند على المنفذ 3030';
        } else {
          message = err.response?.data?.message || err.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({error:message,isLoading:false})
    }
   
  }
}));

