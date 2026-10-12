/** States and union territories, as India Post names them. */
export const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

/** India Post sometimes uses older names; map them onto the list above. */
const ALIASES = { 'NCT of Delhi': 'Delhi', 'Jammu & Kashmir': 'Jammu and Kashmir', 'Andaman & Nicobar Islands': 'Andaman and Nicobar Islands', 'Dadra & Nagar Haveli': 'Dadra and Nagar Haveli and Daman and Diu', 'Daman & Diu': 'Dadra and Nagar Haveli and Daman and Diu', 'Orissa': 'Odisha', 'Pondicherry': 'Puducherry', 'Uttaranchal': 'Uttarakhand' };

export function normaliseState(name) {
  const n = String(name || '').trim();
  if (ALIASES[n]) return ALIASES[n];
  const hit = STATES.find((s) => s.toLowerCase() === n.toLowerCase());
  return hit || n;
}

/** "Wed 15 – Thu 16 Oct" from two ISO dates. */
export function deliveryWindow(from, to) {
  const a = new Date(from);
  const b = new Date(to);
  const day = (d) => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
  const month = (d) => d.toLocaleDateString('en-IN', { month: 'short' });
  if (a.getMonth() === b.getMonth()) return `${day(a)} – ${day(b)} ${month(b)}`;
  return `${day(a)} ${month(a)} – ${day(b)} ${month(b)}`;
}
