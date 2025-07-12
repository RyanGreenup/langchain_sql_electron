import type { KeyBinding } from '../types/keyboard'
import type { TabId } from '../types/app'

export interface KeyboardShortcutActions {
  switchToTab: (tabId: TabId) => void
  submitCurrentTab: () => void
  toggleMarkdownView: () => void
  focusDbPath: () => void
  showHelp: () => void
  hideHelp: () => void
}

export function createKeyboardShortcuts(actions: KeyboardShortcutActions): KeyBinding[] {
  return [
    {
      key: '1',
      ctrlKey: true,
      description: 'Switch to Markdown Output tab',
      action: () => actions.switchToTab('tab1')
    },
    {
      key: '2',
      ctrlKey: true,
      description: 'Switch to Table Output tab',
      action: () => actions.switchToTab('tab2')
    },
    {
      key: 'Enter',
      ctrlKey: true,
      description: 'Submit current question',
      action: actions.submitCurrentTab
    },
    {
      key: 'm',
      ctrlKey: true,
      description: 'Toggle markdown/raw view (Tab 1)',
      action: actions.toggleMarkdownView
    },
    {
      key: 'd',
      ctrlKey: true,
      description: 'Focus database path input',
      action: actions.focusDbPath
    },
    {
      key: '/',
      ctrlKey: true,
      description: 'Show keyboard shortcuts help',
      action: actions.showHelp
    },
    {
      key: 'Escape',
      description: 'Close help dialog',
      action: actions.hideHelp
    }
  ]
}