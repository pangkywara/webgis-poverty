/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface LandAllocationChartProps {
	pieChartData: Array<{
		name: string;
		value: number;
		color: string;
	}>;
}

export function LandAllocationChart({ pieChartData }: LandAllocationChartProps) {
	const [isMounted, setIsMounted] = useState(false);
	useEffect(() => {
		setIsMounted(true);
	}, []);

	return (
		<Card className="bg-background rounded-none border-none shadow-none ring-0 h-full flex flex-col">
			<CardHeader>
				<CardTitle className="text-base font-semibold font-sans">Land Status Breakdown</CardTitle>
				<CardDescription>Acreage and share representation of registered parcels by ownership status.</CardDescription>
			</CardHeader>
			<CardContent className="flex-1 flex flex-col sm:flex-row items-center justify-around gap-6 py-6 min-h-[260px]">
				{pieChartData.length > 0 ? (
					<>
						<div className="h-56 w-56 shrink-0">
							{!isMounted ? (
								<div className="h-full w-full" />
							) : (
								<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={pieChartData}
										cx="50%"
										cy="50%"
										innerRadius={65}
										outerRadius={85}
										paddingAngle={3}
										dataKey="value"
									>
										{pieChartData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.color} />
										))}
									</Pie>
									<Tooltip
										contentStyle={{
											background: "rgba(12, 10, 8, 0.95)",
											border: "1px solid #4d505d",
											borderRadius: "6px",
											fontSize: "12px",
											color: "#ffffff"
										}}
									/>
								</PieChart>
							</ResponsiveContainer>
							)}
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs w-full max-w-sm">
							{pieChartData.map((d, index) => (
								<div key={index} className="flex items-center gap-2 border p-2 rounded bg-background">
									<div className="h-3 w-3 rounded shrink-0" style={{ backgroundColor: d.color }} />
									<div className="flex flex-col min-w-0">
										<span className="font-semibold text-foreground truncate">{d.name}</span>
										<span className="text-[10px] text-muted-foreground">{d.value} Hectares</span>
									</div>
								</div>
							))}
						</div>
					</>
				) : (
					<p className="text-center text-xs text-muted-foreground py-12">Belum ada data poligon lahan.</p>
				)}
			</CardContent>
		</Card>
	);
}
