import React, { useState } from 'react';

interface RavenLogoProps {
  className?: string;
  size?: number;
  showGlow?: boolean;
}

export function RavenLogo({ className = "w-8 h-8", size = 32, showGlow = true }: RavenLogoProps) {
  const [isCawing, setIsCawing] = useState(false);

  const playRavenCawSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const playBurst = (startTime: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';

        // Throaty raven caw frequency modulation (drops pitch)
        osc.frequency.setValueAtTime(430, startTime);
        osc.frequency.exponentialRampToValueAtTime(170, startTime + 0.26);

        // Bandpass filter for resonant caw acoustic sound
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(680, startTime);
        filter.Q.setValueAtTime(2.2, startTime);

        // Gain volume envelope
        gain.gain.setValueAtTime(0.01, startTime);
        gain.gain.linearRampToValueAtTime(0.35, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.26);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.28);
      };

      const now = ctx.currentTime;
      playBurst(now);
      playBurst(now + 0.32);
    } catch (e) {
      console.error("Audio synth error:", e);
    }
  };

  const handleClick = () => {
    setIsCawing(true);
    playRavenCawSound();
    setTimeout(() => {
      setIsCawing(false);
    }, 1000);
  };

  return (
    <div 
      onClick={handleClick}
      title="Raven Matrix (Click for Caw sound)"
      className={`relative inline-flex items-center justify-center shrink-0 cursor-pointer select-none group ${className}`}
    >
      {showGlow && (
        <div className="absolute inset-0 bg-slate-800/40 border border-slate-700/30 rounded-full blur-md group-hover:blur-lg animate-pulse pointer-events-none transition-all" />
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
          {/* Black Crow / Obsidian Gradients */}
          <linearGradient id="ravenBlackCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="ravenBlackHeadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1e28" />
            <stop offset="40%" stopColor="#0c0c12" />
            <stop offset="100%" stopColor="#020204" />
          </linearGradient>

          <linearGradient id="ravenBlackBeakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2a2a36" />
            <stop offset="60%" stopColor="#121218" />
            <stop offset="100%" stopColor="#050508" />
          </linearGradient>

          <linearGradient id="ravenBlackBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d0d12" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#020204" stopOpacity="0.98" />
          </linearGradient>
        </defs>

        {/* Circular Outer Frame */}
        <circle
          cx="42"
          cy="50"
          r="34"
          fill="url(#ravenBlackBg)"
          stroke="url(#ravenBlackCircleGrad)"
          strokeWidth="3.5"
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
          stroke="#1e293b"
          strokeWidth="0.8"
        />

        {/* Feather Crown Crest */}
        <path
          d="M 28 32 L 21 23 L 32 28 L 29 18 L 38 25 L 39 16 L 46 24"
          fill="#1e1e2a"
        />

        {/* Upper Fixed Beak */}
        <path
          d="M 62 36 
             C 71 36 84 40 96 46 
             C 85 48 74 48 63 46 
             C 61 43 60 39 62 36 Z"
          fill="url(#ravenBlackBeakGrad)"
          stroke="#334155"
          strokeWidth="0.5"
        />

        {/* Lower Animated Opening Beak (Caw action) */}
        <g className={isCawing ? 'animate-beak-click' : 'animate-beak-caw'}>
          <path
            d="M 63 46 
               C 74 48 85 48 96 46 
               C 85 53 74 55 63 54 
               Z"
            fill="url(#ravenBlackBeakGrad)"
            stroke="#1e293b"
            strokeWidth="0.5"
          />
        </g>

        {/* Mouth Separator Line */}
        <path
          d="M 63 46 C 73 47 84 47 95 46"
          stroke="#000000"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Wing Feather Sheen Accents */}
        <path
          d="M 26 56 C 36 50 48 52 54 58"
          stroke="#475569"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M 24 68 C 34 62 44 64 50 70"
          stroke="#334155"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.5"
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
