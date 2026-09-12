import type { MemberProfile } from './member';

/**
 * The race and ethnicity categories, and the rules about answering.
 *
 * These are the seven minimum reporting categories from OMB's 2024 revision to
 * Statistical Policy Directive 15. The revision is why this is one multi-select question
 * rather than the older "are you Hispanic?" followed by "what is your race?", and why
 * Middle Eastern or North African stands on its own instead of folding into White.
 *
 * Listed once, here, because three places need the same list and they must not drift:
 * this file, UpdateProfileBody's @Pattern, and members_race_ethnicity_known. A value that
 * exists in only two of the three is a 400 the member cannot do anything about.
 */
export const RACE_ETHNICITY_OPTIONS = [
  'American Indian or Alaska Native',
  'Asian',
  'Black or African American',
  'Hispanic or Latino',
  'Middle Eastern or North African',
  'Native Hawaiian or Pacific Islander',
  'White',
] as const;

/**
 * Not a category, and deliberately not in the list above.
 *
 * It is a complete answer on its own and cannot be combined with a real category, which
 * the table enforces. Declining has to be as easy as answering, or the number this column
 * exists to produce is one members felt cornered into.
 */
export const PREFER_NOT_TO_SAY = 'Prefer not to say';

/**
 * Whether the portal should stop and ask.
 *
 * Null is never answered. Anything with at least one element is answered, including the
 * decline, so a member who says "prefer not to say" is asked exactly once and never
 * again. An empty array cannot reach here — the API turns it into null — but it is
 * treated as unanswered anyway rather than trusted.
 */
export function needsEthnicity(p: Pick<MemberProfile, 'raceEthnicity'>): boolean {
  return !p.raceEthnicity || p.raceEthnicity.length === 0;
}

/**
 * Toggling one checkbox, with the exclusivity rule applied.
 *
 * Picking a real category clears the decline and picking the decline clears everything
 * else, so the two can never be selected together. Doing it here rather than in the form
 * means the gate and the profile page cannot disagree about it.
 */
export function toggleCategory(current: string[], value: string): string[] {
  if (value === PREFER_NOT_TO_SAY) {
    return current.includes(PREFER_NOT_TO_SAY) ? [] : [PREFER_NOT_TO_SAY];
  }
  const withoutDecline = current.filter((v) => v !== PREFER_NOT_TO_SAY);
  return withoutDecline.includes(value)
    ? withoutDecline.filter((v) => v !== value)
    : [...withoutDecline, value];
}
