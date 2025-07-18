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
    - Animations help accessibility if done right.
  - Syntax Highlighting
      - Improve the marked markdown rendering to have syntax highlighting. Here is a minimum working example:

      ```ts
      import { Marked } from "marked";
      import { markedHighlight } from "marked-highlight";
      import hljs from 'highlight.js';

      const marked = new Marked(
        markedHighlight({
        emptyLangClass: 'hljs',
          langPrefix: 'hljs language-',
          highlight(code, lang, info) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
          }
        })
      );

      ```


  - Fix the UI of the API KEY
  - Code Copy
    - Button
    - Implement a code copy button that allows the user to copy a code block to the clipboard. Keep the code as simple as possible.
  - Show error if Antrhopic API Key not set
  - Implement SQL generation
  - Allow the user to enter an ANTHROPIC_API_KEY to overwrite the variable.
- Improvements
  - Needed
  - Maybe
    - Streaming Output
    - Animations
    - Command Palette
- DONE
  - [X] Support Ollama / OPENAPI
    - Langchain doesn't support this
  - [X] Fix Dark Mode
  - [X] Focus the question input
  - [X] Implement Agent
  - [X] Useful errors
    - [X] Corrupt SQLite
    - [X] No API Key
  - [X] Advise user if there's no database
    - Don't allow submit button to work.
    - Implement logic to prevent the user triggering the agent if a database path has not been provided. If a database path has been provided, don't trigger the agent if it can't be opened. If a connection is made, make sure to release the connection so it's not locked.
