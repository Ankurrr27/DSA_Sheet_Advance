"use client";

import { BookOpen, ChevronLeft, ChevronRight, LayoutDashboard, RotateCcw, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import AppNavbar from "@/components/app-navbar";
import GuestProfilePrompt from "@/components/guest-profile-prompt";

export default function SheetLayout({ children }: { children: React.ReactNode }) {
  // Start collapsed for SSR, then restore the user's last sidebar state.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const [revisionView, setRevisionView] = useState(false);
  const [dashboardView, setDashboardView] = useState(false);
  const [profileView, setProfileView] = useState(false);

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 900px)").matches;
    setIsNarrow(narrow);
    // Desktop navigation starts collapsed and expands only while hovered.
    // Mobile keeps the explicit menu/toggle behavior.
    setSidebarOpen(false);
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
  }

  function closeAfterNavigation() {
    if (!isNarrow) updateSidebar(false);
  }

  return <div className={`compact-app ${sidebarOpen ? "sidebar-is-open" : "sidebar-is-collapsed"}`}>
    <AppNavbar onMenuClick={() => updateSidebar(true)} menuOpen={sidebarOpen} />
    <div className="compact-workspace">
      <button className={`sidebar-scrim ${sidebarOpen ? "is-visible" : ""}`} type="button" aria-label="Close sidebar" onClick={() => updateSidebar(false)} />
      <aside className="compact-sidebar" aria-label="Primary navigation" onMouseEnter={() => { if (!isNarrow) updateSidebar(true); }} onMouseLeave={() => { if (!isNarrow) updateSidebar(false); }}>
        <div className="compact-sidebar-head">
          <button className="sidebar-toggle sidebar-close" type="button" onClick={() => updateSidebar(!sidebarOpen)} aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>{sidebarOpen ? <ChevronLeft size={17} /> : <ChevronRight size={17} />}</button>
        </div>
        <nav className="compact-nav-list">
          <Link href="/practice" onClick={() => { closeAfterNavigation(); setRevisionView(false); setDashboardView(false); setProfileView(false); window.dispatchEvent(new Event("dsa-route-change")); }} className={`compact-nav ${!dashboardView && !revisionView && !profileView ? "active" : ""}`} aria-label="Practice"><BookOpen size={17} /><span>Practice</span></Link>
          <Link href="/revise" onClick={() => { closeAfterNavigation(); setRevisionView(true); setDashboardView(false); setProfileView(false); window.dispatchEvent(new Event("dsa-route-change")); }} className={`compact-nav ${!dashboardView && revisionView ? "active" : ""}`} aria-label="Revise"><RotateCcw size={17} /><span>Revise</span></Link>
          <Link href="/dashboard" onClick={() => { closeAfterNavigation(); setRevisionView(false); setDashboardView(true); setProfileView(false); window.dispatchEvent(new Event("dsa-route-change")); }} className={`compact-nav ${dashboardView ? "active" : ""}`} aria-label="Dashboard"><LayoutDashboard size={17} /><span>Dashboard</span></Link>
          <Link href="/profile/edit" onClick={() => { closeAfterNavigation(); setRevisionView(false); setDashboardView(false); setProfileView(true); window.dispatchEvent(new Event("dsa-route-change")); }} className={`compact-nav ${profileView ? "active" : ""}`} aria-label="Profile"><UserRound size={17} /><span>Profile</span></Link>
        </nav>
        <div className="compact-sidebar-footer" />
      </aside>
      <main className="compact-main">{children}<GuestProfilePrompt /></main>
    </div>
  </div>;
}
