'use client';

import { PersonalisationToggle } from '../../components/CookieConsent';
import { clearConsent } from '../../lib/consent';

/** The one optional thing, as a switch, plus a way to see the notice again. */
export default function PrivacyControls() {
  return (
    <div className="card-block" style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '8px 0 24px' }}>
      <PersonalisationToggle />
      <button type="button" className="linkish" style={{ alignSelf: 'flex-start' }} onClick={() => clearConsent()}>
        Forget my answer and ask again
      </button>
    </div>
  );
}
