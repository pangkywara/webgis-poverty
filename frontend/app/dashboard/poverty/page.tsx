"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { DndContext, DragOverlay, useDroppable, useSensor, useSensors, PointerSensor, type DragEndEvent } from "@dnd-kit/core";
import { AppShell } from "@/components/app-shell";
import { MapPageHeader } from "@/components/maps/map-page-header";
import { PovertyStatsCards } from "@/components/poverty/poverty-stats-cards";
import { PovertyTrendChart } from "@/components/poverty/poverty-trend-chart";
import { PovertyDirectory } from "@/components/poverty/poverty-directory";
import { PovertyInspectorTop, PovertyInspectorBottom } from "@/components/poverty/poverty-inspector";
import { PovertyHud } from "@/components/poverty/poverty-hud";
import { TrendingDownIcon } from "@/components/ui/phosphor-icons";
import { PovertyDisclosureCard } from "@/components/ui/collection-grid-disclosure";
import type { UserMarker } from "@/components/leaflet-map";
import type { HouseholdRow, PovertyOverview } from "@/lib/poverty-types";
import { MarkerPlacementDialog } from "@/components/poverty/marker-placement-dialog";
import { ReligionDialog } from "@/components/poverty/religion-dialog";
import { MarkerEditDialog } from "@/components/poverty/marker-edit-dialog";
import { PovertyHouseholdsTable } from "@/components/poverty/poverty-households-table";
import { FuzzyPriorityStats } from "@/components/poverty/fuzzy-priority-stats";
import { toast } from "sonner";

const LeafletMap = dynamic(() => import("@/components/leaflet-map"), { ssr: false });

const PLACING_LABELS: Record<string, string> = {
	marker: "Data Warga",
	religion: "Rumah Ibadah",
	clinic: "Klinik",
	"food-bank": "Lumbung Pangan",
	school: "Sekolah",
};

function MapDropZone() {
	const { setNodeRef } = useDroppable({ id: "map-canvas" });
	return <div ref={setNodeRef} className="absolute inset-0 z-[1] pointer-events-none" />;
}

export default function PovertyMapPage() {
	const [searchQuery, setSearchQuery] = useState("");
	// Initialize deterministically (matches SSR) and hydrate from sessionStorage
	// after mount to avoid a hydration mismatch that regenerates the whole tree.
	const [useLeaflet, setUseLeaflet] = useState(false);
	const [mapStyle, setMapStyle] = useState<"street" | "satellite">("street");
	const [hydrated, setHydrated] = useState(false);
	const [userMarkers, setUserMarkers] = useState<UserMarker[]>([]);
	const [placingMarkerType, setPlacingMarkerType] = useState<string | null>(null);
	const [dragDropEnabled, setDragDropEnabled] = useState(false);
	const [pendingClick, setPendingClick] = useState<{ lat: number; lng: number } | null>(null);
	const [householdsRefreshKey, setHouseholdsRefreshKey] = useState(0);
	const [editingMarker, setEditingMarker] = useState<UserMarker | null>(null);
	const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
	const [households, setHouseholds] = useState<HouseholdRow[]>([]);
	const [householdsLoading, setHouseholdsLoading] = useState(true);
	const [overview, setOverview] = useState<PovertyOverview | null>(null);
	const [selectedHouseholdId, setSelectedHouseholdId] = useState<number | null>(null);
	const mapInstanceRef = useRef<any>(null);
	const mapContainerRef = useRef<HTMLDivElement>(null);

	// Require a small drag distance before activating dnd, so a plain click on a
	// disclosure item is treated as a tool toggle (not a drag). Without this the
	// click is swallowed and the marker tool never activates — the dialog would
	// then only appear via drag-drop instead of the click-tool → click-map flow.
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
	);

	const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

	// Dashboard data — households + aggregated overview, straight from the DB.
	useEffect(() => {
		const token = localStorage.getItem("auth_token");
		const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

		Promise.allSettled([
			fetch(`${BACKEND_URL}/households`, { headers }).then((r) => r.json()),
			fetch(`${BACKEND_URL}/households/stats-overview`, { headers }).then((r) => r.json()),
		]).then(([hhResult, overviewResult]) => {
			if (hhResult.status === "fulfilled" && Array.isArray(hhResult.value)) {
				setHouseholds(hhResult.value as HouseholdRow[]);
			}
			if (overviewResult.status === "fulfilled" && overviewResult.value?.totals) {
				setOverview(overviewResult.value as PovertyOverview);
			}
			setHouseholdsLoading(false);
		});
	}, [householdsRefreshKey]);

	// Load existing markers when map view opens. Households are reused from the
	// dashboard fetch above; only POIs need their own request here.
	useEffect(() => {
		if (!useLeaflet) return;
		const token = localStorage.getItem("auth_token");
		const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

		fetch(`${BACKEND_URL}/poi`, { headers })
			.then((r) => r.json())
			.catch(() => [])
			.then((poiRows: any[]) => {
				const hhMarkers: UserMarker[] = households.map((r) => ({
					id: `hh-${r.id}`,
					lat: parseFloat(r.latitude),
					lng: parseFloat(r.longitude),
					type: "marker",
					name: r.head_name,
					meta: {
						poverty_level: r.poverty_level,
						family_count: r.family_count,
						penghasilan: r.penghasilan,
						fuzzy_label: r.fuzzy_label ?? undefined,
						fuzzy_score: r.fuzzy_score != null ? Number(r.fuzzy_score) : undefined,
						notes: r.notes ?? undefined,
					},
				}));
				const poiMarkers: UserMarker[] = (Array.isArray(poiRows) ? poiRows : []).map((r) => ({
					id: `poi-${r.id}`,
					lat: parseFloat(r.latitude),
					lng: parseFloat(r.longitude),
					type: r.religion_subtype ?? r.poi_type,
					name: r.name,
					meta: {
						poi_type: r.poi_type,
						notes: r.notes ?? undefined,
						radius: r.radius_meters ?? 0,
					},
				}));
				setUserMarkers([...hhMarkers, ...poiMarkers]);
			});
	}, [useLeaflet, households]);

	useEffect(() => {
		setUseLeaflet(sessionStorage.getItem("poverty_useLeaflet") === "true");
		setMapStyle((sessionStorage.getItem("poverty_mapStyle") as "street" | "satellite") ?? "street");
		setHydrated(true);
	}, []);

	useEffect(() => { if (hydrated) sessionStorage.setItem("poverty_useLeaflet", String(useLeaflet)); }, [useLeaflet, hydrated]);
	useEffect(() => { if (hydrated) sessionStorage.setItem("poverty_mapStyle", mapStyle); }, [mapStyle, hydrated]);

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		setDraggedItemId(null);
		if (over?.id !== "map-canvas") return;
		const itemId = (active.data.current as any)?.itemId as string | undefined;
		if (!itemId || !mapInstanceRef.current) return;

		// Get drop coordinates in the map container
		const nativeEvent = event.activatorEvent as PointerEvent;
		const rect = mapContainerRef.current?.getBoundingClientRect();
		if (!rect) return;

		const L = (window as any).L;
		if (!L) return;

		const x = nativeEvent.clientX + (event.delta?.x ?? 0) - rect.left;
		const y = nativeEvent.clientY + (event.delta?.y ?? 0) - rect.top;
		const latLng = mapInstanceRef.current.containerPointToLatLng(L.point(x, y));

		setPendingClick({ lat: latLng.lat, lng: latLng.lng });
		setPlacingMarkerType(itemId);
	}

	const demographics = useMemo(() => {
		const householdMarkers = userMarkers.filter((m) => m.type === "marker");
		return {
			population: householdMarkers.reduce((sum, h) => sum + (h.meta?.family_count ?? 0), 0),
			beneficiaries: householdMarkers.filter((h) => h.meta?.poverty_level === "Extreme" || h.meta?.poverty_level === "Miskin").length,
			socialSecurity: householdMarkers.filter((h) => h.meta?.poverty_level === "Rentan").length,
		};
	}, [userMarkers]);

	// Default the inspector to the highest-priority household.
	const selectedHousehold = useMemo(() => {
		if (households.length === 0) return null;
		const found = households.find((h) => h.id === selectedHouseholdId);
		if (found) return found;
		return [...households].sort(
			(a, b) => Number(b.fuzzy_score ?? -1) - Number(a.fuzzy_score ?? -1)
		)[0];
	}, [households, selectedHouseholdId]);

	async function handleMarkerDragEnd(marker: UserMarker, newLat: number, newLng: number) {
		const isHousehold = marker.id.startsWith("hh-");
		const dbId = marker.id.split("-").slice(1).join("-");
		const token = localStorage.getItem("auth_token");
		const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };

		try {
			const url = isHousehold ? `${BACKEND_URL}/households/${dbId}` : `${BACKEND_URL}/poi/${dbId}`;
			const res = await fetch(url, {
				method: "PUT",
				headers,
				body: JSON.stringify({ latitude: newLat, longitude: newLng }),
			});
			if (!res.ok) throw new Error("Gagal memindahkan penanda");
			
			setUserMarkers((prev) =>
				prev.map((m) =>
					m.id === marker.id ? { ...m, lat: newLat, lng: newLng } : m
				)
			);
			toast.success(`Posisi "${marker.name}" berhasil diperbarui`);
			if (isHousehold) {
				setHouseholdsRefreshKey((k) => k + 1);
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Gagal memindahkan penanda");
		}
	}

	// FULL BLEED MAP LAYOUT
	if (useLeaflet) {
		return (
			<DndContext
				sensors={sensors}
				onDragStart={(e) => setDraggedItemId((e.active.data.current as any)?.itemId ?? null)}
				onDragEnd={handleDragEnd}
				onDragCancel={() => setDraggedItemId(null)}
			>
			<AppShell activePath="/dashboard/poverty" fullBleed onExitFullBleed={() => setUseLeaflet(false)}>
				<div ref={mapContainerRef} className="relative w-full h-full overflow-hidden">
					<MapDropZone />
					{/* Leaflet Map filling the screen */}
					<LeafletMap
						mode="poverty"
						mapStyle={mapStyle}
						userMarkers={userMarkers}
						onMapClick={(lat, lng) => {
							if (placingMarkerType && !editingMarker) {
								setPendingClick({ lat, lng });
							}
						}}
						onMarkerClick={(marker) => {
							if (!placingMarkerType) setEditingMarker(marker);
						}}
						onMapReady={(map) => { mapInstanceRef.current = map; }}
						dragDropEnabled={dragDropEnabled}
						onMarkerDragEnd={handleMarkerDragEnd}
					/>

					{/* Placing Marker Banner — hidden while the dialog is open */}
					{placingMarkerType && !pendingClick && (
						<div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] bg-background/95 backdrop-blur-md border border-primary/20 px-4 py-2 rounded-full shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
							<span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
								<span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
								Menempatkan {PLACING_LABELS[placingMarkerType] ?? placingMarkerType.replace("-", " ")}... Klik pada peta untuk menentukan posisi
							</span>
							<button
								onClick={() => setPlacingMarkerType(null)}
								className="text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground border px-2 py-0.5 rounded-full transition-colors"
							>
								Batal
							</button>
						</div>
					)}

					{/* Floating Legend HUD overlay */}
					<PovertyHud />

					{/* Floating Collection Grid Disclosure */}
					<div className="absolute bottom-6 right-4 z-[999] max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar pointer-events-auto">
						<PovertyDisclosureCard
							mapStyle={mapStyle}
							onMapStyleChange={setMapStyle}
							activeTool={placingMarkerType}
							onToolSelect={setPlacingMarkerType}
							demographics={demographics}
							compact
							dragDropEnabled={dragDropEnabled}
							onDragDropToggle={setDragDropEnabled}
						/>
					</div>

					{/* Marker Placement Dialog (households + non-religion POIs) */}
					<MarkerPlacementDialog
						open={!!pendingClick && placingMarkerType !== "religion"}
						onOpenChange={(v) => { if (!v) { setPendingClick(null); setPlacingMarkerType(null); } }}
						markerType={placingMarkerType ?? "marker"}
						pendingClick={pendingClick}
						onConfirm={(marker) => {
							setUserMarkers((prev) => [...prev, marker]);
							setPendingClick(null);
							setPlacingMarkerType(null);
							if (marker.type === "marker") setHouseholdsRefreshKey((k) => k + 1);
						}}
					/>

					{/* Religion Place Dialog */}
					<ReligionDialog
						open={!!pendingClick && placingMarkerType === "religion"}
						onOpenChange={(v) => { if (!v) { setPendingClick(null); setPlacingMarkerType(null); } }}
						pendingClick={pendingClick}
						onConfirm={(marker) => {
							setUserMarkers((prev) => [...prev, marker]);
							setPendingClick(null);
							setPlacingMarkerType(null);
						}}
					/>

					{/* Marker Edit/Delete Dialog */}
					<MarkerEditDialog
						open={!!editingMarker}
						onOpenChange={(v) => { if (!v) setEditingMarker(null); }}
						marker={editingMarker}
						onUpdated={(updated) => {
							setUserMarkers((prev) => prev.map((m) => m.id === updated.id ? updated : m));
							setEditingMarker(null);
							if (updated.type === "marker") setHouseholdsRefreshKey((k) => k + 1);
						}}
						onDeleted={(deleted) => {
							setUserMarkers((prev) => prev.filter((m) => m.id !== deleted.id));
							setEditingMarker(null);
							if (deleted.type === "marker") setHouseholdsRefreshKey((k) => k + 1);
						}}
					/>
				</div>
			</AppShell>

			{/* Drag overlay badge */}
			<DragOverlay>
				{draggedItemId && (
					<div className="flex items-center gap-1.5 rounded-full bg-foreground/90 px-3 py-1.5 text-xs font-medium text-background shadow-lg">
						<span className="capitalize">{PLACING_LABELS[draggedItemId] ?? draggedItemId.replace("-", " ")}</span>
					</div>
				)}
			</DragOverlay>
			</DndContext>
		);
	}

	// STANDARD DASHBOARD LAYOUT (DEFAULT)
	return (
		<AppShell activePath="/dashboard/poverty">
			<div className="flex flex-col gap-6">
				<MapPageHeader
					title="Statistik Kemiskinan"
					description="Statistik kemiskinan langsung dari data warga dan fasilitas yang terpetakan. Buka tampilan Leaflet untuk mengelola marker."
					onOpenMap={() => setUseLeaflet(true)}
					buttonText="Peta Kemiskinan"
					icon={<TrendingDownIcon className="h-4 w-4" />}
				/>

				{/* Unified Grid Layout */}
				<div className="grid grid-cols-1 gap-px bg-border border rounded-xl overflow-hidden md:grid-cols-2 lg:grid-cols-4 shadow-none">
					{/* Row 1: 4 stats cards (rendered inside PovertyStatsCards as direct children) */}
					<PovertyStatsCards overview={overview} />

					{/* Row 2: Trend Chart */}
					<div className="md:col-span-2 lg:col-start-1 lg:col-span-3 lg:row-start-2 lg:row-end-3 flex flex-col h-full">
						<PovertyTrendChart monthly={overview?.monthly ?? []} />
					</div>

					{/* Row 2: Inspector Top */}
					<div className="md:col-span-2 lg:col-start-4 lg:col-span-1 lg:row-start-2 lg:row-end-3 flex flex-col h-full">
						<PovertyInspectorTop selected={selectedHousehold} />
					</div>

					{/* Row 3: Inspector Bottom */}
					<div className="md:col-span-2 lg:col-start-4 lg:col-span-1 lg:row-start-3 lg:row-end-4 flex flex-col h-full">
						<PovertyInspectorBottom selected={selectedHousehold} />
					</div>

					{/* Row 3: Directory */}
					<div className="md:col-span-2 lg:col-start-1 lg:col-span-3 lg:row-start-3 lg:row-end-4 flex flex-col h-full">
						<PovertyDirectory
							searchQuery={searchQuery}
							setSearchQuery={setSearchQuery}
							households={households}
							selectedId={selectedHousehold?.id ?? null}
							onSelect={(h) => setSelectedHouseholdId(h.id)}
						/>
					</div>

					{/* Row 4: Fuzzy Priority Distribution */}
					<FuzzyPriorityStats
						refreshKey={householdsRefreshKey}
						onRecomputed={() => setHouseholdsRefreshKey((k) => k + 1)}
					/>

					{/* Row 5: Households Table (full width) */}
					<div className="md:col-span-2 lg:col-span-4 flex flex-col h-full">
						<PovertyHouseholdsTable rows={households} loading={householdsLoading} />
					</div>
				</div>

			</div>
		</AppShell>
	);
}
