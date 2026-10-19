import { AlarmConfig, Badge, HeroStats, LevelInfo, MissionRecord } from '../types/alarm';

const STORAGE_KEY_PROFILE = 'morning_hero_profile_v1';
const STORAGE_KEY_ALARMS = 'morning_hero_alarms_v1';
const STORAGE_KEY_RECORDS = 'morning_hero_records_v1';

export const ALL_BADGES: Badge[] = [
  {
    id: 'first_awakening',
    title: '晨曦初醒',
    description: '首次成功完成晨間任務並解除鬧鐘',
    icon: 'Sun',
    category: 'milestone',
    requirement: '完成第 1 次解除任務',
    unlocked: false,
  },
  {
    id: 'streak_3',
    title: '破曉執念',
    description: '連續 3 天早起擊潰鬧鐘',
    icon: 'Flame',
    category: 'streak',
    requirement: '連續早起 3 天',
    unlocked: false,
  },
  {
    id: 'streak_7',
    title: '晨光不屈',
    description: '連續 7 天早起打卡，賴床剋星！',
    icon: 'ShieldCheck',
    category: 'streak',
    requirement: '連續早起 7 天',
    unlocked: false,
  },
  {
    id: 'speed_demon',
    title: '光速手指',
    description: '在 8 秒內完成快速連擊任務',
    icon: 'Zap',
    category: 'speed',
    requirement: 'Speed Tap <= 8 秒通關',
    unlocked: false,
  },
  {
    id: 'math_pro',
    title: '心算神腦',
    description: '心算解題零失誤且耗時小於 15 秒',
    icon: 'Brain',
    category: 'mastery',
    requirement: 'Math Buster 快速全對',
    unlocked: false,
  },
  {
    id: 'color_harmony',
    title: '光芒共鳴',
    description: '色彩記憶測試連續通過 3 輪無失誤',
    icon: 'Palette',
    category: 'mastery',
    requirement: 'Color Sequence 一次過關',
    unlocked: false,
  },
  {
    id: 'boss_slayer',
    title: '晨曦主宰者',
    description: '成功挑戰並通關三合一極限破曉 (Boss Rush)',
    icon: 'Trophy',
    category: 'milestone',
    requirement: '通關 Boss Rush 模式',
    unlocked: false,
  },
  {
    id: 'veteran_hero',
    title: '百戰成晨',
    description: '累計完成 20 次晨間任務',
    icon: 'Crown',
    category: 'milestone',
    requirement: '累計通關 20 次任務',
    unlocked: false,
  },
];

export const getTitleForLevel = (level: number): string => {
  if (level >= 50) return '破曉之神';
  if (level >= 40) return '晨曦主宰';
  if (level >= 30) return '烈陽勇者';
  if (level >= 20) return '晨間英雄';
  if (level >= 12) return '晨光疾行客';
  if (level >= 6) return '晨曦守護者';
  if (level >= 3) return '鬧鐘粉碎者';
  return '初級醒腦者';
};

/**
 * Calculates level info based on cumulative XP
 * Each level requires 150 + (level - 1) * 50 XP
 */
export const calculateLevelInfo = (totalXp: number): LevelInfo => {
  let level = 1;
  let remainingXp = Math.max(0, totalXp);

  while (true) {
    const xpNeededForNext = 150 + (level - 1) * 50;
    if (remainingXp < xpNeededForNext) {
      const progressPercent = Math.min(100, Math.floor((remainingXp / xpNeededForNext) * 100));
      return {
        level,
        title: getTitleForLevel(level),
        currentLevelXp: remainingXp,
        nextLevelXp: xpNeededForNext,
        progressPercent,
      };
    }
    remainingXp -= xpNeededForNext;
    level++;
  }
};

const DEFAULT_PROFILE: HeroStats = {
  xp: 0,
  level: 1,
  title: '初級醒腦者',
  streakDays: 1,
  lastWakeDate: '',
  totalMissionsCleared: 0,
  fastestClearSeconds: null,
  unlockedBadgeIds: [],
};

const DEFAULT_ALARMS: AlarmConfig[] = [
  {
    id: 'alarm_default',
    enabled: true,
    time: '07:00',
    label: '日常晨間英雄醒腦',
    mission: 'random',
    difficulty: 'normal',
    sound: 'siren_alert',
    volume: 0.85,
    snoozeAllowed: true,
  },
];

export const loadHeroProfile = (): HeroStats => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    const lvlInfo = calculateLevelInfo(parsed.xp || 0);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      level: lvlInfo.level,
      title: lvlInfo.title,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
};

export const saveHeroProfile = (profile: HeroStats) => {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch {
    // ignore
  }
};

export const loadAlarms = (): AlarmConfig[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALARMS);
    if (!raw) return DEFAULT_ALARMS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ALARMS;
  } catch {
    return DEFAULT_ALARMS;
  }
};

export const saveAlarms = (alarms: AlarmConfig[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_ALARMS, JSON.stringify(alarms));
  } catch {
    // ignore
  }
};

export const loadMissionRecords = (): MissionRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveMissionRecord = (record: MissionRecord) => {
  try {
    const existing = loadMissionRecords();
    const updated = [record, ...existing].slice(0, 50); // keep last 50
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(updated));
  } catch {
    // ignore
  }
};

/**
 * Handle mission success: calculate XP, check streak, check badge unlocks
 */
export const grantMissionReward = (
  missionType: string,
  difficulty: string,
  durationSeconds: number,
  isTestAlarm: boolean
): {
  xpGained: number;
  newLevelUp: boolean;
  unlockedNewBadges: Badge[];
  updatedProfile: HeroStats;
} => {
  const current = loadHeroProfile();
  const prevLevel = calculateLevelInfo(current.xp).level;

  // Base XP: 100 XP
  let xp = 100;

  // Difficulty multiplier
  if (difficulty === 'hero') xp += 30;
  if (difficulty === 'extreme') xp += 60;
  if (missionType === 'boss_rush') xp += 100;

  // Speed bonus
  if (durationSeconds <= 10) xp += 30;
  else if (durationSeconds <= 20) xp += 15;

  // Streak bonus
  xp += Math.min(50, current.streakDays * 5);

  const todayStr = new Date().toISOString().split('T')[0];
  let newStreak = current.streakDays;

  if (current.lastWakeDate) {
    const lastDate = new Date(current.lastWakeDate);
    const today = new Date(todayStr);
    const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
    // diffDays === 0 means same day
  } else {
    newStreak = 1;
  }

  const newTotalMissions = current.totalMissionsCleared + 1;
  const newFastest = current.fastestClearSeconds
    ? Math.min(current.fastestClearSeconds, durationSeconds)
    : durationSeconds;

  const newTotalXp = current.xp + xp;
  const newLevelInfo = calculateLevelInfo(newTotalXp);
  const newLevelUp = newLevelInfo.level > prevLevel;

  // Check Badge unlocks
  const currentBadges = new Set(current.unlockedBadgeIds || []);
  const newlyUnlocked: Badge[] = [];

  const checkBadge = (id: string, condition: boolean) => {
    if (condition && !currentBadges.has(id)) {
      currentBadges.add(id);
      const b = ALL_BADGES.find((item) => item.id === id);
      if (b) newlyUnlocked.push(b);
    }
  };

  checkBadge('first_awakening', true);
  checkBadge('streak_3', newStreak >= 3);
  checkBadge('streak_7', newStreak >= 7);
  checkBadge('speed_demon', missionType === 'speed_tap' && durationSeconds <= 8);
  checkBadge('math_pro', missionType === 'math_buster' && durationSeconds <= 15);
  checkBadge('color_harmony', missionType === 'color_sequence');
  checkBadge('boss_slayer', missionType === 'boss_rush');
  checkBadge('veteran_hero', newTotalMissions >= 20);

  const updatedProfile: HeroStats = {
    ...current,
    xp: newTotalXp,
    level: newLevelInfo.level,
    title: newLevelInfo.title,
    streakDays: newStreak,
    lastWakeDate: todayStr,
    totalMissionsCleared: newTotalMissions,
    fastestClearSeconds: newFastest,
    unlockedBadgeIds: Array.from(currentBadges),
  };

  saveHeroProfile(updatedProfile);

  // Save mission record
  const now = new Date();
  const record: MissionRecord = {
    id: 'rec_' + Date.now(),
    timestamp: Date.now(),
    dateStr: todayStr,
    timeStr: now.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }),
    missionType: missionType as any,
    difficulty: difficulty as any,
    durationSeconds,
    xpEarned: xp,
    isTestAlarm,
  };
  saveMissionRecord(record);

  return {
    xpGained: xp,
    newLevelUp,
    unlockedNewBadges: newlyUnlocked,
    updatedProfile,
  };
};
