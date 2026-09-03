import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import PhotoMosaic from './PhotoMosaic';
import { useAuth } from '../auth/context';

/**
 * Routes that get the light photo-mosaic treatment instead of the dark app surface.
 *
 * /involvement-fair is in here despite not being an auth route, and for the same two
 * reasons the auth pages are: it is one short form on one screen, and it is seen by people
 * who are not signed in. It also has to keep the shell OFF for the case that would
 * otherwise break it — an officer signed in on their own phone, handing it round a queue,
 * would otherwise get the member sidebar wrapped around a stranger's signup form.
 */
const AUTH_ROUTES = ['/login', '/activate', '/forgot', '/involvement-fair', '/auth/callback'];

export default function Layout() {
  const { pathname } = useLocation();
  const { session } = useAuth();
  const isAuth = AUTH_ROUTES.includes(pathname);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  // The shell is for signed-in members only. Signed out, there is nowhere for a
  // sidebar to navigate to, so those routes keep the floating pill.
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

  return (
    <div
      className={isAuth ? 'auth-page' : undefined}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        // The mosaic is fixed and only covers the viewport, so anything taller than
        // one screen would otherwise expose the dark body colour underneath it.
        background: isAuth ? '#dfe8f5' : 'var(--paper)',
      }}
    >
      {isAuth && <PhotoMosaic />}
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* The auth pages are pinned to one viewport, so the footer would eat the
          height the form needs. Its only real content is the contact address,
          which those pages already surface in their own copy. */}
      {!isAuth && <Footer />}
    </div>
  );
}
