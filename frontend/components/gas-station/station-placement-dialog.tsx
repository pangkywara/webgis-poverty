"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */


import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { UserMarker } from "@/components/leaflet-map";

/* ─── Selectors Options ────────────────────────── */

const EV_TYPES = [
	{ value: "DC Fast",      label: "DC Fast",      color: "#10b981" },
	{ value: "Supercharger", label: "Supercharger", color: "#14b8a6" },
	{ value: "AC Level 2",   label: "AC Level 2",   color: "#3b82f6" },
];

const EV_STATUSES = [
	{ value: "Active",      label: "Active",      color: "#10b981" },
	{ value: "Maintenance", label: "Maintenance", color: "#eab308" },
	{ value: "Offline",     label: "Offline",     color: "#ef4444" },
];

const GAS_BRANDS = [
	{ value: "Pertamina", label: "Pertamina", color: "#ef4444" },
	{ value: "Shell",     label: "Shell",     color: "#eab308" },
	{ value: "BP",        label: "BP",        color: "#10b981" },
	{ value: "Vivo",      label: "Vivo",      color: "#3b82f6" },
];

const GAS_TYPES_BY_BRAND: Record<string, string[]> = {
	Pertamina: ["Pertalite", "Pertamax", "Pertamax Green", "Pertamax Turbo", "Dexlite", "Pertamina Dex", "Solar"],
	Shell: ["Shell Super", "Shell V-Power", "Shell V-Power Nitro+", "Shell V-Power Diesel"],
	BP: ["BP 92", "BP 95", "BP Ultimate", "BP Ultimate Diesel"],
	Vivo: ["Revvo 90", "Revvo 92", "Revvo 95"],
};

const REPAIR_SPECIALITIES = [
	{ value: "Umum",            label: "Umum",            color: "#6b7280" },
	{ value: "AC & Kelistrikan",label: "AC & Kelistrikan",color: "#0ea5e9" },
	{ value: "Mesin",           label: "Mesin",           color: "#f97316" },
	{ value: "Ban & Velg",      label: "Ban & Velg",      color: "#f59e0b" },
];

/* ─── Helpers ───────────────────────────────────── */

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
	return (
		<div className={cn("flex flex-col gap-1.5", className)}>
			<span className="text-[11px] font-semibold text-foreground/60 uppercase tracking-wider">
				{label}
			</span>
			{children}
		</div>
	);
}

function ChipSelector({
	options,
	value,
	onChange,
}: {
	options: { value: string; label: string; color: string }[];
	value: string;
	onChange: (v: string) => void;
}) {
	return (
		<div className="flex flex-wrap gap-1.5">
			{options.map((opt) => {
				const isSelected = value === opt.value;
				return (
					<button
						key={opt.value}
						type="button"
						onClick={() => onChange(opt.value)}
						className={cn(
							"h-8 rounded-lg border px-3 text-[11px] font-semibold transition-all cursor-pointer",
							isSelected
								? "border-transparent text-white shadow-sm animate-in fade-in zoom-in-95 duration-150"
								: "border-border text-foreground/70 hover:bg-muted"
						)}
						style={isSelected ? { backgroundColor: opt.color } : undefined}
					>
						{opt.label}
					</button>
				);
			})}
		</div>
	);
}

function MultiChipSelector({
	options,
	values,
	onChange,
	color,
}: {
	options: string[];
	values: string[];
	onChange: (v: string[]) => void;
	color: string;
}) {
	return (
		<div className="flex flex-wrap gap-1.5">
			{options.map((opt) => {
				const isSelected = values.includes(opt);
				return (
					<button
						key={opt}
						type="button"
						onClick={() => {
							if (isSelected) {
								onChange(values.filter((v) => v !== opt));
							} else {
								onChange([...values, opt]);
							}
						}}
						className={cn(
							"h-8 rounded-lg border px-3 text-[11px] font-semibold transition-all cursor-pointer",
							isSelected
								? "border-transparent text-white shadow-sm"
								: "border-border text-foreground/70 hover:bg-muted"
						)}
						style={isSelected ? { backgroundColor: color } : undefined}
					>
						{opt}
					</button>
				);
			})}
		</div>
	);
}

/* ─── Placement Dialog ─────────────────────────── */

interface StationPlacementDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	pendingClick: { lat: number; lng: number } | null;
	markerType: string | null;
	onConfirm: (marker: UserMarker) => void;
}

export function StationPlacementDialog({
	open,
	onOpenChange,
	pendingClick,
	markerType,
	onConfirm,
}: StationPlacementDialogProps) {
	const [category, setCategory] = useState("gas-pump");
	const [name, setName] = useState("");
	
	// Form fields for EV Charger
	const [evType, setEvType] = useState("DC Fast");
	const [evStatus, setEvStatus] = useState("Active");

	// Form fields for Gas Station
	const [gasBrand, setGasBrand] = useState("Pertamina");
	const [gasHours, setGasHours] = useState("24 Jam");
	const [selectedGasTypes, setSelectedGasTypes] = useState<string[]>([]);

	// Form fields for Repair Shop
	const [repairSpeciality, setRepairSpeciality] = useState("Umum");
	const [repairStatus, setRepairStatus] = useState("Buka 08:00 - 17:00");

	// Submission state
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

	// Synchronize with initial markerType when dialog opens
	useEffect(() => {
		if (open && markerType) {
			setCategory(markerType);
			setName("");
			setEvType("DC Fast");
			setEvStatus("Active");
			setGasBrand("Pertamina");
			setGasHours("24 Jam");
			setSelectedGasTypes(GAS_TYPES_BY_BRAND["Pertamina"]);
			setRepairSpeciality("Umum");
			setRepairStatus("Buka 08:00 - 17:00");
			setError(null);
			setIsSubmitting(false);
		}
	}, [open, markerType]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!pendingClick) return;

		setIsSubmitting(true);
		setError(null);

		let finalPoiType = "";
		let finalNotes = "";

		const brand = category === "gas-pump" ? gasBrand : null;
		const sub_type = category === "charging-station" ? evType : (category === "wrench" ? repairSpeciality : null);
		const gas_types = category === "gas-pump" ? selectedGasTypes : null;
		const operating_hours = category === "gas-pump" ? gasHours : null;
		const status = category === "charging-station" ? evStatus : (category === "wrench" ? repairStatus : null);

		if (category === "charging-station") {
			finalPoiType = evType;
			finalNotes = `Status: ${evStatus}`;
		} else if (category === "gas-pump") {
			finalPoiType = gasBrand;
			finalNotes = `Jam: ${gasHours}`;
		} else if (category === "wrench") {
			finalPoiType = repairSpeciality;
			finalNotes = repairStatus;
		}

		try {
			const token = localStorage.getItem("auth_token");
			const res = await fetch(`${BACKEND_URL}/gas-station/markers`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({
					name: name.trim() || `New ${category.replace("-", " ")}`,
					marker_category: category,
					brand,
					sub_type,
					gas_types,
					operating_hours,
					status,
					latitude: pendingClick.lat,
					longitude: pendingClick.lng,
					notes: null,
				}),
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error ?? "Gagal menyimpan data");
			}

			const saved = await res.json();

			const savedMarker: UserMarker = {
				id: `gsm-${saved.id}`,
				lat: pendingClick.lat,
				lng: pendingClick.lng,
				type: category,
				name: saved.name,
				meta: {
					poi_type: finalPoiType,
					notes: finalNotes,
					gas_types: category === "gas-pump" ? selectedGasTypes : undefined,
				},
			};

			onConfirm(savedMarker);
			handleCancel();
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Terjadi kesalahan");
		} finally {
			setIsSubmitting(false);
		}
	}

	function handleCancel() {
		setName("");
		setError(null);
		setIsSubmitting(false);
		onOpenChange(false);
	}

	const categoryLabels: Record<string, string> = {
		"charging-station": "EV Charger Baru",
		"gas-pump": "Gas Station Baru",
		wrench: "Bengkel Baru",
	};

	const titleLabel = categoryLabels[category] || "Lokasi Baru";

	return (
		<Dialog open={open} onOpenChange={(v) => { if (!v) handleCancel(); }}>
			<DialogContent showCloseButton={false} className="sm:max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-2xl p-0 gap-0">
				<form onSubmit={handleSubmit} className="flex flex-col">
					{/* Header */}
					<DialogHeader className="px-6 pt-6 pb-4 border-b">
						<DialogTitle className="text-center text-base font-semibold">{titleLabel}</DialogTitle>
						<p className="text-center text-xs text-muted-foreground font-mono tabular-nums mt-1">
							{pendingClick ? `${pendingClick.lat.toFixed(5)}, ${pendingClick.lng.toFixed(5)}` : ""}
						</p>
					</DialogHeader>

					{/* Body */}
					<div className="px-6 py-5 flex flex-col gap-5">
						{/* Category Selector */}
						<Field label="Kategori Lokasi">
							<select
								value={category}
								onChange={(e) => setCategory(e.target.value)}
								className="w-full h-10 rounded-lg border border-border bg-muted/50 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
							>
								<option value="charging-station">EV Charger</option>
								<option value="gas-pump">Gas Station</option>
								<option value="wrench">Repair Shop (Bengkel)</option>
							</select>
						</Field>

						{/* Location Name */}
						<Field label="Nama Lokasi">
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder={
									category === "charging-station"
										? "Contoh: VoltCharge EV Station"
										: category === "gas-pump"
											? "Contoh: EcoFuel Station Menteng"
											: "Contoh: Bengkel Motor Jaya"
								}
								required
								autoFocus
								className="bg-muted/50 border border-border focus-visible:border-ring"
							/>
						</Field>

						{/* Dynamic Fields: EV Charger */}
						{category === "charging-station" && (
							<>
								<Field label="Tipe Charging">
									<ChipSelector options={EV_TYPES} value={evType} onChange={setEvType} />
								</Field>
								<Field label="Status Operasional">
									<ChipSelector options={EV_STATUSES} value={evStatus} onChange={setEvStatus} />
								</Field>
							</>
						)}

						{/* Dynamic Fields: Gas Station */}
						{category === "gas-pump" && (
							<>
								<Field label="Brand SPBU">
									<ChipSelector
										options={GAS_BRANDS}
										value={gasBrand}
										onChange={(brand) => {
											setGasBrand(brand);
											setSelectedGasTypes(GAS_TYPES_BY_BRAND[brand] ?? []);
										}}
									/>
								</Field>
								<Field label="Tipe Bahan Bakar">
									<MultiChipSelector
										options={GAS_TYPES_BY_BRAND[gasBrand] ?? []}
										values={selectedGasTypes}
										onChange={setSelectedGasTypes}
										color={GAS_BRANDS.find((b) => b.value === gasBrand)?.color ?? "#ff3b1f"}
									/>
								</Field>
								<Field label="Jam Operasional">
									<Input
										value={gasHours}
										onChange={(e) => setGasHours(e.target.value)}
										placeholder="Contoh: 24 Jam atau 06:00 - 22:00"
										required
										className="bg-muted/50 border border-border focus-visible:border-ring"
									/>
									<div className="flex gap-1.5 mt-1">
										{["24 Jam", "06:00 - 22:00", "07:00 - 21:00"].map((h) => (
											<button
												key={h}
												type="button"
												onClick={() => setGasHours(h)}
												className="text-[10px] bg-muted hover:bg-muted-foreground/20 text-muted-foreground px-2 py-0.5 rounded transition-colors cursor-pointer"
											>
												{h}
											</button>
										))}
									</div>
								</Field>
							</>
						)}

						{/* Dynamic Fields: Repair Shop */}
						{category === "wrench" && (
							<>
								<Field label="Spesialisasi">
									<ChipSelector options={REPAIR_SPECIALITIES} value={repairSpeciality} onChange={setRepairSpeciality} />
								</Field>
								<Field label="Status / Jam Buka">
									<Input
										value={repairStatus}
										onChange={(e) => setRepairStatus(e.target.value)}
										placeholder="Contoh: Buka 08:00 - 17:00 atau Tutup"
										required
										className="bg-muted/50 border border-border focus-visible:border-ring"
									/>
									<div className="flex gap-1.5 mt-1">
										{["Buka 24 Jam", "Buka 08:00 - 17:00", "Tutup"].map((s) => (
											<button
												key={s}
												type="button"
												onClick={() => setRepairStatus(s)}
												className="text-[10px] bg-muted hover:bg-muted-foreground/20 text-muted-foreground px-2 py-0.5 rounded transition-colors cursor-pointer"
											>
												{s}
											</button>
										))}
									</div>
								</Field>
							</>
						)}

						{error && (
							<p className="text-xs text-destructive mt-2">{error}</p>
						)}
					</div>

					{/* Footer */}
					<div className="flex justify-end gap-2 px-6 py-4 border-t">
						<button
							type="button"
							onClick={handleCancel}
							disabled={isSubmitting}
							className="h-9 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50 cursor-pointer"
						>
							Batal
						</button>
						<button
							type="submit"
							disabled={isSubmitting || !name.trim()}
							className="h-9 rounded-full bg-primary text-primary-foreground px-5 text-sm font-medium transition-colors hover:bg-primary/90 disabled:opacity-40 cursor-pointer"
						>
							{isSubmitting ? "Menyimpan…" : "Simpan & Pasang"}
						</button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
export { EV_TYPES, EV_STATUSES, GAS_BRANDS, REPAIR_SPECIALITIES, GAS_TYPES_BY_BRAND };
