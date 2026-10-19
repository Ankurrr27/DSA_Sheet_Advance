import Link from "next/link";
const topics = [
  ["Arrays", "2 / 4", "50%"],
  ["Strings", "1 / 2", "50%"],
  ["Stack", "1 / 1", "100%"],
  ["Binary Search", "0 / 1", "0%"],
  ["Graphs", "0 / 1", "0%"],
  ["Dynamic Programming", "1 / 1", "100%"],
];
export default function TopicsPage() {
  return (
    <div className="route-page">
      <header className="route-head">
        <Link href="/" className="back-link">
          ← Overview
        </Link>
        <div>
          <div className="section-kicker">YOUR CURRICULUM</div>
          <h1>
            Topics that <em>compound.</em>
          </h1>
          <p>See where your practice is building momentum.</p>
        </div>
      </header>
      <div className="topic-cards">
        {topics.map(([name, done, pct]) => (
          <Link className="topic-card" href="/sheet" key={name}>
            <div className="topic-card-top">
              <strong>{name}</strong>
              <span>{pct}</span>
            </div>
            <div className="route-progress">
              <i style={{ width: pct }} />
            </div>
            <small>{done} questions solved</small>
            <span className="topic-open">Open sheet ↗</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
