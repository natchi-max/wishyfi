export const wishTemplates = {
  birthday: {
    messages: [
      "Wishing you joy and happiness on your special day! 🎂",
      "Another year of amazing adventures awaits! 🎉",
      "May your birthday be filled with magic and wonder! ✨"
    ],
    colors: ["#667eea", "#ec4899", "#f59e0b"],
    emojis: ["🎂", "🎈", "🎁", "✨"]
  },
  anniversary: {
    messages: [
      "Love grows stronger with each passing year! 💕",
      "Celebrating your beautiful journey together! 💑",
      "Here's to many more years of happiness! 🥂"
    ],
    colors: ["#ef4444", "#ec4899", "#f59e0b"],
    emojis: ["💕", "💑", "🌹", "💍"]
  },
  wedding: {
    messages: [
      "Wishing you a lifetime of love and happiness! 💒",
      "May your love story be magical forever! 👰",
      "Congratulations on your perfect day! 🎊"
    ],
    colors: ["#f8fafc", "#ec4899", "#667eea"],
    emojis: ["💒", "👰", "🤵", "💐"]
  },
  graduation: {
    messages: [
      "Congratulations on your amazing achievement! 🎓",
      "The future is bright and full of possibilities! 🌟",
      "Your hard work has paid off beautifully! 📚"
    ],
    colors: ["#10b981", "#3b82f6", "#6366f1"],
    emojis: ["🎓", "📚", "🌟", "🏆"]
  },
  engagement: {
    messages: [
      "Congratulations on your engagement! 💍",
      "Wishing you both a lifetime of happiness together! ✨",
      "So happy for you two on this magical step! 🥂"
    ],
    colors: ["#3b82f6", "#ec4899", "#f59e0b"],
    emojis: ["💍", "💎", "🥂", "💖"]
  },
  babyshower: {
    messages: [
      "Wishing you all the best as you welcome your little one! 👶",
      "May your new arrival bring endless joy to your home! ✨",
      "Congratulations on the upcoming addition to your family! 🍼"
    ],
    colors: ["#3b82f6", "#ec4899", "#10b981"],
    emojis: ["👶", "🍼", "🧸", "✨"]
  },
  newyear: {
    messages: [
      "Wishing you a year full of magic and success! 🎆",
      "May 2024 be your best year yet! ✨",
      "Cheers to new beginnings and amazing adventures! 🥂"
    ],
    colors: ["#f59e0b", "#6366f1", "#ef4444"],
    emojis: ["🎆", "✨", "🥂", "🎊"]
  },
  christmas: {
    messages: [
      "Wishing you a magical and merry Christmas! 🎄",
      "May your holidays be filled with warmth and joy! ✨",
      "Sending you love and magic this holiday season! 🎅"
    ],
    colors: ["#ef4444", "#10b981", "#f59e0b"],
    emojis: ["🎄", "🎅", "🎁", "✨"]
  },
  diwali: {
    messages: [
      "Wishing you a bright and prosperous Diwali! 🪔",
      "May the festival of lights bring magic to your life! ✨",
      "Happy Diwali to you and your family! 🎆"
    ],
    colors: ["#f59e0b", "#ef4444", "#ec4899"],
    emojis: ["🪔", "🎆", "✨", "📿"]
  },
  eid: {
    messages: [
      "Eid Mubarak! Wishing you peace and happiness! 🌙",
      "May this Eid bring magic and joy to your family! ✨",
      "Wishing you a blessed and wonderful Eid! 🕌"
    ],
    colors: ["#10b981", "#f59e0b", "#3b82f6"],
    emojis: ["🌙", "🕌", "✨", "🤝"]
  },
  valentinesday: {
    messages: [
      "Happy Valentine's Day to my favorite person! ❤️",
      "You make every day feel like magic! ✨",
      "Wishing you a day filled with love and romance! 🌹"
    ],
    colors: ["#ef4444", "#ec4899", "#f59e0b"],
    emojis: ["❤️", "🌹", "💘", "✨"]
  },
  friendshipday: {
    messages: [
      "Thank you for being such a magical friend! 🤝",
      "Wishing you a very Happy Friendship Day! ✨",
      "So grateful for our beautiful friendship! 💖"
    ],
    colors: ["#f59e0b", "#3b82f6", "#10b981"],
    emojis: ["🤝", "💖", "✨", "👯"]
  },
  mothersday: {
    messages: [
      "Happy Mother's Day to the most amazing mom! 👩",
      "Thank you for all the magic you bring to our lives! ✨",
      "Wishing you a day as wonderful as you are! 💖"
    ],
    colors: ["#ec4899", "#f59e0b", "#6366f1"],
    emojis: ["👩", "💖", "🌹", "✨"]
  },
  fathersday: {
    messages: [
      "Happy Father's Day to the best dad ever! 👨",
      "Thank you for your guidance and magic! ✨",
      "Wishing you a wonderful day filled with joy! 🏆"
    ],
    colors: ["#3b82f6", "#10b981", "#f59e0b"],
    emojis: ["👨", "🏆", "✨", "💪"]
  },
  achievement: {
    messages: [
      "Congratulations on your amazing achievement! 🏆",
      "So proud of your hard work and success! ✨",
      "This is just the beginning of your magic! 🌟"
    ],
    colors: ["#f59e0b", "#10b981", "#3b82f6"],
    emojis: ["🏆", "🌟", "✨", "👏"]
  }
};

// Default generic templates for any occasion
const defaultTemplates = {
  messages: [
    "Wishing you magic and joy on this special occasion! ✨",
    "May your day be as wonderful as you are! 🌟",
    "Sending you love and happiness today! 💖",
    "Congratulations and best wishes to you! 🎉",
    "May this special day bring you endless smiles! 😊"
  ],
  colors: ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"],
  emojis: ["✨", "🌟", "🎉", "💖", "🎊"]
};

export const getRandomTemplate = (occasion, occasionLabel = '') => {
  const template = wishTemplates[occasion] || defaultTemplates;

  // Dynamic message construction for custom occasions
  let message = template.messages[Math.floor(Math.random() * template.messages.length)];

  // If we have a label and it's a default template, try to make it smarter
  if (occasionLabel && !wishTemplates[occasion]) {
    const smartMessages = [
      `Happy ${occasionLabel}! Wishing you a magical day! ✨`,
      `May your ${occasionLabel} be filled with joy and wonder! 🌟`,
      `Congratulations on your ${occasionLabel}! So happy for you! 🎉`,
      `Sending you best wishes for a wonderful ${occasionLabel}! 💖`,
      `Wishing you all the success and happiness on this ${occasionLabel}! 🚀`
    ];
    message = smartMessages[Math.floor(Math.random() * smartMessages.length)];
  }

  return {
    message: message,
    color: template.colors[Math.floor(Math.random() * template.colors.length)],
    emoji: template.emojis[Math.floor(Math.random() * template.emojis.length)]
  };
};