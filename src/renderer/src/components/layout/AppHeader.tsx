import type { Component } from 'solid-js'
import { Input } from '../ui/FormControl'
import ApiKeyConfig from '../ui/ApiKeyConfig'

interface AppHeaderProps {
  dbPath: string
  onDbPathChange: (path: string) => void
  onApiKeyChange: (apiKey: string) => void
}

const AppHeader: Component<AppHeaderProps> = (props) => {
  return (
    <div class="bg-base-100 rounded-box shadow-sm mb-6 p-4">
      <div class="flex flex-col lg:flex-row lg:items-center gap-4">
        <div class="flex-1">
          <h1 class="text-xl font-bold">AI Agent Tool</h1>
        </div>
        
        <div class="flex flex-col lg:flex-row gap-4 lg:items-start">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Database Path:</span>
            </label>
            <Input
              placeholder="path/to/database.sqlite"
              value={props.dbPath}
              onInput={(e) => props.onDbPathChange(e.target.value)}
              class="input-sm w-64"
            />
          </div>
          
          <div class="form-control">
            <ApiKeyConfig
              onApiKeyChange={props.onApiKeyChange}
              class="w-64"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppHeader