import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MagicSquareAnimation from './MagicSquareAnimation';
import './SharedWish.css';

const SharedWish = () => {
  const { shareId } = useParams();
  const [wishData, setWishData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Decode the shared wish data
    try {
      const decoded = decodeWishData(shareId);
      if (decoded) {
        setWishData(decoded);
      } else {
        setError('Invalid or corrupted wish link');
      }
    } catch (e) {
      setError('Failed to load shared wish');
    } finally {
      setLoading(false);
    }
  }, [shareId]);

  // Utility to decode wish data from URL-safe base64
  function decodeWishData(encoded) {
    try {
      const json = decodeURIComponent(atob(encoded));
      return JSON.parse(json);
    } catch (e) {
      console.error('Failed to decode wish data:', e);
      return null;
    }
  }

  if (loading) {
    return (
      <div className="shared-wish-loading">
        <div className="spinner"></div>
        <p>Loading magical wish...</p>
      </div>
    );
  }

  if (error || !wishData) {
    return (
      <div className="shared-wish-error">
        <div className="error-content">
          <h2>✨ Oops!</h2>
          <p>{error || 'This wish link seems to be broken or expired.'}</p>
          <Link to="/" className="btn btn-primary">
            Create Your Own Wish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-wish-page">
      <div className="shared-wish-header">
        <h1>✨ A Magical Wish for You</h1>
        <p>Someone special created this mathematical wish just for you!</p>
      </div>

      <MagicSquareAnimation
        wishData={wishData}
        isSharedView={true}
        onBack={() => { }}
        onCreateAnother={() => { }}
        shareableLink={window.location.href}
      />

      <div className="shared-wish-footer">
        <p>Want to create your own magical wish?</p>
        <Link to="/create" className="btn btn-primary">
          Create Your Wish
        </Link>
        <a href="http://wishyfi.com/" target="_blank" rel="noopener noreferrer" className="site-link">wishyfi.com</a>
      </div>
    </div>
  );
};

export default SharedWish;