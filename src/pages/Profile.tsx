import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { memberApi, toEdits } from '../lib/member';
import type { MemberProfile } from '../lib/member';
import { completeness } from '../lib/progress';
import { ApiError } from '../lib/api';
import Field from '../components/Field';
import Notice from '../components/Notice';

/**
 * Everything the member can change about themselves, plus their resume.
 *
 * The intake form asks more than this page shows. The 1-to-5 interest ratings in
 * particular are planning input for the officers, not facts about the member, so they
 * stay in the spreadsheet and are not surfaced or edited here. They still ride along in
 * the save payload untouched, because the API replaces the editable half of the row
 * wholesale and dropping them from the body would clear the columns.
 *
 * Saving posts every editable field rather than a diff. Over JSON there is no way to
 * tell "field omitted" from "field cleared" without a wrapper type on every column, and
 * getting that wrong silently wipes data.
 */

const CLASS_YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior'];

function message(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Something went wrong. Try again in a moment.';
}

function initials(p: MemberProfile): string {
  const letters = [p.firstName?.[0], p.lastName?.[0]].filter(Boolean).join('');
  return (letters || p.email[0] || '?').toUpperCase();
}

export default function Profile() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [form, setForm] = useState<MemberProfile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [emailStep, setEmailStep] = useState<'idle' | 'enter' | 'code'>('idle');
  const [newEmail, setNewEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailNote, setEmailNote] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    memberApi
      .load()
      .then((p) => {
        setProfile(p);
        setForm(p);
      })
      .catch((e) => setLoadError(message(e)));
  }, []);

  // Comparing against the loaded copy is what decides whether the save bar appears, so
  // the page stays calm while reading and is unmissable once something has changed.
  const dirty = useMemo(
    () => (profile && form ? JSON.stringify(toEdits(profile)) !== JSON.stringify(toEdits(form)) : false),
    [profile, form],
  );

  const pct = useMemo(() => (form ? completeness(form) : 0), [form]);

  function set<K extends keyof MemberProfile>(key: K, value: MemberProfile[K]) {
    setSaved(false);
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  /** Empty inputs mean "no answer", not an empty string, so the column clears properly. */
  function setText(key: keyof MemberProfile, value: string) {
    set(key, (value.trim() === '' ? null : value) as MemberProfile[typeof key]);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setError(null);
    setBusy(true);
    try {
      const next = await memberApi.save(toEdits(form));
      setProfile(next);
      setForm(next);
      setSaved(true);
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(false);
    }
  }

  function cancelEmailChange() {
    setEmailStep('idle');
    setNewEmail('');
    setEmailCode('');
    setEmailError(null);
    setEmailNote(null);
  }

  async function requestEmailChange() {
    setEmailError(null);
    setEmailNote(null);
    setBusy(true);
    try {
      await memberApi.requestEmailChange(newEmail);
      setEmailStep('code');
    } catch (err) {
      setEmailError(message(err));
    } finally {
      setBusy(false);
    }
  }

  async function confirmEmailChange() {
    setEmailError(null);
    setBusy(true);
    try {
      const next = await memberApi.confirmEmailChange(emailCode);
      // Only the address, so an unsaved profile edit is not clobbered by the reply.
      setProfile((p) => (p ? { ...p, personalEmail: next.personalEmail } : next));
      setForm((f) => (f ? { ...f, personalEmail: next.personalEmail } : next));
      cancelEmailChange();
      setEmailNote('Personal email updated.');
    } catch (err) {
      setEmailError(message(err));
    } finally {
      setBusy(false);
    }
  }

  function pickResume(p: MemberProfile) {
    return { hasResume: p.hasResume, resumeUploadedAt: p.resumeUploadedAt };
  }

  async function upload(file: File) {
    setError(null);
    setBusy(true);
    try {
      const next = await memberApi.uploadResume(file);
      setProfile((p) => (p ? { ...p, ...pickResume(next) } : next));
      setForm((f) => (f ? { ...f, ...pickResume(next) } : next));
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  async function openResume() {
    setError(null);
    try {
      const { url } = await memberApi.resumeUrl();
      // A short-lived signed URL, so it is opened rather than stored anywhere.
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      setError(message(err));
    }
  }

  async function removeResume() {
    setError(null);
    setBusy(true);
    try {
      const next = await memberApi.deleteResume();
      setProfile((p) => (p ? { ...p, ...pickResume(next) } : next));
      setForm((f) => (f ? { ...f, ...pickResume(next) } : next));
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(false);
    }
  }

  if (loadError) {
    return (
      <section className="portal-pad">
        <div className="container-wide" style={{ maxWidth: 820 }}>
          <Notice kind="error">{loadError}</Notice>
        </div>
      </section>
    );
  }

  if (!profile || !form) {
    // Matches the real layout so the page does not reflow when the data lands.
    return (
      <section className="portal-pad">
        <div className="container-wide" style={{ maxWidth: 820, display: 'grid', gap: 18 }}>
          <div className="skeleton" style={{ height: 112 }} />
          <div className="skeleton" style={{ height: 260 }} />
          <div className="skeleton" style={{ height: 160 }} />
        </div>
      </section>
    );
  }

  return (
    <section className="portal-pad">
      <div className="container-wide" style={{ maxWidth: 820 }}>
        <div className="card fade-in-up">
          <div className="identity">
            <div className="avatar" aria-hidden="true">{initials(profile)}</div>
            <div style={{ flex: '1 1 240px', minWidth: 0 }}>
              <h1 style={{ fontSize: 'clamp(20px, 2.6vw, 25px)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
                {[profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Your profile'}
              </h1>
              <p className="muted" style={{ fontSize: 13.5, margin: '3px 0 0', wordBreak: 'break-word' }}>
                {profile.email}
              </p>
              <div className="chip-row">
                {profile.classYear && <span className="chip">{profile.classYear}</span>}
                {profile.majors && <span className="chip">{profile.majors}</span>}
                {profile.gradTerm && profile.gradYear && (
                  <span className="chip">{profile.gradTerm} {profile.gradYear}</span>
                )}
                {profile.resumeShared && <span className="chip chip-accent">Visible to sponsors</span>}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: 12.5 }}>
              <span className="muted">Profile complete</span>
              <span style={{ fontWeight: 600 }}>{pct}%</span>
            </div>
            <div
              className="meter"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Profile completeness"
            >
              <div className="meter-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        {error && <Notice kind="error" style={{ marginTop: 18 }}>{error}</Notice>}

        <form onSubmit={save}>
          <div className="card fade-in-up fade-delay-1" style={{ marginTop: 18 }}>
            <div className="card-head">
              <h2 className="card-title">About you</h2>
            </div>
            <div className="field-grid">
              <Field id="firstName" label="First name" value={form.firstName ?? ''} onChange={(v) => setText('firstName', v)} />
              <Field id="lastName" label="Last name" value={form.lastName ?? ''} onChange={(v) => setText('lastName', v)} />
              <Field
                id="email"
                label="School email"
                value={form.email}
                disabled
                hint="Email official@colorstackatgsu.com to change this."
              />
              <Field
                id="personalEmail"
                label="Personal email"
                value={form.personalEmail ?? 'Not set'}
                disabled
                hint="Also works to sign in."
              />
              <Field
                id="pronouns"
                label="Pronouns"
                value={form.pronouns ?? ''}
                placeholder="she/her, he/him, they/them"
                onChange={(v) => setText('pronouns', v)}
              />
              <Field id="majors" label="Major(s)" value={form.majors ?? ''} onChange={(v) => setText('majors', v)} />
              <Field id="classYear" label="Year">
                <select
                  id="classYear"
                  className="field-input"
                  value={form.classYear ?? ''}
                  onChange={(e) => setText('classYear', e.target.value)}
                >
                  <option value="">Select one</option>
                  {CLASS_YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </Field>
              <Field id="gradTerm" label="Graduation term">
                <select
                  id="gradTerm"
                  className="field-input"
                  value={form.gradTerm ?? ''}
                  onChange={(e) => setText('gradTerm', e.target.value)}
                >
                  <option value="">Not sure yet</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="Fall">Fall</option>
                </select>
              </Field>
              <Field
                id="gradYear"
                label="Graduation year"
                inputMode="numeric"
                value={form.gradYear === null ? '' : String(form.gradYear)}
                placeholder="2027"
                onChange={(v) => {
                  const n = Number.parseInt(v, 10);
                  set('gradYear', v.trim() === '' || Number.isNaN(n) ? null : n);
                }}
              />
            </div>
          </div>

          <div className="card fade-in-up fade-delay-2" style={{ marginTop: 18 }}>
            <div className="card-head">
              <h2 className="card-title">Links</h2>
            </div>
            <div className="field-grid">
              <Field id="linkedinUrl" label="LinkedIn" type="url" value={form.linkedinUrl ?? ''} onChange={(v) => setText('linkedinUrl', v)} />
              <Field id="githubUrl" label="GitHub" type="url" value={form.githubUrl ?? ''} onChange={(v) => setText('githubUrl', v)} />
              <Field
                id="discordUsername"
                label="Discord"
                value={form.discordUsername ?? ''}
                onChange={(v) => setText('discordUsername', v)}
                hint="Used to verify you on our server."
              />
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 18, flexWrap: 'wrap' }}>
              <label className="check">
                <input
                  type="checkbox"
                  checked={form.followsInstagram ?? false}
                  onChange={(e) => set('followsInstagram', e.target.checked)}
                />
                I follow @colorstackatgsu
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={form.nationalMemberApplied ?? false}
                  onChange={(e) => set('nationalMemberApplied', e.target.checked)}
                />
                I applied for national membership
              </label>
            </div>
          </div>

          <div className="card fade-in-up fade-delay-3" style={{ marginTop: 18 }}>
            <div className="card-head">
              <h2 className="card-title">A bit more</h2>
            </div>
            <Field id="postGradPlan" label="Plans after graduation">
              <textarea
                id="postGradPlan"
                className="field-input"
                rows={3}
                value={form.postGradPlan ?? ''}
                onChange={(e) => setText('postGradPlan', e.target.value)}
              />
            </Field>
            <Field
              id="allergies"
              label="Allergies"
              value={form.allergies ?? ''}
              onChange={(v) => setText('allergies', v)}
              hint="Only used when we order food. Never shared."
              style={{ marginTop: 16 }}
            />
          </div>

          {/* Only once something has changed. */}
          {(dirty || saved) && (
            <div className="save-bar fade-in-up" style={{ marginTop: 18 }}>
              <span className="muted" style={{ fontSize: 13.5 }}>
                {dirty ? 'Unsaved changes' : 'Saved'}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                {dirty && (
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    disabled={busy}
                    onClick={() => {
                      setForm(profile);
                      setSaved(false);
                    }}
                  >
                    Discard
                  </button>
                )}
                <button type="submit" className="btn-primary btn-sm" disabled={busy || !dirty}>
                  {busy ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          )}
        </form>

        <div id="resume" className="card fade-in-up" style={{ marginTop: 18, scrollMarginTop: 20 }}>
          <div className="card-head">
            <h2 className="card-title">Resume</h2>
            <span className={profile.resumeShared ? 'pill pill-on' : 'pill pill-off'}>
              {profile.resumeShared ? 'Shared with sponsors' : 'Private'}
            </span>
          </div>

          <div className="resume-drop">
            <div style={{ flex: '1 1 220px' }}>
              <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600 }}>
                {profile.hasResume ? 'resume.pdf' : 'No resume yet'}
              </p>
              <p className="card-sub" style={{ margin: '3px 0 0' }}>
                {profile.hasResume && profile.resumeUploadedAt
                  ? `Uploaded ${new Date(profile.resumeUploadedAt).toLocaleDateString()}`
                  : 'PDF, up to 5 MB.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {profile.hasResume ? (
                <>
                  <button type="button" className="btn-secondary btn-sm" onClick={openResume}>View</button>
                  <button type="button" className="btn-secondary btn-sm" disabled={busy} onClick={() => fileInput.current?.click()}>
                    Replace
                  </button>
                  <button type="button" className="btn-secondary btn-sm btn-danger" disabled={busy} onClick={removeResume}>
                    Remove
                  </button>
                </>
              ) : (
                <button type="button" className="btn-primary btn-sm" disabled={busy} onClick={() => fileInput.current?.click()}>
                  {busy ? 'Uploading...' : 'Upload a PDF'}
                </button>
              )}
            </div>
          </div>

          <input
            ref={fileInput}
            type="file"
            accept="application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
        </div>

        <div className="card fade-in-up" style={{ marginTop: 18 }}>
          <div className="card-head">
            <h2 className="card-title">Personal email</h2>
          </div>

          {emailStep === 'idle' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14.5, flex: '1 1 220px' }}>
                {profile.personalEmail ?? 'Not set'}
              </span>
              <button type="button" className="btn-secondary btn-sm" onClick={() => setEmailStep('enter')}>
                {profile.personalEmail ? 'Change' : 'Add'}
              </button>
            </div>
          )}

          {emailStep === 'enter' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void requestEmailChange();
              }}
            >
              <Field
                id="newPersonalEmail"
                label="New personal email"
                type="email"
                value={newEmail}
                placeholder="you@example.com"
                onChange={setNewEmail}
                hint="We will send a code there."
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                <button type="submit" className="btn-primary btn-sm" disabled={busy || !newEmail.trim()}>
                  {busy ? 'Sending...' : 'Send code'}
                </button>
                <button type="button" className="btn-secondary btn-sm" onClick={cancelEmailChange}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          {emailStep === 'code' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void confirmEmailChange();
              }}
            >
              <p className="card-sub" style={{ margin: '0 0 12px' }}>
                Code sent to <strong style={{ fontWeight: 600 }}>{newEmail}</strong>.
              </p>
              <input
                inputMode="numeric"
                maxLength={6}
                className="code-input"
                placeholder="000000"
                autoComplete="one-time-code"
                aria-label="Confirmation code"
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                <button type="submit" className="btn-primary btn-sm" disabled={busy || emailCode.length !== 6}>
                  {busy ? 'Confirming...' : 'Confirm'}
                </button>
                <button type="button" className="btn-secondary btn-sm" onClick={cancelEmailChange}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          {emailError && <Notice kind="error" style={{ marginTop: 14 }}>{emailError}</Notice>}
          {emailNote && !emailError && <Notice style={{ marginTop: 14 }}>{emailNote}</Notice>}
        </div>

        <p style={{ marginTop: 18 }}>
          <Link to="/settings" className="muted" style={{ fontSize: 13 }}>
            Sharing and account settings &rarr;
          </Link>
        </p>
      </div>
    </section>
  );
}
