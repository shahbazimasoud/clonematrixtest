import React from 'react';

interface RavenLogoProps {
  className?: string;
  size?: number;
  showGlow?: boolean;
}

export function RavenLogo({ className = "w-8 h-8", size = 32, showGlow = true }: RavenLogoProps) {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {showGlow && (
        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-md animate-pulse pointer-events-none" />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="ravenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="40%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="ravenBeak" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
          <linearGradient id="ravenWing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>

        {/* Outer Intelligent Shield Contour */}
        <path
          d="M 50 8 C 72 8 88 18 88 42 C 88 68 50 92 50 92 C 50 92 12 68 12 42 C 12 18 28 8 50 8 Z"
          fill="url(#ravenGrad)"
          fillOpacity="0.12"
          stroke="url(#ravenGrad)"
          strokeWidth="2.5"
          strokeDasharray="180"
          strokeDashoffset="0"
        />

        {/* Raven Geometric Head & Neck */}
        <path
          d="M 28 70 C 24 52 30 36 44 24 C 56 14 72 12 86 18 C 80 23 74 26 68 25 C 76 29 82 36 85 43 C 76 40 67 40 60 44 C 70 51 75 62 75 74 C 63 68 51 66 38 68 Z"
          fill="url(#ravenGrad)"
        />

        {/* Sharp Intelligent Beak */}
        <path
          d="M 68 25 C 80 21 92 23 96 26 C 88 32 78 37 68 38 Z"
          fill="url(#ravenBeak)"
        />

        {/* Cyber Feather Accent Layers */}
        <path
          d="M 30 58 L 46 47 L 55 51"
          stroke="url(#ravenWing)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 24 67 L 40 57 L 49 60"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />

        {/* Glowing Cyan Eye of Intelligence */}
        <circle cx="56" cy="28" r="4.5" fill="#06b6d4" />
        <circle cx="56" cy="28" r="2.5" fill="#38bdf8" />
        <circle cx="57.5" cy="26.8" r="1.2" fill="#ffffff" />
      </svg>
    </div>
  );
}

export default RavenLogo;
