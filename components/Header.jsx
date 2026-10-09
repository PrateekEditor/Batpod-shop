'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';
import ThemeToggle from './ThemeToggle';
import TransitionLink from './TransitionLink';

const LINKS = [
  { href: '/c/biker', label: 'Bike & Rider' },
  { href: '/c/tabletop', label: 'Tabletop' },
  { href: '/c/daily', label: 'Daily Fixes' },
  { href: '/custom', label: 'Custom print' },
];

function AccountMenu() {
  const { user, ready, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const router = useRouter();

  // Close on an outside click or Escape — a menu you cannot dismiss is worse
  // than no menu.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrap.current && !wrap.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Render the signed-out shape until the token check finishes, so the server
  // HTML and the first client render agree.
  if (!ready || !user) {
    return (
      <Link href="/login" className="nav-account">
        Sign in
      </Link>
    );
  }

  const initials = (user.name || user.email).trim().slice(0, 1).toUpperCase();

  return (
    <div className="account-wrap" ref={wrap}>
      <button
        type="button"
        className="account-button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="avatar">{initials}</span>
        <span className="account-name">{user.name || user.email.split('@')[0]}</span>
      </button>

      {open && (
        <div className="account-menu" role="menu">
          <div className="account-menu-head">
            <strong>{user.name || 'Your account'}</strong>
            <span className="mono">{user.email}</span>
          </div>
          <Link href="/account" onClick={() => setOpen(false)} role="menuitem">
            Orders &amp; details
          </Link>
          <Link href="/account#interests" onClick={() => setOpen(false)} role="menuitem">
            What you&rsquo;re into
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              logout();
              setOpen(false);
              router.push('/');
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

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
            <TransitionLink key={l.href} href={l.href} className={pathname === l.href ? 'active' : undefined}>
              {l.label}
            </TransitionLink>
          ))}
          <ThemeToggle />
          <AccountMenu />
          <Link href="/cart" className="cart-pill" aria-label="Open cart">
            Cart
            <b>{hydrated ? itemCount : 0}</b>
          </Link>
        </nav>
      </div>
    </header>
  );
}
