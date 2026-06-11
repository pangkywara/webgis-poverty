import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "@/components/ui/phosphor-icons";
import type { HouseholdRow } from "@/lib/poverty-types";

const SCORE_COLOR: Record<string, string> = {
	"SANGAT TINGGI":   "text-red-600",
	"TINGGI":          "text-orange-600",
	"SEDANG":          "text-amber-600",
	"RENDAH":          "text-emerald-600",
	"TIDAK PRIORITAS": "text-blue-600",
};

interface PovertyDirectoryProps {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	households: HouseholdRow[];
	selectedId: number | null;
	onSelect: (household: HouseholdRow) => void;
}

export function PovertyDirectory({
	searchQuery,
	setSearchQuery,
	households,
	selectedId,
	onSelect,
}: PovertyDirectoryProps) {
	const filtered = households
		.filter((h) => h.head_name.toLowerCase().includes(searchQuery.toLowerCase()))
		.sort((a, b) => Number(b.fuzzy_score ?? -1) - Number(a.fuzzy_score ?? -1));

	return (
		<Card className="bg-background rounded-none border-none shadow-none ring-0 h-full flex flex-col">
			<CardHeader className="py-4">
				<CardTitle className="text-base font-semibold">Direktori Warga Prioritas</CardTitle>
				<CardDescription>Diurutkan dari skor fuzzy tertinggi. Pilih warga untuk melihat detail di panel inspektur.</CardDescription>
			</CardHeader>
			<CardContent className="pb-6 flex-1">
				<div className="relative mb-4">
					<SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Cari nama kepala keluarga..."
						className="pl-9 bg-background h-10"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				{filtered.length === 0 ? (
					<div className="py-8 text-center text-xs text-muted-foreground">
						{households.length === 0
							? "Belum ada warga terdata. Tambah marker di peta untuk memulai."
							: "Tidak ada warga yang cocok dengan pencarian."}
					</div>
				) : (
					<div className="grid gap-2 sm:grid-cols-2 max-h-[320px] overflow-y-auto pr-1">
						{filtered.map((h) => {
							const isSelected = selectedId === h.id;
							const score = h.fuzzy_score != null ? Number(h.fuzzy_score).toFixed(1) : "—";
							return (
								<div
									key={h.id}
									onClick={() => onSelect(h)}
									className={`p-3 border rounded-lg cursor-pointer flex justify-between items-center transition-all ${
										isSelected
											? "border-primary bg-primary/5 text-primary font-semibold"
											: "border-border/60 hover:bg-muted"
									}`}
								>
									<span className="text-xs text-foreground font-medium truncate me-2">{h.head_name}</span>
									<span className={`text-xs bg-muted border px-2 py-0.5 rounded font-bold tabular-nums shrink-0 ${SCORE_COLOR[h.fuzzy_label ?? ""] ?? "text-muted-foreground"}`}>
										{score}
									</span>
								</div>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
