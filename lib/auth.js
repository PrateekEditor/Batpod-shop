'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { API_URL } from './api';

/**
 * Customer accounts.
 *
 * Accounts are optional — guest checkout still works. Signing in adds order
 * history, a saved address, and a recommendation rail that reflects what you
 * actually care about.
 *
 * The token sits in localStorage. That is a real trade-off: an XSS bug in this
 * app would expose it, where an httpOnly cookie would not. Cookies need the API
 * and the shop on the same site, and they are on separate Vercel domains, so
 * this is the honest choice for now rather than the best one.
 */
const AuthContext = createContext(null);
const TOKEN_KEY = 'batpod.token.v1';
const CHANNEL_KEY = 'batpod.channel.v1';

function readToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeToken(token) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private window — the session just lasts this tab */
  }
}

/**
 * Where this visitor came from.
 *
 * Put `?from=youtube` on the link in a video description and the order records
 * it, so the admin can tell which channel is actually producing sales. Captured
 * once on arrival and kept, because the visitor will have navigated several
 * pages by the time they check out.
 */
const VALID_CHANNELS = ['website', 'instagram', 'youtube', 'whatsapp', 'bike-meet', 'amazon', 'etsy', 'other'];

export function captureChannel() {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    const from = (params.get('from') || '').toLowerCase();
    const detail = params.get('ref') || '';
    if (VALID_CHANNELS.includes(from)) {
      window.localStorage.setItem(CHANNEL_KEY, JSON.stringify({ channel: from, channelDetail: detail }));
    }
  } catch {
    /* nothing to do */
  }
}

export function getChannel() {
  if (typeof window === 'undefined') return { channel: 'website', channelDetail: '' };
  try {
    const raw = window.localStorage.getItem(CHANNEL_KEY);
    return raw ? JSON.parse(raw) : { channel: 'website', channelDetail: '' };
  } catch {
    return { channel: 'website', channelDetail: '' };
  }
}

async function authRequest(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.field = data.field || null;
    throw err;
  }
  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    captureChannel();
    const saved = readToken();
    if (!saved) {
      setReady(true);
      return;
    }
    authRequest('/api/auth/me', { token: saved })
      .then((d) => {
        setUser(d.user);
        setToken(saved);
      })
      .catch(() => writeToken(null)) // expired or revoked — quietly become a guest
      .finally(() => setReady(true));
  }, []);

  /**
   * Create the account. Resolves to `{ user, offer }` — the offer is the
   * welcome coupon when they opted in to offers, otherwise null. The server
   * attaches `field` to validation errors so the form can point at the input.
   */
  const signup = useCallback(async (payload) => {
    const d = await authRequest('/api/auth/signup', { method: 'POST', body: payload });
    writeToken(d.token);
    setToken(d.token);
    setUser(d.user);
    return { user: d.user, offer: d.offer || null };
  }, []);

  const login = useCallback(async (email, password) => {
    const d = await authRequest('/api/auth/login', { method: 'POST', body: { email, password } });
    writeToken(d.token);
    setToken(d.token);
    setUser(d.user);
    return d.user;
  }, []);

  const logout = useCallback(() => {
    writeToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (patch) => {
      const d = await authRequest('/api/auth/me', { method: 'PATCH', body: patch, token });
      setUser(d.user);
      return d.user;
    },
    [token]
  );

  const loadOrders = useCallback(() => authRequest('/api/auth/orders', { token }), [token]);

  /** One order on this account, with its status history. */
  const loadOrder = useCallback(
    (reference) => authRequest(`/api/auth/orders/${encodeURIComponent(reference)}`, { token }),
    [token]
  );

  const value = useMemo(
    () => ({ user, token, ready, signup, login, logout, updateProfile, loadOrders, loadOrder }),
    [user, token, ready, signup, login, logout, updateProfile, loadOrders, loadOrder]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
