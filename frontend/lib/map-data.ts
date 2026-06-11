export interface RegionData {
	id: string;
	name: string;
	path: string;
	center: { x: number; y: number };
	dataByYear: {
		[year: number]: {
			povertyRate: number;
			gini: number;
			medianIncome: number;
			poorPop: number;
		}
	}
}

export interface GasStation {
	id: string;
	name: string;
	brand: "Pertamina" | "Shell" | "BP" | "Vivo";
	x: number;
	y: number;
	address: string;
	rating: number;
	prices: {
		ron92: number;
		ron95: number;
		diesel: number;
	};
	services: {
		evCharger: boolean;
		minimarket: boolean;
		coffee: boolean;
		carWash: boolean;
	};
	queue: "Low" | "Medium" | "High";
	waitMinutes: number;
	gasTypes?: string[];
}

export const POVERTY_RATES: Record<string, Record<number, number>> = {
	cempaka: { 2020: 12.4, 2021: 11.8, 2022: 11.2, 2023: 10.1, 2024: 9.4, 2025: 8.6, 2026: 7.9 },
	menteng: { 2020: 5.2, 2021: 4.9, 2022: 4.5, 2023: 4.1, 2024: 3.8, 2025: 3.5, 2026: 3.1 },
	sudirman: { 2020: 8.7, 2021: 8.1, 2022: 7.5, 2023: 6.9, 2024: 6.2, 2025: 5.6, 2026: 4.9 },
	kemang: { 2020: 15.6, 2021: 14.8, 2022: 13.9, 2023: 12.8, 2024: 11.9, 2025: 10.7, 2026: 9.8 },
	senen: { 2020: 11.1, 2021: 10.5, 2022: 9.8, 2023: 8.9, 2024: 8.3, 2025: 7.6, 2026: 6.8 },
	pluit: { 2020: 14.2, 2021: 13.5, 2022: 12.6, 2023: 11.7, 2024: 10.8, 2025: 9.7, 2026: 8.9 }
};

export const LAND_MARKER_LABELS: Record<string, string> = {
	marker: "Penanda Lahan",
	flag: "Tengara Lahan",
	protected: "Kawasan Lindung",
	registry: "Kantor Pendaftaran",
	line: "Garis Ukur",
	polygon: "Poligon Lahan",
	circle: "Zona Penyangga"
};

export const LAND_MARKER_COLORS: Record<string, string> = {
	marker: "#3b82f6",
	flag: "rgb(244, 63, 94)",
	protected: "rgb(4, 120, 87)",
	registry: "rgb(29, 78, 216)",
	line: "#ef4444",
	polygon: "#a855f7",
	circle: "#ff3b1f"
};

export const BRAND_COLORS = {
	Pertamina: { bg: "#ff3b1f", text: "#ffffff", border: "#d92c14" },
	Shell: { bg: "#eab308", text: "#000000", border: "#ca8a04" },
	BP: { bg: "#10b981", text: "#ffffff", border: "#059669" },
	Vivo: { bg: "#3b82f6", text: "#ffffff", border: "#2563eb" }
};

// Gas Stations Leaflet-friendly mapping data
export const GAS_STATIONS = [
	{ id: "pertamina-31", name: "Pertamina SPBU 31.124", brand: "Pertamina" as const, lat: -6.195, lng: 106.875, price92: 13200, price95: 14400, diesel: 14900, gasTypes: ["Pertalite", "Pertamax", "Pertamax Turbo", "Dexlite", "Solar"] },
	{ id: "shell-menteng", name: "Shell Menteng", brand: "Shell" as const, lat: -6.200, lng: 106.835, price92: 13850, price95: 14600, diesel: 15100, gasTypes: ["Shell Super", "Shell V-Power", "Shell V-Power Diesel"] },
	{ id: "pertamina-34", name: "Pertamina SPBU 34.110", brand: "Pertamina" as const, lat: -6.225, lng: 106.815, price92: 13200, price95: 14400, diesel: 14900, gasTypes: ["Pertalite", "Pertamax", "Dexlite", "Solar"] },
	{ id: "bp-sudirman", name: "BP Sudirman", brand: "BP" as const, lat: -6.225, lng: 106.822, price92: 13400, price95: 14500, diesel: 14800, gasTypes: ["BP 92", "BP 95", "BP Ultimate", "BP Ultimate Diesel"] },
	{ id: "shell-pluit", name: "Shell Pluit Marina", brand: "Shell" as const, lat: -6.120, lng: 106.785, price92: 13850, price95: 14600, diesel: 15100, gasTypes: ["Shell Super", "Shell V-Power", "Shell V-Power Nitro+", "Shell V-Power Diesel"] },
	{ id: "bp-kemang", name: "BP Kemang Valley", brand: "BP" as const, lat: -6.262, lng: 106.818, price92: 13400, price95: 14500, diesel: 14800, gasTypes: ["BP 92", "BP 95", "BP Ultimate"] }
];

export const REGIONS: RegionData[] = [
	{
		id: "cempaka",
		name: "Cempaka Hills",
		path: "M 150,150 L 350,120 L 400,250 L 250,300 L 150,250 Z",
		center: { x: 260, y: 210 },
		dataByYear: {
			2020: { povertyRate: 12.4, gini: 0.38, medianIncome: 4.8, poorPop: 45.2 },
			2021: { povertyRate: 11.8, gini: 0.37, medianIncome: 5.1, poorPop: 43.5 },
			2022: { povertyRate: 11.2, gini: 0.36, medianIncome: 5.4, poorPop: 41.8 },
			2023: { povertyRate: 10.1, gini: 0.35, medianIncome: 5.9, poorPop: 38.0 },
			2024: { povertyRate: 9.4, gini: 0.34, medianIncome: 6.2, poorPop: 35.8 },
			2025: { povertyRate: 8.6, gini: 0.33, medianIncome: 6.7, poorPop: 33.1 },
			2026: { povertyRate: 7.9, gini: 0.32, medianIncome: 7.1, poorPop: 30.5 }
		}
	},
	{
		id: "menteng",
		name: "Menteng Heights",
		path: "M 350,120 L 550,100 L 600,220 L 450,280 L 400,250 Z",
		center: { x: 470, y: 180 },
		dataByYear: {
			2020: { povertyRate: 5.2, gini: 0.42, medianIncome: 8.5, poorPop: 15.6 },
			2021: { povertyRate: 4.9, gini: 0.41, medianIncome: 9.0, poorPop: 15.0 },
			2022: { povertyRate: 4.5, gini: 0.40, medianIncome: 9.6, poorPop: 14.1 },
			2023: { povertyRate: 4.1, gini: 0.40, medianIncome: 10.2, poorPop: 13.0 },
			2024: { povertyRate: 3.8, gini: 0.39, medianIncome: 11.0, poorPop: 12.2 },
			2025: { povertyRate: 3.5, gini: 0.38, medianIncome: 11.8, poorPop: 11.5 },
			2026: { povertyRate: 3.1, gini: 0.37, medianIncome: 12.5, poorPop: 10.3 }
		}
	},
	{
		id: "sudirman",
		name: "Sudirman Core",
		path: "M 250,300 L 400,250 L 450,280 L 480,400 L 300,420 Z",
		center: { x: 375, y: 330 },
		dataByYear: {
			2020: { povertyRate: 8.7, gini: 0.39, medianIncome: 6.8, poorPop: 28.4 },
			2021: { povertyRate: 8.1, gini: 0.38, medianIncome: 7.2, poorPop: 26.8 },
			2022: { povertyRate: 7.5, gini: 0.37, medianIncome: 7.7, poorPop: 25.1 },
			2023: { povertyRate: 6.9, gini: 0.36, medianIncome: 8.3, poorPop: 23.4 },
			2024: { povertyRate: 6.2, gini: 0.36, medianIncome: 9.0, poorPop: 21.3 },
			2025: { povertyRate: 5.6, gini: 0.35, medianIncome: 9.8, poorPop: 19.5 },
			2026: { povertyRate: 4.9, gini: 0.34, medianIncome: 10.5, poorPop: 17.2 }
		}
	},
	{
		id: "kemang",
		name: "Kemang Valley",
		path: "M 150,250 L 250,300 L 300,420 L 120,380 Z",
		center: { x: 200, y: 340 },
		dataByYear: {
			2020: { povertyRate: 15.6, gini: 0.34, medianIncome: 3.9, poorPop: 62.1 },
			2021: { povertyRate: 14.8, gini: 0.34, medianIncome: 4.2, poorPop: 59.8 },
			2022: { povertyRate: 13.9, gini: 0.33, medianIncome: 4.5, poorPop: 57.0 },
			2023: { povertyRate: 12.8, gini: 0.33, medianIncome: 4.9, poorPop: 53.2 },
			2024: { povertyRate: 11.9, gini: 0.32, medianIncome: 5.3, poorPop: 50.1 },
			2025: { povertyRate: 10.7, gini: 0.31, medianIncome: 5.8, poorPop: 45.6 },
			2026: { povertyRate: 9.8, gini: 0.30, medianIncome: 6.4, poorPop: 42.0 }
		}
	},
	{
		id: "senen",
		name: "Senen District",
		path: "M 450,280 L 600,220 L 680,350 L 580,410 L 480,400 Z",
		center: { x: 560, y: 310 },
		dataByYear: {
			2020: { povertyRate: 11.1, gini: 0.36, medianIncome: 5.2, poorPop: 37.8 },
			2021: { povertyRate: 10.5, gini: 0.35, medianIncome: 5.5, poorPop: 36.1 },
			2022: { povertyRate: 9.8, gini: 0.34, medianIncome: 5.9, poorPop: 34.2 },
			2023: { povertyRate: 8.9, gini: 0.34, medianIncome: 6.4, poorPop: 31.5 },
			2024: { povertyRate: 8.3, gini: 0.33, medianIncome: 6.8, poorPop: 29.8 },
			2025: { povertyRate: 7.6, gini: 0.32, medianIncome: 7.3, poorPop: 27.6 },
			2026: { povertyRate: 6.8, gini: 0.31, medianIncome: 7.9, poorPop: 25.0 }
		}
	},
	{
		id: "pluit",
		name: "Pluit Marina",
		path: "M 300,420 L 480,400 L 580,410 L 520,480 L 320,480 Z",
		center: { x: 440, y: 450 },
		dataByYear: {
			2020: { povertyRate: 14.2, gini: 0.37, medianIncome: 4.1, poorPop: 51.5 },
			2021: { povertyRate: 13.5, gini: 0.36, medianIncome: 4.4, poorPop: 49.6 },
			2022: { povertyRate: 12.6, gini: 0.35, medianIncome: 4.7, poorPop: 46.9 },
			2023: { povertyRate: 11.7, gini: 0.35, medianIncome: 5.1, poorPop: 44.1 },
			2024: { povertyRate: 10.8, gini: 0.34, medianIncome: 5.5, poorPop: 41.2 },
			2025: { povertyRate: 9.7, gini: 0.33, medianIncome: 6.0, poorPop: 37.4 },
			2026: { povertyRate: 8.9, gini: 0.32, medianIncome: 6.5, poorPop: 34.8 }
		}
	}
];

export const STATIONS: GasStation[] = [
	{
		id: "pertamina-31",
		name: "Pertamina SPBU 31.124",
		brand: "Pertamina",
		x: 230,
		y: 180,
		address: "Jl. Cempaka Hills No. 12, South Jakarta",
		rating: 4.3,
		prices: { ron92: 13200, ron95: 14400, diesel: 14900 },
		services: { evCharger: true, minimarket: true, coffee: false, carWash: true },
		queue: "Medium",
		waitMinutes: 8,
		gasTypes: ["Pertalite", "Pertamax", "Pertamax Turbo", "Dexlite", "Solar"]
	},
	{
		id: "shell-menteng",
		name: "Shell Menteng",
		brand: "Shell",
		x: 480,
		y: 150,
		address: "Jl. Menteng Raya No. 44, Central Jakarta",
		rating: 4.7,
		prices: { ron92: 13850, ron95: 14600, diesel: 15100 },
		services: { evCharger: false, minimarket: true, coffee: true, carWash: true },
		queue: "Low",
		waitMinutes: 2,
		gasTypes: ["Shell Super", "Shell V-Power", "Shell V-Power Diesel"]
	},
	{
		id: "pertamina-34",
		name: "Pertamina SPBU 34.110",
		brand: "Pertamina",
		x: 350,
		y: 290,
		address: "Jl. Sudirman Core Kav. 21, South Jakarta",
		rating: 4.1,
		prices: { ron92: 13200, ron95: 14400, diesel: 14900 },
		services: { evCharger: true, minimarket: true, coffee: true, carWash: false },
		queue: "High",
		waitMinutes: 18,
		gasTypes: ["Pertalite", "Pertamax", "Dexlite", "Solar"]
	},
	{
		id: "bp-sudirman",
		name: "BP Sudirman",
		brand: "BP",
		x: 520,
		y: 330,
		address: "Jl. Sudirman Core No. 78, South Jakarta",
		rating: 4.5,
		prices: { ron92: 13400, ron95: 14500, diesel: 14800 },
		services: { evCharger: true, minimarket: true, coffee: true, carWash: false },
		queue: "Low",
		waitMinutes: 3,
		gasTypes: ["BP 92", "BP 95", "BP Ultimate", "BP Ultimate Diesel"]
	},
	{
		id: "shell-pluit",
		name: "Shell Pluit Marina",
		brand: "Shell",
		x: 420,
		y: 420,
		address: "Jl. Pluit Marina Blok B-2, North Jakarta",
		rating: 4.6,
		prices: { ron92: 13850, ron95: 14600, diesel: 15100 },
		services: { evCharger: false, minimarket: true, coffee: true, carWash: true },
		queue: "High",
		waitMinutes: 14,
		gasTypes: ["Shell Super", "Shell V-Power", "Shell V-Power Nitro+", "Shell V-Power Diesel"]
	},
	{
		id: "bp-kemang",
		name: "BP Kemang Valley",
		brand: "BP",
		x: 210,
		y: 360,
		address: "Jl. Kemang Valley Raya No. 9, South Jakarta",
		rating: 4.4,
		prices: { ron92: 13400, ron95: 14500, diesel: 14800 },
		services: { evCharger: false, minimarket: true, coffee: true, carWash: true },
		queue: "Medium",
		waitMinutes: 6,
		gasTypes: ["BP 92", "BP 95", "BP Ultimate"]
	}
];
