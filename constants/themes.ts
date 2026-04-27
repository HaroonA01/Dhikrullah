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
