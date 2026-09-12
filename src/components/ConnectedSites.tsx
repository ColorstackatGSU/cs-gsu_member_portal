import { useEffect, useState } from 'react';
import { connectionsApi, describeScopes, keepsACopy } from '../lib/connections';
import type { Connection } from '../lib/connections';
import { ApiError } from '../lib/api';
import Notice from './Notice';

/**
 * Which other sites can see your profile, and how to stop them.
 *
 * The consent screen at sign-in is only half a promise. Agreeing to share a LinkedIn with
 * a hackathon in September has to be reversible in November, and it is only reversible if
 * a member can find the list — a grant renews itself through refresh tokens indefinitely,
 * and nothing else in the portal admits it exists.
 *
 * Two things this screen refuses to be vague about. It spells out each scope in plain
 * words rather than showing protocol names, because "socials" is not a thing anyone can
 * consent to meaningfully. And where a site took a copy of the resume, it says so, and
 * says that disconnecting does not reach that copy — which is true, is not fixable here,
 * and is worse to discover later.
 */

function message(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Something went wrong. Try again in a moment.';
}

function connectedOn(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ConnectedSites() {
  const [connections, setConnections] = useState<Connection[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    connectionsApi
      .list()
      .then(setConnections)
      .catch((e) => setError(message(e)));
  }, []);

  async function revoke(clientId: string) {
    setRevoking(clientId);
    setError(null);
    try {
      await connectionsApi.revoke(clientId);
      setConnections((current) =>
        (current ?? []).filter((connection) => connection.clientId !== clientId),
      );
      setConfirming(null);
    } catch (e) {
      setError(message(e));
    } finally {
      setRevoking(null);
    }
  }

  return (
    <div className="card fade-in-up fade-delay-2" style={{ marginTop: 20 }}>
      <div className="card-head" style={{ display: 'block', marginBottom: 18 }}>
        <h2 className="card-title">Connected sites</h2>
        <p className="card-sub">
          Other sites you have signed into with your ColorStack at GSU account.
        </p>
      </div>

      {error && <Notice kind="error" style={{ marginBottom: 16 }}>{error}</Notice>}

      {connections === null ? (
        <div className="skeleton" style={{ height: 90 }} />
      ) : connections.length === 0 ? (
        <p className="muted" style={{ fontSize: 14, lineHeight: 1.55, margin: 0 }}>
          None yet. When you use &ldquo;Sign in with ColorStack at GSU&rdquo; somewhere
          else, it will appear here and you can disconnect it at any time.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 18 }}>
          {connections.map((connection) => {
            const since = connectedOn(connection.connectedAt);
            const isConfirming = confirming === connection.clientId;
            const isRevoking = revoking === connection.clientId;

            return (
              <li
                key={connection.clientId}
                style={{
                  borderTop: '1px solid var(--line)',
                  paddingTop: 16,
                  display: 'grid',
                  gap: 10,
                }}
              >
                <div>
                  <strong style={{ fontSize: 15.5 }}>{connection.clientName}</strong>
                  {since && (
                    <p className="muted" style={{ fontSize: 12.5, margin: '3px 0 0' }}>
                      Connected {since}
                    </p>
                  )}
                </div>

                <div>
                  <p className="muted" style={{ fontSize: 12.5, margin: '0 0 5px' }}>
                    This site can see:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.5 }}>
                    {describeScopes(connection.scopes).map((label) => (
                      <li key={label}>{label}</li>
                    ))}
                  </ul>
                </div>

                {isConfirming ? (
                  <div style={{ display: 'grid', gap: 10 }}>
                    <p style={{ fontSize: 13.5, lineHeight: 1.5, margin: 0 }}>
                      Disconnect {connection.clientName}? It will lose access immediately,
                      and will have to ask again the next time you sign in there.
                      {keepsACopy(connection.scopes) && (
                        <>
                          {' '}
                          <strong>
                            It already downloaded a copy of your resume, and disconnecting
                            does not delete that copy.
                          </strong>{' '}
                          Contact them directly if you want it removed.
                        </>
                      )}
                    </p>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn-primary btn-sm"
                        disabled={isRevoking}
                        onClick={() => void revoke(connection.clientId)}
                      >
                        {isRevoking ? 'Disconnecting...' : 'Yes, disconnect'}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        disabled={isRevoking}
                        onClick={() => setConfirming(null)}
                      >
                        Keep it connected
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    style={{ justifySelf: 'start' }}
                    onClick={() => setConfirming(connection.clientId)}
                  >
                    Disconnect
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
