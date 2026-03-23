// Base64 Encoder/Decoder Tool
import { BaseTool } from './base-tool.js';

export class Base64Tool extends BaseTool {
  constructor(toastSystem) {
    super('base64-encoder', toastSystem);
  }

  getInputPlaceholder() {
    return 'Enter text to encode or Base64 to decode...';
  }

  encode() {
    const input = this.inputElement.value;
    
    if (!input) {
      this.toastSystem.warning('Please enter some text');
      return;
    }

    try {
      const encoded = btoa(input);
      this.outputElement.value = encoded;
      this.toastSystem.success('Encoded to Base64!');
    } catch (error) {
      this.toastSystem.error('Failed to encode: ' + error.message);
    }
  }

  decode() {
    const input = this.inputElement.value.trim();
    
    if (!input) {
      this.toastSystem.warning('Please enter Base64 data');
      return;
    }

    try {
      const decoded = atob(input);
      this.outputElement.value = decoded;
      this.toastSystem.success('Decoded from Base64!');
    } catch (error) {
      this.toastSystem.error('Invalid Base64 data');
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
