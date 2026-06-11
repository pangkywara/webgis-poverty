/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";
import { ArrowLeftIcon } from "@/components/ui/phosphor-icons";
import { ContinuousTabs } from "@/components/ui/continuous-tabs";

interface GasStationHudProps {
	fuelPriceDisplay: "ron92" | "ron95" | "diesel";
	setFuelPriceDisplay: (price: "ron92" | "ron95" | "diesel") => void;
	brandFilter: string;
	setBrandFilter: (brand: string) => void;
	onCloseMap: () => void;
}

export function GasStationHud({
	fuelPriceDisplay,
	setFuelPriceDisplay,
	brandFilter,
	setBrandFilter,
	onCloseMap,
}: GasStationHudProps) {
	return (
		<div className="absolute top-4 left-4 z-[999] flex flex-col gap-2">
			<div className="flex flex-wrap items-center gap-3 bg-background/90 backdrop-blur-md border border-border/40 p-2.5 rounded-lg shadow-lg max-w-[90vw]">
				<span className="text-[10px] font-bold text-muted-foreground">TAMPILAN:</span>
				<ContinuousTabs
					tabs={[
						{ id: "ron92", label: "RON 92" },
						{ id: "ron95", label: "RON 95" },
						{ id: "diesel", label: "Diesel" },
					]}
					activeId={fuelPriceDisplay}
					onChange={(id) => setFuelPriceDisplay(id as any)}
					size="sm"
				/>
				<Separator orientation="vertical" className="h-5" />
				<ContinuousTabs
					tabs={[
						{ id: "All", label: "Semua" },
						{ id: "Pertamina", label: "Pertamina" },
						{ id: "Shell", label: "Shell" },
						{ id: "BP", label: "BP" },
					]}
					activeId={brandFilter}
					onChange={setBrandFilter}
					size="sm"
				/>
			</div>
		</div>
	);
}
