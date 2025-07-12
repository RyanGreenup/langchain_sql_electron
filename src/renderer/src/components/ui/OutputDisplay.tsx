import type { Component, JSX } from 'solid-js'
import { Show } from 'solid-js'
import LoadingSpinner from './LoadingSpinner'

interface OutputDisplayProps {
  isLoading: boolean
  content?: string
  fallbackMessage?: string
  class?: string
  children?: JSX.Element
}

const OutputDisplay: Component<OutputDisplayProps> = (props) => {
  return (
    <div class={`bg-base-200 rounded-lg p-4 min-h-48 ${props.class || ''}`}>
      <Show 
        when={!props.isLoading}
        fallback={
          <div class="flex items-center justify-center h-48">
            <LoadingSpinner size="lg" type="dots" />
          </div>
        }
      >
        <Show 
          when={props.content || props.children}
          fallback={
            <p class="text-base-content/50">
              {props.fallbackMessage || 'Output will appear here...'}
            </p>
          }
        >
          {props.children || <div>{props.content}</div>}
        </Show>
      </Show>
    </div>
  )
}

export default OutputDisplay