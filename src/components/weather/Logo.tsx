/** Minimalist umbrella mark used in the header and browser tab. */
export function Logo({ className = "size-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="su-canopy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary-glow)" />
          <stop offset="100%" stopColor="var(--primary)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="var(--card)" stroke="var(--border)" />
      <path
        d="M5 16.5a11 11 0 0 1 22 0q-2.75-2.4-5.5 0q-2.75-2.4-5.5 0q-2.75-2.4-5.5 0q-2.75-2.4-5.5 0z"
        fill="url(#su-canopy)"
      />
      <path
        d="M16 16.5v7.5a2.4 2.4 0 0 1-4.8 0"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M16 5.5v-1.5" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
