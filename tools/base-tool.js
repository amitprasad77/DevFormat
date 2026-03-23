// Base Tool Class - Common functionality for all tools
import { LocalStorageManager } from '../services/localstorage-manager.js';

export class BaseTool {
  constructor(toolId, toastSystem) {
    this.toolId = toolId;
    this.toastSystem = toastSystem;
    this.storage = new LocalStorageManager();
    this.container = null;
    this.inputElement = null;
    this.outputElement = null;
  }

  render(container) {
    this.container = container;
    this.container.innerHTML = this.getTemplate();
    this.setupElements();
    this.setupEventListeners();
    this.restoreState();
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
          <textarea class="form-control tool-textarea" id="${this.toolId}-output" placeholder="Output will appear here..." readonly></textarea>
        </div>
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" id="${this.toolId}-process">Process</button>
        <button class="btn" id="${this.toolId}-copy">Copy Output</button>
        <button class="btn" id="${this.toolId}-clear">Clear</button>
      </div>
    `;
  }

  setupElements() {
    this.inputElement = document.getElementById(`${this.toolId}-input`);
    this.outputElement = document.getElementById(`${this.toolId}-output`);
  }

  setupEventListeners() {
    document.getElementById(`${this.toolId}-process`).addEventListener('click', () => this.process());
    document.getElementById(`${this.toolId}-copy`).addEventListener('click', () => this.copyOutput());
    document.getElementById(`${this.toolId}-clear`).addEventListener('click', () => this.clear());
    
    this.inputElement.addEventListener('input', () => this.saveState());
  }

  process() {
    // Override in subclass
  }

  async copyOutput() {
    const output = this.outputElement.value;
    if (!output) {
      this.toastSystem.warning('Nothing to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      this.toastSystem.success('Copied to clipboard!');
    } catch (error) {
      this.toastSystem.error('Failed to copy to clipboard');
    }
  }

  clear() {
    this.inputElement.value = '';
    this.outputElement.value = '';
    this.storage.clear(this.toolId);
    this.toastSystem.info('Cleared');
  }

  saveState() {
    this.storage.save(this.toolId, {
      input: this.inputElement.value
    });
  }

  restoreState() {
    const state = this.storage.load(this.toolId);
    if (state && state.input) {
      this.inputElement.value = state.input;
    }
  }

  getInputPlaceholder() {
    return 'Enter your data here...';
  }
}
