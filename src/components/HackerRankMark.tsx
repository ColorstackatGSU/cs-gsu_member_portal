/**
 * HackerRank's own icon, from Wikimedia Commons, used to credit the rubric behind the
 * resume score. Their mark, not an approximation of it.
 */
export default function HackerRankMark({ size = 34 }: { size?: number }) {
  return (
    <img
      src="/images/hackerrank.png"
      alt="HackerRank"
      width={size}
      height={size}
      style={{ flex: 'none', display: 'block', border: '2px solid var(--ink)' }}
    />
  );
}
