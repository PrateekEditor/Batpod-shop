/** Shown instantly while a range that was not prerendered is fetched. */
export default function Loading() {
  return (
    <>
      <div className="range-tabs-wrap"><div className="container"><div className="range-tabs"><span className="tab-skeleton" /><span className="tab-skeleton" /><span className="tab-skeleton" /></div></div></div>
      <section className="container" style={{ paddingBlock: '36px 8px' }}>
        <div className="line-skeleton" style={{ width: 140 }} />
        <div className="line-skeleton" style={{ width: 260, height: 34, marginTop: 12 }} />
        <div className="line-skeleton" style={{ width: '50%', marginTop: 12 }} />
      </section>
      <section className="container section" style={{ paddingTop: 22 }}>
        <div className="grid">
          {Array.from({ length: 6 }, (_, i) => <div key={i} className="card-skeleton" style={{ flex: 'none' }} />)}
        </div>
      </section>
    </>
  );
}
