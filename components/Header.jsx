'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';
import { getStatus } from '../lib/api';
import ThemeToggle from './ThemeToggle';
import TransitionLink from './TransitionLink';
import { motion, AnimatePresence } from './Motion';

/**
 * The header.
 *
 * Desktop: the ranges as numbered mono labels with one indicator that slides
 * between them, a live status pill (polled from the API, same source as the
 * shop gate), theme, account, cart. On a range page the ranges are left out
 * because the tab strip below already lists them.
 *
 * Narrow screens: the same things behind one button, as a drawer that drops
 * from the header. The cart stays visible at every width — it is the one
 * thing people reach for.
 */
const RANGE_LINKS = [
  { href: '/c/biker', label: 'Bike & Rider', code: 'BK' },
  { href: '/c/tabletop', label: 'Tabletop', code: 'TT' },
  { href: '/c/daily', label: 'Daily Fixes', code: 'DF' },
  { href: '/c/minis', label: 'Minis', code: 'MN' },
];
const OTHER_LINKS = [
  { href: '/custom', label: 'Custom print', code: 'CP' },
  { href: '/contact', label: 'Contact', code: 'CT' },
];
const MORE_LINKS = [
  { href: '/track', label: 'Track an order' },
  { href: '/privacy', label: 'What is stored' },
];

function StatusPill() {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    let alive = true;
    const tick = () =>
      getStatus()
        .then((s) => alive && setStatus(s))
        .catch(() => alive && setStatus({ mode: 'unreachable' }));
    tick();
    const id = window.setInterval(tick, 60000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);
  const mode = status ? status.mode : 'checking';
  const text = { open: 'A1 online', paused: 'paused', maintenance: 'maintenance', unreachable: 'offline', checking: '…' }[mode] || mode;
  return (
    <span className={`status-pill ${mode}`} title={status && status.message ? status.message : 'Workshop status'}>
      <i aria-hidden="true" />
      {text}
    </span>
  );
}

function AccountMenu({ onNavigate }) {
  const { user, ready, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => wrap.current && !wrap.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!ready || !user) {
    return (
      <Link href="/login" className="nav-account" onClick={onNavigate}>
        Sign in
      </Link>
    );
  }
  const initials = (user.name || user.email).trim().slice(0, 1).toUpperCase();
  return (
    <div className="account-wrap" ref={wrap}>
      <button type="button" className="account-button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu">
        <span className="avatar">{initials}</span>
        <span className="account-name">{user.name || user.email.split('@')[0]}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="account-menu"
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14 }}
          >
            <div className="account-menu-head">
              <strong>{user.name || 'Your account'}</strong>
              <span className="mono">{user.email}</span>
            </div>
            <Link href="/account" onClick={() => { setOpen(false); onNavigate && onNavigate(); }} role="menuitem">Orders &amp; details</Link>
            <Link href="/account?tab=preferences" onClick={() => { setOpen(false); onNavigate && onNavigate(); }} role="menuitem">What you&rsquo;re into</Link>
            <button type="button" role="menuitem" onClick={() => { logout(); setOpen(false); onNavigate && onNavigate(); router.push('/'); }}>
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CartPill({ onNavigate }) {
  const { itemCount, hydrated } = useCart();
  const count = hydrated ? itemCount : 0;
  return (
    <Link href="/cart" className="cart-pill" aria-label={`Open cart, ${count} items`} onClick={onNavigate}>
      Cart
      <motion.b key={count} initial={{ scale: 1.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
        {count}
      </motion.b>
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const onRange = pathname.startsWith('/c/');
  const links = [...(onRange ? [] : RANGE_LINKS), ...OTHER_LINKS];
  const close = () => setOpen(false);

  // The drawer closes on navigation and on Escape, and locks page scroll while open.
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="site-header">
      <div className="container inner">
        <Link href="/" className="brand" aria-label="Batpod Labs home">
          BATPOD<span>.</span>LABS
        </Link>
        <StatusPill />

        <nav className="nav" aria-label="Main">
          {links.map((l, i) => {
            const active = pathname === l.href;
            return (
              <TransitionLink key={l.href} href={l.href} className={`nav-link ${active ? 'active' : ''}`}>
                <span className="nav-idx">{String(i + 1).padStart(2, '0')}</span>
                {l.label}
                {active && <motion.span layoutId="nav-ind" className="nav-ind" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
              </TransitionLink>
            );
          })}
        </nav>

        <div className="nav-tools">
          <ThemeToggle />
          <span className="desktop-only"><AccountMenu /></span>
          <CartPill />
          <button type="button" className={`burger ${open ? 'open' : ''}`} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'}>
            <i /><i /><i />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="drawer-backdrop" onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} />
            <motion.div
              id="mobile-menu"
              className="drawer"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            >
              <div className="drawer-group">
                <span className="eyebrow">Ranges</span>
                {RANGE_LINKS.map((l, i) => (
                  <Link key={l.href} href={l.href} onClick={close} className={pathname === l.href ? 'active' : ''}>
                    <span className="nav-idx">{String(i + 1).padStart(2, '0')}</span>{l.label}
                  </Link>
                ))}
              </div>
              <div className="drawer-group">
                <span className="eyebrow">Shop</span>
                {[...OTHER_LINKS, ...MORE_LINKS].map((l) => (
                  <Link key={l.href} href={l.href} onClick={close} className={pathname === l.href ? 'active' : ''}>{l.label}</Link>
                ))}
              </div>
              <div className="drawer-group account-row">
                <AccountMenu onNavigate={close} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
