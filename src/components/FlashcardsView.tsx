import React, { useState, useMemo } from "react";
import {
  RotateCcw,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Star,
  CheckCircle2,
  Layers,
  Sparkles,
} from "lucide-react";
import { VocabularyItem } from "../types";
import { soundFx } from "../utils/soundEffects";

interface FlashcardsViewProps {
  vocabularies: VocabularyItem[];
  onPronounce: (word: string) => void;
  onToggleBookmark: (item: VocabularyItem) => void;
  onToggleLearned: (item: VocabularyItem) => void;
}

export function FlashcardsView({
  vocabularies,
  onPronounce,
  onToggleBookmark,
  onToggleLearned,
}: FlashcardsViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "unlearned" | "marked">("all");
  const [shuffledItems, setShuffledItems] = useState<VocabularyItem[] | null>(null);

  const activeItems = useMemo(() => {
    const base = shuffledItems || vocabularies;
    if (filterMode === "unlearned") return base.filter((v) => !v.learned);
    if (filterMode === "marked") return base.filter((v) => v.isBookmarked);
    return base;
  }, [vocabularies, shuffledItems, filterMode]);

  const currentItem: VocabularyItem | undefined = activeItems[currentIndex];

  const handleNext = () => {
    soundFx.playTap();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, activeItems.length));
  };

  const handlePrev = () => {
    soundFx.playTap();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + activeItems.length) % Math.max(1, activeItems.length));
  };

  const handleShuffle = () => {
    soundFx.playTap();
    setIsFlipped(false);
    const copy = [...vocabularies].sort(() => Math.random() - 0.5);
    setShuffledItems(copy);
    setCurrentIndex(0);
  };

  const handleFlip = () => {
    soundFx.playTap();
    setIsFlipped((prev) => !prev);
  };

  return (
    <div id="flashcards-view" className="space-y-4 pb-24 select-none">
      {/* Header & Mode Selectors */}
      <div className="bg-zinc-900/90 rounded-3xl p-4 border border-zinc-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Flashcard Học Nhanh</span>
            </h2>
            <p className="text-xs text-zinc-400">Chạm vào thẻ để lật xem nghĩa và phiên âm</p>
          </div>

          <button
            onClick={handleShuffle}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 font-semibold rounded-xl text-xs flex items-center space-x-1 transition-all"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Trộn thẻ</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5">
          {(["all", "unlearned", "marked"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                soundFx.playTap();
                setFilterMode(mode);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterMode === mode
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-750 hover:text-zinc-200"
              }`}
            >
              {mode === "all"
                ? `Tất cả (${vocabularies.length})`
                : mode === "unlearned"
                ? `Chưa thuộc (${vocabularies.filter((v) => !v.learned).length})`
                : `Đánh dấu (${vocabularies.filter((v) => v.isBookmarked).length})`}
            </button>
          ))}
        </div>
      </div>

      {activeItems.length === 0 ? (
        <div className="bg-zinc-900/90 rounded-3xl p-12 text-center border border-zinc-800 space-y-2">
          <Sparkles className="w-10 h-10 text-zinc-600 mx-auto" />
          <p className="text-sm font-semibold text-zinc-300">Không có từ nào trong danh mục này</p>
          <p className="text-xs text-zinc-500">Chọn "Tất cả" hoặc gắn sao từ vựng để bắt đầu học flashcard.</p>
        </div>
      ) : currentItem ? (
        <div className="space-y-4">
          {/* Card Counter */}
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono font-semibold px-2">
            <span>
              Thẻ {currentIndex + 1} / {activeItems.length}
            </span>
            <span>Bấm thẻ để lật</span>
          </div>

          {/* 3D Flippable Card Container */}
          <div
            onClick={handleFlip}
            className="w-full min-h-[300px] cursor-pointer perspective-1000 relative"
          >
            <div
              className={`w-full h-full min-h-[300px] rounded-3xl p-8 shadow-md border border-zinc-800 flex flex-col justify-between transition-all duration-300 transform relative ${
                isFlipped
                  ? "bg-gradient-to-br from-indigo-950/80 via-zinc-900 to-blue-950/80 border-blue-800/60"
                  : "bg-zinc-900/90 hover:border-zinc-700"
              }`}
            >
              {/* Card Top Actions */}
              <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 border border-blue-800/50 px-2.5 py-1 rounded-full">
                  {isFlipped ? "Nghĩa & Phiên Âm" : "Từ Tiếng Anh"}
                </span>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onPronounce(currentItem.word)}
                    className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-blue-950/80 text-zinc-300 hover:text-blue-400 flex items-center justify-center transition-colors"
                    title="Phát âm"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onToggleBookmark(currentItem)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                      currentItem.isBookmarked
                        ? "bg-amber-950/80 text-amber-400 border border-amber-800/60"
                        : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                    title="Gắn sao"
                  >
                    <Star
                      className={`w-4 h-4 ${currentItem.isBookmarked ? "fill-amber-400" : ""}`}
                    />
                  </button>

                  <button
                    onClick={() => onToggleLearned(currentItem)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                      currentItem.learned
                        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                        : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                    title="Đánh dấu đã thuộc"
                  >
                    <CheckCircle2
                      className={`w-4 h-4 ${currentItem.learned ? "fill-emerald-400/20" : ""}`}
                    />
                  </button>
                </div>
              </div>

              {/* Card Center Content */}
              <div className="text-center py-6 space-y-3">
                {!isFlipped ? (
                  <>
                    <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                      {currentItem.word}
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium">
                      (Chạm vào đây để xem nghĩa tiếng Việt)
                    </p>
                  </>
                ) : (
                  <>
                    {currentItem.ipa && (
                      <div className="text-base font-mono text-blue-400 font-bold bg-blue-950/60 border border-blue-800/50 inline-block px-3 py-1 rounded-xl">
                        {currentItem.ipa}
                      </div>
                    )}
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
                      {currentItem.translation}
                    </h3>
                  </>
                )}
              </div>

              {/* Card Bottom Hint */}
              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800">
                <span>{currentItem.learned ? "✓ Đã thuộc" : "○ Chưa thuộc"}</span>
                <span className="flex items-center space-x-1 text-blue-400 font-medium">
                  <RotateCcw className="w-3 h-3" />
                  <span>Chạm để lật mặt thẻ</span>
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Next / Prev Controls */}
          <div className="flex items-center justify-between space-x-3 pt-2">
            <button
              id="btn-flashcard-prev"
              onClick={handlePrev}
              className="flex-1 py-3.5 bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-200 font-bold rounded-2xl border border-zinc-800 shadow-sm flex items-center justify-center space-x-2 text-sm transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Thẻ Trước</span>
            </button>

            <button
              id="btn-flashcard-next"
              onClick={handleNext}
              className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold rounded-2xl shadow-md flex items-center justify-center space-x-2 text-sm transition-all"
            >
              <span>Thẻ Kế Tiếp</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

