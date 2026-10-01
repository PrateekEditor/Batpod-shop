import Link from 'next/link';
import { rupees } from '../lib/api';

const LABELS = {
  'in-stock': 'In stock',
  'low-stock': 'Low stock',
  'sold-out': 'Sold out',
  'made-to-order': 'Made to order',
  unavailable: 'Unavailable',
};

export default function ProductCard({ product }) {
  const state = product.availability || (product.stockOnHand > 0 ? 'in-stock' : 'sold-out');

  return (
    <Link href={`/p/${product.slug}`} className="product-card">
      <div className="thumb">
        {product.images && product.images[0] ? (
          // Plain <img>: product photos come from wherever you upload them and
          // next/image would need every host allowlisted first.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0]} alt={product.name} loading="lazy" />
        ) : (
          <span className="placeholder">{product.sku}</span>
        )}
      </div>
      <div className="body">
        <h3>{product.name}</h3>
        <p className="blurb">{product.shortDescription}</p>
        <div className="foot">
          <span className="price">{rupees(product.listPrice)}</span>
          <span className={`badge ${state}`}>{LABELS[state] || state}</span>
        </div>
      </div>
    </Link>
  );
}
