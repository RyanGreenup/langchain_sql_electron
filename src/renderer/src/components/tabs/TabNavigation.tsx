import type { Component } from 'solid-js'
import type { TabId } from '../../types/app'

interface Tab {
  id: TabId
  label: string
  ariaControls: string
}

interface TabNavigationProps {
  activeTab: TabId
  onTabChange: (tabId: TabId) => void
}

const TabNavigation: Component<TabNavigationProps> = (props) => {
  const tabs: Tab[] = [
    { id: 'tab1', label: 'Markdown Output', ariaControls: 'tab1-panel' },
    { id: 'tab2', label: 'Table Output', ariaControls: 'tab2-panel' }
  ]

  return (
    <div class="tabs tabs-lifted" role="tablist">
      {tabs.map((tab) => (
        <button
          class={`tab ${props.activeTab === tab.id ? 'tab-active' : ''}`}
          onClick={() => props.onTabChange(tab.id)}
          role="tab"
          aria-selected={props.activeTab === tab.id}
          aria-controls={tab.ariaControls}
          tabindex={props.activeTab === tab.id ? 0 : -1}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default TabNavigation