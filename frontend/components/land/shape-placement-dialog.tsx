"use client";

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
import { LAND_MARKER_LABELS } from "@/lib/map-data";

/* ─── Status options per shape type ──────────────────────── */

const ROAD_STATUSES = [
	{ value: "National Road",   label: "National",   color: "#ef4444" },
	{ value: "Provincial Road", label: "Provincial",  color: "#eab308" },
	{ value: "Regency Road",    label: "Regency",    color: "#22c55e" },
];

const LAND_STATUSES = [
	{ value: "SHM", label: "SHM", color: "#a855f7" },
	{ value: "HGB", label: "HGB", color: "#f97316" },
	{ value: "HGU", label: "HGU", color: "#14b8a6" },
	{ value: "HP",  label: "HP",  color: "#ec4899" },
];

/* ─── Geometry helpers ───────────────────────────────────── */

/** Calculate polyline length from [lat, lng][] coordinates in meters */
function calcLineLength(coords: [number, number][]): number {
	let total = 0;
	for (let i = 1; i < coords.length; i++) {
		total += haversineDistance(coords[i - 1], coords[i]);
	}
	return total;
}

/** Calculate polygon area from [lat, lng][] using shoelfoot formula + spherical correction */
function calcPolygonArea(coords: [number, number][]): number {
	// Shoelace formula on projected coords (approximate for small areas)
	const R = 6371000; // Earth radius in meters
	let area = 0;
	const n = coords.length;
	for (let i = 0; i < n; i++) {
		const j = (i + 1) % n;
		const lat1 = coords[i][0] * Math.PI / 180;
		const lat2 = coords[j][0] * Math.PI / 180;
		const lng1 = coords[i][1] * Math.PI / 180;
		const lng2 = coords[j][1] * Math.PI / 180;
		area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
	}
	area = Math.abs(area * R * R / 2);
	return area;
}

/** Haversine distance between two [lat, lng] points in meters */
function haversineDistance(a: [number, number], b: [number, number]): number {
	const R = 6371000;
	const dLat = (b[0] - a[0]) * Math.PI / 180;
	const dLng = (b[1] - a[1]) * Math.PI / 180;
	const lat1 = a[0] * Math.PI / 180;
	const lat2 = b[0] * Math.PI / 180;
	const s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
	return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

/* ─── Shared Field component ─────────────────────────────── */

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

/* ─── Stat Chip (for read-only auto-calculated values) ──── */

function StatChip({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
			<span className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wider">{label}</span>
			<span className="text-sm font-semibold text-foreground tabular-nums ml-auto">{value}</span>
		</div>
	);
}

/* ─── Status Chip Selector ───────────────────────────────── */

function StatusSelector({
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
							"h-8 rounded-lg border px-3 text-[11px] font-semibold transition-all",
							isSelected
								? "border-transparent text-white shadow-sm"
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

/* ─── Dialog Component ───────────────────────────────────── */

interface ShapePlacementDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	pendingShape: UserMarker | null;
	onConfirm: (shape: UserMarker) => void;
}

export function ShapePlacementDialog({
	open,
	onOpenChange,
	pendingShape,
	onConfirm,
}: ShapePlacementDialogProps) {
	const [name, setName] = useState("");
	const [status, setStatus] = useState("");
	const [notes, setNotes] = useState("");

	const shapeType = pendingShape?.type ?? "";
	const isLine = shapeType === "line";
	const isPolygon = shapeType === "polygon";
	const isCircle = shapeType === "circle";

	const titleLabel = isLine ? "Jalan Baru" : isPolygon ? "Lahan Baru" : isCircle ? "Area Baru" : (LAND_MARKER_LABELS[shapeType] ?? "Item Baru");

	// Auto-calculated metrics
	const coordinates = pendingShape?.meta?.coordinates ?? [];
	const radius = pendingShape?.meta?.radius ?? 0;

	const length = isLine ? calcLineLength(coordinates) : 0;
	const area = isPolygon
		? calcPolygonArea(coordinates)
		: isCircle
			? Math.PI * radius * radius
			: 0;

	const statusOptions = isLine ? ROAD_STATUSES : isPolygon ? LAND_STATUSES : [];

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!pendingShape) return;

		const finalName = name.trim() || pendingShape.name;
		const updated: UserMarker = {
			...pendingShape,
			name: finalName,
			meta: {
				...pendingShape.meta,
				poi_type: status || undefined,
				notes: notes.trim() || undefined,
			},
		};

		onConfirm(updated);
		// Reset
		setName("");
		setStatus("");
		setNotes("");
	}

	function handleCancel() {
		setName("");
		setStatus("");
		setNotes("");
		onOpenChange(false);
	}

	// Reset form when dialog opens with a new shape
	useEffect(() => {
		if (!pendingShape?.id) return;
		setName("");
		const t = pendingShape.type;
		setStatus(t === "line" ? "Regency Road" : t === "polygon" ? "SHM" : "");
		setNotes(pendingShape.meta?.notes ?? "");
	}, [pendingShape?.id]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<Dialog open={open} onOpenChange={(v) => { if (!v) handleCancel(); }}>
			<DialogContent showCloseButton={false} className="sm:max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-2xl p-0 gap-0">
				<form onSubmit={handleSubmit} className="flex flex-col">
					{/* Header */}
					<DialogHeader className="px-6 pt-6 pb-4 border-b">
						<DialogTitle className="text-center text-base font-semibold">{titleLabel}</DialogTitle>
						<p className="text-center text-xs text-muted-foreground font-mono tabular-nums mt-1">
							{pendingShape ? `${pendingShape.lat.toFixed(5)}, ${pendingShape.lng.toFixed(5)}` : ""}
						</p>
					</DialogHeader>

					{/* Body */}
					<div className="px-6 py-5 flex flex-col gap-5">
						{/* Name */}
						<Field label={isLine ? "Nama Jalan" : isPolygon ? "Nama Lahan" : isCircle ? "Nama Area" : "Nama Penanda"}>
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder={isLine ? "Contoh: Jl. Merdeka" : isPolygon ? "Contoh: Lahan Sawah A1" : isCircle ? "Contoh: Buffer Zone A" : "Contoh: Patok Batas Utara"}
								required
								className="bg-muted/50 border border-border focus-visible:border-ring"
							/>
						</Field>

						{/* Notes (optional, all types) */}
						<Field label="Catatan">
							<textarea
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="Catatan tambahan (opsional)"
								rows={2}
								className="w-full min-w-0 rounded-lg border border-input bg-muted/50 px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
							/>
						</Field>

						{/* Status selector (line / polygon only) */}
						{statusOptions.length > 0 && (
							<Field label="Status">
								<StatusSelector options={statusOptions} value={status} onChange={setStatus} />
							</Field>
						)}

						{/* Auto-calculated metrics */}
						<div className={cn("grid gap-3", isCircle ? "grid-cols-2" : "grid-cols-1")}>
							{isLine && (
								<StatChip
									label="Panjang"
									value={length >= 1000
										? `${(length / 1000).toFixed(2)} km`
										: `${length.toFixed(1)} m`}
								/>
							)}
							{(isPolygon || isCircle) && (
								<StatChip
									label="Luas"
									value={area >= 10000
										? `${(area / 10000).toFixed(2)} ha`
										: `${area.toFixed(1)} m²`}
								/>
							)}
							{isCircle && (
								<StatChip label="Radius" value={`${radius.toFixed(1)} m`} />
							)}
						</div>

						{/* Coordinate count */}
						{(isLine || isPolygon) && coordinates.length > 0 && (
							<p className="text-[10px] text-muted-foreground">
								{coordinates.length} titik koordinat
							</p>
						)}
					</div>

					{/* Footer */}
					<div className="flex justify-end gap-2 px-6 py-4 border-t">
						<button
							type="button"
							onClick={handleCancel}
							className="h-9 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
						>
							Batal
						</button>
						<button
							type="submit"
							disabled={!name.trim()}
							className="h-9 rounded-full bg-primary text-primary-foreground px-5 text-sm font-medium transition-colors hover:bg-primary/90 disabled:opacity-40"
						>
							Simpan &amp; Pasang
						</button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

// Re-export helpers for use in edit dialog and leaflet-map
export { ROAD_STATUSES, LAND_STATUSES, calcLineLength, calcPolygonArea };
