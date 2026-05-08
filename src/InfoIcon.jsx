import React from 'react';
import './Loading.css';

const Loading = () => (
  <div className="loading">
    <div className="loading-spinner">
      <div className="loading-bar b1" />
      <div className="loading-bar b2" />
      <div className="loading-bar b3" />
      <div className="loading-bar b4" />
      <div className="loading-bar b5" />
      <div className="loading-bar b6" />
      <div className="loading-bar b7" />
      <div className="loading-bar b8" />
    </div>
    <p className="loading-text">Loading</p>
  </div>
);

export default Loading;