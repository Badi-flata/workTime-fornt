"use client";

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen bg-surface overflow-hidden" dir="rtl">
      <Topbar />
      <div className=" overflow-hidden  flex flex-row min-w-0">
        <Sidebar />
        <div className='flex flex-col flex-1 h-screen overflow-y-auto '>
        <main className=" bg-sky-50/20 overflow-y-auto p-6">
          <div className="">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </div>
        </main>
        </div>
      </div>
    </div>
  );
}
