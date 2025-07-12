import { marked } from 'marked'
import type { Component } from 'solid-js'
import { Show, createSignal } from 'solid-js'
import { useLogStore } from '../../hooks/useLogStore'
import type { MarkdownTabState, TabActions } from '../../types/app'
import AgentLog from '../ui/AgentLog'
import Button from '../ui/Button'
import { FormControl, Label, LabelText, Textarea } from '../ui/FormControl'
import OutputDisplay from '../ui/OutputDisplay'
import Toggle from '../ui/Toggle'

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

      <div class="flex gap-6">
        <div
          classList={{
            'transition-all': false,
            'duration-300': false,
            'flex-1': showLog(),
            'w-full': !showLog()
          }}
        >
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

        <Show when={showLog()}>
          <div class="w-96 transition-all duration-300">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold">Agent Activity</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowLog(false)}
                aria-label="Hide agent activity log"
              >
                Hide Log
              </Button>
            </div>
            <AgentLog entries={logStore.entries()} />
          </div>
        </Show>

        <Show when={!showLog()}>
          <div class="flex flex-col items-center justify-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowLog(true)}
              aria-label="Show agent activity log"
              class="writing-mode-vertical text-orientation-mixed"
            >
              Show Log
            </Button>
          </div>
        </Show>
      </div>
    </div>
  )
}

export default MarkdownTab
