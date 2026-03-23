// JSON to CSV Converter
import { BaseTool } from './base-tool.js';

export class JSONToCSV extends BaseTool {
  constructor(toastSystem) { super('json-csv', toastSystem); }

  process() {
    const input = this.inputElement.value.trim();
    if (!input) { this.toastSystem.warning('Enter JSON data'); return; }
    try {
      const data = JSON.parse(input);
      const arr = Array.isArray(data) ? data : [data];
      if (!arr.length) { this.toastSystem.warning('Empty array'); return; }
      const keys = [...new Set(arr.flatMap(o => Object.keys(o)))];
      const escape = v => {
        const s = v == null ? '' : String(v);
        return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g,'""')}"` : s;
      };
      const csv = [keys.join(','), ...arr.map(row => keys.map(k => escape(row[k])).join(','))].join('\n');
      this.outputElement.value = csv;
      this.toastSystem.success(`Converted ${arr.length} rows!`);
    } catch (e) { this.toastSystem.error('Invalid JSON: ' + e.message); }
  }

  csvToJson() {
    const input = this.inputElement.value.trim();
    if (!input) { this.toastSystem.warning('Enter CSV data'); return; }
    try {
      const lines = input.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g,''));
      const result = lines.slice(1).map(line => {
        const vals = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|^(?=,)|(?<=,)$)/g) || [];
        return Object.fromEntries(headers.map((h, i) => [h, (vals[i] || '').replace(/^"|"$/g,'').trim()]));
      });
      this.outputElement.value = JSON.stringify(result, null, 2);
      this.toastSystem.success('CSV converted to JSON!');
    } catch (e) { this.toastSystem.error('Failed: ' + e.message); }
  }

  getInputPlaceholder() { return '[{"name":"Alice","age":30},{"name":"Bob","age":25}]'; }

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
        <button class="btn btn-primary" id="${this.toolId}-process">JSON → CSV</button>
        <button class="btn btn-primary" id="${this.toolId}-csv2json">CSV → JSON</button>
        <button class="btn" id="${this.toolId}-copy">Copy</button>
        <button class="btn" id="${this.toolId}-clear">Clear</button>
      </div>`;
  }

  setupEventListeners() {
    super.setupEventListeners();
    document.getElementById(`${this.toolId}-csv2json`).addEventListener('click', () => this.csvToJson());
  }
}
