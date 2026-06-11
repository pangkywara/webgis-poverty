export interface HouseholdRow {
	id: number;
	head_name: string;
	family_count: number;
	poverty_level: string;
	latitude: string;
	longitude: string;
	notes: string | null;
	penghasilan: number;
	kondisi_rumah: number;
	kepemilikan_aset: number;
	created_at: string;
	fuzzy_score: string | number | null;
	fuzzy_label: string | null;
}

export interface PovertyOverview {
	totals: {
		household_count: number;
		total_dependents: number;
		avg_income: number;
		avg_score: number | null;
	};
	by_label: Record<string, number>;
	monthly: { month: string; count: number; avg_score: number | null }[];
	poi: Record<string, number>;
}
