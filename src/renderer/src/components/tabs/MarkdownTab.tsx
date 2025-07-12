import type { Component } from 'solid-js'
import { Show, createSignal } from 'solid-js'
import { marked } from 'marked'
import type { MarkdownTabState, TabActions } from '../../types/app'
import { FormControl, Label, LabelText, Textarea } from '../ui/FormControl'
import Button from '../ui/Button'
import Toggle from '../ui/Toggle'
import OutputDisplay from '../ui/OutputDisplay'
import AgentLog from '../ui/AgentLog'
import { useLogStore } from '../../hooks/useLogStore'

interface MarkdownTabProps {
  state: MarkdownTabState & { isMarkdownView: boolean }
  actions: TabActions & { toggleMarkdownView: () => void }
}

const MarkdownTab: Component<MarkdownTabProps> = (props) => {
  const [showLog, setShowLog] = createSignal(true)
  const logStore = useLogStore()

  const renderMarkdown = (content: string) => {
    return marked(content)
  }

  const handleToggleMarkdown = () => {
    props.actions.toggleMarkdownView()
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleToggleMarkdown()
    }
  }

  const handleSubmitWithLogClear = () => {
    logStore.clearEntries()
    props.actions.submitQuestion()
  }

  return (
    <div class="space-y-6" role="tabpanel" id="tab1-panel" aria-labelledby="tab1">
      <FormControl>
        <Label>
          <LabelText>Question</LabelText>
        </Label>
        <div class="flex gap-2">
          <Textarea
            placeholder="Enter your question here..."
            value={props.state.question}
            onInput={(e) => props.actions.updateQuestion(e.target.value)}
            class="flex-1"
          />
          <Button
            onClick={handleSubmitWithLogClear}
            loading={props.state.isLoading}
            aria-label="Submit question for markdown output"
          >
            Submit
          </Button>
        </div>
      </FormControl>

      <div class="divider">Output</div>

      <FormControl>
        <Toggle
          checked={props.state.isMarkdownView}
          onChange={handleToggleMarkdown}
          onKeyDown={handleKeyDown}
          label="Rendered View"
          aria-label="Toggle between rendered and raw markdown view"
        />
      </FormControl>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <OutputDisplay
            isLoading={props.state.isLoading}
            fallbackMessage="Output will appear here..."
          >
            <Show when={props.state.response}>
              <Show 
                when={props.state.isMarkdownView}
                fallback={<pre class="whitespace-pre-wrap text-sm">{props.state.response}</pre>}
              >
                <div class="prose max-w-none" innerHTML={renderMarkdown(props.state.response)} />
              </Show>
            </Show>
          </OutputDisplay>
        </div>
        
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Agent Activity</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowLog(!showLog())}
              aria-label="Toggle agent activity log"
            >
              {showLog() ? 'Hide Log' : 'Show Log'}
            </Button>
          </div>
          <Show when={showLog()}>
            <AgentLog entries={logStore.entries()} />
          </Show>
        </div>
      </div>
    </div>
  )
}

export default MarkdownTab