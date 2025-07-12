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

const InputStateAnnotation = Annotation.Root({
  question: Annotation<string>,
});

const StateAnnotation = Annotation.Root({
  question: Annotation<string>,
  query: Annotation<string>,
  result: Annotation<string>,
  answer: Annotation<string>,
});

function get_llm(): ChatAnthropic {
  // Depends on ANTHROPIC_API_KEY env var
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }

  // Connect to the LLM
  const llm = new ChatAnthropic({
    model: "claude-3-5-sonnet-20240620",
    temperature: 0,
  });

  return llm;
}

async function get_db(): Promise<SqlDatabase> {
  const datasource = new DataSource({
    type: "sqlite",
    database: "./Chinook.db",
  });
  const db = await SqlDatabase.fromDataSourceParams({
    appDataSource: datasource,
  });

  return db;
}



interface QueryResult {
  query: string;
  result: Record<string, any>[];
}

async function generate_sql_query(question: string, db: SqlDatabase, llm: ChatAnthropic): Promise<QueryResult> {
  const queryPromptTemplate = await pull<ChatPromptTemplate>(
    "langchain-ai/sql-query-system-prompt",
  );

  const queryOutput = z.object({
    query: z.string().describe("Syntactically valid SQL query."),
  });

  const structuredLlm = llm.withStructuredOutput(queryOutput);

  const promptValue = await queryPromptTemplate.invoke({
    dialect: db.appDataSourceOptions.type,
    top_k: 10,
    table_info: await db.getTableInfo(),
    input: question,
  });

  const result = await structuredLlm.invoke(promptValue);
  const executeQueryTool = new QuerySqlTool(db);
  const queryResult = await executeQueryTool.invoke(result.query);

  const parsedResult = typeof queryResult === 'string' ? JSON.parse(queryResult) : queryResult;

  return {
    query: result.query,
    result: Array.isArray(parsedResult) ? parsedResult : [parsedResult]
  };
}
