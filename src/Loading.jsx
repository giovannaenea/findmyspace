import React from 'react';
import './Loading.css';

const Loading = () => (
  <div className="loading">
    <div className="loading-spinner">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="loading-bar" style={{ '--i': i }} />
      ))}
    </div>
    <p className="loading-text">Loading</p>
  </div>
);

export default Loading;