'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart, rememberViewed } from '../lib/cart';
import { getQuote, rupees } from '../lib/api';
import { Pressable } from './Motion';

/**
 * Buy box.
 *
 * The quantity stepper re-quotes against the server as you change it, so the
 * volume tier appears the moment the customer crosses it — the discount is a
 * reason to add one more, not a surprise at checkout.
 */
export default function AddToCart({ product }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [livePrice, setLivePrice] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    rememberViewed(product.slug);
  }, [product.slug]);

  useEffect(() => {
    let cancelled = false;
    getQuote([{ slug: product.slug, quantity: qty }])
      .then((q) => {
        if (!cancelled && q.lines && q.lines[0]) setLivePrice(q.lines[0]);
      })
      .catch(() => {
        if (!cancelled) setLivePrice(null);
      });
    return () => {
      cancelled = true;
    };
  }, [product.slug, qty]);

  const soldOut = !product.madeToOrder && product.stockOnHand <= 0;
  const maxQty = product.madeToOrder ? 99 : Math.max(1, product.stockOnHand);

  function handleAdd() {
    add(product.slug, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2600);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <span className="price" style={{ fontSize: 28 }}>
          {rupees(livePrice ? livePrice.netUnitPrice : product.listPrice)}
        </span>
        {livePrice && livePrice.savedPercent > 0 && (
          <>
            <span className="mono" style={{ textDecoration: 'line-through', color: 'var(--ink-3)' }}>
              {rupees(product.listPrice)}
            </span>
            <span className="badge in-stock">Save {Math.round(livePrice.savedPercent)}%</span>
          </>
        )}
      </div>

      {product.madeToOrder && (
        <p className="notice">Made to order — printed after you buy, usually ready in {product.leadTimeDays} days.</p>
      )}

      {!soldOut && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="qty">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Reduce quantity">
              −
            </button>
            <span>{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <Pressable type="button" className="btn" onClick={handleAdd}>
            Add to cart
          </Pressable>
        </div>
      )}

      {soldOut && <p className="notice bad">Sold out right now. More get printed every week.</p>}

      {livePrice && qty > 1 && (
        <p className="mono" style={{ fontSize: 13, color: 'var(--ink-2)' }}>
          {qty} × {rupees(livePrice.netUnitPrice)} = {rupees(livePrice.netLineTotal)}
          {livePrice.savedAmount > 0 && <span style={{ color: 'var(--good)' }}> · you save {rupees(livePrice.savedAmount)}</span>}
        </p>
      )}

      {added && (
        <p className="notice good">
          Added. <Link href="/cart" style={{ color: 'var(--structure)', fontWeight: 600 }}>Go to cart →</Link>
        </p>
      )}
    </div>
  );
}
