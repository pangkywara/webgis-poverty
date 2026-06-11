"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPinIcon, ZapIcon, ClockIcon, NavigationIcon } from "@/components/ui/phosphor-icons";
import { BRAND_COLORS } from "@/lib/map-data";
import type { UserMarker } from "@/components/leaflet-map";

interface GasStationInspectorProps {
	selectedStation: UserMarker | null;
}

const BRAND_PRICES = {
	Pertamina: { ron92: 13200, ron95: 14400, diesel: 14900 },
	Shell: { ron92: 13850, ron95: 14600, diesel: 15100 },
	BP: { ron92: 13400, ron95: 14500, diesel: 14800 },
	Vivo: { ron92: 13400, ron95: 14500, diesel: 14800 }
};

export function GasStationInspector({ selectedStation }: GasStationInspectorProps) {
	if (!selectedStation) {
		return (
			<Card className="bg-background rounded-none border-none shadow-none ring-0 flex flex-col justify-center items-center h-full p-6 text-center text-muted-foreground/60 border-l border-border/40">
				<MapPinIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
				<p className="text-xs">Pilih stasiun dari direktori atau peta untuk melihat detail.</p>
			</Card>
		);
	}

	const isGasPump = selectedStation.type === "gas-pump";
	const isEvCharger = selectedStation.type === "charging-station";
	const isWrench = selectedStation.type === "wrench";

	const brandName = isGasPump ? selectedStation.meta?.poi_type : null;
	const brandColor = BRAND_COLORS[brandName as keyof typeof BRAND_COLORS] || { bg: "#6b7280", text: "#ffffff" };

	// Get price index for gas stations
	const prices = isGasPump
		? (BRAND_PRICES[brandName as keyof typeof BRAND_PRICES] || BRAND_PRICES.Pertamina)
		: null;

	// Extract clean values from meta
	const cleanNotes = selectedStation.meta?.notes ?? "";
	const cleanPoiType = selectedStation.meta?.poi_type ?? "";

	return (
		<Card className="bg-background rounded-none border-none shadow-none ring-0 flex flex-col justify-between h-full border-l border-border/40">
			<CardHeader className="border-b bg-muted/20 px-6 py-4 lg:h-[73px] lg:py-0 flex flex-col justify-center">
				<CardTitle className="text-base font-semibold flex items-center gap-2">
					<MapPinIcon className="h-4 w-4 text-primary" />
					Detail Stasiun
				</CardTitle>
				<CardDescription>Metrik stasiun langsung &amp; detail dari database.</CardDescription>
			</CardHeader>
			<CardContent className="p-6 flex flex-col gap-5 flex-1 overflow-y-auto">
				<div>
					<h3 className="text-xl font-bold text-foreground leading-tight">{selectedStation.name}</h3>
					<span
						className="inline-block mt-2 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border"
						style={isGasPump && brandName ? {
							color: brandColor.bg,
							borderColor: `${brandColor.bg}33`,
							backgroundColor: `${brandColor.bg}11`
						} : undefined}
					>
						{isGasPump ? `Jaringan ${brandName}` : isEvCharger ? "Pengisi Daya EV" : "Bengkel (Repair Shop)"}
					</span>
				</div>

				{/* Gas Pump: Pricing Cards */}
				{isGasPump && prices && (
					<div className="flex flex-col gap-2 border rounded-lg p-3 bg-muted/10">
						<div className="flex justify-between items-center text-xs py-1 border-b">
							<span className="font-semibold text-foreground">Harga RON 92</span>
							<span className="font-bold text-foreground">Rp {prices.ron92.toLocaleString()} / L</span>
						</div>
						<div className="flex justify-between items-center text-xs py-1 border-b">
							<span className="font-semibold text-primary font-semibold">Harga RON 95</span>
							<span className="font-bold text-primary">Rp {prices.ron95.toLocaleString()} / L</span>
						</div>
						<div className="flex justify-between items-center text-xs py-1">
							<span className="font-semibold text-foreground">Harga Diesel</span>
							<span className="font-bold text-foreground">Rp {prices.diesel.toLocaleString()} / L</span>
						</div>
					</div>
				)}

				{/* Gas Pump: Fuel Types */}
				{isGasPump && selectedStation.meta?.gas_types && selectedStation.meta.gas_types.length > 0 && (
					<div className="flex flex-col gap-2">
						<span className="text-xs font-semibold text-muted-foreground">Tipe Bahan Bakar</span>
						<div className="flex flex-wrap gap-1">
							{selectedStation.meta.gas_types.map((gt) => (
								<span
									key={gt}
									className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20"
								>
									{gt}
								</span>
							))}
						</div>
					</div>
				)}

				{/* EV Charger Details */}
				{isEvCharger && (
					<div className="flex flex-col gap-3 border rounded-lg p-3 bg-muted/15">
						<div className="flex justify-between items-center text-xs py-1 border-b">
							<span className="font-semibold text-muted-foreground">Tipe Charger</span>
							<span className="font-bold text-foreground">{cleanPoiType}</span>
						</div>
						<div className="flex justify-between items-center text-xs py-1">
							<span className="font-semibold text-muted-foreground">Status Operasional</span>
							<span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
								cleanNotes.includes("Active") ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
								cleanNotes.includes("Maintenance") ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
								"bg-red-500/10 text-red-600 border border-red-500/20"
							}`}>
								{cleanNotes.replace("Status: ", "")}
							</span>
						</div>
					</div>
				)}

				{/* Repair Shop Details */}
				{isWrench && (
					<div className="flex flex-col gap-3 border rounded-lg p-3 bg-muted/15">
						<div className="flex justify-between items-center text-xs py-1 border-b">
							<span className="font-semibold text-muted-foreground">Spesialisasi</span>
							<span className="font-bold text-foreground">{cleanPoiType}</span>
						</div>
						<div className="flex justify-between items-center text-xs py-1">
							<span className="font-semibold text-muted-foreground">Status / Jam Buka</span>
							<span className="font-bold text-foreground">{cleanNotes}</span>
						</div>
					</div>
				)}

				{/* General: Operating Hours HUD style */}
				{isGasPump && (
					<div className="flex flex-col gap-2">
						<span className="text-xs font-semibold text-muted-foreground">Jam Operasional</span>
						<div className="flex items-center gap-3 p-3 border rounded-lg bg-background">
							<ClockIcon className="h-6 w-6 shrink-0 text-emerald-500" />
							<div>
								<p className="text-xs font-bold text-foreground">Buka Layanan</p>
								<p className="text-[10px] text-muted-foreground">{cleanNotes.replace("Jam: ", "") || "24 Jam"}</p>
							</div>
						</div>
					</div>
				)}

				{/* Coordinates & Route Buttons */}
				<div className="border-t pt-4 text-xs text-muted-foreground flex flex-col gap-2 mt-auto">
					<p className="flex items-center gap-1 font-mono">
						<MapPinIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
						Lat: {selectedStation.lat.toFixed(5)}, Lng: {selectedStation.lng.toFixed(5)}
					</p>
					<Button className="w-full mt-2 h-9 gap-1.5" variant="outline">
						<NavigationIcon className="h-4 w-4" /> Dapatkan Arah Rute
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
