import React, { useState } from "react";
import { X, Plus, Upload, CheckCircle2, FileText, BookOpen } from "lucide-react";
import { IOSSegmentedControl } from "./ios/IOSSegmentedControl";
import { soundFx } from "../utils/soundEffects";

interface AddImportModalProps {
  onDismiss: () => void;
  onAddWord: (word: string, translation: string, ipa?: string) => void;
  onBulkImport: (rawText: string) => { addedCount: number; updatedCount: number };
}

export function AddImportModal({ onDismiss, onAddWord, onBulkImport }: AddImportModalProps) {
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [ipa, setIpa] = useState("");
  const [singleSuccessMsg, setSingleSuccessMsg] = useState("");

  const [bulkText, setBulkText] = useState("");
  const [bulkResultMsg, setBulkResultMsg] = useState("");

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !translation.trim()) return;

    onAddWord(word.trim(), translation.trim(), ipa.trim());
    soundFx.playCorrect();
    setSingleSuccessMsg(`Đã lưu "${word.trim()}" thành công!`);
    setWord("");
    setTranslation("");
    setIpa("");
    setTimeout(() => setSingleSuccessMsg(""), 3000);
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    const res = onBulkImport(bulkText.trim());
    soundFx.playSuccess();
    setBulkResultMsg(`Thành công: Thêm mới ${res.addedCount} từ, cập nhật ${res.updatedCount} từ.`);
    setBulkText("");
    setTimeout(() => {
      onDismiss();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div
        id="add-import-modal"
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-zinc-200/80 animate-in slide-in-from-bottom duration-200 flex flex-col max-h-[90vh]"
      >
        {/* iOS Drag Handle on Mobile */}
        <div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Modal Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-zinc-100">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Thêm Từ Vựng</h2>
            <p className="text-xs text-zinc-500">Mở rộng kho từ vựng cá nhân của bạn</p>
          </div>
          <button
            onClick={() => {
              soundFx.playTap();
              onDismiss();
            }}
            className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 hover:text-zinc-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 pb-1">
          <IOSSegmentedControl
            options={[
              { value: "single", label: "Thêm từng từ", icon: <Plus className="w-3.5 h-3.5" /> },
              { value: "bulk", label: "Nhập hàng loạt", icon: <Upload className="w-3.5 h-3.5" /> },
            ]}
            value={activeTab}
            onChange={(val) => {
              setActiveTab(val);
              setSingleSuccessMsg("");
              setBulkResultMsg("");
            }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === "single" ? (
            <form onSubmit={handleSingleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Từ tiếng Anh <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-single-word"
                  type="text"
                  required
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder="Ví dụ: persistent, versatile..."
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Nghĩa tiếng Việt <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-single-translation"
                  type="text"
                  required
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value)}
                  placeholder="Ví dụ: kiên trì, linh hoạt..."
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Phiên âm IPA (tùy chọn)
                </label>
                <input
                  id="input-single-ipa"
                  type="text"
                  value={ipa}
                  onChange={(e) => setIpa(e.target.value)}
                  placeholder="Ví dụ: /pəˈsɪs.tənt/"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-mono focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              {singleSuccessMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-medium flex items-center space-x-2 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{singleSuccessMsg}</span>
                </div>
              )}

              <button
                id="btn-save-single-word"
                type="submit"
                disabled={!word.trim() || !translation.trim()}
                className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Lưu Vào Kho Từ</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleBulkSubmit} className="space-y-3">
              {/* Syntax instructions */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 space-y-1.5">
                <div className="font-semibold flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Định dạng hỗ trợ (mỗi dòng một từ):</span>
                </div>
                <ul className="space-y-0.5 text-[11px] font-mono text-zinc-700 pl-1">
                  <li>• <span className="text-blue-700">từ = nghĩa = /phiên âm/</span></li>
                  <li>• <span className="text-blue-700">từ = nghĩa</span></li>
                  <li>• <span className="text-blue-700">từ : nghĩa</span></li>
                  <li>• <span className="text-blue-700">từ [tab] nghĩa</span></li>
                </ul>
              </div>

              <div>
                <textarea
                  id="input-bulk-text"
                  rows={7}
                  required
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`abandon = từ bỏ = /əˈbæn.dən/\nabsolute = tuyệt đối = /ˈæb.sə.luːt/\naccelerate = tăng tốc = /əkˈsel.ə.reɪt/`}
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                />
              </div>

              {bulkResultMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-medium flex items-center space-x-2 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{bulkResultMsg}</span>
                </div>
              )}

              <button
                id="btn-save-bulk-words"
                type="submit"
                disabled={!bulkText.trim()}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Nhập Dữ Liệu Hàng Loạt</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
