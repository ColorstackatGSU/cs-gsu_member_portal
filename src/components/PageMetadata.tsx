import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ORIGIN = 'https://members.colorstackatgsu.com';

const PUBLIC_PAGES: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'ColorStack at GSU Member Portal | Join and Sign In',
    description:
      'Join ColorStack at Georgia State University, activate your member account, and access your profile, resume, and chapter events.',
  },
  '/join': {
    title: 'Join ColorStack at GSU | Member Portal',
    description:
      'Join ColorStack at Georgia State University. Membership is free and open to every Georgia State student interested in tech.',
  },
  '/privacy': {
    title: 'Privacy Policy | ColorStack at GSU Member Portal',
    description: 'Read the privacy policy for the ColorStack at GSU member portal.',
  },
  '/terms': {
    title: 'Terms of Service | ColorStack at GSU Member Portal',
    description: 'Read the terms of service for the ColorStack at GSU member portal.',
  },
};

function setMeta(name: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.name = name;
    document.head.appendChild(tag);
  }
  tag.content = content;
}

/** All routes share Vite's HTML shell, so update search metadata on navigation. */
export default function PageMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = PUBLIC_PAGES[pathname];
    document.title = page?.title ?? 'ColorStack at GSU Member Portal';
    setMeta('description', page?.description ?? 'Member portal for ColorStack at GSU.');
    setMeta('robots', page ? 'index, follow' : 'noindex, follow');

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (page) {
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = `${ORIGIN}${pathname}`;
    } else {
      canonical?.remove();
    }
  }, [pathname]);

  return null;
}
