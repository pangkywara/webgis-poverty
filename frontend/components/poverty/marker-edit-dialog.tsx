"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { PhosphorIcon } from "@/components/ui/collection-grid-disclosure";
import { ChevronDownIcon } from "@/components/ui/phosphor-icons";
import { cn } from "@/lib/utils";
import { RadiusSlider } from "@/components/poverty/radius-slider";
import type { UserMarker } from "@/components/leaflet-map";
import { TimedUndoAction } from "@/components/time-undo-action";
import { FuzzyResultStep } from "@/components/poverty/fuzzy-result-step";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

const RELIGION_OPTIONS = [
  { value: "mosque",    label: "Masjid (Islam)",        icon: "mosque"            },
  { value: "church",    label: "Gereja (Kristen)",      icon: "church"            },
  { value: "cathedral", label: "Gereja Katolik",        icon: "crown-cross"       },
  { value: "temple",    label: "Pura (Hindu)",          icon: "hands-praying"     },
  { value: "vihara",    label: "Vihara (Buddha)",       icon: "hands-praying"     },
  { value: "klenteng",  label: "Klenteng (Konghucu)",   icon: "hands-praying"     },
  { value: "synagogue", label: "Sinagog (Yahudi)",      icon: "synagogue"         },
];

const MARKER_LABELS: Record<string, string> = {
  marker:      "Warga Miskin",
  mosque:      "Masjid",
  church:      "Gereja",
  cathedral:   "Gereja Katolik",
  temple:      "Pura",
  vihara:      "Vihara",
  klenteng:    "Klenteng",
  synagogue:   "Sinagog",
  clinic:      "Klinik",
  "food-bank": "Bank Makanan",
  school:      "Sekolah",
};

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="text-[11px] font-semibold text-foreground/60 uppercase tracking-wider">
        {label}
      </span>
      {children}
    </div>
  );
}

function AdaptiveSlider({ value, onChange, hint }: { value: number; onChange: (v: number) => void; hint: string }) {
  const pct = ((value - 1) / 9) * 100;
  const color = value <= 3 ? "#ef4444" : value <= 6 ? "#f59e0b" : "#10b981";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <input
          type="range" min={1} max={10} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, var(--border) ${pct}%, var(--border) 100%)` }}
          className="flex-1 h-[3px] cursor-pointer appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-border"
        />
        <span className="w-6 shrink-0 text-center text-xs font-bold tabular-nums" style={{ color }}>{value}</span>
      </div>
      <p className="text-[10px] text-muted-foreground">{hint}</p>
    </div>
  );
}

interface MarkerEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marker: UserMarker | null;
  onUpdated: (updated: UserMarker) => void;
  onDeleted: (deleted: UserMarker) => void;
}

export function MarkerEditDialog({ open, onOpenChange, marker, onUpdated, onDeleted }: MarkerEditDialogProps) {
  const isHousehold = marker?.id.startsWith("hh-");
  const isPOI = marker?.id.startsWith("poi-");
  const isReligion = isPOI && RELIGION_OPTIONS.some((o) => o.value === marker?.type);

  // Household fields
  const [headName,        setHeadName]        = useState("");
  const [familyCount,     setFamilyCount]      = useState(3);
  const [penghasilan,     setPenghasilan]      = useState(1500000);
  const [kondisiRumah,    setKondisiRumah]     = useState(5);
  const [kepemilikanAset, setKepemilikanAset]  = useState(5);
  const [notes,           setNotes]            = useState("");
  // POI fields
  const [placeName,       setPlaceName]        = useState("");
  const [religionType,    setReligionType]      = useState<string | null>(null);
  const [radiusMeters,    setRadiusMeters]      = useState(0);

  const selectedReligion = RELIGION_OPTIONS.find((o) => o.value === religionType);

  const DELETE_SECONDS = 5;
  const TOAST_ID = "marker-delete";

  const [isLoading,    setIsLoading]    = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting,   setIsDeleting]   = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Post-save fuzzy result step (household only)
  const [step,        setStep]        = useState<"form" | "result">("form");
  const [savedMarker, setSavedMarker] = useState<UserMarker | null>(null);

  // Delete countdown — lives here so it survives dialog close
  const [deleteActive,    setDeleteActive]    = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(DELETE_SECONDS);
  // Holds the marker being deleted so handleDelete works after dialog closes
  const pendingDeleteMarker = useRef<UserMarker | null>(null);

  // Reset only when a DIFFERENT non-null marker is opened — skip on dialog close (marker → null)
  useEffect(() => {
    if (!marker?.id) return;
    setDeleteActive(false);
    setDeleteCountdown(DELETE_SECONDS);
    pendingDeleteMarker.current = null;
    toast.dismiss(TOAST_ID);
    setStep("form");
    setSavedMarker(null);
  }, [marker?.id]);

  // Tick
  useEffect(() => {
    if (!deleteActive) return;
    const id = setInterval(() => setDeleteCountdown((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(id);
  }, [deleteActive]);

  // Fire when countdown hits 0
  useEffect(() => {
    if (!deleteActive || deleteCountdown > 0) return;
    setDeleteActive(false);
    setDeleteCountdown(DELETE_SECONDS);
    toast.dismiss(TOAST_ID);
    handleDelete();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteActive, deleteCountdown]);

  // Show / update toast while countdown is running
  useEffect(() => {
    if (!deleteActive || !pendingDeleteMarker.current) {
      toast.dismiss(TOAST_ID);
      return;
    }
    const name = pendingDeleteMarker.current.name;
    const pct = (deleteCountdown / DELETE_SECONDS) * 100;
    toast.custom(
      () => (
        <div className="relative flex items-center gap-3 w-72 rounded-xl border border-border bg-popover px-4 py-3 shadow-lg overflow-hidden font-sans">
          <div
            className="absolute bottom-0 left-0 h-[3px] bg-red-500 transition-[width] duration-1000 ease-linear"
            style={{ width: `${pct}%` }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">Menghapus marker</p>
            <p className="text-xs text-muted-foreground truncate">"{name}" — dalam {deleteCountdown} detik</p>
          </div>
          <button
            onClick={() => {
              setDeleteActive(false);
              setDeleteCountdown(DELETE_SECONDS);
              pendingDeleteMarker.current = null;
              toast.dismiss(TOAST_ID);
            }}
            className="shrink-0 h-7 rounded-full border border-border bg-background px-3 text-xs font-medium hover:bg-muted transition-colors cursor-pointer"
          >
            Batalkan
          </button>
        </div>
      ),
      { id: TOAST_ID, duration: Infinity, position: "bottom-left" },
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteActive, deleteCountdown]);

  function toggleDelete() {
    setDeleteActive((prev) => {
      if (!prev) {
        pendingDeleteMarker.current = marker;
        setDeleteCountdown(DELETE_SECONDS);
      } else {
        pendingDeleteMarker.current = null;
        toast.dismiss(TOAST_ID);
      }
      return !prev;
    });
  }

  // Load existing data when dialog opens
  useEffect(() => {
    if (!open || !marker) return;
    const dbId = marker.id.split("-").slice(1).join("-");
    const token = localStorage.getItem("auth_token");
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {} as Record<string, string>;

    setIsLoading(true);
    setError(null);

    if (isHousehold) {
      fetch(`${BACKEND_URL}/households`, { headers })
        .then((r) => r.json())
        .then((rows: any[]) => {
          const row = rows.find((r: any) => String(r.id) === dbId);
          if (row) {
            setHeadName(row.head_name ?? "");
            setFamilyCount(row.family_count ?? 3);
            setPenghasilan(row.penghasilan ?? 1500000);
            setKondisiRumah(row.kondisi_rumah ?? 5);
            setKepemilikanAset(row.kepemilikan_aset ?? 5);
            setNotes(row.notes ?? "");
          }
        })
        .catch(() => setError("Gagal memuat data"))
        .finally(() => setIsLoading(false));
    } else if (isPOI) {
      fetch(`${BACKEND_URL}/poi/${dbId}`, { headers })
        .then((r) => r.json())
        .then((row: any) => {
          setPlaceName(row.name ?? "");
          setReligionType(row.religion_subtype ?? null);
          setRadiusMeters(row.radius_meters ?? 0);
        })
        .catch(() => setError("Gagal memuat data"))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [open, marker]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!marker) return;
    const dbId = marker.id.split("-").slice(1).join("-");
    const token = localStorage.getItem("auth_token");
    const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };

    setIsSubmitting(true);
    setError(null);

    try {
      if (isHousehold) {
        const res = await fetch(`${BACKEND_URL}/households/${dbId}`, {
          method: "PUT", headers,
          body: JSON.stringify({ head_name: headName, family_count: familyCount, notes: notes || null, penghasilan, kondisi_rumah: kondisiRumah, kepemilikan_aset: kepemilikanAset }),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Gagal menyimpan");
        const saved = await res.json();
        setSavedMarker({
          ...marker,
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
        });
        setStep("result");
        setIsSubmitting(false);
        return;
      } else {
        const name = placeName.trim() || (marker.name);
        const body: any = { name };
        if (isReligion) { body.poi_type = "religion"; body.religion_subtype = religionType; body.radius_meters = radiusMeters; }
        const res = await fetch(`${BACKEND_URL}/poi/${dbId}`, {
          method: "PUT", headers,
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Gagal menyimpan");
        onUpdated({
          ...marker,
          name,
          ...(isReligion && religionType ? { type: religionType } : {}),
          ...(isReligion ? { meta: { ...marker.meta, radius: radiusMeters } } : {}),
        });
      }
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    const target = pendingDeleteMarker.current;
    if (!target) return;
    const dbId = target.id.split("-").slice(1).join("-");
    const isTargetHousehold = target.id.startsWith("hh-");
    const token = localStorage.getItem("auth_token");
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    setIsDeleting(true);
    setError(null);

    try {
      const url = isTargetHousehold ? `${BACKEND_URL}/households/${dbId}` : `${BACKEND_URL}/poi/${dbId}`;
      const res = await fetch(url, { method: "DELETE", headers });
      if (!res.ok && res.status !== 204) throw new Error("Gagal menghapus");
      pendingDeleteMarker.current = null;
      onDeleted(target);
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsDeleting(false);
    }
  }

  const title = isHousehold
    ? `Edit ${MARKER_LABELS["marker"]}`
    : `Edit ${MARKER_LABELS[marker?.type ?? ""] ?? marker?.type ?? "Marker"}`;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onOpenChange(false); } }}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-2xl p-0 gap-0">
        {step === "result" && savedMarker && (
          <FuzzyResultStep
            marker={savedMarker}
            confirmLabel="Selesai"
            onConfirm={() => {
              onUpdated(savedMarker);
              setStep("form");
              setSavedMarker(null);
              onOpenChange(false);
            }}
          />
        )}
        {step === "form" && (
        <form onSubmit={handleSubmit} className="flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-center text-base font-semibold">{title}</DialogTitle>
            {marker && (
              <p className="text-center font-mono text-[10px] text-muted-foreground mt-0.5">
                {marker.lat.toFixed(6)},&nbsp;{marker.lng.toFixed(6)}
              </p>
            )}
          </DialogHeader>

          <div className="flex flex-col gap-5 px-6 py-5">
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Memuat data…</p>
            ) : isHousehold ? (
              <>
                <Field label="Nama Kepala Keluarga">
                  <Input value={headName} onChange={(e) => setHeadName(e.target.value)} required className="bg-muted/50 border border-border focus-visible:border-ring" />
                </Field>
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
                    <Input type="number" min={1} max={20} value={familyCount} onChange={(e) => setFamilyCount(Number(e.target.value))} className="bg-muted/50 border border-border focus-visible:border-ring" />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Kondisi Rumah"><AdaptiveSlider value={kondisiRumah} onChange={setKondisiRumah} hint="1 = sangat buruk · 10 = sangat baik" /></Field>
                  <Field label="Kepemilikan Aset"><AdaptiveSlider value={kepemilikanAset} onChange={setKepemilikanAset} hint="1 = tidak ada · 10 = banyak" /></Field>
                </div>
                <Field label="Catatan">
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[72px] bg-muted/50 border border-border focus-visible:border-ring resize-none" />
                </Field>
              </>
            ) : (
              <>
                {isReligion && (
                  <Field label="Jenis Tempat Ibadah">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm transition-colors hover:bg-muted focus-visible:border-ring focus-visible:outline-none"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          {selectedReligion?.icon && (
                            <span className="size-4 shrink-0 text-foreground">
                              <PhosphorIcon name={selectedReligion.icon} className="size-4" />
                            </span>
                          )}
                          <span className={cn("truncate", !selectedReligion && "text-muted-foreground")}>
                            {selectedReligion ? selectedReligion.label : "Pilih jenis…"}
                          </span>
                        </span>
                        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-(--anchor-width)">
                        <DropdownMenuRadioGroup
                          value={religionType ?? ""}
                          onValueChange={setReligionType}
                        >
                          {RELIGION_OPTIONS.map((opt) => (
                            <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                              <span className="size-4 shrink-0 text-foreground">
                                <PhosphorIcon name={opt.icon} className="size-4" />
                              </span>
                              {opt.label}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Field>
                )}
                <Field label="Nama Tempat">
                  <Input value={placeName} onChange={(e) => setPlaceName(e.target.value)} className="bg-muted/50 border border-border focus-visible:border-ring" />
                </Field>
                {isReligion && (
                  <Field label="Radius Jangkauan (meter)">
                    <RadiusSlider value={radiusMeters} onChange={setRadiusMeters} />
                  </Field>
                )}
              </>
            )}

            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="flex items-center justify-between gap-2 px-6 py-4 border-t">
            <TimedUndoAction
              compact
              deleteLabel="Hapus Marker"
              undoLabel="Batal"
              isDeleting={deleteActive}
              countDown={deleteCountdown}
              onToggle={toggleDelete}
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}
                className="h-9 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50">
                Batal
              </button>
              <button type="submit" disabled={isSubmitting || isLoading || (isHousehold && !headName.trim())}
                className="h-9 rounded-full bg-primary text-primary-foreground px-5 text-sm font-medium transition-colors hover:bg-primary/90 disabled:opacity-40">
                {isSubmitting ? "Menyimpan…" : "Simpan"}
              </button>
            </div>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
