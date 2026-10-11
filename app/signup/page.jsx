'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth';
import { passwordProblem, passwordStrength, STRENGTH_LABEL, emailSuggestion, EMAIL_OK, RANGES } from '../../lib/profile';
import { setConsent, getConsent } from '../../lib/consent';
import ProfileQuestions, { EMPTY_PROFILE, splitProfile } from '../../components/ProfileQuestions';

/**
 * Signup, in three short steps.
 *
 *   1. Account   — name, email, password. The only required step. Problems
 *                  show up as you type, not after you press the button.
 *   2. About you — optional tiles and chips. Skippable in one click; whatever
 *                  is answered makes the homepage and the rider gear more
 *                  relevant, and nothing here is ever shown to anyone else.
 *   3. Welcome   — the first-order code, if they wanted one, and where to go next.
 *
 * The account is created when step 2 is submitted or skipped, so there is no
 * half-made account if they close the tab on step 1.
 *
 * Bots: a `website` field exists in the markup but no person can see or tab
 * to it. Anything that fills it gets a convincing success and no account.
 */
const STEPS = ['Account', 'About you', 'Welcome'];

export default function SignupPage() {
  const { signup } = useAuth();
  const [step, setStep] = useState(0);
  const [account, setAccount] = useState({ name: '', email: '', password: '', website: '' });
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [personalise, setPersonalise] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const firstField = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (firstField.current) firstField.current.focus({ preventScroll: true });
  }, [step]);

  // If the banner was already answered, start from that answer.
  useEffect(() => {
    const c = getConsent();
    if (c) setPersonalise(Boolean(c.personalisation));
  }, []);

  // ---- validation, live ------------------------------------------------
  const emailOk = EMAIL_OK.test(account.email.trim());
  const emailMsg = !account.email ? 'We send order updates here.' : emailOk ? '' : 'That does not look like an email address.';
  const suggestion = emailOk ? emailSuggestion(account.email.trim()) : '';
  const pwProblem = passwordProblem(account.password, account.email);
  const strength = passwordStrength(account.password);
  const step1Ok = emailOk && !pwProblem;

  const mark = (f) => setTouched((t) => ({ ...t, [f]: true }));
  const showErr = (f) => touched[f] || error;

  function next(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setError('');
    if (!step1Ok) return;
    setStep(1);
  }

  async function create(skipped) {
    setBusy(true);
    setError('');
    const body = {
      name: account.name.trim(),
      email: account.email.trim(),
      password: account.password,
      website: account.website,
      ...(skipped ? { interests: [], profile: {} } : splitProfile(profile)),
      consent: { marketing: !skipped && profile.offersOptIn, personalisation: !skipped && personalise },
    };
    try {
      const result = await signup(body);
      if (!skipped) setConsent({ personalisation: personalise });
      setDone({ ...result, skipped });
      setStep(2);
    } catch (err) {
      setError(err.message || 'Could not create the account.');
      if (err.field === 'email' || err.field === 'password') setStep(0);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container auth-page wizard">
      <ol className="steps" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li key={label} className={i === step ? 'current' : i < step ? 'done' : ''} aria-current={i === step ? 'step' : undefined}>
            <span className="num">{i < step ? '✓' : i + 1}</span>
            <span>{label}</span>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <form className="auth-form" onSubmit={next} noValidate>
          <div>
            <h1>Create an account</h1>
            <p className="lede">
              You can order without one. An account gets you order tracking, saved details, and a homepage that
              shows the things you actually care about.
            </p>
          </div>

          <label className="field">
            <span>Name</span>
            <input ref={firstField} value={account.name} onChange={(e) => setAccount({ ...account, name: e.target.value })} autoComplete="name" maxLength={80} />
          </label>

          <label className={`field ${showErr('email') && !emailOk ? 'invalid' : ''}`}>
            <span>Email</span>
            <input
              type="email"
              inputMode="email"
              value={account.email}
              onChange={(e) => setAccount({ ...account, email: e.target.value })}
              onBlur={() => mark('email')}
              autoComplete="email"
              aria-invalid={showErr('email') && !emailOk}
              aria-describedby="email-hint"
              required
            />
            <small id="email-hint" className={showErr('email') && !emailOk ? 'hint bad' : 'hint'}>
              {suggestion ? (
                <>
                  Did you mean{' '}
                  <button type="button" className="linkish" onClick={() => setAccount({ ...account, email: suggestion })}>
                    {suggestion}
                  </button>
                  ?
                </>
              ) : (
                emailMsg
              )}
            </small>
          </label>

          <label className={`field ${showErr('password') && pwProblem ? 'invalid' : ''}`}>
            <span>
              Password
              <button type="button" className="linkish right" onClick={() => setShowPassword((v) => !v)} aria-pressed={showPassword}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={account.password}
              onChange={(e) => setAccount({ ...account, password: e.target.value })}
              onBlur={() => mark('password')}
              autoComplete="new-password"
              aria-invalid={showErr('password') && Boolean(pwProblem)}
              aria-describedby="pw-hint"
              minLength={8}
              maxLength={128}
              required
            />
            <div className="strength" aria-hidden="true" data-level={strength}>
              <i /><i /><i /><i />
            </div>
            <small id="pw-hint" className={showErr('password') && pwProblem ? 'hint bad' : 'hint'}>
              {account.password
                ? pwProblem || `${STRENGTH_LABEL[strength]}. Length matters more than symbols.`
                : 'At least 8 characters. A few words you will remember beat a short jumble.'}
            </small>
          </label>

          {/* Honeypot: not visible, not focusable, not for people. */}
          <label className="hp" aria-hidden="true">
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" value={account.website} onChange={(e) => setAccount({ ...account, website: e.target.value })} />
          </label>

          {error && <p className="notice bad" role="alert">{error}</p>}

          <button type="submit" className="btn" disabled={busy}>
            Continue
          </button>
          <p className="tiny muted">
            By continuing you agree to the shop keeping your cart and sign-in in this browser.{' '}
            <Link href="/privacy">What is stored</Link>.
          </p>
          <p className="auth-alt">
            Already have one? <Link href="/login">Sign in</Link>
          </p>
        </form>
      )}

      {step === 1 && (
        <form
          className="auth-form"
          onSubmit={(e) => {
            e.preventDefault();
            create(false);
          }}
        >
          <div>
            <h1>A few optional questions</h1>
            <p className="lede">
              Each one makes the shop a little more yours. Skip the lot and nothing changes — you can answer later
              from your account, or never.
            </p>
          </div>

          <ProfileQuestions value={profile} onChange={setProfile} />

          <label className="check-row">
            <input type="checkbox" checked={personalise} onChange={(e) => setPersonalise(e.target.checked)} />
            <span>
              <strong>Remember what I look at</strong>
              <small>Keeps a short list of products you opened, in this browser only, for the &ldquo;picked for you&rdquo; rail.</small>
            </span>
          </label>

          {error && <p className="notice bad" role="alert">{error}</p>}

          <div className="wizard-actions">
            <button type="button" className="btn ghost" onClick={() => setStep(0)} disabled={busy}>
              Back
            </button>
            <button type="button" className="btn ghost" onClick={() => create(true)} disabled={busy}>
              Skip all
            </button>
            <button ref={firstField} type="submit" className="btn" disabled={busy}>
              {busy ? 'Creating…' : 'Create account'}
            </button>
          </div>
        </form>
      )}

      {step === 2 && done && (
        <div className="auth-form welcome">
          <div>
            <h1>You&rsquo;re in{done.user.name ? `, ${done.user.name.split(' ')[0]}` : ''}.</h1>
            <p className="lede">Orders you place while signed in show up under your account, with their progress.</p>
          </div>

          {done.offer ? (
            <OfferCard offer={done.offer} />
          ) : (
            <p className="notice">
              No offers were requested, so none will be sent. The first-order code is on the account page if you
              change your mind.
            </p>
          )}

          <NextSteps interests={done.user.interests || []} />
        </div>
      )}
    </div>
  );
}

function OfferCard({ offer }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(offer.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the code is on screen anyway */
    }
  }
  return (
    <div className="offer-card">
      <span className="eyebrow">Your first-order code</span>
      <div className="offer-row">
        <strong className="mono code">{offer.code}</strong>
        <button type="button" className="btn ghost small" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p>
        {offer.text}
        {offer.minSubtotal > 0 ? ` on orders over ₹${offer.minSubtotal}` : ''}. Type it in the cart — it is also
        saved on your account page.
      </p>
    </div>
  );
}

function NextSteps({ interests }) {
  const picks = RANGES.filter((r) => interests.includes(r.slug));
  const list = picks.length ? picks : RANGES.slice(0, 3);
  return (
    <div className="next-steps">
      <span className="eyebrow">{picks.length ? 'Start with what you picked' : 'Start anywhere'}</span>
      <div className="next-grid">
        {list.map((r) => (
          <Link key={r.slug} href={`/c/${r.slug}`} className="interest-tile">
            <strong>{r.name}</strong>
            <span>{r.blurb}</span>
          </Link>
        ))}
      </div>
      <div className="wizard-actions">
        <Link href="/account" className="btn ghost">
          Your account
        </Link>
        <Link href="/" className="btn">
          Go to the shop
        </Link>
      </div>
    </div>
  );
}
