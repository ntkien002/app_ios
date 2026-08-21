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
      <div className="bg-white rounded-3xl p-4 border border-zinc-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 tracking-tight flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Flashcard Học Nhanh</span>
            </h2>
            <p className="text-xs text-zinc-500">Chạm vào thẻ để lật xem nghĩa và phiên âm</p>
          </div>

          <button
            onClick={handleShuffle}
            className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-700 font-semibold rounded-xl text-xs flex items-center space-x-1 transition-all"
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
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
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
        <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200/80 space-y-2">
          <Sparkles className="w-10 h-10 text-zinc-300 mx-auto" />
          <p className="text-sm font-semibold text-zinc-700">Không có từ nào trong danh mục này</p>
          <p className="text-xs text-zinc-400">Chọn "Tất cả" hoặc gắn sao từ vựng để bắt đầu học flashcard.</p>
        </div>
      ) : currentItem ? (
        <div className="space-y-4">
          {/* Card Counter */}
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono font-semibold px-2">
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
              className={`w-full h-full min-h-[300px] rounded-3xl p-8 shadow-md border border-zinc-200/80 flex flex-col justify-between transition-all duration-300 transform relative ${
                isFlipped
                  ? "bg-gradient-to-br from-indigo-50 via-white to-blue-50 border-blue-200"
                  : "bg-white hover:border-zinc-300"
              }`}
            >
              {/* Card Top Actions */}
              <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  {isFlipped ? "Nghĩa & Phiên Âm" : "Từ Tiếng Anh"}
                </span>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onPronounce(currentItem.word)}
                    className="w-9 h-9 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors"
                    title="Phát âm"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onToggleBookmark(currentItem)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                      currentItem.isBookmarked
                        ? "bg-amber-50 text-amber-500"
                        : "bg-zinc-100 text-zinc-400 hover:text-zinc-600"
                    }`}
                    title="Gắn sao"
                  >
                    <Star
                      className={`w-4 h-4 ${currentItem.isBookmarked ? "fill-amber-500" : ""}`}
                    />
                  </button>

                  <button
                    onClick={() => onToggleLearned(currentItem)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                      currentItem.learned
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-zinc-100 text-zinc-400 hover:text-zinc-600"
                    }`}
                    title="Đánh dấu đã thuộc"
                  >
                    <CheckCircle2
                      className={`w-4 h-4 ${currentItem.learned ? "fill-emerald-100" : ""}`}
                    />
                  </button>
                </div>
              </div>

              {/* Card Center Content */}
              <div className="text-center py-6 space-y-3">
                {!isFlipped ? (
                  <>
                    <h3 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 font-mono tracking-tight">
                      {currentItem.word}
                    </h3>
                    <p className="text-xs text-zinc-400 font-medium">
                      (Chạm vào đây để xem nghĩa tiếng Việt)
                    </p>
                  </>
                ) : (
                  <>
                    {currentItem.ipa && (
                      <div className="text-base font-mono text-blue-600 font-bold bg-blue-100/50 inline-block px-3 py-1 rounded-xl">
                        {currentItem.ipa}
                      </div>
                    )}
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 leading-snug">
                      {currentItem.translation}
                    </h3>
                  </>
                )}
              </div>

              {/* Card Bottom Hint */}
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-100">
                <span>{currentItem.learned ? "✓ Đã thuộc" : "○ Chưa thuộc"}</span>
                <span className="flex items-center space-x-1 text-blue-600 font-medium">
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
              className="flex-1 py-3.5 bg-white hover:bg-zinc-50 active:scale-95 text-zinc-800 font-bold rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-center space-x-2 text-sm transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Thẻ Trước</span>
            </button>

            <button
              id="btn-flashcard-next"
              onClick={handleNext}
              className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-2xl shadow-md flex items-center justify-center space-x-2 text-sm transition-all"
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
