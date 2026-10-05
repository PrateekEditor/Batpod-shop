'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';

const RANGES = [
  { slug: 'biker', name: 'Bike & Rider', blurb: 'Keyrings, hooks, nameplates' },
  { slug: 'tabletop', name: 'Tabletop', blurb: 'Display pieces and flexi toys' },
  { slug: 'daily', name: 'Daily Fixes', blurb: 'Clips, hooks, organisers' },
];

/**
 * Signup.
 *
 * Four fields, one of which is optional. Every extra question here costs
 * sign-ups, and the interests are the only one that pays for itself — they are
 * what makes the homepage useful on the very next page load.
 */
export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [interests, setInterests] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const toggle = (slug) =>
    setInterests((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]));

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Use at least 8 characters. Length matters more than symbols.');
      return;
    }
    setBusy(true);
    try {
      await signup({ ...form, interests });
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container auth-page">
      <div>
        <h1>Create an account</h1>
        <p className="lede">
          Optional &mdash; you can order without one. It gets you order history and a homepage that shows the things
          you actually care about.
        </p>
      </div>

      <form className="auth-form" onSubmit={submit}>
        <label className="field">
          <span>Name</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
        </label>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
          />
        </label>

        <label className="field">
          <span>Password &mdash; at least 8 characters</span>
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="new-password"
          />
        </label>

        <div className="field">
          <span>What are you into? Pick any.</span>
          <div className="interest-grid">
            {RANGES.map((r) => (
              <button
                key={r.slug}
                type="button"
                className="interest-tile"
                aria-pressed={interests.includes(r.slug)}
                onClick={() => toggle(r.slug)}
              >
                <strong>{r.name}</strong>
                <span>{r.blurb}</span>
              </button>
            ))}
          </div>
          <small style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
            Only used to order the homepage. Change it any time, and skipping it is fine.
          </small>
        </div>

        {error && <p className="notice bad">{error}</p>}

        <button type="submit" className="btn" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>

      <p className="auth-alt">
        Already have one? <Link href="/login">Sign in</Link>
      </p>
    </div>
  );
}
