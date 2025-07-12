import type { Component } from 'solid-js'
import { createSignal, createEffect } from 'solid-js'
import { Input } from '../ui/FormControl'
import ApiKeyConfig from '../ui/ApiKeyConfig'
import DarkModeToggle from '../ui/DarkModeToggle'
import { useDarkMode } from '../../hooks/useDarkMode'

interface AppHeaderProps {
  dbPath: string
  onDbPathChange: (path: string) => void
  onApiKeyChange: (apiKey: string) => void
}

const AppHeader: Component<AppHeaderProps> = (props) => {
  const { theme, isDark } = useDarkMode()
  const [dbValidation, setDbValidation] = createSignal<{ valid: boolean; error?: string } | null>(null)
  const [isValidating, setIsValidating] = createSignal(false)

  // Debounced validation effect
  createEffect(() => {
    const dbPath = props.dbPath
    if (!dbPath) {
      setDbValidation(null)
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsValidating(true)
      try {
        if (typeof window !== 'undefined' && window.api) {
          const result = await window.api.validateDatabase(dbPath)
          setDbValidation(result)
        }
      } catch (error) {
        setDbValidation({ valid: false, error: 'Validation failed' })
      } finally {
        setIsValidating(false)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  })

  const getValidationClass = () => {
    if (isValidating()) return 'input-warning'
    const validation = dbValidation()
    if (!validation) return ''
    return validation.valid ? 'input-success' : 'input-error'
  }

  const getValidationIcon = () => {
    if (isValidating()) return '⏳'
    const validation = dbValidation()
    if (!validation) return ''
    return validation.valid ? '✅' : '❌'
  }
  
  return (
    <div class="bg-base-100 rounded-box shadow-sm mb-6 p-4">
      <div class="flex flex-col lg:flex-row lg:items-center gap-4">
        <div class="flex-1">
          <h1 class="text-xl font-bold">AI Agent Tool</h1>
        </div>

        {/*START For dev purposes*/}
        <div class="text-sm opacity-75">
          Theme: {theme()} ({isDark() ? 'Dark' : 'Light'})
        </div>
        {/*END For dev purposes*/}

        <div class="flex flex-col lg:flex-row gap-4 lg:items-start">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Database Path:</span>
            </label>
            <div class="relative">
              <Input
                placeholder="path/to/database.sqlite"
                value={props.dbPath}
                onInput={(e) => props.onDbPathChange(e.target.value)}
                class={`input-sm w-64 pr-8 ${getValidationClass()}`}
              />
              <div class="absolute inset-y-0 right-0 flex items-center pr-2">
                <span class="text-sm" title={dbValidation()?.error || 'Database validation status'}>
                  {getValidationIcon()}
                </span>
              </div>
            </div>
            {dbValidation() && !dbValidation()!.valid && (
              <label class="label">
                <span class="label-text-alt text-error">{dbValidation()!.error}</span>
              </label>
            )}
          </div>

          <div class="form-control">
            <ApiKeyConfig
              onApiKeyChange={props.onApiKeyChange}
              class="w-64"
            />
          </div>

          <div class="flex items-end">
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppHeader
