import { ReactNode } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EmployeeInfoModal } from '@/components/ui/EmployeeInfoModal';
import { DetailedAttendanceModal } from '@/components/ui/DetailedAttendanceModal';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout>
      {children}
      <EmployeeInfoModal />
      <DetailedAttendanceModal />
    </DashboardLayout>
  );
}
