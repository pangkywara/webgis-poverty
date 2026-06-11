"use client";

import { Button } from "@/components/ui/button";
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { DashboardCard } from "@/components/dashboard-card";
import { ArrowRightIcon } from "@/components/ui/phosphor-icons";
import type { HouseholdRow } from "@/lib/poverty-types";

interface RecentHouseholdsProps {
	households: HouseholdRow[];
}

export function RecentHouseholds({ households }: RecentHouseholdsProps) {
	return (
		<DashboardCard className="relative gap-0 md:col-span-2">
			<CardHeader className="border-b">
				<CardTitle className="text-base">Pendataan Terbaru</CardTitle>
				<CardDescription>
					Warga terbaru yang masuk basis data kemiskinan.
				</CardDescription>
			</CardHeader>
			<CardContent className="mask-b-from-50% mask-b-to-100% px-0">
				{households.length === 0 ? (
					<div className="flex h-48 items-center justify-center text-xs text-muted-foreground">
						Belum ada data warga.
					</div>
				) : (
					<Table>
						<TableCaption className="sr-only">
							Warga terbaru dengan nama kepala keluarga, prioritas, dan
							penghasilan.
						</TableCaption>
						<TableHeader>
							<TableRow>
								<TableHead className="ps-6">Kepala Keluarga</TableHead>
								<TableHead>Prioritas</TableHead>
								<TableHead className="pe-6 text-right tabular-nums">
									Penghasilan
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{households.map((h) => (
								<TableRow className="h-12" key={h.id}>
									<TableCell className="max-w-40 truncate ps-6 font-medium">
										{h.head_name}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{h.fuzzy_label ?? h.poverty_level}
									</TableCell>
									<TableCell className="pe-6 text-right tabular-nums">
										Rp {h.penghasilan.toLocaleString("id-ID")}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
			<div className="mask-t-from-30% absolute inset-x-0 bottom-0 flex h-1/5 items-center justify-center bg-background">
				<Button
					className="relative"
					variant="ghost"
					render={<a href="/dashboard/poverty" />}
					nativeButton={false}
				>
					Lihat Semua
					<ArrowRightIcon aria-hidden="true" />
				</Button>
			</div>
		</DashboardCard>
	);
}
