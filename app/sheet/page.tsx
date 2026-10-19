"use client";

import { Check, ChevronDown, ChevronRight, ChevronUp, ChevronsUp, FileText, Palette, PanelTopClose, Play, Star as RotateCcw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Difficulty = "EASY" | "MEDIUM" | "HARD";
type Question = { id: string; sheetNumber: number; title: string; difficulty: Difficulty; externalUrl: string; platform: string; youtubeUrl: string | null; label: string | null; labelColor: string | null; isRevision?: boolean; prerequisite: string | null; topicId: string; subtopicId: string | null; progress?: { status: string; notes?: string | null }[] };
type Subtopic = { id: string; name: string; questions: Question[] };
type Topic = { id: string; name: string; subtopics: Subtopic[] };

export default function SheetPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");
  const [openTopics, setOpenTopics] = useState<Record<string, boolean>>({});
  const [openSubs, setOpenSubs] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [revisionIds, setRevisionIds] = useState<Set<string>>(new Set());
  const searchParams = useSearchParams();
  const revisionOnly = searchParams.get("view") === "revision";
  const [myDifficulty, setMyDifficulty] = useState<Record<string, Difficulty | null>>({});

  async function load() {
    try {
      const response = await fetch("/api/questions");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const storedColors = JSON.parse(window.localStorage.getItem("dsa-question-colors") || "{}");
      const loadedTopics = data.topics.map((topic: Topic) => ({ ...topic, subtopics: topic.subtopics.map((subtopic) => ({ ...subtopic, questions: subtopic.questions.map((question) => Object.prototype.hasOwnProperty.call(storedColors, question.id) ? { ...question, label: storedColors[question.id] ? "Colored" : null, labelColor: storedColors[question.id] || null } : question) })) }));
      setTopics(loadedTopics);
      setOpenTopics((current) => Object.keys(current).length ? current : Object.fromEntries(loadedTopics.map((topic: Topic) => [topic.id, true])));
      setOpenSubs((current) => Object.keys(current).length ? current : Object.fromEntries(loadedTopics.flatMap((topic: Topic) => topic.subtopics.slice(0, 1).map((subtopic) => [subtopic.id, true]))));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load questions"); } finally { setLoading(false); }
  }

  useEffect(() => { load(); const stored = window.localStorage.getItem("dsa-revision-ids"); if (stored) setRevisionIds(new Set(JSON.parse(stored))); const personal = window.localStorage.getItem("dsa-personal-difficulty"); if (personal) setMyDifficulty(JSON.parse(personal)); }, []);

  useEffect(() => {
    if (!revisionOnly || !topics.length) return;
    setOpenTopics(Object.fromEntries(topics.map((topic) => [topic.id, true])));
    setOpenSubs(Object.fromEntries(topics.flatMap((topic) => topic.subtopics.map((subtopic) => [subtopic.id, true]))));
  }, [revisionOnly, topics]);

  useEffect(() => {
    if (!revisionOnly) return;
    const syncVisibleRevisionGroups = () => {
      document.querySelectorAll<HTMLElement>(".curriculum-topic").forEach((topic) => {
        topic.querySelectorAll<HTMLElement>(".curriculum-subtopic").forEach((subtopic) => {
          subtopic.style.display = subtopic.querySelector(".curriculum-row") ? "" : "none";
        });
        topic.style.display = topic.querySelector(".curriculum-row") ? "" : "none";
      });
    };
    syncVisibleRevisionGroups();
    const observer = new MutationObserver(syncVisibleRevisionGroups);
    observer.observe(document.querySelector(".curriculum-list") || document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [revisionOnly, topics]);

  const questions = useMemo(() => topics.flatMap((topic) => topic.subtopics.flatMap((subtopic) => subtopic.questions)), [topics]);
  const completed = questions.filter((question) => question.progress?.some((item) => item.status === "SOLVED")).length;
  const percent = questions.length ? Math.round(completed / questions.length * 100) : 0;
  const difficultySummary = (["EASY", "MEDIUM", "HARD"] as Difficulty[]).map((level) => { const total = questions.filter((question) => question.difficulty === level).length; const solved = questions.filter((question) => question.difficulty === level && question.progress?.some((item) => item.status === "SOLVED")).length; return { level, total, solved }; });
  const matches = (question: Question) => question.title.toLowerCase().includes(query.toLowerCase()) && (difficulty === "ALL" || question.difficulty === difficulty) && (!revisionOnly || revisionIds.has(question.id));

  useEffect(() => {
    const list = document.querySelector(".curriculum-list");
    if (!list) return;
    const handleNotesClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const button = target.closest<HTMLButtonElement>(".note-action");
      const row = button?.closest<HTMLElement>(".curriculum-row");
      const title = row?.querySelector<HTMLAnchorElement>(".curriculum-title-link")?.textContent?.trim();
      const question = title ? questions.find((item) => item.title === title) : undefined;
      if (!button || !question) return;
      const currentNotes = question.progress?.[0]?.notes || "";
      const nextNotes = window.prompt("My notes", currentNotes);
      if (nextNotes !== null) void saveNotes(question, nextNotes);
    };
    list.addEventListener("click", handleNotesClick);
    return () => list.removeEventListener("click", handleNotesClick);
  }, [questions]);

  async function toggleDone(question: Question) {
    const solved = !question.progress?.some((item) => item.status === "SOLVED");
    setSaving(question.id);
    const response = await fetch("/api/questions/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: question.id, solved }) });
    if (response.ok) await load(); else setError("Could not save completion status.");
    setSaving(null);
  }

  function toggleRevision(questionId: string) {
    setRevisionIds((current) => { const next = new Set(current); if (next.has(questionId)) next.delete(questionId); else next.add(questionId); window.localStorage.setItem("dsa-revision-ids", JSON.stringify([...next])); return next; });
  }

  function cycleMyDifficulty(questionId: string) {
    setMyDifficulty((current) => { const values: Array<Difficulty | null> = [null, "EASY", "MEDIUM", "HARD"]; const next = values[(values.indexOf(current[questionId] || null) + 1) % values.length]; const updated = { ...current, [questionId]: next }; window.localStorage.setItem("dsa-personal-difficulty", JSON.stringify(updated)); return updated; });
  }

  async function saveNotes(question: Question, notes: string) {
    const solved = question.progress?.some((item) => item.status === "SOLVED") || false;
    const response = await fetch("/api/questions/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: question.id, solved, notes: notes.trim() || null }) });
    if (response.ok) await load(); else setError("Could not save your notes.");
  }

  async function updateQuestion(questionId: string, data: { label?: string | null; labelColor?: string | null }) {
    if ("labelColor" in data) {
      const storedColors = JSON.parse(window.localStorage.getItem("dsa-question-colors") || "{}");
      storedColors[questionId] = data.labelColor || null;
      window.localStorage.setItem("dsa-question-colors", JSON.stringify(storedColors));
      setTopics((current) => current.map((topic) => ({ ...topic, subtopics: topic.subtopics.map((subtopic) => ({ ...subtopic, questions: subtopic.questions.map((question) => question.id === questionId ? { ...question, label: data.label ?? question.label, labelColor: data.labelColor ?? null } : question) })) })));
    }
    const response = await fetch("/api/questions", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: questionId, data }) });
    if (response.ok) await load(); else setError("Could not update this question.");
  }

  function cycleColor(question: Question) {
    document.querySelector(".question-color-menu")?.remove();
    const row = [...document.querySelectorAll<HTMLElement>(".curriculum-row")].find((item) => item.querySelector(".curriculum-title-link")?.textContent?.trim() === question.title);
    const trigger = row?.querySelector<HTMLElement>(".color-action");
    if (!trigger) return;
    const palette = [
      ["Red", "#d9534f"],
      ["Orange", "#e58b2c"],
      ["Yellow", "#e5c54a"],
      ["Light green", "#8acb9c"],
      ["Green", "#0b9f72"],
      ["Remove colour", ""],
    ];
    const menu = document.createElement("div");
    menu.className = "question-color-menu";
    menu.setAttribute("role", "menu");
    menu.innerHTML = palette.map(([name, value]) => `<button type="button" role="menuitem" data-color="${value}" aria-label="${name}"><i style="background:${value || "transparent"}"></i><span>${name}</span></button>`).join("");
    const rect = trigger.getBoundingClientRect();
    menu.style.left = `${Math.max(8, rect.right - 156)}px`;
    menu.style.top = `${rect.bottom + 6}px`;
    menu.querySelectorAll<HTMLButtonElement>("button").forEach((button) => button.addEventListener("click", () => {
      const color = button.dataset.color || null;
      void updateQuestion(question.id, { label: color ? "Colored" : null, labelColor: color });
      menu.remove();
    }));
    const close = (event: PointerEvent) => {
      if (!menu.contains(event.target as Node) && event.target !== trigger) {
        menu.remove();
        document.removeEventListener("pointerdown", close);
      }
    };
    document.body.appendChild(menu);
    document.addEventListener("pointerdown", close);
  }

  function collapseAll() { setOpenTopics({}); setOpenSubs({}); }
  function scrollToTop() { window.scrollTo({ top: 0, behavior: "smooth" }); }

  return <div className="route-page">
    <header className="route-head sheet-table-hero"><div><div className="section-kicker">STRIVER A2Z CURRICULUM</div><h1>DSA Sheet</h1><p>Work through every topic in order. Mark a problem complete when you solve it.</p></div><div className="progress-summary"><div className="progress-gauge" style={{ background: `conic-gradient(#12a579 0 ${percent * 3.6}deg, #e6eee9 ${percent * 3.6}deg 360deg)` }}><div><strong>{percent}%</strong><span>done</span></div></div><div className="progress-breakdown"><div className="progress-total"><strong>{completed}</strong><span>/ {questions.length} solved</span></div>{difficultySummary.map((item) => <div className={`progress-level ${item.level.toLowerCase()}`} key={item.level}><i /> <span>{item.level === "MEDIUM" ? "Med." : item.level[0] + item.level.slice(1).toLowerCase()}</span><strong>{item.solved}/{item.total}</strong></div>)}</div></div></header>
    <div className="sheet-actions"><div className="route-search">⌕<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search questions..." /></div><div className="filter-group">{["ALL", "EASY", "MEDIUM", "HARD"].map((value) => <button key={value} className={difficulty === value ? "filter-active" : ""} onClick={() => setDifficulty(value)}>{value === "ALL" ? "All levels" : value}</button>)}</div></div>
    {error && <div className="route-panel error-panel">{error}</div>}{loading && <div className="route-panel">Loading your saved sheet…</div>}
    {!loading && !error && <div className="curriculum-list">{topics.map((topic) => { const topicQuestions = topic.subtopics.flatMap((subtopic) => subtopic.questions).filter(matches); const topicDone = topicQuestions.filter((question) => question.progress?.some((item) => item.status === "SOLVED")).length; const topicPercent = topicQuestions.length ? Math.round(topicDone / topicQuestions.length * 100) : 0; return <section className="curriculum-topic" key={topic.id}><button className="curriculum-topic-head" onClick={() => setOpenTopics((current) => ({ ...current, [topic.id]: !current[topic.id] }))}><span className="topic-toggle">{openTopics[topic.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</span><span className="curriculum-topic-title">{topic.name}</span><span className="topic-progress-badge">{topicPercent}% Done</span><span className="topic-progress-copy">Progress: <strong>{topicDone}</strong> / {topicQuestions.length} completed</span><span className="topic-progress-track"><i style={{ width: `${topicPercent}%` }} /></span><span className="topic-more" aria-hidden="true">{openTopics[topic.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span></button>{openTopics[topic.id] && <div className="curriculum-subtopics">{topic.subtopics.map((subtopic) => { const visible = subtopic.questions.filter(matches); const subDone = visible.filter((question) => question.progress?.some((item) => item.status === "SOLVED")).length; return <div className="curriculum-subtopic" key={subtopic.id}><button className="curriculum-subtopic-head" onClick={() => setOpenSubs((current) => ({ ...current, [subtopic.id]: !current[subtopic.id] }))}><span className="subtopic-dot" /><span>{subtopic.name}</span><small>{visible.length} problems</small><strong>{subDone} Solved ({visible.length ? Math.round(subDone / visible.length * 100) : 0}%)</strong><span className="subtopic-toggle">{openSubs[subtopic.id] ? <ChevronDown size={16} /> : <ChevronDown size={16} />}</span></button>{openSubs[subtopic.id] && <div className="curriculum-table-wrap"><div className="curriculum-table-head"><span>STATUS</span><span>#</span><span>QUESTION</span><span>DIFFICULTY</span><span>MY DIFFICULTY</span><span>VIDEO</span><span>MY NOTES</span><span>REVISION</span><span>COLOUR</span></div>{visible.map((question) => { const done = question.progress?.some((item) => item.status === "SOLVED"); const hasLeetCode = question.platform === "LeetCode"; return <div className={`curriculum-row ${done ? "is-done" : ""} ${revisionIds.has(question.id) ? "is-revision" : ""}`} key={question.id} style={question.labelColor ? { borderLeft: `3px solid ${question.labelColor}` } : undefined}><button className={`status-checkbox ${done ? "checked" : ""}`} disabled={saving === question.id} onClick={() => toggleDone(question)} aria-label={done ? "Mark as not done" : "Mark as done"}>{done && <Check size={15} strokeWidth={3} />}</button><span className="row-number">{String(question.sheetNumber).padStart(2, "0")}</span><div className="curriculum-title">{hasLeetCode && <img className="leetcode-logo" src="https://assets.leetcode.com/static_assets/public/icons/favicon-32x32.png" alt="LeetCode" />}<a href={question.externalUrl} target="_blank" rel="noreferrer" className="curriculum-title-link">{question.title}</a></div><span className={`difficulty-pill ${question.difficulty.toLowerCase()}`}>{question.difficulty}</span><button className={`personal-difficulty ${myDifficulty[question.id]?.toLowerCase() || "unset"}`} onClick={() => cycleMyDifficulty(question.id)} aria-label="Set my difficulty">{myDifficulty[question.id] || "-"}</button>{question.youtubeUrl ? <a className="video-link" href={question.youtubeUrl} target="_blank" rel="noreferrer" aria-label="Open YouTube video"><Play size={12} fill="currentColor" />Video</a> : <span className="video-unavailable">—</span>}<button className="note-action" aria-label="My notes"><FileText size={16} /></button><button aria-label={revisionIds.has(question.id) ? "Remove from revision" : "Add to revision"} className={revisionIds.has(question.id) ? "row-action-active revision-action" : "revision-action"} onClick={() => toggleRevision(question.id)}><RotateCcw size={16} /></button><button aria-label="Color question" className={question.labelColor ? "row-action-active color-action" : "color-action"} onClick={() => cycleColor(question)}><Palette size={16} /></button></div>; })}</div>}</div>; })}</div>}</section>; })}</div>}
    <div className="sheet-utilities" aria-label="Sheet navigation tools"><button type="button" onClick={collapseAll} aria-label="Collapse all topics" title="Collapse all topics"><PanelTopClose size={17} /></button><button type="button" onClick={scrollToTop} aria-label="Scroll to top" title="Scroll to top"><ChevronsUp size={18} /></button></div>
  </div>;
}


