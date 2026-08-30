import { EmployeeProfileOutput as Employee } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Search } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";

  interface input{
    setZomOutZomOnLestBar:(status:boolean)=>void;
    setFilter:(fil:'ALL' | 'PRESENT' | 'LATE' | 'EXCUSED' | 'DEDUCTED') => void;
    setSidebarPage?:(page:any)=> void;
    setQuery?:(que:string)=>void;
    applyEmployee:(id:string)=> void;

    zomOutZomOnLestBar:boolean;
    Query?:string;
    Employees:Employee[]

    totalSidebarPages:number;
    sidebarPage:number;
    currentUserId?:string;

    isLoading:boolean;

  }
export function EmployeesLest ({setFilter,setQuery ,setSidebarPage,
                          setZomOutZomOnLestBar, applyEmployee,
                          Employees, Query, zomOutZomOnLestBar,
                          totalSidebarPages, sidebarPage ,isLoading,
                          currentUserId
}                        :input) {



  return (
          <aside className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20 h-auto shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col">
            
            {/* Card Header Row */}
            <div className="flex justify-between items-center bg-surface-container/5 pb-3 border-b border-outline-variant/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">group</span>
                <h3 className="font-headline text-[18px] text-primary font-bold">موظفوك التابعين</h3>
              </div>
              <button
                onClick={() => setZomOutZomOnLestBar(!zomOutZomOnLestBar)}
                className="p-1.5 rounded-md hover:bg-surface-container-low text-primary transition-colors cursor-pointer flex items-center justify-center border border-outline-variant/20 bg-white"
                title={zomOutZomOnLestBar ? "تقليص القائمة" : "توسيع القائمة"}
              >
                {zomOutZomOnLestBar ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            {/* Vertically Collapsible/Expandable Content Box */}
            <AnimatePresence initial={false}>
              {zomOutZomOnLestBar && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden flex flex-col"
                >
                  {/* Local Search input */}
                  <div className="py-3 border-b border-outline-variant/10">
                    <div className="relative">
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-outline/50">
                        <Search size={16} />
                      </span>
                      <input
                        type="text"
                        placeholder="بحث بالاسم..."
                        value={Query}
                        onChange={(e) => {
                          setQuery?.(e.target.value);
                          setSidebarPage?.(1);
                        }}
                        className="w-full pr-9 pl-3 py-1.5 bg-surface-container-low border-b border-outline/30 focus:border-primary focus:outline-none text-sm text-on-surface transition-colors placeholder:text-outline/50"
                      />
                    </div>
                  </div>

                  {/* Subordinates list structured like a vertical timeline */}
                  <div className="py-5 space-y-6 relative">
                    {/* Vertical timeline line */}
                    <div className="absolute inset-y-0 right-[15px] w-px bg-outline-variant/30 pointer-events-none" />

                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <div className="w-6 h-6 border-2 border-outline-variant border-t-primary rounded-full animate-spin" />
                        <span className="text-xs text-outline font-label">جاري التحميل...</span>
                      </div>
                    ) : Employees.length > 0 ? (
                      Employees.map((emp) => {
                        const isSelected = currentUserId === emp.userId;
                        return (
                          <div key={emp.userId} className="relative flex gap-4 pl-1">
                            {/* Timeline node */}
                            <UserAvatar
                              src={emp.user?.imageProfile}
                              name={emp.user?.fullName}
                              size={32}
                              className={`z-10 border-2 border-white shadow-sm font-bold text-xs ${
                                isSelected ? 'ring-2 ring-primary' : ''
                              }`}
                            />

                            {/* Timeline Card (Summary Style) */}
                            <button
                              onClick={() => {
                                applyEmployee(emp.userId);
                                setFilter('ALL'); // Reset metrics filter on swap
                              }}
                              className={`flex-1 text-right transition-all duration-300 rounded-lg p-3 shadow-sm border border-outline-variant/10 cursor-pointer ${
                                isSelected 
                                  ? 'bg-primary text-white shadow-md scale-[1.02]' 
                                  : 'bg-surface-bright hover:bg-surface-container-low text-on-surface-variant'
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className={`font-semibold text-sm truncate ${isSelected ? 'text-white' : 'text-on-surface'}`}>
                                  {emp.user?.fullName || 'موظف'}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                                }`}>
                                  {emp.shift?.department?.name || 'موظف'}
                                </span>
                              </div>
                              <p className={`text-xs truncate ${isSelected ? 'text-white/80' : 'text-outline'}`}>
                                {emp.user?.jobTitle || 'لا يوجد منصب'}
                              </p>
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-10 text-outline text-xs font-label">
                        لا يوجد موظفون مطابقون
                      </div>
                    )}
                  </div>

                  {/* Timeline Pagination controls */}
                  {totalSidebarPages > 1 && (
                    <div className="p-3 border-t border-outline-variant/10 flex justify-between items-center bg-surface-container/5 font-label">
                      <button
                        onClick={() => setSidebarPage?.((p:any) => Math.max(p - 1, 1))}
                        disabled={sidebarPage === 1}
                        className="p-1.5 rounded-md bg-surface-container-low border border-outline/10 hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-primary"
                      >
                        <ChevronRight size={16} />
                      </button>
                      <span className="text-xs font-bold text-primary">
                        {sidebarPage} / {totalSidebarPages}
                      </span>
                      <button
                        onClick={() => setSidebarPage?.((p:any) => Math.min(p + 1, totalSidebarPages))}
                        disabled={sidebarPage === totalSidebarPages}
                        className="p-1.5 rounded-md bg-surface-container-low border border-outline/10 hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-primary"
                      >
                        <ChevronLeft size={16} />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </aside>
        )
    }