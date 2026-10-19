import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Brain, Check, Delete, ArrowRight } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';
import { DifficultyLevel } from '../../types/alarm';

interface MathBusterMissionProps {
  difficulty: DifficultyLevel;
  onComplete: (durationSeconds: number) => void;
}

interface Question {
  text: string;
  answer: number;
}

export const MathBusterMission: React.FC<MathBusterMissionProps> = ({ difficulty, onComplete }) => {
  const targetCorrect = difficulty === 'extreme' ? 4 : 3;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [flashSuccess, setFlashSuccess] = useState(false);

  const startTimeRef = useRef<number>(Date.now());

  // Generate random math problem
  const generateProblem = useCallback((): Question => {
    const isAddition = Math.random() > 0.45;

    if (difficulty === 'extreme' && Math.random() > 0.6) {
      // 1-digit x 2-digit
      const a = Math.floor(Math.random() * 8) + 3; // 3 to 10
      const b = Math.floor(Math.random() * 15) + 6; // 6 to 20
      return {
        text: `${a} × ${b}`,
        answer: a * b,
      };
    }

    if (isAddition) {
      const a = Math.floor(Math.random() * 70) + 15; // 15 to 84
      const b = Math.floor(Math.random() * 50) + 12; // 12 to 61
      return {
        text: `${a} + ${b}`,
        answer: a + b,
      };
    } else {
      const a = Math.floor(Math.random() * 60) + 35; // 35 to 94
      const b = Math.floor(Math.random() * (a - 15)) + 11; // ensure positive answer > 10
      return {
        text: `${a} - ${b}`,
        answer: a - b,
      };
    }
  }, [difficulty]);

  const [question, setQuestion] = useState<Question>(generateProblem);

  const handleDigit = (digit: string) => {
    if (currentInput.length >= 4) return;
    soundEngine.playTap();
    setCurrentInput((prev) => prev + digit);
  };

  const handleDelete = () => {
    soundEngine.playTap();
    setCurrentInput((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    soundEngine.playTap();
    setCurrentInput('');
  };

  const handleSubmit = useCallback(() => {
    if (!currentInput.trim()) return;

    const val = parseInt(currentInput.trim(), 10);
    if (val === question.answer) {
      // Correct!
      soundEngine.playCorrect();
      setFlashSuccess(true);
      setTimeout(() => setFlashSuccess(false), 300);

      const nextCorrect = correctCount + 1;
      setCorrectCount(nextCorrect);
      setCurrentInput('');

      if (nextCorrect >= targetCorrect) {
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        onComplete(Math.max(2, elapsed));
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
        setQuestion(generateProblem());
      }
    } else {
      // Wrong!
      soundEngine.playWrong();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 450);
      setCurrentInput('');
    }
  }, [currentInput, question.answer, correctCount, targetCorrect, onComplete, generateProblem]);

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full max-w-sm mx-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-semibold tracking-wide uppercase mb-1.5 border border-indigo-500/20">
          <Brain className="w-3.5 h-3.5 text-indigo-400" />
          <span>任務 B · 心算專注解題</span>
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">
          答對 {targetCorrect} 題兩位數心算解鎖
        </h3>
        <p className="text-xs text-slate-400 mt-1">活化晨間大腦前額葉，擊碎睏意迷霧！</p>
      </div>

      {/* Progress Slots */}
      <div className="flex gap-2 mb-4">
        {Array.from({ length: targetCorrect }).map((_, idx) => (
          <div
            key={idx}
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm border transition-all ${
              idx < correctCount
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : idx === correctCount
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500 animate-pulse'
                : 'bg-slate-800/50 text-slate-600 border-slate-700/60'
            }`}
          >
            {idx < correctCount ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
          </div>
        ))}
      </div>

      {/* Math Card Display */}
      <div
        className={`w-full py-5 px-6 rounded-2xl bg-slate-900 border text-center transition-all duration-150 mb-4 shadow-xl ${
          isShaking
            ? 'border-rose-500 bg-rose-950/30 -translate-x-1'
            : flashSuccess
            ? 'border-emerald-500 bg-emerald-950/30'
            : 'border-slate-800 hover:border-indigo-500/50'
        }`}
      >
        <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-wide font-mono tabular-nums">
          {question.text} ={' '}
          <span className="text-amber-400 underline underline-offset-8 decoration-2 decoration-indigo-500">
            {currentInput || '?'}
          </span>
        </div>
      </div>

      {/* Responsive Virtual Numpad */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleDigit(digit)}
            className="h-13 bg-slate-800/80 hover:bg-slate-700 active:bg-indigo-600 active:text-white rounded-xl text-xl font-bold font-mono text-slate-100 border border-slate-700/60 transition-all shadow-sm select-none"
          >
            {digit}
          </button>
        ))}

        <button
          type="button"
          onClick={handleDelete}
          className="h-13 bg-slate-800/50 hover:bg-slate-700 active:bg-slate-600 rounded-xl flex items-center justify-center text-slate-300 border border-slate-700/60 transition-all select-none"
          aria-label="刪除"
        >
          <Delete className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="h-13 bg-slate-800/80 hover:bg-slate-700 active:bg-indigo-600 active:text-white rounded-xl text-xl font-bold font-mono text-slate-100 border border-slate-700/60 transition-all shadow-sm select-none"
        >
          0
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          className="h-13 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 active:scale-95 rounded-xl flex items-center justify-center text-white font-bold border border-cyan-400/30 transition-all shadow-lg shadow-indigo-900/30 select-none"
          aria-label="確認送出"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      <div className="mt-4 text-xs text-slate-500 text-center">
        <span>支援實體鍵盤 0~9 與 Enter 送出</span>
      </div>
    </div>
  );
};
