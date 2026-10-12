'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { rupees } from '../../lib/api';
import ProfileQuestions, { mergeProfile, splitProfile } from '../../components/ProfileQuestions';
import { PersonalisationToggle } from '../../components/CookieConsent';
import { STATUS_LABEL } from '../../components/OrderTimeline';
import AddressFields from '../../components/AddressFields';
import { Pressable, PressableLink } from '../../components/Motion';

/**
 * The account, in three tabs: orders (the reason most people come back),
 * details (what goes on the parcel), preferences (the optional questions
 * from signup, answerable or changeable any time).
 */
const TABS = [
  { key: 'orders', label: 'Orders' },
  { key: 'details', label: 'Details' },
  { key: 'preferences', label: 'Preferences' },
];

export default function AccountPage() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('orders');

  // /account?tab=preferences opens straight on that tab (the header menu uses it).
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get('tab');
    if (TABS.some((t) => t.key === wanted)) setTab(wanted);
  }, []);

  useEffect(() => {
    if (ready && !user) router.replace('/login');
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="container empty">
        <p className="mono">Loading…</p>
      </div>
    );
  }

  return (
    <div className="container account-page">
      <div className="account-head">
        <div>
          <h1>{user.name ? `Hi, ${user.name.split(' ')[0]}.` : 'Your account'}</h1>
          <p className="mono muted" style={{ fontSize: 12 }}>{user.email}</p>
        </div>
        <Pressable type="button" className="btn ghost small" onClick={() => { logout(); router.push('/'); }}>
          Sign out
        </Pressable>
      </div>

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'on' : ''} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'orders' && <OrdersTab />}
      {tab === 'details' && <DetailsTab />}
      {tab === 'preferences' && <PreferencesTab />}
    </div>
  );
}

function OrdersTab() {
  const { loadOrders } = useAuth();
  const [orders, setOrders] = useState(null);
  useEffect(() => {
    loadOrders().then(setOrders).catch(() => setOrders([]));
  }, [loadOrders]);

  if (orders === null) return <p className="mono muted">Loading…</p>;
  if (orders.length === 0) {
    return (
      <div className="notice">
        Nothing yet. Orders you place while signed in show up here with their progress.
        <div style={{ marginTop: 10 }}>
          <PressableLink href="/" className="btn ghost small">Start browsing</PressableLink>
        </div>
      </div>
    );
  }

  return (
    <div className="order-list">
      {orders.map((o) => (
        <Link href={`/account/orders/${o.reference}`} className="order-row" key={o._id}>
          <div className="top">
            <strong className="mono">{o.reference}</strong>
            <span className={`badge ${o.status === 'cancelled' ? 'sold-out' : 'in-stock'}`}>{STATUS_LABEL[o.status] || o.status}</span>
          </div>
          <div className="top">
            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{o.lines.map((l) => `${l.quantity}× ${l.name}`).join(', ')}</span>
            <span className="mono" style={{ fontWeight: 700 }}>{rupees(o.total)}</span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
            {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            {o.totalSaved > 0 && ` · saved ${rupees(o.totalSaved)}`}
            {' · '}track &rarr;
          </span>
        </Link>
      ))}
    </div>
  );
}

function useSaver(buildPatch) {
  const { updateProfile } = useAuth();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function save(value) {
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      await updateProfile(buildPatch(value));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2600);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return { save, saved, error, busy };
}

function DetailsTab() {
  const { user } = useAuth();
  const [d, setD] = useState({
    name: user.name || '',
    phone: user.phone || '',
    address: { line1: '', city: '', state: '', pincode: '', ...(user.address || {}) },
  });
  const { save, saved, error, busy } = useSaver((v) => v);

  return (
    <form className="card-block" onSubmit={(e) => { e.preventDefault(); save(d); }} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 520 }}>
      <p className="muted" style={{ fontSize: 13 }}>Filled into the cart so you do not type it each time. Change any of it there too.</p>
      <label className="field"><span>Name</span><input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} autoComplete="name" /></label>
      <label className="field"><span>Phone</span><input value={d.phone} onChange={(e) => setD({ ...d, phone: e.target.value })} inputMode="tel" autoComplete="tel" /></label>
      <AddressFields
        value={{ address: d.address.line1, city: d.address.city, state: d.address.state, pincode: d.address.pincode }}
        onChange={(patch) => {
          const next = {};
          if (patch.address !== undefined) next.line1 = patch.address;
          for (const k of ['city', 'state', 'pincode']) if (patch[k] !== undefined) next[k] = patch[k];
          setD((cur) => ({ ...cur, address: { ...cur.address, ...next } }));
        }}
        compact
      />
      {error && <p className="notice bad">{error}</p>}
      {saved && <p className="notice good">Saved.</p>}
      <Pressable className="btn" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</Pressable>
    </form>
  );
}

function PreferencesTab() {
  const { user } = useAuth();
  const [p, setP] = useState(() => mergeProfile(user));
  const { save, saved, error, busy } = useSaver((v) => ({ ...splitProfile(v), consent: { marketing: v.offersOptIn, personalisation: Boolean(user.consent && user.consent.personalisation) } }));

  return (
    <form className="card-block" onSubmit={(e) => { e.preventDefault(); save(p); }} style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 640 }}>
      <p className="muted" style={{ fontSize: 13 }}>
        All optional. These shape what the shop shows you; none of it is shown to anyone else or used for anything but that.
      </p>
      <ProfileQuestions value={p} onChange={setP} />
      <fieldset className="question">
        <legend>This browser</legend>
        <PersonalisationToggle />
      </fieldset>
      {error && <p className="notice bad">{error}</p>}
      {saved && <p className="notice good">Saved.</p>}
      <Pressable className="btn" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save preferences'}</Pressable>
    </form>
  );
}
