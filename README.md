# sqlagent

An Electron application to work with Langchain and Anthropic to generate sql queries.

A Frontend for [langchain_sql_example](https://github.com/RyanGreenup/langchain_sql_example)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## TODO

- Bugs
  - solid transition Group to handle tab switch
  - Fix Dark Mode
  - Show error if Antrhopic API Key not set
  - Implement Agent
    - Useful errors
      - Corrupt SQLite
      - No API Key
  - Implement SQL generation
  - Support Ollama / OPENAPI
- Improvements
  - Needed
  - Maybe
    - Streaming Output
    - Animations
    - Command Palette
