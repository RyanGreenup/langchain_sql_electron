import type { Component } from 'solid-js'
import { createSignal, createEffect } from 'solid-js'
import { marked } from 'marked'

const App: Component = () => {
  const [activeTab, setActiveTab] = createSignal('tab1')
  const [dbPath, setDbPath] = createSignal('')
  const [question1, setQuestion1] = createSignal('')
  const [response1, setResponse1] = createSignal('')
  const [isMarkdown, setIsMarkdown] = createSignal(true)
  const [question2, setQuestion2] = createSignal('')
  const [response2, setResponse2] = createSignal('')
  const [isLoading, setIsLoading] = createSignal(false)

  const mockAgent = async (question: string): Promise<string> => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
    return `## Response to: "${question}"\n\nThis is a mock async response that demonstrates the loading state. The agent is working properly and returning formatted content.`
  }

  const handleSubmit1 = async () => {
    if (!question1().trim()) return
    const result = await mockAgent(question1())
    setResponse1(result)
  }

  const handleSubmit2 = async () => {
    if (!question2().trim()) return
    const result = await mockAgent(question2())
    setResponse2(result)
  }

  const renderMarkdown = (content: string) => {
    return marked(content)
  }

  return (
    <div class="min-h-screen bg-base-200 p-4">
      <div class="max-w-6xl mx-auto">
        <div class="navbar bg-base-100 rounded-box shadow-sm mb-6">
          <div class="flex-1">
            <h1 class="text-xl font-bold">AI Agent Tool</h1>
          </div>
          <div class="flex-none">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Database Path:</span>
              </label>
              <input 
                type="text" 
                placeholder="path/to/database.sqlite" 
                class="input input-bordered input-sm w-64"
                value={dbPath()}
                onInput={(e) => setDbPath(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div class="tabs tabs-lifted">
          <button 
            class={`tab ${activeTab() === 'tab1' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('tab1')}
          >
            Markdown Output
          </button>
          <button 
            class={`tab ${activeTab() === 'tab2' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('tab2')}
          >
            Table Output
          </button>
        </div>

        <div class="bg-base-100 rounded-box shadow-sm p-6 min-h-96">
          {activeTab() === 'tab1' && (
            <div class="space-y-6">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Question</span>
                </label>
                <div class="flex gap-2">
                  <textarea 
                    class="textarea textarea-bordered flex-1" 
                    placeholder="Enter your question here..."
                    value={question1()}
                    onInput={(e) => setQuestion1(e.target.value)}
                    rows={3}
                  />
                  <button 
                    class="btn btn-primary"
                    onClick={handleSubmit1}
                    disabled={isLoading()}
                  >
                    {isLoading() ? (
                      <span class="loading loading-spinner loading-sm"></span>
                    ) : (
                      'Submit'
                    )}
                  </button>
                </div>
              </div>

              <div class="divider">Output</div>

              <div class="form-control">
                <label class="label cursor-pointer justify-start gap-2">
                  <input 
                    type="checkbox" 
                    class="toggle toggle-primary"
                    checked={isMarkdown()}
                    onChange={(e) => setIsMarkdown(e.target.checked)}
                  />
                  <span class="label-text">Rendered View</span>
                </label>
              </div>

              <div class="bg-base-200 rounded-lg p-4 min-h-48">
                {isLoading() ? (
                  <div class="flex items-center justify-center h-48">
                    <span class="loading loading-dots loading-lg"></span>
                  </div>
                ) : response1() ? (
                  isMarkdown() ? (
                    <div class="prose max-w-none" innerHTML={renderMarkdown(response1())} />
                  ) : (
                    <pre class="whitespace-pre-wrap text-sm">{response1()}</pre>
                  )
                ) : (
                  <p class="text-base-content/50">Output will appear here...</p>
                )}
              </div>
            </div>
          )}

          {activeTab() === 'tab2' && (
            <div class="space-y-6">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Question</span>
                </label>
                <div class="flex gap-2">
                  <textarea 
                    class="textarea textarea-bordered flex-1" 
                    placeholder="Enter your SQL question here..."
                    value={question2()}
                    onInput={(e) => setQuestion2(e.target.value)}
                    rows={3}
                  />
                  <button 
                    class="btn btn-primary"
                    onClick={handleSubmit2}
                    disabled={isLoading()}
                  >
                    {isLoading() ? (
                      <span class="loading loading-spinner loading-sm"></span>
                    ) : (
                      'Submit'
                    )}
                  </button>
                </div>
              </div>

              <div class="divider">Output</div>

              <div class="bg-base-200 rounded-lg p-4 min-h-48">
                {isLoading() ? (
                  <div class="flex items-center justify-center h-48">
                    <span class="loading loading-dots loading-lg"></span>
                  </div>
                ) : response2() ? (
                  <div>
                    <div class="mb-4">
                      <div class="prose max-w-none" innerHTML={renderMarkdown(response2())} />
                    </div>
                    <div class="overflow-x-auto">
                      <table class="table table-zebra">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Value</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>1</td>
                            <td>Sample Data</td>
                            <td>123.45</td>
                            <td><span class="badge badge-success">Active</span></td>
                          </tr>
                          <tr>
                            <td>2</td>
                            <td>Test Record</td>
                            <td>67.89</td>
                            <td><span class="badge badge-warning">Pending</span></td>
                          </tr>
                          <tr>
                            <td>3</td>
                            <td>Demo Entry</td>
                            <td>99.99</td>
                            <td><span class="badge badge-error">Inactive</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p class="text-base-content/50">Table results will appear here...</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
