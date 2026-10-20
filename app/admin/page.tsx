"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, Link2, Save, ShieldCheck, Trash2, X } from "lucide-react";
import AppNavbar from "@/components/app-navbar";

type Question = { id: string; sheetNumber: number; title: string; slug: string; externalUrl: string; youtubeUrl: string | null; platform: string; difficulty: "EASY" | "MEDIUM" | "HARD"; topicId: string; subtopicId: string | null; isActive: boolean };
type Topic = { id: string; name: string; subtopics: Array<{ id: string; name: string; questions: Question[] }> };
type Form = Omit<Question, "id" | "isActive"> & { id?: string; isActive: boolean };

const blank: Form = { sheetNumber: 0, title: "", slug: "", externalUrl: "", youtubeUrl: "", platform: "LeetCode", difficulty: "EASY", topicId: "", subtopicId: null, isActive: true };

export default function AdminPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [form, setForm] = useState<Form>(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useLayoutEffect(() => {
    const previousTheme = document.body.dataset.appTheme;
    document.body.dataset.appTheme = "default";
    document.body.dataset.adminLight = "true";
    return () => {
      delete document.body.dataset.adminLight;
      if (previousTheme) document.body.dataset.appTheme = previousTheme;
      else delete document.body.dataset.appTheme;
    };
  }, []);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/admin/questions", { cache: "no-store" });
    const data = await response.json();
    if (response.status === 403) { window.location.href = "/admin/login"; return; }
    if (!response.ok) { setError(data.error || "Could not load the admin sheet."); setLoading(false); return; }
    setTopics(data.topics || []); setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  const allQuestions = useMemo(() => topics.flatMap((topic) => topic.subtopics.flatMap((subtopic) => subtopic.questions.map((question) => ({ ...question, topicName: topic.name, subtopicName: subtopic.name })))), [topics]);
  const filtered = allQuestions.filter((question) => `${question.title} ${question.topicName} ${question.subtopicName}`.toLowerCase().includes(query.toLowerCase()));
  const selectedTopic = topics.find((topic) => topic.id === form.topicId);

  function edit(question: Question) { setForm({ ...question, youtubeUrl: question.youtubeUrl || "" }); setMessage(""); setError(""); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function reset() { setForm({ ...blank, topicId: topics[0]?.id || "", subtopicId: topics[0]?.subtopics[0]?.id || null }); setMessage(""); setError(""); }
  function update<K extends keyof Form>(key: K, value: Form[K]) { setForm((current) => ({ ...current, [key]: value })); }

  async function save(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage(""); setError("");
    const payload = { ...form, sheetNumber: Number(form.sheetNumber), youtubeUrl: form.youtubeUrl || null, slug: form.slug || undefined };
    const response = await fetch("/api/questions", { method: form.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form.id ? { id: form.id, data: payload } : payload) });
    const data = await response.json();
    if (!response.ok) setError(data.error || "Could not save the question."); else { setMessage(form.id ? "Question updated." : "Question added to the sheet."); reset(); await load(); }
    setSaving(false);
  }

  async function remove(question: Question) {
    if (!window.confirm(`Remove “${question.title}” from the public sheet?`)) return;
    const response = await fetch("/api/questions", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: question.id }) });
    if (response.ok) { setMessage("Question removed from the public sheet."); await load(); } else setError("Could not remove the question.");
  }

  return <div className="admin-shell"><AppNavbar hideThemeToggle /><div className="admin-page">
    <div className="admin-topbar"><Link href="/practice" className="back-link"><ArrowLeft size={15} /> Back to practice</Link><span className="admin-badge"><ShieldCheck size={15} /> Admin workspace</span></div>
    <header className="admin-hero"><div><div className="section-kicker">CURRICULUM CONTROL</div><h1>Manage the sheet.</h1><p>Add questions, update links, and keep the shared curriculum accurate for everyone.</p></div><div className="admin-count"><strong>{allQuestions.filter((question) => question.isActive).length}</strong><span>active questions</span></div></header>
    {(message || error) && <div className={`admin-alert ${error ? "is-error" : ""}`}>{error || message}</div>}
    <section className="admin-form-panel"><div className="admin-panel-heading"><div><span className="section-kicker">{form.id ? "EDIT QUESTION" : "ADD TO SHEET"}</span><h2>{form.id ? "Update question or link" : "Add a new question"}</h2></div>{form.id && <button type="button" className="admin-secondary-button" onClick={reset}><X size={15} /> Cancel edit</button>}</div><form className="admin-form" onSubmit={save}><label>Question title<input required value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="e.g. Two Sum" /></label><label>Problem link<input required type="url" value={form.externalUrl} onChange={(event) => update("externalUrl", event.target.value)} placeholder="https://..." /></label><label>YouTube link <span>(optional)</span><input type="url" value={form.youtubeUrl || ""} onChange={(event) => update("youtubeUrl", event.target.value)} placeholder="https://youtube.com/..." /></label><label>Platform<input required value={form.platform} onChange={(event) => update("platform", event.target.value)} placeholder="LeetCode" /></label><label>Difficulty<select value={form.difficulty} onChange={(event) => update("difficulty", event.target.value as Form["difficulty"])}><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option></select></label><label>Sheet number<input type="number" min="0" value={form.sheetNumber} onChange={(event) => update("sheetNumber", Number(event.target.value))} /></label><label>Topic<select required value={form.topicId} onChange={(event) => update("topicId", event.target.value)}><option value="">Choose topic</option>{topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}</select></label><label>Subtopic<select value={form.subtopicId || ""} onChange={(event) => update("subtopicId", event.target.value || null)}><option value="">No subtopic</option>{selectedTopic?.subtopics.map((subtopic) => <option key={subtopic.id} value={subtopic.id}>{subtopic.name}</option>)}</select></label><label className="admin-checkbox"><input type="checkbox" checked={form.isActive} onChange={(event) => update("isActive", event.target.checked)} /> Visible on the public sheet</label><div className="admin-form-actions"><button className="admin-primary-button" disabled={saving} type="submit">{saving ? "Saving…" : <><Save size={15} /> {form.id ? "Save changes" : "Add question"}</>}</button>{!form.id && <button type="button" className="admin-secondary-button" onClick={reset}>Clear</button>}</div></form></section>
    <section className="admin-list-panel"><div className="admin-panel-heading"><div><span className="section-kicker">SHARED CURRICULUM</span><h2>Questions and links</h2></div><label className="admin-search"><Link2 size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the sheet" /></label></div>{loading ? <p className="admin-empty">Loading questions…</p> : <div className="admin-question-list">{filtered.map((question) => <div className={`admin-question-row ${!question.isActive ? "is-inactive" : ""}`} key={question.id}><div className="admin-question-copy"><span>{question.sheetNumber || "—"} · {question.topicName} / {question.subtopicName}</span><strong>{question.title}</strong><small><ExternalLink size={12} /> {question.externalUrl}</small></div><div className="admin-row-meta"><span className={`difficulty-pill ${question.difficulty.toLowerCase()}`}>{question.difficulty}</span><button className="admin-edit-button" type="button" onClick={() => edit(question)}><Save size={14} /> Edit question</button><button className="admin-icon-button danger" type="button" onClick={() => void remove(question)} aria-label={`Remove ${question.title}`}><Trash2 size={15} /></button></div></div>)}{!filtered.length && <p className="admin-empty">No questions match your search.</p>}</div>}</section>
  </div></div>;
}
