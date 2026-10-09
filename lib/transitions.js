'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Smooth page changes with the browser's View Transitions API.
 *
 * The browser snapshots the old page, we navigate, and it cross-fades to the
 * new one — elements that share a `view-transition-name` (a product card and
 * that product's gallery, the active range tab) morph between the two. The
 * navigation itself is still Next's client router; this only tells the
 * browser when it starts and when the new page has arrived.
 *
 * Browsers without the API just navigate; nothing is lost, only the fade.
 * Next 15.1 has no built-in ViewTransition component (that landed later), so
 * this is the same approach the next-view-transitions package uses, in forty
 * lines we own.
 */
const Ctx = createContext({ navigate: (href) => { window.location.href = href; } });

export function TransitionProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const pending = useRef(null);

  // The new page is in when the pathname matches what we asked for.
  useEffect(() => {
    if (pending.current && pathname === pending.current.path) {
      pending.current.resolve();
      pending.current = null;
    }
  }, [pathname]);

  const navigate = useCallback(
    (href, { scroll = true } = {}) => {
      const target = new URL(href, window.location.href);
      const path = target.pathname;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!document.startViewTransition || reduce || path === window.location.pathname) {
        router.push(href, { scroll });
        return;
      }

      document.startViewTransition(() => {
        return new Promise((resolve) => {
          pending.current = { path, resolve };
          router.push(href, { scroll });
          // Never hold the old page hostage: if the route takes long, let the
          // transition finish and the page arrive on its own.
          setTimeout(() => {
            if (pending.current && pending.current.path === path) {
              pending.current = null;
              resolve();
            }
          }, 900);
        });
      });
    },
    [router]
  );

  const value = useMemo(() => ({ navigate }), [navigate]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useTransitionNavigate = () => useContext(Ctx).navigate;
