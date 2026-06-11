"use client";

import { useEffect, useState } from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCard } from "@/components/dashboard-card";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

const LABELS = [
  "SANGAT TINGGI",
  "TINGGI",
  "SEDANG",
  "RENDAH",
  "TIDAK PRIORITAS",
] as const;

const LABEL_STYLES: Record<string, { bar: string; text: string; dot: string }> = {
  "SANGAT TINGGI":   { bar: "bg-red-500",     text: "text-red-700",     dot: "bg-red-500"     },
  "TINGGI":          { bar: "bg-orange-500",   text: "text-orange-700",  dot: "bg-orange-500"  },
  "SEDANG":          { bar: "bg-amber-500",    text: "text-amber-700",   dot: "bg-amber-500"   },
  "RENDAH":          { bar: "bg-emerald-500",  text: "text-emerald-700", dot: "bg-emerald-500" },
  "TIDAK PRIORITAS": { bar: "bg-blue-500",     text: "text-blue-700",    dot: "bg-blue-500"    },
};

export function FuzzyPriorityStats({
  refreshKey,
  onRecomputed,
}: {
  refreshKey?: number;
  onRecomputed?: () => void;
}) {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [recomputing, setRecomputing] = useState(false);
  const [recomputeMsg, setRecomputeMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/households/stats-fuzzy`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, [refreshKey]);

  async function handleRecompute() {
    setRecomputing(true);
    setRecomputeMsg(null);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${BACKEND_URL}/households/recompute-fuzzy`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Gagal menghitung ulang");
      }
      const data = await res.json();
      setRecomputeMsg(`${data.updated} dari ${data.total} warga dihitung ulang`);
      onRecomputed?.();
    } catch (err) {
      setRecomputeMsg(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setRecomputing(false);
    }
  }

  if (!stats) return null;

  const total = LABELS.reduce((sum, l) => sum + (stats[l] ?? 0), 0);
  if (total === 0) return null;

  return (
    <div className="md:col-span-2 lg:col-span-4 flex flex-col h-full">
      <DashboardCard className="gap-0 h-full py-0">
        <CardHeader className="border-b pt-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Distribusi Prioritas Fuzzy</CardTitle>
            <CardDescription>
              {recomputeMsg ?? `${total} warga teranalisis oleh sistem fuzzy`}
            </CardDescription>
          </div>
          <button
            type="button"
            onClick={handleRecompute}
            disabled={recomputing}
            className="h-8 shrink-0 rounded-full border border-border px-4 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            {recomputing ? "Menghitung…" : "Hitung Ulang Semua"}
          </button>
        </CardHeader>
        <CardContent className="px-0 py-0 flex-1 flex flex-col">
          <div className="grid grid-cols-5 divide-x flex-1">
            {LABELS.map((label) => {
              const count = stats[label] ?? 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const style = LABEL_STYLES[label];
              return (
                <div key={label} className="flex flex-col items-center gap-2 px-4 py-5">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${style.dot}`} />
                    <span className={`text-[11px] font-medium leading-tight text-center ${style.text}`}>
                      {label}
                    </span>
                  </div>
                  <span className="text-2xl font-bold tabular-nums">{count}</span>
                  <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${style.bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </DashboardCard>
    </div>
  );
}
