import React, { useState, useEffect, useRef } from 'react';
import {
  AlarmConfig,
  HeroStats,
  MissionRecord,
  Badge,
} from './types/alarm';
import {
  loadHeroProfile,
  saveHeroProfile,
  loadAlarms,
  saveAlarms,
  loadMissionRecords,
  grantMissionReward,
  calculateLevelInfo,
} from './services/storage';
import { soundEngine } from './services/soundEngine';
import { ClockHeader } from './components/ClockHeader';
import { HeroStatusCard } from './components/HeroStatusCard';
import { AlarmSetupCard } from './components/AlarmSetupCard';
import { MissionsPractice } from './components/MissionsPractice';
import { WakeHistory } from './components/WakeHistory';
import { AlarmRingerModal } from './components/AlarmRingerModal';
import { AwakeningSuccessModal } from './components/AwakeningSuccessModal';
import { BadgesModal } from './components/BadgesModal';
import { Play, Shield, Sparkles } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<HeroStats>(loadHeroProfile);
  const [alarms, setAlarms] = useState<AlarmConfig[]>(loadAlarms);
  const [records, setRecords] = useState<MissionRecord[]>(loadMissionRecords);
  const [isMuted, setIsMuted] = useState(false);

  // Modals & Active state
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [isTestAlarm, setIsTestAlarm] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    xpGained: number;
    durationSeconds: number;
    newLevelUp: boolean;
    unlockedBadges: Badge[];
  } | null>(null);

  const activeAlarm = alarms.length > 0 ? alarms[0] : null;

  // Track last triggered minute string (e.g. "2026-10-19-07:30") to prevent re-triggering during the same minute
  const lastTriggeredMinuteRef = useRef<string>('');

  // Live real-time check for alarm matching
  useEffect(() => {
    const interval = setInterval(() => {
      if (!activeAlarm || !activeAlarm.enabled || isAlarmRinging) return;

      const now = new Date();
      const currentH = String(now.getHours()).padStart(2, '0');
      const currentM = String(now.getMinutes()).padStart(2, '0');
      const timeKey = `${now.toISOString().split('T')[0]}-${currentH}:${currentM}`;

      if (
        `${currentH}:${currentM}` === activeAlarm.time &&
        now.getSeconds() === 0 &&
        lastTriggeredMinuteRef.current !== timeKey
      ) {
        lastTriggeredMinuteRef.current = timeKey;
        setIsTestAlarm(false);
        setIsAlarmRinging(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeAlarm, isAlarmRinging]);

  // Audio mute toggle
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  };

  // Instant Test Alarm trigger
  const handleTriggerTestAlarm = () => {
    soundEngine.unlockAudio();
    setIsTestAlarm(true);
    setIsAlarmRinging(true);
  };

  // Alarm mission successfully completed
  const handleMissionSuccess = (finalMissionType: string, durationSeconds: number) => {
    setIsAlarmRinging(false);

    const difficulty = activeAlarm?.difficulty || 'normal';
    const reward = grantMissionReward(finalMissionType, difficulty, durationSeconds, isTestAlarm);

    setProfile(reward.updatedProfile);
    setRecords(loadMissionRecords());

    setSuccessData({
      xpGained: reward.xpGained,
      durationSeconds,
      newLevelUp: reward.newLevelUp,
      unlockedBadges: reward.unlockedNewBadges,
    });
  };

  // Snooze 5 minutes
  const handleSnooze = () => {
    setIsAlarmRinging(false);
    if (!activeAlarm) return;

    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const snoozeTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updated = { ...activeAlarm, time: snoozeTime };
    const newAlarms = [updated];
    setAlarms(newAlarms);
    saveAlarms(newAlarms);
  };

  const handleUpdateAlarm = (updated: AlarmConfig) => {
    const newAlarms = [updated];
    setAlarms(newAlarms);
    saveAlarms(newAlarms);
  };

  const handleClearRecords = () => {
    localStorage.removeItem('morning_hero_records_v1');
    setRecords([]);
  };

  const handlePracticeXp = (xpBonus: number) => {
    const updatedXp = profile.xp + xpBonus;
    const lvlInfo = calculateLevelInfo(updatedXp);
    const updatedProfile: HeroStats = {
      ...profile,
      xp: updatedXp,
      level: lvlInfo.level,
      title: lvlInfo.title,
    };
    setProfile(updatedProfile);
    saveHeroProfile(updatedProfile);
  };

  const now = new Date();
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (Nav links) — Zone 3 (Primary action) */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          className="text-lg font-black tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Shield className="w-4 h-4" />
          </div>
          <span>Morning Hero Arcade</span>
        </a>

        {/* Zone 2: 4 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <a
            href="#clock-section"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            時鐘鬧鐘
          </a>
          <a
            href="#alarm-setup"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            任務設定
          </a>
          <a
            href="#training-dojo"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            道館訓練
          </a>
          <a
            href="#mission-logs"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            戰績日誌
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleTriggerTestAlarm}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-xl hover:from-cyan-300 hover:to-indigo-300 transition-all shadow-md shadow-cyan-950 whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>模擬響鈴</span>
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Real-time Clock & Countdown Hero Section */}
        <section id="clock-section">
          <ClockHeader
            activeAlarm={activeAlarm}
            onTestAlarm={handleTriggerTestAlarm}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        </section>

        {/* Hero Progression & Level Status */}
        <section id="hero-progress">
          <HeroStatusCard
            profile={profile}
            onOpenBadges={() => setShowBadgesModal(true)}
          />
        </section>

        {/* Alarm Setup & Mini-Games Configuration */}
        <section id="alarm-setup">
          {activeAlarm && (
            <AlarmSetupCard
              alarm={activeAlarm}
              onUpdateAlarm={handleUpdateAlarm}
            />
          )}
        </section>

        {/* Training Dojo / Practice Mini-Games */}
        <section id="training-dojo">
          <MissionsPractice onEarnPracticeXp={handlePracticeXp} />
        </section>

        {/* Mission Records / History */}
        <section id="mission-logs">
          <WakeHistory
            records={records}
            onClearRecords={handleClearRecords}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Morning Hero Arcade · 晨間英雄：任務養成鬧鐘</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>快速連擊</span>
            <span>·</span>
            <span>心算專注</span>
            <span>·</span>
            <span>色彩記憶</span>
            <span>·</span>
            <span>極限破曉</span>
          </div>
        </div>
      </footer>

      {/* Alarm Ringing Overlay Modal */}
      {isAlarmRinging && activeAlarm && (
        <AlarmRingerModal
          alarm={activeAlarm}
          currentTimeStr={currentTimeStr}
          isTestMode={isTestAlarm}
          onMissionSuccess={handleMissionSuccess}
          onSnooze={handleSnooze}
        />
      )}

      {/* Awakening Success & Reward Celebration Modal */}
      {successData && (
        <AwakeningSuccessModal
          xpGained={successData.xpGained}
          durationSeconds={successData.durationSeconds}
          newLevelUp={successData.newLevelUp}
          unlockedBadges={successData.unlockedBadges}
          profile={profile}
          onClose={() => setSuccessData(null)}
        />
      )}

      {/* Badges & Achievements Modal */}
      {showBadgesModal && (
        <BadgesModal
          unlockedBadgeIds={profile.unlockedBadgeIds}
          onClose={() => setShowBadgesModal(false)}
        />
      )}
    </div>
  );
}
