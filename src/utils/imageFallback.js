/**
 * Smart fallback mappings for missing occasion images.
 * Maps specific missing occasions to available broad categories.
 */

const AVAILABLE_IMAGES = [
    'achievement', 'anniversary', 'babyshower', 'birthday', 'celebration',
    'christmas', 'comeback', 'diwali', 'dreamcometrue', 'eid',
    'engagement', 'farewell', 'fathersday', 'firstjob', 'ganeshchaturthi',
    'graduation', 'holi', 'housewarming', 'memoryday', 'mothersday',
    'namingceremony', 'navratri', 'newbeginning', 'newyear', 'onam',
    'pongal', 'promotion', 'proposal', 'rakshabandhan', 'retirement',
    'reunion', 'specialmoment', 'successparty', 'thanksgiving',
    'victory', 'wedding', 'welcome'
];

const FALLBACK_MAPPINGS = {
    // Love & Relationship
    'valentinesday': 'anniversary',
    'promiseday': 'anniversary',
    'roseday': 'specialmoment',
    'chocolateday': 'celebration',
    'hugday': 'specialmoment',
    'kissday': 'specialmoment',
    'coupleday': 'anniversary',
    'loveday': 'anniversary',
    'friendshipday': 'celebration',
    'bestfriendday': 'celebration',

    // Major Holidays
    'easter': 'celebration',
    'goodfriday': 'specialmoment',

    // Indian Festivals
    'dussehra': 'diwali',
    'janmashtami': 'celebration',
    'mahashivaratri': 'celebration',
    'vasantpanchami': 'celebration',
    'lohri': 'celebration',
    'baisakhi': 'celebration',
    'karwachauth': 'anniversary',
    'bhaidooj': 'rakshabandhan',
    'chhathpuja': 'celebration',
    'makarsankranti': 'pongal',

    // Islamic Festivals
    'ramadan': 'eid',
    'eidmilad': 'eid',
    'bakrid': 'eid',

    // National & Awareness
    'independenceday': 'victory',
    'republicday': 'victory',
    'gandhijayanti': 'specialmoment',
    'teachersday': 'specialmoment',
    'childrensday': 'celebration',
    'womensday': 'specialmoment',
    'mensday': 'specialmoment',
    'environmentday': 'specialmoment',
    'yogaday': 'newbeginning',
    'healthday': 'newbeginning',
    'peaceday': 'specialmoment',
    'humanrightsday': 'specialmoment',
    'constitutionday': 'specialmoment',

    // Education & Career
    'resultday': 'achievement',
    'examsuccess': 'achievement',
    'convocation': 'graduation',
    'orientationday': 'welcome',
    'internshipcompletion': 'achievement',
    'projectcompletion': 'successparty',
    'startuplaunch': 'newbeginning',
    'applaunch': 'newbeginning',
    'websitelaunch': 'newbeginning',

    // Digital & Creative
    'gamelaunch': 'newbeginning',
    'hackathonday': 'achievement',
    'codingday': 'achievement',
    'designshowcase': 'specialmoment',
    'aiproject': 'newbeginning',
    'milestone': 'achievement',
    'followerscelebration': 'successparty',
    'creatorday': 'specialmoment',
    'innovationday': 'newbeginning',

    // Emotional & Meaningful
    'gratitudeday': 'specialmoment',
    'thankyouday': 'specialmoment',
    'apologyday': 'specialmoment',
    'motivationday': 'newbeginning',
    'selfloveday': 'specialmoment',
    'hopeday': 'newbeginning',
    'tributeday': 'memoryday',
    'memorialday': 'memoryday',
    'inspirationday': 'newbeginning',

    // Unique Occasions
    'luckyday': 'dreamcometrue',
    'destinyday': 'dreamcometrue',
    'firstmeet': 'specialmoment',
    'lastday': 'farewell',
    'goldenmoment': 'specialmoment',
    'silentday': 'specialmoment',
    'unforgettableday': 'memoryday',
    'magicday': 'dreamcometrue',
    'surpriseday': 'celebration',
    'forevermoment': 'anniversary'
};

export const getOccasionImage = (occasion) => {
    const cleanOccasion = occasion?.toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. Direct match
    if (AVAILABLE_IMAGES.includes(cleanOccasion)) {
        return `/images/festivals/${cleanOccasion}.png`;
    }

    // 2. Mapped fallback
    if (FALLBACK_MAPPINGS[cleanOccasion]) {
        return `/images/festivals/${FALLBACK_MAPPINGS[cleanOccasion]}.png`;
    }

    // 3. Generic fallback
    return '/images/festivals/celebration.png';
};
