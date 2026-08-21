import React, { useRef } from "react";
import {
  Settings,
  Volume2,
  Clock,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  ShieldAlert,
  Info,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { AppSettings } from "../utils/storage";
import { VocabularyItem } from "../types";
import { soundFx } from "../utils/soundEffects";
import { IOSSwitch } from "./ios/IOSSwitch";
import { IOSSegmentedControl } from "./ios/IOSSegmentedControl";

interface SettingsModalProps {
  settings: AppSettings;
  vocabularies: VocabularyItem[];
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetProgress: () => void;
  onRestoreBackup: (items: VocabularyItem[]) => void;
}

export function SettingsModal({
  settings,
  vocabularies,
  onUpdateSettings,
  onResetProgress,
  onRestoreBackup,
}: SettingsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    soundFx.playTap();
    const dataStr = JSON.stringify(vocabularies, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vocab_trainer_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onRestoreBackup(parsed);
          soundFx.playSuccess();
          alert(`Đã khôi phục thành công ${parsed.length} từ vựng từ tệp sao lưu!`);
        } else {
          alert("Tệp JSON không đúng định dạng danh sách từ vựng.");
        }
      } catch (err) {
        alert("Lỗi đọc tệp JSON: " + String(err));
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const speechRates = [
    { value: "0.5", label: "0.5x" },
    { value: "0.75", label: "0.75x" },
    { value: "1", label: "1.0x" },
    { value: "1.25", label: "1.25x" },
    { value: "1.5", label: "1.5x" },
  ];

  const timeLimits = [
    { value: "4", label: "4s" },
    { value: "6", label: "6s" },
    { value: "8", label: "8s" },
    { value: "10", label: "10s (Chuẩn)" },
    { value: "15", label: "15s" },
  ];

  return (
    <div id="settings-view" className="space-y-4 pb-24 select-none">
      {/* Audio / Voice Pronunciation Section */}
      <div className="bg-zinc-900/90 rounded-3xl p-5 border border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-blue-950/80 border border-blue-800/60 text-blue-400 flex items-center justify-center">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Âm Thanh & Phát Âm</h3>
            <p className="text-xs text-zinc-400">Tốc độ đọc giọng bản xứ US/UK</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Tốc độ phát âm:
          </label>
          <IOSSegmentedControl
            options={speechRates}
            value={settings.speechRate.toString()}
            onChange={(val) => onUpdateSettings({ speechRate: parseFloat(val) })}
            size="sm"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <div>
            <div className="text-xs font-semibold text-zinc-200">Hiệu ứng âm thanh tương tác</div>
            <div className="text-[11px] text-zinc-400">Âm thanh khi trả lời đúng, sai, hoàn thành</div>
          </div>
          <IOSSwitch
            id="switch-sound-fx"
            checked={settings.soundEffectsEnabled}
            onChange={(val) => onUpdateSettings({ soundEffectsEnabled: val })}
          />
        </div>
      </div>

      {/* Quiz Timing & Auto Advance */}
      <div className="bg-zinc-900/90 rounded-3xl p-5 border border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-800/60 text-purple-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Cấu Hình Bài Luyện (Mặc định 10s)</h3>
            <p className="text-xs text-zinc-400">Thời gian đếm ngược và quy tắc kiểm tra</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Thời gian mỗi câu hỏi:
          </label>
          <IOSSegmentedControl
            options={timeLimits}
            value={Math.round(settings.timeLimitSec).toString()}
            onChange={(val) => onUpdateSettings({ timeLimitSec: parseInt(val, 10) })}
            size="sm"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <div>
            <div className="text-xs font-semibold text-zinc-200">Bật đồng hồ đếm ngược</div>
            <div className="text-[11px] text-zinc-400">Giới hạn thời gian suy nghĩ</div>
          </div>
          <IOSSwitch
            id="switch-settings-timer"
            checked={settings.isTimerEnabled}
            onChange={(val) => onUpdateSettings({ isTimerEnabled: val })}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <div>
            <div className="text-xs font-semibold text-zinc-200">Tự động chuyển câu</div>
            <div className="text-[11px] text-zinc-400">Tự sang câu kế sau khi giải đáp</div>
          </div>
          <IOSSwitch
            id="switch-settings-auto-advance"
            checked={settings.isAutoAdvanceEnabled}
            onChange={(val) => onUpdateSettings({ isAutoAdvanceEnabled: val })}
          />
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="bg-zinc-900/90 rounded-3xl p-5 border border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center justify-center">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Sao Lưu & Khôi Phục</h3>
            <p className="text-xs text-zinc-400">Xuất hoặc nhập kho từ vựng cá nhân</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleExportJSON}
            className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-750 active:scale-95 text-zinc-200 font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Xuất tệp JSON</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-750 active:scale-95 text-zinc-200 font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all"
          >
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Nhập tệp JSON</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            className="hidden"
          />
        </div>
      </div>

      {/* Reset Progress */}
      <div className="bg-zinc-900/90 rounded-3xl p-5 border border-red-900/50 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-red-400">
          <ShieldAlert className="w-5 h-5" />
          <h3 className="text-sm font-bold tracking-tight">Đặt Lại Tiến Độ Học</h3>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Xóa toàn bộ trạng thái "Đã thuộc", "Đánh dấu sao" và lịch sử làm sai của các từ để học lại từ đầu. Kho từ vựng của bạn vẫn được giữ nguyên.
        </p>

        <button
          id="btn-reset-progress"
          onClick={() => {
            if (window.confirm("Bạn có chắc chắn muốn đặt lại toàn bộ tiến độ học về 0%?")) {
              soundFx.playWrong();
              onResetProgress();
              alert("Đã đặt lại toàn bộ tiến độ thành công!");
            }
          }}
          className="w-full py-2.5 bg-red-950/60 hover:bg-red-900/60 text-red-300 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 border border-red-800/60 transition-all active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Đặt lại tiến độ học tập</span>
        </button>
      </div>

      {/* App Info Footer */}
      <div className="text-center pt-2 text-xs text-zinc-500 space-y-1">
        <p className="font-semibold text-zinc-400">Vocab Trainer iOS v1.0.0 (Giao diện Tối Mặc Định)</p>
        <p>Tương thích chuẩn iOS Human Interface Guidelines &amp; SwiftUI</p>
      </div>
    </div>
  );
}

