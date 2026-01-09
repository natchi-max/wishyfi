import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MagicSquareAnimation.css';
import { parseDateComponents, generateDateEchoSquare } from '../utils/magicSquare';
import { createAnimatedGif, downloadBlob } from '../utils/gifGenerator';
import { shareGifFile, downloadGifWithInstructions, showSharingInstructions, getShareSupport } from '../utils/shareUtils';
import { LoadingSpinner, ProgressBar } from './LoadingComponents';
import TinyColor from 'tinycolor2';

// Helper to format numbers as two digits (e.g., 7 -> "07", 1 -> "01")
const formatTwoDigit = (num) => {
    const n = Math.abs(num);
    return n < 10 ? `0${n}` : `${n}`;
};

const MagicSquareAnimation = ({ wishData: propWishData }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const wishData = propWishData || location.state?.wishData;
    const isSharedView = location.pathname.startsWith('/share/');

    const canvasRef = useRef(null);
    const [gifUrl, setGifUrl] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [bgImage, setBgImage] = useState(null);
    const [showGift, setShowGift] = useState(isSharedView); // Show gift reveal only for recipients
    const [isOpening, setIsOpening] = useState(false);
    const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
    const [shareableLink, setShareableLink] = useState('');
    const confettiRef = useRef([]); // To store confetti particles
    const auraRef = useRef([]); // To store aura particles
    const crackersRef = useRef([]); // To store firework/crackers particles during square reveal

    // GIF & sharing state
    const [gifBlob, setGifBlob] = useState(null);
    const [gifProgress, setGifProgress] = useState(0);
    const [linkCopied, setLinkCopied] = useState(false);
    const [shareSupport, setShareSupport] = useState(null);
    const [isSharing, setIsSharing] = useState(false);

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

    // Check share support on mount
    useEffect(() => {
        setShareSupport(getShareSupport());
    }, []);

    // Utility to encode wish data (Safe for UTF-8)
    function encodeWishData(data) {
        const json = JSON.stringify(data);
        const encoded = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode('0x' + p1);
        }));
        return encoded;
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
        const isLt = TinyColor(bgColor).isLight();
        ctx.strokeStyle = isLt
            ? `rgba(0, 0, 0, ${0.1 * opacity})`
            : `rgba(255, 255, 255, ${0.15 * opacity})`;

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
    }, [cellSize, gridSize, startX, startY, bgColor]);

    const renderFrame = useCallback((ctx, frame, total) => {
        const progress = frame / total;

        // ════════════════════════════════════════════════════════════
        // CINEMATIC 7-SCREEN FLOW (EXACT SPECIFICATION)
        // ════════════════════════════════════════════════════════════
        // Screen 1 (0.00 - 0.14): Introduction - "Hi [Name], Watch closely"
        // Screen 2 (0.14 - 0.26): Date Foundation - First row glows, then full grid
        // Screen 3 (0.26 - 0.42): Mathematical Miracle - Strong 'XX' diagonal glow
        // Screen 4 (0.42 - 0.56): Secret Recipe - Grouping by DD, MM, CC, YY components
        // Screen 5 (0.56 - 0.70): Perfect Harmony - Row/Column balance
        // Screen 6 (0.70 - 0.82): Elegant Pulse - Final rhythmic glow
        // Screen 7 (0.82 - 1.00): Heartfelt Greeting - Final message & background

        // Clear & Background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);

        const isLtTheme = TinyColor(bgColor).isLight();
        const baseTextColor = isLtTheme ? '#1e293b' : '#fff';

        // ═══════════════════ HELPER FUNCTIONS ═══════════════════

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
                ? `bold ${cellSize * 0.45}px 'Poppins', sans-serif`
                : `${cellSize * 0.40}px 'Poppins', sans-serif`;

            if (color && bold) {
                ctx.shadowColor = color;
                ctx.shadowBlur = 15;
            }

            ctx.fillText(formatTwoDigit(val), x, y);
            ctx.restore();
        };

        const drawBlockBg = (blockIndex, opacity, color) => {
            ctx.save();
            ctx.globalAlpha = opacity * 0.3;
            ctx.fillStyle = color;
            const blockRow = Math.floor(blockIndex / 2);
            const blockCol = blockIndex % 2;
            ctx.fillRect(
                startX + blockCol * (gridSize / 2),
                startY + blockRow * (gridSize / 2),
                gridSize / 2,
                gridSize / 2
            );
            ctx.restore();
        };

        const drawRowBg = (ri, opacity, color = highlightColor) => {
            ctx.save();
            ctx.globalAlpha = opacity * 0.25;
            ctx.fillStyle = color;
            ctx.fillRect(startX, startY + ri * cellSize, gridSize, cellSize);
            ctx.restore();
        };

        const drawColBg = (ci, opacity, color = highlightColor) => {
            ctx.save();
            ctx.globalAlpha = opacity * 0.25;
            ctx.fillStyle = color;
            ctx.fillRect(startX + ci * cellSize, startY, cellSize, gridSize);
            ctx.restore();
        };

        const smoothFade = (p, fadeInEnd = 0.25, fadeOutStart = 0.75) => {
            if (p < fadeInEnd) return p / fadeInEnd;
            if (p > fadeOutStart) return Math.max(0, 1 - (p - fadeOutStart) / (1 - fadeOutStart));
            return 1;
        };

        const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        // ═══════════════════ SCREEN 1: INTRODUCTION (0.00 - 0.14) ═══════════════════
        if (progress < 0.14) {
            const p = progress / 0.14;

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Hi [Name] (0-33%)
            if (p < 0.33) {
                const fade = smoothFade(p / 0.33, 0.2, 0.8);
                ctx.globalAlpha = fade;
                ctx.fillStyle = highlightColor;
                ctx.font = `bold ${size * 0.09}px 'Playfair Display', serif`;
                ctx.shadowColor = highlightColor;
                ctx.shadowBlur = 30;
                ctx.fillText(`Hi ${wishData?.recipientName || 'there'}`, size / 2, size / 2 - 20);
            }
            // This is not random (33-66%)
            else if (p < 0.66) {
                const fade = smoothFade((p - 0.33) / 0.33, 0.2, 0.75);
                ctx.globalAlpha = fade;
                ctx.fillStyle = highlightColor;
                ctx.font = `bold ${size * 0.06}px 'Poppins', sans-serif`;
                ctx.shadowColor = highlightColor;
                ctx.shadowBlur = 20;
                ctx.fillText('This is not random', size / 2, size / 2);
            }
            // Watch closely (66-100%)
            else {
                const fade = smoothFade((p - 0.66) / 0.34, 0.2, 0.75);
                ctx.globalAlpha = fade;
                ctx.fillStyle = highlightColor;
                ctx.font = `bold ${size * 0.06}px 'Poppins', sans-serif`;
                ctx.shadowColor = highlightColor;
                ctx.shadowBlur = 20;
                ctx.fillText('Watch closely', size / 2, size / 2);
            }

            // Add wishyfi.com at bottom
            const currentFade = p < 0.33
                ? smoothFade(p / 0.33, 0.2, 0.8)
                : p < 0.66
                    ? smoothFade((p - 0.33) / 0.33, 0.2, 0.75)
                    : smoothFade((p - 0.66) / 0.34, 0.2, 0.75);
            ctx.globalAlpha = Math.min(currentFade, 0.7);
            ctx.fillStyle = 'rgba(102, 126, 234, 0.6)';
            ctx.font = `${size * 0.025}px 'Inter', sans-serif`;
            ctx.fillText('wishyfi.com', size / 2, size - 30);

            ctx.restore();
        }

        // ═══════════════════ SCREEN 2: DATE FOUNDATION (0.14 - 0.26) ═══════════════════
        else if (progress >= 0.14 && progress < 0.26) {
            const p = (progress - 0.14) / 0.12;
            const fade = smoothFade(p, 0.2, 0.85);

            drawGrid(ctx, fade);

            // Highlight Screen: First Row (The Date) stays glowing
            for (let ri = 0; ri < 4; ri++) {
                for (let ci = 0; ci < 4; ci++) {
                    const cellIndex = ri * 4 + ci;
                    const delay = ri === 0 ? 0 : 0.1 + (cellIndex * 0.03);
                    const cellFade = Math.max(0, Math.min(1, (p - delay) / 0.15));

                    // All cells appear the same - no special highlighting
                    drawCell(ri, ci, cellFade * fade, null, false);
                }
            }

            // Title - The Foundation
            if (p > 0.3) {
                ctx.save();
                ctx.globalAlpha = ((p - 0.3) / 0.7) * fade;
                ctx.fillStyle = highlightColor;
                ctx.textAlign = 'center';
                ctx.font = `bold ${cellSize * 0.25}px 'Poppins', sans-serif`;
                ctx.shadowColor = highlightColor;
                ctx.shadowBlur = 15;
                ctx.fillText(`Your magic square`, startX + gridSize / 2, startY - 35);
                ctx.restore();
            }

            // Magic Constant Sum display
            if (p > 0.6) {
                ctx.save();
                ctx.globalAlpha = ((p - 0.6) / 0.4) * fade;
                ctx.fillStyle = '#10b981';
                ctx.textAlign = 'center';
                ctx.font = `bold ${cellSize * 0.28}px 'Poppins', sans-serif`;
                ctx.shadowColor = '#10b981';
                ctx.shadowBlur = 12;
                ctx.fillText(`Magic Sum: ${magicConstant}`, startX + gridSize / 2, startY + gridSize + 50);

                // Add wishyfi.com
                ctx.globalAlpha = ((p - 0.6) / 0.4) * fade * 0.7;
                ctx.fillStyle = 'rgba(102, 126, 234, 0.6)';
                ctx.font = `${size * 0.025}px 'Inter', sans-serif`;
                ctx.fillText('wishyfi.com', startX + gridSize / 2, size - 30);
                ctx.restore();
            }
        }

        // ═══════════════════ SCREEN 3: X DIAGONAL 'XX' CONCEPT (0.26 - 0.42) ═══════════════════
        else if (progress >= 0.26 && progress < 0.42) {
            const p = (progress - 0.26) / 0.16;
            const fade = smoothFade(p, 0.1, 0.9);

            drawGrid(ctx, 1);



            // Define diagonal cells for logic
            const mainDiag = [[0, 0], [1, 1], [2, 2], [3, 3]];
            const antiDiag = [[0, 3], [1, 2], [2, 1], [3, 0]];
            const allDiagCells = new Set([...mainDiag.map(c => `${c[0]},${c[1]}`), ...antiDiag.map(c => `${c[0]},${c[1]}`)]);

            // Draw cells with colored backgrounds for diagonals
            for (let ri = 0; ri < 4; ri++) {
                for (let ci = 0; ci < 4; ci++) {
                    const isOnDiag = allDiagCells.has(`${ri},${ci}`);
                    const isMainDiag = ri === ci;
                    const isAntiDiag = ri + ci === 3;

                    let cellColor = null;
                    let bgColor = null;

                    if (isMainDiag && isAntiDiag) {
                        cellColor = '#ffe66d';
                        bgColor = '#ffe66d';
                    } else if (isMainDiag) {
                        cellColor = '#ff6b6b';
                        bgColor = '#ff6b6b';
                    } else if (isAntiDiag) {
                        cellColor = '#4ecdc4';
                        bgColor = '#4ecdc4';
                    }

                    // Draw background color for diagonal cells
                    if (bgColor && isOnDiag) {
                        const cellDelay = (ri + ci) * 0.05;
                        const cellFade = Math.max(0, Math.min(1, (p - cellDelay) / 0.3));

                        if (cellFade > 0) {
                            ctx.save();
                            ctx.globalAlpha = cellFade * fade * 0.4;
                            ctx.fillStyle = bgColor;
                            ctx.fillRect(startX + ci * cellSize, startY + ri * cellSize, cellSize, cellSize);
                            ctx.restore();
                        }
                    }

                    const cellAlpha = isOnDiag ? fade : 0.25 * fade;
                    drawCell(ri, ci, cellAlpha, cellColor, isOnDiag);
                }
            }

            // Artistic Title (No technical text)
            ctx.save();
            ctx.globalAlpha = fade;
            ctx.textAlign = 'center';
            ctx.font = `bold ${cellSize * 0.28}px 'Poppins', sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 10;
            ctx.fillText(`Both diagonals sum to ${magicConstant}`, startX + gridSize / 2, startY - 35);

            // Add wishyfi.com
            ctx.globalAlpha = fade * 0.7;
            ctx.fillStyle = 'rgba(102, 126, 234, 0.8)';
            ctx.font = `${size * 0.025}px 'Inter', sans-serif`;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 5;
            ctx.fillText('wishyfi.com', startX + gridSize / 2, size - 30);
            ctx.restore();
        }

        // ═══════════════════ SCREEN 4: SECRET RECIPE (0.42 - 0.56) ═══════════════════
        else if (progress >= 0.42 && progress < 0.56) {
            const p = (progress - 0.42) / 0.14;
            const fade = smoothFade(p, 0.2, 0.85);

            drawGrid(ctx, 1);

            // Show 2×2 quadrant blocks
            const quadrantColors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a855f7'];

            // Draw each 2×2 quadrant
            for (let qi = 0; qi < 4; qi++) {
                const qRow = Math.floor(qi / 2);
                const qCol = qi % 2;
                const quadDelay = qi * 0.2;
                const quadProgress = Math.max(0, Math.min(1, (p - quadDelay) / 0.25));

                if (quadProgress > 0) {
                    const quadFade = smoothFade(quadProgress, 0.2, 0.8);

                    // Draw background for this 2×2 quadrant
                    ctx.save();
                    ctx.globalAlpha = quadFade * fade * 0.3;
                    ctx.fillStyle = quadrantColors[qi];
                    ctx.fillRect(
                        startX + qCol * (gridSize / 2),
                        startY + qRow * (gridSize / 2),
                        gridSize / 2,
                        gridSize / 2
                    );
                    ctx.restore();

                    // Draw cells in this 2×2 quadrant
                    for (let ri = qRow * 2; ri < qRow * 2 + 2; ri++) {
                        for (let ci = qCol * 2; ci < qCol * 2 + 2; ci++) {
                            drawCell(ri, ci, quadFade * fade, quadrantColors[qi], quadProgress > 0.5);
                        }
                    }
                }
            }

            // Title
            if (p > 0.3) {
                ctx.save();
                ctx.globalAlpha = Math.min(1, (p - 0.3) / 0.3) * fade;
                ctx.fillStyle = highlightColor;
                ctx.textAlign = 'center';
                ctx.font = `bold ${cellSize * 0.25}px 'Poppins', sans-serif`;
                ctx.fillText(`Each 2×2 block sums to ${magicConstant}`, startX + gridSize / 2, startY - 35);

                // Add wishyfi.com
                ctx.globalAlpha = Math.min(1, (p - 0.3) / 0.3) * fade * 0.7;
                ctx.fillStyle = 'rgba(102, 126, 234, 0.6)';
                ctx.font = `${size * 0.025}px 'Inter', sans-serif`;
                ctx.fillText('wishyfi.com', startX + gridSize / 2, size - 30);
                ctx.restore();
            }
        }

        // ═══════════════════ SCREEN 5: ROW COLORING (0.56 - 0.70) ═══════════════════
        else if (progress >= 0.56 && progress < 0.70) {
            const p = (progress - 0.56) / 0.14;
            const fade = smoothFade(p, 0.15, 0.85);

            drawGrid(ctx, 1);

            const rowColors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a855f7'];

            // Animate row by row from top to bottom
            for (let ri = 0; ri < 4; ri++) {
                const rowDelay = ri * 0.22;
                const rowP = Math.max(0, Math.min(1, (p - rowDelay) / 0.25));

                if (rowP > 0) {
                    const rowFade = easeInOut(rowP);
                    drawRowBg(ri, rowFade, rowColors[ri]);

                    for (let ci = 0; ci < 4; ci++) {
                        drawCell(ri, ci, rowFade * fade, rowColors[ri], rowP > 0.5);
                    }
                } else {
                    // Not yet animated rows appear dimmed
                    for (let ci = 0; ci < 4; ci++) {
                        drawCell(ri, ci, 0.25 * fade, null, false);
                    }
                }
            }

            // Title
            if (p > 0.2) {
                ctx.save();
                ctx.globalAlpha = Math.min(1, (p - 0.2) / 0.3) * fade;
                ctx.fillStyle = highlightColor;
                ctx.textAlign = 'center';
                ctx.font = `bold ${cellSize * 0.25}px 'Poppins', sans-serif`;
                ctx.fillText(`All rows sum to ${magicConstant}`, startX + gridSize / 2, startY - 35);

                // Add wishyfi.com
                ctx.globalAlpha = Math.min(1, (p - 0.2) / 0.3) * fade * 0.7;
                ctx.fillStyle = 'rgba(102, 126, 234, 0.6)';
                ctx.font = `${size * 0.025}px 'Inter', sans-serif`;
                ctx.fillText('wishyfi.com', startX + gridSize / 2, size - 30);
                ctx.restore();
            }
        }

        // ═══════════════════ SCREEN 6: ROW EMPHASIS - ONCE EACH (0.70 - 0.82) ═══════════════════
        else if (progress >= 0.70 && progress < 0.82) {
            const p = (progress - 0.70) / 0.12;
            const fade = smoothFade(p, 0.15, 0.85);

            drawGrid(ctx, 1);

            const rowColors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a855f7'];

            // Each row lights up once in sequence
            for (let ri = 0; ri < 4; ri++) {
                const rowStart = ri * 0.25; // Each row takes 25% of screen time
                const rowEnd = rowStart + 0.25;

                let intensity;
                if (p < rowStart) {
                    intensity = 0.3; // Not yet
                } else if (p < rowEnd) {
                    const rowP = (p - rowStart) / 0.25;
                    intensity = 0.3 + 0.7 * Math.sin(rowP * Math.PI); // Fade in and out
                } else {
                    intensity = 0.5; // After highlight, stay semi-bright
                }

                drawRowBg(ri, intensity * fade, rowColors[ri]);

                for (let ci = 0; ci < 4; ci++) {
                    drawCell(ri, ci, intensity * fade, rowColors[ri], p >= rowStart && p < rowEnd);
                }
            }

            // Title
            ctx.save();
            ctx.globalAlpha = fade;
            ctx.fillStyle = highlightColor;
            ctx.textAlign = 'center';
            ctx.font = `bold ${cellSize * 0.2}px 'Poppins', sans-serif`;
            ctx.fillText('Every Row Sums to ' + magicConstant, startX + gridSize / 2, startY - 35);

            // Add wishyfi.com
            ctx.globalAlpha = fade * 0.7;
            ctx.fillStyle = 'rgba(102, 126, 234, 0.6)';
            ctx.font = `${size * 0.025}px 'Inter', sans-serif`;
            ctx.fillText('wishyfi.com', startX + gridSize / 2, size - 30);
            ctx.restore();
        }

        // ═══════════════════ SCREEN 7: FINAL GREETING (0.82 - 1.00) ═══════════════════
        else if (progress >= 0.82) {
            const p = (progress - 0.82) / 0.18;
            const fade = Math.min(1, p / 0.2);

            // Background image with elegant gradient overlay
            if (imgRef.current && imgRef.current.complete) {
                ctx.save();
                ctx.globalAlpha = fade;
                ctx.drawImage(imgRef.current, 0, 0, size, size);

                // Darker gradient for better text readability
                const grad = ctx.createLinearGradient(0, size * 0.25, 0, size);
                grad.addColorStop(0, 'rgba(0,0,0,0)');
                grad.addColorStop(0.5, 'rgba(0,0,0,0.65)');
                grad.addColorStop(1, 'rgba(0,0,0,0.85)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, size, size);
                ctx.restore();
            }

            ctx.save();
            ctx.globalAlpha = fade;
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.7)';
            ctx.shadowBlur = 10;

            // 1. Recipient at top
            ctx.fillStyle = highlightColor;
            ctx.font = `bold ${size * 0.04}px 'Poppins', sans-serif`;
            ctx.shadowColor = highlightColor;
            ctx.shadowBlur = 15;
            ctx.fillText(`To: ${wishData?.recipientName || 'Someone Special'}`, size / 2, size * 0.25);

            // 2. Occasion greeting
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0,0,0,0.7)';
            ctx.shadowBlur = 10;
            ctx.font = `bold ${size * 0.085}px 'Dancing Script', cursive`;
            const displayOccasion = wishData?.occasion === 'other'
                ? wishData?.customOccasion || 'Celebration'
                : wishData?.occasion || 'Celebration';
            ctx.fillText(
                `Happy ${displayOccasion.charAt(0).toUpperCase() + displayOccasion.slice(1)}!`,
                size / 2,
                size * 0.38
            );

            // 3. Main message
            ctx.font = `italic ${size * 0.038}px 'Playfair Display', serif`;
            const message = wishData?.message || 'A special wish for you';
            const lines = message.split('\n');
            lines.forEach((line, i) => {
                ctx.fillText(line, size / 2, size * 0.52 + i * 38);
            });

            // 4. Date in words format
            const dateInWords = (() => {
                const dateStr = wishData?.date || '01/01/2000';
                const parts = dateStr.split('/');
                if (parts.length === 3) {
                    const day = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10);
                    const year = parts[2];
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return `${monthNames[month - 1]} ${day}, ${year}`;
                }
                return dateStr;
            })();

            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.font = `${size * 0.028}px 'Poppins', sans-serif`;
            ctx.fillText(dateInWords, size / 2, size * 0.73);

            // 5. Sender signature
            if (wishData?.senderName) {
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = 'rgba(0,0,0,0.7)';
                ctx.shadowBlur = 8;
                ctx.font = `italic ${size * 0.032}px 'Poppins', sans-serif`;
                ctx.fillText(`— From ${wishData.senderName}`, size / 2, size * 0.82);
            }

            // 6. Branding
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.font = `${size * 0.022}px 'Inter', sans-serif`;
            ctx.fillText('wishyfi.com', size / 2, size * 0.93);

            ctx.restore();

            // Subtle floating particles for emotion
            if (fade > 0.4) {
                ctx.save();
                const seed = (wishData?.recipientName?.length || 5) + (wishData?.date?.length || 10);
                for (let i = 0; i < 12; i++) {
                    const ps = seed + i;
                    const x = ((Math.sin(ps * 1.3) + 1) / 2) * size + Math.sin(progress * 2.5 + ps) * 35;
                    const y = ((Math.cos(ps * 1.9) + 1) / 2) * size - (p * 80) + Math.cos(progress * 2 + ps) * 25;
                    const particleFade = Math.min(0.5, fade * 0.6) * Math.max(0, 1 - (p - 0.85) * 5);
                    ctx.globalAlpha = particleFade;
                    ctx.font = `${size * 0.035}px serif`;
                    const emojis = ['✨', '💖', '⭐', '🎈'];
                    ctx.fillText(emojis[ps % emojis.length], x, y);
                }
                ctx.restore();
            }
        }

        // Interactive effects (mouse trail, confetti)
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
        // Trigger crackers at multiple key animation moments
        const crackerTriggers = [
            { start: 0.14, end: 0.16, x: size / 2, y: size / 2 },      // After intro
            { start: 0.26, end: 0.28, x: size * 0.3, y: size * 0.3 },  // Start of X animation
            { start: 0.35, end: 0.37, x: size * 0.7, y: size * 0.7 },  // Middle of X animation
            { start: 0.42, end: 0.44, x: size / 2, y: size * 0.3 },    // Start of blocks
            { start: 0.56, end: 0.58, x: size * 0.2, y: size / 2 },    // Start of rows
            { start: 0.70, end: 0.72, x: size * 0.8, y: size / 2 },    // Row emphasis
            { start: 0.82, end: 0.85, x: size / 2, y: size * 0.4 },    // Final greeting - big burst
        ];

        crackerTriggers.forEach(trigger => {
            if (progress > trigger.start && progress < trigger.end) {
                // Only trigger once per burst
                const triggerId = `cracker_${trigger.start}`;
                if (!crackers.current.triggered) crackers.current.triggered = {};
                if (!crackers.current.triggered[triggerId]) {
                    crackers.current.triggered[triggerId] = true;
                    const particleCount = trigger.start === 0.82 ? 80 : 45; // More particles for final burst
                    for (let i = 0; i < particleCount; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const velocity = 3 + Math.random() * 10;
                        const hue = Math.random() * 360;
                        crackers.current.push({
                            x: trigger.x,
                            y: trigger.y,
                            vx: Math.cos(angle) * velocity,
                            vy: Math.sin(angle) * velocity,
                            life: 1.0 + Math.random() * 0.5,
                            r: Math.random() * 4 + 1.5,
                            color: `hsl(${hue}, 100%, 65%)`
                        });
                    }
                }
            }
        });

        // Render crackers (Fireworks)
        crackers.current.forEach((p, i) => {
            if (typeof p === 'object' && p.x !== undefined) {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.12; // Gravity
                p.life -= 0.018;
                if (p.life <= 0) {
                    crackers.current.splice(i, 1);
                    return;
                }

                ctx.save();
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.shadowBlur = 15;
                ctx.shadowColor = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });

        // Magic Aura (Mouse Follow)
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

        // Confetti Burst (at final greeting)
        if (progress > 0.85 && progress < 0.88 && confetti.current.length === 0) {
            for (let i = 0; i < 120; i++) {
                confetti.current.push({
                    x: size / 2,
                    y: size / 2,
                    vx: (Math.random() - 0.5) * 18,
                    vy: (Math.random() - 0.8) * 18,
                    r: Math.random() * 6 + 4,
                    color: `hsl(${Math.random() * 360}, 80%, 60%)`,
                    rotation: Math.random() * Math.PI,
                    rv: (Math.random() - 0.5) * 0.2
                });
            }
        }

        if (progress > 0.85) {
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


    // Generate proper animated GIF using gif.js
    const handleGenerateGif = async () => {
        setIsGenerating(true);
        setGifProgress(0);

        try {
            console.log('Starting GIF generation...');

            // Slowed down GIF settings for a more cinematic and readable experience
            // 200 frames at 300ms = 60 seconds (much slower for better readability)
            const gifFrames = 200;
            const frameDelay = 300;

            console.log(`Generating ${gifFrames} frames with ${frameDelay}ms delay`);

            const blob = await createAnimatedGif(
                renderFrame,
                size,
                size,
                gifFrames,
                frameDelay,
                (progress) => {
                    console.log(`GIF Progress: ${progress}%`);
                    setGifProgress(progress);
                }
            );

            console.log('GIF generation completed, blob size:', blob?.size);

            if (blob && blob.size > 0) {
                setGifBlob(blob);
                const url = URL.createObjectURL(blob);
                setGifUrl(url);
                setIsFinished(true);
                return blob;
            } else {
                throw new Error('Generated GIF is empty or invalid');
            }

        } catch (error) {
            console.error('GIF generation failed:', error);
            alert('Failed to generate sharing GIF. Error: ' + error.message);
            return null;
        } finally {
            setIsGenerating(false);
        }
    };

    // Download generated GIF - Fixed with proper GIF file handling
    const handleDownloadGif = () => {
        if (!gifBlob) {
            alert('Please generate the GIF first by clicking "Download GIF".');
            return;
        }

        const filename = `magic_wish_${wishData?.recipientName || 'special'}_${Date.now()}.gif`;
        const success = downloadBlob(gifBlob, filename);

        if (!success) {
            // Fallback: open GIF in new tab
            if (gifUrl) {
                const newWindow = window.open(gifUrl, '_blank');
                if (newWindow) {
                    alert('GIF opened in new tab. Right-click and select "Save As..." to download.');
                } else {
                    alert('Download failed and popup blocked. Please allow popups and try again.');
                }
            } else {
                alert('Download failed. Please try generating the GIF again.');
            }
        }
    };

    // WhatsApp / Native Share API for GIF File + Link
    const handleShareGif = async () => {
        let currentBlob = gifBlob;

        // Generate GIF first if not available
        if (!currentBlob) {
            currentBlob = await handleGenerateGif();
            if (!currentBlob) {
                alert('Failed to generate GIF. Please try again.');
                return;
            }
        }

        setIsSharing(true);
        try {
            // Include link in the message - always include the link
            const linkMessage = shareableLink
                ? `✨ I created a magical wish for you! View it here: ${shareableLink}\n\nCreated with Ramanujan's mathematics at wishyfi.com`
                : `✨ A magical wish created with Ramanujan's mathematics! Visit wishyfi.com to create your own.`;

            const shared = await shareGifFile(currentBlob, wishData, linkMessage);
            if (!shared) {
                // Fallback: download with instructions
                downloadGifWithInstructions(currentBlob, wishData);
                const instructions = shareableLink
                    ? `GIF Downloaded! \n\nTo share on WhatsApp: \n1. Open WhatsApp chat \n2. Attach Gallery image \n3. Paste link in caption: ${shareableLink}`
                    : `GIF Downloaded! \n\nTo share: \n1. Open your messaging app \n2. Attach the downloaded GIF file`;
                alert(instructions);
            }
        } catch (error) {
            console.error('Share failed:', error);
            if (currentBlob) {
                downloadGifWithInstructions(currentBlob, wishData);
                alert('Share failed, but GIF was downloaded. You can manually attach it to your messages.');
            } else {
                alert('Share failed. Please try again.');
            }
        } finally {
            setIsSharing(false);
        }
    };

    // Copy shareable link
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareableLink);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (e) {
            const textArea = document.createElement('textarea');
            textArea.value = shareableLink;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
            } catch (err) {
                alert('Could not copy link. Link: ' + shareableLink);
            }
            document.body.removeChild(textArea);
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

                    {/* --- SHARE SECTION (Always Visible - Not Shared View) --- */}
                    {!isSharedView && (
                        <div className="share-section fade-in">
                            <div className="primary-actions mb-md">
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleBack}
                                >
                                    ✏️ Edit Wish
                                </button>

                                <button
                                    className="btn btn-secondary"
                                    onClick={handleCopyLink}
                                >
                                    {linkCopied ? '✓ Copied!' : '🔗 Copy Link'}
                                </button>

                                <button
                                    className="btn btn-primary"
                                    onClick={handleShareGif}
                                    disabled={isGenerating || isSharing}
                                    title="Share GIF + Link to WhatsApp, Telegram, etc."
                                >
                                    {isGenerating ? '⏳ Creating GIF...' : isSharing ? '📤 Sharing...' : '📤 Share via Apps'}
                                </button>
                            </div>

                            {/* Download button only after generation */}
                            {gifBlob && !isGenerating && (
                                <button onClick={handleDownloadGif} className="btn-link text-sm mb-md" style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', textDecoration: 'underline' }}>
                                    📥 Download GIF instead
                                </button>
                            )}

                            {/* Progress Bar */}
                            {isGenerating && (
                                <div className="mb-md">
                                    <ProgressBar progress={gifProgress} label="Creating your magical GIF..." />
                                </div>
                            )}

                            {/* GIF Success Preview */}
                            {gifBlob && gifUrl && (
                                <div className="gif-ready-section mb-md fade-in">
                                    <h4 className="text-center mb-sm">✨ Success! Your Magical GIF is Ready ✨</h4>
                                    <div className="gif-preview-box mb-md">
                                        <img src={gifUrl} alt="Magic Gift" className="gif-preview" />
                                    </div>

                                    <p className="share-info text-sm mt-sm">
                                        {shareSupport?.isSupported
                                            ? "✅ Your device supports direct file sharing!"
                                            : "💡 Tap 'Share' to see available apps."}
                                    </p>
                                </div>
                            )}
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

