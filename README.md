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
  - Advise user if there's no database
    - Don't allow submit button to work.
  - Fix Dark Mode
  - solid transition Group to handle tab switch
    - Animations help accessibility if done right.
  - Syntax Highlighting

      ```ts
      import { Marked } from "marked";
      import { markedHighlight } from "marked-highlight";
      import hljs from 'highlight.js';

      // or UMD script
      // <script src="https://cdn.jsdelivr.net/npm/marked/lib/marked.umd.js"></script>
      // <script src="https://cdn.jsdelivr.net/npm/marked-highlight/lib/index.umd.js"></script>
      // const { Marked } = globalThis.marked;
      // const { markedHighlight } = globalThis.markedHighlight;
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
    - Keyboard?
    - Button
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
