import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  LayoutDashboard, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  MessageCircle, 
  Settings as SettingsIcon, 
  User as UserIcon,
  Plus,
  ArrowLeft,
  Edit3,
  Clock,
  Loader2, 
  MapPin,
  LogOut, 
  Users, 
  BookOpen,
  Trash2,
  Book,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  Hand,
  TrendingUp,
  Search,
  PlusCircle,
  Hash,
  X,
  Upload,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Play,
  Pause,
  RotateCcw,
  Check,
  Bell,
  Edit2,
  Shield,
  CheckCircle2,
  Send,
  Star,
  Zap,
  Heart,
  Trophy,
  Layers
} from 'lucide-react';
import { UploadBookModal } from './components/UploadBookModal';
import BookReader from './components/BookReader';
import { stats as mockStats } from './data';
import type { Task } from './data';
import './index.css';
import { supabase } from './lib/supabase';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocalNotifications } from '@capacitor/local-notifications';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Login } from './components/Login';
import { AddTaskModal } from './components/AddTaskModal';
import AssignmentWorkspace from './components/AssignmentWorkspace';
import { GPACalculator } from './components/GPACalculator';
import { Leaderboard } from './components/Leaderboard';
import { Flashcards } from './components/Flashcards';

// --- Types ---
type View = 'Dashboard' | 'Tasks' | 'Calendar' | 'Messages' | 'Settings' | 'Profile' | 'Digital Library' | 'Groups' | 'Journal' | 'Workspace';

// --- Sub-components ---

const VerifiedBadge = ({ size = 16 }: { size?: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L14.29 3.27L16.82 2.74L18.23 4.93L20.76 5.46L21.14 8.04L23.07 9.87L22.28 12.39L23.41 14.82L21.36 16.51L21.05 19.1L18.48 19.82L17.15 22.1L14.58 21.64L12 23L9.42 21.64L6.85 22.1L5.52 19.82L2.95 19.1L2.64 16.51L0.59 14.82L1.72 12.39L0.93 9.87L2.86 8.04L3.24 5.46L5.77 4.93L7.18 2.74L9.71 3.27L12 2Z" fill="#0095f6"/>
      <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

const DraggableProgressBar = ({ progress, onUpdate }: { progress: number, onUpdate: (val: number) => void }) => {
  const [localProgress, setLocalProgress] = useState(progress);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalProgress(progress);
  }, [progress]);

  const calculateProgress = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.min(100, Math.max(0, Math.round((x / rect.width) * 100)));
    setLocalProgress(percentage);
    return percentage;
  };

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const val = calculateProgress(clientX);
    if (val !== undefined) onUpdate(val);
  };

  return (
    <div 
      ref={containerRef}
      className="progress-bar-bg" 
      style={{ height: '14px', background: 'rgba(0,0,0,0.15)', cursor: 'pointer', position: 'relative', overflow: 'visible' }}
      onMouseDown={handleInteraction}
      onTouchStart={handleInteraction}
    >
      <motion.div 
        className="progress-bar-fill" 
        animate={{ width: `${localProgress}%` }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        style={{ height: '100%', background: '#FFF', borderRadius: '10px', position: 'relative' }}
      >
        {/* Glow and Handle */}
        <div style={{ position: 'absolute', right: '-4px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', background: 'white', borderRadius: '50%', boxShadow: '0 0 10px rgba(255,255,255,0.8)' }} />
      </motion.div>
      <div style={{ position: 'absolute', right: '4px', top: '-24px', fontSize: '12px', fontWeight: '900', color: 'white', opacity: 0.8 }}>
        {localProgress}%
      </div>
    </div>
  );
};

// Real Capacitor StatusBar plugin is used instead of the local stub

// --- View Components ---

const DashboardView = ({ stats, tasks, setCurrentView, setIsAddModalOpen, setIsSidebarOpen, setIsEditSemesterModalOpen, setIsNotificationsOpen, deleteTask, completeTask, timeLeft, motivationQuote, DEFAULT_AVATAR, studySession, toggleStudySession, resetStudySession, formatTimeMatrix, timetable = [], streak = 0 }: any) => {
  const previewTextArrStr = localStorage.getItem('soma_ulipo_journals');
  let previewTextCount = 0;
  if (previewTextArrStr) {
    try {
      const arr = JSON.parse(previewTextArrStr);
      if (Array.isArray(arr)) previewTextCount = arr.length;
    } catch(e) {}
  }
  
  const hours = new Date().getHours();
  const timeGreeting = hours < 12 ? 'Good Morning' : hours < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="view-content" style={{ paddingBottom: '100px' }}>
      <div style={{ padding: '20px 0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>{timeGreeting}</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-dark)', letterSpacing: '-0.5px' }}>
              Hello, {stats?.name && typeof stats.name === 'string' ? stats.name.split(' ')[0] : (stats?.username || 'User')}!
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div 
              onClick={() => setIsNotificationsOpen(true)}
              style={{ position: 'relative', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', borderRadius: '50%', boxShadow: 'var(--card-shadow)', cursor: 'pointer', border: '1px solid var(--border)' }}
            >
              <Bell size={20} color="var(--text-dark)" />
              <div style={{ position: 'absolute', top: '10px', right: '12px', width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%', border: '2px solid var(--bg-card)' }} />
            </div>
            <div 
              onClick={() => setCurrentView('Profile')}
              className="avatar-glow"
              style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--bg-card)', overflow: 'hidden', padding: '3px', cursor: 'pointer' }}
            >
              <img src={stats.avatar_url || DEFAULT_AVATAR} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </div>



      {/* ===== PREMIUM POMODORO WIDGET ===== */}
      {(() => {
        const isRunning = studySession.status === 'focus' || studySession.status === 'break';
        const isPaused = studySession.status === 'paused';
        const isIdle = studySession.status === 'idle';
        const isFocusMode = studySession.mode === 'focus';
        const total = studySession.totalSeconds;
        const left = studySession.secondsLeft ?? 1500;
        const pct = total > 0 ? Math.min(1, Math.max(0, left / total)) : 1;
        const RADIUS = 54;
        const CIRCUM = 2 * Math.PI * RADIUS;
        const mins = Math.floor(left / 60);
        const secs = left % 60;
        const accentCol = isFocusMode ? 'var(--primary)' : '#F59E0B';
        const labelCol = isFocusMode ? '#1D9474' : '#B45309';
        return (
          <div style={{ background: 'var(--bg-card)', borderRadius: '28px', border: '1.5px solid var(--border)', padding: '28px 24px', marginBottom: '28px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Focus Timer</div>
                <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-dark)' }}>Pomodoro Tracker</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', padding: '4px 12px', borderRadius: '20px', background: isIdle ? 'var(--border)' : isFocusMode ? 'rgba(29,148,116,0.1)' : 'rgba(245,158,11,0.1)', color: isIdle ? 'var(--text-muted)' : labelCol }}>
                  {isIdle ? 'IDLE' : isFocusMode ? '🎯 FOCUS' : '☕ BREAK'}
                </div>
                <div style={{ fontSize: '11px', fontWeight: '800', padding: '4px 12px', borderRadius: '20px', background: 'var(--border)', color: 'var(--text-muted)' }}>
                  {streak}🔥
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              {/* Circular SVG Ring */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="var(--border)" strokeWidth="10" />
                  <circle
                    cx="70" cy="70" r={RADIUS}
                    fill="none"
                    stroke={accentCol}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUM}
                    strokeDashoffset={CIRCUM * (1 - pct)}
                    transform="rotate(-90 70 70)"
                    style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-dark)', fontFamily: 'monospace', lineHeight: 1 }}>
                    {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {isIdle ? 'READY' : isPaused ? 'PAUSED' : isRunning ? 'RUNNING' : ''}
                  </div>
                </div>
              </div>

              {/* Controls + Info */}
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {isIdle ? 'Press Start for a 25-minute focus session' :
                     isPaused ? 'Session paused — press Resume to continue' :
                     isFocusMode ? 'Stay focused! Break coming soon.' : 'Enjoy your break 🌿'}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    {[1,2,3,4].map(s => (
                      <div key={s} style={{ flex: 1, height: '4px', borderRadius: '4px', background: 'var(--border)' }} />
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={toggleStudySession}
                    style={{ flex: 1, background: accentCol, border: 'none', color: 'white', padding: '14px', borderRadius: '16px', fontWeight: '900', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: `0 8px 20px ${accentCol}40` }}
                  >
                    {isIdle ? <><Play size={16} /> Start</> : isPaused ? <><Play size={16} /> Resume</> : <><Pause size={16} /> Pause</>}
                  </button>
                  <button
                    onClick={resetStudySession}
                    style={{ width: '48px', height: '48px', background: 'var(--bg-main)', border: '1.5px solid var(--border)', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <RotateCcw size={16} color="var(--text-muted)" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== REAL STUDY ANALYTICS ===== */}
      <div className="stat-card" style={{ marginBottom: '28px', padding: '24px' }}>
        <div style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--primary)" /> Weekly Tasks Completed
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>This Week</div>
        </div>
        {(() => {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const now = new Date();
          const todayIdx = now.getDay();
          // Build counts of completed tasks per weekday
          const counts = Array(7).fill(0);
          tasks.filter(t => t.completed).forEach((t: any) => {
            if (!t.updated_at && !t.task_date) return;
            const d = new Date(t.updated_at || t.task_date);
            const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
            if (diff >= 0 && diff < 7) {
              const dayI = (todayIdx - diff + 7) % 7;
              counts[dayI]++;
            }
          });
          const maxCount = Math.max(...counts, 1);
          // Re-order to show Monâ†’Sun with today highlighted
          const orderedDays = days.map((label, i) => ({ label, count: counts[i], isToday: i === todayIdx }));
          const sorted = [...orderedDays.slice(1), orderedDays[0]]; // Monâ€“Sun
          return (
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '110px', padding: '0 4px' }}>
              {sorted.map(({ label, count, isToday }) => {
                const barH = Math.max(8, (count / maxCount) * 80);
                return (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    {count > 0 && <div style={{ fontSize: '9px', fontWeight: '900', color: isToday ? 'var(--primary)' : 'var(--text-muted)' }}>{count}</div>}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${barH}px` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      style={{ width: '22px', background: isToday ? 'var(--primary)' : count > 0 ? 'var(--primary)' : 'var(--border)', opacity: isToday ? 1 : count > 0 ? 0.5 : 1, borderRadius: '8px 8px 4px 4px' }}
                    />
                    <div style={{ fontSize: '10px', fontWeight: '800', color: isToday ? 'var(--primary)' : 'var(--text-muted)' }}>{label}</div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} color="var(--primary)" /> Quick Study Tools
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div 
            onClick={() => setCurrentView('GPA Calculator')}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', textAlign: 'center' }}
          >
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '16px' }}>
              <BookOpen size={20} color="#3b82f6" />
            </div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-dark)' }}>GPA Tracker</div>
          </div>
          
          <div 
            onClick={() => setCurrentView('Leaderboard')}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', textAlign: 'center' }}
          >
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '16px' }}>
              <Trophy size={20} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-dark)' }}>Leaderboard</div>
          </div>

          <div 
            onClick={() => setCurrentView('Flashcards')}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', textAlign: 'center' }}
          >
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '16px' }}>
              <Layers size={20} color="#10b981" />
            </div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-dark)' }}>Flashcards</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '28px' }}>
         <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--primary)" /> Recent Notes
         </div>
         <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
            {(() => {
              let entries = [];
              try { entries = JSON.parse(localStorage.getItem('soma_ulipo_journals') || '[]'); } catch(e) {}
              if (!Array.isArray(entries)) entries = [];
              if (entries.length === 0) return <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No notes yet</div>;
              return entries.slice(0, 3).map((e: any) => (
                <div 
                  key={e.id}
                  onClick={() => setCurrentView('Journal')}
                  style={{ minWidth: '160px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '16px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
                >
                  <div style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase' }}>{e.occasion}</div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{e.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{e.content || 'Empty...'}</div>
                </div>
              ));
            })()}
         </div>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Next Task</span>
          <span style={{ fontSize: '13px', color: 'var(--primary)' }} onClick={() => setCurrentView('Tasks')}>View All</span>
        </div>
        {tasks.filter(t => !t.completed).length > 0 ? (
          (() => {
            const nextTask = tasks.filter(t => !t.completed)[0];
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="task-card" 
                style={{ position: 'relative', background: 'var(--text-dark)', padding: '24px', borderRadius: '28px', color: 'white', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
              >
                {/* Background decorative elements */}
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'var(--primary)', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.5 }} />
                <div style={{ position: 'absolute', bottom: '-40px', left: '-20px', width: '120px', height: '120px', background: '#3b82f6', borderRadius: '50%', filter: 'blur(50px)', opacity: 0.3 }} />
                
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div style={{ flex: 1, paddingRight: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', backdropFilter: 'blur(10px)' }}>Highest Priority</div>
                    </div>
                    <div style={{ fontWeight: '900', fontSize: '22px', lineHeight: '1.2', marginBottom: '8px', textWrap: 'balance' }}>{nextTask.title}</div>
                    <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{nextTask.description}</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.4)', color: 'white', padding: '10px 16px', borderRadius: '16px', fontWeight: '800', fontSize: '14px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {nextTask.time}
                  </div>
                </div>

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => completeTask(nextTask.id)}
                    style={{ background: 'var(--primary)', border: 'none', borderRadius: '16px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 8px 24px rgba(90, 143, 123, 0.4)', color: 'white', fontWeight: '800', fontSize: '15px' }}
                  >
                    <CheckSquare size={18} strokeWidth={2.5} /> Mark Complete
                  </motion.button>
                </div>
              </motion.div>
            );
          })()
        ) : (
          <div style={{ padding: '30px', border: '1.5px dashed var(--border)', borderRadius: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Tasks Clear!</div>
        )}
      </div>

      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--primary)" />
            {stats?.name && typeof stats.name === 'string' && stats.name.trim().length > 0 ? stats.name.trim().split(' ')[0].charAt(0).toUpperCase() + stats.name.trim().split(' ')[0].slice(1) + "'s" : 'Personal'} Notebook
          </div>
        </div>
        <div 
          onClick={() => setCurrentView('Journal')}
          style={{ background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)', padding: '24px', position: 'relative', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {/* Subtle accent bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', bottom: 0, background: 'var(--pill-bg)', borderRight: '1px dashed var(--primary)', opacity: 0.5 }} />
          
          <div style={{ position: 'relative', zIndex: 1, paddingLeft: '32px' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.6' }}>
              {previewTextCount > 0 ? `You have ${previewTextCount} private journal pages securely saved on this device.` : "Your private space for thoughts, ideas, and lecture scratchpads. Tap here to start writing."}
            </div>
            <button style={{ marginTop: '16px', background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(90, 143, 123, 0.2)' }}>
              <Edit3 size={16} /> Open Journal
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginTop: '10px', marginBottom: '24px' }}>
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="stat-label">PERFORMANCE</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <div className="stat-value" style={{ fontSize: '32px', color: 'var(--primary)' }}>{stats.gpa}</div>
          </div>
          <div style={{ fontSize: '12px', color: '#22C55E', fontWeight: '800', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} /> {parseFloat(stats.gpa) > 3.5 ? 'EXCELLENT' : 'GOOD'}
          </div>
        </div>
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
           <div className="stat-label">ACTIVE TASKS</div>
           <div className="stat-value" style={{ fontSize: '32px', color: 'var(--primary)' }}>{tasks.filter((t: any) => !t.completed).length}</div>
           <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', marginTop: '4px' }}>
             PENDING
           </div>
        </div>
      </div>


      {/* ===== TODAY'S GOALS WIDGET ===== */}
      {(() => {
        const GOALS_KEY = 'soma_daily_goals';
        const DATE_KEY = 'soma_goals_date';
        const today = new Date().toDateString();

        const getRaw = () => {
          const savedDate = localStorage.getItem(DATE_KEY);
          if (savedDate !== today) {
            // New day â€” reset goals
            const defaults = [
              { id: '1', text: 'Review today\'s lecture notes', done: false },
              { id: '2', text: 'Complete one assignment task', done: false },
              { id: '3', text: 'Take a 10-min focused break', done: false },
            ];
            localStorage.setItem(GOALS_KEY, JSON.stringify(defaults));
            localStorage.setItem(DATE_KEY, today);
            return defaults;
          }
          try { return JSON.parse(localStorage.getItem(GOALS_KEY) || '[]'); }
          catch { return []; }
        };

        const GoalsWidget = () => {
          const [goals, setGoals] = React.useState<any[]>(getRaw);
          const [editingId, setEditingId] = React.useState<string | null>(null);
          const [newText, setNewText] = React.useState('');

          const save = (updated: any[]) => {
            setGoals(updated);
            localStorage.setItem(GOALS_KEY, JSON.stringify(updated));
          };

          const toggle = (id: string) => {
            save(goals.map(g => g.id === id ? { ...g, done: !g.done } : g));
          };

          const startEdit = (g: any) => { setEditingId(g.id); setNewText(g.text); };

          const saveEdit = (id: string) => {
            if (!newText.trim()) return;
            save(goals.map(g => g.id === id ? { ...g, text: newText.trim() } : g));
            setEditingId(null);
          };

          const addGoal = () => {
            if (goals.length >= 5) return;
            const ng = { id: Date.now().toString(), text: 'New goal', done: false };
            save([...goals, ng]);
            setEditingId(ng.id);
            setNewText(ng.text);
          };

          const completedCount = goals.filter(g => g.done).length;
          const pct = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

          return (
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="var(--primary)" /> Today's Goals
                </div>
                <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)' }}>{completedCount}/{goals.length} Done</div>
              </div>

              {/* Progress bar */}
              <div style={{ height: '6px', background: 'var(--border)', borderRadius: '6px', marginBottom: '16px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#22C55E' : 'var(--primary)', borderRadius: '6px', transition: 'width 0.5s ease' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {goals.map(g => (
                  <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', padding: '14px 16px', borderRadius: '18px', border: `1.5px solid ${g.done ? 'var(--primary)' : 'var(--border)'}`, transition: 'border 0.2s ease' }}>
                    <div
                      onClick={() => toggle(g.id)}
                      style={{ width: '22px', height: '22px', borderRadius: '8px', border: `2px solid ${g.done ? 'var(--primary)' : 'var(--border)'}`, background: g.done ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', transition: 'all 0.2s ease' }}
                    >
                      {g.done && <Check size={13} color="white" strokeWidth={3} />}
                    </div>
                    {editingId === g.id ? (
                      <input
                        autoFocus
                        value={newText}
                        onChange={e => setNewText(e.target.value)}
                        onBlur={() => saveEdit(g.id)}
                        onKeyDown={e => e.key === 'Enter' && saveEdit(g.id)}
                        style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '14px', fontWeight: '700', color: 'var(--text-dark)' }}
                      />
                    ) : (
                      <div
                        onClick={() => startEdit(g)}
                        style={{ flex: 1, fontSize: '14px', fontWeight: '700', color: 'var(--text-dark)', textDecoration: g.done ? 'line-through' : 'none', opacity: g.done ? 0.5 : 1, cursor: 'text', transition: 'opacity 0.2s' }}
                      >
                        {g.text}
                      </div>
                    )}
                  </div>
                ))}
                {goals.length < 5 && (
                  <button
                    onClick={addGoal}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', borderRadius: '18px', border: '1.5px dashed var(--border)', background: 'none', color: 'var(--text-muted)', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                  >
                    <Plus size={14} /> Add a goal
                  </button>
                )}
              </div>
              {pct === 100 && (
                <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(34,197,94,0.1)', border: '1.5px solid #22C55E', borderRadius: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '800', color: '#15803D' }}>
                  🎉 All goals complete! Great work today.
                </div>
              )}
            </div>
          );
        };
        return <GoalsWidget key="goals" />;
      })()}


      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '16px' }}>Urgent Deadlines</div>
        {tasks.filter((t: any) => !t.completed).slice(0, 2).map((t: any) => (
          <div key={t.id} className="deadline-card">
             <div>
               <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--text-dark)' }}>{t.title}</div>
               <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Due very soon</div>
             </div>
             <div style={{ padding: '6px 12px', background: 'rgba(255,59,48,0.1)', color: 'var(--accent)', borderRadius: '8px', fontSize: '12px', fontWeight: '800', textAlign: 'right' }}>{t.time}</div>
          </div>
        ))}
        {tasks.filter((t: any) => !t.completed).length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No impending deadlines!</div>}
      </div>

      <div className="stats-grid" style={{ marginTop: '-14px', marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            DAILY TIP <Clock size={12} />
          </div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-dark)', lineHeight: '1.4', marginTop: '8px' }}>
            {motivationQuote && typeof motivationQuote === 'string' ? motivationQuote.split('.')[0] : 'Stay focused'}.
          </div>
        </div>
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="stat-label">ACTIVE COURSES</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <div className="stat-value" style={{ fontSize: '32px', color: 'var(--text-dark)' }}>{tasks.length > 0 ? 5 : 4}</div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', marginTop: '4px' }}>
            {tasks.filter(t => !t.completed).length} Assignments due
          </div>
        </div>
      </div>
    </div>
  );
};

const TasksView = ({ tasks, completeTask, deleteTask }: { tasks: any[], completeTask: (id: string) => void, deleteTask: (id: string) => void }) => {
  const [activeTab, setActiveTab] = React.useState<'active' | 'completed'>('active');
  
  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const displayTasks = activeTab === 'active' ? activeTasks : completedTasks;

  return (
    <div className="view-content" style={{ padding: '0 24px 120px' }}>
      <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '24px' }}>My Tasks</div>
      
      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--border)', padding: '4px', borderRadius: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('active')}
          style={{ flex: 1, padding: '10px', background: activeTab === 'active' ? 'var(--bg-main)' : 'transparent', border: 'none', borderRadius: '12px', fontWeight: '800', color: activeTab === 'active' ? 'var(--text-dark)' : 'var(--text-muted)', boxShadow: activeTab === 'active' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Active ({activeTasks.length})
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          style={{ flex: 1, padding: '10px', background: activeTab === 'completed' ? 'var(--bg-main)' : 'transparent', border: 'none', borderRadius: '12px', fontWeight: '800', color: activeTab === 'completed' ? 'var(--text-dark)' : 'var(--text-muted)', boxShadow: activeTab === 'completed' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Completed ({completedTasks.length})
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {displayTasks.length === 0 ? (
           <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
             <CheckSquare size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
             <div style={{ fontSize: '18px', fontWeight: '800' }}>{activeTab === 'active' ? 'All caught up!' : 'No completed tasks yet.'}</div>
             <div style={{ fontSize: '14px', marginTop: '4px' }}>{activeTab === 'active' ? 'Enjoy your free time or add a new goal.' : 'Check off your active tasks.'}</div>
           </div>
        ) : displayTasks.map(task => (
           <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-card)', padding: '20px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
             {/* Left color bar */}
             <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: task.completed ? '#10B981' : 'var(--primary)' }} />
             
             {/* Interactive Circle */}
             <div 
                onClick={() => activeTab === 'active' ? completeTask(task.id) : null}
                style={{ width: '28px', height: '28px', borderRadius: '50%', border: task.completed ? 'none' : '2px solid var(--primary)', background: task.completed ? '#10B981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: activeTab === 'active' ? 'pointer' : 'default', transition: 'all 0.2s', flexShrink: 0 }}
             >
                {task.completed && <Check size={16} color="white" strokeWidth={3} />}
             </div>

             <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: task.completed ? 'var(--text-muted)' : 'var(--text-dark)', textDecoration: task.completed ? 'line-through' : 'none', marginBottom: '4px' }}>{task.title}</div>
                {task.description && <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>{task.description}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: task.completed ? '#10B981' : 'var(--primary)', background: task.completed ? 'rgba(16,185,129,0.1)' : 'var(--pill-bg)', padding: '4px 10px', borderRadius: '8px', width: 'fit-content' }}>
                   <Clock size={12} /> {task.time || '12:00 PM'}
                </div>
             </div>

             {/* Delete Button */}
             <button onClick={() => deleteTask(task.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', cursor: 'pointer', flexShrink: 0 }}>
                <Trash2 size={16} />
             </button>
           </div>
        ))}
      </div>
    </div>
  );
};

const LibraryView = ({ books, stats, uploadBook, onDeleteBook, onDeleteAll, onOpenBook }: any) => {
  const [libSearch, setLibSearch] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('All');
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const categories = ['All', 'Textbooks', 'Past Papers', 'Lecture Notes', 'General'];

  const getPageColor = (category: string) => {
    switch (category) {
      case 'Textbooks': return '#eef2ff';
      case 'Past Papers': return '#f0fdf4';
      case 'Lecture Notes': return '#fff7ed';
      default: return '#fefcf0';
    }
  };

  const getBorderColor = (category: string) => {
    switch (category) {
      case 'Textbooks': return '#c7d2fe';
      case 'Past Papers': return '#bbf7d0';
      case 'Lecture Notes': return '#fed7aa';
      default: return '#e2e8f0';
    }
  };

  const filteredBooks = books.filter((b: any) => 
    (activeCategory === 'All' || b.category === activeCategory) &&
    (b.title.toLowerCase().includes(libSearch.toLowerCase()) || b.description?.toLowerCase().includes(libSearch.toLowerCase()))
  );

  return (
    <div className="view-content" style={{ padding: '0 24px 120px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-dark)', margin: 0 }}>Library</h2>
        {stats.is_admin && (
          <button 
            onClick={onDeleteAll}
            style={{ fontSize: '11px', background: '#FEE2E2', color: '#EF4444', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
          >
            CLEAR ALL
          </button>
        )}
      </div>

      {isUploadModalOpen && (
        <UploadBookModal 
          onClose={() => setIsUploadModalOpen(false)} 
          onUpload={async (file, meta) => { await uploadBook(file, meta); }} 
        />
      )}
      <div className="lib-hero">
        <div className="lib-hero-content">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Book size={24} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-dark)', letterSpacing: '-0.5px' }}>Digital Library</div>
            </div>
            {stats?.is_admin && (
              <button onClick={() => setIsUploadModalOpen(true)} style={{ width: 'auto', padding: '8px 16px', background: 'var(--primary)', color: 'white', borderRadius: '10px', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none' }}>
                <Plus size={16} /> Upload Book
              </button>
            )}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '24px' }}>
            {filteredBooks.length} resources Â· SomaUlipo Collection
          </div>
          <div className="lib-search-bar">
            <Search size={18} color="var(--text-muted)" />
            <input type="text" className="lib-search-input" placeholder="Search library..." value={libSearch} onChange={(e) => setLibSearch(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="category-scroller">
        {categories.map(cat => (
          <div key={cat} className={`category-pill ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</div>
        ))}
      </div>
      <div className="lib-book-grid">
        {filteredBooks.map((book: any) => (
          <div key={book.id} style={{ position: 'relative' }}>
            <div onClick={() => onOpenBook(book)} className="lib-book-card" style={{ background: getPageColor(book.category), borderColor: getBorderColor(book.category) }}>
              <div className="lib-book-inner">
                <div className="lib-book-spine" style={{ background: getBorderColor(book.category) }}></div>
                <div className="lib-book-cover-content">
                  <div style={{ padding: '10px 10px 10px 8px' }}>
                    <div style={{ background: getBorderColor(book.category), color: 'rgba(0,0,0,0.55)', display: 'inline-block', padding: '2px 7px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {book.category || 'General'}
                    </div>
                    <div className="lib-book-title-realistic">{book.title}</div>
                    <div className="lib-book-meta-realistic">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Hash size={10} /> {book.pages || '?'} pg</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {stats?.is_admin && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteBook(book); }}
                style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 10 }}
              >
                <Trash2 size={12} />
              </button>
            )}
            <div style={{ marginTop: '10px', padding: '0 2px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                {book.description || 'No description available.'}
              </div>
            </div>
          </div>
        ))}
        {filteredBooks.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No books found matches your search.
          </div>
        )}
      </div>
    </div>
  );
};

const TimetableView = ({ timetable, stats, fetchTimetable, setConfirmDialog }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ course_name: '', room_location: '', start_time: '', end_time: '', day_of_week: 'Monday' });
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  // Default to today if it's a weekday, otherwise Monday
  const currentDayIndex = new Date().getDay();
  const [activeDay, setActiveDay] = useState(days[currentDayIndex >= 1 && currentDayIndex <= 5 ? currentDayIndex - 1 : 0]);

  const addClass = async () => {
    if (!stats.is_admin) return;
    if (!formData.course_name || !formData.start_time || !formData.end_time) {
      alert('Please fill in Course Name, Start Time, and End Time.'); return;
    }
    const { error } = await supabase.from('class_timetable').insert([formData]);
    if (error) alert("Error adding class: " + error.message);
    else { setIsModalOpen(false); setFormData({ course_name: '', room_location: '', start_time: '', end_time: '', day_of_week: 'Monday' }); fetchTimetable(); }
  };

  const deleteClass = async (id: string, className: string) => {
    if (!stats.is_admin) return;
    setConfirmDialog({
      title: 'Delete Class',
      message: `Are you sure you want to delete ${className}?`,
      isDestructive: true,
      onConfirm: async () => {
        const { error } = await supabase.from('class_timetable').delete().eq('id', id);
        if (error) alert("Error: " + error.message);
        else fetchTimetable();
      }
    });
  };

  const activeClasses = timetable.filter((t: any) => t.day_of_week === activeDay).sort((a: any, b: any) => (a.start_time || '').localeCompare(b.start_time || ''));

  return (
    <div className="view-content" style={{ paddingBottom: '120px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '0 4px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-dark)', margin: 0, letterSpacing: '-0.5px' }}>Timetable</h2>
        {stats.is_admin && (
           <button onClick={() => setIsModalOpen(true)} style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', borderRadius: '12px', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', boxShadow: '0 4px 12px rgba(90, 143, 123, 0.25)', cursor: 'pointer' }}>
             <Plus size={16} strokeWidth={3} /> Add Class
           </button>
        )}
      </div>

      {/* Day Selector Pills */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '20px', scrollbarWidth: 'none', paddingLeft: '4px' }}>
        {days.map(d => (
          <div 
            key={d} 
            onClick={() => setActiveDay(d)}
            style={{ 
              padding: '10px 20px', 
              borderRadius: '24px', 
              fontWeight: '800', 
              fontSize: '14px', 
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: activeDay === d ? 'var(--primary)' : 'var(--bg-main)',
              color: activeDay === d ? 'white' : 'var(--text-muted)',
              border: `1.5px solid ${activeDay === d ? 'var(--primary)' : 'var(--border)'}`,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: activeDay === d ? '0 4px 12px rgba(90, 143, 123, 0.2)' : 'none'
            }}
          >
            {d.substring(0, 3)}
          </div>
        ))}
      </div>

      {/* Vertical Timeline */}
      <div style={{ position: 'relative', paddingLeft: '28px', minHeight: '300px' }}>
        {/* Continuous Timeline Stroke */}
        <div style={{ position: 'absolute', left: '10px', top: '16px', bottom: '0', width: '2px', background: 'var(--border)' }} />

        {activeClasses.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
             <Clock size={40} style={{ opacity: 0.2, marginBottom: '16px', margin: '0 auto' }} />
             <div style={{ fontSize: '16px', fontWeight: '700' }}>No classes scheduled</div>
             <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '4px' }}>Enjoy your {activeDay}!</div>
          </div>
        ) : (
          activeClasses.map((cls: any, i: number) => (
             <div key={cls.id} style={{ position: 'relative', marginBottom: '32px' }}>
               {/* Timeline Node Dot */}
               <div style={{ position: 'absolute', left: '-22.5px', top: '6px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)', border: '2.5px solid var(--bg-main)', zIndex: 2, boxShadow: '0 0 0 1px var(--border)' }} />
               
               {/* Time Label on top of card */}
               <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)', marginBottom: '10px', letterSpacing: '0.5px' }}>
                 {(cls.start_time || '').substring(0,5)} – {(cls.end_time || '').substring(0,5)}
               </div>
               
               {/* Class Card */}
               <div style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '20px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)', position: 'relative', overflow: 'hidden' }}>
                 {/* Internal Colored Edge Accent */}
                 <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--primary)' }} />
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <div>
                     <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '8px', letterSpacing: '-0.3px' }}>{cls.course_name}</div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>
                       <MapPin size={15} color="var(--primary)" /> {cls.room_location || 'TBA'}
                     </div>
                   </div>
                   {stats.is_admin && (
                     <button onClick={() => deleteClass(cls.id, cls["class"] || cls.subject)} style={{ background: '#FEE2E2', color: '#EF4444', padding: '8px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}>
                       <Trash2 size={16} />
                     </button>
                   )}
                 </div>
               </div>
             </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
           <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: '32px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
             <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-dark)', fontSize: '22px', fontWeight: '900', letterSpacing: '-0.5px' }}>Add Class (Admin)</h3>
             <input placeholder="Course Name (e.g. CA 127)" value={formData.course_name} onChange={e => setFormData({...formData, course_name: e.target.value})} style={{ width: '100%', padding: '14px 16px', marginBottom: '12px', borderRadius: '16px', border: '1.5px solid var(--border)', background: 'var(--bg-main)', fontSize: '15px', fontWeight: '600', color: 'var(--text-dark)', boxSizing: 'border-box' }} />
             <input placeholder="Room / Venue (e.g. SA)" value={formData.room_location} onChange={e => setFormData({...formData, room_location: e.target.value})} style={{ width: '100%', padding: '14px 16px', marginBottom: '12px', borderRadius: '16px', border: '1.5px solid var(--border)', background: 'var(--bg-main)', fontSize: '15px', fontWeight: '600', color: 'var(--text-dark)', boxSizing: 'border-box' }} />
             <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
               <input type="time" title="Start Time" placeholder="Start" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} style={{ flex: 1, padding: '14px 16px', borderRadius: '16px', border: '1.5px solid var(--border)', background: 'var(--bg-main)', fontSize: '15px', fontWeight: '600', color: 'var(--text-dark)' }} />
               <input type="time" title="End Time" placeholder="End" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} style={{ flex: 1, padding: '14px 16px', borderRadius: '16px', border: '1.5px solid var(--border)', background: 'var(--bg-main)', fontSize: '15px', fontWeight: '600', color: 'var(--text-dark)' }} />
             </div>
             <select title="Day of Week" value={formData.day_of_week} onChange={e => setFormData({...formData, day_of_week: e.target.value})} style={{ width: '100%', padding: '14px 16px', marginBottom: '28px', borderRadius: '16px', border: '1.5px solid var(--border)', background: 'var(--bg-main)', fontSize: '15px', fontWeight: '600', color: 'var(--text-dark)', cursor: 'pointer' }}>
               {days.map(d => <option key={d} value={d}>{d}</option>)}
             </select>
             <div style={{ display: 'flex', gap: '12px' }}>
               <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '14px', background: 'var(--bg-main)', border: '1.5px solid var(--border)', color: 'var(--text-dark)', borderRadius: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>Cancel</button>
               <button onClick={addClass} style={{ flex: 1, padding: '14px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(90, 143, 123, 0.25)' }}>Save Timetable</button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

const SettingsView = ({ theme, setTheme, stats, dailyTips, onTipsChanged }: { theme: 'light' | 'dark', setTheme: (t: 'light' | 'dark') => void, stats: any, dailyTips: any[], onTipsChanged: () => void }) => {
  const [newTip, setNewTip] = React.useState('');
  const [newTipAuthor, setNewTipAuthor] = React.useState('');
  const [savingTip, setSavingTip] = React.useState(false);

  const addTip = async () => {
    if (!newTip.trim()) return;
    setSavingTip(true);
    await supabase.from('daily_tips').insert({ content: newTip.trim(), author: newTipAuthor.trim() || 'Admin', is_active: true });
    setNewTip('');
    setNewTipAuthor('');
    setSavingTip(false);
    onTipsChanged();
  };

  const removeTip = async (id: string) => {
    await supabase.from('daily_tips').update({ is_active: false }).eq('id', id);
    onTipsChanged();
  };

  return (
    <div className="view-content">
      <div className="settings-group">
        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '12px' }}>Notifications</div>
        <div className="setting-item"><span>Lecture Reminders</span><div className="toggle active"><div className="toggle-nob" /></div></div>
        <div className="setting-item"><span>Assignments</span><div className="toggle active"><div className="toggle-nob" /></div></div>
      </div>
      <div className="settings-group">
        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '12px' }}>Personalization</div>
        <div className="setting-item" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          <span>Dark Mode</span>
          <div className={`toggle ${theme === 'dark' ? 'active' : ''}`}><div className="toggle-nob" /></div>
        </div>
      </div>

      {stats?.is_admin && (
        <div className="settings-group">
          <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} /> Admin: Daily Tips
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <input
              value={newTip}
              onChange={e => setNewTip(e.target.value)}
              placeholder="Type a new motivational tip..."
              style={{ padding: '14px 16px', borderRadius: '16px', border: '1.5px solid var(--border)', background: 'var(--bg-main)', fontSize: '14px', color: 'var(--text-dark)', outline: 'none', width: '100%', boxSizing: 'border-box' }}
            />
            <input
              value={newTipAuthor}
              onChange={e => setNewTipAuthor(e.target.value)}
              placeholder="Author (optional)"
              style={{ padding: '14px 16px', borderRadius: '16px', border: '1.5px solid var(--border)', background: 'var(--bg-main)', fontSize: '14px', color: 'var(--text-dark)', outline: 'none', width: '100%', boxSizing: 'border-box' }}
            />
            <button
              onClick={addTip}
              disabled={savingTip || !newTip.trim()}
              style={{ padding: '14px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', opacity: (savingTip || !newTip.trim()) ? 0.6 : 1 }}
            >
              {savingTip ? 'Saving...' : '+ Add Tip'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {dailyTips.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No tips yet. Add one above.</div>}
            {dailyTips.map((tip: any) => (
              <div key={tip.id} style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '16px', padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', color: 'var(--text-dark)', marginBottom: '4px' }}>"{tip.content}"</div>
                  {tip.author && <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700' }}>â€” {tip.author}</div>}
                </div>
                <button
                  onClick={() => removeTip(tip.id)}
                  style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#EF4444', padding: '6px 10px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: '800', flexShrink: 0 }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};



type JournalEntry = {
  id: string;
  title: string;
  occasion: string;
  dateString: string;
  content: string;
  lastEdited: number;
};

const JournalView = ({ setCurrentView, setConfirmDialog }: { setCurrentView: (v: View) => void, setConfirmDialog?: any }) => {
  const [entries, setEntries] = React.useState<JournalEntry[]>(() => {
    try {
      const stored = localStorage.getItem('soma_ulipo_journals');
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    // Migration: If user had the old simple diary string, don't lose it! Convert it.
    const oldText = localStorage.getItem('soma_ulipo_diary');
    if (oldText) {
      return [{ id: '1', title: 'Imported Note', occasion: 'General', dateString: new Date().toISOString().split('T')[0], content: oldText, lastEdited: Date.now() }];
    }
    return [];
  });
  
  const [activeNoteId, setActiveNoteId] = React.useState<string | null>(null);
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'saved'>('idle');

  const activeNote = entries.find(e => e.id === activeNoteId);

  React.useEffect(() => {
    if (entries.length === 0 && !localStorage.getItem('soma_ulipo_journals') && !localStorage.getItem('soma_ulipo_diary')) return;
    setSaveStatus('saving');
    const handler = setTimeout(() => {
      localStorage.setItem('soma_ulipo_journals', JSON.stringify(entries));
      if (localStorage.getItem('soma_ulipo_diary')) localStorage.removeItem('soma_ulipo_diary');
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
    return () => clearTimeout(handler);
  }, [entries]);

  const createNote = () => {
    const newNote: JournalEntry = {
      id: Math.random().toString(36).substring(2, 10),
      title: 'Untitled Note',
      occasion: 'Reflection',
      dateString: new Date().toISOString().split('T')[0],
      content: '',
      lastEdited: Date.now()
    };
    setEntries(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  };

  const updateActiveNote = (updates: Partial<JournalEntry>) => {
    if (!activeNoteId) return;
    setEntries(prev => prev.map(e => e.id === activeNoteId ? { ...e, ...updates, lastEdited: Date.now() } : e));
  };
  
  const deleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (setConfirmDialog) {
      setConfirmDialog({
        title: 'Delete Page',
        message: 'Are you sure you want to rip this page out of your journal? This cannot be undone.',
        isDestructive: true,
        onConfirm: () => {
          setEntries(prev => prev.filter(n => n.id !== id));
        }
      });
    } else {
      if(confirm('Delete this entry?')) {
        setEntries(prev => prev.filter(n => n.id !== id));
      }
    }
  };

  if (!activeNote) {
    return (
      <div className="view-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 0 120px 0' }}>
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={() => setCurrentView('Dashboard')} style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)', fontWeight: '800', fontSize: '16px', cursor: 'pointer', padding: 0 }}>
            <ArrowLeft size={20} /> Dashboard
          </button>
          <button onClick={createNote} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '12px', fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(90, 143, 123, 0.2)' }}>
            <Plus size={16} strokeWidth={2.5} /> New Page
          </button>
        </div>
        
        <div style={{ padding: '24px' }}>
          <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '8px' }}>My Diary</div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>{entries.length} pages recorded</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {entries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No journal pages written yet. Tap 'New Page' to begin.</div>
            ) : entries.map(entry => (
              <div 
                key={entry.id} 
                onClick={() => setActiveNoteId(entry.id)}
                style={{ background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border)', padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: 'var(--card-shadow)', position: 'relative' }}
              >
                <button onClick={(e) => deleteNote(entry.id, e)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
                   <Trash2 size={14} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: 'var(--pill-bg)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                    {entry.occasion}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{entry.dateString}</div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '4px', paddingRight: '24px' }}>{entry.title}</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{entry.content || 'Empty page...'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="view-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 0 120px 0' }}>
      <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => setActiveNoteId(null)} style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)', fontWeight: '800', fontSize: '15px', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={18} /> All Pages
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: saveStatus === 'saving' ? '#F59E0B' : saveStatus === 'saved' ? '#10B981' : 'var(--text-muted)', fontSize: '12px', fontWeight: '700' }}>
          {saveStatus === 'saving' ? <><Loader2 size={12} className="spin" /> Saving</> : saveStatus === 'saved' ? <><Check size={12} /> Saved</> : <><Shield size={12} /> Auto-saves</>}
        </div>
      </div>
      
      <div style={{ background: 'var(--bg-main)', padding: '24px 24px 0 24px' }}>
        <input 
          value={activeNote.title}
          onChange={e => updateActiveNote({ title: e.target.value })}
          placeholder="Entry Title"
          style={{ width: '100%', fontSize: '28px', fontWeight: '900', border: 'none', background: 'transparent', color: 'var(--text-dark)', outline: 'none', marginBottom: '16px' }}
        />
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: '12px' }}>
            <CalendarIcon size={16} color="var(--primary)" />
            <input 
              type="date"
              value={activeNote.dateString}
              onChange={e => updateActiveNote({ dateString: e.target.value })}
              style={{ border: 'none', background: 'transparent', color: 'var(--text-dark)', fontSize: '13px', fontWeight: '700', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: '12px', flex: 1 }}>
            <Hash size={16} color="var(--primary)" />
            <input 
              value={activeNote.occasion}
              onChange={e => updateActiveNote({ occasion: e.target.value })}
              placeholder="Occasion (e.g. Lecture)"
              style={{ width: '100%', border: 'none', background: 'transparent', color: 'var(--text-dark)', fontSize: '13px', fontWeight: '700', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px', background: 'var(--bg-main)', position: 'relative', display: 'flex' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '100% 32px', backgroundPosition: '0 24px', opacity: 0.5, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: '60px', bottom: 0, width: '2px', background: 'rgba(239, 68, 68, 0.2)', pointerEvents: 'none' }} />
        
        <textarea
          value={activeNote.content}
          onChange={(e) => updateActiveNote({ content: e.target.value })}
          placeholder="Begin writing..."
          spellCheck={false}
          style={{
            flex: 1,
            width: '100%',
            background: 'transparent',
            border: 'none',
            resize: 'none',
            fontSize: '18px',
            lineHeight: '32px',
            fontFamily: 'inherit',
            color: 'var(--text-dark)',
            paddingLeft: '54px',
            paddingRight: '12px',
            outline: 'none',
            position: 'relative',
            zIndex: 1,
            fontWeight: '500'
          }}
        />
      </div>
    </div>
  );
};

const SplashScreen = () => {
  const text = "Soma ulipo";
  const letters = Array.from(text);
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0, scale: 0.8 },
    show: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", damping: 10, stiffness: 200 } }
  };

  return (
    <motion.div 
      className="splash-container"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      style={{ background: '#FFFFFF' }}
    >
      <motion.div 
        className="splash-logo"
        variants={container}
        initial="hidden"
        animate="show"
        style={{ color: '#000000', display: 'flex', overflow: 'hidden', justifyContent: 'center' }}
      >
        {letters.map((letter, index) => (
          <motion.span key={index} variants={item} style={{ display: 'inline-block', whiteSpace: 'pre' }}>
            {letter}
          </motion.span>
        ))}
      </motion.div>
      <div className="splash-loading-container" style={{ background: '#E2E8F0', height: '3px', width: '120px', marginTop: '16px' }}>
        <motion.div 
          className="splash-loading-bar"
          style={{ background: '#000000', height: '100%' }}
          initial={{ width: "0%", x: "-100%" }}
          animate={{ width: ["0%", "50%", "100%"], x: ["-100%", "0%", "100%"] }}
          transition={{ duration: 2.0, ease: "easeInOut", repeat: Infinity }}
        />
      </div>
      <motion.div 
        className="splash-tagline"
        initial={{ opacity: 0, letterSpacing: '0px', y: 10 }}
        animate={{ opacity: 0.5, letterSpacing: '4px', y: 0 }}
        transition={{ delay: 1, duration: 1.2, ease: "easeOut" }}
        style={{ color: '#000000', marginTop: '24px', fontSize: '11px', fontWeight: '800' }}
      >
        LEARNING & PRODUCTIVITY
      </motion.div>
    </motion.div>
  );
};

// --- Custom Global Confirm Modal ---
const ConfirmModal = ({ title, message, onConfirm, onCancel, isDestructive = true }: any) => (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: '28px', width: '90%', maxWidth: '340px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', border: '1px solid var(--border)' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: isDestructive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: isDestructive ? '#EF4444' : '#3B82F6' }}>
          <AlertTriangle size={24} />
        </div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '900', color: 'var(--text-dark)' }}>{title}</h3>
        <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{message}</p>
      </div>
      <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
        <button onClick={onCancel} style={{ flex: 1, padding: '14px', background: 'var(--bg-main)', border: 'none', color: 'var(--text-dark)', borderRadius: '16px', fontWeight: '800', fontSize: '16px', cursor: 'pointer' }}>Cancel</button>
        <button onClick={() => { onConfirm(); onCancel(); }} style={{ flex: 1, padding: '14px', background: isDestructive ? '#EF4444' : 'var(--primary)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', boxShadow: isDestructive ? '0 8px 16px rgba(239, 68, 68, 0.25)' : '0 8px 16px rgba(90, 143, 123, 0.25)' }}>
          Confirm
        </button>
      </div>
    </motion.div>
  </div>
);

// --- Main Application Component ---

function AppContent() {
  const { user, loading: authLoading, signOut } = useAuth();
  const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=300&h=300&fit=crop';
  const [currentView, setCurrentView] = useState<View>(() => (localStorage.getItem('currentView') as View) || 'Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditSemesterModalOpen, setIsEditSemesterModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void; isDestructive?: boolean } | null>(null);
  const [editSemesterDate, setEditSemesterDate] = useState('');
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    try { return JSON.parse(localStorage.getItem('cached_tasks') || '[]'); } catch { return []; }
  });
  const [stats, setStats] = useState(mockStats);
  const [bookViewer, setBookViewer] = useState<{ book: any; stage: 'opening' | 'reading' } | null>(null);

  const openBook = useCallback((book: any) => {
    setBookViewer({ book, stage: 'opening' });
    setTimeout(() => setBookViewer({ book, stage: 'reading' }), 1400);
  }, []);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');
  const [groups, setGroups] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('cached_books') || '[]'); } catch { return []; }
  });
  const [activeGroup, setActiveGroup] = useState<any | null>(null);
  const [groupMessages, setGroupMessages] = useState<any[]>([]);
  const [newGroupMsg, setNewGroupMsg] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [selectedChatFile, setSelectedChatFile] = useState<File | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toDateString());
  const [userSearchText, setUserSearchText] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);

  const libraryFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const [motivationQuote, setMotivationQuote] = useState('');
  const [dailyTips, setDailyTips] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem('focus_streak') || '0', 10));

  // Focus Streak tracking logic
  useEffect(() => {
    if (!user) return;
    const today = new Date().toDateString();
    const lastOpened = localStorage.getItem('last_opened_date');
    if (lastOpened !== today) {
      if (lastOpened) {
        const lastDate = new Date(lastOpened);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          const newStreak = Math.min(streak + 1, 7); // Max visually is 7 mapping to M-S
          setStreak(newStreak);
          localStorage.setItem('focus_streak', newStreak.toString());
        } else if (diffDays > 1) {
          setStreak(1);
          localStorage.setItem('focus_streak', '1');
        }
      } else {
        setStreak(1);
        localStorage.setItem('focus_streak', '1');
      }
      localStorage.setItem('last_opened_date', today);
    }
  }, [user, streak]);

  // Request Notification Permissions on load
  useEffect(() => {
    const initNotifications = async () => {
      try {
        const permStatus = await LocalNotifications.checkPermissions();
        if (permStatus.display !== 'granted') {
          await LocalNotifications.requestPermissions();
        }
      } catch (e) {
        console.warn('Wait, Notifications are not available in pure web.', e);
      }
    };
    initNotifications();
  }, []);
  const [studySession, setStudySession] = useState<{ status: 'idle' | 'focus' | 'break' | 'paused', secondsLeft: number, totalSeconds: number, mode: 'focus' | 'break' }>({ status: 'idle', secondsLeft: 1500, totalSeconds: 1500, mode: 'focus' });
  const [timetable, setTimetable] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('cached_timetable') || '[]'); } catch { return []; }
  });
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);



  // Pomodoro Timer Logic
  useEffect(() => {
    let interval: any;
    if (studySession.status === 'focus' || studySession.status === 'break') {
      if (studySession.secondsLeft > 0) {
        interval = setInterval(() => {
          setStudySession(prev => ({ ...prev, secondsLeft: prev.secondsLeft - 1 }));
        }, 1000);
      } else {
        // Session complete
        if (studySession.status === 'focus') {
          // Finished a focus session! Save to DB.
          if (user) {
            supabase.from('profiles').select('study_minutes, xp').eq('id', user.id).single().then(({ data }) => {
              if (data) {
                const newMins = (data.study_minutes || 0) + 25;
                const newXp = (data.xp || 0) + 50;
                supabase.from('profiles').update({ study_minutes: newMins, xp: newXp }).eq('id', user.id).then();
              }
            });
          }
          setStudySession({ status: 'break', secondsLeft: 300, totalSeconds: 300, mode: 'break' });
        } else {
          setStudySession({ status: 'idle', secondsLeft: 1500, totalSeconds: 1500, mode: 'focus' });
        }
      }
    }
    return () => clearInterval(interval);
  }, [studySession.status, studySession.secondsLeft, user]);

  const toggleStudySession = () => {
    setStudySession(prev => {
      if (prev.status === 'idle') return { ...prev, status: 'focus', secondsLeft: 1500, totalSeconds: 1500, mode: 'focus' };
      if (prev.status === 'paused') return { ...prev, status: prev.mode }; // resume
      return { ...prev, status: 'paused' }; // pause running session
    });
  };

  const resetStudySession = () => {
    setStudySession({ status: 'idle', secondsLeft: 1500, totalSeconds: 1500, mode: 'focus' });
  };

  const formatTimeMatrix = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  // --- Real-Time Semester Countdown (offline-safe) ---
  useEffect(() => {
    // Start a persistent 1-second ticker that always reads the best available date
    const tick = () => {
      const targetStr = stats.semester_target_date || localStorage.getItem('semester_target_date');
      if (!targetStr) return;
      const dist = new Date(targetStr).getTime() - Date.now();
      if (dist < 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(dist / 86400000),
          hours: Math.floor((dist % 86400000) / 3600000),
          mins: Math.floor((dist % 3600000) / 60000),
          secs: Math.floor((dist % 60000) / 1000)
        });
      }
    };
    tick(); // run immediately
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [stats.semester_target_date]); // re-run when DB value arrives

  // Persistence Effect
  useEffect(() => {
    localStorage.setItem('currentView', currentView);
    if (activeGroup) {
      localStorage.setItem('lastActiveGroupId', activeGroup.id);
    } else {
      localStorage.removeItem('lastActiveGroupId');
    }
    
    if (activeChat) {
      localStorage.setItem('lastActiveChatId', activeChat.id);
    } else {
      localStorage.removeItem('lastActiveChatId');
    }

    // Removed duplicate updateStatusBar call that caused loop

  }, [currentView, activeGroup, activeChat, theme]);

  // Hydration Effects
  useEffect(() => {
    if (groups.length > 0 && !activeGroup) {
      const savedId = localStorage.getItem('lastActiveGroupId');
      if (savedId) {
        const savedGroup = groups.find(g => g.id === savedId);
        if (savedGroup) enterGroup(savedGroup);
      }
    }
  }, [groups]);

  useEffect(() => {
    if (conversations.length > 0 && !activeChat) {
      const savedId = localStorage.getItem('lastActiveChatId');
      if (savedId) {
        const savedChat = conversations.find(c => c.id === savedId);
        if (savedChat) setActiveChat(savedChat);
      }
    }
  }, [conversations]);

  useEffect(() => {
    if (user) {
      fetchData();
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (activeChat) fetchMessages(activeChat.id);
  }, [activeChat]);

  // Early StatusBar Sync to fix 'grey bar' issue and adapt to Edge-to-Edge full screen
  useEffect(() => {
    const initStatusBar = async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: true });
        await StatusBar.setStyle({ style: theme === 'dark' ? Style.Dark : Style.Light });
        // Background color is ignored when overlay is true, but kept for fallback
        await StatusBar.setBackgroundColor({ color: theme === 'dark' ? '#000000' : '#ffffff' });
      } catch (e) {
        console.warn('StatusBar not available', e);
      }
    };
    initStatusBar();
  }, [theme]);

  let fetchCount = 0; const fetchData = async () => { fetchCount++; if (fetchCount > 5) { console.error('INFINITE LOOP DETECTED. ABORTING FETCH'); debugger; return; }
    if (!user) return;

    // A single failure shouldn't crash the app (White Screen prevention)
    const safeFetch = async (label: string, task: () => Promise<void>) => {
      try { await task(); } 
      catch (e) { console.error(`Failed to fetch ${label}:`, e); }
    };

    await safeFetch('tasks', async () => {
      const { data } = await supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data) {
        setTasks(data);
        localStorage.setItem('cached_tasks', JSON.stringify(data));
      }
    });

    await safeFetch('library', async () => {
      const { data } = await supabase.from('library_books').select('*, profiles:uploaded_by(full_name)').order('created_at', { ascending: false });
      if (data) {
        setBooks(data);
        localStorage.setItem('cached_books', JSON.stringify(data));
      }
    });

    await safeFetch('timetable', async () => {
      const { data: timetableData, error: ttError } = await supabase.from('class_timetable').select('*').order('start_time', { ascending: true });
      if (ttError) { console.error('TIMETABLE FETCH ERROR:', JSON.stringify(ttError)); return; }
      if (timetableData) {
        setTimetable(timetableData);
        localStorage.setItem('cached_timetable', JSON.stringify(timetableData));
        
        // Native Notifications
        try {
          const daysArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const today = daysArray[new Date().getDay()];
          const todaysClasses = timetableData.filter((t: any) => t.day === today);
          await LocalNotifications.cancel({ notifications: await LocalNotifications.getPending().then(p => p.notifications) });
          
          let notifId = 1;
          const classNotifs = todaysClasses.flatMap((cls: any) => {
            const timeStr = typeof cls.time === 'string' ? cls.time : '08:00';
            const timeMatch = timeStr.match(/\d{1,2}:\d{2}/);
            const extractedTime = timeMatch ? timeMatch[0] : '08:00';
            const [h, m] = extractedTime.split(':').map(Number);
            const notifs = [];
            
            // 15 Mins
            let d15 = new Date(); d15.setHours(h, m, 0, 0); d15.setMinutes(d15.getMinutes() - 15);
            if (d15.getTime() > Date.now()) notifs.push({ title: 'Upcoming Class ðŸŽ“', body: `${cls.class || cls.subject} starts in 15m`, id: notifId++, schedule: { at: d15 } });
            
            // 5 Mins
            let d5 = new Date(); d5.setHours(h, m, 0, 0); d5.setMinutes(d5.getMinutes() - 5);
            if (d5.getTime() > Date.now()) notifs.push({ title: 'Class Soon â³', body: `${cls.class || cls.subject} starts in 5m`, id: notifId++, schedule: { at: d5 } });
            
            return notifs;
          });

          if (classNotifs.length > 0) await LocalNotifications.schedule({ notifications: classNotifs });
        } catch (e) {}
      }
    });

    await safeFetch('groups', async () => {
      const { data: userGroups } = await supabase.from('group_members').select('group_id').eq('user_id', user.id);
      const ids = userGroups?.map(m => m.group_id) || [];
      if (ids.length > 0) {
        const { data } = await supabase.from('groups').select('*, group_members(*, profiles(*))').in('id', ids);
        if (data) setGroups(data);
      } else {
        setGroups([]);
      }
    });

    await safeFetch('profile', async () => {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (!profileData) return;

      // Semester Target
      let targetDateStr = profileData.semester_target_date;
      if (!targetDateStr) {
        const newTarget = new Date(); newTarget.setDate(newTarget.getDate() + 125);
        targetDateStr = newTarget.toISOString();
        await supabase.from('profiles').update({ semester_target_date: targetDateStr }).eq('id', user.id);
      }
      localStorage.setItem('semester_target_date', targetDateStr);

      setStats(prev => ({
        ...prev,
        name: profileData.full_name || prev.name,
        username: profileData.username || prev.username,
        course: profileData.course || prev.course,
        avatar_url: profileData.avatar_url || null,
        is_verified: true,
        is_admin: user.email === 'meshackurassa2@gmail.com',
        semester_target_date: targetDateStr
      }));
    });

    // Fetch daily tips (admin-managed motivational words)
    try {
      const { data: tipsData } = await supabase.from('daily_tips').select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (tipsData && tipsData.length > 0) {
        setDailyTips(tipsData);
        // Pick a random tip for today
        const todayIndex = new Date().getDate() % tipsData.length;
        setMotivationQuote(tipsData[todayIndex].content + (tipsData[todayIndex].author ? ` â€” ${tipsData[todayIndex].author}` : ''));
      }
    } catch (e) { console.warn('daily_tips fetch error', e); }

    setTimeout(() => setLoading(false), 2000);
  };


  const uploadAvatar = async (file: File) => {
    if (!user) return;
    try {
      const filePath = `${user.id}/avatar_${Date.now()}`;
      await supabase.storage.from('avatars').upload(filePath, file);
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const addTask = async (title: string, description: string, time: string, date: string) => {
    if (!user) return;
    await supabase.from('tasks').insert({ user_id: user.id, title, description, time: time || '12:00 PM', task_date: date });
    fetchData();
  };

  const deleteTask = async (id: string, newProgress?: number) => {
    if (newProgress !== undefined) {
      // Optimistic update for progress
      setTasks(prev => prev.map(t => t.id === id ? { ...t, progress: newProgress } : t));
      const updatedTasks = tasks.map(t => t.id === id ? { ...t, progress: newProgress } : t);
      const avgProgress = updatedTasks.reduce((acc, t) => acc + (t.progress || 0), 0) / (updatedTasks.length || 1);
      const calculatedGpa = ((avgProgress / 100) * 4).toFixed(1);
      setStats(prev => ({ ...prev, gpa: calculatedGpa }));

      const { error } = await supabase.from('tasks').update({ progress: newProgress }).eq('id', id);
      if (error) {
        alert(`Supabase Error updating progress: ${error.message}`);
        fetchData(); // revert
      }
      return;
    }

    // Optimistic delete
    setTasks(prev => prev.filter(t => t.id !== id));
    const { data, error } = await supabase.from('tasks').delete().eq('id', id).select();
    if (error || !data || data.length === 0) {
      alert(`Supabase Delete Failed! \n${error?.message || "Zero rows deleted. Ensure your Supabase 'tasks' table has a DELETE RLS Policy!"}`);
      fetchData(); // revert
    }
  };

  const completeTask = async (id: string) => {
    if (!user) return;
    try {
      // Optimistic UI update: instantly check it off locally for a fast snappy response
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t));
      
      // Attempt update in database
      const { data, error } = await supabase.from('tasks').update({ completed: true }).eq('id', id).select();
      
      if (error || !data || data.length === 0) {
        // If it actually fails or RLS blocked it silently, reload original data
        fetchData();
        alert(`Supabase Update Failed! \n${error?.message || "Zero rows updated. Your Supabase 'tasks' table is missing an UPDATE RLS Policy!"}`);
        throw new Error('Update failed');
      }
      
      // Award +10 XP
      supabase.from('profiles').select('xp').eq('id', user.id).single().then(({ data: pData }) => {
        if (pData) {
          supabase.from('profiles').update({ xp: (pData.xp || 0) + 10 }).eq('id', user.id).then();
        }
      });
      
      // Automatically refresh external metrics
      fetchData(); 
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  const updateSemesterTarget = async () => {
    if (!user || !editSemesterDate) return;
    try {
      const targetDate = new Date(editSemesterDate).toISOString();
      await supabase.from('profiles').update({ semester_target_date: targetDate }).eq('id', user.id);
      setIsEditSemesterModalOpen(false);
      fetchData(); 
    } catch(err) {
      console.error(err);
    }
  };




  const fetchConversations = async () => {
    if (!user) return;
    const { data: convs } = await supabase.from('conversations').select('*').contains('participants', [user.id]);
    if (convs) {
      const otherIds = convs.flatMap(c => c.participants.filter((p: string) => p !== user.id));
      const { data: profiles } = await supabase.from('profiles').select('*').in('id', otherIds);
      setConversations(convs.map(c => {
        const other = profiles?.find(p => c.participants.includes(p.id) && p.id !== user.id);
        return { id: c.id, name: other?.full_name || 'Member', avatar: other?.avatar_url || DEFAULT_AVATAR, lastMessage: c.last_message_text, time: 'Now' };
      }));
    }
  };

  const fetchMessages = async (id: string) => {
    const { data } = await supabase.from('messages').select('*').eq('conversation_id', id).order('created_at', { ascending: true });
    if (data) setChatMessages(data);
  };

  const sendMessage = async () => {
    if (!user || !activeChat) return;
    if (!newMessage.trim() && !selectedChatFile) return;

    // Optimistic update — show message instantly in the UI
    const tempId = `temp_${Date.now()}`;
    const tempMsg: any = {
      id: tempId,
      conversation_id: activeChat.id,
      sender_id: user.id,
      content: newMessage.trim() || null,
      file_url: null,
      file_type: null,
      file_name: null,
      created_at: new Date().toISOString(),
    };
    setChatMessages(prev => [...prev, tempMsg]);
    setNewMessage('');
    setSelectedChatFile(null);

    let attachmentUrl: string | null = null;
    let attachmentType: string | null = null;
    let attachmentName: string | null = null;
    const fileToUpload = selectedChatFile; // captured before state clear

    if (fileToUpload) {
      const cleanName = fileToUpload.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      attachmentName = fileToUpload.name;
      const path = `${user.id}/${Date.now()}_${cleanName}`;
      const { error: uploadErr } = await supabase.storage.from('chat-attachments').upload(path, fileToUpload);
      if (uploadErr) {
        // Remove optimistic msg and show error
        setChatMessages(prev => prev.filter(m => m.id !== tempId));
        alert('Upload failed: ' + uploadErr.message);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('chat-attachments').getPublicUrl(path);
      attachmentUrl = publicUrl;
      attachmentType = fileToUpload.type.startsWith('image/') ? 'image' : 'document';
    }

    const { data: inserted, error: insertErr } = await supabase.from('messages').insert({
      conversation_id: activeChat.id,
      sender_id: user.id,
      content: tempMsg.content,
      file_url: attachmentUrl,
      file_type: attachmentType,
      file_name: attachmentName,
    }).select().single();

    if (insertErr) {
      // Remove optimistic message and show error
      setChatMessages(prev => prev.filter(m => m.id !== tempId));
      alert('Failed to send message: ' + insertErr.message);
    } else {
      // Replace optimistic msg with real one from DB
      setChatMessages(prev => prev.map(m => m.id === tempId ? inserted : m));
    }
  };

  const deleteMessage = async (msgId: string) => {
    if (!user || !activeChat) return;
    
    // First, verify the message exists and belongs to the user
    const msg = chatMessages.find(m => m.id === msgId);
    if (!msg) return;
    if (msg.sender_id !== user.id) {
      alert("You can only delete your own messages.");
      return;
    }

    // Optimistically remove from UI immediately
    setChatMessages(prev => prev.filter(m => m.id !== msgId));
    
    // Perform deletion
    const { data, error, count } = await supabase
      .from('messages')
      .delete({ count: 'exact' })
      .eq('id', msgId)
      .eq('sender_id', user.id);
      
    if (error) {
      console.error('Delete failed:', error.message);
      fetchMessages(activeChat.id);
      alert('Failed to delete message: ' + error.message);
    } else if (count === 0) {
      console.warn('No rows deleted. Likely blocked by RLS or msg not found.');
      fetchMessages(activeChat.id);
      alert('Message could not be deleted from the server (RLS blocked).');
    }
  };

  const deleteConversation = async (convId: string) => {
    setConfirmDialog({
      title: 'Delete Chat',
      message: 'Are you sure you want to delete this conversation? This cannot be undone.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const { error } = await supabase.from('conversations').delete().eq('id', convId);
          if (error) throw error;
          setConversations(prev => prev.filter(c => c.id !== convId));
          if (activeChat?.id === convId) setActiveChat(null);
        } catch (err: any) {
          console.error('Failed to delete chat:', err);
          alert('Error deleting chat: ' + err.message);
        }
      }
    });
  };

  const searchUsers = async (query: string) => {
    setUserSearchText(query);
    if (query.trim().length < 2) {
      setUserSearchResults([]);
      return;
    }
    const { data } = await supabase.from('profiles')
      .select('id, full_name, avatar_url, username')
      .neq('id', user?.id)
      .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
      .limit(5);
    setUserSearchResults(data || []);
  };

  const startConversation = async (profile: any) => {
    if (!user) return;
    // Check if conversation exists (participants is an array, we check if it contains BOTH)
    const { data: convs } = await supabase.from('conversations').select('*').contains('participants', [user.id, profile.id]);
    
    let conv;
    if (convs && convs.length > 0) {
      conv = convs[0];
    } else {
      const { data: newConv } = await supabase.from('conversations').insert({ participants: [user.id, profile.id] }).select().single();
      conv = newConv;
    }

    if (conv) {
      setUserSearchText('');
      setUserSearchResults([]);
      setActiveChat({ id: conv.id, name: profile.full_name, avatar: profile.avatar_url });
      fetchConversations();
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim() || !user) return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data } = await supabase.from('groups').insert({ name: newGroupName, join_code: code, created_by: user.id }).select().single();
    if (data) {
      await supabase.from('group_members').insert({ group_id: data.id, user_id: user.id });
      fetchData();
      setNewGroupName('');
    }
  };

  const joinGroup = async () => {
    if (!joinCodeInput.trim() || !user) return;
    const { data: group } = await supabase.from('groups').select('*').eq('join_code', joinCodeInput).single();
    if (group) {
      // Check if already a member/pending
      const { data: existing } = await supabase.from('group_members').select('*').eq('group_id', group.id).eq('user_id', user.id).single();
      if (existing) {
        alert(existing.status === 'pending' ? "Join request is still pending admin approval." : "You are already a member of this squad.");
        setJoinCodeInput('');
        return;
      }

      const { error } = await supabase.from('group_members').insert({ group_id: group.id, user_id: user.id, status: 'pending' });
      if (error) {
        alert("Error joining group: " + error.message);
      } else {
        alert("Join request sent! Waiting for admin approval.");
        fetchData();
        setJoinCodeInput('');
      }
    } else {
      alert("Invalid join code. Please try again.");
    }
  };

  const deleteGroup = async (groupId: string) => {
    if (!user) return;
    setConfirmDialog({
      title: 'Delete Squad',
      message: 'Are you sure you want to delete this Study Squad? This action cannot be undone.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const { error } = await supabase.from('groups').delete().eq('id', groupId);
          if (error) throw error;
          if (activeGroup?.id === groupId) setActiveGroup(null);
          setGroups(prev => prev.filter(g => g.id !== groupId));
          fetchData();
        } catch (err: any) {
          console.error('Failed to delete squad:', err);
          alert('Error deleting squad: ' + err.message);
        }
      }
    });
  };

  const enterGroup = async (group: any) => {
    const myMember = group.group_members?.find((m: any) => m.user_id === user?.id);
    if (!myMember) return;
    
    setActiveGroup(group);
    if (myMember.status === 'pending') return;

    const { data: msgs } = await supabase.from('group_messages').select('*, profiles(*)').eq('group_id', group.id).order('created_at', { ascending: true });
    if (msgs) setGroupMessages(msgs);
  };

  const sendGroupMessage = async () => {
    if (!newGroupMsg.trim() || !user || !activeGroup) return;
    await supabase.from('group_messages').insert({ group_id: activeGroup.id, sender_id: user.id, content: newGroupMsg.trim() });
    setNewGroupMsg('');
    enterGroup(activeGroup);
  };

  const uploadBook = async (file: File, metadata: any) => {
    if (!user) return;
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const path = `books/${Date.now()}_${cleanName}`;
    const { error: uploadErr } = await supabase.storage.from('digital-library').upload(path, file);
    if (uploadErr) throw new Error(`Storage Error: ${uploadErr.message}`);
    
    const { data: { publicUrl } } = supabase.storage.from('digital-library').getPublicUrl(path);
    const { error: dbErr } = await supabase.from('library_books').insert({ 
      title: metadata.title, 
      description: metadata.description,
      pages: metadata.pages,
      category: metadata.category,
      file_url: publicUrl, 
      uploaded_by: user.id
    });
    if (dbErr) throw new Error(`DB Error: ${dbErr.message}`);
    
    fetchData();
  };

  const deleteBook = async (book: any) => {
    if (!user) return;
    setConfirmDialog({
      title: 'Delete Document',
      message: `Are you sure you want to delete "${book.title}"? This cannot be undone.`,
      isDestructive: true,
      onConfirm: async () => {
        try {
          // 1. Delete DB record
          const { error: dbErr } = await supabase.from('library_books').delete().eq('id', book.id);
          if (dbErr) throw new Error(`Database Delete Error: ${dbErr.message}`);
          
          // 2. Try to extract path from URL and delete from storage
          const urlParts = typeof book.file_url === 'string' ? book.file_url.split('/digital-library/') : [];
          if (urlParts.length > 1) {
            const filePath = urlParts[1];
            await supabase.storage.from('digital-library').remove([filePath]);
          }
          
          fetchData();
        } catch (err) {
          console.error('Failed to delete book:', err);
          alert('Failed to delete book. Please try again.');
        }
      }
    });
  };

  const deleteAllBooks = async () => {
    if (!user || !stats.is_admin) return;
    setConfirmDialog({
      title: 'Delete ALL Documents',
      message: 'Are you absolutely sure you want to wipe the ENTIRE Digital Library? This action cannot be undone.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const { error: dbErr } = await supabase.from('library_books').delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
          if (dbErr) throw dbErr;

          const { data: files } = await supabase.storage.from('digital-library').list('books');
          if (files && files.length > 0) {
            const paths = files.map(f => `books/${f.name}`);
            await supabase.storage.from('digital-library').remove(paths);
          }
          
          fetchData();
        } catch (err: any) {
          alert(`Error clearing library: ${err.message}`);
        }
      }
    });
  };

  const renderContent = () => {
    switch (currentView) {
      case 'Dashboard': return <DashboardView stats={stats} tasks={tasks} setCurrentView={setCurrentView} setIsAddModalOpen={setIsAddModalOpen} setIsSidebarOpen={setIsSidebarOpen} setIsEditSemesterModalOpen={setIsEditSemesterModalOpen} setIsNotificationsOpen={setIsNotificationsOpen} deleteTask={deleteTask} completeTask={completeTask} timeLeft={timeLeft} motivationQuote={motivationQuote} DEFAULT_AVATAR={DEFAULT_AVATAR} studySession={studySession} toggleStudySession={toggleStudySession} resetStudySession={resetStudySession} formatTimeMatrix={formatTimeMatrix} timetable={timetable} streak={streak} />;
      case 'Journal': return <JournalView setCurrentView={setCurrentView} setConfirmDialog={setConfirmDialog} />;
      case 'Tasks': return <TasksView tasks={tasks} completeTask={completeTask} deleteTask={deleteTask} />;
      case 'Timetable': return <TimetableView timetable={timetable} stats={stats} fetchTimetable={fetchData} setConfirmDialog={setConfirmDialog} />;
      case 'Digital Library': return <LibraryView books={books} stats={stats} uploadBook={uploadBook} onDeleteBook={deleteBook} onDeleteAll={deleteAllBooks} onOpenBook={openBook} />;
      case 'Workspace': return <AssignmentWorkspace userProfile={stats} />;
      case 'GPA Calculator': return <div className="view-content"><GPACalculator user={user} /></div>;
      case 'Leaderboard': return <div className="view-content"><Leaderboard currentUser={stats} /></div>;
      case 'Flashcards': return <div className="view-content"><Flashcards user={user} /></div>;
      case 'Settings': return <SettingsView theme={theme} setTheme={setTheme} stats={stats} dailyTips={dailyTips} onTipsChanged={fetchData} />;
      case 'Groups': {
        if (!activeGroup) return (
          <div className="view-content">
            <div style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '24px', color: 'var(--text-dark)', marginBottom: '20px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '20px', fontWeight: '900', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={24} color="var(--primary)" /> Study Squads
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="New Squad Name" style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: '14px' }} />
                <button onClick={createGroup} style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '0 20px', borderRadius: '12px', fontWeight: '700' }}>Create</button>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={joinCodeInput} onChange={e => setJoinCodeInput(e.target.value)} placeholder="Join Code" style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: '14px' }} />
                <button onClick={joinGroup} style={{ background: 'var(--text-dark)', border: 'none', color: 'white', padding: '0 20px', borderRadius: '12px', fontWeight: '700' }}>Join</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {groups.map(g => {
                const myMemberStatus = g.group_members?.find((m: any) => m.user_id === user?.id)?.status;
                const isAdmin = g.created_by === user?.id;
                
                return (
                  <div key={g.id} onClick={() => enterGroup(g)} style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)', cursor: 'pointer', opacity: myMemberStatus === 'pending' ? 0.7 : 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontWeight: '700' }}>{g.name}</div>
                        {myMemberStatus === 'pending' && (
                          <div style={{ fontSize: '10px', background: '#F59E0B', color: 'white', padding: '2px 6px', borderRadius: '6px', fontWeight: '800' }}>PENDING</div>
                        )}
                      </div>
                      {isAdmin && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteGroup(g.id); }}
                          style={{ background: 'none', border: 'none', color: '#EF4444', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.8 }}
                          title="Delete Squad"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {(g.group_members?.slice(0, 4) || []).map((m: any, i: number) => (
                        <img key={m.user_id} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.user_id}`} style={{ width: '26px', height: '26px', borderRadius: '50%', border: '2px solid var(--bg-card)', marginLeft: i > 0 ? '-8px' : '0', zIndex: 5 - i }} />
                      ))}
                      {g.group_members?.length > 0 && (
                        <div style={{ fontSize: '11px', marginLeft: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {g.group_members.length} {g.group_members.length === 1 ? 'Member' : 'Members'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

        const myMemberStatus = activeGroup.group_members?.find((m: any) => m.user_id === user?.id)?.status;
        const isAdmin = activeGroup.created_by === user?.id;
        const pendingRequests = activeGroup.group_members?.filter((m: any) => m.status === 'pending');

        if (myMemberStatus === 'pending') {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-main)' }}>
              <div style={{ padding: '20px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => setActiveGroup(null)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ArrowLeft size={16} /></button>
                <div style={{ fontWeight: '800', fontSize: '16px' }}>{activeGroup.name}</div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', padding: '20px', borderRadius: '50%', marginBottom: '24px' }}>
                  <Clock size={40} />
                </div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '12px' }}>Approval Pending</div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '280px' }}>
                  Your join request has been sent! The group administrator needs to approve your access before you can join the conversation.
                </div>
              </div>
            </div>
          );
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-main)', position: 'relative' }}>
            <div style={{ padding: '24px 20px', background: 'var(--bg-card)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10, position: 'sticky', top: 0 }}>
              <button onClick={() => setActiveGroup(null)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ArrowLeft size={16} /></button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontWeight: '800', fontSize: '18px' }}>{activeGroup.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--border)', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>#{activeGroup.join_code}</div>
              </div>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {isAdmin && pendingRequests?.length > 0 && (
                <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '24px', padding: '20px', marginBottom: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={18} color="var(--primary)" /> Join Requests ({pendingRequests.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {pendingRequests.map((req: any) => (
                      <div key={req.user_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-main)', padding: '12px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${req.user_id}`} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                          <div style={{ fontSize: '13px', fontWeight: '700' }}>User {req.user_id.substring(0, 5)}...</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={async () => {
                              await supabase.from('group_members').update({ status: 'approved' }).eq('group_id', activeGroup.id).eq('user_id', req.user_id);
                              fetchData();
                            }}
                            style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                          >
                            Approve
                          </button>
                          <button 
                            onClick={async () => {
                              await supabase.from('group_members').delete().eq('group_id', activeGroup.id).eq('user_id', req.user_id);
                              fetchData();
                            }}
                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {groupMessages.map(m => (
                <div key={m.id} style={{ alignSelf: m.sender_id === user?.id ? 'flex-end' : 'flex-start', background: m.sender_id === user?.id ? 'var(--primary)' : 'var(--bg-card)', color: m.sender_id === user?.id ? 'white' : 'var(--text-dark)', padding: '12px 18px', borderRadius: '18px 18px 4px 18px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '4px', fontWeight: '700', textTransform: 'uppercase' }}>{m.profiles?.full_name}</div>
                  <div style={{ fontSize: '15px' }}>{m.content}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '20px', display: 'flex', gap: '8px', background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
              <input value={newGroupMsg} onChange={e => setNewGroupMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendGroupMessage()} placeholder="Type a message..." style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid var(--border)', background: 'var(--bg-main)', outline: 'none' }} />
              <button onClick={sendGroupMessage} style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '24px', border: 'none', fontWeight: '800' }}>Send</button>
            </div>
          </div>
        );
      }
      case 'Messages': return activeChat ? (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-main)', position: 'relative' }}>
          <div style={{ padding: '20px', background: 'var(--bg-card)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10, position: 'sticky', top: 0 }}>
            <button onClick={() => setActiveChat(null)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ArrowLeft size={16} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={activeChat.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChat.name}`} onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChat.name}` }} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ fontWeight: '800', fontSize: '16px' }}>{activeChat.name}</div>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {chatMessages.map(m => {
              const url = m.file_url || m.attachment_url;
              const type = m.file_type || m.attachment_type;
              return (
              <div key={m.id} style={{ 
                alignSelf: m.sender_id === user?.id ? 'flex-end' : 'flex-start', 
                background: m.sender_id === user?.id ? 'var(--primary)' : 'var(--bg-card)', 
                color: m.sender_id === user?.id ? 'white' : 'var(--text-dark)', 
                padding: url ? '10px' : '12px 18px', 
                borderRadius: m.sender_id === user?.id ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxWidth: '75%',
                border: '1px solid var(--border)',
                minWidth: url ? '200px' : 'auto'
              }}>
                {m.sender_id === user?.id && (
                  <button 
                    onClick={() => deleteMessage(m.id)}
                    style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '-32px', background: 'rgba(239,68,68,0.1)', border: 'none', padding: '6px', cursor: 'pointer', color: '#EF4444', borderRadius: '50%', display: 'flex', opacity: 0.8 }}
                    title="Delete Message"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                {url && (
                  type === 'image' ? (
                    <img src={url} style={{ maxWidth: '100%', height: 'auto', borderRadius: '12px' }} alt="attachment" />
                  ) : (
                    <a href={url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: m.sender_id === user?.id ? 'white' : 'var(--primary)', textDecoration: 'none', background: m.sender_id === user?.id ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', padding: '12px', borderRadius: '10px', width: '100%' }}>
                      <FileText size={20} />
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>View Document</span>
                    </a>
                  )
                )}
                {m.content && <div style={{ padding: url ? '0 6px 6px' : '0', fontSize: '15px', lineHeight: '1.4', wordBreak: 'break-word' }}>{m.content}</div>}
              </div>
            )})}
          </div>
          <div style={{ padding: '20px', background: 'var(--bg-card)', backdropFilter: 'blur(10px)', borderTop: '1px solid var(--border)' }}>
            {selectedChatFile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', padding: '10px 14px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border)', width: 'max-content', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                {selectedChatFile.type.startsWith('image/') ? <ImageIcon size={18} color="var(--primary)" /> : <FileText size={18} color="var(--primary)" />}
                <span style={{ fontSize: '13px', fontWeight: '500', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedChatFile.name}</span>
                <button onClick={() => setSelectedChatFile(null)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}><X size={16} /></button>
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '24px', padding: '6px 6px 6px 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', transition: '0.2s', padding: '4px' }}>
                <input type="file" style={{ display: 'none' }} accept="image/*,.pdf,.doc,.docx" onChange={e => { if (e.target.files && e.target.files[0]) setSelectedChatFile(e.target.files[0]) }} />
                <Paperclip size={20} />
              </label>
              <input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendMessage() }} placeholder="Send a message..." style={{ flex: 1, padding: '10px 0', border: 'none', background: 'transparent', outline: 'none', fontSize: '15px' }} />
              <button 
                onClick={sendMessage} 
                disabled={!newMessage.trim() && !selectedChatFile} 
                style={{ background: (!newMessage.trim() && !selectedChatFile) ? 'var(--border)' : 'var(--primary)', color: 'white', padding: '10px 20px', borderRadius: '20px', border: 'none', fontWeight: '600', cursor: (!newMessage.trim() && !selectedChatFile) ? 'default' : 'pointer', transition: '0.2s' }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="view-content" style={{ paddingBottom: '100px' }}>
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <div className="lib-search-bar" style={{ marginTop: '0', background: 'var(--bg-card)' }}>
              <Search size={18} color="var(--text-muted)" />
              <input 
                type="text" 
                className="lib-search-input" 
                placeholder="Find people to chat with..." 
                value={userSearchText} 
                onChange={(e) => searchUsers(e.target.value)} 
              />
            </div>
            {userSearchResults.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-main)', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 50, border: '1px solid var(--border)', marginTop: '8px', overflow: 'hidden' }}>
                {userSearchResults.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => startConversation(p)}
                    style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                  >
                    <img src={p.avatar_url || DEFAULT_AVATAR} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>{p.full_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{p.username}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="chat-list">
            {conversations.map(c => (
              <div key={c.id} onClick={() => setActiveChat({ id: c.id, name: c.name })} className="chat-item" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <img src={c.avatar} className="chat-avatar" style={{ borderRadius: '50%' }} />
                <div className="chat-info" style={{ flex: 1 }}>
                  <div className="chat-name">{c.name} <span style={{ fontSize: '11px', fontWeight: '400', opacity: 0.6 }}>{c.time}</span></div>
                  <div className="chat-msg">{c.lastMessage}</div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                  style={{ background: 'none', border: 'none', color: '#EF4444', padding: '8px', cursor: 'pointer', opacity: 0.8 }}
                  title="Delete Chat"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      );
      case 'Calendar': {
        const weekDates = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(); d.setDate(d.getDate() + (i - 3));
          const dayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
          const dateNum = d.getDate();
          return { day: dayShort, num: dateNum, full: d.toDateString() };
        });
        
        const selectedDateObj = new Date(selectedDate);
        const dayLong = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDateObj.getDay()];
        const monthLong = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][selectedDateObj.getMonth()];
        const year = selectedDateObj.getFullYear();
        
        const currentMonthStr = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(selectedDateObj);
        const nextMonthObj = new Date(selectedDateObj); nextMonthObj.setMonth(nextMonthObj.getMonth() + 1);
        const nextMonthStr = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(nextMonthObj);

        return (
          <div className="view-content" style={{ padding: '0 24px 100px' }}>
            {/* Month Switcher */}
            <div style={{ display: 'flex', gap: '30px', marginBottom: '24px' }}>
              <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-dark)' }}>{currentMonthStr}</span>
              <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-muted)' }}>{nextMonthStr}</span>
            </div>

            {/* Date Strip */}
            <div className="dates-row" style={{ marginBottom: '36px', overflowX: 'auto', gap: '12px' }}>
              {weekDates.map(d => (
                <div key={d.full} onClick={() => setSelectedDate(d.full)} className={`date-item ${d.full === selectedDate ? 'active' : ''}`} style={{ 
                  flexDirection: 'column', 
                  height: '80px', 
                  minWidth: '56px', 
                  borderRadius: '16px',
                  justifyContent: 'center'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{d.num}</div>
                  <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>{d.day}</div>
                </div>
              ))}
            </div>

            {/* Selected Date Header */}
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '32px' }}>
              {dayLong} - {monthLong} {selectedDateObj.getDate()}, {year}
            </div>

            {/* Timeline View */}
            <div style={{ position: 'relative', paddingLeft: '40px' }}>
              <div style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '0', 
                bottom: '0', 
                width: '1.5px', 
                background: '#E5E7EB' 
              }} />
              
              {tasks.filter(t => t.task_date === selectedDate && !t.completed).map((t, i) => (
                <div key={t.id} style={{ position: 'relative', marginBottom: '24px' }} onClick={() => completeTask(t.id)}>
                  {/* Dot */}
                  <div style={{ 
                    position: 'absolute', 
                    left: '-34.5px', 
                    top: '6px', 
                    width: '14px', 
                    height: '14px', 
                    borderRadius: '50%', 
                    background: 'white', 
                    border: '2px solid #5A8F7B',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                    {t.completed && <CheckSquare size={8} color="#5A8F7B" />}
                  </div>
                  
                  {/* Event Content */}
                  {i === 0 ? (
                    /* Primary Green Card (Matches top item in screenshot) */
                    <div style={{ 
                      background: 'var(--primary)', 
                      borderRadius: '24px', 
                      padding: '24px', 
                      color: 'white',
                      boxShadow: '0 10px 25px rgba(90, 143, 123, 0.2)',
                      cursor: 'pointer'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {t.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', opacity: 0.9 }}>{t.time}</div>
                          <Trash2 size={16} style={{ cursor: 'pointer', opacity: 0.8 }} onClick={(e) => { e.stopPropagation(); deleteTask(t.id); }} />
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', opacity: 0.8, lineHeight: '1.5' }}>{t.description}</div>
                    </div>
                  ) : (
                    /* Secondary Row (Matches white entries in screenshot) */
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#111827', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {t.title}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.5' }}>{t.description}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '20px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>{t.time}</div>
                        <Trash2 size={16} color="#EF4444" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); deleteTask(t.id); }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {tasks.filter(t => t.task_date === selectedDate).length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '14px', paddingTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   Free Day <Sparkles size={14} color="var(--primary)" />
                </div>
              )}
            </div>
          </div>
        );
      }
      case 'Profile': return (
        <div className="view-content" style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 20px' }}>
            <img src={stats.avatar_url || DEFAULT_AVATAR} className="profile-img" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
            <div onClick={() => avatarFileInputRef.current?.click()} style={{ position: 'absolute', bottom: -5, right: -5, background: 'var(--primary)', color: 'white', padding: '6px', borderRadius: '50%', cursor: 'pointer' }}><Edit3 size={14} /></div>
            <input type="file" ref={avatarFileInputRef} style={{ display: 'none' }} onChange={e => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
          </div>
          <div style={{ fontSize: '22px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {stats.name}
            {stats.is_verified && <VerifiedBadge size={18} />}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '30px' }}>@{stats.username}</div>
          <div style={{ textAlign: 'left', background: 'var(--bg-card)', padding: '20px', borderRadius: '20px', border: '1px solid var(--border)', marginBottom: '30px' }}>
            <div className="stat-label" style={{ marginBottom: '4px' }}>COURSE</div>
            <div style={{ fontWeight: '700', marginBottom: '16px' }}>{stats.course}</div>
            <div className="stat-label" style={{ marginBottom: '4px' }}>EMAIL</div>
            <div style={{ fontWeight: '700' }}>{user?.email}</div>
          </div>
          <button onClick={signOut} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#FEE2E2', color: '#EF4444', border: 'none', fontWeight: '800' }}>Sign Out</button>
        </div>
      );
      default: return null;
    }
  };

  if (authLoading) return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loader2 className="animate-spin" color="var(--primary)" /></div>;
  if (!user) return <div className="phone-frame" style={{ display: 'flex', flexDirection: 'column' }}><Login /></div>;

  return (
    <div className={`phone-frame ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <AnimatePresence mode="wait">
        {loading ? <SplashScreen key="splash" /> : (
          <div key="app" style={{ height: '100%', position: 'relative', overflow: 'hidden', background: '#000' }}>
            
            {/* Sidebar (Bottom layer) */}
            <div className="sidebar-content">
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={stats.avatar_url || DEFAULT_AVATAR} className="profile-img" onClick={() => { setCurrentView('Profile'); setIsSidebarOpen(false); }} style={{ cursor: 'pointer' }} />
              </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '800', opacity: 0.5, letterSpacing: '1px' }}>
                Dapaz <Sparkles size={14} color="var(--primary)" />
              </div>
              <div className="name-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {stats?.name && typeof stats.name === 'string' ? stats.name.split(' ')[0] : (stats?.username || 'User')}
                {stats?.is_verified && <VerifiedBadge size={16} />}
              </div>
              
              <div className="nav-list">
                {[
                  { n: 'Dashboard', i: LayoutDashboard },
                  { n: 'Tasks', i: CheckSquare },
                  { n: 'Calendar', i: CalendarIcon },
                  { n: 'Timetable', i: Clock },
                  { n: 'Messages', i: MessageCircle },
                  { n: 'Groups', i: Users },
                  { n: 'Digital Library', i: BookOpen },
                  { n: 'Workspace', i: Edit2 },
                  { n: 'Flashcards', i: Layers },
                  { n: 'GPA Calculator', i: BookOpen },
                  { n: 'Leaderboard', i: Trophy },
                  { n: 'Settings', i: SettingsIcon },
                  { n: 'Profile', i: UserIcon },
                ].map(item => (
                  <div 
                    key={item.n} 
                    className={`nav-item ${currentView === item.n ? 'active' : ''}`}
                    onClick={() => { setCurrentView(item.n as View); setIsSidebarOpen(false); }}
                  >
                    <item.i size={20} /> {item.n}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.5, fontSize: '13px', cursor: 'pointer', marginBottom: '24px' }} onClick={signOut}>
                  <LogOut size={16} /> Sign Out
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '1px', textAlign: 'center', fontWeight: '700' }}>
                  Â© 2026 Soma ulipo â€¢ ALL RIGHTS RESERVED
                </div>
              </div>
            </div>

            {/* Main Content (Top Card layer) */}
            <motion.div 
              className="content-card"
              animate={{ 
                x: isSidebarOpen ? 280 : 0,
                scale: isSidebarOpen ? 0.85 : 1,
                borderRadius: isSidebarOpen ? '48px' : '0px',
                rotateY: isSidebarOpen ? -10 : 0
              }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              style={{ zIndex: 10 }}
            >
              <div className="view-header" style={{ padding: '16px 24px 20px' }}>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="icon-btn">
                  <Menu size={20} />
                </button>
                <div className="view-title">{currentView}</div>
                <div>
                   {currentView === 'Calendar' ? (
                     <button onClick={() => setIsAddModalOpen(true)} className="icon-btn" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '10px' }}>
                       <Plus size={20} color="var(--text-dark)" />
                     </button>
                   ) : <div style={{ width: '42px' }} />}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Book Opening Animation + PDF Viewer */}
            {bookViewer && (() => {
              const { book, stage } = bookViewer;
              const gradient = (() => {
                let hash = 0;
                for (let i = 0; i < book.title.length; i++) { hash = book.title.charCodeAt(i) + ((hash << 5) - hash); }
                const h1 = Math.abs(hash) % 360;
                const h2 = (h1 + 40) % 360;
                return `linear-gradient(135deg, hsl(${h1}, 60%, 35%) 0%, hsl(${h2}, 70%, 25%) 100%)`;
              })();
              const safeTitle = typeof book.title === 'string' ? book.title : 'Document';
              const initials = safeTitle.split(' ').slice(0, 2).map((w: string) => w[0] || '').join('').toUpperCase();

              if (stage === 'reading') {
                return (
                  <BookReader key={book.id} book={book} onClose={() => setBookViewer(null)} />
                );
              }

              // stage === 'opening'
              return (
                <div key="opening" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
                  <style>{`
                    @keyframes bookOpen {
                      0%   { transform: perspective(900px) rotateY(0deg); }
                      100% { transform: perspective(900px) rotateY(-160deg); }
                    }
                    @keyframes pageReveal {
                      0%   { opacity: 0; }
                      60%  { opacity: 0; }
                      100% { opacity: 1; }
                    }
                    @keyframes bookFloat {
                      0%, 100% { transform: translateY(0px); }
                      50% { transform: translateY(-8px); }
                    }
                    .book-spine { animation: bookFloat 2s ease-in-out infinite; }
                    .book-cover-flip { transform-origin: left center; animation: bookOpen 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards; animation-delay: 0.2s; }
                    .book-pages-reveal { animation: pageReveal 1.4s ease forwards; }
                  `}</style>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                    {/* 3D Book */}
                    <div className="book-spine" style={{ position: 'relative', width: '160px', height: '220px', transformStyle: 'preserve-3d' }}>
                      {/* Pages (back layer) */}
                      <div className="book-pages-reveal" style={{ position: 'absolute', inset: 0, background: '#f5f0e8', borderRadius: '0 8px 8px 0', boxShadow: 'inset -4px 0 8px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: '11px', color: '#888', textAlign: 'center', padding: '20px', lineHeight: '1.8' }}>
                          📖 Opening...<br/>
                          <span style={{ fontSize: '9px', opacity: 0.6 }}>Loading content</span>
                        </div>
                      </div>
                      {/* Front Cover (flips open) */}
                      <div className="book-cover-flip" style={{ position: 'absolute', inset: 0, background: gradient, borderRadius: '4px 8px 8px 4px', boxShadow: '4px 4px 20px rgba(0,0,0,0.5)', transformStyle: 'preserve-3d', backfaceVisibility: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px' }}>
                        <div style={{ fontSize: '42px', fontWeight: '900', color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{initials}</div>
                        <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: '1.4' }}>{book.title.length > 40 ? book.title.substring(0, 40) + 'â€¦' : book.title}</div>
                        <div style={{ position: 'absolute', left: '0', top: '0', bottom: '0', width: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '4px 0 0 4px' }} />
                      </div>
                      {/* Spine shadow */}
                      <div style={{ position: 'absolute', left: '-8px', top: '4px', bottom: '4px', width: '12px', background: 'rgba(0,0,0,0.4)', borderRadius: '4px 0 0 4px', filter: 'blur(2px)' }} />
                    </div>
                    {/* Label */}
                    <div style={{ color: 'white', fontWeight: '700', fontSize: '14px', textAlign: 'center', maxWidth: '200px', lineHeight: '1.4', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                      {book.title}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>Opening book...</div>
                  </div>
                </div>
              );
            })()}

            {/* Modals */}
            <AnimatePresence>
              {isAddModalOpen && <AddTaskModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={(title, desc, time, date) => { addTask(title, desc, time, date); setIsAddModalOpen(false); }} />}
        
              {isEditSemesterModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
                  <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '24px', width: '90%', maxWidth: '350px' }}>
                    <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Edit Semester Goal</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>Set the exact date and time your semester ends to update the countdown.</div>
                    <input 
                      type="datetime-local" 
                      value={editSemesterDate}
                      onChange={(e) => setEditSemesterDate(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '24px', background: 'var(--bg-main)' }} 
                    />
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => setIsEditSemesterModalOpen(false)} style={{ flex: 1, padding: '12px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '12px', fontWeight: '700' }}>Cancel</button>
                      <button onClick={updateSemesterTarget} style={{ flex: 1, padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700' }}>Save Goal</button>
                    </div>
                  </div>
                </div>
              )}

              {isNotificationsOpen && (() => {
                const daysArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const todayStr = daysArray[new Date().getDay()];
                const todaysClasses = (timetable || []).filter(t => t.day === todayStr);
                const pendingTasks = (tasks || []).filter(t => !t.completed);
                
                const realNotifications = [];
                if (todaysClasses.length > 0) {
                  realNotifications.push({ id: 'classes', icon: CalendarIcon, title: `You have ${todaysClasses.length} class${todaysClasses.length > 1 ? 'es' : ''} today`, subtitle: `First class: ${todaysClasses[0].subject} at ${todaysClasses[0].time}` });
                } else {
                  realNotifications.push({ id: 'classes', icon: CalendarIcon, title: 'No classes today', subtitle: 'Enjoy your free time!' });
                }
                
                if (pendingTasks.length > 0) {
                  realNotifications.push({ id: 'tasks', icon: CheckSquare, title: `${pendingTasks.length} pending task${pendingTasks.length > 1 ? 's' : ''}`, subtitle: 'Stay on top of your assignments.' });
                  const urgentTask = pendingTasks.find(t => t.deadline);
                  if (urgentTask) {
                    realNotifications.push({ id: 'urgent-task', icon: Bell, title: `Reminder: ${urgentTask.title}`, subtitle: `Due: ${urgentTask.deadline}` });
                  }
                } else {
                  realNotifications.push({ id: 'tasks', icon: CheckCircle2, title: 'All caught up!', subtitle: 'You have no pending tasks.' });
                }

                return (
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', flexDirection: 'column', backdropFilter: 'blur(5px)' }}>
                    <div style={{ flex: 1 }} onClick={() => setIsNotificationsOpen(false)}></div>
                    <div style={{ background: 'var(--bg-card)', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', padding: '24px', paddingBottom: '40px', minHeight: '60vh', boxShadow: '0 -20px 40px rgba(0,0,0,0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-dark)' }}>Notifications</div>
                        <button onClick={() => setIsNotificationsOpen(false)} style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', padding: '0 8px' }}>
                        {realNotifications.map((notif, index) => (
                          <div key={notif.id} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px 0', borderBottom: index < realNotifications.length - 1 ? '1px solid var(--border)' : 'none' }}>
                            <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '50%' }}><notif.icon size={18} color="var(--text-dark)" /></div>
                            <div>
                              <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-dark)' }}>{notif.title}</div>
                              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{notif.subtitle}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>

      {/* --- Global Confirm Modal Render --- */}
      {confirmDialog && (
        <ConfirmModal 
          title={confirmDialog.title} 
          message={confirmDialog.message} 
          onConfirm={confirmDialog.onConfirm} 
          onCancel={() => setConfirmDialog(null)} 
          isDestructive={confirmDialog.isDestructive} 
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;






