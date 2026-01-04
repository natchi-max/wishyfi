/**
 * Beautiful Procedural Image Generator for Wishing Cards
 * Creates stunning, unique backgrounds WITHOUT any API keys
 * Each image is unique based on recipient name + date
 */

// Seeded random number generator for consistent uniqueness per user
function seededRandom(seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return function () {
        hash = Math.sin(hash) * 10000;
        return hash - Math.floor(hash);
    };
}

// HSL to RGB conversion
function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Pre-generated high-quality festival images (21 different events)
const FESTIVAL_IMAGES = {
    // Personal Celebrations
    birthday: '/images/festivals/birthday.png',
    anniversary: '/images/festivals/anniversary.png',
    love: '/images/festivals/anniversary.png',
    wedding: '/images/festivals/wedding.png',
    engagement: '/images/festivals/engagement.png',
    babyshower: '/images/festivals/babyshower.png',
    graduation: '/images/festivals/graduation.png',
    promotion: '/images/festivals/promotion.png',
    retirement: '/images/festivals/retirement.png',

    // Major Holidays
    newyear: '/images/festivals/newyear.png',
    christmas: '/images/festivals/christmas.png',
    thanksgiving: '/images/festivals/thanksgiving.png',

    // Indian Festivals
    diwali: '/images/festivals/diwali.png',
    pongal: '/images/festivals/pongal.png',
    holi: '/images/festivals/holi.png',
    onam: '/images/festivals/onam.png',
    navratri: '/images/festivals/navratri.png',
    ganeshchaturthi: '/images/festivals/ganeshchaturthi.png',
    rakshabandhan: '/images/festivals/rakshabandhan.png',

    // Religious
    eid: '/images/festivals/eid.png',

    // Family Days
    mothersday: '/images/festivals/mothersday.png',
    fathersday: '/images/festivals/fathersday.png'
};

/**
 * Try to load a pre-generated festival image
 */
async function loadFestivalImage(occasion, customOccasion) {
    // First check direct occasion match
    if (FESTIVAL_IMAGES[occasion]) {
        return await tryLoadImage(FESTIVAL_IMAGES[occasion]);
    }

    // Check custom occasion keywords
    const text = (customOccasion || '').toLowerCase();
    if (!text && !customOccasion) return null;

    // Direct key match
    for (const [key, path] of Object.entries(FESTIVAL_IMAGES)) {
        if (text.includes(key)) {
            return await tryLoadImage(path);
        }
    }

    // Extended keyword matching for variations
    const keywordMappings = {
        // Festivals
        'deepavali': 'diwali',
        'xmas': 'christmas',
        'harvest': 'pongal',
        'thai pongal': 'pongal',
        'ramadan': 'eid',
        'eid mubarak': 'eid',
        'durga puja': 'navratri',
        'dandiya': 'navratri',
        'garba': 'navratri',
        'ganpati': 'ganeshchaturthi',
        'vinayaka': 'ganeshchaturthi',
        'rakhi': 'rakshabandhan',
        'colors': 'holi',
        'rangoli': 'diwali',

        // Events
        'new year': 'newyear',
        'happy new year': 'newyear',
        'baby shower': 'babyshower',
        'newborn': 'babyshower',
        'convocation': 'graduation',
        'degree': 'graduation',
        'job promotion': 'promotion',
        'new job': 'promotion',
        'success': 'promotion',
        'achievement': 'promotion',
        'engaged': 'engagement',
        'propose': 'engagement',
        'retire': 'retirement',

        // Family
        'mother': 'mothersday',
        'mom': 'mothersday',
        'amma': 'mothersday',
        'father': 'fathersday',
        'dad': 'fathersday',
        'appa': 'fathersday',

        // Love
        'valentine': 'love',
        'romantic': 'love',
        'romance': 'love'
    };

    for (const [keyword, imageKey] of Object.entries(keywordMappings)) {
        if (text.includes(keyword) && FESTIVAL_IMAGES[imageKey]) {
            return await tryLoadImage(FESTIVAL_IMAGES[imageKey]);
        }
    }

    return null;
}

/**
 * Try to load an image, return null if failed
 */
async function tryLoadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

/**
 * Generate a unique celebration image
 * @param {Object} wishData - { occasion, customOccasion, recipientName, date, message }
 * @returns {Promise<string>} Data URL of the unique image
 */
export const generateCelebrationImage = async (wishData) => {
    const { occasion, customOccasion, recipientName, date } = wishData;
    const highlight = wishData.colorHighlight || '#ff6b6b';
    const bg = wishData.colorBg || '#0a0a0f';

    // Create a unique seed from user data (including custom occasion for uniqueness)
    const seed = `${recipientName}-${date}-${occasion}-${customOccasion || ''}-v3`;
    const rng = seededRandom(seed);

    const canvas = document.createElement('canvas');
    const size = 1024;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Try to load pre-generated high-quality festival image first
    const festivalImage = await loadFestivalImage(occasion, customOccasion);

    if (festivalImage) {
        // Use the pre-generated AI image as base
        ctx.drawImage(festivalImage, 0, 0, size, size);

        // Add personalized overlay and name signature on top
        addPersonalizedOverlay(ctx, size, rng, recipientName + (customOccasion || ''));
        addNameSignature(ctx, size, recipientName, highlight);

        return canvas.toDataURL('image/jpeg', 0.92);
    }

    // Fallback to procedural generation if no pre-made image available
    // Determine image style based on occasion or custom occasion keywords
    let imageStyle = occasion;

    if (occasion === 'other' && customOccasion) {
        imageStyle = detectOccasionType(customOccasion.toLowerCase());
    }

    // Generate based on detected style
    switch (imageStyle) {
        case 'birthday':
            generateBirthdayImage(ctx, size, rng, highlight, bg);
            break;
        case 'anniversary':
        case 'love':
            generateAnniversaryImage(ctx, size, rng, highlight, bg);
            break;
        case 'newyear':
            generateNewYearImage(ctx, size, rng, highlight, bg);
            break;
        case 'wedding':
            generateWeddingImage(ctx, size, rng, highlight, bg);
            break;
        case 'graduation':
        case 'success':
            generateGraduationImage(ctx, size, rng, highlight, bg, recipientName);
            break;
        case 'celebration':
            generateCelebrationStyleImage(ctx, size, rng, highlight, bg, recipientName);
            break;
        case 'spiritual':
            generateSpiritualImage(ctx, size, rng, highlight, bg, recipientName);
            break;
        case 'nature':
            generateNatureImage(ctx, size, rng, highlight, bg, recipientName);
            break;
        default:
            generateMagicalImage(ctx, size, rng, highlight, bg, recipientName);
    }

    // Add unique personalized overlay based on name and occasion
    addPersonalizedOverlay(ctx, size, rng, recipientName + (customOccasion || ''));

    // Add name-based personal accent (subtle signature based on name)
    addNameSignature(ctx, size, recipientName, highlight);

    return canvas.toDataURL('image/jpeg', 0.92);
};

/**
 * Generate a personal color from the recipient's name
 */
function getPersonalColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 60%)`;
}

/**
 * Add a subtle name-based signature to the image
 */
function addNameSignature(ctx, size, name, highlight) {
    if (!name) return;

    // Get personal color based on name
    const personalColor = getPersonalColor(name);
    const nameSum = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

    // Add subtle corner glow based on name
    ctx.save();
    const cornerX = (nameSum % 2 === 0) ? 0 : size;
    const cornerY = (nameSum % 3 === 0) ? 0 : size;
    const grad = ctx.createRadialGradient(cornerX, cornerY, 0, cornerX, cornerY, size * 0.5);
    grad.addColorStop(0, personalColor.replace('60%)', '60%, 0.15)').replace('hsl', 'hsla'));
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    ctx.restore();

    // Add name-length based sparkle pattern
    const sparkleCount = Math.min(name.length * 3, 30);
    for (let i = 0; i < sparkleCount; i++) {
        const charCode = name.charCodeAt(i % name.length);
        const x = ((charCode * (i + 1) * 7) % size);
        const y = ((charCode * (i + 1) * 11) % size);
        const sparkleSize = (charCode % 3) + 1;

        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = personalColor;
        ctx.beginPath();
        ctx.arc(x, y, sparkleSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

/**
 * Detect occasion type from custom text using keywords
 */
function detectOccasionType(text) {
    const keywords = {
        birthday: ['birthday', 'bday', 'born', 'birth'],
        anniversary: ['anniversary', 'married', 'years together', 'relationship'],
        love: ['love', 'valentine', 'heart', 'romance', 'romantic'],
        wedding: ['wedding', 'marriage', 'bride', 'groom', 'engagement', 'engaged'],
        graduation: ['graduation', 'graduate', 'degree', 'diploma', 'convocation'],
        success: ['promotion', 'job', 'success', 'achievement', 'accomplishment', 'new job', 'career'],
        newyear: ['new year', 'newyear', 'year end', 'year beginning'],
        celebration: ['party', 'celebration', 'festival', 'diwali', 'christmas', 'eid', 'holi', 'pongal'],
        spiritual: ['blessing', 'prayer', 'god', 'religious', 'spiritual', 'temple', 'church', 'mosque'],
        nature: ['travel', 'trip', 'vacation', 'holiday', 'journey', 'adventure']
    };

    for (const [type, words] of Object.entries(keywords)) {
        for (const word of words) {
            if (text.includes(word)) {
                return type;
            }
        }
    }

    return 'magical'; // Default fallback
}

/**
 * Birthday - Warm pinks, golds, balloons, cake vibes
 */
function generateBirthdayImage(ctx, size, rng, highlight, bg) {
    // Warm gradient background influenced by user choice
    const gradient = ctx.createRadialGradient(
        size * 0.5, size * 0.4, 0,
        size * 0.5, size * 0.5, size * 0.8
    );
    gradient.addColorStop(0, '#fff5f8');
    gradient.addColorStop(0.3, highlight + '88'); // 50% opacity highlight
    gradient.addColorStop(0.7, highlight);
    gradient.addColorStop(1, bg);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Golden orbs
    for (let i = 0; i < 15; i++) {
        const x = rng() * size;
        const y = rng() * size;
        const r = rng() * 100 + 50;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, `rgba(255, 215, 0, ${rng() * 0.3})`);
        grad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
    }

    // Balloons
    for (let i = 0; i < 8; i++) {
        drawBalloon(ctx,
            rng() * size,
            rng() * size * 0.7,
            rng() * 40 + 30,
            `hsl(${rng() * 360}, 80%, 60%)`,
            rng
        );
    }

    // Confetti
    for (let i = 0; i < 100; i++) {
        const x = rng() * size;
        const y = rng() * size;
        const w = rng() * 8 + 2;
        const h = rng() * 15 + 5;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rng() * Math.PI * 2);
        ctx.fillStyle = `hsl(${rng() * 360}, 90%, 60%)`;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.restore();
    }

    // Multi-color Sparkles
    addSparkles(ctx, size, rng, 100, '#fff');
    addSparkles(ctx, size, rng, 60, highlight);
    for (let i = 0; i < 30; i++) {
        addSparkles(ctx, size, rng, 1, `hsl(${rng() * 360}, 100%, 75%)`);
    }
}

/**
 * Anniversary - Romantic reds, hearts, roses
 */
function generateAnniversaryImage(ctx, size, rng, highlight, bg) {
    // Deep romantic gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, bg);
    gradient.addColorStop(0.5, highlight);
    gradient.addColorStop(1, '#ff4444');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Soft pink glow
    const glow = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.6);
    glow.addColorStop(0, 'rgba(255, 105, 180, 0.3)');
    glow.addColorStop(1, 'rgba(255, 105, 180, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);

    // Floating hearts
    for (let i = 0; i < 25; i++) {
        const x = rng() * size;
        const y = rng() * size;
        const heartSize = rng() * 40 + 15;
        const opacity = rng() * 0.4 + 0.1;
        ctx.fillStyle = `rgba(255, 100, 150, ${opacity})`;
        drawHeart(ctx, x, y, heartSize);
        ctx.fill();
    }

    // Rose petals
    for (let i = 0; i < 30; i++) {
        const x = rng() * size;
        const y = rng() * size;
        const petalSize = rng() * 20 + 10;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rng() * Math.PI * 2);
        ctx.fillStyle = `hsla(${350 + rng() * 20}, 80%, ${50 + rng() * 20}%, ${rng() * 0.5 + 0.2})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, petalSize, petalSize / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Golden & Multi Sparkles
    addSparkles(ctx, size, rng, 60, '#ffd700');
    addSparkles(ctx, size, rng, 40, '#fff');
    for (let i = 0; i < 20; i++) {
        addSparkles(ctx, size, rng, 1, `hsla(${rng() * 360}, 100%, 70%, 0.8)`);
    }
}

/**
 * New Year - Dark blue, gold, fireworks, stars
 */
function generateNewYearImage(ctx, size, rng, highlight, bg) {
    // Night sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, '#000428');
    gradient.addColorStop(0.5, highlight);
    gradient.addColorStop(1, bg);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Stars
    for (let i = 0; i < 200; i++) {
        const x = rng() * size;
        const y = rng() * size * 0.7;
        const starSize = rng() * 2 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${rng() * 0.8 + 0.2})`;
        ctx.beginPath();
        ctx.arc(x, y, starSize, 0, Math.PI * 2);
        ctx.fill();
    }

    // Fireworks
    for (let i = 0; i < 5; i++) {
        drawFirework(ctx,
            rng() * size * 0.8 + size * 0.1,
            rng() * size * 0.4 + size * 0.1,
            rng() * 80 + 60,
            `hsl(${rng() * 60 + 30}, 100%, 60%)`, // Gold to orange
            rng
        );
    }

    // Golden orbs
    for (let i = 0; i < 10; i++) {
        const x = rng() * size;
        const y = rng() * size;
        const r = rng() * 60 + 30;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, `rgba(255, 215, 0, ${rng() * 0.2})`);
        grad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
    }

    // Multi-color Celebration Sparles
    addSparkles(ctx, size, rng, 100, '#ffd700');
    for (let i = 0; i < 50; i++) {
        addSparkles(ctx, size, rng, 1, `hsl(${rng() * 360}, 100%, 70%)`);
    }
}

/**
 * Wedding - White, blush, elegant, flowers
 */
function generateWeddingImage(ctx, size, rng, highlight, bg) {
    // Soft elegant gradient
    const gradient = ctx.createRadialGradient(
        size * 0.5, size * 0.3, 0,
        size * 0.5, size * 0.5, size
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.4, highlight + '44');
    gradient.addColorStop(0.8, highlight + '22');
    gradient.addColorStop(1, bg);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Delicate lace pattern
    ctx.strokeStyle = 'rgba(200, 180, 180, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < size; i += 30) {
        ctx.beginPath();
        for (let x = 0; x < size; x += 5) {
            ctx.lineTo(x, i + Math.sin(x * 0.05) * 10);
        }
        ctx.stroke();
    }

    // Soft flower petals
    for (let i = 0; i < 40; i++) {
        const x = rng() * size;
        const y = rng() * size;
        const petalSize = rng() * 30 + 15;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rng() * Math.PI * 2);
        ctx.fillStyle = `hsla(${350 + rng() * 20}, ${30 + rng() * 20}%, ${90 + rng() * 10}%, ${rng() * 0.3 + 0.1})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, petalSize, petalSize / 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Pearl dots
    for (let i = 0; i < 50; i++) {
        const x = rng() * size;
        const y = rng() * size;
        const pearlSize = rng() * 5 + 2;
        const grad = ctx.createRadialGradient(x - 1, y - 1, 0, x, y, pearlSize);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        grad.addColorStop(0.5, 'rgba(240, 230, 230, 0.6)');
        grad.addColorStop(1, 'rgba(200, 180, 180, 0.3)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, pearlSize, 0, Math.PI * 2);
        ctx.fill();
    }

    addSparkles(ctx, size, rng, 50, 'rgba(255, 255, 255, 0.8)');
}

/**
 * Graduation - Navy, gold, academic
 */
function generateGraduationImage(ctx, size, rng, highlight, bg) {
    // Academic gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, bg);
    gradient.addColorStop(0.5, highlight);
    gradient.addColorStop(1, '#1a365d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Golden rays
    ctx.save();
    ctx.translate(size / 2, size * 0.3);
    for (let i = 0; i < 12; i++) {
        ctx.rotate(Math.PI / 6);
        ctx.fillStyle = 'rgba(255, 215, 0, 0.05)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-30, size);
        ctx.lineTo(30, size);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();

    // Confetti
    for (let i = 0; i < 80; i++) {
        const x = rng() * size;
        const y = rng() * size;
        const w = rng() * 10 + 3;
        const h = rng() * 20 + 5;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rng() * Math.PI * 2);
        const isGold = rng() > 0.5;
        ctx.fillStyle = isGold ?
            `hsla(45, 100%, ${50 + rng() * 20}%, ${rng() * 0.6 + 0.3})` :
            `hsla(220, 80%, ${40 + rng() * 30}%, ${rng() * 0.6 + 0.3})`;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.restore();
    }

    // Stars
    for (let i = 0; i < 8; i++) {
        const x = rng() * size;
        const y = rng() * size * 0.5;
        drawStar(ctx, x, y, 5, rng() * 15 + 10, rng() * 8 + 5, 'rgba(255, 215, 0, 0.6)');
    }

    addSparkles(ctx, size, rng, 60, '#ffd700');
    addSparkles(ctx, size, rng, 40, '#fff');
}

/**
 * Magical/Other - Cosmic purples, magical feel
 */
function generateMagicalImage(ctx, size, rng, highlight, bg) {
    // Cosmic gradient
    const gradient = ctx.createRadialGradient(
        size * 0.3, size * 0.3, 0,
        size * 0.5, size * 0.5, size
    );
    gradient.addColorStop(0, highlight);
    gradient.addColorStop(0.6, bg);
    gradient.addColorStop(1, '#0f051d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Nebula clouds
    for (let i = 0; i < 8; i++) {
        const x = rng() * size;
        const y = rng() * size;
        const r = rng() * 200 + 100;
        const hue = 260 + rng() * 60;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, `hsla(${hue}, 80%, 50%, ${rng() * 0.2})`);
        grad.addColorStop(0.5, `hsla(${hue + 20}, 70%, 40%, ${rng() * 0.1})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
    }

    // Stars
    for (let i = 0; i < 150; i++) {
        const x = rng() * size;
        const y = rng() * size;
        const starSize = rng() * 2 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${rng() * 0.8 + 0.2})`;
        ctx.beginPath();
        ctx.arc(x, y, starSize, 0, Math.PI * 2);
        ctx.fill();
    }

    // Magic orbs
    for (let i = 0; i < 6; i++) {
        const x = rng() * size;
        const y = rng() * size;
        const r = rng() * 50 + 30;
        const hue = rng() * 60 + 270;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.5)`);
        grad.addColorStop(0.5, `hsla(${hue}, 80%, 50%, 0.2)`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
    }

    // Floating hearts
    for (let i = 0; i < 12; i++) {
        const x = rng() * size;
        const y = rng() * size;
        const heartSize = rng() * 25 + 10;
        ctx.fillStyle = `rgba(255, 100, 200, ${rng() * 0.3 + 0.1})`;
        drawHeart(ctx, x, y, heartSize);
        ctx.fill();
    }

    // Magic multi-color shimmer
    addSparkles(ctx, size, rng, 80, '#fff');
    addSparkles(ctx, size, rng, 40, '#ff69b4');
    for (let i = 0; i < 50; i++) {
        addSparkles(ctx, size, rng, 1, `hsla(${rng() * 360}, 100%, 75%, 0.9)`);
    }
}

/**
 * Celebration/Festival Style - Vibrant, colorful, party vibes
 */
function generateCelebrationStyleImage(ctx, size, rng, highlight, bg) {
    // Vibrant multi-color gradient
    const gradient = ctx.createRadialGradient(
        size * 0.5, size * 0.5, 0,
        size * 0.5, size * 0.5, size * 0.8
    );
    gradient.addColorStop(0, '#ffd700');
    gradient.addColorStop(0.3, highlight);
    gradient.addColorStop(0.6, '#ff6b6b');
    gradient.addColorStop(1, bg);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Festival lights
    for (let i = 0; i < 30; i++) {
        const x = rng() * size;
        const y = rng() * size;
        const r = rng() * 40 + 20;
        const hue = rng() * 360;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.6)`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
    }

    // Colorful confetti
    for (let i = 0; i < 150; i++) {
        const x = rng() * size;
        const y = rng() * size;
        const w = rng() * 10 + 3;
        const h = rng() * 20 + 5;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rng() * Math.PI * 2);
        ctx.fillStyle = `hsla(${rng() * 360}, 90%, 60%, ${rng() * 0.7 + 0.3})`;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.restore();
    }

    // Glitter effect
    addSparkles(ctx, size, rng, 100, '#ffd700');
    addSparkles(ctx, size, rng, 80, '#fff');
    for (let i = 0; i < 60; i++) {
        addSparkles(ctx, size, rng, 1, `hsl(${rng() * 360}, 100%, 70%)`);
    }
}

/**
 * Spiritual/Blessing Style - Warm, divine, peaceful
 */
function generateSpiritualImage(ctx, size, rng, highlight, bg) {
    // Divine warm gradient
    const gradient = ctx.createRadialGradient(
        size * 0.5, size * 0.2, 0,
        size * 0.5, size * 0.5, size
    );
    gradient.addColorStop(0, '#fff8dc');
    gradient.addColorStop(0.3, '#ffd700');
    gradient.addColorStop(0.6, highlight);
    gradient.addColorStop(1, bg);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Divine rays
    ctx.save();
    ctx.translate(size / 2, size * 0.2);
    for (let i = 0; i < 16; i++) {
        ctx.rotate(Math.PI / 8);
        ctx.fillStyle = 'rgba(255, 215, 0, 0.08)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-40, size);
        ctx.lineTo(40, size);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();

    // Soft glow orbs
    for (let i = 0; i < 12; i++) {
        const x = rng() * size;
        const y = rng() * size;
        const r = rng() * 80 + 40;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, `rgba(255, 215, 0, ${rng() * 0.2})`);
        grad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
    }

    // Golden sparkles
    addSparkles(ctx, size, rng, 80, '#ffd700');
    addSparkles(ctx, size, rng, 40, '#fff8dc');
}

/**
 * Nature/Travel Style - Greens, blues, adventure
 */
function generateNatureImage(ctx, size, rng, highlight, bg) {
    // Nature gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(0.4, '#4ecdc4');
    gradient.addColorStop(0.7, highlight);
    gradient.addColorStop(1, bg);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Cloud-like shapes
    for (let i = 0; i < 8; i++) {
        const x = rng() * size;
        const y = rng() * size * 0.4;
        const cloudSize = rng() * 100 + 50;
        ctx.fillStyle = `rgba(255, 255, 255, ${rng() * 0.3 + 0.1})`;
        for (let j = 0; j < 5; j++) {
            ctx.beginPath();
            ctx.arc(x + j * cloudSize * 0.3, y, cloudSize * (0.5 + rng() * 0.5), 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Floating leaves
    for (let i = 0; i < 30; i++) {
        const x = rng() * size;
        const y = rng() * size;
        const leafSize = rng() * 20 + 10;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rng() * Math.PI * 2);
        ctx.fillStyle = `hsla(${100 + rng() * 40}, 60%, ${40 + rng() * 20}%, ${rng() * 0.4 + 0.2})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, leafSize, leafSize / 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Sun rays
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.translate(size * 0.8, size * 0.15);
    for (let i = 0; i < 12; i++) {
        ctx.rotate(Math.PI / 6);
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-15, size * 0.5);
        ctx.lineTo(15, size * 0.5);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();

    // Nature sparkles
    addSparkles(ctx, size, rng, 50, '#fff');
    addSparkles(ctx, size, rng, 30, '#4ecdc4');
}

// === HELPER DRAWING FUNCTIONS ===

function drawHeart(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y + size / 4);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
    ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size * 0.7, x, y + size);
    ctx.bezierCurveTo(x, y + size * 0.7, x + size / 2, y + size / 2, x + size / 2, y + size / 4);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / spikes;
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
        rot += step;
        ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}

function drawBalloon(ctx, x, y, radius, color, rng) {
    // Balloon body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, radius * 0.8, radius, 0, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x - radius * 0.2, y - radius * 0.3, radius * 0.15, radius * 0.25, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // String
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.quadraticCurveTo(x + rng() * 20 - 10, y + radius + 50, x + rng() * 30 - 15, y + radius + 100);
    ctx.stroke();
}

function drawFirework(ctx, x, y, radius, color, rng) {
    const particles = 20 + Math.floor(rng() * 10);
    for (let i = 0; i < particles; i++) {
        const angle = (i / particles) * Math.PI * 2;
        const length = radius * (0.5 + rng() * 0.5);
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;

        const grad = ctx.createLinearGradient(x, y, endX, endY);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Sparkle at end
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(endX, endY, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Center glow
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.3);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - radius * 0.3, y - radius * 0.3, radius * 0.6, radius * 0.6);
}

function addSparkles(ctx, size, rng, count, color) {
    for (let i = 0; i < count; i++) {
        const x = rng() * size;
        const y = rng() * size;
        const sparkleSize = rng() * 3 + 1;
        ctx.fillStyle = color;
        ctx.globalAlpha = rng() * 0.8 + 0.2;
        ctx.beginPath();
        ctx.arc(x, y, sparkleSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function addPersonalizedOverlay(ctx, size, rng, name) {
    // Unique pattern based on name
    const nameSum = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const pattern = nameSum % 5;

    ctx.globalAlpha = 0.03;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;

    if (pattern === 0) {
        // Diagonal lines
        for (let i = -size; i < size * 2; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + size, size);
            ctx.stroke();
        }
    } else if (pattern === 1) {
        // Circles
        for (let r = 80; r < size; r += 80) {
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
            ctx.stroke();
        }
    } else if (pattern === 2) {
        // Grid
        for (let i = 0; i < size; i += 60) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, size);
            ctx.moveTo(0, i);
            ctx.lineTo(size, i);
            ctx.stroke();
        }
    } else if (pattern === 3) {
        // Waves
        for (let y = 0; y < size; y += 40) {
            ctx.beginPath();
            for (let x = 0; x < size; x += 5) {
                ctx.lineTo(x, y + Math.sin(x * 0.02 + y * 0.01) * 20);
            }
            ctx.stroke();
        }
    }
    // pattern === 4: no overlay

    ctx.globalAlpha = 1;
}
