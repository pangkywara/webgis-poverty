"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */


import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { AppShell } from "@/components/app-shell";
import { MapPageHeader } from "@/components/maps/map-page-header";
import { GasStationStatsCards } from "@/components/gas-station/gas-station-stats-cards";
import { GasStationDirectory } from "@/components/gas-station/gas-station-directory";
import { GasStationInspector } from "@/components/gas-station/gas-station-inspector";
import { PertaminaPriceTable } from "@/components/gas-station/pertamina-price-table";
import { GasStationHud } from "@/components/gas-station/gas-station-hud";
import { GasStationDisclosureCard } from "@/components/ui/collection-grid-disclosure";
import type { UserMarker } from "@/components/leaflet-map";
import { FuelIcon } from "@/components/ui/phosphor-icons";
import { StationPlacementDialog } from "@/components/gas-station/station-placement-dialog";
import { StationEditDialog } from "@/components/gas-station/station-edit-dialog";
import { toast } from "sonner";

const PLACING_LABELS: Record<string, string> = {
	"charging-station": "Pengisi Daya EV",
	"gas-pump": "SPBU",
	wrench: "Bengkel",
};

const LeafletMap = dynamic(() => import("@/components/leaflet-map"), { ssr: false });
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export default function GasStationMapPage() {
	const [selectedStation, setSelectedStation] = useState<UserMarker | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [brandFilter, setBrandFilter] = useState<string>("All");
	const [fuelPriceDisplay, setFuelPriceDisplay] = useState<"ron92" | "ron95" | "diesel">("ron95");
	const [evOnlyFilter, setEvOnlyFilter] = useState(false);
	const [useLeaflet, setUseLeaflet] = useState(false);
	const [mapStyle, setMapStyle] = useState<"street" | "satellite">("street");
	const [userMarkers, setUserMarkers] = useState<UserMarker[]>([]);
	const [placingMarkerType, setPlacingMarkerType] = useState<string | null>(null);
	const [dragDropEnabled, setDragDropEnabled] = useState(false);

	// Custom Marker Dialog State
	const [pendingClick, setPendingClick] = useState<{ lat: number; lng: number } | null>(null);
	const [pendingMarkerType, setPendingMarkerType] = useState<string | null>(null);
	const [editingMarker, setEditingMarker] = useState<UserMarker | null>(null);

	const [hydrated, setHydrated] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);
	const [fuelPrices, setFuelPrices] = useState<any>(null);
	const [fuelPricesLoading, setFuelPricesLoading] = useState(true);

	// Fetch dynamic Pertamina fuel prices
	useEffect(() => {
		setFuelPricesLoading(true);
		fetch(`${BACKEND_URL}/gas-station/fuel-prices`)
			.then((res) => res.json())
			.then((data) => {
				if (data && data.succeeded) {
					setFuelPrices(data);
				}
			})
			.catch((err) => console.error("Gagal memuat harga BBM:", err))
			.finally(() => setFuelPricesLoading(false));
	}, []);

	const filteredStations = useMemo(() => {
		return userMarkers.filter((st) => {
			const matchesSearch = st.name.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesBrand = brandFilter === "All" || (st.type === "gas-pump" && st.meta?.poi_type === brandFilter);
			const matchesEv = !evOnlyFilter || st.type === "charging-station";
			return matchesSearch && matchesBrand && matchesEv;
		});
	}, [userMarkers, searchQuery, brandFilter, evOnlyFilter]);

	const activeSelectedStation = useMemo(() => {
		if (filteredStations.length === 0) return null;
		const found = filteredStations.find((st) => st.id === selectedStation?.id);
		if (found) return found;
		return filteredStations[0];
	}, [filteredStations, selectedStation]);

	// Load existing markers when page loads or refreshKey changes
	useEffect(() => {
		const token = localStorage.getItem("auth_token");
		const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

		fetch(`${BACKEND_URL}/gas-station/markers`, { headers })
			.then((r) => r.json())
			.then((rows) => {
				if (Array.isArray(rows)) {
					const mapped = rows.map((row: any) => {
						let finalPoiType = "";
						let finalNotes = "";

						if (row.marker_category === "charging-station") {
							finalPoiType = row.sub_type;
							finalNotes = row.status ? `Status: ${row.status}` : "";
						} else if (row.marker_category === "gas-pump") {
							finalPoiType = row.brand;
							finalNotes = row.operating_hours ? `Jam: ${row.operating_hours}` : "";
						} else if (row.marker_category === "wrench") {
							finalPoiType = row.sub_type;
							finalNotes = row.status;
						}

						return {
							id: `gsm-${row.id}`,
							lat: parseFloat(row.latitude),
							lng: parseFloat(row.longitude),
							type: row.marker_category,
							name: row.name,
							meta: {
								poi_type: finalPoiType,
								notes: finalNotes,
								gas_types: row.gas_types || undefined,
							},
						};
					});
					setUserMarkers(mapped);
				}
			})
			.catch((err) => {
				console.error("Gagal memuat markers:", err);
			});
	}, [refreshKey]);

	// Session storage synchronization (identical pattern to poverty)
	useEffect(() => {
		setUseLeaflet(sessionStorage.getItem("gas_useLeaflet") === "true");
		setMapStyle((sessionStorage.getItem("gas_mapStyle") as "street" | "satellite") ?? "street");
		setBrandFilter(sessionStorage.getItem("gas_brandFilter") ?? "All");
		setFuelPriceDisplay((sessionStorage.getItem("gas_fuelPriceDisplay") as "ron92" | "ron95" | "diesel") ?? "ron95");
		setHydrated(true);
	}, []);

	useEffect(() => { if (hydrated) sessionStorage.setItem("gas_useLeaflet", String(useLeaflet)); }, [useLeaflet, hydrated]);
	useEffect(() => { if (hydrated) sessionStorage.setItem("gas_mapStyle", mapStyle); }, [mapStyle, hydrated]);
	useEffect(() => { if (hydrated) sessionStorage.setItem("gas_brandFilter", brandFilter); }, [brandFilter, hydrated]);
	useEffect(() => { if (hydrated) sessionStorage.setItem("gas_fuelPriceDisplay", fuelPriceDisplay); }, [fuelPriceDisplay, hydrated]);

	// FULL BLEED MAP LAYOUT
	if (useLeaflet) {
		return (
			<AppShell activePath="/dashboard/gas-station" fullBleed onExitFullBleed={() => setUseLeaflet(false)}>
				<div className="relative w-full h-full overflow-hidden">
					{/* Leaflet Map */}
					<LeafletMap
						mode="gas-station"
						selectedId={activeSelectedStation?.id}
						onSelect={(id) => {
							const found = userMarkers.find((st) => st.id === id);
							if (found) setSelectedStation(found);
						}}
						fuelPriceDisplay={fuelPriceDisplay}
						mapStyle={mapStyle}
						userMarkers={userMarkers}
						onMarkerClick={(m) => {
							if (["charging-station", "gas-pump", "wrench"].includes(m.type)) {
								setEditingMarker(m);
							}
						}}
						onMapClick={(lat, lng) => {
							if (placingMarkerType) {
								setPendingClick({ lat, lng });
								setPendingMarkerType(placingMarkerType);
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

					{/* Floating Filters HUD */}
					<GasStationHud
						fuelPriceDisplay={fuelPriceDisplay}
						setFuelPriceDisplay={setFuelPriceDisplay}
						brandFilter={brandFilter}
						setBrandFilter={setBrandFilter}
						onCloseMap={() => setUseLeaflet(false)}
					/>

					{/* Floating Collection Grid Disclosure */}
					<div className="absolute bottom-6 right-4 z-[999] max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar pointer-events-auto">
						<GasStationDisclosureCard
							mapStyle={mapStyle}
							onMapStyleChange={setMapStyle}
							activeTool={placingMarkerType}
							onToolSelect={setPlacingMarkerType}
							compact
							dragDropEnabled={dragDropEnabled}
							onDragDropToggle={setDragDropEnabled}
						/>
					</div>

					{/* Placement Dialog */}
					<StationPlacementDialog
						open={!!pendingClick}
						onOpenChange={(v) => { if (!v) { setPendingClick(null); setPendingMarkerType(null); } }}
						pendingClick={pendingClick}
						markerType={pendingMarkerType}
						onConfirm={(newMarker) => {
							setUserMarkers((prev) => [...prev, newMarker]);
							setPendingClick(null);
							setPendingMarkerType(null);
							setRefreshKey((k) => k + 1);
						}}
					/>

					{/* Edit Dialog */}
					<StationEditDialog
						open={!!editingMarker}
						onOpenChange={(v) => { if (!v) setEditingMarker(null); }}
						marker={editingMarker}
						onUpdated={(updated) => {
							setUserMarkers((prev) => prev.map((m) => m.id === updated.id ? updated : m));
							setEditingMarker(null);
							setRefreshKey((k) => k + 1);
						}}
						onDeleted={(deleted) => {
							setUserMarkers((prev) => prev.filter((m) => m.id !== deleted.id));
							setEditingMarker(null);
							setRefreshKey((k) => k + 1);
						}}
					/>
				</div>
			</AppShell>
		);
	}

	async function handleMarkerDragEnd(marker: UserMarker, newLat: number, newLng: number) {
		const dbId = marker.id.split("-").slice(1).join("-");
		const token = localStorage.getItem("auth_token");
		const headers = {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		};

		try {
			const res = await fetch(`${BACKEND_URL}/gas-station/markers/${dbId}`, {
				method: "PUT",
				headers,
				body: JSON.stringify({ latitude: newLat, longitude: newLng }),
			});

			if (!res.ok) throw new Error("Gagal memperbarui posisi di server");

			setUserMarkers((prev) =>
				prev.map((m) =>
					m.id === marker.id ? { ...m, lat: newLat, lng: newLng } : m
				)
			);
			toast.success(`Posisi "${marker.name}" berhasil diperbarui`);
			setRefreshKey((k) => k + 1);
		} catch (err) {
			console.error(err);
			toast.error(err instanceof Error ? err.message : "Gagal memindahkan penanda");
		}
	}

	// STANDARD DASHBOARD LAYOUT
	return (
		<AppShell activePath="/dashboard/gas-station">
			<div className="flex flex-col gap-6">
				{/* Top Header Card */}
				<MapPageHeader
					title="Pencari SPBU & Charger"
					description="Pencari stasiun waktu nyata, indeks harga, info antrean, dan pengisi daya EV. Buka tampilan Leaflet JS untuk memeriksa koordinat pemetaan."
					onOpenMap={() => setUseLeaflet(true)}
					buttonText="Peta Stasiun"
					icon={<FuelIcon className="h-4 w-4" />}
				/>

				{/* Unified Grid Layout */}
				<div className="grid grid-cols-1 gap-px bg-border border rounded-xl overflow-hidden md:grid-cols-2 lg:grid-cols-4 shadow-none">
					{/* Row 1: 4 stats cards (rendered inside GasStationStatsCards as direct children) */}
					<GasStationStatsCards fuelPrices={fuelPrices} loading={fuelPricesLoading} />

					{/* Row 2: Directory */}
					<div className="md:col-span-2 lg:col-span-3 flex flex-col h-full">
						<GasStationDirectory
							searchQuery={searchQuery}
							setSearchQuery={setSearchQuery}
							brandFilter={brandFilter}
							setBrandFilter={setBrandFilter}
							evOnlyFilter={evOnlyFilter}
							setEvOnlyFilter={setEvOnlyFilter}
							filteredStations={filteredStations}
							selectedStationId={activeSelectedStation?.id ?? ""}
							onSelectStation={setSelectedStation}
						/>
					</div>

					{/* Row 2: Inspector (right column) */}
					<div className="md:col-span-2 lg:col-span-1 flex flex-col h-full">
						<GasStationInspector selectedStation={activeSelectedStation} />
					</div>
					{/* Row 3: Pricing Table (full width) */}
					<div className="md:col-span-2 lg:col-span-4 flex flex-col h-full">
						<PertaminaPriceTable fuelPrices={fuelPrices} loading={fuelPricesLoading} />
					</div>
				</div>

			</div>
		</AppShell>
	);
}
