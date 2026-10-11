'use client';

import { useEffect, useState } from 'react';
import { CONSENT_VERSION } from './site';

/**
 * Cookie-style consent, without any cookies.
 *
 * The shop sets no cookies and runs no trackers. What it does keep, in this
 * browser's localStorage, falls in two groups:
 *
 *   essential       — the cart, the chosen theme, the sign-in token. The shop
 *                     does not work without these, so no consent is asked.
 *   personalisation — the recently-viewed trail and the "picked for you" rail
 *                     built from it. Optional, so it is off until the visitor
 *                     says yes.
 *
 * The answer is stored with the date and the version of the notice it was
 * given for. Change CONSENT_VERSION when the notice changes materially and
 * everyone is asked again.
 */
export { CONSENT_VERSION };
const KEY = 'batpod.consent.v1';
const EVENT = 'batpod:consent';

function read() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const c = JSON.parse(raw);
    return c && c.version === CONSENT_VERSION ? c : null;
  } catch {
    return null;
  }
}

/** The stored decision, or null when none has been made for this version. */
export function getConsent() {
  return read();
}

/** Record a decision. `personalisation` is the only optional category today. */
export function setConsent({ personalisation }) {
  const c = { personalisation: Boolean(personalisation), at: new Date().toISOString(), version: CONSENT_VERSION };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(c));
    // Saying no also wipes what was kept while the answer was yes.
    if (!c.personalisation) window.localStorage.removeItem('batpod.recent.v1');
  } catch {
    /* private window: the choice lasts this tab */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: c }));
  return c;
}

/** Forget the decision so the notice shows again. */
export function clearConsent() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: null }));
}

/** True only when the visitor has said yes to personalisation. */
export function allowsPersonalisation() {
  const c = read();
  return Boolean(c && c.personalisation);
}

/**
 * The decision as React state: components re-render the moment the banner is
 * answered, so the "picked for you" rail appears without a reload.
 * `undefined` until mounted (the server cannot know), then null or the record.
 */
export function useConsent() {
  const [consent, setState] = useState(undefined);
  useEffect(() => {
    setState(read());
    const onChange = (e) => setState(e.detail);
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);
  return consent;
}
