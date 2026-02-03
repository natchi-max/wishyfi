import React, { useEffect, useState } from 'react';
import './WishAnimationScreen.css';

const WishAnimationScreen = ({
    recipientName = "Friend",
    occasion = "birthday",
    onComplete
}) => {
    const [showWish, setShowWish] = useState(false);

    useEffect(() => {
        // Show wish text after animation completes (2 seconds)
        const timer = setTimeout(() => {
            setShowWish(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    // Generate wish message based on occasion
    const getWishMessage = () => {
        const messages = {
            birthday: `Happy Birthday, ${recipientName}! 🎉`,
            anniversary: `Happy Anniversary, ${recipientName}! 💕`,
            holiday: `Happy Holidays, ${recipientName}! 🎄`,
            celebration: `Celebrating You, ${recipientName}! ✨`
        };
        return messages[occasion] || `Best Wishes, ${recipientName}! 🌟`;
    };

    // Define the 4x4 grid with color classes
    // Grid positions: 0-15 (left to right, top to bottom)
    const getBlockClass = (index) => {
        const corners = [0, 3, 12, 15];
        const topMiddle = [1, 2];
        const bottomMiddle = [13, 14];
        const leftMiddle = [4, 8];
        const rightMiddle = [7, 11];
        const center = [5, 6, 9, 10];
        const diagonals = [0, 3, 5, 6, 9, 10, 12, 15]; // Both diagonals

        let classes = ['grid-block'];

        if (corners.includes(index)) classes.push('corner-red');
        else if (topMiddle.includes(index) || bottomMiddle.includes(index)) classes.push('middle-blue');
        else if (leftMiddle.includes(index) || rightMiddle.includes(index)) classes.push('middle-green');
        else if (center.includes(index)) classes.push('center-cyan');

        if (diagonals.includes(index)) classes.push('diagonal');
        if (center.includes(index)) classes.push('center-pulse');

        return classes.join(' ');
    };

    return (
        <div className="wish-animation-container">
            <div className="magic-square-grid">
                {Array.from({ length: 16 }).map((_, index) => (
                    <div
                        key={index}
                        className={getBlockClass(index)}
                        style={{ animationDelay: `${index * 0.05}s` }}
                    />
                ))}
            </div>

            <div className={`wish-text ${showWish ? 'show' : ''}`}>
                {getWishMessage()}
            </div>

            {onComplete && showWish && (
                <button className="continue-btn" onClick={onComplete}>
                    Continue
                </button>
            )}
        </div>
    );
};

export default WishAnimationScreen;
