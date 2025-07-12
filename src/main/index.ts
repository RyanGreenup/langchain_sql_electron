import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // API Key management in main process
  let apiKeyOverride: string | null = null

  // Environment variable access
  ipcMain.handle('get-env-var', (_, name: string) => {
    return process.env[name]
  })

  ipcMain.handle('set-env-var', (_, name: string, value: string) => {
    process.env[name] = value
  })

  // API Key status
  ipcMain.handle('get-api-key-status', () => {
    const hasEnvKey = !!process.env.ANTHROPIC_API_KEY
    const hasOverrideKey = !!apiKeyOverride
    const isValid = hasEnvKey || hasOverrideKey

    let source: 'env' | 'override' | 'none'
    if (hasOverrideKey) {
      source = 'override'
    } else if (hasEnvKey) {
      source = 'env'
    } else {
      source = 'none'
    }

    return {
      hasEnvKey,
      hasOverrideKey,
      isValid,
      source
    }
  })

  // Set API key override
  ipcMain.handle('set-api-key-override', (_, apiKey: string) => {
    apiKeyOverride = apiKey.trim() || null
    if (apiKeyOverride) {
      process.env.ANTHROPIC_API_KEY = apiKeyOverride
    }
  })

  // Clear API key override
  ipcMain.handle('clear-api-key-override', () => {
    apiKeyOverride = null
    // Note: We don't delete process.env.ANTHROPIC_API_KEY here to preserve original env var
  })

  // Get current API key
  ipcMain.handle('get-current-api-key', () => {
    return apiKeyOverride || process.env.ANTHROPIC_API_KEY || null
  })

  // Database operations should run in main process for Electron
  ipcMain.handle('run-sql-agent', async (event, question: string, dbPath: string) => {
    const sendLog = (level: string, source: string, message: string, data?: any) => {
      event.sender.send('agent-log', {
        level,
        source,
        message,
        data,
        timestamp: new Date().toISOString()
      })
    }

    try {
      sendLog('info', 'agent', `Starting SQL agent for question: "${question}"`)
      sendLog('info', 'system', `Using database: ${dbPath}`)
      
      // Import required modules for main process
      sendLog('debug', 'system', 'Loading required modules...')
      const { ChatAnthropic } = await import("@langchain/anthropic")
      const { SqlToolkit } = await import("langchain/agents/toolkits/sql")
      const { SqlDatabase } = await import("langchain/sql_db")
      const { DataSource } = await import("typeorm")
      const { createReactAgent } = await import("@langchain/langgraph/prebuilt")
      const { pull } = await import("langchain/hub")
      const { ChatPromptTemplate } = await import("@langchain/core/prompts")
      
      // Get API key
      const apiKey = apiKeyOverride || process.env.ANTHROPIC_API_KEY
      if (!apiKey) {
        sendLog('error', 'api', 'ANTHROPIC_API_KEY is not set')
        throw new Error("ANTHROPIC_API_KEY is not set")
      }
      
      sendLog('success', 'api', 'API key found, initializing LLM...')
      
      // Initialize LLM
      const llm = new ChatAnthropic({
        apiKey: apiKey,
        model: "claude-3-5-sonnet-20240620",
        temperature: 0,
      })
      
      sendLog('success', 'api', 'LLM initialized successfully')
      sendLog('info', 'database', 'Connecting to database...')
      
      // Initialize database
      const datasource = new DataSource({
        type: "sqlite" as const,
        database: dbPath,
        synchronize: false,
        logging: false,
        entities: [],
      })
      
      if (!datasource.isInitialized) {
        await datasource.initialize()
      }
      
      sendLog('success', 'database', 'Database connected successfully')
      
      const db = await SqlDatabase.fromDataSourceParams({
        appDataSource: datasource,
      })
      
      sendLog('info', 'agent', 'Setting up SQL agent tools...')
      
      // Create agent
      const toolkit = new SqlToolkit(db, llm)
      const tools = toolkit.getTools()
      
      const systemPromptTemplate = await pull<ChatPromptTemplate>(
        "langchain-ai/sql-agent-system-prompt"
      )
      
      const systemMessage = await systemPromptTemplate.format({
        dialect: "SQLite",
        top_k: 5,
      })
      
      const agent = createReactAgent({
        llm: llm,
        tools: tools,
        stateModifier: systemMessage,
      })
      
      sendLog('success', 'agent', 'Agent initialized, beginning analysis...')
      
      // Run the agent
      const inputs = {
        messages: [
          {
            role: "user",
            content: question,
          },
        ],
      }
      
      const queries: any[] = []
      let agentResponse = ""
      let currentQuery = ""
      let stepCount = 0
      
      for await (const step of await agent.stream(inputs, {
        streamMode: "values",
      })) {
        stepCount++
        const lastMessage = step.messages[step.messages.length - 1]
        
        sendLog('debug', 'agent', `Processing step ${stepCount}...`)
        
        // Capture SQL queries from AI messages with tool calls
        if (
          lastMessage._getType() === "ai" &&
          (lastMessage as any).tool_calls?.length
        ) {
          const toolCalls = (lastMessage as any).tool_calls || []
          for (const tc of toolCalls) {
            if (
              (tc.name === "query-sql" || tc.name === "query-checker") &&
              tc.args?.input
            ) {
              currentQuery = tc.args.input
              sendLog('info', 'agent', `Generated SQL query`, { query: currentQuery })
            }
          }
        }
        
        // Capture SQL results from tool messages
        if (lastMessage._getType() === "tool") {
          const toolMessage = lastMessage as any
          if (toolMessage.name === "query-sql" && currentQuery) {
            sendLog('info', 'database', `Executing SQL query...`)
            try {
              const result = JSON.parse(toolMessage.content)
              queries.push({
                query: currentQuery,
                result: result,
              })
              sendLog('success', 'database', `Query executed successfully`, { 
                rowCount: Array.isArray(result) ? result.length : 'N/A',
                query: currentQuery
              })
            } catch {
              queries.push({
                query: currentQuery,
                result: [{ result: toolMessage.content }],
              })
              sendLog('success', 'database', `Query executed (non-JSON result)`, { query: currentQuery })
            }
            currentQuery = ""
          }
        }
        
        // Capture final AI response
        if (
          lastMessage._getType() === "ai" &&
          !((lastMessage as any).tool_calls?.length || 0 > 0)
        ) {
          agentResponse = lastMessage.content as string
          sendLog('info', 'agent', 'Agent generating final response...')
        }
      }
      
      sendLog('success', 'agent', 'Analysis complete, cleaning up...')
      
      // Clean up
      await datasource.destroy()
      sendLog('info', 'database', 'Database connection closed')
      
      const result = {
        queries,
        finalAnswer: agentResponse,
      }
      
      sendLog('success', 'system', `Agent completed successfully with ${queries.length} SQL queries`)
      
      return { success: true, result }
    } catch (error) {
      sendLog('error', 'system', `Agent failed: ${error.message}`, { error: error.stack })
      console.error('SQL Agent error in main process:', error)
      return { 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
