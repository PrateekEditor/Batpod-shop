import { P, poly, path, box, flat, onLeft, onRight, Faces, viewBoxFor, alongX, alongY } from './iso';

/**
 * The animated scenes.
 *
 * Each range gets its own: a working A1 for the shop itself, a helmet hook and
 * a swinging keyring for Bike & Rider, a dice tower with a die dropping through
 * it for Tabletop, and a desk edge with cable clips for Daily Fixes. They are
 * server-rendered SVG animated purely with CSS keyframes, so they are in the
 * first paint, cost no JavaScript, and stop when the reader prefers reduced
 * motion.
 */

const INK = '#2b3139';
const BED = '#c9b78b';
const SWATCH = {
  'matte-black': '#2a2f36', white: '#eef1f5', gold: '#c9971f', silver: '#aab2bd',
  grey: '#7b8696', teal: '#2f7d7d', red: '#a8402f', blue: '#2f5d9f',
};
export const swatch = (c) => SWATCH[c] || '#9aa4b0';

function Shadow({ pts }) {
  return <polygon points={poly(pts)} fill="rgba(30,40,55,0.13)" />;
}

// ----------------------------------------------------------------- the printer

/** A Bambu A1 mid-print. Bed slides, head sweeps, the part rises slice by slice. */
export function PrinterScene({ colours = ['matte-black', 'gold'], className = '' }) {
  const base = box(0, 0, 0, 80, 80, 16);
  const plate = box(10, 10, 16, 60, 60, 3);
  const postL = box(2, 36, 16, 8, 8, 86);
  const postR = box(70, 36, 16, 8, 8, 86);
  const bar = box(2, 36, 100, 76, 8, 9);
  const head = box(20, 32, 70, 16, 17, 22);
  const [lx, ly] = P(28, 49, 72);
  const slices = [0, 1, 2, 3, 4];
  const sliceH = 6;
  const partCol = swatch(colours[0]);
  const accent = swatch(colours[1] || colours[0]);

  return (
    <svg className={`scene scene-printer ${className}`} viewBox={viewBoxFor(-16, -4, 100, 92, 112, 10)} role="img" aria-label="A Bambu A1 printer mid-print">
      <Shadow pts={[[80, 0, 0], [96, 4, 0], [96, 84, 0], [80, 80, 0]]} />
      <Faces b={base} colour={{ top: '#3a414b', right: '#2f353d', left: '#242930' }} />
      <polygon points={onLeft(80, 6, 30, 3, 11)} fill="#111417" />
      <circle cx={P(18, 80, 7)[0]} cy={P(18, 80, 7)[1]} r="2.4" fill="#3fd47f" className="led" />
      <g className="bed">
        <Faces b={plate} colour={{ top: BED, right: '#b3a279', left: '#9d8e66' }} sw={0.5} />
        {/* the part grows from the plate one slice at a time */}
        {slices.map((i) => (
          <Faces
            key={i}
            b={box(26, 26, 19 + i * sliceH, 28, 28, sliceH)}
            colour={i === slices.length - 1 ? accent : partCol}
            className="slice"
            style={{ animationDelay: `${i * 0.9}s` }}
          />
        ))}
      </g>
      <Faces b={postL} colour={{ top: '#3a414b', right: '#2f353d', left: '#242930' }} sw={0.5} />
      <Faces b={postR} colour={{ top: '#3a414b', right: '#2f353d', left: '#242930' }} sw={0.5} />
      <Faces b={bar} colour={{ top: '#3a414b', right: '#2f353d', left: '#242930' }} sw={0.5} />
      <g className="head">
        <Faces b={head} colour={{ top: '#f1f3f6', right: '#dde1e6', left: '#c6ccd3' }} stroke="#5d6673" sw={0.6} />
        <circle cx={lx} cy={ly} r="2.6" fill="#3fd47f" className="led" />
      </g>
      {/* spools on the AMS lite */}
      <path d={path([[92, 64, 0], [92, 64, 70]])} stroke="#5d6673" strokeWidth="2.2" />
      {[0, 1, 2, 3].map((i) => {
        const [sx, sy] = P(92, 26 + i * 16, 72 - (i % 2) * 22);
        return <ellipse key={i} cx={sx} cy={sy} rx="8.5" ry="10" fill={swatch(colours[i % colours.length])} stroke="#3a414a" strokeWidth="0.9" className="spool" style={{ animationDelay: `${i * 0.4}s` }} />;
      })}
    </svg>
  );
}

// ----------------------------------------------------------------- bike & rider

/** A helmet resting on the wall hook, a keyring swinging under it. */
export function BikerScene({ className = '' }) {
  // the wall, the hook, a full-face helmet as a stack of ellipses
  const [hx, hy] = P(0, 40, 54);
  const [hx2, hy2] = P(20, 40, 54);
  const [ringX, ringY] = P(44, 40, 70);
  return (
    <svg className={`scene scene-biker ${className}`} viewBox={viewBoxFor(-6, 22, 60, 42, 92, 4)} role="img" aria-label="A helmet on a wall hook with a keyring hanging beside it">
      {/* wall */}
      <polygon points={onLeft(40, -8, 66, 0, 96)} fill="#e3e7ec" stroke="#c9d0d8" strokeWidth="0.8" />
      <polygon points={onLeft(40, -8, 66, 84, 88)} fill="#b8860b" opacity="0.85" />
      {/* hook plate and saddle */}
      <Faces b={box(2, 36, 44, 16, 4, 16)} colour="#2b3139" />
      <Faces b={box(2, 20, 48, 16, 18, 4)} colour="#2b3139" />
      {/* helmet: three stacked ellipses with a visor */}
      <g className="helmet">
        <ellipse cx={P(10, 22, 60)[0]} cy={P(10, 22, 60)[1]} rx="19" ry="17" fill="#1f2328" />
        <ellipse cx={P(10, 22, 64)[0]} cy={P(10, 22, 64)[1]} rx="17" ry="13" fill="#2c3139" />
        <path d={`M${P(10, 22, 60)[0] - 15} ${P(10, 22, 60)[1] + 1} q15 9 30 0 l0 -6 q-15 7 -30 0z`} fill="#6e8db5" opacity="0.85" />
        <path d={`M${P(10, 22, 60)[0] - 10} ${P(10, 22, 60)[1] - 11} q10 -4 21 0`} stroke="#c9971f" strokeWidth="1.6" fill="none" />
      </g>
      {/* key hook and the swinging keyring */}
      <Faces b={box(40, 36, 66, 8, 4, 6)} colour="#2b3139" />
      <g className="keyring" style={{ transformOrigin: `${ringX}px ${ringY}px` }}>
        <path d={`M${ringX} ${ringY} v8`} stroke="#aab2bd" strokeWidth="1.4" />
        <circle cx={ringX} cy={ringY + 11} r="4" fill="none" stroke="#aab2bd" strokeWidth="1.6" />
        <Faces b={box(38, 38, 20, 14, 2, 8)} colour="#2a2f36" stroke="rgba(0,0,0,.5)" />
        <polygon points={onLeft(40, 39.5, 50.5, 22, 26)} fill="#c9971f" />
      </g>
    </svg>
  );
}

// ----------------------------------------------------------------- tabletop

/** A dice tower with a die tumbling through it; a flexi dragon curling alongside. */
export function TabletopScene({ className = '' }) {
  const tower = box(0, 0, 0, 30, 28, 70);
  const tray = box(-4, 28, 0, 40, 16, 5);
  const segs = [0, 1, 2, 3, 4, 5, 6];
  return (
    <svg className={`scene scene-tabletop ${className}`} viewBox={viewBoxFor(-6, 0, 96, 46, 82, 4)} role="img" aria-label="A dice tower with a die dropping through it, and an articulated dragon">
      <Shadow pts={[[30, 0, 0], [44, 4, 0], [44, 30, 0], [30, 28, 0]]} />
      <Faces b={tray} colour={{ top: '#3b4350', right: '#2f353d', left: '#262b32' }} />
      <Faces b={tower} colour={{ top: '#3b4350', right: '#2f353d', left: '#262b32' }} />
      {/* windows showing the baffles, lit in gold */}
      {[52, 34, 16].map((z, i) => (
        <polygon key={z} points={onLeft(28, 6, 24, z, z + 8)} fill="#c9971f" opacity={0.85 - i * 0.2} />
      ))}
      <polygon points={flat(70, 4, 4, 26, 24)} fill="#1a1e23" />
      {/* the die: drops into the top, reappears in the tray */}
      <g className="die">
        <Faces b={box(12, 12, 74, 9, 9, 9)} colour="#eef1f5" stroke="#8c96a3" />
        {[[16.5, 12, 78.5], [21, 14.5, 76], [21, 18.5, 80]].map(([x, y, z], i) => { const [px, py] = P(x, y, z); return <circle key={i} cx={px} cy={py} r="1.1" fill="#2b3139" />; })}
      </g>
      <g className="die-out">
        <Faces b={box(22, 32, 5, 9, 9, 9)} colour="#eef1f5" stroke="#8c96a3" />
        {[[26.5, 32, 9.5], [31, 34.5, 7], [31, 38.5, 11]].map(([x, y, z], i) => { const [px, py] = P(x, y, z); return <circle key={i} cx={px} cy={py} r="1.1" fill="#2b3139" />; })}
      </g>
      {/* flexi dragon: a chain of tapering segments that ripple */}
      {segs.map((i) => {
        const x = 50 + i * 7;
        const y = 36 - i * 2.4;
        const s = 9 - i * 0.8;
        return (
          <Faces key={i} b={box(x, y, 0, s, s, s)} colour="#2f7d7d" className="dragon-seg" style={{ animationDelay: `${i * 0.14}s` }} />
        );
      })}
      {/* head */}
      <Faces b={box(42, 39, 0, 10, 9, 10)} colour="#2f7d7d" className="dragon-seg" style={{ animationDelay: '-0.14s' }} />
      <polygon points={onLeft(48, 43, 47, 6, 8)} fill="#c9971f" />
    </svg>
  );
}

// ----------------------------------------------------------------- daily fixes

/** The underside of a desk: cable clips in a row, a cable snaking through them, a headphone hook. */
export function DailyScene({ className = '' }) {
  const desk = box(0, 0, 60, 110, 44, 4);
  const clips = [14, 34, 54, 74];
  const cable = path([[2, 22, 58], [14, 22, 55], [26, 22, 56], [38, 22, 55], [50, 22, 56], [62, 22, 55], [74, 22, 56], [90, 22, 54], [104, 24, 50]]);
  return (
    <svg className={`scene scene-daily ${className}`} viewBox={viewBoxFor(0, 2, 112, 46, 82, 4)} role="img" aria-label="Cable clips under a desk edge, with a cable routed through them and a headphone hook">
      <Faces b={desk} colour={{ top: '#d8c3a0', right: '#c4ad87', left: '#ab9570' }} />
      {/* clips under the desk */}
      {clips.map((x, i) => (
        <g key={x} className="clip" style={{ animationDelay: `${i * 0.25}s` }}>
          <Faces b={box(x, 18, 52, 6, 8, 8)} colour="#2a2f36" />
        </g>
      ))}
      <path d={cable} fill="none" stroke="#1f2328" strokeWidth="2.6" strokeLinecap="round" className="cable" />
      <path d={cable} fill="none" stroke="#c9971f" strokeWidth="2.6" strokeLinecap="round" className="cable-pulse" />
      {/* headphone hook at the end, headphones hanging */}
      <Faces b={box(96, 4, 50, 8, 10, 10)} colour="#2a2f36" />
      <g className="phones">
        <path d={`M${P(100, 9, 50)[0]} ${P(100, 9, 50)[1]} c-10 6 -10 20 0 26`} stroke="#2b3139" strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx={P(100, 9, 50)[0] - 9} cy={P(100, 9, 50)[1] + 10} rx="4" ry="5.5" fill="#2b3139" />
        <ellipse cx={P(100, 9, 50)[0] - 1} cy={P(100, 9, 50)[1] + 26} rx="4" ry="5.5" fill="#2b3139" />
      </g>
      {/* a planter on top, for the range's other best seller */}
      <Faces b={box(8, 6, 64, 14, 14, 16)} colour="#eef1f5" stroke="#9aa4b0" />
      <polygon points={flat(80, 9, 7, 21, 19)} fill="#2f7d7d" />
      <path d={`M${P(15, 13, 80)[0]} ${P(15, 13, 80)[1]} c-6 -10 2 -16 4 -22 c2 6 10 12 4 22`} fill="#3f8f5f" className="leaf" />
    </svg>
  );
}

export const SCENES = { biker: BikerScene, tabletop: TabletopScene, daily: DailyScene };

export function RangeScene({ slug, className }) {
  const Scene = SCENES[slug];
  return Scene ? <Scene className={className} /> : null;
}

/** CSS vectors the keyframes use, exported so globals.css and the scenes agree. */
export const MOVE = { bedY: alongY(14), headX: alongX(34) };
