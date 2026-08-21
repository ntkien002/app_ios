import React, { useState } from "react";
import {
  BookOpen,
  Zap,
  RotateCcw,
  Star,
  Award,
  Sparkles,
  Volume2,
  Plus,
  Play,
  Flame,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BarChart3,
} from "lucide-react";
import { DashboardStats, VocabularyItem, QuizMode } from "../types";
import { soundFx } from "../utils/soundEffects";
import { IOSSwitch } from "./ios/IOSSwitch";

interface HomeScreenProps {
  stats: DashboardStats;
  selectedGroup: string;
  isHardMode: boolean;
  isReverseMode: boolean;
  isTimerEnabled: boolean;
  isAutoAdvanceEnabled: boolean;
  onSelectGroup: (letter: string) => void;
  onToggleHardMode: (val: boolean) => void;
  onToggleReverseMode: (val: boolean) => void;
  onToggleTimer: (val: boolean) => void;
  onToggleAutoAdvance: (val: boolean) => void;
  onStartGroupQuiz: (letter: string, isHard: boolean, isReverse: boolean) => void;
  onStartRandomQuiz: (isHard: boolean, isReverse: boolean) => void;
  onStartWrongReview: () => void;
  onStartMarkedReview: () => void;
  onStartFullReview: (isReverse: boolean) => void;
  onOpenAddModal: () => void;
  onPronounce: (word: string) => void;
  onOpenFilterTab: (filter: string) => void;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function HomeScreen({
  stats,
  selectedGroup,
  isHardMode,
  isReverseMode,
  isTimerEnabled,
  isAutoAdvanceEnabled,
  onSelectGroup,
  onToggleHardMode,
  onToggleReverseMode,
  onToggleTimer,
  onToggleAutoAdvance,
  onStartGroupQuiz,
  onStartRandomQuiz,
  onStartWrongReview,
  onStartMarkedReview,
  onStartFullReview,
  onOpenAddModal,
  onPronounce,
  onOpenFilterTab,
}: HomeScreenProps) {
  return (
    <div id="home-dashboard" className="space-y-5 pb-24 select-none">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-3xl p-5 shadow-lg shadow-blue-500/15 relative overflow-hidden">
        {/* Subtle Decorative Circles */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-indigo-400/20 rounded-full blur-xl -ml-8 -mb-8 pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-blue-200 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Vocab Trainer iOS</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight mt-0.5">Luyện Từ Vựng</h1>
            <p className="text-xs text-blue-100/90 mt-0.5">
              Học thông minh, ghi nhớ sâu theo bảng chữ cái A-Z
            </p>
          </div>

          <button
            id="btn-header-add-word"
            onClick={() => {
              soundFx.playTap();
              onOpenAddModal();
            }}
            className="w-10 h-10 rounded-2xl bg-white/20 hover:bg-white/30 active:scale-95 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-sm"
            title="Thêm từ mới"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Progress Mastery Bar */}
        <div className="mt-4 pt-3 border-t border-white/15">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-blue-100">Tiến độ ghi nhớ toàn bộ:</span>
            <span className="font-bold text-amber-300 font-mono">{stats.progressPct}%</span>
          </div>
          <div className="w-full h-2 bg-black/25 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-300 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(2, stats.progressPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => {
            soundFx.playTap();
            onOpenFilterTab("all");
          }}
          className="bg-white p-3 rounded-2xl border border-zinc-200/80 shadow-xs hover:border-zinc-300 text-center transition-all active:scale-95"
        >
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-tight">Tổng từ</div>
          <div className="text-base font-bold text-zinc-900 font-mono mt-0.5">{stats.total}</div>
        </button>

        <button
          onClick={() => {
            soundFx.playTap();
            onOpenFilterTab("learned");
          }}
          className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/80 shadow-xs hover:border-emerald-300 text-center transition-all active:scale-95"
        >
          <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-tight">Đã thuộc</div>
          <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">{stats.learned}</div>
        </button>

        <button
          onClick={() => {
            soundFx.playTap();
            onOpenFilterTab("wrong");
          }}
          className="bg-red-50/70 p-3 rounded-2xl border border-red-200/80 shadow-xs hover:border-red-300 text-center transition-all active:scale-95"
        >
          <div className="text-[10px] font-semibold text-red-700 uppercase tracking-tight">Cần ôn</div>
          <div className="text-base font-bold text-red-700 font-mono mt-0.5">{stats.wrong}</div>
        </button>

        <button
          onClick={() => {
            soundFx.playTap();
            onOpenFilterTab("marked");
          }}
          className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80 shadow-xs hover:border-amber-300 text-center transition-all active:scale-95"
        >
          <div className="text-[10px] font-semibold text-amber-700 uppercase tracking-tight">Đánh dấu</div>
          <div className="text-base font-bold text-amber-700 font-mono mt-0.5">{stats.bookmarked}</div>
        </button>
      </div>

      {/* Alphabet A-Z Pills Selector */}
      <div className="bg-white rounded-3xl p-4 border border-zinc-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            <span>Nhóm Ký Tự A - Z</span>
          </h2>
          <span className="text-[11px] text-zinc-500 font-medium">
            Đang chọn nhóm: <strong className="text-blue-600 font-mono text-sm">{selectedGroup}</strong>
          </span>
        </div>

        {/* 26 Alphabet Grid */}
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {ALPHABET.map((letter) => {
            const counts = stats.letterCounts[letter] || { learned: 0, total: 0 };
            const isSelected = selectedGroup === letter;
            const isComplete = counts.total > 0 && counts.learned === counts.total;
            const hasWords = counts.total > 0;

            let pillStyle = "bg-zinc-100 text-zinc-600 border-zinc-200";

            if (isSelected) {
              pillStyle = "bg-blue-600 text-white border-blue-600 shadow-sm";
            } else if (isComplete) {
              pillStyle = "bg-emerald-100/80 text-emerald-800 border-emerald-300";
            } else if (hasWords) {
              pillStyle = "bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200";
            } else {
              pillStyle = "bg-zinc-50/50 text-zinc-300 border-zinc-100 opacity-40 pointer-events-none";
            }

            return (
              <button
                key={letter}
                id={`btn-letter-${letter}`}
                disabled={!hasWords}
                onClick={() => {
                  soundFx.playTap();
                  onSelectGroup(letter);
                }}
                className={`py-1.5 px-1 rounded-xl border flex flex-col items-center justify-center transition-all ${pillStyle} ${
                  hasWords && !isSelected ? "active:scale-95" : ""
                }`}
              >
                <span className="font-bold text-xs leading-none">{letter}</span>
                {hasWords && (
                  <span
                    className={`text-[9px] font-mono mt-0.5 leading-none ${
                      isSelected ? "text-blue-100" : "text-zinc-500"
                    }`}
                  >
                    {counts.learned}/{counts.total}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Study Actions for Selected Group */}
      <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
              Luyện Nhóm Ký Tự [{selectedGroup}]
            </h2>
            <p className="text-xs text-zinc-500">
              Có {stats.groupWords.length} từ vựng bắt đầu bằng chữ {selectedGroup}
            </p>
          </div>
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
            {stats.letterCounts[selectedGroup]?.learned || 0} /{" "}
            {stats.letterCounts[selectedGroup]?.total || 0} từ
          </span>
        </div>

        {/* Primary Launch Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            id="btn-start-group-normal"
            onClick={() => {
              soundFx.playTap();
              onStartGroupQuiz(selectedGroup, isHardMode, isReverseMode);
            }}
            disabled={stats.groupWords.length === 0}
            className="py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Học Nhóm {selectedGroup}</span>
          </button>

          <button
            id="btn-start-group-hard"
            onClick={() => {
              soundFx.playTap();
              onStartGroupQuiz(selectedGroup, true, isReverseMode);
            }}
            disabled={stats.groupWords.length === 0}
            className="py-3 px-4 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
          >
            <Flame className="w-4 h-4" />
            <span>Chế Độ Khó</span>
          </button>

          <button
            id="btn-start-group-reverse"
            onClick={() => {
              soundFx.playTap();
              onStartGroupQuiz(selectedGroup, isHardMode, true);
            }}
            disabled={stats.groupWords.length === 0}
            className="py-3 px-4 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Chế Độ Ngược</span>
          </button>
        </div>

        {/* Live Quiz Option Switches */}
        <div className="pt-2 border-t border-zinc-100 grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center justify-between p-2 bg-zinc-50 rounded-xl border border-zinc-200/60">
            <span className="text-zinc-700 font-medium">💪 Chế độ khó</span>
            <IOSSwitch
              id="switch-hard-mode"
              checked={isHardMode}
              onChange={onToggleHardMode}
            />
          </div>

          <div className="flex items-center justify-between p-2 bg-zinc-50 rounded-xl border border-zinc-200/60">
            <span className="text-zinc-700 font-medium">🔀 Đảo ngược câu</span>
            <IOSSwitch
              id="switch-reverse-mode"
              checked={isReverseMode}
              onChange={onToggleReverseMode}
            />
          </div>

          <div className="flex items-center justify-between p-2 bg-zinc-50 rounded-xl border border-zinc-200/60">
            <span className="text-zinc-700 font-medium">⏱️ Hẹn giờ (6s)</span>
            <IOSSwitch
              id="switch-timer-enabled"
              checked={isTimerEnabled}
              onChange={onToggleTimer}
            />
          </div>

          <div className="flex items-center justify-between p-2 bg-zinc-50 rounded-xl border border-zinc-200/60">
            <span className="text-zinc-700 font-medium">⚡ Tự qua câu</span>
            <IOSSwitch
              id="switch-auto-advance"
              checked={isAutoAdvanceEnabled}
              onChange={onToggleAutoAdvance}
            />
          </div>
        </div>
      </div>

      {/* Global Quick Practice Modes */}
      <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-3">
        <h2 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center space-x-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Chế Độ Ôn Luyện Nhanh</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Random 100 */}
          <button
            id="btn-start-random-100"
            onClick={() => {
              soundFx.playTap();
              onStartRandomQuiz(isHardMode, isReverseMode);
            }}
            className="p-3.5 bg-zinc-50 hover:bg-blue-50/60 active:scale-[0.98] border border-zinc-200 rounded-2xl flex items-center space-x-3 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-zinc-900 group-hover:text-blue-700">
                🎲 Ngẫu Nhiên 100 Từ
              </div>
              <div className="text-[11px] text-zinc-500">
                Lấy ngẫu nhiên từ kho để kiểm tra phản xạ
              </div>
            </div>
          </button>

          {/* Review Mistakes */}
          <button
            id="btn-start-wrong-review"
            onClick={() => {
              soundFx.playTap();
              onStartWrongReview();
            }}
            disabled={stats.wrong === 0}
            className="p-3.5 bg-zinc-50 hover:bg-red-50/60 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none border border-zinc-200 rounded-2xl flex items-center space-x-3 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-zinc-900 group-hover:text-red-700">
                🔄 Ôn Tập Từ Sai ({stats.wrong} từ)
              </div>
              <div className="text-[11px] text-zinc-500">
                Lặp lại đến khi đúng 2 lần liên tiếp
              </div>
            </div>
          </button>

          {/* Starred Words */}
          <button
            id="btn-start-marked-review"
            onClick={() => {
              soundFx.playTap();
              onStartMarkedReview();
            }}
            disabled={stats.bookmarked === 0}
            className="p-3.5 bg-zinc-50 hover:bg-amber-50/60 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none border border-zinc-200 rounded-2xl flex items-center space-x-3 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <div className="font-bold text-xs text-zinc-900 group-hover:text-amber-700">
                ⭐ Luyện Từ Đã Đánh Dấu ({stats.bookmarked})
              </div>
              <div className="text-[11px] text-zinc-500">
                Tập trung các từ vựng bạn đã gắn sao
              </div>
            </div>
          </button>

          {/* Full Review */}
          <button
            id="btn-start-full-review"
            onClick={() => {
              soundFx.playTap();
              onStartFullReview(isReverseMode);
            }}
            className="p-3.5 bg-zinc-50 hover:bg-emerald-50/60 active:scale-[0.98] border border-zinc-200 rounded-2xl flex items-center space-x-3 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-zinc-900 group-hover:text-emerald-700">
                📖 Ôn Toàn Bộ ({stats.total} từ)
              </div>
              <div className="text-[11px] text-zinc-500">
                Duyệt qua tất cả các từ trong kho
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Vocabulary Words in Selected Group */}
      {stats.groupWords.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
              Danh Sách Từ Nhóm [{selectedGroup}] ({stats.groupWords.length})
            </h2>
            <button
              onClick={() => onOpenFilterTab("all")}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Xem tất cả
            </button>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1 divide-y divide-zinc-100">
            {stats.groupWords.map((item) => (
              <div
                key={item.id}
                className="pt-2 pb-1.5 flex items-center justify-between group"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-zinc-900 font-mono">
                      {item.word}
                    </span>
                    {item.ipa && (
                      <span className="text-xs text-blue-600 font-mono font-medium">
                        {item.ipa}
                      </span>
                    )}
                    {item.learned && (
                      <span className="text-[10px] text-emerald-600 font-bold">✓</span>
                    )}
                    {item.isBookmarked && (
                      <span className="text-[10px] text-amber-500">★</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 truncate mt-0.5">{item.translation}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onPronounce(item.word)}
                  className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-blue-50 text-zinc-600 hover:text-blue-600 flex items-center justify-center transition-colors flex-shrink-0"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
