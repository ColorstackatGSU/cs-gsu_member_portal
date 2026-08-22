import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { memberApi } from '../lib/member';
import type { MemberProfile, ResumeScoreResult } from '../lib/member';
import { ApiError } from '../lib/api';
import Notice from '../components/Notice';
import HackerRankMark from '../components/HackerRankMark';

/**
 * The resume, on its own page rather than as a card at the bottom of the profile.
 *
 * It earns the space: it is the one thing sponsors always ask for, it is the only file the
 * portal stores, and it now carries a score as well.
 *
 * Uploading is what scores. There is no button to press and no history to browse, because a
 * score describes the file that is there now: an old number beside a new resume is worse
 * than no number. The run takes twenty seconds or so on a thread nobody waits on, so this
 * page polls while it works.
 *
 * The score is the member's own. Officers get a resume book, not a leaderboard.
 */

const POLL_MS = 3000;
/** Enough for a slow model call; past this something is wrong and saying so is better. */
const POLL_LIMIT = 40;

function message(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Something went wrong. Try again in a moment.';
}

export default function Resume() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [scoring, setScoring] = useState<ResumeScoreResult | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const polls = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);

  const refreshScore = useCallback(
    () => memberApi.resumeScore().then(setScoring).catch(() => {}),
    [],
  );

  useEffect(() => {
    memberApi.load().then(setProfile).catch((e) => setLoadError(message(e)));
    // Not being able to read a score should never get in the way of the file itself.
    memberApi.resumeScore().then(setScoring).catch(() => {});
  }, []);

  // While a run is in flight the row says so, so the page can follow it rather than
  // guessing from a timer it started.
  const status = scoring?.score.status;
  useEffect(() => {
    if (status !== 'running') {
      polls.current = 0;
      return;
    }
    if (polls.current >= POLL_LIMIT) {
      return;
    }
    const timer = setTimeout(() => {
      polls.current += 1;
      void refreshScore();
    }, POLL_MS);
    return () => clearTimeout(timer);
  }, [status, scoring, refreshScore]);

  async function upload(file: File) {
    setError(null);
    setScoreError(null);
    setBusy(true);
    try {
      setProfile(await memberApi.uploadResume(file));
      // The upload started a score. Pick it up so the card switches to working.
      await refreshScore();
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  async function open() {
    setError(null);
    try {
      const { url } = await memberApi.resumeUrl();
      // A short-lived signed URL, so it is opened rather than stored anywhere.
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      setError(message(err));
    }
  }

  async function remove() {
    setError(null);
    setBusy(true);
    try {
      setProfile(await memberApi.deleteResume());
      await refreshScore();
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(false);
    }
  }

  async function retry() {
    setScoreError(null);
    try {
      setScoring(await memberApi.retryResumeScore());
    } catch (err) {
      setScoreError(message(err));
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

  if (!profile) {
    return (
      <section className="portal-pad">
        <div className="container-wide" style={{ maxWidth: 820, display: 'grid', gap: 18 }}>
          <div className="skeleton" style={{ height: 150 }} />
          <div className="skeleton" style={{ height: 220 }} />
        </div>
      </section>
    );
  }

  const score = scoring?.score;
  const ready = score?.status === 'ready' && score.overall !== null;
  const running = score?.status === 'running';
  const uploadsLeft = score?.remainingToday ?? 5;

  return (
    <section className="portal-pad">
      <div className="container-wide" style={{ maxWidth: 820 }}>
        <div className="fade-in-up page-head">
          <p className="section-eyebrow" style={{ marginBottom: 12 }}>Member Portal</p>
          <h1 className="page-title">Resume</h1>
          <p
            className="muted"
            style={{
              margin: '12px 0 0',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            PDF &middot; 5 MB max
          </p>
        </div>

        {error && <Notice kind="error" style={{ marginTop: 18 }}>{error}</Notice>}

        <div className="card fade-in-up fade-delay-1" style={{ marginTop: 18 }}>
          <div className="card-head">
            <h2 className="card-title">Your file</h2>
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
                  <button type="button" className="btn-secondary btn-sm" onClick={open}>View</button>
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    disabled={busy || uploadsLeft === 0}
                    onClick={() => fileInput.current?.click()}
                  >
                    {busy ? 'Uploading...' : 'Replace'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary btn-sm btn-danger"
                    disabled={busy}
                    onClick={remove}
                  >
                    Remove
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn-primary btn-sm"
                  disabled={busy || uploadsLeft === 0}
                  onClick={() => fileInput.current?.click()}
                >
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

          <p className="card-sub" style={{ marginTop: 14 }}>
            {profile.resumeShared ? 'Automatically shared with sponsors' : 'Private'}.{' '}
            <Link to="/settings" style={{ textDecoration: 'underline' }}>Change in settings</Link>.
            {uploadsLeft < 5 && ` ${uploadsLeft} of 5 uploads left today.`}
          </p>
        </div>

        <div className="card fade-in-up fade-delay-2" style={{ marginTop: 18 }}>
          <div className="hr-banner">
            <HackerRankMark size={34} />
            <span className="hr-banner-text">
              <strong>Powered by HackerRank</strong>
              Scored on their hiring rubric
            </span>
          </div>

          {scoreError && <Notice kind="error" style={{ marginTop: 16 }}>{scoreError}</Notice>}

          {scoring && !scoring.available ? (
            <Notice style={{ marginTop: 16 }}>
              Scoring is not switched on yet. Ask an officer.
            </Notice>
          ) : !profile.hasResume ? (
            <Notice style={{ marginTop: 16 }}>Upload a resume and it is scored here.</Notice>
          ) : running ? (
            <div className="score-working">
              <span className="spinner" aria-hidden="true" />
              <div>
                <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600 }}>Reading your resume</p>
                <p className="card-sub" style={{ margin: '2px 0 0' }}>About twenty seconds.</p>
              </div>
            </div>
          ) : score?.status === 'failed' ? (
            <Notice kind="warn" style={{ marginTop: 16 }}>
              That one did not score, and it did not count against your uploads.{' '}
              <button type="button" className="link-button" onClick={retry}>Try again</button>.
            </Notice>
          ) : ready && score ? (
            <>
              {score.stale && (
                <Notice kind="warn" style={{ marginTop: 16 }}>
                  This score is for the resume you replaced.{' '}
                  <button type="button" className="link-button" onClick={retry}>Score the new one</button>.
                </Notice>
              )}

              <div className="score-head">
                <div className="score-figure">
                  <span className="score-figure-value">{score.overall}</span>
                  <span className="score-figure-of">/ 100</span>
                </div>
                <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55 }}>{score.summary}</p>
                  <p className="muted" style={{ margin: '8px 0 0', fontSize: 12 }}>
                    {score.scoredAt && `Scored ${new Date(score.scoredAt).toLocaleDateString()}`}
                    {score.usedGithub && ' · your public GitHub was included'}
                  </p>
                </div>
              </div>

              <div className="score-list">
                {score.categories.map((c) => (
                  <div key={c.name} className="score-row">
                    <div className="score-row-head">
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</span>
                      <span className="score-row-value">{c.score}</span>
                    </div>
                    <div className="meter" style={{ marginTop: 8 }}>
                      <div className="meter-fill" style={{ width: `${c.score}%` }} />
                    </div>
                    <p className="card-sub" style={{ margin: '10px 0 0' }}>
                      <strong style={{ fontWeight: 600 }}>In your resume:</strong> {c.evidence}
                    </p>
                    <p className="card-sub" style={{ margin: '6px 0 0' }}>
                      <strong style={{ fontWeight: 600 }}>Try this:</strong> {c.suggestion}
                    </p>
                  </div>
                ))}
              </div>

              {(score.bonuses.length > 0 || score.deductions.length > 0) && (
                <div className="score-marks">
                  {score.bonuses.length > 0 && (
                    <div>
                      <p className="score-marks-head">Working for you</p>
                      <ul className="score-marks-list">
                        {score.bonuses.map((b) => (
                          <li key={b} className="score-mark score-mark-up">{b}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {score.deductions.length > 0 && (
                    <div>
                      <p className="score-marks-head">Costing you</p>
                      <ul className="score-marks-list">
                        {score.deductions.map((d) => (
                          <li key={d} className="score-mark score-mark-down">{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

            </>
          ) : (
            <Notice style={{ marginTop: 16 }}>
              This resume has not been scored yet.{' '}
              <button type="button" className="link-button" onClick={retry}>Score it now</button>.
            </Notice>
          )}
        </div>
      </div>
    </section>
  );
}
