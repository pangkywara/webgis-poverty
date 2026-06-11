# Religion Dialog Dropdown + Radius Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the religion-POI edit dialog use the shared `dropdown-menu.tsx`
component (matching the create dialog), let users edit a POI's radius, and
fix the missing `radius_meters` DB column so radius circles actually render
on the map.

**Architecture:** Extract the radius slider markup from `religion-dialog.tsx`
into a shared `RadiusSlider` component, reuse it in both the create
(`religion-dialog.tsx`) and edit (`marker-edit-dialog.tsx`) dialogs. Swap
`marker-edit-dialog.tsx`'s religion-type field from the legacy `SelectDropdown`
to the `dropdown-menu.tsx` primitives, expand its religion type list from 3 to
7 entries to match the create dialog, and wire radius load/edit/save through
to `onUpdated` so `leaflet-map.tsx` redraws the circle. Separately, rebuild the
backend Docker container so `initDb()` adds the missing `radius_meters` column
to the live database.

**Tech Stack:** Next.js 16 / React 19 (frontend), Express + `pg` (backend),
Docker Compose, no test runner configured (verification via `eslint` +
`tsc --noEmit` + manual check with the dev server).

---

## Task 1: Extract shared `RadiusSlider` component

**Files:**
- Create: `frontend/components/poverty/radius-slider.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

interface RadiusSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function RadiusSlider({ value, onChange }: RadiusSliderProps) {
  const pct = (value / 2000) * 100;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={2000}
          step={50}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            background: value === 0
              ? "var(--border)"
              : `linear-gradient(to right, #10b981 0%, #10b981 ${pct}%, var(--border) ${pct}%, var(--border) 100%)`,
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
          className="w-12 shrink-0 text-center text-xs font-bold tabular-nums"
          style={{ color: value === 0 ? "var(--muted-foreground)" : "#10b981" }}
        >
          {value === 0 ? "—" : `${value}m`}
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground">0 = tidak tampilkan lingkaran</p>
    </div>
  );
}
```

- [ ] **Step 2: Lint check**

Run: `cd /Users/pangkywaradjodi/pba-new/frontend && npx eslint components/poverty/radius-slider.tsx`
Expected: no output, exit code 0.

- [ ] **Step 3: Commit**

```bash
cd /Users/pangkywaradjodi/pba-new/frontend
git add components/poverty/radius-slider.tsx
git commit -m "$(cat <<'EOF'
Extract shared RadiusSlider component

Pulls the radius range-input markup out of religion-dialog.tsx so
marker-edit-dialog.tsx can reuse it for radius editing.
EOF
)"
```

---

## Task 2: Use `RadiusSlider` in `religion-dialog.tsx`

**Files:**
- Modify: `frontend/components/poverty/religion-dialog.tsx`

- [ ] **Step 1: Add the import**

In `frontend/components/poverty/religion-dialog.tsx`, find:

```tsx
import { PhosphorIcon } from "@/components/ui/collection-grid-disclosure";
import { ChevronDownIcon } from "@/components/ui/phosphor-icons";
import { cn } from "@/lib/utils";
import type { UserMarker } from "@/components/leaflet-map";
```

Replace with:

```tsx
import { PhosphorIcon } from "@/components/ui/collection-grid-disclosure";
import { ChevronDownIcon } from "@/components/ui/phosphor-icons";
import { cn } from "@/lib/utils";
import { RadiusSlider } from "@/components/poverty/radius-slider";
import type { UserMarker } from "@/components/leaflet-map";
```

- [ ] **Step 2: Replace the inline slider with `RadiusSlider`**

Find the `Field label="Radius Jangkauan (meter)"` block:

```tsx
            <Field label="Radius Jangkauan (meter)">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={2000}
                    step={50}
                    value={radiusMeters}
                    onChange={(e) => setRadiusMeters(Number(e.target.value))}
                    style={{
                      background: radiusMeters === 0
                        ? "var(--border)"
                        : `linear-gradient(to right, #10b981 0%, #10b981 ${(radiusMeters / 2000) * 100}%, var(--border) ${(radiusMeters / 2000) * 100}%, var(--border) 100%)`,
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
                  <span className="w-12 shrink-0 text-center text-xs font-bold tabular-nums" style={{ color: radiusMeters === 0 ? "var(--muted-foreground)" : "#10b981" }}>
                    {radiusMeters === 0 ? "—" : `${radiusMeters}m`}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">0 = tidak tampilkan lingkaran</p>
              </div>
            </Field>
```

Replace with:

```tsx
            <Field label="Radius Jangkauan (meter)">
              <RadiusSlider value={radiusMeters} onChange={setRadiusMeters} />
            </Field>
```

- [ ] **Step 3: Lint check**

Run: `cd /Users/pangkywaradjodi/pba-new/frontend && npx eslint components/poverty/religion-dialog.tsx`
Expected: no output, exit code 0.

- [ ] **Step 4: Commit**

```bash
cd /Users/pangkywaradjodi/pba-new/frontend
git add components/poverty/religion-dialog.tsx
git commit -m "$(cat <<'EOF'
Use shared RadiusSlider in religion-dialog

No behavior change, just dedup ahead of reusing the slider in the
marker edit dialog.
EOF
)"
```

---

## Task 3: Update `marker-edit-dialog.tsx` — dropdown swap, expanded religion list, radius editing

**Files:**
- Modify: `frontend/components/poverty/marker-edit-dialog.tsx`

- [ ] **Step 1: Replace imports**

Find:

```tsx
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
import { SelectDropdown } from "@/components/ui/dropdown";
import type { UserMarker } from "@/components/leaflet-map";
import { TimedUndoAction } from "@/components/time-undo-action";
```

Replace with:

```tsx
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
```

- [ ] **Step 2: Expand `RELIGION_OPTIONS` to 7 entries and extend `MARKER_LABELS`**

Find:

```tsx
const RELIGION_OPTIONS = [
  { value: "mosque",    label: "Masjid",  icon: "mosque"    },
  { value: "church",    label: "Gereja",  icon: "church"    },
  { value: "synagogue", label: "Sinagog", icon: "synagogue" },
];

const MARKER_LABELS: Record<string, string> = {
  marker:      "Warga Miskin",
  mosque:      "Masjid",
  church:      "Gereja",
  synagogue:   "Sinagog",
  clinic:      "Klinik",
  "food-bank": "Bank Makanan",
  school:      "Sekolah",
};
```

Replace with:

```tsx
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
```

This also fixes a side issue: editing a cathedral/temple/vihara/klenteng POI
previously showed no type selector at all because `isReligion` was `false`
for those types (they weren't in the old 3-entry list).

- [ ] **Step 3: Add `radiusMeters` state and `selectedReligion` lookup**

Find:

```tsx
  // POI fields
  const [placeName,       setPlaceName]        = useState("");
  const [religionType,    setReligionType]      = useState<string | null>(null);
```

Replace with:

```tsx
  // POI fields
  const [placeName,       setPlaceName]        = useState("");
  const [religionType,    setReligionType]      = useState<string | null>(null);
  const [radiusMeters,    setRadiusMeters]      = useState(0);

  const selectedReligion = RELIGION_OPTIONS.find((o) => o.value === religionType);
```

- [ ] **Step 4: Load `radius_meters` when the dialog opens**

Find:

```tsx
    } else if (isPOI) {
      fetch(`${BACKEND_URL}/poi/${dbId}`, { headers })
        .then((r) => r.json())
        .then((row: any) => {
          setPlaceName(row.name ?? "");
          setReligionType(row.religion_subtype ?? null);
        })
        .catch(() => setError("Gagal memuat data"))
        .finally(() => setIsLoading(false));
    }
```

Replace with:

```tsx
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
    }
```

- [ ] **Step 5: Send `radius_meters` on save and update `meta.radius` for the map**

Find:

```tsx
      } else {
        const name = placeName.trim() || (marker.name);
        const body: any = { name };
        if (isReligion) { body.poi_type = "religion"; body.religion_subtype = religionType; }
        const res = await fetch(`${BACKEND_URL}/poi/${dbId}`, {
          method: "PUT", headers,
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Gagal menyimpan");
        onUpdated({ ...marker, name, ...(isReligion && religionType ? { type: religionType } : {}) });
      }
```

Replace with:

```tsx
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
```

- [ ] **Step 6: Swap the religion-type field to `DropdownMenu` and add the radius field**

Find:

```tsx
            ) : (
              <>
                {isReligion && (
                  <Field label="Jenis Tempat Ibadah">
                    <SelectDropdown options={RELIGION_OPTIONS} value={religionType} onChange={setReligionType} />
                  </Field>
                )}
                <Field label="Nama Tempat">
                  <Input value={placeName} onChange={(e) => setPlaceName(e.target.value)} className="bg-muted/50 border border-border focus-visible:border-ring" />
                </Field>
              </>
            )}
```

Replace with:

```tsx
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
                        <DropdownMenuRadioGroup value={religionType ?? ""} onValueChange={setReligionType}>
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
```

- [ ] **Step 7: Lint check**

Run: `cd /Users/pangkywaradjodi/pba-new/frontend && npx eslint components/poverty/marker-edit-dialog.tsx`
Expected: no output, exit code 0.

- [ ] **Step 8: Commit**

```bash
cd /Users/pangkywaradjodi/pba-new/frontend
git add components/poverty/marker-edit-dialog.tsx
git commit -m "$(cat <<'EOF'
Switch marker-edit-dialog to dropdown-menu + add radius editing

- Replace SelectDropdown with the shared dropdown-menu primitives,
  matching religion-dialog.tsx.
- Expand religion type options from 3 to 7 (adds cathedral, temple,
  vihara, klenteng) so editing those POI types now shows a type
  selector at all.
- Load radius_meters when the dialog opens, expose a radius slider
  for religion POIs, and send radius_meters on save while updating
  meta.radius so the map redraws the circle immediately.
EOF
)"
```

---

## Task 4: Remove the now-unused `SelectDropdown` from `ui/dropdown.tsx`

**Files:**
- Modify: `frontend/components/ui/dropdown.tsx`

This component (and its `SelectOption`/`dropdownSpring` helpers) was only
used by `marker-edit-dialog.tsx`, which Task 3 migrated to `dropdown-menu.tsx`.

- [ ] **Step 1: Confirm no remaining usages**

Run: `cd /Users/pangkywaradjodi/pba-new/frontend && grep -rn "SelectDropdown\|SelectOption" --include="*.tsx" --include="*.ts" . | grep -v node_modules | grep -v .next`
Expected: only matches inside `components/ui/dropdown.tsx` itself.

- [ ] **Step 2: Trim unused imports**

Find:

```tsx
"use client";

import { useState, useEffect, useRef, type FC, type ReactNode } from "react";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { ChevronUpIcon } from "lucide-react";
import { PhosphorIcon } from "@/components/ui/collection-grid-disclosure";
import { cn } from "@/lib/utils";
```

Replace with:

```tsx
"use client";

import { useState, useEffect, type FC, type ReactNode } from "react";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { ChevronUpIcon } from "lucide-react";
```

- [ ] **Step 3: Remove the `SelectDropdown` section**

Find:

```tsx
// ─── Select Dropdown ────────────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

interface SelectDropdownProps {
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const dropdownSpring = { type: "spring" as const, stiffness: 200, damping: 20, mass: 1.1 };

export const SelectDropdown: FC<SelectDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select…",
  className,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <MotionConfig transition={dropdownSpring}>
      <div ref={ref} className={cn("relative w-full", className)}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/95 px-3 py-2 text-sm shadow-sm backdrop-blur-md transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center gap-2 min-w-0">
            {selected?.icon && (
              <span className="size-4 shrink-0 text-foreground">
                <PhosphorIcon name={selected.icon} className="size-4" />
              </span>
            )}
            <span className={cn("truncate", !selected && "text-muted-foreground")}>
              {selected ? selected.label : placeholder}
            </span>
          </div>
          <motion.span animate={{ rotate: open ? 180 : 0 }} className="shrink-0 text-muted-foreground">
            <ChevronUpIcon className="size-4" />
          </motion.span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
              style={{ originY: 0 }}
              className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border/60 bg-background/95 shadow-lg backdrop-blur-md"
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                >
                  {opt.icon && (
                    <span className="size-4 shrink-0 text-foreground">
                      <PhosphorIcon name={opt.icon} className="size-4" />
                    </span>
                  )}
                  <span className="flex-1 text-left">{opt.label}</span>
                  {value === opt.value && (
                    <span className="size-3.5 shrink-0 text-primary">
                      <PhosphorIcon name="check" className="size-3.5" />
                    </span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
};

// ─── Activities Card (existing) ──────────────────────────────────────────────
```

Replace with:

```tsx
// ─── Activities Card (existing) ──────────────────────────────────────────────
```

- [ ] **Step 4: Lint + full type check**

Run: `cd /Users/pangkywaradjodi/pba-new/frontend && npx eslint components/ui/dropdown.tsx components/poverty/marker-edit-dialog.tsx components/poverty/religion-dialog.tsx components/poverty/radius-slider.tsx`
Expected: no output, exit code 0.

Run: `cd /Users/pangkywaradjodi/pba-new/frontend && npx tsc --noEmit`
Expected: no type errors (exit code 0). This catches any leftover references
to `SelectDropdown`/`SelectOption` or mismatched `UserMarker`/`meta` types.

- [ ] **Step 5: Commit**

```bash
cd /Users/pangkywaradjodi/pba-new/frontend
git add components/ui/dropdown.tsx
git commit -m "$(cat <<'EOF'
Remove unused SelectDropdown from ui/dropdown

marker-edit-dialog.tsx was its only consumer and now uses
dropdown-menu.tsx instead.
EOF
)"
```

---

## Task 5: Fix the missing `radius_meters` column on the live database

**Files:** none (infrastructure only — `db-init.js` and `poi.routes.js`
already reference `radius_meters`, the running container is just stale)

- [ ] **Step 1: Confirm the column is currently missing**

Run: `docker exec pba-new-postgres-1 psql -U sig -d sig -c "\d poi_markers"`
Expected (before fix): output does NOT contain a `radius_meters` row.

- [ ] **Step 2: Rebuild and restart the backend container**

Run: `cd /Users/pangkywaradjodi/pba-new && docker compose up -d --build backend`
Expected: build succeeds, `pba-new-backend-1` recreated and running.

- [ ] **Step 3: Verify the column now exists**

Run: `docker exec pba-new-postgres-1 psql -U sig -d sig -c "\d poi_markers"`
Expected: output now contains:

```
 radius_meters    | integer                  |           |          | 0
```

- [ ] **Step 4: Verify the backend is healthy**

Run: `docker logs pba-new-backend-1 --tail 20`
Expected: `Auth server running on port 4000`, no errors.

---

## Task 6: Manual end-to-end verification

**Files:** none (manual QA against the running app)

- [ ] **Step 1: Start the frontend dev server**

Use the `/run` skill (or `cd /Users/pangkywaradjodi/pba-new/frontend && npm run dev`)
to launch the app, then open the poverty dashboard and switch to the Leaflet
map view (satellite or street, doesn't matter).

- [ ] **Step 2: Create a new religion POI with a radius**

Click the map to place a new place of worship. In the "Tambah Tempat Ibadah"
dialog:
- Pick a religion type from the dropdown (confirm it still uses the
  dropdown-menu styling/icons as before).
- Set the radius slider to a non-zero value (e.g. 500m).
- Save.

Expected: the marker appears on the map AND a faint dashed circle of the
matching color appears around it with the chosen radius.

- [ ] **Step 3: Edit the POI and verify the new dropdown + radius field**

Click the marker to open the edit dialog. Verify:
- The "Jenis Tempat Ibadah" field now renders using the dropdown-menu
  component (same look/feel as the create dialog, with icons), and all 7
  religion types are selectable.
- A "Radius Jangkauan (meter)" slider is shown, pre-filled with the radius
  set in Step 2.

Change the religion type to a type not in the old 3-option list (e.g.
"Pura (Hindu)" / temple) and change the radius to a different value (e.g.
1000m). Save.

Expected: the marker icon/color updates to match the new type, and the
circle on the map resizes to the new radius.

- [ ] **Step 4: Verify persistence across reload**

Reload the page (re-fetches markers from `/poi`).

Expected: the marker still shows with the updated type, and the radius
circle still renders at the saved radius — confirming `radius_meters` is
now persisted in and read back from the database correctly.

- [ ] **Step 5: Edit radius down to 0**

Open the edit dialog again, set the radius slider to 0, save, reload.

Expected: the marker remains but the circle disappears (per the
"0 = tidak tampilkan lingkaran" convention).
