import { ElectronAPI } from '@electron-toolkit/preload'

export interface ApiKeyStatus {
  hasEnvKey: boolean
  hasOverrideKey: boolean
  isValid: boolean
  source: 'env' | 'override' | 'none'
}

export interface SqlAgentResult {
  success: boolean
  result?: any
  error?: string
}

export interface CustomAPI {
  getEnvVar: (name: string) => Promise<string | undefined>
  setEnvVar: (name: string, value: string) => Promise<void>
  getApiKeyStatus: () => Promise<ApiKeyStatus>
  setApiKeyOverride: (apiKey: string) => Promise<void>
  clearApiKeyOverride: () => Promise<void>
  getCurrentApiKey: () => Promise<string | null>
  runSqlAgent: (question: string, dbPath: string) => Promise<SqlAgentResult>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}
