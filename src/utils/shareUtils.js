/**
 * Share Utilities - Direct GIF file sharing via Web Share API
 */

/**
 * Share GIF file directly via native share sheet
 * @param {Blob} gifBlob - The GIF blob to share
 * @param {Object} wishData - Wish data for metadata
 * @returns {Promise<boolean>} - Success status
 */
/**
 * Share Media file directly via native share sheet
 * @param {Blob} mediaBlob - The file blob to share
 * @param {Object} wishData - Wish data for metadata
 * @param {string} message - Message text
 * @param {string} url - Optional URL to share
 * @returns {Promise<boolean>} - Success status
 */
export async function shareGifFile(mediaBlob, wishData, message = '', url = undefined) {
    if (!mediaBlob || mediaBlob.size === 0) {
        throw new Error('No file to share');
    }

    // Determine file type and extension
    const mimeType = mediaBlob.type || 'image/gif';
    const isVideo = mimeType.startsWith('video/');
    const extension = isVideo ? (mimeType.includes('mp4') ? '.mp4' : '.webm') : '.gif';

    // Create File object from blob
    const filename = `magic-wish-${wishData?.recipientName || 'special'}-${Date.now()}${extension}`;
    const file = new File([mediaBlob], filename, {
        type: mimeType,
        lastModified: Date.now()
    });

    const shareUrl = url || window.location.href;

    // Check if Web Share API Level 2 (files) is supported
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                files: [file],
                title: `Magic Wish for ${wishData?.recipientName || 'Someone Special'}`,
                text: message,
                // Some platforms might ignore URL when sharing files, but good to include
                url: shareUrl
            });
            console.log('File shared successfully');
            return true;
        } catch (error) {
            if (error.name === 'AbortError') return true;
            console.warn('File sharing failed, trying text fallback...');
        }
    }

    // Fallback: Share Text/Link only (if file share not supported or failed)
    if (navigator.share) {
        try {
            await navigator.share({
                title: `Magic Wish for ${wishData?.recipientName || 'Someone Special'}`,
                text: message,
                url: shareUrl
            });
            console.log('Link shared successfully');
            return true;
        } catch (error) {
            if (error.name === 'AbortError') return true;
            console.error('Text sharing failed:', error);
        }
    }

    console.log('Native sharing not supported');
    return false;
}

/**
 * Fallback: Auto-download GIF with instructions
 * @param {Blob} gifBlob - The GIF blob to download
 * @param {Object} wishData - Wish data for filename
 * @returns {boolean} - Success status
 */
export function downloadGifWithInstructions(gifBlob, wishData) {
    try {
        // Create download link
        const url = URL.createObjectURL(gifBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `birthday-wish-${wishData?.recipientName || 'special'}-${Date.now()}.gif`;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        return true;
    } catch (error) {
        console.error('Download failed:', error);
        return false;
    }
}

/**
 * Show sharing instructions modal
 * @param {string} platform - Platform name (whatsapp, telegram, etc.)
 */
export function showSharingInstructions(platform = 'WhatsApp') {
    const instructions = {
        whatsapp: 'Open WhatsApp → New Chat → Attach (📎) → Gallery → Select the downloaded GIF',
        telegram: 'Open Telegram → Chat → Attach (📎) → Gallery → Select the downloaded GIF',
        instagram: 'Open Instagram → Story/Post → Gallery → Select the downloaded GIF',
        general: 'The GIF has been downloaded. Open your messaging app and attach the GIF file.'
    };

    const message = instructions[platform.toLowerCase()] || instructions.general;

    // Create modal or alert
    if (window.confirm(`GIF Downloaded!\n\n${message}\n\nClick OK to continue.`)) {
        return true;
    }
    return false;
}

/**
 * Check Web Share API support levels
 * @returns {Object} - Support status
 */
export function getShareSupport() {
    const hasWebShare = 'share' in navigator;
    const hasCanShare = 'canShare' in navigator;

    let supportsFiles = false;
    if (hasCanShare) {
        try {
            // Test with actual GIF file type
            const testFile = new File(['test'], 'test.gif', { type: 'image/gif' });
            supportsFiles = navigator.canShare({ files: [testFile] });
        } catch {
            supportsFiles = false;
        }
    }

    // Additional check for mobile browsers
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isChrome = /Chrome/i.test(navigator.userAgent);
    const isSafari = /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);

    return {
        hasWebShare,
        hasCanShare,
        supportsFiles,
        isMobile,
        isChrome,
        isSafari,
        isSupported: hasWebShare && hasCanShare && supportsFiles && isMobile
    };
}