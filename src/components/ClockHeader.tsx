import React, { useState, useEffect } from 'react';
import { Clock, Bell, BellOff, Volume2, VolumeX, Sparkles, Play } from 'lucide-react';
import { AlarmConfig } from '../types/alarm';
import { soundEngine } from '../services/soundEngine';

interface ClockHeaderProps {
  activeAlarm: AlarmConfig | null;
  onTestAlarm: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const ClockHeader: React.FC<ClockHeaderProps> = ({
  activeAlarm,
  onTestAlarm,
  isMuted,
  onToggleMute,
}) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const dateStr = now.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  // Calculate countdown to active alarm
  const getCountdownString = (): string | null => {
    if (!activeAlarm || !activeAlarm.enabled) return null;

    const [alarmH, alarmM] = activeAlarm.time.split(':').map(Number);
    const target = new Date(now);
    target.setHours(alarmH, alarmM, 0, 0);

    // If alarm time is earlier today, target is tomorrow
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }

    const diffMs = target.getTime() - now.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const h = Math.floor(diffSec / 3600);
    const m = Math.floor((diffSec % 3600) / 60);
    const s = diffSec % 60;

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const countdown = getCountdownString();

  return (
    <div className="w-full relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-800 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Real-time Clock display */}
        <div className="text-center md:text-left">
          <div className="text-xs sm:text-sm font-semibold tracking-wide text-cyan-400/90 mb-1 flex items-center justify-center md:justify-start gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>{dateStr}</span>
          </div>

          <div className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-white font-mono tabular-nums flex items-baseline justify-center md:justify-start">
            <span>{hours}</span>
            <span className="text-cyan-400 animate-pulse px-1">:</span>
            <span>{minutes}</span>
            <span className="text-cyan-400 animate-pulse px-1">:</span>
            <span className="text-slate-400 text-3xl sm:text-4xl md:text-5xl font-semibold">
              {seconds}
            </span>
          </div>

          {/* Alarm Status & Countdown */}
          <div className="mt-2.5 flex items-center justify-center md:justify-start gap-2 text-xs sm:text-sm">
            {activeAlarm && activeAlarm.enabled ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400">
                <Bell className="w-3.5 h-3.5" />
                <span>鬧鐘已設定：{activeAlarm.time}</span>
                <span className="text-emerald-500/50">·</span>
                <span className="font-mono tabular-nums text-emerald-300">
                  倒數 {countdown}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/80 border border-slate-700/80 rounded-full text-slate-400">
                <BellOff className="w-3.5 h-3.5" />
                <span>鬧鐘未開啟</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Sound Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Mute Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${
              isMuted
                ? 'bg-rose-950/40 border-rose-800 text-rose-400 hover:bg-rose-900/50'
                : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
            title={isMuted ? '取消靜音' : '靜音音效'}
            aria-label={isMuted ? '取消靜音' : '靜音音效'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
          </button>

          {/* Instant Test Alarm Button */}
          <button
            type="button"
            onClick={onTestAlarm}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-rose-950/50 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>立即模擬響鈴</span>
            <Sparkles className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      </div>
    </div>
  );
};
