import React from 'react';
import { History, Zap, Brain, Palette, Layers, Calendar, Trash2 } from 'lucide-react';
import { MissionRecord } from '../types/alarm';

interface WakeHistoryProps {
  records: MissionRecord[];
  onClearRecords: () => void;
}

export const WakeHistory: React.FC<WakeHistoryProps> = ({ records, onClearRecords }) => {
  const getMissionIcon = (type: string) => {
    switch (type) {
      case 'speed_tap':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'math_buster':
        return <Brain className="w-4 h-4 text-indigo-400" />;
      case 'color_sequence':
        return <Palette className="w-4 h-4 text-cyan-400" />;
      case 'boss_rush':
        return <Layers className="w-4 h-4 text-purple-400" />;
      default:
        return <Zap className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getMissionLabel = (type: string) => {
    switch (type) {
      case 'speed_tap':
        return '快速點擊挑戰';
      case 'math_buster':
        return '心算專注解題';
      case 'color_sequence':
        return '色彩記憶測試';
      case 'boss_rush':
        return '極限破曉 Boss Rush';
      default:
        return '英雄試煉任務';
    }
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">起床任務紀錄 (Mission Logs)</h2>
            <p className="text-xs text-slate-400">記錄每一次戰勝賴床的晨間榮耀</p>
          </div>
        </div>

        {records.length > 0 && (
          <button
            type="button"
            onClick={onClearRecords}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
            title="清除紀錄"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>清空日誌</span>
          </button>
        )}
      </div>

      <div className="mt-5">
        {records.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-sm font-medium">尚無晨間任務紀錄</p>
            <p className="text-xs text-slate-600 mt-1">
              當鬧鐘響起並成功通關任務後，戰績將記錄於此！
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    {getMissionIcon(rec.missionType)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{getMissionLabel(rec.missionType)}</span>
                      {rec.isTestAlarm && (
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                          演習測試
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                      <span>{rec.dateStr}</span>
                      <span>·</span>
                      <span>{rec.timeStr}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-cyan-400 font-mono tabular-nums">
                    +{rec.xpEarned} XP
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    耗時 {rec.durationSeconds}s
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
