import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MagicSquareAnimation.css';
import { parseDateComponents, generateDateEchoSquare } from '../utils/magicSquare';
import { createAnimatedGif, downloadBlob } from '../utils/gifGenerator';
import { LoadingSpinner } from './LoadingComponents';

const DigitalGreetingAnimation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const wishData = location.state?.wishData;
    const canvasRef = useRef(null);
    const [gifUrl, setGifUrl] = useState(null);
    const [gifBlob, setGifBlob] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [templateImage, setTemplateImage] = useState(null);
    const [shareableLink, setShareableLink] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    // Redirect if no wish data
    useEffect(() => {
        if (!wishData) {
            navigate('/create');
        }
    }, [wishData, navigate]);

    // Enhanced template loading with usage tracking
    useEffect(() => {
        if (wishData?.occasion) {
            // Try multiple template sources
            const templateSources = [
                `/images/festivals/${wishData.occasion}.png`,
                `/images/festivals/birthday.png`, // fallback
                `/images/festivals/celebration.png` // ultimate fallback
            ];

            const loadTemplate = (index = 0) => {
                if (index >= templateSources.length) return;

                const img = new Image();
                img.onload = () => setTemplateImage(img);
                img.onerror = () => loadTemplate(index + 1);
                img.src = templateSources[index];
            };

            loadTemplate();
        }
    }, [wishData?.occasion]);

    if (!wishData) return null;

    // Parse date and generate magic square
    const { DD, MM, CC, YY } = parseDateComponents(wishData.date);
    const { square, magicConstant } = generateDateEchoSquare(DD, MM, CC, YY);

    const size = 800;
    const padding = 80;
    const gridSize = size - padding * 2;
    const cellSize = gridSize / 4;
    const startX = padding;
    const startY = padding;

    // Color palette - muted colors for white theme
    const colors = {
        primary: wishData.colorHighlight || '#4a5568',
        row1: '#e53e3e',
        row2: '#38a169',
        row3: '#805ad5',
        row4: '#d69e2e',
        col1: '#dd6b20',
        col2: '#319795',
        col3: '#e53e3e',
        col4: '#3182ce'
    };

    const renderFrame = useCallback((ctx, frame, totalFrames) => {
        const progress = frame / totalFrames;

        // Clear canvas with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        // Helper functions
        const drawText = (text, x, y, font, color, alpha = 1, shadow = false) => {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = color;
            ctx.font = font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (shadow) {
                ctx.shadowColor = color;
                ctx.shadowBlur = 15;
            }
            ctx.fillText(text, x, y);
            ctx.restore();
        };

        const drawCell = (row, col, alpha, color = '#000', highlight = false) => {
            const x = startX + col * cellSize + cellSize / 2;
            const y = startY + row * cellSize + cellSize / 2;
            const value = square[row][col];

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = color;
            ctx.font = highlight ? `bold ${cellSize * 0.4}px 'Poppins'` : `${cellSize * 0.35}px 'Poppins'`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (highlight) {
                ctx.shadowColor = color;
                ctx.shadowBlur = 12;
            }

            ctx.fillText(value.toString().padStart(2, '0'), x, y);
            ctx.restore();
        };

        const drawGrid = (alpha) => {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.lineWidth = 1;

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
            ctx.restore();
        };

        const drawHighlight = (type, index, color, alpha) => {
            ctx.save();
            ctx.globalAlpha = alpha * 0.2;
            ctx.fillStyle = color;

            if (type === 'row') {
                ctx.fillRect(startX, startY + index * cellSize, gridSize, cellSize);
            } else if (type === 'col') {
                ctx.fillRect(startX + index * cellSize, startY, cellSize, gridSize);
            } else if (type === 'block') {
                const blockX = startX + (index % 2) * (gridSize / 2);
                const blockY = startY + Math.floor(index / 2) * (gridSize / 2);
                ctx.fillRect(blockX, blockY, gridSize / 2, gridSize / 2);
            }
            ctx.restore();
        };

        // Enhanced date reveal positions
        const dateReveals = [
            { type: 'row', index: 0, label: 'Row 1', color: colors.row1 },
            { type: 'col', index: 0, label: 'Column 1', color: colors.col1 },
            { type: 'row', index: 3, label: 'Row 4', color: colors.row4 },
            { type: 'col', index: 3, label: 'Column 4', color: colors.col4 }
        ];

        // Check if date components appear in specific positions
        const dateComponents = [DD, MM, CC, YY];
        const isDatePosition = (row, col) => {
            // First row
            if (row === 0) return true;
            // First column  
            if (col === 0) return true;
            // Last row (reversed)
            if (row === 3) return true;
            // Last column (reversed)
            if (col === 3) return true;
            // Main diagonal
            if (row === col) return true;
            return false;
        };

        // Screen timing (8 screens total, ~8 seconds for better pacing)
        const screenDuration = 1 / 8;
        const currentScreen = Math.floor(progress / screenDuration);
        const screenProgress = (progress % screenDuration) / screenDuration;

        switch (currentScreen) {
            case 0: // Screen 1: Intro text
                const fadeIn = Math.min(1, screenProgress * 3);
                drawText(
                    `Hi ${wishData.recipientName}`,
                    size / 2, size / 2 - 40,
                    `bold ${size * 0.06}px 'Poppins'`,
                    '#333',
                    fadeIn
                );
                drawText(
                    'Watch the pattern',
                    size / 2, size / 2 + 20,
                    `${size * 0.04}px 'Poppins'`,
                    '#666',
                    fadeIn * 0.8
                );
                break;

            case 1: // Screen 2: Full magic square
                drawGrid(1);
                for (let r = 0; r < 4; r++) {
                    for (let c = 0; c < 4; c++) {
                        const cellDelay = (r * 4 + c) * 0.05;
                        const cellAlpha = Math.max(0, Math.min(1, (screenProgress - cellDelay) * 8));
                        drawCell(r, c, cellAlpha);
                    }
                }
                break;

            case 2: // Screen 3: Highlight first date reveal
                drawGrid(1);
                const reveal1 = dateReveals[0]; // First row
                drawHighlight(reveal1.type, reveal1.index, reveal1.color, Math.sin(screenProgress * Math.PI * 4) * 0.5 + 0.5);

                for (let r = 0; r < 4; r++) {
                    for (let c = 0; c < 4; c++) {
                        const isHighlighted = r === reveal1.index;
                        const isDateCell = isDatePosition(r, c);
                        drawCell(r, c, 1, isHighlighted ? reveal1.color : '#000', isHighlighted);
                    }
                }

                // Show sum and label
                if (screenProgress > 0.3) {
                    drawText(
                        reveal1.label,
                        size / 2, startY - 50,
                        `bold ${cellSize * 0.2}px 'Poppins'`,
                        reveal1.color,
                        (screenProgress - 0.3) * 1.5
                    );
                }

                if (screenProgress > 0.5) {
                    drawText(
                        `= ${magicConstant}`,
                        startX + gridSize + 60, startY + reveal1.index * cellSize + cellSize / 2,
                        `bold ${cellSize * 0.25}px 'Poppins'`,
                        reveal1.color,
                        (screenProgress - 0.5) * 2
                    );
                }
                break;

            case 3: // Screen 4: Highlight second date reveal
                drawGrid(1);
                const reveal2 = dateReveals[1]; // First column
                drawHighlight(reveal2.type, reveal2.index, reveal2.color, Math.sin(screenProgress * Math.PI * 4) * 0.5 + 0.5);

                for (let r = 0; r < 4; r++) {
                    for (let c = 0; c < 4; c++) {
                        const isHighlighted = c === reveal2.index;
                        const isDateCell = isDatePosition(r, c);
                        drawCell(r, c, 1, isHighlighted ? reveal2.color : '#000', isHighlighted);
                    }
                }

                // Show sum and label
                if (screenProgress > 0.3) {
                    drawText(
                        reveal2.label,
                        size / 2, startY - 50,
                        `bold ${cellSize * 0.2}px 'Poppins'`,
                        reveal2.color,
                        (screenProgress - 0.3) * 1.5
                    );
                }

                if (screenProgress > 0.5) {
                    drawText(
                        `= ${magicConstant}`,
                        startX + reveal2.index * cellSize + cellSize / 2, startY + gridSize + 40,
                        `bold ${cellSize * 0.25}px 'Poppins'`,
                        reveal2.color,
                        (screenProgress - 0.5) * 2
                    );
                }
                break;

            case 4: // Screen 5: 2x2 blocks
                drawGrid(1);
                const blockColors = [colors.row1, colors.row2, colors.row3, colors.row4];

                for (let block = 0; block < 4; block++) {
                    const blockDelay = block * 0.2;
                    const blockAlpha = Math.max(0, Math.min(1, (screenProgress - blockDelay) * 5));
                    drawHighlight('block', block, blockColors[block], blockAlpha);
                }

                for (let r = 0; r < 4; r++) {
                    for (let c = 0; c < 4; c++) {
                        const blockIndex = Math.floor(r / 2) * 2 + Math.floor(c / 2);
                        drawCell(r, c, 1, blockColors[blockIndex], true);
                    }
                }
                break;

            case 5: // Screen 6: Color each row
                drawGrid(1);
                const rowColors = [colors.row1, colors.row2, colors.row3, colors.row4];

                for (let r = 0; r < 4; r++) {
                    const rowDelay = r * 0.25;
                    const rowAlpha = Math.max(0, Math.min(1, (screenProgress - rowDelay) * 4));

                    if (rowAlpha > 0) {
                        drawHighlight('row', r, rowColors[r], rowAlpha);

                        for (let c = 0; c < 4; c++) {
                            drawCell(r, c, rowAlpha, rowColors[r], true);
                        }
                    }
                }
                break;

            case 6: // Screen 7: Flash rows sequentially
                drawGrid(1);
                const flashRowColors = [colors.row1, colors.row2, colors.row3, colors.row4];
                const flashRow = Math.floor(screenProgress * 4) % 4;
                const flashIntensity = Math.sin(screenProgress * Math.PI * 8) * 0.5 + 0.5;

                for (let r = 0; r < 4; r++) {
                    const isFlashing = r === flashRow;
                    const alpha = isFlashing ? flashIntensity : 0.3;

                    if (alpha > 0) {
                        drawHighlight('row', r, flashRowColors[r], alpha);

                        for (let c = 0; c < 4; c++) {
                            drawCell(r, c, alpha, flashRowColors[r], isFlashing);
                        }
                    }
                }
                break;

            case 7: // Screen 8: Final message with template
            default:
                // Background with light overlay
                if (templateImage) {
                    ctx.save();
                    ctx.globalAlpha = Math.min(1, screenProgress * 2);
                    ctx.drawImage(templateImage, 0, 0, size, size);

                    // Light overlay for text readability
                    const gradient = ctx.createLinearGradient(0, size * 0.3, 0, size);
                    gradient.addColorStop(0, 'rgba(255,255,255,0)');
                    gradient.addColorStop(0.6, 'rgba(255,255,255,0.8)');
                    gradient.addColorStop(1, 'rgba(255,255,255,0.9)');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, size, size);
                    ctx.restore();
                }

                const textAlpha = Math.max(0, screenProgress - 0.3);

                // Main message
                drawText(
                    wishData.message || 'Special wishes for you',
                    size / 2, size * 0.5,
                    `bold ${size * 0.05}px 'Poppins'`,
                    '#333',
                    textAlpha
                );

                // Sender signature
                if (wishData.senderName) {
                    drawText(
                        `From ${wishData.senderName}`,
                        size / 2, size * 0.7,
                        `${size * 0.03}px 'Poppins'`,
                        '#666',
                        textAlpha * 0.8
                    );
                }
                break;
        }

    }, [square, magicConstant, wishData, templateImage, colors, size, startX, startY, cellSize, gridSize]);

    // Animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let frame = 0;
        const totalFrames = 600; // 10 seconds at 60fps for better pacing
        let animationId;

        const animate = () => {
            renderFrame(ctx, frame, totalFrames);
            frame = (frame + 1) % totalFrames;
            animationId = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(animationId);
    }, [renderFrame]);

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

    const handleGenerateGif = async () => {
        setIsGenerating(true);
        try {
            const gifFrames = 150; // Increased for better pacing
            const frameDelay = 100; // 100ms = 10fps for clear readability

            const blob = await createAnimatedGif(renderFrame, size, size, gifFrames, frameDelay);

            if (blob && blob.size > 0) {
                setGifBlob(blob);
                const url = URL.createObjectURL(blob);
                setGifUrl(url);

                // Auto-download the GIF
                const filename = `digital_greeting_${wishData?.recipientName || 'special'}_${Date.now()}.gif`;
                const success = downloadBlob(blob, filename);

                if (!success) {
                    // Fallback: open in new tab
                    const newWindow = window.open(url, '_blank');
                    if (!newWindow) {
                        alert('GIF generated! Please allow popups to download, or use the download button below.');
                    }
                }
            } else {
                throw new Error('Generated GIF is empty or invalid');
            }
        } catch (error) {
            console.error('GIF generation error:', error);
            alert(`Could not generate GIF: ${error.message || 'Unknown error'}. Please try again.`);
        }
        setIsGenerating(false);
    };

    const handleDownload = () => {
        if (gifBlob) {
            try {
                const filename = `digital_greeting_${wishData?.recipientName || 'special'}_${Date.now()}.gif`;
                const success = downloadBlob(gifBlob, filename);

                if (!success) {
                    // Fallback: open in new tab
                    if (gifUrl) {
                        const newWindow = window.open(gifUrl, '_blank');
                        if (newWindow) {
                            alert('GIF opened in new tab. Right-click and select "Save As..." to download.');
                        } else {
                            alert('Download failed and popup blocked. Please allow popups and try again.');
                        }
                    }
                }
            } catch (e) {
                console.error('Download error:', e);
                if (gifUrl) {
                    window.open(gifUrl, '_blank');
                }
            }
        } else {
            alert('Please generate the GIF first by clicking "Generate GIF".');
        }
    };

    // Copy shareable link
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareableLink || window.location.href);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (e) {
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

    // WhatsApp Share
    const handleWhatsAppShare = () => {
        const link = shareableLink || window.location.href;
        const text = encodeURIComponent(
            `🎁 To: ${wishData.recipientName}${wishData.senderName ? ` By: ${wishData.senderName}` : ''} | Magical ${wishData.occasion} ✨\n\n` +
            `Click: ${link}`
        );
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    // Twitter/X Share
    const handleTwitterShare = () => {
        const link = shareableLink || window.location.href;
        const text = encodeURIComponent(
            `🎁 To: ${wishData.recipientName}${wishData.senderName ? ` By: ${wishData.senderName}` : ''} | Magical ${wishData.occasion} ✨`
        );
        const url = encodeURIComponent(link);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    };

    // Facebook Share
    const handleFacebookShare = () => {
        const link = shareableLink || window.location.href;
        const url = encodeURIComponent(link);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    };

    // Native Share
    const handleNativeShare = async () => {
        if (navigator.share && gifBlob) {
            try {
                const file = new File([gifBlob], `digital_greeting_${wishData.recipientName}.gif`, { type: 'image/gif' });
                await navigator.share({
                    title: `Magic Wish for ${wishData.recipientName}`,
                    text: `A special ${wishData.occasion} wish created with WishyFi! ✨`,
                    files: [file]
                });
            } catch (err) {
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

    // Copy GIF to Clipboard
    const handleCopyGif = async () => {
        if (gifBlob) {
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/gif': gifBlob })
                ]);
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            } catch (err) {
                try {
                    await navigator.clipboard.writeText(
                        `🎁 Magic Wish for ${wishData.recipientName}!\n` +
                        `Created with WishyFi ✨\n` +
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

    const handleBack = () => {
        navigate('/create', { state: { wishData } });
    };

    return (
        <div className="animation-page page">
            <div className="animation-container">
                <div className="canvas-wrapper cinematic-border">
                    <canvas ref={canvasRef} width={size} height={size} />
                </div>

                <div className="animation-actions text-center mt-lg">
                    <div className="action-row mb-lg">
                        <button className="btn btn-secondary mr-md" onClick={handleBack}>
                            ← Edit Wish
                        </button>

                        <button
                            className="btn btn-primary glow-on-hover"
                            onClick={handleGenerateGif}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <div className="generating-content">
                                    <LoadingSpinner size="sm" />
                                    <span>Creating GIF...</span>
                                </div>
                            ) : 'Generate GIF 🎁'}
                        </button>
                    </div>

                    {gifUrl && (
                        <div className="gif-result fade-in mb-lg">
                            <div className="gif-preview-box mb-md">
                                <img src={gifUrl} alt="Digital Greeting" className="gif-preview" />
                            </div>

                            {/* Primary Download Button */}
                            <button onClick={handleDownload} className="btn btn-primary btn-large mb-lg">
                                📥 Download GIF
                            </button>

                            {/* Share Section */}
                            <div className="share-section">
                                <h3 className="share-label mb-md">✨ Share Your Magic Wish</h3>

                                {/* Shareable Link Display */}
                                <div className="share-link-container mb-md">
                                    <div className="share-link-display">
                                        {shareableLink}
                                    </div>
                                </div>

                                {/* Share Actions */}
                                <div className="share-link-actions">
                                    <button
                                        className="share-link-btn"
                                        onClick={handleCopyLink}
                                        title="Copy shareable link"
                                    >
                                        {linkCopied ? '✓ Copied!' : '🔗 Copy Link'}
                                    </button>

                                    <button
                                        className="share-link-btn share-whatsapp-btn"
                                        onClick={handleWhatsAppShare}
                                        title="Share on WhatsApp"
                                    >
                                        📱 WhatsApp
                                    </button>

                                    <button
                                        className="share-link-btn"
                                        onClick={handleTwitterShare}
                                        title="Share on X (Twitter)"
                                    >
                                        🐦 X / Twitter
                                    </button>

                                    <button
                                        className="share-link-btn"
                                        onClick={handleFacebookShare}
                                        title="Share on Facebook"
                                    >
                                        📘 Facebook
                                    </button>

                                    {navigator.share && (
                                        <button
                                            className="share-link-btn"
                                            onClick={handleNativeShare}
                                            title="Share via device options"
                                        >
                                            📤 More Apps
                                        </button>
                                    )}

                                    <button
                                        className="share-link-btn"
                                        onClick={handleCopyGif}
                                        title="Copy GIF to clipboard"
                                    >
                                        {copySuccess ? '✓ GIF Copied!' : '📋 Copy GIF'}
                                    </button>
                                </div>

                                {/* Success Messages */}
                                {(linkCopied || copySuccess) && (
                                    <div className="copy-success mt-sm">
                                        {linkCopied && '✓ Link copied to clipboard!'}
                                        {copySuccess && !linkCopied && '✓ GIF copied! You can paste it in messages.'}
                                    </div>
                                )}

                                {/* Helper Text */}
                                <p className="helper-text mt-md text-center">
                                    💡 Share the link for instant viewing, or download the GIF to share anywhere!
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DigitalGreetingAnimation;