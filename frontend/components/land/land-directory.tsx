import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "@/components/ui/phosphor-icons";
import { LAND_MARKER_LABELS, LAND_MARKER_COLORS } from "@/lib/map-data";
import type { UserMarker } from "@/components/leaflet-map";
import { calcLineLength, calcPolygonArea } from "@/components/land/shape-placement-dialog";

interface LandDirectoryProps {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	filteredItems: UserMarker[];
	selectedItemId: string | null;
	visibilityFilters: Record<string, boolean>;
	onSelectItem: (item: UserMarker) => void;
}

function itemBadge(item: UserMarker): string {
	const coordinates = item.meta?.coordinates ?? [];
	if (item.type === "polygon" && coordinates.length > 0) {
		return `${(calcPolygonArea(coordinates) / 10000).toFixed(2)} Ha`;
	}
	if (item.type === "line" && coordinates.length > 0) {
		const length = calcLineLength(coordinates);
		return length >= 1000 ? `${(length / 1000).toFixed(2)} km` : `${length.toFixed(1)} m`;
	}
	if (item.type === "circle") {
		const radius = item.meta?.radius ?? 0;
		return `${radius.toFixed(1)} m`;
	}
	return LAND_MARKER_LABELS[item.type] ?? item.type;
}

export function LandDirectory({
	searchQuery,
	setSearchQuery,
	filteredItems,
	selectedItemId,
	visibilityFilters,
	onSelectItem,
}: LandDirectoryProps) {
	return (
		<Card className="bg-background rounded-none border-none shadow-none ring-0 h-full flex flex-col">
			<CardHeader className="py-4">
				<CardTitle className="text-base font-semibold">GIS Layer Directory</CardTitle>
				<CardDescription>Select a marker or shape to review survey metadata and inspector details.</CardDescription>
			</CardHeader>
			<CardContent className="pb-6 flex-1">
				<div className="relative mb-4">
					<SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search by name or type..."
						className="pl-9 bg-background h-10"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				{filteredItems.length > 0 ? (
					<div className="grid gap-2 sm:grid-cols-2">
						{filteredItems.map((item) => {
							const isSelected = selectedItemId === item.id;
							const isVisible = visibilityFilters[item.type] !== false;
							const color = LAND_MARKER_COLORS[item.type] ?? "#6b7280";
							return (
								<div
									key={item.id}
									onClick={() => onSelectItem(item)}
									className={`p-3 border rounded-lg cursor-pointer flex justify-between items-center gap-2 transition-all ${
										isSelected
											? "border-primary bg-primary/5 text-primary font-semibold"
											: "border-border/60 hover:bg-muted"
									} ${!isVisible ? "opacity-45" : ""}`}
								>
									<span className="text-xs text-foreground font-medium truncate">{item.name}</span>
									<span
										className="text-[9px] border px-2 py-0.5 rounded font-bold shrink-0"
										style={{
											color,
											borderColor: `${color}33`,
											backgroundColor: `${color}11`
										}}
									>
										{itemBadge(item)}
									</span>
								</div>
							);
						})}
					</div>
				) : (
					<p className="text-center text-xs text-muted-foreground py-12">
						Belum ada penanda atau bentuk yang ditambahkan. Buka peta untuk mulai menambahkan.
					</p>
				)}
			</CardContent>
		</Card>
	);
}
