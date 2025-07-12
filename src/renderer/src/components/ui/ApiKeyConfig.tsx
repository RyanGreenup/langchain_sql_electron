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
    <div class={`space-y-4 ${props.class || ''}`}>
      {/* Status Header */}
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="font-medium text-base-content/80">Anthropic API Key</span>
              {getStatusBadge()}
            </div>
            <div class="text-sm text-base-content/60 font-mono bg-base-300 px-2 py-1 rounded  overflow-x-auto max-w-sm">
              {getCurrentKeyDisplay()}
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <Show
        when={!showKeyInput()}
        fallback={
          <div class="space-y-3 p-4 bg-base-100 rounded-lg border border-base-300">
            <div class="space-y-2">
              <label class="text-sm font-medium text-base-content/80">Enter API Key</label>
              <Input
                type="password"
                placeholder="sk-ant-api03-..."
                value={overrideKey()}
                onInput={(e) => handleKeyInput(e.target.value)}
                class={`input input-bordered w-full ${!isValidFormat() ? 'input-error' : ''}`}
              />
            </div>
            <Show when={!isValidFormat()}>
              <div class="alert alert-error py-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-xs">
                  Invalid API key format. Should start with 'sk-ant-' and be 50+ characters.
                </span>
              </div>
            </Show>
            <div class="flex gap-3 pt-2">
              <Button
                onClick={handleSaveKey}
                disabled={!isValidFormat() && overrideKey() !== ''}
                class="flex-1"
              >
                Save API Key
              </Button>
              <Button
                variant="outline"
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
        <div class="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowKeyInput(true)}
            class="flex-1"
          >
            {apiKeyStatus().isValid ? 'Change Key' : 'Set API Key'}
          </Button>
          <Show when={apiKeyStatus().hasOverrideKey}>
            <Button
              variant="ghost"
              onClick={handleClearKey}
              class="text-error hover:bg-error/10"
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
