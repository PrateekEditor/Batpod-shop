import SocialLinks from '../../components/SocialLinks';
import { SITE } from '../../lib/site';

export const metadata = { title: 'Contact', description: 'How to reach Batpod Labs - questions, custom prints, order help.' };

export default function ContactPage() {
  return (
    <div className="container contact-page">
      <div>
        <span className="eyebrow">Get in touch</span>
        <h1>Talk to the person who prints it</h1>
        <p className="lede">
          Questions about a product, a custom print, or an order on its way &mdash; one person reads every message, usually
          between plates.
        </p>
        <SocialLinks size="large" />
      </div>
      <div className="contact-cards">
        <div className="card-block">
          <h3>Where</h3>
          <p>{SITE.city}. No walk-in counter yet &mdash; orders ship by courier.</p>
        </div>
        <div className="card-block">
          <h3>When</h3>
          <p>{SITE.hours}</p>
        </div>
        <div className="card-block">
          <h3>Custom work</h3>
          <p>Have a model of your own? The custom print page gives a price and a date in a few seconds, no account needed.</p>
        </div>
        <div className="card-block">
          <h3>Order help</h3>
          <p>Your order reference starts with BP-. Keep it handy; it is the fastest way to find your print.</p>
        </div>
      </div>
    </div>
  );
}
