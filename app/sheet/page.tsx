"use client";

import { Bold, Check, ChevronDown, ChevronRight, ChevronUp, ChevronsUp, Code2, Eye, FilePenLine, FileText, Italic, List, Palette, PanelTopClose, PanelTopOpen, Search, Star as RotateCcw, X } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import SheetSkeleton from "@/components/sheet-skeleton";

type Difficulty = "EASY" | "MEDIUM" | "HARD";
type PlatformLinks = { youtube?: string | null; leetcode?: string | null; gfg?: string | null; codingninjas?: string | null };
type Question = { id: string; sheetNumber: number; title: string; difficulty: Difficulty; externalUrl: string; platform: string; platformLinks?: PlatformLinks | null; youtubeUrl: string | null; label: string | null; labelColor: string | null; prerequisite: string | null; topicId: string; subtopicId: string | null; progress?: { status: string; notes?: string | null }[] };
function linksForQuestion(question: Question): PlatformLinks {
  const links = { ...(question.platformLinks || {}) };
  if (!links.leetcode && (question.platform === "LeetCode" || question.externalUrl.includes("leetcode.com"))) links.leetcode = question.externalUrl;
  if (!links.gfg && (question.platform === "GeeksforGeeks" || question.externalUrl.includes("geeksforgeeks.org"))) links.gfg = question.externalUrl;
  if (!links.codingninjas && (question.platform === "Coding Ninjas" || question.externalUrl.includes("codingninjas.com"))) links.codingninjas = question.externalUrl;
  return links;
}
function PlatformCell({ href, label, icon }: { href?: string | null; label: string; icon: string }) {
  return href ? <a className="platform-cell" href={href} target="_blank" rel="noreferrer" aria-label={`Open ${label}`} title={label}><img src={`/platforms/${icon}`} alt={label} /></a> : <span className="platform-cell platform-cell-empty">—</span>;
}
type Subtopic = { id: string; name: string; questions: Question[] };
type Topic = { id: string; name: string; subtopics: Subtopic[] };
type SessionUser = { name: string; email: string | null; image: string | null };

function renderInlineNote(value: string): ReactNode[] {
  const parts = value.split(/(\*\*[^*]+\*\*|_[^_]+_|`[^`]+`)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("_") && part.endsWith("_")) return <em key={index}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    return <span key={index}>{part}</span>;
  });
}

function renderFormattedNote(value: string): ReactNode {
  return value.split("\n").map((line, index) => {
    const bullet = line.match(/^\s*-\s+(.*)$/);
    return <div className={bullet ? "note-preview-bullet" : "note-preview-line"} key={index}>{bullet ? <><span>•</span>{renderInlineNote(bullet[1])}</> : renderInlineNote(line)}</div>;
  });
}

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
  const [revisionOnly, setRevisionOnly] = useState(false);
  const [myDifficulty, setMyDifficulty] = useState<Record<string, Difficulty | null>>({});
  const [user, setUser] = useState<SessionUser | null>(null);
  const [noteQuestion, setNoteQuestion] = useState<Question | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [notePreview, setNotePreview] = useState(false);
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" }).then((response) => response.json()).then((data: { user: SessionUser | null }) => setUser(data.user)).catch(() => setUser(null));
    load();
    const stored = window.localStorage.getItem("dsa-revision-ids");
    if (stored) setRevisionIds(new Set(JSON.parse(stored)));
    const personal = window.localStorage.getItem("dsa-personal-difficulty");
    if (personal) setMyDifficulty(JSON.parse(personal));
    const syncRevisionView = () => setRevisionOnly(window.location.pathname === "/revise" || new URLSearchParams(window.location.search).get("view") === "revision");
    syncRevisionView();
    window.addEventListener("dsa-route-change", syncRevisionView);
    window.addEventListener("popstate", syncRevisionView);
    return () => {
      window.removeEventListener("dsa-route-change", syncRevisionView);
      window.removeEventListener("popstate", syncRevisionView);
    };
  }, []);

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
  const subtopicCount = topics.reduce((count, topic) => count + topic.subtopics.length, 0);
  const difficultySummary = (["EASY", "MEDIUM", "HARD"] as Difficulty[]).map((level) => { const total = questions.filter((question) => question.difficulty === level).length; const solved = questions.filter((question) => question.difficulty === level && question.progress?.some((item) => item.status === "SOLVED")).length; return { level, total, solved }; });
  const matches = (question: Question) => question.title.toLowerCase().includes(query.toLowerCase()) && (difficulty === "ALL" || question.difficulty === difficulty) && (!revisionOnly || revisionIds.has(question.id));
  const canEdit = Boolean(user);

  useEffect(() => {
    const paintRows = () => {
      document.querySelectorAll<HTMLElement>(".curriculum-row").forEach((row) => {
        const title = row.querySelector<HTMLAnchorElement>(".curriculum-title-link")?.textContent?.trim();
        const question = title ? questions.find((item) => item.title === title) : undefined;
        if (question?.labelColor) {
          row.style.setProperty("background", `color-mix(in srgb, ${question.labelColor} 18%, #ffffff)`, "important");
        } else {
          row.style.removeProperty("background");
        }
      });
    };
    paintRows();
    const observer = new MutationObserver(paintRows);
    observer.observe(document.querySelector(".curriculum-list") || document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [questions, query, difficulty, revisionOnly, openTopics, openSubs]);

  async function toggleDone(question: Question) {
    if (!user) return;
    const solved = !question.progress?.some((item) => item.status === "SOLVED");
    setSaving(question.id);
    const response = await fetch("/api/questions/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: question.id, solved }) });
    if (response.ok) await load(); else setError("Could not save completion status.");
    setSaving(null);
  }

  function toggleRevision(questionId: string) {
    if (!user) return;
    setRevisionIds((current) => { const next = new Set(current); if (next.has(questionId)) next.delete(questionId); else next.add(questionId); window.localStorage.setItem("dsa-revision-ids", JSON.stringify([...next])); return next; });
  }

  function cycleMyDifficulty(questionId: string) {
    if (!user) return;
    setMyDifficulty((current) => { const values: Array<Difficulty | null> = [null, "EASY", "MEDIUM", "HARD"]; const next = values[(values.indexOf(current[questionId] || null) + 1) % values.length]; const updated = { ...current, [questionId]: next }; window.localStorage.setItem("dsa-personal-difficulty", JSON.stringify(updated)); return updated; });
  }

  async function saveNotes(question: Question, notes: string) {
    if (!user) return;
    setNoteSaving(true);
    const solved = question.progress?.some((item) => item.status === "SOLVED") || false;
    const response = await fetch("/api/questions/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: question.id, solved, notes: notes.trim() || null }) });
    if (response.ok) { await load(); setNoteQuestion(null); } else setError("Could not save your notes.");
    setNoteSaving(false);
  }

  function openNotes(question: Question) {
    if (!user) return;
    setNoteQuestion(question);
    setNoteDraft(question.progress?.[0]?.notes || "");
    setNotePreview(false);
  }

  function formatNote(before: string, after = before) {
    const textarea = noteTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = noteDraft.slice(start, end) || "text";
    const next = `${noteDraft.slice(0, start)}${before}${selected}${after}${noteDraft.slice(end)}`;
    setNoteDraft(next);
    requestAnimationFrame(() => { textarea.focus(); const cursor = start + before.length + selected.length + after.length; textarea.setSelectionRange(cursor, cursor); });
  }

  function addBullet() {
    const textarea = noteTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const lineStart = noteDraft.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const next = `${noteDraft.slice(0, lineStart)}- ${noteDraft.slice(lineStart)}`;
    setNoteDraft(next);
    requestAnimationFrame(() => { textarea.focus(); textarea.setSelectionRange(start + 2, start + 2); });
  }

  async function updateQuestion(questionId: string, data: { label?: string | null; labelColor?: string | null }) {
    if (!user) return;
    if ("labelColor" in data) {
      const storedColors = JSON.parse(window.localStorage.getItem("dsa-question-colors") || "{}");
      storedColors[questionId] = data.labelColor || null;
      window.localStorage.setItem("dsa-question-colors", JSON.stringify(storedColors));
      setTopics((current) => current.map((topic) => ({ ...topic, subtopics: topic.subtopics.map((subtopic) => ({ ...subtopic, questions: subtopic.questions.map((question) => question.id === questionId ? { ...question, label: data.label ?? question.label, labelColor: data.labelColor ?? null } : question) })) })));
    }
    setTopics((current) => current.map((topic) => ({ ...topic, subtopics: topic.subtopics.map((subtopic) => ({ ...subtopic, questions: subtopic.questions.map((question) => question.id === questionId ? { ...question, ...data } : question) })) })));
  }

  function cycleColor(question: Question) {
    if (!user) return;
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
      if (row) {
        if (color) row.style.setProperty("background", `color-mix(in srgb, ${color} 18%, #ffffff)`, "important");
        else row.style.removeProperty("background");
      }
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
  function openAllSubtopics() {
    setOpenTopics(Object.fromEntries(topics.map((topic) => [topic.id, true])));
    // Keep every question table closed; only the subtopic headers are shown.
    setOpenSubs({});
  }
  function scrollToTop() { window.scrollTo({ top: 0, behavior: "smooth" }); }

  return <div className="sheet-page-shell"><div className="route-page">
    <header className="route-head sheet-table-hero"><div><div className="section-kicker">STRIVER A2Z CURRICULUM</div><h1>DSA Sheet</h1><p>Work through every topic in order. Mark a problem complete when you solve it.</p></div><div className="progress-summary"><div className="progress-gauge" style={{ background: `conic-gradient(#12a579 0 ${percent * 3.6}deg, #e6eee9 ${percent * 3.6}deg 360deg)` }}><div><strong>{percent}%</strong><span>done</span></div></div><div className="progress-breakdown"><div className="progress-total"><strong>{completed}</strong><span>/ {questions.length} solved</span></div>{difficultySummary.map((item) => <div className={`progress-level ${item.level.toLowerCase()}`} key={item.level}><i /> <span>{item.level === "MEDIUM" ? "Med." : item.level[0] + item.level.slice(1).toLowerCase()}</span><strong>{item.solved}/{item.total}</strong></div>)}</div></div></header>
    <div className="sheet-actions"><label className="route-search"><Search className="route-search-icon" size={15} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search questions..." aria-label="Search questions" /></label><div className="filter-group">{["ALL", "EASY", "MEDIUM", "HARD"].map((value) => <button key={value} className={difficulty === value ? "filter-active" : ""} onClick={() => setDifficulty(value)}>{value === "ALL" ? "All levels" : value}</button>)}</div></div>
    {error && <div className="route-panel error-panel">{error}</div>}{loading && <SheetSkeleton />}
    {!loading && !error && <div className="curriculum-list">{topics.map((topic) => { const topicQuestions = topic.subtopics.flatMap((subtopic) => subtopic.questions).filter(matches); const topicDone = topicQuestions.filter((question) => question.progress?.some((item) => item.status === "SOLVED")).length; const topicPercent = topicQuestions.length ? Math.round(topicDone / topicQuestions.length * 100) : 0; return <section className="curriculum-topic" key={topic.id}><button className="curriculum-topic-head" onClick={() => setOpenTopics((current) => ({ ...current, [topic.id]: !current[topic.id] }))}><span className="topic-toggle">{openTopics[topic.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</span><span className="curriculum-topic-title">{topic.name}</span><span className="topic-progress-badge">{topicPercent}% Done</span><span className="topic-progress-copy">Progress: <strong>{topicDone}</strong> / {topicQuestions.length} completed</span><span className="topic-progress-track"><i style={{ width: `${topicPercent}%` }} /></span><span className="topic-more" aria-hidden="true">{openTopics[topic.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span></button>{openTopics[topic.id] && <div className="curriculum-subtopics">{topic.subtopics.map((subtopic) => { const visible = subtopic.questions.filter(matches); const subDone = visible.filter((question) => question.progress?.some((item) => item.status === "SOLVED")).length; return <div className="curriculum-subtopic" key={subtopic.id}><button className="curriculum-subtopic-head" onClick={() => setOpenSubs((current) => ({ ...current, [subtopic.id]: !current[subtopic.id] }))}><span className="subtopic-dot" /><span>{subtopic.name}</span><small>{visible.length} problems</small><strong>{subDone} Solved ({visible.length ? Math.round(subDone / visible.length * 100) : 0}%)</strong><span className="subtopic-toggle">{openSubs[subtopic.id] ? <ChevronDown size={16} /> : <ChevronDown size={16} />}</span></button>{openSubs[subtopic.id] && <div className="curriculum-table-wrap"><div className="curriculum-table-head"><span>STATUS</span><span>QUESTION</span><span>LC</span><span>GFG</span><span>CN</span><span>DIFFICULTY</span><span>MY DIFF</span><span>VIDEO</span><span>NOTES</span><span>REV</span><span>COLOR</span></div>{visible.map((question) => { const done = question.progress?.some((item) => item.status === "SOLVED"); const platformLinks = linksForQuestion(question); const hasNote = Boolean(question.progress?.[0]?.notes?.trim()); return <div className={`curriculum-row ${done ? "is-done" : ""} ${revisionIds.has(question.id) ? "is-revision" : ""}`} key={question.id} style={question.labelColor ? { borderLeft: `3px solid ${question.labelColor}` } : undefined}><button className={`status-checkbox ${done ? "checked" : ""}`} disabled={saving === question.id} onClick={() => toggleDone(question)} aria-label={done ? "Mark as not done" : "Mark as done"}>{done && <Check size={15} strokeWidth={3} />}</button><div className="curriculum-title"><a href={question.externalUrl} target="_blank" rel="noreferrer" className="curriculum-title-link">{question.title}</a></div><PlatformCell href={platformLinks.leetcode} label="LeetCode" icon="leetcode.svg" /><PlatformCell href={platformLinks.gfg} label="GeeksforGeeks" icon="geeksforgeeks.svg" /><PlatformCell href={platformLinks.codingninjas} label="Coding Ninjas" icon="codingninjas.svg" /><span className={`difficulty-pill ${question.difficulty.toLowerCase()}`}>{question.difficulty}</span><button className={`personal-difficulty ${myDifficulty[question.id]?.toLowerCase() || "unset"}`} onClick={() => cycleMyDifficulty(question.id)} aria-label="Set my difficulty">{myDifficulty[question.id] || "-"}</button>{question.youtubeUrl ? <a className="video-link platform-video-link" href={question.youtubeUrl} target="_blank" rel="noreferrer" aria-label="Open YouTube video" title="YouTube"><img src="/platforms/youtube.svg" alt="YouTube" /></a> : <span className="video-unavailable">—</span>}<button className={`note-action ${hasNote ? "has-note" : ""}`} onClick={() => openNotes(question)} aria-label={hasNote ? "Edit my note" : "Add my note"} title={hasNote ? "Edit my note" : "Add my note"}>{hasNote ? <FilePenLine size={16} /> : <FileText size={16} />}</button><button aria-label={revisionIds.has(question.id) ? "Remove from revision" : "Add to revision"} className={revisionIds.has(question.id) ? "row-action-active revision-action" : "revision-action"} onClick={() => toggleRevision(question.id)}><RotateCcw size={16} /></button><button aria-label="Color question" className={question.labelColor ? "row-action-active color-action" : "color-action"} onClick={() => cycleColor(question)}><Palette size={16} /></button></div>; })}</div>}</div>; })}</div>}</section>; })}</div>}
    <div className="sheet-utilities" aria-label="Sheet navigation tools"><button type="button" onClick={collapseAll} aria-label="Collapse all topics" title="Collapse all topics"><PanelTopClose size={17} /></button><button type="button" onClick={openAllSubtopics} aria-label="Open all subtopics" title="Open all subtopics"><PanelTopOpen size={17} /></button><button type="button" onClick={scrollToTop} aria-label="Scroll to top" title="Scroll to top"><ChevronsUp size={18} /></button></div>
  </div>{user && <aside className="profile-summary-sidebar" aria-label="Profile summary"><div className="profile-identity"><div className="profile-avatar" aria-hidden="true">AK</div><div className="profile-identity-copy"><span>YOUR PROFILE</span><strong>{user.name}</strong><small>{user.email || "Email not available"}</small></div></div><p className="profile-bio">Solving one problem at a time and tracking progress through the Striver A2Z sheet.</p><div className="profile-summary-heading"><span>LEARNING OVERVIEW</span><strong>Progress summary</strong></div><div className="profile-summary-overview"><div className="profile-summary-gauge" style={{ background: `conic-gradient(#ff713f 0 ${percent * 3.6}deg, #303030 ${percent * 3.6}deg 360deg)` }}><div><strong>{percent}%</strong><span>done</span></div></div><div className="profile-summary-details"><div className="profile-summary-total"><strong>{completed}</strong><span>/ {questions.length} solved</span></div><div className="profile-summary-levels">{difficultySummary.map((item) => <div className={`profile-summary-level ${item.level.toLowerCase()}`} key={item.level}><i /><span>{item.level === "MEDIUM" ? "Medium" : item.level[0] + item.level.slice(1).toLowerCase()}</span><strong>{item.solved}/{item.total}</strong></div>)}</div></div></div><div className="profile-summary-stats"><div><strong>{questions.length}</strong><span>Total questions</span></div><div><strong>{topics.length}</strong><span>Topics</span></div><div><strong>{subtopicCount}</strong><span>Subtopics</span></div><div><strong>{revisionIds.size}</strong><span>In revision</span></div></div></aside>}{noteQuestion && <div className="notes-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setNoteQuestion(null); }}><section className="notes-modal" role="dialog" aria-modal="true" aria-labelledby="notes-modal-title"><div className="notes-modal-head"><div><span className="section-kicker">MY NOTES</span><h2 id="notes-modal-title">{noteQuestion.title}</h2></div><button type="button" className="notes-modal-close" onClick={() => setNoteQuestion(null)} aria-label="Close notes"><X size={18} /></button></div><div className="notes-toolbar" aria-label="Note formatting tools"><button type="button" onClick={() => formatNote("**")} aria-label="Bold" title="Bold"><Bold size={15} /></button><button type="button" onClick={() => formatNote("_")} aria-label="Italic" title="Italic"><Italic size={15} /></button><button type="button" onClick={() => formatNote("`")} aria-label="Inline code" title="Inline code"><Code2 size={15} /></button><button type="button" onClick={addBullet} aria-label="Bullet list" title="Bullet list"><List size={16} /></button><button type="button" className={notePreview ? "is-active" : ""} onClick={() => setNotePreview((current) => !current)} aria-label={notePreview ? "Edit note" : "Preview note"} title={notePreview ? "Edit note" : "Preview note"}>{notePreview ? <FilePenLine size={15} /> : <Eye size={15} />}</button><span>{notePreview ? "Preview" : "Formatting is saved with your note"}</span></div>{notePreview ? <div className="notes-preview" aria-label="Formatted note preview">{noteDraft.trim() ? renderFormattedNote(noteDraft) : <span className="notes-preview-empty">Nothing to preview yet.</span>}</div> : <textarea ref={noteTextareaRef} autoFocus value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} placeholder="Write a thought, approach, edge case, or reminder…" maxLength={1000} />}<div className="notes-modal-footer"><span>{noteDraft.length}/1000</span><div><button type="button" className="notes-modal-cancel" onClick={() => setNoteQuestion(null)}>Cancel</button><button type="button" className="notes-modal-save" disabled={noteSaving} onClick={() => void saveNotes(noteQuestion, noteDraft)}>{noteSaving ? "Saving…" : "Save note"}</button></div></div></section></div>}</div>;
}


