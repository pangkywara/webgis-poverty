import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { DashboardCard } from "@/components/dashboard-card";
import {
	FuelIcon,
	LayersIcon,
	UserPlusIcon,
} from "@/components/ui/phosphor-icons";
import type { ActivityItem, ActivityKind } from "@/lib/dashboard-types";

interface DashboardActivityProps {
	items: ActivityItem[];
}

const KIND_ICONS: Record<ActivityKind, React.ReactNode> = {
	household: <UserPlusIcon />,
	land: <LayersIcon />,
	gas: <FuelIcon />,
};

function timeAgo(iso: string): string {
	const then = new Date(iso).getTime();
	if (Number.isNaN(then)) return "";
	const diffMs = Date.now() - then;
	const minutes = Math.floor(diffMs / 60_000);
	if (minutes < 1) return "Baru saja";
	if (minutes < 60) return `${minutes} menit lalu`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} jam lalu`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days} hari lalu`;
	return new Date(iso).toLocaleDateString("id-ID", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

export function DashboardActivity({ items }: DashboardActivityProps) {
	return (
		<DashboardCard className="gap-0">
			<CardHeader className="border-b">
				<CardTitle>Aktivitas</CardTitle>
				<CardDescription>Pembaruan terbaru di basis data.</CardDescription>
			</CardHeader>
			<CardContent className="px-0">
				{items.length === 0 ? (
					<div className="flex h-48 items-center justify-center text-xs text-muted-foreground">
						Belum ada aktivitas.
					</div>
				) : (
					<ul className="flex flex-col divide-y divide-border">
						{items.map((item) => (
							<li className="flex h-16 items-center gap-3 px-6" key={item.id}>
								<span
									aria-hidden="true"
									className="flex size-10 shrink-0 items-center justify-center [&_svg]:size-4"
								>
									{KIND_ICONS[item.kind]}
								</span>
								<div className="min-w-0 flex-1 space-y-1">
									<p className="line-clamp-1 text-pretty text-foreground text-sm leading-snug">
										{item.title}
									</p>
									<p className="text-muted-foreground text-xs">
										{timeAgo(item.created_at)}
									</p>
								</div>
							</li>
						))}
					</ul>
				)}
			</CardContent>
		</DashboardCard>
	);
}
