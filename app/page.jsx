import Link from 'next/link';
import { getCategories, getProducts } from '../lib/api';
import ProductCard from '../components/ProductCard';
import RecentlyViewed from '../components/RecentlyViewed';

export const revalidate = 60;

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
          The storefront could not reach the API. Check that the server is running and that
          NEXT_PUBLIC_API_URL points at it.
        </p>
      </div>
    );
  }

  return (
    <>
      <section className="container hero">
        <span className="eyebrow">Designed and printed in Pune</span>
        <h1>Gear for the bike, the desk, and everything that annoys you daily.</h1>
        <p>
          Every piece here is designed, printed and packed by one person who rides. Small runs, real
          materials, and nothing that exists only because it was easy to print.
        </p>
        <div className="cta">
          <Link href="/c/biker" className="btn">
            Browse Bike &amp; Rider
          </Link>
          <Link href="/c/daily" className="btn ghost">
            Daily Fixes from ₹199
          </Link>
        </div>
      </section>

      <hr className="rule" />

      <section className="container section">
        <div className="section-head">
          <h2>Three ranges</h2>
        </div>
        <div className="cat-grid">
          {categories.map((c) => (
            <Link key={c.slug} href={`/c/${c.slug}`} className="cat-card" style={{ borderTopColor: c.accent }}>
              <h3>{c.name}</h3>
              <p>{c.tagline}</p>
              <span className="count">{c.productCount} products</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Printing now</h2>
          <Link href="/c/biker">See everything →</Link>
        </div>
        <div className="grid">
          {featured.items.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      <div className="container">
        <RecentlyViewed />
      </div>
    </>
  );
}
