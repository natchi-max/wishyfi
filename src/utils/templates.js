export const wishTemplates = {
  birthday: {
    messages: [
      "Wishing you joy and happiness on your special day! 🎂",
      "Another year of amazing adventures awaits! 🎉",
      "May your birthday be filled with magic and wonder! ✨"
    ],
    colors: ["#ff6b6b", "#4ecdc4", "#45b7d1"],
    emojis: ["🎂", "🎈", "🎁", "✨"]
  },
  anniversary: {
    messages: [
      "Love grows stronger with each passing year! 💕",
      "Celebrating your beautiful journey together! 💑",
      "Here's to many more years of happiness! 🥂"
    ],
    colors: ["#e74c3c", "#f39c12", "#e91e63"],
    emojis: ["💕", "💑", "🌹", "💍"]
  },
  wedding: {
    messages: [
      "Wishing you a lifetime of love and happiness! 💒",
      "May your love story be magical forever! 👰",
      "Congratulations on your perfect day! 🎊"
    ],
    colors: ["#f8f9fa", "#ffc0cb", "#dda0dd"],
    emojis: ["💒", "👰", "🤵", "💐"]
  },
  graduation: {
    messages: [
      "Congratulations on your amazing achievement! 🎓",
      "The future is bright and full of possibilities! 🌟",
      "Your hard work has paid off beautifully! 📚"
    ],
    colors: ["#28a745", "#17a2b8", "#6f42c1"],
    emojis: ["🎓", "📚", "🌟", "🏆"]
  }
};

export const getRandomTemplate = (occasion) => {
  const template = wishTemplates[occasion];
  if (!template) return null;
  
  return {
    message: template.messages[Math.floor(Math.random() * template.messages.length)],
    color: template.colors[Math.floor(Math.random() * template.colors.length)],
    emoji: template.emojis[Math.floor(Math.random() * template.emojis.length)]
  };
};