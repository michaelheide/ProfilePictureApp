export const STYLE_PROMPTS = {
  Professional:
    'A clean, high-end corporate headshot with soft studio lighting and a neutral office background.',
  Anime:
    'High-quality Makoto Shinkai style anime art, vibrant colors, detailed line art, cinematic lighting.',
  Cyberpunk:
    'Neon-lit, futuristic aesthetics, robotic augmentations, dark rainy street background, pink and blue hues.',
  Editorial:
    'A premium editorial portrait with fashion photography styling, elegant composition, dramatic lighting, and refined skin detail.',
  Minimal:
    'A modern, minimal portrait with soft lighting, clean background separation, subtle color grading, and a polished profile-photo finish.',
} as const;

export type StylePreset = keyof typeof STYLE_PROMPTS;

export function getStylePrompt(style: string) {
  return STYLE_PROMPTS[style as StylePreset] ?? STYLE_PROMPTS.Professional;
}
