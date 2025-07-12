export interface LogEntry {
  id: string
  timestamp: Date
  level: LogLevel
  message: string
  source: LogSource
  data?: any
}

export enum LogLevel {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  DEBUG = 'debug'
}

export enum LogSource {
  AGENT = 'agent',
  DATABASE = 'database',
  API = 'api',
  SYSTEM = 'system'
}

export interface AgentLogEvent {
  type: AgentLogEventType
  message: string
  data?: any
  timestamp?: Date
}

export enum AgentLogEventType {
  AGENT_START = 'agent_start',
  AGENT_THINKING = 'agent_thinking',
  SQL_QUERY_GENERATED = 'sql_query_generated',
  SQL_QUERY_EXECUTING = 'sql_query_executing',
  SQL_QUERY_RESULT = 'sql_query_result',
  AGENT_RESPONSE = 'agent_response',
  AGENT_COMPLETE = 'agent_complete',
  AGENT_ERROR = 'agent_error',
  DATABASE_CONNECTING = 'database_connecting',
  DATABASE_CONNECTED = 'database_connected',
  API_REQUEST = 'api_request',
  API_RESPONSE = 'api_response'
}

export interface LogStore {
  entries: LogEntry[]
  addEntry: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void
  clearEntries: () => void
  getEntriesForSession: (sessionId?: string) => LogEntry[]
}