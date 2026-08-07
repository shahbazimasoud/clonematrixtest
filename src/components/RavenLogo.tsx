import React, { useState } from 'react';

// Pre-configured authentic crow audio files
const CROW_AUDIO_SOURCES = [
  '/crow-caw.mp3',
  '/crow-caw2.mp3',
  'https://raw.githubusercontent.com/shahbazimasoud/clonematrixtest/master/public/crow-caw.mp3'
];

interface RavenLogoProps {
  className?: string;
  size?: number;
  showGlow?: boolean;
  eyesClosed?: boolean;
}

export function RavenLogo({ className = "w-8 h-8", size = 32, showGlow = true, eyesClosed = false }: RavenLogoProps) {
  const [isCawing, setIsCawing] = useState(false);

  // Play authentic real crow caw audio file
  const playRavenCawSound = () => {
    let played = false;

    const trySource = (index: number) => {
      if (index >= CROW_AUDIO_SOURCES.length || played) return;
      try {
        const audio = new Audio(CROW_AUDIO_SOURCES[index]);
        audio.volume = 0.95;
        const promise = audio.play();
        if (promise !== undefined) {
          promise.then(() => {
            played = true;
          }).catch(() => {
            // If autoplay fails or file blocked, try next real audio source
            trySource(index + 1);
          });
        }
      } catch (e) {
        trySource(index + 1);
      }
    };

    trySource(0);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCawing(true);
    playRavenCawSound();
    setTimeout(() => {
      setIsCawing(false);
    }, 1400);
  };

  return (
    <div 
      onClick={handleClick}
      title="Raven Matrix (Click for Caw sound)"
      className={`relative inline-flex items-center justify-center shrink-0 cursor-pointer select-none group ${className}`}
    >
      {showGlow && (
        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-md group-hover:blur-lg animate-pulse pointer-events-none transition-all" />
      )}

      {/* Embedded CSS for beak opening animation */}
      <style>{`
        @keyframes openBeakCaw {
          0%, 100% {
            transform: rotate(0deg);
          }
          20% {
            transform: rotate(26deg);
          }
          40% {
            transform: rotate(6deg);
          }
          70% {
            transform: rotate(28deg);
          }
        }
        @keyframes idleBeak {
          0%, 85%, 100% {
            transform: rotate(0deg);
          }
          90% {
            transform: rotate(14deg);
          }
          95% {
            transform: rotate(0deg);
          }
        }
        .animate-beak-caw {
          animation: idleBeak 7s infinite ease-in-out;
          transform-origin: 63px 46px;
        }
        .animate-beak-click {
          animation: openBeakCaw 0.45s infinite ease-in-out !important;
          transform-origin: 63px 46px;
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
          {/* Jet Black Crow Head Shading */}
          <linearGradient id="ravenBlackHeadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#312e81" />
            <stop offset="35%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>

          {/* Obsidian Beak Gradient */}
          <linearGradient id="ravenBlackBeakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="60%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Outer Highlight Outline around the Jet-Black Crow Body for contrast without a background circle */}
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
          opacity="0.85"
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
          stroke="#6366f1"
          strokeWidth="1.2"
        />

        {/* Feather Crown Crest */}
        <path
          d="M 28 32 L 21 23 L 32 28 L 29 18 L 38 25 L 39 16 L 46 24"
          fill="#38bdf8"
          opacity="0.95"
        />

        {/* Upper Fixed Beak */}
        <path
          d="M 62 36 
             C 71 36 84 40 96 46 
             C 85 48 74 48 63 46 
             C 61 43 60 39 62 36 Z"
          fill="url(#ravenBlackBeakGrad)"
          stroke="#94a3b8"
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
            stroke="#64748b"
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
          opacity="0.85"
        />
        <path
          d="M 24 68 C 34 62 44 64 50 70"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.75"
        />

        {/* Eye of Intelligence - Open vs Closed when typing password */}
        {eyesClosed ? (
          <g className="transition-all duration-300">
            {/* Curved closed eyelid arc */}
            <path
              d="M 43 37 Q 48 42 53 37"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Cute eyelash details */}
            <path
              d="M 45 40.5 L 44 43.5 M 48 41.5 L 48 44.5 M 51 40.5 L 52 43.5"
              stroke="#38bdf8"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </g>
        ) : (
          <g className="transition-all duration-300">
            {/* Glowing Eye of Intelligence */}
            <circle cx="48" cy="37" r="4.5" fill="#0284c7" />
            <circle cx="48" cy="37" r="2.5" fill="#38bdf8" />
            <circle cx="49.5" cy="35.8" r="1.2" fill="#ffffff" />
          </g>
        )}
      </svg>
    </div>
  );
}

export default RavenLogo;
