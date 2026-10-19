import React, { useState } from 'react';
import { Zap, Brain, Palette, Dumbbell, Sparkles } from 'lucide-react';
import { DifficultyLevel, MissionType } from '../types/alarm';
import { SpeedTapMission } from './missions/SpeedTapMission';
import { MathBusterMission } from './missions/MathBusterMission';
import { ColorSequenceMission } from './missions/ColorSequenceMission';
import { soundEngine } from '../services/soundEngine';

interface MissionsPracticeProps {
  onEarnPracticeXp?: (xp: number) => void;
}

export const MissionsPractice: React.FC<MissionsPracticeProps> = ({ onEarnPracticeXp }) => {
  const [selectedGame, setSelectedGame] = useState<'speed_tap' | 'math_buster' | 'color_sequence'>('speed_tap');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('normal');
  const [lastScore, setLastScore] = useState<{ duration: number; game: string } | null>(null);

  const handleGameComplete = (duration: number) => {
    soundEngine.playFanfare();
    setLastScore({ duration, game: selectedGame });
    if (onEarnPracticeXp) {
      onEarnPracticeXp(25); // 25 practice XP bonus
    }
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>晨間任務訓練道館</span>
              <span className="text-[10px] font-bold text-purple-300 bg-purple-950/80 border border-purple-700/60 px-2 py-0.5 rounded-full">
                自由演練
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              隨時預演晨間解鎖關卡，鍛鍊反射神經與心算敏銳度
            </p>
          </div>
        </div>

        {/* Game Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              soundEngine.playTap();
              setSelectedGame('speed_tap');
              setLastScore(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              selectedGame === 'speed_tap'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>快速點擊</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playTap();
              setSelectedGame('math_buster');
              setLastScore(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              selectedGame === 'math_buster'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>心算專注</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playTap();
              setSelectedGame('color_sequence');
              setLastScore(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              selectedGame === 'color_sequence'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>色彩記憶</span>
          </button>
        </div>
      </div>

      {/* Training Playground Container */}
      <div className="mt-6 flex flex-col items-center">
        {lastScore && (
          <div className="mb-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>
              演練完成！耗時 {lastScore.duration} 秒 · 獲得演練獎勵 +25 XP
            </span>
          </div>
        )}

        <div className="w-full max-w-md bg-slate-950/60 rounded-2xl p-4 border border-slate-800 shadow-inner">
          {selectedGame === 'speed_tap' && (
            <SpeedTapMission
              key={`speed_${difficulty}_${lastScore?.duration || 0}`}
              difficulty={difficulty}
              onComplete={handleGameComplete}
            />
          )}

          {selectedGame === 'math_buster' && (
            <MathBusterMission
              key={`math_${difficulty}_${lastScore?.duration || 0}`}
              difficulty={difficulty}
              onComplete={handleGameComplete}
            />
          )}

          {selectedGame === 'color_sequence' && (
            <ColorSequenceMission
              key={`color_${difficulty}_${lastScore?.duration || 0}`}
              difficulty={difficulty}
              onComplete={handleGameComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
};
