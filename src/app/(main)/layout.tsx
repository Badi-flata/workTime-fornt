import { ReactNode } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EmployeeInfoModal } from '@/components/ui/EmployeeInfoModal';
import { DetailedAttendanceModal } from '@/components/ui/DetailedAttendanceModal';
import { StatisticEmployeeCard } from '@/components/ui/StatistcEmployeesCard';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout>
      {children}
      <StatisticEmployeeCard/>
      <EmployeeInfoModal />
      <DetailedAttendanceModal />
    </DashboardLayout>
  );
}
