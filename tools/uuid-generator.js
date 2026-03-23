// UUID Generator Tool
import { BaseTool } from './base-tool.js';

export class UUIDGenerator extends BaseTool {
  constructor(toastSystem) { super('uuid-gen', toastSystem); }

  generateV4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
  }

  process() {
    const count = parseInt(document.getElementById(`${this.toolId}-count`).value) || 1;
    const upper = document.getElementById(`${this.toolId}-upper`).checked;
    const uuids = Array.from({length: count}, () => {
      const u = this.generateV4();
      return upper ? u.toUpperCase() : u;
    });
    this.outputElement.value = uuids.join('\n');
    this.toastSystem.success(`${count} UUID${count > 1 ? 's' : ''} generated!`);
  }

  getTemplate() {
    return `
      <div style="display:flex;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap;align-items:flex-end">
        <div>
          <label class="form-label">Count</label>
          <input type="number" class="form-control" id="${this.toolId}-count" value="5" min="1" max="100" style="width:100px">
        </div>
        <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;padding-bottom:0.25rem">
          <input type="checkbox" id="${this.toolId}-upper"> Uppercase
        </label>
        <button class="btn btn-primary" id="${this.toolId}-process">Generate</button>
      </div>
      <div>
        <label class="form-label">Generated UUIDs</label>
        <textarea class="form-control tool-textarea" id="${this.toolId}-output" readonly placeholder="UUIDs will appear here..." style="min-height:300px;font-family:'Fira Code',monospace"></textarea>
      </div>
      <div class="tool-actions" style="margin-top:1rem">
        <button class="btn" id="${this.toolId}-copy">Copy All</button>
        <button class="btn" id="${this.toolId}-clear">Clear</button>
      </div>`;
  }

  setupElements() {
    this.inputElement = { value: '' };
    this.outputElement = document.getElementById(`${this.toolId}-output`);
  }

  setupEventListeners() {
    document.getElementById(`${this.toolId}-process`).addEventListener('click', () => this.process());
    document.getElementById(`${this.toolId}-copy`).addEventListener('click', () => this.copyOutput());
    document.getElementById(`${this.toolId}-clear`).addEventListener('click', () => { this.outputElement.value = ''; });
  }
}
