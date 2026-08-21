import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Upload,
  Volume2,
  Star,
  CheckCircle2,
  Trash2,
  Edit2,
  Save,
  X,
  Filter,
  Layers,
  BookOpen,
} from "lucide-react";
import { VocabularyItem } from "../types";
import { soundFx } from "../utils/soundEffects";
import { IOSSegmentedControl } from "./ios/IOSSegmentedControl";

interface VocabularyManagerProps {
  vocabularies: VocabularyItem[];
  initialFilter?: string;
  onPronounce: (word: string) => void;
  onToggleBookmark: (item: VocabularyItem) => void;
  onToggleLearned: (item: VocabularyItem) => void;
  onUpdate: (item: VocabularyItem) => void;
  onDelete: (item: VocabularyItem) => void;
  onOpenAddModal: () => void;
}

type FilterType = "all" | "learned" | "unlearned" | "wrong" | "marked";

export function VocabularyManager({
  vocabularies,
  initialFilter = "all",
  onPronounce,
  onToggleBookmark,
  onToggleLearned,
  onUpdate,
  onDelete,
  onOpenAddModal,
}: VocabularyManagerProps) {
  const [filter, setFilter] = useState<FilterType>(
    (initialFilter.startsWith("letter_") ? "all" : initialFilter as FilterType) || "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [letterFilter, setLetterFilter] = useState<string>(
    initialFilter.startsWith("letter_") ? initialFilter.replace("letter_", "") : "ALL"
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWord, setEditWord] = useState("");
  const [editTranslation, setEditTranslation] = useState("");
  const [editIpa, setEditIpa] = useState("");

  const ALPHABET = ["ALL", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

  const filteredList = useMemo(() => {
    return vocabularies.filter((item) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchWord = item.word.toLowerCase().includes(q);
        const matchTr = item.translation.toLowerCase().includes(q);
        const matchIpa = item.ipa.toLowerCase().includes(q);
        if (!matchWord && !matchTr && !matchIpa) return false;
      }

      // Letter filter
      if (letterFilter !== "ALL") {
        if (!item.word.toUpperCase().startsWith(letterFilter)) return false;
      }

      // Status filter
      if (filter === "learned") return item.learned;
      if (filter === "unlearned") return !item.learned;
      if (filter === "wrong") return item.wrongCount > 0;
      if (filter === "marked") return item.isBookmarked;

      return true;
    });
  }, [vocabularies, searchQuery, letterFilter, filter]);

  const handleStartEdit = (item: VocabularyItem) => {
    setEditingId(item.id);
    setEditWord(item.word);
    setEditTranslation(item.translation);
    setEditIpa(item.ipa || "");
    soundFx.playTap();
  };

  const handleSaveEdit = (item: VocabularyItem) => {
    if (!editWord.trim() || !editTranslation.trim()) return;
    onUpdate({
      ...item,
      word: editWord.trim(),
      translation: editTranslation.trim(),
      ipa: editIpa.trim(),
    });
    setEditingId(null);
    soundFx.playTap();
  };

  return (
    <div id="vocab-manager-view" className="space-y-4 pb-24 select-none">
      {/* Top Search & Actions Bar */}
      <div className="bg-zinc-900/90 rounded-3xl p-4 border border-zinc-800 shadow-sm space-y-3">
        <div className="flex items-center space-x-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-vocab-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm từ tiếng Anh, tiếng Việt, phiên âm..."
              className="w-full pl-9 pr-8 py-2.5 bg-zinc-950 focus:bg-zinc-900 border border-zinc-800 focus:border-blue-500 rounded-xl text-xs text-white placeholder:text-zinc-500 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Add Word Button */}
          <button
            id="btn-vocab-add-new"
            onClick={() => {
              soundFx.playTap();
              onOpenAddModal();
            }}
            className="px-3 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold rounded-xl text-xs flex items-center space-x-1 shadow-sm transition-all flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Thêm từ</span>
          </button>
        </div>

        {/* Filter Segmented Control */}
        <IOSSegmentedControl<FilterType>
          options={[
            { value: "all", label: "Tất cả", count: vocabularies.length },
            {
              value: "learned",
              label: "Đã thuộc",
              count: vocabularies.filter((v) => v.learned).length,
            },
            {
              value: "unlearned",
              label: "Chưa học",
              count: vocabularies.filter((v) => !v.learned).length,
            },
            {
              value: "wrong",
              label: "Từ sai",
              count: vocabularies.filter((v) => v.wrongCount > 0).length,
            },
            {
              value: "marked",
              label: "Gắn sao",
              count: vocabularies.filter((v) => v.isBookmarked).length,
            },
          ]}
          value={filter}
          onChange={(val) => setFilter(val)}
          size="sm"
        />

        {/* Alphabet Letter Filter Horizontal Scroll */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {ALPHABET.map((letter) => {
            const isSelected = letterFilter === letter;
            return (
              <button
                key={letter}
                onClick={() => {
                  soundFx.playTap();
                  setLetterFilter(letter);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex-shrink-0 transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-750 hover:text-zinc-200"
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vocabulary Item List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-2 text-xs text-zinc-400 font-medium">
          <span>Tìm thấy <strong className="text-white font-mono">{filteredList.length}</strong> từ vựng</span>
          {letterFilter !== "ALL" && (
            <span className="text-blue-400">Lọc theo chữ cái [{letterFilter}]</span>
          )}
        </div>

        {filteredList.length === 0 ? (
          <div className="bg-zinc-900/90 rounded-3xl p-10 text-center border border-zinc-800 space-y-2">
            <BookOpen className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-zinc-300">Không tìm thấy từ vựng nào</p>
            <p className="text-xs text-zinc-500">
              Thử thay đổi bộ lọc hoặc bấm "Thêm từ" để bổ sung vào kho.
            </p>
          </div>
        ) : (
          filteredList.map((item) => {
            const isEditing = editingId === item.id;

            return (
              <div
                key={item.id}
                id={`vocab-row-${item.id}`}
                className="bg-zinc-900/90 rounded-2xl p-4 border border-zinc-800 shadow-sm space-y-2.5 transition-all hover:border-zinc-700"
              >
                {isEditing ? (
                  /* Edit Mode */
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editWord}
                        onChange={(e) => setEditWord(e.target.value)}
                        placeholder="Từ tiếng Anh"
                        className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono font-bold text-white focus:border-blue-500 outline-none"
                      />
                      <input
                        type="text"
                        value={editIpa}
                        onChange={(e) => setEditIpa(e.target.value)}
                        placeholder="Phiên âm IPA"
                        className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-blue-400 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <input
                      type="text"
                      value={editTranslation}
                      onChange={(e) => setEditTranslation(e.target.value)}
                      placeholder="Nghĩa tiếng Việt"
                      className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white focus:border-blue-500 outline-none"
                    />
                    <div className="flex items-center justify-end space-x-2 pt-1">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold hover:bg-zinc-700"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => handleSaveEdit(item)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Lưu Thay Đổi</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 min-w-0 pr-3">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-extrabold text-base text-white font-mono tracking-tight">
                          {item.word}
                        </span>
                        {item.ipa && (
                          <span className="text-xs text-blue-400 font-mono bg-blue-950/60 border border-blue-800/40 px-2 py-0.5 rounded-md">
                            {item.ipa}
                          </span>
                        )}
                        {item.wrongCount > 0 && (
                          <span className="text-[10px] text-red-400 font-bold bg-red-950/60 px-1.5 py-0.2 rounded border border-red-800/50">
                            Sai: {item.wrongCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                        {item.translation}
                      </p>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {/* Audio Pronunciation */}
                      <button
                        type="button"
                        onClick={() => onPronounce(item.word)}
                        className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-blue-950/60 text-zinc-300 hover:text-blue-400 flex items-center justify-center transition-colors"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      {/* Bookmark Star */}
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playTap();
                          onToggleBookmark(item);
                        }}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                          item.isBookmarked
                            ? "bg-amber-950/60 text-amber-400 border border-amber-800/60 hover:bg-amber-900/60"
                            : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                        }`}
                        title="Đánh dấu sao"
                      >
                        <Star
                          className={`w-4 h-4 ${item.isBookmarked ? "fill-amber-400" : ""}`}
                        />
                      </button>

                      {/* Learned Checkmark */}
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playTap();
                          onToggleLearned(item);
                        }}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                          item.learned
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/60"
                            : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                        }`}
                        title={item.learned ? "Đánh dấu chưa thuộc" : "Đánh dấu đã thuộc"}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 ${item.learned ? "fill-emerald-400/20" : ""}`}
                        />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(item)}
                        className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors"
                        title="Sửa từ này"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Xóa từ "${item.word}" khỏi kho?`)) {
                            soundFx.playWrong();
                            onDelete(item);
                          }
                        }}
                        className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 flex items-center justify-center transition-colors"
                        title="Xóa từ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

