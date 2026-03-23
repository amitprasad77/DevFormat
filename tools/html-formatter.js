// HTML Formatter Tool
import { BaseTool } from './base-tool.js';

export class HTMLFormatter extends BaseTool {
  constructor(toastSystem) {
    super('html-formatter', toastSystem);
  }

  getInputPlaceholder() {
    return '<div><p>Paste your HTML here...</p></div>';
  }

  process() {
    const input = this.inputElement.value.trim();
    if (!input) { this.toastSystem.warning('Please enter some HTML'); return; }
    try {
      this.outputElement.value = this.formatHTML(input);
      this.toastSystem.success('HTML formatted!');
    } catch (e) {
      this.toastSystem.error('Failed to format HTML: ' + e.message);
    }
  }

  minify() {
    const input = this.inputElement.value.trim();
    if (!input) { this.toastSystem.warning('Please enter some HTML'); return; }
    this.outputElement.value = input
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .replace(/<!--[\s\S]*?-->/g, '')
      .trim();
    this.toastSystem.success('HTML minified!');
  }

  formatHTML(html) {
    const INDENT = '  ';
    const voidTags = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
    let result = '';
    let depth = 0;
    // Simple token-based formatter
    const tokens = html.match(/<[^>]+>|[^<]+/g) || [];
    for (let token of tokens) {
      const trimmed = token.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('</')) {
        depth = Math.max(0, depth - 1);
        result += INDENT.repeat(depth) + trimmed + '\n';
      } else if (trimmed.startsWith('<') && !trimmed.startsWith('<!--')) {
        const tagName = (trimmed.match(/^<([a-z0-9]+)/i) || [])[1]?.toLowerCase();
        result += INDENT.repeat(depth) + trimmed + '\n';
        if (tagName && !voidTags.has(tagName) && !trimmed.endsWith('/>')) depth++;
      } else {
        if (trimmed) result += INDENT.repeat(depth) + trimmed + '\n';
      }
    }
    return result.trim();
  }

  getTemplate() {
    return `
      <div class="tool-layout">
        <div class="tool-panel">
          <h3>Input</h3>
          <textarea class="form-control tool-textarea" id="${this.toolId}-input" placeholder="${this.getInputPlaceholder()}"></textarea>
        </div>
        <div class="tool-panel">
          <h3>Output</h3>
          <textarea class="form-control tool-textarea" id="${this.toolId}-output" readonly placeholder="Formatted HTML will appear here..."></textarea>
        </div>
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" id="${this.toolId}-process">Beautify</button>
        <button class="btn btn-primary" id="${this.toolId}-minify">Minify</button>
        <button class="btn" id="${this.toolId}-copy">Copy Output</button>
        <button class="btn" id="${this.toolId}-clear">Clear</button>
      </div>`;
  }

  setupEventListeners() {
    super.setupEventListeners();
    document.getElementById(`${this.toolId}-minify`).addEventListener('click', () => this.minify());
  }
}
