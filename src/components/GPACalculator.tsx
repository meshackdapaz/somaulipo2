import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Target, BookOpen, Plus, Trash2, TrendingUp, Sparkles, Loader2, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GPACalculator = ({ user }: { user: any }) => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseCode, setCourseCode] = useState('');
  const [credits, setCredits] = useState('');
  const [grade, setGrade] = useState('A');
  const [targetGPA, setTargetGPA] = useState('4.0');
  const [isAdding, setIsAdding] = useState(false);

  const gradePoints: Record<string, number> = {
    'A': 5.0, 'B+': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'E': 0.0, 'F': 0.0
  };

  useEffect(() => {
    if (user) fetchRecords();
  }, [user]);

  const fetchRecords = async () => {
    setLoading(true);
    const { data } = await supabase.from('gpa_records').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
    if (data) setRecords(data);
    setLoading(false);
  };

  const addRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode || !credits) return;
    
    setIsAdding(true);
    const newRecord = {
      user_id: user.id,
      course_code: courseCode.toUpperCase(),
      credits: parseFloat(credits),
      grade: grade,
      semester: 'Current'
    };

    const { data, error } = await supabase.from('gpa_records').insert(newRecord).select().single();
    if (!error && data) {
      setRecords([...records, data]);
      setCourseCode('');
      setCredits('');
    }
    setIsAdding(false);
  };

  const deleteRecord = async (id: string) => {
    setRecords(records.filter(r => r.id !== id));
    await supabase.from('gpa_records').delete().eq('id', id);
  };

  const { currentGPA, totalCredits } = useMemo(() => {
    if (records.length === 0) return { currentGPA: 0, totalCredits: 0 };
    let totalPoints = 0;
    let totalCreds = 0;
    records.forEach(r => {
      totalPoints += gradePoints[r.grade] * r.credits;
      totalCreds += r.credits;
    });
    return { 
      currentGPA: totalCreds > 0 ? (totalPoints / totalCreds) : 0, 
      totalCredits: totalCreds 
    };
  }, [records]);

  const targetDiff = parseFloat(targetGPA) - currentGPA;

  return (
    <div style={{ padding: '0', maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '8px', letterSpacing: '-1px' }}>GPA Tracker</h1>
        <p style={{ color: 'var(--text-muted)' }}>Calculate your GPA and plan your target grades.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'var(--primary)', padding: '24px', borderRadius: '24px', color: 'white', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          <Sparkles size={100} color="rgba(255,255,255,0.1)" style={{ position: 'absolute', right: '-20px', top: '-20px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', opacity: 0.9 }}>
            <Award size={20} />
            <span style={{ fontWeight: '600' }}>Current GPA</span>
          </div>
          <div style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-2px' }}>
            {currentGPA.toFixed(2)}
          </div>
          <div style={{ opacity: 0.8, fontSize: '14px', marginTop: 'auto' }}>Based on {totalCredits} total credits</div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-muted)' }}>
            <Target size={20} />
            <span style={{ fontWeight: '600' }}>Target GPA</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <input 
              type="number" 
              step="0.1" 
              min="0" 
              max="5.0" 
              value={targetGPA} 
              onChange={e => setTargetGPA(e.target.value)}
              style={{ fontSize: '48px', fontWeight: '900', width: '120px', background: 'transparent', border: 'none', color: 'var(--text-dark)', letterSpacing: '-2px', borderBottom: '2px solid var(--border)', padding: 0 }}
            />
          </div>
          <div style={{ marginTop: 'auto', fontSize: '14px', color: targetDiff > 0 ? '#f59e0b' : '#10b981', fontWeight: '600', display: 'flex', alignItems: 'flex-start', gap: '6px', flexWrap: 'wrap' }}>
            <TrendingUp size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ flex: 1 }}>{targetDiff > 0 ? `You need +${targetDiff.toFixed(2)} to reach your goal` : 'You are hitting your goal!'}</span>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-dark)', margin: 0 }}>Course Records</h3>
        </div>
        
        {loading ? (
          <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}><Loader2 className="spinner" color="var(--primary)" /></div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 30px', gap: '8px', padding: '16px 16px', background: 'rgba(0,0,0,0.02)', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
              <div>COURSE</div>
              <div>CREDITS</div>
              <div>GRADE</div>
              <div></div>
            </div>

            <AnimatePresence>
              {records.map(record => (
                <motion.div 
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 30px', gap: '8px', padding: '16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}
                >
                  <div style={{ fontWeight: '700', color: 'var(--text-dark)', fontSize: '14px' }}>{record.course_code}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{record.credits}</div>
                  <div style={{ fontWeight: '800', fontSize: '14px', color: record.grade === 'A' ? '#10b981' : record.grade.startsWith('B') ? '#3b82f6' : record.grade === 'C' ? '#f59e0b' : '#ef4444' }}>{record.grade}</div>
                  <button onClick={() => deleteRecord(record.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {records.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <BookOpen size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <div>No courses added yet.</div>
              </div>
            )}

            <form onSubmit={addRecord} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 30px', gap: '8px', padding: '16px', background: 'rgba(0,0,0,0.02)' }}>
              <input 
                required 
                placeholder="Code" 
                value={courseCode} 
                onChange={e => setCourseCode(e.target.value)}
                style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', padding: '10px 8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', fontSize: '13px' }} 
              />
              <input 
                required 
                type="number" 
                step="0.5" 
                min="0.5" 
                placeholder="Cr" 
                value={credits} 
                onChange={e => setCredits(e.target.value)}
                style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', padding: '10px 8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', fontSize: '13px' }} 
              />
              <select 
                value={grade} 
                onChange={e => setGrade(e.target.value)}
                style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', padding: '10px 8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', fontWeight: '700', fontSize: '13px' }}
              >
                {Object.keys(gradePoints).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <button disabled={isAdding} type="submit" style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', height: '100%' }}>
                {isAdding ? <Loader2 size={14} className="spinner" /> : <Plus size={16} />}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
