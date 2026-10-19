"use client";

import { useMemo, useState } from "react";
import ThemeToggle from "@/components/theme-toggle";
type IconProps = { size?: number; strokeWidth?: number; className?: string };
const makeIcon = (label: string) => ({ size = 16, className }: IconProps) => <span aria-hidden="true" className={className} style={{ fontSize: size * 0.78, lineHeight: 1 }}>{label}</span>;
const Activity = makeIcon("◌"); const ArrowUpRight = makeIcon("↗"); const BarChart3 = makeIcon("▥"); const BookOpen = makeIcon("▤"); const Check = makeIcon("✓"); const ChevronDown = makeIcon("⌄"); const ChevronRight = makeIcon("›"); const Circle = makeIcon("○"); const Code2 = makeIcon("⌘"); const Flame = makeIcon("♨"); const LayoutDashboard = makeIcon("▦"); const ListChecks = makeIcon("☑"); const Menu = makeIcon("☰"); const Moon = makeIcon("◐"); const MoreHorizontal = makeIcon("•••"); const Search = makeIcon("⌕"); const Settings = makeIcon("⚙"); const SlidersHorizontal = makeIcon("☷"); const Sparkles = makeIcon("✦"); const Target = makeIcon("◎");

type Status = "Not started" | "In progress" | "Solved";
type Difficulty = "Easy" | "Medium" | "Hard";
type Question = {
  id: number;
  title: string;
  topic: string;
  difficulty: Difficulty;
  platform: string;
  status: Status;
  notes?: boolean;
};

const starterQuestions: Question[] = [
  {
    id: 1,
    title: "Two Sum",
    topic: "Arrays",
    difficulty: "Easy",
    platform: "LeetCode",
    status: "Solved",
    notes: true,
  },
  {
    id: 2,
    title: "Best Time to Buy and Sell Stock",
    topic: "Arrays",
    difficulty: "Easy",
    platform: "LeetCode",
    status: "Solved",
  },
  {
    id: 3,
    title: "Contains Duplicate",
    topic: "Arrays",
    difficulty: "Easy",
    platform: "LeetCode",
    status: "In progress",
  },
  {
    id: 4,
    title: "Product of Array Except Self",
    topic: "Arrays",
    difficulty: "Medium",
    platform: "LeetCode",
    status: "Not started",
  },
  {
    id: 5,
    title: "Valid Anagram",
    topic: "Strings",
    difficulty: "Easy",
    platform: "LeetCode",
    status: "Solved",
  },
  {
    id: 6,
    title: "Longest Substring Without Repeating Characters",
    topic: "Strings",
    difficulty: "Medium",
    platform: "LeetCode",
    status: "In progress",
  },
  {
    id: 7,
    title: "Valid Parentheses",
    topic: "Stack",
    difficulty: "Easy",
    platform: "LeetCode",
    status: "Solved",
  },
  {
    id: 8,
    title: "Binary Search",
    topic: "Binary Search",
    difficulty: "Easy",
    platform: "LeetCode",
    status: "Not started",
  },
  {
    id: 9,
    title: "Number of Islands",
    topic: "Graphs",
    difficulty: "Medium",
    platform: "LeetCode",
    status: "Not started",
  },
  {
    id: 10,
    title: "Climbing Stairs",
    topic: "Dynamic Programming",
    difficulty: "Easy",
    platform: "LeetCode",
    status: "Solved",
  },
];
const nav = [
  { label: "DSA Sheet", icon: ListChecks },
  { label: "Profile", icon: LayoutDashboard },
];

function StatusIcon({ status }: { status: Status }) {
  if (status === "Solved")
    return (
      <span className="status-icon solved">
        <Check size={13} strokeWidth={3} />
      </span>
    );
  if (status === "In progress")
    return (
      <span className="status-icon progress">
        <span />
      </span>
    );
  return (
    <span className="status-icon">
      <Circle size={14} />
    </span>
  );
}

export default function Home() {
  const [active, setActive] = useState("Profile");
  const [questions, setQuestions] = useState(starterQuestions);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | Status>("All");
  const [expanded, setExpanded] = useState<string[]>(["Arrays", "Strings"]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const solved = questions.filter((q) => q.status === "Solved").length;
  const inProgress = questions.filter((q) => q.status === "In progress").length;
  const filtered = useMemo(
    () =>
      questions.filter(
        (q) =>
          q.title.toLowerCase().includes(query.toLowerCase()) &&
          (filter === "All" || q.status === filter),
      ),
    [questions, query, filter],
  );
  const topics = [...new Set(filtered.map((q) => q.topic))];
  const toggleStatus = (id: number) =>
    setQuestions((items) =>
      items.map((q) =>
        q.id === id
          ? { ...q, status: q.status === "Solved" ? "Not started" : "Solved" }
          : q,
      ),
    );
  const toggleTopic = (topic: string) =>
    setExpanded((items) =>
      items.includes(topic)
        ? items.filter((x) => x !== topic)
        : [...items, topic],
    );
  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Code2 size={17} />
          </div>
          <span>
            DSA<span className="brand-muted">/</span>track
          </span>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {nav.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${active === label ? "active" : ""}`}
                onClick={() => {
                  setSidebarOpen(false);
                  if (label === "DSA Sheet") window.location.assign("/sheet");
                  else setActive(label);
                }}
            >
              <Icon size={17} />
              <span>{label}</span>
              {label === "Activity" && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <Sparkles size={15} />
            <div>
              <strong>Keep the momentum</strong>
              <span>7 day streak — nice work!</span>
            </div>
          </div>
          <div className="user-row">
            <div className="avatar">AS</div>
            <div className="user-copy">
              <strong>Arjun Sharma</strong>
              <span>Personal workspace</span>
            </div>
            <MoreHorizontal size={18} className="muted-icon" />
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={20} />
          </button>
          <div>
            <div className="eyebrow">SATURDAY, OCTOBER 18, 2026</div>
            <h1>{active === "Profile" ? "Good morning, Arjun" : active}</h1>
          </div>
          <div className="top-actions">
            <button className="icon-button">
              <Search size={18} />
            </button>
            <ThemeToggle />
            <div className="top-avatar">AS</div>
          </div>
        </header>
        {active === "Profile" ? (
          <>
            <section className="hero-row">
              <div>
                <div className="section-kicker">
                  <span className="live-dot" /> YOUR PROGRESS
                </div>
                <h2>
                  Small steps. <em>Big momentum.</em>
                </h2>
                <p className="hero-copy">
                  Stay consistent and turn your daily practice into lasting
                  skill.
                </p>
              </div>
              <button
                className="primary-button"
                onClick={() => window.location.assign("/sheet")}
              >
                <Target size={16} /> Continue practicing{" "}
                <ArrowUpRight size={16} />
              </button>
            </section>
            <section className="stats-grid">
              <StatCard
                label="Questions solved"
                value={solved.toString()}
                meta="of 10 total questions"
                icon={<Check size={17} />}
                accent="green"
              />
              <StatCard
                label="Current streak"
                value="7 days"
                meta="Your best is 12 days"
                icon={<Flame size={17} />}
                accent="orange"
              />
              <StatCard
                label="This week"
                value="12"
                meta="questions practiced"
                icon={<BarChart3 size={17} />}
                accent="purple"
              />
              <StatCard
                label="Completion"
                value={`${Math.round((solved / questions.length) * 100)}%`}
                meta="+8% from last week"
                icon={<Target size={17} />}
                accent="blue"
              />
            </section>
            <section className="content-grid">
              <div className="panel activity-panel">
                <div className="panel-head">
                  <div>
                    <div className="panel-title">Practice activity</div>
                    <div className="panel-subtitle">
                      Your activity over the last 12 weeks
                    </div>
                  </div>
                  <button className="ghost-button">
                    Last 12 weeks <ChevronDown size={14} />
                  </button>
                </div>
                <div className="heatmap">
                  {Array.from({ length: 84 }, (_, i) => (
                    <span
                      key={i}
                      className={`heat-cell heat-${[0, 0, 1, 1, 2, 3, 4][(i * 7 + (i % 11)) % 7]}`}
                    />
                  ))}
                </div>
                <div className="heat-labels">
                  <span>Jul 27</span>
                  <span>Aug 17</span>
                  <span>Sep 7</span>
                  <span>Sep 28</span>
                  <span>Oct 18</span>
                </div>
                <div className="legend">
                  <span>Less</span>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <i key={i} className={`heat-cell heat-${i}`} />
                  ))}
                  <span>More</span>
                </div>
              </div>
              <div className="panel focus-panel">
                <div className="panel-title">Focus for today</div>
                <div className="panel-subtitle">Pick up where you left off</div>
                <div className="focus-ring">
                  <div>
                    <strong>{inProgress}</strong>
                    <span>in progress</span>
                  </div>
                </div>
                <div className="focus-stat">
                  <span className="tiny-dot green-dot" /> 3 solved today
                </div>
                <div className="focus-stat">
                  <span className="tiny-dot purple-dot" /> 42 min practiced
                </div>
                <button
                  className="outline-button"
                  onClick={() => window.location.assign("/sheet")}
                >
                  View sheet <ArrowUpRight size={14} />
                </button>
              </div>
            </section>
            <section className="bottom-grid">
              <div className="panel recent-panel">
                <div className="panel-head">
                  <div>
                    <div className="panel-title">Continue practicing</div>
                    <div className="panel-subtitle">
                      A few questions waiting for you
                    </div>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => window.location.assign("/sheet")}
                  >
                    View all <ArrowUpRight size={14} />
                  </button>
                </div>
                {questions
                  .filter((q) => q.status !== "Solved")
                  .slice(0, 4)
                  .map((q) => (
                    <QuestionMini
                      key={q.id}
                      question={q}
                      onToggle={() => toggleStatus(q.id)}
                    />
                  ))}
              </div>
              <div className="panel distribution-panel">
                <div className="panel-title">Difficulty breakdown</div>
                <div className="panel-subtitle">
                  Solved questions by difficulty
                </div>
                <div className="bars">
                  {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d, i) => {
                    const count = questions.filter(
                      (q) => q.difficulty === d && q.status === "Solved",
                    ).length;
                    return (
                      <div className="bar-row" key={d}>
                        <span>{d}</span>
                        <div className="bar-track">
                          <div
                            className={`bar-fill b-${i}`}
                            style={{
                              width: `${Math.max(12, (count / 4) * 100)}%`,
                            }}
                          />
                        </div>
                        <strong>{count}</strong>
                      </div>
                    );
                  })}
                </div>
                <div className="total-solved">
                  <strong>{solved}</strong>
                  <span>solved overall</span>
                </div>
              </div>
            </section>
          </>
        ) : (
          <SheetView
            questions={filtered}
            topics={topics}
            expanded={expanded}
            query={query}
            setQuery={setQuery}
            filter={filter}
            setFilter={setFilter}
            toggleTopic={toggleTopic}
            toggleStatus={toggleStatus}
          />
        )}
      </main>
    </div>
  );
}
function StatCard({
  label,
  value,
  meta,
  icon,
  accent,
}: {
  label: string;
  value: string;
  meta: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${accent}`}>{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-meta">{meta}</div>
    </div>
  );
}
function QuestionMini({
  question,
  onToggle,
}: {
  question: Question;
  onToggle: () => void;
}) {
  return (
    <div className="question-mini">
      <button onClick={onToggle} className="check-button">
        <StatusIcon status={question.status} />
      </button>
      <div className="question-mini-copy">
        <strong>{question.title}</strong>
        <span>{question.topic}</span>
      </div>
      <span className={`difficulty ${question.difficulty.toLowerCase()}`}>
        {question.difficulty}
      </span>
      <ArrowUpRight size={15} className="muted-icon" />
    </div>
  );
}
function SheetView({
  questions,
  topics,
  expanded,
  query,
  setQuery,
  filter,
  setFilter,
  toggleTopic,
  toggleStatus,
}: {
  questions: Question[];
  topics: string[];
  expanded: string[];
  query: string;
  setQuery: (v: string) => void;
  filter: "All" | Status;
  setFilter: (v: "All" | Status) => void;
  toggleTopic: (v: string) => void;
  toggleStatus: (id: number) => void;
}) {
  return (
    <div className="sheet-view">
      <section className="sheet-hero">
        <div>
          <div className="section-kicker">
            <ListChecks size={14} /> PRACTICE SHEET
          </div>
          <h2>
            Build your <em>edge.</em>
          </h2>
          <p className="hero-copy">One question at a time. Keep showing up.</p>
        </div>
        <div className="sheet-progress">
          <strong>
            {questions.filter((q) => q.status === "Solved").length}
            <span>/ {questions.length}</span>
          </strong>
          <div className="progress-track">
            <div
              style={{
                width: `${questions.length ? (questions.filter((q) => q.status === "Solved").length / questions.length) * 100 : 0}%`,
              }}
            />
          </div>
          <small>questions solved</small>
        </div>
      </section>
      <div className="toolbar">
        <div className="search-box">
          <Search size={17} />
          <input
            placeholder="Search questions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="filter-pills">
          <SlidersHorizontal size={15} />
          {(["All", "Not started", "In progress", "Solved"] as const).map(
            (f) => (
              <button
                key={f}
                className={filter === f ? "selected" : ""}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ),
          )}
        </div>
      </div>
      <div className="sheet-list">
        {topics.length ? (
          topics.map((topic) => (
            <div className="topic-block" key={topic}>
              <button className="topic-head" onClick={() => toggleTopic(topic)}>
                {expanded.includes(topic) ? (
                  <ChevronDown size={17} />
                ) : (
                  <ChevronRight size={17} />
                )}
                <span className="topic-name">{topic}</span>
                <span className="topic-count">
                  {
                    questions.filter(
                      (q) => q.topic === topic && q.status === "Solved",
                    ).length
                  }
                  /{questions.filter((q) => q.topic === topic).length}
                </span>
                <div className="topic-line">
                  <div
                    style={{
                      width: `${(questions.filter((q) => q.topic === topic && q.status === "Solved").length / questions.filter((q) => q.topic === topic).length) * 100}%`,
                    }}
                  />
                </div>
              </button>
              {expanded.includes(topic) && (
                <div className="topic-questions">
                  {questions
                    .filter((q) => q.topic === topic)
                    .map((q) => (
                      <div className="sheet-row" key={q.id}>
                        <button
                          onClick={() => toggleStatus(q.id)}
                          className="check-button"
                        >
                          <StatusIcon status={q.status} />
                        </button>
                        <span className="sheet-title">{q.title}</span>
                        <span
                          className={`difficulty ${q.difficulty.toLowerCase()}`}
                        >
                          {q.difficulty}
                        </span>
                        <span className="platform">{q.platform}</span>
                        {q.notes && <span className="note-pill">note</span>}
                        <a
                          href="https://leetcode.com"
                          target="_blank"
                          rel="noreferrer"
                          className="open-link"
                        >
                          Open <ArrowUpRight size={14} />
                        </a>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Search size={22} />
            <strong>No questions found</strong>
            <span>Try a different search or filter.</span>
          </div>
        )}
      </div>
    </div>
  );
}
