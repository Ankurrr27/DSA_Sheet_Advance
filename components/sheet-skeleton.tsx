export default function SheetSkeleton() {
  return <div className="sheet-skeleton" aria-label="Loading sheet" aria-busy="true">
    <div className="sheet-skeleton-hero"><div><span className="skeleton-line skeleton-kicker" /><span className="skeleton-line skeleton-title" /><span className="skeleton-line skeleton-copy" /></div><span className="skeleton-ring" /></div>
    <div className="sheet-skeleton-toolbar"><span className="skeleton-line skeleton-search" /><span className="skeleton-line skeleton-filter" /></div>
    {[1, 2, 3, 4].map((item) => <section className="sheet-skeleton-topic" key={item}><div className="sheet-skeleton-topic-head"><span className="skeleton-dot" /><span className="skeleton-line skeleton-topic-name" /><span className="skeleton-line skeleton-topic-progress" /></div><div className="sheet-skeleton-subtopic"><span className="skeleton-dot small" /><span className="skeleton-line skeleton-subtopic-name" /><span className="skeleton-line skeleton-subtopic-meta" /></div><div className="sheet-skeleton-rows">{[1, 2, 3].map((row) => <div className="sheet-skeleton-row" key={row}><span className="skeleton-circle" /><span className="skeleton-line skeleton-question" /><span className="skeleton-pill" /></div>)}</div></section>)}
  </div>;
}
