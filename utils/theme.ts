
export type ThemeName = 'violet' | 'ocean' | 'nature' | 'volcano' | 'custom';
export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSizeLevel = 'small' | 'medium' | 'large' | 'xl';

export const FONT_SIZE_KEY = 'cinevocab_font_size';

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

// Light Themes (Material 3 Standard)
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

// Dark Themes (Material 3 Dark Tokens)
// High contrast text (E6E1E5), Dark Surfaces (141218), Desaturated/Lighter Primaries
export const darkThemes: Record<Exclude<ThemeName, 'custom'>, ThemeColors> = {
  violet: {
    '--md-surface': '#141218',
    '--md-surface-container': '#211F26',
    '--md-on-surface': '#E6E1E5',
    '--md-primary': '#D0BCFF', // Lighter purple
    '--md-on-primary': '#381E72',
    '--md-primary-container': '#4F378B', // Darker purple container
    '--md-on-primary-container': '#EADDFF',
    '--md-secondary-container': '#4A4458',
    '--md-on-secondary-container': '#E8DEF8',
    '--md-outline': '#938F99',
    '--md-error': '#F2B8B5',
    '--md-error-container': '#8C1D18',
  },
  ocean: {
    '--md-surface': '#001F26',
    '--md-surface-container': '#00363D',
    '--md-on-surface': '#A6EEFF',
    '--md-primary': '#6AD3FF',
    '--md-on-primary': '#003545',
    '--md-primary-container': '#004D64',
    '--md-on-primary-container': '#BDE9FF',
    '--md-secondary-container': '#354A53',
    '--md-on-secondary-container': '#CDE6F2',
    '--md-outline': '#899297',
    '--md-error': '#FFB4AB',
    '--md-error-container': '#93000A',
  },
  nature: {
    '--md-surface': '#10140F',
    '--md-surface-container': '#1D211B',
    '--md-on-surface': '#E2E3DE',
    '--md-primary': '#94D989',
    '--md-on-primary': '#033906',
    '--md-primary-container': '#155217',
    '--md-on-primary-container': '#AFF4A4',
    '--md-secondary-container': '#3E4A3B',
    '--md-on-secondary-container': '#D7E7D1',
    '--md-outline': '#8C9389',
    '--md-error': '#FFB4AB',
    '--md-error-container': '#93000A',
  },
  volcano: {
    '--md-surface': '#201A19',
    '--md-surface-container': '#332B29',
    '--md-on-surface': '#EDE0DE',
    '--md-primary': '#FFB5A0',
    '--md-on-primary': '#5F1500',
    '--md-primary-container': '#81280C',
    '--md-on-primary-container': '#FFDBD1',
    '--md-secondary-container': '#59403B',
    '--md-on-secondary-container': '#FADCD4',
    '--md-outline': '#A08C87',
    '--md-error': '#FFB4AB',
    '--md-error-container': '#93000A',
  }
};

export const SEED_COLORS: Record<Exclude<ThemeName, 'custom'>, string> = {
  violet: '#6750A4',
  ocean: '#006684',
  nature: '#2D6C2B',
  volcano: '#A33C1E',
};

// Helper to determine active mode
export const getSystemMode = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

export const applyTheme = (themeName: ThemeName, mode: ThemeMode, customColor?: string) => {
  const root = document.documentElement;
  let colors: ThemeColors;
  
  // Resolve mode
  const activeMode = mode === 'system' ? getSystemMode() : mode;
  const isDark = activeMode === 'dark';

  // Toggle class for Tailwind dark mode variant support
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  if (themeName === 'custom' && customColor) {
    // Generate Custom Theme on the fly
    if (isDark) {
      colors = {
        '--md-surface': '#141414',
        '--md-surface-container': '#1E1E1E',
        '--md-on-surface': '#E6E6E6',
        '--md-primary': adjustBrightness(customColor, 40), // Make pastel/lighter
        '--md-on-primary': '#000000', // Dark text on light primary
        '--md-primary-container': adjustBrightness(customColor, -40), // Darker container
        '--md-on-primary-container': '#F0F0F0',
        '--md-secondary-container': adjustBrightness(customColor, -60),
        '--md-on-secondary-container': '#E0E0E0',
        '--md-outline': '#938F99',
        '--md-error': '#F2B8B5',
        '--md-error-container': '#8C1D18',
      };
    } else {
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
    }
  } else {
    // Standard themes
    const source = isDark ? darkThemes : themes;
    colors = source[themeName as keyof typeof themes] || (isDark ? darkThemes.violet : themes.violet);
  }

  // 1. Set CSS Variables
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // 2. IOS FIX: Direct Body Background & Meta Tag
  // Safari on iOS PWA often relies on the actual body background color for overscroll areas,
  // and sometimes won't update the status bar immediately if only CSS vars change.
  // We explicitly set the style property to force a repaint.
  const surfaceColor = colors['--md-surface'];
  document.body.style.backgroundColor = surfaceColor;

  const metaThemeColor = document.getElementById('theme-color-meta') || document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
      metaThemeColor.setAttribute('content', surfaceColor);
  } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = surfaceColor;
      meta.id = 'theme-color-meta';
      document.head.appendChild(meta);
  }
};

export const applyFontSize = (level: FontSizeLevel) => {
  const sizeMap: Record<FontSizeLevel, string> = {
    small: '12px',
    medium: '14px',
    large: '16px',
    xl: '18px',
  };
  if (typeof document !== 'undefined') {
      document.documentElement.style.fontSize = sizeMap[level] || '14px';
  }
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
