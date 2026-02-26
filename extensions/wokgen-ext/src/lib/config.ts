export const WOKGEN_API_BASE = 'https://wokgen.wokspec.org';

export interface WokGenConfig {
  apiKey: string;
  apiBase: string;
}

export async function getConfig(): Promise<WokGenConfig> {
  const result = await browser.storage.sync.get(['apiKey', 'apiBase']);
  return {
    apiKey: result.apiKey || '',
    apiBase: result.apiBase || WOKGEN_API_BASE,
  };
}

export async function setConfig(config: Partial<WokGenConfig>): Promise<void> {
  await browser.storage.sync.set(config);
}
