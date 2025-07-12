import type { Component } from 'solid-js'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  type?: 'spinner' | 'dots'
  class?: string
}

const LoadingSpinner: Component<LoadingSpinnerProps> = (props) => {
  const sizeClass = () => {
    switch (props.size) {
      case 'sm': return 'loading-sm'
      case 'lg': return 'loading-lg'
      default: return ''
    }
  }

  const typeClass = () => {
    switch (props.type) {
      case 'dots': return 'loading-dots'
      case 'spinner':
      default: return 'loading-spinner'
    }
  }

  return (
    <span class={`loading ${typeClass()} ${sizeClass()} ${props.class || ''}`} />
  )
}

export default LoadingSpinner