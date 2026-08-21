import React, { useState, useEffect } from "react";
import { Wifi, BatteryMedium, Signal } from "lucide-react";

export function IOSStatusBar() {
  const [timeStr, setTimeStr] = useState("9:41");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setTimeStr(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div id="ios-status-bar" className="w-full pt-2 pb-1 px-7 flex items-center justify-between text-xs font-semibold text-zinc-100 select-none z-50">
      {/* Left Time */}
      <span className="font-semibold tracking-tight text-[15px] text-white">{timeStr}</span>

      {/* Dynamic Island Pill */}
      <div className="h-6 w-28 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-between px-2.5 shadow-sm">
        <div className="w-2.5 h-2.5 rounded-full bg-black border border-zinc-800 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-blue-400" />
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-zinc-300 font-mono tracking-tighter">iOS</span>
        </div>
      </div>

      {/* Right Icons */}
      <div className="flex items-center space-x-1.5 text-zinc-100">
        <Signal className="w-4 h-4" />
        <Wifi className="w-4 h-4" />
        <div className="flex items-center">
          <BatteryMedium className="w-5 h-5 text-zinc-100" />
        </div>
      </div>
    </div>
  );
}
