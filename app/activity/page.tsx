import Link from "next/link";
export default function ActivityPage() {
  return (
    <div className="route-page">
      <header className="route-head">
        <Link href="/" className="back-link">
          ← Overview
        </Link>
        <div>
          <div className="section-kicker">CONSISTENCY OVER TIME</div>
          <h1>
            Your <em>activity.</em>
          </h1>
          <p>Every meaningful practice session adds up.</p>
        </div>
      </header>
      <div className="activity-summary">
        <div>
          <strong>7</strong>
          <span>current streak</span>
        </div>
        <div>
          <strong>12</strong>
          <span>active days</span>
        </div>
        <div>
          <strong>24</strong>
          <span>questions solved</span>
        </div>
      </div>
      <section className="route-panel">
        <h2>Last 12 weeks</h2>
        <p>Practice activity by day</p>
        <div className="route-heatmap">
          {Array.from({ length: 84 }, (_, i) => (
            <i className={`heat-cell heat-${(i * 3) % 5}`} key={i} />
          ))}
        </div>
      </section>
      <section className="route-panel">
        <h2>Recent activity</h2>
        <div className="activity-item">
          <b>Question solved</b>
          <span>Two Sum · Today</span>
        </div>
        <div className="activity-item">
          <b>Question attempted</b>
          <span>Contains Duplicate · Yesterday</span>
        </div>
        <div className="activity-item">
          <b>Notes updated</b>
          <span>Valid Anagram · Oct 16</span>
        </div>
      </section>
    </div>
  );
}
