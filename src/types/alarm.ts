export type MissionType = 'speed_tap' | 'math_buster' | 'color_sequence' | 'random' | 'boss_rush';

export type DifficultyLevel = 'normal' | 'hero' | 'extreme';

export type AlarmSound = 'siren_alert' | 'arcade_8bit' | 'cosmic_pulse' | 'high_tempo';

export interface AlarmConfig {
  id: string;
  enabled: boolean;
  time: string; // "HH:MM"
  label: string;
  mission: MissionType;
  difficulty: DifficultyLevel;
  sound: AlarmSound;
  volume: number; // 0.1 - 1.0
  snoozeAllowed: boolean;
}

export interface HeroStats {
  xp: number;
  level: number;
  title: string;
  streakDays: number;
  lastWakeDate: string; // YYYY-MM-DD
  totalMissionsCleared: number;
  fastestClearSeconds: number | null;
  unlockedBadgeIds: string[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'speed' | 'mastery' | 'milestone';
  requirement: string;
  unlocked: boolean;
}

export interface MissionRecord {
  id: string;
  timestamp: number;
  dateStr: string; // e.g. "2026-10-19"
  timeStr: string; // e.g. "07:30"
  missionType: MissionType;
  difficulty: DifficultyLevel;
  durationSeconds: number;
  xpEarned: number;
  isTestAlarm: boolean;
}

export interface LevelInfo {
  level: number;
  title: string;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
}
