"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("dsa-theme") === "light";
    setLight(saved);
    document.documentElement.dataset.theme = saved ? "light" : "dark";
  }, []);

  function toggle() {
    const next = !light;
    setLight(next);
    document.documentElement.dataset.theme = next ? "light" : "dark";
    window.localStorage.setItem("dsa-theme", next ? "light" : "dark");
  }

  return <button className="theme-toggle" onClick={toggle} aria-label={light ? "Switch to dark theme" : "Switch to light theme"}>{light ? "☾" : "☼"}</button>;
}
