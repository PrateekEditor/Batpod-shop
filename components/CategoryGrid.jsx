'use client';

import { useMemo, useState } from 'react';
import ProductCard from './ProductCard';

const SORTS = [
  { key: 'curated', label: 'Curated', fn: (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) },
  { key: 'priceAsc', label: 'Price low to high', fn: (a, b) => a.listPrice - b.listPrice },
  { key: 'priceDesc', label: 'Price high to low', fn: (a, b) => b.listPrice - a.listPrice },
  { key: 'newest', label: 'Newest', fn: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0) },
];

/**
 * The product grid for a range, sorted in the browser.
 *
 * Sorting used to be a query string, which forced every range page to be
 * rendered on request — the whole reason switching ranges felt slow. A range
 * has a dozen products; sorting them is a job for the browser, and keeping it
 * here is what lets the page itself be prerendered.
 */
export default function CategoryGrid({ items, accent }) {
  const [sort, setSort] = useState('curated');
  const sorted = useMemo(() => {
    const s = SORTS.find((x) => x.key === sort) || SORTS[0];
    return [...items].sort(s.fn);
  }, [items, sort]);

  if (items.length === 0) {
    return <p className="notice">Nothing in this range yet. Check back after the next print run.</p>;
  }

  return (
    <>
      <div className="sort-row" role="group" aria-label="Sort products">
        {SORTS.map((s) => (
          <button
            key={s.key}
            type="button"
            className={`tag ${sort === s.key ? 'on' : ''}`}
            style={sort === s.key ? { borderColor: accent, color: 'var(--ink)' } : undefined}
            onClick={() => setSort(s.key)}
            aria-pressed={sort === s.key}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="grid grid-animated">
        {sorted.map((p, i) => (
          <div key={p.slug} className="grid-cell" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </>
  );
}
