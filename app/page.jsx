import Link from 'next/link';
import { getCategories, getProducts, API_URL } from '../lib/api';
import ProductCard from '../components/ProductCard';
import RecommendedRail from '../components/RecommendedRail';
import RecentlyViewed from '../components/RecentlyViewed';

export const revalidate = 60;

/**
 * Homepage.
 *
 * The hero is a band, not a screen. A small catalogue is better served by
 * getting products in front of people than by a full-height statement — with
 * twelve items the job of this page is to show them, not to explain itself.
 * The pitch is one line; everything else is product.
 */
export default async function HomePage() {
  let categories = [];
  let featured = { items: [] };
  let offline = false;

  try {
    [categories, featured] = await Promise.all([getCategories(), getProducts({ limit: 8 })]);
  } catch {
    offline = true;
  }

  if (offline) {
    return (
      <div className="container empty">
        <h1>The shop is not reachable</h1>
        <p>
          This page is rendered on the server, so it fetched the API from the host this site runs on &mdash; not from
          your browser.
        </p>
        <p className="mono" style={{ fontSize: 13, color: 'var(--ink-3)' }}>tried: {API_URL}</p>
        <p style={{ maxWidth: '52ch' }}>
          If that says localhost, NEXT_PUBLIC_API_URL is not set on this deployment. It is baked in at build time, so
          setting it also needs a redeploy.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* A horizontal band: pitch on the left, the three ranges on the right. */}
      <section className="hero-band">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Designed and printed in Pune</span>
            <h1>Gear for the bike, the desk, and the small daily annoyances.</h1>
            <p>Made and packed by one person who rides. Small runs, real materials.</p>
          </div>

          <div className="hero-ranges">
            {categories.map((c) => (
              <Link key={c.slug} href={`/c/${c.slug}`} className="range-chip" style={{ borderLeftColor: c.accent }}>
                <strong>{c.name}</strong>
                <span>{c.tagline}</span>
                <span className="count mono">{c.productCount} products</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        {/* Products before anything else — this is what the page is for. */}
        <RecommendedRail limit={6} />

        <section className="rail-section">
          <div className="section-head">
            <div>
              <h2>Everything in stock</h2>
              <p className="rail-basis">Printed in small batches, restocked weekly</p>
            </div>
            <Link href="/c/biker">Browse all &rarr;</Link>
          </div>
          <div className="grid">
            {featured.items.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>

        <RecentlyViewed />

        <section className="rail-section">
          <div className="band-note">
            <div>
              <h3>Bring your own model</h3>
              <p>Upload a file, get a price and a date in a few seconds. No account needed.</p>
            </div>
            <Link href="/custom" className="btn">
              Get a quote
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
