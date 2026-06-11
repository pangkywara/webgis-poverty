import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { HouseholdRow } from "@/lib/poverty-types";

const LABEL_BADGE: Record<string, string> = {
	"SANGAT TINGGI":   "bg-red-100 text-red-700 border-red-200",
	"TINGGI":          "bg-orange-100 text-orange-700 border-orange-200",
	"SEDANG":          "bg-amber-100 text-amber-700 border-amber-200",
	"RENDAH":          "bg-emerald-100 text-emerald-700 border-emerald-200",
	"TIDAK PRIORITAS": "bg-blue-100 text-blue-700 border-blue-200",
};

interface PovertyInspectorTopProps {
	selected: HouseholdRow | null;
}

export function PovertyInspectorTop({ selected }: PovertyInspectorTopProps) {
	return (
		<Card className="bg-background rounded-none border-none shadow-none ring-0 flex flex-col h-full">
			<CardHeader className="border-b bg-muted/20 px-6 py-4 flex flex-col justify-center">
				<CardTitle className="text-base font-semibold flex items-center gap-2">
					<span className="h-2 w-2 rounded-full bg-primary" />
					Inspektur Warga
				</CardTitle>
				<CardDescription>
					{selected ? `Analisis untuk ${selected.head_name}.` : "Pilih warga dari direktori."}
				</CardDescription>
			</CardHeader>
			<CardContent className="px-6 py-6 flex-1 flex flex-col justify-center">
				{selected ? (
					<>
						<h3 className="text-2xl font-bold text-foreground truncate">{selected.head_name}</h3>
						<span className={`inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border w-fit ${LABEL_BADGE[selected.fuzzy_label ?? ""] ?? "bg-muted text-muted-foreground border-border"}`}>
							{selected.fuzzy_label ?? "Belum dianalisis"}
						</span>
					</>
				) : (
					<p className="text-sm text-muted-foreground">Belum ada warga dipilih.</p>
				)}
			</CardContent>
		</Card>
	);
}

interface PovertyInspectorBottomProps {
	selected: HouseholdRow | null;
}

export function PovertyInspectorBottom({ selected }: PovertyInspectorBottomProps) {
	const score = selected?.fuzzy_score != null ? Number(selected.fuzzy_score).toFixed(1) : "—";

	return (
		<Card className="bg-background rounded-none border-none shadow-none ring-0 flex flex-col justify-between h-full">
			<CardContent className="px-0 py-6 flex flex-col justify-between flex-1">
				<div className="grid grid-cols-2 gap-4 px-6">
					<div className="p-3 rounded-lg border bg-muted/10">
						<span className="text-xs text-muted-foreground">Skor Fuzzy</span>
						<p className="text-xl font-bold mt-1 text-foreground tabular-nums">{score}</p>
					</div>
					<div className="p-3 rounded-lg border bg-muted/10">
						<span className="text-xs text-muted-foreground">Penghasilan</span>
						<p className="text-xl font-bold mt-1 text-foreground tabular-nums">
							{selected ? `Rp ${Number(selected.penghasilan).toLocaleString("id-ID")}` : "—"}
						</p>
					</div>
					<div className="p-3 rounded-lg border bg-muted/10">
						<span className="text-xs text-muted-foreground">Tanggungan</span>
						<p className="text-xl font-bold mt-1 text-foreground tabular-nums">
							{selected ? `${selected.family_count} jiwa` : "—"}
						</p>
					</div>
					<div className="p-3 rounded-lg border bg-muted/10">
						<span className="text-xs text-muted-foreground">Rumah · Aset</span>
						<p className="text-xl font-bold mt-1 text-foreground tabular-nums">
							{selected ? `${selected.kondisi_rumah} · ${selected.kepemilikan_aset}` : "—"}
						</p>
					</div>
				</div>

				<div className="border-t mt-6 pt-6 px-6 text-xs text-muted-foreground flex flex-col gap-2">
					<p>
						Skor fuzzy 0–100 dihitung dari penghasilan, tanggungan, kondisi rumah, dan kepemilikan aset. Semakin tinggi skor, semakin prioritas untuk bantuan.
					</p>
					<p>
						Kondisi rumah dan kepemilikan aset dinilai pada skala 1–10 saat pendataan di peta.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
