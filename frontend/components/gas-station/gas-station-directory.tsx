"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, ZapIcon } from "@/components/ui/phosphor-icons";
import { BRAND_COLORS } from "@/lib/map-data";
import type { UserMarker } from "@/components/leaflet-map";
import { ContinuousTabs } from "@/components/ui/continuous-tabs";

interface GasStationDirectoryProps {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	brandFilter: string;
	setBrandFilter: (brand: string) => void;
	evOnlyFilter: boolean;
	setEvOnlyFilter: (evOnly: boolean) => void;
	filteredStations: UserMarker[];
	selectedStationId: string;
	onSelectStation: (station: UserMarker) => void;
}

export function GasStationDirectory({
	searchQuery,
	setSearchQuery,
	brandFilter,
	setBrandFilter,
	evOnlyFilter,
	setEvOnlyFilter,
	filteredStations,
	selectedStationId,
	onSelectStation,
}: GasStationDirectoryProps) {
	return (
		<Card className="bg-background rounded-none border-none shadow-none ring-0 h-full flex flex-col">
			<CardHeader className="border-b bg-muted/20 px-6 py-4 lg:h-[73px] lg:py-0 flex flex-col justify-center">
				<CardTitle className="text-base font-semibold">Direktori Stasiun Aktif</CardTitle>
				<CardDescription>Menyaring {filteredStations.length} target stasiun regional aktif dari database.</CardDescription>
			</CardHeader>
			<CardContent className="p-6 flex-1">
				{/* Filters */}
				<div className="flex flex-col sm:flex-row gap-3 mb-4 items-center">
					<div className="relative flex-grow w-full">
						<SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Cari berdasarkan nama lokasi..."
							className="pl-9 bg-background h-10"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<ContinuousTabs
						tabs={[
							{ id: "All", label: "Semua" },
							{ id: "Pertamina", label: "Pertamina" },
							{ id: "Shell", label: "Shell" },
							{ id: "BP", label: "BP" },
							{ id: "Vivo", label: "Vivo" },
						]}
						activeId={brandFilter}
						onChange={setBrandFilter}
						size="sm"
					/>
				</div>
				<div className="flex items-center gap-2 mb-4">
					<Button
						variant={evOnlyFilter ? "default" : "outline"}
						onClick={() => setEvOnlyFilter(!evOnlyFilter)}
						className="h-8 text-xs gap-1.5"
					>
						<ZapIcon className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
						Pengisi Daya EV Tersedia
					</Button>
				</div>

				{/* Grid List */}
				{filteredStations.length === 0 ? (
					<div className="py-8 text-center text-xs text-muted-foreground">
						Tidak ada lokasi yang cocok. Tambah lokasi baru melalui peta stasiun.
					</div>
				) : (
					<div className="grid gap-3 sm:grid-cols-2 max-h-[360px] overflow-y-auto pr-1">
						{filteredStations.map((station) => {
							const isSelected = selectedStationId === station.id;
							const brandName = station.type === "gas-pump" ? station.meta?.poi_type : null;
							const brandColor = BRAND_COLORS[brandName as keyof typeof BRAND_COLORS] || { bg: "#6b7280", text: "#ffffff" };

							return (
								<div
									key={station.id}
									onClick={() => onSelectStation(station)}
									className={`p-4 border rounded-lg cursor-pointer flex flex-col gap-1.5 transition-all ${
										isSelected
											? "border-primary bg-primary/5 font-semibold"
											: "border-border/60 hover:bg-muted"
									}`}
								>
									<div className="flex justify-between items-start">
										<span className="text-xs text-foreground font-bold">{station.name}</span>
										{station.type === "gas-pump" && brandName ? (
											<span
												className="text-[9px] uppercase font-bold px-2 py-0.5 rounded border shrink-0 ml-2"
												style={{
													color: brandColor.bg,
													borderColor: `${brandColor.bg}33`,
													backgroundColor: `${brandColor.bg}11`
												}}
											>
												{brandName}
											</span>
										) : (
											<span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded border shrink-0 ml-2 bg-primary/10 text-primary border-primary/20">
												{station.type === "charging-station" ? "EV Charger" : "Bengkel"}
											</span>
										)}
									</div>
									<p className="text-[10px] text-muted-foreground font-mono tabular-nums">
										Koordinat: {station.lat.toFixed(5)}, {station.lng.toFixed(5)}
									</p>
									
									{station.type === "gas-pump" && station.meta?.gas_types && station.meta.gas_types.length > 0 && (
										<div className="flex flex-wrap gap-1 mt-1">
											{station.meta.gas_types.map((gt) => (
												<span
													key={gt}
													className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-muted text-muted-foreground border border-border/40"
												>
													{gt}
												</span>
											))}
										</div>
									)}

									<div className="flex justify-between items-center text-[10px] mt-1 text-muted-foreground border-t pt-2 mt-auto">
										{station.type === "gas-pump" ? (
											<span>Operasional: {station.meta?.notes?.replace("Jam: ", "") || "24 Jam"}</span>
										) : station.type === "charging-station" ? (
											<span>Tipe: {station.meta?.poi_type} · {station.meta?.notes}</span>
										) : (
											<span>Spesialisasi: {station.meta?.poi_type} · {station.meta?.notes}</span>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
