"use client";

import { BookOpen, ChevronLeft, ChevronRight, LayoutDashboard, Menu, RotateCcw } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SheetLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const revisionView = searchParams.get("view") === "revision";
  const dashboardView = pathname === "/profile";

  useEffect(() => {
    if (window.matchMedia("(max-width: 900px)").matches) setSidebarOpen(false);
  }, []);

  return <div className={`compact-app ${sidebarOpen ? "sidebar-is-open" : "sidebar-is-collapsed"}`}>
    <header className="compact-topbar">
      <div className="compact-topbar-left">
        <Link href="/sheet" className="compact-brand"><span>DSA</span><b>Track</b></Link>
      </div>
    </header>
    <div className="compact-workspace">
      <button className="sidebar-reopen" type="button" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar"><Menu size={17} /></button>
      <button className={`sidebar-scrim ${sidebarOpen ? "is-visible" : ""}`} type="button" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} />
      <aside className="compact-sidebar" aria-label="Primary navigation">
        <div className="compact-sidebar-head">
          <button className="sidebar-toggle sidebar-close" type="button" onClick={() => setSidebarOpen((open) => !open)} aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>{sidebarOpen ? <ChevronLeft size={17} /> : <ChevronRight size={17} />}</button>
        </div>
        <nav className="compact-nav-list">
          <Link href="/sheet" className={`compact-nav ${!dashboardView && !revisionView ? "active" : ""}`} title="Practice"><BookOpen size={17} /><span>Practice</span></Link>
          <Link href="/sheet?view=revision" className={`compact-nav ${!dashboardView && revisionView ? "active" : ""}`} title="Revise"><RotateCcw size={17} /><span>Revise</span></Link>
          <Link href="/profile" className={`compact-nav ${dashboardView ? "active" : ""}`} title="Dashboard"><LayoutDashboard size={17} /><span>Dashboard</span></Link>
        </nav>
        <div className="compact-sidebar-footer"><button className="sidebar-toggle footer-toggle" type="button" onClick={() => setSidebarOpen((open) => !open)} aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>{sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}</button></div>
      </aside>
      <main className="compact-main">{children}</main>
    </div>
  </div>;
}
