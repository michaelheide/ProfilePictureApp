export const STYLE_PRESETS = [
  'Professional',
  'Anime',
  'Cyberpunk',
  'Editorial',
  'Minimal',
] as const;

export type StylePreset = (typeof STYLE_PRESETS)[number];
