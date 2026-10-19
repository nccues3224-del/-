import React from 'react';
import { X, Award, CheckCircle2, Lock, Flame, Zap, Brain, Palette, Trophy, Crown, Sun, ShieldCheck } from 'lucide-react';
import { ALL_BADGES } from '../services/storage';

interface BadgesModalProps {
  unlockedBadgeIds: string[];
  onClose: () => void;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({ unlockedBadgeIds, onClose }) => {
  const unlockedSet = new Set(unlockedBadgeIds);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'Brain':
        return <Brain className="w-5 h-5 text-indigo-400" />;
      case 'Palette':
        return <Palette className="w-5 h-5 text-cyan-400" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-purple-400" />;
      case 'Crown':
        return <Crown className="w-5 h-5 text-amber-300" />;
      default:
        return <Award className="w-5 h-5 text-cyan-400" />;
    }
  };

  const unlockedCount = unlockedSet.size;
  const totalCount = ALL_BADGES.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">英雄成就殿堂</h2>
              <p className="text-xs text-slate-400">
                已解鎖 {unlockedCount} / {totalCount} 個榮譽徽章
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 overflow-y-auto pr-1 flex-1 py-1">
          {ALL_BADGES.map((badge) => {
            const isUnlocked = unlockedSet.has(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                  isUnlocked
                    ? 'bg-slate-950/80 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.06)]'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${
                    isUnlocked
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-slate-900 border-slate-800 text-slate-600'
                  }`}
                >
                  {isUnlocked ? (
                    getBadgeIcon(badge.icon)
                  ) : (
                    <Lock className="w-5 h-5 text-slate-600" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-sm font-bold ${
                        isUnlocked ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {badge.title}
                    </h4>
                    {isUnlocked && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">
                    {badge.description}
                  </p>
                  <div className="mt-2 text-[10px] font-mono text-slate-500">
                    條件：{badge.requirement}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-2 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            返回晨間主控台
          </button>
        </div>
      </div>
    </div>
  );
};
