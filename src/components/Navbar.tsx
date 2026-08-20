import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/context';

const SITE_URL = 'https://colorstackatgsu.com';

/**
 * The main site's floating white pill.
 *
 * It carries two different jobs depending on who is looking. Signed out, it is branding
 * plus a way back to the main site. Signed in, it becomes the portal's actual navigation:
 * the member needs a way to reach settings and, more importantly, a visible way to sign
 * out. A portal with no sign-out button is a portal nobody trusts on a shared laptop.
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
        top: 30,
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
          padding: '8px 12px 8px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: 'none',
          borderRadius: 999,
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Link to={session ? '/profile' : '/'} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="/images/colorstack-gsu-logo.png"
            alt="ColorStack at GSU"
            className="nav-logo-img"
            style={{ display: 'block', width: 32, height: 32, borderRadius: '50%' }}
          />
          <span
            className="nav-brand-text"
            style={{
              fontFamily: 'var(--display)',
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: '-0.01em',
              color: '#091024',
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
            <button
              type="button"
              onClick={onSignOut}
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontWeight: 500,
                padding: '7px 14px',
                borderRadius: 999,
                color: 'rgba(9, 16, 36, 0.55)',
              }}
            >
              Sign out
            </button>
          </div>
        ) : (
          <a
            href={SITE_URL}
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              padding: '8px 18px',
              borderRadius: 999,
              color: 'rgba(9, 16, 36, 0.75)',
              fontWeight: 500,
            }}
          >
            Main site
          </a>
        )}
      </nav>
    </header>
  );
}
