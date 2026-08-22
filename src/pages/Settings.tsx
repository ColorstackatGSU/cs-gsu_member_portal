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
 * Sharing is on by default, so this page is where someone opts out rather than in. It has
 * its own page and its own endpoint rather than being a checkbox on the profile form:
 * saving a major should never be the thing that changes who can see a resume.
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
        <div className="fade-in-up page-head">
          <p className="section-eyebrow" style={{ marginBottom: 14 }}>Member Portal</p>
          <h1 className="page-title">Settings</h1>
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
              <div className="card-head" style={{ display: 'block', marginBottom: 16 }}>
                <h2 className="card-title">Sponsor visibility</h2>
                <p className="card-sub">Your resume goes in the sponsor resume book.</p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={profile.resumeShared}
                  disabled={busy}
                  onChange={(e) => toggle(e.target.checked)}
                />
                <span className="switch-track" />
                <span
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  {profile.resumeShared ? 'Visible to sponsors' : 'Private'}
                </span>
              </label>

              {!profile.hasResume && profile.resumeShared && (
                <Notice kind="warn" style={{ marginTop: 16 }}>
                  No resume uploaded yet, so there is nothing to share.{' '}
                  <Link to="/resume" style={{ textDecoration: 'underline' }}>Upload one</Link>.
                </Notice>
              )}
            </div>

            <div className="card fade-in-up fade-delay-2" style={{ marginTop: 20 }}>
              <div className="card-head" style={{ display: 'block', marginBottom: 18 }}>
                <h2 className="card-title">Account</h2>
                <p className="card-sub">Signed in as {profile.email}.</p>
              </div>
              <button type="button" className="btn-secondary btn-sm" onClick={onSignOut}>
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
