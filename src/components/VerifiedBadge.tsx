/**
 * "Verified" next to the Discord handle, once the member has proved they hold the account.
 *
 * The distinction is worth drawing on this screen more than anywhere else. The Discord
 * field is free text — a member types a handle, and nothing about typing it makes it
 * theirs. It becomes verified when they click **Verify Membership** in the chapter server
 * and the bot matches this record to that account.
 *
 * So the badge is not decoration: its absence is the answer to "why did the server not
 * give me my roles", which is the single most common thing members ask about.
 *
 * Never colour alone — it always carries the word.
 */
export default function VerifiedBadge({ verifiedAt }: { verifiedAt: string | null }) {
  if (!verifiedAt) return null;

  return (
    <span
      className="chip chip-verified"
      title={`Verified on Discord ${new Date(verifiedAt).toLocaleDateString()}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 12.5l5.5 5.5L20 6" />
      </svg>
      Verified
    </span>
  );
}
