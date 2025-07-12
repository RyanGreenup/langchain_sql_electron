import type { Component } from 'solid-js'
import { Input } from '../ui/FormControl'

interface AppHeaderProps {
  dbPath: string
  onDbPathChange: (path: string) => void
}

const AppHeader: Component<AppHeaderProps> = (props) => {
  return (
    <div class="navbar bg-base-100 rounded-box shadow-sm mb-6">
      <div class="flex-1">
        <h1 class="text-xl font-bold">AI Agent Tool</h1>
      </div>
      <div class="flex-none">
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
      </div>
    </div>
  )
}

export default AppHeader