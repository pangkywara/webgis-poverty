"use client";

import { AppShell } from "@/components/app-shell";
import { Dashboard } from "@/components/dashboard";
import { HouseIcon } from "@/components/ui/phosphor-icons";

export default function DashboardPage() {
	return (
		<AppShell activePath="/dashboard">
			<div className="flex flex-col gap-6">
				{/* Page Header */}
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2.5">
						<h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
							Beranda Analitik
						</h1>
					</div>
					<p className="text-xs text-muted-foreground">
						Overview status statistik, data kemiskinan, peta wilayah, dan operasional SPBU.
					</p>
				</div>

				<Dashboard />
			</div>
		</AppShell>
	);
}
