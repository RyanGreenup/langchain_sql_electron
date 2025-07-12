import type { Component } from 'solid-js'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  onKeyDown?: (e: KeyboardEvent) => void
  label?: string
  'aria-label'?: string
  class?: string
}

const Toggle: Component<ToggleProps> = (props) => {
  return (
    <label class={`label cursor-pointer justify-start gap-2 ${props.class || ''}`}>
      <input
        type="checkbox"
        class="toggle toggle-primary"
        checked={props.checked}
        onChange={(e) => props.onChange(e.target.checked)}
        onKeyDown={props.onKeyDown}
        aria-label={props['aria-label']}
      />
      {props.label && <span class="label-text">{props.label}</span>}
    </label>
  )
}

export default Toggle