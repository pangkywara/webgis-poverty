import { Card } from "@/components/ui/card";
import { FuelIcon } from "@/components/ui/phosphor-icons";

export interface FuelPriceData {
	region: string;
	pertalite: number | null;
	pertamax: number | null;
	pertamaxGreen: number | null;
	pertamaxTurbo: number | null;
	pertamaxPertashop: number | null;
	pertaminaDex: number | null;
	dexlite: number | null;
	bioSolarNonSubsidi: number | null;
	bioSolarSubsidi: number | null;
}

export interface FuelPricesResponse {
	succeeded: boolean;
	lastUpdated: string;
	gasoline: FuelPriceData[];
	diesel: FuelPriceData[];
}

interface GasStationStatsCardsProps {
	fuelPrices: FuelPricesResponse | null;
	loading: boolean;
}

export function GasStationStatsCards({ fuelPrices, loading }: GasStationStatsCardsProps) {
	// Find Kalimantan Barat prices
	const kalbarGas = fuelPrices?.gasoline?.find(
		(g) => g.region === "Prov. Kalimantan Barat"
	);
	const kalbarDiesel = fuelPrices?.diesel?.find(
		(d) => d.region === "Prov. Kalimantan Barat"
	);

	const formatPrice = (p: number | null | undefined) => {
		if (loading) return "Loading...";
		if (p == null) return "Rp —";
		return "Rp " + p.toLocaleString("id-ID");
	};

	const lastUpdatedText = fuelPrices?.lastUpdated || "Update terbaru";

	return (
		<>
			{/* Card 1: Pertalite */}
			<Card className="bg-background rounded-none border-none shadow-none ring-0 flex flex-col justify-between h-full">
				<div className="px-6 pt-6 pb-4">
					<div className="flex justify-between items-center pb-1">
						<span className="text-xs font-medium text-muted-foreground">Pertalite (RON 90)</span>
						<FuelIcon className="h-4 w-4 text-emerald-500" />
					</div>
					<div className="text-3xl font-bold text-foreground mt-2">
						{formatPrice(kalbarGas?.pertalite)}
					</div>
				</div>
				<div className="border-t px-6 py-3 flex items-center justify-between text-[10px] text-muted-foreground mt-auto font-sans">
					<span>Prov. Kalimantan Barat</span>
					<span className="text-muted-foreground/80">{lastUpdatedText}</span>
				</div>
			</Card>

			{/* Card 2: Pertamax */}
			<Card className="bg-background rounded-none border-none shadow-none ring-0 flex flex-col justify-between h-full">
				<div className="px-6 pt-6 pb-4">
					<div className="flex justify-between items-center pb-1">
						<span className="text-xs font-medium text-muted-foreground">Pertamax (RON 92)</span>
						<FuelIcon className="h-4 w-4 text-emerald-500" />
					</div>
					<div className="text-3xl font-bold text-foreground mt-2">
						{formatPrice(kalbarGas?.pertamax)}
					</div>
				</div>
				<div className="border-t px-6 py-3 flex items-center justify-between text-[10px] text-muted-foreground mt-auto font-sans">
					<span>Prov. Kalimantan Barat</span>
					<span className="text-muted-foreground/80">{lastUpdatedText}</span>
				</div>
			</Card>

			{/* Card 3: Dexlite */}
			<Card className="bg-background rounded-none border-none shadow-none ring-0 flex flex-col justify-between h-full">
				<div className="px-6 pt-6 pb-4">
					<div className="flex justify-between items-center pb-1">
						<span className="text-xs font-medium text-muted-foreground">Dexlite (Diesel)</span>
						<FuelIcon className="h-4 w-4 text-emerald-500" />
					</div>
					<div className="text-3xl font-bold text-foreground mt-2">
						{formatPrice(kalbarDiesel?.dexlite)}
					</div>
				</div>
				<div className="border-t px-6 py-3 flex items-center justify-between text-[10px] text-muted-foreground mt-auto font-sans">
					<span>Prov. Kalimantan Barat</span>
					<span className="text-muted-foreground/80">{lastUpdatedText}</span>
				</div>
			</Card>

			{/* Card 4: Bio Solar (Subsidi) */}
			<Card className="bg-background rounded-none border-none shadow-none ring-0 flex flex-col justify-between h-full">
				<div className="px-6 pt-6 pb-4">
					<div className="flex justify-between items-center pb-1">
						<span className="text-xs font-medium text-muted-foreground">Bio Solar (Subsidi)</span>
						<FuelIcon className="h-4 w-4 text-emerald-500" />
					</div>
					<div className="text-3xl font-bold text-foreground mt-2">
						{formatPrice(kalbarDiesel?.bioSolarSubsidi)}
					</div>
				</div>
				<div className="border-t px-6 py-3 flex items-center justify-between text-[10px] text-muted-foreground mt-auto font-sans">
					<span>Prov. Kalimantan Barat</span>
					<span className="text-muted-foreground/80">{lastUpdatedText}</span>
				</div>
			</Card>
		</>
	);
}
