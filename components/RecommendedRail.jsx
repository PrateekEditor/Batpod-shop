'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '../lib/api';
import { getViewed } from '../lib/cart';
import { useAuth } from '../lib/auth';
import ProductCard from './ProductCard';

/**
 * The rail at the top of the homepage.
 *
 * Client-side on purpose: it needs the recently-viewed list, which lives in
 * this browser, and the signed-in token, which the server rendering the page
 * does not have.
 *
 * It renders a reserved space while loading rather than appearing from nothing,
 * so the rest of the page does not jump once it arrives.
 */
export default function RecommendedRail({ limit = 6, excludeSlug, title = 'Picked for you' }) {
  const { token, ready } = useAuth();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams({ limit: String(limit) });
    const recent = getViewed();
    if (recent.length) params.set('recent', recent.join(','));
    if (excludeSlug) params.set('exclude', excludeSlug);

    fetch(`${API_URL}/api/recommendations?${params}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('failed'))))
      .then(setData)
      .catch(() => setFailed(true));
  }, [ready, token, limit, excludeSlug]);

  // Nothing to say and nothing to show — stay out of the way rather than
  // leaving an empty heading on the page.
  if (failed || (data && data.items.length === 0)) return null;

  const basisLabel = data
    ? data.personalised
      ? `based on your ${data.basis.join(', ')}`
      : 'what people are buying most'
    : '';

  return (
    <section className="rail-section">
      <div className="section-head">
        <div>
          <h2>{data && !data.personalised ? 'Popular right now' : title}</h2>
          {data && <p className="rail-basis">{basisLabel}</p>}
        </div>
      </div>

      {!data ? (
        <div className="rail" aria-hidden="true">
          {Array.from({ length: Math.min(limit, 4) }).map((_, i) => (
            <div key={i} className="card-skeleton" />
          ))}
        </div>
      ) : (
        <div className="rail">
          {data.items.map((p) => (
            <div key={p.slug} style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
              <ProductCard product={p} />
              {p.reason && <span className="reason">{p.reason}</span>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
