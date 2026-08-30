import { parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { DailyBreakdownOutput } from '@/types';

export type AttendanceDay = DailyBreakdownOutput;

const SUMMARY_LABEL: Record<string, string> = {
  WEEKLY: 'ملخص الأسبوع',
  MONTHLY: 'ملخص الشهر',
};


interface ChronicleTableProps {
  /** البيانات في وضع ALL / WEEKLY / MONTHLY */
  data?: AttendanceDay[]
  activeTab:string
  periodLabel?: string;
  isLoading?: boolean;
  setTogglePage?: (direction: 'prev' | 'next', page: number) => void;
  page?: number;
  onClickTob?: (date: string) => void;
}

// ─── Component ───────────────────────────────────────────────────

export function SummaryAttendances({
  data = [],
  setTogglePage,
  isLoading,
  periodLabel = '',
  activeTab= "WEEKLY",
  page = 1,
  onClickTob,
}: ChronicleTableProps) {

 // ── divides days to pages ─────────────────────────────────────────
    const totalItems = data?.length
    const curretPage = page
    const limit = 6
    const totalPages = Math.ceil((totalItems?? 0) / limit)
    
    const Days = data?.slice((page -1)* limit, curretPage * limit)

  

  return (
   <aside className="bg-white rounded-xl p-6 editorial-border h-auto ">
          <div className=" flex flex-col my-5 items-center justify-between">
            <div className="flex flex-row w-full gap-2.5 items-center justify-between mb-2">
            <h3 className="font-headline-md text-headline-md text-primary ">
               {SUMMARY_LABEL[activeTab]}
            </h3>
             {periodLabel && (
            <div className="flex scale-[1] items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-sans font-bold text-primary">
                {periodLabel}
              </span>
            </div>
          )}
             <span className="material-symbols-outlined text-outline-variant">date_range</span>
             </div>
                        {/* buttons turu Columns */}
            {totalPages > 1 && (
            <div className="flex w-full items-center justify-self-end mt-3 mb-6 gap-2">
              
              <button
                onClick={() => setTogglePage?.('prev', page)}
                disabled={page === 1}
                className="p-1.5 rounded-md bg-surface-container-low border border-outline/10
                           hover:bg-surface-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="العرض السابق"
              >
                <ChevronRight size={16} />
              </button>
              <span className="text-sm font-bold font-label text-primary min-w-[20px] text-center">
                {page + ' / ' + totalPages}
              </span>
              <button
                onClick={() => setTogglePage?.('next', page)}
                disabled={page === totalPages}
                className="p-1.5 rounded-md bg-surface-container-low border border-outline/10
                           hover:bg-surface-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="العرض التالي"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          )}
             </div>
        <div className="relative  before:absolute before:inset-y-0 before:right-[15px] before:w-px before:bg-outline-variant/30 space-y-6">
          {(!data || data.length === 0) ? (
            <p className="text-sm text-outline text-center py-8">لا توجد سجلات حضور لهذه الفترة</p>
          ) :
         isLoading ? (
          <div className="grid grid-cols gap-6">
            {[...Array(5)].map((_, i) =>(
               <motion.div 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 ,delay:i * 0.2 }}
                  key={i}
                className="relative w-full h-30   rounded flex gap-4 pl-4">
                  <div className={`w-8 h-8 bg-surface-container-highest  rounded-full  flex items-center justify-center shrink-0 z-10 border-2 border-white`}>
                    <span className={`material-symbols-outlined  text-[60px]`}/>
                  </div>
                  <motion.div
                  whileFocus={{scale:0.9 }}
                    className="   w-[80%] h-25 my-4 border-surface-container-highest border    shadow rounded-lg p-3 ">
                    <div className="flex flex-row w-full h-20  justify-between  rounded-full  p-1">
                      <span className="font-label-md w-11 h-4 relative -top-2 bg-surface-container-highest  text-label-md  rounded text-on-surface"/>
                      <span className={`px-2 py-0.5  w-5 h-3 text-[10px] bg-surface-container-highest   rounded font-bold`}/>
                    </div>
                    <div className="w-full flex flex-row items-center gap-2 text-surface-container-highest  text-2xl -top-8.5  relative ">
                      <span className="font-body-md w-8 h-3   bg-surface-container-highest  text-label-md  rounded text-on-surface"/>|
                      <span className={`px-2 py-0.5  w-8 h-3 text-[10px] bg-surface-container-highest   rounded font-bold`}/>
                    </div>
                  </motion.div>
                </motion.div>
            ))}
          </div>
        ) 
          : (
            Days.map((day, idx: number) => {
              const dateObj = new Date(parseISO(day?.date));
              const formattedDate = dateObj.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
              
              const isPresent = day.status === 'ON_TIME' || day.status === 'LATE';
              const isAbsent = day.status === 'ABSENT';
              const isExcused = day.status === 'EXCUSED';
              const isEscaped = day.status === 'ESCAPY';

              let statusColor = 'bg-[#e6f4ea] text-[#0d652d]';
              let statusLabel = 'حاضر';
              let icon = 'check';
              let iconColor = 'text-primary';
              let bgIcon = 'bg-primary-fixed';
              const attendanceId = day?.attendanceId;

              if (isAbsent) {
                statusColor = 'bg-[#fce8e6] text-[#c5221f]';
                statusLabel = 'غائب';
                icon = 'close';
                iconColor = 'text-error';
                bgIcon = 'bg-error-container';
              } else if (day.status === 'LATE') {
                statusColor = 'bg-[#fef7e0] text-[#b06000]';
                statusLabel = 'متأخر';
                icon = 'schedule';
                iconColor = 'text-[#b06000]';
                bgIcon = 'bg-[#fef7e0]';
              } else if (isExcused) {
                statusColor = 'bg-[#e8f0fe] text-[#1a73e8]';
                statusLabel = 'معذور';
                icon = 'assignment';
                iconColor = 'text-[#1a73e8]';
                bgIcon = 'bg-[#e8f0fe]';
              } else if (isEscaped) {                       
                statusColor = 'bg-[#fce8e6] text-[#c5221f]';
                statusLabel = 'انصراف مبكر';
                icon = 'logout';
                iconColor = 'text-error';
                bgIcon = 'bg-error-container';
              }
              

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 ,delay:idx * 0.2 }}
                  key={idx}
                className="relative flex gap-4 pl-4">
                  <div className={`w-8 h-8 rounded-full ${bgIcon} flex items-center justify-center shrink-0 z-10 border-2 border-white`}>
                    <span className={`material-symbols-outlined ${iconColor} text-[16px]`}>{icon}</span>
                  </div>
                  <button
                 
                  onClick={()=> onClickTob?.(String(attendanceId))}
                  className="flex-1 transition-all duration-300 
                  focus:border-2 focus:outline-4  focus:outline-primary/10  
                  focus:border-secondary/50 focus:scale-[0.9]
                  hover:translate-x-[-2%] hover:translate-y-[-5%]
                  bg-surface-bright Affect  shadow rounded-lg p-3 ">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-label-md text-label-md text-on-surface">{formattedDate}</span>
                      <span className={`${statusColor} px-2 py-0.5 rounded text-[10px] font-bold`}>{statusLabel}</span>
                    </div>
                    {isPresent && (
                      <p className="font-body-md text-sm justify-self-start text-outline">
                        دخول: {day.checkIn} | خروج: {day.checkOut}
                      </p>
                    )}
                    {(isAbsent || isExcused) && (
                      <p className="font-body-md text-sm justify-self-start text-outline">
                        {day.excuses && day.excuses.length > 0 ? day.excuses[0]?.reason : (isExcused ? 'غياب بعذور' : 'غياب بدون عذر')}
                      </p>
                    )}
                    {isEscaped && (
                      <p className="font-body-md text-sm justify-self-start text-outline">
                        خرج مبكراً: {day.earlyLeaveMinutes || '--'} دقيقة
                      </p>
                    )}
                  </button>
                </motion.div>
              );
            })
          )}
        </div>
        </aside>
  );
}
