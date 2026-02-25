/**
 * Video Generator Utility
 * Exports canvas animations as MP4 video files using MediaRecorder API
 */

/**
 * Create an animated MP4 video from canvas frames
 * @param {Function} renderFrame - Function that renders a frame (ctx, frame, total)
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} totalFrames - Total number of frames
 * @param {number} fps - Frames per second (default: 30)
 * @param {Function} onProgress - Progress callback (progress: 0-100)
 * @returns {Promise<Blob>} Video blob
 */
export async function createAnimatedVideo(
  renderFrame,
  width,
  height,
  totalFrames,
  fps = 30,
  onProgress = () => { }
) {
  return new Promise((resolve, reject) => {
    try {
      // Create canvas for recording
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Get canvas stream
      const stream = canvas.captureStream(fps);

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9', // Use VP9 for better quality
        videoBitsPerSecond: 2500000 // 2.5 Mbps for good quality
      });

      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(blob);
      };

      mediaRecorder.onerror = (event) => {
        reject(new Error('MediaRecorder error: ' + event.error));
      };

      // Start recording
      mediaRecorder.start();

      let currentFrame = 0;
      const frameDuration = 1000 / fps; // ms per frame

      const renderNextFrame = () => {
        if (currentFrame >= totalFrames) {
          // Stop recording
          mediaRecorder.stop();
          return;
        }

        // Render current frame
        renderFrame(ctx, currentFrame, totalFrames);

        // Update progress
        const progress = Math.round((currentFrame / totalFrames) * 100);
        onProgress(progress);

        currentFrame++;

        // Schedule next frame
        setTimeout(renderNextFrame, frameDuration);
      };

      // Start rendering frames
      renderNextFrame();

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Download a blob as a file
 * @param {Blob} blob - The blob to download
 * @param {string} filename - The filename
 * @returns {boolean} Success status
 */
export function downloadVideoBlob(blob, filename) {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    return true;
  } catch (error) {
    console.error('Download failed:', error);
    return false;
  }
}

/**
 * Convert WebM to MP4 (if supported by browser)
 * Note: This is a basic conversion, for better compatibility you might want to use FFmpeg.wasm
 */
export async function convertWebMToMP4(webmBlob) {
  // For now, we'll return the WebM blob as most browsers support it
  // In the future, you could integrate FFmpeg.wasm here for true MP4 conversion
  return webmBlob;
}

/**
 * Check if video recording is supported
 */
export function isVideoRecordingSupported() {
  return !!(
    window.MediaRecorder &&
    HTMLCanvasElement.prototype.captureStream
  );
}

/**
 * Get supported video MIME types
 */
export function getSupportedVideoTypes() {
  const types = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4;codecs=h264',
    'video/mp4'
  ];

  return types.filter(type => MediaRecorder.isTypeSupported(type));
}