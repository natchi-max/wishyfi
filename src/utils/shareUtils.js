/**
 * Share Utilities - Direct GIF file sharing via Web Share API
 */

/**
 * Share GIF file directly via native share sheet
 * @param {Blob} gifBlob - The GIF blob to share
 * @param {Object} wishData - Wish data for metadata
 * @returns {Promise<boolean>} - Success status
 */
export async function shareGifFile(gifBlob, wishData, message = '') {
    if (!gifBlob || gifBlob.size === 0) {
        throw new Error('No GIF file to share');
    }

    // Create File object from blob
    const filename = `birthday-wish-${wishData?.recipientName || 'special'}-${Date.now()}.gif`;
    const file = new File([gifBlob], filename, {
        type: 'image/gif',
        lastModified: Date.now()
    });

    // Check if Web Share API Level 2 (files) is supported
    if (!navigator.canShare || !navigator.canShare({ files: [file] })) {
        console.log('File sharing not supported, falling back to download');
        return false; // Fallback needed
    }

    try {
        // Prepare share data
        const shareData = {
            files: [file],
            title: `Magic Wish for ${wishData?.recipientName || 'Someone Special'}`,
            text: message // This will include the wish link
        };

        console.log('Sharing GIF file:', filename, 'Size:', gifBlob.size, 'bytes');

        // Share the actual file
        await navigator.share(shareData);
        console.log('GIF file shared successfully');
        return true;

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Share cancelled by user');
            return true; // Not an error, user cancelled
        }
        console.error('File share failed:', error);
        throw error;
    }
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
        } catch (e) {
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