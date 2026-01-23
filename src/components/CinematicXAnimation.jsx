import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CinematicXAnimation.css';
import { parseDateComponents, generateDateEchoSquare } from '../utils/magicSquare';
import { generateCelebrationImage } from '../utils/imageGenerator';

const CinematicXAnimation = ({ wishData: propWishData }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const wishData = propWishData || location.state?.wishData;
    const isSharedView = location.pathname.startsWith('/share/');

    const canvasRef = useRef(null);
    const backgroundImageRef = useRef(null);
    const [currentScreen, setCurrentScreen] = useState(0);
    const [bgImageLoaded, setBgImageLoaded] = useState(false);
    const animationFrameRef = useRef(null);
    const startTimeRef = useRef(null);

    // Redirect if no data in shared view
    useEffect(() => {
        if (!wishData && isSharedView) {
            navigate('/create');
        }
    }, [wishData, navigate, isSharedView]);

    // Load background image
    useEffect(() => {
        const loadBgImage = async () => {
            if (wishData) {
                try {
                    const imageDataUrl = await generateCelebrationImage(wishData);
                    if (imageDataUrl) {
                        const img = new Image();
                        img.onload = () => {
                            backgroundImageRef.current = img;
                            setBgImageLoaded(true);
                        };
                        img.onerror = () => {
                            console.error('Failed to load background image');
                            setBgImageLoaded(false);
                        };
                        img.src = imageDataUrl;
                    }
                } catch (error) {
                    console.error('Error loading celebration image:', error);
                }
            }
        };
        loadBgImage();
    }, [wishData]);

    // Default wish data
    const getCurrentDate = () => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    const defaultWishData = {
        recipientName: 'Friend',
        senderName: 'Someone Special',
        date: getCurrentDate(),
        message: 'Wishing you joy and happiness!',
        occasion: 'celebration',
        colorHighlight: '#667eea',
        colorBg: '#0a0e27'
    };

    const currentWishData = wishData || defaultWishData;
    const dateStr = currentWishData.date || getCurrentDate();

    // Generate magic square
    const { DD, MM, CC, YY } = parseDateComponents(dateStr);
    const square = generateDateEchoSquare(DD, MM, CC, YY);
    const magicConstant = square && square[0] ? square[0].reduce((a, b) => a + b, 0) : 0;

    // Animation timeline (in milliseconds) - Slowed down significantly
    const TIMELINE = {
        SCREEN_1: { start: 0, duration: 8000 },        // 8s - Intro text (doubled)
        SCREEN_2: { start: 8000, duration: 5000 },     // 5s - Transition pause (doubled)
        SCREEN_3: { start: 13000, duration: 6000 },    // 6s - Block colors (doubled)
        SCREEN_4: { start: 19000, duration: 3000 },    // 3s - Row transformation (doubled)
        SCREEN_5: { start: 22000, duration: 5000 },    // 5s - Top row focus (doubled)
        FINAL: { start: 27000, duration: 8000 }        // 8s - Greeting reveal (doubled)
    };

    const TOTAL_DURATION = 35000; // Total animation duration (doubled)

    // Animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const size = 800;
        canvas.width = size;
        canvas.height = size;

        const animate = (timestamp) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp;
            }

            const elapsed = timestamp - startTimeRef.current;
            const progress = Math.min(elapsed / TOTAL_DURATION, 1);

            // Determine current screen
            let screen = 0;
            if (elapsed >= TIMELINE.FINAL.start) screen = 5;
            else if (elapsed >= TIMELINE.SCREEN_5.start) screen = 4;
            else if (elapsed >= TIMELINE.SCREEN_4.start) screen = 3;
            else if (elapsed >= TIMELINE.SCREEN_3.start) screen = 2;
            else if (elapsed >= TIMELINE.SCREEN_2.start) screen = 1;

            setCurrentScreen(screen);

            // Clear canvas
            ctx.fillStyle = currentWishData.colorBg;
            ctx.fillRect(0, 0, size, size);

            // Render current screen
            renderScreen(ctx, screen, elapsed, size);

            // Loop animation
            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                // Restart animation
                startTimeRef.current = null;
                animationFrameRef.current = requestAnimationFrame(animate);
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [currentWishData, square, bgImageLoaded]);

    // Render screen based on timeline
    const renderScreen = (ctx, screen, elapsed, size) => {
        const highlightColor = currentWishData.colorHighlight;

        switch (screen) {
            case 0: // SCREEN 1 - Intro Text
                renderScreen1(ctx, elapsed, size, highlightColor);
                break;
            case 1: // SCREEN 2 - Transition Pause
                renderScreen2(ctx, elapsed, size);
                break;
            case 2: // SCREEN 3 - Block Colors
                renderScreen3(ctx, elapsed, size, highlightColor);
                break;
            case 3: // SCREEN 4 - Row Transformation
                renderScreen4(ctx, elapsed, size, highlightColor);
                break;
            case 4: // SCREEN 5 - Top Row Focus
                renderScreen5(ctx, elapsed, size, highlightColor);
                break;
            case 5: // FINAL SCREEN - Greeting
                renderFinalScreen(ctx, elapsed, size, highlightColor);
                break;
        }
    };

    // SCREEN 1 - Intro Text
    const renderScreen1 = (ctx, elapsed, size, highlightColor) => {
        const localElapsed = elapsed - TIMELINE.SCREEN_1.start;
        const recipientName = currentWishData.recipientName || 'there';

        const lines = [
            { text: `Hi ${recipientName}`, delay: 0, y: size / 2 - 60 },
            { text: 'This is not random', delay: 500, y: size / 2 },
            { text: 'Watch closely', delay: 1000, y: size / 2 + 60 }
        ];

        ctx.font = 'bold 36px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        lines.forEach(line => {
            if (localElapsed >= line.delay) {
                const lineProgress = Math.min((localElapsed - line.delay) / 500, 1);
                const opacity = easeInOut(lineProgress);
                const translateY = (1 - easeInOut(lineProgress)) * 10;

                ctx.save();
                ctx.globalAlpha = opacity;

                // Text shadow for visibility
                ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
                ctx.shadowBlur = 20;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;

                // Stroke for contrast
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.lineWidth = 3;
                ctx.strokeText(line.text, size / 2, line.y - translateY);

                // Fill text
                ctx.fillStyle = line.delay === 0 ? highlightColor : '#ffffff';
                ctx.fillText(line.text, size / 2, line.y - translateY);

                ctx.restore();
            }
        });
    };

    // SCREEN 2 - Transition Pause
    const renderScreen2 = (ctx, elapsed, size) => {
        const localElapsed = elapsed - TIMELINE.SCREEN_2.start;
        const progress = localElapsed / TIMELINE.SCREEN_2.duration;

        // Shifting gradient
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        const hue = (progress * 60) % 360;
        gradient.addColorStop(0, `hsl(${hue}, 50%, 10%)`);
        gradient.addColorStop(1, `hsl(${(hue + 60) % 360}, 50%, 15%)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
    };

    // SCREEN 3 - Block Colors
    const renderScreen3 = (ctx, elapsed, size, highlightColor) => {
        const localElapsed = elapsed - TIMELINE.SCREEN_3.start;
        const gridSize = 400;
        const cellSize = gridSize / 4;
        const startX = (size - gridSize) / 2;
        const startY = (size - gridSize) / 2;

        // Grid fade in
        const gridFade = Math.min(localElapsed / 500, 1);

        // Block colors (X-diagonal symmetry)
        const blockColors = [
            '#ff6b6b', // Top-left
            '#4ecdc4', // Top-right
            '#4ecdc4', // Bottom-left
            '#ff6b6b'  // Bottom-right
        ];

        // Draw grid and numbers
        for (let ri = 0; ri < 4; ri++) {
            for (let ci = 0; ci < 4; ci++) {
                const x = startX + ci * cellSize;
                const y = startY + ri * cellSize;

                // Determine block (0-3)
                const blockIndex = Math.floor(ri / 2) * 2 + Math.floor(ci / 2);
                const blockDelay = blockIndex * 300;
                const blockProgress = Math.max(0, Math.min((localElapsed - 500 - blockDelay) / 400, 1));

                // Background color
                if (blockProgress > 0) {
                    ctx.save();
                    ctx.globalAlpha = easeInOut(blockProgress) * 0.4 * gridFade;
                    ctx.fillStyle = blockColors[blockIndex];
                    ctx.fillRect(x, y, cellSize, cellSize);
                    ctx.restore();
                }

                // Grid lines
                ctx.save();
                ctx.globalAlpha = gridFade;
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, cellSize, cellSize);
                ctx.restore();

                // Numbers
                ctx.save();
                ctx.globalAlpha = gridFade;
                ctx.font = 'bold 32px Poppins, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Shadow
                ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
                ctx.shadowBlur = 10;

                ctx.fillStyle = '#ffffff';
                const num = square && square[ri] && square[ri][ci] !== undefined ? square[ri][ci] : 0;
                const numStr = num < 10 ? `0${num}` : `${num}`;
                ctx.fillText(numStr, x + cellSize / 2, y + cellSize / 2);
                ctx.restore();
            }
        }
    };

    // SCREEN 4 - Row Transformation
    const renderScreen4 = (ctx, elapsed, size, highlightColor) => {
        const localElapsed = elapsed - TIMELINE.SCREEN_4.start;
        const progress = easeInOut(Math.min(localElapsed / TIMELINE.SCREEN_4.duration, 1));

        const gridSize = 400;
        const cellSize = gridSize / 4;
        const startX = (size - gridSize) / 2;
        const startY = (size - gridSize) / 2;

        const blockColors = ['#ff6b6b', '#4ecdc4', '#4ecdc4', '#ff6b6b'];
        const rowColors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a855f7'];

        for (let ri = 0; ri < 4; ri++) {
            for (let ci = 0; ci < 4; ci++) {
                const x = startX + ci * cellSize;
                const y = startY + ri * cellSize;

                const blockIndex = Math.floor(ri / 2) * 2 + Math.floor(ci / 2);
                const fromColor = blockColors[blockIndex];
                const toColor = rowColors[ri];

                // Interpolate colors
                const color = interpolateColor(fromColor, toColor, progress);

                // Background
                ctx.save();
                ctx.globalAlpha = 0.4;
                ctx.fillStyle = color;
                ctx.fillRect(x, y, cellSize, cellSize);
                ctx.restore();

                // Grid lines
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, cellSize, cellSize);

                // Numbers
                ctx.save();
                ctx.font = 'bold 32px Poppins, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
                ctx.shadowBlur = 10;
                ctx.fillStyle = '#ffffff';
                const num = square && square[ri] && square[ri][ci] !== undefined ? square[ri][ci] : 0;
                const numStr = num < 10 ? `0${num}` : `${num}`;
                ctx.fillText(numStr, x + cellSize / 2, y + cellSize / 2);
                ctx.restore();
            }
        }
    };

    // SCREEN 5 - Top Row Focus
    const renderScreen5 = (ctx, elapsed, size, highlightColor) => {
        const localElapsed = elapsed - TIMELINE.SCREEN_5.start;
        const pulseProgress = (Math.sin(localElapsed / 400 * Math.PI) + 1) / 2; // Slow pulse

        const gridSize = 400;
        const cellSize = gridSize / 4;
        const startX = (size - gridSize) / 2;
        const startY = (size - gridSize) / 2;

        const rowColors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a855f7'];

        for (let ri = 0; ri < 4; ri++) {
            for (let ci = 0; ci < 4; ci++) {
                const x = startX + ci * cellSize;
                const y = startY + ri * cellSize;
                const isTopRow = ri === 0;

                // Background
                ctx.save();
                const baseOpacity = 0.4;
                const glowOpacity = isTopRow ? baseOpacity + (pulseProgress * 0.3) : baseOpacity;
                ctx.globalAlpha = glowOpacity;
                ctx.fillStyle = rowColors[ri];
                ctx.fillRect(x, y, cellSize, cellSize);
                ctx.restore();

                // Soft glow on top row
                if (isTopRow) {
                    ctx.save();
                    ctx.globalAlpha = pulseProgress * 0.5;
                    ctx.shadowColor = highlightColor;
                    ctx.shadowBlur = 30;
                    ctx.fillStyle = highlightColor;
                    ctx.fillRect(x, y, cellSize, cellSize);
                    ctx.restore();
                }

                // Grid lines
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, cellSize, cellSize);

                // Numbers
                ctx.save();
                ctx.font = 'bold 32px Poppins, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
                ctx.shadowBlur = 10;
                ctx.fillStyle = '#ffffff';
                const num = square && square[ri] && square[ri][ci] !== undefined ? square[ri][ci] : 0;
                const numStr = num < 10 ? `0${num}` : `${num}`;
                ctx.fillText(numStr, x + cellSize / 2, y + cellSize / 2);
                ctx.restore();
            }
        }
    };

    // FINAL SCREEN - Greeting
    const renderFinalScreen = (ctx, elapsed, size, highlightColor) => {
        const localElapsed = elapsed - TIMELINE.FINAL.start;
        const fadeProgress = easeInOut(Math.min(localElapsed / 1000, 1));
        const scaleProgress = 0.98 + (easeInOut(Math.min(localElapsed / 1000, 1)) * 0.02);

        // Background image
        if (backgroundImageRef.current) {
            ctx.save();
            ctx.globalAlpha = fadeProgress * 0.7;
            ctx.drawImage(backgroundImageRef.current, 0, 0, size, size);
            ctx.restore();
        }

        // Dark overlay for text contrast
        ctx.save();
        ctx.globalAlpha = fadeProgress * 0.6;
        const gradient = ctx.createLinearGradient(0, 0, 0, size);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        ctx.restore();

        // Greeting message
        const message = currentWishData.message || 'Wishing you joy and happiness!';
        const senderName = currentWishData.senderName || 'Someone Special';
        const recipientName = currentWishData.recipientName || 'Friend';

        ctx.save();
        ctx.globalAlpha = fadeProgress;
        ctx.translate(size / 2, size / 2);
        ctx.scale(scaleProgress, scaleProgress);

        // Recipient
        ctx.font = 'bold 28px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 20;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 3;
        ctx.strokeText(`To: ${recipientName}`, 0, -100);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`To: ${recipientName}`, 0, -100);

        // Message
        ctx.font = '24px Poppins, sans-serif';
        ctx.strokeText(message, 0, -20);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(message, 0, -20);

        // From
        ctx.font = 'italic 22px Poppins, sans-serif';
        ctx.strokeText('From,', 0, 60);
        ctx.fillStyle = highlightColor;
        ctx.fillText('From,', 0, 60);

        ctx.font = 'bold 26px Poppins, sans-serif';
        ctx.strokeText(senderName, 0, 100);
        ctx.fillStyle = highlightColor;
        ctx.fillText(senderName, 0, 100);

        ctx.restore();
    };

    // Easing function
    const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    // Color interpolation
    const interpolateColor = (color1, color2, progress) => {
        const c1 = hexToRgb(color1);
        const c2 = hexToRgb(color2);
        const r = Math.round(c1.r + (c2.r - c1.r) * progress);
        const g = Math.round(c1.g + (c2.g - c1.g) * progress);
        const b = Math.round(c1.b + (c2.b - c1.b) * progress);
        return `rgb(${r}, ${g}, ${b})`;
    };

    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    };

    const handleBack = () => {
        navigate('/create', { state: { wishData: currentWishData } });
    };

    return (
        <div className="cinematic-animation-page">
            <div className="animation-container">
                <canvas ref={canvasRef} className="animation-canvas" />

                <div className="animation-controls">
                    <button onClick={handleBack} className="btn-back">
                        ← Edit Wish
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CinematicXAnimation;