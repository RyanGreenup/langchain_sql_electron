import type { Component } from 'solid-js'
import { createSignal, createEffect, For, Show, onMount } from 'solid-js'
import type { LogEntry } from '../../types/logging'
import { LogLevel, LogSource } from '../../types/logging'

interface AgentLogProps {
  entries: LogEntry[]
  class?: string
}

const AgentLog: Component<AgentLogProps> = (props) => {
  let logContainerRef: HTMLDivElement | undefined
  const [autoScroll, setAutoScroll] = createSignal(true)

  // Auto-scroll to bottom when new entries are added
  createEffect(() => {
    if (autoScroll() && logContainerRef && props.entries.length > 0) {
      setTimeout(() => {
        logContainerRef?.scrollTo({
          top: logContainerRef.scrollHeight,
          behavior: 'smooth'
        })
      }, 50)
    }
  })

  const formatTime = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    })
  }

  const getLevelIcon = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.INFO: return 'ℹ️'
      case LogLevel.SUCCESS: return '✅'
      case LogLevel.WARNING: return '⚠️'
      case LogLevel.ERROR: return '❌'
      case LogLevel.DEBUG: return '🔍'
      default: return '📝'
    }
  }

  const getLevelClass = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.INFO: return 'text-info'
      case LogLevel.SUCCESS: return 'text-success'
      case LogLevel.WARNING: return 'text-warning'
      case LogLevel.ERROR: return 'text-error'
      case LogLevel.DEBUG: return 'text-base-content/60'
      default: return 'text-base-content'
    }
  }

  const getSourceBadge = (source: LogSource): string => {
    switch (source) {
      case LogSource.AGENT: return 'badge-primary'
      case LogSource.DATABASE: return 'badge-secondary'
      case LogSource.API: return 'badge-accent'
      case LogSource.SYSTEM: return 'badge-neutral'
      default: return 'badge-ghost'
    }
  }

  const handleScroll = () => {
    if (logContainerRef) {
      const { scrollTop, scrollHeight, clientHeight } = logContainerRef
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10
      setAutoScroll(isAtBottom)
    }
  }

  return (
    <div class={`bg-base-100 rounded-lg shadow-sm border ${props.class || ''}`}>
      {/* Header */}
      <div class="flex items-center justify-between p-3 border-b border-base-200">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium">Agent Activity Log</span>
          <span class="badge badge-sm badge-neutral">{props.entries.length}</span>
        </div>
        <div class="flex items-center gap-2">
          <label class="label cursor-pointer gap-2">
            <span class="label-text text-xs">Auto-scroll</span>
            <input 
              type="checkbox" 
              class="toggle toggle-xs toggle-primary"
              checked={autoScroll()}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
          </label>
        </div>
      </div>

      {/* Log Content */}
      <div 
        ref={logContainerRef}
        class="h-64 overflow-y-auto p-3 space-y-2 bg-base-50 font-mono text-xs"
        onScroll={handleScroll}
      >
        <Show 
          when={props.entries.length > 0}
          fallback={
            <div class="flex items-center justify-center h-full text-base-content/50">
              <div class="text-center">
                <div class="text-2xl mb-2">📝</div>
                <div>No activity yet</div>
                <div class="text-xs">Agent activity will appear here</div>
              </div>
            </div>
          }
        >
          <For each={props.entries}>
            {(entry) => (
              <div class="flex items-start gap-2 p-2 rounded hover:bg-base-200/50 transition-colors">
                <span class="text-sm">{getLevelIcon(entry.level)}</span>
                <span class="text-xs text-base-content/60 min-w-[70px]">
                  {formatTime(entry.timestamp)}
                </span>
                <span class={`badge badge-xs ${getSourceBadge(entry.source)}`}>
                  {entry.source}
                </span>
                <div class="flex-1">
                  <span class={`${getLevelClass(entry.level)}`}>
                    {entry.message}
                  </span>
                  <Show when={entry.data}>
                    <details class="mt-1">
                      <summary class="cursor-pointer text-xs text-base-content/60 hover:text-base-content">
                        Show details
                      </summary>
                      <pre class="mt-1 p-2 bg-base-200 rounded text-xs overflow-auto max-h-32">
                        {typeof entry.data === 'string' ? entry.data : JSON.stringify(entry.data, null, 2)}
                      </pre>
                    </details>
                  </Show>
                </div>
              </div>
            )}
          </For>
        </Show>
      </div>
    </div>
  )
}

export default AgentLog