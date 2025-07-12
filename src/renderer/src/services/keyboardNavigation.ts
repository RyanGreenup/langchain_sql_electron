import { createSignal, onCleanup, onMount } from 'solid-js'
import type { 
  KeyBinding, 
  KeyboardNavigationConfig, 
  FocusableElement, 
  KeyboardEventContext,
  NavigationKeys,
  ModifierKeys 
} from '../types/keyboard'

export class KeyboardNavigationService {
  private bindings: Map<string, KeyBinding> = new Map()
  private focusableElements: FocusableElement[] = []
  private currentFocusIndex = -1
  private helpVisible = false

  constructor() {
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
    document.addEventListener('keyup', this.handleKeyUp.bind(this))
  }

  public registerBinding(binding: KeyBinding): void {
    const key = this.createBindingKey(binding)
    this.bindings.set(key, binding)
  }

  public registerBindings(bindings: KeyBinding[]): void {
    bindings.forEach(binding => this.registerBinding(binding))
  }

  public unregisterBinding(binding: Partial<KeyBinding>): void {
    const key = this.createBindingKey(binding as KeyBinding)
    this.bindings.delete(key)
  }

  public clearBindings(): void {
    this.bindings.clear()
  }

  private createBindingKey(binding: KeyBinding): string {
    const modifiers = []
    if (binding.ctrlKey) modifiers.push('ctrl')
    if (binding.shiftKey) modifiers.push('shift')
    if (binding.altKey) modifiers.push('alt')
    if (binding.metaKey) modifiers.push('meta')
    
    return `${modifiers.join('+').toLowerCase()}+${binding.key.toLowerCase()}`
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const context: KeyboardEventContext = {
      event,
      currentFocus: document.activeElement as HTMLElement,
      focusableElements: this.focusableElements
    }

    const bindingKey = this.createBindingKey({
      key: event.key,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey
    } as KeyBinding)

    const binding = this.bindings.get(bindingKey)
    if (binding) {
      event.preventDefault()
      event.stopPropagation()
      binding.action()
      return
    }

    this.handleNavigationKeys(context)
  }

  private handleKeyUp(event: KeyboardEvent): void {
    // Handle any key up specific logic here
  }

  private handleNavigationKeys(context: KeyboardEventContext): void {
    const { event, currentFocus } = context

    switch (event.key) {
      case 'Tab':
        if (!event.shiftKey) {
          this.focusNext()
        } else {
          this.focusPrevious()
        }
        event.preventDefault()
        break

      case 'ArrowDown':
        if (this.isInTabGroup(currentFocus)) {
          this.focusNext()
          event.preventDefault()
        }
        break

      case 'ArrowUp':
        if (this.isInTabGroup(currentFocus)) {
          this.focusPrevious()
          event.preventDefault()
        }
        break

      case 'ArrowLeft':
        if (this.isInTabGroup(currentFocus)) {
          this.focusPrevious()
          event.preventDefault()
        }
        break

      case 'ArrowRight':
        if (this.isInTabGroup(currentFocus)) {
          this.focusNext()
          event.preventDefault()
        }
        break

      case 'Home':
        if (event.ctrlKey) {
          this.focusFirst()
          event.preventDefault()
        }
        break

      case 'End':
        if (event.ctrlKey) {
          this.focusLast()
          event.preventDefault()
        }
        break

      case 'Escape':
        this.handleEscape()
        break
    }
  }

  private isInTabGroup(element: HTMLElement | null): boolean {
    if (!element) return false
    return element.closest('.tabs') !== null || 
           element.closest('[role="tablist"]') !== null
  }

  public updateFocusableElements(): void {
    const selectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '.tab',
      '.toggle'
    ].join(', ')

    const elements = Array.from(document.querySelectorAll(selectors)) as HTMLElement[]
    
    this.focusableElements = elements
      .filter(el => this.isVisible(el))
      .map((element, index) => ({
        element,
        index,
        group: this.getElementGroup(element)
      }))
  }

  private isVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element)
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           element.offsetParent !== null
  }

  private getElementGroup(element: HTMLElement): string | undefined {
    if (element.closest('.tabs')) return 'tabs'
    if (element.closest('.form-control')) return 'form'
    if (element.closest('.navbar')) return 'navbar'
    return undefined
  }

  public focusNext(): void {
    this.updateFocusableElements()
    if (this.focusableElements.length === 0) return

    const currentElement = document.activeElement as HTMLElement
    const currentIndex = this.focusableElements.findIndex(
      item => item.element === currentElement
    )

    const nextIndex = (currentIndex + 1) % this.focusableElements.length
    this.focusableElements[nextIndex].element.focus()
    this.currentFocusIndex = nextIndex
  }

  public focusPrevious(): void {
    this.updateFocusableElements()
    if (this.focusableElements.length === 0) return

    const currentElement = document.activeElement as HTMLElement
    const currentIndex = this.focusableElements.findIndex(
      item => item.element === currentElement
    )

    const prevIndex = currentIndex <= 0 
      ? this.focusableElements.length - 1 
      : currentIndex - 1
    
    this.focusableElements[prevIndex].element.focus()
    this.currentFocusIndex = prevIndex
  }

  public focusFirst(): void {
    this.updateFocusableElements()
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].element.focus()
      this.currentFocusIndex = 0
    }
  }

  public focusLast(): void {
    this.updateFocusableElements()
    if (this.focusableElements.length > 0) {
      const lastIndex = this.focusableElements.length - 1
      this.focusableElements[lastIndex].element.focus()
      this.currentFocusIndex = lastIndex
    }
  }

  private handleEscape(): void {
    const currentElement = document.activeElement as HTMLElement
    if (currentElement && currentElement.blur) {
      currentElement.blur()
    }
  }

  public getBindings(): KeyBinding[] {
    return Array.from(this.bindings.values())
  }

  public destroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this))
    document.removeEventListener('keyup', this.handleKeyUp.bind(this))
    this.clearBindings()
  }
}

export function createKeyboardNavigation() {
  const [keyboardService] = createSignal(new KeyboardNavigationService())
  
  onMount(() => {
    keyboardService().updateFocusableElements()
  })

  onCleanup(() => {
    keyboardService().destroy()
  })

  return keyboardService
}