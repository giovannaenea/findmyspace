import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { auth } from './firebase.mjs';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import './RoleModal.css';

// screens: 'options' | 'roleSelect' | 'register' | 'login' | 'forgotPassword'

const RoleModal = ({ onSignIn, onClose, isOpen }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [screen, setScreen] = useState('options');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Reset all internal state whenever the modal is opened, so stale form
  // values from a previous session don't bleed through. This replaces the
  // key={Date.now()} hack that was used in App.jsx, which forced a full
  // unmount/remount on every open and broke focus management.
  useEffect(() => {
    if (isOpen) {
      setSelectedRole(null);
      setScreen('options');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setDisplayName('');
      setError('');
      setResetSent(false);
    }
  }, [isOpen]);

  const reset = () => {
    setEmail(''); setPassword(''); setConfirmPassword('');
    setDisplayName(''); setError(''); setResetSent(false);
  };

  const goBack = () => {
    reset();
    if (screen === 'roleSelect') { setScreen('options'); }
    else if (screen === 'register') { setScreen('roleSelect'); }
    else { setScreen('options'); setSelectedRole(null); }
  };

  // ─── Register (email) ────────────────────────────────────────────────────────
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
        setError('This email is already registered. Try signing in instead, or use "Continue with Google" if you registered with Google.');
      } else if (msg.includes('weak-password')) {
        setError('Password must be at least 6 characters.');
      } else if (msg.includes('invalid-email')) {
        setError('Please enter a valid email address.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  // ─── Login (email) ───────────────────────────────────────────────────────────
  const handleLogin = async () => {
    setError('');
    try {
      await onSignIn('email', null, email, password);
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

  // ─── Screen: options (Log In / Sign Up) ──────────────────────────────────────
  if (screen === 'options') {
    return (
      <div className="modal-overlay">
        <div className="modal-sheet">
          <div className="modal-handle" />
          <button className="modal-close-btn" onClick={onClose}>✕</button>
          <h2 className="modal-title">Welcome to FindMySpace</h2>
          <p className="modal-sub">New here? Create an account. Already a member? Log in.</p>
          <div className="role-btn-group">
            <button className="role-btn" onClick={() => { reset(); setScreen('login'); }}>
              <span className="role-btn-icon">
                <svg width="20" height="20" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.5 8L9.38 13.5L6.63 11.44" stroke="#033F63" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 5C6.24264 5 7.25 3.99264 7.25 2.75C7.25 1.50736 6.24264 0.5 5 0.5C3.75736 0.5 2.75 1.50736 2.75 2.75C2.75 3.99264 3.75736 5 5 5Z" stroke="#033F63" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 12.5H0.5V11C0.500782 10.1106 0.765127 9.2413 1.25965 8.50201C1.75417 7.76271 2.45668 7.18655 3.27846 6.84628C4.10024 6.50601 5.00442 6.4169 5.87682 6.59021C6.74921 6.76351 7.55068 7.19146 8.18 7.82" stroke="#033F63" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className="role-btn-label">Log In</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M9 18l6-6-6-6" /></svg>
            </button>
            <button className="role-btn" onClick={() => { reset(); setSelectedRole(null); setScreen('roleSelect'); }}>
              <span className="role-btn-icon">
                <svg width="20" height="20" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 5C6.24264 5 7.25 3.99264 7.25 2.75C7.25 1.50736 6.24264 0.5 5 0.5C3.75736 0.5 2.75 1.50736 2.75 2.75C2.75 3.99264 3.75736 5 5 5Z" stroke="#033F63" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4.5 12.5H0.5V11C0.507961 10.2378 0.708977 9.49004 1.08427 8.82658C1.45957 8.16313 1.9969 7.60561 2.64607 7.20612C3.29525 6.80663 4.03509 6.57819 4.79648 6.54215C5.55788 6.5061 6.31599 6.66362 7 7" stroke="#033F63" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10.5 7.5V13.5" stroke="#033F63" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7.5 10.5H13.5" stroke="#033F63" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className="role-btn-label">Sign Up</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Screen: roleSelect (Sign Up path only) ───────────────────────────────────
  if (screen === 'roleSelect') {
    return (
      <div className="modal-overlay">
        <div className="modal-sheet">
          <div className="modal-handle" />
          <button className="modal-close-btn" onClick={onClose}>✕</button>
          <button className="modal-back" onClick={goBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <h2 className="modal-title">I am a…</h2>
          <p className="modal-sub">Choose your role to get started</p>
          <div className="role-btn-group">
            <button className="role-btn" onClick={() => { setSelectedRole('tenant'); setScreen('register'); }}>
              <span className="role-btn-icon">
                <svg viewBox="0 0 14 14" fill="none" stroke="#033F63" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.92 11.34C8.91338 11.34 11.34 8.91338 11.34 5.92C11.34 2.92662 8.91338 0.5 5.92 0.5C2.92662 0.5 0.5 2.92662 0.5 5.92C0.5 8.91338 2.92662 11.34 5.92 11.34Z" />
                  <path d="M13.5 13.5L9.75 9.75" />
                </svg>
              </span>
              <span className="role-btn-label">I'm a Tenant</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M9 18l6-6-6-6" /></svg>
            </button>
            <button className="role-btn" onClick={() => { setSelectedRole('landlord'); setScreen('register'); }}>
              <span className="role-btn-icon">
                <svg viewBox="0 0 14 14" fill="none" stroke="#033F63" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.5 13.5H0.5V4L4.5 0.5L8.5 4V13.5Z" />
                  <path d="M8.5 13.5H13.5V6.5H8.5" />
                  <path d="M4.5 13.5V11.5" />
                  <path d="M3 8.5H6" />
                  <path d="M3 5.5H6" />
                </svg>
              </span>
              <span className="role-btn-label">I'm a Landlord</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Screen: register ─────────────────────────────────────────────────────────
  if (screen === 'register') {
    return (
      <div className="modal-overlay">
        <div className="modal-sheet">
          <div className="modal-handle" />
          <button className="modal-close-btn" onClick={onClose}>✕</button>
          <button className="modal-back" onClick={goBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <h2 className="modal-title">Create Account</h2>
          <p className="modal-sub">Signing up as {selectedRole === 'tenant' ? 'Tenant' : 'Landlord'}</p>

          <button className="auth-google-btn" onClick={() => onSignIn('google', selectedRole)}>
            <img src="https://www.google.com/favicon.ico" alt="Google" width="18" />
            Continue with Google
          </button>

          <div className="auth-divider"><span>or register with email</span></div>

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
            <button className="auth-link-inline" onClick={() => { reset(); setScreen('login'); }}>Log In</button>
          </p>
        </div>
      </div>
    );
  }

  // ─── Screen: login ────────────────────────────────────────────────────────────
  if (screen === 'login') {
    return (
      <div className="modal-overlay">
        <div className="modal-sheet">
          <div className="modal-handle" />
          <button className="modal-close-btn" onClick={onClose}>✕</button>
          <button className="modal-back" onClick={goBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <h2 className="modal-title">Log In</h2>
          <p className="modal-sub">Welcome back</p>

          <button className="auth-google-btn" onClick={() => onSignIn('google', null)}>
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
            <button className="auth-submit-btn" onClick={handleLogin}>Log In</button>
            <button className="auth-link" onClick={handleForgotPassword}>Forgot Password?</button>
          </div>

          <p className="auth-switch-text">
            Don't have an account?{' '}
            <button className="auth-link-inline" onClick={() => { reset(); setScreen('roleSelect'); }}>Sign Up</button>
          </p>
        </div>
      </div>
    );
  }

  return null;
};

RoleModal.propTypes = {
  onSignIn: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
};

export default RoleModal;