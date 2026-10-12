'use client';

import { useEffect, useState } from 'react';
import { getStatus } from '../lib/api';
import SocialLinks from './SocialLinks';
import { Pressable } from './Motion';

/**
 * Stands between the reader and the shop when the shop is not open.
 *
 * Three cases, and they look different on purpose:
 *   paused       - the owner is away; browsing may still be allowed, ordering is not
 *   maintenance  - something is being fixed; a holding page
 *   unreachable  - the API did not answer twice in a row: the server is down and
 *                  nobody has flipped a switch, so say that honestly rather than
 *                  showing pages whose buttons would all fail
 *
 * Polled every minute. The first render assumes open so a prerendered page
 * is never blanked while the status is still loading.
 */
const POLL_MS = 60000;
const FAILS_BEFORE_UNREACHABLE = 2;

export default function ShopGate({ children }) {
  const [status, setStatus] = useState({ mode: 'open' });
  const [fails, setFails] = useState(0);

  useEffect(() => {
    let alive = true;
    async function tick() {
      try {
        const s = await getStatus();
        if (!alive) return;
        if (s.reachable === false) {
          setFails((n) => n + 1);
        } else {
          setFails(0);
          setStatus(s);
        }
      } catch {
        if (alive) setFails((n) => n + 1);
      }
    }
    tick();
    const id = setInterval(tick, POLL_MS);
    const onFocus = () => tick();
    window.addEventListener('focus', onFocus);
    return () => { alive = false; clearInterval(id); window.removeEventListener('focus', onFocus); };
  }, []);

  const unreachable = fails >= FAILS_BEFORE_UNREACHABLE;
  const mode = unreachable ? 'unreachable' : status.mode;

  if (mode === 'open') return children;
  if (mode === 'paused' && status.allowBrowsing) {
    return (
      <>
        <div className="shop-banner" role="status">
          <strong>{status.title || 'The shop is paused'}</strong>
          <span>{status.message || 'You can browse, but ordering is switched off for now.'}</span>
          {status.until && <span className="mono">Back {new Date(status.until).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>}
        </div>
        {children}
      </>
    );
  }

  const copy = {
    paused: { title: status.title || 'Taking a short break', text: status.message || 'The workshop is closed for a few days. Nothing is lost - come back and your cart will still be here.' },
    maintenance: { title: status.title || 'Down for maintenance', text: status.message || 'Something is being fixed. The shop will be back shortly.' },
    unreachable: { title: 'The shop is not reachable right now', text: 'The server is not answering. This usually clears in a few minutes; if it does not, the links below still work.' },
  }[mode];

  return (
    <div className="container holding">
      <span className="eyebrow">{mode === 'unreachable' ? 'Temporary' : 'From the workshop'}</span>
      <h1>{copy.title}</h1>
      <p>{copy.text}</p>
      {status.until && mode !== 'unreachable' && (
        <p className="mono">Back around {new Date(status.until).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
      )}
      <SocialLinks size="large" />
      <Pressable type="button" className="btn ghost" onClick={() => window.location.reload()}>Try again</Pressable>
    </div>
  );
}
