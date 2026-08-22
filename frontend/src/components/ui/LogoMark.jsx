/**
 * Dayflow's brand mark: a horizon line with the sun's arc rising above it —
 * the one graphic signature reused everywhere the wordmark appears
 * (sidebar, mobile header/drawer, auth screens), instead of a generic
 * initial-in-a-square.
 */
export default function LogoMark({ size = 30 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect width="30" height="30" rx="8" fill="var(--color-brand-600)" />
      <path
        d="M8 19.5a7 7 0 0 1 14 0"
        stroke="var(--text-on-brand)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="15" cy="19.5" r="1.6" fill="var(--text-on-brand)" />
      <path d="M6.5 22.5h17" stroke="var(--text-on-brand)" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}
