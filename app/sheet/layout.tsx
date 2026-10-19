"use client";

import { BookOpen, ChevronLeft, ChevronRight, LayoutDashboard, Menu, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import AppNavbar from "@/components/app-navbar";

export default function SheetLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [revisionView, setRevisionView] = useState(false);
  const [dashboardView, setDashboardView] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(max-width: 900px)").matches) setSidebarOpen(false);
    const syncRouteState = () => {
      setRevisionView(window.location.pathname === "/revise" || new URLSearchParams(window.location.search).get("view") === "revision");
      setDashboardView(window.location.pathname === "/dashboard");
    };
    syncRouteState();
    window.addEventListener("dsa-route-change", syncRouteState);
    window.addEventListener("popstate", syncRouteState);
    return () => {
      window.removeEventListener("dsa-route-change", syncRouteState);
      window.removeEventListener("popstate", syncRouteState);
    };
  }, []);

  return <div className={`compact-app ${sidebarOpen ? "sidebar-is-open" : "sidebar-is-collapsed"}`}>
    <AppNavbar />
    <div className="compact-workspace">
      <button className="sidebar-reopen" type="button" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar"><Menu size={17} /></button>
      <button className={`sidebar-scrim ${sidebarOpen ? "is-visible" : ""}`} type="button" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} />
      <aside className="compact-sidebar" aria-label="Primary navigation">
        <div className="compact-sidebar-head">
          <button className="sidebar-toggle sidebar-close" type="button" onClick={() => setSidebarOpen((open) => !open)} aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>{sidebarOpen ? <ChevronLeft size={17} /> : <ChevronRight size={17} />}</button>
        </div>
        <nav className="compact-nav-list">
          <Link href="/practice" onClick={() => { setRevisionView(false); setDashboardView(false); window.dispatchEvent(new Event("dsa-route-change")); }} className={`compact-nav ${!dashboardView && !revisionView ? "active" : ""}`} title="Practice"><BookOpen size={17} /><span>Practice</span></Link>
          <Link href="/revise" onClick={() => { setRevisionView(true); setDashboardView(false); window.dispatchEvent(new Event("dsa-route-change")); }} className={`compact-nav ${!dashboardView && revisionView ? "active" : ""}`} title="Revise"><RotateCcw size={17} /><span>Revise</span></Link>
          <Link href="/dashboard" onClick={() => { setRevisionView(false); setDashboardView(true); window.dispatchEvent(new Event("dsa-route-change")); }} className={`compact-nav ${dashboardView ? "active" : ""}`} title="Dashboard"><LayoutDashboard size={17} /><span>Dashboard</span></Link>
        </nav>
        <div className="compact-sidebar-footer"><button className="sidebar-toggle footer-toggle" type="button" onClick={() => setSidebarOpen((open) => !open)} aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>{sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}</button></div>
      </aside>
      <main className="compact-main">{children}</main>
    </div>
  </div>;
}
