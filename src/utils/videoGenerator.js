/**
 * Video Generator Utility
 * Exports canvas animations as video files using MediaRecorder API
 */

/**
 * Create an animated video from canvas frames
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

      // Render the first frame immediately so the stream has content
      renderFrame(ctx, 0, totalFrames);

      // Get canvas stream - use 0 for manual frame control
      const stream = canvas.captureStream(0);

      // Setup MediaRecorder with the best supported type
      const supportedTypes = getSupportedVideoTypes();
      const mimeType = supportedTypes.length > 0 ? supportedTypes[0] : 'video/webm';

      console.log('Using video MIME type:', mimeType);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 4000000 // 4 Mbps for good quality
      });

      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        // Attach the actual mimeType so download can pick the right extension
        blob._mimeType = mimeType;
        resolve(blob);
      };

      mediaRecorder.onerror = (event) => {
        reject(new Error('MediaRecorder error: ' + event.error));
      };

      // Request data every 100ms to avoid losing frames
      mediaRecorder.start(100);

      let currentFrame = 0;
      const frameDuration = 1000 / fps; // ms per frame

      // Get the video track to request frames manually
      const videoTrack = stream.getVideoTracks()[0];

      const renderNextFrame = () => {
        if (currentFrame >= totalFrames) {
          // Stop recording after a small delay to ensure last frames are captured
          setTimeout(() => {
            mediaRecorder.stop();
          }, 200);
          return;
        }

        // Render current frame
        renderFrame(ctx, currentFrame, totalFrames);

        // Manually request a frame capture from the stream
        if (videoTrack && typeof videoTrack.requestFrame === 'function') {
          videoTrack.requestFrame();
        }

        // Update progress
        const progress = Math.round((currentFrame / totalFrames) * 100);
        onProgress(progress);

        currentFrame++;

        // Schedule next frame - use requestAnimationFrame for smoother timing
        setTimeout(renderNextFrame, frameDuration);
      };

      // Start rendering frames (skip frame 0 since we already rendered it)
      currentFrame = 1;
      onProgress(0);

      // Small delay to let MediaRecorder initialize properly
      setTimeout(renderNextFrame, 100);

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get the correct file extension for a video MIME type
 * @param {string} mimeType - The MIME type
 * @returns {string} File extension including the dot
 */
export function getVideoExtension(mimeType) {
  if (mimeType && mimeType.includes('mp4')) return '.mp4';
  if (mimeType && mimeType.includes('webm')) return '.webm';
  return '.webm'; // Default fallback
}

/**
 * Download a blob as a file
 * @param {Blob} blob - The blob to download
 * @param {string} filename - The filename (extension will be corrected based on actual MIME type)
 * @returns {boolean} Success status
 */
export function downloadVideoBlob(blob, filename) {
  try {
    // Determine the actual MIME type and correct the extension
    const actualMime = blob._mimeType || blob.type || 'video/webm';
    const correctExt = getVideoExtension(actualMime);

    // Replace any existing video extension with the correct one
    const correctedFilename = filename
      .replace(/\.(mp4|webm|mkv|avi)$/i, '')
      + correctExt;

    console.log(`Downloading video: ${correctedFilename} (type: ${actualMime}, size: ${blob.size} bytes)`);

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = correctedFilename;
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up after a longer delay to ensure download starts
    setTimeout(() => URL.revokeObjectURL(url), 5000);

    return true;
  } catch (error) {
    console.error('Download failed:', error);
    return false;
  }
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
    'video/mp4;codecs=h264',
    'video/mp4',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm'
  ];

  return types.filter(type => MediaRecorder.isTypeSupported(type));
}
