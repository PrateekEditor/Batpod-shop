import { notFound } from 'next/navigation';
import { getCategories, getProducts, API_URL } from '../../../lib/api';
import RangeTabs from '../../../components/RangeTabs';
import CategoryGrid from '../../../components/CategoryGrid';
import RecentlyViewed from '../../../components/RecentlyViewed';
import { RangeScene } from '../../../components/scenes/Scenes';

/**
 * A range page.
 *
 * Prerendered at build time and refreshed in the background every minute, so
 * switching between ranges is a static page served from the edge — not a
 * server render that waits on the API. Sorting happens in the browser (see
 * CategoryGrid); the moment this page read the query string it would be
 * rendered on every request again.
 */
export const revalidate = 60;
export const dynamicParams = true;

const KNOWN = ['biker', 'tabletop', 'daily', 'minis'];

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    return categories.map((c) => ({ slug: c.slug }));
  } catch {
    // The API was not reachable at build time; prerender the ranges we know
    // and let anything else render on first request.
    return KNOWN.map((slug) => ({ slug }));
  }
}

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

export default async function CategoryPage({ params }) {
  const { slug } = await params;

  let categories = [];
  let data = { items: [] };
  try {
    [categories, data] = await Promise.all([getCategories(), getProducts({ category: slug, limit: 60 })]);
  } catch {
    return (
      <div className="container empty">
        <h1>Could not load this range</h1>
        <p>The API did not respond.</p>
        <p className="mono" style={{ fontSize: 13, color: 'var(--ink-3)' }}>tried: {API_URL}</p>
      </div>
    );
  }

  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  return (
    <>
      <div className="range-tabs-wrap">
        <div className="container">
          <RangeTabs categories={categories} />
        </div>
      </div>

      <section className="range-head" style={{ '--accent': category.accent }}>
        <div className="container range-head-grid">
          <div className="range-copy">
            <span className="eyebrow">{category.productCount} products · {category.tagline}</span>
            <h1>{category.name}</h1>
            <p>{category.description}</p>
          </div>
          <div className="range-art" aria-hidden="true">
            <RangeScene slug={slug} />
          </div>
        </div>
      </section>

      <section className="container section" style={{ paddingTop: 22 }}>
        <CategoryGrid items={data.items} accent={category.accent} />
      </section>

      <div className="container">
        <RecentlyViewed />
      </div>
    </>
  );
}
