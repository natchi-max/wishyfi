import React, { useEffect, useRef, useState, useCallback } from 'react';
import './MagicSquareAnimation.css';
import { parseDateComponents, generateDateEchoSquare } from '../utils/magicSquare';
import { createAnimatedGif } from '../utils/gifGenerator';

const MagicSquareAnimation = ({ wishData, onBack, onCreateAnother, shareableLink, isSharedView }) => {
    const canvasRef = useRef(null);
    const [gifUrl, setGifUrl] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [bgImage, setBgImage] = useState(null);
    const [showGift, setShowGift] = useState(isSharedView);
    const [isOpening, setIsOpening] = useState(false);
    const confettiRef = useRef([]); // To store confetti particles
    const auraRef = useRef([]); // To store aura particles
    const crackersRef = useRef([]); // To store firework/crackers particles during square reveal

    // Initialize AI Image
    useEffect(() => {
        import('../utils/imageGenerator').then(async (mod) => {
            const imgUrl = await mod.generateCelebrationImage(wishData);
            setBgImage(imgUrl);
        });
    }, [wishData]);

    // Calculate Square using Date Echo Logic
    const dateStr = wishData.date || '30/03/2007';
    const { DD, MM, CC, YY } = parseDateComponents(dateStr);
    const { square, magicConstant } = generateDateEchoSquare(DD, MM, CC, YY);

    const size = 800; // Increased resolution
    const padding = 100;
    const gridSize = size - padding * 2;
    const cellSize = gridSize / 4;
    const startX = padding;
    const startY = padding;

    const highlightColor = wishData.colorHighlight || '#ff6b6b';
    const bgColor = wishData.colorBg || '#0a0a0f';

    // Total duration: ~10 seconds on screen (at 60fps), much longer in GIF
    const totalFrames = 600;

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
        // Serene Cinematic Timeline:
        // 0.00 - 0.50: Magic Square Reveal (Slower, meditative reveal)
        // 0.50 - 0.70: Proof (Clear, easy to follow validation)
        // 0.70 - 1.00: Heartful Image & Personalized Message (Long, emotional hold)

        // Clear & Background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);

        // --- STAGE 1: MAGIC SQUARE REVEAL (0.0 - 0.55) ---
        if (progress < 0.7) {
            const squareP = Math.min(1, progress / 0.5);
            drawGrid(ctx, 1 - Math.max(0, (progress - 0.65) * 10)); // Fade grid out later

            // Determine active row for "Sliding Focus"
            const rowPhaseDuration = 0.125; // 0.5 total / 4 rows

            square.forEach((row, ri) => {
                const rowStart = ri * rowPhaseDuration;
                const rowEnd = rowStart + rowPhaseDuration;

                // Row Status
                const isCurrentRow = squareP >= rowStart && squareP < rowEnd;
                const isCompletedRow = squareP >= rowEnd;

                // Opacity / Visibility
                let rowOpacity = 0;
                if (isCompletedRow) rowOpacity = 0.6;
                if (isCurrentRow) rowOpacity = 1;
                if (ri === 0) rowOpacity = 1;

                // Highlight Effect
                const isHighlight = isCurrentRow || (ri === 0 && squareP < 0.1);

                // Fade out entire square at the end of animation
                if (progress > 0.65) {
                    rowOpacity *= (1 - (progress - 0.65) * 5);
                }

                if (rowOpacity > 0) {
                    // Row Background Highlight
                    if (isHighlight && progress < 0.5) {
                        ctx.save();
                        ctx.fillStyle = highlightColor;
                        ctx.globalAlpha = 0.1;
                        ctx.fillRect(startX, startY + ri * cellSize, gridSize, cellSize);
                        ctx.restore();

                        // Glow info
                        ctx.shadowColor = highlightColor;
                        ctx.shadowBlur = 15;
                    } else {
                        ctx.shadowBlur = 0;
                    }

                    row.forEach((val, ci) => {
                        // Cell Reveal Effect (Sequential in row)
                        const cellDelay = rowStart + (ci * 0.02); // Faster stagger
                        let cellP = (squareP - cellDelay) / 0.05;
                        cellP = Math.min(1, Math.max(0, cellP));

                        if (cellP > 0) {
                            const x = startX + ci * cellSize + cellSize / 2;
                            const y = startY + ri * cellSize + cellSize / 2;

                            // Rainbow Shimmer for special effect
                            const hueShift = (progress * 360 + ri * 20 + ci * 20) % 360;
                            const isDateRow = (ri === 0);

                            ctx.fillStyle = isDateRow ? `hsl(${hueShift}, 100%, 70%)` : '#fff';
                            // Dynamic dimming
                            if (isCompletedRow && ri !== 0) ctx.fillStyle = 'rgba(255,255,255,0.7)';
                            if (isCompletedRow && ri === 0) ctx.fillStyle = `hsl(${hueShift}, 100%, 75%)`;

                            // Fade out
                            ctx.globalAlpha = rowOpacity * cellP;

                            ctx.font = (ri === 0)
                                ? `bold ${cellSize * 0.42}px 'Poppins', sans-serif`
                                : `${cellSize * 0.38}px 'Poppins', sans-serif`;

                            // Text Glow
                            ctx.shadowColor = isDateRow ? `hsl(${hueShift}, 100%, 50%)` : highlightColor;
                            ctx.shadowBlur = 10 * cellP;

                            // Pop effect
                            if (cellP < 1 && isCurrentRow) {
                                const scale = 1 + Math.sin(cellP * Math.PI) * 0.5;
                                ctx.font = `${cellSize * 0.35 * scale}px 'Poppins', sans-serif`;
                            }

                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(val, x, y);
                        }
                    });

                    // Show Row Sum
                    if (squareP > rowEnd - 0.05 || isCompletedRow) {
                        ctx.save();
                        ctx.globalAlpha = rowOpacity;
                        ctx.fillStyle = highlightColor;
                        ctx.font = `bold ${cellSize * 0.25}px 'Poppins', sans-serif`;
                        ctx.fillText(`= ${magicConstant}`, startX + gridSize + 40, startY + ri * cellSize + cellSize / 2);

                        // --- NEW: Trigger Cracker Burst on Row Completion ---
                        const triggerPoint = rowEnd;
                        if (progress >= triggerPoint && progress < triggerPoint + 0.01) {
                            const side = (ri % 2 === 0) ? startX - 50 : startX + gridSize + 50;
                            const y = startY + ri * cellSize + cellSize / 2;
                            triggerCracker(crackersRef, side, y, highlightColor);
                        }
                        ctx.restore();
                    }
                }
            });
        }

        // --- STAGE 2: PROOF LINES (0.50 - 0.70) ---
        if (progress > 0.5 && progress < 0.75) {
            const proofP = (progress - 0.5) / 0.2;
            ctx.save();
            ctx.globalAlpha = 1 - Math.max(0, (progress - 0.7) * 10);
            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 2;

            for (let i = 0; i < 4; i++) {
                if (proofP > 0.2) {
                    const x = startX + i * cellSize + cellSize / 2;
                    ctx.beginPath();
                    ctx.moveTo(x, startY);
                    ctx.lineTo(x, startY + gridSize);
                    ctx.stroke();
                    if (proofP > 0.3) {
                        ctx.fillStyle = highlightColor;
                        ctx.fillText(`= ${magicConstant}`, x, startY + gridSize + 30);
                    }
                }
            }
            if (proofP > 0.5) {
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(startX + gridSize, startY + gridSize);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(startX + gridSize, startY);
                ctx.lineTo(startX, startY + gridSize);
                ctx.stroke();
            }
            ctx.restore();
        }

        // --- STAGE 3: IMAGE & MESSAGE (0.70 - 1.0) ---
        if (progress > 0.65) {
            const finalP = Math.min(1, (progress - 0.65) / 0.15);

            if (imgRef.current && imgRef.current.complete) {
                ctx.save();
                ctx.globalAlpha = finalP;
                ctx.drawImage(imgRef.current, 0, 0, size, size);
                const grad = ctx.createLinearGradient(0, size / 2, 0, size);
                grad.addColorStop(0, 'rgba(0,0,0,0)');
                grad.addColorStop(0.8, 'rgba(0,0,0,0.8)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, size, size);
                ctx.restore();
            }

            ctx.save();
            ctx.globalAlpha = Math.min(1, finalP * 1.5);
            ctx.translate(0, (1 - finalP) * 30);
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = `bold ${size * 0.09}px 'Dancing Script', cursive`;
            ctx.fillText(`Happy ${wishData.occasion.charAt(0).toUpperCase() + wishData.occasion.slice(1)}!`, size / 2, size * 0.55);

            ctx.font = `italic ${size * 0.04}px 'Playfair Display', serif`;
            const lines = wishData.message.split('\n');
            lines.forEach((line, i) => {
                ctx.fillText(line, size / 2, size * 0.65 + i * 50);
            });

            ctx.fillStyle = highlightColor;
            ctx.font = `bold ${size * 0.03}px 'Poppins', sans-serif`;
            ctx.fillText(`For ${wishData.recipientName}`, size / 2, size * 0.85);
            ctx.restore();

            // Floating Emoji Particles
            ctx.save();
            const seed = wishData.recipientName.length + wishData.date.length;
            const particleCount = 15;
            for (let i = 0; i < particleCount; i++) {
                const pSeed = seed + i;
                const xBase = ((Math.sin(pSeed * 1.5) + 1) / 2) * size;
                const yBase = ((Math.cos(pSeed * 2.1) + 1) / 2) * size;
                const offsetX = Math.sin(progress * 4 + pSeed) * 50;
                const offsetY = -(progress - 0.7) * 200 + Math.cos(progress * 3 + pSeed) * 30;
                const x = xBase + offsetX;
                const y = yBase + offsetY;
                const opacity = Math.min(0.6, finalP * 0.8) * Math.max(0, 1 - (progress - 0.9) * 10);

                ctx.globalAlpha = opacity;
                ctx.font = `${size * 0.04}px serif`;
                const emojis = wishData.occasion === 'birthday' ? ['🎂', '🎈', '✨', '🎁'] :
                    wishData.occasion === 'anniversary' ? ['❤️', '💕', '🌹', '✨'] :
                        wishData.occasion === 'wedding' ? ['💍', '🥂', '🌸', '✨'] :
                            ['✨', '💖', '⭐', '🎈'];
                const emoji = emojis[pSeed % emojis.length];
                ctx.fillText(emoji, x, y);
            }
            ctx.restore();

            // Magical Glitter
            ctx.save();
            ctx.globalAlpha = finalP * 0.5;
            for (let i = 0; i < 40; i++) {
                const s = seed * i;
                const gx = ((Math.sin(s * 0.8) + 1) / 2) * size;
                const gy = ((Math.cos(s * 1.2) + 1) / 2) * size;
                const gOpacity = (Math.sin(progress * 10 + s) + 1) / 2;
                ctx.fillStyle = highlightColor;
                ctx.beginPath();
                ctx.arc(gx, gy, 1.5 * gOpacity, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // Interactive Aura & Confetti & Crackers
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

    const handleGenerateGif = async () => {
        setIsGenerating(true);
        try {
            // Slower GIF speed: 60ms delay (16.6 fps) for a more calm and peaceful feeling.
            // Total GIF duration: 600 frames * 60ms = 36 seconds of magic!
            const blob = await createAnimatedGif(renderFrame, size, size, totalFrames, 60);
            setGifBlob(blob);
            setGifUrl(URL.createObjectURL(blob));
            setIsFinished(true);
        } catch (e) {
            console.error(e);
            alert("Could not generate GIF. Please try again or use a simpler wish.");
        }
        finally { setIsGenerating(false); }
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
                        title: `Magic Wish for ${wishData.recipientName}`,
                        text: `I created a special ${wishData.occasion} wish for ${wishData.recipientName} using Ramanujan Magic Square! 🎁✨`
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
            `🎁 I created a magical ${wishData.occasion} wish for ${wishData.recipientName}! ✨\n\n` +
            `Click to see: ${link}`
        );
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    // Twitter/X Share with link
    const handleTwitterShare = () => {
        const link = shareableLink || window.location.href;
        const text = encodeURIComponent(
            `🎁 Created a magical ${wishData.occasion} wish for ${wishData.recipientName}! ✨\n\n` +
            `Where math meets heart 💜`
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
                            <div className="gift-content">
                                <div className="gift-box">
                                    <div className="gift-lid"></div>
                                    <div className="gift-body"></div>
                                    <div className="gift-ribbon"></div>
                                </div>
                                <h2 className="gift-text">A Magical Surprise for You! ✨</h2>
                                <p className="gift-hint">Tap the gift to open</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="animation-actions text-center mt-lg">
                    {/* --- SHARE LINK SECTION (Always Visible for Sender) --- */}
                    {!isSharedView && (
                        <div className="share-section fast-share fade-in mb-xl">
                            <p className="share-label text-gradient">✨ Your Magic Link is Ready!</p>
                            <div className="share-link-box">
                                <a
                                    href={shareableLink || window.location.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="share-link-display"
                                >
                                    {shareableLink || window.location.href}
                                </a>
                            </div>
                            <div className="share-link-actions">
                                <button className="share-link-btn" onClick={handleCopyLink}>
                                    {linkCopied ? '✓ Copied!' : '📋 Copy Link'}
                                </button>
                                <button className="share-link-btn share-whatsapp-btn" onClick={handleWhatsAppShare}>
                                    WhatsApp 📲
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --- MAIN ACTION ROW (GIF Generation) --- */}
                    {!isSharedView && !isFinished && (
                        <div className="action-row mb-lg">
                            <button className="btn btn-secondary mr-md" onClick={onBack}>
                                Edit Wish ✏️
                            </button>
                            <button className="btn btn-primary glow-on-hover" onClick={handleGenerateGif} disabled={isGenerating}>
                                {isGenerating ? '🎨 Weaving High-Quality GIF...' : 'Download as GIF 🎁'}
                            </button>
                        </div>
                    )}

                    {/* --- GIF RESULT (Visible once generated) --- */}
                    {isFinished && !isSharedView && (
                        <div className="gif-result fade-in mb-lg">
                            <div className="gif-preview-box mb-md">
                                <img src={gifUrl} alt="Magic Gift" className="gif-preview" />
                            </div>
                            <a href={gifUrl} download={`magic_wish_${wishData.recipientName}.gif`} className="btn btn-primary mb-md">
                                Download GIF Now 📥
                            </a>
                        </div>
                    )}

                    {/* --- SHARED VIEW ACTIONS --- */}
                    {isSharedView && (
                        <div className="shared-view-actions fade-in mt-xl">
                            <h3 className="text-secondary mb-md">Loved this magic wish?</h3>
                            <button className="btn btn-primary btn-large shadow-glow" onClick={onCreateAnother}>
                                Create Your Own Magic Wish ✨
                            </button>
                        </div>
                    )}

                    {/* --- SECONDARY SHARE BUTTONS (Always Visible) --- */}
                    {!isSharedView && (
                        <div className="social-share-row mt-md">
                            <p className="share-or mb-sm">Or share via social:</p>
                            <div className="share-buttons">
                                {navigator.share && (
                                    <button className="share-btn share-native" onClick={handleNativeShare}>Share File</button>
                                )}
                                <button className="share-btn share-twitter" onClick={handleTwitterShare}>Twitter</button>
                                <button className="share-btn share-facebook" onClick={handleFacebookShare}>Facebook</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MagicSquareAnimation;

