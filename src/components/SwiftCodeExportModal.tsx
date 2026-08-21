import React, { useState } from "react";
import { Code2, Copy, Check, Download, FileCode, Apple, Sparkles } from "lucide-react";
import { soundFx } from "../utils/soundEffects";
import { IOSSegmentedControl } from "./ios/IOSSegmentedControl";

export function SwiftCodeExportModal() {
  const [activeFile, setActiveFile] = useState<"App" | "Model" | "ViewModel" | "Views" | "TTS">("App");
  const [copied, setCopied] = useState(false);

  const swiftFiles: Record<"App" | "Model" | "ViewModel" | "Views" | "TTS", { filename: string; code: string }> = {
    App: {
      filename: "VocabTrainerApp.swift",
      code: `//
//  VocabTrainerApp.swift
//  VocabTrainer
//
//  Ported from Android (app-e) to Native iOS (SwiftUI + SwiftData)
//

import SwiftUI
import SwiftData

@main
struct VocabTrainerApp: App {
    var sharedModelContainer: ModelContainer = {
        let schema = Schema([
            VocabularyItem.self,
        ])
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)

        do {
            return try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            fatalError("Could not create ModelContainer: \\(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            MainContentView()
        }
        .modelContainer(sharedModelContainer)
    }
}
`,
    },
    Model: {
      filename: "VocabularyItem.swift",
      code: `//
//  VocabularyItem.swift
//  VocabTrainer
//

import Foundation
import SwiftData

@Model
final class VocabularyItem {
    @Attribute(.unique) var word: String
    var translation: String
    var ipa: String
    var learned: Bool
    var isBookmarked: Bool
    var wrongCount: Int
    var consecutiveCorrect: Int
    var createdAt: Date

    init(
        word: String,
        translation: String,
        ipa: String = "",
        learned: Bool = false,
        isBookmarked: Bool = false,
        wrongCount: Int = 0,
        consecutiveCorrect: Int = 0,
        createdAt: Date = Date()
    ) {
        self.word = word
        self.translation = translation
        self.ipa = ipa
        self.learned = learned
        self.isBookmarked = isBookmarked
        self.wrongCount = wrongCount
        self.consecutiveCorrect = consecutiveCorrect
        self.createdAt = createdAt
    }
}

enum QuizMode: String, CaseIterable, Identifiable {
    case groupNormal = "📚 Học từ vựng"
    case groupHard = "💪 Chế độ Khó"
    case groupReverse = "🔀 Chế độ Ngược"
    case randomBalanced = "🎲 Ngẫu nhiên 100"
    case wrongReview = "🔄 Ôn tập từ sai"
    case markedCheck = "⭐ Từ đánh dấu"
    case fullReview = "📖 Review Toàn bộ"

    var id: String { self.rawValue }
}

struct QuizQuestion: Identifiable {
    let id = UUID()
    let targetWord: VocabularyItem
    let questionPrompt: String
    let subPrompt: String
    let options: [String]
    let correctIndex: Int
    let isReverse: Bool
}

struct ComparisonAnalysis {
    let userInput: String
    let correctAnswer: String
    let mismatchIndex: Int
    let userChar: String
    let correctChar: String
    let prefixMatch: String
}
`,
    },
    ViewModel: {
      filename: "VocabQuizViewModel.swift",
      code: `//
//  VocabQuizViewModel.swift
//  VocabTrainer
//

import SwiftUI
import SwiftData
import AVFoundation

@Observable
final class VocabQuizViewModel {
    var quizActive: Bool = false
    var currentQuestion: QuizQuestion?
    var queue: [VocabularyItem] = []
    var retryQueue: [VocabularyItem] = []
    
    var hearts: Int = 3
    let maxHearts: Int = 3
    var timerProgress: Double = 1.0
    var isPaused: Bool = false
    var isTimerEnabled: Bool = true
    var isAutoAdvanceEnabled: Bool = true
    var isAnswerRevealed: Bool = false
    var selectedIndex: Int?
    var isAnswerCorrect: Bool?
    var comparisonResult: ComparisonAnalysis?
    
    var consecutiveCorrect: Int = 0
    var repeatCount: Int = 0
    var speechRate: Float = AVSpeechUtteranceDefaultSpeechRate
    
    func startQuiz(items: [VocabularyItem], mode: QuizMode, isReverse: Bool) {
        guard !items.isEmpty else { return }
        queue = items.shuffled()
        retryQueue = []
        hearts = 3
        quizActive = true
        loadNextQuestion(mode: mode, isReverse: isReverse, allItems: items)
    }
    
    func loadNextQuestion(mode: QuizMode, isReverse: Bool, allItems: [VocabularyItem]) {
        if queue.isEmpty && !retryQueue.isEmpty && mode == .wrongReview {
            queue = retryQueue.shuffled()
            retryQueue.removeAll()
        }
        
        guard let nextItem = queue.first else {
            quizActive = false
            return
        }
        queue.removeFirst()
        
        // Build options
        let otherWords = allItems.filter { $0.word != nextItem.word }
        let distractors = otherWords.shuffled().prefix(3)
        
        if isReverse {
            var choices = [nextItem.translation] + distractors.map { $0.translation }
            choices.shuffle()
            let correctIdx = choices.firstIndex(of: nextItem.translation) ?? 0
            
            let prompt = nextItem.ipa.isEmpty ? nextItem.word : "\\(nextItem.ipa) = \\(nextItem.word)"
            currentQuestion = QuizQuestion(
                targetWord: nextItem,
                questionPrompt: prompt,
                subPrompt: "Chọn nghĩa tiếng Việt đúng:",
                options: choices,
                correctIndex: correctIdx,
                isReverse: true
            )
        } else {
            var choices = [nextItem.word] + distractors.map { $0.word }
            choices.shuffle()
            let correctIdx = choices.firstIndex(of: nextItem.word) ?? 0
            
            let formattedChoices = choices.map { w in
                if let match = allItems.first(where: { $0.word == w }), !match.ipa.isEmpty {
                    return "\\(match.ipa) = \\(w)"
                }
                return w
            }
            
            currentQuestion = QuizQuestion(
                targetWord: nextItem,
                questionPrompt: nextItem.translation,
                subPrompt: "Chọn từ tiếng Anh tương ứng:",
                options: formattedChoices,
                correctIndex: correctIdx,
                isReverse: false
            )
        }
        
        isAnswerRevealed = false
        selectedIndex = nil
        isAnswerCorrect = nil
        timerProgress = 1.0
        comparisonResult = nil
    }
    
    func submitChoice(index: Int) {
        guard let q = currentQuestion, !isAnswerRevealed else { return }
        selectedIndex = index
        let correct = (index == q.correctIndex)
        isAnswerCorrect = correct
        isAnswerRevealed = true
        
        if !correct {
            hearts = max(0, hearts - 1)
            q.targetWord.wrongCount += 1
        } else {
            q.targetWord.learned = true
        }
    }
    
    func submitSpelling(text: String) {
        guard let q = currentQuestion, !isAnswerRevealed else { return }
        let target = q.targetWord.word.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
        let typed = text.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
        
        if target == typed {
            isAnswerCorrect = true
            isAnswerRevealed = true
            q.targetWord.learned = true
        } else {
            isAnswerCorrect = false
            isAnswerRevealed = true
            hearts = max(0, hearts - 1)
            q.targetWord.wrongCount += 1
            
            // Analyze mismatch
            let maxLen = max(typed.count, target.count)
            var diffIdx = 0
            for i in 0..<maxLen {
                let uChar = i < typed.count ? String(typed[typed.index(typed.startIndex, offsetBy: i)]) : ""
                let cChar = i < target.count ? String(target[target.index(target.startIndex, offsetBy: i)]) : ""
                if uChar != cChar {
                    diffIdx = i
                    break
                }
            }
            comparisonResult = ComparisonAnalysis(
                userInput: text,
                correctAnswer: q.targetWord.word,
                mismatchIndex: diffIdx,
                userChar: diffIdx < typed.count ? String(typed[typed.index(typed.startIndex, offsetBy: diffIdx)]) : "(thiếu)",
                correctChar: diffIdx < target.count ? String(target[target.index(target.startIndex, offsetBy: diffIdx)]) : "(thừa)",
                prefixMatch: String(target.prefix(diffIdx))
            )
        }
    }
}
`,
    },
    Views: {
      filename: "MainContentView.swift",
      code: `//
//  MainContentView.swift
//  VocabTrainer
//

import SwiftUI
import SwiftData

struct MainContentView: View {
    @Environment(\\.modelContext) private var modelContext
    @Query(sort: \\VocabularyItem.word) private var allVocab: [VocabularyItem]
    
    @State private var selectedGroup: String = "A"
    @State private var selectedTab: Int = 0
    @State private var isHardMode: Bool = false
    @State private var isReverseMode: Bool = false
    @State private var viewModel = VocabQuizViewModel()
    
    let alphabet = Array("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map { String($0) }
    
    var body: some View {
        TabView(selection: $selectedTab) {
            NavigationStack {
                ScrollView {
                    VStack(spacing: 16) {
                        // Header Stats Card
                        VStack(alignment: .leading, spacing: 8) {
                            Text("VOCAB TRAINER IOS")
                                .font(.caption.bold())
                                .foregroundColor(.blue)
                            Text("Luyện Từ Vựng A-Z")
                                .font(.title2.bold())
                            
                            ProgressView(value: Double(allVocab.filter(\\.learned).count), total: Double(max(1, allVocab.count)))
                                .tint(.green)
                        }
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color(.secondarySystemBackground))
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        
                        // Alphabet Group Picker
                        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 6), count: 6), spacing: 6) {
                            ForEach(alphabet, id: \\.self) { letter in
                                let count = allVocab.filter { $0.word.uppercased().hasPrefix(letter) }.count
                                Button {
                                    selectedGroup = letter
                                } label: {
                                    VStack(spacing: 2) {
                                        Text(letter).font(.headline.bold())
                                        Text("\\(count)").font(.caption2)
                                    }
                                    .frame(maxWidth: .infinity, minHeight: 44)
                                    .background(selectedGroup == letter ? Color.blue : Color(.tertiarySystemBackground))
                                    .foregroundColor(selectedGroup == letter ? .white : .primary)
                                    .clipShape(RoundedRectangle(cornerRadius: 10))
                                }
                            }
                        }
                        
                        // Action Buttons
                        let groupItems = allVocab.filter { $0.word.uppercased().hasPrefix(selectedGroup) }
                        Button("Học Nhóm \\(selectedGroup) (\\(groupItems.count) từ)") {
                            viewModel.startQuiz(items: groupItems, mode: .groupNormal, isReverse: isReverseMode)
                        }
                        .buttonStyle(.borderedProminent)
                        .controlSize(.large)
                        .frame(maxWidth: .infinity)
                    }
                    .padding()
                }
                .navigationTitle("Luyện Tập")
            }
            .tabItem {
                Label("Luyện Tập", systemImage: "book.fill")
            }
            .tag(0)
            
            // Vocab List Tab
            NavigationStack {
                List {
                    ForEach(allVocab) { item in
                        HStack {
                            VStack(alignment: .leading) {
                                Text(item.word).font(.headline)
                                Text(item.translation).font(.subheadline).foregroundColor(.secondary)
                            }
                            Spacer()
                            if !item.ipa.isEmpty {
                                Text(item.ipa).font(.caption.monospaced()).foregroundColor(.blue)
                            }
                        }
                    }
                }
                .navigationTitle("Kho Từ (\\(allVocab.count))")
            }
            .tabItem {
                Label("Kho Từ", systemImage: "character.book.closed.fill")
            }
            .tag(1)
        }
        .fullScreenCover(isPresented: $viewModel.quizActive) {
            IOSQuizView(viewModel: viewModel)
        }
    }
}

struct IOSQuizView: View {
    @Bindable var viewModel: VocabQuizViewModel
    @Environment(\\.dismiss) private var dismiss
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                // Hearts bar
                HStack {
                    ForEach(0..<viewModel.maxHearts, id: \\.self) { idx in
                        Image(systemName: idx < viewModel.hearts ? "heart.fill" : "heart")
                            .foregroundColor(idx < viewModel.hearts ? .red : .secondary)
                    }
                    Spacer()
                    Button("Thoát") {
                        dismiss()
                    }
                }
                .padding(.horizontal)
                
                if let q = viewModel.currentQuestion {
                    Text(q.subPrompt).font(.caption.bold()).foregroundColor(.blue)
                    Text(q.questionPrompt).font(.largeTitle.bold())
                    
                    VStack(spacing: 12) {
                        ForEach(Array(q.options.enumerated()), id: \\.offset) { idx, option in
                            Button {
                                viewModel.submitChoice(index: idx)
                            } label: {
                                Text(option)
                                    .frame(maxWidth: .infinity, minHeight: 50)
                                    .background(Color(.secondarySystemBackground))
                                    .clipShape(RoundedRectangle(cornerRadius: 12))
                            }
                        }
                    }
                    .padding()
                }
                Spacer()
            }
        }
    }
}
`,
    },
    TTS: {
      filename: "SpeechSynthesizerHelper.swift",
      code: `//
//  SpeechSynthesizerHelper.swift
//  VocabTrainer
//

import AVFoundation

final class SpeechSynthesizerHelper: NSObject, AVSpeechSynthesizerDelegate {
    static let shared = SpeechSynthesizerHelper()
    private let synthesizer = AVSpeechSynthesizer()
    
    private override init() {
        super.init()
        synthesizer.delegate = self
    }
    
    func speak(text: String, rate: Float = AVSpeechUtteranceDefaultSpeechRate) {
        let clean = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !clean.isEmpty else { return }
        
        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
        }
        
        let utterance = AVSpeechUtterance(string: clean)
        utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
        utterance.rate = rate
        utterance.pitchMultiplier = 1.0
        
        synthesizer.speak(utterance)
    }
    
    func stop() {
        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
        }
    }
}
`,
    },
  };

  const currentFileData = swiftFiles[activeFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFileData.code);
    soundFx.playCorrect();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    soundFx.playTap();
    const blob = new Blob([currentFileData.code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentFileData.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="swift-code-export-view" className="space-y-4 pb-24 select-none">
      {/* Header Banner */}
      <div className="bg-zinc-900 text-white rounded-3xl p-5 shadow-lg border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-2xl bg-zinc-800 flex items-center justify-center text-blue-400">
              <Apple className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center space-x-1.5">
                <span>Native Swift & SwiftUI Codebase</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 font-mono px-2 py-0.5 rounded-full border border-blue-400/30">
                  Xcode 16 Ready
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Toàn bộ mã nguồn Swift thuần túy được chuyển đổi từ Android app-e
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-zinc-800/80 rounded-2xl text-xs text-zinc-300 space-y-1 border border-zinc-700/60">
          <p className="font-semibold text-blue-300 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hướng dẫn mở trên Xcode (macOS / iPad Swift Playgrounds):</span>
          </p>
          <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-zinc-400">
            <li>Tạo Xcode project mới: <strong>iOS &gt; App &gt; SwiftUI + SwiftData</strong></li>
            <li>Sao chép từng tệp mã nguồn tương ứng vào dự án</li>
            <li>Kéo tệp <code>default_vocab.json</code> vào thư mục Assets của Xcode</li>
            <li>Bấm <strong>Command + R</strong> để chạy ngay trên iPhone Simulator hoặc thiết bị thật!</li>
          </ol>
        </div>
      </div>

      {/* File Selector Tabs */}
      <div className="bg-white rounded-3xl p-3 border border-zinc-200/80 shadow-xs">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
          {(["App", "Model", "ViewModel", "Views", "TTS"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                soundFx.playTap();
                setActiveFile(tab);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 transition-all flex-shrink-0 ${
                activeFile === tab
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{swiftFiles[tab].filename}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Code Editor / Viewer Box */}
      <div className="bg-zinc-950 rounded-3xl overflow-hidden shadow-lg border border-zinc-800">
        {/* Code Bar */}
        <div className="bg-zinc-900 px-4 py-2.5 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs font-mono text-zinc-300 font-semibold pl-2">
              {currentFileData.filename}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Đã chép!" : "Sao chép"}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải .swift</span>
            </button>
          </div>
        </div>

        {/* Code View Area */}
        <div className="p-4 max-h-96 overflow-y-auto overflow-x-auto font-mono text-xs text-zinc-300 leading-relaxed bg-zinc-950">
          <pre className="select-text whitespace-pre">{currentFileData.code}</pre>
        </div>
      </div>
    </div>
  );
}
