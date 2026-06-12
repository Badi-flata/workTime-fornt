"use client";

import React from 'react';

interface LogoProps {
  className?: string;
  size?: number; // Size of the icon
  showText?: boolean;
  orientation?: 'vertical' | 'horizontal';
}

export function Logo({
  className,
  size = 80,
  showText = true,
  orientation = 'vertical'
}: LogoProps) {
  return (
    <div className={`flex items-center  ${orientation === 'vertical' ? 'flex-col text-center space-y-3' : 'flex-row text-right space-x-3 space-x-reverse'} ${className || ''}`}>
      {/* ── HIGH FIDELITY SVG ICON (EXACT STRUCTURE FROM CODE.HTML) ── */}
      <div style={{ width: size, height: size }} className="relative ">
        <svg
          viewBox="0 0 100 100"
          width="100%"
          height="100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>

            {/* Silver Metallic Gradient */}
            <linearGradient id="silverRingGrad" x1="50" y1="82" x2="0" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="30%" stopColor="#94a3b8" />
              <stop offset="70%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>

            {/* Emerald Green Metallic Gradient */}
            <linearGradient id="emeraldRingGrad" x1="50" y1="22" x2="100" y2="82" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0f452f" />
              <stop offset="50%" stopColor="#1b7550" />
              <stop offset="100%" stopColor="#2bbb76" />
            </linearGradient>
            {/* Checkmark Gradient */}
            <linearGradient id="checkmarkGrad" x1="85" y1="22" x2="36" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#105739" />
              <stop offset="100%" stopColor="#3cd18c" />
            </linearGradient>

            {/* Soft Shadow Filter */}
            <filter id="logoShadow" x="-10%" y="-10%" width="125%" height="125%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.1" />
            </filter>
          </defs>

          {/* Group with filter for depth */}
          <g filter="url(#logoShadow)">
            {/* 1. Left Arc: Silver Metallic (Clock Circle) */}
            <path
              d="M 50 82 A 30 30 0 0 1 50 22"
              stroke="url(#silverRingGrad)"
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            {/* 2. Right Arc: Emerald Green (Clock Circle) */}
            <path
              d="M 50 22 A 30 30 0 0 1 50 82"
              stroke="url(#emeraldRingGrad)"
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            {/* 3. Meter Dots (Tick Marks) - Zoned Silver/Green */}
            <circle cx="50" cy="27" r="1.5" fill="#94a3b8" /> {/* 12 (Silver) */}
            <circle cx="74" cy="52" r="1.5" fill="#1b7550" opacity="0.6" /> {/* 3 (Green) */}
            <circle cx="50" cy="77" r="1.5" fill="#64748b" opacity="0.6" /> {/* 6 (Silver) */}
            <circle cx="26" cy="52" r="1.5" fill="#94a3b8" /> {/* 9 (Silver) */}

            {/* 4. Subtle secondary dots */}
            <circle cx="61" cy="29.5" r="1" fill="#1b7550" opacity="0.3" />
            <circle cx="71" cy="38" r="1" fill="#1b7550" opacity="0.3" />
            <circle cx="71" cy="65.5" r="1" fill="#1b7550" opacity="0.3" />
            <circle cx="61" cy="74" r="1" fill="#1b7550" opacity="0.3" />
            
            <circle cx="39" cy="74" r="1" fill="#94a3b8" opacity="0.3" />
            <circle cx="29" cy="65.5" r="1" fill="#94a3b8" opacity="0.3" />
            <circle cx="29" cy="38" r="1" fill="#94a3b8" opacity="0.3" />
            <circle cx="39" cy="29.5" r="1" fill="#94a3b8" opacity="0.3" />

            {/* 5. Integrated Checkmark / Clock Hands */}
            <path
              d="M36,44 L50,58 L85,22"
              fill="none"
              stroke="url(#checkmarkGrad)"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 6. Center Pivot */}
            <circle cx="50" cy="58" r="2.5" fill="#136141" />
          </g>
        </svg>
      </div>

      {/* ── LOGO TEXTS (Vertical/Horizontal adaptive) ── */}
      {showText && (
        <div className="flex flex-col select-none text-right">
          {/* WORKTIME */}
          <div className="flex items-center font-heading font-extrabold tracking-wide" style={{ fontSize: size * 0.42 }}>
            <span className="text-[#1b7550]">WORK</span>
            <span className="text-[#1e1e1e] ">TIME</span>
          </div>
          {/* Subtext: إدارة الحضور الذكية */}
          <span 
            className="font-sans font-bold text-on-surface-variant/80 tracking-wide pr-2.5"
            style={{ fontSize: size * 0.22, marginTop: size * 0.022 }}
          >
            إدارة الحضور الذكية
          </span>
        </div>
      )}
    </div>
  );
}
