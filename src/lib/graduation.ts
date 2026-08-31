import type { MemberProfile } from './member';

/**
 * The graduation term and year, and the one rule about them.
 *
 * The terms are the three the database allows. members_grad_term_known rejects anything
 * else and UpdateProfileBody mirrors it with a @Pattern, so a fourth option here would be
 * a 400 the member cannot do anything about. Listed once so the gate and the profile form
 * cannot drift apart.
 */
export const GRAD_TERMS = ['Spring', 'Summer', 'Fall'] as const;

/**
 * Years are generated rather than written down, because a hardcoded list is a list that
 * goes stale in August. The window reaches back a year for anyone finishing late and
 * forward far enough for a freshman on a five year path.
 */
export function gradYears(now: Date = new Date()): number[] {
  const first = now.getFullYear() - 1;
  return Array.from({ length: 10 }, (_, i) => first + i);
}

/**
 * Whether the portal should stop and ask.
 *
 * Both halves are required together. A year on its own is the shape the old free text
 * question produced when someone answered "2029", and it is no more useful to a sponsor
 * filtering the resume book than an empty column is.
 */
export function needsGraduation(p: Pick<MemberProfile, 'gradTerm' | 'gradYear'>): boolean {
  return !p.gradTerm || !p.gradYear;
}
