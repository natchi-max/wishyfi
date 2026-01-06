import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateDateEchoSquare, parseDateComponents } from '../utils/magicSquare';
import { createAnimatedGif, downloadBlob } from '../utils/gifGenerator';
import { ProgressBar } from './LoadingComponents';
import './RamanujanXAnimation.css';

const RamanujanXAnimation = ({
    birthday: propBirthday,
    initialXColor: propXColor,
    initialBgColor: propBgColor,
    duration = 6,
    width = 800,
    height = 800
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Resolve data from props or navigation state
    const wishData = location.state?.wishData;
    const birthday = propBirthday || wishData?.date || "22/12/1887";
    const initialXColor = propXColor || wishData?.colorHighlight || '#00f2ff';
    const initialBgColor = propBgColor || wishData?.colorBg || '#050505';

    const canvasRef = useRef(null);
    const [isGeneratingGif, setIsGeneratingGif] = useState(false);
    const [gifProgress, setGifProgress] = useState(0);
    const [shareableLink, setShareableLink] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);

    // UI State
    const [xColor, setXColor] = useState(initialXColor);
    const [bgColor, setBgColor] = useState(initialBgColor);
    const [inputBirthday, setInputBirthday] = useState(birthday);

    // Sync with navigation state if it changes
    useEffect(() => {
        if (wishData) {
            setXColor(wishData.colorHighlight);
            setBgColor(wishData.colorBg);
            setInputBirthday(wishData.date);
        }
    }, [wishData]);

    // Particle/Cracker state
    const crackersRef = useRef([]);

    // Magic Square Data
    const squareData = useMemo(() => {
        try {
            const { DD, MM, CC, YY } = parseDateComponents(inputBirthday);
            return generateDateEchoSquare(DD, MM, CC, YY);
        } catch (e) {
            const { DD, MM, CC, YY } = parseDateComponents("22/12/1887");
            return generateDateEchoSquare(DD, MM, CC, YY);
        }
    }, [inputBirthday]);

    // Generate share link
    useEffect(() => {
        const dataToEncode = wishData || {
            date: inputBirthday,
            colorHighlight: xColor,
            colorBg: bgColor,
            animationStyle: 'cinematic',
            recipientName: 'Someone Special',
            occasion: 'celebration'
        };

        // Safe UTF-8 Base64 Encoding
        const json = JSON.stringify(dataToEncode);
        const encoded = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode('0x' + p1);
        }));

        setShareableLink(`${window.location.origin}/share/${encoded}`);
    }, [inputBirthday, xColor, bgColor, wishData]);

    const handleBack = () => {
        navigate('/create', { state: { wishData: { ...wishData, date: inputBirthday, colorHighlight: xColor, colorBg: bgColor, animationStyle: 'cinematic' } } });
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareableLink);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (e) {
            alert('Link: ' + shareableLink);
        }
    };

    const triggerCracker = (x, y) => {
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 2 + Math.random() * 8;
            const hue = Math.random() * 360;
            crackersRef.current.push({
                x, y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                life: 1.0,
                r: Math.random() * 3 + 1,
                color: `hsl(${hue}, 100%, 60%)`
            });
        }
    };

    const updateCrackers = (ctx) => {
        for (let i = crackersRef.current.length - 1; i >= 0; i--) {
            const p = crackersRef.current[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.15; // gravity
            p.life -= 0.02;
            if (p.life <= 0) {
                crackersRef.current.splice(i, 1);
            } else {
                ctx.save();
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
    };

    const renderFrame = (ctx, p) => {
        // Clear background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        // Subtle radial gradient
        const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2 * 1.5);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.03)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        const gridSize = Math.min(width, height) * 0.7;
        const cellSize = gridSize / 4;
        const startX = (width - gridSize) / 2;
        const startY = (height - gridSize) / 2;

        // Draw Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(startX, startY, gridSize, gridSize);

        // PHASES (6s base duration)
        // Phase 1 (0.0 - 0.4): Row 2, 3, 4 Reveal
        // Phase 2 (0.4 - 0.7): X-Highlight & Tracing
        // Phase 3 (0.7 - 0.95): Row 1 Reveal + Fireworks
        // Phase 4 (0.95 - 1.0): Fade out

        const isXPhase = p >= 0.4 && p < 1.0;
        const isSurprisePhase = p >= 0.7 && p < 1.0;
        const isCrackerPhase = p >= 0.7 && p < 0.95;

        // Auto trigger crackers
        if (isCrackerPhase && Math.random() < 0.2) {
            triggerCracker(Math.random() * width, Math.random() * height * 0.7);
        }

        ctx.font = `300 ${cellSize * 0.35}px 'Outfit', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        squareData.square.forEach((row, ri) => {
            row.forEach((num, ci) => {
                const cx = startX + ci * cellSize + cellSize / 2;
                const cy = startY + ri * cellSize + cellSize / 2;

                let cellOpacity = 0;

                if (ri === 0) {
                    if (isSurprisePhase) cellOpacity = Math.max(0, Math.min(1, (p - 0.7) / 0.1));
                } else {
                    const order = ri - 1;
                    if (p < 0.4) {
                        const phase1P = p / 0.4;
                        cellOpacity = Math.max(0, Math.min(1, (phase1P * 3 - order)));
                    } else if (p < 1.0) {
                        cellOpacity = 1.0;
                    }
                }

                if (p > 0.95) cellOpacity *= (1 - (p - 0.95) / 0.05);

                const isD1 = ri === ci;
                const isD2 = ri + ci === 3;
                let isHighlighted = false;
                let highlightLevel = 0;

                if (isXPhase && (isD1 || isD2)) {
                    isHighlighted = true;
                    if (p < 0.6) highlightLevel = (p - 0.4) / 0.2;
                    else if (p < 0.9) highlightLevel = 1.0;
                    else highlightLevel = 1.0 - (p - 0.9) / 0.1;
                }

                if (cellOpacity > 0) {
                    ctx.save();
                    if (isHighlighted) {
                        ctx.shadowBlur = 15 * highlightLevel;
                        ctx.shadowColor = xColor;
                        ctx.fillStyle = xColor;
                        ctx.globalAlpha = cellOpacity * (0.4 + 0.6 * highlightLevel);
                        ctx.globalAlpha = 0.1 * highlightLevel;
                        ctx.fillRect(startX + ci * cellSize + 2, startY + ri * cellSize + 2, cellSize - 4, cellSize - 4);
                        ctx.globalAlpha = cellOpacity * (0.4 + 0.6 * highlightLevel);
                    } else {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                        ctx.globalAlpha = cellOpacity;
                    }
                    ctx.fillText(num, cx, cy);
                    ctx.restore();
                }
            });
        });

        if (p >= 0.4 && p < 1.0) {
            const traceP = Math.min(1, (p - 0.4) / 0.25);
            const fadeP = p > 0.85 ? Math.max(0, 1 - (p - 0.85) / 0.1) : 1.0;

            ctx.save();
            ctx.globalAlpha = fadeP;
            ctx.shadowBlur = 20;
            ctx.shadowColor = xColor;
            ctx.strokeStyle = xColor;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';

            const corners = [
                { x: startX, y: startY }, { x: startX + gridSize, y: startY + gridSize },
                { x: startX + gridSize, y: startY }, { x: startX, y: startY + gridSize }
            ];

            const drawTrace = (s, e, prog) => {
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(s.x + (e.x - s.x) * prog, s.y + (e.y - s.y) * prog);
                ctx.stroke();
            };

            if (traceP < 0.5) {
                const subP = traceP * 2;
                const center = { x: width / 2, y: height / 2 };
                drawTrace(corners[0], center, subP);
                drawTrace(corners[1], center, subP);
                drawTrace(corners[2], center, subP);
                drawTrace(corners[3], center, subP);
            } else {
                drawTrace(corners[0], corners[1], 1);
                drawTrace(corners[2], corners[3], 1);

                if (p >= 0.525 && p < 0.7) {
                    const localP = (p - 0.525) / 0.175;
                    const scale = 1 + Math.sin(localP * Math.PI) * 0.5;
                    ctx.save();
                    ctx.globalAlpha = Math.sin(localP * Math.PI) * 0.8;
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.arc(width / 2, height / 2, 10 * scale, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
            ctx.restore();
        }

        updateCrackers(ctx);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let anim;

        const loop = (time) => {
            const p = (time / 1000 % duration) / duration;
            if (p < 0.05) crackersRef.current = []; // Clean start
            renderFrame(ctx, p);
            anim = requestAnimationFrame(loop);
        };

        anim = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(anim);
    }, [duration, xColor, bgColor, squareData]);

    const handleExportGif = async () => {
        setIsGeneratingGif(true);
        setGifProgress(0);
        try {
            const frames = 120;
            const fps = 20;
            const delay = 1000 / fps;

            const blob = await createAnimatedGif(
                (ctx, i, total) => renderFrame(ctx, i / total),
                width,
                height,
                frames,
                delay,
                (p) => setGifProgress(p)
            );

            downloadBlob(blob, `magic-x-${inputBirthday.replace(/\//g, '-')}.gif`);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGeneratingGif(false);
        }
    };

    return (
        <div className="ramanujan-x-container">
            <div className="animation-wrapper cinematic-border">
                <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    className="ramanujan-canvas"
                />
            </div>

            <div className="controls-panel card">
                <h3>Cinematic X Explorer</h3>

                <div className="control-group">
                    <label>📅 Special Date</label>
                    <input
                        type="text"
                        placeholder="DD/MM/YYYY"
                        value={inputBirthday}
                        onChange={(e) => setInputBirthday(e.target.value)}
                    />
                </div>

                <div className="control-group row-flex">
                    <div className="color-item">
                        <label>✨ Highlight</label>
                        <input type="color" value={xColor} onChange={(e) => setXColor(e.target.value)} />
                    </div>
                    <div className="color-item">
                        <label>🌑 Background</label>
                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                    </div>
                </div>

                <div className="actions-stack">
                    <button className="btn btn-secondary" onClick={handleBack}>
                        ✏️ Edit Wish
                    </button>

                    <button className="btn btn-primary" onClick={handleCopyLink}>
                        {linkCopied ? '✓ Copied!' : '📤 Copy Share Link'}
                    </button>

                    <button
                        className="btn btn-success"
                        onClick={handleExportGif}
                        disabled={isGeneratingGif}
                    >
                        {isGeneratingGif ? 'Generating...' : '📥 Download GIF'}
                    </button>
                </div>

                {isGeneratingGif && (
                    <div className="mt-md">
                        <ProgressBar progress={gifProgress} label="Capturing magic frames..." />
                    </div>
                )}
            </div>
        </div>
    );
};

export default RamanujanXAnimation;
