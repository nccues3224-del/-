import React, { useState, useEffect, useRef } from 'react';
import { Zap, RotateCcw, Flame } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';
import { DifficultyLevel } from '../../types/alarm';

interface SpeedTapMissionProps {
  difficulty: DifficultyLevel;
  onComplete: (durationSeconds: number) => void;
}

export const SpeedTapMission: React.FC<SpeedTapMissionProps> = ({ difficulty, onComplete }) => {
  const targetTaps = difficulty === 'extreme' ? 35 : difficulty === 'hero' ? 25 : 15;
  const initialTime = 10; // 10 seconds

  const [taps, setTaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [failed, setFailed] = useState(false);
  const [combo, setCombo] = useState(0);
  const [isPressed, setIsPressed] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  // Start timer on first tap
  const handleTap = () => {
    if (failed) return;

    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now();
    }

    const nextTaps = taps + 1;
    setTaps(nextTaps);
    const nextCombo = combo + 1;
    setCombo(nextCombo);

    soundEngine.playCombo(nextCombo);

    // Visual press effect
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 90);

    // Vibration API if mobile device supports it
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch {
        // ignore
      }
    }

    if (nextTaps >= targetTaps) {
      // Completed!
      const elapsed = startTimeRef.current
        ? Math.round((Date.now() - startTimeRef.current) / 1000)
        : initialTime - timeLeft;
      if (timerRef.current) clearInterval(timerRef.current);
      onComplete(Math.max(1, elapsed));
    }
  };

  useEffect(() => {
    if (isRunning && !failed) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0.1) {
            clearInterval(timerRef.current!);
            setFailed(true);
            setIsRunning(false);
            soundEngine.playWrong();
            return 0;
          }
          return +(prev - 0.1).toFixed(1);
        });
      }, 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, failed]);

  const handleRetry = () => {
    setTaps(0);
    setTimeLeft(initialTime);
    setIsRunning(false);
    setFailed(false);
    setCombo(0);
    startTimeRef.current = null;
  };

  const progressPercent = Math.min(100, Math.floor((taps / targetTaps) * 100));
  const timePercent = Math.max(0, (timeLeft / initialTime) * 100);

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto">
      {/* Header Banner */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-semibold tracking-wide uppercase mb-2 border border-amber-500/20">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>任務 A · 快速點擊挑戰</span>
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          10 秒內連擊 {targetTaps} 次以解鎖鬧鐘！
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          {isRunning
            ? `維持節奏！已連擊 ${combo} 次`
            : '點擊下方醒腦衝擊按鈕立即開跑！'}
        </p>
      </div>

      {/* Timer & Progress HUD */}
      <div className="w-full bg-slate-900/80 rounded-xl p-4 border border-slate-800 mb-6 shadow-inner">
        <div className="flex justify-between items-center text-sm font-medium mb-1">
          <span className="text-slate-400">倒數計時</span>
          <span
            className={`font-mono text-base font-bold tabular-nums ${
              timeLeft < 3 ? 'text-rose-500 animate-pulse' : 'text-amber-400'
            }`}
          >
            {timeLeft.toFixed(1)}s
          </span>
        </div>
        {/* Time bar */}
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full transition-all duration-100 ease-linear rounded-full ${
              timeLeft < 3 ? 'bg-rose-500' : 'bg-amber-400'
            }`}
            style={{ width: `${timePercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-sm font-medium mb-1">
          <span className="text-slate-400">連擊進度</span>
          <span className="font-mono text-base font-bold text-cyan-400 tabular-nums">
            {taps} / {targetTaps}
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-75 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Arcade Big Tap Button */}
      {!failed ? (
        <div className="relative my-2">
          {/* Outer glowing pulsing ring */}
          <div
            className={`absolute -inset-4 rounded-full bg-cyan-500/20 blur-xl transition-opacity duration-300 pointer-events-none ${
              isRunning ? 'opacity-100' : 'opacity-40'
            }`}
          />

          <button
            type="button"
            onClick={handleTap}
            className={`relative w-44 h-44 sm:w-52 sm:h-52 rounded-full font-bold select-none cursor-pointer flex flex-col items-center justify-center transition-all transform duration-75 ${
              isPressed
                ? 'scale-95 translate-y-1 shadow-[0_0_15px_rgba(6,182,212,0.8)]'
                : 'shadow-[0_10px_30px_rgba(6,182,212,0.4)] hover:scale-102'
            } ${
              progressPercent >= 80
                ? 'bg-gradient-to-tr from-amber-600 via-rose-500 to-amber-400 text-white'
                : 'bg-gradient-to-tr from-cyan-600 via-blue-600 to-cyan-400 text-white'
            } border-4 border-white/20 active:border-white/40`}
          >
            <Flame
              className={`w-10 h-10 mb-1 transition-transform ${
                isRunning ? 'animate-bounce text-amber-200' : 'text-cyan-100'
              }`}
            />
            <span className="text-3xl font-black tracking-tight font-mono tabular-nums">
              {targetTaps - taps}
            </span>
            <span className="text-xs uppercase tracking-widest text-white/90 mt-1 font-semibold">
              {isRunning ? 'TAP! TAP!' : '點我解鎖'}
            </span>
          </button>
        </div>
      ) : (
        /* Failed State */
        <div className="flex flex-col items-center py-6 text-center animate-fade-in">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-full mb-3 border border-rose-500/20">
            <RotateCcw className="w-8 h-8 animate-spin-reverse" />
          </div>
          <p className="text-rose-400 font-bold text-lg mb-1">時間到！英雄醒腦失敗</p>
          <p className="text-slate-400 text-sm mb-4">賴床惡魔正在逼近，深呼吸再來一次！</p>
          <button
            type="button"
            onClick={handleRetry}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold shadow-lg shadow-rose-900/40 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>重新挑戰連擊</span>
          </button>
        </div>
      )}

      {/* Speed tips */}
      <div className="mt-6 text-xs text-slate-500 text-center flex items-center justify-center gap-1">
        <span>小提示：雙指輪流快速點擊，能以兩倍速突破鬧鐘封印！</span>
      </div>
    </div>
  );
};
