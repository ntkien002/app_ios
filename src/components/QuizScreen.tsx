import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  Volume2,
  Clock,
  RotateCcw,
  Check,
  X,
  Star,
  Pause,
  Play,
  ArrowRight,
  Sparkles,
  Send,
  AlertTriangle,
  Award,
} from "lucide-react";
import { QuizSessionState, QuizMode, VocabularyItem } from "../types";
import { soundFx } from "../utils/soundEffects";
import { speechService } from "../utils/speech";

interface QuizScreenProps {
  state: QuizSessionState;
  onSelectOption: (index: number) => void;
  onSubmitText: (text: string) => void;
  onNextQuestion: () => void;
  onToggleBookmark: () => void;
  onRemoveBookmark: () => void;
  onTogglePause: () => void;
  onToggleTimer: (val: boolean) => void;
  onToggleAutoAdvance: (val: boolean) => void;
  onExit: () => void;
  onPronounce: (word: string) => void;
}

export function QuizScreen({
  state,
  onSelectOption,
  onSubmitText,
  onNextQuestion,
  onToggleBookmark,
  onRemoveBookmark,
  onTogglePause,
  onToggleTimer,
  onToggleAutoAdvance,
  onExit,
  onPronounce,
}: QuizScreenProps) {
  const [typedInput, setTypedInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when question changes
  useEffect(() => {
    setTypedInput("");
    if (!state.isAnswerRevealed) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [state.currentQuestion?.currentEntity.id, state.isAnswerRevealed]);

  // Handle Enter key for manual submit
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && typedInput.trim() && !state.isAnswerRevealed) {
      soundFx.playTap();
      onSubmitText(typedInput.trim());
    }
  };

  const handleManualSubmit = () => {
    if (typedInput.trim() && !state.isAnswerRevealed) {
      soundFx.playTap();
      onSubmitText(typedInput.trim());
    }
  };

  // If session is completed or hearts are 0, show result screen
  if (state.isCompleted || (state.hearts <= 0 && state.isAnswerRevealed)) {
    const accuracy = state.totalCount > 0
      ? Math.round((state.correctCount / Math.max(1, state.correctCount + state.wrongTotalCount)) * 100)
      : 0;

    return (
      <div id="quiz-result-view" className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-xl border border-zinc-200/80 text-center animate-in zoom-in-95 duration-200">
          {state.hearts > 0 ? (
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Award className="w-9 h-9" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-9 h-9" />
            </div>
          )}

          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
            {state.hearts > 0 ? "Hoàn Thành Xuất Sắc!" : "Hết Lượt Trái Tim!"}
          </h2>
          <p className="text-xs text-zinc-500 mt-1">{state.title}</p>

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-2.5 my-5">
            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
              <div className="text-[11px] font-semibold text-emerald-700 uppercase">Đúng</div>
              <div className="text-xl font-bold text-emerald-700 font-mono mt-0.5">{state.correctCount}</div>
            </div>
            <div className="bg-red-50 p-3 rounded-2xl border border-red-100">
              <div className="text-[11px] font-semibold text-red-700 uppercase">Sai</div>
              <div className="text-xl font-bold text-red-700 font-mono mt-0.5">{state.wrongTotalCount}</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
              <div className="text-[11px] font-semibold text-blue-700 uppercase">Độ chính xác</div>
              <div className="text-xl font-bold text-blue-700 font-mono mt-0.5">{accuracy}%</div>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              id="btn-quiz-exit-complete"
              onClick={onExit}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold rounded-2xl text-sm transition-all shadow-sm"
            >
              Quay Về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = state.currentQuestion;
  if (!question) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <p className="text-sm text-zinc-500 font-medium">Đang tải câu hỏi...</p>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-zinc-200 text-zinc-800 rounded-xl text-xs font-semibold"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const entity = question.currentEntity;

  return (
    <div id="quiz-screen" className="min-h-screen bg-zinc-100 flex flex-col pb-12 select-none">
      {/* Top Bar (Lives, Timer, Bookmark, Pause, Exit) */}
      <div className="bg-white/90 backdrop-blur-md border-b border-zinc-200/80 sticky top-0 z-30 px-4 py-2.5">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {/* Hearts / Lives */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: state.maxHearts }).map((_, idx) => {
              const isAlive = idx < state.hearts;
              return (
                <Heart
                  key={idx}
                  className={`w-5 h-5 transition-all ${
                    isAlive
                      ? "text-red-500 fill-red-500 scale-100"
                      : "text-zinc-300 fill-transparent scale-90"
                  }`}
                />
              );
            })}
          </div>

          {/* Progress / Remaining Count */}
          <div className="text-center">
            <span className="text-xs font-bold text-zinc-800 font-mono tracking-tight">
              Còn lại: {state.remainingCount} / {state.totalCount}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1">
            <button
              id="btn-quiz-bookmark"
              onClick={() => {
                soundFx.playTap();
                onToggleBookmark();
              }}
              className={`p-2 rounded-xl transition-colors ${
                entity.isBookmarked
                  ? "text-amber-500 bg-amber-50"
                  : "text-zinc-400 hover:text-zinc-700 bg-zinc-100"
              }`}
              title="Đánh dấu từ này"
            >
              <Star className={`w-4 h-4 ${entity.isBookmarked ? "fill-amber-500" : ""}`} />
            </button>

            <button
              id="btn-quiz-pause"
              onClick={() => {
                soundFx.playTap();
                onTogglePause();
              }}
              className="p-2 rounded-xl text-zinc-600 hover:text-zinc-900 bg-zinc-100 transition-colors"
              title={state.isPaused ? "Tiếp tục" : "Tạm dừng"}
            >
              {state.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>

            <button
              id="btn-quiz-exit"
              onClick={() => {
                soundFx.playTap();
                onExit();
              }}
              className="p-2 rounded-xl text-zinc-500 hover:text-red-600 bg-zinc-100 transition-colors"
              title="Thoát bài luyện"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Countdown Timer Progress Bar */}
        {state.isTimerEnabled && !state.isPaused && (
          <div className="w-full h-1.5 bg-zinc-200 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-100 ${
                state.currentTimerProgress > 0.4
                  ? "bg-blue-500"
                  : state.currentTimerProgress > 0.2
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${Math.max(0, Math.min(1, state.currentTimerProgress)) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Main Question Area */}
      <div className="flex-1 max-w-md w-full mx-auto px-4 pt-4 pb-6 space-y-4">
        {/* Pause Banner */}
        {state.isPaused && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center text-xs text-amber-800 font-medium">
            Bài luyện đang tạm dừng. Bấm nút Play để tiếp tục.
          </div>
        )}

        {/* Question Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200/80 relative overflow-hidden">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />

          <div className="text-center space-y-2 relative z-10">
            <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              {question.displaySubPrompt}
            </div>

            {/* Prompt Word / Meaning */}
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight flex items-center justify-center space-x-2 py-1">
              <span className="break-words">{question.displayPrompt}</span>
              {/* Pronounce Button */}
              {question.isReverse && (
                <button
                  id="btn-quiz-pronounce-prompt"
                  onClick={() => onPronounce(entity.word)}
                  className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 active:scale-95 transition-all flex-shrink-0"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Word metadata badges */}
            <div className="flex items-center justify-center space-x-2 pt-1">
              {entity.wrongCount > 0 && (
                <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                  Đã sai {entity.wrongCount} lần
                </span>
              )}
              {entity.learned && (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  ✓ Đã thuộc
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Multiple Choice Options */}
        <div className="space-y-2.5">
          {question.options.map((optionText, idx) => {
            const isSelected = state.selectedIndex === idx;
            const isCorrect = idx === question.correctIndex;
            const optionLetter = String.fromCharCode(65 + idx);

            // Extract word for pronunciation if needed
            const wordToSpeak = optionText.includes(" = ")
              ? optionText.substring(optionText.indexOf(" = ") + 3).trim()
              : optionText.trim();

            let btnStyle = "bg-white text-zinc-900 border-zinc-200/80 hover:border-zinc-300";

            if (state.isAnswerRevealed) {
              if (isCorrect) {
                btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-400";
              } else if (isSelected) {
                btnStyle = "bg-red-50 border-red-500 text-red-950 font-semibold ring-2 ring-red-400";
              } else {
                btnStyle = "bg-zinc-50 border-zinc-200 text-zinc-400 opacity-60";
              }
            }

            return (
              <div
                key={idx}
                id={`quiz-option-${idx}`}
                onClick={() => {
                  if (!state.isAnswerRevealed && !state.isPaused) {
                    soundFx.playTap();
                    onSelectOption(idx);
                  }
                }}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-150 shadow-sm ${btnStyle} ${
                  !state.isAnswerRevealed ? "cursor-pointer active:scale-[0.99]" : ""
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      state.isAnswerRevealed && isCorrect
                        ? "bg-emerald-500 text-white"
                        : state.isAnswerRevealed && isSelected
                        ? "bg-red-500 text-white"
                        : "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {optionLetter}
                  </div>
                  <span className="text-sm font-medium leading-snug truncate">{optionText}</span>
                </div>

                <div className="flex items-center space-x-1.5 flex-shrink-0 ml-2">
                  {!question.isReverse && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPronounce(wordToSpeak);
                      }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-zinc-100"
                      title="Nghe từ này"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}

                  {state.isAnswerRevealed && isCorrect && (
                    <Check className="w-5 h-5 text-emerald-600 font-bold" />
                  )}
                  {state.isAnswerRevealed && isSelected && !isCorrect && (
                    <X className="w-5 h-5 text-red-500 font-bold" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Manual Spelling Typing Field (Always available for active spelling practice) */}
        {!state.isAnswerRevealed && !question.isReverse && (
          <div className="bg-white p-3 rounded-2xl border border-zinc-200/80 shadow-sm space-y-2">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
              <span>Hoặc gõ chính tả tiếng Anh:</span>
              <span className="text-[10px] text-blue-600 font-normal">Nhấn Enter để nộp</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                id="input-quiz-spelling"
                type="text"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Gõ từ tiếng Anh..."
                autoComplete="off"
                autoCapitalize="none"
                spellCheck="false"
                className="flex-1 px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-mono focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
              <button
                id="btn-quiz-submit-text"
                type="button"
                onClick={handleManualSubmit}
                disabled={!typedInput.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <span>Gửi</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Next Question Navigation Controls (When Answer is Revealed) */}
        {state.isAnswerRevealed && (
          <div className="pt-2 space-y-2.5">
            {/* If in marked mode and answer was correct, allow fast unbookmark */}
            {(state.mode === QuizMode.MARKED_CHECK || state.mode === QuizMode.RANDOM_MARKED) &&
              state.isAnswerCorrect && (
                <button
                  id="btn-quiz-remove-bookmark"
                  onClick={() => {
                    soundFx.playTap();
                    onRemoveBookmark();
                  }}
                  className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold transition-colors"
                >
                  ⭐ Bỏ đánh dấu từ này (Đã thuộc)
                </button>
              )}

            <button
              id="btn-quiz-next-question"
              onClick={() => {
                soundFx.playTap();
                onNextQuestion();
              }}
              className={`w-full py-3.5 font-bold rounded-2xl text-sm transition-all shadow-md flex items-center justify-center space-x-2 active:scale-[0.98] ${
                state.isAnswerCorrect
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <span>
                {state.hearts <= 0
                  ? "Xem kết quả"
                  : state.isAutoAdvanceEnabled
                  ? "Đang tự chuyển tiếp... (Bấm để qua ngay ➔)"
                  : "Câu tiếp theo ➔"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
