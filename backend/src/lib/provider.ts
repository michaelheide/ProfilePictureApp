export type ProviderMode = 'mock' | 'gemini' | 'custom';

export function getProviderMode() {
  return (process.env.NANO_BANANA_PROVIDER?.toLowerCase() ?? 'mock') as ProviderMode;
}
