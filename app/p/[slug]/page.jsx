import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProduct, API_URL } from '../../../lib/api';
import AddToCart from '../../../components/AddToCart';
import VolumeBreaks from '../../../components/VolumeBreaks';
import ProductCard from '../../../components/ProductCard';
import RecentlyViewed from '../../../components/RecentlyViewed';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const { product } = await getProduct(slug);
    return {
      title: product.name,
      description: product.shortDescription,
      openGraph: {
        title: product.name,
        description: product.shortDescription,
        images: product.images && product.images.length ? [product.images[0]] : undefined,
      },
    };
  } catch {
    return { title: 'Product' };
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params;

  let data;
  try {
    data = await getProduct(slug);
  } catch (err) {
    if (err.status === 404) notFound();
    return (
      <div className="container empty">
        <h1>Could not load this product</h1>
        <p>The API did not respond.</p>
        <p className="mono" style={{ fontSize: 13, color: 'var(--ink-3)' }}>tried: {API_URL}</p>
      </div>
    );
  }

  const { product, related, crossSell } = data;

  return (
    <>
      <div className="container">
        <nav className="eyebrow" style={{ paddingTop: 20 }}>
          <Link href="/">Home</Link> / <Link href={`/c/${product.categorySlug}`}>{product.categorySlug}</Link> /{' '}
          {product.sku}
        </nav>

        <div className="pdp">
          <div className="gallery">
            {product.images && product.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.images[0]} alt={product.name} />
            ) : (
              <span className="mono" style={{ color: 'var(--ink-3)', fontSize: 12, letterSpacing: '0.1em' }}>
                {product.sku}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h1>{product.name}</h1>
              <p className="lede">{product.shortDescription}</p>
            </div>

            <AddToCart product={product} />

            <VolumeBreaks slug={product.slug} listPrice={product.listPrice} />

            {product.description && <p style={{ color: 'var(--ink-2)' }}>{product.description}</p>}

            <table className="spec-table">
              <tbody>
                <tr>
                  <th>Code</th>
                  <td>{product.sku}</td>
                </tr>
                {product.filamentGrams > 0 && (
                  <tr>
                    <th>Material used</th>
                    <td>{product.filamentGrams} g</td>
                  </tr>
                )}
                {product.printHours > 0 && (
                  <tr>
                    <th>Print time</th>
                    <td>{product.printHours} hours</td>
                  </tr>
                )}
                <tr>
                  <th>Availability</th>
                  <td>
                    {product.madeToOrder
                      ? `Made to order, ~${product.leadTimeDays} days`
                      : product.stockOnHand > 0
                        ? `${product.stockOnHand} ready to ship`
                        : 'Sold out'}
                  </td>
                </tr>
              </tbody>
            </table>

            {product.tags && product.tags.length > 0 && (
              <div className="tagrow">
                {product.tags.map((t) => (
                  <Link key={t} href={`/c/${product.categorySlug}`} className="tag">
                    {t}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {related && related.length > 0 && (
          <section className="section">
            <div className="section-head">
              <h2>Goes with this</h2>
              <Link href={`/c/${product.categorySlug}`}>More from this range →</Link>
            </div>
            <div className="rail">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}

        {crossSell && crossSell.length > 0 && (
          <section className="section" style={{ paddingTop: 0 }}>
            <div className="section-head">
              <h2>From the other ranges</h2>
            </div>
            <div className="rail">
              {crossSell.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}

        <RecentlyViewed excludeSlug={product.slug} />
      </div>
    </>
  );
}
