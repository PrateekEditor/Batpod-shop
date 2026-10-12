/**
 * Single place that knows where the API lives.
 *
 * Server components call this during rendering, so the URL must be absolute —
 * there is no "current origin" on the server. Set NEXT_PUBLIC_API_URL in
 * .env.local and in Vercel.
 */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body.error) message = body.error;
    } catch {
      /* response had no JSON body */
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

/**
 * Catalog reads are cached for a minute. Long enough that a burst of visitors
 * from a video doesn't hammer the free Atlas tier, short enough that a stock
 * change you make in the admin shows up while you are still looking at it.
 */
const catalogCache = { next: { revalidate: 60 } };

export const getCategories = () => request('/api/categories', catalogCache);

export const getProducts = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();
  return request(`/api/products${qs ? `?${qs}` : ''}`, catalogCache);
};

export const getProduct = (slug) => request(`/api/products/${slug}`, catalogCache);

export const getProductsBySlugs = (slugs) =>
  request('/api/products/by-slugs', { method: 'POST', body: JSON.stringify({ slugs }), cache: 'no-store' });

/** Prices are never cached — the cart must reflect the rules as they are now. */
export const getQuote = (lines, couponCode) =>
  request('/api/quote', { method: 'POST', body: JSON.stringify({ lines, couponCode }), cache: 'no-store' });

/**
 * Placing an order sends the token when there is one, so the order is tied to
 * the account. Without it the order is still placed — as a guest.
 */
export const placeOrder = (payload, token) =>
  request('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
    cache: 'no-store',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

/**
 * Look an order up without an account. The reference alone is not enough —
 * the server wants the phone number (last digits are fine) or the email that
 * was on the order, so a reference seen over someone's shoulder shows nothing.
 */
export const trackOrder = (reference, { phone, email }) => {
  const qs = new URLSearchParams();
  if (phone) qs.set('phone', phone);
  else if (email) qs.set('email', email);
  return request(`/api/orders/${encodeURIComponent(String(reference).trim().toUpperCase())}?${qs}`, { cache: 'no-store' });
};

/** City, state and a delivery window for a pincode. Cached by the browser for an hour. */
export const lookupPincode = (pin, productionDays = 1) =>
  request(`/api/pincode/${encodeURIComponent(pin)}?production=${productionDays}`, { next: { revalidate: 3600 } });

/** Image URLs from the API are paths; make them absolute for <img>. */
export const imageSrc = (url) => (url && url.startsWith('/') ? `${API_URL}${url}` : url);

/**
 * Whether the shop is open. Never cached and never allowed to hang: a status
 * check that takes longer than five seconds is itself the answer.
 */
export async function getStatus() {
  const res = await fetch(`${API_URL}/api/status`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
  if (!res.ok) return { mode: 'unreachable', reachable: false };
  return res.json();
}

export const rupees = (n) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;
