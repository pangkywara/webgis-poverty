"use client";

import {
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { UserMarker } from "@/components/leaflet-map";

export const FUZZY_BADGE: Record<string, { bg: string; text: string; bar: string }> = {
  "SANGAT TINGGI":   { bg: "#fef2f2", text: "#b91c1c", bar: "#ef4444" },
  "TINGGI":          { bg: "#fff7ed", text: "#c2410c", bar: "#f97316" },
  "SEDANG":          { bg: "#fffbeb", text: "#b45309", bar: "#f59e0b" },
  "RENDAH":          { bg: "#f0fdf4", text: "#15803d", bar: "#10b981" },
  "TIDAK PRIORITAS": { bg: "#eff6ff", text: "#1d4ed8", bar: "#6b7280" },
};

const FACTOR_LABELS: Record<string, string> = {
  penghasilan:      "Penghasilan",
  tanggungan:       "Tanggungan",
  kondisi_rumah:    "Kondisi Rumah",
  kepemilikan_aset: "Kepemilikan Aset",
};

interface FuzzyResultStepProps {
  marker: UserMarker;
  confirmLabel: string;
  onConfirm: () => void;
}

export function FuzzyResultStep({ marker, confirmLabel, onConfirm }: FuzzyResultStepProps) {
  const label = marker.meta?.fuzzy_label ?? "";
  const score = marker.meta?.fuzzy_score ?? null;
  const detail = marker.meta?.fuzzy_detail ?? null;
  const badge = FUZZY_BADGE[label] ?? { bg: "#f3f4f6", text: "#374151", bar: "#6b7280" };

  return (
    <div className="flex flex-col">
      <DialogHeader className="px-6 pt-6 pb-4 border-b">
        <DialogTitle className="text-center text-base font-semibold">
          Hasil Analisis Fuzzy
        </DialogTitle>
        <p className="text-center text-[11px] text-muted-foreground mt-0.5">
          {marker.name}
        </p>
      </DialogHeader>

      <div className="flex flex-col gap-5 px-6 py-6">
        {/* Priority badge */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[11px] font-semibold text-foreground/60 uppercase tracking-wider">
            Tingkat Prioritas
          </span>
          <span
            className="px-5 py-1.5 rounded-full text-sm font-bold"
            style={{ backgroundColor: badge.bg, color: badge.text }}
          >
            {label || "—"}
          </span>
        </div>

        {/* Score bar */}
        {score != null && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-foreground/60 uppercase tracking-wider">Skor Fuzzy</span>
              <span className="text-sm font-bold tabular-nums">{score.toFixed(1)}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${score}%`, backgroundColor: badge.bar }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground">
              <span>0</span>
              <span>100</span>
            </div>
          </div>
        )}

        {/* Factor breakdown — dominant fuzzy category per input */}
        {detail && (
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-foreground/60 uppercase tracking-wider">
              Faktor Penilaian
            </span>
            <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
              {Object.entries(FACTOR_LABELS).map(([key, name]) => {
                const f = detail[key];
                if (!f) return null;
                return (
                  <div key={key} className="flex items-center justify-between px-4 py-2 text-[11px]">
                    <span className="text-muted-foreground">{name}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{f.kategori}</span>
                      <span className="w-12 h-1 rounded-full bg-muted overflow-hidden">
                        <span
                          className="block h-full rounded-full"
                          style={{ width: `${Math.round(f.derajat * 100)}%`, backgroundColor: badge.bar }}
                        />
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Summary grid */}
        <div className="rounded-xl bg-muted/50 border border-border px-4 py-3 grid grid-cols-2 gap-y-2 gap-x-6 text-[11px]">
          <span className="text-muted-foreground">Kemiskinan</span>
          <span className="font-medium text-right">{marker.meta?.poverty_level ?? "—"}</span>
          <span className="text-muted-foreground">Tanggungan</span>
          <span className="font-medium text-right">{marker.meta?.family_count ?? "—"} jiwa</span>
          <span className="text-muted-foreground">Penghasilan</span>
          <span className="font-medium text-right">
            Rp {(marker.meta?.penghasilan ?? 0).toLocaleString("id-ID")}/bln
          </span>
          <span className="text-muted-foreground">Koordinat</span>
          <span className="font-mono text-right text-[10px]">
            {marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}
          </span>
        </div>
      </div>

      <div className="flex justify-end px-6 py-4 border-t">
        <button
          type="button"
          onClick={onConfirm}
          className="h-9 rounded-full bg-primary text-primary-foreground px-5 text-sm font-medium transition-colors hover:bg-primary/90"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
