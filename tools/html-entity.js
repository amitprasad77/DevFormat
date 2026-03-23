// HTML Entity Encoder/Decoder
import { BaseTool } from './base-tool.js';

export class HTMLEntity extends BaseTool {
  constructor(toastSystem) { super('html-entity', toastSystem); }
  getInputPlaceholder() { return '<div class="hello">Hello & "World" ©2024</div>'; }

  process() {
    const input = this.inputElement.value;
    if (!input) { this.toastSystem.warning('Enter some text'); return; }
    this.outputElement.value = input
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/©/g,'&copy;')
      .replace(/®/g,'&reg;').replace(/™/g,'&trade;').replace(/€/g,'&euro;')
      .replace(/£/g,'&pound;').replace(/¥/g,'&yen;').replace(/…/g,'&hellip;');
    this.toastSystem.success('Encoded!');
  }

  decode() {
    const input = this.inputElement.value;
    if (!input) { this.toastSystem.warning('Enter some text'); return; }
    const el = document.createElement('textarea');
    el.innerHTML = input;
    this.outputElement.value = el.value;
    this.toastSystem.success('Decoded!');
  }

  getTemplate() {
    return `
      <div class="tool-layout">
        <div class="tool-panel"><h3>Input</h3>
          <textarea class="form-control tool-textarea" id="${this.toolId}-input" placeholder="${this.getInputPlaceholder()}"></textarea>
        </div>
        <div class="tool-panel"><h3>Output</h3>
          <textarea class="form-control tool-textarea" id="${this.toolId}-output" readonly placeholder="Result appears here..."></textarea>
        </div>
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" id="${this.toolId}-process">Encode</button>
        <button class="btn btn-primary" id="${this.toolId}-decode">Decode</button>
        <button class="btn" id="${this.toolId}-copy">Copy</button>
        <button class="btn" id="${this.toolId}-clear">Clear</button>
      </div>`;
  }

  setupEventListeners() {
    super.setupEventListeners();
    document.getElementById(`${this.toolId}-decode`).addEventListener('click', () => this.decode());
  }
}
