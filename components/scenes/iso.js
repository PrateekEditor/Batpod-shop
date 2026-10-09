/**
 * Isometric helpers for the little scenes around the shop.
 *
 * World units are millimetres-ish; x runs down-right on screen, y down-left,
 * z up. Plain SVG polygons - nothing for the page to download, and the server
 * can render them so they are in the first HTML, not popped in after hydration.
 */
export const K = 1;
const C = Math.cos(Math.PI / 6);

export function P(x, y, z = 0) {
  return [(x - y) * C * K, (x + y) * 0.5 * K - z * K];
}

const f = (n) => (Math.round(n * 10) / 10).toString();

export function poly(points) {
  return points.map(([x, y, z = 0]) => P(x, y, z)).map(([a, b]) => `${f(a)},${f(b)}`).join(' ');
}

export function path(points) {
  return points.map(([x, y, z = 0], i) => { const [a, b] = P(x, y, z); return `${i ? 'L' : 'M'}${f(a)} ${f(b)}`; }).join(' ');
}

export function box(x, y, z, w, d, h) {
  return {
    top: poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]]),
    left: poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]]),
    right: poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]]),
  };
}

export const flat = (z, x0, y0, x1, y1) => poly([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]]);
export const onLeft = (yFace, x0, x1, z0, z1) => poly([[x0, yFace, z0], [x1, yFace, z0], [x1, yFace, z1], [x0, yFace, z1]]);
export const onRight = (xFace, y0, y1, z0, z1) => poly([[xFace, y0, z0], [xFace, y1, z0], [xFace, y1, z1], [xFace, y0, z1]]);

/** Screen-space vector for a move along the world x or y axis, for CSS keyframes. */
export const alongX = (d) => `${f(d * C)}px, ${f(d * 0.5)}px`;
export const alongY = (d) => `${f(-d * C)}px, ${f(d * 0.5)}px`;

/** Three shades of one colour for a lit box: top brightest, right mid, left darkest. */
export function shade(hex, amount = 0.14) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (shift) => [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v + shift * 255))));
  const toHex = (rgb) => `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  return { top: toHex(ch(amount)), right: hex, left: toHex(ch(-amount)) };
}

export function Faces({ b, colour, stroke = 'rgba(20,24,29,0.35)', sw = 0.6, className, style }) {
  const s = typeof colour === 'string' ? shade(colour) : colour;
  return (
    <g className={className} style={style}>
      <polygon points={b.left} fill={s.left} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={b.right} fill={s.right} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={b.top} fill={s.top} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
    </g>
  );
}

/** viewBox tight around a world-space bounding box. */
export function viewBoxFor(x0, y0, x1, y1, zTop, pad = 6) {
  const pts = [P(x0, y0, zTop), P(x1, y0, 0), P(x0, y1, 0), P(x1, y1, -2), P(x1, y0, zTop), P(x0, y1, zTop)];
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  return `${f(minX)} ${f(minY)} ${f(Math.max(...xs) - minX + pad)} ${f(Math.max(...ys) - minY + pad)}`;
}
