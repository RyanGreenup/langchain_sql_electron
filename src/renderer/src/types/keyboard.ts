export interface KeyBinding {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  description: string
  action: () => void
}

export interface KeyboardNavigationConfig {
  bindings: KeyBinding[]
  focusableElements: string[]
  preventDefaultKeys: string[]
}

export enum NavigationKeys {
  TAB = 'Tab',
  ENTER = 'Enter',
  SPACE = ' ',
  ESCAPE = 'Escape',
  ARROW_UP = 'ArrowUp',
  ARROW_DOWN = 'ArrowDown',
  ARROW_LEFT = 'ArrowLeft',
  ARROW_RIGHT = 'ArrowRight',
  HOME = 'Home',
  END = 'End',
  PAGE_UP = 'PageUp',
  PAGE_DOWN = 'PageDown'
}

export enum ModifierKeys {
  CTRL = 'ctrlKey',
  SHIFT = 'shiftKey',
  ALT = 'altKey',
  META = 'metaKey'
}

export interface FocusableElement {
  element: HTMLElement
  index: number
  group?: string
}

export interface KeyboardEventContext {
  event: KeyboardEvent
  currentFocus: HTMLElement | null
  focusableElements: FocusableElement[]
}