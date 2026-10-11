'use client';

import Link from 'next/link';
import { useConsent, setConsent } from '../lib/consent';

/**
 * The consent notice. Shows once, at the bottom, and goes away for good on
 * either answer. The two buttons carry equal weight on purpose: a notice
 * where "accept" is a big button and "decline" is a grey link is not asking.
 */
export default function CookieConsent() {
  const consent = useConsent();
  if (consent !== null) return null; // undefined = not mounted yet, object = answered

  return (
    <div className="consent" role="dialog" aria-live="polite" aria-label="Personalisation choice">
      <div className="consent-copy">
        <strong>No cookies, one question.</strong>
        <p>
          The shop keeps your cart and theme in this browser because it has to. It can also remember what you
          looked at and use that to pick things for you. Nothing is sent to anyone else either way.{' '}
          <Link href="/privacy">What is stored</Link>
        </p>
      </div>
      <div className="consent-actions">
        <button type="button" className="btn ghost small" onClick={() => setConsent({ personalisation: false })}>
          Essentials only
        </button>
        <button type="button" className="btn small" onClick={() => setConsent({ personalisation: true })}>
          Remember what I look at
        </button>
      </div>
    </div>
  );
}

/** The same choice as a toggle, for the privacy page and the account page. */
export function PersonalisationToggle() {
  const consent = useConsent();
  const on = Boolean(consent && consent.personalisation);
  return (
    <label className="check-row">
      <input type="checkbox" checked={on} onChange={(e) => setConsent({ personalisation: e.target.checked })} />
      <span>
        <strong>Remember what I look at</strong>
        <small>
          Keeps a short list of products you opened, in this browser only, and uses it for the &ldquo;picked for
          you&rdquo; rail.{' '}
          {consent === null ? 'Not decided yet — treated as off.' : consent ? `Set ${new Date(consent.at).toLocaleDateString('en-IN')}.` : ''}
        </small>
      </span>
    </label>
  );
}
