'use client';

import { useTheme } from '../lib/theme';

/**
 * One button, three states: follow the system, light, dark. Shows the sun or
 * moon for whatever is on screen right now, so it reads correctly even while
 * "system" is selected.
 */
export default function ThemeToggle() {
  const { theme, resolved, setTheme } = useTheme();
  const next = resolved === 'dark' ? 'light' : 'dark';
  const label = theme === 'system' ? `Following your system (${resolved}). Switch to ${next}` : `Switch to ${next} mode`;

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTheme(next)}
      onContextMenu={(e) => { e.preventDefault(); setTheme('system'); }}
      aria-label={label}
      title={`${label}. Right-click to follow the system again.`}
    >
      {resolved === 'dark' ? (
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
          <path d="M12.6 2.5a7.5 7.5 0 1 0 4.9 11.3 6.3 6.3 0 0 1-4.9-11.3z" fill="currentColor" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
          <circle cx="10" cy="10" r="3.6" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M10 1.8v2.2M10 16v2.2M1.8 10H4M16 10h2.2M4.2 4.2l1.6 1.6M14.2 14.2l1.6 1.6M4.2 15.8l1.6-1.6M14.2 5.8l1.6-1.6" />
          </g>
        </svg>
      )}
    </button>
  );
}
