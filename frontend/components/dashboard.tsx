"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardActivity } from "@/components/dashboard-activity";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { HouseholdsTrendChart } from "@/components/households-trend-chart";
import { PriorityBreakdown } from "@/components/priority-breakdown";
import { PriorityScoreChart } from "@/components/priority-score-chart";
import { RecentHouseholds } from "@/components/recent-households";
import { DashboardStats } from "@/components/stats";
import type { ActivityItem, GasStationStats } from "@/lib/dashboard-types";
import type { HouseholdRow, PovertyOverview } from "@/lib/poverty-types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

type NamedRow = { id: number; name: string; created_at?: string };

export function Dashboard() {
	const [loading, setLoading] = useState(true);
	const [overview, setOverview] = useState<PovertyOverview | null>(null);
	const [households, setHouseholds] = useState<HouseholdRow[]>([]);
	const [gasStats, setGasStats] = useState<GasStationStats | null>(null);
	const [landMarkers, setLandMarkers] = useState<NamedRow[]>([]);
	const [landShapes, setLandShapes] = useState<NamedRow[]>([]);
	const [gasMarkers, setGasMarkers] = useState<NamedRow[]>([]);

	// Aggregates everything the overview widgets need, straight from the DB.
	useEffect(() => {
		const token = localStorage.getItem("auth_token");
		const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
		const get = (path: string) => fetch(`${BACKEND_URL}${path}`, { headers }).then((r) => r.json());
		const asRows = (r: PromiseSettledResult<unknown>) =>
			r.status === "fulfilled" && Array.isArray(r.value) ? (r.value as NamedRow[]) : [];

		Promise.allSettled([
			get("/households/stats-overview"),
			get("/households"),
			get("/gas-station/stats"),
			get("/land/markers"),
			get("/land/shapes"),
			get("/gas-station/markers"),
		]).then(([overviewR, hhR, gasStatsR, landMarkersR, landShapesR, gasMarkersR]) => {
			if (overviewR.status === "fulfilled" && overviewR.value?.totals) {
				setOverview(overviewR.value as PovertyOverview);
			}
			if (hhR.status === "fulfilled" && Array.isArray(hhR.value)) {
				setHouseholds(hhR.value as HouseholdRow[]);
			}
			if (gasStatsR.status === "fulfilled" && typeof gasStatsR.value?.total === "number") {
				setGasStats(gasStatsR.value as GasStationStats);
			}
			setLandMarkers(asRows(landMarkersR));
			setLandShapes(asRows(landShapesR));
			setGasMarkers(asRows(gasMarkersR));
			setLoading(false);
		});
	}, []);

	const activity = useMemo<ActivityItem[]>(() => {
		const items: ActivityItem[] = [
			...households.map((h) => ({
				id: `hh-${h.id}`,
				kind: "household" as const,
				title: `Warga "${h.head_name}" terdata`,
				created_at: h.created_at,
			})),
			...landMarkers.map((m) => ({
				id: `lm-${m.id}`,
				kind: "land" as const,
				title: `Penanda lahan "${m.name}" ditambahkan`,
				created_at: m.created_at ?? "",
			})),
			...landShapes.map((s) => ({
				id: `ls-${s.id}`,
				kind: "land" as const,
				title: `Bidang lahan "${s.name}" digambar`,
				created_at: s.created_at ?? "",
			})),
			...gasMarkers.map((g) => ({
				id: `gs-${g.id}`,
				kind: "gas" as const,
				title: `Fasilitas "${g.name}" dipetakan`,
				created_at: g.created_at ?? "",
			})),
		];
		return items
			.filter((i) => i.created_at)
			.sort((a, b) => b.created_at.localeCompare(a.created_at))
			.slice(0, 4);
	}, [households, landMarkers, landShapes, gasMarkers]);

	if (loading) return <DashboardSkeleton />;

	return (
		<div className="grid grid-cols-1 gap-px bg-border border rounded-xl overflow-hidden md:grid-cols-2 lg:grid-cols-4 shadow-none">
			<DashboardStats
				overview={overview}
				gasStats={gasStats}
				landMarkerCount={landMarkers.length}
				landShapeCount={landShapes.length}
			/>
			<HouseholdsTrendChart monthly={overview?.monthly ?? []} />
			<PriorityScoreChart monthly={overview?.monthly ?? []} />
			<RecentHouseholds households={households.slice(0, 4)} />
			<PriorityBreakdown byLabel={overview?.by_label ?? null} />
			<DashboardActivity items={activity} />
		</div>
	);
}
