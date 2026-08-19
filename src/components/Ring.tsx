/** Profile completeness, as a ring with the percentage beside it. */
export default function Ring({ value }: { value: number }) {
  const r = 26;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="ring">
      <svg width="64" height="64" viewBox="0 0 64 64" role="img" aria-label={`Profile ${value}% complete`}>
        <circle className="ring-track" cx="32" cy="32" r={r} fill="none" strokeWidth="6" />
        <circle
          className="ring-fill"
          cx="32"
          cy="32"
          r={r}
          fill="none"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
        />
      </svg>
      <div>
        <p style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>{value}%</p>
        <p className="card-sub" style={{ margin: 0 }}>Profile complete</p>
      </div>
    </div>
  );
}
