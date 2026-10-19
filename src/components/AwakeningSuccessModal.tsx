import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Flame, Zap, Award, ArrowRight, ShieldCheck } from 'lucide-react';
import { Badge, HeroStats } from '../types/alarm';
import { calculateLevelInfo } from '../services/storage';

interface AwakeningSuccessModalProps {
  xpGained: number;
  durationSeconds: number;
  newLevelUp: boolean;
  unlockedBadges: Badge[];
  profile: HeroStats;
  onClose: () => void;
}

export const AwakeningSuccessModal: React.FC<AwakeningSuccessModalProps> = ({
  xpGained,
  durationSeconds,
  newLevelUp,
  unlockedBadges,
  profile,
  onClose,
}) => {
  const lvlInfo = calculateLevelInfo(profile.xp);

  useEffect(() => {
    // Launch celebratory confetti burst
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#eab308', '#ec4899', '#a855f7'],
      });

      if (newLevelUp) {
        setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 60,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 60,
            origin: { x: 1 },
          });
        }, 300);
      }
    } catch {
      // ignore
    }
  }, [newLevelUp]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-cyan-500/40 p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] text-center overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Level Up Banner if active */}
        {newLevelUp && (
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 text-xs font-black tracking-widest uppercase mb-3 shadow-lg shadow-amber-500/30 animate-bounce">
            <Trophy className="w-3.5 h-3.5" />
            <span>LEVEL UP! 等級晉升</span>
          </div>
        )}

        {/* Victory Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-cyan-500/40">
          <ShieldCheck className="w-9 h-9" />
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight">
          晨間任務突破！鬧鐘已解除
        </h2>
        <p className="text-slate-400 text-sm mt-1 mb-4">
          晨間意志戰勝賴床誘惑，英雄甦醒能量充滿！
        </p>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/90 rounded-2xl p-3 border border-slate-800 mb-5">
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400 flex items-center gap-1 mb-0.5">
              <Zap className="w-3 h-3 text-cyan-400" /> 獲得經驗
            </span>
            <span className="text-lg font-black text-cyan-400 font-mono tabular-nums">
              +{xpGained} XP
            </span>
          </div>
          <div className="flex flex-col items-center border-x border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1 mb-0.5">
              <Flame className="w-3 h-3 text-amber-500" /> 連續早起
            </span>
            <span className="text-lg font-black text-amber-400 font-mono tabular-nums">
              {profile.streakDays} 天
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400 mb-0.5">醒腦耗時</span>
            <span className="text-lg font-black text-slate-200 font-mono tabular-nums">
              {durationSeconds}s
            </span>
          </div>
        </div>

        {/* Hero Level Progress */}
        <div className="bg-slate-900/70 rounded-2xl p-4 border border-slate-800/80 mb-5 text-left">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">當前稱號</span>
              <span className="text-sm font-black text-indigo-300">{lvlInfo.title}</span>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">
              Lv. {lvlInfo.level}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 rounded-full transition-all duration-700"
              style={{ width: `${lvlInfo.progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
            <span>{lvlInfo.currentLevelXp} XP</span>
            <span>下一級需 {lvlInfo.nextLevelXp} XP</span>
          </div>
        </div>

        {/* Unlocked Badges if any */}
        {unlockedBadges.length > 0 && (
          <div className="mb-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>解鎖新成就徽章！</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {unlockedBadges.map((b) => (
                <div
                  key={b.id}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center gap-1"
                >
                  <span>🏆 {b.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Claim & Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-cyan-900/50 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>開啟美好的一天！</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
