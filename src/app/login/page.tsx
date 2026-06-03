"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Leaf, Eye, EyeOff, Lock, Mail, User, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'FARM_WORKER' | 'BUYER'>('BUYER');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Check if already logged in
  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    }
    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        // Sign Up with custom metadata (role, full_name)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || 'Lomstel Member',
              role: role
            }
          }
        });

        if (error) throw error;
        
        if (data.user && data.session === null) {
          setSuccessMsg('Registration successful! Please check your email for the confirmation link.');
        } else {
          setSuccessMsg('Account created successfully! Redirecting...');
          setTimeout(() => router.push('/dashboard'), 1500);
        }
      } else {
        // Sign In
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to quickly seed/login with demo accounts
  const handleQuickLogin = async (demoRole: 'ADMIN' | 'FARM_WORKER' | 'BUYER') => {
    setLoading(true);
    setErrorMsg('');
    
    // We create standard emails for testing, e.g. admin@lomstel.com
    const demoEmail = `${demoRole.toLowerCase()}@lomstel.com`;
    const demoPass = '123456';
    
    try {
      // Try logging in first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPass
      });

      if (signInError) {
        // If account doesn't exist, create it on the fly!
        const { error: signUpError } = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPass,
          options: {
            data: {
              full_name: `Demo ${demoRole.charAt(0) + demoRole.slice(1).toLowerCase().replace('_', ' ')}`,
              role: demoRole
            }
          }
        });

        if (signUpError) throw signUpError;
        
        // Login after signing up
        const { error: retryError } = await supabase.auth.signInWithPassword({
          email: demoEmail,
          password: demoPass
        });
        if (retryError) throw retryError;
      }
      
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || `Failed to start demo session for ${demoRole}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 10% 20%, rgba(243,241,233,1) 0%, rgba(230,225,212,1) 90.1%)',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background blobs */}
      <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(75, 127, 82, 0.08)', top: '-50px', left: '-50px', filter: 'blur(80px)' }} />
      <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(164, 110, 71, 0.08)', bottom: '-100px', right: '-100px', filter: 'blur(100px)' }} />

      <div className="glass animate-fade-in" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '3rem 2.5rem',
        boxSizing: 'border-box',
        boxShadow: '0 20px 40px rgba(75,127,82,0.1)'
      }}>
        {/* Header/Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            backgroundColor: 'var(--color-forest-100)',
            color: 'var(--color-forest-700)',
            padding: '1rem',
            borderRadius: '50%',
            marginBottom: '1rem'
          }}>
            <Leaf size={32} />
          </div>
          <h1 style={{ color: 'var(--color-earth-900)', fontSize: '2.25rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-1px' }}>
            Lomstel Limited
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>
            Precision Ledger & Mushroom Trade Portal
          </p>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', borderBottom: '2px solid var(--color-earth-200)', marginBottom: '2rem' }}>
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '1rem 0',
              background: 'none',
              border: 'none',
              borderBottom: !isSignUp ? '3px solid var(--color-forest-500)' : '3px solid transparent',
              color: !isSignUp ? 'var(--color-forest-700)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              marginBottom: '-2px',
              transition: 'all 0.2s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '1rem 0',
              background: 'none',
              border: 'none',
              borderBottom: isSignUp ? '3px solid var(--color-forest-500)' : '3px solid transparent',
              color: isSignUp ? 'var(--color-forest-700)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              marginBottom: '-2px',
              transition: 'all 0.2s ease'
            }}
          >
            Register
          </button>
        </div>

        {/* Status Messages */}
        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#FDECEA',
            color: 'var(--color-accent)',
            padding: '1rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div style={{
            backgroundColor: 'var(--color-forest-100)',
            color: 'var(--color-forest-700)',
            padding: '1rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            {successMsg}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {isSignUp && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-earth-700)' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-earth-400)' }} />
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={isSignUp}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem 0.85rem 2.5rem',
                    borderRadius: '10px',
                    border: '2px solid var(--color-earth-200)',
                    outline: 'none',
                    fontFamily: 'inherit',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-earth-700)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-earth-400)' }} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.5rem',
                  borderRadius: '10px',
                  border: '2px solid var(--color-earth-200)',
                  outline: 'none',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-earth-700)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-earth-400)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '0.85rem 3rem 0.85rem 2.5rem',
                  borderRadius: '10px',
                  border: '2px solid var(--color-earth-200)',
                  outline: 'none',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-earth-400)'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-earth-700)' }}>Select System Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  border: '2px solid var(--color-earth-200)',
                  outline: 'none',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="BUYER">Buyer (View Available Stock & Purchase)</option>
                <option value="FARM_WORKER">Farm Worker (Record Harvests & Sales)</option>
                <option value="ADMIN">Admin (Full System & Financial Controls)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              padding: '1rem',
              fontSize: '1rem',
              marginTop: '0.5rem',
              backgroundColor: 'var(--color-forest-500)'
            }}
          >
            {loading ? 'Authenticating...' : isSignUp ? 'Create System Account' : 'Sign In to Command Center'}
          </button>
        </form>

        {/* Quick Demo Login Seeding Section */}
        <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--color-earth-200)', paddingTop: '1.5rem' }}>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-earth-500)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
            ⚡ Quick Role-Based Testing
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <button
              onClick={() => handleQuickLogin('ADMIN')}
              disabled={loading}
              style={{
                padding: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                borderRadius: '8px',
                border: '1px solid var(--color-forest-500)',
                color: 'var(--color-forest-700)',
                backgroundColor: 'var(--color-forest-100)',
                cursor: 'pointer'
              }}
            >
              🔑 Admin
            </button>
            <button
              onClick={() => handleQuickLogin('FARM_WORKER')}
              disabled={loading}
              style={{
                padding: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                borderRadius: '8px',
                border: '1px solid #2980B9',
                color: '#2980B9',
                backgroundColor: '#E8F4FD',
                cursor: 'pointer'
              }}
            >
              🌾 Worker
            </button>
            <button
              onClick={() => handleQuickLogin('BUYER')}
              disabled={loading}
              style={{
                padding: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                borderRadius: '8px',
                border: '1px solid var(--color-accent)',
                color: 'var(--color-accent)',
                backgroundColor: '#FDECEA',
                cursor: 'pointer'
              }}
            >
              🛒 Buyer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
