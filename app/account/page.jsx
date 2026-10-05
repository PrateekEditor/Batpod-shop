'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { rupees } from '../../lib/api';

const RANGES = [
  { slug: 'biker', name: 'Bike & Rider' },
  { slug: 'tabletop', name: 'Tabletop' },
  { slug: 'daily', name: 'Daily Fixes' },
];

const STATUS_LABEL = {
  draft: 'Received',
  placed: 'Confirmed',
  printing: 'Printing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function AccountPage() {
  const { user, ready, updateProfile, loadOrders } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace('/login');
  }, [ready, user, router]);

  useEffect(() => {
    if (!user) return;
    setProfile({
      name: user.name || '',
      phone: user.phone || '',
      interests: user.interests || [],
      address: { line1: '', city: '', pincode: '', ...(user.address || {}) },
    });
    loadOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
  }, [user, loadOrders]);

  if (!ready || !user || !profile) {
    return (
      <div className="container empty">
        <p className="mono">Loading…</p>
      </div>
    );
  }

  const toggle = (slug) =>
    setProfile((p) => ({
      ...p,
      interests: p.interests.includes(slug) ? p.interests.filter((s) => s !== slug) : [...p.interests, slug],
    }));

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      await updateProfile(profile);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2600);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container account-layout">
      <form className="card-block" onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Your details</h1>
          <p className="mono" style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{user.email}</p>
        </div>

        <label className="field">
          <span>Name</span>
          <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
        </label>
        <label className="field">
          <span>Phone</span>
          <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
        </label>
        <label className="field">
          <span>Address</span>
          <input
            value={profile.address.line1}
            onChange={(e) => setProfile({ ...profile, address: { ...profile.address, line1: e.target.value } })}
          />
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label className="field">
            <span>City</span>
            <input
              value={profile.address.city}
              onChange={(e) => setProfile({ ...profile, address: { ...profile.address, city: e.target.value } })}
            />
          </label>
          <label className="field">
            <span>Pincode</span>
            <input
              inputMode="numeric"
              value={profile.address.pincode}
              onChange={(e) => setProfile({ ...profile, address: { ...profile.address, pincode: e.target.value } })}
            />
          </label>
        </div>

        <div className="field" id="interests">
          <span>What you&rsquo;re into</span>
          <div className="interest-grid">
            {RANGES.map((r) => (
              <button
                key={r.slug}
                type="button"
                className="interest-tile"
                aria-pressed={profile.interests.includes(r.slug)}
                onClick={() => toggle(r.slug)}
              >
                <strong>{r.name}</strong>
              </button>
            ))}
          </div>
          <small style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
            This orders the homepage. It is not shared with anyone and it is not used for email.
          </small>
        </div>

        {error && <p className="notice bad">{error}</p>}
        {saved && <p className="notice good">Saved.</p>}

        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
        <h2 style={{ fontSize: 19, fontWeight: 700 }}>Your orders</h2>

        {orders === null && <p className="mono" style={{ color: 'var(--ink-3)' }}>Loading…</p>}

        {orders && orders.length === 0 && (
          <div className="notice">
            Nothing yet. Orders you place while signed in show up here with their status.
            <div style={{ marginTop: 10 }}>
              <Link href="/" className="btn ghost small">
                Start browsing
              </Link>
            </div>
          </div>
        )}

        {orders &&
          orders.map((o) => (
            <div className="order-row" key={o._id}>
              <div className="top">
                <strong className="mono">{o.reference}</strong>
                <span className="badge in-stock">{STATUS_LABEL[o.status] || o.status}</span>
              </div>
              <div className="top">
                <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                  {o.lines.map((l) => `${l.quantity}× ${l.name}`).join(', ')}
                </span>
                <span className="mono" style={{ fontWeight: 700 }}>{rupees(o.total)}</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                {o.totalSaved > 0 && ` · saved ${rupees(o.totalSaved)}`}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
