"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { UserMarker } from "@/components/leaflet-map";
import { FuzzyResultStep } from "@/components/poverty/fuzzy-result-step";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

const MARKER_LABELS: Record<string, string> = {
  marker:      "Warga Miskin",
  mosque:      "Masjid",
  church:      "Gereja",
  synagogue:   "Sinagog",
  clinic:      "Klinik",
  "food-bank": "Bank Makanan",
  school:      "Sekolah",
};

interface PendingClick {
  lat: number;
  lng: number;
}

interface MarkerPlacementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  markerType: string;
  pendingClick: PendingClick | null;
  onConfirm: (marker: UserMarker) => void;
}

/* ─── Adaptive Slider ─────────────────────────────────────── */
function AdaptiveSlider({
  value,
  onChange,
  hint,
}: {
  value: number;
  onChange: (v: number) => void;
  hint: string;
}) {
  const pct = ((value - 1) / 9) * 100;
  const color =
    value <= 3 ? "#ef4444" : value <= 6 ? "#f59e0b" : "#10b981";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, var(--border) ${pct}%, var(--border) 100%)`,
          }}
          className="
            flex-1 h-[3px] cursor-pointer appearance-none rounded-full outline-none
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow
            [&::-webkit-slider-thumb]:border
            [&::-webkit-slider-thumb]:border-border
            [&::-moz-range-thumb]:w-3
            [&::-moz-range-thumb]:h-3
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border
            [&::-moz-range-thumb]:border-border
          "
        />
        <span
          className="w-6 shrink-0 text-center text-xs font-bold tabular-nums"
          style={{ color }}
        >
          {value}
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground">{hint}</p>
    </div>
  );
}

/* ─── Field wrapper ───────────────────────────────────────── */
function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="text-[11px] font-semibold text-foreground/60 uppercase tracking-wider">
        {label}
      </span>
      {children}
    </div>
  );
}

/* ─── Main dialog ─────────────────────────────────────────── */
export function MarkerPlacementDialog({
  open,
  onOpenChange,
  markerType,
  pendingClick,
  onConfirm,
}: MarkerPlacementDialogProps) {
  const isHousehold = markerType === "marker";

  const [headName,         setHeadName]         = useState("");
  const [familyCount,      setFamilyCount]       = useState(3);
  const [penghasilan,      setPenghasilan]       = useState(1500000);
  const [kondisiRumah,     setKondisiRumah]      = useState(5);
  const [kepemilikanAset,  setKepemilikanAset]   = useState(5);
  const [notes,            setNotes]             = useState("");
  const [placeName,        setPlaceName]         = useState("");
  const [isSubmitting,     setIsSubmitting]      = useState(false);
  const [error,            setError]             = useState<string | null>(null);
  const [step,             setStep]              = useState<"form" | "result">("form");
  const [savedMarker,      setSavedMarker]       = useState<UserMarker | null>(null);

  function reset() {
    setHeadName(""); setFamilyCount(3); setPenghasilan(1500000);
    setKondisiRumah(5); setKepemilikanAset(5);
    setNotes(""); setPlaceName(""); setError(null);
    setStep("form"); setSavedMarker(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingClick) return;
    setIsSubmitting(true);
    setError(null);

    try {
      if (isHousehold) {
        const token = localStorage.getItem("auth_token");
        const res = await fetch(`${BACKEND_URL}/households`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            head_name:        headName,
            family_count:     familyCount,
            latitude:         pendingClick.lat,
            longitude:        pendingClick.lng,
            notes:            notes || null,
            penghasilan,
            kondisi_rumah:    kondisiRumah,
            kepemilikan_aset: kepemilikanAset,
            marker_type:      "marker",
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Gagal menyimpan data");
        }
        const saved = await res.json();
        const marker: UserMarker = {
          id: `hh-${saved.id}`,
          lat: pendingClick.lat,
          lng: pendingClick.lng,
          type: "marker",
          name: saved.head_name,
          meta: {
            poverty_level: saved.poverty_level,
            family_count: saved.family_count,
            penghasilan: saved.penghasilan,
            fuzzy_label: saved.fuzzy_label ?? undefined,
            fuzzy_score: saved.fuzzy_score != null ? parseFloat(saved.fuzzy_score) : undefined,
            fuzzy_detail: saved.fuzzy_detail ?? undefined,
            notes: saved.notes ?? undefined,
          },
        };
        setSavedMarker(marker);
        setStep("result");
        setIsSubmitting(false);
        return;
      } else {
        const token = localStorage.getItem("auth_token");
        const name = placeName.trim() || MARKER_LABELS[markerType] || markerType;
        const res = await fetch(`${BACKEND_URL}/poi`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            name,
            poi_type: markerType,
            latitude: pendingClick.lat,
            longitude: pendingClick.lng,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Gagal menyimpan data");
        }
        const saved = await res.json();
        onConfirm({
          id: `poi-${saved.id}`,
          lat: pendingClick.lat,
          lng: pendingClick.lng,
          type: markerType,
          name,
          meta: { poi_type: markerType, notes: saved.notes ?? undefined },
        });
      }

      reset();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleCancel(); }}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-2xl p-0 gap-0"
      >

        {/* ── Fuzzy Result Step ── */}
        {step === "result" && savedMarker && (
          <FuzzyResultStep
            marker={savedMarker}
            confirmLabel="Selesai & Pasang Marker"
            onConfirm={() => {
              onConfirm(savedMarker);
              reset();
              onOpenChange(false);
            }}
          />
        )}

        {/* ── Form Step ── */}
        {step === "form" && (
        <form onSubmit={handleSubmit} className="flex flex-col">

          {/* ── Header ── */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-center text-base font-semibold">
              {isHousehold
                ? "Tambah Data Warga Miskin"
                : `Tambah ${MARKER_LABELS[markerType] ?? markerType}`}
            </DialogTitle>
            {pendingClick && (
              <p className="text-center font-mono text-[10px] text-muted-foreground mt-0.5">
                {pendingClick.lat.toFixed(6)},&nbsp;{pendingClick.lng.toFixed(6)}
              </p>
            )}
          </DialogHeader>

          {/* ── Body ── */}
          <div className="flex flex-col gap-5 px-6 py-5">

            {isHousehold ? (
              <>
                {/* Row 1: Nama KK */}
                <Field label="Nama Kepala Keluarga">
                  <Input
                    placeholder="cth. Budi Santoso"
                    value={headName}
                    onChange={(e) => setHeadName(e.target.value)}
                    required
                    className="bg-muted/50 border border-border focus-visible:border-ring"
                  />
                </Field>

                {/* Row 2: Penghasilan + Tanggungan */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Penghasilan / Bulan">
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold">Rp</span>
                      <Input
                        type="text"
                        value={penghasilan ? penghasilan.toLocaleString("id-ID") : ""}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/\D/g, "");
                          setPenghasilan(clean ? parseInt(clean, 10) : 0);
                        }}
                        className="pl-9 bg-muted/50 border border-border focus-visible:border-ring"
                      />
                    </div>
                  </Field>
                  <Field label="Jumlah Tanggungan (jiwa)">
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={familyCount}
                      onChange={(e) => setFamilyCount(Number(e.target.value))}
                      className="bg-muted/50 border border-border focus-visible:border-ring"
                    />
                  </Field>
                </div>

                {/* Row 3: Sliders */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Kondisi Rumah">
                    <AdaptiveSlider
                      value={kondisiRumah}
                      onChange={setKondisiRumah}
                      hint="1 = sangat buruk · 10 = sangat baik"
                    />
                  </Field>
                  <Field label="Kepemilikan Aset">
                    <AdaptiveSlider
                      value={kepemilikanAset}
                      onChange={setKepemilikanAset}
                      hint="1 = tidak ada · 10 = banyak"
                    />
                  </Field>
                </div>

                {/* Row 4: Catatan */}
                <Field label="Catatan">
                  <Textarea
                    placeholder="Informasi tambahan (opsional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[72px] bg-muted/50 border border-border focus-visible:border-ring resize-none"
                  />
                </Field>
              </>
            ) : (
              <Field label="Nama Tempat">
                <Input
                  placeholder={MARKER_LABELS[markerType] ?? "Nama lokasi"}
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  className="bg-muted/50 border border-border focus-visible:border-ring"
                />
              </Field>
            )}

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="flex justify-end gap-2 px-6 py-4 border-t">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="h-9 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (isHousehold && !headName.trim())}
              className="h-9 rounded-full bg-primary text-primary-foreground px-5 text-sm font-medium transition-colors hover:bg-primary/90 disabled:opacity-40"
            >
              {isSubmitting ? "Menyimpan…" : "Simpan & Pasang Marker"}
            </button>
          </div>

        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
