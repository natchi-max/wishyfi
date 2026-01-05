/**
 * GIF Generator - Creates animated GIFs from canvas frames
 */

import GIF from 'gif.js';

/**
 * Create an animated GIF from a render function
 * @param {Function} renderFrame - Function that renders frame (ctx, frameIndex, totalFrames)
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} totalFrames - Number of frames to generate
 * @param {number} delay - Delay between frames in ms
 * @param {Function} onProgress - Optional progress callback (0-100)
 * @returns {Promise<Blob>}
 */
export async function createAnimatedGif(renderFrame, width, height, totalFrames, delay = 50, onProgress = null) {
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });

            if (!ctx) {
                reject(new Error('Could not create canvas context'));
                return;
            }

            const gif = new GIF({
                workers: 2,
                quality: 10, // Lower = better quality (1-30)
                width,
                height,
                workerScript: '/gif.worker.js',
                debug: false,
                transparent: null,
                background: '#000000',
                repeat: 0, // 0 = loop forever
                dither: false // Disable dithering for better quality
            });

            let frameCount = 0;
            let renderingComplete = false;

            // Render and capture each frame
            for (let i = 0; i < totalFrames; i++) {
                try {
                    // Clear canvas with black background
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, width, height);

                    // Render the frame
                    renderFrame(ctx, i, totalFrames);

                    // Add frame to GIF with proper delay
                    gif.addFrame(ctx, {
                        delay: delay,
                        copy: true,
                        dispose: 1 // Keep frame (safer for most GIF viewers)
                    });

                    frameCount++;

                    // Report progress for frame rendering (70% of total progress)
                    if (onProgress) {
                        onProgress(Math.round((frameCount / totalFrames) * 70));
                    }
                } catch (frameError) {
                    console.warn(`Error rendering frame ${i}:`, frameError);
                }
            }

            if (frameCount === 0) {
                reject(new Error('No frames were successfully rendered'));
                return;
            }

            console.log(`Successfully rendered ${frameCount} frames for GIF`);

            // Handle GIF encoding progress
            gif.on('progress', (p) => {
                console.log(`GIF encoding progress: ${Math.round(p * 100)}%`);
                if (onProgress) {
                    onProgress(70 + Math.round(p * 30)); // 70-100%
                }
            });

            gif.on('finished', (blob) => {
                renderingComplete = true;

                if (onProgress) onProgress(100);

                // Validate the blob
                if (!blob || blob.size === 0) {
                    console.error('Generated GIF blob is empty');
                    reject(new Error('Generated GIF is empty'));
                    return;
                }

                console.log(`GIF generated successfully: ${blob.size} bytes, type: ${blob.type}`);

                // Ensure the blob is definitely typed as image/gif
                const finalBlob = blob.type === 'image/gif' ? blob : new Blob([blob], { type: 'image/gif' });
                resolve(finalBlob);
            });

            gif.on('error', (error) => {
                console.error('GIF encoding error:', error);
                reject(new Error(`GIF encoding failed: ${error.message || error}`));
            });

            // Timeout safety (increased for larger GIFs)
            const renderTimeout = setTimeout(() => {
                if (!renderingComplete) {
                    reject(new Error('GIF generation timed out after 90 seconds'));
                }
            }, 90000); // 90 second timeout

            gif.on('finished', () => {
                clearTimeout(renderTimeout);
            });

            gif.on('error', () => {
                clearTimeout(renderTimeout);
            });

            // Start rendering
            console.log('Starting GIF rendering...');
            gif.render();

        } catch (error) {
            console.error('GIF generation setup error:', error);
            reject(new Error(`GIF generation failed: ${error.message || error}`));
        }
    });
}

/**
 * Download a blob as a file with proper MIME type
 * @param {Blob} blob - The blob to download
 * @param {string} filename - The filename for download
 * @returns {boolean} - Success status
 */
export function downloadBlob(blob, filename) {
    try {
        // Ensure we're working with a GIF blob
        const finalBlob = blob.type === 'image/gif' ? blob : new Blob([blob], { type: 'image/gif' });

        // Create blob URL
        const blobUrl = URL.createObjectURL(finalBlob);

        const link = document.createElement('a');
        link.href = blobUrl;

        // Sanitize and ensure .gif extension
        const cleanFilename = filename.replace(/[^a-z0-9_.-]/gi, '_');
        link.download = cleanFilename.endsWith('.gif') ? cleanFilename : cleanFilename + '.gif';

        // Standard attributes
        link.style.display = 'none';
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener');

        // Add to DOM temporarily
        document.body.appendChild(link);

        // Trigger download
        link.click();

        // Clean up after delay
        setTimeout(() => {
            if (link.parentNode) {
                document.body.removeChild(link);
            }
            URL.revokeObjectURL(blobUrl);
        }, 1000);

        console.log(`Download initiated: ${filename} (${blob.size} bytes)`);
        return true;

    } catch (error) {
        console.error('Download error:', error);
        return false;
    }
}

/**
 * Alternative: Save canvas as WebP (fallback if GIF fails)
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {string} filename - The filename for download
 */
export function downloadCanvasAsImage(canvas, filename) {
    try {
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename.replace('.gif', '.png');
        link.style.cssText = 'position:fixed;left:-9999px;opacity:0;';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => document.body.removeChild(link), 500);
        return true;
    } catch (error) {
        console.error('Canvas download error:', error);
        return false;
    }
}
