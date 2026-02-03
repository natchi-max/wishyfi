import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MagicSquareAnimation.css';
import { parseDateComponents, generateDateEchoSquare } from '../utils/magicSquare';
import { createAnimatedGif, downloadBlob } from '../utils/gifGenerator';
import { createAnimatedVideo, downloadVideoBlob, isVideoRecordingSupported } from '../utils/videoGenerator';
import { shareGifFile, downloadGifWithInstructions, getShareSupport } from '../utils/shareUtils';
import { ProgressBar } from './LoadingComponents';
import TinyColor from 'tinycolor2';

import { getOccasionImage } from '../utils/imageFallback';

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
    const [showGift, setShowGift] = useState(isSharedView);
    const imgRef = useRef(new Image());

    // Load background image
    useEffect(() => {
        if (wishData?.occasion) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => setBgImage(img);
            img.onerror = () => setBgImage(null);
            img.src = getOccasionImage(wishData.occasion);
        }
    }, [wishData?.occasion]);

    // GIF & Video sharing state
    const [gifBlob, setGifBlob] = useState(null);
    const [videoBlob, setVideoBlob] = useState(null);
    const [gifProgress, setGifProgress] = useState(0);
    const [videoProgress, setVideoProgress] = useState(0);
    const [linkCopied, setLinkCopied] = useState(false);
    const [shareSupport, setShareSupport] = useState(null);
    const [isSharing, setIsSharing] = useState(false);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [videoSupported, setVideoSupported] = useState(false);

    // Redirect if no wish data
    useEffect(() => {
        if (!wishData && !isSharedView) {
            navigate('/create');
        }
    }, [wishData, navigate, isSharedView]);

    // Check share support and video support on mount
    useEffect(() => {
        setShareSupport(getShareSupport());
        setVideoSupported(isVideoRecordingSupported());
    }, []);

    const handleBack = () => {
        navigate('/create', { state: { wishData } });
    };

    const handleCreateAnother = () => {
        navigate('/create');
    };

    if (!wishData && !isSharedView) {
        return null;
    }

    // Calculate Square using Date Echo Logic
    const dateStr = wishData?.date;
    if (!dateStr) {
        return <div>No date provided</div>;
    }

    const { DD, MM, CC, YY } = parseDateComponents(dateStr);
    const { square, magicConstant } = generateDateEchoSquare(DD, MM, CC, YY);

    // For display purposes, we want the first row to show the original date components
    const displaySquare = [...square];
    displaySquare[0] = [DD, MM, CC, YY]; // Always show original date in first row

    const size = 800; // Increased resolution
    const padding = 100;
    const gridSize = size - padding * 2;
    const cellSize = gridSize / 4;
    const startX = padding;
    const startY = padding;

    const highlightColor = wishData?.colorHighlight || '#667eea';
    const bgColor = wishData?.colorBg || '#ffffff';

    // Total duration: 25 seconds
    const totalFrames = 750; // 30 FPS for 25 seconds



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
            const val = displaySquare[ri][ci];
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

            // Show the magic square values (including first row as [DD, MM, YY1, YY2])
            for (let ri = 0; ri < 4; ri++) {
                for (let ci = 0; ci < 4; ci++) {
                    const cellIndex = ri * 4 + ci;
                    const delay = ri === 0 ? 0 : 0.1 + (cellIndex * 0.03);
                    const cellFade = Math.max(0, Math.min(1, (p - delay) / 0.15));

                    if (ri === 0) {
                        // First row shows the parsed date components [DD, MM, YY1, YY2]
                        drawCell(ri, ci, cellFade * fade, highlightColor, true);
                    } else {
                        // Other rows show calculated magic square values
                        drawCell(ri, ci, cellFade * fade, null, false);
                    }
                }
            }

            // Title - The Foundation
            if (p > 0.3) {
                const actualDate = wishData?.date;
                const displayDate = actualDate ? `${actualDate}` : 'Your Date';

                ctx.save();
                ctx.globalAlpha = ((p - 0.3) / 0.7) * fade;
                ctx.fillStyle = highlightColor;
                ctx.textAlign = 'center';
                ctx.font = `bold ${cellSize * 0.25}px 'Poppins', sans-serif`;
                ctx.shadowColor = highlightColor;
                ctx.shadowBlur = 15;
                ctx.fillText(`Your special date: ${displayDate}`, startX + gridSize / 2, startY - 35);
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

        // ═══════════════════ SCREEN 5: COLOR GROUPING - SAME NUMBERS SAME COLORS (0.56 - 0.70) ═══════════════════
        else if (progress >= 0.56 && progress < 0.70) {
            const p = (progress - 0.56) / 0.14;
            const fade = smoothFade(p, 0.15, 0.85);

            drawGrid(ctx, 1);

            // Get unique values and assign colors
            const uniqueValues = [...new Set(displaySquare.flat())].sort((a, b) => a - b);
            const colors = ['#ff4444', '#4444ff', '#44ff44', '#44ffff', '#ff44ff', '#ffff44', '#ff8844', '#8844ff'];

            // Create value to color mapping
            const valueColorMap = {};
            uniqueValues.forEach((value, index) => {
                valueColorMap[value] = colors[index % colors.length];
            });

            // Show all cells with their colors simultaneously after initial delay
            if (p > 0.2) {
                const showFade = Math.min(1, (p - 0.2) / 0.3);

                for (let ri = 0; ri < 4; ri++) {
                    for (let ci = 0; ci < 4; ci++) {
                        const value = displaySquare[ri][ci];
                        const color = valueColorMap[value];

                        // Draw colored background
                        ctx.save();
                        ctx.globalAlpha = showFade * fade * 0.8;
                        ctx.fillStyle = color;
                        ctx.fillRect(startX + ci * cellSize, startY + ri * cellSize, cellSize, cellSize);
                        ctx.restore();

                        // Draw cell with white text
                        drawCell(ri, ci, showFade * fade, '#ffffff', true);
                    }
                }
            } else {
                // Initial fade in of all cells
                const initialFade = p / 0.2;
                for (let ri = 0; ri < 4; ri++) {
                    for (let ci = 0; ci < 4; ci++) {
                        drawCell(ri, ci, initialFade * fade * 0.3, null, false);
                    }
                }
            }

            // Title
            if (p > 0.1) {
                ctx.save();
                ctx.globalAlpha = Math.min(1, (p - 0.1) / 0.3) * fade;
                ctx.fillStyle = highlightColor;
                ctx.textAlign = 'center';
                ctx.font = `bold ${cellSize * 0.25}px 'Poppins', sans-serif`;
                ctx.fillText(`Same numbers, same colors`, startX + gridSize / 2, startY - 35);

                // Add wishyfi.com
                ctx.globalAlpha = Math.min(1, (p - 0.1) / 0.3) * fade * 0.7;
                ctx.fillStyle = 'rgba(102, 126, 234, 0.6)';
                ctx.font = `${size * 0.025}px 'Inter', sans-serif`;
                ctx.fillText('wishyfi.com', startX + gridSize / 2, size - 30);
                ctx.restore();
            }
        }

        // ═══════════════════ SCREEN 6: ALL ROWS + ALL COLUMNS (0.70 - 0.82) ═══════════════════
        else if (progress >= 0.70 && progress < 0.82) {
            const p = (progress - 0.70) / 0.12;
            const fade = smoothFade(p, 0.15, 0.85);

            drawGrid(ctx, 1);

            const rowColors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a855f7'];
            const colColors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a855f7'];

            // First half: All 4 rows animate in sequence
            if (p < 0.5) {
                const rowPhase = p / 0.5;

                for (let ri = 0; ri < 4; ri++) {
                    const rowDelay = ri * 0.1;
                    const rowP = Math.max(0, Math.min(1, (rowPhase - rowDelay) / 0.2));

                    if (rowP > 0) {
                        const rowFade = easeInOut(rowP);
                        drawRowBg(ri, rowFade, rowColors[ri]);

                        for (let ci = 0; ci < 4; ci++) {
                            drawCell(ri, ci, rowFade * fade, rowColors[ri], rowP > 0.5);
                        }
                    } else {
                        for (let ci = 0; ci < 4; ci++) {
                            drawCell(ri, ci, 0.25 * fade, null, false);
                        }
                    }
                }
            }
            // Second half: All 4 columns animate in sequence
            else {
                const colPhase = (p - 0.5) / 0.5;

                for (let ci = 0; ci < 4; ci++) {
                    const colDelay = ci * 0.1;
                    const colP = Math.max(0, Math.min(1, (colPhase - colDelay) / 0.2));

                    if (colP > 0) {
                        const colFade = easeInOut(colP);
                        drawColBg(ci, colFade, colColors[ci]);

                        for (let ri = 0; ri < 4; ri++) {
                            drawCell(ri, ci, colFade * fade, colColors[ci], colP > 0.5);
                        }
                    } else {
                        for (let ri = 0; ri < 4; ri++) {
                            drawCell(ri, ci, 0.25 * fade, null, false);
                        }
                    }
                }
            }

            // Title
            ctx.save();
            ctx.globalAlpha = fade;
            ctx.fillStyle = highlightColor;
            ctx.textAlign = 'center';
            ctx.font = `bold ${cellSize * 0.2}px 'Poppins', sans-serif`;
            const title = p < 0.5 ? `All rows sum to ${magicConstant}` : `All columns sum to ${magicConstant}`;
            ctx.fillText(title, startX + gridSize / 2, startY - 35);

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

            // Background image or gradient
            if (bgImage) {
                ctx.save();
                ctx.globalAlpha = fade;
                ctx.drawImage(bgImage, 0, 0, size, size);

                // Dark overlay for text readability
                const grad = ctx.createLinearGradient(0, 0, 0, size);
                grad.addColorStop(0, 'rgba(0,0,0,0.3)');
                grad.addColorStop(1, 'rgba(0,0,0,0.7)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, size, size);
                ctx.restore();
            } else {
                // Fallback gradient
                const grad = ctx.createLinearGradient(0, 0, 0, size);
                grad.addColorStop(0, highlightColor);
                grad.addColorStop(1, TinyColor(highlightColor).darken(30).toString());
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, size, size);
            }

            ctx.save();
            ctx.globalAlpha = fade;
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 10;

            // Title
            ctx.font = `bold ${size * 0.09}px 'Dancing Script', cursive`;
            ctx.fillText(`Happy ${(wishData?.occasion || 'celebration').charAt(0).toUpperCase() + (wishData?.occasion || 'celebration').slice(1)}!`, size / 2, size * 0.25);

            // Floating Emoji Particles (Deterministic)
            const emojis = ['✨', '💖', '⭐', '🎈', '🎉'];
            const particleCount = 20;

            for (let i = 0; i < particleCount; i++) {
                // Deterministic pseudo-random based on index
                const seed = i * 1337;
                const speed = 0.5 + ((seed % 100) / 100);

                // Position based on time (p)
                const yOffset = (p * 500 * speed + seed) % (size + 100) - 50;
                const x = (seed % size);
                const y = size - yOffset; // Move upwards

                // Wiggle
                const xWiggle = Math.sin(p * 10 + i) * 20;

                const emoji = emojis[i % emojis.length];
                const fontSize = 20 + (seed % 20);

                ctx.font = `${fontSize}px Arial`;
                ctx.fillText(emoji, x + xWiggle, y);
            }

            // Recipient
            ctx.font = `${size * 0.04}px 'Inter', sans-serif`;
            ctx.fillText(`For ${wishData?.recipientName || 'You'}`, size / 2, size * 0.35);

            // Message with word wrapping
            ctx.font = `${size * 0.03}px 'Inter', sans-serif`;
            const message = wishData?.message || 'A special wish for you';
            const words = message.split(' ');
            let line = '';
            let y = size * 0.5;

            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > size * 0.8 && n > 0) {
                    ctx.fillText(line, size / 2, y);
                    line = words[n] + ' ';
                    y += size * 0.05;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, size / 2, y);

            // Date
            ctx.font = `${size * 0.025}px 'Inter', sans-serif`;
            ctx.fillText(wishData?.date || '', size / 2, size * 0.75);

            // Sender
            if (wishData?.senderName) {
                ctx.font = `italic ${size * 0.025}px 'Inter', sans-serif`;
                ctx.fillText(`— From ${wishData.senderName}`, size / 2, size * 0.85);
            }

            // Branding
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.font = `${size * 0.02}px 'Inter', sans-serif`;
            ctx.fillText('wishyfi.com', size / 2, size * 0.95);

            ctx.restore();
        }

        // Interactive effects removed for simplicity

    }, [displaySquare, magicConstant, startX, startY, cellSize, gridSize, drawGrid, highlightColor, bgColor, wishData]);



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

            animationId = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(animationId);
    }, [renderFrame, totalFrames, showGift]);

    const handleOpenGift = () => {
        setTimeout(() => {
            setShowGift(false);
        }, 800);
    };


    // Generate MP4 video using MediaRecorder API
    const handleGenerateVideo = async () => {
        if (!videoSupported) {
            alert('Video recording is not supported in your browser. Please try a modern browser like Chrome or Firefox.');
            return;
        }

        setIsGeneratingVideo(true);
        setVideoProgress(0);

        try {
            console.log('Starting video generation...');

            // Video settings for 25 seconds
            const videoFrames = 750; // 25 seconds at 30fps
            const fps = 30;

            console.log(`Generating ${videoFrames} frames at ${fps}fps`);

            const blob = await createAnimatedVideo(
                renderFrame,
                size,
                size,
                videoFrames,
                fps,
                (progress) => {
                    console.log(`Video Progress: ${progress}%`);
                    setVideoProgress(progress);
                }
            );

            console.log('Video generation completed, blob size:', blob?.size);

            if (blob && blob.size > 0) {
                setVideoBlob(blob);
                return blob;
            } else {
                throw new Error('Generated video is empty or invalid');
            }

        } catch (error) {
            console.error('Video generation failed:', error);
            alert('Failed to generate video. Error: ' + error.message);
            return null;
        } finally {
            setIsGeneratingVideo(false);
        }
    };
    const handleGenerateGif = async () => {
        setIsGenerating(true);
        setGifProgress(0);

        try {
            console.log('Starting GIF generation...');

            // 25 second GIF settings
            const gifFrames = 750;
            const frameDelay = 33; // ~30 FPS

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

    // Download generated video
    const handleDownloadVideo = () => {
        if (!videoBlob) {
            alert('Please generate the video first by clicking "Download Video".');
            return;
        }

        const filename = `magic_wish_${wishData?.recipientName || 'special'}_${Date.now()}.webm`;
        const success = downloadVideoBlob(videoBlob, filename);

        if (!success) {
            // Fallback: open video in new tab
            const videoUrl = URL.createObjectURL(videoBlob);
            const newWindow = window.open(videoUrl, '_blank');
            if (newWindow) {
                alert('Video opened in new tab. Right-click and select "Save As..." to download.');
            } else {
                alert('Download failed and popup blocked. Please allow popups and try again.');
            }
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
            const linkMessage = `✨ A magical wish created with Ramanujan's mathematics! Visit wishyfi.com to create your own.`;

            const shared = await shareGifFile(currentBlob, wishData, linkMessage);

            if (!shared) {
                // Native sharing not supported - inform user
                alert('Native sharing is not supported on this device.\n\nPlease use the "Download GIF" button below, then manually share the file from your gallery.');
            }
        } catch (error) {
            console.error('Share failed:', error);
            alert('Sharing failed. Please use the "Download GIF" button to save and share manually.');
        } finally {
            setIsSharing(false);
        }
    };

    // Copy shareable link
    const handleCopyLink = async () => {
        const link = `${window.location.origin}/create`;
        try {
            await navigator.clipboard.writeText(link);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (e) {
            alert('Could not copy link. Link: ' + link);
        }
    };



    return (
        <div className="animation-page page">
            <div className="animation-container">
                <div className="canvas-wrapper cinematic-border">
                    <canvas ref={canvasRef} width={size} height={size} />

                    {/* --- GIFT OVERLAY --- */}
                    {showGift && (
                        <div className="gift-overlay" onClick={handleOpenGift}>
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

                                {/* Only show Share via Apps on devices with native share support */}
                                {shareSupport?.hasWebShare && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleShareGif}
                                        disabled={isGenerating || isSharing}
                                        title="Share GIF + Link to WhatsApp, Telegram, etc."
                                    >
                                        {isGenerating ? '⏳ Creating GIF...' : isSharing ? '📤 Sharing...' : '📤 Share via Apps'}
                                    </button>
                                )}
                            </div>

                            {/* Export Options */}
                            <div className="export-options mb-md">
                                <h4 className="text-center mb-sm">📥 Download Options</h4>
                                <div className="export-buttons">
                                    <button
                                        className="btn btn-download"
                                        onClick={handleGenerateGif}
                                        disabled={isGenerating || isGeneratingVideo}
                                        title="Download as animated GIF"
                                    >
                                        <span className="btn-icon">🎞️</span>
                                        <span className="btn-text">{isGenerating ? 'Creating...' : 'Download GIF'}</span>
                                    </button>

                                    {videoSupported && (
                                        <button
                                            className="btn btn-download"
                                            onClick={handleGenerateVideo}
                                            disabled={isGenerating || isGeneratingVideo}
                                            title="Download as MP4 video"
                                        >
                                            <span className="btn-icon">🎬</span>
                                            <span className="btn-text">{isGeneratingVideo ? 'Creating...' : 'Download Video'}</span>
                                        </button>
                                    )}
                                </div>

                                {!videoSupported && (
                                    <p className="text-sm text-secondary mt-sm">
                                        💡 Video export requires a modern browser. GIF export is available for all browsers.
                                    </p>
                                )}
                            </div>

                            {/* Download buttons after generation */}
                            {(gifBlob || videoBlob) && !isGenerating && !isGeneratingVideo && (
                                <div className="download-ready mb-md">
                                    {gifBlob && (
                                        <button onClick={handleDownloadGif} className="btn-link text-sm mr-md" style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', textDecoration: 'underline' }}>
                                            📥 Download GIF
                                        </button>
                                    )}
                                    {videoBlob && (
                                        <button onClick={handleDownloadVideo} className="btn-link text-sm" style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', textDecoration: 'underline' }}>
                                            📥 Download Video
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Progress Bars */}
                            {isGenerating && (
                                <div className="mb-md">
                                    <ProgressBar progress={gifProgress} label="Creating your magical GIF..." />
                                </div>
                            )}

                            {isGeneratingVideo && (
                                <div className="mb-md">
                                    <ProgressBar progress={videoProgress} label="Creating your magical video..." />
                                </div>
                            )}

                            {/* Success Preview */}
                            {(gifBlob || videoBlob) && gifUrl && (
                                <div className="export-ready-section mb-md fade-in">
                                    <h4 className="text-center mb-sm">✨ Success! Your Magical Export is Ready ✨</h4>
                                    <div className="export-preview-box mb-md">
                                        {gifBlob && <img src={gifUrl} alt="Magic Gift" className="export-preview" />}
                                        {videoBlob && !gifBlob && (
                                            <video
                                                src={URL.createObjectURL(videoBlob)}
                                                className="export-preview"
                                                autoPlay
                                                loop
                                                muted
                                            />
                                        )}
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

