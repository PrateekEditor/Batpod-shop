import { SITE } from '../lib/site';

const ICONS = {
  instagram: (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" /></svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M10 9l5 3-5 3z" fill="currentColor" /></svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 20l1.3-3.8A8 8 0 1 1 8 19.1z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9.2 8.6c.2-.5.5-.5.8-.5h.4c.2 0 .4.1.5.4l.6 1.4c.1.2 0 .4-.1.5l-.5.6c-.1.1-.1.3 0 .4.6 1 1.4 1.8 2.5 2.4.2.1.3.1.4 0l.6-.6c.2-.2.4-.2.6-.1l1.4.7c.2.1.3.3.3.5-.1.8-.7 1.5-1.5 1.6-1.3.2-3-.6-4.4-2-1.4-1.4-2.2-3-2-4.4.1-.4.2-.7.4-.9z" fill="currentColor" /></svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M4 7l8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
  ),
};

/**
 * Social buttons. A link with no href yet is shown but not clickable, with a
 * "soon" mark, so the row reads as intended rather than broken.
 */
export default function SocialLinks({ size = 'normal' }) {
  return (
    <div className={`social-row ${size}`}>
      {SITE.social.map((s) => {
        const live = Boolean(s.href);
        const body = (
          <>
            <span className="social-icon">{ICONS[s.key]}</span>
            <span className="social-label">{s.label}</span>
            {!live && <small>soon</small>}
          </>
        );
        return live ? (
          <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" className="social-btn" aria-label={`${SITE.name} on ${s.label}`}>{body}</a>
        ) : (
          <span key={s.key} className="social-btn pending" aria-disabled="true" title={`${s.label} link coming soon`}>{body}</span>
        );
      })}
    </div>
  );
}
