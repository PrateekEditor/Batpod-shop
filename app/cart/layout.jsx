export const metadata = { title: 'Your cart', description: 'What is in your cart, priced by the workshop, and where to send it.' };

/** Metadata only — the page itself is a client component, which cannot export it. */
export default function Layout({ children }) {
  return children;
}
