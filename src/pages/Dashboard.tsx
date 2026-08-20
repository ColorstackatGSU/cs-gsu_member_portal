import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { memberApi } from '../lib/member';
import type { MemberProfile } from '../lib/member';
import { completeness, suggestions } from '../lib/progress';
import { ApiError } from '../lib/api';
import Notice from '../components/Notice';
import Ring from '../components/Ring';

/**
 * The landing page for a signed-in member.
 *
 * A member opening the portal is not usually here to edit twenty fields, so dropping them
 * into a form was the wrong first screen. This answers three questions instead: does the
 * portal know who I am, is there anything I still need to do, and can sponsors see me.
 * Everything editable lives one click away on the profile.
 *
 * The suggestion list is derived from the profile rather than stored, so it empties itself
 * as things get filled in and there is no state to fall out of sync.
 */

function message(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Something went wrong. Try again in a moment.';
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    memberApi.load().then(setProfile).catch((e) => setError(message(e)));
  }, []);

  const todo = useMemo(() => (profile ? suggestions(profile) : []), [profile]);
  const pct = useMemo(() => (profile ? completeness(profile) : 0), [profile]);

  if (error) {
    return (
      <section className="portal-pad">
        <div className="container-wide" style={{ maxWidth: 1100 }}>
          <Notice kind="error">{error}</Notice>
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="portal-pad">
        <div className="container-wide" style={{ maxWidth: 1100, display: 'grid', gap: 20 }}>
          <div className="skeleton" style={{ height: 96 }} />
          <div className="app-columns">
            <div className="skeleton" style={{ height: 320 }} />
            <div className="skeleton" style={{ height: 220 }} />
          </div>
        </div>
      </section>
    );
  }

  const name = profile.firstName ?? 'there';

  return (
    <section className="portal-pad">
      <div className="container-wide" style={{ maxWidth: 1100 }}>
        <div className="fade-in-up" style={{ marginBottom: 24 }}>
          <p className="section-eyebrow" style={{ marginBottom: 12 }}>Dashboard</p>
          <h1 style={{ fontSize: 'clamp(24px, 3.2vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            {greeting()}, {name}.
          </h1>
          <p className="muted" style={{ fontSize: 14.5, margin: '8px 0 0', color: 'rgba(255,255,255,0.55)' }}>
            {todo.length === 0
              ? 'Nothing needs you today.'
              : `${todo.length} thing${todo.length === 1 ? '' : 's'} left to finish setting up.`}
          </p>
        </div>

        <div className="app-columns">
          <div style={{ display: 'grid', gap: 20 }}>
            <div className="card fade-in-up fade-delay-1">
              <div className="card-head" style={{ display: 'block', marginBottom: 18 }}>
                <h2 className="card-title">
                  {todo.length === 0 ? 'You are all set' : 'Suggested next steps'}
                </h2>
                <p className="card-sub">
                  {todo.length === 0
                    ? 'Nothing right now.'
                    : 'What is left to do.'}
                </p>
              </div>

              {todo.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-tick" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <p style={{ margin: 0, fontSize: 14.5 }}>
                    Profile complete, resume uploaded, shared with sponsors.
                  </p>
                </div>
              ) : (
                <div className="todo-list">
                  {todo.map((s) => (
                    <div className="todo-row" key={s.id}>
                      <span className={s.urgent ? 'todo-dot todo-dot-urgent' : 'todo-dot'} aria-hidden="true" />
                      <div style={{ minWidth: 0, flex: '1 1 260px' }}>
                        <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600 }}>{s.title}</p>
                        <p className="card-sub" style={{ margin: '3px 0 0' }}>{s.body}</p>
                      </div>
                      <Link to={s.to} className="btn-secondary btn-sm">{s.cta}</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card fade-in-up fade-delay-2">
              <div className="card-head">
                <h2 className="card-title">Your details</h2>
                <Link to="/profile" style={{ fontSize: 13, color: 'var(--gsu-sky)' }}>
                  Edit &rarr;
                </Link>
              </div>
              <div className="spec-list">
                <Row k="Name" v={[profile.firstName, profile.lastName].filter(Boolean).join(' ')} />
                <Row k="School email" v={profile.email} />
                <Row k="Major" v={profile.majors} />
                <Row k="Year" v={profile.classYear} />
                <Row
                  k="Graduates"
                  v={profile.gradTerm && profile.gradYear ? `${profile.gradTerm} ${profile.gradYear}` : null}
                />
                <Row k="Discord" v={profile.discordUsername} />
              </div>
            </div>
          </div>

          <div className="app-rail">
            <div className="card fade-in-up fade-delay-1">
              <Ring value={pct} />
              <p className="card-sub" style={{ marginTop: 14 }}>
                {pct === 100
                  ? 'Everything is on file.'
                  : 'Sponsors see this.'}
              </p>
            </div>

            <div className="card fade-in-up fade-delay-2">
              <div className="card-head" style={{ marginBottom: 12 }}>
                <h2 className="card-title" style={{ fontSize: 15 }}>Sponsor visibility</h2>
                <span className={profile.resumeShared ? 'pill pill-on' : 'pill pill-off'}>
                  {profile.resumeShared ? 'On' : 'Off'}
                </span>
              </div>
              <p className="card-sub" style={{ margin: 0 }}>
                {profile.resumeShared
                  ? 'Shared with sponsors.'
                  : 'Private.'}
              </p>
              <Link to="/settings" className="btn-secondary btn-sm" style={{ marginTop: 16 }}>
                Change this
              </Link>
            </div>

            <div className="card fade-in-up fade-delay-3">
              <div className="card-head" style={{ marginBottom: 12 }}>
                <h2 className="card-title" style={{ fontSize: 15 }}>Resume</h2>
              </div>
              <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600 }}>
                {profile.hasResume ? 'resume.pdf' : 'Not uploaded'}
              </p>
              <p className="card-sub" style={{ margin: '4px 0 0' }}>
                {profile.hasResume && profile.resumeUploadedAt
                  ? `Uploaded ${new Date(profile.resumeUploadedAt).toLocaleDateString()}`
                  : 'Sponsors ask for this first.'}
              </p>
              <Link to="/resume" className="btn-secondary btn-sm" style={{ marginTop: 16 }}>
                {profile.hasResume ? 'Replace it' : 'Upload one'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string | null | undefined }) {
  const empty = v === null || v === undefined || v.trim() === '';
  return (
    <div className="spec-row">
      <span className="spec-key">{k}</span>
      <span className={empty ? 'spec-val spec-val-empty' : 'spec-val'}>
        {empty ? 'Not set' : v}
      </span>
    </div>
  );
}
