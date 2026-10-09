/** Shown instantly while a product that was not prerendered is fetched. */
export default function Loading() {
  return (
    <div className="container">
      <div className="line-skeleton" style={{ width: 180, marginTop: 24 }} />
      <div className="pdp">
        <div className="card-skeleton" style={{ flex: 'none', height: 'auto', aspectRatio: '1' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="line-skeleton" style={{ width: '70%', height: 32 }} />
          <div className="line-skeleton" style={{ width: '90%' }} />
          <div className="line-skeleton" style={{ width: 160, height: 44 }} />
          <div className="line-skeleton" style={{ width: '80%' }} />
          <div className="line-skeleton" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  );
}
