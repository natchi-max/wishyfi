import React, { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import { createAnimatedGif, downloadBlob } from '../utils/gifGenerator';
import './CinematicXAnimation.css';

const CinematicXAnimation = ({
    initialPrimaryColor = '#00f2ff',
    initialSecondaryColor = '#ff00ea',
    initialLineThickness = 4,
    initialShowParticles = true,
    initialDuration = 4, // seconds
    width = 800,
    height = 800
}) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [isGeneratingGif, setIsGeneratingGif] = useState(false);
    const [isRecordingMp4, setIsRecordingMp4] = useState(false);

    // UI State
    const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor);
    const [secondaryColor, setSecondaryColor] = useState(initialSecondaryColor);
    const [lineThickness, setLineThickness] = useState(initialLineThickness);
    const [showParticles, setShowParticles] = useState(initialShowParticles);
    const [duration, setDuration] = useState(initialDuration);

    // Animation state
    const state = useRef({
        progress: 0,
        particles: [],
        lastUpdateTime: 0
    });

    const particlesRef = useRef([]);

    // Initialize particles
    const createParticle = (x, y, color) => ({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1.0,
        color,
        size: Math.random() * 3 + 1
    });

    const updateParticles = (ctx, head1, head2) => {
        if (!showParticles) {
            particlesRef.current = [];
            return;
        }

        // Add particles at heads
        if (state.current.progress > 0.05 && state.current.progress < 0.95) {
            for (let i = 0; i < 3; i++) {
                particlesRef.current.push(createParticle(head1.x, head1.y, primaryColor));
                particlesRef.current.push(createParticle(head2.x, head2.y, secondaryColor));
            }
        }

        // Update and draw particles
        ctx.save();
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const p = particlesRef.current[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.98; // Friction
            p.vy *= 0.98;
            p.life -= 0.02;

            if (p.life <= 0) {
                particlesRef.current.splice(i, 1);
            } else {
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.shadowBlur = 5;
                ctx.shadowColor = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    };

    const renderFrame = (ctx, t, totalT = 1) => {
        const p = t / totalT;
        // Easing: ease-in-out quint
        const easedP = p < 0.5
            ? 16 * p * p * p * p * p
            : 1 - Math.pow(-2 * p + 2, 5) / 2;

        // Clear
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, width, height);

        // Background subtle gradient
        const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
        bgGrad.addColorStop(0, '#0a0a0f');
        bgGrad.addColorStop(1, '#050505');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Grid lines (subtle)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= width; x += width / 10) {
            ctx.moveTo(x, 0); ctx.lineTo(x, height);
        }
        for (let y = 0; y <= height; y += height / 10) {
            ctx.moveTo(0, y); ctx.lineTo(width, y);
        }
        ctx.stroke();

        // Line 1: Top-left to Bottom-right
        const x1_start = 50, y1_start = 50;
        const x1_end = width - 50, y1_end = height - 50;
        const x1_current = x1_start + (x1_end - x1_start) * easedP;
        const y1_current = y1_start + (y1_end - y1_start) * easedP;

        // Line 2: Top-right to Bottom-left
        const x2_start = width - 50, y2_start = 50;
        const x2_end = 50, y2_end = height - 50;
        const x2_current = x2_start + (x2_end - x2_start) * easedP;
        const y2_current = y2_start + (y2_end - y2_start) * easedP;

        // Glow effect
        ctx.shadowBlur = 15;
        ctx.lineWidth = lineThickness;
        ctx.lineCap = 'round';

        // Draw Line 1
        ctx.shadowColor = primaryColor;
        ctx.strokeStyle = primaryColor;
        ctx.beginPath();
        ctx.moveTo(x1_start, y1_start);
        ctx.lineTo(x1_current, y1_current);
        ctx.stroke();

        // Draw Line 2
        ctx.shadowColor = secondaryColor;
        ctx.strokeStyle = secondaryColor;
        ctx.beginPath();
        ctx.moveTo(x2_start, y2_start);
        ctx.lineTo(x2_current, y2_current);
        ctx.stroke();

        // Intersection Glow (Center is at 0.5)
        const intersectionDist = Math.abs(easedP - 0.5);
        if (intersectionDist < 0.15) {
            const intensity = (0.15 - intersectionDist) / 0.15;
            ctx.shadowBlur = 40 * intensity;
            ctx.shadowColor = '#ffffff';
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = intensity;
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, lineThickness * 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Outer glow ring
            ctx.strokeStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, lineThickness * (4 + intensity * 10), 0, Math.PI * 2);
            ctx.stroke();

            ctx.globalAlpha = 1.0;
        }

        updateParticles(ctx, { x: x1_current, y: y1_current }, { x: x2_current, y: y2_current });
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let anim;

        const loop = (time) => {
            const elapsed = (time / 1000) % duration;
            const p = elapsed / duration;
            state.current.progress = p;
            renderFrame(ctx, p, 1);
            anim = requestAnimationFrame(loop);
        };

        anim = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(anim);
    }, [duration, primaryColor, secondaryColor, lineThickness, showParticles, width, height]);

    const handleExportGif = async () => {
        setIsGeneratingGif(true);
        // Clear particles for a clean start
        particlesRef.current = [];

        try {
            const frames = 60;
            const fps = 20; // 20 fps for 3 seconds = 60 frames
            const delay = 1000 / fps;

            const blob = await createAnimatedGif(
                (ctx, frameIndex, totalFrames) => {
                    renderFrame(ctx, frameIndex, totalFrames);
                },
                width,
                height,
                frames,
                delay,
                (p) => console.log(`Export progress: ${p}%`)
            );

            downloadBlob(blob, 'cinematic-x.gif');
        } catch (error) {
            console.error('GIF Export failed:', error);
            alert('GIF export failed. Check console for details.');
        } finally {
            setIsGeneratingGif(false);
        }
    };

    const handleRecordMp4 = () => {
        setIsRecordingMp4(true);
        const canvas = canvasRef.current;
        const stream = canvas.captureStream(60); // 60 FPS
        const recorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: 5000000 // 5Mbps high quality
        });

        const chunks = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cinematic-x.webm';
            a.click();
            setIsRecordingMp4(false);
        };

        // Record for exactly one loop
        recorder.start();
        setTimeout(() => {
            recorder.stop();
        }, duration * 1000);
    };

    return (
        <div className="cinematic-x-container" ref={containerRef}>
            <div className="animation-wrapper">
                <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    className="cinematic-canvas"
                />
            </div>

            <div className="controls-panel">
                <h3>Cinematic X Editor</h3>

                <div className="control-group">
                    <label>Primary Color</label>
                    <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                    />
                </div>

                <div className="control-group">
                    <label>Secondary Color</label>
                    <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                    />
                </div>

                <div className="control-group">
                    <label>Line Thickness ({lineThickness}px)</label>
                    <input
                        type="range"
                        min="1" max="25"
                        value={lineThickness}
                        onChange={(e) => setLineThickness(parseInt(e.target.value))}
                    />
                </div>

                <div className="control-group">
                    <label>Cycle Duration ({duration}s)</label>
                    <input
                        type="range"
                        min="1" max="10"
                        value={duration}
                        onChange={(e) => setDuration(parseFloat(e.target.value))}
                        step="0.5"
                    />
                </div>

                <div className="control-group">
                    <label>Light Particles</label>
                    <input
                        type="checkbox"
                        checked={showParticles}
                        onChange={(e) => setShowParticles(e.target.checked)}
                    />
                </div>

                <div className="button-group">
                    <button
                        className="export-button gif"
                        onClick={handleExportGif}
                        disabled={isGeneratingGif || isRecordingMp4}
                    >
                        {isGeneratingGif ? 'Generating GIF...' : 'Export GIF'}
                    </button>
                    <button
                        className="export-button mp4"
                        onClick={handleRecordMp4}
                        disabled={isGeneratingGif || isRecordingMp4}
                    >
                        {isRecordingMp4 ? 'Recording...' : 'Record MP4 (WebM)'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CinematicXAnimation;
