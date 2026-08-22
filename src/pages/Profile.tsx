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
 * Everything the member can change about themselves. The resume has its own page.
 *
 * The intake form asks more than this page shows. Whatever has no column of its own,
 * the interest ratings included, stays in the raw submission the API archives.
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
  const avatarInput = useRef<HTMLInputElement>(null);
  const [emailStep, setEmailStep] = useState<'idle' | 'enter' | 'code'>('idle');
  const [newEmail, setNewEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailNote, setEmailNote] = useState<string | null>(null);

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

  async function uploadAvatar(file: File) {
    setError(null);
    setBusy(true);
    try {
      const next = await memberApi.uploadAvatar(file);
      // Only the picture, so an unsaved edit elsewhere on the form survives.
      setProfile((p) => (p ? { ...p, avatarUrl: next.avatarUrl } : next));
      setForm((f) => (f ? { ...f, avatarUrl: next.avatarUrl } : next));
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(false);
      if (avatarInput.current) avatarInput.current.value = '';
    }
  }

  async function removeAvatar() {
    setError(null);
    setBusy(true);
    try {
      const next = await memberApi.deleteAvatar();
      setProfile((p) => (p ? { ...p, avatarUrl: next.avatarUrl } : next));
      setForm((f) => (f ? { ...f, avatarUrl: next.avatarUrl } : next));
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(false);
    }
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
        <div className="card fade-in-up" style={{ background: '#091024', color: '#ffffff', border: 'none' }}>
          <div className="identity">
            <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                className="avatar-slot"
                onClick={() => !busy && avatarInput.current?.click()}
                title={profile.avatarUrl ? 'Click to change photo' : 'Click to add photo'}
              >
                {profile.avatarUrl ? (
                  <img className="avatar-photo" src={profile.avatarUrl} alt="" />
                ) : (
                  <div className="avatar-initials" aria-hidden="true">{initials(profile)}</div>
                )}
                <div className="avatar-overlay">
                  {profile.avatarUrl ? 'Change' : 'Add photo'}
                </div>
              </div>
              {profile.avatarUrl && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={(e) => {
                    e.stopPropagation();
                    void removeAvatar();
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px 0 0',
                    fontSize: '11px',
                    fontFamily: 'var(--mono)',
                    color: 'rgba(255, 255, 255, 0.55)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              )}
              <input
                ref={avatarInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadAvatar(file);
                }}
              />
            </div>
            <div style={{ flex: '1 1 240px', minWidth: 0 }}>
              <h1 style={{ fontSize: 'clamp(20px, 2.6vw, 25px)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: '#ffffff' }}>
                {[profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Your profile'}
              </h1>
              <p style={{ fontSize: 13.5, margin: '3px 0 0', wordBreak: 'break-word', color: 'rgba(255, 255, 255, 0.7)' }}>
                {profile.email}
              </p>
              <div className="chip-row">
                {profile.classYear && (
                  <span className="chip" style={{ background: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}>
                    {profile.classYear}
                  </span>
                )}
                {profile.majors && (
                  <span className="chip" style={{ background: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}>
                    {profile.majors}
                  </span>
                )}
                {profile.gradTerm && profile.gradYear && (
                  <span className="chip" style={{ background: 'rgba(255, 255, 255, 0.12)', color: '#ffffff' }}>
                    {profile.gradTerm} {profile.gradYear}
                  </span>
                )}
                {profile.resumeShared && (
                  <span className="chip chip-accent" style={{ background: '#ffffff', color: '#091024' }}>
                    Visible to sponsors
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: 12.5 }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Profile complete</span>
              <span style={{ fontWeight: 600, color: '#ffffff' }}>{pct}%</span>
            </div>
            <div
              className="meter"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Profile completeness"
              style={{ background: 'rgba(255, 255, 255, 0.12)' }}
            >
              <div className="meter-fill" style={{ width: `${pct}%`, background: '#ffffff' }} />
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
                hint="Email official@colorstackatgsu.com to change."
              />
              <Field id="personalEmail" label="Personal email" hint="Also works to sign in.">
                <div className="field-static">
                  <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {profile.personalEmail ?? 'Not set'}
                  </span>
                  {/* type="button" matters: this sits inside the profile save form. */}
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => setEmailStep(emailStep === 'idle' ? 'enter' : 'idle')}
                  >
                    {emailStep === 'idle' ? (profile.personalEmail ? 'Change' : 'Add') : 'Cancel'}
                  </button>
                </div>
              </Field>
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

            {/* Changing the address you can sign in with is not a profile edit, so it
                proves you receive mail there before it takes effect. Buttons rather than
                a nested form: this card lives inside the profile's save form. */}
            {emailStep !== 'idle' && (
              <div className="subpanel">
                {emailStep === 'enter' ? (
                  <>
                    <Field
                      id="newPersonalEmail"
                      label="New personal email"
                      type="email"
                      value={newEmail}
                      placeholder="you@example.com"
                      onChange={setNewEmail}
                      hint="We send a code there."
                    />
                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      style={{ marginTop: 14 }}
                      disabled={busy || !newEmail.trim()}
                      onClick={() => void requestEmailChange()}
                    >
                      {busy ? 'Sending...' : 'Send code'}
                    </button>
                  </>
                ) : (
                  <>
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
                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      style={{ marginTop: 14 }}
                      disabled={busy || emailCode.length !== 6}
                      onClick={() => void confirmEmailChange()}
                    >
                      {busy ? 'Confirming...' : 'Confirm'}
                    </button>
                  </>
                )}

                {emailError && <Notice kind="error" style={{ marginTop: 14 }}>{emailError}</Notice>}
                {emailNote && !emailError && <Notice style={{ marginTop: 14 }}>{emailNote}</Notice>}
              </div>
            )}
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
                hint="For server verification."
              />
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

        <p style={{ marginTop: 18 }}>
          <Link
            to="/settings"
            className="text-link"
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Sharing and account settings &rarr;
          </Link>
        </p>
      </div>
    </section>
  );
}
