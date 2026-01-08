export type ThemeName = 'violet' | 'ocean' | 'nature' | 'volcano' | 'custom';

export interface ThemeColors {
  '--md-surface': string;
  '--md-surface-container': string;
  '--md-on-surface': string;
  '--md-primary': string;
  '--md-on-primary': string;
  '--md-primary-container': string;
  '--md-on-primary-container': string;
  '--md-secondary-container': string;
  '--md-on-secondary-container': string;
  '--md-outline': string;
  '--md-error': string;
  '--md-error-container': string;
}

export const themes: Record<Exclude<ThemeName, 'custom'>, ThemeColors> = {
  violet: {
    '--md-surface': '#FDF7FF',
    '--md-surface-container': '#F3EDF7',
    '--md-on-surface': '#1D1B20',
    '--md-primary': '#6750A4',
    '--md-on-primary': '#FFFFFF',
    '--md-primary-container': '#EADDFF',
    '--md-on-primary-container': '#21005D',
    '--md-secondary-container': '#E8DEF8',
    '--md-on-secondary-container': '#1D192B',
    '--md-outline': '#79747E',
    '--md-error': '#B3261E',
    '--md-error-container': '#F9DEDC',
  },
  ocean: {
    '--md-surface': '#F4FBFC',
    '--md-surface-container': '#E0F4F7',
    '--md-on-surface': '#001F26',
    '--md-primary': '#006684',
    '--md-on-primary': '#FFFFFF',
    '--md-primary-container': '#BDE9FF',
    '--md-on-primary-container': '#001F2A',
    '--md-secondary-container': '#CDE6F2',
    '--md-on-secondary-container': '#061E27',
    '--md-outline': '#70787D',
    '--md-error': '#BA1A1A',
    '--md-error-container': '#FFDAD6',
  },
  nature: {
    '--md-surface': '#F6FBF3',
    '--md-surface-container': '#E8F5E3',
    '--md-on-surface': '#042105',
    '--md-primary': '#2D6C2B',
    '--md-on-primary': '#FFFFFF',
    '--md-primary-container': '#AFF4A4',
    '--md-on-primary-container': '#002201',
    '--md-secondary-container': '#D7E7D1',
    '--md-on-secondary-container': '#121F10',
    '--md-outline': '#72796F',
    '--md-error': '#BA1A1A',
    '--md-error-container': '#FFDAD6',
  },
  volcano: {
    '--md-surface': '#FFF8F6',
    '--md-surface-container': '#FCEAE5',
    '--md-on-surface': '#231917',
    '--md-primary': '#A33C1E',
    '--md-on-primary': '#FFFFFF',
    '--md-primary-container': '#FFDBD1',
    '--md-on-primary-container': '#3C0600',
    '--md-secondary-container': '#FADCD4',
    '--md-on-secondary-container': '#2C1611',
    '--md-outline': '#85736E',
    '--md-error': '#BA1A1A',
    '--md-error-container': '#FFDAD6',
  }
};

export const SEED_COLORS: Record<Exclude<ThemeName, 'custom'>, string> = {
  violet: '#6750A4',
  ocean: '#006684',
  nature: '#2D6C2B',
  volcano: '#A33C1E',
};

export const applyTheme = (themeName: ThemeName, customColor?: string) => {
  const root = document.documentElement;
  let colors: ThemeColors;

  if (themeName === 'custom' && customColor) {
    // Very basic generation for custom color to keep it lightweight
    // Ideally this would use a library like material-color-utilities
    colors = {
      '--md-surface': '#FAFAFA',
      '--md-surface-container': '#F0F0F0',
      '--md-on-surface': '#1C1C1C',
      '--md-primary': customColor,
      '--md-on-primary': '#FFFFFF',
      '--md-primary-container': adjustBrightness(customColor, 140), // Lighter
      '--md-on-primary-container': adjustBrightness(customColor, -60), // Darker
      '--md-secondary-container': adjustBrightness(customColor, 130),
      '--md-on-secondary-container': '#1D1D1D',
      '--md-outline': '#79747E',
      '--md-error': '#B3261E',
      '--md-error-container': '#F9DEDC',
    };
  } else {
    colors = themes[themeName as keyof typeof themes] || themes.violet;
  }

  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};

// Simple helper for custom colors (rough approx of tint/shade)
function adjustBrightness(col: string, amt: number) {
    let usePound = false;
    if (col[0] === "#") {
        col = col.slice(1);
        usePound = true;
    }
    const num = parseInt(col,16);
    let r = (num >> 16) + amt;
    if (r > 255) r = 255; else if  (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255; else if  (b < 0) b = 0;
    let g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255; else if (g < 0) g = 0;
    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}