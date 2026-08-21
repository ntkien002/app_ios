import { ComparisonResult } from "../types";

export function analyzeSpellingMismatch(userInput: string, correctAnswer: string): ComparisonResult {
  const user = userInput.trim();
  const correct = correctAnswer.trim();
  
  let mismatchIndex = -1;
  const maxLen = Math.max(user.length, correct.length);
  
  for (let i = 0; i < maxLen; i++) {
    const uChar = user[i] || "";
    const cChar = correct[i] || "";
    if (uChar.toLowerCase() !== cChar.toLowerCase()) {
      mismatchIndex = i;
      break;
    }
  }

  if (mismatchIndex === -1 && user.length !== correct.length) {
    mismatchIndex = Math.min(user.length, correct.length);
  }

  const prefixMatch = mismatchIndex > 0 ? correct.slice(0, mismatchIndex) : "";
  const userChar = mismatchIndex < user.length ? user[mismatchIndex] : "(thiếu ký tự)";
  const correctChar = mismatchIndex < correct.length ? correct[mismatchIndex] : "(thừa ký tự)";

  return {
    userInput: user,
    correctAnswer: correct,
    mismatchIndex: mismatchIndex >= 0 ? mismatchIndex : 0,
    prefixMatch,
    userChar,
    correctChar
  };
}
