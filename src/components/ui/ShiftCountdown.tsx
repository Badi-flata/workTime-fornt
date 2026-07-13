"use client";

import { format } from 'date-fns';
import React, { useState, useEffect } from 'react';

interface ShiftCountdownProps {
  shiftStartTime?: string;     // e.g., "08:00"
  shiftEndTime?: string;       // e.g., "17:00"
  gracePeriodMinIn?: number;    // e.g., 15
  gracePeriodMinOut?: number;   // e.g., 30
  periodOfTime?:string;
 workTimNear?:(near:boolean)=>void
 shiftEnded?:(shiftEnded:boolean)=>void
 garceOut?:(garOut:boolean)=>void

}

type Phase = 'PREPARATION' | 'GRACE_IN' | 'SHIFT_WORK' | 'GRACE_OUT' | 'OFF_WORK'|"PAST_REPORT";

interface PhaseDetail {
  phase: Phase;
  targetTime: Date;
  totalDurationMs: number;
  label: string;
  color: string;
  bgColor: string;
}
// only to perview and testing
const da = new Date()
const d =new  Date(da.getTime() + 3*60*1000 ) 
const t = new Date(d.getTime()  + 6*60*1000);

export function ShiftCountdown({
  shiftStartTime =format(d,"HH:mm"),
  shiftEndTime =format(t,"HH:mm") ,
  gracePeriodMinIn = 1,
  gracePeriodMinOut = 1,
  periodOfTime = format(new Date(), "yyyy-MM-dd"),
  workTimNear,
  shiftEnded,
  garceOut
}: ShiftCountdownProps) {
  const [time, setTime] = useState<Date | null>(null);
  const [phaseDetail, setPhaseDetail] = useState<PhaseDetail | null>(null);

  console.log("time start",format(d,"HH:mm"));
  console.log("time end",format(t,"HH:mm"));
  
  const pastReport = periodOfTime !== format((time || new Date()), "yyyy-MM-dd");

  // Initialize time on client side to avoid SSR mismatch
  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!time || pastReport) return;

    // Helper to get phase details for a specific base date
    const getPhaseForBaseDate = (baseDate: Date): PhaseDetail | null => {
      const sHours = parseInt(shiftStartTime.split(':')[0], 10)   || 0;
      const sMinutes = parseInt(shiftStartTime.split(':')[1], 10) || 0;
      const eHours = parseInt(shiftEndTime.split(':')[0], 10)     || 0;
      const eMinutes = parseInt(shiftEndTime.split(':')[1], 10)   || 0;

      // Construct Start Time (S)
      const S = new Date(baseDate);
      S.setHours(sHours, sMinutes, 0, 0);

      // Construct End Time (E)
      const E = new Date(baseDate);
      E.setHours(eHours, eMinutes, 0, 0);
      if (E.getTime() < S.getTime()) {
        E.setDate(E.getDate() + 1); // Spans across midnight
      }

      const pStart =  new Date(S.getTime() - 30 * 60 * 1000); // 30 mins before shift
      const gInEnd =  new Date(S.getTime() + gracePeriodMinIn * 60 * 1000);
      const gOutEnd = new Date(E.getTime() + gracePeriodMinOut * 60 * 1000);

      const currentTimeMs =  time.getTime() ;
      // Check which phase the current time fits into
      if (currentTimeMs >= pStart.getTime() && currentTimeMs < S.getTime()) {
        garceOut?.(false);
        shiftEnded?.(false);
        workTimNear?.(true);
        return {
          phase: 'PREPARATION',
          targetTime: S,
          totalDurationMs: 30 * 60 * 1000,
          label: 'التحضير لبدء الدوام',
          color: '#1a73e8', // Primary Blue
          bgColor: '#e8f0fe',
        };
      }
      if (currentTimeMs >= S.getTime() && currentTimeMs < gInEnd.getTime()) {
        garceOut?.(false);
        shiftEnded?.(false);
        workTimNear?.(false);
        return {
          phase: 'GRACE_IN',
          targetTime: gInEnd,
          totalDurationMs: gracePeriodMinIn * 60 * 1000,
          label: 'فترة سماح الدخول',
          color: '#b06000', // Amber/Yellow
          bgColor: '#fef7e0',
        };
      }
      if (currentTimeMs >= gInEnd.getTime() && currentTimeMs < E.getTime()) {
        garceOut?.(false);
        shiftEnded?.(false);
        workTimNear?.(false);
        return {
          phase: 'SHIFT_WORK',
          targetTime: E,
          totalDurationMs: E.getTime() - gInEnd.getTime(),
          label: 'وقت الدوام الرسمي',
          color: '#0d652d', // Green
          bgColor: '#e6f4ea',
        };
      }
      if (currentTimeMs >= E.getTime() && currentTimeMs < gOutEnd.getTime()) {
        garceOut?.(true);
        shiftEnded?.(false);
        workTimNear?.(false);
        return {
          phase: 'GRACE_OUT',
          targetTime: gOutEnd,
          totalDurationMs: gracePeriodMinOut * 60 * 1000,
          label: 'فترة سماح الانصراف',
          color: '#c5221f', // Red
          bgColor: '#fce8e6',
        };
      }
      if (currentTimeMs >= gOutEnd.getTime()) {
        shiftEnded?.(true);
        garceOut?.(false);
        workTimNear?.(false);
        return null;
      }

      return null;
    };

    // Evaluate candidate dates: Yesterday, Today, Tomorrow
    const candidates = [
      new Date(time.getTime() - 24 * 60 * 60 * 1000), // Yesterday
      new Date(time.getTime()),                       // Today
      new Date(time.getTime() + 24 * 60 * 60 * 1000)  // Tomorrow
    ];

    let detectedPhase: PhaseDetail | null = null;
    for (const d of candidates) {
      const p = getPhaseForBaseDate(d);
      if (p) {
        detectedPhase = p;
        break;
      }
    }
   
    setPhaseDetail(detectedPhase);
  }, [time, shiftStartTime, shiftEndTime, gracePeriodMinIn, gracePeriodMinOut, garceOut, shiftEnded, workTimNear, pastReport]);

  if (!time) {
    return (
      <div className="flex flex-col items-center justify-center w-64 h-64 mb-8">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
;
    
  
  // If outside working hours, show off work interface
  if ((pastReport && !phaseDetail) ||  phaseDetail?.phase === 'PAST_REPORT') {
    return (
      <div className="flex flex-col items-center justify-center w-64 h-64 mb-8 rounded-full bg-surface-container-low border border-outline-variant/30 relative">
        <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-outline text-[32px]">lock_clock</span>
        </div>
        <p className="font-label-lg text-[#5f6368] font-bold">سجل حضور وانصراف  قديم</p>
      </div>
    );
  }
  // If outside working hours, show off work interface
  if (!phaseDetail || phaseDetail.phase === 'OFF_WORK') {
    return (
      <div className="flex flex-col items-center justify-center w-64 h-64 mb-8 rounded-full bg-surface-container-low border border-outline-variant/30 relative">
        <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-outline text-[32px]">nights_stay</span>
        </div>
        <p className="font-label-lg text-[#5f6368] font-bold">خارج أوقات العمل</p>
        <p className="text-[12px] text-outline mt-1 font-sans text-center px-4">
          يبدأ العداد قبل الوردية بـ 30 دقيقة
        </p>
      </div>
    );
  }

  // Calculate remaining time
  const remainingMs = Math.max(0, phaseDetail.targetTime.getTime() - time.getTime());
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format countdown string: hh:mm:ss
  const formattedCountdown = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Progress logic
  const progressRatio = phaseDetail.totalDurationMs > 0 ? remainingMs / phaseDetail.totalDurationMs : 0;
  const strokeDasharray = 283; // 2 * PI * r (r = 45) => ~282.7
  const strokeDashoffset = strokeDasharray * (1 - progressRatio);

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
          stroke={phaseDetail.color} 
          strokeDasharray={strokeDasharray} 
          strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round" 
          strokeWidth="3.5"
        />
      </svg>

      {/* Internal Content */}
      <div className="flex flex-col items-center z-10 text-center px-4">
        <span 
          className="px-3 py-1 rounded-full text-[11px] font-bold mb-2 transition-all duration-300"
          style={{ backgroundColor: phaseDetail.bgColor, color: phaseDetail.color }}
        >
          {phaseDetail.label}
        </span>
        <div 
          className="font-display-lg text-display-lg font-bold font-sans tracking-tight"
          style={{ color: phaseDetail.color }}
        >
          {formattedCountdown}
        </div>
        <p className="text-[11px] text-outline mt-1 font-label">الوقت المتبقي</p>
      </div>
    </div>
  );
}
