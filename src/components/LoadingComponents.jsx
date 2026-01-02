import React from 'react';
import './LoadingComponents.css';

export const LoadingSpinner = ({ size = 'md', color = 'primary' }) => (
  <div className={`loading-spinner loading-spinner--${size} loading-spinner--${color}`}>
    <div className="spinner"></div>
  </div>
);

export const ProgressBar = ({ progress, label }) => (
  <div className="progress-container">
    {label && <div className="progress-label">{label}</div>}
    <div className="progress-bar">
      <div 
        className="progress-fill" 
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
    <div className="progress-text">{Math.round(progress)}%</div>
  </div>
);

export const SkeletonLoader = ({ lines = 3, height = '1rem' }) => (
  <div className="skeleton-container">
    {Array.from({ length: lines }, (_, i) => (
      <div 
        key={i}
        className="skeleton-line"
        style={{ 
          height,
          width: i === lines - 1 ? '60%' : '100%'
        }}
      />
    ))}
  </div>
);

export const LoadingOverlay = ({ message = 'Loading...', children }) => (
  <div className="loading-overlay">
    <div className="loading-content">
      <LoadingSpinner size="lg" />
      <p className="loading-message">{message}</p>
    </div>
    {children}
  </div>
);