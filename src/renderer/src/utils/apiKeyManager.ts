export interface ApiKeyStatus {
  hasEnvKey: boolean
  hasOverrideKey: boolean
  isValid: boolean
  source: 'env' | 'override' | 'none'
}

export class ApiKeyManager {
  constructor() {
    // API key management is now handled through Electron IPC
  }

  async getApiKeyStatus(): Promise<ApiKeyStatus> {
    if (typeof window !== 'undefined' && window.api) {
      return await window.api.getApiKeyStatus()
    }
    
    // Fallback for non-Electron environments
    return {
      hasEnvKey: false,
      hasOverrideKey: false,
      isValid: false,
      source: 'none'
    }
  }

  async setOverrideKey(apiKey: string): Promise<void> {
    if (typeof window !== 'undefined' && window.api) {
      await window.api.setApiKeyOverride(apiKey)
    }
  }

  async clearOverrideKey(): Promise<void> {
    if (typeof window !== 'undefined' && window.api) {
      await window.api.clearApiKeyOverride()
    }
  }

  async getCurrentKey(): Promise<string | null> {
    if (typeof window !== 'undefined' && window.api) {
      return await window.api.getCurrentApiKey()
    }
    return null
  }

  maskApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 8) {
      return '••••••••'
    }
    
    const start = apiKey.slice(0, 4)
    const end = apiKey.slice(-4)
    const middle = '•'.repeat(Math.max(4, apiKey.length - 8))
    
    return `${start}${middle}${end}`
  }

  validateApiKeyFormat(apiKey: string): boolean {
    // Basic validation for Anthropic API key format
    // Anthropic keys typically start with 'sk-ant-' and are around 100+ characters
    const trimmed = apiKey.trim()
    return trimmed.startsWith('sk-ant-') && trimmed.length > 50
  }
}

export const apiKeyManager = new ApiKeyManager()