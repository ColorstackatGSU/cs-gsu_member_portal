import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { memberApi } from '../lib/member';
import type { MemberProfile } from '../lib/member';
import { ApiError } from '../lib/api';
import { useAuth } from '../auth/context';
import Notice from '../components/Notice';
import ConnectedSites from '../components/ConnectedSites';

/**
 * Where a member changes their mind about who can see what, and signs out.
 *
 * Sharing is on by default, so this page is where someone opts out rather than in. It has
 * its own page and its own endpoint rather than being a checkbox on the profile form:
 * saving a major should never be the thing that changes who can see a resume.
 *
 * Connected sites live here for the same reason. Revoking another site's access is the
 * same kind of act as changing sponsor visibility — a decision about reach, made on
 * purpose — and it belongs next to it rather than on the profile form or behind its own
 * nav item most members would never have a reason to open.
 *
 * Messages are the third decision about reach. Email is on from the day someone joins and
 * this is where they turn it off. Texts are the other way round: off until somebody turns
 * them on here, because a text is a bigger intrusion than an email and US carriers want a
 * yes that was given on purpose.
 */
function message(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Something went wrong. Try again in a moment.';
}

export default function Settings() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /** Saves on the click. A preference with a Save button under it is one people forget to press. */
  async function setPreference(change: { emailOptIn?: boolean; smsOptIn?: boolean }) {
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      setProfile(
        await memberApi.saveMessagePreferences({
          emailOptIn: profile.emailOptIn,
          smsOptIn: profile.smsOptIn,
          ...change,
        }),
      );
    } catch (e) {
      setError(message(e));
    } finally {
      setSaving(false);
    }
  }

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

            <div className="card fade-in-up fade-delay-1" style={{ marginTop: 20 }}>
              <div className="card-head" style={{ display: 'block', marginBottom: 18 }}>
                <h2 className="card-title">Messages from the chapter</h2>
                <p className="card-sub">
                  Events, workshops and opportunities. Changes save as you make them.
                </p>
              </div>
              <div style={{ display: 'grid', gap: 16 }}>
                <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', lineHeight: 1.4 }}>
                  <input
                    type="checkbox"
                    checked={profile.emailOptIn}
                    disabled={saving}
                    onChange={(e) => void setPreference({ emailOptIn: e.target.checked })}
                    style={{ marginTop: 3 }}
                  />
                  <span>
                    <strong>Email me chapter updates</strong>
                    <span className="muted" style={{ display: 'block', fontSize: 14 }}>
                      Untick to stop them. You will still get email about your account, like
                      sign-in codes and password resets.
                    </span>
                  </span>
                </label>
                <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', lineHeight: 1.4 }}>
                  <input
                    type="checkbox"
                    checked={profile.smsOptIn}
                    disabled={saving || !profile.phone}
                    onChange={(e) => void setPreference({ smsOptIn: e.target.checked })}
                    style={{ marginTop: 3 }}
                  />
                  <span>
                    <strong>Text me chapter updates</strong>
                    <span className="muted" style={{ display: 'block', fontSize: 14 }}>
                      {profile.phone ? (
                        <>
                          By ticking this you agree to receive text messages from ColorStack
                          at GSU at the number on your profile. Message frequency varies.
                          Message and data rates may apply. Reply STOP to any text to stop
                          them, or untick this.
                        </>
                      ) : (
                        <>
                          Off. <Link to="/profile">Add a phone number to your profile</Link>{' '}
                          to turn texts on.
                        </>
                      )}
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {/* Loads independently of the profile above. A member whose profile failed to
                load can still get in here and cut a site off, which is the one thing on
                this page that might be urgent. */}
            <ConnectedSites />
          </>
        )}
      </div>
    </section>
  );
}
