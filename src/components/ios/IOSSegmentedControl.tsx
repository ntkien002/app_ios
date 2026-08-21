import React from "react";
import { soundFx } from "../../utils/soundEffects";

interface SegmentOption<T extends string> {
  value: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface IOSSegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
}

export function IOSSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = "",
  size = "md",
}: IOSSegmentedControlProps<T>) {
  return (
    <div
      className={`relative flex items-center p-1 bg-zinc-800/90 border border-zinc-700/60 rounded-xl select-none ${className}`}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            id={`ios-segment-${opt.value}`}
            type="button"
            onClick={() => {
              if (!isSelected) {
                soundFx.playTap();
                onChange(opt.value);
              }
            }}
            className={`relative z-10 flex-1 flex items-center justify-center space-x-1.5 rounded-lg font-medium transition-all duration-200 ${
              size === "sm" ? "py-1 text-xs" : "py-1.5 text-[13px]"
            } ${
              isSelected
                ? "bg-zinc-700 text-white shadow-sm font-semibold border border-zinc-600/50"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {opt.icon && <span className="inline-flex">{opt.icon}</span>}
            <span className="truncate">{opt.label}</span>
            {typeof opt.count === "number" && (
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? "bg-zinc-800 text-zinc-200" : "bg-zinc-700/60 text-zinc-400"
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
