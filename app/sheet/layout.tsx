"use client";

import { BookOpen, ChevronLeft, ChevronRight, LayoutDashboard, Menu, RotateCcw, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import AppNavbar from "@/components/app-navbar";
import GuestProfilePrompt from "@/components/guest-profile-prompt";

export default function SheetLayout({ children }: { children: React.ReactNode }) {
  // Start collapsed for SSR, then restore the user's last sidebar state.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [revisionView, setRevisionView] = useState(false);
  const [dashboardView, setDashboardView] = useState(false);
  const [profileView, setProfileView] = useState(false);

  useEffect(() => {
    const isNarrow = window.matchMedia("(max-width: 900px)").matches;
    const savedSidebarState = window.localStorage.getItem("dsa-sidebar-open");
    if (savedSidebarState === "open" || savedSidebarState === "closed") {
      setSidebarOpen(savedSidebarState === "open");
    } else {
      // Preserve the original first-use behavior when no preference exists.
      setSidebarOpen(!isNarrow);
    }
    const syncRouteState = () => {
      setRevisionView(window.location.pathname === "/revise" || new URLSearchParams(window.location.search).get("view") === "revision");
      setDashboardView(window.location.pathname === "/dashboard");
      setProfileView(window.location.pathname === "/profile" || window.location.pathname.startsWith("/profile/"));
    };
    syncRouteState();
    window.addEventListener("dsa-route-change", syncRouteState);
    window.addEventListener("popstate", syncRouteState);
    return () => {
      window.removeEventListener("dsa-route-change", syncRouteState);
      window.removeEventListener("popstate", syncRouteState);
    };
  }, []);

  function updateSidebar(open: boolean) {
    setSidebarOpen(open);
    window.localStorage.setItem("dsa-sidebar-open", open ? "open" : "closed");
  }

  return <div className={`compact-app ${sidebarOpen ? "sidebar-is-open" : "sidebar-is-collapsed"}`}>
    <AppNavbar />
    <div className="compact-workspace">
      <button className="sidebar-reopen" type="button" onClick={() => updateSidebar(true)} aria-label="Open sidebar"><Menu size={17} /></button>
      <button className={`sidebar-scrim ${sidebarOpen ? "is-visible" : ""}`} type="button" aria-label="Close sidebar" onClick={() => updateSidebar(false)} />
      <aside className="compact-sidebar" aria-label="Primary navigation">
        <div className="compact-sidebar-head">
          <button className="sidebar-toggle sidebar-close" type="button" onClick={() => updateSidebar(!sidebarOpen)} aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>{sidebarOpen ? <ChevronLeft size={17} /> : <ChevronRight size={17} />}</button>
        </div>
        <nav className="compact-nav-list">
          <Link href="/practice" onClick={() => { setRevisionView(false); setDashboardView(false); setProfileView(false); window.dispatchEvent(new Event("dsa-route-change")); }} className={`compact-nav ${!dashboardView && !revisionView && !profileView ? "active" : ""}`} aria-label="Practice"><BookOpen size={17} /><span>Practice</span></Link>
          <Link href="/revise" onClick={() => { setRevisionView(true); setDashboardView(false); setProfileView(false); window.dispatchEvent(new Event("dsa-route-change")); }} className={`compact-nav ${!dashboardView && revisionView ? "active" : ""}`} aria-label="Revise"><RotateCcw size={17} /><span>Revise</span></Link>
          <Link href="/dashboard" onClick={() => { setRevisionView(false); setDashboardView(true); setProfileView(false); window.dispatchEvent(new Event("dsa-route-change")); }} className={`compact-nav ${dashboardView ? "active" : ""}`} aria-label="Dashboard"><LayoutDashboard size={17} /><span>Dashboard</span></Link>
          <Link href="/profile/edit" onClick={() => { setRevisionView(false); setDashboardView(false); setProfileView(true); window.dispatchEvent(new Event("dsa-route-change")); }} className={`compact-nav ${profileView ? "active" : ""}`} aria-label="Profile"><UserRound size={17} /><span>Profile</span></Link>
        </nav>
        <div className="compact-sidebar-footer" />
      </aside>
      <main className="compact-main">{children}<GuestProfilePrompt /></main>
    </div>
  </div>;
}
