import { SITE, CONSENT_VERSION } from '../../lib/site';
import PrivacyControls from './PrivacyControls';

export const metadata = {
  title: 'What is stored',
  description: 'What the shop keeps in your browser and on its server, and what it does not.',
};

/**
 * The privacy page, in plain words. Short because the honest answer is short:
 * no cookies, no trackers, no ad networks. Everything kept is listed here.
 */
export default function PrivacyPage() {
  return (
    <div className="container prose-page">
      <h1>What is stored, and where</h1>
      <p className="lede">
        {SITE.name} is one person with a printer. There are no advertising pixels, no analytics scripts and no
        cookies on this site. Here is the full list of what it keeps.
      </p>

      <h2>In your browser</h2>
      <p>
        These live in your browser&rsquo;s local storage, on your device, and are never sent anywhere except to show
        you the page. Clearing site data in your browser removes all of them.
      </p>
      <dl className="store-list">
        <div><dt>Cart</dt><dd>What you added and how many. Essential.</dd></div>
        <div><dt>Theme</dt><dd>Light or dark, if you picked one. Essential.</dd></div>
        <div><dt>Sign-in</dt><dd>A token that keeps you signed in for 30 days. Only if you have an account. Essential.</dd></div>
        <div><dt>Where you came from</dt><dd>If you arrived from a link with <span className="mono">?from=youtube</span> on it, that word is attached to any order so the workshop knows which channel brought you. Essential.</dd></div>
        <div><dt>Recently viewed</dt><dd>The last eight products you opened, to build the &ldquo;picked for you&rdquo; rail. <strong>Optional</strong> &mdash; only kept once you say yes, and switched off below.</dd></div>
        <div><dt>Your answer to that</dt><dd>So you are not asked again.</dd></div>
      </dl>

      <PrivacyControls />

      <h2>On the server</h2>
      <p>
        An order stores the name, phone, email and address you typed, what you ordered, and its status. That is what is
        needed to print it and get it to you. It is kept so the order can be looked up later.
      </p>
      <p>
        An account stores your email, a hash of your password (never the password itself), your name, and whatever
        optional answers you gave about what you are into and how you ride. Those answers only change what the shop
        shows you. They are never shown to other customers, never sold, and never used for email unless you ticked the
        offers box &mdash; which you can untick on the account page at any time.
      </p>
      <p>
        To have an account or an order deleted, write to {SITE.email || 'the address on the contact page'} from the
        email on the account. The shop is hosted on Vercel and the database on MongoDB Atlas; both are standard
        hosting providers and neither is given anything beyond what is listed here.
      </p>

      <h2>What is not here</h2>
      <p>
        No Google Analytics, no Meta pixel, no session recording, no fingerprinting, no cookie banners that hide a
        hundred &ldquo;partners&rdquo;. The one outside request a page makes is for its fonts, which come from Google
        Fonts; Google sees the request like any web server does. If any of this ever changes, this page changes first
        and the notice asks again.
      </p>
      <p className="tiny muted">Notice version {CONSENT_VERSION}.</p>
    </div>
  );
}
