import React from 'react';

// Hero illustration for student financial growth
export function StudentFinanceIllustration({ className = "w-full max-w-sm" }) {
  return (
    <svg viewBox="0 0 500 380" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="heroGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="heroGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="heroShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#4f46e5" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Background Soft Blobs */}
      <circle cx="120" cy="120" r="90" fill="#ede9fe" opacity="0.6" />
      <circle cx="390" cy="200" r="110" fill="#e0f2fe" opacity="0.6" />
      <circle cx="280" cy="320" r="80" fill="#fdf2f8" opacity="0.7" />

      {/* Main Laptop Screen Base */}
      <rect x="110" y="90" width="280" height="175" rx="14" fill="#1e1b4b" filter="url(#heroShadow)" />
      <rect x="120" y="100" width="260" height="145" rx="10" fill="#0f172a" />
      
      {/* Laptop UI Screen Header */}
      <rect x="120" y="100" width="260" height="24" fill="#1e293b" />
      <circle cx="134" cy="112" r="4" fill="#ef4444" />
      <circle cx="146" cy="112" r="4" fill="#f59e0b" />
      <circle cx="158" cy="112" r="4" fill="#10b981" />
      <rect x="180" y="108" width="100" height="8" rx="4" fill="#334155" />

      {/* Laptop Screen Charts & Graphs */}
      <path d="M 135 220 L 175 185 L 210 200 L 255 155 L 295 170 L 335 135 L 365 145" 
            stroke="url(#heroGrad1)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 135 220 L 175 185 L 210 200 L 255 155 L 295 170 L 335 135 L 365 145 L 365 230 L 135 230 Z" 
            fill="url(#heroGrad1)" opacity="0.15" />
      
      {/* Mini Bar Graph Inside Screen */}
      <rect x="145" y="170" width="10" height="40" rx="3" fill="#6366f1" opacity="0.8" />
      <rect x="165" y="155" width="10" height="55" rx="3" fill="#8b5cf6" opacity="0.8" />
      <rect x="185" y="140" width="10" height="70" rx="3" fill="#ec4899" opacity="0.8" />
      <rect x="205" y="160" width="10" height="50" rx="3" fill="#10b981" opacity="0.8" />

      {/* Laptop Keyboard Body */}
      <path d="M 75 265 L 425 265 L 450 288 C 452 290 450 293 446 293 L 54 293 C 50 293 48 290 50 288 Z" fill="#334155" />
      <rect x="200" y="270" width="100" height="12" rx="4" fill="#1e293b" />

      {/* Floating Card: Savings Goal */}
      <g filter="url(#heroShadow)">
        <rect x="40" y="160" width="130" height="85" rx="12" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
        <rect x="52" y="175" width="28" height="28" rx="8" fill="#dcfce7" />
        <path d="M 61 189 L 65 193 L 73 183" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="88" y="176" width="65" height="8" rx="3" fill="#0f172a" />
        <rect x="88" y="190" width="45" height="6" rx="3" fill="#94a3b8" />
        {/* Progress Bar in card */}
        <rect x="52" y="215" width="106" height="8" rx="4" fill="#f1f5f9" />
        <rect x="52" y="215" width="80" height="8" rx="4" fill="url(#heroGrad2)" />
      </g>

      {/* Floating Card: AI Copilot Insight */}
      <g filter="url(#heroShadow)">
        <rect x="330" y="60" width="135" height="75" rx="12" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
        <rect x="342" y="72" width="26" height="26" rx="8" fill="#ede9fe" />
        <text x="349" y="90" fontSize="14" fill="#6d28d9">✨</text>
        <rect x="376" y="75" width="75" height="8" rx="3" fill="#4338ca" />
        <rect x="376" y="88" width="60" height="6" rx="3" fill="#64748b" />
        <rect x="342" y="108" width="105" height="14" rx="4" fill="#f0fdf4" />
        <text x="352" y="119" fontSize="8" fontWeight="bold" fill="#15803d">+ ₹3,400 Saved this month</text>
      </g>

      {/* Floating Rupee Coins with 3D Effect */}
      <g filter="url(#heroShadow)">
        <circle cx="95" cy="100" r="24" fill="url(#coinGrad)" />
        <circle cx="95" cy="100" r="20" fill="none" stroke="#fef3c7" strokeWidth="2" strokeDasharray="3 3" />
        <text x="89" y="107" fontSize="20" fontWeight="bold" fill="#78350f">₹</text>
      </g>

      <g filter="url(#heroShadow)">
        <circle cx="410" cy="250" r="20" fill="url(#coinGrad)" />
        <circle cx="410" cy="250" r="16" fill="none" stroke="#fef3c7" strokeWidth="2" />
        <text x="405" y="256" fontSize="16" fontWeight="bold" fill="#78350f">₹</text>
      </g>

      {/* Graduation Cap Badge */}
      <g filter="url(#heroShadow)">
        <circle cx="250" cy="45" r="32" fill="#4338ca" />
        {/* Cap Diamond */}
        <polygon points="250,26 274,38 250,50 226,38" fill="#ffffff" />
        {/* Cap Base */}
        <path d="M 235 44 L 235 56 C 235 62 265 62 265 56 L 265 44" fill="#c7d2fe" />
        {/* Tassel */}
        <path d="M 274 38 L 278 52" stroke="#fbbf24" strokeWidth="2" />
        <circle cx="278" cy="54" r="2.5" fill="#f59e0b" />
      </g>
    </svg>
  );
}

// Financial Health Circular Radial Gauge
export function FinancialHealthGauge({ score = 84, size = 160 }) {
  const radius = 60;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = '#10b981'; // Green
  let label = 'Excellent';
  let badgeClass = 'bg-emerald-100 text-emerald-800';
  if (score < 50) {
    color = '#ef4444';
    label = 'Needs Work';
    badgeClass = 'bg-rose-100 text-rose-800';
  } else if (score < 75) {
    color = '#f59e0b';
    label = 'Moderate';
    badgeClass = 'bg-amber-100 text-amber-800';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative inline-flex items-center justify-center">
        <svg height={size} width={size} className="transform -rotate-90">
          <circle
            stroke="#f1f5f9"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-slate-800">{score}</span>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">out of 100</span>
        </div>
      </div>
      <span className={`mt-2 px-3 py-0.5 text-xs font-semibold rounded-full ${badgeClass}`}>
        {label} Health
      </span>
    </div>
  );
}

// Empty State Graphic
export function EmptyGraphic({ title = "No items found", message = "Try adjusting your search or filters." }) {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-4 shadow-sm border border-indigo-100">
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mt-1">{message}</p>
    </div>
  );
}
