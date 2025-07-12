import { createSignal } from 'solid-js'
import type { AppState, TabId, TabState, MarkdownTabState, UIActions, TabActions, AgentService } from '../types/app'

interface UseAppStateReturn {
  state: {
    activeTab: () => TabId
    dbPath: () => string
    tab1: () => MarkdownTabState
    tab2: () => TabState
    showHelp: () => boolean
  }
  actions: UIActions & {
    tab1Actions: TabActions & { toggleMarkdownView: () => void }
    tab2Actions: TabActions
  }
}

export function useAppState(agentService: AgentService): UseAppStateReturn {
  const [activeTab, setActiveTab] = createSignal<TabId>('tab1')
  const [dbPath, setDbPath] = createSignal('')
  const [showHelp, setShowHelp] = createSignal(false)

  // Tab 1 state
  const [tab1Question, setTab1Question] = createSignal('')
  const [tab1Response, setTab1Response] = createSignal('')
  const [tab1Loading, setTab1Loading] = createSignal(false)
  const [isMarkdownView, setIsMarkdownView] = createSignal(true)

  // Tab 2 state
  const [tab2Question, setTab2Question] = createSignal('')
  const [tab2Response, setTab2Response] = createSignal('')
  const [tab2Loading, setTab2Loading] = createSignal(false)

  // UI Actions
  const uiActions: UIActions = {
    switchTab: (tabId: TabId) => setActiveTab(tabId),
    updateDbPath: (path: string) => setDbPath(path),
    toggleMarkdownView: () => setIsMarkdownView(!isMarkdownView()),
    showHelp: () => setShowHelp(true),
    hideHelp: () => setShowHelp(false)
  }

  // Tab 1 Actions
  const tab1Actions: TabActions & { toggleMarkdownView: () => void } = {
    updateQuestion: (question: string) => setTab1Question(question),
    submitQuestion: async () => {
      if (!tab1Question().trim()) return
      
      setTab1Loading(true)
      try {
        const result = await agentService.processQuestion(tab1Question())
        setTab1Response(result)
      } catch (error) {
        console.error('Failed to process question:', error)
        setTab1Response('Error processing question. Please try again.')
      } finally {
        setTab1Loading(false)
      }
    },
    clearResponse: () => setTab1Response(''),
    toggleMarkdownView: uiActions.toggleMarkdownView
  }

  // Tab 2 Actions
  const tab2Actions: TabActions = {
    updateQuestion: (question: string) => setTab2Question(question),
    submitQuestion: async () => {
      if (!tab2Question().trim()) return
      
      setTab2Loading(true)
      try {
        const result = await agentService.processQuestion(tab2Question())
        setTab2Response(result)
      } catch (error) {
        console.error('Failed to process question:', error)
        setTab2Response('Error processing question. Please try again.')
      } finally {
        setTab2Loading(false)
      }
    },
    clearResponse: () => setTab2Response('')
  }

  return {
    state: {
      activeTab,
      dbPath,
      tab1: () => ({
        question: tab1Question(),
        response: tab1Response(),
        isLoading: tab1Loading(),
        isMarkdownView: isMarkdownView()
      }),
      tab2: () => ({
        question: tab2Question(),
        response: tab2Response(),
        isLoading: tab2Loading()
      }),
      showHelp
    },
    actions: {
      ...uiActions,
      tab1Actions,
      tab2Actions
    }
  }
}