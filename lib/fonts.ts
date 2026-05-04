export type ArabicFontId = 'system' | 'amiri' | 'scheherazade' | 'noto-naskh' | 'cairo' | 'tajawal' | 'lateef';
export type EnglishFontId = 'system' | 'lato' | 'merriweather' | 'nunito' | 'poppins' | 'playfair' | 'raleway';
export type TextSizeId = 'sm' | 'md' | 'lg' | 'xl';

export const ARABIC_FONTS = [
  { id: 'system', label: 'System', fontFamily: null },
  { id: 'amiri', label: 'Amiri', fontFamily: 'Amiri_400Regular' },
  { id: 'scheherazade', label: 'Scheherazade New', fontFamily: 'ScheherazadeNew_400Regular' },
  { id: 'noto-naskh', label: 'Noto Naskh', fontFamily: 'NotoNaskhArabic_400Regular' },
  { id: 'cairo', label: 'Cairo', fontFamily: 'Cairo_400Regular' },
  { id: 'tajawal', label: 'Tajawal', fontFamily: 'Tajawal_400Regular' },
  { id: 'lateef', label: 'Lateef', fontFamily: 'Lateef_400Regular' },
] as const;

export const ENGLISH_FONTS = [
  { id: 'system', label: 'System', fontFamily: null },
  { id: 'lato', label: 'Lato', fontFamily: 'Lato_400Regular' },
  { id: 'merriweather', label: 'Merriweather', fontFamily: 'Merriweather_400Regular' },
  { id: 'nunito', label: 'Nunito', fontFamily: 'Nunito_400Regular' },
  { id: 'poppins', label: 'Poppins', fontFamily: 'Poppins_400Regular' },
  { id: 'playfair', label: 'Playfair Display', fontFamily: 'PlayfairDisplay_400Regular' },
  { id: 'raleway', label: 'Raleway', fontFamily: 'Raleway_400Regular' },
] as const;

export const TEXT_SIZE_OPTIONS: { id: TextSizeId; label: string }[] = [
  { id: 'sm', label: 'S' },
  { id: 'md', label: 'M' },
  { id: 'lg', label: 'L' },
  { id: 'xl', label: 'XL' },
];

export const ARABIC_SIZE: Record<TextSizeId, number> = { sm: 24, md: 30, lg: 36, xl: 44 };
export const TRANSLIT_SIZE: Record<TextSizeId, number> = { sm: 20, md: 25, lg: 30, xl: 37 };
export const TRANSLATION_SIZE: Record<TextSizeId, number> = { sm: 19, md: 24, lg: 29, xl: 36 };

export const GOOGLE_FONT_ASSETS = {
  Amiri_400Regular: require('@expo-google-fonts/amiri/400Regular/Amiri_400Regular.ttf'),
  ScheherazadeNew_400Regular: require('@expo-google-fonts/scheherazade-new/400Regular/ScheherazadeNew_400Regular.ttf'),
  NotoNaskhArabic_400Regular: require('@expo-google-fonts/noto-naskh-arabic/400Regular/NotoNaskhArabic_400Regular.ttf'),
  Cairo_400Regular: require('@expo-google-fonts/cairo/400Regular/Cairo_400Regular.ttf'),
  Tajawal_400Regular: require('@expo-google-fonts/tajawal/400Regular/Tajawal_400Regular.ttf'),
  Lateef_400Regular: require('@expo-google-fonts/lateef/400Regular/Lateef_400Regular.ttf'),
  Lato_400Regular: require('@expo-google-fonts/lato/400Regular/Lato_400Regular.ttf'),
  Merriweather_400Regular: require('@expo-google-fonts/merriweather/400Regular/Merriweather_400Regular.ttf'),
  Nunito_400Regular: require('@expo-google-fonts/nunito/400Regular/Nunito_400Regular.ttf'),
  Poppins_400Regular: require('@expo-google-fonts/poppins/400Regular/Poppins_400Regular.ttf'),
  PlayfairDisplay_400Regular: require('@expo-google-fonts/playfair-display/400Regular/PlayfairDisplay_400Regular.ttf'),
  Raleway_400Regular: require('@expo-google-fonts/raleway/400Regular/Raleway_400Regular.ttf'),
};
