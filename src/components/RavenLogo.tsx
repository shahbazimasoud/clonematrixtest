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
        <div className="absolute inset-0 bg-indigo-500/25 rounded-full blur-md animate-pulse pointer-events-none" />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 transition-transform duration-300 hover:scale-105 overflow-visible"
      >
        <defs>
          <linearGradient id="ravenCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          <linearGradient id="ravenHeadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a5b4fc" />
            <stop offset="40%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>

          <linearGradient id="ravenBeakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="60%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>

          <linearGradient id="ravenCircleBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* Circular Frame - Center at (42, 50), Radius 34 (Right Edge at x=76) */}
        <circle
          cx="42"
          cy="50"
          r="34"
          fill="url(#ravenCircleBg)"
          stroke="url(#ravenCircleGrad)"
          strokeWidth="3.5"
        />

        {/* Raven Head & Neck Profile */}
        <path
          d="M 22 81 
             C 18 66 18 48 26 34 
             C 32 24 44 22 54 28 
             C 59 31 63 35 65 39 
             C 60 48 56 62 60 72 
             C 52 78 40 82 22 81 Z"
          fill="url(#ravenHeadGrad)"
        />

        {/* Intelligent Feather Crown Crest */}
        <path
          d="M 28 32 L 21 23 L 32 28 L 29 18 L 38 25 L 39 16 L 46 24"
          fill="url(#ravenCircleGrad)"
        />

        {/* Sharp Raven Beak extending OUT of the circle (Circle Edge=76, Beak Tip=96) */}
        <path
          d="M 62 36 
             C 71 36 84 40 96 48 
             C 85 53 74 55 63 54 
             C 61 48 60 41 62 36 Z"
          fill="url(#ravenBeakGrad)"
        />

        {/* Beak Mouth Separator Line */}
        <path
          d="M 63 45 C 73 46 84 48 95 48"
          stroke="#0f172a"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Feather Texture / Cyber Wing Accent Lines */}
        <path
          d="M 26 56 C 36 50 48 52 54 58"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M 24 68 C 34 62 44 64 50 70"
          stroke="#818cf8"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Glowing Eye of Intelligence */}
        <circle cx="48" cy="37" r="4.5" fill="#06b6d4" />
        <circle cx="48" cy="37" r="2.5" fill="#38bdf8" />
        <circle cx="49.5" cy="35.8" r="1.2" fill="#ffffff" />
      </svg>
    </div>
  );
}

export default RavenLogo;
