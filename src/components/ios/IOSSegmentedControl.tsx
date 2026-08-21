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
      className={`relative flex items-center p-1 bg-zinc-200/80 rounded-xl select-none ${className}`}
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
                ? "bg-white text-zinc-900 shadow-sm font-semibold"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {opt.icon && <span className="inline-flex">{opt.icon}</span>}
            <span className="truncate">{opt.label}</span>
            {typeof opt.count === "number" && (
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? "bg-zinc-100 text-zinc-800" : "bg-zinc-300/60 text-zinc-600"
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
