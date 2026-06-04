import { PaginationMeta , RegistryEntry , Modes , DisciplineRating , StatusFilter} from '@/types/dashboard-registry.types';
import { create } from 'zustand';

interface DashboardUIState {
  // Modals state
  isEmployeeInfoModalOpen: boolean;
  isDetailedAttendanceModalOpen: boolean;
  
  // Selected Data for Modals
  selectedEmployee: RegistryEntry | null;

  // Pagination 
  Pagination:PaginationMeta

  turnColumns:number;
  
  //Search
  searchQuery: string;
  // mode query
  activeTab:Modes;
  // date query
  dateAnchor: string;
  customStartDate: string;
  customEndDate: string;
  //Filter
  statusDiscipline: DisciplineRating;
  statusFilter:StatusFilter;
  dataFilter: RegistryEntry[]

  // Actions
  openEmployeeModal: (Data: RegistryEntry) => void;
  openDetailedAttendanceModal: (data: RegistryEntry) => void;
  closeModals: () => void;
  // Search Actions
  setSearchQuery: (query: string) => void;
  //date query
  setActiveTab: (tab:Modes) => void;
  setDateAnchor: (dateAnchor: string) => void;
  setCustomDate: (dateType: 'start'| 'end', date: string) => void;
  //Filter
  setStatusDiscipline: (status:DisciplineRating) => void;
  setStatusFilter: (status:StatusFilter) => void;
  setDataFilter: (data:RegistryEntry[], mode:Modes, statusFil?:StatusFilter , statusDiscip?: DisciplineRating) => void ;
  // Pagination
    setPagination: (pagination: PaginationMeta) => void;
  setCurrentPage:( actType:'next' | 'poved' , page:number) => void
  setTurnColumns:( actType:'next' | 'poved' , currentColumn:number) => void
}

export const useDashboardUIStore = create<DashboardUIState>((set) => ({
  isEmployeeInfoModalOpen: false,
  isDetailedAttendanceModalOpen: false,
  selectedEmployee: null,
  // Pagination
  Pagination:{page:1,limit:10,totalItems:10 ,totalPages:1},
  turnColumns:1,
  //Search 
  searchQuery: '',
  // mode query
  activeTab: 'ALL',
  // data query
  dateAnchor: '',
  customStartDate: '',
  customEndDate: '',
  //Filter
  statusFilter: 'ALL',
  statusDiscipline: 'ALL',
  dataFilter:[],


  openEmployeeModal: (Data) => set({ isEmployeeInfoModalOpen: true, selectedEmployee: Data }),
  openDetailedAttendanceModal: (data) => set({ isDetailedAttendanceModalOpen: true, selectedEmployee: data }),
  closeModals: () => set({ 
    isEmployeeInfoModalOpen: false, 
    isDetailedAttendanceModalOpen: false, 
    selectedEmployee: null 
  }),
   //Pagination
   setPagination: (pagination: PaginationMeta) => set({ Pagination: pagination }),
     setCurrentPage: 
     (type , page ) =>  { 
     page = type === "next" ? page + 1 : page - 1
     set(({Pagination})=>({Pagination:{...Pagination,page}}))
             },
       setTurnColumns:
    (type ,currentColumn) => {
      currentColumn = type === "next" ? currentColumn + 1 :  currentColumn - 1
     set({turnColumns:currentColumn })
    },
  // Filter & Search Actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setDateAnchor: (dateAnchor) => set({ dateAnchor }),
  setCustomDate: (dateType, date) => set({ [dateType === 'start' ? 'customStartDate' : 'customEndDate']: date }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setStatusDiscipline: (status) => set({ statusDiscipline: status }),
  setDataFilter: (data,mod,statusFil,statusDiscip) => {
    let dataFil : any[] = []
    let dailyFilter: any[] = data
     if(mod !== 'ALL'){
  if(statusFil && statusFil !== 'ALL' && mod === 'DAILY'){
    for ( const item of data){
      const att = item.dailyBreakdown
       if(att && att[0].status === statusFil){
        //
       for(const dayFil of att){
       if(dayFil.status == statusFil){
        dailyFilter.push(dayFil)
      }}
      dataFil.push({
       employeeId:item.employeeId,
       name:item.name,
       role:item.role,
       avatar:item.avatar,
       disciplineRating:item.disciplineRating,
       summary:item.summary,
       dailyBreakdown: dailyFilter
      })
}
    }
  }else if(statusDiscip && statusDiscip !== 'ALL'){
    for ( const item of data){
      const att = item
       if(att && att.disciplineRating === statusDiscip){
        //
      dataFil.push({
       employeeId:item.employeeId,
       name:item.name,
       role:item.role,
       avatar:item.avatar,
       disciplineRating:item.disciplineRating,
       summary:item.summary,
       dailyBreakdown: item.dailyBreakdown
      })
    }
  }
  } 
 }else{
    dataFil = data ||[]
  }
 set({dataFilter:dataFil})
  }
}));
