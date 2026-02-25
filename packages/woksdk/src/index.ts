/**
 * WokSDK — TypeScript SDK for WokAPI
 * @package @wokspec/sdk
 * @see https://wokgen.wokspec.org/developers
 */

export interface WokGenOptions {
  apiKey: string;
  baseUrl?: string;
}

export interface GenerateOptions {
  prompt: string;
  mode?: 'pixel' | 'business' | 'vector' | 'uiux' | 'voice' | 'text';
  width?: number;
  height?: number;
  steps?: number;
  style?: string;
}

export interface GeneratedAsset {
  id: string;
  url: string;
  width: number;
  height: number;
  prompt: string;
  mode: string;
  createdAt: string;
}

export interface EralMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface EralChatOptions {
  message: string;
  conversationId?: string;
  history?: EralMessage[];
}

export interface EralChatResult {
  reply: string;
  conversationId: string;
}

export interface AssetListOptions {
  page?: number;
  perPage?: number;
  mode?: string;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  plan: string;
  usage: {
    creditsUsed: number;
    creditsLimit: number;
    generationsToday: number;
  };
}

export class WokGen {
  private apiKey: string;
  private baseUrl: string;

  constructor(options: WokGenOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? 'https://wokgen.wokspec.org';
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error((err as { error?: string }).error ?? `WokAPI error: ${res.status}`);
    }
    return res.json() as Promise<T>;
  }

  /**
   * Generate an AI asset (image, pixel art, vector, UI/UX mockup, voice, or text).
   * @param options - Generation options including prompt, mode, and dimensions
   * @returns Generated asset with URL and metadata
   * @example
   * const asset = await wok.generate({ prompt: 'pixel art wizard', mode: 'pixel' });
   * console.log(asset.url);
   */
  async generate(options: GenerateOptions): Promise<GeneratedAsset> {
    return this.request<GeneratedAsset>('/api/v1/generate', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  /**
   * List your previously generated assets with optional filters.
   * @param options - Pagination and filter options (page, perPage, mode)
   * @returns Paginated list of assets and total count
   * @example
   * const { assets, total } = await wok.listAssets({ page: 1, perPage: 20, mode: 'pixel' });
   */
  async listAssets(options: AssetListOptions = {}): Promise<{ assets: GeneratedAsset[]; total: number }> {
    const params = new URLSearchParams();
    if (options.page) params.set('page', String(options.page));
    if (options.perPage) params.set('perPage', String(options.perPage));
    if (options.mode) params.set('mode', options.mode);
    return this.request(`/api/v1/assets?${params}`);
  }

  /**
   * Chat with Eral 7c, the WokGen AI assistant.
   * @param options - Chat options including message, optional conversationId, and history
   * @returns AI reply and conversationId for continuing the conversation
   * @example
   * const { reply, conversationId } = await wok.chat({ message: 'Help me design a logo' });
   * // Continue conversation:
   * await wok.chat({ message: 'Make it more colorful', conversationId });
   */
  async chat(options: EralChatOptions): Promise<EralChatResult> {
    return this.request<EralChatResult>('/api/v1/eral/chat', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  /**
   * Remove the background from an image URL.
   * @param imageUrl - Public URL of the image to process
   * @returns Object containing the URL of the background-removed image
   * @example
   * const { url } = await wok.removeBackground('https://example.com/photo.jpg');
   */
  async removeBackground(imageUrl: string): Promise<{ url: string }> {
    return this.request('/api/v1/tools/bg-remove', {
      method: 'POST',
      body: JSON.stringify({ url: imageUrl }),
    });
  }

  /**
   * Get the authenticated user's profile and usage statistics.
   * @returns User info including plan details and credit usage
   * @example
   * const user = await wok.me();
   * console.log(`Credits used: ${user.usage.creditsUsed}/${user.usage.creditsLimit}`);
   */
  async me(): Promise<UserInfo> {
    return this.request<UserInfo>('/api/v1/me');
  }
}

// Default export
export default WokGen;

// React hooks (requires React peer dependency)
export * from './hooks';
