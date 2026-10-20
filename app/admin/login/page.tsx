"use client";

import Link from "next/link";
import { FormEvent, useLayoutEffect, useState } from "react";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
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
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    const endpoint = sent ? "/api/admin/auth/verify-code" : "/api/admin/auth/request-code";
    const body = sent ? { email, code } : { email };
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) setError(data.error || "Something went wrong."); else if (sent) window.location.href = "/admin"; else setSent(true);
    setBusy(false);
  }
  return <main className="admin-login-shell"><div className="admin-login-card"><Link href="/practice" className="back-link"><ArrowLeft size={15} /> Back to practice</Link><div className="admin-login-icon"><ShieldCheck size={24} /></div><div className="section-kicker">ADMIN ACCESS</div><h1>{sent ? "Enter your code." : "Sign in to the admin workspace."}</h1><p>{sent ? `We sent a six-digit code to ${email}. It expires in 10 minutes.` : "Use your approved email address. We’ll send a one-time code through Resend."}</p><form onSubmit={submit}><label>Email address<input required type="email" value={email} disabled={sent} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>{sent && <label>Six-digit code<input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" /></label>}{error && <div className="admin-alert is-error">{error}</div>}<button className="admin-primary-button" disabled={busy} type="submit"><Mail size={15} />{busy ? "Working…" : sent ? "Verify and continue" : "Email me a login code"}</button></form>{sent && <button className="admin-login-resend" type="button" onClick={() => { setSent(false); setCode(""); }}>Use another email</button>}</div></main>;
}
