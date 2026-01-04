import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MagicSquareAnimation.css';
import { parseDateComponents, generateDateEchoSquare } from '../utils/magicSquare';
import { createAnimatedGif } from '../utils/gifGenerator';
import { LoadingSpinner, ProgressBar } from './LoadingComponents';
import TinyColor from 'tinycolor2';

// Helper to format numbers as two digits (e.g., 7 -> "07", 1 -> "01")
const formatTwoDigit = (num) => {
    const n = Math.abs(num);
    return n < 10 ? `0${n}` : `${n}`;
};

const MagicSquareAnimation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const wishData = location.state?.wishData;
    const isSharedView = location.pathname.startsWith('/share/');

    const canvasRef = useRef(null);
    const [gifUrl, setGifUrl] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [bgImage, setBgImage] = useState(null);
    const [showGift, setShowGift] = useState(false); // Animation plays immediately like a GIF
    const [isOpening, setIsOpening] = useState(false);
    const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
    const [shareableLink, setShareableLink] = useState('');
    const confettiRef = useRef([]); // To store confetti particles
    const auraRef = useRef([]); // To store aura particles
    const crackersRef = useRef([]); // To store firework/crackers particles during square reveal

    // Redirect if no wish data
    useEffect(() => {
        if (!wishData && !isSharedView) {
            navigate('/create');
        }
    }, [wishData, navigate, isSharedView]);

    // Generate shareable link
    useEffect(() => {
        if (wishData) {
            const encoded = encodeWishData(wishData);
            const link = `${window.location.origin}/share/${encoded}`;
            setShareableLink(link);
        }
    }, [wishData]);

    // Utility to encode wish data
    function encodeWishData(data) {
        const json = JSON.stringify(data);
        return btoa(encodeURIComponent(json));
    }

    const handleBack = () => {
        navigate('/create', { state: { wishData } });
    };

    const handleCreateAnother = () => {
        navigate('/create');
    };

    if (!wishData && !isSharedView) {
        return null;
    }

    // Initialize AI Image
    useEffect(() => {
        if (wishData) {
            import('../utils/imageGenerator').then(async (mod) => {
                try {
                    const imgUrl = await mod.generateCelebrationImage(wishData);
                    setBgImage(imgUrl);
                } catch (error) {
                    console.log('Image generation not available:', error);
                }
            }).catch(() => {
                console.log('Image generator module not found');
            });
        }
    }, [wishData]);

    // Calculate Square using Date Echo Logic
    const dateStr = wishData?.date || '30/03/2007';
    const { DD, MM, CC, YY } = parseDateComponents(dateStr);
    const { square, magicConstant } = generateDateEchoSquare(DD, MM, CC, YY);

    const size = 800; // Increased resolution
    const padding = 100;
    const gridSize = size - padding * 2;
    const cellSize = gridSize / 4;
    const startX = padding;
    const startY = padding;

    const highlightColor = wishData?.colorHighlight || '#667eea';
    const bgColor = wishData?.colorBg || '#ffffff';

    // Total duration: ~32 seconds on screen (30% slower than before)
    const totalFrames = 1950;

    const imgRef = useRef(new Image());
    useEffect(() => {
        if (bgImage) {
            imgRef.current.src = bgImage;
        }
    }, [bgImage]);

    const drawGrid = useCallback((ctx, opacity = 1) => {
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * opacity})`;
        ctx.lineWidth = 2;
        for (let i = 0; i <= 4; i++) {
            ctx.beginPath();
            ctx.moveTo(startX, startY + i * cellSize);
            ctx.lineTo(startX + gridSize, startY + i * cellSize);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(startX + i * cellSize, startY);
            ctx.lineTo(startX + i * cellSize, startY + gridSize);
            ctx.stroke();
        }
    }, [cellSize, gridSize, startX, startY]);

    const renderFrame = useCallback((ctx, frame, total) => {
        const progress = frame / total;

        // CLEAN Animation Timeline (No overlapping screens):
        // Screen 1 (0.00 - 0.12): Opening intro text
        // Screen 2 (0.12 - 0.22): Grid appear with all numbers
        // Screen 3 (0.22 - 0.45): Rows highlight one-by-one with sums
        // Screen 4 (0.45 - 0.55): Column highlights showing same sum
        // Screen 5 (0.55 - 0.68): Date row special highlight with labels
        // Screen 6 (0.68 - 1.00): Final greeting screen

        // Clear & Background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);

        const isLtTheme = TinyColor(bgColor).isLight();
        const baseTextColor = isLtTheme ? '#1e293b' : '#fff';

        // ========== HELPER FUNCTIONS ==========

        // Draw a single cell with number
        const drawCell = (ri, ci, opacity, color = null, bold = false) => {
            if (opacity <= 0) return;
            const val = square[ri][ci];
            const x = startX + ci * cellSize + cellSize / 2;
            const y = startY + ri * cellSize + cellSize / 2;

            ctx.save();
            ctx.globalAlpha = Math.min(1, opacity);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = color || baseTextColor;
            ctx.font = bold
                ? `bold ${cellSize * 0.42}px 'Poppins', sans-serif`
                : `${cellSize * 0.38}px 'Poppins', sans-serif`;

            if (color) {
                ctx.shadowColor = color;
                ctx.shadowBlur = 12;
            }

            ctx.fillText(formatTwoDigit(val), x, y);
            ctx.restore();
        };

        // Draw all cells
        const drawAllCells = (opacity, highlightRow = -1, highlightCol = -1, highlightColor = null) => {
            for (let ri = 0; ri < 4; ri++) {
                for (let ci = 0; ci < 4; ci++) {
                    const isHighlighted = ri === highlightRow || ci === highlightCol;
                    const cellOpacity = isHighlighted ? opacity : opacity * 0.5;
                    drawCell(ri, ci, cellOpacity, isHighlighted ? highlightColor : null, isHighlighted);
                }
            }
        };

        // Draw row background highlight
        const drawRowBg = (ri, opacity, color = highlightColor) => {
            ctx.save();
            ctx.globalAlpha = opacity * 0.2;
            ctx.fillStyle = color;
            ctx.fillRect(startX, startY + ri * cellSize, gridSize, cellSize);
            ctx.restore();
        };

        // Draw column background highlight
        const drawColBg = (ci, opacity, color = highlightColor) => {
            ctx.save();
            ctx.globalAlpha = opacity * 0.2;
            ctx.fillStyle = color;
            ctx.fillRect(startX + ci * cellSize, startY, cellSize, gridSize);
            ctx.restore();
        };

        // Draw sum text
        const drawSum = (text, x, y, opacity) => {
            if (opacity <= 0) return;
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.fillStyle = highlightColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${cellSize * 0.26}px 'Poppins', sans-serif`;
            ctx.shadowColor = highlightColor;
            ctx.shadowBlur = 8;
            ctx.fillText(text, x, y);
            ctx.restore();
        };

        // Smooth fade helper
        const smoothFade = (p, fadeInEnd, fadeOutStart) => {
            if (p < fadeInEnd) return p / fadeInEnd;
            if (p > fadeOutStart) return Math.max(0, 1 - (p - fadeOutStart) / (1 - fadeOutStart));
            return 1;
        };

        // ========== SCREEN 1: INTRO TEXT (0.00 - 0.12) ==========
        if (progress < 0.12) {
            const p = progress / 0.12;

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // "Hi [Name]" (0-35%)
            if (p < 0.38) {
                const textP = p / 0.35;
                const fade = smoothFade(textP, 0.3, 0.7);
                ctx.globalAlpha = fade;
                ctx.fillStyle = highlightColor;
                ctx.font = `bold ${size * 0.1}px 'Playfair Display', serif`;
                ctx.shadowColor = highlightColor;
                ctx.shadowBlur = 20;
                ctx.fillText(`Hi ${wishData?.recipientName || 'Friend'}`, size / 2, size / 2);
            }
            // "This is not random" (35-70%)
            else if (p < 0.72) {
                const textP = (p - 0.35) / 0.35;
                const fade = smoothFade(textP, 0.3, 0.7);
                ctx.globalAlpha = fade;
                ctx.fillStyle = baseTextColor;
                ctx.font = `italic ${size * 0.055}px 'Playfair Display', serif`;
                ctx.shadowColor = highlightColor;
                ctx.shadowBlur = 10;
                ctx.fillText('This is not random', size / 2, size / 2);
            }
            // "Watch closely..." (70-100%)
            else {
                const textP = (p - 0.70) / 0.30;
                const fade = smoothFade(textP, 0.3, 0.8);
                ctx.globalAlpha = fade;
                ctx.fillStyle = highlightColor;
                ctx.font = `bold ${size * 0.065}px 'Poppins', sans-serif`;
                ctx.shadowColor = highlightColor;
                ctx.shadowBlur = 25;
                ctx.fillText('Watch closely...', size / 2, size / 2);
            }

            ctx.restore();
        }

        // ========== SCREEN 2: GRID APPEAR (0.12 - 0.22) ==========
        else if (progress >= 0.12 && progress < 0.22) {
            const p = (progress - 0.12) / 0.10;
            const fade = smoothFade(p, 0.3, 0.85);

            // Draw grid lines
            drawGrid(ctx, fade);

            // Animate cells appearing
            for (let ri = 0; ri < 4; ri++) {
                for (let ci = 0; ci < 4; ci++) {
                    const cellIndex = ri * 4 + ci;
                    const delay = cellIndex * 0.04;
                    const cellP = Math.max(0, Math.min(1, (p - delay) / 0.15));
                    drawCell(ri, ci, cellP * fade, null, false);
                }
            }
        }

        // ========== SCREEN 3: ROWS WITH SUMS (0.22 - 0.45) ==========
        else if (progress >= 0.22 && progress < 0.45) {
            const p = (progress - 0.22) / 0.23;
            const rowColors = [highlightColor, '#ff6b6b', '#4ecdc4', '#a855f7'];

            // Draw grid
            drawGrid(ctx, 1);

            // Each row gets ~23% of this phase
            for (let ri = 0; ri < 4; ri++) {
                const rowStart = ri * 0.25;
                const rowEnd = rowStart + 0.25;
                const isActive = p >= rowStart && p < rowEnd;
                const isDone = p >= rowEnd;

                let rowOpacity = 0;
                if (isActive) {
                    rowOpacity = Math.min(1, (p - rowStart) / 0.08);
                } else if (isDone) {
                    rowOpacity = 0.5;
                }

                // Draw row highlight and cells
                if (rowOpacity > 0) {
                    if (isActive) {
                        drawRowBg(ri, 1, rowColors[ri]);
                    }

                    for (let ci = 0; ci < 4; ci++) {
                        const cellDelay = rowStart + ci * 0.03;
                        const cellOpacity = Math.min(1, Math.max(0, (p - cellDelay) / 0.06));
                        drawCell(ri, ci, cellOpacity, isActive ? rowColors[ri] : null, isActive);
                    }

                    // Show sum after cells appear
                    if (p > rowStart + 0.15) {
                        const sumOpacity = Math.min(1, (p - rowStart - 0.15) / 0.05);
                        drawSum(`= ${magicConstant}`, startX + gridSize + 55, startY + ri * cellSize + cellSize / 2, sumOpacity * (isActive ? 1 : 0.5));
                    }
                }
            }
        }

        // ========== SCREEN 4: COLUMN HIGHLIGHTS (0.45 - 0.55) ==========
        else if (progress >= 0.45 && progress < 0.55) {
            const p = (progress - 0.45) / 0.10;
            const fade = smoothFade(p, 0.2, 0.85);

            // Draw grid
            drawGrid(ctx, fade);

            // Highlight each column briefly
            const currentCol = Math.floor(p * 4.5) % 4;

            for (let ci = 0; ci < 4; ci++) {
                const isActive = ci === currentCol;
                if (isActive) {
                    drawColBg(ci, fade, '#4ecdc4');
                }
            }

            // Draw all cells
            for (let ri = 0; ri < 4; ri++) {
                for (let ci = 0; ci < 4; ci++) {
                    const isHighlighted = ci === currentCol;
                    drawCell(ri, ci, fade, isHighlighted ? '#4ecdc4' : null, isHighlighted);
                }
            }

            // Show column sum
            drawSum(`= ${magicConstant}`, startX + currentCol * cellSize + cellSize / 2, startY + gridSize + 40, fade);

            // Title
            ctx.save();
            ctx.globalAlpha = fade;
            ctx.fillStyle = '#4ecdc4';
            ctx.textAlign = 'center';
            ctx.font = `bold ${cellSize * 0.22}px 'Poppins', sans-serif`;
            ctx.fillText('Every Column = Same Magic Sum!', startX + gridSize / 2, startY - 35);
            ctx.restore();
        }

        // ========== SCREEN 5: DATE ROW SPECIAL HIGHLIGHT (0.55 - 0.68) ==========
        else if (progress >= 0.55 && progress < 0.68) {
            const p = (progress - 0.55) / 0.13;
            const fade = smoothFade(p, 0.2, 0.8);

            // Draw grid
            drawGrid(ctx, fade);

            // Rainbow gradient on first row
            ctx.save();
            ctx.globalAlpha = fade * 0.35;
            const gradient = ctx.createLinearGradient(startX, 0, startX + gridSize, 0);
            gradient.addColorStop(0, '#ff6b6b');
            gradient.addColorStop(0.33, '#ffe66d');
            gradient.addColorStop(0.66, '#4ecdc4');
            gradient.addColorStop(1, '#a855f7');
            ctx.fillStyle = gradient;
            ctx.fillRect(startX, startY, gridSize, cellSize);
            ctx.restore();

            // Draw date row with rainbow colors
            const dateColors = ['#ff6b6b', '#ffe66d', '#4ecdc4', '#a855f7'];
            for (let ci = 0; ci < 4; ci++) {
                drawCell(0, ci, fade, dateColors[ci], true);
            }

            // Draw other rows dimmed
            for (let ri = 1; ri < 4; ri++) {
                for (let ci = 0; ci < 4; ci++) {
                    drawCell(ri, ci, fade * 0.35, null, false);
                }
            }

            // Title
            ctx.save();
            ctx.globalAlpha = fade;
            ctx.fillStyle = highlightColor;
            ctx.textAlign = 'center';
            ctx.font = `bold ${cellSize * 0.28}px 'Poppins', sans-serif`;
            ctx.shadowColor = highlightColor;
            ctx.shadowBlur = 15;
            ctx.fillText('✨ Your Special Date! ✨', startX + gridSize / 2, startY - 40);
            ctx.restore();

            // Show sum
            drawSum(`= ${magicConstant}`, startX + gridSize + 55, startY + cellSize / 2, fade);
        }

        // ========== SCREEN 6: FINAL GREETING (0.68 - 1.00) ==========
        else if (progress >= 0.68) {
            const p = (progress - 0.68) / 0.32;
            const fade = Math.min(1, p / 0.15);

            // Background image with gradient overlay
            if (imgRef.current && imgRef.current.complete) {
                ctx.save();
                ctx.globalAlpha = fade;
                ctx.drawImage(imgRef.current, 0, 0, size, size);
                const grad = ctx.createLinearGradient(0, size * 0.3, 0, size);
                grad.addColorStop(0, 'rgba(0,0,0,0)');
                grad.addColorStop(0.6, 'rgba(0,0,0,0.7)');
                grad.addColorStop(1, 'rgba(0,0,0,0.9)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, size, size);
                ctx.restore();
            }

            ctx.save();
            ctx.globalAlpha = fade;
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            ctx.shadowBlur = 8;

            // Main greeting
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${size * 0.095}px 'Dancing Script', cursive`;
            const displayOccasion = wishData?.occasion === 'other'
                ? wishData?.customOccasion || 'Celebration'
                : wishData?.occasion || 'Celebration';
            ctx.fillText(`Happy ${displayOccasion.charAt(0).toUpperCase() + displayOccasion.slice(1)}!`, size / 2, size * 0.48);

            // Message
            ctx.font = `italic ${size * 0.042}px 'Playfair Display', serif`;
            const lines = (wishData?.message || 'A special wish for you').split('\n');
            lines.forEach((line, i) => {
                ctx.fillText(line, size / 2, size * 0.58 + i * 42);
            });

            // Recipient
            ctx.fillStyle = highlightColor;
            ctx.font = `bold ${size * 0.038}px 'Poppins', sans-serif`;
            ctx.fillText(`To: ${wishData?.recipientName || 'Someone Special'}`, size / 2, size * 0.76);

            // Sender
            if (wishData?.senderName) {
                ctx.fillStyle = '#fff';
                ctx.font = `italic ${size * 0.03}px 'Poppins', sans-serif`;
                ctx.fillText(`— From ${wishData.senderName}`, size / 2, size * 0.83);
            }

            // Date
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.font = `${size * 0.026}px 'Poppins', sans-serif`;
            ctx.fillText(`Special Date: ${wishData?.date || dateStr}`, size / 2, size * 0.89);

            // Watermark
            ctx.globalAlpha = 0.4;
            ctx.font = `${size * 0.016}px 'Poppins', sans-serif`;
            ctx.textAlign = 'right';
            ctx.fillText('wishyfi.com', size - 12, size - 10);

            ctx.restore();

            // Emoji particles
            if (fade > 0.3) {
                ctx.save();
                const seed = (wishData?.recipientName?.length || 5) + (wishData?.date?.length || 10);
                for (let i = 0; i < 15; i++) {
                    const ps = seed + i;
                    const x = ((Math.sin(ps * 1.5) + 1) / 2) * size + Math.sin(progress * 3 + ps) * 40;
                    const y = ((Math.cos(ps * 2.1) + 1) / 2) * size - (p * 100) + Math.cos(progress * 2.5 + ps) * 30;
                    ctx.globalAlpha = Math.min(0.6, fade * 0.7) * Math.max(0, 1 - (p - 0.85) * 6);
                    ctx.font = `${size * 0.04}px serif`;
                    const emojis = ['✨', '💖', '⭐', '🎈', '🎊'];
                    ctx.fillText(emojis[ps % emojis.length], x, y);
                }
                ctx.restore();
            }
        }

        // Interactive effects
        renderInteractions(ctx, size, mousePos, auraRef, confettiRef, crackersRef, progress);

    }, [square, magicConstant, startX, startY, cellSize, gridSize, drawGrid, highlightColor, bgColor, wishData, mousePos]);

    // Helper to trigger multi-colored firework burst
    const triggerCracker = (ref, x, y, baseColor) => {
        const particleCount = 45; // More dense
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 3 + Math.random() * 10;
            const hue = Math.random() * 360; // Every particle a new color
            ref.current.push({
                x, y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                life: 1.0 + Math.random() * 0.5, // Varied life
                r: Math.random() * 4 + 1.5,
                color: `hsl(${hue}, 100%, 65%)`
            });
        }
    };

    // Helper for interactive elements
    const renderInteractions = (ctx, size, mouse, aura, confetti, crackers, progress) => {
        // 1. Crackers (Fireworks during Reveal)
        crackers.current.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // Gravity
            p.life -= 0.015;
            if (p.life <= 0) crackers.current.splice(i, 1);

            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // 2. Magic Aura (Mouse Follow)
        if (mouse.x > 0) {
            if (aura.current.length < 20) {
                aura.current.push({
                    x: mouse.x,
                    y: mouse.y,
                    r: Math.random() * 4 + 2,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    life: 1.0,
                    color: highlightColor
                });
            }
        }

        aura.current.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            if (p.life <= 0) aura.current.splice(i, 1);

            ctx.save();
            ctx.globalAlpha = p.life * 0.5;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // 2. Confetti Burst (Trigger at progress ~0.6)
        if (progress > 0.6 && progress < 0.63 && confetti.current.length === 0) {
            for (let i = 0; i < 100; i++) {
                confetti.current.push({
                    x: size / 2,
                    y: size / 2,
                    vx: (Math.random() - 0.5) * 15,
                    vy: (Math.random() - 0.8) * 15,
                    r: Math.random() * 6 + 4,
                    color: `hsl(${Math.random() * 360}, 80%, 60%)`,
                    rotation: Math.random() * Math.PI,
                    rv: (Math.random() - 0.5) * 0.2
                });
            }
        }

        if (progress > 0.6) {
            confetti.current.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.3; // Gravity
                p.vx *= 0.98; // Friction
                p.rotation += p.rv;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.5);
                ctx.restore();
            });
        }
    };

    // Mouse Tracking Event
    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;
        setMousePos({
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        });
    };

    useEffect(() => {
        if (showGift) return; // Don't animate while gift is closed

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let frame = 0;
        let animationId;

        const animate = () => {
            renderFrame(ctx, frame, totalFrames);

            // Loop automatically like a GIF
            frame = (frame + 1) % totalFrames;

            // Reset particles on loop restart for a clean experience
            if (frame === 0) {
                confettiRef.current = [];
                crackersRef.current = [];
            }

            animationId = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(animationId);
    }, [renderFrame, totalFrames, showGift]);

    const handleOpenGift = () => {
        setIsOpening(true);
        setTimeout(() => {
            setShowGift(false);
        }, 800);
    };

    const [gifBlob, setGifBlob] = useState(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [gifProgress, setGifProgress] = useState(0);

    const handleGenerateGif = async () => {
        setIsGenerating(true);
        try {
            // Optimized GIF: 120 frames at 50ms = 6 seconds, faster generation
            const gifFrames = 120;
            const blob = await createAnimatedGif(renderFrame, size, size, gifFrames, 50);
            setGifBlob(blob);
            setGifUrl(URL.createObjectURL(blob));
            setIsFinished(true);
        } catch (e) {
            console.error('GIF generation error:', e);
            alert("Could not generate GIF. Please try again or use a simpler wish.");
        }
        finally { setIsGenerating(false); }
    };

    // Robust download function
    const handleDownloadGif = () => {
        if (!gifBlob) return;

        try {
            const url = URL.createObjectURL(gifBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `magic_wish_${wishData?.recipientName || 'special'}.gif`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Cleanup the URL after a short delay
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (e) {
            console.error('Download error:', e);
            // Fallback: open in new tab
            if (gifUrl) {
                window.open(gifUrl, '_blank');
            }
        }
    };

    // Native Share API (mobile friendly)
    const handleNativeShare = async () => {
        if (navigator.share && gifBlob) {
            try {
                const file = new File([gifBlob], `magic_wish_${wishData.recipientName}.gif`, { type: 'image/gif' });
                await navigator.share({
                    title: `Magic Wish for ${wishData.recipientName}`,
                    text: `A special ${wishData.occasion} wish created with Ramanujan Magic Square! ✨`,
                    files: [file]
                });
            } catch (err) {
                // User cancelled or error - try text share
                try {
                    await navigator.share({
                        title: `To: ${wishData.recipientName}`,
                        text: `To: ${wishData.recipientName} ${wishData.senderName ? `By: ${wishData.senderName}` : ''} | Magical ${wishData.occasion} ✨`
                    });
                } catch (e) {
                    console.log('Share cancelled');
                }
            }
        } else {
            alert('Native sharing not supported. Please use the other share options or download the GIF.');
        }
    };

    // Copy shareable link
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareableLink || window.location.href);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (e) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareableLink || window.location.href;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        }
    };

    // WhatsApp Share with link
    const handleWhatsAppShare = () => {
        const link = shareableLink || window.location.href;
        const text = encodeURIComponent(
            `🎁 To: ${wishData.recipientName}${wishData.senderName ? ` By: ${wishData.senderName}` : ''} | Magical ${wishData.occasion} ✨\n\n` +
            `Click: ${link}`
        );
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    // Twitter/X Share with link
    const handleTwitterShare = () => {
        const link = shareableLink || window.location.href;
        const text = encodeURIComponent(
            `🎁 To: ${wishData.recipientName}${wishData.senderName ? ` By: ${wishData.senderName}` : ''} | Magical ${wishData.occasion} ✨`
        );
        const url = encodeURIComponent(link);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    };

    // Facebook Share with link
    const handleFacebookShare = () => {
        const link = shareableLink || window.location.href;
        const url = encodeURIComponent(link);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    };

    // Copy GIF to Clipboard (as blob)
    const handleCopyGif = async () => {
        if (gifBlob) {
            try {
                // Try to copy as image (works in some browsers)
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/gif': gifBlob })
                ]);
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            } catch (err) {
                // Fallback: copy the message
                try {
                    await navigator.clipboard.writeText(
                        `🎁 Magic Wish for ${wishData.recipientName}!\n` +
                        `Created with Ramanujan Magic Square ✨\n` +
                        `${window.location.origin}`
                    );
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000);
                } catch (e) {
                    alert('Could not copy. Please download the GIF and share manually.');
                }
            }
        }
    };

    return (
        <div className="animation-page page">
            <div className="animation-container">
                <div className="canvas-wrapper cinematic-border" onMouseMove={handleMouseMove} onTouchMove={(e) => {
                    const touch = e.touches[0];
                    handleMouseMove(touch);
                }}>
                    <canvas ref={canvasRef} width={size} height={size} />

                    {/* --- GIFT OVERLAY --- */}
                    {showGift && (
                        <div className={`gift-overlay ${isOpening ? 'opening' : ''}`} onClick={handleOpenGift}>
                            <div className="gift-content" style={{
                                '--gift-primary': highlightColor,
                                '--gift-bg': bgColor
                            }}>
                                <div className="gift-box" style={{
                                    background: `linear-gradient(135deg, ${highlightColor}, ${highlightColor}dd)`,
                                    borderColor: highlightColor
                                }}></div>
                                <h2 className="gift-text" style={{ color: highlightColor }}>Your Magic Wish Awaits</h2>
                                <p className="gift-hint" style={{ color: highlightColor + '99' }}>Click to reveal</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="animation-actions text-center mt-lg">

                    {/* --- MAIN ACTION ROW (GIF Generation) --- */}
                    {!isSharedView && !isFinished && (
                        <div className="action-row mb-lg">
                            <button className="btn btn-secondary mr-md" onClick={handleBack}>
                                Edit Wish ✏️
                            </button>
                            <button className="btn btn-secondary mr-md" onClick={handleCopyLink}>
                                {linkCopied ? '✓ Copied!' : '🔗 Copy Link'}
                            </button>
                            <button className="btn btn-primary glow-on-hover" onClick={handleGenerateGif} disabled={isGenerating}>
                                {isGenerating ? (
                                    <div className="generating-content">
                                        <LoadingSpinner size="sm" />
                                        <span>Creating GIF...</span>
                                    </div>
                                ) : 'Download as GIF 🎁'}
                            </button>
                            {isGenerating && gifProgress > 0 && (
                                <ProgressBar progress={gifProgress} label="Generating frames..." />
                            )}
                        </div>
                    )}

                    {/* --- GIF RESULT (Visible once generated) --- */}
                    {isFinished && !isSharedView && (
                        <div className="gif-result fade-in mb-lg">
                            <div className="gif-preview-box mb-md">
                                <img src={gifUrl} alt="Magic Gift" className="gif-preview" />
                            </div>
                            <button onClick={handleDownloadGif} className="btn btn-primary mb-md">
                                Download GIF Now 📥
                            </button>
                        </div>
                    )}

                    {/* --- SHARED VIEW ACTIONS --- */}
                    {isSharedView && (
                        <div className="shared-view-actions fade-in mt-xl">
                            <h3 className="text-secondary mb-md">Loved this magic wish?</h3>
                            <button className="btn btn-primary btn-large shadow-glow" onClick={handleCreateAnother}>
                                Create Your Own Magic Wish ✨
                            </button>
                        </div>
                    )}


                </div>
            </div>

            <footer className="site-footer">
                <a href="http://wishyfi.com/" target="_blank" rel="noopener noreferrer">wishyfi.com</a>
            </footer>
        </div>
    );
};

export default MagicSquareAnimation;

