import { Card } from "@/components/ui/card";
import type { PovertyOverview } from "@/lib/poverty-types";

interface PovertyStatsCardsProps {
	overview: PovertyOverview | null;
}

export function PovertyStatsCards({ overview }: PovertyStatsCardsProps) {
	const totals = overview?.totals;
	const byLabel = overview?.by_label ?? {};
	const highPriority = (byLabel["SANGAT TINGGI"] ?? 0) + (byLabel["TINGGI"] ?? 0);
	const poiTotal = Object.values(overview?.poi ?? {}).reduce((s, n) => s + n, 0);
	const avgDependents =
		totals && totals.household_count > 0
			? (totals.total_dependents / totals.household_count).toFixed(1)
			: null;

	return (
		<>
			<Card className="bg-background rounded-none border-none shadow-none ring-0 flex flex-col justify-between">
				<div className="px-6 pt-6 pb-4">
					<span className="text-xs font-medium text-muted-foreground">Warga Terdata</span>
					<div className="text-3xl font-bold text-foreground mt-2">
						{totals ? totals.household_count : "—"} <span className="text-base font-semibold text-muted-foreground">KK</span>
					</div>
				</div>
				<div className="border-t px-6 py-3 text-xs text-muted-foreground mt-auto">
					{poiTotal} fasilitas umum terpetakan
				</div>
			</Card>

			<Card className="bg-background rounded-none border-none shadow-none ring-0 flex flex-col justify-between">
				<div className="px-6 pt-6 pb-4">
					<span className="text-xs font-medium text-muted-foreground">Total Tanggungan</span>
					<div className="text-3xl font-bold text-foreground mt-2">
						{totals ? totals.total_dependents : "—"} <span className="text-base font-semibold text-muted-foreground">jiwa</span>
					</div>
				</div>
				<div className="border-t px-6 py-3 text-xs text-muted-foreground mt-auto">
					{avgDependents ? `rata-rata ${avgDependents} jiwa per KK` : "belum ada data"}
				</div>
			</Card>

			<Card className="bg-background rounded-none border-none shadow-none ring-0 flex flex-col justify-between">
				<div className="px-6 pt-6 pb-4">
					<span className="text-xs font-medium text-muted-foreground">Rata-rata Penghasilan</span>
					<div className="text-3xl font-bold text-foreground mt-2">
						{totals ? `Rp ${Math.round(totals.avg_income).toLocaleString("id-ID")}` : "—"}
					</div>
				</div>
				<div className="border-t px-6 py-3 text-xs text-muted-foreground mt-auto">
					per kepala keluarga per bulan
				</div>
			</Card>

			<Card className="bg-background rounded-none border-none shadow-none ring-0 flex flex-col justify-between">
				<div className="px-6 pt-6 pb-4">
					<span className="text-xs font-medium text-muted-foreground">Rata-rata Skor Fuzzy</span>
					<div className="text-3xl font-bold text-foreground mt-2">
						{totals?.avg_score != null ? Number(totals.avg_score).toFixed(1) : "—"}
						<span className="text-base font-semibold text-muted-foreground"> / 100</span>
					</div>
				</div>
				<div className="border-t px-6 py-3 text-xs mt-auto">
					<span className="font-medium text-rose-500">{highPriority} KK</span>
					<span className="text-muted-foreground"> prioritas tinggi ke atas</span>
				</div>
			</Card>
		</>
	);
}
