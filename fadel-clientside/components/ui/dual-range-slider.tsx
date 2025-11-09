"use client";

import * as React from "react";

type DualRangeSliderProps = {
  value: [number, number];
  onValueChange: (values: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: (v: number) => React.ReactNode;
  className?: string;
};

export function DualRangeSlider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  className,
}: DualRangeSliderProps) {
  const [minVal, maxVal] = value;

  const clamp = (v: number) => Math.min(Math.max(v, min), max);

  const onMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = clamp(Number(e.target.value));
    const next: [number, number] = [Math.min(v, maxVal - step), maxVal];
    onValueChange(next);
  };

  const onMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = clamp(Number(e.target.value));
    const next: [number, number] = [minVal, Math.max(v, minVal + step)];
    onValueChange(next);
  };

  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  return (
    <div className={className}>
      <div className="relative h-8 select-none px-1">
        {/* Track */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-border/60" />
        {/* Selected range */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full bg-primary"
          style={{
            left: `${pct(minVal)}%`,
            right: `${100 - pct(maxVal)}%`,
          }}
        />
        {/* Min */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={onMinChange}
          className="range-input p-0 absolute inset-0 w-full appearance-none bg-transparent cursor-pointer pointer-events-none border-none focus:outline-none focus:ring-0"
          aria-label="Minimum value"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={onMaxChange}
          className="range-input p-0 absolute inset-0 w-full appearance-none bg-transparent cursor-pointer pointer-events-none border-none focus:outline-none focus:ring-0"
          aria-label="Maximum value"
        />
      </div>
      {label && (
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{label(minVal)}</span>
          <span>{label(maxVal)}</span>
        </div>
      )}
    </div>
  );
}
