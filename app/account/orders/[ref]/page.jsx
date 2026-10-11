'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth';
import { rupees } from '../../../../lib/api';
import OrderTimeline, { ConfirmAndPay, STATUS_LABEL } from '../../../../components/OrderTimeline';

/** One order: its progress, what is in it, where it is going, how to pay. */
export default function OrderPage() {
  const { ref } = useParams();
  const { user, ready, loadOrder } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ready && !user) router.replace(`/login`);
  }, [ready, user, router]);

  useEffect(() => {
    if (!user || !ref) return;
    loadOrder(ref).then(setOrder).catch((err) => setError(err.message));
  }, [user, ref, loadOrder]);

  if (!ready || !user) return <div className="container empty"><p className="mono">Loading…</p></div>;
  if (error) {
    return (
      <div className="container empty">
        <h1>Not found</h1>
        <p>{error}</p>
        <Link href="/account" className="btn ghost">Back to your orders</Link>
      </div>
    );
  }
  if (!order) return <div className="container empty"><p className="mono">Loading…</p></div>;

  const c = order.customer || {};
  return (
    <div className="container order-page">
      <p><Link href="/account" className="muted" style={{ fontSize: 13 }}>&larr; Your orders</Link></p>
      <div className="account-head">
        <div>
          <span className="eyebrow">Order</span>
          <h1 className="mono">{order.reference}</h1>
        </div>
        <span className={`badge ${order.status === 'cancelled' ? 'sold-out' : 'in-stock'}`}>{STATUS_LABEL[order.status] || order.status}</span>
      </div>

      <div className="order-grid">
        <div className="card-block">
          <h2>Progress</h2>
          <OrderTimeline order={order} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ConfirmAndPay order={order} />

          <div className="card-block">
            <h2>In the box</h2>
            {order.lines.map((l, i) => (
              <div className="row" key={i}>
                <span>{l.quantity}× {l.slug ? <Link href={`/p/${l.slug}`}>{l.name}</Link> : l.name}</span>
                <span className="mono">{rupees(l.netLineTotal ?? l.lineTotal ?? 0)}</span>
              </div>
            ))}
            {order.totalSaved > 0 && <div className="row saved"><span>You saved</span><span className="mono">−{rupees(order.totalSaved)}</span></div>}
            <div className="row"><span>Shipping</span><span className="mono">{order.shipping === 0 ? 'Free' : rupees(order.shipping)}</span></div>
            <div className="row total"><span>Total</span><span className="mono">{rupees(order.total)}</span></div>
          </div>

          <div className="card-block">
            <h2>Going to</h2>
            <p style={{ fontSize: 14, lineHeight: 1.5 }}>
              {c.name}<br />
              {c.address}{c.address ? <br /> : null}
              {[c.city, c.pincode].filter(Boolean).join(' ')}<br />
              <span className="mono muted" style={{ fontSize: 12 }}>{c.phone}{c.email ? ` · ${c.email}` : ''}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
