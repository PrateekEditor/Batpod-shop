'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import TransitionLink from './TransitionLink';

const useIsoLayout = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * The three ranges as a tab strip that sticks under the header.
 *
 * The indicator is one element that slides to the active tab, so switching
 * reads as moving between tabs rather than loading a new page — which, with
 * the pages prerendered, is now what it actually is.
 */
export default function RangeTabs({ categories }) {
  const pathname = usePathname();
  const wrap = useRef(null);
  const [bar, setBar] = useState({ left: 0, width: 0, ready: false });

  const active = categories.find((c) => pathname === `/c/${c.slug}`)?.slug;

  useIsoLayout(() => {
    const el = wrap.current?.querySelector('[data-active="true"]');
    if (!el) return;
    setBar({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
  }, [active]);

  useEffect(() => {
    const onResize = () => {
      const el = wrap.current?.querySelector('[data-active="true"]');
      if (el) setBar({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="range-tabs" role="tablist" aria-label="Ranges" ref={wrap}>
      {categories.map((c) => (
        <TransitionLink
          key={c.slug}
          href={`/c/${c.slug}`}
          role="tab"
          aria-selected={active === c.slug}
          data-active={active === c.slug ? 'true' : 'false'}
          className="range-tab"
          scroll={false}
          style={{ '--accent': c.accent }}
        >
          <span>{c.name}</span>
          <small className="mono">{c.productCount}</small>
        </TransitionLink>
      ))}
      <span
        className={`range-tab-bar ${bar.ready ? 'ready' : ''}`}
        style={{ transform: `translateX(${bar.left}px)`, width: bar.width }}
        aria-hidden="true"
      />
    </div>
  );
}
