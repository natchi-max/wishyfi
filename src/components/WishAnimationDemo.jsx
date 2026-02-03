import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import WishAnimationScreen from './WishAnimationScreen';

const WishAnimationDemo = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get data from navigation state or use defaults
    const { recipientName, occasion } = location.state?.wishData || {
        recipientName: "Friend",
        occasion: "birthday"
    };

    const handleComplete = () => {
        navigate('/');
    };

    return (
        <WishAnimationScreen
            recipientName={recipientName}
            occasion={occasion}
            onComplete={handleComplete}
        />
    );
};

export default WishAnimationDemo;
