export const metadata = { title: 'Your account', description: 'Your orders, details and preferences at Batpod Labs.' };

/** Metadata only — the page itself is a client component, which cannot export it. */
export default function Layout({ children }) {
  return children;
}
