'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../lib/cart';

const LINKS = [
  { href: '/c/biker', label: 'Bike & Rider' },
  { href: '/c/tabletop', label: 'Tabletop' },
  { href: '/c/daily', label: 'Daily Fixes' },
];

export default function Header() {
  const { itemCount, hydrated } = useCart();
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="container inner">
        <Link href="/" className="brand">
          BATPOD<span>.</span>LABS
        </Link>
        <nav className="nav">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={pathname === l.href ? 'active' : undefined}>
              {l.label}
            </Link>
          ))}
          <Link href="/cart" className="cart-pill" aria-label="Open cart">
            Cart
            {/* Rendered only after hydration so the server HTML and the first
                client render match — otherwise React warns about a mismatch. */}
            <b>{hydrated ? itemCount : 0}</b>
          </Link>
        </nav>
      </div>
    </header>
  );
}
