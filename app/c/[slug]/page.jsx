import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategories, getProducts } from '../../../lib/api';
import ProductCard from '../../../components/ProductCard';
import RecentlyViewed from '../../../components/RecentlyViewed';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const categories = await getCategories();
    const category = categories.find((c) => c.slug === slug);
    if (!category) return { title: 'Not found' };
    return { title: category.name, description: category.description };
  } catch {
    return { title: 'Shop' };
  }
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const { sort = 'curated' } = (await searchParams) || {};

  let categories = [];
  let data = { items: [] };

  try {
    [categories, data] = await Promise.all([getCategories(), getProducts({ category: slug, sort, limit: 40 })]);
  } catch {
    return (
      <div className="container empty">
        <h1>Could not load this range</h1>
        <p>The API did not respond. Try again in a moment.</p>
      </div>
    );
  }

  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  return (
    <>
      <section className="container" style={{ paddingBlock: '36px 8px' }}>
        <span className="eyebrow">{category.productCount} products</span>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 700, marginTop: 8 }}>{category.name}</h1>
        <p style={{ color: 'var(--ink-2)', maxWidth: '60ch', marginTop: 10 }}>{category.description}</p>
      </section>

      <section className="container section" style={{ paddingTop: 28 }}>
        <div className="section-head">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { key: 'curated', label: 'Curated' },
              { key: 'priceAsc', label: 'Price low to high' },
              { key: 'priceDesc', label: 'Price high to low' },
              { key: 'newest', label: 'Newest' },
            ].map((s) => (
              <Link
                key={s.key}
                href={`/c/${slug}?sort=${s.key}`}
                className="tag"
                style={sort === s.key ? { borderColor: 'var(--mark)', color: 'var(--ink)' } : undefined}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        {data.items.length === 0 ? (
          <p className="notice">Nothing in this range yet. Check back after the next print run.</p>
        ) : (
          <div className="grid">
            {data.items.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </section>

      <div className="container">
        <RecentlyViewed />
      </div>
    </>
  );
}
