/** Profile completeness, as a ring with the percentage beside it. */
export default function Ring({ value }: { value: number }) {
  const r = 24;
  const circumference = 2 * Math.PI * r;

  // ring-stat, not ring: Tailwind ships a `.ring` utility of its own, and it wins.
  return (
    <div className="ring-stat">
      {/* Thick stroke, butt caps, no taper: the arc reads as a filled sector rather
          than a hairline, which is what makes it survive next to a block of text. */}
      <svg width="64" height="64" viewBox="0 0 64 64" role="img" aria-label={`Profile ${value}% complete`}>
        <circle className="ring-track" cx="32" cy="32" r={r} fill="none" strokeWidth="11" />
        <circle
          className="ring-fill"
          cx="32"
          cy="32"
          r={r}
          fill="none"
          strokeWidth="11"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
        />
      </svg>
      <div>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>
          {value}%
        </p>
        <p
          style={{
            margin: '5px 0 0',
            fontFamily: 'var(--mono)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
          }}
        >
          Profile complete
        </p>
      </div>
    </div>
  );
}
