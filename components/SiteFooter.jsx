import TransitionLink from './TransitionLink';
import SocialLinks from './SocialLinks';
import { SITE } from '../lib/site';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-col">
          <div className="brand">BATPOD<span>.</span>LABS</div>
          <p>{SITE.tagline}. Small runs, real materials, packed by the person who designed them.</p>
          <SocialLinks />
        </div>
        <div className="footer-col">
          <h4>Shop</h4>
          <TransitionLink href="/c/biker">Bike &amp; Rider</TransitionLink>
          <TransitionLink href="/c/tabletop">Tabletop</TransitionLink>
          <TransitionLink href="/c/daily">Daily Fixes</TransitionLink>
          <TransitionLink href="/custom">Custom print</TransitionLink>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <span>{SITE.city}</span>
          <span>{SITE.email || 'Email coming soon'}</span>
          <span>{SITE.phone || 'WhatsApp number coming soon'}</span>
          <TransitionLink href="/contact">Contact us &rarr;</TransitionLink>
        </div>
        <div className="footer-col">
          <h4>Good to know</h4>
          <span>{SITE.hours}</span>
          <span className="mono">Prices in ₹, inclusive of taxes.</span>
          <TransitionLink href="/account">Your orders</TransitionLink>
        </div>
      </div>
      <div className="container footer-base">
        <span>&copy; {new Date().getFullYear()} {SITE.name}</span>
        <span className="mono">Printed to order in Pune</span>
      </div>
    </footer>
  );
}
