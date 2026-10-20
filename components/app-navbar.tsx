"use client";

import Link from "next/link";
import { useLayoutEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import StriverThemeToggle from "@/components/striver-theme-toggle";

type AppNavbarProps = {
  label?: string;
  hideThemeToggle?: boolean;
};

export default function AppNavbar({ label, hideThemeToggle = false }: AppNavbarProps) {
  // Keep the first render identical on the server and client. The persisted
  // theme is applied immediately after mount by the layout effect below.
  const [userName, setUserName] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useLayoutEffect(() => {
    const enabled = window.localStorage.getItem("dsa-striver-theme") === "on";
    document.body.dataset.appTheme = enabled ? "striver" : "default";
    document.body.dataset.authenticated = "false";
    const loadSession = () => fetch(`/api/auth/session?ts=${Date.now()}`, { cache: "no-store" }).then((response) => { if (!response.ok) throw new Error("Session request failed"); return response.json(); }).then((data: { user?: { name?: string; image?: string | null; isAdmin?: boolean } | null }) => { setUserName(data.user?.name || null); setUserImage(data.user?.image || null); setIsAdmin(Boolean(data.user?.isAdmin)); document.body.dataset.authenticated = data.user ? "true" : "false"; document.body.dataset.profileImage = data.user?.image ? "true" : "false"; document.body.style.setProperty("--profile-image", data.user?.image ? `url(\"${data.user.image}\")` : "none"); }).catch(() => { setUserName(null); setUserImage(null); setIsAdmin(false); document.body.dataset.authenticated = "false"; });
    void loadSession();
    window.addEventListener("dsa-profile-updated", loadSession);
    return () => window.removeEventListener("dsa-profile-updated", loadSession);
  }, []);

  return (
    <header className="app-navbar">
      <Link href="/practice" className="app-brand" aria-label="DSA Track home">
        <span>DSA</span><b>/</b>track
      </Link>
      {!hideThemeToggle && <StriverThemeToggle />}
      <div className="app-navbar-actions">
        {label ? <span className="app-view-label">{label}</span> : null}
        {isAdmin ? <Link href="/admin" className="admin-nav-link"><ShieldCheck size={14} /> Admin</Link> : null}
        {userName ? <button className="auth-logout-button" type="button" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/practice"; }}>Sign out</button> : <a className="auth-login-link" href="/api/auth/google">Login / Signup</a>}
        {userName ? <Link href="/profile/edit" className="navbar-profile-avatar" aria-label="Open profile" title="Open profile">{userImage ? <img src={userImage} alt="" /> : userName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</Link> : null}
      </div>
    </header>
  );
}
