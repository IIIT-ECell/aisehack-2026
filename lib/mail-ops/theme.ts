"use client";

import { useEffect, useState } from "react";

// Scoped dark/light toggle for the mail-ops dashboard only. No next-themes
// dependency — this is one small, already-isolated, single-admin tool with
// no SSR flash-of-wrong-theme concern worth a script-injection library for.
// Applies a data-theme attribute to the .mail-ops-root wrapper (already
// present in app/mail-ops-x9k2/layout.tsx), matched by a scoped override
// block in app/globals.css.

export type MailOpsTheme = "dark" | "light";

const STORAGE_KEY = "mail-ops-theme";

export function useMailOpsTheme() {
  const [theme, setTheme] = useState<MailOpsTheme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  useEffect(() => {
    document.querySelector(".mail-ops-root")?.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return { theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) };
}
