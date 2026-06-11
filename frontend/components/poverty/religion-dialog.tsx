"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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

interface PendingClick { lat: number; lng: number; }

interface ReligionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingClick: PendingClick | null;
  onConfirm: (marker: UserMarker) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold text-foreground/60 uppercase tracking-wider">
        {label}
      </span>
      {children}
    </div>
  );
}

export function ReligionDialog({
  open,
  onOpenChange,
  pendingClick,
  onConfirm,
}: ReligionDialogProps) {
  const [religionType, setReligionType] = useState<string | null>(null);
  const [placeName, setPlaceName] = useState("");
  const [radiusMeters, setRadiusMeters] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedReligion = RELIGION_OPTIONS.find((o) => o.value === religionType);

  function reset() {
    setReligionType(null);
    setPlaceName("");
    setRadiusMeters(0);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingClick || !religionType) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("auth_token");
      const label = RELIGION_OPTIONS.find((o) => o.value === religionType)?.label ?? religionType;
      const name = placeName.trim() || label;

      const res = await fetch(`${BACKEND_URL}/poi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          poi_type: "religion",
          religion_subtype: religionType,
          latitude: pendingClick.lat,
          longitude: pendingClick.lng,
          radius_meters: radiusMeters,
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
        type: religionType,
        name,
        meta: { poi_type: "religion", notes: saved.notes ?? undefined, radius: saved.radius_meters ?? 0 },
      });

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
        className="sm:max-w-sm w-full rounded-2xl p-0 gap-0"
      >
        <form onSubmit={handleSubmit} className="flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-center text-base font-semibold">
              Tambah Tempat Ibadah
            </DialogTitle>
            {pendingClick && (
              <p className="text-center font-mono text-[10px] text-muted-foreground mt-0.5">
                {pendingClick.lat.toFixed(6)},&nbsp;{pendingClick.lng.toFixed(6)}
              </p>
            )}
          </DialogHeader>

          <div className="flex flex-col gap-5 px-6 py-5">
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

            <Field label="Nama Tempat Ibadah">
              <Input
                placeholder="cth. Masjid Al-Ikhlas"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                className="bg-muted/50 border border-border focus-visible:border-ring"
              />
            </Field>

            <Field label="Radius Jangkauan (meter)">
              <RadiusSlider value={radiusMeters} onChange={setRadiusMeters} />
            </Field>

            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

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
              disabled={isSubmitting || !religionType}
              className="h-9 rounded-full bg-primary text-primary-foreground px-5 text-sm font-medium transition-colors hover:bg-primary/90 disabled:opacity-40"
            >
              {isSubmitting ? "Menyimpan…" : "Simpan & Pasang Marker"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
