import React, { useState } from 'react';
import { auth } from './firebase.mjs';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import './RoleModal.css';

const RoleModal = ({ onSignIn, onClose }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  // 'options' | 'register' | 'login' | 'forgotPassword'
  const [screen, setScreen] = useState('options');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [roleMismatch, setRoleMismatch] = useState(null);

  const reset = () => {
    setEmail(''); setPassword(''); setConfirmPassword('');
    setDisplayName(''); setError(''); setResetSent(false);
    setRoleMismatch(null);
  };

  const goBack = () => {
    reset();
    if (screen === 'options') {
      setSelectedRole(null);
    } else {
      setScreen('options');
    }
  };

  // ─── Register ────────────────────────────────────────────────────────────────
  const handleRegister = async () => {
    setError('');
    if (!displayName.trim()) { setError('Please enter your name.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await onSignIn('email', selectedRole, email, password);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('email-already-in-use')) {
        setError('This email is already registered. Try signing in instead, or use "Continue with Google" if you registered with Google. You can also delete your old account from the Profile page to free up this email.');
      } else if (msg.includes('weak-password')) {
        setError('Password must be at least 6 characters.');
      } else if (msg.includes('invalid-email')) {
        setError('Please enter a valid email address.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  // ─── Login ───────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    setError('');
    try {
      const actualRole = await onSignIn('email', selectedRole, email, password);
      // If the stored role differs from what they selected, warn them
      if (actualRole && actualRole !== selectedRole) {
        setRoleMismatch(actualRole);
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setError('Incorrect email or password.');
      } else if (msg.includes('too-many-requests')) {
        setError('Too many attempts. Please try again later.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  // ─── Forgot password ─────────────────────────────────────────────────────────
  const handleForgotPassword = async () => {
    setError('');
    if (!email) { setError('Please enter your email above first.'); return; }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch {
      setError('Could not send reset email. Check the address and try again.');
    }
  };

  // ─── Role selection screen ───────────────────────────────────────────────────
  if (!selectedRole) {
    return (
      <div className="modal-overlay">
        <div className="modal-sheet">
          <div className="modal-handle" />
          <button className="modal-close-btn" onClick={onClose}>✕</button>
          <h2 className="modal-title">Welcome to FindMySpace</h2>
          <p className="modal-sub">Who are you?</p>
          <div className="role-btn-group">
            <button className="role-btn" onClick={() => { setSelectedRole('tenant'); setScreen('register'); }}>
              <span className="role-btn-icon"><svg viewBox="0 0 14 14" fill="none" stroke="#033F63" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M5.92 11.34C8.91338 11.34 11.34 8.91338 11.34 5.92C11.34 2.92662 8.91338 0.5 5.92 0.5C2.92662 0.5 0.5 2.92662 0.5 5.92C0.5 8.91338 2.92662 11.34 5.92 11.34Z" /><path d="M13.5 13.5L9.75 9.75" /></svg></span>
              <span className="role-btn-label">I'm a Tenant</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M9 18l6-6-6-6" /></svg>
            </button>
            <button className="role-btn" onClick={() => { setSelectedRole('landlord'); setScreen('register'); }}>
              <span className="role-btn-icon"><svg viewBox="0 0 14 14" fill="none" stroke="#033F63" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M5.62 7.38L11.5 1.5L13.5 3.5" /><path d="M9.25 3.75L11 5.5" /><path d="M3.5 12.5C5.15685 12.5 6.5 11.1569 6.5 9.5C6.5 7.84315 5.15685 6.5 3.5 6.5C1.84315 6.5 0.5 7.84315 0.5 9.5C0.5 11.1569 1.84315 12.5 3.5 12.5Z" /></svg></span>
              <span className="role-btn-label">I'm a Landlord</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Auth method selection + Register (default) ───────────────────────────────
  if (screen === 'register') {
    return (
      <div className="modal-overlay">
        <div className="modal-sheet">
          <div className="modal-handle" />
          <button className="modal-close-btn" onClick={onClose}>✕</button>
          <button className="modal-back" onClick={goBack}>← Back</button>
          <h2 className="modal-title">Create Account</h2>
          <p className="modal-sub">Signing up as {selectedRole === 'tenant' ? 'Tenant' : 'Landlord'}</p>

          {/* Google */}
          <button className="auth-google-btn" onClick={() => onSignIn('google', selectedRole)}>
            <img src="https://www.google.com/favicon.ico" alt="Google" width="18" />
            Continue with Google
          </button>

          <div className="auth-divider"><span>or register with email</span></div>

          {/* Email register form */}
          <div className="auth-form">
            <input
              type="text"
              placeholder="Full name"
              value={displayName}
              onChange={(e) => { setDisplayName(e.target.value); setError(''); }}
              className="auth-field"
            />
            <input
              type="email"
              placeholder="Email address"
              inputMode="email"
              enterKeyHint="next"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="auth-field"
            />
            <input
              type="password"
              placeholder="Password (min. 6 characters)"
              enterKeyHint="next"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="auth-field"
            />
            <input
              type="password"
              placeholder="Confirm password"
              enterKeyHint="done"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
              className="auth-field"
            />
            {error && <p className="auth-error-msg">{error}</p>}
            <button className="auth-submit-btn" onClick={handleRegister}>Create Account</button>
          </div>

          <p className="auth-switch-text">
            Already have an account?{' '}
            <button className="auth-link-inline" onClick={() => { reset(); setScreen('login'); }}>Sign In</button>
          </p>
        </div>
      </div>
    );
  }

  // ─── Login screen ────────────────────────────────────────────────────────────
  if (screen === 'login') {
    return (
      <div className="modal-overlay">
        <div className="modal-sheet">
          <div className="modal-handle" />
          <button className="modal-close-btn" onClick={onClose}>✕</button>
          <button className="modal-back" onClick={goBack}>← Back</button>
          <h2 className="modal-title">Sign In</h2>
          <p className="modal-sub">Signing in as {selectedRole === 'tenant' ? 'Tenant' : 'Landlord'}</p>

          {roleMismatch && (
            <div className="auth-role-warning">
              ⚠️ This account is registered as a <strong>{roleMismatch}</strong>. You've been signed in as {roleMismatch}.
            </div>
          )}

          <button className="auth-google-btn" onClick={() => onSignIn('google', selectedRole)}>
            <img src="https://www.google.com/favicon.ico" alt="Google" width="18" />
            Continue with Google
          </button>

          <div className="auth-divider"><span>or sign in with email</span></div>

          <div className="auth-form">
            <input
              type="email"
              placeholder="Email address"
              inputMode="email"
              enterKeyHint="next"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="auth-field"
            />
            <input
              type="password"
              placeholder="Password"
              enterKeyHint="done"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="auth-field"
            />
            {error && <p className="auth-error-msg">{error}</p>}
            {resetSent && <p className="auth-success-msg">✓ Reset email sent! Check your inbox.</p>}
            <button className="auth-submit-btn" onClick={handleLogin}>Sign In</button>
            <button className="auth-link" onClick={handleForgotPassword}>Forgot Password?</button>
          </div>

          <p className="auth-switch-text">
            Don't have an account?{' '}
            <button className="auth-link-inline" onClick={() => { reset(); setScreen('register'); }}>Register</button>
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default RoleModal;