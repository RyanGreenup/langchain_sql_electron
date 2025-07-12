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

export interface DatabaseValidationResult {
  valid: boolean
  error?: string
}

export interface LogEventData {
  level: string
  source: string
  message: string
  data?: any
  timestamp: string
}

export interface CustomAPI {
  getEnvVar: (name: string) => Promise<string | undefined>
  setEnvVar: (name: string, value: string) => Promise<void>
  getApiKeyStatus: () => Promise<ApiKeyStatus>
  setApiKeyOverride: (apiKey: string) => Promise<void>
  clearApiKeyOverride: () => Promise<void>
  getCurrentApiKey: () => Promise<string | null>
  runSqlAgent: (question: string, dbPath: string) => Promise<SqlAgentResult>
  validateDatabase: (dbPath: string) => Promise<DatabaseValidationResult>
  onAgentLog: (callback: (logData: LogEventData) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}
