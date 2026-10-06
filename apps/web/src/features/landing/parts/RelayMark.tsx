/**
 * RelayMark — the Relay logo/wordmark component.
 * Used in header, footer, dashboard preview, and context cards.
 * Supports compact mode (mark only, no text).
 */

interface RelayMarkProps {
  compact?: boolean;
}

export function RelayMark({ compact = false }: RelayMarkProps) {
  return (
    <span
      className={`wordmark ${compact ? "wordmark-compact" : ""}`}
      role="img"
      aria-label="Relay"
    >
      <span className="mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <path
            d="M11.7 17.2 17.2 11.7a3.7 3.7 0 0 1 5.2 5.2l-2.1 2.1"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="m20.3 14.8-5.5 5.5a3.7 3.7 0 0 1-5.2-5.2l2.1-2.1"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="m13.5 18.4 5-5"
            stroke="var(--copper)"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {!compact && <span>Relay</span>}
    </span>
  );
}
