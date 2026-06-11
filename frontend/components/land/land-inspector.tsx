import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayersIcon, EyeIcon, EyeOffIcon, ShieldAlertIcon } from "@/components/ui/phosphor-icons";
import { LAND_MARKER_LABELS, LAND_MARKER_COLORS } from "@/lib/map-data";
import type { UserMarker } from "@/components/leaflet-map";
import { calcLineLength, calcPolygonArea } from "@/components/land/shape-placement-dialog";

function formatDate(iso?: string): string {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" });
}

interface LandInspectorTopProps {
	selectedItem: UserMarker | null;
	visibilityFilters: Record<string, boolean>;
	toggleFilter: (type: string) => void;
}

export function LandInspectorTop({ selectedItem, visibilityFilters, toggleFilter }: LandInspectorTopProps) {
	if (!selectedItem) {
		return (
			<Card className="bg-background rounded-none border-none shadow-none ring-0 flex flex-col justify-between h-full">
				<CardHeader className="border-b bg-muted/20 px-6 py-4 flex flex-col justify-center">
					<CardTitle className="text-base font-semibold flex items-center gap-2">
						<LayersIcon className="h-4 w-4 text-primary" />
						Boundary Inspector
					</CardTitle>
					<CardDescription>Reviewing border registries.</CardDescription>
				</CardHeader>
				<CardContent className="p-6 flex-1 flex items-center justify-center">
					<p className="text-center text-xs text-muted-foreground">
						Belum ada item dipilih. Buka peta atau pilih item dari direktori.
					</p>
				</CardContent>
			</Card>
		);
	}

	const color = LAND_MARKER_COLORS[selectedItem.type] ?? "#6b7280";
	const label = LAND_MARKER_LABELS[selectedItem.type] ?? selectedItem.type;
	const coordinates = selectedItem.meta?.coordinates ?? [];
	const radius = selectedItem.meta?.radius ?? 0;
	const length = selectedItem.type === "line" ? calcLineLength(coordinates) : 0;

	return (
		<Card className="bg-background rounded-none border-none shadow-none ring-0 flex flex-col justify-between h-full">
			<CardHeader className="border-b bg-muted/20 px-6 py-4 flex flex-col justify-center">
				<CardTitle className="text-base font-semibold flex items-center gap-2">
					<LayersIcon className="h-4 w-4 text-primary" />
					Boundary Inspector
				</CardTitle>
				<CardDescription>Reviewing border registries.</CardDescription>
			</CardHeader>
			<CardContent className="p-6 flex flex-col gap-5 flex-1 justify-center">
				<div>
					<h3 className="text-xl font-bold text-foreground">{selectedItem.name}</h3>
					<span
						className="inline-block mt-1.5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border"
						style={{
							color,
							borderColor: `${color}33`,
							backgroundColor: `${color}11`
						}}
					>
						{label}
					</span>
				</div>

				<div className="flex flex-col gap-2.5 text-xs py-3 border-y">
					{selectedItem.type === "polygon" && coordinates.length > 0 && (
						<div className="flex justify-between">
							<span className="text-muted-foreground">Luas Terdaftar:</span>
							<span className="font-semibold text-foreground">{(calcPolygonArea(coordinates) / 10000).toFixed(2)} Ha</span>
						</div>
					)}
					{selectedItem.type === "line" && coordinates.length > 0 && (
						<div className="flex justify-between">
							<span className="text-muted-foreground">Panjang:</span>
							<span className="font-semibold text-foreground">
								{length >= 1000 ? `${(length / 1000).toFixed(2)} km` : `${length.toFixed(1)} m`}
							</span>
						</div>
					)}
					{selectedItem.type === "circle" && (
						<div className="flex justify-between">
							<span className="text-muted-foreground">Radius:</span>
							<span className="font-semibold text-foreground">{radius.toFixed(1)} m</span>
						</div>
					)}
					{(selectedItem.type === "line" || selectedItem.type === "polygon") && selectedItem.meta?.poi_type && (
						<div className="flex justify-between">
							<span className="text-muted-foreground">Status:</span>
							<span className="font-semibold text-foreground">{selectedItem.meta.poi_type}</span>
						</div>
					)}
					<div className="flex justify-between">
						<span className="text-muted-foreground">Created By:</span>
						<span className="font-semibold text-foreground text-right max-w-44 truncate">{selectedItem.meta?.created_by_username ?? "—"}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Created:</span>
						<span className="font-semibold text-foreground">{formatDate(selectedItem.meta?.created_at)}</span>
					</div>
				</div>

				<div className="flex flex-col gap-2 justify-center py-2">
					<span className="text-[10px] font-bold text-muted-foreground uppercase">Visibility filter status:</span>
					<div className="flex items-center gap-2 text-xs">
						<Button
							variant="outline"
							size="sm"
							onClick={() => toggleFilter(selectedItem.type)}
							className="h-8 gap-1 text-xs"
						>
							{visibilityFilters[selectedItem.type] !== false ? (
								<>
									<EyeOffIcon className="h-3.5 w-3.5" />
									Hide Category
								</>
							) : (
								<>
									<EyeIcon className="h-3.5 w-3.5" />
									Show Category
								</>
							)}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

interface LandInspectorBottomProps {
	recentFlags: UserMarker[];
}

export function LandInspectorBottom({ recentFlags }: LandInspectorBottomProps) {
	return (
		<Card className="bg-background rounded-none border-none shadow-none ring-0 h-full flex flex-col justify-between">
			<CardHeader className="py-3 px-6 border-b bg-muted/10">
				<CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
					<ShieldAlertIcon className="h-3.5 w-3.5 text-primary" />
					Surveyor Logs
				</CardTitle>
			</CardHeader>
			<CardContent className="p-4 flex flex-col gap-2 flex-1">
				{recentFlags.length > 0 ? (
					recentFlags.map((flag) => (
						<div key={flag.id} className="p-2 border rounded bg-background text-[11px] flex flex-col gap-1">
							<div className="flex justify-between font-bold text-primary">
								<span className="truncate">{flag.name}</span>
							</div>
							{flag.meta?.notes && (
								<p className="text-muted-foreground">{flag.meta.notes}</p>
							)}
							<span className="text-[9px] text-muted-foreground/60">Reported: {formatDate(flag.meta?.created_at)}</span>
						</div>
					))
				) : (
					<div className="flex-1 flex items-center justify-center">
						<p className="text-center text-xs text-muted-foreground py-6">Belum ada tengara lahan tercatat.</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
