import { Button } from "@/components/ui/button";
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { DashboardCard } from "@/components/dashboard-card";
import { CircleCheckIcon, ArrowRightIcon } from "@/components/ui/phosphor-icons";

interface PriorityBreakdownProps {
	byLabel: Record<string, number> | null;
}

const LABELS: { key: string; label: string; dotClass: string }[] = [
	{ key: "SANGAT TINGGI", label: "Sangat Tinggi", dotClass: "bg-rose-500" },
	{ key: "TINGGI", label: "Tinggi", dotClass: "bg-orange-500" },
	{ key: "SEDANG", label: "Sedang", dotClass: "bg-amber-500" },
	{ key: "RENDAH", label: "Rendah", dotClass: "bg-sky-500" },
	{ key: "TIDAK PRIORITAS", label: "Tidak Prioritas", dotClass: "bg-emerald-500" },
];

export function PriorityBreakdown({ byLabel }: PriorityBreakdownProps) {
	const total = LABELS.reduce((sum, l) => sum + (byLabel?.[l.key] ?? 0), 0);

	return (
		<DashboardCard className="gap-0">
			<CardHeader className="border-b">
				<CardTitle className="text-balance text-base">
					Prioritas Bantuan
				</CardTitle>
				<CardDescription className="text-pretty">
					Distribusi skor fuzzy seluruh KK terdata.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex h-full flex-col px-0">
				{total === 0 ? (
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<CircleCheckIcon aria-hidden="true" />
							</EmptyMedia>
							<EmptyTitle>Belum ada skor fuzzy.</EmptyTitle>
							<EmptyDescription className="text-xs">
								Tambahkan data warga atau jalankan perhitungan ulang skor di
								halaman kemiskinan.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button
								variant="ghost"
								render={<a href="/dashboard/poverty" />}
								nativeButton={false}
							>
								Kelola data warga
								<ArrowRightIcon aria-hidden="true" />
							</Button>
						</EmptyContent>
					</Empty>
				) : (
					<ul className="flex flex-col divide-y divide-border">
						{LABELS.map((l) => {
							const count = byLabel?.[l.key] ?? 0;
							const pct = total > 0 ? (count / total) * 100 : 0;
							return (
								<li className="flex flex-col gap-1.5 px-6 py-3" key={l.key}>
									<div className="flex items-center justify-between gap-2">
										<span className="flex items-center gap-2 text-sm text-foreground">
											<span
												aria-hidden="true"
												className={`size-2 shrink-0 rounded-full ${l.dotClass}`}
											/>
											{l.label}
										</span>
										<span className="text-xs text-muted-foreground tabular-nums">
											{count} KK
										</span>
									</div>
									<div className="h-1 w-full overflow-hidden rounded-full bg-muted">
										<div
											className={`h-full rounded-full ${l.dotClass}`}
											style={{ width: `${pct}%` }}
										/>
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</CardContent>
		</DashboardCard>
	);
}
