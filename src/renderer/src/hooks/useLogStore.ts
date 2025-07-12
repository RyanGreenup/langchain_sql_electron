import { createSignal, onMount, onCleanup } from 'solid-js'
import type { LogEntry, LogLevel, LogSource } from '../types/logging'
import { LogLevel, LogSource } from '../types/logging'

export function useLogStore() {
  const [entries, setEntries] = createSignal<LogEntry[]>([])
  let removeListener: (() => void) | undefined

  const addEntry = (level: LogLevel, source: LogSource, message: string, data?: any) => {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      level,
      source,
      message,
      data
    }
    
    setEntries(prev => [...prev, entry])
  }

  const clearEntries = () => {
    setEntries([])
  }

  const addLogFromEvent = (logData: any) => {
    try {
      const level = logData.level as LogLevel
      const source = logData.source as LogSource
      const timestamp = new Date(logData.timestamp)
      
      const entry: LogEntry = {
        id: crypto.randomUUID(),
        timestamp,
        level,
        source,
        message: logData.message,
        data: logData.data
      }
      
      setEntries(prev => [...prev, entry])
    } catch (error) {
      console.error('Failed to parse log event:', error, logData)
    }
  }

  onMount(() => {
    // Set up IPC log listener
    if (typeof window !== 'undefined' && window.api) {
      removeListener = window.api.onAgentLog(addLogFromEvent)
    }
  })

  onCleanup(() => {
    // Clean up the listener
    if (removeListener) {
      removeListener()
    }
  })

  return {
    entries,
    addEntry,
    clearEntries
  }
}