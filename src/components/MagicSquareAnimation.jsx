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
    const [showGift, setShowGift] = useState(true);
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

    // Total duration: ~25 seconds on screen (at 60fps), much longer in GIF
    const totalFrames = 1500;

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

        // NEW Animation Timeline:
        // 0.00 - 0.40: ROWS - Show each row with total (4 rows × 10% each)
        // 0.40 - 0.56: COLUMNS - Show each column with total (4 columns × 4% each)
        // 0.56 - 0.68: DATE HIGHLIGHT - Special highlight on first row (the date)
        // 0.68 - 1.00: MESSAGE - Show heartful image and personalized message

        // Clear & Background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);

        const isLtTheme = TinyColor(bgColor).isLight();
        const baseTextColor = isLtTheme ? '#1e293b' : '#fff';
        const dimTextColor = isLtTheme ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255,255,255,0.5)';

        // Helper function to draw a cell
        const drawCell = (ri, ci, opacity, isHighlight = false) => {
            const val = square[ri][ci];
            const x = startX + ci * cellSize + cellSize / 2;
            const y = startY + ri * cellSize + cellSize / 2;

            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (isHighlight) {
                const hueShift = (progress * 360 + ri * 20 + ci * 20) % 360;
                ctx.fillStyle = `hsl(${hueShift}, 100%, 60%)`;
                ctx.shadowColor = `hsl(${hueShift}, 100%, 50%)`;
                ctx.shadowBlur = 15;
                ctx.font = `bold ${cellSize * 0.42}px 'Poppins', sans-serif`;
            } else {
                ctx.fillStyle = baseTextColor;
                ctx.font = `${cellSize * 0.38}px 'Poppins', sans-serif`;
            }

            ctx.fillText(formatTwoDigit(val), x, y);
            ctx.restore();
        };

        // Helper function to draw row highlight background
        const drawRowHighlight = (ri, opacity) => {
            ctx.save();
            ctx.fillStyle = highlightColor;
            ctx.globalAlpha = 0.15 * opacity;
            ctx.fillRect(startX, startY + ri * cellSize, gridSize, cellSize);
            ctx.restore();
        };

        // Helper function to draw column highlight background
        const drawColHighlight = (ci, opacity) => {
            ctx.save();
            ctx.fillStyle = highlightColor;
            ctx.globalAlpha = 0.15 * opacity;
            ctx.fillRect(startX + ci * cellSize, startY, cellSize, gridSize);
            ctx.restore();
        };

        // Helper to draw sum text
        const drawSum = (text, x, y, opacity) => {
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.fillStyle = highlightColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${cellSize * 0.28}px 'Poppins', sans-serif`;
            ctx.shadowColor = highlightColor;
            ctx.shadowBlur = 8;
            ctx.fillText(text, x, y);
            ctx.restore();
        };

        // Draw grid
        const gridOpacity = progress < 0.65 ? 1 : Math.max(0, 1 - (progress - 0.65) * 10);
        if (gridOpacity > 0) {
            drawGrid(ctx, gridOpacity);
        }

        // --- STAGE 1: ROWS (0.00 - 0.50) ---
        if (progress < 0.8) {
            const rowPhase = 0.125; // 12.5% per row (slower)

            for (let ri = 0; ri < 4; ri++) {
                const rowStart = ri * rowPhase;
                const rowEnd = rowStart + rowPhase;
                const isCurrentRow = progress >= rowStart && progress < rowEnd;
                const isCompletedRow = progress >= rowEnd;

                // Determine row opacity
                let rowOpacity = 0;
                if (isCurrentRow) {
                    rowOpacity = Math.min(1, (progress - rowStart) / 0.02); // Quick fade in
                } else if (isCompletedRow) {
                    rowOpacity = 0.6;
                }

                // Fade out all during transition to message
                if (progress > 0.75) {
                    rowOpacity *= Math.max(0, 1 - (progress - 0.75) * 10);
                }

                if (rowOpacity > 0) {
                    // Highlight current row
                    if (isCurrentRow && progress < 0.40) {
                        drawRowHighlight(ri, 1);
                    }

                    // Draw cells for this row
                    for (let ci = 0; ci < 4; ci++) {
                        const cellDelay = rowStart + ci * 0.015;
                        const cellOpacity = Math.min(1, Math.max(0, (progress - cellDelay) / 0.02));
                        if (cellOpacity > 0) {
                            drawCell(ri, ci, rowOpacity * cellOpacity, isCurrentRow);
                        }
                    }

                    // Show row total when row is complete or completing
                    if (progress > rowStart + 0.06) {
                        const sumOpacity = Math.min(1, (progress - rowStart - 0.06) / 0.02) * rowOpacity;
                        drawSum(`= ${magicConstant}`, startX + gridSize + 50, startY + ri * cellSize + cellSize / 2, sumOpacity);

                        // Trigger cracker on row completion
                        if (progress >= rowEnd && progress < rowEnd + 0.005) {
                            const side = (ri % 2 === 0) ? startX - 30 : startX + gridSize + 30;
                            triggerCracker(crackersRef, side, startY + ri * cellSize + cellSize / 2, highlightColor);
                        }
                    }
                }
            }
        }

        // --- STAGE 2: COLUMNS (0.50 - 0.70) ---
        if (progress >= 0.50 && progress < 0.8) {
            const colPhaseStart = 0.50;
            const colPhase = 0.05; // 5% per column (slower)

            for (let ci = 0; ci < 4; ci++) {
                const colStart = colPhaseStart + ci * colPhase;
                const colEnd = colStart + colPhase;
                const isCurrentCol = progress >= colStart && progress < colEnd;
                const isCompletedCol = progress >= colEnd;

                let colOpacity = 0;
                if (isCurrentCol) {
                    colOpacity = 1;
                } else if (isCompletedCol) {
                    colOpacity = 0.6;
                }

                // Fade out during transition
                if (progress > 0.75) {
                    colOpacity *= Math.max(0, 1 - (progress - 0.75) * 10);
                }

                if (colOpacity > 0 && isCurrentCol) {
                    drawColHighlight(ci, 1);

                    // Show column total
                    if (progress > colStart + 0.02) {
                        drawSum(`= ${magicConstant}`, startX + ci * cellSize + cellSize / 2, startY + gridSize + 35, colOpacity);
                    }
                }
            }
        }

        // --- STAGE 3: DATE HIGHLIGHT (0.70 - 0.85) ---
        if (progress >= 0.70 && progress < 0.85) {
            const dateP = (progress - 0.70) / 0.15;
            const fadeOut = progress > 0.80 ? Math.max(0, 1 - (progress - 0.80) * 10) : 1;

            // Special rainbow highlight on first row (the date)
            ctx.save();
            ctx.globalAlpha = 0.3 * fadeOut;
            const gradient = ctx.createLinearGradient(startX, 0, startX + gridSize, 0);
            gradient.addColorStop(0, '#ff0000');
            gradient.addColorStop(0.25, '#ffff00');
            gradient.addColorStop(0.5, '#00ff00');
            gradient.addColorStop(0.75, '#00ffff');
            gradient.addColorStop(1, '#ff00ff');
            ctx.fillStyle = gradient;
            ctx.fillRect(startX, startY, gridSize, cellSize);
            ctx.restore();

            // Redraw date row with special effects
            for (let ci = 0; ci < 4; ci++) {
                drawCell(0, ci, fadeOut, true);
            }

            // Show "Your Special Date!" text
            ctx.save();
            ctx.globalAlpha = dateP * fadeOut;
            ctx.fillStyle = highlightColor;
            ctx.textAlign = 'center';
            ctx.font = `bold ${cellSize * 0.25}px 'Poppins', sans-serif`;
            ctx.fillText('✨ Your Special Date! ✨', startX + gridSize / 2, startY - 30);
            
            // Show date labels below first row
            ctx.font = `${cellSize * 0.18}px 'Poppins', sans-serif`;
            ctx.fillStyle = highlightColor;
            const labels = ['Day', 'Month', 'Century', 'Year'];
            const values = [DD, MM, CC, YY];
            for (let i = 0; i < 4; i++) {
                const x = startX + i * cellSize + cellSize / 2;
                ctx.fillText(labels[i], x, startY + cellSize + 25);
                ctx.fillText(`(${values[i]})`, x, startY + cellSize + 45);
            }
            ctx.restore();
        }

        // --- STAGE 4: IMAGE & MESSAGE (0.85 - 1.0) ---
        if (progress > 0.80) {
            const finalP = Math.min(1, (progress - 0.80) / 0.20);

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
            ctx.fillText(`Happy ${wishData?.occasion?.charAt(0).toUpperCase() + wishData?.occasion?.slice(1) || 'Celebration'}!`, size / 2, size * 0.55);

            ctx.font = `italic ${size * 0.04}px 'Playfair Display', serif`;
            const lines = (wishData?.message || 'A special wish for you').split('\n');
            lines.forEach((line, i) => {
                ctx.fillText(line, size / 2, size * 0.65 + i * 50);
            });

            ctx.fillStyle = highlightColor;
            ctx.font = `bold ${size * 0.03}px 'Poppins', sans-serif`;
            ctx.fillText(`To: ${wishData?.recipientName || 'Someone Special'}`, size / 2, size * 0.82);

            if (wishData?.senderName) {
                ctx.font = `italic ${size * 0.025}px 'Poppins', sans-serif`;
                ctx.fillText(`By: ${wishData.senderName}`, size / 2, size * 0.88);
            }

            // Show the special date
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${size * 0.028}px 'Poppins', sans-serif`;
            ctx.fillText(`Special Date: ${wishData?.date || dateStr}`, size / 2, size * 0.93);
            
            // Add watermark
            ctx.save();
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = `${size * 0.02}px 'Poppins', sans-serif`;
            ctx.textAlign = 'right';
            ctx.fillText('Created with RamanujanWishes.com', size - 20, size - 15);
            ctx.restore();
            ctx.restore();

            // Floating Emoji Particles
            ctx.save();
            const seed = (wishData?.recipientName?.length || 5) + (wishData?.date?.length || 10);
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
                const emojis = (wishData?.occasion === 'birthday') ? ['🎂', '🎈', '✨', '🎁'] :
                    (wishData?.occasion === 'anniversary') ? ['❤️', '💕', '🌹', '✨'] :
                        (wishData?.occasion === 'wedding') ? ['💍', '🥂', '🌸', '✨'] :
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
        </div>
    );
};

export default MagicSquareAnimation;

