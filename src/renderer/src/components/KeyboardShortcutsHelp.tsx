import { Component, Show, createSignal, onMount, createEffect } from 'solid-js'
import type { KeyBinding } from '../types/keyboard'

interface KeyboardShortcutsHelpProps {
  bindings: KeyBinding[]
  isVisible: boolean
  onClose: () => void
}

const KeyboardShortcutsHelp: Component<KeyboardShortcutsHelpProps> = (props) => {
  let dialogRef: HTMLDivElement | undefined

  const formatShortcut = (binding: KeyBinding): string => {
    const parts: string[] = []

    if (binding.ctrlKey) parts.push('Ctrl')
    if (binding.altKey) parts.push('Alt')
    if (binding.shiftKey) parts.push('Shift')
    if (binding.metaKey) parts.push('Cmd')

    parts.push(binding.key)

    return parts.join(' + ')
  }

  createEffect(() => {
    if (props.isVisible && dialogRef) {
      setTimeout(() => {
        dialogRef?.focus()
      }, 100)
    }
  })

  const navigationShortcuts = [
    { key: 'Tab', description: 'Navigate to next element' },
    { key: 'Shift + Tab', description: 'Navigate to previous element' },
    { key: 'Arrow Keys', description: 'Navigate between tabs/elements' },
    { key: 'Enter', description: 'Activate focused element' },
    { key: 'Space', description: 'Toggle switches/checkboxes' },
    { key: 'Escape', description: 'Close dialogs/clear focus' },
    { key: 'Ctrl + Home', description: 'Focus first element' },
    { key: 'Ctrl + End', description: 'Focus last element' }
  ]

  return (
    <Show when={props.isVisible}>
      <div
        class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20"
        onClick={props.onClose}
      >
        <div
          ref={dialogRef}
          class="bg-base-100 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-auto focus:outline-none"
          tabindex="0"
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-title"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              props.onClose()
            }
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 id="help-title" class="text-xl font-bold">Keyboard Shortcuts</h2>
              <button
                class="btn btn-sm btn-circle btn-ghost"
                onClick={props.onClose}
                aria-label="Close help"
              >
                ✕
              </button>
            </div>

            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-lg font-semibold mb-3">Application Shortcuts</h3>
                <div class="space-y-2">
                  {props.bindings.map((binding) => (
                    <div class="flex justify-between items-center py-2 border-b border-base-200 last:border-b-0">
                      <span class="text-sm">{binding.description}</span>
                      <kbd class="kbd kbd-sm">{formatShortcut(binding)}</kbd>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 class="text-lg font-semibold mb-3">Navigation</h3>
                <div class="space-y-2">
                  {navigationShortcuts.map((shortcut) => (
                    <div class="flex justify-between items-center py-2 border-b border-base-200 last:border-b-0">
                      <span class="text-sm">{shortcut.description}</span>
                      <kbd class="kbd kbd-sm">{shortcut.key}</kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div class="mt-6 bg-info bg-opacity-10 p-4 rounded-lg">
              <h4 class="font-semibold text-info mb-2">Accessibility Note</h4>
              <p class="text-sm text-info">
                This application is designed to be fully accessible via keyboard navigation.
                All interactive elements can be reached and activated without a mouse. Use arrow keys to scroll this dialog.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Show>
  )
}

export default KeyboardShortcutsHelp
