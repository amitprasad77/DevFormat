// URL Encoder/Decoder Tool
import { BaseTool } from './base-tool.js';

export class URLTool extends BaseTool {
  constructor(toastSystem) {
    super('url-encoder', toastSystem);
  }

  getInputPlaceholder() {
    return 'Enter URL to encode or decode...';
  }

  encode() {
    const input = this.inputElement.value;
    
    if (!input) {
      this.toastSystem.warning('Please enter a URL');
      return;
    }

    try {
      const encoded = encodeURIComponent(input);
      this.outputElement.value = encoded;
      this.toastSystem.success('URL encoded!');
    } catch (error) {
      this.toastSystem.error('Failed to encode URL');
    }
  }

  decode() {
    const input = this.inputElement.value.trim();
    
    if (!input) {
      this.toastSystem.warning('Please enter encoded URL');
      return;
    }

    try {
      const decoded = decodeURIComponent(input);
      this.outputElement.value = decoded;
      this.toastSystem.success('URL decoded!');
    } catch (error) {
      this.toastSystem.error('Invalid encoded URL');
    }
  }

  process() {
    this.encode();
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
          <textarea class="form-control tool-textarea" id="${this.toolId}-output" placeholder="Result will appear here..." readonly></textarea>
        </div>
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" id="${this.toolId}-encode">Encode</button>
        <button class="btn btn-primary" id="${this.toolId}-decode">Decode</button>
        <button class="btn" id="${this.toolId}-copy">Copy Output</button>
        <button class="btn" id="${this.toolId}-clear">Clear</button>
      </div>
    `;
  }

  setupEventListeners() {
    document.getElementById(`${this.toolId}-encode`).addEventListener('click', () => this.encode());
    document.getElementById(`${this.toolId}-decode`).addEventListener('click', () => this.decode());
    document.getElementById(`${this.toolId}-copy`).addEventListener('click', () => this.copyOutput());
    document.getElementById(`${this.toolId}-clear`).addEventListener('click', () => this.clear());
    
    this.inputElement.addEventListener('input', () => this.saveState());
  }
}
