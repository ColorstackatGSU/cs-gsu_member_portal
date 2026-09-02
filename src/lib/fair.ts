import { publicApi } from './api';

/**
 * The tabling flow, which is the one part of this app that serves people who are not
 * members and may never become members.
 *
 * Unauthenticated throughout, so every call goes through publicApi. Mirrors
 * FairController on the backend.
 */

/** Mirrors FairController.EventInfo. */
export type FairEvent = {
  eventName: string;
  /** Blank when the backend has the domain check switched off. */
  studentEmailDomain: string;
};

/** Mirrors FairService.SignedUp. */
export type FairSignUp = {
  firstName: string | null;
  eventName: string;
  /** none, unclaimed (form filled, no password yet), or activated. */
  memberStatus: 'none' | 'unclaimed' | 'activated';
  /**
   * False when the address was already emailed inside the cooldown, or when the send
   * itself failed. Attendance is recorded either way, which is why this rides on a
   * success rather than throwing.
   */
  emailed: boolean;
  sentTo: string;
  /** The same link the email carries, so someone whose mail is slow can tap it here. */
  formUrl: string;
};

export type FairSignUpInput = {
  firstName: string;
  lastName: string;
  email: string;
  studentEmail: string;
  /** The honeypot. Always sent empty by the form; only a bot fills it in. */
  company: string;
};

export const fairApi = {
  event: () => publicApi.get<FairEvent>('/fair/event'),
  signUp: (input: FairSignUpInput) => publicApi.post<FairSignUp>('/fair/signup', input),
};
