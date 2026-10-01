'use client';

import { useEffect, useState } from 'react';
import { getQuote, rupees } from '../lib/api';

/**
 * "Buy more, pay less" panel.
 *
 * Rather than hard-coding the tiers in the storefront, this asks the server to
 * quote the same product at 1, 3, 6 and 10 and shows whatever comes back. Change
 * a discount schedule in the admin and this panel changes with it, with no
 * deploy — which is the whole reason the pricing lives on the server.
 */
const STEPS = [3, 6, 10];

export default function VolumeBreaks({ slug, listPrice }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all(STEPS.map((q) => getQuote([{ slug, quantity: q }]).catch(() => null)))
      .then((results) => {
        if (cancelled) return;
        const found = results
          .map((r, i) => {
            if (!r || !r.lines || !r.lines[0]) return null;
            const line = r.lines[0];
            const perUnit = line.netUnitPrice;
            return { qty: STEPS[i], perUnit, saved: Math.round(line.savedPercent) };
          })
          .filter((r) => r && r.saved > 0);

        // Only show a step if it beats the one before it.
        const unique = [];
        let best = 0;
        for (const row of found) {
          if (row.saved > best) {
            unique.push(row);
            best = row.saved;
          }
        }
        setRows(unique);
      })
      .catch(() => setRows([]));

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (rows.length === 0) return null;

  return (
    <div className="breaks">
      <h4>Buy more, pay less</h4>
      {rows.map((r) => (
        <div className="break-row" key={r.qty}>
          <span>
            {r.qty} or more · {rupees(r.perUnit)} each
          </span>
          <span className="save">−{r.saved}%</span>
        </div>
      ))}
      <p style={{ fontSize: 12, color: 'var(--ink-3)' }}>
        Applied automatically in the cart. Handy for a riding group or a gift set.
      </p>
    </div>
  );
}
