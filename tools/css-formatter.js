// CSS Formatter / Minifier Tool
import { BaseTool } from './base-tool.js';

export class CSSFormatter extends BaseTool {
  constructor(toastSystem) {
    super('css-formatter', toastSystem);
  }

  getInputPlaceholder() {
    return 'body{margin:0;padding:0;background:#0f172a;color:#fff}';
  }

  process() {
    const input = this.inputElement.value.trim();
    if (!input) { this.toastSystem.warning('Please enter some CSS'); return; }
    try {
      this.outputElement.value = this.beautifyCSS(input);
      this.toastSystem.success('CSS formatted!');
    } catch (e) {
      this.toastSystem.error('Failed to format CSS');
    }
  }

  minify() {
    const input = this.inputElement.value.trim();
    if (!input) { this.toastSystem.warning('Please enter some CSS'); return; }
    this.outputElement.value = input
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*{\s*/g, '{')
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*:\s*/g, ':')
      .replace(/\s*;\s*/g, ';')
      .replace(/;\s*}/g, '}')
      .trim();
    this.toastSystem.success('CSS minified!');
  }

  beautifyCSS(css) {
    // Remove existing formatting
    let result = css
      .replace(/\/\*[\s\S]*?\*\//g, m => `\n${m}\n`)
      .replace(/\s*{\s*/g, ' {\n  ')
      .replace(/;\s*/g, ';\n  ')
      .replace(/\s*}\s*/g, '\n}\n')
      .replace(/  \n}/g, '\n}')
      .replace(/\n{3,}/g, '\n\n');
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
          <textarea class="form-control tool-textarea" id="${this.toolId}-output" readonly placeholder="Formatted CSS will appear here..."></textarea>
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
