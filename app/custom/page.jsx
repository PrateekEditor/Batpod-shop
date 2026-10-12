'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { API_URL, rupees } from '../../lib/api';
import { Pressable } from '../../components/Motion';

/**
 * Custom print quote.
 *
 * The file is never uploaded. The browser reads its name, size and type and
 * sends only that — enough to sanity-check the request, with none of the
 * storage, scanning and privacy obligations that accepting real uploads brings.
 * The customer emails the actual file once there is a firm price.
 */

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@batpodlabs.com';

function bytesToMb(b) {
  return Math.round((b / (1024 * 1024)) * 10) / 10;
}

export default function CustomPrintPage() {
  const [options, setOptions] = useState(null);
  const [spec, setSpec] = useState({
    size: 'small',
    material: 'pla',
    quality: 'standard',
    complexity: 'simple',
    infill: 25,
    quantity: 1,
    colours: 1,
    rush: false,
  });
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [result, setResult] = useState(null);
  const [calcError, setCalcError] = useState('');
  const [loading, setLoading] = useState(false);

  const [contact, setContact] = useState({ name: '', email: '', phone: '' });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [submitError, setSubmitError] = useState('');

  const fileInput = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/api/custom/options`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('options'))))
      // Only trust a response that has the shape we render; a 404 page or an
      // error body must not take the whole page down.
      .then((o) => (o && Array.isArray(o.acceptedFileTypes) ? setOptions(o) : Promise.reject(new Error('shape'))))
      .catch(() => setCalcError('Could not reach the estimator. Try again in a moment.'));
  }, []);

  // Re-estimate as they change anything, debounced so dragging quantity
  // doesn't fire twenty requests.
  useEffect(() => {
    const id = setTimeout(() => {
      setLoading(true);
      fetch(`${API_URL}/api/custom/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spec),
      })
        .then(async (r) => {
          const body = await r.json();
          if (!r.ok) throw new Error(body.error || 'Could not calculate that.');
          return body;
        })
        .then((body) => {
          setResult(body);
          setCalcError('');
        })
        .catch((err) => {
          setResult(null);
          setCalcError(err.message);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(id);
  }, [spec]);

  function pickFile(e) {
    const f = e.target.files && e.target.files[0];
    setFileError('');
    if (!f) {
      setFile(null);
      return;
    }
    const maxMb = options ? options.maxFileSizeMb : 50;
    const accepted = options ? options.acceptedFileTypes : ['.stl', '.3mf', '.obj'];
    const ext = '.' + (f.name.split('.').pop() || '').toLowerCase();

    if (f.size > maxMb * 1024 * 1024) {
      setFileError(`That file is ${bytesToMb(f.size)} MB. The limit is ${maxMb} MB — split the model, or email it instead.`);
      setFile(null);
      if (fileInput.current) fileInput.current.value = '';
      return;
    }
    if (!accepted.includes(ext)) {
      setFileError(`${ext} is not a 3D file we can read. Accepted: ${accepted.join(', ')}`);
      setFile(null);
      if (fileInput.current) fileInput.current.value = '';
      return;
    }
    setFile({ name: f.name, sizeBytes: f.size, type: f.type || ext });
  }

  const mailto = useMemo(() => {
    const e = result && result.estimate;
    const lines = [
      'Hi — the estimator did not quite fit what I need.',
      '',
      'What I picked:',
      `  Size: ${spec.size}`,
      `  Material: ${spec.material}`,
      `  Quality: ${spec.quality}`,
      `  Complexity: ${spec.complexity}`,
      `  Infill: ${spec.infill}%`,
      `  Colours: ${spec.colours}`,
      `  Quantity: ${spec.quantity}`,
      `  Rush: ${spec.rush ? 'yes' : 'no'}`,
      '',
      e ? `It estimated ₹${e.totalFrom}–₹${e.totalTo} over ${e.leadDays} days.` : 'It could not produce an estimate.',
      '',
      file ? `My file: ${file.name} (${bytesToMb(file.sizeBytes)} MB)` : 'I will attach my file to this email.',
      '',
      'What I actually need:',
      '',
      '',
      `— ${contact.name || ''}`,
    ];
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Custom print enquiry')}&body=${encodeURIComponent(lines.join('\n'))}`;
  }, [spec, result, file, contact.name]);

  async function submit(e) {
    e.preventDefault();
    setSubmitError('');
    if (!contact.email && !contact.phone) {
      setSubmitError('Leave an email or a phone number, otherwise there is no way to send the quote back.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/custom/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact, spec, file: file || {}, message }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Could not send that.');
      setSubmitted(body);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const set = (k) => (e) => {
    const el = e.target;
    const value = el.type === 'checkbox' ? el.checked : el.type === 'number' ? Number(el.value) : el.value;
    setSpec((s) => ({ ...s, [k]: value }));
  };

  if (submitted) {
    return (
      <div className="container empty">
        <h1>Got it</h1>
        <p>
          Your reference is <strong className="mono">{submitted.reference}</strong>.
        </p>
        <p style={{ maxWidth: '52ch' }}>
          Next step is the actual file. Email it to <strong>{CONTACT_EMAIL}</strong> with that reference in the
          subject, and you get a firm price and date back — usually the same day.
        </p>
        <p className="mono" style={{ color: 'var(--ink-3)', fontSize: 13 }}>
          Estimated {rupees(submitted.estimate.totalFrom)}–{rupees(submitted.estimate.totalTo)} ·{' '}
          {submitted.estimate.leadDays} days
        </p>
      </div>
    );
  }

  const e = result && result.estimate;

  return (
    <div className="container" style={{ paddingBlock: '32px 48px' }}>
      <span className="eyebrow">Bring your own model</span>
      <h1 style={{ fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 700, marginTop: 8 }}>Print something of your own</h1>
      <p style={{ color: 'var(--ink-2)', maxWidth: '60ch', marginTop: 10 }}>
        Pick roughly what you need and get a price in a few seconds. It is deliberately a ceiling — once the real file
        is sliced the number usually comes down, and nothing is charged until you agree the revised figure.
      </p>

      <div className="cart-layout" style={{ paddingTop: 28 }}>
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <section className="card-block">
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>Your file</h2>
            <input
              ref={fileInput}
              type="file"
              onChange={pickFile}
              accept={options ? options.acceptedFileTypes.join(',') : '.stl,.3mf,.obj'}
              style={{
                width: '100%',
                padding: 10,
                border: '1px dashed var(--rule)',
                borderRadius: 3,
                background: 'var(--card)',
                color: 'var(--ink-2)',
                fontSize: 13,
              }}
            />
            {file && (
              <p className="notice good" style={{ marginTop: 10 }}>
                {file.name} · {bytesToMb(file.sizeBytes)} MB
              </p>
            )}
            {fileError && (
              <p className="notice bad" style={{ marginTop: 10 }}>
                {fileError}
              </p>
            )}
            <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 10 }}>
              The file stays on your computer — only its name and size are sent, so the estimate can be sanity-checked.
              You email the model itself once there is a price you are happy with.
              {options && ` Max ${options.maxFileSizeMb} MB. Accepted: ${options.acceptedFileTypes.join(', ')}.`}
            </p>
          </section>

          <section className="card-block">
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>What are we printing</h2>

            {!options ? (
              <p className="mono" style={{ color: 'var(--ink-3)' }}>Loading options…</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
                <label className="field">
                  <span>How big, roughly</span>
                  <select value={spec.size} onChange={set('size')}>
                    {options.sizes.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <small style={{ color: 'var(--ink-3)', fontSize: 11 }}>
                    {(options.sizes.find((s) => s.value === spec.size) || {}).example}
                  </small>
                </label>

                <label className="field">
                  <span>Material</span>
                  <select value={spec.material} onChange={set('material')}>
                    {options.materials.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Finish</span>
                  <select value={spec.quality} onChange={set('quality')}>
                    {options.qualities.map((q) => (
                      <option key={q.value} value={q.value}>
                        {q.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Shape</span>
                  <select value={spec.complexity} onChange={set('complexity')}>
                    {options.complexities.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Strength</span>
                  <select value={spec.infill} onChange={set('infill')}>
                    {options.infills.map((i) => (
                      <option key={i.value} value={i.value}>
                        {i.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Colours</span>
                  <select value={spec.colours} onChange={set('colours')}>
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n === 1 ? 'Single colour' : `${n} colours`}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>How many</span>
                  <input type="number" min="1" max="500" value={spec.quantity} onChange={set('quantity')} />
                </label>

                <label className="field" style={{ justifyContent: 'flex-end' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={spec.rush} onChange={set('rush')} style={{ width: 'auto' }} /> Rush
                    it
                  </span>
                  <small style={{ color: 'var(--ink-3)', fontSize: 11 }}>Jumps the queue, costs more</small>
                </label>
              </div>
            )}
          </section>

          <section className="card-block">
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Where to send the quote</h2>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 12 }}>
              Email or phone, either is enough.
            </p>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <label className="field">
                  <span>Name</span>
                  <input value={contact.name} onChange={(ev) => setContact({ ...contact, name: ev.target.value })} />
                </label>
                <label className="field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(ev) => setContact({ ...contact, email: ev.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Phone</span>
                  <input
                    inputMode="tel"
                    value={contact.phone}
                    onChange={(ev) => setContact({ ...contact, phone: ev.target.value })}
                  />
                </label>
              </div>
              <label className="field">
                <span>Anything else worth knowing</span>
                <textarea rows={3} value={message} onChange={(ev) => setMessage(ev.target.value)} />
              </label>

              {submitError && <p className="notice bad">{submitError}</p>}

              <Pressable type="submit" className="btn" disabled={submitting || !e}>
                {submitting ? 'Sending…' : 'Request this print'}
              </Pressable>
            </form>
          </section>
        </div>

        <aside>
          <div className="summary">
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Estimate</h2>

            {calcError && <p className="notice bad">{calcError}</p>}

            {!e && !calcError && <p className="mono" style={{ color: 'var(--ink-3)' }}>Calculating…</p>}

            {e && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span className="mono" style={{ fontSize: 26, fontWeight: 700, opacity: loading ? 0.5 : 1 }}>
                    {rupees(e.totalFrom)}–{rupees(e.totalTo)}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                    {spec.quantity > 1 && `${rupees(e.unitPriceFrom)}–${rupees(e.unitPriceTo)} each · `}
                    ready in about {e.leadDays} {e.leadDays === 1 ? 'day' : 'days'}
                  </span>
                </div>

                <hr className="rule" style={{ margin: '4px 0' }} />

                <div className="row">
                  <span>Material used</span>
                  <span className="mono">{e.totalGrams} g</span>
                </div>
                <div className="row">
                  <span>Printer time</span>
                  <span className="mono">{e.totalPrintHours} h</span>
                </div>
                <div className="row">
                  <span>Hands-on work</span>
                  <span className="mono">{e.handsOnMinutes} min</span>
                </div>

                <details style={{ marginTop: 6 }}>
                  <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--structure)', fontWeight: 600 }}>
                    Where the price comes from
                  </summary>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 10 }}>
                    {result.breakdown.map((b) => (
                      <div key={b.label} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <div className="row">
                          <span>{b.label}</span>
                          <span className="mono">{rupees(b.amount)}</span>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{b.detail}</span>
                      </div>
                    ))}
                  </div>
                </details>

                <p className="notice" style={{ fontSize: 12 }}>
                  {result.notes[0]}
                </p>

                <hr className="rule" style={{ margin: '4px 0' }} />

                <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>Not what you were expecting?</p>
                <a href={mailto} className="btn ghost small" style={{ textAlign: 'center', textDecoration: 'none' }}>
                  Email me the details instead
                </a>
                <p style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                  Opens your mail app with everything above already filled in. Attach your file and send.
                </p>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
