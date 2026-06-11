"use client";

interface RadiusSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function RadiusSlider({ value, onChange }: RadiusSliderProps) {
  const pct = (value / 2000) * 100;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={2000}
          step={50}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            background: value === 0
              ? "var(--border)"
              : `linear-gradient(to right, #10b981 0%, #10b981 ${pct}%, var(--border) ${pct}%, var(--border) 100%)`,
          }}
          className="
            flex-1 h-[3px] cursor-pointer appearance-none rounded-full outline-none
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow
            [&::-webkit-slider-thumb]:border
            [&::-webkit-slider-thumb]:border-border
            [&::-moz-range-thumb]:w-3
            [&::-moz-range-thumb]:h-3
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border
            [&::-moz-range-thumb]:border-border
          "
        />
        <span
          className="w-12 shrink-0 text-center text-xs font-bold tabular-nums"
          style={{ color: value === 0 ? "var(--muted-foreground)" : "#10b981" }}
        >
          {value === 0 ? "—" : `${value}m`}
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground">0 = tidak tampilkan lingkaran</p>
    </div>
  );
}
