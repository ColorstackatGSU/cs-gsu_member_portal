import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../auth/context';

/** Routes that use the signed-out member-portal shell. */
const AUTH_ROUTES = ['/login', '/activate', '/forgot'];

export default function Layout() {
  const { pathname } = useLocation();
  const { session } = useAuth();
  const isAuth = AUTH_ROUTES.includes(pathname);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  const isApp = !isAuth && Boolean(session);

  if (isApp) {
    return (
      <div className="app-shell" style={{ background: 'var(--paper)' }}>
        <Sidebar />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <header className="app-topbar">
            <div className="app-topbar-logo">
              <span>ColorStack at GSU</span>
              <img src="/images/colorstack-gsu-logo.png" alt="ColorStack at Georgia State University" />
            </div>
          </header>
          <main style={{ flex: 1, minWidth: 0 }}>
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  if (isAuth) {
    return (
      <div className="auth-portal-shell">
        <div className="auth-content-column">
          <main><Outlet /></main>
          <footer className="auth-actions">
            <a href="https://colorstackatgsu.com" className="auth-action-secondary">Visit main site ↗</a>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div
      className={undefined}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--paper)',
      }}
    >
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {!isAuth && <Footer />}
    </div>
  );
}
