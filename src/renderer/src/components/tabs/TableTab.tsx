import type { Component } from 'solid-js'
import { Show } from 'solid-js'
import { marked } from 'marked'
import type { TabState, TabActions } from '../../types/app'
import { FormControl, Label, LabelText, Textarea } from '../ui/FormControl'
import Button from '../ui/Button'
import OutputDisplay from '../ui/OutputDisplay'

interface TableTabProps {
  state: TabState
  actions: TabActions
}

const TableTab: Component<TableTabProps> = (props) => {
  const renderMarkdown = (content: string) => {
    return marked(content)
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
            onClick={props.actions.submitQuestion}
            loading={props.state.isLoading}
            aria-label="Submit question for table output"
          >
            Submit
          </Button>
        </div>
      </FormControl>

      <div class="divider">Output</div>

      <OutputDisplay
        isLoading={props.state.isLoading}
        fallbackMessage="Table results will appear here..."
      >
        <Show when={props.state.response}>
          <div class="prose max-w-none" innerHTML={renderMarkdown(props.state.response)} />
        </Show>
      </OutputDisplay>
    </div>
  )
}

export default TableTab