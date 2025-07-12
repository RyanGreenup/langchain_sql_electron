import { ChatAnthropic } from "@langchain/anthropic";
import { AIMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Annotation, StateGraph } from "@langchain/langgraph";
import { SqlToolkit } from "langchain/agents/toolkits/sql";
import { pull } from "langchain/hub";
import { SqlDatabase } from "langchain/sql_db";
import { QuerySqlTool } from "langchain/tools/sql";
import { DataSource } from "typeorm";
import { z } from "zod";

import { createReactAgent } from "@langchain/langgraph/prebuilt";

async function get_llm(): Promise<ChatAnthropic> {
  // Check for API key using Electron API
  let apiKey: string | null = null
  
  if (typeof window !== 'undefined' && window.api) {
    try {
      apiKey = await window.api.getCurrentApiKey()
    } catch (error) {
      console.error('Failed to get API key:', error)
    }
  }

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set. Please configure your API key in the application.")
  }

  // Connect to the LLM
  const llm = new ChatAnthropic({
    apiKey: apiKey,
    model: "claude-3-5-sonnet-20240620",
    temperature: 0,
  });

  return llm;
}

async function get_db(dbPath: string = "./Chinook.db"): Promise<SqlDatabase> {
  try {
    console.log('Attempting to initialize database at:', dbPath);
    
    // Check if we're in Electron renderer and need to resolve the path differently
    let resolvedPath = dbPath;
    if (typeof window !== 'undefined' && window.electron) {
      // In Electron, resolve path relative to app data or resources
      if (!dbPath.startsWith('/') && !dbPath.includes(':\\')) {
        // Relative path - might need to be resolved relative to app resources
        resolvedPath = dbPath.startsWith('./') ? dbPath.slice(2) : dbPath;
      }
    }
    
    console.log('Resolved database path:', resolvedPath);

    // Initialize DataSource with proper SQLite configuration
    const datasource = new DataSource({
      type: "sqlite" as const,
      database: resolvedPath,
      synchronize: false,
      logging: true, // Enable logging to debug issues
      entities: [], // Empty entities array for SQLite
    });

    console.log('DataSource created, initializing...');

    // Initialize the datasource before using it
    if (!datasource.isInitialized) {
      await datasource.initialize();
      console.log('DataSource initialized successfully');
    }

    console.log('Creating SqlDatabase from DataSource...');
    const db = await SqlDatabase.fromDataSourceParams({
      appDataSource: datasource,
    });

    console.log('SqlDatabase created successfully');
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      dbPath,
    });
    throw new Error(`Failed to initialize database at ${dbPath}: ${error.message}`);
  }
}

function formatJsonAsMarkdownTable(jsonString: string): string {
  try {
    const data = JSON.parse(jsonString);

    if (!Array.isArray(data) || data.length === 0) {
      return "No tabular data available";
    }

    const firstRow = data[0];
    if (typeof firstRow !== "object" || firstRow === null) {
      return "Data is not in tabular format";
    }

    const headers = Object.keys(firstRow);

    // Create header row
    const headerRow = "| " + headers.join(" | ") + " |";

    // Create separator row
    const separatorRow = "| " + headers.map(() => "---").join(" | ") + " |";

    // Create data rows
    const dataRows = data.map((row) => {
      const values = headers.map((header) => {
        const value = row[header];
        return value !== null && value !== undefined ? String(value) : "";
      });
      return "| " + values.join(" | ") + " |";
    });

    return [headerRow, separatorRow, ...dataRows].join("\n");
  } catch (error) {
    return "Error formatting data as table: " + error;
  }
}

export interface QueryResult {
  query: string;
  result: Record<string, any>[];
}

export interface AgentResult {
  queries: QueryResult[];
  finalAnswer: string;
}

async function agent_results(question: string): Promise<AgentResult> {
  return agent_results_with_db(question, "./Chinook.db");
}

async function agent_results_with_db(question: string, dbPath: string): Promise<AgentResult> {
  const llm = await get_llm();
  const db = await get_db(dbPath);
  const toolkit = new SqlToolkit(db, llm);
  const tools = toolkit.getTools();

  const systemPromptTemplate = await pull<ChatPromptTemplate>(
    "langchain-ai/sql-agent-system-prompt",
  );

  const systemMessage = await systemPromptTemplate.format({
    dialect: "SQLite",
    top_k: 5,
  });

  const agent = createReactAgent({
    llm: llm,
    tools: tools,
    stateModifier: systemMessage,
  });

  const inputs = {
    messages: [
      {
        role: "user",
        content: question,
      },
    ],
  };

  const queries: QueryResult[] = [];
  let agentResponse = "";
  let currentQuery = "";

  for await (const step of await agent.stream(inputs, {
    streamMode: "values",
  })) {
    const lastMessage = step.messages[step.messages.length - 1];

    // Capture SQL queries from AI messages with tool calls
    if (
      lastMessage._getType() === "ai" &&
      (lastMessage as AIMessage).tool_calls?.length
    ) {
      const toolCalls = (lastMessage as AIMessage).tool_calls || [];
      for (const tc of toolCalls) {
        if (
          (tc.name === "query-sql" || tc.name === "query-checker") &&
          tc.args?.input
        ) {
          currentQuery = tc.args.input;
        }
      }
    }

    // Capture SQL results from tool messages
    if (lastMessage._getType() === "tool") {
      const toolMessage = lastMessage as any;
      if (toolMessage.name === "query-sql" && currentQuery) {
        try {
          const result = JSON.parse(toolMessage.content);
          queries.push({
            query: currentQuery,
            result: result,
          });
        } catch {
          // If not JSON, store as string in an array
          queries.push({
            query: currentQuery,
            result: [{ result: toolMessage.content }],
          });
        }
        currentQuery = "";
      }
    }

    // Capture final AI response
    if (
      lastMessage._getType() === "ai" &&
      !((lastMessage as AIMessage).tool_calls?.length || 0 > 0)
    ) {
      agentResponse = lastMessage.content as string;
    }
  }

  return {
    queries,
    finalAnswer: agentResponse,
  };
}

async function agent(question: string) {
  // Get results from agent_results function
  const results = await agent_results(question);

  // Print formatted output
  console.log("# 📊 SQL Agent Analysis Summary");

  if (results.queries.length > 0) {
    console.log("\n## 🔍 SQL Queries Executed\n");
    results.queries.forEach((queryResult, index) => {
      console.log(`### Query ${index + 1}:`);
      console.log("```sql");
      console.log(queryResult.query);
      console.log("```\n");
    });

    console.log("## 📋 Query Results\n");
    results.queries.forEach((queryResult, index) => {
      console.log(`### Result ${index + 1}:`);

      // Try to format as table if it's JSON data
      const resultJson = JSON.stringify(queryResult.result);
      const tableFormatted = formatJsonAsMarkdownTable(resultJson);
      if (
        tableFormatted.includes("|") &&
        !tableFormatted.startsWith("Error") &&
        !tableFormatted.startsWith("No tabular") &&
        !tableFormatted.startsWith("Data is not")
      ) {
        console.log(tableFormatted);
        console.log("\n**Raw JSON:**");
        console.log("```json");
        console.log(resultJson);
        console.log("```\n");
      } else {
        console.log("```");
        console.log(resultJson);
        console.log("```\n");
      }
    });
  }

  if (results.finalAnswer) {
    console.log("## 🤖 Agent Response\n");
    console.log(results.finalAnswer);
  }

  console.log("\n" + "=".repeat(80));
}

// Export the functions for use in other modules
export { agent_results, agent_results_with_db, agent };
