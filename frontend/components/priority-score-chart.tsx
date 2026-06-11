"use client";

import { useId } from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { formatDate } from "@/components/formater";
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Delta, DeltaIcon, DeltaValue } from "@/components/delta";
import { DashboardCard } from "@/components/dashboard-card";
import type { PovertyOverview } from "@/lib/poverty-types";

interface PriorityScoreChartProps {
	monthly: PovertyOverview["monthly"];
}

const chartConfig = {
	score: {
		label: "Skor Rata-rata",
		color: "var(--chart-1)",
	},
	count: {
		label: "KK Terdata",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig;

export function PriorityScoreChart({ monthly }: PriorityScoreChartProps) {
	const chartUid = useId().replace(/:/g, "");
	const idLineGlow = `priority-score-line-glow-${chartUid}`;

	const chartRows = monthly.map((m) => ({
		month: m.month,
		score: m.avg_score != null ? Number(Number(m.avg_score).toFixed(1)) : null,
		count: m.count,
	}));

	const scored = chartRows.filter((r) => r.score != null);
	const firstScore = scored[0]?.score ?? 0;
	const lastScore = scored.at(-1)?.score ?? 0;
	const growthPct = firstScore > 0 ? ((lastScore - firstScore) / firstScore) * 100 : 0;

	return (
		<DashboardCard className="gap-0 md:col-span-2">
			<CardHeader>
				<div className="min-w-0 space-y-2">
					<div className="flex flex-wrap items-center gap-2">
						<CardTitle>Tren Skor Prioritas</CardTitle>
						{scored.length > 1 && (
							<Delta value={Number(growthPct.toFixed(1))} variant="badge">
								<DeltaIcon variant="trend" />
								<DeltaValue />
							</Delta>
						)}
					</div>
					<CardDescription>
						Skor fuzzy rata-rata dan jumlah KK terdata per bulan.
					</CardDescription>
				</div>
			</CardHeader>
			<CardContent>
				{chartRows.length === 0 ? (
					<div className="flex h-60 w-full items-center justify-center text-xs text-muted-foreground md:h-80">
						Belum ada skor fuzzy yang dihitung.
					</div>
				) : (
					<ChartContainer
						className="aspect-auto h-60 w-full p-0 md:h-80"
						config={chartConfig}
					>
						<LineChart
							accessibilityLayer
							data={chartRows}
							margin={{
								left: 12,
								right: 12,
								top: 8,
							}}
						>
							<CartesianGrid className="stroke-border" vertical={false} />
							<XAxis
								axisLine={false}
								dataKey="month"
								interval={0}
								tickFormatter={(value) => formatDate(`${value}-01`, "month")}
								tickLine={false}
								tickMargin={8}
							/>
							<ChartTooltip
								content={<ChartTooltipContent hideLabel />}
								cursor={false}
							/>
							<defs>
								<filter
									height="140%"
									id={idLineGlow}
									width="140%"
									x="-20%"
									y="-20%"
								>
									<feGaussianBlur result="blur" stdDeviation="10" />
									<feComposite in="SourceGraphic" in2="blur" operator="over" />
								</filter>
							</defs>
							<Line
								dataKey="score"
								dot={false}
								filter={`url(#${idLineGlow})`}
								stroke="var(--color-score)"
								strokeWidth={2}
								type="step"
								connectNulls
							/>
							<Line
								dataKey="count"
								dot={false}
								filter={`url(#${idLineGlow})`}
								stroke="var(--color-count)"
								strokeWidth={2}
								type="step"
							/>
						</LineChart>
					</ChartContainer>
				)}
			</CardContent>
		</DashboardCard>
	);
}
