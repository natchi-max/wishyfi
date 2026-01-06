/**
 * Image Utility for Project
 * Handles loading of pre-generated local festival/occasion images
 */

// Complete collection of pre-generated images organized by category
const FESTIVAL_IMAGES = {
    // === Personal & Life Events ===
    birthday: '/images/festivals/birthday.png',
    anniversary: '/images/festivals/anniversary.png',
    wedding: '/images/festivals/wedding.png',
    engagement: '/images/festivals/engagement.png',
    babyshower: '/images/festivals/babyshower.png',
    graduation: '/images/festivals/graduation.png',
    promotion: '/images/festivals/promotion.png',
    retirement: '/images/festivals/retirement.png',
    namingceremony: '/images/festivals/namingceremony.png',
    housewarming: '/images/festivals/housewarming.png',
    farewell: '/images/festivals/farewell.png',
    welcome: '/images/festivals/welcome.png',
    reunion: '/images/festivals/reunion.png',
    proposal: '/images/festivals/proposal.png',
    successparty: '/images/festivals/successparty.png',
    achievement: '/images/festivals/achievement.png',
    firstjob: '/images/festivals/firstjob.png',
    newbeginning: '/images/festivals/newbeginning.png',
    memoryday: '/images/festivals/memoryday.png',
    specialmoment: '/images/festivals/specialmoment.png',
    dreamcometrue: '/images/festivals/dreamcometrue.png',
    comeback: '/images/festivals/comeback.png',
    victory: '/images/festivals/victory.png',

    // === Love & Relationship ===
    love: '/images/festivals/anniversary.png',
    valentinesday: '/images/festivals/valentinesday.png',
    promiseday: '/images/festivals/promiseday.png',
    roseday: '/images/festivals/roseday.png',
    chocolateday: '/images/festivals/chocolateday.png',
    hugday: '/images/festivals/hugday.png',
    kissday: '/images/festivals/kissday.png',
    coupleday: '/images/festivals/coupleday.png',
    loveday: '/images/festivals/loveday.png',
    friendshipday: '/images/festivals/friendshipday.png',
    bestfriendday: '/images/festivals/bestfriendday.png',

    // === Major Holidays ===
    newyear: '/images/festivals/newyear.png',
    christmas: '/images/festivals/christmas.png',
    thanksgiving: '/images/festivals/thanksgiving.png',
    easter: '/images/festivals/easter.png',
    goodfriday: '/images/festivals/goodfriday.png',

    // === Indian Festivals ===
    diwali: '/images/festivals/diwali.png',
    pongal: '/images/festivals/pongal.png',
    holi: '/images/festivals/holi.png',
    onam: '/images/festivals/onam.png',
    navratri: '/images/festivals/navratri.png',
    ganeshchaturthi: '/images/festivals/ganeshchaturthi.png',
    rakshabandhan: '/images/festivals/rakshabandhan.png',
    dussehra: '/images/festivals/dussehra.png',
    janmashtami: '/images/festivals/janmashtami.png',
    mahashivaratri: '/images/festivals/mahashivaratri.png',
    vasantpanchami: '/images/festivals/vasantpanchami.png',
    lohri: '/images/festivals/lohri.png',
    baisakhi: '/images/festivals/baisakhi.png',
    karwachauth: '/images/festivals/karwachauth.png',
    bhaidooj: '/images/festivals/bhaidooj.png',
    chhathpuja: '/images/festivals/chhathpuja.png',
    makarsankranti: '/images/festivals/makarsankranti.png',

    // === Islamic Festivals ===
    eid: '/images/festivals/eid.png',
    ramadan: '/images/festivals/ramadan.png',
    eidmilad: '/images/festivals/eidmilad.png',
    bakrid: '/images/festivals/bakrid.png',

    // === Family Days ===
    mothersday: '/images/festivals/mothersday.png',
    fathersday: '/images/festivals/fathersday.png',

    // === National & Awareness Days ===
    independenceday: '/images/festivals/independenceday.png',
    republicday: '/images/festivals/republicday.png',
    gandhijayanti: '/images/festivals/gandhijayanti.png',
    teachersday: '/images/festivals/teachersday.png',
    childrensday: '/images/festivals/childrensday.png',
    womensday: '/images/festivals/womensday.png',
    mensday: '/images/festivals/mensday.png',
    environmentday: '/images/festivals/environmentday.png',
    yogaday: '/images/festivals/yogaday.png',
    healthday: '/images/festivals/healthday.png',
    peaceday: '/images/festivals/peaceday.png',
    humanrightsday: '/images/festivals/humanrightsday.png',
    constitutionday: '/images/festivals/constitutionday.png',

    // === Education & Career ===
    resultday: '/images/festivals/resultday.png',
    examsuccess: '/images/festivals/examsuccess.png',
    convocation: '/images/festivals/convocation.png',
    orientationday: '/images/festivals/orientationday.png',
    internshipcompletion: '/images/festivals/internshipcompletion.png',
    projectcompletion: '/images/festivals/projectcompletion.png',
    startuplaunch: '/images/festivals/startuplaunch.png',
    applaunch: '/images/festivals/applaunch.png',
    websitelaunch: '/images/festivals/websitelaunch.png',

    // === Digital, Creative & Fun ===
    gamelaunch: '/images/festivals/gamelaunch.png',
    hackathonday: '/images/festivals/hackathonday.png',
    codingday: '/images/festivals/codingday.png',
    designshowcase: '/images/festivals/designshowcase.png',
    aiproject: '/images/festivals/aiproject.png',
    milestone: '/images/festivals/milestone.png',
    followerscelebration: '/images/festivals/followerscelebration.png',
    creatorday: '/images/festivals/creatorday.png',
    innovationday: '/images/festivals/innovationday.png',

    // === Emotional & Meaningful ===
    gratitudeday: '/images/festivals/gratitudeday.png',
    thankyouday: '/images/festivals/thankyouday.png',
    apologyday: '/images/festivals/apologyday.png',
    motivationday: '/images/festivals/motivationday.png',
    selfloveday: '/images/festivals/selfloveday.png',
    hopeday: '/images/festivals/hopeday.png',
    tributeday: '/images/festivals/tributeday.png',
    memorialday: '/images/festivals/memorialday.png',
    inspirationday: '/images/festivals/inspirationday.png',

    // === Unique / Custom Occasions ===
    luckyday: '/images/festivals/luckyday.png',
    destinyday: '/images/festivals/destinyday.png',
    firstmeet: '/images/festivals/firstmeet.png',
    lastday: '/images/festivals/lastday.png',
    goldenmoment: '/images/festivals/goldenmoment.png',
    silentday: '/images/festivals/silentday.png',
    unforgettableday: '/images/festivals/unforgettableday.png',
    magicday: '/images/festivals/magicday.png',
    surpriseday: '/images/festivals/surpriseday.png',
    forevermoment: '/images/festivals/forevermoment.png'
};

// Keyword mappings for flexible matching
const KEYWORD_MAPPINGS = {
    // Festivals
    'deepavali': 'diwali', 'xmas': 'christmas', 'harvest': 'pongal',
    'thai pongal': 'pongal', 'eid mubarak': 'eid', 'eid ul fitr': 'eid',
    'durga puja': 'navratri', 'dandiya': 'navratri', 'garba': 'navratri',
    'ganpati': 'ganeshchaturthi', 'vinayaka': 'ganeshchaturthi',
    'rakhi': 'rakshabandhan', 'colors': 'holi', 'rangoli': 'diwali',
    'new year': 'newyear', 'happy new year': 'newyear',
    'baby shower': 'babyshower', 'newborn': 'babyshower',
    'degree': 'graduation', 'job promotion': 'promotion', 'new job': 'firstjob',
    'success': 'achievement', 'engaged': 'engagement', 'propose': 'proposal',
    'retire': 'retirement', 'mother': 'mothersday', 'mom': 'mothersday',
    'amma': 'mothersday', 'father': 'fathersday', 'dad': 'fathersday',
    'appa': 'fathersday', 'valentine': 'valentinesday', 'romantic': 'love',
    'bhai dooj': 'bhaidooj', 'chhath puja': 'chhathpuja',
    'makar sankranti': 'makarsankranti', 'maha shivaratri': 'mahashivaratri',
    'vasant panchami': 'vasantpanchami', 'karwa chauth': 'karwachauth',
    'independence day': 'independenceday', 'republic day': 'republicday',
    'gandhi jayanti': 'gandhijayanti', 'teachers day': 'teachersday',
    'childrens day': 'childrensday', 'womens day': 'womensday',
    'mens day': 'mensday', 'environment day': 'environmentday',
    'yoga day': 'yogaday', 'health day': 'healthday', 'peace day': 'peaceday',
    'human rights day': 'humanrightsday', 'constitution day': 'constitutionday',
    'result day': 'resultday', 'exam success': 'examsuccess',
    'orientation day': 'orientationday', 'internship completion': 'internshipcompletion',
    'project completion': 'projectcompletion', 'startup launch': 'startuplaunch',
    'app launch': 'applaunch', 'website launch': 'websitelaunch',
    'game launch': 'gamelaunch', 'hackathon day': 'hackathonday',
    'coding day': 'codingday', 'design showcase': 'designshowcase',
    'ai project': 'aiproject', 'followers celebration': 'followerscelebration',
    'creator day': 'creatorday', 'innovation day': 'innovationday',
    'gratitude day': 'gratitudeday', 'thank you day': 'thankyouday',
    'apology day': 'apologyday', 'motivation day': 'motivationday',
    'self love day': 'selfloveday', 'hope day': 'hopeday',
    'tribute day': 'tributeday', 'memorial day': 'memorialday',
    'inspiration day': 'inspirationday', 'lucky day': 'luckyday',
    'destiny day': 'destinyday', 'first meet': 'firstmeet',
    'last day': 'lastday', 'golden moment': 'goldenmoment',
    'silent day': 'silentday', 'unforgettable day': 'unforgettableday',
    'magic day': 'magicday', 'surprise day': 'surpriseday',
    'forever moment': 'forevermoment', 'naming ceremony': 'namingceremony',
    'house warming': 'housewarming', 'success party': 'successparty',
    'first job': 'firstjob', 'new beginning': 'newbeginning',
    'memory day': 'memoryday', 'special moment': 'specialmoment',
    'dream come true': 'dreamcometrue', 'promise day': 'promiseday',
    'rose day': 'roseday', 'chocolate day': 'chocolateday',
    'hug day': 'hugday', 'kiss day': 'kissday', 'couple day': 'coupleday',
    'love day': 'loveday', 'friendship day': 'friendshipday',
    'best friend day': 'bestfriendday', 'good friday': 'goodfriday',
    'eid milad': 'eidmilad'
};

async function loadFestivalImage(occasion, customOccasion) {
    // 1. Try primary key match
    if (FESTIVAL_IMAGES[occasion]) {
        const img = await tryLoadImage(FESTIVAL_IMAGES[occasion]);
        if (img) return img;
    }

    // 2. Search within custom occasion text
    const text = (customOccasion || occasion || '').toLowerCase().trim();
    if (!text) return null;

    // 3. Check keyword mappings first (more specific matches)
    for (const [keyword, target] of Object.entries(KEYWORD_MAPPINGS)) {
        if (text.includes(keyword) && FESTIVAL_IMAGES[target]) {
            const img = await tryLoadImage(FESTIVAL_IMAGES[target]);
            if (img) return img;
        }
    }

    // 4. Direct key match in text
    for (const [key, path] of Object.entries(FESTIVAL_IMAGES)) {
        if (text.includes(key)) {
            const img = await tryLoadImage(path);
            if (img) return img;
        }
    }

    return null;
}

async function tryLoadImage(src) {
    if (!src) return null;
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

/**
 * Main Export - Strictly uses local assets
 * Now supports user-selected theme images
 */
export const generateCelebrationImage = async (wishData) => {
    const { occasion, customOccasion, themeImage, selectedTheme } = wishData;
    const highlight = wishData.colorHighlight || '#ff6b6b';
    const bg = wishData.colorBg || '#0a0a0f';

    // If user selected gradient only, skip image loading
    if (selectedTheme === 'gradient') {
        return createGradientBackground(bg, highlight);
    }

    // Try user-selected theme image first
    if (themeImage) {
        const userSelectedImage = await tryLoadImage(themeImage);
        if (userSelectedImage) {
            const canvas = document.createElement('canvas');
            canvas.width = userSelectedImage.width;
            canvas.height = userSelectedImage.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(userSelectedImage, 0, 0);
            return canvas.toDataURL('image/jpeg', 0.9);
        }
    }

    // Fall back to default festival image
    const festivalImage = await loadFestivalImage(occasion, customOccasion);

    if (festivalImage) {
        const canvas = document.createElement('canvas');
        canvas.width = festivalImage.width;
        canvas.height = festivalImage.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(festivalImage, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.9);
    }

    // Final fallback - gradient background
    return createGradientBackground(bg, highlight);
};

// Helper for gradient background
function createGradientBackground(bg, highlight) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
    grad.addColorStop(0, bg);
    grad.addColorStop(1, highlight + '33');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);
    return canvas.toDataURL('image/jpeg', 0.8);
}


// Export the list of occasions for use in WishForm
export const OCCASION_CATEGORIES = {
    'Personal & Life Moments': [
        { key: 'birthday', label: '🎂 Birthday' },
        { key: 'anniversary', label: '💍 Anniversary' },
        { key: 'wedding', label: '💒 Wedding' },
        { key: 'engagement', label: '💎 Engagement' },
        { key: 'proposal', label: '💝 Proposal' },
        { key: 'babyshower', label: '👶 Baby Shower' },
        { key: 'namingceremony', label: '📜 Naming Ceremony' },
        { key: 'graduation', label: '🎓 Graduation' },
        { key: 'promotion', label: '📈 Promotion' },
        { key: 'retirement', label: '🌅 Retirement' },
        { key: 'housewarming', label: '🏠 Housewarming' },
        { key: 'farewell', label: '👋 Farewell' },
        { key: 'welcome', label: '🎊 Welcome' },
        { key: 'reunion', label: '🤝 Reunion' },
        { key: 'successparty', label: '🎉 Success Party' },
        { key: 'achievement', label: '🏆 Achievement' },
        { key: 'firstjob', label: '💼 First Job' },
        { key: 'newbeginning', label: '🌱 New Beginning' },
        { key: 'memoryday', label: '📸 Memory Day' },
        { key: 'specialmoment', label: '✨ Special Moment' },
        { key: 'dreamcometrue', label: '🌟 Dream Come True' },
        { key: 'comeback', label: '💪 Comeback' },
        { key: 'victory', label: '🏅 Victory' }
    ],
    'Love & Relationship': [
        { key: 'valentinesday', label: '💘 Valentine\'s Day' },
        { key: 'promiseday', label: '🤙 Promise Day' },
        { key: 'roseday', label: '🌹 Rose Day' },
        { key: 'chocolateday', label: '🍫 Chocolate Day' },
        { key: 'hugday', label: '🤗 Hug Day' },
        { key: 'kissday', label: '💋 Kiss Day' },
        { key: 'coupleday', label: '👫 Couple Day' },
        { key: 'loveday', label: '❤️ Love Day' },
        { key: 'friendshipday', label: '🤝 Friendship Day' },
        { key: 'bestfriendday', label: '👯 Best Friend Day' }
    ],
    'Festivals': [
        { key: 'diwali', label: '🪔 Diwali' },
        { key: 'holi', label: '🎨 Holi' },
        { key: 'christmas', label: '🎄 Christmas' },
        { key: 'newyear', label: '🎆 New Year' },
        { key: 'easter', label: '🐣 Easter' },
        { key: 'thanksgiving', label: '🦃 Thanksgiving' },
        { key: 'pongal', label: '🌾 Pongal' },
        { key: 'onam', label: '🚣 Onam' },
        { key: 'navratri', label: '💃 Navratri' },
        { key: 'dussehra', label: '🏹 Dussehra' },
        { key: 'ganeshchaturthi', label: '🐘 Ganesh Chaturthi' },
        { key: 'janmashtami', label: '🦚 Janmashtami' },
        { key: 'mahashivaratri', label: '🔱 Maha Shivaratri' },
        { key: 'rakshabandhan', label: '🎀 Raksha Bandhan' },
        { key: 'bhaidooj', label: '👨‍👧 Bhai Dooj' },
        { key: 'karwachauth', label: '🌙 Karwa Chauth' },
        { key: 'lohri', label: '🔥 Lohri' },
        { key: 'baisakhi', label: '🌻 Baisakhi' },
        { key: 'vasantpanchami', label: '🎶 Vasant Panchami' },
        { key: 'chhathpuja', label: '☀️ Chhath Puja' },
        { key: 'makarsankranti', label: '🪁 Makar Sankranti' },
        { key: 'eid', label: '🌙 Eid' },
        { key: 'ramadan', label: '☪️ Ramadan' },
        { key: 'eidmilad', label: '🕌 Eid Milad' },
        { key: 'bakrid', label: '🐐 Bakrid' },
        { key: 'goodfriday', label: '✝️ Good Friday' }
    ],
    'Family Days': [
        { key: 'mothersday', label: '👩 Mother\'s Day' },
        { key: 'fathersday', label: '👨 Father\'s Day' }
    ],
    'National & Awareness Days': [
        { key: 'independenceday', label: '🇮🇳 Independence Day' },
        { key: 'republicday', label: '🏛️ Republic Day' },
        { key: 'gandhijayanti', label: '🕊️ Gandhi Jayanti' },
        { key: 'teachersday', label: '📚 Teachers Day' },
        { key: 'childrensday', label: '👧 Children\'s Day' },
        { key: 'womensday', label: '👩 Women\'s Day' },
        { key: 'mensday', label: '👨 Men\'s Day' },
        { key: 'environmentday', label: '🌿 Environment Day' },
        { key: 'yogaday', label: '🧘 Yoga Day' },
        { key: 'healthday', label: '🏥 Health Day' },
        { key: 'peaceday', label: '☮️ Peace Day' },
        { key: 'humanrightsday', label: '⚖️ Human Rights Day' },
        { key: 'constitutionday', label: '📜 Constitution Day' }
    ],
    'Education & Career': [
        { key: 'resultday', label: '📊 Result Day' },
        { key: 'examsuccess', label: '✅ Exam Success' },
        { key: 'convocation', label: '🎓 Convocation' },
        { key: 'orientationday', label: '🏫 Orientation Day' },
        { key: 'internshipcompletion', label: '📋 Internship Completion' },
        { key: 'projectcompletion', label: '✔️ Project Completion' },
        { key: 'startuplaunch', label: '🚀 Startup Launch' },
        { key: 'applaunch', label: '📱 App Launch' },
        { key: 'websitelaunch', label: '🌐 Website Launch' }
    ],
    'Digital & Creative': [
        { key: 'gamelaunch', label: '🎮 Game Launch' },
        { key: 'hackathonday', label: '💻 Hackathon Day' },
        { key: 'codingday', label: '👨‍💻 Coding Day' },
        { key: 'designshowcase', label: '🎨 Design Showcase' },
        { key: 'aiproject', label: '🤖 AI Project' },
        { key: 'milestone', label: '🏁 Milestone' },
        { key: 'followerscelebration', label: '📈 Followers Celebration' },
        { key: 'creatorday', label: '🎬 Creator Day' },
        { key: 'innovationday', label: '💡 Innovation Day' }
    ],
    'Emotional & Meaningful': [
        { key: 'gratitudeday', label: '🙏 Gratitude Day' },
        { key: 'thankyouday', label: '💐 Thank You Day' },
        { key: 'apologyday', label: '🤝 Apology Day' },
        { key: 'motivationday', label: '💪 Motivation Day' },
        { key: 'selfloveday', label: '💖 Self Love Day' },
        { key: 'hopeday', label: '🌈 Hope Day' },
        { key: 'tributeday', label: '🕯️ Tribute Day' },
        { key: 'memorialday', label: '🎗️ Memorial Day' },
        { key: 'inspirationday', label: '⭐ Inspiration Day' }
    ],
    'Unique Occasions': [
        { key: 'luckyday', label: '🍀 Lucky Day' },
        { key: 'destinyday', label: '🔮 Destiny Day' },
        { key: 'firstmeet', label: '👋 First Meet' },
        { key: 'lastday', label: '🌇 Last Day' },
        { key: 'goldenmoment', label: '🌟 Golden Moment' },
        { key: 'silentday', label: '🤫 Silent Day' },
        { key: 'unforgettableday', label: '💎 Unforgettable Day' },
        { key: 'magicday', label: '✨ Magic Day' },
        { key: 'surpriseday', label: '🎁 Surprise Day' },
        { key: 'forevermoment', label: '♾️ Forever Moment' }
    ]
};
