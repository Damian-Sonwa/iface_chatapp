// Theme system for mood-based themes
export const themes = {
  default: {
    name: 'Default',
    colors: {
      primary: '271 81% 56%', // Purple
      secondary: '239 84% 67%',
      accent: '259 94% 51%',
      background: '0 0% 100%',
      foreground: '30 10% 10%'
    },
    dark: {
      primary: '271 81% 56%',
      secondary: '239 84% 67%',
      accent: '259 94% 51%',
      background: '222 47% 11%',
      foreground: '0 0% 98%'
    }
  },
  ocean: {
    name: 'Ocean',
    colors: {
      primary: '200 100% 45%',
      secondary: '195 100% 95%',
      accent: '190 90% 50%',
      background: '210 40% 98%',
      foreground: '210 20% 10%'
    },
    dark: {
      primary: '200 100% 55%',
      secondary: '200 50% 30%',
      accent: '195 90% 60%',
      background: '210 30% 15%',
      foreground: '210 10% 95%'
    }
  },
  forest: {
    name: 'Forest',
    colors: {
      primary: '142 76% 36%',
      secondary: '142 40% 95%',
      accent: '140 80% 40%',
      background: '120 20% 98%',
      foreground: '140 20% 10%'
    },
    dark: {
      primary: '142 70% 45%',
      secondary: '140 30% 25%',
      accent: '142 65% 50%',
      background: '140 25% 12%',
      foreground: '140 10% 92%'
    }
  },
  sunset: {
    name: 'Sunset',
    colors: {
      primary: '15 90% 55%',
      secondary: '30 80% 95%',
      accent: '25 85% 60%',
      background: '35 30% 98%',
      foreground: '20 15% 12%'
    },
    dark: {
      primary: '15 85% 60%',
      secondary: '25 40% 30%',
      accent: '20 80% 65%',
      background: '25 25% 15%',
      foreground: '25 10% 90%'
    }
  },
  purple: {
    name: 'Purple',
    colors: {
      primary: '270 80% 60%',
      secondary: '270 50% 96%',
      accent: '280 70% 65%',
      background: '280 20% 98%',
      foreground: '270 15% 12%'
    },
    dark: {
      primary: '270 75% 65%',
      secondary: '270 40% 28%',
      accent: '280 70% 70%',
      background: '270 25% 16%',
      foreground: '270 10% 92%'
    }
  },
  blue: {
    name: 'Blue',
    colors: {
      primary: '217 91% 60%',
      secondary: '210 60% 96%',
      accent: '215 85% 65%',
      background: '220 30% 98%',
      foreground: '220 20% 10%'
    },
    dark: {
      primary: '217 85% 65%',
      secondary: '215 30% 28%',
      accent: '220 80% 70%',
      background: '220 25% 18%',
      foreground: '220 10% 95%'
    }
  }
};

export const vibes = {
  Chill: {
    emoji: '🎧',
    theme: 'ocean',
    description: 'Relaxed and calm vibes'
  },
  Busy: {
    emoji: '💼',
    theme: 'default',
    description: 'Working hard'
  },
  Focused: {
    emoji: '🔕',
    theme: 'forest',
    description: 'Deep in concentration'
  },
  Energetic: {
    emoji: '⚡',
    theme: 'sunset',
    description: 'Full of energy'
  },
  Creative: {
    emoji: '🎨',
    theme: 'purple',
    description: 'Feeling creative'
  }
};

export const applyTheme = (themeName, isDark = false) => {
  const theme = themes[themeName] || themes.default;
  const colors = isDark ? theme.dark : theme.colors;

  const root = document.documentElement;
  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--secondary', colors.secondary);
  root.style.setProperty('--accent', colors.accent);
  root.style.setProperty('--background', colors.background);
  root.style.setProperty('--foreground', colors.foreground);
};

export const getVibeTheme = (vibe, userTheme, autoVibe) => {
  if (autoVibe && vibe) {
    const vibeConfig = vibes[vibe];
    return vibeConfig?.theme || userTheme || 'default';
  }
  return userTheme || 'default';
};







