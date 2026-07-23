import React, { useState } from 'react';
import crowAudioUrl from '../assets/crow-caw.mp3';

interface RavenLogoProps {
  className?: string;
  size?: number;
  showGlow?: boolean;
}

export function RavenLogo({ className = "w-8 h-8", size = 32, showGlow = true }: RavenLogoProps) {
  const [isCawing, setIsCawing] = useState(false);

  const playRavenCawSound = () => {
    try {
      const audio = new Audio(crowAudioUrl || '/crow-caw.mp3');
      audio.volume = 0.85;
      audio.play().catch(() => {
        // Fallback to root /crow-caw.mp3
        const altAudio = new Audio('/crow-caw.mp3');
        altAudio.volume = 0.85;
        altAudio.play().catch(err => console.warn('Crow audio playback error:', err));
      });
    } catch (e) {
      console.error("Audio playback error:", e);
    }
  };

  const handleClick = () => {
    setIsCawing(true);
    playRavenCawSound();
    setTimeout(() => {
      setIsCawing(false);
    }, 1200);
  };

  return (
    <div 
      onClick={handleClick}
      title="Raven Matrix (Click for Caw sound)"
      className={`relative inline-flex items-center justify-center shrink-0 cursor-pointer select-none group ${className}`}
    >
      {showGlow && (
        <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-md group-hover:blur-lg animate-pulse pointer-events-none transition-all" />
      )}

      {/* Embedded CSS for periodic beak opening animation */}
      <style>{`
        @keyframes periodicCaw {
          0%, 82%, 100% {
            transform: rotate(0deg);
          }
          85% {
            transform: rotate(16deg);
          }
          88% {
            transform: rotate(2deg);
          }
          92% {
            transform: rotate(20deg);
          }
          96% {
            transform: rotate(0deg);
          }
        }
        .animate-beak-caw {
          animation: periodicCaw 6s infinite ease-in-out;
          transform-origin: 62px 46px;
        }
        .animate-beak-click {
          animation: periodicCaw 0.6s infinite ease-in-out !important;
          transform-origin: 62px 46px;
        }
      `}</style>

      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 transition-transform duration-300 group-hover:scale-110 overflow-visible"
      >
        <defs>
          {/* High-contrast Background Gradient so Jet-Black Raven pops out */}
          <linearGradient id="ravenBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#1e1b4b" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
          </linearGradient>

          {/* Bright Glowing Rim Border */}
          <linearGradient id="ravenCircleRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          {/* Jet Black Crow Head Shading */}
          <linearGradient id="ravenBlackHeadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#222230" />
            <stop offset="50%" stopColor="#0e0e15" />
            <stop offset="100%" stopColor="#020204" />
          </linearGradient>

          {/* Obsidian Beak Gradient */}
          <linearGradient id="ravenBlackBeakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b3b4f" />
            <stop offset="60%" stopColor="#14141d" />
            <stop offset="100%" stopColor="#050508" />
          </linearGradient>
        </defs>

        {/* Circular Background with high contrast indigo/blue fill & bright cyan/purple rim */}
        <circle
          cx="42"
          cy="50"
          r="34"
          fill="url(#ravenBgGrad)"
          stroke="url(#ravenCircleRim)"
          strokeWidth="3.5"
        />

        {/* Outer Highlight Outline around the Jet-Black Crow Body for maximum contrast */}
        <path
          d="M 22 81 
             C 18 66 18 48 26 34 
             C 32 24 44 22 54 28 
             C 59 31 63 35 65 39 
             C 60 48 56 62 60 72 
             C 52 78 40 82 22 81 Z"
          fill="none"
          stroke="#818cf8"
          strokeWidth="2"
          opacity="0.8"
        />

        {/* Raven Head & Neck Profile - Jet Black Crow */}
        <path
          d="M 22 81 
             C 18 66 18 48 26 34 
             C 32 24 44 22 54 28 
             C 59 31 63 35 65 39 
             C 60 48 56 62 60 72 
             C 52 78 40 82 22 81 Z"
          fill="url(#ravenBlackHeadGrad)"
          stroke="#475569"
          strokeWidth="1"
        />

        {/* Feather Crown Crest */}
        <path
          d="M 28 32 L 21 23 L 32 28 L 29 18 L 38 25 L 39 16 L 46 24"
          fill="#38bdf8"
          opacity="0.9"
        />

        {/* Upper Fixed Beak */}
        <path
          d="M 62 36 
             C 71 36 84 40 96 46 
             C 85 48 74 48 63 46 
             C 61 43 60 39 62 36 Z"
          fill="url(#ravenBlackBeakGrad)"
          stroke="#64748b"
          strokeWidth="0.8"
        />

        {/* Lower Animated Opening Beak (Caw action) */}
        <g className={isCawing ? 'animate-beak-click' : 'animate-beak-caw'}>
          <path
            d="M 63 46 
               C 74 48 85 48 96 46 
               C 85 53 74 55 63 54 
               Z"
            fill="url(#ravenBlackBeakGrad)"
            stroke="#475569"
            strokeWidth="0.8"
          />
        </g>

        {/* Mouth Separator Line */}
        <path
          d="M 63 46 C 73 47 84 47 95 46"
          stroke="#38bdf8"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Wing Feather Sheen Accents */}
        <path
          d="M 26 56 C 36 50 48 52 54 58"
          stroke="#818cf8"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M 24 68 C 34 62 44 64 50 70"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* Glowing Eye of Intelligence */}
        <circle cx="48" cy="37" r="4.5" fill="#0284c7" />
        <circle cx="48" cy="37" r="2.5" fill="#38bdf8" />
        <circle cx="49.5" cy="35.8" r="1.2" fill="#ffffff" />
      </svg>
    </div>
  );
}

export default RavenLogo;
