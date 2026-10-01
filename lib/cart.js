'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { getQuote } from './api';

/**
 * Cart state.
 *
 * The cart stores only what the customer chose — slug and quantity. Every price
 * on screen comes back from the server's pricing engine, so there is exactly
 * one implementation of "what does this cost" and the customer can never see a
 * number the server disagrees with.
 */
const CartContext = createContext(null);
const STORAGE_KEY = 'batpod.cart.v1';
const RECENT_KEY = 'batpod.recent.v1';

function readStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private window, or storage is full — the cart still works for this visit */
  }
}

export function CartProvider({ children }) {
  const [lines, setLines] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted cart after mount, so server and client render the same HTML.
  useEffect(() => {
    const saved = readStorage(STORAGE_KEY, { lines: [], couponCode: '' });
    setLines(Array.isArray(saved.lines) ? saved.lines : []);
    setCouponCode(saved.couponCode || '');
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage(STORAGE_KEY, { lines, couponCode });
  }, [lines, couponCode, hydrated]);

  // Re-quote whenever the cart changes. An empty cart needs no round trip.
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;

    if (lines.length === 0) {
      setQuote(null);
      return undefined;
    }

    setLoading(true);
    getQuote(lines, couponCode)
      .then((q) => {
        if (!cancelled) setQuote(q);
      })
      .catch(() => {
        if (!cancelled) setQuote(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lines, couponCode, hydrated]);

  const add = useCallback((slug, quantity = 1) => {
    setLines((current) => {
      const existing = current.find((l) => l.slug === slug);
      if (existing) {
        return current.map((l) => (l.slug === slug ? { ...l, quantity: l.quantity + quantity } : l));
      }
      return [...current, { slug, quantity }];
    });
  }, []);

  const setQuantity = useCallback((slug, quantity) => {
    setLines((current) =>
      quantity <= 0
        ? current.filter((l) => l.slug !== slug)
        : current.map((l) => (l.slug === slug ? { ...l, quantity } : l))
    );
  }, []);

  const remove = useCallback((slug) => setLines((c) => c.filter((l) => l.slug !== slug)), []);
  const clear = useCallback(() => {
    setLines([]);
    setCouponCode('');
  }, []);

  const itemCount = useMemo(() => lines.reduce((s, l) => s + l.quantity, 0), [lines]);

  const value = useMemo(
    () => ({ lines, itemCount, quote, loading, hydrated, couponCode, setCouponCode, add, setQuantity, remove, clear }),
    [lines, itemCount, quote, loading, hydrated, couponCode, add, setQuantity, remove, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

/** Recently-viewed list, newest first, capped at 8. Per browser, never sent anywhere. */
export function rememberViewed(slug) {
  if (typeof window === 'undefined' || !slug) return;
  const current = readStorage(RECENT_KEY, []);
  const next = [slug, ...current.filter((s) => s !== slug)].slice(0, 8);
  writeStorage(RECENT_KEY, next);
}

export function getViewed() {
  return readStorage(RECENT_KEY, []);
}
