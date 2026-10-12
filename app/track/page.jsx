'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { trackOrder, rupees } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import OrderTimeline, { ConfirmAndPay, STATUS_LABEL } from '../../components/OrderTimeline';
import { Pressable } from '../../components/Motion';

/**
 * Track an order without an account.
 *
 * The reference is printed on the confirmation, but a reference alone opens
 * nothing: the server also wants the phone number (the last few digits will
 * do) or the email that was on the order. Signed-in customers get their
 * orders on the account page without any of this.
 */
export default function TrackPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ reference: '', by: 'phone', phone: '', email: '' });
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Arrive from a confirmation link with ?ref=BP-… and the box is filled.
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) setForm((f) => ({ ...f, reference: ref.toUpperCase() }));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setOrder(null);
    setBusy(true);
    try {
      const found = await trackOrder(form.reference, form.by === 'phone' ? { phone: form.phone } : { email: form.email });
      setOrder(found);
    } catch (err) {
      setError(err.status === 404 ? 'No order matches that reference and contact detail. Check both and try again.' : err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container auth-page track-page">
      <div>
        <h1>Track an order</h1>
        <p className="lede">
          Your reference looks like <span className="mono">BP-20261012-K7QX</span>. Add the phone number or email
          that was on the order so only you can see it.
          {user && (
            <>
              {' '}Signed in? Your orders are <Link href="/account">on your account</Link>.
            </>
          )}
        </p>
      </div>

      <form className="auth-form" onSubmit={submit}>
        <label className="field">
          <span>Order reference</span>
          <input
            value={form.reference}
            onChange={(e) => setForm({ ...form, reference: e.target.value.toUpperCase() })}
            placeholder="BP-…"
            className="mono"
            autoComplete="off"
            spellCheck={false}
            required
          />
        </label>

        <div className="chips" role="radiogroup" aria-label="Confirm with">
          <button type="button" className="chip" role="radio" aria-checked={form.by === 'phone'} aria-pressed={form.by === 'phone'} onClick={() => setForm({ ...form, by: 'phone' })}>Phone</button>
          <button type="button" className="chip" role="radio" aria-checked={form.by === 'email'} aria-pressed={form.by === 'email'} onClick={() => setForm({ ...form, by: 'email' })}>Email</button>
        </div>

        {form.by === 'phone' ? (
          <label className="field">
            <span>Phone on the order <em>last 4 digits are enough</em></span>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="numeric" autoComplete="tel" minLength={4} required />
          </label>
        ) : (
          <label className="field">
            <span>Email on the order</span>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" required />
          </label>
        )}

        {error && <p className="notice bad" role="alert">{error}</p>}

        <Pressable type="submit" className="btn" disabled={busy}>
          {busy ? 'Looking…' : 'Find my order'}
        </Pressable>
      </form>

      {order && (
        <div className="track-result">
          <div className="account-head">
            <div>
              <span className="eyebrow">Order</span>
              <h2 className="mono" style={{ fontSize: 22 }}>{order.reference}</h2>
            </div>
            <span className={`badge ${order.status === 'cancelled' ? 'sold-out' : 'in-stock'}`}>{STATUS_LABEL[order.status] || order.status}</span>
          </div>
          <div className="card-block">
            <OrderTimeline order={order} />
          </div>
          <div className="card-block">
            <h2>In the box</h2>
            {order.lines.map((l, i) => (
              <div className="row" key={i}>
                <span>{l.quantity}× {l.name}</span>
              </div>
            ))}
            <div className="row total"><span>Total</span><span className="mono">{rupees(order.total)}</span></div>
          </div>
          <ConfirmAndPay order={order} />
        </div>
      )}
    </div>
  );
}
