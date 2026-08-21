export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  ipa: string;
  learned: boolean;
  isBookmarked: boolean;
  wrongCount: number;
  consecutiveCorrect: number;
  createdAt: number;
}

export enum QuizMode {
  GROUP_NORMAL = "GROUP_NORMAL",
  GROUP_HARD = "GROUP_HARD",
  GROUP_REVERSE = "GROUP_REVERSE",
  RANDOM_BALANCED = "RANDOM_BALANCED",
  RANDOM_HARD = "RANDOM_HARD",
  RANDOM_REVERSE = "RANDOM_REVERSE",
  WRONG_REVIEW = "WRONG_REVIEW",
  MARKED_CHECK = "MARKED_CHECK",
  RANDOM_MARKED = "RANDOM_MARKED",
  FULL_REVIEW = "FULL_REVIEW",
  FULL_REVIEW_REVERSE = "FULL_REVIEW_REVERSE"
}

export interface QuizChoice {
  rawText: string;
  displayText: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  currentEntity: VocabularyItem;
  options: string[];
  correctIndex: number;
  isReverse: boolean;
  displayPrompt: string;
  displaySubPrompt: string;
}

export interface ComparisonResult {
  userInput: string;
  correctAnswer: string;
  mismatchIndex: number;
  prefixMatch: string;
  userChar: string;
  correctChar: string;
}

export interface QuizSessionState {
  isActive: boolean;
  mode: QuizMode;
  title: string;
  totalCount: number;
  remainingCount: number;
  currentQuestion: QuizQuestion | null;
  previousWord: VocabularyItem | null;
  hearts: number;
  maxHearts: number;
  timeLimitSec: number;
  currentTimerProgress: number; // 0.0 to 1.0
  isPaused: boolean;
  isTimerEnabled: boolean;
  isAutoAdvanceEnabled: boolean;
  consecutiveCorrect: number;
  repeatCount: number;
  isAnswerRevealed: boolean;
  selectedIndex: number | null;
  isAnswerCorrect: boolean | null;
  comparisonResult: ComparisonResult | null;
  correctCount: number;
  wrongTotalCount: number;
  isCompleted: boolean;
}

export interface DashboardStats {
  total: number;
  learned: number;
  unlearned: number;
  wrong: number;
  bookmarked: number;
  progressPct: number;
  letterCounts: Record<string, { learned: number; total: number }>;
  groupWords: VocabularyItem[];
}

export type TabType = "home" | "flashcards" | "vocab" | "swift" | "settings";
