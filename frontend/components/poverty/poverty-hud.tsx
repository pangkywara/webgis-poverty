const LEGEND = [
	{ label: "Sangat Tinggi",   color: "#ef4444" },
	{ label: "Tinggi",          color: "#f97316" },
	{ label: "Sedang",          color: "#f59e0b" },
	{ label: "Rendah",          color: "#10b981" },
	{ label: "Tidak Prioritas", color: "#6b7280" },
];

export function PovertyHud() {
	return (
		<>
			{/* Floating Legend — fuzzy priority marker colors */}
			<div className="absolute bottom-6 left-4 z-[999] bg-background/90 backdrop-blur-md border border-border/40 p-3.5 rounded-lg shadow-lg text-xs flex flex-col gap-2">
				<span className="font-bold text-foreground">Prioritas Fuzzy</span>
				<div className="flex flex-col gap-1">
					{LEGEND.map((item) => (
						<div key={item.label} className="flex items-center gap-2">
							<span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
							<span className="text-muted-foreground text-[10px]">{item.label}</span>
						</div>
					))}
				</div>
			</div>
		</>
	);
}
