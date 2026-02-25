import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MagicSquareAnimation.css';
import { parseDateComponents, generateDateEchoSquare } from '../utils/magicSquare';
import { createAnimatedVideo, downloadVideoBlob, isVideoRecordingSupported } from '../utils/videoGenerator';
import { shareGifFile, getShareSupport } from '../utils/shareUtils';
import { ProgressBar } from './LoadingComponents';
import TinyColor from 'tinycolor2';

import { getOccasionImage } from '../utils/imageFallback';

// VideoPreview component to handle object URL lifecycle and avoid memory leaks
const VideoPreview = ({ blob }) => {
    const url = useMemo(() => blob ? URL.createObjectURL(blob) : null, [blob]);

    useEffect(() => {
        return () => {
            if (url) URL.revokeObjectURL(url);
        };
    }, [url]);

    if (!url) return null;

    return (
        <video
            src={url}
            className="export-preview"
            autoPlay
            loop
            muted
        />
    );
};

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
    const [bgImage, setBgImage] = useState(null);
    const [showGift, setShowGift] = useState(isSharedView);

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
    const [videoBlob, setVideoBlob] = useState(null);
    const [videoProgress, setVideoProgress] = useState(0);
    const [linkCopied, setLinkCopied] = useState(false);
    const [shareSupport, setShareSupport] = useState(null);
    const [isSharing, setIsSharing] = useState(false);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [showManualShare, setShowManualShare] = useState(false);
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

    // Calculate Square using Date Echo Logic (with fallbacks)
    const dateStr = wishData?.date;
    const { DD, MM, CC, YY } = dateStr ? parseDateComponents(dateStr) : { DD: 0, MM: 0, CC: 0, YY: 0 };
    const { square, magicConstant: calculatedMagicConstant } = dateStr ? generateDateEchoSquare(DD, MM, CC, YY) : { square: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], magicConstant: 0 };

    // Use the square directly from the generator (first row already contains date components)
    const displaySquare = dateStr ? square : [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];

    // Use the magic constant calculated by the generator (accounts for any offset corrections)
    const magicConstant = dateStr ? calculatedMagicConstant : 0;

    const size = 800; // Increased resolution
    const padding = 100;
    const gridSize = size - padding * 2;
    const cellSize = gridSize / 4;
    const startX = padding;
    const startY = padding;

    const highlightColor = wishData?.colorHighlight || '#667eea';
    const bgColor = wishData?.colorBg || '#ffffff';

    // Total duration: 20 seconds
    const totalFrames = 600; // 30 FPS for 20 seconds



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
        // CINEMATIC 8-SCREEN FLOW (20 SECONDS TOTAL)
        // ════════════════════════════════════════════════════════════
        // Screen 1 (0.00 - 0.12): Introduction - 2.4 seconds
        // Screen 2 (0.12 - 0.25): Date Foundation - 2.6 seconds
        // Screen 3 (0.25 - 0.38): Row Sums - 2.6 seconds
        // Screen 4 (0.38 - 0.51): Column Sums - 2.6 seconds
        // Screen 5 (0.51 - 0.64): Diagonal Magic - 2.6 seconds
        // Screen 6 (0.64 - 0.77): Secret Recipe (2×2) - 2.6 seconds
        // Screen 7 (0.77 - 0.93): Color Pattern - 3.2 seconds
        // Screen 8 (0.93 - 1.00): Final Greeting - 1.4 seconds

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

        const smoothFade = (p, fadeInEnd = 0.25, fadeOutStart = 0.75) => {
            if (p < fadeInEnd) return p / fadeInEnd;
            if (p > fadeOutStart) return Math.max(0, 1 - (p - fadeOutStart) / (1 - fadeOutStart));
            return 1;
        };



        // ═══════════════════ SCREEN 1: INTRODUCTION (0.00 - 0.12) ═══════════════════
        if (progress < 0.12) {
            const p = progress / 0.12;

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

        // ═══════════════════ SCREEN 2: DATE FOUNDATION (0.12 - 0.25) ═══════════════════
        else if (progress >= 0.12 && progress < 0.25) {
            const p = (progress - 0.12) / 0.13;
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

        // ═══════════════════ SCREEN 3: ROW SUMS (0.25 - 0.38) ═══════════════════
        else if (progress >= 0.25 && progress < 0.38) {
            const p = (progress - 0.25) / 0.13;
            const fade = smoothFade(p, 0.1, 0.9);

            drawGrid(ctx, 1);

            const rowColors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a855f7'];

            // Draw all cells dimmed first
            for (let ri = 0; ri < 4; ri++) {
                for (let ci = 0; ci < 4; ci++) {
                    drawCell(ri, ci, 0.2 * fade, null, false);
                }
            }

            // Animate each row highlighting sequentially
            for (let row = 0; row < 4; row++) {
                const rowDelay = row * 0.2;
                const rowProgress = Math.max(0, Math.min(1, (p - rowDelay) / 0.25));

                if (rowProgress > 0) {
                    const rowFade = smoothFade(rowProgress, 0.15, 0.85);
                    const color = rowColors[row];

                    // Glowing row background
                    ctx.save();
                    ctx.globalAlpha = rowFade * fade * 0.35;
                    ctx.fillStyle = color;
                    ctx.shadowColor = color;
                    ctx.shadowBlur = 20;
                    ctx.fillRect(startX, startY + row * cellSize, gridSize, cellSize);
                    ctx.restore();

                    // Draw connecting line across the row
                    ctx.save();
                    ctx.globalAlpha = rowFade * fade * 0.7;
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 4;
                    ctx.shadowColor = color;
                    ctx.shadowBlur = 15;
                    ctx.setLineDash([8, 4]);
                    ctx.beginPath();
                    const rowCenterY = startY + row * cellSize + cellSize / 2;
                    ctx.moveTo(startX + cellSize * 0.2, rowCenterY);
                    ctx.lineTo(startX + gridSize - cellSize * 0.2, rowCenterY);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.restore();

                    // Highlight each cell in the row sequentially
                    for (let ci = 0; ci < 4; ci++) {
                        const cellDelay = ci * 0.1;
                        const cellP = Math.max(0, Math.min(1, (rowProgress - cellDelay) / 0.3));

                        if (cellP > 0) {
                            drawCell(row, ci, cellP * rowFade * fade, color, true);
                        }
                    }

                    // Show sum = magicConstant at the end of the row
                    if (rowProgress > 0.5) {
                        const sumFade = Math.min(1, (rowProgress - 0.5) / 0.3);
                        ctx.save();
                        ctx.globalAlpha = sumFade * rowFade * fade;
                        ctx.fillStyle = color;
                        ctx.textAlign = 'left';
                        ctx.textBaseline = 'middle';
                        ctx.font = `bold ${cellSize * 0.28}px 'Poppins', sans-serif`;
                        ctx.shadowColor = color;
                        ctx.shadowBlur = 12;
                        ctx.fillText(`= ${magicConstant}`, startX + gridSize + 15, startY + row * cellSize + cellSize / 2);
                        ctx.restore();
                    }
                }
            }

            // Title
            ctx.save();
            ctx.globalAlpha = fade;
            ctx.textAlign = 'center';
            ctx.font = `bold ${cellSize * 0.28}px 'Poppins', sans-serif`;
            ctx.fillStyle = baseTextColor;
            ctx.shadowColor = isLtTheme ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 10;
            ctx.fillText(`Every row sums to ${magicConstant}`, startX + gridSize / 2, startY - 35);

            // Add wishyfi.com
            ctx.globalAlpha = fade * 0.7;
            ctx.fillStyle = 'rgba(102, 126, 234, 0.6)';
            ctx.font = `${size * 0.025}px 'Inter', sans-serif`;
            ctx.fillText('wishyfi.com', startX + gridSize / 2, size - 30);
            ctx.restore();
        }

        // ═══════════════════ SCREEN 4: COLUMN SUMS (0.38 - 0.51) ═══════════════════
        else if (progress >= 0.38 && progress < 0.51) {
            const p = (progress - 0.38) / 0.13;
            const fade = smoothFade(p, 0.1, 0.9);

            drawGrid(ctx, 1);

            const colColors = ['#f472b6', '#38bdf8', '#34d399', '#fb923c'];

            // Draw all cells dimmed first
            for (let ri = 0; ri < 4; ri++) {
                for (let ci = 0; ci < 4; ci++) {
                    drawCell(ri, ci, 0.2 * fade, null, false);
                }
            }

            // Animate each column highlighting sequentially
            for (let col = 0; col < 4; col++) {
                const colDelay = col * 0.2;
                const colProgress = Math.max(0, Math.min(1, (p - colDelay) / 0.25));

                if (colProgress > 0) {
                    const colFade = smoothFade(colProgress, 0.15, 0.85);
                    const color = colColors[col];

                    // Glowing column background
                    ctx.save();
                    ctx.globalAlpha = colFade * fade * 0.35;
                    ctx.fillStyle = color;
                    ctx.shadowColor = color;
                    ctx.shadowBlur = 20;
                    ctx.fillRect(startX + col * cellSize, startY, cellSize, gridSize);
                    ctx.restore();

                    // Draw connecting line down the column
                    ctx.save();
                    ctx.globalAlpha = colFade * fade * 0.7;
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 4;
                    ctx.shadowColor = color;
                    ctx.shadowBlur = 15;
                    ctx.setLineDash([8, 4]);
                    ctx.beginPath();
                    const colCenterX = startX + col * cellSize + cellSize / 2;
                    ctx.moveTo(colCenterX, startY + cellSize * 0.2);
                    ctx.lineTo(colCenterX, startY + gridSize - cellSize * 0.2);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.restore();

                    // Highlight each cell in the column sequentially (top to bottom)
                    for (let ri = 0; ri < 4; ri++) {
                        const cellDelay = ri * 0.1;
                        const cellP = Math.max(0, Math.min(1, (colProgress - cellDelay) / 0.3));

                        if (cellP > 0) {
                            drawCell(ri, col, cellP * colFade * fade, color, true);
                        }
                    }

                    // Show sum = magicConstant below the column
                    if (colProgress > 0.5) {
                        const sumFade = Math.min(1, (colProgress - 0.5) / 0.3);
                        ctx.save();
                        ctx.globalAlpha = sumFade * colFade * fade;
                        ctx.fillStyle = color;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'top';
                        ctx.font = `bold ${cellSize * 0.22}px 'Poppins', sans-serif`;
                        ctx.shadowColor = color;
                        ctx.shadowBlur = 12;
                        ctx.fillText(`= ${magicConstant}`, startX + col * cellSize + cellSize / 2, startY + gridSize + 12);
                        ctx.restore();
                    }
                }
            }

            // Title
            ctx.save();
            ctx.globalAlpha = fade;
            ctx.textAlign = 'center';
            ctx.font = `bold ${cellSize * 0.28}px 'Poppins', sans-serif`;
            ctx.fillStyle = baseTextColor;
            ctx.shadowColor = isLtTheme ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 10;
            ctx.fillText(`Every column sums to ${magicConstant}`, startX + gridSize / 2, startY - 35);

            // Add wishyfi.com
            ctx.globalAlpha = fade * 0.7;
            ctx.fillStyle = 'rgba(102, 126, 234, 0.6)';
            ctx.font = `${size * 0.025}px 'Inter', sans-serif`;
            ctx.fillText('wishyfi.com', startX + gridSize / 2, size - 30);
            ctx.restore();
        }

        // ═══════════════════ SCREEN 5: DIAGONAL MAGIC (0.51 - 0.64) ═══════════════════
        else if (progress >= 0.51 && progress < 0.64) {
            const p = (progress - 0.51) / 0.13;
            const fade = smoothFade(p, 0.1, 0.9);

            drawGrid(ctx, 1);

            // Phase 1 (0-0.5): Main diagonal appears
            // Phase 2 (0.4-0.9): Anti-diagonal appears
            // Phase 3 (0.5-1.0): Both glow together

            const mainDiag = [[0, 0], [1, 1], [2, 2], [3, 3]];
            const antiDiag = [[0, 3], [1, 2], [2, 1], [3, 0]];
            const centerCells = [[1, 1], [1, 2], [2, 1], [2, 2]]; // Where diagonals cross

            // Draw all cells dimmed first
            for (let ri = 0; ri < 4; ri++) {
                for (let ci = 0; ci < 4; ci++) {
                    drawCell(ri, ci, 0.2 * fade, null, false);
                }
            }

            // Phase 1: Main Diagonal (top-left to bottom-right) - RED
            if (p < 0.6) {
                const mainP = Math.min(1, p / 0.5);

                // Draw glowing line connecting diagonal
                ctx.save();
                ctx.globalAlpha = mainP * fade * 0.6;
                ctx.strokeStyle = '#ff6b6b';
                ctx.lineWidth = 8;
                ctx.shadowColor = '#ff6b6b';
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.moveTo(startX + cellSize * 0.5, startY + cellSize * 0.5);
                ctx.lineTo(startX + cellSize * 3.5, startY + cellSize * 3.5);
                ctx.stroke();
                ctx.restore();

                // Highlight main diagonal cells sequentially
                mainDiag.forEach(([ri, ci], idx) => {
                    const cellDelay = idx * 0.15;
                    const cellP = Math.max(0, Math.min(1, (mainP - cellDelay) / 0.4));

                    if (cellP > 0) {
                        // Glowing background
                        ctx.save();
                        ctx.globalAlpha = cellP * fade * 0.5;
                        ctx.fillStyle = '#ff6b6b';
                        ctx.shadowColor = '#ff6b6b';
                        ctx.shadowBlur = 30;
                        ctx.fillRect(startX + ci * cellSize, startY + ri * cellSize, cellSize, cellSize);
                        ctx.restore();

                        // Number
                        drawCell(ri, ci, cellP * fade, '#ff6b6b', true);
                    }
                });
            }

            // Phase 2: Anti-Diagonal (top-right to bottom-left) - CYAN
            if (p >= 0.4) {
                const antiP = Math.min(1, (p - 0.4) / 0.5);

                // Draw glowing line connecting anti-diagonal
                ctx.save();
                ctx.globalAlpha = antiP * fade * 0.6;
                ctx.strokeStyle = '#4ecdc4';
                ctx.lineWidth = 8;
                ctx.shadowColor = '#4ecdc4';
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.moveTo(startX + cellSize * 3.5, startY + cellSize * 0.5);
                ctx.lineTo(startX + cellSize * 0.5, startY + cellSize * 3.5);
                ctx.stroke();
                ctx.restore();

                // Highlight anti-diagonal cells sequentially
                antiDiag.forEach(([ri, ci], idx) => {
                    const cellDelay = idx * 0.15;
                    const cellP = Math.max(0, Math.min(1, (antiP - cellDelay) / 0.4));

                    if (cellP > 0) {
                        // Check if this is a center cell (overlap)
                        const isCenter = centerCells.some(([r, c]) => r === ri && c === ci);
                        const color = isCenter ? '#ffe66d' : '#4ecdc4'; // Yellow for overlap

                        // Glowing background
                        ctx.save();
                        ctx.globalAlpha = cellP * fade * 0.5;
                        ctx.fillStyle = color;
                        ctx.shadowColor = color;
                        ctx.shadowBlur = 30;
                        ctx.fillRect(startX + ci * cellSize, startY + ri * cellSize, cellSize, cellSize);
                        ctx.restore();

                        // Number
                        drawCell(ri, ci, cellP * fade, color, true);
                    }
                });
            }

            // Re-draw main diagonal on top if both phases active
            if (p >= 0.5) {
                mainDiag.forEach(([ri, ci]) => {
                    const isCenter = centerCells.some(([r, c]) => r === ri && c === ci);
                    if (!isCenter) {
                        drawCell(ri, ci, fade, '#ff6b6b', true);
                    }
                });
            }

            // Title with animation
            ctx.save();
            ctx.globalAlpha = fade;
            ctx.textAlign = 'center';
            ctx.font = `bold ${cellSize * 0.28}px 'Poppins', sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 10;

            // Change text based on phase
            const titleText = p < 0.5
                ? `Main diagonal: ${magicConstant}`
                : `Both diagonals sum to ${magicConstant}`;

            ctx.fillText(titleText, startX + gridSize / 2, startY - 35);

            // Add wishyfi.com
            ctx.globalAlpha = fade * 0.7;
            ctx.fillStyle = 'rgba(102, 126, 234, 0.8)';
            ctx.font = `${size * 0.025}px 'Inter', sans-serif`;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 5;
            ctx.fillText('wishyfi.com', startX + gridSize / 2, size - 30);
            ctx.restore();
        }

        // ═══════════════════ SCREEN 6: SECRET RECIPE / 2×2 QUADRANTS (0.64 - 0.77) ═══════════════════
        else if (progress >= 0.64 && progress < 0.77) {
            const p = (progress - 0.64) / 0.13;
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

        // ═══════════════════ SCREEN 7: COLOR PATTERN (0.77 - 0.93) ═══════════════════
        else if (progress >= 0.77 && progress < 0.93) {
            const p = (progress - 0.77) / 0.16;
            const fade = smoothFade(p, 0.15, 0.85);

            drawGrid(ctx, 1);

            // Define color pattern based on user's image (4 colors)
            const redCells = [[0, 0], [3, 0]];           // Red corners
            const greenCells = [[0, 3], [3, 3]];         // Green corners  
            const blueCells = [[0, 1], [0, 2], [3, 1], [3, 2]]; // Blue edges
            const yellowCells = [[1, 1], [1, 2], [2, 1], [2, 2]]; // Yellow center

            // Draw all cells dimmed first
            for (let ri = 0; ri < 4; ri++) {
                for (let ci = 0; ci < 4; ci++) {
                    drawCell(ri, ci, 0.15 * fade, null, false);
                }
            }

            // Animate color groups appearing (optimized for 4-second duration)
            const groups = [
                { cells: redCells, color: '#ff6b6b', delay: 0.0 },      // Red first
                { cells: greenCells, color: '#51cf66', delay: 0.2 },    // Green second
                { cells: blueCells, color: '#339af0', delay: 0.4 },     // Blue third
                { cells: yellowCells, color: '#ffe66d', delay: 0.6 }    // Yellow fourth
            ];

            groups.forEach(({ cells, color, delay }) => {
                if (p >= delay) {
                    const groupP = Math.min(1, (p - delay) / 0.3);  // 0.6s per color group

                    cells.forEach(([ri, ci], idx) => {
                        const cellDelay = idx * 0.08;  // Faster cell delay for 4-second window
                        const cellP = Math.max(0, Math.min(1, (groupP - cellDelay) / 0.4));  // Faster cell animation

                        if (cellP > 0) {
                            // Enhanced glowing background with pulse effect
                            const pulse = Math.sin(cellP * Math.PI) * 0.15 + 0.85;

                            ctx.save();
                            ctx.globalAlpha = cellP * fade * 0.8 * pulse;
                            ctx.fillStyle = color;
                            ctx.shadowColor = color;
                            ctx.shadowBlur = 25;
                            ctx.fillRect(startX + ci * cellSize, startY + ri * cellSize, cellSize, cellSize);
                            ctx.restore();

                            // Number with enhanced white text
                            drawCell(ri, ci, cellP * fade, '#ffffff', true);
                        }
                    });
                }
            });

            // Enhanced title with animation
            if (p > 0.1) {
                const titleFade = Math.min(1, (p - 0.1) / 0.2);
                ctx.save();
                ctx.globalAlpha = titleFade * fade;
                ctx.textAlign = 'center';
                ctx.font = `bold ${cellSize * 0.26}px 'Poppins', sans-serif`;
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = '#000';
                ctx.shadowBlur = 12;

                // Animated title text
                const titleText = p < 0.5
                    ? `Color Magic Appears...`
                    : `Beautiful 4-Color Pattern`;

                ctx.fillText(titleText, startX + gridSize / 2, startY - 35);

                // Add wishyfi.com with enhanced styling
                ctx.globalAlpha = titleFade * fade * 0.8;
                ctx.fillStyle = 'rgba(102, 126, 234, 0.8)';
                ctx.font = `${size * 0.025}px 'Inter', sans-serif`;
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 6;
                ctx.fillText('wishyfi.com', startX + gridSize / 2, size - 30);
                ctx.restore();
            }

            // Final effect: All cells glow together at the end
            if (p > 0.8) {
                const finalGlow = (p - 0.8) / 0.2;
                ctx.save();
                ctx.globalAlpha = finalGlow * fade * 0.4;
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 15;
                ctx.strokeRect(startX - 2, startY - 2, gridSize + 4, gridSize + 4);
                ctx.restore();
            }
        }

        // ═══════════════════ SCREEN 8: FINAL GREETING (0.93 - 1.00) ═══════════════════
        else if (progress >= 0.93) {
            const p = (progress - 0.93) / 0.07;
            const fade = Math.min(1, p / 0.2);

            // 1. Draw Background
            ctx.save();
            ctx.globalAlpha = fade;

            if (bgImage) {
                // Use provided background image
                ctx.drawImage(bgImage, 0, 0, size, size);

                // Add an elegant dark overlay
                const grad = ctx.createRadialGradient(size / 2, size / 2, size * 0.2, size / 2, size / 2, size * 0.9);
                grad.addColorStop(0, 'rgba(0,0,0,0.4)');
                grad.addColorStop(1, 'rgba(0,0,0,0.85)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, size, size);
            } else {
                // Fallback elegant gradient background based on theme
                const grad = ctx.createLinearGradient(0, 0, size, size);
                const baseColor = TinyColor(highlightColor).isValid() ? highlightColor : '#1e293b';
                // Make it dark and premium
                grad.addColorStop(0, TinyColor(baseColor).darken(20).toString());
                grad.addColorStop(0.5, TinyColor(baseColor).darken(35).toString());
                grad.addColorStop(1, TinyColor(baseColor).darken(50).toString());
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, size, size);

                // Add subtle grid pattern
                ctx.strokeStyle = 'rgba(255,255,255,0.03)';
                ctx.lineWidth = 1;
                const patternGridSize = size / 20;
                for (let i = 0; i < 20; i++) {
                    ctx.beginPath();
                    ctx.moveTo(i * patternGridSize, 0);
                    ctx.lineTo(i * patternGridSize, size);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(0, i * patternGridSize);
                    ctx.lineTo(size, i * patternGridSize);
                    ctx.stroke();
                }
            }
            ctx.restore();

            // 2. Draw "Wish Card" Frame
            ctx.save();
            ctx.globalAlpha = fade;
            ctx.translate(size / 2, size / 2); // Center coordinate system

            // Card Border
            const cardW = size * 0.85;
            const cardH = size * 0.85;
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)'; // Gold-like
            ctx.lineWidth = 2;
            ctx.shadowColor = 'rgba(255, 215, 0, 0.3)';
            ctx.shadowBlur = 10;

            // Fancy border path
            ctx.beginPath();
            ctx.rect(-cardW / 2, -cardH / 2, cardW, cardH);
            ctx.stroke();

            // Corner Flourishes
            const cornerSize = 40;
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';

            // Top-left
            ctx.beginPath();
            ctx.moveTo(-cardW / 2, -cardH / 2 + cornerSize);
            ctx.lineTo(-cardW / 2, -cardH / 2);
            ctx.lineTo(-cardW / 2 + cornerSize, -cardH / 2);
            ctx.stroke();

            // Top-right
            ctx.beginPath();
            ctx.moveTo(cardW / 2 - cornerSize, -cardH / 2);
            ctx.lineTo(cardW / 2, -cardH / 2);
            ctx.lineTo(cardW / 2, -cardH / 2 + cornerSize);
            ctx.stroke();

            // Bottom-right
            ctx.beginPath();
            ctx.moveTo(cardW / 2, cardH / 2 - cornerSize);
            ctx.lineTo(cardW / 2, cardH / 2);
            ctx.lineTo(cardW / 2 - cornerSize, cardH / 2);
            ctx.stroke();

            // Bottom-left
            ctx.beginPath();
            ctx.moveTo(-cardW / 2 + cornerSize, cardH / 2);
            ctx.lineTo(-cardW / 2, cardH / 2);
            ctx.lineTo(-cardW / 2, cardH / 2 - cornerSize);
            ctx.stroke();

            ctx.restore();

            // 3. Text and Content
            ctx.save();
            ctx.globalAlpha = fade;
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 10;

            // Occasion Title
            const occasionTitle = wishData?.greetingTitle || `Happy ${(wishData?.occasion || 'celebration').charAt(0).toUpperCase() + (wishData?.occasion || 'celebration').slice(1)}!`;
            ctx.font = `bold ${size * 0.1}px 'Playfair Display', serif`;

            // Add gold gradient to text
            const textGrad = ctx.createLinearGradient(0, size * 0.2, 0, size * 0.3);
            textGrad.addColorStop(0, '#ffffff');
            textGrad.addColorStop(0.5, '#fef3c7'); // Light gold
            textGrad.addColorStop(1, '#fcd34d'); // Gold
            ctx.fillStyle = textGrad;
            ctx.fillText(occasionTitle, size / 2, size * 0.28);

            // Elegant Separator
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(size * 0.3, size * 0.33);
            ctx.lineTo(size * 0.7, size * 0.33);
            ctx.stroke();

            // Recipient Name
            ctx.fillStyle = '#ffffff';
            ctx.font = `italic ${size * 0.05}px 'Playfair Display', serif`;
            ctx.fillText(`For ${wishData?.recipientName || 'You'}`, size / 2, size * 0.39);

            // Wish Message
            ctx.font = `${size * 0.035}px 'Inter', sans-serif`;
            const message = wishData?.message || 'A special wish for you';
            const words = message.split(' ');
            let line = '';
            let y = size * 0.52;
            const maxWidth = size * 0.7;
            const lineHeight = size * 0.055;

            ctx.shadowBlur = 4; // Reduced shadow for body text

            // Word Wrap Logic
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && n > 0) {
                    ctx.fillText(line, size / 2, y);
                    line = words[n] + ' ';
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, size / 2, y);

            // Date
            ctx.font = `${size * 0.025}px 'Inter', sans-serif`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillText(wishData?.date || '', size / 2, size * 0.78);

            // Sender
            if (wishData?.senderName) {
                ctx.font = `italic bold ${size * 0.03}px 'Playfair Display', serif`;
                ctx.fillStyle = '#ffffff';
                ctx.fillText(`— Warmly, ${wishData.senderName}`, size / 2, size * 0.85);
            }

            // Simple Branding
            ctx.fillStyle = 'rgba(102, 126, 234, 0.9)';
            ctx.font = `${size * 0.022}px 'Inter', sans-serif`;
            ctx.fillText('wishyfi.com', size / 2, size * 0.93);

            // Sparkle Particles (Deterministic)
            const sparkleCount = 25;
            for (let i = 0; i < sparkleCount; i++) {
                const seed = i * 492;
                const sx = (seed % (size * 0.9)) + size * 0.05;
                const sy = ((seed * 3) % (size * 0.9)) + size * 0.05;

                const sparkleSize = (Math.sin(p * 5 + i) + 1) * 3 + 2;
                const opacity = (Math.sin(p * 3 + i * 2) + 1) / 2 * 0.8;

                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'white';

                // Draw Diamond Sparkle
                ctx.beginPath();
                ctx.moveTo(sx, sy - sparkleSize);
                ctx.lineTo(sx + sparkleSize / 2, sy);
                ctx.lineTo(sx, sy + sparkleSize);
                ctx.lineTo(sx - sparkleSize / 2, sy);
                ctx.fill();
            }

            ctx.restore();
        }

        // Interactive effects removed for simplicity

    }, [displaySquare, magicConstant, startX, startY, cellSize, gridSize, drawGrid, highlightColor, bgColor, wishData, bgImage]);



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

    const [giftOpening, setGiftOpening] = useState(false);

    const handleOpenGift = () => {
        setGiftOpening(true);
        setTimeout(() => {
            setShowGift(false);
            setGiftOpening(false);
        }, 800);
    };


    const handleGenerateVideo = async () => {
        if (!videoSupported) {
            alert('Video recording is not supported in your browser. Please try a modern browser like Chrome or Firefox.');
            return;
        }

        setIsGeneratingVideo(true);
        setVideoProgress(0);

        try {
            console.log('Starting video generation...');

            // Video settings for 20 seconds
            const videoFrames = totalFrames; // Use the same totalFrames as animation
            const fps = 30;

            console.log(`Generating ${videoFrames} frames at ${fps}fps (Total: ${videoFrames / fps}s)`);

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

    // Helper to generate shareable link
    const getShareUrl = useCallback(() => {
        if (!wishData) return `${window.location.origin}/create`;

        try {
            const json = JSON.stringify(wishData);
            // safe base64 encoding for utf8 as used in SharedWish.jsx
            const binary = encodeURIComponent(json).replace(/%([0-9A-F]{2})/g,
                function (match, p1) {
                    return String.fromCharCode('0x' + p1);
                });
            const shareId = btoa(binary);
            return `${window.location.origin}/share/${shareId}`;
        } catch (e) {
            console.error("Error generating share url", e);
            return `${window.location.origin}/create`;
        }
    }, [wishData]);

    // Video sharing functions
    const handleShareVideo = async () => {
        let currentBlob = videoBlob;

        // Generate video first if not available
        if (!currentBlob) {
            currentBlob = await handleGenerateVideo();
            if (!currentBlob) {
                alert('Failed to generate video. Please try again.');
                return;
            }
        }

        setIsSharing(true);
        try {
            const shareUrl = getShareUrl();
            const linkMessage = `✨ A magical wish created with Ramanujan's mathematics! Watch it here: ${shareUrl}`;

            const shared = await shareGifFile(currentBlob, wishData, linkMessage, shareUrl);

            if (!shared) {
                // Native sharing not supported - show manual sharing options
                setShowManualShare(true);
            }
        } catch (error) {
            console.error('Share failed:', error);
            setShowManualShare(true);
        } finally {
            setIsSharing(false);
        }
    };

    // Direct app sharing functions
    const shareToWhatsApp = () => {
        const shareUrl = getShareUrl();
        const message = `✨ Check out this magical wish created with Ramanujan's mathematics! ${shareUrl}`;
        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const shareToTelegram = () => {
        const shareUrl = getShareUrl();
        const message = `✨ Check out this magical wish created with Ramanujan's mathematics!`;
        const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const shareToTwitter = () => {
        const shareUrl = getShareUrl();
        const message = `✨ Amazing magical wish created with Ramanujan's mathematics!`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank');
    };

    const shareToFacebook = () => {
        const shareUrl = getShareUrl();
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank');
    };

    // Copy shareable link
    const handleCopyLink = async () => {
        const link = getShareUrl();
        try {
            await navigator.clipboard.writeText(link);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch {
            alert('Could not copy link. Link: ' + link);
        }
    };



    return (
        <>
            {/* Handle the early return cases with conditional rendering */}
            {!wishData && !isSharedView && null}
            {wishData && !dateStr && <div>No date provided</div>}

            {/* Main component content */}
            <div className="animation-page page">
                <div className="animation-container">
                    <div className="canvas-wrapper cinematic-border">
                        <canvas ref={canvasRef} width={size} height={size} />

                        {/* --- GIFT OVERLAY --- */}
                        {showGift && (
                            <div className={`gift-overlay${giftOpening ? ' opening' : ''}`} onClick={handleOpenGift}>
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
                                {/* Quick Actions */}
                                <div className="quick-actions mb-lg">
                                    <h3 className="section-title text-center mb-md">🎉 Share Your Magic Wish</h3>

                                    <div className="action-row mb-md">
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
                                            {linkCopied ? '✅ Link Copied!' : '🔗 Copy Link'}
                                        </button>
                                    </div>

                                    <button
                                        className="btn btn-primary btn-large shadow-glow"
                                        onClick={handleShareVideo}
                                        disabled={isGeneratingVideo || isSharing}
                                        title="Share Video + Link to WhatsApp, Telegram, etc."
                                    >
                                        <span className="btn-icon">📤</span>
                                        <span className="btn-text">
                                            {isGeneratingVideo ? '⏳ Creating Video...' : isSharing ? '📤 Sharing...' : '📤 Share to WhatsApp & More'}
                                        </span>
                                    </button>
                                </div>

                                <div className="export-options mb-lg">
                                    <h4 className="section-title text-center mb-md">📥 Save Your Magic</h4>
                                    <p className="helper-text text-center mb-md">
                                        Download your magical wish as a high-quality video!
                                    </p>

                                    <div className="export-buttons">
                                        <button
                                            className="btn btn-download btn-large"
                                            onClick={handleGenerateVideo}
                                            disabled={isGeneratingVideo}
                                            title="Download as MP4 video - High quality for memories"
                                        >
                                            <span className="btn-icon">🎬</span>
                                            <div className="btn-content">
                                                <span className="btn-text">{isGeneratingVideo ? 'Creating...' : 'Download Video'}</span>
                                                <span className="btn-subtitle">High Quality MP4 Video</span>
                                            </div>
                                        </button>
                                    </div>

                                    {!videoSupported && (
                                        <div className="browser-info mt-md">
                                            <p className="text-sm text-secondary">
                                                💡 <strong>Video export:</strong> Requires a modern browser (Chrome, Firefox, Safari, Edge)
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Download buttons after generation */}
                                {videoBlob && !isGeneratingVideo && (
                                    <div className="download-ready-section mb-lg fade-in">
                                        <div className="success-header text-center mb-md">
                                            <h4 className="success-title">✨ Your Magic is Ready! ✨</h4>
                                            <p className="success-subtitle">Your magical wish has been created successfully!</p>
                                        </div>

                                        <div className="download-buttons-row mb-md">
                                            <button onClick={handleDownloadVideo} className="btn btn-success btn-large">
                                                <span className="btn-icon">📥</span>
                                                <span className="btn-text">Download Video</span>
                                            </button>
                                        </div>

                                        <button
                                            onClick={handleShareVideo}
                                            className="btn btn-primary btn-large shadow-glow"
                                            disabled={isSharing}
                                        >
                                            <span className="btn-icon">📱</span>
                                            <span className="btn-text">{isSharing ? 'Sharing...' : 'Share to Apps'}</span>
                                        </button>
                                    </div>
                                )}

                                {/* Manual Share Options Modal */}
                                {showManualShare && (
                                    <div className="manual-share-modal">
                                        <div className="modal-overlay" onClick={() => setShowManualShare(false)}></div>
                                        <div className="modal-content">
                                            <h4>📤 Share Your Magic Wish</h4>
                                            <p>Choose your preferred app to share:</p>

                                            <div className="share-buttons">
                                                <button onClick={shareToWhatsApp} className="share-btn whatsapp">
                                                    <span>📱</span> WhatsApp
                                                </button>
                                                <button onClick={shareToTelegram} className="share-btn telegram">
                                                    <span>✈️</span> Telegram
                                                </button>
                                                <button onClick={shareToTwitter} className="share-btn twitter">
                                                    <span>🐦</span> Twitter
                                                </button>
                                                <button onClick={shareToFacebook} className="share-btn facebook">
                                                    <span>🔵</span> Facebook
                                                </button>
                                            </div>

                                            <p className="share-note">
                                                📝 Note: Download the video first, then share the file along with the link!
                                            </p>

                                            <button
                                                onClick={() => setShowManualShare(false)}
                                                className="btn btn-secondary"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Progress Bars */}
                                {isGeneratingVideo && (
                                    <div className="mb-md">
                                        <ProgressBar progress={videoProgress} label="Creating your magical video..." />
                                    </div>
                                )}

                                {/* Success Preview */}
                                {videoBlob && (
                                    <div className="export-preview-section mb-lg fade-in">
                                        <h4 className="preview-title text-center mb-md">🎉 Your Magical Creation</h4>
                                        <div className="export-preview-box mb-md">
                                            <VideoPreview blob={videoBlob} />
                                        </div>

                                        <div className="share-tips text-center">
                                            <p className="tip-text mb-sm">
                                                {shareSupport?.isSupported
                                                    ? "🎯 Perfect! Your device supports direct sharing to WhatsApp, Instagram, and more!"
                                                    : "💡 Tip: Download the file and share it manually from your gallery"}
                                            </p>
                                            <p className="tip-text">
                                                ⭐ Don't forget to tag <strong>@wishyfi</strong> when sharing on social media!
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- SHARED VIEW ACTIONS --- */}
                        {isSharedView && (
                            <div className="shared-view-actions fade-in mt-xl">
                                <div className="shared-view-content text-center">
                                    <h3 className="shared-view-title mb-md">✨ Loved This Magic Wish?</h3>
                                    <p className="shared-view-subtitle mb-lg">
                                        Create your own personalized magical wishes with special dates, names, and messages!
                                    </p>
                                    <button className="btn btn-primary btn-large shadow-glow" onClick={handleCreateAnother}>
                                        <span className="btn-icon">🎉</span>
                                        <span className="btn-text">Create Your Own Magic Wish ✨</span>
                                    </button>
                                    <p className="create-tip mt-md">
                                        🎁 Perfect for birthdays, anniversaries, and special occasions!
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </>
    );
};

export default MagicSquareAnimation;

