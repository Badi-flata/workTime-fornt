"use client";

import React, { useEffect, useRef } from 'react';
import {
  AttendanceLockStatus,
  ShiftDefinition,
  ShiftPhase,
  computeAttendanceLockStatus,
} from '@/utils/shiftTimingEngine';
import { todayReport } from '@/types/demoAttendance.types';

export interface ShiftCountdownProps {
  shift?: ShiftDefinition | null;
  currentTime?: Date;
  dateAnchor?: string;
  hasCheckedIn?: boolean;
  hasCheckedOut?: boolean;
  attendanceStatus?: string;
  lockStatus?: AttendanceLockStatus;
  onPhaseChange?: (newPhase: ShiftPhase, phaseLabel: string) => void;
  // Legacy optional props for backwards compatibility
  shiftStartTime?: string;
  shiftEndTime?: string;
  gracePeriodMinIn?: number;
  gracePeriodMinOut?: number;
  periodOfTime?: string;
  workTimNear?: (near: boolean) => void;
  shiftEnded?: (shiftEnded: boolean) => void;
  garceOut?: (garOut: boolean) => void;
  todayReport: todayReport |null;
}

export function ShiftCountdown({
  shift,
  currentTime,
  dateAnchor,
  hasCheckedIn = false,
  hasCheckedOut = false,
  attendanceStatus,
  lockStatus: passedLockStatus,
  todayReport,
  onPhaseChange,
}: ShiftCountdownProps) {
  const now = currentTime || new Date();
  const dateStr = dateAnchor || new Date().toISOString().split('T')[0];

  // If lockStatus not provided directly, compute it
  const lockStatus: AttendanceLockStatus =
    passedLockStatus ||
    computeAttendanceLockStatus({
      currentTime: now,
      dateAnchor: dateStr,
      shift: shift || null,
      hasCheckedIn,
      hasCheckedOut,
      status: attendanceStatus,
      todayReport
    });

  // Track phase change to notify parent
  const prevPhaseRef = useRef<ShiftPhase | null>(null);
  useEffect(() => {
    if (prevPhaseRef.current && prevPhaseRef.current !== lockStatus.phase) {
      onPhaseChange?.(lockStatus.phase, lockStatus.phaseLabel);
    }
    prevPhaseRef.current = lockStatus.phase;
  }, [lockStatus.phase, lockStatus.phaseLabel, onPhaseChange]);

  // Handle Static / Non-Active phases
  if (lockStatus.phase === 'PAST_REPORT') {
    return (
      <div className="flex flex-col items-center justify-center w-64 h-64 mb-8 rounded-full bg-surface-container-low border border-outline-variant/30 relative shadow-sm">
        <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-outline text-[32px]">history</span>
        </div>
        <p className="font-label-lg text-[#5f6368] font-bold">سجل حضور قديم</p>
        <p className="text-[11px] text-outline mt-1 font-sans text-center px-4">
          عرض أرشيف اليوم السابق
        </p>
      </div>
    );
  }
  if (lockStatus.phase === "TODAY_IS_CHECKED_IN_OFFICIAL_SHIFT") {
    return (
      <div className="flex flex-col items-center justify-center w-64 h-64 mb-8 rounded-full bg-surface-container-low border border-outline-variant/30 relative shadow-sm">
        <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-red-700  text-[32px]">back_hand</span>
        </div>
        <p className="font-label-lg  text-center p-2 text-error font-bold">{lockStatus.phaseLabel}</p>
        <p className="text-[11px] text-orange-500 text-center  font-sans m-2 px-4">
         {lockStatus.checkIn.reason}
        </p>
      </div>
    );
  }

  if (lockStatus.phase === 'FUTURE_REPORT') {
    return (
      <div className="flex flex-col items-center justify-center w-64 h-64 mb-8 rounded-full bg-surface-container-low border border-outline-variant/30 relative shadow-sm">
        <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-outline text-[32px]">calendar_month</span>
        </div>
        <p className="font-label-lg text-[#5f6368] font-bold">تاريخ مستقبلي</p>
        <p className="text-[11px] text-outline mt-1 font-sans text-center px-4">
          لا يمكن تسجيل حضور لتاريخ لاحق
        </p>
      </div>
    );
  }

  if (lockStatus.phase === 'NO_SHIFT') {
    return (
      <div className="flex flex-col items-center justify-center w-64 h-64 mb-8 rounded-full bg-error-container/10 border border-error/20 relative shadow-sm">
        <div className="w-16 h-16 rounded-full bg-error-container/30 flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-error text-[32px]">block</span>
        </div>
        <p className="font-label-lg text-error font-bold">لا توجد وردية معينة</p>
        <p className="text-[11px] text-outline mt-1 font-sans text-center px-4">
          يرجى التواصل مع مدير النظام
        </p>
      </div>
    );
  }

  if (lockStatus.phase === 'SHIFT_ENDED') {
    return (
      <div className="flex flex-col items-center justify-center w-64 h-64 mb-8 rounded-full bg-[#f1f8f4] border border-[#34a853]/30 relative shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#e6f4ea] flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-[#0d652d] text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            event_available
          </span>
        </div>
        <p className="font-label-lg text-[#0d652d] font-bold">انتهت وردية اليوم</p>
        <p className="text-[11px] text-outline mt-1 font-sans text-center px-4">
          اكتملت جميع فترات العمل لهذا اليوم
        </p>
      </div>
    );
  }

  if (lockStatus.phase === 'OFF_WORK_BEFORE') {
    const remainingMs = Math.max(0, lockStatus.remainingMs);
    const totalSeconds = Math.floor(remainingMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    return (
      <div className="flex flex-col items-center justify-center w-64 h-64 mb-8 rounded-full bg-surface-container-low border border-outline-variant/30 relative shadow-sm">
        <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-outline text-[32px]">nights_stay</span>
        </div>
        <p className="font-label-lg text-[#5f6368] font-bold">خارج أوقات العمل</p>
        {remainingMs > 0 ? (
          <>
            <div className="font-display-md text-display-md font-bold font-sans tracking-tight text-[#5f6368] mt-1">
              {formatted}
            </div>
            <p className="text-[11px] text-outline mt-0.5 font-label">حتى بدء التحضير للدوام</p>
          </>
        ) : (
          <p className="text-[11px] text-outline mt-1 font-sans text-center px-4">
            يبدأ التحضير قريباً
          </p>
        )}
      </div>
    );
  }

  // Active Counting Phase: PREPARATION | GRACE_IN | SHIFT_WORK | GRACE_OUT
  const remainingMs = Math.max(0, lockStatus.remainingMs);
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const formattedCountdown = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Progress logic
  const progressRatio = lockStatus.totalDurationMs > 0 ? remainingMs / lockStatus.totalDurationMs : 0;
  const strokeDasharray = 283; // 2 * PI * r (r = 45) => ~282.7
  const strokeDashoffset = strokeDasharray * (1 - Math.max(0, Math.min(1, progressRatio)));

  return (
    <div className="relative flex items-center justify-center w-64 h-64 mb-8">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background Track */}
        <circle
          className="text-surface-container-high"
          cx="50"
          cy="50"
          fill="transparent"
          r="45"
          stroke="currentColor"
          strokeWidth="3.5"
        />
        {/* Dynamic Shrinking Circle Arc */}
        <circle
          className="transition-all duration-1000 ease-linear"
          cx="50"
          cy="50"
          fill="transparent"
          r="45"
          stroke={lockStatus.phaseColor}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          strokeWidth="3.5"
        />
      </svg>

      {/* Internal Content */}
      <div className="flex flex-col items-center z-10 text-center px-4">
        <span
          className="px-3 py-1 rounded-full text-[11px] font-bold mb-2 transition-all duration-300 shadow-sm"
          style={{ backgroundColor: lockStatus.phaseBgColor, color: lockStatus.phaseColor }}
        >
          {lockStatus.phaseLabel}
        </span>
        <div
          className="font-display-lg text-display-lg font-bold font-sans tracking-tight"
          style={{ color: lockStatus.phaseColor }}
        >
          {formattedCountdown}
        </div>
        <p className="text-[11px] text-outline mt-1 font-label">الوقت المتبقي</p>
      </div>
    </div>
  );
}
