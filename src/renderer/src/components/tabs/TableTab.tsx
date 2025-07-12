import type { Component } from 'solid-js'
import { Show, createSignal } from 'solid-js'
import { marked } from 'marked'
import type { TableTabState, TabActions } from '../../types/app'
import { FormControl, Label, LabelText, Textarea } from '../ui/FormControl'
import Button from '../ui/Button'
import OutputDisplay from '../ui/OutputDisplay'
import AgentLog from '../ui/AgentLog'
import SqlResultsDisplay from '../ui/SqlResultsDisplay'
import { useLogStore } from '../../hooks/useLogStore'

interface TableTabProps {
  state: TableTabState
  actions: TabActions
}

const TableTab: Component<TableTabProps> = (props) => {
  const [showLog, setShowLog] = createSignal(true)
  const logStore = useLogStore()
  
  const renderMarkdown = (content: string) => {
    return marked(content)
  }

  const handleSubmitWithLogClear = () => {
    logStore.clearEntries()
    props.actions.submitQuestion()
  }

  return (
    <div class="space-y-6" role="tabpanel" id="tab2-panel" aria-labelledby="tab2">
      <FormControl>
        <Label>
          <LabelText>Question</LabelText>
        </Label>
        <div class="flex gap-2">
          <Textarea
            placeholder="Enter your SQL question here..."
            value={props.state.question}
            onInput={(e) => props.actions.updateQuestion(e.target.value)}
            class="flex-1"
          />
          <Button
            onClick={handleSubmitWithLogClear}
            loading={props.state.isLoading}
            aria-label="Submit question for table output"
          >
            Submit
          </Button>
        </div>
      </FormControl>

      <div class="divider">Output</div>

      <div class="flex gap-6">
        <div class={`transition-all duration-300 ${showLog() ? 'flex-1' : 'w-full'}`}>
          <Show 
            when={props.state.sqlResult}
            fallback={
              <OutputDisplay
                isLoading={props.state.isLoading}
                fallbackMessage="Table results will appear here..."
              >
                <Show when={props.state.response}>
                  <div class="prose max-w-none" innerHTML={renderMarkdown(props.state.response)} />
                </Show>
              </OutputDisplay>
            }
          >
            <SqlResultsDisplay 
              result={props.state.sqlResult!} 
              isLoading={props.state.isLoading}
            />
          </Show>
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

export default TableTab