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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        id="spelling-comparison-dialog"
        className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-zinc-200/80 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-red-50/80 px-5 py-4 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-900 tracking-tight">SO SÁNH CHÍNH TẢ</h3>
              <p className="text-xs text-red-600/80">Phân tích ký tự khác biệt</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playTap();
              onDismiss();
            }}
            className="w-7 h-7 rounded-full bg-red-200/60 text-red-800 flex items-center justify-center hover:bg-red-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-sm">
          {/* User Typed */}
          <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200/80">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Bạn đã gõ:
            </div>
            <div className="font-mono text-lg font-bold text-red-600 tracking-wide break-all">
              {result.userInput || "<trống>"}
            </div>
          </div>

          {/* Correct Word */}
          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/80">
            <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Đáp án chính xác:</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="font-mono text-lg font-bold text-emerald-700 tracking-wide break-all">
              {result.correctAnswer}
            </div>
          </div>

          {/* Detailed Diagnosis */}
          <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200/70 text-xs space-y-1.5">
            <div className="text-amber-900 font-semibold">
              Vị trí sai sót: Ký tự thứ {result.mismatchIndex + 1}
            </div>
            <p className="text-zinc-700 leading-relaxed">
              Bạn gõ: <span className="font-mono font-bold text-red-600 bg-red-100/80 px-1 py-0.5 rounded">'{result.userChar}'</span>,
              trong khi đáp án đúng là: <span className="font-mono font-bold text-emerald-700 bg-emerald-100/80 px-1 py-0.5 rounded">'{result.correctChar}'</span>
            </p>
            {result.prefixMatch && (
              <p className="text-zinc-500 text-[11px]">
                Phần đầu đúng: <span className="font-mono font-medium text-zinc-700">"{result.prefixMatch}"</span>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-100">
          <button
            id="btn-dismiss-comparison"
            onClick={() => {
              soundFx.playTap();
              onDismiss();
            }}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold rounded-xl text-sm transition-all shadow-sm"
          >
            Đã hiểu, tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
}
