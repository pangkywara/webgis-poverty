export interface GasStationStats {
	total: number;
	gas_pump: number;
	charging_station: number;
	charging_station_active: number;
	wrench: number;
}

export type ActivityKind = "household" | "land" | "gas";

export interface ActivityItem {
	id: string;
	kind: ActivityKind;
	title: string;
	created_at: string;
}
