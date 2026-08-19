import type { MemberProfile } from './member';

/**
 * How complete a profile is, and what to nudge next.
 *
 * This lives apart from the API layer because two pages depend on it agreeing with
 * itself: the dashboard shows the percentage and the suggestions, the profile shows
 * the same percentage next to the fields that move it. Deriving both from one list is
 * what stops the meter saying 80% while the dashboard has nothing left to suggest.
 */

/** What counts towards a complete profile. Resume is scored separately, below. */
const SCORED: (keyof MemberProfile)[] = [
  'firstName',
  'lastName',
  'pronouns',
  'majors',
  'classYear',
  'gradTerm',
  'gradYear',
  'linkedinUrl',
  'discordUsername',
  'postGradPlan',
];

function filled(p: MemberProfile, key: keyof MemberProfile): boolean {
  const v = p[key];
  return v !== null && v !== undefined && String(v).trim() !== '';
}

export function completeness(p: MemberProfile): number {
  const done = SCORED.filter((k) => filled(p, k)).length + (p.hasResume ? 1 : 0);
  return Math.round((done / (SCORED.length + 1)) * 100);
}

export type Suggestion = {
  id: string;
  title: string;
  body: string;
  /** Where the member goes to act on it. */
  to: string;
  cta: string;
  /** Marks the one or two that actually cost the member opportunities. */
  urgent?: boolean;
};

/**
 * Ordered by what it costs the member to ignore, not by how easy it is to fix. A missing
 * resume is first because it is the one thing every sponsor asks for, and visibility is
 * second because a resume nobody can see does the same amount of nothing.
 */
export function suggestions(p: MemberProfile): Suggestion[] {
  const out: Suggestion[] = [];

  if (!p.hasResume) {
    out.push({
      id: 'resume',
      title: 'Upload your resume',
      body: 'This is the one thing sponsors always ask for. Without it you are not in the resume book.',
      to: '/profile#resume',
      cta: 'Upload a PDF',
      urgent: true,
    });
  }

  if (!p.resumeShared) {
    out.push({
      id: 'sharing',
      title: 'Turn on sponsor visibility',
      body: 'Your profile is hidden from recruiters right now, so you will not show up when sponsors ask who our members are.',
      to: '/settings',
      cta: 'Review sharing',
      urgent: true,
    });
  }

  if (!filled(p, 'linkedinUrl')) {
    out.push({
      id: 'linkedin',
      title: 'Add your LinkedIn',
      body: 'It is the first place a recruiter looks after your resume.',
      to: '/profile',
      cta: 'Add a link',
    });
  }

  if (!filled(p, 'discordUsername')) {
    out.push({
      id: 'discord',
      title: 'Add your Discord username',
      body: 'We use it to verify you on the chapter server, where events and opportunities get posted first.',
      to: '/profile',
      cta: 'Add it',
    });
  }

  if (!filled(p, 'gradTerm') || !filled(p, 'gradYear')) {
    out.push({
      id: 'grad',
      title: 'Tell us when you graduate',
      body: 'Sponsors filter the resume book by graduation date, so a blank one gets skipped.',
      to: '/profile',
      cta: 'Set a date',
    });
  }

  if (!filled(p, 'majors') || !filled(p, 'classYear')) {
    out.push({
      id: 'academic',
      title: 'Fill in your major and year',
      body: 'Two fields, and they decide which opportunities we forward to you.',
      to: '/profile',
      cta: 'Complete it',
    });
  }

  if (!filled(p, 'postGradPlan')) {
    out.push({
      id: 'plan',
      title: 'Share what you want after graduation',
      body: 'It helps us aim the semester at what members are actually going for.',
      to: '/profile',
      cta: 'Write a line',
    });
  }

  return out;
}
