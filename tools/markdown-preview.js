// Markdown Preview Tool
import { BaseTool } from './base-tool.js';

export class MarkdownPreview extends BaseTool {
  constructor(toastSystem) {
    super('markdown-preview', toastSystem);
  }

  getInputPlaceholder() {
    return '# Hello World\n\nType your **Markdown** here...\n\n- Item 1\n- Item 2\n\n> A blockquote';
  }

  // Minimal Markdown → HTML parser (no external deps)
  parseMarkdown(md) {
    return md
      // Headings
      .replace(/^###### (.+)$/gm, '<h6>$1</h6>')
      .replace(/^##### (.+)$/gm, '<h5>$1</h5>')
      .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Bold & italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Code blocks
      .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Blockquotes
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      // Unordered lists
      .replace(/^\- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      // Ordered lists
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      // Links
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      // Images
      .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" style="max-width:100%">')
      // Horizontal rule
      .replace(/^---$/gm, '<hr>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  }

  process() {
    const input = this.inputElement.value;
    const preview = document.getElementById(`${this.toolId}-preview`);
    if (!preview) return;
    preview.innerHTML = `<p>${this.parseMarkdown(input)}</p>`;
  }

  getTemplate() {
    return `
      <div class="tool-layout">
        <div class="tool-panel">
          <h3>Markdown Input</h3>
          <textarea class="form-control tool-textarea" id="${this.toolId}-input" placeholder="${this.getInputPlaceholder()}"></textarea>
        </div>
        <div class="tool-panel">
          <h3>Preview</h3>
          <div id="${this.toolId}-preview" class="markdown-preview form-control tool-textarea" style="overflow-y:auto; white-space:normal; font-family: var(--font-family);"></div>
        </div>
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" id="${this.toolId}-process">Render</button>
        <button class="btn" id="${this.toolId}-copy">Copy HTML</button>
        <button class="btn" id="${this.toolId}-clear">Clear</button>
      </div>
    `;
  }

  setupElements() {
    this.inputElement = document.getElementById(`${this.toolId}-input`);
    // outputElement points to preview div for copy
    this.outputElement = { value: '' };
  }

  setupEventListeners() {
    document.getElementById(`${this.toolId}-process`).addEventListener('click', () => this.process());
    document.getElementById(`${this.toolId}-clear`).addEventListener('click', () => {
      this.inputElement.value = '';
      document.getElementById(`${this.toolId}-preview`).innerHTML = '';
      this.storage.clear(this.toolId);
    });
    document.getElementById(`${this.toolId}-copy`).addEventListener('click', async () => {
      const html = document.getElementById(`${this.toolId}-preview`).innerHTML;
      if (!html) { this.toastSystem.warning('Nothing to copy'); return; }
      try {
        await navigator.clipboard.writeText(html);
        this.toastSystem.success('HTML copied!');
      } catch { this.toastSystem.error('Failed to copy'); }
    });
    // Live preview on input
    this.inputElement.addEventListener('input', () => {
      this.process();
      this.saveState();
    });
  }

  restoreState() {
    const state = this.storage.load(this.toolId);
    if (state && state.input) {
      this.inputElement.value = state.input;
      this.process();
    }
  }
}
