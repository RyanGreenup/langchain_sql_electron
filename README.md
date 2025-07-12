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
  - Focus the question input
  - Fix Dark Mode
  - solid transition Group to handle tab switch
    - Animations help accessibility if done right.
  - Show error if Antrhopic API Key not set
  - Implement Agent
    - Useful errors
      - Corrupt SQLite
      - No API Key
  - Implement SQL generation
  - Support Ollama / OPENAPI
  - Allow the user to enter an ANTHROPIC_API_KEY to overwrite the variable.
- Improvements
  - Needed
  - Maybe
    - Streaming Output
    - Animations
    - Command Palette
