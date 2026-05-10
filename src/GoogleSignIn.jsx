import React from 'react';
import './GoogleSignIn.css';

const GoogleSignInButton = ({ user, handleSignIn, handleSignOut }) => {
  return (
    <div className="signin-container">
      {user ? (
        <button className="signout-btn" onClick={handleSignOut}>Sign Out</button>
      ) : (
        <button className="signin-btn" onClick={handleSignIn}>Get Started</button>
      )}
    </div>
  );
};

export default GoogleSignInButton;