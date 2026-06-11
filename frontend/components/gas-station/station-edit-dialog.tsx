"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */


import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { UserMarker } from "@/components/leaflet-map";
import { TimedUndoAction } from "@/components/time-undo-action";
import {
	EV_TYPES,
	EV_STATUSES,
	GAS_BRANDS,
	REPAIR_SPECIALITIES,
	GAS_TYPES_BY_BRAND,
} from "@/components/gas-station/station-placement-dialog";

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

/* ─── Edit Dialog ───────────────────────────────── */

interface StationEditDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	marker: UserMarker | null;
	onUpdated: (updated: UserMarker) => void;
	onDeleted: (deleted: UserMarker) => void;
}

export function StationEditDialog({
	open,
	onOpenChange,
	marker,
	onUpdated,
	onDeleted,
}: StationEditDialogProps) {
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

	// Timed Delete State
	const DELETE_SECONDS = 5;
	const TOAST_ID = "station-delete";
	const [deleteActive, setDeleteActive] = useState(false);
	const [deleteCountdown, setDeleteCountdown] = useState(DELETE_SECONDS);
	const pendingDeleteMarker = useRef<UserMarker | null>(null);

	// Fetching and saving state
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

	// Synchronize when marker opens and load latest from DB
	useEffect(() => {
		if (!open || !marker) return;

		setDeleteActive(false);
		setDeleteCountdown(DELETE_SECONDS);
		pendingDeleteMarker.current = null;
		toast.dismiss(TOAST_ID);
		setError(null);

		const dbId = marker.id.split("-").slice(1).join("-");
		const token = localStorage.getItem("auth_token");
		const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

		setIsLoading(true);

		fetch(`${BACKEND_URL}/gas-station/markers/${dbId}`, { headers })
			.then((r) => {
				if (!r.ok) throw new Error("Gagal memuat data dari server");
				return r.json();
			})
			.then((row) => {
				setCategory(row.marker_category);
				setName(row.name);
				if (row.marker_category === "charging-station") {
					setEvType(row.sub_type ?? "DC Fast");
					setEvStatus(row.status ?? "Active");
				} else if (row.marker_category === "gas-pump") {
					setGasBrand(row.brand ?? "Pertamina");
					setGasHours(row.operating_hours ?? "24 Jam");
					setSelectedGasTypes(row.gas_types ?? GAS_TYPES_BY_BRAND[row.brand ?? "Pertamina"] ?? []);
				} else if (row.marker_category === "wrench") {
					setRepairSpeciality(row.sub_type ?? "Umum");
					setRepairStatus(row.status ?? "Buka 08:00 - 17:00");
				}
			})
			.catch((err) => {
				console.error(err);
				setError("Gagal memuat data terbaru, menggunakan data lokal.");
				// Fallback
				setCategory(marker.type);
				setName(marker.name);
				const meta = marker.meta;
				if (marker.type === "charging-station") {
					setEvType(meta?.poi_type ?? "DC Fast");
					setEvStatus(meta?.notes?.replace("Status: ", "") ?? "Active");
				} else if (marker.type === "gas-pump") {
					setGasBrand(meta?.poi_type ?? "Pertamina");
					setGasHours(meta?.notes?.replace("Jam: ", "") ?? "24 Jam");
					setSelectedGasTypes(meta?.gas_types ?? GAS_TYPES_BY_BRAND[meta?.poi_type ?? "Pertamina"] ?? []);
				} else if (marker.type === "wrench") {
					setRepairSpeciality(meta?.poi_type ?? "Umum");
					setRepairStatus(meta?.notes ?? "Buka 08:00 - 17:00");
				}
			})
			.finally(() => setIsLoading(false));
	}, [open, marker]);

	async function handleDelete() {
		const target = pendingDeleteMarker.current;
		if (!target) return;
		
		const dbId = target.id.split("-").slice(1).join("-");
		const token = localStorage.getItem("auth_token");
		const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

		setIsDeleting(true);
		setError(null);

		try {
			const res = await fetch(`${BACKEND_URL}/gas-station/markers/${dbId}`, {
				method: "DELETE",
				headers,
			});

			if (!res.ok && res.status !== 204) {
				throw new Error("Gagal menghapus lokasi dari server");
			}

			pendingDeleteMarker.current = null;
			onDeleted(target);
			onOpenChange(false);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus");
			toast.error(err instanceof Error ? err.message : "Gagal menghapus lokasi");
		} finally {
			setIsDeleting(false);
		}
	}

	// Countdown tick
	useEffect(() => {
		if (!deleteActive) return;
		const id = setInterval(() => setDeleteCountdown((p) => Math.max(0, p - 1)), 1000);
		return () => clearInterval(id);
	}, [deleteActive]);

	// Fire delete when countdown hits 0
	useEffect(() => {
		if (!deleteActive || deleteCountdown > 0) return;
		setDeleteActive(false);
		setDeleteCountdown(DELETE_SECONDS);
		toast.dismiss(TOAST_ID);
		handleDelete();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [deleteActive, deleteCountdown]);

	// Toast showing countdown
	useEffect(() => {
		if (!deleteActive || !pendingDeleteMarker.current) {
			toast.dismiss(TOAST_ID);
			return;
		}
		const mName = pendingDeleteMarker.current.name;
		const pct = (deleteCountdown / DELETE_SECONDS) * 100;
		toast.custom(
			() => (
				<div className="relative flex items-center gap-3 w-72 rounded-xl border border-border bg-popover px-4 py-3 shadow-lg overflow-hidden font-sans">
					<div
						className="absolute bottom-0 left-0 h-[3px] bg-red-500 transition-[width] duration-1000 ease-linear"
						style={{ width: `${pct}%` }}
					/>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-semibold text-foreground truncate">Menghapus lokasi</p>
						<p className="text-xs text-muted-foreground truncate">&quot;{mName}&quot; — dalam {deleteCountdown} detik</p>
					</div>
					<button
						onClick={() => {
							setDeleteActive(false);
							setDeleteCountdown(DELETE_SECONDS);
							pendingDeleteMarker.current = null;
							toast.dismiss(TOAST_ID);
						}}
						className="shrink-0 h-7 rounded-full border border-border bg-background px-3 text-xs font-medium hover:bg-muted transition-colors cursor-pointer"
					>
						Batalkan
					</button>
				</div>
			),
			{ id: TOAST_ID, duration: Infinity, position: "bottom-left" },
		);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [deleteActive, deleteCountdown]);

	function toggleDelete() {
		setDeleteActive((prev) => {
			if (!prev) {
				pendingDeleteMarker.current = marker;
				setDeleteCountdown(DELETE_SECONDS);
			} else {
				pendingDeleteMarker.current = null;
				toast.dismiss(TOAST_ID);
			}
			return !prev;
		});
	}


	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!marker) return;

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
			const dbId = marker.id.split("-").slice(1).join("-");
			const token = localStorage.getItem("auth_token");
			const headers = {
				"Content-Type": "application/json",
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			};

			const res = await fetch(`${BACKEND_URL}/gas-station/markers/${dbId}`, {
				method: "PUT",
				headers,
				body: JSON.stringify({
					name: name.trim() || marker.name,
					marker_category: category,
					brand,
					sub_type,
					gas_types,
					operating_hours,
					status,
					notes: null,
				}),
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error ?? "Gagal menyimpan perubahan");
			}

			const saved = await res.json();

			const updated: UserMarker = {
				...marker,
				type: category,
				name: saved.name,
				meta: {
					...marker.meta,
					poi_type: finalPoiType,
					notes: finalNotes,
					gas_types: category === "gas-pump" ? selectedGasTypes : undefined,
				},
			};

			onUpdated(updated);
			onOpenChange(false);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Terjadi kesalahan");
		} finally {
			setIsSubmitting(false);
		}
	}

	const categoryLabels: Record<string, string> = {
		"charging-station": "Edit EV Charger",
		"gas-pump": "Edit Gas Station",
		wrench: "Edit Bengkel",
	};

	const titleLabel = categoryLabels[category] || "Edit Lokasi";

	return (
		<Dialog open={open} onOpenChange={(v) => { if (!v) onOpenChange(false); }}>
			<DialogContent showCloseButton={false} className="sm:max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-2xl p-0 gap-0">
				<form onSubmit={handleSubmit} className="flex flex-col">
					{/* Header */}
					<DialogHeader className="px-6 pt-6 pb-4 border-b">
						<DialogTitle className="text-center text-base font-semibold">{titleLabel}</DialogTitle>
						<p className="text-center text-xs text-muted-foreground font-mono tabular-nums mt-1">
							{marker ? `${marker.lat.toFixed(5)}, ${marker.lng.toFixed(5)}` : ""}
						</p>
					</DialogHeader>

					{/* Body */}
					<div className="px-6 py-5 flex flex-col gap-5">
						{isLoading ? (
							<p className="text-sm text-muted-foreground text-center py-4">Memuat data…</p>
						) : (
							<>
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
										required
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
							</>
						)}

						{error && (
							<p className="text-xs text-destructive mt-2">{error}</p>
						)}
					</div>

					{/* Footer */}
					<div className="flex items-center justify-between gap-2 px-6 py-4 border-t">
						<TimedUndoAction
							compact
							deleteLabel="Hapus Lokasi"
							undoLabel="Batal"
							isDeleting={deleteActive}
							countDown={deleteCountdown}
							onToggle={toggleDelete}
						/>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => onOpenChange(false)}
								disabled={isSubmitting || isDeleting}
								className="h-9 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50 cursor-pointer"
							>
								Batal
							</button>
							<button
								type="submit"
								disabled={isSubmitting || isLoading || isDeleting || !name.trim()}
								className="h-9 rounded-full bg-primary text-primary-foreground px-5 text-sm font-medium transition-colors hover:bg-primary/90 disabled:opacity-40 cursor-pointer"
							>
								{isSubmitting ? "Menyimpan…" : "Simpan"}
							</button>
						</div>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
