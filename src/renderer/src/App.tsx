import type { Component } from 'solid-js'
import { createEffect, onMount } from 'solid-js'
import { Show } from 'solid-js'
import { createKeyboardNavigation } from './services/keyboardNavigation'
import { createAgentService } from './services/agentService'
import { useAppState } from './hooks/useAppState'
import { createKeyboardShortcuts } from './config/keyboardShortcuts'
import type { KeyboardShortcutActions } from './config/keyboardShortcuts'
import AppHeader from './components/layout/AppHeader'
import TabNavigation from './components/tabs/TabNavigation'
import MarkdownTab from './components/tabs/MarkdownTab'
import TableTab from './components/tabs/TableTab'
import Button from './components/ui/Button'
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp'

const App: Component = () => {
  const agentService = createAgentService()
  const keyboardService = createKeyboardNavigation()
  const { state, actions } = useAppState(agentService)

  const focusDbPath = () => {
    const dbInput = document.querySelector('input[placeholder*="database"]') as HTMLInputElement
    if (dbInput) dbInput.focus()
  }

  const submitCurrentTab = () => {
    if (state.activeTab() === 'tab1') {
      actions.tab1Actions.submitQuestion()
    } else {
      actions.tab2Actions.submitQuestion()
    }
  }

  const toggleMarkdownViewIfTab1 = () => {
    if (state.activeTab() === 'tab1') {
      actions.toggleMarkdownView()
    }
  }

  const handleTabChange = (tabId: 'tab1' | 'tab2') => {
    actions.switchTab(tabId)
    keyboardService().updateFocusableElements()
  }

  const shortcutActions: KeyboardShortcutActions = {
    switchToTab: handleTabChange,
    submitCurrentTab,
    toggleMarkdownView: toggleMarkdownViewIfTab1,
    focusDbPath,
    showHelp: actions.showHelp,
    hideHelp: actions.hideHelp
  }

  const keyBindings = createKeyboardShortcuts(shortcutActions)

  onMount(() => {
    keyboardService().registerBindings(keyBindings)
    keyboardService().updateFocusableElements()
    
    const updateFocusableElements = () => {
      setTimeout(() => keyboardService().updateFocusableElements(), 100)
    }
    
    createEffect(() => {
      state.activeTab()
      updateFocusableElements()
    })
    
    createEffect(() => {
      state.tab1().isLoading || state.tab2().isLoading
      updateFocusableElements()
    })
  })

  return (
    <div class="min-h-screen bg-base-200 p-4">
      <div class="max-w-6xl mx-auto">
        <AppHeader
          dbPath={state.dbPath()}
          onDbPathChange={actions.updateDbPath}
          onApiKeyChange={actions.updateApiKey}
        />

        <TabNavigation
          activeTab={state.activeTab()}
          onTabChange={handleTabChange}
        />

        <div class="bg-base-100 rounded-box shadow-sm p-6 min-h-96">
          <Show when={state.activeTab() === 'tab1'}>
            <MarkdownTab
              state={state.tab1()}
              actions={actions.tab1Actions}
            />
          </Show>

          <Show when={state.activeTab() === 'tab2'}>
            <TableTab
              state={state.tab2()}
              actions={actions.tab2Actions}
            />
          </Show>
        </div>

        <div class="mt-4 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={actions.showHelp}
            aria-label="Show keyboard shortcuts help"
          >
            <kbd class="kbd kbd-sm">Ctrl</kbd> + <kbd class="kbd kbd-sm">/</kbd> Help
          </Button>
        </div>
      </div>

      <KeyboardShortcutsHelp
        bindings={keyBindings}
        isVisible={state.showHelp()}
        onClose={actions.hideHelp}
      />
    </div>
  )
}

export default App
