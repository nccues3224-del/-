import React, { useEffect } from 'react';
import { BellRing, Clock, AlertTriangle, Moon } from 'lucide-react';
import { AlarmConfig, DifficultyLevel, MissionType } from '../types/alarm';
import { soundEngine } from '../services/soundEngine';
import { MissionContainer } from './missions/MissionContainer';

interface AlarmRingerModalProps {
  alarm: AlarmConfig;
  currentTimeStr: string;
  isTestMode?: boolean;
  onMissionSuccess: (missionType: string, durationSeconds: number) => void;
  onSnooze?: () => void;
}

export const AlarmRingerModal: React.FC<AlarmRingerModalProps> = ({
  alarm,
  currentTimeStr,
  isTestMode = false,
  onMissionSuccess,
  onSnooze,
}) => {
  // Start looping alarm sound immediately upon mount
  useEffect(() => {
    soundEngine.unlockAudio();
    soundEngine.startAlarm(alarm.sound, alarm.volume);

    // Vibration on mobile devices
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([400, 200, 400, 200, 800]);
      } catch {
        // ignore
      }
    }

    return () => {
      soundEngine.stopAlarm();
    };
  }, [alarm.sound, alarm.volume]);

  const handleSuccess = (finalMissionType: string, durationSeconds: number) => {
    soundEngine.stopAlarm();
    soundEngine.playFanfare();
    onMissionSuccess(finalMissionType, durationSeconds);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/95 backdrop-blur-xl overflow-y-auto">
      {/* Alarm pulsating strobe border effect */}
      <div className="fixed inset-0 pointer-events-none border-4 sm:border-8 border-rose-500/40 animate-alarm-pulse z-0" />

      <div className="relative z-10 w-full max-w-lg bg-slate-900/95 rounded-3xl border border-rose-500/50 p-5 sm:p-7 shadow-[0_0_80px_rgba(244,63,94,0.35)] flex flex-col items-center">
        {/* Top Emergency Strobe Banner */}
        <div className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-4 animate-pulse">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-rose-400 animate-bounce" />
            <span className="text-xs sm:text-sm font-black tracking-wider uppercase">
              {isTestMode ? '🚨 模擬響鈴：晨間英雄任務啟動' : '🚨 晨間英雄警報：起床時刻已到！'}
            </span>
          </div>
          <div className="flex items-center gap-1 font-mono text-xs font-bold tabular-nums">
            <Clock className="w-3.5 h-3.5" />
            <span>{currentTimeStr}</span>
          </div>
        </div>

        {/* Alarm Info */}
        <div className="text-center mb-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {alarm.label || '早安英雄，該起床了！'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ⚠️ 警報響鈴中！完成指定晨間任務才能解除鬧鐘！
          </p>
        </div>

        {/* Mission Component Container */}
        <div className="w-full bg-slate-950/80 rounded-2xl p-3 sm:p-4 border border-slate-800 shadow-inner">
          <MissionContainer
            missionType={alarm.mission as MissionType}
            difficulty={alarm.difficulty as DifficultyLevel}
            onSuccess={handleSuccess}
          />
        </div>

        {/* Snooze & Warning Footer */}
        <div className="w-full mt-4 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-1 text-slate-400">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>不可略過 · 通關任務獲取 +100 XP</span>
          </div>

          {alarm.snoozeAllowed && onSnooze && (
            <button
              type="button"
              onClick={() => {
                soundEngine.stopAlarm();
                onSnooze();
              }}
              className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Moon className="w-3.5 h-3.5" />
              <span>貪睡 5 分鐘</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
