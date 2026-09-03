import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    memberApi.load().then(setProfile).catch((e) => setError(message(e)));
  }, []);

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
            <div className="skeleton" style={{ height: 130 }} />
          </div>
        ) : (
          <>
            <div className="card fade-in-up fade-delay-1" style={{ marginTop: 20 }}>
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
