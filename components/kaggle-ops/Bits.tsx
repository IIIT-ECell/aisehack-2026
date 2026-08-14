"use client";

import { cn } from "@/lib/utils";
import type { TrajectoryEntry } from "@/lib/kaggle-ops/types";

// Small shared presentational pieces, following the enum-to-Tailwind-pill
// convention established by components/mail-ops/CategoryBadge.tsx.

const STATUS_STYLES: Record<TrajectoryEntry["status"], string> = {
  climber: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  held: "bg-muted text-muted-foreground border-border",
  faller: "bg-red-500/15 text-red-300 border-red-500/30",
  "r1-only": "bg-amber-500/15 text-amber-300 border-amber-500/30",
  "r2-only": "bg-sky-500/15 text-sky-300 border-sky-500/30",
};

const STATUS_LABELS: Record<TrajectoryEntry["status"], string> = {
  climber: "climbed",
  held: "held",
  faller: "fell",
  "r1-only": "R1 only",
  "r2-only": "new in R2",
};

export function StatusPill({ status }: { status: TrajectoryEntry["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function DeltaChip({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-[11px] text-muted-foreground">—</span>;
  if (delta === 0) return <span className="text-[11px] text-muted-foreground">±0</span>;
  const climbed = delta > 0;
  return (
    <span className={cn("text-[11px] font-medium", climbed ? "text-emerald-400" : "text-red-400")}>
      {climbed ? "▲" : "▼"} {Math.abs(delta)}
    </span>
  );
}

/** Horizontal meter in the StatsPanel idiom. */
export function Meter({ value, className }: { value: number; className?: string }) {
  return (
    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
      <div
        className={cn("h-full rounded-full bg-primary", className)}
        style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
      />
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-white/[0.02] p-4">
      <header className="mb-3">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}

export function formatScore(score: number): string {
  if (!Number.isFinite(score)) return "—";
  const abs = Math.abs(score);
  if (abs !== 0 && (abs < 0.001 || abs >= 1e7)) return score.toExponential(3);
  return String(Number(score.toPrecision(6)));
}
