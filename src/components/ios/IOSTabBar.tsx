import React from "react";
import { BookOpen, Layers, Library, Code2, Settings } from "lucide-react";
import { TabType } from "../../types";
import { soundFx } from "../../utils/soundEffects";

interface IOSTabBarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  vocabCount: number;
}

export function IOSTabBar({ activeTab, onChangeTab, vocabCount }: IOSTabBarProps) {
  const tabs: Array<{
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
  }> = [
    { id: "home", label: "Luyện Tập", icon: BookOpen },
    { id: "flashcards", label: "Flashcards", icon: Layers },
    { id: "vocab", label: "Kho Từ", icon: Library, badge: vocabCount },
    { id: "swift", label: "Mã Swift", icon: Code2 },
    { id: "settings", label: "Cài Đặt", icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/80 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5 h-16">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              id={`ios-tab-${t.id}`}
              onClick={() => {
                soundFx.playTap();
                onChangeTab(t.id);
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative group select-none ${
                isActive ? "text-blue-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-transform ${
                    isActive ? "scale-105 stroke-[2.4]" : "stroke-[1.8]"
                  }`}
                />
                {t.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-3 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-zinc-950">
                    {typeof t.badge === "number" && t.badge > 999 ? "999+" : t.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-0.5 ${
                  isActive ? "font-semibold text-blue-400" : "text-zinc-400"
                }`}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* iOS Home Indicator Bar */}
      <div className="w-32 h-1 bg-zinc-700 rounded-full mx-auto mb-1 opacity-70" />
    </div>
  );
}
