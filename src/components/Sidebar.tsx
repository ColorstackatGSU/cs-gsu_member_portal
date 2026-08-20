import { NavLink, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/context';

const SITE_URL = 'https://colorstackatgsu.com';

/**
 * Navigation for the signed-in portal.
 *
 * A sidebar rather than a top bar: the portal has a small, fixed set of destinations
 * and they read better as a list of full-width rows with labels than as tabs competing
 * for space in a pill. It also frees the top of the content column, which is where the
 * chapter mark now sits.
 *
 * Sign out stays visible rather than hiding behind a menu. A portal with no obvious way
 * out is a portal nobody trusts on a shared lab machine.
 */

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const NAV = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <Icon>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </Icon>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (
      <Icon>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </Icon>
    ),
  },
  {
    to: '/resume',
    label: 'Resume',
    icon: (
      <Icon>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h5" />
      </Icon>
    ),
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </Icon>
    ),
  },
];

export default function Sidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function onSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar-brand">
        <img src="/images/colorstack-gsu-logo.png" alt="" />
        <span>
          ColorStack
          <br />
          Member Portal
        </span>
      </div>

      <nav className="app-nav" aria-label="Portal">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive ? 'app-nav-link app-nav-link-active' : 'app-nav-link'
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="app-sidebar-foot">
        <a href={SITE_URL} className="app-nav-link app-nav-link-quiet">
          <Icon>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <path d="M15 3h6v6" />
            <path d="M10 14 21 3" />
          </Icon>
          Main site
        </a>
        <button type="button" onClick={onSignOut} className="app-nav-link app-nav-link-quiet">
          <Icon>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5" />
            <path d="M21 12H9" />
          </Icon>
          Sign out
        </button>
      </div>
    </aside>
  );
}
