import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Environment variable access
  getEnvVar: (name: string) => ipcRenderer.invoke('get-env-var', name),
  setEnvVar: (name: string, value: string) => ipcRenderer.invoke('set-env-var', name, value),
  
  // API Key management
  getApiKeyStatus: () => ipcRenderer.invoke('get-api-key-status'),
  setApiKeyOverride: (apiKey: string) => ipcRenderer.invoke('set-api-key-override', apiKey),
  clearApiKeyOverride: () => ipcRenderer.invoke('clear-api-key-override'),
  getCurrentApiKey: () => ipcRenderer.invoke('get-current-api-key'),
  
  // SQL Agent operations
  runSqlAgent: (question: string, dbPath: string) => ipcRenderer.invoke('run-sql-agent', question, dbPath),
  validateDatabase: (dbPath: string) => ipcRenderer.invoke('validate-database', dbPath),
  
  // Log event listeners
  onAgentLog: (callback: (logData: any) => void) => {
    ipcRenderer.on('agent-log', (_, logData) => callback(logData))
    return () => ipcRenderer.removeAllListeners('agent-log')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
