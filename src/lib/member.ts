import { api, publicApi } from './api';

/**
 * The member profile as the API returns it, and the calls that read or change it.
 *
 * The shape mirrors MemberProfile.java. Two fields are absent on purpose and worth
 * knowing about: the raw form submission, which is kept server side as evidence rather
 * than shown back, and the resume's object key, which the browser has no use for since
 * it asks for a signed URL when it wants the file.
 */
export type MemberProfile = {
  id: string;
  email: string;
  personalEmail: string | null;
  firstName: string | null;
  lastName: string | null;
  pronouns: string | null;
  majors: string | null;
  classYear: string | null;
  gradTerm: string | null;
  gradYear: number | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  discordUsername: string | null;
  allergies: string | null;
  postGradPlan: string | null;
  hasResume: boolean;
  resumeUploadedAt: string | null;
  resumeShared: boolean;
  activatedAt: string | null;
};

/** Everything a member may change. Mirrors UpdateProfileBody.java. */
export type ProfileEdits = Omit<
  MemberProfile,
  | 'id'
  | 'email'
  | 'personalEmail'
  | 'hasResume'
  | 'resumeUploadedAt'
  | 'resumeShared'
  | 'activatedAt'
>;

export const EDITABLE_KEYS = [
  'firstName',
  'lastName',
  'pronouns',
  'majors',
  'classYear',
  'gradTerm',
  'gradYear',
  'linkedinUrl',
  'githubUrl',
  'discordUsername',
  'allergies',
  'postGradPlan',
] as const satisfies readonly (keyof ProfileEdits)[];

/**
 * The API replaces the editable half of the profile wholesale rather than merging, so
 * the body has to carry every field. Building it from one list means a newly added
 * column cannot be silently dropped on save: TypeScript fails the `satisfies` above
 * until it is listed here too.
 */
export function toEdits(profile: MemberProfile): ProfileEdits {
  const edits = {} as Record<string, unknown>;
  for (const key of EDITABLE_KEYS) {
    edits[key] = profile[key];
  }
  return edits as ProfileEdits;
}

/** One rubric category, as scored. Mirrors ResumeScoreService.Category. */
export type ScoreCategory = {
  name: string;
  score: number;
  evidence: string;
  suggestion: string;
};

export type ResumeScore = {
  /** none, running, ready, failed. Scoring starts on upload, so running is normal. */
  status: 'none' | 'running' | 'ready' | 'failed';
  /** Null unless status is ready. */
  overall: number | null;
  summary: string | null;
  categories: ScoreCategory[];
  bonuses: string[];
  deductions: string[];
  /** Whether public GitHub was folded in, which makes it a different score. */
  usedGithub: boolean;
  scoredAt: string | null;
  model: string | null;
  /** The resume was replaced after this score, so it describes a file that is gone. */
  stale: boolean;
  remainingToday: number;
};

/** available is false when the API has no model key, so the page can say so up front. */
export type ResumeScoreResult = { available: boolean; score: ResumeScore };

export const memberApi = {
  load: () => api.get<MemberProfile>('/members/me'),
  save: (edits: ProfileEdits) => api.put<MemberProfile>('/members/me', edits),
  /** Sends a code to the NEW address. Nothing changes until confirmEmail succeeds. */
  requestEmailChange: (email: string) =>
    api.post<void>('/members/me/personal-email', { email }),
  confirmEmailChange: (code: string) =>
    api.post<MemberProfile>('/members/me/personal-email/verify', { code }),
  setResumeShared: (resumeShared: boolean) =>
    api.put<MemberProfile>('/members/me/sharing', { resumeShared }),
  uploadResume: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.postForm<MemberProfile>('/members/me/resume', form);
  },
  resumeUrl: () => api.get<{ url: string; expiresInSeconds: number }>('/members/me/resume'),
  deleteResume: () => api.del<MemberProfile>('/members/me/resume'),
  resumeScore: () => api.get<ResumeScoreResult>('/members/me/resume/score'),
  /** Only after a failure: uploading is what normally starts a score. */
  retryResumeScore: () => api.post<ResumeScoreResult>('/members/me/resume/score', {}),
};

export const activationApi = {
  /** 403 not a member, 409 already set up, 429 past the daily cap. */
  requestCode: (email: string) =>
    publicApi.post<{ firstName: string | null; sentTo: string; remaining: number }>(
      '/activation/request-code',
      { email },
    ),
  verifyCode: (email: string, code: string) =>
    publicApi.post<void>('/activation/verify-code', { email, code }),
  /** Replies with the address the account was created with, which may not be the one typed. */
  claim: (email: string, code: string, password: string) =>
    publicApi.post<{ email: string }>('/activation/claim', { email, code, password }),
};

/**
 * Members give two addresses on the form and remember whichever they please, but Supabase
 * only knows the school one. Resolving first is what lets either address sign in.
 */
export const authApi = {
  resolveEmail: (email: string) =>
    publicApi.post<{ email: string }>('/auth/resolve-email', { email }),
};
