export const AUDIO_MAP: Record<string, number> = {
  'all_day-01.m4a': require('@/assets/audio/all_day-01.m4a'),
  'morning-01.m4a': require('@/assets/audio/morning-01.m4a'),
  'waking_up-01.m4a': require('@/assets/audio/waking_up-01.m4a'),
};

export function resolveAudio(filename: string | null | undefined): number | undefined {
  if (!filename) return undefined;
  const src = AUDIO_MAP[filename];
  if (__DEV__ && !src) {
    console.warn(`[audioMap] no require for "${filename}"`);
  }
  return src;
}
