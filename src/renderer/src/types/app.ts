export interface AgentResponse {
  content: string
  timestamp: Date
  isLoading: boolean
}

export interface Question {
  text: string
  timestamp: Date
}

export interface AppState {
  activeTab: TabId
  dbPath: string
  tab1: TabState
  tab2: TabState
  showHelp: boolean
}

export interface TabState {
  question: string
  response: string
  isLoading: boolean
}

export interface MarkdownTabState extends TabState {
  isMarkdownView: boolean
}

export type TabId = 'tab1' | 'tab2'

export interface AgentService {
  processQuestion: (question: string) => Promise<string>
}

export interface UIActions {
  switchTab: (tabId: TabId) => void
  updateDbPath: (path: string) => void
  toggleMarkdownView: () => void
  showHelp: () => void
  hideHelp: () => void
}

export interface TabActions {
  updateQuestion: (question: string) => void
  submitQuestion: () => Promise<void>
  clearResponse: () => void
}

export interface DatabaseConfig {
  path: string
  isConnected: boolean
}