"use client";

import { Sun, Moon } from "lucide-react";
import type { MailOpsTheme } from "@/lib/mail-ops/theme";

export function ThemeToggle({ theme, onToggle }: { theme: MailOpsTheme; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:text-foreground"
      title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
    </button>
  );
}
