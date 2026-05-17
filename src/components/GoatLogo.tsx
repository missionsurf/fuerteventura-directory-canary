interface GoatLogoProps {
  className?: string
  pinColor?: string
  goatColor?: string
}

export default function GoatLogo({
  className = "h-9 w-auto",
  pinColor = "#E67E22",
  goatColor = "white",
}: GoatLogoProps) {
  return (
    <svg
      viewBox="0 0 44 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Fuerteventura Directory"
    >
      {/* ── Map pin body ── */}
      <path
        d="M22 54C22 54 4 39 4 22C4 12.06 12.06 4 22 4C31.94 4 40 12.06 40 22C40 39 22 54 22 54Z"
        fill={pinColor}
      />
      {/* Subtle inner shadow ring */}
      <path
        d="M22 54C22 54 4 39 4 22C4 12.06 12.06 4 22 4C31.94 4 40 12.06 40 22C40 39 22 54 22 54Z"
        stroke="rgba(0,0,0,0.12)"
        strokeWidth="1"
        fill="none"
      />

      {/* ── Left horn – sweeps up and slightly outward ── */}
      <path
        d="M15 21
           C 14 17 11 12 10 7
           C 12 7 14 10 15.5 14
           C 16.5 17 16.5 20 15.5 21
           Z"
        fill={goatColor}
      />

      {/* ── Right horn (mirror) ── */}
      <path
        d="M29 21
           C 30 17 33 12 34 7
           C 32 7 30 10 28.5 14
           C 27.5 17 27.5 20 28.5 21
           Z"
        fill={goatColor}
      />

      {/* ── Left ear ── */}
      <ellipse
        cx="11.5"
        cy="24"
        rx="3.2"
        ry="1.8"
        transform="rotate(-25 11.5 24)"
        fill={goatColor}
      />

      {/* ── Right ear ── */}
      <ellipse
        cx="32.5"
        cy="24"
        rx="3.2"
        ry="1.8"
        transform="rotate(25 32.5 24)"
        fill={goatColor}
      />

      {/* ── Face / head ── */}
      <path
        d="M15 21
           C 15 18.5 18 16.5 22 16.5
           C 26 16.5 29 18.5 29 21
           L 29 31
           C 29 34 26 36 22 36
           C 18 36 15 34 15 31
           Z"
        fill={goatColor}
      />

      {/* ── Eyes ── */}
      <circle cx="18.5" cy="25" r="1.8" fill={pinColor} />
      <circle cx="25.5" cy="25" r="1.8" fill={pinColor} />

      {/* ── Snout highlight ── */}
      <ellipse cx="22" cy="32" rx="4" ry="2.5" fill="rgba(0,0,0,0.08)" />

      {/* ── Nostrils ── */}
      <circle cx="20.2" cy="32.2" r="0.9" fill="rgba(0,0,0,0.2)" />
      <circle cx="23.8" cy="32.2" r="0.9" fill="rgba(0,0,0,0.2)" />

      {/* ── Beard ── */}
      <path
        d="M19.5 36C18.5 39 19.5 41.5 22 41.5C24.5 41.5 25.5 39 24.5 36Z"
        fill={goatColor}
      />
    </svg>
  )
}
