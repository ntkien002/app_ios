import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  VocabularyItem,
  QuizMode,
  QuizQuestion,
  QuizSessionState,
  ComparisonResult,
  DashboardStats,
  TabType,
} from "./types";
import {
  getInitialVocabulary,
  saveVocabulary,
  loadSettings,
  saveSettings,
  AppSettings,
  parseBulkImportText,
} from "./utils/storage";
import { speechService } from "./utils/speech";
import { soundFx } from "./utils/soundEffects";
import { analyzeSpellingMismatch } from "./utils/spellingAnalysis";

// iOS UI Shell
import { IOSStatusBar } from "./components/ios/IOSStatusBar";
import { IOSNavigationBar } from "./components/ios/IOSNavigationBar";
import { IOSTabBar } from "./components/ios/IOSTabBar";

// Feature Views
import { HomeScreen } from "./components/HomeScreen";
import { QuizScreen } from "./components/QuizScreen";
import { VocabularyManager } from "./components/VocabularyManager";
import { FlashcardsView } from "./components/FlashcardsView";
import { SwiftCodeExportModal } from "./components/SwiftCodeExportModal";
import { SettingsModal } from "./components/SettingsModal";
import { AddImportModal } from "./components/AddImportModal";
import { SpellingComparisonModal } from "./components/SpellingComparisonModal";

export default function App() {
  // Vocabulary items in storage
  const [vocabularies, setVocabularies] = useState<VocabularyItem[]>(() => getInitialVocabulary());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [selectedGroup, setSelectedGroup] = useState<string>("A");
  const [isHardMode, setIsHardMode] = useState<boolean>(false);
  const [isReverseMode, setIsReverseMode] = useState<boolean>(false);

  // Dialogs
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);

  // Quiz queues
  const quizQueueRef = useRef<VocabularyItem[]>([]);
  const reviewRetryQueueRef = useRef<VocabularyItem[]>([]);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Quiz state
  const [quizState, setQuizState] = useState<QuizSessionState>({
    isActive: false,
    mode: QuizMode.GROUP_NORMAL,
    title: "",
    totalCount: 0,
    remainingCount: 0,
    currentQuestion: null,
    previousWord: null,
    hearts: 3,
    maxHearts: 3,
    timeLimitSec: settings.timeLimitSec,
    currentTimerProgress: 1.0,
    isPaused: false,
    isTimerEnabled: settings.isTimerEnabled,
    isAutoAdvanceEnabled: settings.isAutoAdvanceEnabled,
    consecutiveCorrect: 0,
    repeatCount: 0,
    isAnswerRevealed: false,
    selectedIndex: null,
    isAnswerCorrect: null,
    comparisonResult: null,
    correctCount: 0,
    wrongTotalCount: 0,
    isCompleted: false,
  });

  // Sync speech rate
  useEffect(() => {
    speechService.setRate(settings.speechRate);
  }, [settings.speechRate]);

  // Persist vocabularies
  const updateVocabularyState = useCallback((newItems: VocabularyItem[]) => {
    setVocabularies(newItems);
    saveVocabulary(newItems);
  }, []);

  // Update settings
  const handleUpdateSettings = (newPartial: Partial<AppSettings>) => {
    const updated = { ...settings, ...newPartial };
    setSettings(updated);
    saveSettings(updated);
    setQuizState((prev) => ({
      ...prev,
      timeLimitSec: updated.timeLimitSec,
      isTimerEnabled: updated.isTimerEnabled,
      isAutoAdvanceEnabled: updated.isAutoAdvanceEnabled,
    }));
  };

  // Compute Dashboard Stats
  const stats: DashboardStats = useMemo(() => {
    const total = vocabularies.length;
    const learned = vocabularies.filter((v) => v.learned).length;
    const unlearned = total - learned;
    const wrong = vocabularies.filter((v) => v.wrongCount > 0).length;
    const bookmarked = vocabularies.filter((v) => v.isBookmarked).length;
    const progressPct = total > 0 ? Math.round((learned / total) * 100) : 0;

    const letterCounts: Record<string, { learned: number; total: number }> = {};
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((char) => {
      const wordsForChar = vocabularies.filter(
        (v) => v.word.toUpperCase().startsWith(char)
      );
      letterCounts[char] = {
        total: wordsForChar.length,
        learned: wordsForChar.filter((v) => v.learned).length,
      };
    });

    const groupWords = vocabularies.filter((v) =>
      v.word.toUpperCase().startsWith(selectedGroup)
    );

    return {
      total,
      learned,
      unlearned,
      wrong,
      bookmarked,
      progressPct,
      letterCounts,
      groupWords,
    };
  }, [vocabularies, selectedGroup]);

  // Pronunciation handler
  const handlePronounce = useCallback((word: string) => {
    speechService.speak(word, settings.speechRate);
  }, [settings.speechRate]);

  // Helper to build a question for an item
  const buildQuestion = useCallback(
    (entity: VocabularyItem, mode: QuizMode, isReverse: boolean, isHard: boolean): QuizQuestion => {
      if (isReverse) {
        // Reverse mode: English prompt -> Choose Vietnamese translation
        const correctMeaning = entity.translation;
        const otherMeanings = vocabularies
          .filter((v) => v.id !== entity.id && v.translation.trim() && v.translation !== correctMeaning)
          .map((v) => v.translation)
          .filter((val, i, arr) => arr.indexOf(val) === i)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        const options = [correctMeaning, ...otherMeanings].sort(() => Math.random() - 0.5);
        const correctIdx = options.indexOf(correctMeaning);
        const prompt = entity.ipa ? `${entity.ipa} = ${entity.word}` : entity.word;

        return {
          currentEntity: entity,
          options,
          correctIndex: correctIdx,
          isReverse: true,
          displayPrompt: prompt,
          displaySubPrompt: "Chọn nghĩa tiếng Việt đúng:",
        };
      } else {
        // Normal / Hard mode: Vietnamese prompt -> Choose English word
        const pool = isHard
          ? vocabularies.filter(
              (v) =>
                v.id !== entity.id &&
                v.word.toUpperCase().startsWith(entity.word[0]?.toUpperCase() || "")
            )
          : vocabularies.filter((v) => v.id !== entity.id);

        const distractors = pool
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((v) => v.word);

        const rawChoices = [entity.word, ...distractors].sort(() => Math.random() - 0.5);
        const correctIdx = rawChoices.indexOf(entity.word);

        const formattedOptions = rawChoices.map((w) => {
          const match = vocabularies.find((v) => v.word.toLowerCase() === w.toLowerCase());
          if (match && match.ipa) {
            return `${match.ipa} = ${w}`;
          }
          return w;
        });

        return {
          currentEntity: entity,
          options: formattedOptions,
          correctIndex: correctIdx,
          isReverse: false,
          displayPrompt: entity.translation,
          displaySubPrompt: "Chọn từ tiếng Anh tương ứng:",
        };
      }
    },
    [vocabularies]
  );

  // Clear timers
  const clearQuizTimers = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  // Load next question in quiz queue
  const loadNextQuizQuestion = useCallback(() => {
    clearQuizTimers();

    setQuizState((prev) => {
      // Check if queue empty
      if (quizQueueRef.current.length === 0) {
        // If wrong review mode and retry queue has items, move them back
        if (prev.mode === QuizMode.WRONG_REVIEW && reviewRetryQueueRef.current.length > 0) {
          quizQueueRef.current = [...reviewRetryQueueRef.current].sort(() => Math.random() - 0.5);
          reviewRetryQueueRef.current = [];
        }
      }

      if (quizQueueRef.current.length === 0 || prev.hearts <= 0) {
        if (settings.soundEffectsEnabled) {
          if (prev.hearts > 0) soundFx.playSuccess();
        }
        return {
          ...prev,
          isActive: true,
          isCompleted: true,
          currentQuestion: null,
        };
      }

      const nextEntity = quizQueueRef.current.shift()!;
      const isReverse =
        prev.mode === QuizMode.GROUP_REVERSE ||
        prev.mode === QuizMode.RANDOM_REVERSE ||
        prev.mode === QuizMode.FULL_REVIEW_REVERSE;
      const isHard = prev.mode === QuizMode.GROUP_HARD || prev.mode === QuizMode.RANDOM_HARD;

      const question = buildQuestion(nextEntity, prev.mode, isReverse, isHard);

      // Pronounce prompt in reverse mode
      if (isReverse) {
        handlePronounce(nextEntity.word);
      }

      return {
        ...prev,
        currentQuestion: question,
        isAnswerRevealed: false,
        selectedIndex: null,
        isAnswerCorrect: null,
        currentTimerProgress: 1.0,
        comparisonResult: null,
      };
    });
  }, [clearQuizTimers, buildQuestion, settings.soundEffectsEnabled, handlePronounce]);

  // Start a quiz session
  const startQuizSession = useCallback(
    (items: VocabularyItem[], mode: QuizMode, title: string, isReverse: boolean = false, isHard: boolean = false) => {
      if (items.length === 0) return;

      clearQuizTimers();
      const shuffled = [...items].sort(() => Math.random() - 0.5);
      quizQueueRef.current = shuffled;
      reviewRetryQueueRef.current = [];

      const initialRemaining = shuffled.length;

      setQuizState({
        isActive: true,
        mode,
        title,
        totalCount: initialRemaining,
        remainingCount: initialRemaining,
        currentQuestion: null,
        previousWord: null,
        hearts: 3,
        maxHearts: 3,
        timeLimitSec: settings.timeLimitSec,
        currentTimerProgress: 1.0,
        isPaused: false,
        isTimerEnabled: settings.isTimerEnabled,
        isAutoAdvanceEnabled: settings.isAutoAdvanceEnabled,
        consecutiveCorrect: 0,
        repeatCount: 0,
        isAnswerRevealed: false,
        selectedIndex: null,
        isAnswerCorrect: null,
        comparisonResult: null,
        correctCount: 0,
        wrongTotalCount: 0,
        isCompleted: false,
      });

      // Load first question
      setTimeout(() => {
        const first = quizQueueRef.current.shift();
        if (!first) return;
        const q = buildQuestion(first, mode, isReverse, isHard);

        if (isReverse) {
          handlePronounce(first.word);
        }

        setQuizState((s) => ({
          ...s,
          currentQuestion: q,
          currentTimerProgress: 1.0,
        }));
      }, 50);
    },
    [clearQuizTimers, settings, buildQuestion, handlePronounce]
  );

  // Timer Tick Loop
  useEffect(() => {
    if (
      quizState.isActive &&
      !quizState.isCompleted &&
      !quizState.isPaused &&
      quizState.isTimerEnabled &&
      !quizState.isAnswerRevealed &&
      quizState.currentQuestion
    ) {
      const intervalMs = 100;
      const totalSteps = (quizState.timeLimitSec * 1000) / intervalMs;
      const stepPct = 1.0 / totalSteps;

      countdownIntervalRef.current = setInterval(() => {
        setQuizState((prev) => {
          const nextProgress = prev.currentTimerProgress - stepPct;
          if (nextProgress <= 0) {
            // Time expired -> treat as wrong
            clearInterval(countdownIntervalRef.current!);
            countdownIntervalRef.current = null;
            if (settings.soundEffectsEnabled) soundFx.playWrong();

            const entity = prev.currentQuestion?.currentEntity;
            if (entity) {
              const updated = vocabularies.map((v) =>
                v.id === entity.id ? { ...v, wrongCount: v.wrongCount + 1 } : v
              );
              updateVocabularyState(updated);
            }

            return {
              ...prev,
              currentTimerProgress: 0,
              isAnswerRevealed: true,
              isAnswerCorrect: false,
              hearts: Math.max(0, prev.hearts - 1),
              wrongTotalCount: prev.wrongTotalCount + 1,
            };
          }
          return {
            ...prev,
            currentTimerProgress: nextProgress,
          };
        });
      }, intervalMs);

      return () => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      };
    }
  }, [
    quizState.isActive,
    quizState.isCompleted,
    quizState.isPaused,
    quizState.isTimerEnabled,
    quizState.isAnswerRevealed,
    quizState.currentQuestion,
    quizState.timeLimitSec,
    settings.soundEffectsEnabled,
    vocabularies,
    updateVocabularyState,
  ]);

  // Answer Submission by Multiple Choice Index
  const handleSelectOption = useCallback(
    (index: number) => {
      if (!quizState.currentQuestion || quizState.isAnswerRevealed) return;
      clearQuizTimers();

      const q = quizState.currentQuestion;
      const isCorrect = index === q.correctIndex;
      const entity = q.currentEntity;

      if (isCorrect) {
        if (settings.soundEffectsEnabled) soundFx.playCorrect();
        handlePronounce(entity.word);
      } else {
        if (settings.soundEffectsEnabled) soundFx.playWrong();
      }

      // Update entity stats in database
      const updatedVocab = vocabularies.map((v) => {
        if (v.id === entity.id) {
          if (isCorrect) {
            return { ...v, learned: true, consecutiveCorrect: v.consecutiveCorrect + 1 };
          } else {
            return { ...v, wrongCount: v.wrongCount + 1, consecutiveCorrect: 0 };
          }
        }
        return v;
      });
      updateVocabularyState(updatedVocab);

      const nextHearts = isCorrect ? quizState.hearts : Math.max(0, quizState.hearts - 1);

      setQuizState((prev) => ({
        ...prev,
        isAnswerRevealed: true,
        selectedIndex: index,
        isAnswerCorrect: isCorrect,
        hearts: nextHearts,
        remainingCount: isCorrect ? Math.max(0, prev.remainingCount - 1) : prev.remainingCount,
        correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
        wrongTotalCount: isCorrect ? prev.wrongTotalCount : prev.wrongTotalCount + 1,
      }));

      // If Wrong Review Mode: handle retry queue
      if (quizState.mode === QuizMode.WRONG_REVIEW && !isCorrect) {
        if (!reviewRetryQueueRef.current.some((v) => v.id === entity.id)) {
          reviewRetryQueueRef.current.push(entity);
        }
      }

      // Auto advance
      if (quizState.isAutoAdvanceEnabled && nextHearts > 0) {
        autoAdvanceTimerRef.current = setTimeout(() => {
          loadNextQuizQuestion();
        }, 1600);
      }
    },
    [
      quizState,
      clearQuizTimers,
      settings.soundEffectsEnabled,
      handlePronounce,
      vocabularies,
      updateVocabularyState,
      loadNextQuizQuestion,
    ]
  );

  // Manual Spelling Text Submission
  const handleSubmitSpellingText = useCallback(
    (text: string) => {
      if (!quizState.currentQuestion || quizState.isAnswerRevealed) return;
      clearQuizTimers();

      const q = quizState.currentQuestion;
      const entity = q.currentEntity;
      const target = entity.word.toLowerCase().trim();
      const typed = text.toLowerCase().trim();
      const isCorrect = target === typed;

      if (isCorrect) {
        if (settings.soundEffectsEnabled) soundFx.playCorrect();
        handlePronounce(entity.word);
      } else {
        if (settings.soundEffectsEnabled) soundFx.playWrong();
        // Analyze spelling mismatch
        const analysis = analyzeSpellingMismatch(text, entity.word);
        setComparisonResult(analysis);
      }

      // Update database
      const updatedVocab = vocabularies.map((v) => {
        if (v.id === entity.id) {
          if (isCorrect) {
            return { ...v, learned: true, consecutiveCorrect: v.consecutiveCorrect + 1 };
          } else {
            return { ...v, wrongCount: v.wrongCount + 1, consecutiveCorrect: 0 };
          }
        }
        return v;
      });
      updateVocabularyState(updatedVocab);

      const nextHearts = isCorrect ? quizState.hearts : Math.max(0, quizState.hearts - 1);

      setQuizState((prev) => ({
        ...prev,
        isAnswerRevealed: true,
        selectedIndex: isCorrect ? q.correctIndex : -1,
        isAnswerCorrect: isCorrect,
        hearts: nextHearts,
        remainingCount: isCorrect ? Math.max(0, prev.remainingCount - 1) : prev.remainingCount,
        correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
        wrongTotalCount: isCorrect ? prev.wrongTotalCount : prev.wrongTotalCount + 1,
      }));

      // Auto advance
      if (isCorrect && quizState.isAutoAdvanceEnabled && nextHearts > 0) {
        autoAdvanceTimerRef.current = setTimeout(() => {
          loadNextQuizQuestion();
        }, 1600);
      }
    },
    [
      quizState,
      clearQuizTimers,
      settings.soundEffectsEnabled,
      handlePronounce,
      vocabularies,
      updateVocabularyState,
      loadNextQuizQuestion,
    ]
  );

  // Toggle bookmark for current quiz entity
  const handleToggleCurrentBookmark = useCallback(() => {
    if (!quizState.currentQuestion) return;
    const entity = quizState.currentQuestion.currentEntity;
    const updated = vocabularies.map((v) =>
      v.id === entity.id ? { ...v, isBookmarked: !v.isBookmarked } : v
    );
    updateVocabularyState(updated);
    setQuizState((prev) =>
      prev.currentQuestion
        ? {
            ...prev,
            currentQuestion: {
              ...prev.currentQuestion,
              currentEntity: {
                ...prev.currentQuestion.currentEntity,
                isBookmarked: !prev.currentQuestion.currentEntity.isBookmarked,
              },
            },
          }
        : prev
    );
  }, [quizState.currentQuestion, vocabularies, updateVocabularyState]);

  // Remove bookmark from current entity
  const handleRemoveBookmarkFromCurrent = useCallback(() => {
    if (!quizState.currentQuestion) return;
    const entity = quizState.currentQuestion.currentEntity;
    const updated = vocabularies.map((v) =>
      v.id === entity.id ? { ...v, isBookmarked: false } : v
    );
    updateVocabularyState(updated);
    loadNextQuizQuestion();
  }, [quizState.currentQuestion, vocabularies, updateVocabularyState, loadNextQuizQuestion]);

  // Exit quiz
  const handleExitQuiz = useCallback(() => {
    clearQuizTimers();
    setQuizState((prev) => ({ ...prev, isActive: false, currentQuestion: null }));
  }, [clearQuizTimers]);

  // Vocab CRUD Handlers
  const handleAddSingleWord = (word: string, translation: string, ipa?: string) => {
    const newItem: VocabularyItem = {
      id: `word_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      word: word.trim(),
      translation: translation.trim(),
      ipa: ipa?.trim() || "",
      learned: false,
      isBookmarked: false,
      wrongCount: 0,
      consecutiveCorrect: 0,
      createdAt: Date.now(),
    };
    updateVocabularyState([newItem, ...vocabularies]);
  };

  const handleBulkImportWords = (rawText: string) => {
    const res = parseBulkImportText(rawText, vocabularies);
    updateVocabularyState(res.newItems);
    return { addedCount: res.addedCount, updatedCount: res.updatedCount };
  };

  const handleUpdateWord = (item: VocabularyItem) => {
    const updated = vocabularies.map((v) => (v.id === item.id ? item : v));
    updateVocabularyState(updated);
  };

  const handleDeleteWord = (item: VocabularyItem) => {
    const updated = vocabularies.filter((v) => v.id !== item.id);
    updateVocabularyState(updated);
  };

  const handleToggleBookmarkItem = (item: VocabularyItem) => {
    const updated = vocabularies.map((v) =>
      v.id === item.id ? { ...v, isBookmarked: !v.isBookmarked } : v
    );
    updateVocabularyState(updated);
  };

  const handleToggleLearnedItem = (item: VocabularyItem) => {
    const updated = vocabularies.map((v) =>
      v.id === item.id ? { ...v, learned: !v.learned } : v
    );
    updateVocabularyState(updated);
  };

  const handleResetAllProgress = () => {
    const reset = vocabularies.map((v) => ({
      ...v,
      learned: false,
      isBookmarked: false,
      wrongCount: 0,
      consecutiveCorrect: 0,
    }));
    updateVocabularyState(reset);
  };

  return (
    <div className="min-h-screen bg-black flex justify-center text-zinc-100 font-sans antialiased selection:bg-blue-900 selection:text-blue-200">
      {/* iOS Mobile Canvas Container */}
      <div className="w-full max-w-md min-h-screen bg-zinc-950 flex flex-col shadow-2xl relative border-x border-zinc-800">
        {/* iOS Dynamic Island & Status Bar */}
        <IOSStatusBar />

        {/* If Active Quiz is Running */}
        {quizState.isActive ? (
          <QuizScreen
            state={quizState}
            onSelectOption={handleSelectOption}
            onSubmitText={handleSubmitSpellingText}
            onNextQuestion={loadNextQuizQuestion}
            onToggleBookmark={handleToggleCurrentBookmark}
            onRemoveBookmark={handleRemoveBookmarkFromCurrent}
            onTogglePause={() => setQuizState((s) => ({ ...s, isPaused: !s.isPaused }))}
            onToggleTimer={(val) => setQuizState((s) => ({ ...s, isTimerEnabled: val }))}
            onToggleAutoAdvance={(val) =>
              setQuizState((s) => ({ ...s, isAutoAdvanceEnabled: val }))
            }
            onExit={handleExitQuiz}
            onPronounce={handlePronounce}
          />
        ) : (
          /* Normal Tab Content */
          <div className="flex-1 flex flex-col">
            {/* iOS Top Navigation Bar */}
            <IOSNavigationBar
              title={
                activeTab === "home"
                  ? "Luyện Tập"
                  : activeTab === "flashcards"
                  ? "Flashcards"
                  : activeTab === "vocab"
                  ? "Kho Từ Vựng"
                  : activeTab === "swift"
                  ? "Mã Swift iOS"
                  : "Cài Đặt"
              }
              largeTitle={activeTab === "home" || activeTab === "vocab"}
              subtitle={
                activeTab === "home"
                  ? `Đang chọn nhóm [${selectedGroup}] • ${vocabularies.length} từ`
                  : undefined
              }
            />

            {/* Main Tab Views */}
            <main className="flex-1 px-4 pt-3">
              {activeTab === "home" && (
                <HomeScreen
                  stats={stats}
                  selectedGroup={selectedGroup}
                  isHardMode={isHardMode}
                  isReverseMode={isReverseMode}
                  isTimerEnabled={quizState.isTimerEnabled}
                  isAutoAdvanceEnabled={quizState.isAutoAdvanceEnabled}
                  onSelectGroup={(letter) => setSelectedGroup(letter)}
                  onToggleHardMode={(val) => setIsHardMode(val)}
                  onToggleReverseMode={(val) => setIsReverseMode(val)}
                  onToggleTimer={(val) =>
                    setQuizState((s) => ({ ...s, isTimerEnabled: val }))
                  }
                  onToggleAutoAdvance={(val) =>
                    setQuizState((s) => ({ ...s, isAutoAdvanceEnabled: val }))
                  }
                  onStartGroupQuiz={(letter, hard, reverse) => {
                    const words = vocabularies.filter((v) =>
                      v.word.toUpperCase().startsWith(letter)
                    );
                    const mode = reverse
                      ? QuizMode.GROUP_REVERSE
                      : hard
                      ? QuizMode.GROUP_HARD
                      : QuizMode.GROUP_NORMAL;
                    startQuizSession(words, mode, `Nhóm Ký Tự [${letter}]`, reverse, hard);
                  }}
                  onStartRandomQuiz={(hard, reverse) => {
                    const sample = [...vocabularies]
                      .sort(() => Math.random() - 0.5)
                      .slice(0, 100);
                    const mode = reverse
                      ? QuizMode.RANDOM_REVERSE
                      : hard
                      ? QuizMode.RANDOM_HARD
                      : QuizMode.RANDOM_BALANCED;
                    startQuizSession(sample, mode, "Ngẫu Nhiên 100 Từ", reverse, hard);
                  }}
                  onStartWrongReview={() => {
                    const wrongWords = vocabularies.filter((v) => v.wrongCount > 0);
                    startQuizSession(wrongWords, QuizMode.WRONG_REVIEW, "Ôn Tập Từ Sai", false, false);
                  }}
                  onStartMarkedReview={() => {
                    const marked = vocabularies.filter((v) => v.isBookmarked);
                    startQuizSession(marked, QuizMode.MARKED_CHECK, "Luyện Từ Đã Đánh Dấu", false, false);
                  }}
                  onStartFullReview={(reverse) => {
                    const mode = reverse ? QuizMode.FULL_REVIEW_REVERSE : QuizMode.FULL_REVIEW;
                    startQuizSession(vocabularies, mode, "Review Toàn Bộ Kho Từ", reverse, false);
                  }}
                  onOpenAddModal={() => setShowAddModal(true)}
                  onPronounce={handlePronounce}
                  onOpenFilterTab={(filter) => {
                    setActiveTab("vocab");
                  }}
                />
              )}

              {activeTab === "flashcards" && (
                <FlashcardsView
                  vocabularies={vocabularies}
                  onPronounce={handlePronounce}
                  onToggleBookmark={handleToggleBookmarkItem}
                  onToggleLearned={handleToggleLearnedItem}
                />
              )}

              {activeTab === "vocab" && (
                <VocabularyManager
                  vocabularies={vocabularies}
                  onPronounce={handlePronounce}
                  onToggleBookmark={handleToggleBookmarkItem}
                  onToggleLearned={handleToggleLearnedItem}
                  onUpdate={handleUpdateWord}
                  onDelete={handleDeleteWord}
                  onOpenAddModal={() => setShowAddModal(true)}
                />
              )}

              {activeTab === "swift" && <SwiftCodeExportModal />}

              {activeTab === "settings" && (
                <SettingsModal
                  settings={settings}
                  vocabularies={vocabularies}
                  onUpdateSettings={handleUpdateSettings}
                  onResetProgress={handleResetAllProgress}
                  onRestoreBackup={(items) => updateVocabularyState(items)}
                />
              )}
            </main>

            {/* iOS Bottom Tab Bar */}
            <IOSTabBar
              activeTab={activeTab}
              onChangeTab={(tab) => setActiveTab(tab)}
              vocabCount={vocabularies.length}
            />
          </div>
        )}

        {/* Add / Import Dialog Modal */}
        {showAddModal && (
          <AddImportModal
            onDismiss={() => setShowAddModal(false)}
            onAddWord={handleAddSingleWord}
            onBulkImport={handleBulkImportWords}
          />
        )}

        {/* Character Mismatch Diagnosis Modal */}
        <SpellingComparisonModal
          result={comparisonResult}
          onDismiss={() => setComparisonResult(null)}
        />
      </div>
    </div>
  );
}
