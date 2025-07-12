import type { Component } from 'solid-js'
import { For, Show, createSignal } from 'solid-js'

interface SqlQuery {
  query: string
  result: any[]
}

interface SqlResult {
  queries: SqlQuery[]
  finalAnswer: string
}

interface SqlResultsDisplayProps {
  result: SqlResult
  isLoading?: boolean
  class?: string
}

const SqlResultsDisplay: Component<SqlResultsDisplayProps> = (props) => {
  const [expandedQueries, setExpandedQueries] = createSignal<Set<number>>(new Set())

  const toggleQuery = (index: number) => {
    const expanded = expandedQueries()
    const newExpanded = new Set(expanded)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedQueries(newExpanded)
  }

  const renderTable = (data: any[]): string => {
    if (!Array.isArray(data) || data.length === 0) {
      return '<p class="text-base-content/60">No data returned</p>'
    }

    const firstRow = data[0]
    if (!firstRow || typeof firstRow !== 'object') {
      return `<pre class="text-sm">${JSON.stringify(data, null, 2)}</pre>`
    }

    const headers = Object.keys(firstRow)
    
    let html = '<div class="overflow-x-auto"><table class="table table-zebra table-sm w-full">'
    
    // Header row
    html += '<thead><tr>'
    headers.forEach(header => {
      html += `<th class="font-semibold">${header}</th>`
    })
    html += '</tr></thead>'
    
    // Body rows
    html += '<tbody>'
    data.forEach(row => {
      html += '<tr>'
      headers.forEach(header => {
        const value = row[header]
        const displayValue = value === null || value === undefined ? 
          '<span class="text-base-content/40">NULL</span>' : 
          String(value)
        html += `<td>${displayValue}</td>`
      })
      html += '</tr>'
    })
    html += '</tbody></table></div>'
    
    return html
  }

  return (
    <div class={`space-y-6 ${props.class || ''}`}>
      <Show when={props.result.queries.length > 0}>
        <div class="space-y-4">
          <h3 class="text-lg font-semibold flex items-center gap-2">
            <span>SQL Queries Executed</span>
            <span class="badge badge-primary">{props.result.queries.length}</span>
          </h3>
          
          <For each={props.result.queries}>
            {(queryData, index) => (
              <div class="card bg-base-100 border border-base-200 shadow-sm">
                <div class="card-body p-4">
                  <div class="flex items-center justify-between">
                    <h4 class="font-medium text-sm">Query {index() + 1}</h4>
                    <button
                      class="btn btn-xs btn-ghost"
                      onClick={() => toggleQuery(index())}
                      aria-label={expandedQueries().has(index()) ? 'Collapse query' : 'Expand query'}
                    >
                      {expandedQueries().has(index()) ? '▼' : '▶'}
                    </button>
                  </div>
                  
                  <Show when={expandedQueries().has(index())}>
                    <div class="space-y-3">
                      <div>
                        <h5 class="text-sm font-medium mb-2">SQL Query:</h5>
                        <div class="mockup-code">
                          <pre class="px-4 text-sm"><code>{queryData.query}</code></pre>
                        </div>
                      </div>
                      
                      <div>
                        <h5 class="text-sm font-medium mb-2">
                          Results ({Array.isArray(queryData.result) ? queryData.result.length : 0} rows):
                        </h5>
                        <div innerHTML={renderTable(queryData.result)} />
                      </div>
                    </div>
                  </Show>
                  
                  <Show when={!expandedQueries().has(index())}>
                    <div class="text-sm text-base-content/60">
                      Click to view query and {Array.isArray(queryData.result) ? queryData.result.length : 0} result rows
                    </div>
                  </Show>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
      
      <Show when={props.result.finalAnswer}>
        <div class="space-y-2">
          <h3 class="text-lg font-semibold">Analysis Result</h3>
          <div class="card bg-base-100 border border-base-200 shadow-sm">
            <div class="card-body p-4">
              <div class="prose max-w-none">
                {props.result.finalAnswer}
              </div>
            </div>
          </div>
        </div>
      </Show>
      
      <Show when={props.result.queries.length === 0 && !props.result.finalAnswer}>
        <div class="text-center text-base-content/60 py-8">
          <div class="text-4xl mb-4">📊</div>
          <div>No SQL results to display</div>
        </div>
      </Show>
    </div>
  )
}

export default SqlResultsDisplay