import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MagicSquareAnimation from './MagicSquareAnimation';
import RamanujanXAnimation from './RamanujanXAnimation';

const SharedWish = () => {
  const { shareId } = useParams();
  const [wishData, setWishData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Safe UTF-8 Base64 Decoding
      const decodedData = decodeURIComponent(atob(shareId).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const parsed = JSON.parse(decodedData);
      setWishData(parsed);
    } catch {
      setError('Invalid wish link');
    }
  }, [shareId]);

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Link Error</h2>
        <Link to="/create">Create New Wish</Link>
      </div>
    );
  }

  if (!wishData) return null;

  // Route to the appropriate animation
  if (wishData.animationStyle === 'cinematic') {
    return (
      <RamanujanXAnimation
        birthday={wishData.date}
        initialXColor={wishData.colorHighlight}
        initialBgColor={wishData.colorBg}
      />
    );
  }

  return <MagicSquareAnimation wishData={wishData} />;
};

export default SharedWish;