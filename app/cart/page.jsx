'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../lib/cart';
import { useAuth, getChannel } from '../../lib/auth';
import { placeOrder, rupees, imageSrc } from '../../lib/api';
import { ConfirmAndPay } from '../../components/OrderTimeline';
import AddressFields from '../../components/AddressFields';
import { Pressable, PressableLink } from '../../components/Motion';

export default function CartPage() {
  const { lines, quote, loading, hydrated, setQuantity, remove, clear, couponCode, setCouponCode } = useCart();
  const { user, token } = useAuth();
  const [coupon, setCoupon] = useState('');
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', address: '', city: '', state: '', pincode: '' });
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [placedLines, setPlacedLines] = useState([]);
  const [error, setError] = useState('');

  // Signed in? Fill in what we already know rather than making them type it
  // again. They can still change any of it.
  useEffect(() => {
    if (!user) return;
    setCustomer((c) => ({
      ...c,
      name: c.name || user.name || '',
      email: c.email || user.email || '',
      phone: c.phone || user.phone || '',
      address: c.address || (user.address && user.address.line1) || '',
      city: c.city || (user.address && user.address.city) || '',
      state: c.state || (user.address && user.address.state) || '',
      pincode: c.pincode || (user.address && user.address.pincode) || '',
    }));
  }, [user]);

  if (!hydrated) {
    return (
      <div className="container empty">
        <p className="mono">Loading your cart…</p>
      </div>
    );
  }

  if (placed) {
    const trackHref = user ? `/account/orders/${placed.reference}` : `/track?ref=${placed.reference}`;
    return (
      <div className="container placed">
        <div className="placed-head">
          <span className="eyebrow">Order received</span>
          <h1 className="mono">{placed.reference}</h1>
          <p>
            Save that reference. {user ? 'It is on your account page with its progress.' : 'You can track it with the phone number or email you gave.'}
          </p>
        </div>

        <ConfirmAndPay order={{ ...placed, lines: placedLines }} />

        <div className="wizard-actions">
          <PressableLink href={trackHref} className="btn ghost">
            Track this order
          </PressableLink>
          <PressableLink href="/" className="btn ghost">
            Back to the shop
          </PressableLink>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container empty">
        <h1>Your cart is empty</h1>
        <p>Four ranges to go through — bike gear, tabletop pieces, daily fixes, and minis.</p>
        <PressableLink href="/" className="btn">
          Start browsing
        </PressableLink>
      </div>
    );
  }

  const byslug = (slug) => (quote && quote.lines ? quote.lines.find((l) => l.slug === slug) : null);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setPlacing(true);
    try {
      const { channel, channelDetail } = getChannel();
      const result = await placeOrder({ customer, lines, couponCode, channel, channelDetail }, token);
      setPlacedLines(lines.map((l) => ({ name: (byslug(l.slug) || {}).name || l.slug, quantity: l.quantity })));
      setPlaced(result);
      clear();
    } catch (err) {
      setError(err.message || 'Could not place the order.');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="container cart-layout">
      <div style={{ minWidth: 0 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Your cart</h1>
        <p className="eyebrow" style={{ marginBottom: 16 }}>
          {loading ? 'Recalculating…' : 'Prices confirmed by the server'}
        </p>

        {lines.map((line) => {
          const q = byslug(line.slug);
          return (
            <div className="cart-line" key={line.slug}>
              <div className="mini">
                {q && q.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageSrc(q.image)} alt="" />
                ) : (
                  <span className="mono" style={{ fontSize: 9, color: 'var(--ink-3)' }}>
                    {q ? q.sku : ''}
                  </span>
                )}
              </div>

              <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link href={`/p/${line.slug}`} style={{ fontWeight: 600 }}>
                  {q ? q.name : line.slug}
                </Link>

                <div className="qty" style={{ alignSelf: 'flex-start' }}>
                  <button type="button" onClick={() => setQuantity(line.slug, line.quantity - 1)} aria-label="Reduce">
                    −
                  </button>
                  <span>{line.quantity}</span>
                  <button type="button" onClick={() => setQuantity(line.slug, line.quantity + 1)} aria-label="Increase">
                    +
                  </button>
                </div>

                {/* The adjustment trail, straight from the pricing engine. The
                    customer sees exactly which discount applied and why. */}
                {q &&
                  q.adjustments.map((a, i) => (
                    <div className="adjust" key={i}>
                      <span>{a.label}</span>
                      <span>{rupees(a.amount)}</span>
                    </div>
                  ))}

                <button
                  type="button"
                  onClick={() => remove(line.slug)}
                  style={{
                    background: 'none',
                    border: 0,
                    color: 'var(--ink-3)',
                    cursor: 'pointer',
                    fontSize: 12,
                    padding: 0,
                    alignSelf: 'flex-start',
                  }}
                >
                  Remove
                </button>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div className="price">{q ? rupees(q.netLineTotal) : '—'}</div>
                {q && q.savedAmount > 0 && (
                  <div className="mono" style={{ fontSize: 12, textDecoration: 'line-through', color: 'var(--ink-3)' }}>
                    {rupees(q.grossLineTotal)}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Where it goes</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
            <label className="field">
              <span>Name *</span>
              <input
                required
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Phone *</span>
              <input
                required
                inputMode="tel"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              />
            </label>
          </div>
          <AddressFields
            value={customer}
            onChange={(patch) => setCustomer((c) => ({ ...c, ...patch }))}
            productionDays={quote && quote.lines && quote.lines.some((l) => l.madeToOrder) ? 3 : 1}
            required
          />

          {error && <p className="notice bad">{error}</p>}

          <Pressable type="submit" className="btn" disabled={placing || loading}>
            {placing ? 'Sending…' : 'Place order'}
          </Pressable>
          <p style={{ fontSize: 12, color: 'var(--ink-3)' }}>
            No payment is taken yet. The order reaches the workshop and you get a message to confirm.
          </p>
        </form>
      </div>

      <aside>
        <div className="summary">
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Summary</h2>

          <div className="row">
            <span>Items</span>
            <span className="mono">{quote ? rupees(quote.grossSubtotal) : '—'}</span>
          </div>

          {quote &&
            quote.orderAdjustments.map((a, i) => (
              <div className="row saved" key={i}>
                <span>{a.label}</span>
                <span className="mono">{rupees(a.amount)}</span>
              </div>
            ))}

          {quote && quote.totalSaved > 0 && (
            <div className="row saved">
              <span>You save</span>
              <span className="mono">−{rupees(quote.totalSaved)}</span>
            </div>
          )}

          <div className="row">
            <span>Shipping</span>
            <span className="mono">{quote ? (quote.shipping === 0 ? 'Free' : rupees(quote.shipping)) : '—'}</span>
          </div>

          <div className="row total">
            <span>Total</span>
            <span className="mono">{quote ? rupees(quote.total) : '—'}</span>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <input
              className="field"
              placeholder="Discount code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              style={{ flex: 1, minWidth: 0, padding: '9px 10px', border: '1px solid var(--rule)', borderRadius: 3, background: 'var(--paper)', color: 'var(--ink)', fontFamily: 'var(--f-mono)', fontSize: 13 }}
            />
            <Pressable type="button" className="btn ghost small" onClick={() => setCouponCode(coupon)}>
              Apply
            </Pressable>
          </div>

          {quote && quote.coupon && (
            <p className={`notice ${quote.coupon.applied ? 'good' : 'bad'}`} style={{ fontSize: 12 }}>
              {quote.coupon.applied
                ? `${quote.coupon.code} applied — ${rupees(quote.coupon.amount)} off`
                : quote.coupon.reason}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
