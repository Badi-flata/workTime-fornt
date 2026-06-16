import { ReactNode } from 'react';
import { Layouts } from '@/components/layout/Layouts';
import { EmployeeInfoModal } from '@/components/ui/EmployeeInfoModal';
import { DetailedAttendanceModal } from '@/components/ui/DetailedAttendanceModal';
import { StatisticEmployeeCard } from '@/components/ui/StatistcEmployeesCard';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <Layouts>
      {children}
      <StatisticEmployeeCard/>
      <EmployeeInfoModal />
      <DetailedAttendanceModal />
    </Layouts>
  );
}
