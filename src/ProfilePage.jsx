import React, { useState, useRef } from 'react';
import './ProfilePage.css';
import MenuSelect from './MenuSelect';
import { storage } from './firebase.mjs';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ProfilePage = ({ user, handleSignIn, handleSignOut, handleUpdateProfile, handleDeleteAccount: handleDeleteAccountProp, showToast }) => {
  const [editingPfp, setEditingPfp] = useState(false);
  const [pfpUrl, setPfpUrl] = useState('');
  const [pfpError, setPfpError] = useState('');
  const [pfpUploading, setPfpUploading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await handleDeleteAccountProp();
    } catch (err) {
      console.error(err);
      showToast?.('Failed to delete account. Please try again.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-topbar">
          <h2 className="profile-topbar-title">Profile</h2>
        </div>
        <div className="profile-not-logged-in">
          <div className="profile-avatar-svg">
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="80" height="80">
              <circle cx="40" cy="40" r="40" fill="#e8f0f2" />
              <circle cx="40" cy="30" r="13" fill="#28666e" />
              <path d="M14 68c0-14.36 11.64-26 26-26c14.36 0 26 11.64 26 26" fill="#033f63" />
            </svg>
          </div>
          <h3 className="profile-nli-title">You're not signed in</h3>
          <p className="profile-nli-sub">Sign in to view your profile and saved listings</p>
          <button className="profile-signin-btn" onClick={handleSignIn}>Sign In</button>
        </div>
        <div className="menu-container"><MenuSelect user={user} /></div>
      </div>
    );
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setPfpError('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setPfpError('Image must be under 5MB.'); return; }
    setPfpUploading(true);
    setPfpError('');
    try {
      const storageRef = ref(storage, `profile-photos/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await handleUpdateProfile({ profilePicture: downloadURL });
      setEditingPfp(false);
      flashSaved();
      showToast?.('Photo updated!', 'success');
    } catch (err) {
      console.error(err);
      setPfpError('Upload failed. Please try again.');
    } finally {
      setPfpUploading(false);
    }
  };

  const handleSavePfp = async () => {
    setPfpError('');
    if (!pfpUrl.trim()) { setPfpError('Please enter a URL.'); return; }
    try {
      new URL(pfpUrl);
      await handleUpdateProfile({ profilePicture: pfpUrl });
      setEditingPfp(false);
      setPfpUrl('');
      flashSaved();
      showToast?.('Photo updated!', 'success');
    } catch {
      setPfpError('Please enter a valid image URL.');
    }
  };

  const handleSaveName = async () => {
    setNameError('');
    if (!newName.trim()) { setNameError('Name cannot be empty.'); return; }
    await handleUpdateProfile({ name: newName.trim() });
    setEditingName(false);
    setNewName('');
    flashSaved();
  };

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const avatarSrc = user.profilePicture || user.photoURL;
  const displayName = user.name || user.displayName || user.email || 'User';

  return (
    <div className="profile-page">
      <div className="profile-topbar">
        <h2 className="profile-topbar-title">Profile</h2>
        <p className="profile-topbar-sub">Manage your account settings</p>
        {saved && <span className="profile-saved-badge">✓ Saved</span>}
      </div>

      <div className="profile-content">

        {/* Avatar + name card */}
        <div className="profile-hero-card">
          <div className="profile-avatar-wrap">
            {avatarSrc
              ? <img src={avatarSrc} alt="Profile" className="profile-pic" />
              : <div className="profile-avatar-fallback">
                  {displayName[0].toUpperCase()}
                </div>
            }
            <button className="profile-avatar-edit-btn" onClick={() => { setEditingPfp(!editingPfp); setPfpError(''); }}>
              {editingPfp
                ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><path d="M18 6L6 18M6 6l12 12" /></svg>
                : <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M0.5 13.5H11.5" /><path d="M6.5 10L3.5 10.54L4 7.5L10.73 0.79C10.823 0.696272 10.9336 0.621877 11.0554 0.571109C11.1773 0.52034 11.308 0.494202 11.44 0.494202C11.572 0.494202 11.7027 0.52034 11.8246 0.571109C11.9464 0.621877 12.057 0.696272 12.15 0.79L13.21 1.85C13.3037 1.94296 13.3781 2.05356 13.4289 2.17542C13.4797 2.29728 13.5058 2.42799 13.5058 2.56C13.5058 2.69201 13.4797 2.82272 13.4289 2.94458C13.3781 3.06644 13.3037 3.17704 13.21 3.27L6.5 10Z" /></svg>
              }
            </button>
          </div>

          {editingPfp && (
            <div className="profile-pfp-editor">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <button
                className="profile-save-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={pfpUploading}
                style={{ width: '100%' }}
              >
                {pfpUploading ? 'Uploading...' : 'Upload from device'}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>or paste URL</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>
              <input
                type="url"
                className="profile-input"
                placeholder="https://..."
                value={pfpUrl}
                onChange={e => { setPfpUrl(e.target.value); setPfpError(''); }}
              />
              {pfpError && <p className="profile-input-error">{pfpError}</p>}
              {pfpUrl && <button className="profile-save-btn" onClick={handleSavePfp}>Save URL</button>}
            </div>
          )}

          <div className="profile-hero-info">
            <div className="profile-name-row">
              <h3 className="profile-name">{displayName}</h3>
              <button className="profile-edit-name-btn" onClick={() => { setEditingName(!editingName); setNameError(''); }}>
                {editingName
                  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  : <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M0.5 13.5H11.5" /><path d="M6.5 10L3.5 10.54L4 7.5L10.73 0.79C10.823 0.696272 10.9336 0.621877 11.0554 0.571109C11.1773 0.52034 11.308 0.494202 11.44 0.494202C11.572 0.494202 11.7027 0.52034 11.8246 0.571109C11.9464 0.621877 12.057 0.696272 12.15 0.79L13.21 1.85C13.3037 1.94296 13.3781 2.05356 13.4289 2.17542C13.4797 2.29728 13.5058 2.42799 13.5058 2.56C13.5058 2.69201 13.4797 2.82272 13.4289 2.94458C13.3781 3.06644 13.3037 3.17704 13.21 3.27L6.5 10Z" /></svg>
                }
              </button>
            </div>
            {editingName && (
              <div className="profile-name-editor">
                <input
                  type="text"
                  className="profile-input"
                  placeholder="Enter new display name..."
                  value={newName}
                  onChange={e => { setNewName(e.target.value); setNameError(''); }}
                />
                {nameError && <p className="profile-input-error">{nameError}</p>}
                <button className="profile-save-btn" onClick={handleSaveName}>Save Name</button>
              </div>
            )}
            <p className="profile-email">{user.email}</p>
            <span className="profile-role-badge">
              {user.role === 'landlord'
                ? <><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><path d="M5.62 7.38L11.5 1.5L13.5 3.5" /><path d="M9.25 3.75L11 5.5" /><path d="M3.5 12.5C5.15685 12.5 6.5 11.1569 6.5 9.5C6.5 7.84315 5.15685 6.5 3.5 6.5C1.84315 6.5 0.5 7.84315 0.5 9.5C0.5 11.1569 1.84315 12.5 3.5 12.5Z" /></svg> Landlord</>
                : <><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><path d="M5.92 11.34C8.91338 11.34 11.34 8.91338 11.34 5.92C11.34 2.92662 8.91338 0.5 5.92 0.5C2.92662 0.5 0.5 2.92662 0.5 5.92C0.5 8.91338 2.92662 11.34 5.92 11.34Z" /><path d="M13.5 13.5L9.75 9.75" /></svg> Tenant</>
              }
            </span>
          </div>
        </div>

        {/* Account info */}
        <div className="profile-section-title">Account Information</div>
        <div className="profile-settings-card">
          <div className="profile-settings-row">
            <div className="profile-settings-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div className="profile-settings-text">
              <p className="profile-settings-label">Email</p>
              <p className="profile-settings-value">{user.email || 'Not set'}</p>
            </div>
          </div>

          <div className="profile-settings-divider" />

          <div className="profile-settings-row">
            <div className="profile-settings-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="profile-settings-text">
              <p className="profile-settings-label">Role</p>
              <p className="profile-settings-value">
                {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Not set'}
              </p>
            </div>
          </div>

          <div className="profile-settings-divider" />

          <div className="profile-settings-row">
            <div className="profile-settings-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="profile-settings-text">
              <p className="profile-settings-label">Member Since</p>
              <p className="profile-settings-value">
                {user.metadata?.creationTime
                  ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <button className="profile-signout-btn" onClick={handleSignOut}>
          Sign Out
        </button>
        {/* Delete account */}
        {!showDeleteConfirm ? (
          <button className="profile-delete-btn" onClick={() => setShowDeleteConfirm(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
            Delete Account
          </button>
        ) : (
          <div className="profile-delete-confirm">
            <p className="profile-delete-warning">This will permanently delete your account and free up your email. This cannot be undone.</p>
            <div className="profile-delete-actions">
              <button className="profile-delete-cancel" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="profile-delete-confirm-btn" onClick={handleDeleteAccount} disabled={deleteLoading}>
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="menu-container"><MenuSelect user={user} /></div>
    </div>
  );
};

export default ProfilePage;