export type NotifSoundId =
  | 'default'
  | 'chime'
  | 'bell'
  | 'harp'
  | 'glow'
  | 'tap'
  | 'none';

export const NOTIF_SOUND_LABELS: Record<NotifSoundId, string> = {
  default: 'Default',
  chime: 'Chime',
  bell: 'Bell',
  harp: 'Harp',
  glow: 'Glow',
  tap: 'Tap',
  none: 'None',
};

export const NOTIF_SOUND_ASSETS: Record<NotifSoundId, number | null> = {
  default: null,
  chime: require('@/assets/sounds/chime.wav'),
  bell: require('@/assets/sounds/bell.wav'),
  harp: require('@/assets/sounds/harp.wav'),
  glow: require('@/assets/sounds/glow.wav'),
  tap: require('@/assets/sounds/tap.wav'),
  none: null,
};
