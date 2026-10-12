'use client';

import TransitionLink from './TransitionLink';
import SocialLinks from './SocialLinks';
import { SITE } from '../lib/site';
import { useCategories } from '../lib/categories';

export default function SiteFooter() {
  const ranges = useCategories();
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-col">
          <TransitionLink href="/" className="brand" aria-label="Batpod Labs home">BATPOD<span>.</span>LABS</TransitionLink>
          <p>{SITE.tagline}. Small runs, real materials, packed by the person who designed them.</p>
          <SocialLinks />
        </div>
        <div className="footer-col">
          <h4>Shop</h4>
          {ranges.map((r) => (
            <TransitionLink key={r.slug} href={`/c/${r.slug}`}>{r.name}</TransitionLink>
          ))}
          <TransitionLink href="/custom">Custom print</TransitionLink>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <span>{SITE.city}</span>
          {SITE.email ? <a href={`mailto:${SITE.email}`}>{SITE.email}</a> : <span>Email coming soon</span>}
          {SITE.phone ? <a href={`tel:${SITE.phone.replace(/[^\d+]/g, '')}`}>{SITE.phone}</a> : <span>WhatsApp number coming soon</span>}
          <TransitionLink href="/contact">Contact us &rarr;</TransitionLink>
        </div>
        <div className="footer-col">
          <h4>Good to know</h4>
          <span>{SITE.hours}</span>
          <span className="mono">Prices in ₹, inclusive of taxes.</span>
          <TransitionLink href="/track">Track an order</TransitionLink>
          <TransitionLink href="/account">Your account</TransitionLink>
          <TransitionLink href="/privacy">What is stored</TransitionLink>
        </div>
      </div>
      <div className="container footer-base">
        <span>&copy; {new Date().getFullYear()} {SITE.name}</span>
        <span className="mono">Printed to order in Pune</span>
      </div>
    </footer>
  );
}
