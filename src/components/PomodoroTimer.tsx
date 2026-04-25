import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Flame } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const PomodoroTimer = ({ userId, onSessionComplete }: { userId: string, onSessionComplete: (minutes: number) => void }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      if (mode === 'focus') {
        const studyTime = 25;
        onSessionComplete(studyTime);
        setMode('break');
        setTimeLeft(5 * 60);
        setSessionCount(c => c + 1);
        alert('Focus session complete! Time for a 5 minute break.');
      } else {
        setMode('focus');
        setTimeLeft(25 * 60);
        alert('Break is over! Ready to focus?');
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'focus' | 'break') => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ background: 'var(--bg-main)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={20} color={mode === 'focus' ? '#ef4444' : '#3b82f6'} />
          <div style={{ fontWeight: '800', color: 'var(--text-dark)' }}>{mode === 'focus' ? 'Focus Mode' : 'Break Time'}</div>
        </div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Sessions: {sessionCount}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
        <div style={{ fontSize: '48px', fontWeight: '900', color: 'var(--text-dark)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-1px' }}>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button 
          onClick={toggleTimer}
          style={{ 
            padding: '12px 24px', 
            borderRadius: '16px', 
            background: isActive ? 'var(--bg-card)' : 'var(--primary)', 
            color: isActive ? 'var(--text-dark)' : 'white', 
            border: isActive ? '1px solid var(--border)' : 'none',
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          {isActive ? <Pause size={18} /> : <Play size={18} />}
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button 
          onClick={resetTimer}
          style={{ 
            padding: '12px', 
            borderRadius: '16px', 
            background: 'var(--bg-card)', 
            color: 'var(--text-muted)', 
            border: '1px solid var(--border)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <RotateCcw size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: '12px', padding: '4px', marginTop: '8px' }}>
        <button 
          onClick={() => switchMode('focus')}
          style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: mode === 'focus' ? 'white' : 'transparent', color: mode === 'focus' ? 'var(--text-dark)' : 'var(--text-muted)', fontWeight: '600', boxShadow: mode === 'focus' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer' }}
        >
          Focus (25m)
        </button>
        <button 
          onClick={() => switchMode('break')}
          style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: mode === 'break' ? 'white' : 'transparent', color: mode === 'break' ? 'var(--text-dark)' : 'var(--text-muted)', fontWeight: '600', boxShadow: mode === 'break' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer' }}
        >
          Break (5m)
        </button>
      </div>
    </div>
  );
};
