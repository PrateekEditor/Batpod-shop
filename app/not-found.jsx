import Link from 'next/link';
import { PressableLink } from '../components/Motion';

export default function NotFound() {
  return (
    <div className="container empty">
      <h1>Nothing here</h1>
      <p>That product or range does not exist, or it has been retired.</p>
      <PressableLink href="/" className="btn">Back to the shop</PressableLink>
    </div>
  );
}
