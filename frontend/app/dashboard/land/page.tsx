"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { AppShell } from "@/components/app-shell";
import { MapPageHeader } from "@/components/maps/map-page-header";
import { LandStatsCards } from "@/components/land/land-stats-cards";
import { LandAllocationChart } from "@/components/land/land-allocation-chart";
import { LandDirectory } from "@/components/land/land-directory";
import { LandInspectorTop, LandInspectorBottom } from "@/components/land/land-inspector";
import { LAND_MARKER_LABELS } from "@/lib/map-data";
import { LayersIcon } from "@/components/ui/phosphor-icons";
import { LandDisclosureCard } from "@/components/ui/collection-grid-disclosure";
import {
	ShapePlacementDialog,
	LAND_STATUSES,
	calcLineLength,
	calcPolygonArea,
} from "@/components/land/shape-placement-dialog";
import { ShapeEditDialog } from "@/components/land/shape-edit-dialog";
import type { UserMarker } from "@/components/leaflet-map";
import { toast } from "sonner";

const LeafletMap = dynamic(() => import("@/components/leaflet-map"), { ssr: false });

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

function authHeaders(json = false) {
	const token = localStorage.getItem("auth_token");
	return { ...(json ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export default function LandMapPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [visibilityFilters, setVisibilityFilters] = useState<Record<string, boolean>>({
		marker: true,
		flag: true,
		protected: true,
		registry: true,
		line: true,
		polygon: true,
		circle: true,
	});

	const [useLeaflet, setUseLeaflet] = useState(false);
	const [mapStyle, setMapStyle] = useState<"street" | "satellite">("street");
	const [hydrated, setHydrated] = useState(false);
	const [userMarkers, setUserMarkers] = useState<UserMarker[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [placingMarkerType, setPlacingMarkerType] = useState<string | null>(null);
	const [dragDropEnabled, setDragDropEnabled] = useState(false);
	const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

	// Shape/marker dialog state
	const [pendingShape, setPendingShape] = useState<UserMarker | null>(null);
	const [editingShape, setEditingShape] = useState<UserMarker | null>(null);

	// Hydrate persisted view state from sessionStorage on mount
	useEffect(() => {
		setUseLeaflet(sessionStorage.getItem("land_useLeaflet") === "true");
		setMapStyle((sessionStorage.getItem("land_mapStyle") as "street" | "satellite") ?? "street");
		const storedFilters = sessionStorage.getItem("land_visibilityFilters");
		if (storedFilters) {
			try {
				setVisibilityFilters(JSON.parse(storedFilters));
			} catch {
				/* keep defaults */
			}
		}
		setSelectedItemId(sessionStorage.getItem("land_selectedItemId"));
		setHydrated(true);
	}, []);

	useEffect(() => { if (hydrated) sessionStorage.setItem("land_useLeaflet", String(useLeaflet)); }, [useLeaflet, hydrated]);
	useEffect(() => { if (hydrated) sessionStorage.setItem("land_mapStyle", mapStyle); }, [mapStyle, hydrated]);
	useEffect(() => { if (hydrated) sessionStorage.setItem("land_visibilityFilters", JSON.stringify(visibilityFilters)); }, [visibilityFilters, hydrated]);
	useEffect(() => {
		if (!hydrated) return;
		if (selectedItemId) sessionStorage.setItem("land_selectedItemId", selectedItemId);
		else sessionStorage.removeItem("land_selectedItemId");
	}, [selectedItemId, hydrated]);

	// Always-on data fetch — feeds both the dashboard widgets and the map.
	useEffect(() => {
		const token = localStorage.getItem("auth_token");
		const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

		Promise.allSettled([
			fetch(`${BACKEND_URL}/land/markers`, { headers }).then((r) => r.json()),
			fetch(`${BACKEND_URL}/land/shapes`, { headers }).then((r) => r.json()),
		]).then(([markersResult, shapesResult]) => {
			const markerRows = markersResult.status === "fulfilled" && Array.isArray(markersResult.value) ? markersResult.value : [];
			const shapeRows = shapesResult.status === "fulfilled" && Array.isArray(shapesResult.value) ? shapesResult.value : [];

			const pointMarkers: UserMarker[] = markerRows.map((r: any) => ({
				id: `lm-${r.id}`,
				lat: parseFloat(r.latitude),
				lng: parseFloat(r.longitude),
				type: r.marker_type,
				name: r.name,
				meta: {
					notes: r.notes ?? undefined,
					created_by_username: r.created_by_username ?? undefined,
					created_at: r.created_at ?? undefined,
					updated_at: r.updated_at ?? undefined,
				},
			}));

			const shapeMarkers: UserMarker[] = shapeRows.map((r: any) => ({
				id: `ls-${r.id}`,
				lat: parseFloat(r.latitude),
				lng: parseFloat(r.longitude),
				type: r.shape_type,
				name: r.name,
				meta: {
					poi_type: r.status ?? undefined,
					coordinates: r.coordinates ?? undefined,
					radius: r.radius_meters != null ? parseFloat(r.radius_meters) : undefined,
					notes: r.notes ?? undefined,
					created_by_username: r.created_by_username ?? undefined,
					created_at: r.created_at ?? undefined,
					updated_at: r.updated_at ?? undefined,
				},
			}));

			setUserMarkers([...pointMarkers, ...shapeMarkers]);
		});
	}, [refreshKey]);

	const landMarkerItems = useMemo(() => userMarkers.filter((m) => m.id.startsWith("lm-")), [userMarkers]);
	const landShapeItems = useMemo(() => userMarkers.filter((m) => m.id.startsWith("ls-")), [userMarkers]);

	const filteredItems = useMemo(() => {
		const q = searchQuery.toLowerCase();
		return userMarkers.filter((m) => {
			const label = LAND_MARKER_LABELS[m.type] ?? m.type;
			return m.name.toLowerCase().includes(q) || label.toLowerCase().includes(q);
		});
	}, [searchQuery, userMarkers]);

	const aggregateStats = useMemo(() => {
		let totalAreaHa = 0;
		let totalRoadKm = 0;
		landShapeItems.forEach((m) => {
			if (m.type === "polygon" && m.meta?.coordinates) totalAreaHa += calcPolygonArea(m.meta.coordinates) / 10000;
			else if (m.type === "line" && m.meta?.coordinates) totalRoadKm += calcLineLength(m.meta.coordinates) / 1000;
		});
		return {
			totalParcelArea: totalAreaHa.toLocaleString(undefined, { maximumFractionDigits: 1 }),
			totalRoadLength: totalRoadKm.toLocaleString(undefined, { maximumFractionDigits: 1 }),
			activeMarkers: landMarkerItems.length,
		};
	}, [landShapeItems, landMarkerItems]);

	const pieChartData = useMemo(() => {
		const totals: Record<string, number> = {};
		landShapeItems.forEach((m) => {
			if (m.type === "polygon" && m.meta?.coordinates) {
				const status = m.meta.poi_type ?? "Unknown";
				totals[status] = (totals[status] ?? 0) + calcPolygonArea(m.meta.coordinates) / 10000;
			}
		});
		return Object.entries(totals).map(([status, value]) => {
			const found = LAND_STATUSES.find((s) => s.value === status);
			return { name: found?.label ?? status, value: parseFloat(value.toFixed(1)), color: found?.color ?? "#6b7280" };
		});
	}, [landShapeItems]);

	const selectedItem = useMemo(() => userMarkers.find((m) => m.id === selectedItemId) ?? null, [selectedItemId, userMarkers]);

	const recentFlags = useMemo(
		() => landMarkerItems
			.filter((m) => m.type === "flag")
			.sort((a, b) => (b.meta?.created_at ?? "").localeCompare(a.meta?.created_at ?? ""))
			.slice(0, 2),
		[landMarkerItems]
	);

	const toggleFilter = (type: string) => {
		setVisibilityFilters((prev) => ({
			...prev,
			[type]: !prev[type],
		}));
	};

	async function handleConfirmPlacement(item: UserMarker) {
		const isPointType = !["line", "polygon", "circle"].includes(item.type);
		try {
			const res = await fetch(`${BACKEND_URL}/land/${isPointType ? "markers" : "shapes"}`, {
				method: "POST",
				headers: authHeaders(true),
				body: JSON.stringify(
					isPointType
						? { name: item.name, marker_type: item.type, latitude: item.lat, longitude: item.lng, notes: item.meta?.notes ?? null }
						: {
								name: item.name,
								shape_type: item.type,
								status: item.meta?.poi_type ?? null,
								latitude: item.lat,
								longitude: item.lng,
								coordinates: item.meta?.coordinates ?? null,
								radius_meters: item.meta?.radius ?? null,
								notes: item.meta?.notes ?? null,
							}
				),
			});
			if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Gagal menyimpan");
			setPendingShape(null);
			setRefreshKey((k) => k + 1);
			toast.success(`"${item.name}" berhasil disimpan`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
		}
	}

	async function handleUpdateItem(updated: UserMarker) {
		const isMarker = updated.id.startsWith("lm-");
		const dbId = updated.id.split("-").slice(1).join("-");
		const url = `${BACKEND_URL}/land/${isMarker ? "markers" : "shapes"}/${dbId}`;
		const body = isMarker
			? { name: updated.name, marker_type: updated.type, notes: updated.meta?.notes ?? null }
			: { name: updated.name, shape_type: updated.type, status: updated.meta?.poi_type ?? null, notes: updated.meta?.notes ?? null };
		try {
			const res = await fetch(url, { method: "PUT", headers: authHeaders(true), body: JSON.stringify(body) });
			if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Gagal memperbarui");
			setEditingShape(null);
			setRefreshKey((k) => k + 1);
			toast.success(`"${updated.name}" berhasil diperbarui`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Gagal memperbarui");
		}
	}

	async function handleDeleteItem(deleted: UserMarker) {
		const isMarker = deleted.id.startsWith("lm-");
		const dbId = deleted.id.split("-").slice(1).join("-");
		try {
			const res = await fetch(`${BACKEND_URL}/land/${isMarker ? "markers" : "shapes"}/${dbId}`, { method: "DELETE", headers: authHeaders() });
			if (!res.ok) throw new Error("Gagal menghapus");
			setEditingShape(null);
			if (selectedItemId === deleted.id) setSelectedItemId(null);
			setRefreshKey((k) => k + 1);
			toast.success(`"${deleted.name}" berhasil dihapus`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Gagal menghapus");
		}
	}

	async function handleMarkerDragEnd(marker: UserMarker, newLat: number, newLng: number) {
		const isMarker = marker.id.startsWith("lm-");
		const dbId = marker.id.split("-").slice(1).join("-");
		try {
			const res = await fetch(`${BACKEND_URL}/land/${isMarker ? "markers" : "shapes"}/${dbId}`, {
				method: "PUT",
				headers: authHeaders(true),
				body: JSON.stringify({ latitude: newLat, longitude: newLng }),
			});
			if (!res.ok) throw new Error("Gagal memindahkan penanda");
			setUserMarkers((prev) => prev.map((m) => (m.id === marker.id ? { ...m, lat: newLat, lng: newLng } : m)));
			toast.success(`Posisi "${marker.name}" berhasil diperbarui`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Gagal memindahkan penanda");
		}
	}

	// FULL BLEED MAP LAYOUT
	if (useLeaflet) {
		return (
			<AppShell activePath="/dashboard/land" fullBleed onExitFullBleed={() => setUseLeaflet(false)}>
				<div className="relative w-full h-full overflow-hidden">
					{/* Leaflet Map */}
					<LeafletMap
						mode="land"
						visibilityFilters={visibilityFilters}
						mapStyle={mapStyle}
						userMarkers={userMarkers}
						placingMarkerType={placingMarkerType}
						onShapeCreated={(shape) => {
							// Open placement dialog instead of adding directly
							setPendingShape(shape);
							setPlacingMarkerType(null);
						}}
						onMarkerClick={(marker) => {
							setEditingShape(marker);
							setSelectedItemId(marker.id);
						}}
						onMapClick={(lat, lng) => {
							if (placingMarkerType && !["line", "polygon", "circle"].includes(placingMarkerType)) {
								setPendingShape({ id: `pending-${Date.now()}`, lat, lng, type: placingMarkerType, name: "" });
								setPlacingMarkerType(null);
							}
						}}
						dragDropEnabled={dragDropEnabled}
						onMarkerDragEnd={handleMarkerDragEnd}
					/>

					{/* Placing Marker Banner */}
					{placingMarkerType && (
						<div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] bg-background/95 backdrop-blur-md border border-primary/20 px-4 py-2 rounded-full shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
							<span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
								<span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
								Menempatkan {LAND_MARKER_LABELS[placingMarkerType] ?? placingMarkerType.replace("-", " ")}... Klik pada peta untuk menentukan posisi
							</span>
							<button
								onClick={() => setPlacingMarkerType(null)}
								className="text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground border px-2 py-0.5 rounded-full transition-colors"
							>
								Batal
							</button>
						</div>
					)}

					{/* Floating Collection Grid Disclosure */}
					<div className="absolute bottom-6 right-4 z-[999] max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar pointer-events-auto">
						<LandDisclosureCard
							mapStyle={mapStyle}
							onMapStyleChange={setMapStyle}
							activeTool={placingMarkerType}
							onToolSelect={setPlacingMarkerType}
							compact
							dragDropEnabled={dragDropEnabled}
							onDragDropToggle={setDragDropEnabled}
						/>
					</div>

					{/* Shape Placement Dialog */}
					<ShapePlacementDialog
						open={!!pendingShape}
						onOpenChange={(v) => { if (!v) setPendingShape(null); }}
						pendingShape={pendingShape}
						onConfirm={handleConfirmPlacement}
					/>

					{/* Shape Edit Dialog */}
					<ShapeEditDialog
						open={!!editingShape}
						onOpenChange={(v) => { if (!v) setEditingShape(null); }}
						shape={editingShape}
						onUpdated={handleUpdateItem}
						onDeleted={handleDeleteItem}
					/>
				</div>
			</AppShell>
		);
	}

	// STANDARD DASHBOARD LAYOUT
	return (
		<AppShell activePath="/dashboard/land">
			<div className="flex flex-col gap-6">
				{/* Top Header Card */}
				<MapPageHeader
					title="Statistik Penggunaan Lahan"
					description="Klasifikasi GIS, catatan kepemilikan, dan registrasi luas zona. Buka tampilan Leaflet JS untuk memeriksa pemetaan geografis."
					onOpenMap={() => setUseLeaflet(true)}
					buttonText="Peta Lahan"
					icon={<LayersIcon className="h-4 w-4" />}
				/>

				{/* Unified Grid Layout */}
				<div className="grid grid-cols-1 gap-px bg-border border rounded-xl overflow-hidden md:grid-cols-2 lg:grid-cols-3 shadow-none">
					{/* Row 1: 3 stats cards (rendered inside LandStatsCards as direct children) */}
					<LandStatsCards aggregateStats={aggregateStats} />

					{/* Row 2: Allocation Chart */}
					<div className="md:col-span-2 lg:col-start-1 lg:col-span-2 lg:row-start-2 lg:row-end-3 flex flex-col h-full">
						<LandAllocationChart pieChartData={pieChartData} />
					</div>

					{/* Row 2: Inspector Top */}
					<div className="md:col-span-2 lg:col-start-3 lg:col-span-1 lg:row-start-2 lg:row-end-3 flex flex-col h-full">
						<LandInspectorTop
							selectedItem={selectedItem}
							visibilityFilters={visibilityFilters}
							toggleFilter={toggleFilter}
						/>
					</div>

					{/* Row 3: Inspector Bottom */}
					<div className="md:col-span-2 lg:col-start-3 lg:col-span-1 lg:row-start-3 lg:row-end-4 flex flex-col h-full">
						<LandInspectorBottom recentFlags={recentFlags} />
					</div>

					{/* Row 3: Directory */}
					<div className="md:col-span-2 lg:col-start-1 lg:col-span-2 lg:row-start-3 lg:row-end-4 flex flex-col h-full">
						<LandDirectory
							searchQuery={searchQuery}
							setSearchQuery={setSearchQuery}
							filteredItems={filteredItems}
							selectedItemId={selectedItemId}
							visibilityFilters={visibilityFilters}
							onSelectItem={(item) => setSelectedItemId(item.id)}
						/>
					</div>
				</div>

			</div>
		</AppShell>
	);
}
