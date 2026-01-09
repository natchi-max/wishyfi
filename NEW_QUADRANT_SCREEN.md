// NEW SCREEN TO ADD: Quadrants (each 2×2 block sums to magic constant)
// Insert after Screen 3 (diagonals) at line 407

        // ═══════════════════ SCREEN 3.5: QUADRANTS (0.42 - 0.54) ═══════════════════
        else if (progress >= 0.42 && progress < 0.54) {
            const p = (progress - 0.42) / 0.12;
            const fade = smoothFade(p, 0.2, 0.85);

            drawGrid(ctx, 1);

            // Define 2x2 quadrants (4 blocks)
            const quadrantColors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a855f7'];
            
            // Draw each 2x2 quadrant with sequential animation
            for (let qi = 0; qi < 4; qi++) {
                const qRow = Math.floor(qi / 2);
                const qCol = qi % 2;
                const quadDelay = qi * 0.2;
                const quadProgress = Math.max(0, Math.min(1, (p - quadDelay) / 0.25));

                if (quadProgress > 0) {
                    const quadFade = smoothFade(quadProgress, 0.2, 0.8);
                    
                    // Draw background for this quadrant
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

                    // Draw cells in this quadrant
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

// THEN UPDATE ALL SUBSEQUENT SCREENS:
// Screen 4 (Secret Recipe): Change from (0.42 - 0.56) to (0.54 - 0.68)
// Screen 5 (Rows): Change from (0.56 - 0.70) to (0.68 - 0.82)  
// Screen 6 (Row Emphasis): Remove or adjust timing
// Screen 7 (Final): Adjust start time accordingly
