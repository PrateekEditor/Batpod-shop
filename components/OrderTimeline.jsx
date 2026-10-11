'use client';

import { SITE, whatsappLink, upiLink, orderMessage } from '../lib/site';
import { rupees } from '../lib/api';

/**
 * Where an order is, as a line of steps rather than a status word.
 *
 * The steps are the life of every order: received, confirmed, on the printer,
 * with the courier, delivered. Each one lights up with the time it happened,
 * taken from the status history the server keeps. A cancelled order shows
 * that instead of the line.
 */
export const STEPS = [
  { key: 'draft', label: 'Received', blurb: 'Your order reached the workshop.' },
  { key: 'placed', label: 'Confirmed', blurb: 'Checked and queued for printing.' },
  { key: 'printing', label: 'Printing', blurb: 'On the printer. Small parts take an hour or two; big ones a day.' },
  { key: 'shipped', label: 'Shipped', blurb: 'Packed and with the courier.' },
  { key: 'delivered', label: 'Delivered', blurb: 'With you. Enjoy it.' },
];

export const STATUS_LABEL = Object.fromEntries(STEPS.map((s) => [s.key, s.label]));
STATUS_LABEL.cancelled = 'Cancelled';

const when = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '';

export default function OrderTimeline({ order }) {
  const history = order.statusHistory || [];
  const at = (key) => {
    const h = history.filter((x) => x.status === key).pop();
    return h ? h.at : key === 'draft' ? order.createdAt : null;
  };
  const current = STEPS.findIndex((s) => s.key === order.status);

  if (order.status === 'cancelled') {
    return (
      <div className="timeline cancelled">
        <p className="notice bad">
          This order was cancelled{at('cancelled') ? ` on ${when(at('cancelled'))}` : ''}. If that is a surprise, send
          a message and it can be looked into.
        </p>
      </div>
    );
  }

  return (
    <ol className="timeline" aria-label="Order progress">
      {STEPS.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'now' : 'next';
        const time = state === 'next' ? null : at(s.key);
        return (
          <li key={s.key} className={state} aria-current={state === 'now' ? 'step' : undefined}>
            <span className="dot" aria-hidden="true" />
            <div>
              <strong>{s.label}</strong>
              <span className="tl-when mono">{time ? when(time) : state === 'now' ? 'now' : ''}</span>
              <p>{state === 'now' && s.key === 'shipped' && order.courierRef ? `Courier reference ${order.courierRef}.` : s.blurb}</p>
            </div>
          </li>
        );
      })}
      {order.trackingNote && (
        <li className="note">
          <span className="dot" aria-hidden="true" />
          <div>
            <strong>From the workshop</strong>
            <p>{order.trackingNote}</p>
          </div>
        </li>
      )}
    </ol>
  );
}

/**
 * Confirm and pay. Until a payment gateway is wired in, an order is settled
 * by a WhatsApp message and a UPI transfer. Both buttons come pre-filled:
 * the message with the reference and lines, the UPI link with the amount.
 */
export function ConfirmAndPay({ order, compact = false }) {
  const wa = whatsappLink(orderMessage(order));
  const upi = upiLink({ amount: order.total, note: `Order ${order.reference}` });
  const settled = ['shipped', 'delivered', 'cancelled'].includes(order.status);
  if (settled) return null;

  return (
    <div className={`pay-box ${compact ? 'compact' : ''}`}>
      <div>
        <strong>Confirm and pay</strong>
        <p className="muted" style={{ fontSize: 13 }}>
          Nothing has been charged. Send a quick message to confirm, then pay {rupees(order.total)} by UPI. Printing
          starts once it lands.
        </p>
      </div>
      <div className="pay-actions">
        {wa ? (
          <a className="btn" href={wa} target="_blank" rel="noopener noreferrer">
            Confirm on WhatsApp
          </a>
        ) : (
          <span className="btn" aria-disabled="true" title="WhatsApp number not set yet">
            WhatsApp number coming soon
          </span>
        )}
        {upi ? (
          <a className="btn ghost" href={upi}>
            Pay {rupees(order.total)} by UPI
          </a>
        ) : (
          <span className="btn ghost" aria-disabled="true" title="UPI ID not set yet">
            UPI details coming soon
          </span>
        )}
      </div>
      {upi && (
        <p className="tiny muted">
          On a computer? Pay to <span className="mono">{SITE.upiId}</span> and put <span className="mono">{order.reference}</span> in
          the note.
        </p>
      )}
    </div>
  );
}
