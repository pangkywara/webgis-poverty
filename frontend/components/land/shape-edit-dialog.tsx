"use client";

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
	ROAD_STATUSES,
	LAND_STATUSES,
	calcLineLength,
	calcPolygonArea,
} from "@/components/land/shape-placement-dialog";
import { LAND_MARKER_LABELS } from "@/lib/map-data";

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

/* ─── Stat Chip ──────────────────────────────────────────── */

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

interface ShapeEditDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	shape: UserMarker | null;
	onUpdated: (updated: UserMarker) => void;
	onDeleted: (deleted: UserMarker) => void;
}

export function ShapeEditDialog({
	open,
	onOpenChange,
	shape,
	onUpdated,
	onDeleted,
}: ShapeEditDialogProps) {
	const [name, setName] = useState("");
	const [status, setStatus] = useState("");
	const [notes, setNotes] = useState("");

	const DELETE_SECONDS = 5;
	const TOAST_ID = "shape-delete";

	const [deleteActive, setDeleteActive] = useState(false);
	const [deleteCountdown, setDeleteCountdown] = useState(DELETE_SECONDS);
	const pendingDeleteShape = useRef<UserMarker | null>(null);

	const shapeType = shape?.type ?? "";
	const isLine = shapeType === "line";
	const isPolygon = shapeType === "polygon";
	const isCircle = shapeType === "circle";

	const titleLabel = `Edit ${LAND_MARKER_LABELS[shapeType] ?? "Item"}`;
	const coordinates = shape?.meta?.coordinates ?? [];
	const radius = shape?.meta?.radius ?? 0;

	const length = isLine ? calcLineLength(coordinates) : 0;
	const area = isPolygon
		? calcPolygonArea(coordinates)
		: isCircle
			? Math.PI * radius * radius
			: 0;

	const statusOptions = isLine ? ROAD_STATUSES : isPolygon ? LAND_STATUSES : [];

	// Reset when different shape opens
	useEffect(() => {
		if (!shape?.id) return;
		setName(shape.name);
		setStatus(shape.meta?.poi_type ?? (isLine ? "Regency Road" : isPolygon ? "SHM" : ""));
		setNotes(shape.meta?.notes ?? "");
		setDeleteActive(false);
		setDeleteCountdown(DELETE_SECONDS);
		pendingDeleteShape.current = null;
		toast.dismiss(TOAST_ID);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [shape?.id]);

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

	// Toast while countdown is running
	useEffect(() => {
		if (!deleteActive || !pendingDeleteShape.current) {
			toast.dismiss(TOAST_ID);
			return;
		}
		const shapeName = pendingDeleteShape.current.name;
		const pct = (deleteCountdown / DELETE_SECONDS) * 100;
		toast.custom(
			() => (
				<div className="relative flex items-center gap-3 w-72 rounded-xl border border-border bg-popover px-4 py-3 shadow-lg overflow-hidden font-sans">
					<div
						className="absolute bottom-0 left-0 h-[3px] bg-red-500 transition-[width] duration-1000 ease-linear"
						style={{ width: `${pct}%` }}
					/>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-semibold text-foreground truncate">Menghapus shape</p>
						<p className="text-xs text-muted-foreground truncate">&quot;{shapeName}&quot; — dalam {deleteCountdown} detik</p>
					</div>
					<button
						onClick={() => {
							setDeleteActive(false);
							setDeleteCountdown(DELETE_SECONDS);
							pendingDeleteShape.current = null;
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
				pendingDeleteShape.current = shape;
				setDeleteCountdown(DELETE_SECONDS);
			} else {
				pendingDeleteShape.current = null;
				toast.dismiss(TOAST_ID);
			}
			return !prev;
		});
	}

	function handleDelete() {
		const target = pendingDeleteShape.current;
		if (!target) return;
		pendingDeleteShape.current = null;
		onDeleted(target);
		onOpenChange(false);
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!shape) return;

		const updated: UserMarker = {
			...shape,
			name: name.trim() || shape.name,
			meta: {
				...shape.meta,
				poi_type: status || undefined,
				notes: notes.trim() || undefined,
			},
		};

		onUpdated(updated);
		onOpenChange(false);
	}

	return (
		<Dialog open={open} onOpenChange={(v) => { if (!v) onOpenChange(false); }}>
			<DialogContent showCloseButton={false} className="sm:max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-2xl p-0 gap-0">
				<form onSubmit={handleSubmit} className="flex flex-col">
					{/* Header */}
					<DialogHeader className="px-6 pt-6 pb-4 border-b">
						<DialogTitle className="text-center text-base font-semibold">{titleLabel}</DialogTitle>
						<p className="text-center text-xs text-muted-foreground font-mono tabular-nums mt-1">
							{shape ? `${shape.lat.toFixed(5)}, ${shape.lng.toFixed(5)}` : ""}
						</p>
					</DialogHeader>

					{/* Body */}
					<div className="px-6 py-5 flex flex-col gap-5">
						{/* Name */}
						<Field label={isLine ? "Nama Jalan" : isPolygon ? "Nama Lahan" : isCircle ? "Nama Area" : "Nama Penanda"}>
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
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

						{/* Status (line / polygon only) */}
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

						{(isLine || isPolygon) && coordinates.length > 0 && (
							<p className="text-[10px] text-muted-foreground">
								{coordinates.length} titik koordinat
							</p>
						)}
					</div>

					{/* Footer */}
					<div className="flex items-center justify-between gap-2 px-6 py-4 border-t">
						<TimedUndoAction
							compact
							deleteLabel="Hapus Shape"
							undoLabel="Batal"
							isDeleting={deleteActive}
							countDown={deleteCountdown}
							onToggle={toggleDelete}
						/>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => onOpenChange(false)}
								className="h-9 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
							>
								Batal
							</button>
							<button
								type="submit"
								disabled={!name.trim()}
								className="h-9 rounded-full bg-primary text-primary-foreground px-5 text-sm font-medium transition-colors hover:bg-primary/90 disabled:opacity-40"
							>
								Simpan
							</button>
						</div>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
