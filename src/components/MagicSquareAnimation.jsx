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

    // Total duration: 8 seconds at 60fps
    const totalFrames = 480;

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
        // Timeline:
        // 0.00 - 0.50: Magic Square Reveal (Rows 1-4)
        // 0.50 - 0.75: Proof (Sums)
        // 0.75 - 1.00: Image + Message

        // Clear & Background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);

        // --- STAGE 1: MAGIC SQUARE REVEAL (0.0 - 0.5) ---
        if (progress < 0.8) { // Keep visible until fade out
            const squareP = Math.min(1, progress / 0.5);
            drawGrid(ctx, 1 - Math.max(0, (progress - 0.7) * 10)); // Fade grid out at end

            // Determine active row for "Sliding Focus"
            const rowPhaseDuration = 0.25;

            square.forEach((row, ri) => {
                const rowStart = ri * rowPhaseDuration;
                const rowEnd = rowStart + rowPhaseDuration;

                // Row Status
                const isCurrentRow = squareP >= rowStart && squareP < rowEnd;
                const isCompletedRow = squareP >= rowEnd;

                // Opacity / Visibility
                let rowOpacity = 0;
                if (isCompletedRow) rowOpacity = 0.6; // Dimmed when done
                if (isCurrentRow) rowOpacity = 1;     // Bright when active
                if (ri === 0) rowOpacity = 1;         // First row (Date) always bright

                // Highlight Effect
                const isHighlight = isCurrentRow || (ri === 0 && squareP < 0.25);

                // Fade out entire square at the end of animation
                if (progress > 0.7) {
                    rowOpacity *= (1 - (progress - 0.7) * 3.3);
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
                        const cellDelay = rowStart + (ci * 0.05); // Stagger within row
                        let cellP = (squareP - cellDelay) / 0.05;
                        cellP = Math.min(1, Math.max(0, cellP));

                        if (cellP > 0) {
                            const x = startX + ci * cellSize + cellSize / 2;
                            const y = startY + ri * cellSize + cellSize / 2;

                            ctx.fillStyle = (ri === 0) ? highlightColor : '#fff';
                            // Dynamic dimming
                            if (isCompletedRow && ri !== 0) ctx.fillStyle = 'rgba(255,255,255,0.6)';
                            if (isCompletedRow && ri === 0) ctx.fillStyle = highlightColor; // Keep date colored

                            // Fade out
                            ctx.globalAlpha = rowOpacity * cellP;

                            ctx.font = (ri === 0)
                                ? `bold ${cellSize * 0.4}px 'Poppins', sans-serif`
                                : `${cellSize * 0.35}px 'Poppins', sans-serif`;

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
                        ctx.restore();
                    }
                }
            });
        }

        // --- STAGE 2: PROOF LINES (0.50 - 0.75) ---
        if (progress > 0.5 && progress < 0.8) {
            const proofP = (progress - 0.5) / 0.25; // 0 to 1
            ctx.save();
            ctx.globalAlpha = 1 - Math.max(0, (progress - 0.75) * 4); // Fade out
            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 2;

            // Draw all lines quickly
            // vertical lines
            for (let i = 0; i < 4; i++) {
                if (proofP > 0.2) {
                    const x = startX + i * cellSize + cellSize / 2;
                    ctx.beginPath();
                    ctx.moveTo(x, startY);
                    ctx.lineTo(x, startY + gridSize);
                    ctx.stroke();
                    if (proofP > 0.3) ctx.fillText(`= ${magicConstant}`, x, startY + gridSize + 30);
                }
            }
            // Diagonals
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

        // --- STAGE 3: IMAGE & MESSAGE (0.75 - 1.0) ---
        if (progress > 0.70) {
            const finalP = (progress - 0.70) / 0.30; // 0 to 1

            if (imgRef.current && imgRef.current.complete) {
                ctx.save();
                ctx.globalAlpha = finalP;
                // Draw Image
                ctx.drawImage(imgRef.current, 0, 0, size, size);

                // Gradient Overlay
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

            // Text
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';

            // Title
            ctx.font = `bold ${size * 0.09}px 'Dancing Script', cursive`;
            ctx.fillText(`Happy ${wishData.occasion.charAt(0).toUpperCase() + wishData.occasion.slice(1)}!`, size / 2, size * 0.55);

            // Message
            ctx.font = `italic ${size * 0.04}px 'Playfair Display', serif`;
            const lines = wishData.message.split('\n');
            lines.forEach((line, i) => {
                ctx.fillText(line, size / 2, size * 0.65 + i * 50);
            });

            // Name
            ctx.fillStyle = highlightColor;
            ctx.font = `bold ${size * 0.03}px 'Poppins', sans-serif`;
            ctx.fillText(`For ${wishData.recipientName}`, size / 2, size * 0.85);

            ctx.restore();

            // --- PREMIUM ADDITION: Floating Emoji Particles ---
            ctx.save();
            const seed = wishData.recipientName.length + wishData.date.length;
            const particleCount = 15;
            for (let i = 0; i < particleCount; i++) {
                const pSeed = seed + i;
                const xBase = ((Math.sin(pSeed * 1.5) + 1) / 2) * size;
                const yBase = ((Math.cos(pSeed * 2.1) + 1) / 2) * size;

                // Slow floating movement
                const offsetX = Math.sin(progress * 4 + pSeed) * 50;
                const offsetY = -(progress - 0.7) * 200 + Math.cos(progress * 3 + pSeed) * 30;

                const x = xBase + offsetX;
                const y = yBase + offsetY;
                const opacity = Math.min(0.6, finalP * 0.8) * Math.max(0, 1 - (progress - 0.7) * 1.2);

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

            // --- PREMIUM ADDITION: Magical Glitter/Dust ---
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

    }, [square, magicConstant, startX, startY, cellSize, gridSize, drawGrid, highlightColor, bgColor, wishData]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let frame = 0;
        let animationId;

        const animate = () => {
            renderFrame(ctx, frame, totalFrames);
            if (frame < totalFrames) {
                frame++;
            }
            animationId = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(animationId);
    }, [renderFrame, totalFrames]);

    const [gifBlob, setGifBlob] = useState(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    const handleGenerateGif = async () => {
        setIsGenerating(true);
        try {
            const blob = await createAnimatedGif(renderFrame, size, size, totalFrames, 50);
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
                <div className="canvas-wrapper cinematic-border">
                    <canvas ref={canvasRef} width={size} height={size} />
                </div>
                <div className="animation-actions text-center mt-lg">
                    {!isFinished ? (
                        <div className="action-row">
                            <button className="btn btn-secondary btn-large mr-md" onClick={onBack}>
                                Back
                            </button>
                            <button className="btn btn-primary btn-large glow-on-hover" onClick={handleGenerateGif} disabled={isGenerating}>
                                {isGenerating ? 'Weaving Magic Memory... (Please Wait)' : 'Save as Heartful Gift 🎁'}
                            </button>
                        </div>
                    ) : (
                        <div className="gif-result fade-in">
                            <h2 className="text-gradient mb-md">A Memory to Keep Forever</h2>
                            <div className="gif-preview-box">
                                <img src={gifUrl} alt="Magic Gift" className="gif-preview shadow-xl" />
                            </div>

                            {/* Main Actions */}
                            <div className="mt-lg action-buttons">
                                <a href={gifUrl} download={`magic_wish_${wishData.recipientName}.gif`} className="btn btn-primary btn-large">
                                    Download 📥
                                </a>
                                <button className="btn btn-secondary btn-large" onClick={onCreateAnother}>
                                    Create New ✨
                                </button>
                            </div>

                            {/* Share Section */}
                            <div className="share-section mt-lg">
                                <p className="share-label">Share your magical creation:</p>

                                {/* Copy Link - Main Share Option */}
                                <div className="share-link-box">
                                    <a
                                        href={shareableLink || window.location.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="share-link-display"
                                        title="Click to open in new tab"
                                    >
                                        {shareableLink || window.location.href}
                                    </a>
                                </div>
                                <div className="share-link-actions">
                                    <button
                                        className="share-link-btn"
                                        onClick={handleCopyLink}
                                    >
                                        {linkCopied ? '✓ Copied!' : '📋 Copy Link'}
                                    </button>
                                    <a
                                        href={shareableLink || window.location.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="share-link-btn share-open-btn"
                                    >
                                        🔗 Open Link
                                    </a>
                                </div>
                                {linkCopied && <p className="copy-success">Link copied! Share it with anyone! 🎉</p>}

                                <p className="share-or">or share directly:</p>

                                <div className="share-buttons">
                                    {/* Native Share (shows on mobile) */}
                                    {navigator.share && (
                                        <button className="share-btn share-native" onClick={handleNativeShare} title="Share">
                                            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
                                            </svg>
                                            Share
                                        </button>
                                    )}

                                    {/* WhatsApp */}
                                    <button className="share-btn share-whatsapp" onClick={handleWhatsAppShare} title="Share on WhatsApp">
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                    </button>

                                    {/* Twitter/X */}
                                    <button className="share-btn share-twitter" onClick={handleTwitterShare} title="Share on X/Twitter">
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                    </button>

                                    {/* Facebook */}
                                    <button className="share-btn share-facebook" onClick={handleFacebookShare} title="Share on Facebook">
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MagicSquareAnimation;

