"use client";

import { useLayoutEffect, useState } from "react";

export default function StriverThemeToggle() {
  const [enabled, setEnabled] = useState(false);

  useLayoutEffect(() => {
    setEnabled(window.localStorage.getItem("dsa-striver-theme") === "on");
  }, []);

  function toggle() {
    setEnabled((current) => {
      const next = !current;
      window.localStorage.setItem("dsa-striver-theme", next ? "on" : "off");
      document.body.dataset.appTheme = next ? "striver" : "default";
      return next;
    });
  }

  return <button className={`striver-theme-toggle-control ${enabled ? "is-on" : ""}`} type="button" onClick={toggle} aria-label={enabled ? "Switch to default theme" : "Switch to Striver theme"} title={enabled ? "Switch to default theme" : "Switch to Striver theme"}><span /><span>{enabled ? "Striver" : "Theme"}</span></button>;
}
