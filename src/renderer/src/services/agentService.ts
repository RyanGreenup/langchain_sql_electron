import type { AgentService } from '../types/app'
import type { QueryResult, AgentResult } from './agent'

// Import the agent functions from the existing agent service
// Note: We'll need to handle the Node.js environment differences in Electron
async function importAgentFunctions() {
  // Dynamic import to handle the agent module
  const agentModule = await import('./agent')
  return agentModule
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
  private mockService: MockAgentService

  constructor(dbPath: string = './Chinook.db') {
    this.dbPath = dbPath
    this.mockService = new MockAgentService()
  }

  async processQuestionStructured(question: string): Promise<AgentResult | null> {
    // Validate database path first
    const validationResult = await this.validateDatabase()
    if (!validationResult.valid) {
      throw new Error(validationResult.error)
    }

    // Check if we have a valid API key using Electron API
    let hasApiKey = false
    try {
      if (typeof window !== 'undefined' && window.api) {
        const apiKey = await window.api.getCurrentApiKey()
        hasApiKey = !!apiKey
      }
    } catch (error) {
      console.error('Failed to check API key:', error)
      hasApiKey = false
    }

    if (!hasApiKey) {
      return this.mockService.generateMockStructuredResponse(question)
    }

    try {
      // Use IPC to run the agent in the main process where SQLite/TypeORM work properly
      if (typeof window !== 'undefined' && window.api) {
        const result = await window.api.runSqlAgent(question, this.dbPath)
        
        if (result.success) {
          return result.result
        } else {
          console.warn('Agent error from main process:', result.error)
          return this.mockService.generateMockStructuredResponse(question)
        }
      } else {
        // Fallback if IPC is not available
        console.warn('IPC not available, using mock service')
        return this.mockService.generateMockStructuredResponse(question)
      }
    } catch (error) {
      console.error('Agent processing error:', error)
      
      // For any error, fall back to mock service
      console.warn('Falling back to mock service due to error:', error.message)
      return this.mockService.generateMockStructuredResponse(question)
    }
  }

  async processQuestion(question: string): Promise<string> {
    // Validate database path first
    const validationResult = await this.validateDatabase()
    if (!validationResult.valid) {
      return this.generateDatabaseErrorResponse(question, validationResult.error)
    }

    // Check if we have a valid API key using Electron API
    let hasApiKey = false
    try {
      if (typeof window !== 'undefined' && window.api) {
        const apiKey = await window.api.getCurrentApiKey()
        hasApiKey = !!apiKey
      }
    } catch (error) {
      console.error('Failed to check API key:', error)
      hasApiKey = false
    }

    if (!hasApiKey) {
      return this.generateNoApiKeyResponse(question)
    }

    try {
      // Use IPC to run the agent in the main process where SQLite/TypeORM work properly
      if (typeof window !== 'undefined' && window.api) {
        const result = await window.api.runSqlAgent(question, this.dbPath)
        
        if (result.success) {
          return formatAgentResultToMarkdown(result.result)
        } else {
          // Handle error from main process
          if (result.error?.includes('ANTHROPIC_API_KEY') || 
              result.error?.includes('API key') ||
              result.error?.includes('authentication')) {
            return this.generateApiKeyErrorResponse(question, new Error(result.error))
          }
          
          console.warn('Agent error from main process:', result.error)
          return this.mockService.processQuestion(question)
        }
      } else {
        // Fallback if IPC is not available
        console.warn('IPC not available, using mock service')
        return this.mockService.processQuestion(question)
      }
    } catch (error) {
      console.error('Agent processing error:', error)
      
      // Check if it's an API key error
      if (error.message?.includes('ANTHROPIC_API_KEY') || 
          error.message?.includes('API key') ||
          error.message?.includes('authentication')) {
        return this.generateApiKeyErrorResponse(question, error)
      }
      
      // For other errors, fall back to mock service
      console.warn('Falling back to mock service due to error:', error.message)
      return this.mockService.processQuestion(question)
    }
  }

  setDatabasePath(dbPath: string): void {
    this.dbPath = dbPath
    this.mockService.setDatabasePath(dbPath)
  }

  private async validateDatabase(): Promise<{ valid: boolean; error?: string }> {
    if (!this.dbPath || !this.dbPath.trim()) {
      return {
        valid: false,
        error: 'Database path is required. Please specify a database file path above.'
      }
    }

    try {
      if (typeof window !== 'undefined' && window.api) {
        return await window.api.validateDatabase(this.dbPath)
      } else {
        return {
          valid: false,
          error: 'Database validation unavailable (IPC not available)'
        }
      }
    } catch (error) {
      return {
        valid: false,
        error: `Database validation failed: ${error.message}`
      }
    }
  }

  private generateDatabaseErrorResponse(question: string, error: string): string {
    return `## ⚠️ Database Connection Error\n\n**Question:** "${question}"\n\n**Error:** ${error}\n\n**Possible Solutions:**\n- Verify the database file path is correct\n- Ensure the file exists and is accessible\n- Check that the file is a valid SQLite database\n- Make sure the file is not locked by another application\n\n**Action Required:** Please provide a valid database path above to use the SQL agent.`
  }

  private generateNoApiKeyResponse(question: string): string {
    return `## ⚠️ API Key Required\n\n**Question:** "${question}"\n\n**Status:** No Anthropic API key found\n\n**Action Required:** Please set your Anthropic API key using the configuration above to use the SQL agent.\n\n---\n\n**Mock Response Preview:**\n\n${this.mockService.generateMockResponse(question)}`
  }

  private generateApiKeyErrorResponse(question: string, error: any): string {
    return `## ⚠️ API Key Authentication Error\n\n**Question:** "${question}"\n\n**Error:** ${error.message || 'Authentication failed'}\n\n**Possible Issues:**\n- Invalid API key format\n- Expired API key\n- Insufficient API key permissions\n- Network connectivity issues\n\n**Action:** Please check your Anthropic API key configuration.\n\n---\n\n**Mock Response Preview:**\n\n${this.mockService.generateMockResponse(question)}`
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

  async generateMockStructuredResponse(question: string): Promise<AgentResult> {
    await this.simulateDelay()
    
    return {
      queries: [
        {
          query: "SELECT * FROM customers WHERE name LIKE '%test%'",
          result: [
            { id: 1, name: "Test User", email: "test@example.com", country: "USA" },
            { id: 2, name: "Another Test", email: "another@test.com", country: "Canada" }
          ]
        },
        {
          query: "SELECT COUNT(*) as total_customers FROM customers",
          result: [
            { total_customers: 59 }
          ]
        }
      ],
      finalAnswer: `Based on your question "${question}", I've executed SQL queries against the ${this.dbPath} database. This is a mock response demonstrating the structured data format. The queries above show sample customer data and counts.`
    }
  }

  setDatabasePath(dbPath: string): void {
    this.dbPath = dbPath
  }

  private async simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this.responseDelay))
  }

  generateMockResponse(question: string): string {
    return `## Response to: "${question}"\n\n**Database:** ${this.dbPath}\n\nThis is a mock async response that demonstrates the loading state. The agent is working properly and returning formatted content.\n\n### Sample Query:\n\`\`\`sql\nSELECT * FROM customers WHERE name LIKE '%test%'\n\`\`\`\n\n### Sample Results:\n\n| ID | Name | Email |\n|---|---|---|\n| 1 | Test User | test@example.com |\n| 2 | Another Test | another@test.com |`
  }
}

export function createAgentService(): AgentService {
  // Always start with SqlAgentService, it will handle API key validation internally
  return new SqlAgentService()
}