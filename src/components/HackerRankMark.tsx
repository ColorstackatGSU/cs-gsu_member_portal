/**
 * The HackerRank mark, drawn rather than fetched.
 *
 * An inline SVG so it needs no asset, no network request and no build step, and so it
 * inherits crispness at any size. Their green and their letterform, used to credit the
 * rubric the score is built on.
 */
export default function HackerRankMark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label="HackerRank"
      style={{ flex: 'none', display: 'block' }}
    >
      <rect width="24" height="24" rx="5.5" fill="#2EC866" />
      <path
        d="M9.1 6.4h1.9v4.2h2.1V6.4h1.9v11.2h-1.9v-4.4h-2.1v4.4H9.1z"
        fill="#fff"
      />
    </svg>
  );
}
