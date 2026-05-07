export type Scheme = 'light' | 'dark';

export interface Palette {
  scheme: Scheme;
  accent: string;
  accentLight: string;
  bgTop: string;
  bgMid: string;
  bgBottom: string;
  glassBg: string;
  glassBorder: string;
  textDark: string;
  textMid: string;
  textDim: string;
}

export interface Theme {
  id: string;
  name: string;
  light: Palette;
  dark: Palette;
}

const DARK_GLASS_BG = 'rgba(255,255,255,0.06)';
const DARK_GLASS_BORDER = 'rgba(255,255,255,0.12)';
const LIGHT_GLASS_BG = 'rgba(255,255,255,0.55)';
const LIGHT_GLASS_BORDER = 'rgba(255,255,255,0.85)';

export const THEMES: Theme[] = [
  {
    id: 'sage-garden',
    name: 'Sage Garden',
    light: {
      scheme: 'light',
      accent: '#2D6A4F',
      accentLight: '#E8F5EE',
      bgTop: '#D4E8D4',
      bgMid: '#F7F3ED',
      bgBottom: '#E8F0E8',
      glassBg: LIGHT_GLASS_BG,
      glassBorder: LIGHT_GLASS_BORDER,
      textDark: '#1A1A2E',
      textMid: '#4A5568',
      textDim: '#9AA5B4',
    },
    dark: {
      scheme: 'dark',
      accent: '#6FBF8F',
      accentLight: 'rgba(111,191,143,0.18)',
      bgTop: '#0D1B14',
      bgMid: '#14241B',
      bgBottom: '#0A1410',
      glassBg: DARK_GLASS_BG,
      glassBorder: DARK_GLASS_BORDER,
      textDark: '#E8F0EC',
      textMid: '#B0BFB7',
      textDim: '#6E7C75',
    },
  },
  {
    id: 'midnight-mihrab',
    name: 'Midnight Mihrab',
    light: {
      scheme: 'light',
      accent: '#2C3E70',
      accentLight: '#E5EBF5',
      bgTop: '#DDE7F3',
      bgMid: '#F4F6FA',
      bgBottom: '#E2E9F1',
      glassBg: LIGHT_GLASS_BG,
      glassBorder: LIGHT_GLASS_BORDER,
      textDark: '#14213D',
      textMid: '#4A5C7A',
      textDim: '#8E99B0',
    },
    dark: {
      scheme: 'dark',
      accent: '#7BA3E8',
      accentLight: 'rgba(123,163,232,0.18)',
      bgTop: '#08111F',
      bgMid: '#101A2E',
      bgBottom: '#060C18',
      glassBg: DARK_GLASS_BG,
      glassBorder: DARK_GLASS_BORDER,
      textDark: '#E8EEF8',
      textMid: '#B0BBD1',
      textDim: '#6E7790',
    },
  },
  {
    id: 'desert-dawn',
    name: 'Desert Dawn',
    light: {
      scheme: 'light',
      accent: '#B8602A',
      accentLight: '#FBEFE3',
      bgTop: '#FBE5CE',
      bgMid: '#FFF7EE',
      bgBottom: '#F8E8D4',
      glassBg: LIGHT_GLASS_BG,
      glassBorder: LIGHT_GLASS_BORDER,
      textDark: '#2A1A10',
      textMid: '#6E4F3B',
      textDim: '#B49680',
    },
    dark: {
      scheme: 'dark',
      accent: '#F0A26A',
      accentLight: 'rgba(240,162,106,0.18)',
      bgTop: '#1F1208',
      bgMid: '#2B1A0E',
      bgBottom: '#170D06',
      glassBg: DARK_GLASS_BG,
      glassBorder: DARK_GLASS_BORDER,
      textDark: '#FBEFE3',
      textMid: '#C9B5A2',
      textDim: '#7C6A58',
    },
  },
  {
    id: 'jade-mosque',
    name: 'Jade Mosque',
    light: {
      scheme: 'light',
      accent: '#0F8F87',
      accentLight: '#DEF2F0',
      bgTop: '#C9E8E5',
      bgMid: '#F1FAF8',
      bgBottom: '#DCEEEC',
      glassBg: LIGHT_GLASS_BG,
      glassBorder: LIGHT_GLASS_BORDER,
      textDark: '#0E2A28',
      textMid: '#3F6663',
      textDim: '#8AA3A1',
    },
    dark: {
      scheme: 'dark',
      accent: '#4FCFC4',
      accentLight: 'rgba(79,207,196,0.18)',
      bgTop: '#08161A',
      bgMid: '#102528',
      bgBottom: '#060F12',
      glassBg: DARK_GLASS_BG,
      glassBorder: DARK_GLASS_BORDER,
      textDark: '#E0F4F2',
      textMid: '#A4C0BE',
      textDim: '#66807E',
    },
  },
  {
    id: 'rose-quartz',
    name: 'Rose Quartz',
    light: {
      scheme: 'light',
      accent: '#B8456C',
      accentLight: '#FBE5EC',
      bgTop: '#F7DCE5',
      bgMid: '#FFF5F8',
      bgBottom: '#F4E0E6',
      glassBg: LIGHT_GLASS_BG,
      glassBorder: LIGHT_GLASS_BORDER,
      textDark: '#2A101A',
      textMid: '#6E3F50',
      textDim: '#B48A99',
    },
    dark: {
      scheme: 'dark',
      accent: '#EC8AA8',
      accentLight: 'rgba(236,138,168,0.18)',
      bgTop: '#1F0A12',
      bgMid: '#2B1118',
      bgBottom: '#170609',
      glassBg: DARK_GLASS_BG,
      glassBorder: DARK_GLASS_BORDER,
      textDark: '#FBE5EC',
      textMid: '#C9A2AF',
      textDim: '#7C5862',
    },
  },
  {
    id: 'indigo-night',
    name: 'Indigo Night',
    light: {
      scheme: 'light',
      accent: '#5B3FAA',
      accentLight: '#ECE6F7',
      bgTop: '#DCD3F0',
      bgMid: '#F5F1FB',
      bgBottom: '#E5DCF1',
      glassBg: LIGHT_GLASS_BG,
      glassBorder: LIGHT_GLASS_BORDER,
      textDark: '#1A102E',
      textMid: '#4F3F70',
      textDim: '#9489B0',
    },
    dark: {
      scheme: 'dark',
      accent: '#B49EFF',
      accentLight: 'rgba(180,158,255,0.18)',
      bgTop: '#110A1F',
      bgMid: '#1B102E',
      bgBottom: '#0B0617',
      glassBg: DARK_GLASS_BG,
      glassBorder: DARK_GLASS_BORDER,
      textDark: '#ECE6F7',
      textMid: '#B5A8D1',
      textDim: '#6E658C',
    },
  },
  {
    id: 'olive-grove',
    name: 'Olive Grove',
    light: {
      scheme: 'light',
      accent: '#6B7A2A',
      accentLight: '#F1F4DC',
      bgTop: '#E0E5C5',
      bgMid: '#F8F8EC',
      bgBottom: '#E5E8D2',
      glassBg: LIGHT_GLASS_BG,
      glassBorder: LIGHT_GLASS_BORDER,
      textDark: '#1F230D',
      textMid: '#4F5530',
      textDim: '#9BA170',
    },
    dark: {
      scheme: 'dark',
      accent: '#C4D26E',
      accentLight: 'rgba(196,210,110,0.18)',
      bgTop: '#11140A',
      bgMid: '#1B1F11',
      bgBottom: '#090C05',
      glassBg: DARK_GLASS_BG,
      glassBorder: DARK_GLASS_BORDER,
      textDark: '#F1F4DC',
      textMid: '#B7BC95',
      textDim: '#6F7459',
    },
  },
  {
    id: 'pearl-dust',
    name: 'Pearl Dust',
    light: {
      scheme: 'light',
      accent: '#5A6577',
      accentLight: '#ECEEF2',
      bgTop: '#DDE2EA',
      bgMid: '#F6F7F9',
      bgBottom: '#E4E7ED',
      glassBg: LIGHT_GLASS_BG,
      glassBorder: LIGHT_GLASS_BORDER,
      textDark: '#1A1F2A',
      textMid: '#4A5260',
      textDim: '#99A2B0',
    },
    dark: {
      scheme: 'dark',
      accent: '#A8B5CC',
      accentLight: 'rgba(168,181,204,0.18)',
      bgTop: '#0E1116',
      bgMid: '#181C24',
      bgBottom: '#07090C',
      glassBg: DARK_GLASS_BG,
      glassBorder: DARK_GLASS_BORDER,
      textDark: '#ECEEF2',
      textMid: '#ABB2BF',
      textDim: '#6A7280',
    },
  },
  {
    id: 'golden-sands',
    name: 'Golden Sands',
    light: {
      scheme: 'light',
      accent: '#A67C00',
      accentLight: '#FBF3DC',
      bgTop: '#F5E8B0',
      bgMid: '#FDFAF0',
      bgBottom: '#F0E5C0',
      glassBg: LIGHT_GLASS_BG,
      glassBorder: LIGHT_GLASS_BORDER,
      textDark: '#241A00',
      textMid: '#6B5500',
      textDim: '#B8A060',
    },
    dark: {
      scheme: 'dark',
      accent: '#F0C84A',
      accentLight: 'rgba(240,200,74,0.18)',
      bgTop: '#1A1400',
      bgMid: '#261E05',
      bgBottom: '#120E00',
      glassBg: DARK_GLASS_BG,
      glassBorder: DARK_GLASS_BORDER,
      textDark: '#FBF3DC',
      textMid: '#C8B87A',
      textDim: '#7A6E40',
    },
  },
  {
    id: 'cobalt-sky',
    name: 'Cobalt Sky',
    light: {
      scheme: 'light',
      accent: '#0057B8',
      accentLight: '#E0EDFF',
      bgTop: '#C8DEFF',
      bgMid: '#F0F6FF',
      bgBottom: '#D4E6FF',
      glassBg: LIGHT_GLASS_BG,
      glassBorder: LIGHT_GLASS_BORDER,
      textDark: '#001830',
      textMid: '#2A4E7A',
      textDim: '#7A9BBF',
    },
    dark: {
      scheme: 'dark',
      accent: '#5EA4FF',
      accentLight: 'rgba(94,164,255,0.18)',
      bgTop: '#00101F',
      bgMid: '#071A2E',
      bgBottom: '#000A16',
      glassBg: DARK_GLASS_BG,
      glassBorder: DARK_GLASS_BORDER,
      textDark: '#E0EDFF',
      textMid: '#90B8E0',
      textDim: '#506A88',
    },
  },
  {
    id: 'crimson-dusk',
    name: 'Crimson Dusk',
    light: {
      scheme: 'light',
      accent: '#9B1C2E',
      accentLight: '#FAEAEC',
      bgTop: '#F2D0D4',
      bgMid: '#FDF5F6',
      bgBottom: '#EDD5D8',
      glassBg: LIGHT_GLASS_BG,
      glassBorder: LIGHT_GLASS_BORDER,
      textDark: '#280810',
      textMid: '#6A2C36',
      textDim: '#B48088',
    },
    dark: {
      scheme: 'dark',
      accent: '#F07080',
      accentLight: 'rgba(240,112,128,0.18)',
      bgTop: '#1A0408',
      bgMid: '#280A10',
      bgBottom: '#110204',
      glassBg: DARK_GLASS_BG,
      glassBorder: DARK_GLASS_BORDER,
      textDark: '#FAEAEC',
      textMid: '#C8969E',
      textDim: '#7A5058',
    },
  },
  {
    id: 'onyx',
    name: 'Onyx',
    light: {
      scheme: 'light',
      accent: '#2A2A2A',
      accentLight: '#ECECEC',
      bgTop: '#E0E0E0',
      bgMid: '#F8F8F8',
      bgBottom: '#E8E8E8',
      glassBg: LIGHT_GLASS_BG,
      glassBorder: LIGHT_GLASS_BORDER,
      textDark: '#0A0A0A',
      textMid: '#505050',
      textDim: '#A0A0A0',
    },
    dark: {
      scheme: 'dark',
      accent: '#D0D0D0',
      accentLight: 'rgba(208,208,208,0.15)',
      bgTop: '#0A0A0A',
      bgMid: '#141414',
      bgBottom: '#050505',
      glassBg: 'rgba(255,255,255,0.05)',
      glassBorder: 'rgba(255,255,255,0.10)',
      textDark: '#F0F0F0',
      textMid: '#A8A8A8',
      textDim: '#606060',
    },
  },
  {
    id: 'mint-breeze',
    name: 'Mint Breeze',
    light: {
      scheme: 'light',
      accent: '#1A8A6E',
      accentLight: '#DFF5EF',
      bgTop: '#BEEEE2',
      bgMid: '#F0FAF7',
      bgBottom: '#CEEEE6',
      glassBg: LIGHT_GLASS_BG,
      glassBorder: LIGHT_GLASS_BORDER,
      textDark: '#082820',
      textMid: '#2E6A58',
      textDim: '#7AB0A0',
    },
    dark: {
      scheme: 'dark',
      accent: '#50D4B0',
      accentLight: 'rgba(80,212,176,0.18)',
      bgTop: '#041410',
      bgMid: '#0A201A',
      bgBottom: '#020C08',
      glassBg: DARK_GLASS_BG,
      glassBorder: DARK_GLASS_BORDER,
      textDark: '#DFF5EF',
      textMid: '#90C8B8',
      textDim: '#507868',
    },
  },
];

export const DEFAULT_THEME_ID = 'sage-garden';

export const getTheme = (id: string): Theme =>
  THEMES.find((t) => t.id === id) ?? THEMES[0];

export const glassCardStyle = (palette: Palette) =>
  ({
    backgroundColor: palette.glassBg,
    borderColor: palette.glassBorder,
    borderWidth: 1,
    borderRadius: 16,
  }) as const;

// ─── Special Themes ────────────────────────────────────────────────────────

export interface SpecialPalette {
  accent: string;
  accentLight: string;
  glassBg: string;
  glassBorder: string;
  textDark: string;
  textMid: string;
  textDim: string;
  gradientColors: string[];
  gradientLocations: number[];
}

export interface PaletteVariant {
  palette: SpecialPalette;
  lightPalette?: SpecialPalette;
  darkPalette?: SpecialPalette;
}

export interface SpecialTheme {
  id: string;
  name: string;
  palette: SpecialPalette;
  lightPalette?: SpecialPalette;
  darkPalette?: SpecialPalette;
  paletteVariants?: PaletteVariant[];
  hasStars?: boolean;
  hasHearts?: boolean;
  hasInfinity?: boolean;
  swatchIcon?: 'heart-split' | 'infinity';
  debug?: boolean; // always visible without unlock — for testing only
}

export function resolveSpecialPalette(theme: SpecialTheme, isDark: boolean): SpecialPalette {
  if (isDark && theme.darkPalette) return theme.darkPalette;
  if (!isDark && theme.lightPalette) return theme.lightPalette;
  return theme.palette;
}

export const SPECIAL_THEMES: SpecialTheme[] = [
  {
    id: 'arabian-night',
    name: 'Arabian Night',
    hasStars: true,
    palette: {
      // Test5 colours — near-black → deep midnight → dark indigo → vivid magenta-purple
      accent: '#C050D8',
      accentLight: 'rgba(192,80,216,0.15)',
      glassBg: 'rgba(45,10,70,0.28)',
      glassBorder: 'rgba(192,80,216,0.20)',
      textDark: '#FFFFFF',
      textMid: '#E8D0F8',
      textDim: '#C0A0D8',
      gradientColors: ['#050A20', '#0E1448', '#3A1460', '#5E1870'],
      gradientLocations: [0, 0.30, 0.65, 1.0],
    },
  },
  {
    id: 'laylat-arabia',
    name: 'Laylatun Arabia',
    hasStars: true,
    palette: {
      // Test4 colours — cobalt → royal blue → deep indigo → purple: blue-dominant, regal
      accent: '#8080FF',
      accentLight: 'rgba(128,128,255,0.15)',
      glassBg: 'rgba(25,20,90,0.28)',
      glassBorder: 'rgba(128,128,255,0.20)',
      textDark: '#FFFFFF',
      textMid: '#D8D0F0',
      textDim: '#A0A0D0',
      gradientColors: ['#081840', '#1A3078', '#3A2080', '#5E2A68', '#200830'],
      gradientLocations: [0, 0.25, 0.50, 0.75, 1.0],
    },
  },

  {
    id: 'fifty-six',
    name: 'Fifty Six',
    hasHearts: true,
    swatchIcon: 'heart-split',
    palette: {
      accent: '#FF7090', accentLight: 'rgba(255,112,144,0.15)',
      glassBg: 'rgba(255,255,255,0.06)', glassBorder: 'rgba(255,255,255,0.12)',
      textDark: '#FFF0F5', textMid: '#D0A0B8', textDim: '#907080',
      gradientColors: ['#1A0008', '#380018', '#5E0030', '#7A1848'],
      gradientLocations: [0, 0.30, 0.65, 1.0],
    },
    lightPalette: {
      accent: '#C8446A', accentLight: 'rgba(200,68,106,0.12)',
      glassBg: 'rgba(255,255,255,0.60)', glassBorder: 'rgba(255,255,255,0.85)',
      textDark: '#1A0810', textMid: '#6E3050', textDim: '#B490A0',
      gradientColors: ['#FFF5F8', '#FFE0EC', '#FFCCD8'],
      gradientLocations: [0, 0.55, 1.0],
    },
    darkPalette: {
      accent: '#FF7090', accentLight: 'rgba(255,112,144,0.15)',
      glassBg: 'rgba(255,255,255,0.06)', glassBorder: 'rgba(255,255,255,0.12)',
      textDark: '#FFF0F5', textMid: '#D0A0B8', textDim: '#907080',
      gradientColors: ['#1A0008', '#380018', '#5E0030', '#7A1848'],
      gradientLocations: [0, 0.30, 0.65, 1.0],
    },
  },

  // ─── Always & Forever (single unlockable theme, random variant per session) ──
  {
    id: 'always-forever',
    name: 'Always & Forever',
    hasInfinity: true,
    swatchIcon: 'infinity',
    palette: {
      accent: '#90A8F0', accentLight: 'rgba(144,168,240,0.15)',
      glassBg: 'rgba(255,255,255,0.06)', glassBorder: 'rgba(144,168,240,0.20)',
      textDark: '#E8EEFF', textMid: '#A0B0E8', textDim: '#607098',
      gradientColors: ['#040A1C', '#080F2E', '#0C1540', '#060C28'],
      gradientLocations: [0, 0.30, 0.70, 1.0],
    },
    paletteVariants: [
      // 1 — cosmic blue
      {
        palette: {
          accent: '#90A8F0', accentLight: 'rgba(144,168,240,0.15)',
          glassBg: 'rgba(255,255,255,0.06)', glassBorder: 'rgba(144,168,240,0.20)',
          textDark: '#E8EEFF', textMid: '#A0B0E8', textDim: '#607098',
          gradientColors: ['#040A1C', '#080F2E', '#0C1540', '#060C28'],
          gradientLocations: [0, 0.30, 0.70, 1.0],
        },
        lightPalette: {
          accent: '#3050C0', accentLight: 'rgba(48,80,192,0.12)',
          glassBg: 'rgba(255,255,255,0.60)', glassBorder: 'rgba(255,255,255,0.85)',
          textDark: '#0A1030', textMid: '#3050A0', textDim: '#8090C0',
          gradientColors: ['#F0F4FF', '#E4EAFF', '#D4DCFF'],
          gradientLocations: [0, 0.55, 1.0],
        },
        darkPalette: {
          accent: '#90A8F0', accentLight: 'rgba(144,168,240,0.15)',
          glassBg: 'rgba(255,255,255,0.06)', glassBorder: 'rgba(144,168,240,0.20)',
          textDark: '#E8EEFF', textMid: '#A0B0E8', textDim: '#607098',
          gradientColors: ['#040A1C', '#080F2E', '#0C1540', '#060C28'],
          gradientLocations: [0, 0.30, 0.70, 1.0],
        },
      },
      // 2 — amber gold
      {
        palette: {
          accent: '#F0C040', accentLight: 'rgba(240,192,64,0.15)',
          glassBg: 'rgba(255,255,255,0.06)', glassBorder: 'rgba(240,192,64,0.20)',
          textDark: '#FFF8E0', textMid: '#C8A858', textDim: '#786840',
          gradientColors: ['#1A1000', '#302000', '#482E00', '#280E00'],
          gradientLocations: [0, 0.30, 0.70, 1.0],
        },
        lightPalette: {
          accent: '#A06800', accentLight: 'rgba(160,104,0,0.12)',
          glassBg: 'rgba(255,255,255,0.60)', glassBorder: 'rgba(255,255,255,0.85)',
          textDark: '#201000', textMid: '#705000', textDim: '#B09050',
          gradientColors: ['#FFFDF5', '#FFF5D8', '#FFEDB0'],
          gradientLocations: [0, 0.55, 1.0],
        },
        darkPalette: {
          accent: '#F0C040', accentLight: 'rgba(240,192,64,0.15)',
          glassBg: 'rgba(255,255,255,0.06)', glassBorder: 'rgba(240,192,64,0.20)',
          textDark: '#FFF8E0', textMid: '#C8A858', textDim: '#786840',
          gradientColors: ['#1A1000', '#302000', '#482E00', '#280E00'],
          gradientLocations: [0, 0.30, 0.70, 1.0],
        },
      },
      // 3 — violet
      {
        palette: {
          accent: '#C880F8', accentLight: 'rgba(200,128,248,0.15)',
          glassBg: 'rgba(255,255,255,0.06)', glassBorder: 'rgba(200,128,248,0.20)',
          textDark: '#F4E8FF', textMid: '#C0A0E0', textDim: '#806890',
          gradientColors: ['#0C0018', '#1A0030', '#260040', '#140020'],
          gradientLocations: [0, 0.30, 0.70, 1.0],
        },
        lightPalette: {
          accent: '#8040C0', accentLight: 'rgba(128,64,192,0.12)',
          glassBg: 'rgba(255,255,255,0.60)', glassBorder: 'rgba(255,255,255,0.85)',
          textDark: '#140820', textMid: '#603890', textDim: '#A08AB0',
          gradientColors: ['#FEF8FF', '#F8EEFF', '#F0E0FF'],
          gradientLocations: [0, 0.55, 1.0],
        },
        darkPalette: {
          accent: '#C880F8', accentLight: 'rgba(200,128,248,0.15)',
          glassBg: 'rgba(255,255,255,0.06)', glassBorder: 'rgba(200,128,248,0.20)',
          textDark: '#F4E8FF', textMid: '#C0A0E0', textDim: '#806890',
          gradientColors: ['#0C0018', '#1A0030', '#260040', '#140020'],
          gradientLocations: [0, 0.30, 0.70, 1.0],
        },
      },
      // 4 — teal
      {
        palette: {
          accent: '#40D8C0', accentLight: 'rgba(64,216,192,0.15)',
          glassBg: 'rgba(255,255,255,0.06)', glassBorder: 'rgba(64,216,192,0.20)',
          textDark: '#E0FDF8', textMid: '#90C8C0', textDim: '#508080',
          gradientColors: ['#001412', '#002220', '#003030', '#001C1A'],
          gradientLocations: [0, 0.30, 0.70, 1.0],
        },
        lightPalette: {
          accent: '#006858', accentLight: 'rgba(0,104,88,0.12)',
          glassBg: 'rgba(255,255,255,0.60)', glassBorder: 'rgba(255,255,255,0.85)',
          textDark: '#001A18', textMid: '#306860', textDim: '#80A8A0',
          gradientColors: ['#F0FFFD', '#D8F8F4', '#B8F0EA'],
          gradientLocations: [0, 0.55, 1.0],
        },
        darkPalette: {
          accent: '#40D8C0', accentLight: 'rgba(64,216,192,0.15)',
          glassBg: 'rgba(255,255,255,0.06)', glassBorder: 'rgba(64,216,192,0.20)',
          textDark: '#E0FDF8', textMid: '#90C8C0', textDim: '#508080',
          gradientColors: ['#001412', '#002220', '#003030', '#001C1A'],
          gradientLocations: [0, 0.30, 0.70, 1.0],
        },
      },
      // 5 — emerald
      {
        palette: {
          accent: '#40D880', accentLight: 'rgba(64,216,128,0.15)',
          glassBg: 'rgba(255,255,255,0.06)', glassBorder: 'rgba(64,216,128,0.20)',
          textDark: '#E0FFF0', textMid: '#90C8A8', textDim: '#508868',
          gradientColors: ['#001408', '#002010', '#00301A', '#001A0C'],
          gradientLocations: [0, 0.30, 0.70, 1.0],
        },
        lightPalette: {
          accent: '#0A6840', accentLight: 'rgba(10,104,64,0.12)',
          glassBg: 'rgba(255,255,255,0.60)', glassBorder: 'rgba(255,255,255,0.85)',
          textDark: '#001810', textMid: '#286848', textDim: '#78A890',
          gradientColors: ['#F0FFF5', '#D8F8E8', '#B8EED8'],
          gradientLocations: [0, 0.55, 1.0],
        },
        darkPalette: {
          accent: '#40D880', accentLight: 'rgba(64,216,128,0.15)',
          glassBg: 'rgba(255,255,255,0.06)', glassBorder: 'rgba(64,216,128,0.20)',
          textDark: '#E0FFF0', textMid: '#90C8A8', textDim: '#508868',
          gradientColors: ['#001408', '#002010', '#00301A', '#001A0C'],
          gradientLocations: [0, 0.30, 0.70, 1.0],
        },
      },
      // 7 — sky blue
      {
        palette: {
          accent: '#80C8F0', accentLight: 'rgba(128,200,240,0.15)',
          glassBg: 'rgba(255,255,255,0.06)', glassBorder: 'rgba(128,200,240,0.20)',
          textDark: '#EAF6FF', textMid: '#98C0E0', textDim: '#507890',
          gradientColors: ['#020810', '#040C18', '#061220', '#030910'],
          gradientLocations: [0, 0.30, 0.70, 1.0],
        },
        lightPalette: {
          accent: '#2878B8', accentLight: 'rgba(40,120,184,0.12)',
          glassBg: 'rgba(255,255,255,0.60)', glassBorder: 'rgba(255,255,255,0.85)',
          textDark: '#08182A', textMid: '#3868A0', textDim: '#88A8C8',
          gradientColors: ['#FAFEFF', '#EEF9FF', '#E0F4FF'],
          gradientLocations: [0, 0.55, 1.0],
        },
        darkPalette: {
          accent: '#80C8F0', accentLight: 'rgba(128,200,240,0.15)',
          glassBg: 'rgba(255,255,255,0.06)', glassBorder: 'rgba(128,200,240,0.20)',
          textDark: '#EAF6FF', textMid: '#98C0E0', textDim: '#507890',
          gradientColors: ['#020810', '#040C18', '#061220', '#030910'],
          gradientLocations: [0, 0.30, 0.70, 1.0],
        },
      },
      // 8 — purple
      {
        palette: {
          accent: '#D080FF', accentLight: 'rgba(208,128,255,0.15)',
          glassBg: 'rgba(255,255,255,0.06)', glassBorder: 'rgba(208,128,255,0.20)',
          textDark: '#F4EEFF', textMid: '#C098E8', textDim: '#806898',
          gradientColors: ['#0C0018', '#160028', '#200038', '#100020'],
          gradientLocations: [0, 0.30, 0.70, 1.0],
        },
        lightPalette: {
          accent: '#6828B8', accentLight: 'rgba(104,40,184,0.12)',
          glassBg: 'rgba(255,255,255,0.60)', glassBorder: 'rgba(255,255,255,0.85)',
          textDark: '#140820', textMid: '#503080', textDim: '#9878B8',
          gradientColors: ['#FAF5FF', '#F2E8FF', '#E8D8FF'],
          gradientLocations: [0, 0.55, 1.0],
        },
        darkPalette: {
          accent: '#D080FF', accentLight: 'rgba(208,128,255,0.15)',
          glassBg: 'rgba(255,255,255,0.06)', glassBorder: 'rgba(208,128,255,0.20)',
          textDark: '#F4EEFF', textMid: '#C098E8', textDim: '#806898',
          gradientColors: ['#0C0018', '#160028', '#200038', '#100020'],
          gradientLocations: [0, 0.30, 0.70, 1.0],
        },
      },
    ],
  },
];

export const getSpecialTheme = (id: string): SpecialTheme | undefined =>
  SPECIAL_THEMES.find((t) => t.id === id);
