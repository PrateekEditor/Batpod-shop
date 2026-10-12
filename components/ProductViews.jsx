'use client';
import { imageSrc } from '../lib/api';

import { useEffect, useRef, useState } from 'react';
import { P, poly, box, flat, onLeft, onRight, Faces, shade } from './scenes/iso';
import { swatch } from './scenes/Scenes';

/**
 * Every side of the product, as a carousel.
 *
 * Photos come first when there are any. After them come four views drawn to
 * scale from the dimensions and colours recorded on the product — an angled
 * view, the front, the side and the top — each with its measurements on it.
 * Until a product has been photographed, these are what tell a buyer whether
 * it fits where they mean to put it.
 */

const VIEWS = ['angle', 'front', 'side', 'top'];
const LABEL = { angle: 'Angled', front: 'Front', side: 'Side', top: 'Top' };

function dims(product) {
  const w = product.footprintMm?.x || 0;
  const d = product.footprintMm?.y || 0;
  const h = product.heightMm || 0;
  return { w, d, h, ok: w > 0 && d > 0 && h > 0 };
}

/** Scale any part into a 200-unit frame, keep the real proportions. */
function fit(w, d, h) {
  const longest = Math.max(w, d, h, 1);
  const s = 150 / longest;
  return { w: w * s, d: d * s, h: h * s, s };
}

function Dim({ from, to, text, offset = 14, side = 'below' }) {
  const [x0, y0] = from;
  const [x1, y1] = to;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * offset;
  const ny = (dx / len) * offset;
  const ax = x0 + nx;
  const ay = y0 + ny;
  const bx = x1 + nx;
  const by = y1 + ny;
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  return (
    <g className="dim">
      <line x1={x0} y1={y0} x2={ax} y2={ay} />
      <line x1={x1} y1={y1} x2={bx} y2={by} />
      <line x1={ax} y1={ay} x2={bx} y2={by} className="dim-main" />
      <text x={mx + nx * 0.55} y={my + ny * 0.55 + 3.5} textAnchor="middle" className="dim-text">{text}</text>
    </g>
  );
}

function View({ kind, product, unit }) {
  const { w, d, h } = dims(product);
  const f = fit(w, d, h);
  const colours = product.colours && product.colours.length ? product.colours : ['grey'];
  const main = swatch(colours[0]);
  const accent = swatch(colours[1] || colours[0]);
  const fmt = (mm) => formatLength(mm, unit);

  if (kind === 'angle') {
    const b = box(0, 0, 0, f.w, f.d, f.h);
    const band = h > 8 ? onLeft(f.d, 0, f.w, f.h * 0.72, f.h * 0.86) : null;
    const [sx0, sy0] = P(f.w, f.d, 0);
    const [sx1, sy1] = P(f.w, 0, 0);
    const [fx0, fy0] = P(0, f.d, 0);
    const [hx0, hy0] = P(f.w, 0, 0);
    const [hx1, hy1] = P(f.w, 0, f.h);
    const pts = [P(0, 0, f.h), P(f.w, 0, 0), P(0, f.d, 0), P(f.w, f.d, 0), P(f.w, f.d, f.h), P(0, f.d, f.h), P(f.w, 0, f.h)];
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const vb = `${Math.min(...xs) - 44} ${Math.min(...ys) - 24} ${Math.max(...xs) - Math.min(...xs) + 88} ${Math.max(...ys) - Math.min(...ys) + 64}`;
    return (
      <svg viewBox={vb} className="view-svg">
        <polygon points={poly([[f.w, 0, 0], [f.w + f.h * 0.5, f.h * 0.12, 0], [f.w + f.h * 0.5, f.d + f.h * 0.12, 0], [f.w, f.d, 0]])} fill="rgba(30,40,55,0.12)" />
        <Faces b={b} colour={main} />
        {band && <polygon points={band} fill={accent} opacity="0.95" />}
        <Dim from={[fx0, fy0]} to={[sx0, sy0]} text={fmt(w)} offset={16} />
        <Dim from={[sx0, sy0]} to={[sx1, sy1]} text={fmt(d)} offset={-16} />
        <Dim from={[hx0, hy0]} to={[hx1, hy1]} text={fmt(h)} offset={-18} />
      </svg>
    );
  }

  // Orthographic views: a plain rectangle, the real proportions, dims on two edges.
  const [rw, rh] = kind === 'front' ? [f.w, f.h] : kind === 'side' ? [f.d, f.h] : [f.w, f.d];
  const [lw, lh] = kind === 'front' ? [w, h] : kind === 'side' ? [d, h] : [w, d];
  const s = shade(main);
  const fill = kind === 'top' ? s.top : kind === 'front' ? s.right : s.left;
  return (
    <svg viewBox={`-40 -24 ${rw + 80} ${rh + 64}`} className="view-svg">
      <rect x="0" y="0" width={rw} height={rh} fill={fill} stroke="rgba(20,24,29,0.4)" strokeWidth="0.8" rx="1.5" />
      {kind !== 'top' && h > 8 && <rect x="0" y={rh * 0.14} width={rw} height={rh * 0.14} fill={accent} opacity="0.95" />}
      {kind === 'top' && <rect x={rw * 0.1} y={rh * 0.1} width={rw * 0.8} height={rh * 0.8} fill="none" stroke="rgba(20,24,29,0.18)" strokeDasharray="2 2" />}
      <Dim from={[0, rh]} to={[rw, rh]} text={fmt(lw)} offset={14} />
      <Dim from={[rw, rh]} to={[rw, 0]} text={fmt(lh)} offset={14} />
    </svg>
  );
}

export function formatLength(mm, unit) {
  if (unit === 'cm') return `${(mm / 10).toFixed(1)} cm`;
  if (unit === 'in') return `${(mm / 25.4).toFixed(2)} in`;
  return `${Math.round(mm)} mm`;
}

export default function ProductViews({ product, unit = 'mm' }) {
  const photos = product.images || [];
  const geometry = dims(product).ok;
  const slides = [
    ...photos.map((src, i) => ({ key: `photo-${i}`, kind: 'photo', src, label: i === 0 ? 'Photo' : `Photo ${i + 1}` })),
    ...(geometry ? VIEWS.map((v) => ({ key: v, kind: v, label: LABEL[v] })) : []),
  ];
  const [index, setIndex] = useState(0);
  const track = useRef(null);
  const count = slides.length;

  // Keep the track in step with the index, and the index in step with a swipe.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
  }, [index]);

  function onScroll() {
    const el = track.current;
    if (!el || !el.clientWidth) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(i);
  }

  if (count === 0) {
    return (
      <div className="gallery">
        <span className="mono" style={{ color: 'var(--ink-3)', fontSize: 12, letterSpacing: '0.1em' }}>{product.sku}</span>
      </div>
    );
  }

  return (
    <div className="views">
      <div className="views-track" ref={track} onScroll={onScroll} style={{ viewTransitionName: `product-${product.slug}` }}>
        {slides.map((s) => (
          <div className="views-slide" key={s.key} aria-label={s.label} role="group">
            {s.kind === 'photo' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageSrc(s.src)} alt={`${product.name} - ${s.label}`} />
            ) : (
              <View kind={s.kind} product={product} unit={unit} />
            )}
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button type="button" className="views-arrow prev" aria-label="Previous view" onClick={() => setIndex((i) => (i - 1 + count) % count)}>‹</button>
          <button type="button" className="views-arrow next" aria-label="Next view" onClick={() => setIndex((i) => (i + 1) % count)}>›</button>
          <div className="views-dots" role="tablist" aria-label="Views">
            {slides.map((s, i) => (
              <button
                key={s.key}
                type="button"
                role="tab"
                aria-selected={i === index}
                className={i === index ? 'on' : ''}
                onClick={() => setIndex(i)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}
      {!geometry && photos.length === 0 && null}
    </div>
  );
}
