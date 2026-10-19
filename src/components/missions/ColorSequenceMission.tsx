import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Palette, Play, RotateCcw } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';
import { DifficultyLevel } from '../../types/alarm';

interface ColorSequenceMissionProps {
  difficulty: DifficultyLevel;
  onComplete: (durationSeconds: number) => void;
}

interface ColorPad {
  id: number;
  label: string;
  baseClass: string;
  activeClass: string;
  glowColor: string;
}

const COLOR_PADS: ColorPad[] = [
  {
    id: 0,
    label: '青空藍',
    baseClass: 'bg-cyan-900/60 text-cyan-200 border-cyan-700/60',
    activeClass: 'bg-cyan-400 text-slate-950 border-cyan-200 shadow-[0_0_35px_rgba(34,211,238,0.9)] scale-98',
    glowColor: '#22d3ee',
  },
  {
    id: 1,
    label: '極光紅',
    baseClass: 'bg-rose-900/60 text-rose-200 border-rose-700/60',
    activeClass: 'bg-rose-500 text-slate-950 border-rose-200 shadow-[0_0_35px_rgba(244,63,94,0.9)] scale-98',
    glowColor: '#f43f5e',
  },
  {
    id: 2,
    label: '琥珀金',
    baseClass: 'bg-amber-900/60 text-amber-200 border-amber-700/60',
    activeClass: 'bg-amber-400 text-slate-950 border-amber-200 shadow-[0_0_35px_rgba(251,191,36,0.9)] scale-98',
    glowColor: '#fbbf24',
  },
  {
    id: 3,
    label: '翡翠綠',
    baseClass: 'bg-emerald-900/60 text-emerald-200 border-emerald-700/60',
    activeClass: 'bg-emerald-400 text-slate-950 border-emerald-200 shadow-[0_0_35px_rgba(52,211,153,0.9)] scale-98',
    glowColor: '#34d399',
  },
];

export const ColorSequenceMission: React.FC<ColorSequenceMissionProps> = ({
  difficulty,
  onComplete,
}) => {
  const roundSteps =
    difficulty === 'extreme'
      ? [4, 5, 6]
      : difficulty === 'hero'
      ? [3, 4, 5]
      : [3, 3, 4];

  const totalRounds = roundSteps.length;

  const [currentRound, setCurrentRound] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInputIndex, setPlayerInputIndex] = useState(0);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING_SEQ' | 'PLAYER_TURN' | 'ERROR'>('IDLE');
  const [message, setMessage] = useState('準備好了嗎？點擊開始記憶');

  const startTimeRef = useRef<number>(Date.now());
  const timeoutsRef = useRef<number[]>([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };

  const generateSequenceForRound = (roundIdx: number) => {
    const length = roundSteps[roundIdx] || 3;
    const seq: number[] = [];
    for (let i = 0; i < length; i++) {
      seq.push(Math.floor(Math.random() * 4));
    }
    return seq;
  };

  const playSequence = useCallback((seq: number[]) => {
    clearAllTimeouts();
    setGameState('PLAYING_SEQ');
    setMessage(`第 ${currentRound + 1} 輪：請注視並記憶色彩閃爍順序...`);
    setPlayerInputIndex(0);

    seq.forEach((padId, index) => {
      // Light up
      const onTimeout = window.setTimeout(() => {
        setActivePad(padId);
        soundEngine.playColorNote(padId);
      }, (index + 1) * 600);
      timeoutsRef.current.push(onTimeout);

      // Light down
      const offTimeout = window.setTimeout(() => {
        setActivePad(null);
      }, (index + 1) * 600 + 400);
      timeoutsRef.current.push(offTimeout);
    });

    // Switch to player turn
    const finishTimeout = window.setTimeout(() => {
      setGameState('PLAYER_TURN');
      setMessage(`輪到你了！請按順序點選色彩 (0/${seq.length})`);
    }, (seq.length + 1) * 600 + 200);
    timeoutsRef.current.push(finishTimeout);
  }, [currentRound]);

  const startRound = useCallback((roundIdx: number) => {
    const newSeq = generateSequenceForRound(roundIdx);
    setSequence(newSeq);
    playSequence(newSeq);
  }, [playSequence]);

  const handleStartGame = () => {
    startTimeRef.current = Date.now();
    startRound(0);
  };

  const handlePadClick = (padId: number) => {
    if (gameState !== 'PLAYER_TURN') return;

    soundEngine.playColorNote(padId);
    setActivePad(padId);
    setTimeout(() => setActivePad(null), 250);

    const expected = sequence[playerInputIndex];

    if (padId === expected) {
      // Correct step
      const nextIndex = playerInputIndex + 1;
      setPlayerInputIndex(nextIndex);
      setMessage(`很好！繼續 (${nextIndex}/${sequence.length})`);

      if (nextIndex >= sequence.length) {
        // Round cleared!
        soundEngine.playCorrect();
        const nextRound = currentRound + 1;

        if (nextRound >= totalRounds) {
          // Mission fully accomplished!
          setMessage('全輪記憶通關！鬧鐘成功解除！');
          const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
          setTimeout(() => {
            onComplete(Math.max(3, elapsed));
          }, 400);
        } else {
          setCurrentRound(nextRound);
          setMessage(`第 ${currentRound + 1} 輪成功！準備進入下一輪...`);
          setGameState('IDLE');
          setTimeout(() => {
            startRound(nextRound);
          }, 1000);
        }
      }
    } else {
      // Wrong step!
      soundEngine.playWrong();
      setGameState('ERROR');
      setMessage('記錯了！別氣餒，重播本輪色彩...');
      setTimeout(() => {
        playSequence(sequence);
      }, 1200);
    }
  };

  useEffect(() => {
    return () => clearAllTimeouts();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full max-w-sm mx-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-semibold tracking-wide uppercase mb-1.5 border border-cyan-500/20">
          <Palette className="w-3.5 h-3.5 text-cyan-400" />
          <span>任務 C · 色彩記憶力測試</span>
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">
          記憶色彩順序並正確復現
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          第 {currentRound + 1} / {totalRounds} 輪 · 考驗清晨視覺與聽覺記憶
        </p>
      </div>

      {/* Message Banner */}
      <div className="w-full py-2.5 px-3 bg-slate-900/90 rounded-xl border border-slate-800 text-center mb-5 min-h-[46px] flex items-center justify-center">
        <span
          className={`text-xs sm:text-sm font-medium ${
            gameState === 'ERROR'
              ? 'text-rose-400 font-bold animate-pulse'
              : gameState === 'PLAYER_TURN'
              ? 'text-cyan-300 font-bold'
              : 'text-slate-300'
          }`}
        >
          {message}
        </span>
      </div>

      {/* 2x2 Color Pads Grid */}
      <div className="grid grid-cols-2 gap-3.5 w-64 h-64 mb-5">
        {COLOR_PADS.map((pad) => {
          const isActive = activePad === pad.id;
          return (
            <button
              key={pad.id}
              type="button"
              disabled={gameState === 'PLAYING_SEQ' || gameState === 'IDLE'}
              onClick={() => handlePadClick(pad.id)}
              className={`rounded-2xl border-2 font-bold text-sm flex flex-col items-center justify-center cursor-pointer transition-all duration-150 select-none ${
                isActive ? pad.activeClass : pad.baseClass
              } ${
                gameState === 'PLAYER_TURN'
                  ? 'hover:opacity-90 active:scale-95'
                  : 'opacity-75 cursor-not-allowed'
              }`}
            >
              <div
                className="w-4 h-4 rounded-full mb-1 border border-white/30"
                style={{ backgroundColor: pad.glowColor }}
              />
              <span>{pad.label}</span>
            </button>
          );
        })}
      </div>

      {/* Control Buttons */}
      {gameState === 'IDLE' && (
        <button
          type="button"
          onClick={handleStartGame}
          className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-cyan-950 transition-all flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          <span>{currentRound === 0 ? '開始記憶考驗' : '下一輪'}</span>
        </button>
      )}

      {gameState === 'PLAYER_TURN' && (
        <button
          type="button"
          onClick={() => playSequence(sequence)}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>沒記清楚？再聽一次</span>
        </button>
      )}
    </div>
  );
};
