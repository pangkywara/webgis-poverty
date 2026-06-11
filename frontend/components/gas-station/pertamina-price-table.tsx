"use client";

import { useState, useMemo } from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCard } from "@/components/dashboard-card";
import { Input } from "@/components/ui/input";
import { SearchIcon, FuelIcon } from "@/components/ui/phosphor-icons";
import { ContinuousTabs } from "@/components/ui/continuous-tabs";
import type { FuelPricesResponse } from "./gas-station-stats-cards";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface PertaminaPriceTableProps {
	fuelPrices: FuelPricesResponse | null;
	loading: boolean;
}

export function PertaminaPriceTable({ fuelPrices, loading }: PertaminaPriceTableProps) {
	const [activeTab, setActiveTab] = useState<string>("gasoline");
	const [searchQuery, setSearchQuery] = useState<string>("");

	const dataList = useMemo(() => {
		if (!fuelPrices) return [];
		return activeTab === "gasoline" ? fuelPrices.gasoline : fuelPrices.diesel;
	}, [fuelPrices, activeTab]);

	const filteredData = useMemo(() => {
		return dataList.filter((row) =>
			row.region?.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}, [dataList, searchQuery]);

	const formatVal = (val: number | null) => {
		if (val == null) return <span className="text-muted-foreground/45">—</span>;
		return <span className="font-semibold text-foreground">Rp {val.toLocaleString("id-ID")}</span>;
	};

	return (
		<DashboardCard className="relative gap-0 h-full flex flex-col">
			<CardHeader className="border-b border-border/60 bg-muted/10 px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
				<div>
					<CardTitle className="text-base font-semibold flex items-center gap-2">
						<FuelIcon className="h-5 w-5 text-primary" />
						Daftar Harga BBM Pertamina Seluruh Indonesia
					</CardTitle>
					<CardDescription>
						Data real-time disinkronkan dari Pertamina Patra Niaga ({fuelPrices?.lastUpdated || "Update terbaru"}).
					</CardDescription>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
					<div className="relative w-full sm:w-64">
						<SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Cari provinsi..."
							className="pl-9 bg-background h-9 text-xs"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<ContinuousTabs
						tabs={[
							{ id: "gasoline", label: "Bensin (Gasoline)" },
							{ id: "diesel", label: "Solar (Gasoil)" },
						]}
						activeId={activeTab}
						onChange={setActiveTab}
						size="sm"
					/>
				</div>
			</CardHeader>

			<CardContent className="p-0 flex-1 flex flex-col">
				{loading ? (
					<div className="py-12 text-center text-sm text-muted-foreground">
						Memuat data harga BBM terbaru...
					</div>
				) : filteredData.length === 0 ? (
					<div className="py-12 text-center text-sm text-muted-foreground">
						Tidak ada data provinsi yang cocok.
					</div>
				) : (
					<div className="overflow-x-auto w-full max-h-[420px] overflow-y-auto">
						<Table>
							<TableHeader className="bg-muted/30 sticky top-0 backdrop-blur z-10">
								<TableRow>
									<TableHead className="px-6 py-3 min-w-[200px] text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Provinsi / Wilayah</TableHead>
									{activeTab === "gasoline" ? (
										<>
											<TableHead className="px-6 py-3 text-right text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Pertalite (90)</TableHead>
											<TableHead className="px-6 py-3 text-right text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Pertamax (92)</TableHead>
											<TableHead className="px-6 py-3 text-right text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Pertamax Green 95</TableHead>
											<TableHead className="px-6 py-3 text-right text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Pertamax Turbo (98)</TableHead>
											<TableHead className="px-6 py-3 text-right text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Pertamax Pertashop</TableHead>
										</>
									) : (
										<>
											<TableHead className="px-6 py-3 text-right text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Bio Solar (Subsidi)</TableHead>
											<TableHead className="px-6 py-3 text-right text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Bio Solar (Non-Sub)</TableHead>
											<TableHead className="px-6 py-3 text-right text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Dexlite</TableHead>
											<TableHead className="px-6 py-3 text-right text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Pertamina Dex</TableHead>
										</>
									)}
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredData.map((row) => {
									const isKalbar = row.region === "Prov. Kalimantan Barat";
									return (
										<TableRow
											key={row.region}
											className={`text-xs transition-colors hover:bg-muted/40 h-12 ${
												isKalbar
													? "bg-amber-500/5 hover:bg-amber-500/10 border-l-4 border-l-amber-500 font-semibold"
													: ""
											}`}
										>
											<TableCell className="px-6 py-3.5 font-medium flex items-center gap-2">
												{isKalbar && (
													<span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
												)}
												{row.region}
											</TableCell>
											{activeTab === "gasoline" ? (
												<>
													<TableCell className="px-6 py-3.5 text-right">{formatVal(row.pertalite)}</TableCell>
													<TableCell className="px-6 py-3.5 text-right">{formatVal(row.pertamax)}</TableCell>
													<TableCell className="px-6 py-3.5 text-right">{formatVal(row.pertamaxGreen)}</TableCell>
													<TableCell className="px-6 py-3.5 text-right">{formatVal(row.pertamaxTurbo)}</TableCell>
													<TableCell className="px-6 py-3.5 text-right">{formatVal(row.pertamaxPertashop)}</TableCell>
												</>
											) : (
												<>
													<TableCell className="px-6 py-3.5 text-right">{formatVal(row.bioSolarSubsidi)}</TableCell>
													<TableCell className="px-6 py-3.5 text-right">{formatVal(row.bioSolarNonSubsidi)}</TableCell>
													<TableCell className="px-6 py-3.5 text-right">{formatVal(row.dexlite)}</TableCell>
													<TableCell className="px-6 py-3.5 text-right">{formatVal(row.pertaminaDex)}</TableCell>
												</>
											)}
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</DashboardCard>
	);
}
