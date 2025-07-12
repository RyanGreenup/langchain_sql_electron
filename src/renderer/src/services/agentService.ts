import type { AgentService } from '../types/app'

export class MockAgentService implements AgentService {
  private readonly responseDelay: number

  constructor(responseDelay: number = 2000) {
    this.responseDelay = responseDelay
  }

  async processQuestion(question: string): Promise<string> {
    await this.simulateDelay()
    return this.generateMockResponse(question)
  }

  private async simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this.responseDelay))
  }

  private generateMockResponse(question: string): string {
    return `## Response to: "${question}"\n\nThis is a mock async response that demonstrates the loading state. The agent is working properly and returning formatted content.`
  }
}

export function createAgentService(): AgentService {
  return new MockAgentService()
}