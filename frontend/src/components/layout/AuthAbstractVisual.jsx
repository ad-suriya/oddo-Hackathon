/** Art-directed abstract composition for the split-screen auth panel — deep
 * navy/indigo flowing forms with a sparse constellation motif (data) and a
 * restrained pink accent thread (brand). Hand-authored, not a stock asset. */
export default function AuthAbstractVisual({ className }) {
  return (
    <svg
      viewBox="0 0 900 1200"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label="Abstract Dayflow brand composition"
    >
      <defs>
        <linearGradient id="dfBase" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0b1024" />
          <stop offset="55%" stopColor="#111a3d" />
          <stop offset="100%" stopColor="#0a0e1f" />
        </linearGradient>
        <linearGradient id="dfFlow1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2438a8" />
          <stop offset="100%" stopColor="#3f5fe0" />
        </linearGradient>
        <linearGradient id="dfFlow2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#a5a6f6" />
        </linearGradient>
        <linearGradient id="dfFlow3" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#1b2560" />
          <stop offset="100%" stopColor="#5b6ee8" />
        </linearGradient>
        <radialGradient id="dfGlowPink" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e91e46" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#e91e46" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="dfGlowWhite" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#dfe6ff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#dfe6ff" stopOpacity="0" />
        </radialGradient>
        <filter id="dfSoft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="38" />
        </filter>
        <filter id="dfSoftSm" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      <rect width="900" height="1200" fill="url(#dfBase)" />

      {/* large soft background flow */}
      <path
        d="M-100 260 C 120 120, 340 200, 470 340 C 610 490, 560 700, 760 760 C 920 810, 1040 700, 1080 560 L 1080 -100 L -100 -100 Z"
        fill="url(#dfFlow1)"
        opacity="0.55"
        filter="url(#dfSoft)"
      />
      <path
        d="M-120 1300 C 160 1180, 260 980, 480 940 C 700 900, 760 1080, 980 1040 L 980 1300 Z"
        fill="url(#dfFlow3)"
        opacity="0.5"
        filter="url(#dfSoft)"
      />

      {/* crisper mid-ground ribbons for structure */}
      <path
        d="M-80 520 C 140 440, 300 520, 420 640 C 560 780, 520 920, 700 960 C 840 990, 940 900, 1000 800"
        fill="none"
        stroke="url(#dfFlow2)"
        strokeWidth="2.5"
        opacity="0.6"
      />
      <path
        d="M-60 600 C 160 500, 320 600, 440 720 C 580 860, 540 1000, 720 1040"
        fill="none"
        stroke="#8b7fe8"
        strokeWidth="1.5"
        opacity="0.35"
      />
      <path
        d="M60 40 C 260 40, 300 220, 480 260 C 660 300, 700 160, 900 180"
        fill="none"
        stroke="#c7d2fe"
        strokeWidth="1.5"
        opacity="0.3"
      />

      {/* pink accent thread — controlled, singular */}
      <path
        d="M-40 860 C 180 780, 340 860, 480 980 C 600 1080, 700 1040, 860 1100"
        fill="none"
        stroke="#e91e46"
        strokeWidth="2"
        opacity="0.7"
      />
      <circle cx="480" cy="980" r="70" fill="url(#dfGlowPink)" />

      {/* soft highlight glows for depth */}
      <circle cx="200" cy="220" r="220" fill="url(#dfGlowWhite)" opacity="0.5" />
      <circle cx="740" cy="640" r="260" fill="url(#dfGlowWhite)" opacity="0.3" />

      {/* sparse constellation — data / operations motif, deliberately restrained */}
      <g opacity="0.55">
        <line x1="560" y1="220" x2="660" y2="300" stroke="#c7d2fe" strokeWidth="1" />
        <line x1="660" y1="300" x2="640" y2="410" stroke="#c7d2fe" strokeWidth="1" />
        <line x1="660" y1="300" x2="760" y2="330" stroke="#c7d2fe" strokeWidth="1" />
        <line x1="640" y1="410" x2="740" y2="460" stroke="#c7d2fe" strokeWidth="1" opacity="0.6" />
        <circle cx="560" cy="220" r="3.5" fill="#dfe6ff" />
        <circle cx="660" cy="300" r="4.5" fill="#ffffff" />
        <circle cx="760" cy="330" r="3" fill="#dfe6ff" />
        <circle cx="640" cy="410" r="3.5" fill="#dfe6ff" />
        <circle cx="740" cy="460" r="3" fill="#c7d2fe" />
      </g>
      <g opacity="0.4">
        <line x1="140" y1="880" x2="220" y2="940" stroke="#c7d2fe" strokeWidth="1" />
        <line x1="220" y1="940" x2="200" y2="1030" stroke="#c7d2fe" strokeWidth="1" />
        <circle cx="140" cy="880" r="3" fill="#dfe6ff" />
        <circle cx="220" cy="940" r="4" fill="#ffffff" />
        <circle cx="200" cy="1030" r="3" fill="#dfe6ff" />
      </g>

      {/* fine grain vignette to seat everything together */}
      <rect width="900" height="1200" fill="url(#dfGlowWhite)" opacity="0.04" />
    </svg>
  );
}
