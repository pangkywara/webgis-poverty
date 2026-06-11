import { Card } from "@/components/ui/card";
import { LayersIcon, RoadHorizonIcon, MapPinIcon } from "@/components/ui/phosphor-icons";

interface LandStatsCardsProps {
	aggregateStats: {
		totalParcelArea: string;
		totalRoadLength: string;
		activeMarkers: number;
	};
}

export function LandStatsCards({ aggregateStats }: LandStatsCardsProps) {
	return (
		<>
			<Card className="bg-background rounded-none border-none shadow-none ring-0 flex flex-col justify-between h-full">
				<div className="px-6 pt-6 pb-4">
					<div className="flex justify-between items-center pb-2">
						<span className="text-xs font-medium text-muted-foreground">Total Parcel Area</span>
						<LayersIcon className="h-4 w-4 text-emerald-500" />
					</div>
					<div className="text-3xl font-bold text-foreground mt-2">{aggregateStats.totalParcelArea} Ha</div>
				</div>
				<div className="border-t px-6 py-3 text-xs text-muted-foreground mt-auto">
					Sum of all registered polygon parcels
				</div>
			</Card>

			<Card className="bg-background rounded-none border-none shadow-none ring-0 flex flex-col justify-between h-full">
				<div className="px-6 pt-6 pb-4">
					<div className="flex justify-between items-center pb-2">
						<span className="text-xs font-medium text-muted-foreground">Total Road Length</span>
						<RoadHorizonIcon className="h-4 w-4 text-cobalt-glow" />
					</div>
					<div className="text-3xl font-bold text-foreground mt-2">{aggregateStats.totalRoadLength} km</div>
				</div>
				<div className="border-t px-6 py-3 text-xs text-muted-foreground mt-auto">
					Sum of all measured road/line segments
				</div>
			</Card>

			<Card className="bg-background rounded-none border-none shadow-none ring-0 flex flex-col justify-between h-full">
				<div className="px-6 pt-6 pb-4">
					<div className="flex justify-between items-center pb-2">
						<span className="text-xs font-medium text-muted-foreground">Active Markers</span>
						<MapPinIcon className="h-4 w-4 text-primary" />
					</div>
					<div className="text-3xl font-bold text-foreground mt-2">{aggregateStats.activeMarkers} Markers</div>
				</div>
				<div className="border-t px-6 py-3 text-xs text-muted-foreground mt-auto">
					Land pins, survey flags, protected zones &amp; registries
				</div>
			</Card>
		</>
	);
}
