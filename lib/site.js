/**
 * The one place the shop's identity lives: name, where to find it on social
 * media, how to reach it, how to get paid. Fill the links in here and every
 * page updates. An empty href renders the button as "coming soon" rather than
 * a dead link.
 *
 * Orders are confirmed over WhatsApp and settled by UPI until a payment
 * gateway is wired in, so two fields here do real work:
 *
 *   whatsappNumber — digits only, country code first, no plus: '919876543210'.
 *                    The order confirmation button opens a chat with the order
 *                    already typed out.
 *   upiId          — the VPA customers pay to: 'batpodlabs@upi'. The "Pay by
 *                    UPI" button opens any UPI app with the amount filled in.
 *
 * Leave either empty and the shop says "coming soon" in its place.
 */
/** Bump when the privacy notice changes materially; everyone is asked again. */
export const CONSENT_VERSION = '2026-10';

export const SITE = {
  name: 'Batpod Labs',
  tagline: 'Designed and printed in Pune',
  city: 'Pune, Maharashtra',
  email: '',
  phone: '',
  whatsapp: '',
  whatsappNumber: '',
  upiId: '',
  upiName: 'Batpod Labs',
  hours: 'Orders are packed Monday to Saturday. Courier pickups at 11:00 and 17:00.',
  social: [
    { key: 'instagram', label: 'Instagram', href: '', handle: '' },
    { key: 'youtube', label: 'YouTube', href: '', handle: 'batpod.wit.pp' },
    { key: 'whatsapp', label: 'WhatsApp', href: '', handle: '' },
    { key: 'email', label: 'Email', href: '', handle: '' },
  ],
};

/** A wa.me link with the message already typed, or '' when no number is set. */
export function whatsappLink(message) {
  const number = String(SITE.whatsappNumber || '').replace(/\D/g, '');
  if (!number) return '';
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/**
 * A UPI deep link. Any UPI app on the phone (GPay, PhonePe, Paytm, BHIM)
 * claims the upi:// scheme and opens with payee, amount and note filled in.
 * On a desktop it does nothing, so the page shows the ID as text as well.
 */
export function upiLink({ amount, note }) {
  if (!SITE.upiId) return '';
  const params = new URLSearchParams({
    pa: SITE.upiId,
    pn: SITE.upiName,
    am: (Math.round(Number(amount) * 100) / 100).toFixed(2),
    cu: 'INR',
    tn: note || SITE.name,
  });
  return `upi://pay?${params.toString()}`;
}

/** The message a customer sends to confirm an order. */
export function orderMessage(order) {
  const lines = (order.lines || []).map((l) => `${l.quantity}× ${l.name}`).join(', ');
  return `Hi ${SITE.name}, I just placed order ${order.reference}${lines ? ` (${lines})` : ''}${
    order.total ? ` for ₹${Math.round(order.total)}` : ''
  }. Please confirm and tell me how to pay.`;
}
