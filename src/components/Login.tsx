import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Loader2, 
  Camera, 
  User, 
  AtSign, 
  Check, 
  ChevronRight, 
  Eye,
  EyeOff
} from 'lucide-react';

export const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [studentId, setStudentId] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (isSignUp) {
      // Validations
      if (!studentId) { setError('Please enter your Student ID.'); setLoading(false); return; }
      if (!studentId.match(/^\d{4}-\d{2}-\d{5}$/)) { setError('Invalid Student ID'); setLoading(false); return; }
      if (password !== verifyPassword) { setError('Passwords do not match.'); setLoading(false); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }

      try {
        // 1. Sign up with Supabase Auth
        const { data: authData, error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: surname,
              full_name: `${firstName} ${surname}`.trim(),
              username: studentId
            }
          }
        });
        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error('Sign up failed.');

        const userId = authData.user.id;
        let finalAvatarUrl = null;

        // 2. Upload Avatar if selected
        if (avatarFile) {
          const fileExt = avatarFile.name.split('.').pop();
          const filePath = `${userId}/${Math.random()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, avatarFile);
          if (uploadError) throw uploadError;
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
          finalAvatarUrl = publicUrl;
        }

        // 3. Create Profile
        const fullName = `${firstName} ${surname}`.trim();
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ 
            id: userId, 
            first_name: firstName,
            last_name: surname,
            full_name: fullName,
            username: studentId,
            avatar_url: finalAvatarUrl,
            email: email,
            status: 'active'
          });
        
        if (profileError) {
          if (profileError.code === '23505') throw new Error('That username is already taken.');
          throw profileError;
        }

        setSuccess('Account created! Please check your email for verification.');
      } catch (err: any) {
        setError(err.message);
      }
    } else {
      // Sign In logic
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) setError(signInError.message);
    }
    
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      minHeight: '100vh',
      padding: '40px 24px',
      background: 'var(--bg-main)',
      overflowY: 'auto'
    }}>
      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center' }}
        >
          {/* Black & White FT Monogram */}
          <div style={{ width: '72px', height: '72px', background: '#000', borderRadius: '22px', margin: '0 auto 16px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}>
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="2" y="34" fontFamily="'Inter', sans-serif" fontWeight="900" fontSize="28" fill="white" letterSpacing="-1">SU</text>
            </svg>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '900', marginBottom: '8px', color: 'var(--text-dark)' }}>SomaUlipo</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {isSignUp ? 'Join the Soma ulipo learning hub' : 'Welcome back to Soma ulipo'}
          </p>
        </motion.div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Profile Picture Selector (Top of Form) */}
          {isSignUp && (
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ 
                  width: '110px', 
                  height: '110px', 
                  borderRadius: '40px', 
                  background: 'var(--bg-card)', 
                  margin: '0 auto 12px', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '2px dashed var(--border)'
                }}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Camera size={32} color="var(--text-muted)" />
                )}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '9px', padding: '4px', fontWeight: '800' }}>UPLOAD PHOTO</div>
              </div>
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
            </div>
          )}

          {/* Signup-only fields */}
          <AnimatePresence mode="wait">
            {isSignUp && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <User size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="First Name" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '16px', border: '1.5px solid var(--border)', background: 'var(--bg-card)', fontSize: '14px' }}
                      required
                    />
                  </div>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <User size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Surname" 
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '16px', border: '1.5px solid var(--border)', background: 'var(--bg-card)', fontSize: '14px' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <AtSign size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Student ID" 
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '16px', border: '1.5px solid var(--border)', background: 'var(--bg-card)', fontSize: '14px' }}
                    required
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Common Fields */}
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
            <input 
              type="email" 
              placeholder="UDSM Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '16px', border: '1.5px solid var(--border)', background: 'var(--bg-card)', fontSize: '14px' }}
              required
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '16px', border: '1.5px solid var(--border)', background: 'var(--bg-card)', fontSize: '14px' }}
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {isSignUp && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ position: 'relative' }}>
                <Check size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  placeholder="Verify Password" 
                  value={verifyPassword}
                  onChange={(e) => setVerifyPassword(e.target.value)}
                  style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '16px', border: '1.5px solid var(--border)', background: 'var(--bg-card)', fontSize: '14px' }}
                  required
                />
              </div>
            </motion.div>
          )}

          {error && <div style={{ color: '#EF4444', fontSize: '12px', textAlign: 'center', background: '#FEF2F2', padding: '10px', borderRadius: '12px' }}>{error}</div>}
          {success && <div style={{ color: 'var(--primary)', fontSize: '13px', textAlign: 'center', background: '#F0FDF4', padding: '12px', borderRadius: '12px', border: '1px solid var(--primary)' }}>{success}</div>}

          <button 
            disabled={loading}
            type="submit" 
            style={{ 
              width: '100%', 
              padding: '16px', 
              borderRadius: '16px', 
              background: 'var(--primary)', 
              color: 'white', 
              border: 'none', 
              fontSize: '15px', 
              fontWeight: '700', 
              marginTop: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (isSignUp ? 'Create SomaUlipo Account' : 'Sign In')}
            {!loading && <ChevronRight size={18} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '13px' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {isSignUp ? 'Already a member?' : "Not in SomaUlipo yet?"}
          </span>
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccess(null); }}
            style={{ marginLeft: '6px', background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '30px', textAlign: 'center', opacity: 0.4 }}>
          <p style={{ fontSize: '11px', fontWeight: '700' }}>Dapaz © 2026 • All Rights Reserved</p>
        </div>
      </div>
    </div>
  );
};

