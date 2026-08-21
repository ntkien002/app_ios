import { VocabularyItem } from "../types";
import defaultVocabData from "../data/default_vocab.json";

const STORAGE_KEY = "vocab_trainer_ios_items_v1";
const SETTINGS_KEY = "vocab_trainer_ios_settings_v1";

export interface AppSettings {
  speechRate: number;
  timeLimitSec: number;
  isTimerEnabled: boolean;
  isAutoAdvanceEnabled: boolean;
  soundEffectsEnabled: boolean;
  hapticsEnabled: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  speechRate: 1.0,
  timeLimitSec: 6.0,
  isTimerEnabled: true,
  isAutoAdvanceEnabled: true,
  soundEffectsEnabled: true,
  hapticsEnabled: true,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error("Failed to load settings:", e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings:", e);
  }
}

export function getInitialVocabulary(): VocabularyItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to read localStorage:", e);
  }

  // Seed from default_vocab.json
  const initialItems: VocabularyItem[] = (defaultVocabData as Array<{
    word: string;
    translation: string;
    ipa?: string;
    learned?: boolean;
  }>).map((entry, idx) => ({
    id: `seed_${idx}_${entry.word.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
    word: entry.word.trim(),
    translation: entry.translation.trim(),
    ipa: entry.ipa?.trim() || "",
    learned: Boolean(entry.learned),
    isBookmarked: false,
    wrongCount: 0,
    consecutiveCorrect: 0,
    createdAt: Date.now() - (defaultVocabData.length - idx) * 1000,
  }));

  saveVocabulary(initialItems);
  return initialItems;
}

export function saveVocabulary(items: VocabularyItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save vocabulary:", e);
  }
}

/**
 * Parses raw text formatted as:
 * - word = translation = /ipa/
 * - word = translation
 * - word : translation
 * - word \t translation
 */
export function parseBulkImportText(rawText: string, currentItems: VocabularyItem[]): {
  newItems: VocabularyItem[];
  updatedCount: number;
  addedCount: number;
} {
  const lines = rawText.split("\n");
  const map = new Map<string, VocabularyItem>();
  
  currentItems.forEach(item => {
    map.set(item.word.toLowerCase().trim(), item);
  });

  let addedCount = 0;
  let updatedCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//")) continue;

    let word = "";
    let translation = "";
    let ipa = "";

    if (trimmed.includes("=")) {
      const parts = trimmed.split("=").map(p => p.trim());
      if (parts.length >= 2) {
        word = parts[0];
        translation = parts[1];
        if (parts.length >= 3) {
          ipa = parts[2];
        }
      }
    } else if (trimmed.includes(":")) {
      const parts = trimmed.split(":").map(p => p.trim());
      if (parts.length >= 2) {
        word = parts[0];
        translation = parts[1];
      }
    } else if (trimmed.includes("\t")) {
      const parts = trimmed.split("\t").map(p => p.trim());
      if (parts.length >= 2) {
        word = parts[0];
        translation = parts[1];
        if (parts.length >= 3) {
          ipa = parts[2];
        }
      }
    }

    if (!word || !translation) continue;

    const key = word.toLowerCase().trim();
    const existing = map.get(key);

    if (existing) {
      map.set(key, {
        ...existing,
        translation: translation || existing.translation,
        ipa: ipa || existing.ipa,
      });
      updatedCount++;
    } else {
      const newItem: VocabularyItem = {
        id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        word: word.trim(),
        translation: translation.trim(),
        ipa: ipa.trim(),
        learned: false,
        isBookmarked: false,
        wrongCount: 0,
        consecutiveCorrect: 0,
        createdAt: Date.now(),
      };
      map.set(key, newItem);
      addedCount++;
    }
  }

  return {
    newItems: Array.from(map.values()),
    addedCount,
    updatedCount,
  };
}
