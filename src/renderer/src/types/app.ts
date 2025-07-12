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
  tab1: MarkdownTabState
  tab2: TableTabState
  showHelp: boolean
}

export interface SqlQuery {
  query: string
  result: any[]
}

export interface SqlResult {
  queries: SqlQuery[]
  finalAnswer: string
}

export interface TabState {
  question: string
  response: string
  isLoading: boolean
}

export interface TableTabState extends TabState {
  sqlResult: SqlResult | null
}

export interface MarkdownTabState extends TabState {
  isMarkdownView: boolean
}

export type TabId = 'tab1' | 'tab2'

export interface AgentService {
  processQuestion: (question: string) => Promise<string>
  processQuestionStructured?: (question: string) => Promise<SqlResult | null>
  setDatabasePath?: (dbPath: string) => void
}

export interface UIActions {
  switchTab: (tabId: TabId) => void
  updateDbPath: (path: string) => void
  updateApiKey: (apiKey: string) => Promise<void>
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