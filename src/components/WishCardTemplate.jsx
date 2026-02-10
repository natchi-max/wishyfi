import React, { useMemo } from 'react';
import './WishCardTemplate.css';
import { getOccasionImage } from '../utils/imageFallback';

const WishCardTemplate = ({
    recipientName = "Friend",
    occasion = "celebration",
    greetingTitle = null,
    message = "Wishing you a day filled with joy, laughter, and magical moments!",
    senderName = "A Well Wisher",
    date = new Date().toLocaleDateString(),
    bgImage = null
}) => {

    // Get background image if not provided directly
    const backgroundUrl = useMemo(() => {
        return bgImage || getOccasionImage(occasion);
    }, [bgImage, occasion]);

    // Format Occasion Title
    const formattedOccasion = useMemo(() => {
        if (greetingTitle) return greetingTitle;
        const text = occasion || 'celebration';
        return `Happy ${text.charAt(0).toUpperCase() + text.slice(1)}!`;
    }, [occasion, greetingTitle]);

    const handleImageError = (e) => {
        e.target.style.display = 'none'; // Hide broken image so gradient shows
    };

    return (
        <div className="wish-card-container">
            {/* Background Layer */}
            {backgroundUrl && (
                <img
                    src={backgroundUrl}
                    alt="Background"
                    className="wish-card-bg-image"
                    onError={handleImageError}
                />
            )}
            <div className="wish-card-overlay"></div>

            {/* Sparkles */}
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <div className="sparkle"></div>

            {/* Premium Frame */}
            <div className="wish-card-frame">
                <div className="corner-flourish corner-top-left"></div>
                <div className="corner-flourish corner-top-right"></div>
                <div className="corner-flourish corner-bottom-right"></div>
                <div className="corner-flourish corner-bottom-left"></div>
            </div>

            {/* Content Content */}
            <div className="wish-card-content">
                <h1 className="wish-title">{formattedOccasion}</h1>
                <div className="wish-separator"></div>

                <h2 className="wish-recipient">For {recipientName}</h2>

                <p className="wish-message">
                    {message}
                </p>

                <div className="wish-date">{date}</div>

                {senderName && (
                    <div className="wish-sender">— Warmly, {senderName}</div>
                )}
            </div>

            <div className="wish-brand">wishyfi.com</div>
        </div>
    );
};

export default WishCardTemplate;
