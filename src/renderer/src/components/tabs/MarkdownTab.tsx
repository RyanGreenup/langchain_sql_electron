import type { Component } from 'solid-js'
import { Show } from 'solid-js'
import { marked } from 'marked'
import type { MarkdownTabState, TabActions } from '../../types/app'
import { FormControl, Label, LabelText, Textarea } from '../ui/FormControl'
import Button from '../ui/Button'
import Toggle from '../ui/Toggle'
import OutputDisplay from '../ui/OutputDisplay'

interface MarkdownTabProps {
  state: MarkdownTabState & { isMarkdownView: boolean }
  actions: TabActions & { toggleMarkdownView: () => void }
}

const MarkdownTab: Component<MarkdownTabProps> = (props) => {
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
            onClick={props.actions.submitQuestion}
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
  )
}

export default MarkdownTab