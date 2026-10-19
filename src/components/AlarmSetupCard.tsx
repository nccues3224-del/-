import React, { useState } from 'react';
import {
  Bell,
  Zap,
  Brain,
  Palette,
  Shuffle,
  Layers,
  Volume2,
  Play,
  Square,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { AlarmConfig, AlarmSound, DifficultyLevel, MissionType } from '../types/alarm';
import { soundEngine } from '../services/soundEngine';

interface AlarmSetupCardProps {
  alarm: AlarmConfig;
  onUpdateAlarm: (updated: AlarmConfig) => void;
}

export const AlarmSetupCard: React.FC<AlarmSetupCardProps> = ({ alarm, onUpdateAlarm }) => {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const handleToggle = () => {
    soundEngine.unlockAudio();
    onUpdateAlarm({ ...alarm, enabled: !alarm.enabled });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateAlarm({ ...alarm, time: e.target.value });
  };

  const handleMissionSelect = (mission: MissionType) => {
    soundEngine.unlockAudio();
    soundEngine.playTap();
    onUpdateAlarm({ ...alarm, mission });
  };

  const handleDifficultySelect = (difficulty: DifficultyLevel) => {
    soundEngine.unlockAudio();
    soundEngine.playTap();
    onUpdateAlarm({ ...alarm, difficulty });
  };

  const handleSoundSelect = (sound: AlarmSound) => {
    soundEngine.unlockAudio();
    soundEngine.playTap();
    onUpdateAlarm({ ...alarm, sound });
  };

  const handlePreviewSound = () => {
    soundEngine.unlockAudio();
    if (isPlayingPreview) {
      soundEngine.stopAlarm();
      setIsPlayingPreview(false);
    } else {
      soundEngine.startAlarm(alarm.sound, alarm.volume);
      setIsPlayingPreview(true);
      setTimeout(() => {
        soundEngine.stopAlarm();
        setIsPlayingPreview(false);
      }, 3500); // 3.5s preview
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdateAlarm({ ...alarm, volume: val });
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
      {/* Top Header: Enable switch & Title */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              alarm.enabled
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">晨間鬧鐘配置</h2>
            <p className="text-xs text-slate-400">設定響鈴時間與解除任務</p>
          </div>
        </div>

        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={alarm.enabled}
            onChange={handleToggle}
            className="sr-only peer"
          />
          <div className="w-13 h-7 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[4px] after:bg-white after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-cyan-500 shadow-inner"></div>
        </label>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Left Column: Time & Sound */}
        <div className="space-y-5">
          {/* Time Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              目標響鈴時間 (24 小時制)
            </label>
            <div className="relative">
              <input
                type="time"
                value={alarm.time}
                onChange={handleTimeChange}
                className="w-full h-14 bg-slate-950 border border-slate-800 rounded-2xl px-5 text-2xl font-black font-mono text-cyan-400 focus:outline-none focus:border-cyan-500 transition-colors tabular-nums cursor-pointer"
              />
            </div>
          </div>

          {/* Label Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              鬧鐘標籤
            </label>
            <input
              type="text"
              value={alarm.label}
              onChange={(e) => onUpdateAlarm({ ...alarm, label: e.target.value })}
              placeholder="例如：熱血晨起挑戰"
              className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Alarm Ringtone & Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                響鈴音效
              </label>
              <button
                type="button"
                onClick={handlePreviewSound}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold cursor-pointer"
              >
                {isPlayingPreview ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>停止試聽</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>試聽音效</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'siren_alert', name: '🚨 警報狂瀾', sub: '高頻刺耳喚醒' },
                { id: 'arcade_8bit', name: '👾 8-Bit 像素狂潮', sub: '街機動感旋律' },
                { id: 'cosmic_pulse', name: '🌌 宇宙脈衝', sub: '低頻共振震撼' },
                { id: 'high_tempo', name: '⚡ 急促警戒', sub: '雙倍速急促心跳' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSoundSelect(s.id as AlarmSound)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    alarm.sound === s.id
                      ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-100">{s.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{s.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Volume Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>警報音量大小</span>
              </label>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {Math.round(alarm.volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={alarm.volume}
              onChange={handleVolumeChange}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Right Column: Mission Mode & Difficulty */}
        <div className="space-y-5">
          {/* Mission Mode Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              晨間解除任務小遊戲 (Mini-Games)
            </label>
            <div className="space-y-2">
              {[
                {
                  id: 'speed_tap',
                  name: '快速點擊挑戰 (Speed Tap)',
                  desc: '10 秒內連擊 15 次，瞬間喚醒身體運動神經',
                  icon: Zap,
                  accent: 'text-amber-400',
                  borderActive: 'border-amber-500/60 bg-amber-950/20',
                },
                {
                  id: 'math_buster',
                  name: '心算專注解題 (Math Buster)',
                  desc: '隨機產生兩位數加減法，答對 3 題擊潰睏意',
                  icon: Brain,
                  accent: 'text-indigo-400',
                  borderActive: 'border-indigo-500/60 bg-indigo-950/20',
                },
                {
                  id: 'color_sequence',
                  name: '色彩記憶測試 (Color Sequence)',
                  desc: '記憶閃爍色彩順序並正確點選，啟動視覺記憶腦區',
                  icon: Palette,
                  accent: 'text-cyan-400',
                  borderActive: 'border-cyan-500/60 bg-cyan-950/20',
                },
                {
                  id: 'random',
                  name: '隨機英雄試煉 (Hero Roulette)',
                  desc: '鬧鐘響起時隨機出題，維持清晨未知與專注力',
                  icon: Shuffle,
                  accent: 'text-emerald-400',
                  borderActive: 'border-emerald-500/60 bg-emerald-950/20',
                },
                {
                  id: 'boss_rush',
                  name: '極限破曉 Boss Rush (三合一連破)',
                  desc: '點擊 + 心算 + 色彩連續三連關！+200 XP 超激醒腦！',
                  icon: Layers,
                  accent: 'text-purple-400',
                  borderActive: 'border-purple-500/60 bg-purple-950/30',
                },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = alarm.mission === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleMissionSelect(m.id as MissionType)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? `${m.borderActive} shadow-[0_0_15px_rgba(255,255,255,0.05)]`
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl bg-slate-900 border border-slate-800 ${m.accent}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs sm:text-sm font-bold text-white flex items-center justify-between">
                        <span>{m.name}</span>
                        {isSelected && (
                          <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800">
                            已選擇
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {m.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>任務難度級別</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'normal', label: '標準醒腦', reward: '+100 XP' },
                { id: 'hero', label: '英雄進階', reward: '+130 XP' },
                { id: 'extreme', label: '極限破曉', reward: '+160 XP' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleDifficultySelect(d.id as DifficultyLevel)}
                  className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                    alarm.difficulty === d.id
                      ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{d.label}</div>
                  <div className="text-[10px] text-cyan-400 font-mono mt-0.5">{d.reward}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
