import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Layers, Plus, Trash2, ArrowRight, ArrowLeft, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Flashcards = ({ user }: { user: any }) => {
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [isAdding, setIsAdding] = useState(false);
  const [deckName, setDeckName] = useState('My Course');
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');

  useEffect(() => {
    if (user) fetchCards();
  }, [user]);

  const fetchCards = async () => {
    setLoading(true);
    const { data } = await supabase.from('flashcards').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setFlashcards(data);
    setLoading(false);
  };

  const addCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontText || !backText) return;
    
    setIsAdding(true);
    const { data, error } = await supabase.from('flashcards').insert({
      user_id: user.id,
      deck_name: deckName,
      front: frontText,
      back: backText
    }).select().single();
    
    if (error) {
      console.error("Flashcard Insert Error:", error);
      alert(`Failed to add flashcard: ${error.message}`);
    } else if (data) {
      setFlashcards([data, ...flashcards]);
      setFrontText('');
      setBackText('');
    }
    setIsAdding(false);
  };

  const deleteCard = async (id: string) => {
    setFlashcards(flashcards.filter(c => c.id !== id));
    if (currentIndex >= flashcards.length - 1 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
    setIsFlipped(false);
    await supabase.from('flashcards').delete().eq('id', id);
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((c) => (c + 1) % flashcards.length), 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((c) => (c - 1 + flashcards.length) % flashcards.length), 150);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="spinner" /></div>;

  return (
    <div style={{ padding: '0', maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '8px', letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Layers color="var(--primary)" /> Flashcards
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Test your knowledge and memorize important concepts.</p>
      </div>

      {flashcards.length > 0 ? (
        <div style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ width: '100%', maxWidth: '500px', perspective: '1000px', height: '300px', marginBottom: '24px' }} onClick={() => setIsFlipped(!isFlipped)}>
            <motion.div 
              style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', cursor: 'pointer' }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              {/* Front */}
              <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <div style={{ position: 'absolute', top: '16px', left: '20px', fontSize: '13px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '1px' }}>QUESTION</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-dark)' }}>{flashcards[currentIndex].front}</div>
                <div style={{ position: 'absolute', bottom: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>Tap to reveal answer</div>
              </div>

              {/* Back */}
              <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', background: 'var(--primary)', color: 'white', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', transform: 'rotateY(180deg)', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.2)' }}>
                <div style={{ position: 'absolute', top: '16px', left: '20px', fontSize: '13px', fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: '1px' }}>ANSWER</div>
                <Sparkles size={100} color="rgba(255,255,255,0.1)" style={{ position: 'absolute', right: '-20px', top: '-20px' }} />
                <div style={{ fontSize: '24px', fontWeight: '700', zIndex: 1 }}>{flashcards[currentIndex].back}</div>
              </div>
            </motion.div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button onClick={prevCard} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ArrowLeft size={20} color="var(--text-dark)" /></button>
            <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)' }}>{currentIndex + 1} / {flashcards.length}</div>
            <button onClick={nextCard} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ArrowRight size={20} color="var(--text-dark)" /></button>
            
            <button onClick={() => deleteCard(flashcards[currentIndex].id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: '24px' }}><Trash2 size={20} color="#ef4444" /></button>
          </div>

        </div>
      ) : (
        <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '24px', border: '1px dashed var(--border)', marginBottom: '40px' }}>
          <BookOpen size={48} color="var(--border)" style={{ margin: '0 auto 16px' }} />
          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>No Flashcards Yet</div>
          <div style={{ color: 'var(--text-muted)' }}>Create your first flashcard below to start studying!</div>
        </div>
      )}

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-dark)', marginTop: 0, marginBottom: '20px' }}>Create New Card</h3>
        <form onSubmit={addCard} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>Deck / Subject</label>
            <input required value={deckName} onChange={e => setDeckName(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-main)' }} placeholder="e.g. Biology 101" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>Question (Front)</label>
            <textarea required value={frontText} onChange={e => setFrontText(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-main)', minHeight: '80px', resize: 'vertical' }} placeholder="What is the powerhouse of the cell?" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>Answer (Back)</label>
            <textarea required value={backText} onChange={e => setBackText(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-main)', minHeight: '80px', resize: 'vertical' }} placeholder="Mitochondria" />
          </div>
          <button disabled={isAdding} type="submit" style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: '800', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', marginTop: '8px' }}>
            {isAdding ? <Loader2 size={20} className="spinner" /> : <><Plus size={20} /> Add Flashcard</>}
          </button>
        </form>
      </div>
    </div>
  );
};
