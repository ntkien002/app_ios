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
  Search,
  Edit3,
  ExternalLink,
  BookMarked,
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
  const [quickSearch, setQuickSearch] = useState("");

  const filteredGroupWords = stats.groupWords.filter((item) => {
    if (!quickSearch.trim()) return true;
    const q = quickSearch.toLowerCase().trim();
    return (
      item.word.toLowerCase().includes(q) ||
      item.translation.toLowerCase().includes(q) ||
      (item.ipa && item.ipa.toLowerCase().includes(q))
    );
  });

  return (
    <div id="home-dashboard" className="space-y-5 pb-24 select-none">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-zinc-900 text-white rounded-3xl p-5 shadow-xl border border-blue-500/20 relative overflow-hidden">
        {/* Subtle Decorative Circles */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-purple-500/10 rounded-full blur-xl -ml-8 -mb-8 pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Vocab Trainer iOS</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight mt-0.5 text-white">Luyện Từ Vựng</h1>
            <p className="text-xs text-zinc-300 mt-0.5">
              Học thông minh, tra cứu và chỉnh sửa từ vựng theo A-Z
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-header-lookup-vocab"
              onClick={() => {
                soundFx.playTap();
                onOpenFilterTab("all");
              }}
              className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center space-x-1.5 backdrop-blur-md transition-all text-xs font-semibold border border-white/10"
              title="Tra cứu & Chỉnh sửa danh từ từ vựng"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Tra cứu</span>
            </button>

            <button
              id="btn-header-add-word"
              onClick={() => {
                soundFx.playTap();
                onOpenAddModal();
              }}
              className="w-9 h-9 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-md"
              title="Thêm từ mới"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Progress Mastery Bar */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-zinc-300">Tiến độ ghi nhớ toàn bộ:</span>
            <span className="font-bold text-amber-400 font-mono">{stats.progressPct}%</span>
          </div>
          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(2, stats.progressPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tra Cứu & Chỉnh Sửa Nhanh - Prominent Feature Card */}
      <div className="bg-zinc-900/90 rounded-3xl p-4 border border-zinc-800 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <BookMarked className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Tra Cứu &amp; Chỉnh Sửa Từ Vựng
              </h2>
              <p className="text-[11px] text-zinc-400">Xem danh sách, tìm kiếm nghĩa và cập nhật từ</p>
            </div>
          </div>

          <button
            id="btn-open-vocab-manager-primary"
            onClick={() => {
              soundFx.playTap();
              onOpenFilterTab("all");
            }}
            className="px-3 py-1.5 bg-blue-600/90 hover:bg-blue-600 active:scale-95 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <span>Mở Kho Từ</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            id="btn-lookup-group-words"
            onClick={() => {
              soundFx.playTap();
              onOpenFilterTab(`letter_${selectedGroup}`);
            }}
            className="p-2.5 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/70 rounded-2xl flex items-center space-x-2.5 text-left transition-all active:scale-98"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold font-mono text-xs flex-shrink-0">
              {selectedGroup}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-zinc-100 truncate">Xem từ nhóm [{selectedGroup}]</div>
              <div className="text-[10px] text-zinc-400 font-mono">{stats.groupWords.length} từ vựng</div>
            </div>
          </button>

          <button
            id="btn-lookup-all-words"
            onClick={() => {
              soundFx.playTap();
              onOpenFilterTab("all");
            }}
            className="p-2.5 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/70 rounded-2xl flex items-center space-x-2.5 text-left transition-all active:scale-98"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Edit3 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-zinc-100 truncate">Quản lý &amp; Sửa toàn bộ</div>
              <div className="text-[10px] text-zinc-400 font-mono">{stats.total} từ trong kho</div>
            </div>
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => {
            soundFx.playTap();
            onOpenFilterTab("all");
          }}
          className="bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800 shadow-sm hover:border-zinc-700 text-center transition-all active:scale-95"
        >
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-tight">Tổng từ</div>
          <div className="text-base font-bold text-white font-mono mt-0.5">{stats.total}</div>
        </button>

        <button
          onClick={() => {
            soundFx.playTap();
            onOpenFilterTab("learned");
          }}
          className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-800/60 shadow-sm hover:border-emerald-700 text-center transition-all active:scale-95"
        >
          <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-tight">Đã thuộc</div>
          <div className="text-base font-bold text-emerald-300 font-mono mt-0.5">{stats.learned}</div>
        </button>

        <button
          onClick={() => {
            soundFx.playTap();
            onOpenFilterTab("wrong");
          }}
          className="bg-red-950/40 p-3 rounded-2xl border border-red-800/60 shadow-sm hover:border-red-700 text-center transition-all active:scale-95"
        >
          <div className="text-[10px] font-semibold text-red-400 uppercase tracking-tight">Cần ôn</div>
          <div className="text-base font-bold text-red-300 font-mono mt-0.5">{stats.wrong}</div>
        </button>

        <button
          onClick={() => {
            soundFx.playTap();
            onOpenFilterTab("marked");
          }}
          className="bg-amber-950/40 p-3 rounded-2xl border border-amber-800/60 shadow-sm hover:border-amber-700 text-center transition-all active:scale-95"
        >
          <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-tight">Đánh dấu</div>
          <div className="text-base font-bold text-amber-300 font-mono mt-0.5">{stats.bookmarked}</div>
        </button>
      </div>

      {/* Alphabet A-Z Pills Selector */}
      <div className="bg-zinc-900/90 rounded-3xl p-4 border border-zinc-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            <span>Nhóm Ký Tự A - Z</span>
          </h2>
          <span className="text-[11px] text-zinc-400 font-medium">
            Đang chọn nhóm: <strong className="text-blue-400 font-mono text-sm">{selectedGroup}</strong>
          </span>
        </div>

        {/* 26 Alphabet Grid */}
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {ALPHABET.map((letter) => {
            const counts = stats.letterCounts[letter] || { learned: 0, total: 0 };
            const isSelected = selectedGroup === letter;
            const isComplete = counts.total > 0 && counts.learned === counts.total;
            const hasWords = counts.total > 0;

            let pillStyle = "bg-zinc-800/70 text-zinc-400 border-zinc-700/60";

            if (isSelected) {
              pillStyle = "bg-blue-600 text-white border-blue-500 shadow-md";
            } else if (isComplete) {
              pillStyle = "bg-emerald-950/60 text-emerald-300 border-emerald-700/60";
            } else if (hasWords) {
              pillStyle = "bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border-zinc-700";
            } else {
              pillStyle = "bg-zinc-900/50 text-zinc-600 border-zinc-800/60 opacity-40 pointer-events-none";
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
                      isSelected ? "text-blue-200" : "text-zinc-400"
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
      <div className="bg-zinc-900/90 rounded-3xl p-5 border border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Luyện Nhóm Ký Tự [{selectedGroup}]
            </h2>
            <p className="text-xs text-zinc-400">
              Có {stats.groupWords.length} từ vựng bắt đầu bằng chữ {selectedGroup}
            </p>
          </div>
          <span className="px-2.5 py-1 bg-blue-950/80 border border-blue-800/60 text-blue-300 rounded-full text-xs font-semibold font-mono">
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
            className="py-3 px-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-md transition-all"
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
            className="py-3 px-4 bg-amber-600 hover:bg-amber-500 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-md transition-all"
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
            className="py-3 px-4 bg-purple-600 hover:bg-purple-500 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-md transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Chế Độ Ngược</span>
          </button>
        </div>

        {/* Live Quiz Option Switches */}
        <div className="pt-2 border-t border-zinc-800 grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center justify-between p-2 bg-zinc-800/80 rounded-xl border border-zinc-700/60">
            <span className="text-zinc-300 font-medium">💪 Chế độ khó</span>
            <IOSSwitch
              id="switch-hard-mode"
              checked={isHardMode}
              onChange={onToggleHardMode}
            />
          </div>

          <div className="flex items-center justify-between p-2 bg-zinc-800/80 rounded-xl border border-zinc-700/60">
            <span className="text-zinc-300 font-medium">🔀 Đảo ngược câu</span>
            <IOSSwitch
              id="switch-reverse-mode"
              checked={isReverseMode}
              onChange={onToggleReverseMode}
            />
          </div>

          <div className="flex items-center justify-between p-2 bg-zinc-800/80 rounded-xl border border-zinc-700/60">
            <span className="text-zinc-300 font-medium">⏱️ Hẹn giờ (10s)</span>
            <IOSSwitch
              id="switch-timer-enabled"
              checked={isTimerEnabled}
              onChange={onToggleTimer}
            />
          </div>

          <div className="flex items-center justify-between p-2 bg-zinc-800/80 rounded-xl border border-zinc-700/60">
            <span className="text-zinc-300 font-medium">⚡ Tự qua câu</span>
            <IOSSwitch
              id="switch-auto-advance"
              checked={isAutoAdvanceEnabled}
              onChange={onToggleAutoAdvance}
            />
          </div>
        </div>
      </div>

      {/* Global Quick Practice Modes */}
      <div className="bg-zinc-900/90 rounded-3xl p-5 border border-zinc-800 shadow-sm space-y-3">
        <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center space-x-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
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
            className="p-3.5 bg-zinc-800/80 hover:bg-blue-950/40 active:scale-[0.98] border border-zinc-700/70 hover:border-blue-700/80 rounded-2xl flex items-center space-x-3 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-white group-hover:text-blue-300">
                🎲 Ngẫu Nhiên 100 Từ
              </div>
              <div className="text-[11px] text-zinc-400">
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
            className="p-3.5 bg-zinc-800/80 hover:bg-red-950/40 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none border border-zinc-700/70 hover:border-red-700/80 rounded-2xl flex items-center space-x-3 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-white group-hover:text-red-300">
                🔄 Ôn Tập Từ Sai ({stats.wrong} từ)
              </div>
              <div className="text-[11px] text-zinc-400">
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
            className="p-3.5 bg-zinc-800/80 hover:bg-amber-950/40 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none border border-zinc-700/70 hover:border-amber-700/80 rounded-2xl flex items-center space-x-3 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <div className="font-bold text-xs text-white group-hover:text-amber-300">
                ⭐ Luyện Từ Đã Đánh Dấu ({stats.bookmarked})
              </div>
              <div className="text-[11px] text-zinc-400">
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
            className="p-3.5 bg-zinc-800/80 hover:bg-emerald-950/40 active:scale-[0.98] border border-zinc-700/70 hover:border-emerald-700/80 rounded-2xl flex items-center space-x-3 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-white group-hover:text-emerald-300">
                📖 Ôn Toàn Bộ ({stats.total} từ)
              </div>
              <div className="text-[11px] text-zinc-400">
                Duyệt qua tất cả các từ trong kho
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Vocabulary Words in Selected Group with Quick Lookup & Edit Entry */}
      {stats.groupWords.length > 0 && (
        <div className="bg-zinc-900/90 rounded-3xl p-5 border border-zinc-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center space-x-1.5">
              <span>Danh Sách Từ Nhóm [{selectedGroup}]</span>
              <span className="text-zinc-500 font-normal">({filteredGroupWords.length}/{stats.groupWords.length})</span>
            </h2>
            <button
              onClick={() => onOpenFilterTab("all")}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
            >
              <span>Xem &amp; Sửa toàn bộ</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Quick search within group */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder={`Tra cứu từ trong nhóm ${selectedGroup}...`}
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1 divide-y divide-zinc-800/80">
            {filteredGroupWords.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                Không tìm thấy từ khớp với "{quickSearch}"
              </div>
            ) : (
              filteredGroupWords.map((item) => (
                <div
                  key={item.id}
                  className="pt-2 pb-1.5 flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-white font-mono">
                        {item.word}
                      </span>
                      {item.ipa && (
                        <span className="text-xs text-blue-400 font-mono font-medium">
                          {item.ipa}
                        </span>
                      )}
                      {item.learned && (
                        <span className="text-[10px] text-emerald-400 font-bold">✓</span>
                      )}
                      {item.isBookmarked && (
                        <span className="text-[10px] text-amber-400">★</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">{item.translation}</p>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => onPronounce(item.word)}
                      className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-blue-950/60 text-zinc-400 hover:text-blue-400 flex items-center justify-center transition-colors"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenFilterTab("all")}
                      className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors"
                      title="Chỉnh sửa từ này"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

