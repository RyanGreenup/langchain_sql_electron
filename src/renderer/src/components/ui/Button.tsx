import type { Component, JSX } from 'solid-js'
import { Show } from 'solid-js'
import LoadingSpinner from './LoadingSpinner'

interface ButtonProps {
  children: JSX.Element
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  class?: string
  'aria-label'?: string
}

const Button: Component<ButtonProps> = (props) => {
  const variantClass = () => {
    switch (props.variant) {
      case 'secondary': return 'btn-secondary'
      case 'outline': return 'btn-outline'
      case 'ghost': return 'btn-ghost'
      case 'primary':
      default: return 'btn-primary'
    }
  }

  const sizeClass = () => {
    switch (props.size) {
      case 'sm': return 'btn-sm'
      case 'lg': return 'btn-lg'
      default: return ''
    }
  }

  return (
    <button
      class={`btn ${variantClass()} ${sizeClass()} ${props.class || ''}`}
      onClick={props.onClick}
      disabled={props.disabled || props.loading}
      aria-label={props['aria-label']}
    >
      <Show when={props.loading} fallback={props.children}>
        <LoadingSpinner size="sm" />
      </Show>
    </button>
  )
}

export default Button