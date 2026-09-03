import { useEffect, useState } from 'react';
import { googleApi } from '../lib/google';

/**
 * "Continue with Google".
 *
 * Renders nothing at all until the backend says a client is configured. A button that
 * always appears and sometimes explains it is not set up is worse than no button: at a
 * fair, on a phone, a dead control reads as a broken site.
 *
 * The mark is Google's own four-colour G, inline. Their branding guidelines require the
 * real mark rather than a redrawn one, and a dependency for a single 18px SVG is not a
 * trade worth making.
 */
export default function GoogleButton({ label = 'Continue with Google' }: { label?: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    googleApi
      .available()
      .then((r) => { if (!cancelled) setEnabled(r.enabled); })
      // Silent. If we cannot tell, the password form below still works, and an error about
      // a sign-in method they were not trying to use is noise.
      .catch(() => { /* leave it hidden */ });
    return () => { cancelled = true; };
  }, []);

  if (!enabled) return null;

  return (
    <button
      type="button"
      className="btn-google"
      onClick={() => googleApi.start()}
    >
      <GoogleMark />
      {label}
    </button>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}
