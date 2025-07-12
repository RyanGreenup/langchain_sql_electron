import type { Component } from 'solid-js'
import { createSignal, createEffect, Show, onMount } from 'solid-js'
import { apiKeyManager } from '../../utils/apiKeyManager'
import type { ApiKeyStatus } from '../../utils/apiKeyManager'
import { Input } from './FormControl'
import Button from './Button'

interface ApiKeyConfigProps {
  onApiKeyChange?: (apiKey: string) => void
  class?: string
}

const ApiKeyConfig: Component<ApiKeyConfigProps> = (props) => {
  const [apiKeyStatus, setApiKeyStatus] = createSignal<ApiKeyStatus>({
    hasEnvKey: false,
    hasOverrideKey: false,
    isValid: false,
    source: 'none'
  })
  const [overrideKey, setOverrideKey] = createSignal('')
  const [showKeyInput, setShowKeyInput] = createSignal(false)
  const [isValidFormat, setIsValidFormat] = createSignal(true)
  const [currentKey, setCurrentKey] = createSignal<string | null>(null)

  // Load initial status
  onMount(async () => {
    await updateStatus()
  })

  const updateStatus = async () => {
    try {
      const [status, key] = await Promise.all([
        apiKeyManager.getApiKeyStatus(),
        apiKeyManager.getCurrentKey()
      ])
      setApiKeyStatus(status)
      setCurrentKey(key)
    } catch (error) {
      console.error('Failed to update API key status:', error)
    }
  }

  const handleKeyInput = (value: string) => {
    setOverrideKey(value)
    setIsValidFormat(apiKeyManager.validateApiKeyFormat(value) || value === '')
  }

  const handleSaveKey = async () => {
    const key = overrideKey().trim()
    if (key) {
      if (!apiKeyManager.validateApiKeyFormat(key)) {
        setIsValidFormat(false)
        return
      }

      await apiKeyManager.setOverrideKey(key)
      props.onApiKeyChange?.(key)
    } else {
      await apiKeyManager.clearOverrideKey()
      props.onApiKeyChange?.('')
    }

    await updateStatus()
    setShowKeyInput(false)
    setOverrideKey('')
  }

  const handleClearKey = async () => {
    await apiKeyManager.clearOverrideKey()
    await updateStatus()
    setOverrideKey('')
    setShowKeyInput(false)
    props.onApiKeyChange?.('')
  }

  const getStatusBadge = () => {
    const status = apiKeyStatus()

    if (status.isValid) {
      return (
        <div class="flex items-center gap-2">
          <span class="badge badge-success badge-sm">✓ API Key Set</span>
          <span class="text-xs text-base-content/70">
            {status.source === 'env' ? 'From Environment' : 'Override Active'}
          </span>
        </div>
      )
    } else {
      return (
        <span class="badge badge-error badge-sm">⚠ No API Key</span>
      )
    }
  }

  const getCurrentKeyDisplay = () => {
    const key = currentKey()
    if (key) {
      return apiKeyManager.maskApiKey(key)
    }
    return 'Not set'
  }

  return (
    <div class={`space-y-2 ${props.class || ''}`}>
      <div class="flex items-center justify-between">
        <div class="flex flex-col">
          <span class="text-sm font-medium">Anthropic API Key</span>
          <span class="text-xs text-base-content/60 overflow-scroll max-w-30">{getCurrentKeyDisplay()}</span>
        </div>
        {getStatusBadge()}
      </div>

      <Show
        when={!showKeyInput()}
        fallback={
          <div class="space-y-2">
            <Input
              type="password"
              placeholder="sk-ant-api03-..."
              value={overrideKey()}
              onInput={(e) => handleKeyInput(e.target.value)}
              class={`input-sm ${!isValidFormat() ? 'input-error' : ''}`}
            />
            <Show when={!isValidFormat()}>
              <p class="text-xs text-error">
                Invalid API key format. Should start with 'sk-ant-' and be 50+ characters.
              </p>
            </Show>
            <div class="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveKey}
                disabled={!isValidFormat() && overrideKey() !== ''}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowKeyInput(false)
                  setOverrideKey('')
                  setIsValidFormat(true)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        }
      >
        <div class="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowKeyInput(true)}
          >
            {apiKeyStatus().isValid ? 'Change Key' : 'Set API Key'}
          </Button>
          <Show when={apiKeyStatus().hasOverrideKey}>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearKey}
            >
              Clear Override
            </Button>
          </Show>
        </div>
      </Show>
    </div>
  )
}

export default ApiKeyConfig
