'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../lib/cart';
import { placeOrder, rupees } from '../../lib/api';

export default function CartPage() {
  const { lines, quote, loading, hydrated, setQuantity, remove, clear, couponCode, setCouponCode } = useCart();
  const [coupon, setCoupon] = useState('');
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', address: '', city: '', pincode: '' });
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [error, setError] = useState('');

  if (!hydrated) {
    return (
      <div className="container empty">
        <p className="mono">Loading your cart…</p>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="container empty">
        <h1>Order received</h1>
        <p>
          Your reference is <strong className="mono">{placed.reference}</strong>. Save it — you can look it up any
          time.
        </p>
        <p>
          Nothing has been charged yet. Payment is being added shortly; until then you will get a message to confirm
          and settle up.
        </p>
        <Link href="/" className="btn">
          Back to the shop
        </Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container empty">
        <h1>Your cart is empty</h1>
        <p>Three ranges to go through — bike gear, tabletop pieces, and small daily fixes.</p>
        <Link href="/" className="btn">
          Start browsing
        </Link>
      </div>
    );
  }

  const byslug = (slug) => (quote && quote.lines ? quote.lines.find((l) => l.slug === slug) : null);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setPlacing(true);
    try {
      const result = await placeOrder({ customer, lines, couponCode });
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
                  <img src={q.image} alt="" />
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
            <label className="field">
              <span>Pincode</span>
              <input
                inputMode="numeric"
                value={customer.pincode}
                onChange={(e) => setCustomer({ ...customer, pincode: e.target.value })}
              />
            </label>
          </div>
          <label className="field">
            <span>Address</span>
            <textarea
              rows={3}
              value={customer.address}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
            />
          </label>

          {error && <p className="notice bad">{error}</p>}

          <button type="submit" className="btn" disabled={placing || loading}>
            {placing ? 'Sending…' : 'Place order'}
          </button>
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
            <button type="button" className="btn ghost small" onClick={() => setCouponCode(coupon)}>
              Apply
            </button>
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
