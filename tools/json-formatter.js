// JSON Formatter Tool
import { BaseTool } from './base-tool.js';

export class JSONFormatter extends BaseTool {
  constructor(toastSystem) {
    super('json-formatter', toastSystem);
  }

  getInputPlaceholder() {
    return 'Paste your JSON here...';
  }

  process() {
    const input = this.inputElement.value.trim();
    
    if (!input) {
      this.toastSystem.warning('Please enter some JSON');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      this.outputElement.value = formatted;
      this.toastSystem.success('JSON formatted successfully!');
    } catch (error) {
      this.outputElement.value = '';
      this.toastSystem.error(`Invalid JSON: ${error.message}`);
    }
  }

  minify() {
    const input = this.inputElement.value.trim();
    
    if (!input) {
      this.toastSystem.warning('Please enter some JSON');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      this.outputElement.value = minified;
      this.toastSystem.success('JSON minified successfully!');
    } catch (error) {
      this.outputElement.value = '';
      this.toastSystem.error(`Invalid JSON: ${error.message}`);
    }
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
          <textarea class="form-control tool-textarea" id="${this.toolId}-output" placeholder="Formatted JSON will appear here..." readonly></textarea>
        </div>
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" id="${this.toolId}-process">Beautify</button>
        <button class="btn btn-primary" id="${this.toolId}-minify">Minify</button>
        <button class="btn" id="${this.toolId}-copy">Copy Output</button>
        <button class="btn" id="${this.toolId}-clear">Clear</button>
      </div>
    `;
  }

  setupEventListeners() {
    super.setupEventListeners();
    document.getElementById(`${this.toolId}-minify`).addEventListener('click', () => this.minify());
    
    // Auto-format on paste
    this.inputElement.addEventListener('paste', () => {
      setTimeout(() => this.process(), 100);
    });
  }
}
