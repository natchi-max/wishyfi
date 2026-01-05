import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MagicSquareAnimation from './MagicSquareAnimation';

const SharedWish = () => {
  const { shareId } = useParams();
  const [wishData, setWishData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const decoded = JSON.parse(decodeURIComponent(atob(shareId)));
      setWishData(decoded);
    } catch (e) {
      setError('Invalid wish link');
    }
  }, [shareId]);

  if (error || !wishData) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Link Error</h2>
        <Link to="/create">Create New Wish</Link>
      </div>
    );
  }

  return <MagicSquareAnimation wishData={wishData} />;
};

export default SharedWish;