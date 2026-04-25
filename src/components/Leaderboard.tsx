import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Medal, Star, ArrowUpRight, Flame, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Leaderboard = ({ currentUser }: { currentUser: any }) => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    setLoading(true);
    // Get top 20 users by XP
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, xp, study_minutes')
      .order('xp', { ascending: false, nullsFirst: false })
      .limit(20);
      
    if (data) setLeaders(data);
    setLoading(false);
  };

  const getRankColor = (index: number) => {
    if (index === 0) return '#fbbf24'; // Gold
    if (index === 1) return '#94a3b8'; // Silver
    if (index === 2) return '#b45309'; // Bronze
    return 'var(--text-muted)';
  };

  return (
    <div style={{ padding: '0', maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '16px', borderRadius: '50%' }}>
            <Trophy size={48} color="#f59e0b" />
          </div>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '8px', letterSpacing: '-1px' }}>Global Leaderboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Earn XP by completing tasks and focusing. Compete with the best!</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '16px' }}>
            <Star size={24} color="#3b82f6" />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>MY XP</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-dark)' }}>{currentUser?.xp || 0}</div>
          </div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '16px' }}>
            <Flame size={24} color="#ef4444" />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>STUDY TIME</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-dark)' }}>{Math.floor((currentUser?.study_minutes || 0) / 60)}h {(currentUser?.study_minutes || 0) % 60}m</div>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-dark)', margin: 0 }}>Top Students</h3>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Top 20</span>
        </div>
        
        {loading ? (
          <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}><Loader2 className="spinner" color="var(--primary)" /></div>
        ) : (
          <div>
            <AnimatePresence>
              {leaders.map((leader, index) => (
                <motion.div 
                  key={leader.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '16px 20px', 
                    borderBottom: '1px solid var(--border)', 
                    background: leader.id === currentUser.id ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                    gap: '16px'
                  }}
                >
                  <div style={{ width: '30px', textAlign: 'center', fontSize: index < 3 ? '24px' : '18px', fontWeight: '900', color: getRankColor(index) }}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  
                  <img 
                    src={leader.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.full_name || leader.username || 'User')}&background=random`} 
                    alt="avatar" 
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: index < 3 ? `2px solid ${getRankColor(index)}` : 'none' }}
                  />
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-dark)' }}>
                      {leader.full_name || leader.username || 'Anonymous Student'}
                      {leader.id === currentUser.id && <span style={{ marginLeft: '8px', fontSize: '11px', background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>YOU</span>}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Flame size={14} /> {Math.floor((leader.study_minutes || 0) / 60)}h focused
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-dark)' }}>{leader.xp || 0}</div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>XP</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {leaders.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No leaders found yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
