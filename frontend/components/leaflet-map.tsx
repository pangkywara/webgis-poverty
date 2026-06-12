"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BRAND_COLORS } from "@/lib/map-data";

export interface UserMarker {
	id: string;
	lat: number;
	lng: number;
	type: string;
	name: string;
	meta?: {
		poverty_level?: string;
		family_count?: number;
		penghasilan?: number;
		fuzzy_label?: string;
		fuzzy_score?: number;
		fuzzy_detail?: Record<string, { kategori: string; derajat: number }>;
		notes?: string;
		poi_type?: string;
		radius?: number;
		coordinates?: [number, number][];
		gas_types?: string[];
		created_by_username?: string;
		created_at?: string;
		updated_at?: string;
	};
}

interface LeafletMapProps {
	mode: "poverty" | "land" | "gas-station";
	selectedYear?: number;
	selectedId?: string;
	onSelect?: (id: string) => void;
	visibilityFilters?: Record<string, boolean>;
	fuelPriceDisplay?: "ron92" | "ron95" | "diesel";
	fullBleed?: boolean;
	mapStyle?: "street" | "satellite";
	onMapClick?: (lat: number, lng: number) => void;
	userMarkers?: UserMarker[];
	onMarkerClick?: (marker: UserMarker) => void;
	onMapReady?: (mapInstance: any) => void;
	onShapeCreated?: (shape: UserMarker) => void;
	placingMarkerType?: string | null;
	dragDropEnabled?: boolean;
	onMarkerDragEnd?: (marker: UserMarker, newLat: number, newLng: number) => void;
}

const POVERTY_LEVEL_COLOR: Record<string, string> = {
	Extreme: "#ef4444",
	Miskin:  "#f59e0b",
	Rentan:  "#3b82f6",
};
const FUZZY_LABEL_COLOR: Record<string, string> = {
	"SANGAT TINGGI":  "#ef4444",
	"TINGGI":         "#f97316",
	"SEDANG":         "#f59e0b",
	"RENDAH":         "#10b981",
	"TIDAK PRIORITAS":"#6b7280",
};

function fmt(n: number) {
	return "Rp " + n.toLocaleString("id-ID");
}

const POI_TYPE_LABELS: Record<string, string> = {
	marker: "Data Warga",
	mosque: "Masjid",
	church: "Gereja",
	cathedral: "Gereja Katolik",
	temple: "Pura",
	vihara: "Vihara",
	klenteng: "Klenteng",
	synagogue: "Sinagog",
	clinic: "Klinik",
	"food-bank": "Lumbung Pangan",
	school: "Sekolah",
	flag: "Tengara",
	protected: "Kawasan Lindung",
	registry: "Kantor Pendaftaran",
	"charging-station": "Pengisi Daya EV",
	"gas-pump": "SPBU",
	wrench: "Bengkel",
	line: "Garis",
	polygon: "Poligon",
	circle: "Lingkaran",
};

function buildMarkerTooltip(m: UserMarker): string {
	const meta = m.meta;
	const isHousehold = m.type === "marker";
	const typeLabel = POI_TYPE_LABELS[m.type] ?? m.type.replace(/-/g, " ");

	const base = `
		<div style="font-family:system-ui,sans-serif;min-width:160px;max-width:220px;">
			<div style="font-size:13px;font-weight:700;margin-bottom:4px;border-bottom:1px solid rgba(0,0,0,0.1);padding-bottom:4px;">
				${m.name}
			</div>`;

	if (isHousehold && meta) {
		const lvlColor = POVERTY_LEVEL_COLOR[meta.poverty_level ?? ""] ?? "#6b7280";
		const fuzzyColor = FUZZY_LABEL_COLOR[meta.fuzzy_label ?? ""] ?? "#6b7280";
		const displayPovertyLevel = meta.poverty_level === "Extreme" ? "Ekstrem" : (meta.poverty_level ?? "—");
		return base + `
			<div style="display:grid;grid-template-columns:auto 1fr;gap:2px 8px;font-size:11px;color:#374151;">
				<span style="color:#9ca3af;">Tingkat</span>
				<span style="font-weight:600;color:${lvlColor};">${displayPovertyLevel}</span>
				<span style="color:#9ca3af;">Tanggungan</span>
				<span>${meta.family_count ?? "—"} jiwa</span>
				<span style="color:#9ca3af;">Penghasilan</span>
				<span>${meta.penghasilan != null ? fmt(meta.penghasilan) : "—"}/bln</span>
				${meta.fuzzy_label ? `
				<span style="color:#9ca3af;">Prioritas</span>
				<span style="font-weight:600;color:${fuzzyColor};">${meta.fuzzy_label}</span>
				` : ""}
				${meta.fuzzy_score != null ? `
				<span style="color:#9ca3af;">Skor</span>
				<span>${meta.fuzzy_score.toFixed(2)}</span>
				` : ""}
				${meta.notes ? `
				<span style="color:#9ca3af;">Catatan</span>
				<span style="font-style:italic;">${meta.notes}</span>
				` : ""}
			</div>
			<div style="margin-top:4px;font-size:10px;color:#9ca3af;">
				${m.lat.toFixed(5)}, ${m.lng.toFixed(5)}
			</div>
		</div>`;
	}

	const gasTypesHtml = m.type === "gas-pump" && meta?.gas_types && meta.gas_types.length > 0
		? `<div style="margin-top:4px;margin-bottom:4px;display:flex;flex-wrap:wrap;gap:2px;">
				${meta.gas_types.map((gt: string) => `<span style="background-color:rgba(255,59,31,0.1);color:#ff3b1f;border:1px solid rgba(255,59,31,0.2);padding:1px 4px;border-radius:3px;font-size:9px;font-weight:600;white-space:nowrap;">${gt}</span>`).join("")}
			</div>`
		: "";

	return base + `
		<div style="font-size:11px;color:#6b7280;text-transform:capitalize;margin-bottom:4px;">${typeLabel}</div>
		${meta?.poi_type ? `<div style="font-size:11px;font-weight:600;color:#374151;margin-bottom:2px;">${meta.poi_type}</div>` : ""}
		${meta?.notes ? `<div style="font-size:11px;color:#374151;font-style:italic;margin-bottom:2px;">${meta.notes}</div>` : ""}
		${gasTypesHtml}
		<div style="margin-top:4px;font-size:10px;color:#9ca3af;">
			${m.lat.toFixed(5)}, ${m.lng.toFixed(5)}
		</div>
	</div>`;
}

export default function LeafletMap({
	mode,
	selectedYear = 2026,
	selectedId,
	onSelect,
	visibilityFilters,
	fuelPriceDisplay = "ron95",
	fullBleed = true,
	mapStyle = "street",
	onMapClick,
	userMarkers,
	onMarkerClick,
	onMapReady,
	onShapeCreated,
	placingMarkerType,
	dragDropEnabled = false,
	onMarkerDragEnd,
}: LeafletMapProps) {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapInstanceRef = useRef<any>(null);
	const [leafletLoaded, setLeafletLoaded] = useState(false);
	const layersRef = useRef<any[]>([]);
	const streetLayerRef = useRef<any>(null);
	const satelliteLayerRef = useRef<any>(null);

	// 1. Inject Leaflet JS/CSS and optionally Geoman for land drawing
	useEffect(() => {
		let isMounted = true;

		// Promise-based script loader that handles already-loaded scripts
		const loadScript = (id: string, src: string): Promise<void> => {
			return new Promise((resolve, reject) => {
				const existing = document.getElementById(id) as HTMLScriptElement | null;
				if (existing) {
					// Script tag exists — check if it already finished loading
					// by testing for the global it should have created
					if (id === "leaflet-js" && (window as any).L) { resolve(); return; }
					if (id === "geoman-js" && (window as any).L?.PM) { resolve(); return; }
					// Still loading — listen for completion
					const onLoad = () => { existing.removeEventListener("load", onLoad); resolve(); };
					const onError = () => { existing.removeEventListener("error", onError); reject(new Error(`Script ${id} failed`)); };
					existing.addEventListener("load", onLoad);
					existing.addEventListener("error", onError);
					return;
				}
				const script = document.createElement("script");
				script.id = id;
				script.src = src;
				script.async = true;
				script.onload = () => resolve();
				script.onerror = () => reject(new Error(`Failed to load ${src}`));
				document.body.appendChild(script);
			});
		};

		const loadAll = async () => {
			if (typeof window === "undefined") return;

			// Inject Leaflet CSS
			if (!document.getElementById("leaflet-css")) {
				const link = document.createElement("link");
				link.id = "leaflet-css";
				link.rel = "stylesheet";
				link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
				document.head.appendChild(link);
			}

			// Inject Geoman CSS for land mode
			if (mode === "land" && !document.getElementById("geoman-css")) {
				const link = document.createElement("link");
				link.id = "geoman-css";
				link.rel = "stylesheet";
				link.href = "https://unpkg.com/@geoman-io/leaflet-geoman-free@2.17.0/dist/leaflet-geoman.css";
				document.head.appendChild(link);
			}

			try {
				// Step 1: Load Leaflet core (skip if already loaded)
				if (!(window as any).L) {
					await loadScript("leaflet-js", "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");
				}

				// Step 2: For land mode, load Geoman AFTER Leaflet (skip if already loaded)
				if (mode === "land" && !(window as any).L?.PM) {
					await loadScript("geoman-js", "https://unpkg.com/@geoman-io/leaflet-geoman-free@2.17.0/dist/leaflet-geoman.js");
				}

				// Both scripts loaded — safe to create the map
				if (isMounted) setLeafletLoaded(true);
			} catch (err) {
				console.error("[LeafletMap] Script loading failed:", err);
				// Still allow non-land modes to proceed without Geoman
				if (mode !== "land" && (window as any).L && isMounted) {
					setLeafletLoaded(true);
				}
			}
		};

		loadAll();

		return () => {
			isMounted = false;
		};
	}, [mode]);

	// 2. Initialize Leaflet Map
	useEffect(() => {
		if (!leafletLoaded || !mapContainerRef.current) return;

		const L = (window as any).L;
		if (!L) return;

		// For land mode, verify Geoman is truly available before creating the map
		if (mode === "land" && !L.PM) {
			console.warn("[LeafletMap] Geoman not available for land mode — aborting map init");
			return;
		}

		// Create Map Instance centered in Pontianak
		const map = L.map(mapContainerRef.current, {
			center: [-0.055453066586343774, 109.34839801239819],
			zoom: 12,
			zoomControl: true
		});

		// Safety net: if Geoman loaded but map.pm is still undefined,
		// manually re-initialize Geoman on this map instance
		if (mode === "land" && L.PM && !map.pm) {
			try {
				L.PM.reInitLayer(map);
			} catch (e) {
				console.warn("[LeafletMap] L.PM.reInitLayer failed, trying manual init:", e);
				// Fallback: Geoman v2 attaches via addInitHook, try calling it directly
				if (typeof map._initPathRoot === "function") map._initPathRoot();
			}
		}

		// Hide Geoman's default toolbar — we drive drawing programmatically
		if (mode === "land" && map.pm) {
			try {
				map.pm.addControls({ position: "topleft" });
				map.pm.removeControls();
			} catch (_) { /* ignore */ }
		}

		const street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution: '&copy; OpenStreetMap contributors'
		});

		const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
			attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
		});

		streetLayerRef.current = street;
		satelliteLayerRef.current = satellite;

		// Only the active layer lives on the map — a hidden (opacity 0) tile
		// layer still downloads tiles on every pan/zoom.
		const active = mapStyle === "satellite" ? satellite : street;
		active.setOpacity(1);
		active.addTo(map);

		mapInstanceRef.current = map;
		onMapReady?.(map);

		return () => {
			if (mapInstanceRef.current) {
				mapInstanceRef.current.remove();
				mapInstanceRef.current = null;
			}
		};
	}, [leafletLoaded]);

	// 2.5 Handle Map Style Cross-Fade Animation
	useEffect(() => {
		const map = mapInstanceRef.current;
		const street = streetLayerRef.current;
		const satellite = satelliteLayerRef.current;
		if (!map || !street || !satellite) return;

		const incoming = mapStyle === "satellite" ? satellite : street;
		const outgoing = mapStyle === "satellite" ? street : satellite;

		if (!map.hasLayer(incoming)) {
			incoming.setOpacity(0);
			incoming.addTo(map);
		}
		if (!map.hasLayer(outgoing)) {
			// Initial mount — active layer already on the map, nothing to fade.
			incoming.setOpacity(1);
			return;
		}

		let rafId = 0;
		let start: number | null = null;
		const duration = 400; // 400ms transition

		const animate = (timestamp: number) => {
			if (!start) start = timestamp;
			const progress = Math.min((timestamp - start) / duration, 1);

			incoming.setOpacity(progress);
			outgoing.setOpacity(1 - progress);

			if (progress < 1) {
				rafId = requestAnimationFrame(animate);
			} else {
				// Detach the hidden layer so it stops requesting tiles.
				map.removeLayer(outgoing);
			}
		};

		rafId = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(rafId);
	}, [mapStyle, leafletLoaded]);

	// 3. Render Layers based on Props
	useEffect(() => {
		const map = mapInstanceRef.current;
		const L = (window as any).L;
		if (!map || !L) return;

		// Clear existing layers
		layersRef.current.forEach((layer) => map.removeLayer(layer));
		layersRef.current = [];

		if (mode === "poverty") {
			// Poverty mode renders only real data: household + POI markers from
			// the database (drawn below from userMarkers). No mock choropleth.
		} else if (mode === "land") {
			// Land mode renders only real data: land_markers + land_shapes from
			// the database (drawn below from userMarkers). No mock zone polygons.
		} else if (mode === "gas-station") {
			// Gas station mode renders only real data from the database (drawn below from userMarkers)
		}

		// Status-based colors for shapes
		const ROAD_STATUS_COLORS: Record<string, string> = {
			"National Road": "#ef4444",
			"Provincial Road": "#eab308",
			"Regency Road": "#22c55e",
		};
		const LAND_STATUS_COLORS: Record<string, string> = {
			"SHM": "#a855f7",
			"HGB": "#f97316",
			"HGU": "#14b8a6",
			"HP": "#ec4899",
		};

		// Draw User-Placed Markers and Shapes
		const RELIGION_TYPES = new Set(["mosque","church","cathedral","temple","vihara","klenteng","synagogue"]);
		if (userMarkers && userMarkers.length > 0) {
			userMarkers.forEach((m) => {
				// Visibility filter (land mode): skip rendering if this type is hidden.
				// visibilityFilters is undefined for poverty/gas-station, so this is a no-op there.
				if (visibilityFilters && visibilityFilters[m.type] === false) return;

				// Render user-placed polylines (lines)
				if (m.type === "line" && m.meta?.coordinates) {
					const validCoords = m.meta.coordinates.filter(
						(c: any) => Array.isArray(c) && typeof c[0] === "number" && !isNaN(c[0]) && typeof c[1] === "number" && !isNaN(c[1])
					);
					if (validCoords.length >= 2) {
						const lineColor = ROAD_STATUS_COLORS[m.meta?.poi_type ?? ""] ?? "#ff3b1f";
						const polyline = L.polyline(validCoords, {
							color: lineColor,
							weight: 4,
							opacity: 0.85
						}).addTo(map);

						const statusLabel = m.meta?.poi_type ? ` · ${m.meta.poi_type}` : "";
						polyline.bindTooltip(`<strong>${m.name}</strong><br/><span style="color:${lineColor}">GARIS${statusLabel}</span>`, { sticky: true });
						polyline.on("click", (e: any) => {
							e.originalEvent?.stopPropagation();
							onMarkerClick?.(m);
						});
						layersRef.current.push(polyline);
					}
					return;
				}

				// Render user-placed polygons
				if (m.type === "polygon" && m.meta?.coordinates) {
					const validCoords = m.meta.coordinates.filter(
						(c: any) => Array.isArray(c) && typeof c[0] === "number" && !isNaN(c[0]) && typeof c[1] === "number" && !isNaN(c[1])
					);
					if (validCoords.length >= 3) {
						const polyColor = LAND_STATUS_COLORS[m.meta?.poi_type ?? ""] ?? "#ff3b1f";
						const polygon = L.polygon(validCoords, {
							fillColor: polyColor,
							fillOpacity: 0.25,
							color: polyColor,
							weight: 2,
							opacity: 0.85
						}).addTo(map);

						const statusLabel = m.meta?.poi_type ? ` · ${m.meta.poi_type}` : "";
						polygon.bindTooltip(`<strong>${m.name}</strong><br/><span style="color:${polyColor}">POLIGON${statusLabel}</span>`, { sticky: true });
						polygon.on("click", (e: any) => {
							e.originalEvent?.stopPropagation();
							onMarkerClick?.(m);
						});
						layersRef.current.push(polygon);
					}
					return;
				}

				// Render user-placed circles
				if (m.type === "circle" && typeof m.lat === "number" && !isNaN(m.lat) && typeof m.lng === "number" && !isNaN(m.lng) && (m.meta?.radius ?? 0) > 0) {
					const circle = L.circle([m.lat, m.lng], {
						radius: m.meta!.radius!,
						fillColor: "#ff3b1f",
						fillOpacity: 0.2,
						color: "#ff3b1f",
						weight: 2,
						opacity: 0.85
					}).addTo(map);

					circle.bindTooltip(`<strong>${m.name}</strong><br/>Jenis: LINGKARAN<br/>Radius: ${m.meta!.radius!.toFixed(1)}m`, { sticky: true });
					circle.on("click", (e: any) => {
						e.originalEvent?.stopPropagation();
						onMarkerClick?.(m);
					});
					layersRef.current.push(circle);
					return;
				}

				let markerColor = "rgb(59, 130, 246)";
				let iconName = "map-pin";

				switch (m.type) {
					case "marker":
						markerColor = FUZZY_LABEL_COLOR[m.meta?.fuzzy_label ?? ""] ?? markerColor;
						iconName = "map-pin";
						break;
					case "mosque":
						markerColor = "rgb(16, 185, 129)";
						iconName = "mosque";
						break;
					case "church":
						markerColor = "rgb(139, 92, 246)";
						iconName = "church";
						break;
					case "cathedral":
						markerColor = "rgb(124, 58, 237)";
						iconName = "crown-cross";
						break;
					case "temple":
						markerColor = "rgb(234, 88, 12)";
						iconName = "hands-praying";
						break;
					case "vihara":
						markerColor = "rgb(202, 138, 4)";
						iconName = "hands-praying";
						break;
					case "klenteng":
						markerColor = "rgb(185, 28, 28)";
						iconName = "hands-praying";
						break;
					case "synagogue":
						markerColor = "rgb(245, 158, 11)";
						iconName = "synagogue";
						break;
					case "clinic":
						markerColor = "rgb(239, 68, 68)";
						iconName = "first-aid";
						break;
					case "food-bank":
						markerColor = "rgb(217, 70, 239)";
						iconName = "bowl-food";
						break;
					case "school":
						markerColor = "rgb(6, 182, 212)";
						iconName = "graduation-cap";
						break;
					case "flag":
						markerColor = "rgb(244, 63, 94)";
						iconName = "flag";
						break;
					case "protected":
						markerColor = "rgb(4, 120, 87)";
						iconName = "tree";
						break;
					case "registry":
						markerColor = "rgb(29, 78, 216)";
						iconName = "bank";
						break;
					case "charging-station": {
						iconName = "charging-station";
						const evType = m.meta?.poi_type ?? "";
						if (evType === "DC Fast") {
							markerColor = "#10b981"; // Emerald
						} else if (evType === "Supercharger") {
							markerColor = "#14b8a6"; // Teal
						} else if (evType === "AC Level 2") {
							markerColor = "#3b82f6"; // Blue
						} else {
							markerColor = "rgb(16, 185, 129)"; // Default green
						}
						break;
					}
					case "gas-pump": {
						iconName = "gas-pump";
						const brand = m.meta?.poi_type ?? "";
						if (brand === "Pertamina") {
							markerColor = "#ef4444"; // Red
						} else if (brand === "Shell") {
							markerColor = "#eab308"; // Yellow
						} else if (brand === "BP") {
							markerColor = "#10b981"; // Green
						} else if (brand === "Vivo") {
							markerColor = "#3b82f6"; // Blue
						} else {
							markerColor = "rgb(220, 38, 38)"; // Default red
						}
						break;
					}
					case "wrench": {
						iconName = "wrench";
						const spec = m.meta?.poi_type ?? "";
						if (spec === "Umum") {
							markerColor = "#6b7280"; // Gray
						} else if (spec === "AC & Kelistrikan") {
							markerColor = "#0ea5e9"; // Sky
						} else if (spec === "Mesin") {
							markerColor = "#f97316"; // Orange
						} else if (spec === "Ban & Velg") {
							markerColor = "#f59e0b"; // Amber
						} else {
							markerColor = "rgb(107, 114, 128)"; // Default gray
						}
						break;
					}
				}

				let borderStyle = "2px solid white";
				if (m.type === "gas-pump" || m.type === "charging-station" || m.type === "wrench") {
					const notesLower = (m.meta?.notes ?? "").toLowerCase();
					if (notesLower.includes("24 jam") || notesLower.includes("24 hours")) {
						borderStyle = "2.5px solid #22c55e"; // Emerald green border for 24h
					} else if (notesLower.includes("tutup") || notesLower.includes("offline") || notesLower.includes("maintenance")) {
						borderStyle = "2.5px solid #ef4444"; // Red border for closed/offline
					} else if (notesLower.includes("buka") || notesLower.includes("active") || notesLower.includes("open") || notesLower.includes("jam:")) {
						borderStyle = "2.5px solid #3b82f6"; // Blue border for active/open/hours
					}
				}

				const customIcon = L.divIcon({
					className: "custom-user-marker",
					html: `
						<div style="
							background-color: ${markerColor};
							color: white;
							width: 32px;
							height: 32px;
							border-radius: 50% 50% 50% 0;
							transform: rotate(-45deg);
							display: flex;
							align-items: center;
							justify-content: center;
							border: ${borderStyle};
							box-shadow: 0 2px 6px rgba(0,0,0,0.3);
						">
							<div style="
								transform: rotate(45deg);
								width: 16px;
								height: 16px;
								background-color: white;
								mask-image: url(/light/${iconName}-light.svg);
								-webkit-mask-image: url(/light/${iconName}-light.svg);
								mask-size: contain;
								-webkit-mask-size: contain;
								mask-repeat: no-repeat;
								-webkit-mask-repeat: no-repeat;
								mask-position: center;
								-webkit-mask-position: center;
							"></div>
						</div>
					`,
					iconSize: [32, 32],
					iconAnchor: [16, 32],
					popupAnchor: [0, -32]
				});

				const isDraggableMarker = !!dragDropEnabled && (m.type === "marker" || RELIGION_TYPES.has(m.type) || ["clinic", "food-bank", "school", "flag", "protected", "registry", "charging-station", "gas-pump", "wrench"].includes(m.type));
				const marker = L.marker([m.lat, m.lng], {
					icon: customIcon,
					draggable: isDraggableMarker
				}).addTo(map);

				if (isDraggableMarker) {
					marker.on("dragend", (e: any) => {
						const newLatLng = e.target.getLatLng();
						onMarkerDragEnd?.(m, newLatLng.lat, newLatLng.lng);
					});
				}

				const tooltipHtml = buildMarkerTooltip(m);
				marker.bindTooltip(tooltipHtml, {
					direction: "top",
					className: "user-marker-tooltip",
				});

				marker.on("click", (e: any) => {
					e.originalEvent?.stopPropagation();
					onMarkerClick?.(m);
				});

				layersRef.current.push(marker);

				if (RELIGION_TYPES.has(m.type) && (m.meta?.radius ?? 0) > 0) {
					const circle = L.circle([m.lat, m.lng], {
						radius: m.meta!.radius!,
						color: markerColor,
						fillColor: markerColor,
						fillOpacity: 0.08,
						weight: 1.5,
						dashArray: "5 4",
						interactive: false,
					}).addTo(map);
					layersRef.current.push(circle);
				}
			});
		}
	}, [mode, visibilityFilters, leafletLoaded, userMarkers, dragDropEnabled]);

	// 4. Handle Map Click Callback
	useEffect(() => {
		const map = mapInstanceRef.current;
		if (!map || !onMapClick) return;

		const handleMapClick = (e: any) => {
			onMapClick(e.latlng.lat, e.latlng.lng);
		};

		map.on("click", handleMapClick);

		return () => {
			map.off("click", handleMapClick);
		};
	}, [onMapClick, leafletLoaded]);

	// 5. Handle Geoman Shape Creation
	useEffect(() => {
		const map = mapInstanceRef.current;
		if (!map || mode !== "land" || !map.pm) return;

		const handlePmCreate = (e: any) => {
			try {
				const layer = e.layer;
				const type = String(e.shape || e.layerType || "").toLowerCase();

				// Remove Geoman temp layer asynchronously in the next tick to prevent event loop crashes
				setTimeout(() => {
					try { layer.remove(); } catch (_) { /* ignore */ }
				}, 0);

				const id = `shape-${Date.now()}`;
				let newShape: UserMarker | null = null;

				const geojson = layer.toGeoJSON();

				if (type === "line" || type === "polyline") {
					const geomCoords = geojson.geometry.coordinates;
					if (Array.isArray(geomCoords) && geomCoords.length > 0) {
						const coordinates: [number, number][] = geomCoords.map(([lng, lat]: [number, number]) => [lat, lng]);
						newShape = {
							id,
							lat: coordinates[0][0],
							lng: coordinates[0][1],
							type: "line",
							name: "Survey Line " + new Date().toLocaleDateString("id-ID"),
							meta: { coordinates }
						};
					}
				} else if (type === "polygon" || type === "rectangle") {
					const geomCoords = geojson.geometry.coordinates[0];
					if (Array.isArray(geomCoords) && geomCoords.length > 0) {
						const coordinates: [number, number][] = geomCoords.map(([lng, lat]: [number, number]) => [lat, lng]);
						newShape = {
							id,
							lat: coordinates[0][0],
							lng: coordinates[0][1],
							type: "polygon",
							name: "Survey Area " + new Date().toLocaleDateString("id-ID"),
							meta: { coordinates }
						};
					}
				} else if (type === "circle") {
					const latlng = layer.getLatLng();
					const radius = layer.getRadius();
					newShape = {
						id,
						lat: latlng.lat,
						lng: latlng.lng,
						type: "circle",
						name: "Buffer Zone " + new Date().toLocaleDateString("id-ID"),
						meta: { radius }
					};
				}

				if (newShape && onShapeCreated) {
					onShapeCreated(newShape);
				}
			} catch (err) {
				console.error("[LeafletMap] pm:create handler error:", err);
			}
		};

		map.on("pm:create", handlePmCreate);

		return () => {
			map.off("pm:create", handlePmCreate);
		};
	}, [leafletLoaded, mode, onShapeCreated]);

	// 6. Programmatically enable Geoman drawing tools based on placingMarkerType
	useEffect(() => {
		const map = mapInstanceRef.current;
		if (!map || mode !== "land" || !map.pm) return;

		try {
			map.pm.disableDraw();

			if (!placingMarkerType) return;

			const options = {
				templineStyle: { color: "#ff3b1f" },
				hintlineStyle: { color: "#ff3b1f", dashArray: "5 5" },
				pathOptions: { color: "#ff3b1f", fillColor: "#ff3b1f", fillOpacity: 0.2 }
			};

			if (placingMarkerType === "line") {
				map.pm.enableDraw("Line", options);
			} else if (placingMarkerType === "polygon") {
				map.pm.enableDraw("Polygon", options);
			} else if (placingMarkerType === "circle") {
				map.pm.enableDraw("Circle", options);
			}
		} catch (err) {
			console.error("[LeafletMap] Geoman enableDraw error:", err);
		}
	}, [placingMarkerType, leafletLoaded, mode]);

	return (
		<div className={cn(
			"relative w-full h-full min-h-[380px] bg-paper dark:bg-obsidian overflow-hidden",
			!fullBleed && "rounded-lg border"
		)}>
			{!leafletLoaded && (
				<div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm z-50">
					<div className="flex flex-col items-center gap-3">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
						<p className="text-xs font-semibold text-muted-foreground">Menginisialisasi peta Leaflet...</p>
					</div>
				</div>
			)}
			<div ref={mapContainerRef} className="w-full h-full min-h-[380px]" style={{ zIndex: 1 }} />
		</div>
	);
}
