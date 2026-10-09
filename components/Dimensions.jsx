'use client';

import { useState } from 'react';
import ProductViews, { formatLength } from './ProductViews';

/**
 * Will it fit?
 *
 * The question behind every dimension table. Numbers alone are hard to
 * picture, so beside them the product is drawn to the same scale as things
 * people already know the size of - a card from their wallet, a coin, a
 * sheet of paper - and the unit can be flipped between mm, cm and inches.
 */
const UNITS = [
  { key: 'mm', label: 'mm' },
  { key: 'cm', label: 'cm' },
  { key: 'in', label: 'inch' },
];

/** Reference objects, in mm. */
const REFS = [
  { key: 'coin', name: '₹10 coin', w: 27, h: 27, round: true },
  { key: 'card', name: 'Debit card', w: 85.6, h: 54 },
  { key: 'phone', name: 'Phone', w: 72, h: 150 },
  { key: 'a4', name: 'A4 sheet', w: 210, h: 297 },
];

/** Pick the smallest reference that is not dwarfed by the product, and one up. */
function pickRefs(w, h) {
  const longest = Math.max(w, h);
  const i = REFS.findIndex((r) => Math.max(r.w, r.h) >= longest * 0.6);
  const first = i === -1 ? REFS.length - 1 : i;
  return [REFS[Math.max(0, first - 1)], REFS[first]].filter((r, k, arr) => arr.indexOf(r) === k);
}

export default function Dimensions({ product }) {
  const [unit, setUnit] = useState('mm');
  const w = product.footprintMm?.x || 0;
  const d = product.footprintMm?.y || 0;
  const h = product.heightMm || 0;
  const has = w > 0 && d > 0 && h > 0;

  // The to-scale strip: product front (w x h) next to reference objects, all
  // in one SVG so one scale factor applies to everything.
  const refs = has ? pickRefs(w, h) : [];
  const items = has ? [{ key: 'product', name: product.name, w, h, product: true }, ...refs] : [];
  const gap = 18;
  const totalW = items.reduce((n, it) => n + it.w, 0) + gap * Math.max(0, items.length - 1);
  const maxH = Math.max(1, ...items.map((it) => it.h));
  const scale = Math.min(360 / Math.max(totalW, 1), 150 / maxH);

  return (
    <div className="dimensions">
      <div className="dimensions-head">
        <div>
          <h2>Size</h2>
          <p className="muted">Measured on the printed part, not the model.</p>
        </div>
        <div className="unit-seg" role="group" aria-label="Units">
          {UNITS.map((u) => (
            <button key={u.key} type="button" className={unit === u.key ? 'on' : ''} onClick={() => setUnit(u.key)} aria-pressed={unit === u.key}>
              {u.label}
            </button>
          ))}
        </div>
      </div>

      <ProductViews product={product} unit={unit} />

      {has ? (
        <>
          <dl className="dim-list">
            <div><dt>Width</dt><dd className="mono">{formatLength(w, unit)}</dd></div>
            <div><dt>Depth</dt><dd className="mono">{formatLength(d, unit)}</dd></div>
            <div><dt>Height</dt><dd className="mono">{formatLength(h, unit)}</dd></div>
            <div><dt>Weight</dt><dd className="mono">{product.filamentGrams ? `${product.filamentGrams} g` : '-'}</dd></div>
          </dl>

          <div className="scale-strip">
            <svg viewBox={`-6 -6 ${totalW * scale + 12} ${maxH * scale + 30}`} className="scale-svg" role="img" aria-label={`${product.name} drawn to scale next to ${refs.map((r) => r.name).join(' and ')}`}>
              {(() => {
                let x = 0;
                return items.map((it) => {
                  const bw = it.w * scale;
                  const bh = it.h * scale;
                  const y = maxH * scale - bh;
                  const el = (
                    <g key={it.key}>
                      {it.round ? (
                        <circle cx={x + bw / 2} cy={y + bh / 2} r={bw / 2} className="ref-shape" />
                      ) : (
                        <rect x={x} y={y} width={bw} height={bh} rx={it.product ? 1.5 : 3} className={it.product ? 'product-shape' : 'ref-shape'} />
                      )}
                      <text x={x + bw / 2} y={maxH * scale + 14} textAnchor="middle" className="scale-label">{it.product ? 'This' : it.name}</text>
                    </g>
                  );
                  x += bw + gap * scale;
                  return el;
                });
              })()}
            </svg>
            <p className="tiny muted">Front view, same scale. Shown next to things you already know the size of.</p>
          </div>
        </>
      ) : (
        <p className="notice">Dimensions for this part have not been recorded yet.</p>
      )}
    </div>
  );
}
