// JSON Path Query Tool
import { BaseTool } from './base-tool.js';

export class JSONPath extends BaseTool {
  constructor(toastSystem) { super('json-path', toastSystem); }
  getInputPlaceholder() { return '{\n  "users": [\n    {"name":"Alice","age":30},\n    {"name":"Bob","age":25}\n  ]\n}'; }

  process() {
    const input = this.inputElement.value.trim();
    const path = document.getElementById(`${this.toolId}-path`).value.trim();
    if (!input) { this.toastSystem.warning('Enter JSON'); return; }
    if (!path) { this.toastSystem.warning('Enter a path (e.g. users[0].name)'); return; }
    try {
      const obj = JSON.parse(input);
      const result = this.query(obj, path);
      this.outputElement.value = JSON.stringify(result, null, 2);
      this.toastSystem.success('Query executed!');
    } catch (e) { this.toastSystem.error(e.message); }
  }

  query(obj, path) {
    // Support dot notation and bracket notation
    const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
    let result = obj;
    for (const key of keys) {
      if (result == null) throw new Error(`Cannot read "${key}" of null`);
      result = result[key];
      if (result === undefined) throw new Error(`Key "${key}" not found`);
    }
    return result;
  }

  getTemplate() {
    return `
      <div style="margin-bottom:1rem">
        <label class="form-label">JSON Path Query</label>
        <input type="text" class="form-control" id="${this.toolId}-path" placeholder="e.g. users[0].name  or  users">
      </div>
      <div class="tool-layout">
        <div class="tool-panel"><h3>JSON Input</h3>
          <textarea class="form-control tool-textarea" id="${this.toolId}-input" placeholder="${this.getInputPlaceholder()}"></textarea>
        </div>
        <div class="tool-panel"><h3>Query Result</h3>
          <textarea class="form-control tool-textarea" id="${this.toolId}-output" readonly placeholder="Result appears here..."></textarea>
        </div>
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" id="${this.toolId}-process">Run Query</button>
        <button class="btn" id="${this.toolId}-copy">Copy</button>
        <button class="btn" id="${this.toolId}-clear">Clear</button>
      </div>`;
  }

  setupEventListeners() {
    super.setupEventListeners();
    document.getElementById(`${this.toolId}-path`).addEventListener('keydown', e => {
      if (e.key === 'Enter') this.process();
    });
  }
}
