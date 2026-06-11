"use client";

import type * as React from "react";
import { Bar, BarChart, XAxis } from "recharts";
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
import { formatDate } from "@/components/formater";
import type { PovertyOverview } from "@/lib/poverty-types";

interface HouseholdsTrendChartProps {
	monthly: PovertyOverview["monthly"];
}

const chartConfig = {
	count: {
		label: "KK Terdata",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig;

function CustomGradientBar(
	props: React.SVGProps<SVGRectElement> & {
		index?: number;
		dataKey?: string | number;
	}
) {
	const {
		fill,
		x = 0,
		y = 0,
		width = 0,
		height = 0,
		dataKey = "count",
		index = 0,
	} = props;
	const gid = `gradient-bar-${String(dataKey)}-${index}`;

	return (
		<>
			<rect
				fill={`url(#${gid})`}
				height={height}
				stroke="none"
				width={width}
				x={x}
				y={y}
			/>
			<rect fill={fill} height={2} stroke="none" width={width} x={x} y={y} />
			<defs>
				<linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
					<stop offset="0%" stopColor={fill} stopOpacity={0.5} />
					<stop offset="100%" stopColor={fill} stopOpacity={0} />
				</linearGradient>
			</defs>
		</>
	);
}

export function HouseholdsTrendChart({ monthly }: HouseholdsTrendChartProps) {
	const chartRows = monthly.map((m) => ({ month: m.month, count: m.count }));

	const first = chartRows[0]?.count ?? 0;
	const last = chartRows.at(-1)?.count ?? 0;
	const growthPct = first > 0 ? ((last - first) / first) * 100 : 0;

	return (
		<DashboardCard className="gap-0 md:col-span-2">
			<CardHeader className="gap-2">
				<div className="flex flex-wrap items-center gap-2">
					<CardTitle>Pendataan Warga</CardTitle>
					{chartRows.length > 1 && (
						<Delta value={Number(growthPct.toFixed(1))} variant="badge">
							<DeltaIcon variant="trend" />
							<DeltaValue />
						</Delta>
					)}
				</div>
				<CardDescription>
					KK baru terdata per bulan, 12 bulan terakhir.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{chartRows.length === 0 ? (
					<div className="flex h-60 w-full items-center justify-center text-xs text-muted-foreground md:h-80">
						Belum ada data pendataan warga.
					</div>
				) : (
					<ChartContainer
						className="aspect-auto h-60 w-full md:h-80"
						config={chartConfig}
					>
						<BarChart accessibilityLayer data={chartRows}>
							<XAxis
								axisLine={false}
								dataKey="month"
								interval={0}
								tickFormatter={(value) => formatDate(`${value}-01`, "month")}
								tickLine={false}
								tickMargin={10}
							/>
							<ChartTooltip
								content={<ChartTooltipContent hideLabel />}
								cursor={false}
							/>
							<Bar
								dataKey="count"
								fill="var(--color-count)"
								shape={<CustomGradientBar />}
							/>
						</BarChart>
					</ChartContainer>
				)}
			</CardContent>
		</DashboardCard>
	);
}
