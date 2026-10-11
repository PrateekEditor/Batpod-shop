/**
 * The optional questions, and the rules the signup form checks before the
 * server does. Both sides must agree: the server's copy is the one that
 * counts (batpod-server/src/routes/auth.js), this one just saves a round trip.
 */
export const RANGES = [
  { slug: 'biker', name: 'Bike & Rider', blurb: 'Keyrings, hooks, nameplates' },
  { slug: 'tabletop', name: 'Tabletop', blurb: 'Display pieces and flexi toys' },
  { slug: 'daily', name: 'Daily Fixes', blurb: 'Clips, hooks, organisers' },
  { slug: 'minis', name: 'Minis', blurb: 'Pocket-size characters' },
];

export const RIDES = [
  { key: 'commute', label: 'Commute' },
  { key: 'tour', label: 'Tour' },
  { key: 'sport', label: 'Track / sport' },
  { key: 'no', label: "I don't ride" },
];

export const USE_FOR = [
  { key: 'desk', label: 'My desk' },
  { key: 'home', label: 'Around the house' },
  { key: 'gifting', label: 'Gifts' },
  { key: 'collecting', label: 'Collecting' },
  { key: 'workshop', label: 'Garage / workshop' },
  { key: 'events', label: 'Events & meets' },
];

export const CONTACT = [
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'email', label: 'Email' },
  { key: 'none', label: 'Neither, thanks' },
];

const COMMON = new Set([
  'password', 'password1', 'password123', '12345678', '123456789', '1234567890', 'qwertyuiop', 'iloveyou',
  'letmein', 'welcome1', 'admin123', 'abcd1234', 'india123', 'batpod123', 'qwerty123',
]);

/** Why this password will be refused, or '' when it is fine. */
export function passwordProblem(password, email = '') {
  const p = String(password || '');
  if (p.length < 8) return 'Use at least 8 characters. A short phrase works well.';
  if (p.length > 128) return 'That is longer than it needs to be — 128 characters is plenty.';
  if (COMMON.has(p.toLowerCase())) return 'That one is on every guess list. Pick something less common.';
  const local = String(email || '').split('@')[0].toLowerCase();
  if (local.length >= 4 && p.toLowerCase().includes(local)) return 'Leave your email out of the password.';
  return '';
}

/** 0–4. Length is what matters; variety is a tie-breaker. */
export function passwordStrength(password) {
  const p = String(password || '');
  if (!p) return 0;
  let score = 0;
  if (p.length >= 8) score += 1;
  if (p.length >= 12) score += 1;
  if (p.length >= 16) score += 1;
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(p)).length;
  if (kinds >= 3) score += 1;
  if (COMMON.has(p.toLowerCase())) score = 0;
  return Math.min(4, score);
}

export const STRENGTH_LABEL = ['', 'Weak', 'Okay', 'Good', 'Strong'];

/**
 * "Did you mean gmail.com?" The handful of domains nearly everyone here uses,
 * with the typos that come up most. Only ever a suggestion — it is never
 * applied without a click, because some odd-looking domains are real.
 */
const DOMAINS = {
  'gmial.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gmali.com': 'gmail.com', 'gamil.com': 'gmail.com',
  'gmail.co': 'gmail.com', 'gmail.con': 'gmail.com', 'gmail.cm': 'gmail.com', 'gnail.com': 'gmail.com',
  'yahooo.com': 'yahoo.com', 'yaho.com': 'yahoo.com', 'yahoo.co': 'yahoo.com', 'yahoo.con': 'yahoo.com',
  'hotmal.com': 'hotmail.com', 'hotmai.com': 'hotmail.com', 'hotmial.com': 'hotmail.com',
  'outlok.com': 'outlook.com', 'outloo.com': 'outlook.com', 'outlook.co': 'outlook.com',
  'rediffmai.com': 'rediffmail.com', 'rediffmail.co': 'rediffmail.com',
  'icloud.co': 'icloud.com', 'iclod.com': 'icloud.com',
};

export function emailSuggestion(email) {
  const at = String(email || '').lastIndexOf('@');
  if (at < 1) return '';
  const domain = email.slice(at + 1).toLowerCase();
  const fix = DOMAINS[domain];
  return fix ? `${email.slice(0, at)}@${fix}` : '';
}

export const EMAIL_OK = /^\S+@\S+\.\S+$/;
