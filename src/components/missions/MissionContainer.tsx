import React, { useState, useMemo, useRef } from 'react';
import { DifficultyLevel, MissionType } from '../../types/alarm';
import { SpeedTapMission } from './SpeedTapMission';
import { MathBusterMission } from './MathBusterMission';
import { ColorSequenceMission } from './ColorSequenceMission';
import { Layers } from 'lucide-react';

interface MissionContainerProps {
  missionType: MissionType;
  difficulty: DifficultyLevel;
  onSuccess: (finalMissionType: string, durationSeconds: number) => void;
}

export const MissionContainer: React.FC<MissionContainerProps> = ({
  missionType,
  difficulty,
  onSuccess,
}) => {
  // If random, select one concrete game at initialization
  const resolvedMission = useMemo<MissionType>(() => {
    if (missionType === 'random') {
      const pool: MissionType[] = ['speed_tap', 'math_buster', 'color_sequence'];
      const picked = pool[Math.floor(Math.random() * pool.length)];
      return picked;
    }
    return missionType;
  }, [missionType]);

  // For Boss Rush: tracks which stage the user is on: 0 (Speed Tap) -> 1 (Math Buster) -> 2 (Color Sequence)
  const [bossRushStage, setBossRushStage] = useState(0);
  const totalStartTimeRef = useRef(Date.now());

  const handleSubGameComplete = (subDuration: number) => {
    if (resolvedMission === 'boss_rush') {
      if (bossRushStage < 2) {
        setBossRushStage((prev) => prev + 1);
      } else {
        // All 3 stages completed!
        const totalDuration = Math.round((Date.now() - totalStartTimeRef.current) / 1000);
        onSuccess('boss_rush', Math.max(subDuration, totalDuration));
      }
    } else {
      onSuccess(resolvedMission, subDuration);
    }
  };

  const currentStageType =
    resolvedMission === 'boss_rush'
      ? bossRushStage === 0
        ? 'speed_tap'
        : bossRushStage === 1
        ? 'math_buster'
        : 'color_sequence'
      : resolvedMission;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Boss Rush Banner if active */}
      {resolvedMission === 'boss_rush' && (
        <div className="w-full max-w-sm mb-3 px-4 py-2 bg-purple-950/40 border border-purple-500/40 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-300 text-xs font-bold">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>極限破曉 BOSS RUSH</span>
          </div>
          <div className="text-xs font-mono font-bold text-amber-400">
            階段 {bossRushStage + 1} / 3
          </div>
        </div>
      )}

      {/* Render Current Mini-Game */}
      {currentStageType === 'speed_tap' && (
        <SpeedTapMission difficulty={difficulty} onComplete={handleSubGameComplete} />
      )}
      {currentStageType === 'math_buster' && (
        <MathBusterMission difficulty={difficulty} onComplete={handleSubGameComplete} />
      )}
      {currentStageType === 'color_sequence' && (
        <ColorSequenceMission difficulty={difficulty} onComplete={handleSubGameComplete} />
      )}
    </div>
  );
};
