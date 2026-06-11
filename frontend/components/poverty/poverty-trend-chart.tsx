/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { PovertyOverview } from "@/lib/poverty-types";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function formatMonth(ym: string) {
	const [year, month] = ym.split("-");
	return `${MONTH_NAMES[Number(month) - 1] ?? month} '${year.slice(2)}`;
}

interface PovertyTrendChartProps {
	monthly: PovertyOverview["monthly"];
}

export function PovertyTrendChart({ monthly }: PovertyTrendChartProps) {
	const [isMounted, setIsMounted] = useState(false);
	useEffect(() => {
		setIsMounted(true);
	}, []);

	const chartData = monthly.map((m) => ({
		month: formatMonth(m.month),
		pendataan: m.count,
		skor: m.avg_score != null ? Number(Number(m.avg_score).toFixed(1)) : null,
	}));

	return (
		<Card className="bg-background rounded-none border-none shadow-none ring-0 h-full flex flex-col">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle className="text-base font-semibold">Tren Pendataan Warga</CardTitle>
					<CardDescription>Jumlah pendataan baru dan rata-rata skor prioritas fuzzy per bulan, dari basis data.</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="flex-1 w-full pt-4 min-h-[320px] relative">
				{chartData.length === 0 ? (
					<div className="h-full flex items-center justify-center text-xs text-muted-foreground">
						Belum ada data pendataan. Tambah marker warga di peta untuk memulai.
					</div>
				) : !isMounted ? (
					<div className="h-full w-full" />
				) : (
					<div className="absolute inset-0 pt-4 px-6 pb-4">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
								<XAxis dataKey="month" tickLine={false} style={{ fontSize: 11 }} stroke="#999ba3" />
								<YAxis tickLine={false} style={{ fontSize: 11 }} stroke="#999ba3" />
								<Tooltip
									contentStyle={{
										background: "rgba(12, 10, 8, 0.95)",
										border: "1px solid #4d505d",
										borderRadius: "6px",
										fontSize: "12px",
										color: "#ffffff"
									}}
								/>
								<Line
									type="monotone"
									dataKey="skor"
									stroke="#ff3b1f"
									strokeWidth={3}
									dot={{ fill: "#ff3b1f", r: 4 }}
									activeDot={{ r: 6 }}
									name="Rata-rata Skor Fuzzy"
									connectNulls
								/>
								<Line
									type="monotone"
									dataKey="pendataan"
									stroke="#5683d2"
									strokeWidth={2}
									dot={{ fill: "#5683d2", r: 3 }}
									activeDot={{ r: 5 }}
									name="Pendataan Baru (KK)"
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
