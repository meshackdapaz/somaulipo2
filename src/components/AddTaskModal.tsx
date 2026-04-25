import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';

export const AddTaskModal = ({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (title: string, desc: string, time: string, date: string) => void }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [dateType, setDateType] = useState<'today' | 'tomorrow'>('today');
  
  const getCurrentTime = () => {
    const d = new Date();
    let hours = d.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:00 ${ampm}`;
  };

  const [time, setTime] = useState(getCurrentTime());

  if (!isOpen) return null;

  const handleAdd = () => {
    const d = new Date();
    if (dateType === 'tomorrow') d.setDate(d.getDate() + 1);
    const dateStr = d.toDateString();
    onAdd(title, desc, time, dateStr);
    onClose();
  };

  return (
    <AnimatePresence>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
        />
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{ 
            width: '100%', 
            background: 'var(--bg-main)', 
            borderRadius: '32px 32px 0 0', 
            padding: '32px 24px 48px', 
            position: 'relative',
            boxShadow: '0 -20px 40px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-dark)' }}>New Task</h2>
            <button onClick={onClose} className="icon-btn" style={{ border: 'none', background: 'var(--bg-card)', color: 'var(--text-dark)' }}><X size={20} /></button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>TASK TITLE</label>
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Physics Lab Report" 
                style={{ width: '100%', boxSizing: 'border-box', padding: '16px', borderRadius: '16px', border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-dark)', fontSize: '16px', fontWeight: '500' }}
              />
            </div>

            <div className="input-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>DESCRIPTION</label>
              <textarea 
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Details about this task..." 
                style={{ width: '100%', boxSizing: 'border-box', padding: '16px', borderRadius: '16px', border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-dark)', fontSize: '15px', minHeight: '100px', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>DATE</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                   <button 
                    onClick={() => setDateType('today')}
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid var(--border)', background: dateType === 'today' ? 'var(--primary)' : 'var(--bg-card)', color: dateType === 'today' ? 'white' : 'var(--text-dark)', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                  >Today</button>
                   <button 
                    onClick={() => setDateType('tomorrow')}
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid var(--border)', background: dateType === 'tomorrow' ? 'var(--primary)' : 'var(--bg-card)', color: dateType === 'tomorrow' ? 'white' : 'var(--text-dark)', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                  >Tomorrow</button>
                </div>
              </div>
              <div className="input-group">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>TIME</label>
                <input 
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '16px', border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-dark)', fontSize: '14px', fontWeight: '600', textAlign: 'center' }}
                />
              </div>
            </div>

            <button 
              onClick={handleAdd}
              disabled={!title}
              style={{ 
                width: '100%', 
                padding: '20px', 
                borderRadius: '20px', 
                background: title ? 'var(--primary)' : '#E5E7EB', 
                color: 'white', 
                border: 'none', 
                fontSize: '17px', 
                fontWeight: '700', 
                marginTop: '12px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                cursor: title ? 'pointer' : 'default',
                transition: 'all 0.2s'
              }}
            >
              <Send size={20} /> Create Task
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
