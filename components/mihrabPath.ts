export const MIHRAB_VIEWBOX_WIDTH = 100;
export const MIHRAB_VIEWBOX_HEIGHT = 150;
export const MIHRAB_VIEWBOX = `0 0 ${MIHRAB_VIEWBOX_WIDTH} ${MIHRAB_VIEWBOX_HEIGHT}`;
export const MIHRAB_ASPECT = MIHRAB_VIEWBOX_HEIGHT / MIHRAB_VIEWBOX_WIDTH;

// Islamic mihrab: rounded-rect body + ogee (S-curve) arch with shoulder bumps + pointed finial.
// Right arch profile (x values going from y=90 upward):
//   100(body) → 88(valley, y=60) → 92(shoulder peak, y=48) → 78(post-shoulder, y=32) → 50(finial, y=4)
// All junctions are G1-smooth (matching tangent directions).
export const MIHRAB_PATH_D =
  'M 12 150 L 88 150 Q 100 150 100 136 L 100 90 C 100 70 92 58 88 60 C 84 62 90 48 92 48 C 94 48 82 30 78 32 C 74 34 60 8 50 4 C 40 8 26 34 22 32 C 18 30 6 48 8 48 C 10 48 16 62 12 60 C 8 58 0 70 0 90 L 0 136 Q 0 150 12 150 Z';

export const MIHRAB_PATH_LENGTH = 460;
