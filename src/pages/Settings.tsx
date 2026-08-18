import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { memberApi } from '../lib/member';
import type { MemberProfile } from '../lib/member';
import { ApiError } from '../lib/api';
import { useAuth } from '../auth/context';
import Notice from '../components/Notice';

/**
 * Where a member changes their mind about sponsor visibility, and signs out.
 *
 * Consent lives on its own page and its own endpoint rather than as a checkbox on the
 * profile form. Saving a major should never be the thing that hands a resume to a
 * recruiter, so turning sharing on or off is always a deliberate act.
 */
function message(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Something went wrong. Try again in a moment.';
}

export default function Settings() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    memberApi.load().then(setProfile).catch((e) => setError(message(e)));
  }, []);

  async function toggle(shared: boolean) {
    setError(null);
    setBusy(true);
    try {
      setProfile(await memberApi.setResumeShared(shared));
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }

  async function onSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <section className="portal-pad">
      <div className="container-wide" style={{ maxWidth: 680 }}>
        <div className="fade-in-up">
          <p className="section-eyebrow" style={{ marginBottom: 14 }}>Member Portal</p>
          <h1 style={{ fontSize: 'clamp(24px, 3.2vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            Settings
          </h1>
        </div>

        {error && (
          <Notice kind="error" style={{ marginTop: 20 }}>{error}</Notice>
        )}

        {!profile ? (
          <div style={{ display: 'grid', gap: 20, marginTop: 20 }}>
            <div className="skeleton" style={{ height: 190 }} />
            <div className="skeleton" style={{ height: 130 }} />
          </div>
        ) : (
          <>
            <div className="card fade-in-up fade-delay-1" style={{ marginTop: 20 }}>
              <div className="card-head" style={{ display: 'block', marginBottom: 18 }}>
                <h2 className="card-title">Sponsors and recruiters</h2>
                <p className="card-sub">
                  Our sponsors ask for a resume book as part of their partnership. Turning this on puts your resume in
                  it. Turning it off keeps it visible only to you and the chapter officers. Nothing else on your profile
                  is shared either way, and your allergies never are.
                </p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={profile.resumeShared}
                  disabled={busy}
                  onChange={(e) => toggle(e.target.checked)}
                />
                <span className="switch-track" />
                <span style={{ fontSize: 14.5 }}>
                  {profile.resumeShared
                    ? 'My resume is visible to sponsors'
                    : 'My resume is private'}
                </span>
              </label>

              {!profile.hasResume && profile.resumeShared && (
                <Notice kind="warn" style={{ marginTop: 18 }}>
                  You have not uploaded a resume yet, so there is nothing to share.{' '}
                  <Link to="/profile" style={{ textDecoration: 'underline' }}>Upload one</Link>.
                </Notice>
              )}
            </div>

            <div className="card fade-in-up fade-delay-2" style={{ marginTop: 20 }}>
              <div className="card-head" style={{ display: 'block', marginBottom: 18 }}>
                <h2 className="card-title">Account</h2>
                <p className="card-sub">Signed in as {profile.email}.</p>
              </div>
              <button type="button" className="btn-secondary" onClick={onSignOut}>
                Sign out
              </button>
            </div>
          </>
        )}

        <p style={{ marginTop: 20 }}>
          <Link to="/profile" style={{ fontSize: 13, textDecoration: 'underline' }}>
            Back to my profile
          </Link>
        </p>
      </div>
    </section>
  );
}
