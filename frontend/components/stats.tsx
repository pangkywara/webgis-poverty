import {
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { DashboardCard } from "@/components/dashboard-card";
import type { GasStationStats } from "@/lib/dashboard-types";
import type { PovertyOverview } from "@/lib/poverty-types";

interface DashboardStatsProps {
	overview: PovertyOverview | null;
	gasStats: GasStationStats | null;
	landMarkerCount: number;
	landShapeCount: number;
}

type Stat = {
	label: string;
	value: string;
	unit?: string;
	footer: string;
};

export function DashboardStats({
	overview,
	gasStats,
	landMarkerCount,
	landShapeCount,
}: DashboardStatsProps) {
	const totals = overview?.totals;

	const stats: Stat[] = [
		{
			label: "Warga Terdata",
			value: totals ? totals.household_count.toLocaleString("id-ID") : "—",
			unit: "KK",
			footer: totals
				? `${totals.total_dependents.toLocaleString("id-ID")} jiwa tanggungan`
				: "belum ada data warga",
		},
		{
			label: "Rata-rata Penghasilan",
			value: totals
				? `Rp ${Math.round(totals.avg_income).toLocaleString("id-ID")}`
				: "—",
			footer: "per kepala keluarga per bulan",
		},
		{
			label: "Aset Lahan",
			value: (landMarkerCount + landShapeCount).toLocaleString("id-ID"),
			unit: "item",
			footer: `${landMarkerCount} penanda · ${landShapeCount} bidang & garis`,
		},
		{
			label: "SPBU & Fasilitas",
			value: gasStats ? gasStats.total.toLocaleString("id-ID") : "—",
			unit: "titik",
			footer: gasStats
				? `${gasStats.gas_pump} SPBU · ${gasStats.charging_station} pengisi daya EV`
				: "belum ada fasilitas terpetakan",
		},
	];

	return (
		<>
			{stats.map((s) => (
				<DashboardCard className="" key={s.label}>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="font-normal text-xs tracking-wide">
							{s.label}
						</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-row items-baseline gap-1.5">
						<p className="font-semibold text-2xl tabular-nums">{s.value}</p>
						{s.unit && (
							<span className="text-sm font-medium text-muted-foreground">
								{s.unit}
							</span>
						)}
					</CardContent>
					<CardFooter className="gap-1 rounded-none bg-background text-xs">
						<span className="text-muted-foreground">{s.footer}</span>
					</CardFooter>
				</DashboardCard>
			))}
		</>
	);
}
