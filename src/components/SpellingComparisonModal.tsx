import React from "react";
import { ComparisonResult } from "../types";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { soundFx } from "../utils/soundEffects";

interface SpellingComparisonModalProps {
  result: ComparisonResult | null;
  onDismiss: () => void;
}

export function SpellingComparisonModal({ result, onDismiss }: SpellingComparisonModalProps) {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        id="spelling-comparison-dialog"
        className="bg-zinc-900 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-zinc-800 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-red-950/60 px-5 py-4 border-b border-red-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-red-900/80 flex items-center justify-center text-red-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-300 tracking-tight">SO SÁNH CHÍNH TẢ</h3>
              <p className="text-xs text-red-400/80">Phân tích ký tự khác biệt</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playTap();
              onDismiss();
            }}
            className="w-7 h-7 rounded-full bg-red-900/60 text-red-300 flex items-center justify-center hover:bg-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-sm">
          {/* User Typed */}
          <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Bạn đã gõ:
            </div>
            <div className="font-mono text-lg font-bold text-red-400 tracking-wide break-all">
              {result.userInput || "<trống>"}
            </div>
          </div>

          {/* Correct Word */}
          <div className="bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-800/60">
            <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Đáp án chính xác:</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="font-mono text-lg font-bold text-emerald-400 tracking-wide break-all">
              {result.correctAnswer}
            </div>
          </div>

          {/* Detailed Diagnosis */}
          <div className="bg-amber-950/40 p-3.5 rounded-xl border border-amber-800/60 text-xs space-y-1.5">
            <div className="text-amber-300 font-semibold">
              Vị trí sai sót: Ký tự thứ {result.mismatchIndex + 1}
            </div>
            <p className="text-zinc-300 leading-relaxed">
              Bạn gõ: <span className="font-mono font-bold text-red-400 bg-red-950/80 border border-red-800/60 px-1 py-0.5 rounded">'{result.userChar}'</span>,
              trong khi đáp án đúng là: <span className="font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-1 py-0.5 rounded">'{result.correctChar}'</span>
            </p>
            {result.prefixMatch && (
              <p className="text-zinc-400 text-[11px]">
                Phần đầu đúng: <span className="font-mono font-medium text-zinc-200">"{result.prefixMatch}"</span>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800">
          <button
            id="btn-dismiss-comparison"
            onClick={() => {
              soundFx.playTap();
              onDismiss();
            }}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold rounded-xl text-sm transition-all shadow-sm"
          >
            Đã hiểu, tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
}

