import type { Component, JSX } from 'solid-js'

interface FormControlProps {
  children: JSX.Element
  class?: string
}

interface LabelProps {
  children: JSX.Element
  for?: string
  class?: string
}

interface TextareaProps {
  placeholder?: string
  value?: string
  rows?: number
  class?: string
  onInput?: (e: InputEvent & { target: HTMLTextAreaElement }) => void
}

interface InputProps {
  type?: string
  placeholder?: string
  value?: string
  class?: string
  onInput?: (e: InputEvent & { target: HTMLInputElement }) => void
}

export const FormControl: Component<FormControlProps> = (props) => {
  return (
    <div class={`form-control ${props.class || ''}`}>
      {props.children}
    </div>
  )
}

export const Label: Component<LabelProps> = (props) => {
  return (
    <label class={`label ${props.class || ''}`} for={props.for}>
      {props.children}
    </label>
  )
}

export const LabelText: Component<{ children: JSX.Element }> = (props) => {
  return (
    <span class="label-text">{props.children}</span>
  )
}

export const Textarea: Component<TextareaProps> = (props) => {
  return (
    <textarea
      class={`textarea textarea-bordered ${props.class || ''}`}
      placeholder={props.placeholder}
      value={props.value}
      rows={props.rows || 3}
      onInput={props.onInput}
    />
  )
}

export const Input: Component<InputProps> = (props) => {
  return (
    <input
      type={props.type || 'text'}
      class={`input input-bordered ${props.class || ''}`}
      placeholder={props.placeholder}
      value={props.value}
      onInput={props.onInput}
    />
  )
}