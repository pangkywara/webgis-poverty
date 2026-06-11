# Religion Dialog Dropdown + Radius Fix

## Problem

1. The religion-edit flow (`marker-edit-dialog.tsx`) uses an older `SelectDropdown`
   (`@/components/ui/dropdown`) for the religion-type field, while the create
   flow (`religion-dialog.tsx`) already uses the shared `dropdown-menu.tsx`
   primitives. The two dialogs look inconsistent.
2. The edit dialog only offers 3 religion types (mosque/church/synagogue),
   while the create dialog offers 7 (+ cathedral, temple, vihara, klenteng).
   As a side effect, editing a cathedral/temple/vihara/klenteng POI shows no
   type selector at all (`isReligion` is false for those types).
3. The edit dialog has no way to change a religion POI's radius, even though
   the create dialog lets you set one.
4. Radius circles never render on the map. Root cause: the live `poi_markers`
   table is missing the `radius_meters` column entirely — the running
   `pba-new-backend-1` container was built before this column was added to
   `db-init.js` / `poi.routes.js`, so radius data never persists.

## Design

### 1. Shared `RadiusSlider` component
New file: `frontend/components/poverty/radius-slider.tsx`.

Extract the slider markup currently inline in `religion-dialog.tsx`
(0-2000m range input, step 50, live value badge, "0 = tidak tampilkan
lingkaran" hint). Props:

```ts
{ value: number; onChange: (v: number) => void }
```

Both dialogs render it inside their own `<Field label="Radius Jangkauan (meter)">`.

### 2. `marker-edit-dialog.tsx`
- Replace `SelectDropdown` with `DropdownMenu` / `DropdownMenuTrigger` /
  `DropdownMenuContent` / `DropdownMenuRadioGroup` / `DropdownMenuRadioItem`
  from `@/components/ui/dropdown-menu`, mirroring the trigger styling and
  icon rendering used in `religion-dialog.tsx`.
- Expand `RELIGION_OPTIONS` to the same 7 entries as `religion-dialog.tsx`
  (mosque/church/cathedral/temple/vihara/klenteng/synagogue, with Indonesian
  labels and icons).
- Add `radiusMeters` state, populated from `row.radius_meters ?? 0` in the
  existing POI-loading `useEffect`.
- Render `<Field label="Radius Jangkauan (meter)"><RadiusSlider .../></Field>`
  only when `isReligion`.
- On submit, when `isReligion`: include `radius_meters: radiusMeters` in the
  PUT body, and include `radius: radiusMeters` in the `meta` passed to
  `onUpdated` so the map redraws the circle immediately.
- Remove the now-dead `SelectDropdown` import.

### 3. `components/ui/dropdown.tsx`
Remove the now-unused `SelectDropdown` / `SelectOption` / `dropdownSpring`
exports (confirmed unused elsewhere via grep).

### 4. `religion-dialog.tsx`
Replace the inline slider block with `<RadiusSlider value={radiusMeters}
onChange={setRadiusMeters} />`. No behavior change, just dedup.

### 5. Backend DB migration
Run `docker compose up -d --build backend` from `/Users/pangkywaradjodi/pba-new`
so `initDb()` re-runs `ALTER TABLE poi_markers ADD COLUMN IF NOT EXISTS
radius_meters INT DEFAULT 0` against the live database. Verify with
`\d poi_markers` afterward.

## Data flow after the fix

- **Create** (`religion-dialog.tsx`): POST `/poi` with `radius_meters` → now
  persists correctly once the column exists.
- **Edit** (`marker-edit-dialog.tsx`): GET `/poi/:id` returns `radius_meters`
  → loaded into the slider → PUT `/poi/:id` saves it → `onUpdated` updates
  `userMarkers` → `leaflet-map.tsx` redraws the circle (existing
  circle-drawing logic is already correct, it just never received real data).
- **Page load**: GET `/poi` already maps `radius_meters` → `meta.radius`, so
  existing POIs with a radius now render circles too.

## Testing

- Rebuild backend, confirm `radius_meters` column exists.
- Manual flow via dev server: create a religion POI with radius > 0 → circle
  appears. Edit an existing religion POI (including a cathedral/temple/etc.),
  change type via the new dropdown, adjust radius, save → circle updates.
  Reload page → circle persists.
