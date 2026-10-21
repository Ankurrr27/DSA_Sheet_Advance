"use client";

import { ArrowRight, Check, LockKeyhole, LogIn, PieChart } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function GuestProfilePrompt() {
  const pathname = usePathname();
  const [guest, setGuest] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { user: unknown | null }) => setGuest(!data.user))
      .catch(() => setGuest(true));
  }, []);

  // The profile editor has its own layout; never show the shared right rail or
  // its loading skeleton on profile pages.
  if (pathname?.startsWith("/profile")) return null;
  if (guest === null) return <aside className="profile-rail-skeleton" aria-label="Loading profile" aria-busy="true"><span className="rail-skeleton-avatar" /><div><span className="rail-skeleton-line short" /><span className="rail-skeleton-line name" /><span className="rail-skeleton-line copy" /></div><span className="rail-skeleton-rule" /><span className="rail-skeleton-line heading" /><div className="rail-skeleton-chart"><span /></div><div className="rail-skeleton-stat-grid"><i /><i /><i /><i /></div></aside>;
  if (!guest) return null;

  return <section className="guest-profile-prompt" aria-label="Login and signup">
    <div className="guest-auth-card">
      <div className="guest-auth-card-top">
        <span className="guest-profile-kicker">YOUR PROFILE</span>
      </div>
      <div className="guest-auth-heading">
        <div>
          <h2>Make your progress count</h2>
          <p>Save every solved question, note, and revision in one place.</p>
        </div>
      </div>
      <a className="guest-google-button" href="/api/auth/google"><span className="google-mark" aria-hidden="true"><svg viewBox="0 0 24 24" role="img"><path fill="#4285F4" d="M21.35 12.27c0-.71-.06-1.4-.18-2.06H12v3.9h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.23Z"/><path fill="#34A853" d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.7Z"/><path fill="#FBBC05" d="M6.54 13.78A5.85 5.85 0 0 1 6.23 12c0-.62.11-1.22.31-1.78V7.69H3.3A9.74 9.74 0 0 0 2.27 12c0 1.56.37 3.03 1.03 4.31l3.24-2.53Z"/><path fill="#EA4335" d="M12 6.19c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.3 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.7 5.39l3.24 2.53C7.31 7.91 9.46 6.19 12 6.19Z"/></svg></span><span>Continue with Google</span><ArrowRight size={15} /></a>
      <small><Check size={12} /> New here? Your account is created automatically.</small>
    </div>

    <div className="guest-locked-chart" aria-label="Locked progress preview">
      <div className="guest-chart-head">
        <div><span className="guest-chart-kicker">LEARNING OVERVIEW</span><strong>Your progress, at a glance</strong></div>
        <div className="guest-lock-badge"><LockKeyhole size={13} /> Locked</div>
      </div>
      <div className="guest-chart-preview guest-pie-preview" aria-hidden="true">
        <div className="guest-pie-gauge" style={{ background: "conic-gradient(#ff713f 0 45%, #303030 45% 100%)" }}><div><strong>45%</strong><span>done</span></div></div>
        <div className="guest-pie-details"><strong>24 <span>/ 54 solved</span></strong><div><i className="easy" />Easy <b>12/22</b></div><div><i className="medium" />Medium <b>8/20</b></div><div><i className="hard" />Hard <b>4/12</b></div></div>
      </div>
      <div className="guest-chart-overlay"><div><PieChart size={18} /><strong>Unlock your insights</strong><span>Login to see your streak and weekly progress.</span></div></div>
    </div>
  </section>;
}
