export type NotifSoundId = 'default' | 'chime' | 'bell' | 'adhan' | 'none';

export const NOTIF_SOUND_LABELS: Record<NotifSoundId, string> = {
  default: 'Default',
  chime: 'Chime',
  bell: 'Bell',
  adhan: 'Adhan',
  none: 'None',
};

// Null until sound files are added to assets/sounds/
export const NOTIF_SOUND_ASSETS: Record<NotifSoundId, number | null> = {
  default: null,
  chime: null,
  bell: null,
  adhan: null,
  none: null,
};
