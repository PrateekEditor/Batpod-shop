'use client';

import { useEffect, useState } from 'react';
import { getProductsBySlugs } from '../lib/api';
import { getViewed } from '../lib/cart';
import ProductCard from './ProductCard';

/**
 * The trail of everything they already looked at. Costs nothing, kept in this
 * browser only, and it is the rail people actually click — it is made of things
 * they already showed interest in.
 */
export default function RecentlyViewed({ excludeSlug }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const slugs = getViewed().filter((s) => s !== excludeSlug);
    if (slugs.length === 0) return;
    getProductsBySlugs(slugs)
      .then(setItems)
      .catch(() => setItems([]));
  }, [excludeSlug]);

  if (items.length === 0) return null;

  return (
    <section className="section">
      <div className="section-head">
        <h2>You were looking at</h2>
      </div>
      <div className="rail">
        {items.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
