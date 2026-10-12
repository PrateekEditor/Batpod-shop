'use client';

import { useEffect, useRef, useState } from 'react';
import { lookupPincode } from '../lib/api';
import { STATES, normaliseState, deliveryWindow } from '../lib/india';

/**
 * Address, pincode first.
 *
 * Type the six digits and the city and state fill themselves in from the
 * India Post directory, with a delivery window underneath. Both stay
 * editable — a pincode that spans two towns, or a directory entry that is
 * out of date, should not trap anyone. State is a dropdown because couriers
 * reject free-text spellings and the delivery estimate keys off it.
 *
 * `value` = { address, city, state, pincode }   `onChange(patch)`
 * `productionDays` shifts the estimate for made-to-order carts.
 */
export default function AddressFields({ value, onChange, productionDays = 1, required = false, compact = false }) {
  const [place, setPlace] = useState(null);
  const [looking, setLooking] = useState(false);
  const [note, setNote] = useState('');
  const lastPin = useRef('');

  const pin = String(value.pincode || '').replace(/\D/g, '').slice(0, 6);

  useEffect(() => {
    if (pin.length !== 6 || pin === lastPin.current) return undefined;
    lastPin.current = pin;
    let alive = true;
    setLooking(true);
    setNote('');
    lookupPincode(pin, productionDays)
      .then((p) => {
        if (!alive) return;
        setPlace(p);
        onChange({ city: p.city, state: normaliseState(p.state) });
      })
      .catch((err) => {
        if (!alive) return;
        setPlace(null);
        setNote(err.status === 404 ? 'That pincode is not in the directory — check it, or type the city and state in.' : 'Could not look that pincode up. Type the city and state in.');
      })
      .finally(() => alive && setLooking(false));
    return () => {
      alive = false;
    };
    // onChange is stable enough for this; re-running on its identity would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, productionDays]);

  useEffect(() => {
    if (pin.length < 6) {
      setPlace(null);
      lastPin.current = '';
    }
  }, [pin]);

  return (
    <div className="address-fields">
      <label className="field">
        <span>Address{required ? ' *' : ''}</span>
        <textarea rows={compact ? 2 : 3} value={value.address || ''} onChange={(e) => onChange({ address: e.target.value })} autoComplete="street-address" required={required} placeholder="Flat, building, street, landmark" />
      </label>

      <div className="address-grid">
        <label className="field">
          <span>
            Pincode{required ? ' *' : ''}
            {looking && <em>looking up…</em>}
          </span>
          <input
            inputMode="numeric"
            pattern="[1-9][0-9]{5}"
            maxLength={6}
            value={value.pincode || ''}
            onChange={(e) => onChange({ pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
            autoComplete="postal-code"
            required={required}
            placeholder="411045"
            className="mono"
          />
        </label>
        <label className="field">
          <span>City{required ? ' *' : ''}</span>
          <input value={value.city || ''} onChange={(e) => onChange({ city: e.target.value })} autoComplete="address-level2" required={required} />
        </label>
        <label className="field">
          <span>State{required ? ' *' : ''}</span>
          <select value={value.state || ''} onChange={(e) => onChange({ state: e.target.value })} autoComplete="address-level1" required={required}>
            <option value="">Select…</option>
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      {note && <p className="hint bad" role="alert">{note}</p>}
      {place && place.delivery && (
        <p className="delivery-note" aria-live="polite">
          <span className="dot" aria-hidden="true" />
          Delivers to {place.area}{place.city && place.area !== place.city ? `, ${place.city}` : ''} around{' '}
          <strong>{deliveryWindow(place.delivery.from, place.delivery.to)}</strong>
          <small> · {place.delivery.transitDays[0]}–{place.delivery.transitDays[1]} days by courier after dispatch</small>
        </p>
      )}
    </div>
  );
}
