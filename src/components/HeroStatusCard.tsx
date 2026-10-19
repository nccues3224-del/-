import React from 'react';
import { Award, Flame, Zap, Shield, ChevronRight, CheckCircle2 } from 'lucide-react';
import { HeroStats } from '../types/alarm';
import { calculateLevelInfo } from '../services/storage';

interface HeroStatusCardProps {
  profile: HeroStats;
  onOpenBadges: () => void;
}

export const HeroStatusCard: React.FC<HeroStatusCardProps> = ({ profile, onOpenBadges }) => {
  const lvlInfo = calculateLevelInfo(profile.xp);

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-5 md:p-6 backdrop-blur-xl relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Left: Avatar & Title */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-950">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-md text-[10px] font-black text-slate-950 font-mono">
              Lv.{lvlInfo.level}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">{lvlInfo.title}</h3>
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                等級 {lvlInfo.level}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              晨間英雄養成 · 解除鬧鐘賺取戰功 XP
            </p>
          </div>
        </div>

        {/* Center: XP Progress Bar */}
        <div className="w-full md:max-w-xs flex-1">
          <div className="flex justify-between items-center text-xs font-medium mb-1.5">
            <span className="text-slate-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>經驗值累積</span>
            </span>
            <span className="text-cyan-400 font-mono font-bold tabular-nums">
              {lvlInfo.currentLevelXp} / {lvlInfo.nextLevelXp} XP ({lvlInfo.progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${lvlInfo.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Right: Quick Stats & Badges Trigger */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
          {/* Streak */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5 fill-amber-500/30" />
            </div>
            <div>
              <div className="text-xs text-slate-400">連鎖早起</div>
              <div className="text-base font-black text-amber-400 font-mono tabular-nums">
                {profile.streakDays} 天
              </div>
            </div>
          </div>

          {/* Cleared Count */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">醒腦勝率</div>
              <div className="text-base font-black text-emerald-400 font-mono tabular-nums">
                {profile.totalMissionsCleared} 次
              </div>
            </div>
          </div>

          {/* Badges Button */}
          <button
            type="button"
            onClick={onOpenBadges}
            className="flex items-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">成就徽章</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
