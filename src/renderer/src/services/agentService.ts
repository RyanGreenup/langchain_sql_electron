import type { AgentService } from '../types/app'

// Import the agent functions from the existing agent service
// Note: We'll need to handle the Node.js environment differences in Electron
async function importAgentFunctions() {
  // Dynamic import to handle the agent module
  const agentModule = await import('./agent')
  return agentModule
}

interface QueryResult {
  query: string
  result: Record<string, any>[]
}

interface AgentResult {
  queries: QueryResult[]
  finalAnswer: string
}

function formatAgentResultToMarkdown(result: AgentResult): string {
  let markdown = `# 📊 SQL Agent Analysis Summary\n\n`

  if (result.queries.length > 0) {
    markdown += `## 🔍 SQL Queries Executed\n\n`
    
    result.queries.forEach((queryResult, index) => {
      markdown += `### Query ${index + 1}:\n`
      markdown += `\`\`\`sql\n${queryResult.query}\n\`\`\`\n\n`
    })

    markdown += `## 📋 Query Results\n\n`
    
    result.queries.forEach((queryResult, index) => {
      markdown += `### Result ${index + 1}:\n\n`
      
      const resultJson = JSON.stringify(queryResult.result, null, 2)
      const tableFormatted = formatJsonAsMarkdownTable(resultJson)
      
      if (tableFormatted.includes('|') && 
          !tableFormatted.startsWith('Error') &&
          !tableFormatted.startsWith('No tabular') &&
          !tableFormatted.startsWith('Data is not')) {
        markdown += `${tableFormatted}\n\n`
        markdown += `**Raw JSON:**\n\`\`\`json\n${resultJson}\n\`\`\`\n\n`
      } else {
        markdown += `\`\`\`json\n${resultJson}\n\`\`\`\n\n`
      }
    })
  }

  if (result.finalAnswer) {
    markdown += `## 🤖 Agent Response\n\n${result.finalAnswer}\n\n`
  }

  return markdown
}

function formatJsonAsMarkdownTable(jsonString: string): string {
  try {
    const data = JSON.parse(jsonString)

    if (!Array.isArray(data) || data.length === 0) {
      return "No tabular data available"
    }

    const firstRow = data[0]
    if (typeof firstRow !== "object" || firstRow === null) {
      return "Data is not in tabular format"
    }

    const headers = Object.keys(firstRow)

    const headerRow = "| " + headers.join(" | ") + " |"
    const separatorRow = "| " + headers.map(() => "---").join(" | ") + " |"

    const dataRows = data.map((row) => {
      const values = headers.map((header) => {
        const value = row[header]
        return value !== null && value !== undefined ? String(value) : ""
      })
      return "| " + values.join(" | ") + " |"
    })

    return [headerRow, separatorRow, ...dataRows].join("\n")
  } catch (error) {
    return "Error formatting data as table: " + error
  }
}

export class SqlAgentService implements AgentService {
  private dbPath: string

  constructor(dbPath: string = './Chinook.db') {
    this.dbPath = dbPath
  }

  async processQuestion(question: string): Promise<string> {
    try {
      // Import and use the existing agent functions
      const { agent_results_with_db } = await import('./agent')
      const result = await agent_results_with_db(question, this.dbPath)
      return formatAgentResultToMarkdown(result)
    } catch (error) {
      console.error('Agent processing error:', error)
      
      // Fallback to mock response if agent fails
      return this.generateErrorResponse(question, error)
    }
  }

  setDatabasePath(dbPath: string): void {
    this.dbPath = dbPath
  }

  private generateErrorResponse(question: string, error: any): string {
    return `## ⚠️ Agent Error\n\n**Question:** "${question}"\n\n**Error:** ${error.message || 'Unknown error occurred'}\n\n**Note:** Make sure the ANTHROPIC_API_KEY environment variable is set and the database is accessible.`
  }
}

export class MockAgentService implements AgentService {
  private readonly responseDelay: number
  private dbPath: string

  constructor(responseDelay: number = 2000) {
    this.responseDelay = responseDelay
    this.dbPath = './Chinook.db'
  }

  async processQuestion(question: string): Promise<string> {
    await this.simulateDelay()
    return this.generateMockResponse(question)
  }

  setDatabasePath(dbPath: string): void {
    this.dbPath = dbPath
  }

  private async simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this.responseDelay))
  }

  private generateMockResponse(question: string): string {
    return `## Response to: "${question}"\n\n**Database:** ${this.dbPath}\n\nThis is a mock async response that demonstrates the loading state. The agent is working properly and returning formatted content.\n\n### Sample Query:\n\`\`\`sql\nSELECT * FROM customers WHERE name LIKE '%test%'\n\`\`\`\n\n### Sample Results:\n\n| ID | Name | Email |\n|---|---|---|\n| 1 | Test User | test@example.com |\n| 2 | Another Test | another@test.com |`
  }
}

export function createAgentService(): AgentService {
  // Check if we're in an environment where we can use the SQL agent
  // In development, try to use the real agent, fallback to mock
  const useRealAgent = process.env.NODE_ENV !== 'test' && 
                      typeof process !== 'undefined' && 
                      process.env.ANTHROPIC_API_KEY

  if (useRealAgent) {
    return new SqlAgentService()
  } else {
    console.warn('Using mock agent service. Set ANTHROPIC_API_KEY to use real agent.')
    return new MockAgentService()
  }
}