import React from "react";
import { ChevronLeft } from "lucide-react";

interface IOSNavigationBarProps {
  title: string;
  subtitle?: string;
  largeTitle?: boolean;
  onBack?: () => void;
  backTitle?: string;
  rightActions?: React.ReactNode;
}

export function IOSNavigationBar({
  title,
  subtitle,
  largeTitle = false,
  onBack,
  backTitle = "Back",
  rightActions,
}: IOSNavigationBarProps) {
  return (
    <div className="sticky top-0 z-40 bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/80 transition-all">
      <div className="flex items-center justify-between px-4 h-12">
        {/* Left Back / Cancel button */}
        <div className="w-1/4 flex items-center">
          {onBack && (
            <button
              id="ios-nav-back-button"
              onClick={onBack}
              className="flex items-center text-blue-400 active:opacity-60 transition-opacity font-medium -ml-1 text-[17px]"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
              <span className="leading-none">{backTitle}</span>
            </button>
          )}
        </div>

        {/* Center Inline Title (when not largeTitle or on scroll) */}
        <div className="w-2/4 text-center">
          {!largeTitle && (
            <div>
              <h1 className="text-[17px] font-semibold text-white tracking-tight truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[11px] text-zinc-400 font-medium -mt-0.5 truncate">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="w-1/4 flex items-center justify-end space-x-2">
          {rightActions}
        </div>
      </div>

      {/* Large Title Area */}
      {largeTitle && (
        <div className="px-5 pt-1 pb-3">
          <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
          {subtitle && (
            <p className="text-xs text-zinc-400 font-normal mt-0.5">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  );
}
