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
    <div class="bg-base-100 rounded-lg shadow-lg mb-8 p-6">
      <div class="flex flex-col space-y-6">
        {/* Header Section */}
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-base-content">AI Agent Tool</h1>
          <div class="flex items-center gap-4">
            {/*START For dev purposes*/}
            <div class="text-sm opacity-75 px-3 py-1 bg-base-200 rounded-full">
              Theme: {theme()} ({isDark() ? 'Dark' : 'Light'})
            </div>
            {/*END For dev purposes*/}
            <DarkModeToggle />
          </div>
        </div>

        {/* Configuration Section */}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Database Configuration */}
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-2 h-8 bg-primary rounded-full"></div>
              <h3 class="text-lg font-semibold text-base-content">Database Configuration</h3>
            </div>
            <div class="form-control bg-base-200 p-4 rounded-lg">
              <label class="label">
                <span class="label-text font-medium text-base-content/80">Database Path</span>
                <span class="label-text-alt text-base-content/60">SQLite database file location</span>
              </label>
              <div class="relative">
                <Input
                  placeholder="path/to/database.sqlite"
                  value={props.dbPath}
                  onInput={(e) => props.onDbPathChange(e.target.value)}
                  class={`input input-bordered w-full pr-12 ${getValidationClass()}`}
                />
                <div class="absolute inset-y-0 right-0 flex items-center pr-4">
                  <span class="text-lg" title={dbValidation()?.error || 'Database validation status'}>
                    {getValidationIcon()}
                  </span>
                </div>
              </div>
              {dbValidation() && !dbValidation()!.valid && (
                <label class="label">
                  <span class="label-text-alt text-error font-medium">{dbValidation()!.error}</span>
                </label>
              )}
            </div>
          </div>

          {/* API Configuration */}
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-2 h-8 bg-secondary rounded-full"></div>
              <h3 class="text-lg font-semibold text-base-content">API Configuration</h3>
            </div>
            <div class="bg-base-200 p-4 rounded-lg">
              <ApiKeyConfig
                onApiKeyChange={props.onApiKeyChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppHeader
