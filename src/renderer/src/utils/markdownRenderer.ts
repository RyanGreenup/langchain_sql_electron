import { Marked, Renderer } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';

// Helper function to escape HTML
function escapeHtml(text: string): string {
  if (typeof text !== 'string') {
    return String(text);
  }
  
  // Use a more robust HTML escaping approach
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Custom renderer to add copy buttons to code blocks
const renderer = new Renderer();

// Override the code renderer to add copy functionality
renderer.code = function(code: string, infostring?: string) {
  const lang = infostring || 'plaintext';
  
  // Safely handle the code - always escape HTML entities first
  const safeCode = escapeHtml(code);
  const highlightedCode = hljs.getLanguage(lang) 
    ? hljs.highlight(code, { language: lang }).value 
    : safeCode;
  
  // Generate a unique ID for the code block
  const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;
  
  return `
    <div class="code-block-container relative group">
      <div class="flex justify-between items-center bg-base-200 px-4 py-2 rounded-t-lg">
        <span class="text-sm font-mono text-base-content/60">${lang}</span>
        <button 
          class="btn btn-ghost btn-xs opacity-60 group-hover:opacity-100 transition-opacity"
          onclick="copyCodeToClipboard('${codeId}')"
          aria-label="Copy code to clipboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="m4 16-2-2v-8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2"/>
          </svg>
        </button>
      </div>
      <pre class="hljs !mt-0 !rounded-t-none"><code id="${codeId}" class="hljs language-${lang}">${highlightedCode}</code></pre>
    </div>
  `;
};

// Create marked instance with custom renderer and highlight
const marked = new Marked(
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  }),
  {
    renderer: renderer,
    breaks: true,
    gfm: true
  }
);

// Global function to copy code (will be called from rendered HTML)
declare global {
  interface Window {
    copyCodeToClipboard: (codeId: string) => void;
  }
}

// Set up the global copy function
if (typeof window !== 'undefined') {
  window.copyCodeToClipboard = async (codeId: string) => {
    try {
      const codeElement = document.getElementById(codeId);
      if (codeElement) {
        const code = codeElement.textContent || '';
        await navigator.clipboard.writeText(code);
        
        // Show a temporary success indicator
        const button = codeElement.closest('.code-block-container')?.querySelector('button');
        if (button) {
          const originalContent = button.innerHTML;
          button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          `;
          setTimeout(() => {
            button.innerHTML = originalContent;
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };
}

export function renderMarkdown(content: string): string {
  try {
    if (typeof content !== 'string') {
      console.warn('renderMarkdown received non-string content:', typeof content, content);
      return String(content);
    }
    
    return marked.parse(content);
  } catch (error) {
    console.error('Error rendering markdown:', error);
    console.error('Content that caused error:', content);
    return `<pre class="error">Error rendering markdown: ${error.message}</pre>`;
  }
}

export { marked };