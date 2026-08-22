import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/context';

const SITE_URL = 'https://colorstackatgsu.com';

/**
 * The bar the signed-out pages float at the top.
 *
 * It carries two different jobs depending on who is looking. Signed out, it is branding
 * plus a way back to the main site. Signed in, it becomes the portal's actual navigation:
 * the member needs a way to reach settings and, more importantly, a visible way to sign
 * out. A portal with no sign-out button is a portal nobody trusts on a shared laptop.
 *
 * Square, black-edged and opaque rather than a frosted pill: it sits over a moving wall
 * of photos, and a hard block is the only thing that reliably holds against it.
 */
export default function Navbar() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  async function onSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <header
      style={{
        position: 'absolute',
        top: 26,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: session ? 940 : 860,
        zIndex: 50,
      }}
    >
      <nav
        className="nav-bar"
        style={{
          padding: '8px 8px 8px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          background: '#ffffff',
          border: '3px solid var(--ink)',
          borderRadius: 0,
          boxShadow: 'var(--drop)',
        }}
      >
        <Link to={session ? '/profile' : '/'} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="/images/colorstack-gsu-logo.png"
            alt="ColorStack at GSU"
            className="nav-logo-img"
            style={{ display: 'block', width: 32, height: 32, border: '2px solid var(--ink)' }}
          />
          <span
            className="nav-brand-text"
            style={{
              fontFamily: 'var(--mono)',
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--ink)',
            }}
          >
            Member Portal
          </span>
        </Link>

        {session ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="portal-tabs">
              <NavLink
                to="/profile"
                className={({ isActive }) => (isActive ? 'portal-tab portal-tab-active' : 'portal-tab')}
              >
                Profile
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) => (isActive ? 'portal-tab portal-tab-active' : 'portal-tab')}
              >
                Settings
              </NavLink>
            </div>
            <button type="button" onClick={onSignOut} className="btn-secondary btn-sm">
              Sign out
            </button>
          </div>
        ) : (
          <a href={SITE_URL} className="btn-secondary btn-sm">
            Main site
          </a>
        )}
      </nav>
    </header>
  );
}
