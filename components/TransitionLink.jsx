'use client';

import Link from 'next/link';
import { useTransitionNavigate } from '../lib/transitions';

/**
 * A next/link that cross-fades.
 *
 * Still a real <a> with a real href — prefetching, middle-click, cmd-click,
 * right-click-open-in-new-tab and crawlers all behave as usual. Only a plain
 * left click is intercepted and routed through the view transition.
 */
export default function TransitionLink({ href, onClick, scroll, children, ...rest }) {
  const navigate = useTransitionNavigate();

  function handleClick(e) {
    if (onClick) onClick(e);
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (rest.target && rest.target !== '_self') return;
    e.preventDefault();
    navigate(typeof href === 'string' ? href : href.pathname, { scroll: scroll !== false });
  }

  return (
    <Link href={href} onClick={handleClick} scroll={scroll} {...rest}>
      {children}
    </Link>
  );
}
