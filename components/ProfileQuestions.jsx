'use client';

import { RIDES, USE_FOR, CONTACT } from '../lib/profile';
import { useCategories } from '../lib/categories';

/**
 * The optional questions, as tiles and chips rather than dropdowns. Every one
 * can be left blank. Used on the second signup step and again on the account
 * page, so an answer skipped at signup can be given later.
 *
 * `value` = { interests: [], rides: '', bikeModel: '', useFor: [], contactPref: '', offersOptIn: false }
 */
export default function ProfileQuestions({ value, onChange, showOffers = true }) {
  const RANGES = useCategories();
  const set = (patch) => onChange({ ...value, ...patch });
  const toggleIn = (key, item) =>
    set({ [key]: value[key].includes(item) ? value[key].filter((x) => x !== item) : [...value[key], item] });
  const pick = (key, item) => set({ [key]: value[key] === item ? '' : item });

  return (
    <div className="questions">
      <fieldset className="question">
        <legend>
          What are you into? <small>Orders the homepage. Pick any.</small>
        </legend>
        <div className="interest-grid">
          {RANGES.map((r) => (
            <button
              key={r.slug}
              type="button"
              className="interest-tile"
              aria-pressed={value.interests.includes(r.slug)}
              onClick={() => toggleIn('interests', r.slug)}
            >
              <strong>{r.name}</strong>
              <span>{r.blurb}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="question">
        <legend>
          Do you ride? <small>Rider gear is sized to the bike.</small>
        </legend>
        <div className="chips">
          {RIDES.map((r) => (
            <button key={r.key} type="button" className="chip" aria-pressed={value.rides === r.key} onClick={() => pick('rides', r.key)}>
              {r.label}
            </button>
          ))}
        </div>
        {value.rides && value.rides !== 'no' && (
          <label className="field" style={{ marginTop: 10 }}>
            <span>Which bike? <em>optional</em></span>
            <input
              value={value.bikeModel}
              onChange={(e) => set({ bikeModel: e.target.value.slice(0, 60) })}
              placeholder="Dominar 400, Classic 350, Duke 390…"
              autoComplete="off"
            />
          </label>
        )}
      </fieldset>

      <fieldset className="question">
        <legend>
          Where do your prints end up? <small>Pick any.</small>
        </legend>
        <div className="chips">
          {USE_FOR.map((u) => (
            <button key={u.key} type="button" className="chip" aria-pressed={value.useFor.includes(u.key)} onClick={() => toggleIn('useFor', u.key)}>
              {u.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="question">
        <legend>
          If we need to reach you about an order <small>Only about your orders.</small>
        </legend>
        <div className="chips">
          {CONTACT.map((c) => (
            <button key={c.key} type="button" className="chip" aria-pressed={value.contactPref === c.key} onClick={() => pick('contactPref', c.key)}>
              {c.label}
            </button>
          ))}
        </div>
      </fieldset>

      {showOffers && (
        <label className="check-row">
          <input type="checkbox" checked={value.offersOptIn} onChange={(e) => set({ offersOptIn: e.target.checked })} />
          <span>
            <strong>Send me the first-order code and occasional offers</strong>
            <small>A few a year, never daily. Off at any time from your account.</small>
          </span>
        </label>
      )}
    </div>
  );
}

export const EMPTY_PROFILE = { interests: [], rides: '', bikeModel: '', useFor: [], contactPref: '', offersOptIn: false };

/** Split the combined form value back into what the API expects. */
export function splitProfile(v) {
  return {
    interests: v.interests,
    profile: { rides: v.rides, bikeModel: v.bikeModel, useFor: v.useFor, contactPref: v.contactPref, offersOptIn: v.offersOptIn },
  };
}

/** Build the combined form value from a user record. */
export function mergeProfile(user) {
  const p = (user && user.profile) || {};
  return {
    interests: (user && user.interests) || [],
    rides: p.rides || '',
    bikeModel: p.bikeModel || '',
    useFor: p.useFor || [],
    contactPref: p.contactPref || '',
    offersOptIn: Boolean(p.offersOptIn),
  };
}
