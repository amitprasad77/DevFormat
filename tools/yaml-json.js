// YAML ↔ JSON Converter (minimal YAML parser, no deps)
import { BaseTool } from './base-tool.js';

export class YAMLJSON extends BaseTool {
  constructor(toastSystem) { super('yaml-json', toastSystem); }
  getInputPlaceholder() { return 'name: Alice\nage: 30\nhobbies:\n  - coding\n  - reading'; }

  process() { this.yamlToJson(); }

  yamlToJson() {
    const input = this.inputElement.value.trim();
    if (!input) { this.toastSystem.warning('Enter YAML'); return; }
    try {
      const obj = this.parseYAML(input);
      this.outputElement.value = JSON.stringify(obj, null, 2);
      this.toastSystem.success('YAML → JSON!');
    } catch (e) { this.toastSystem.error('Parse error: ' + e.message); }
  }

  jsonToYaml() {
    const input = this.inputElement.value.trim();
    if (!input) { this.toastSystem.warning('Enter JSON'); return; }
    try {
      const obj = JSON.parse(input);
      this.outputElement.value = this.toYAML(obj, 0);
      this.toastSystem.success('JSON → YAML!');
    } catch (e) { this.toastSystem.error('Invalid JSON: ' + e.message); }
  }

  parseYAML(yaml) {
    const lines = yaml.split('\n');
    const root = {};
    const stack = [{ obj: root, indent: -1 }];
    let lastKey = null;

    for (const raw of lines) {
      if (!raw.trim() || raw.trim().startsWith('#')) continue;
      const indent = raw.search(/\S/);
      const line = raw.trim();

      while (stack.length > 1 && stack[stack.length-1].indent >= indent) stack.pop();
      const parent = stack[stack.length-1].obj;

      if (line.startsWith('- ')) {
        const val = line.slice(2).trim();
        if (!Array.isArray(parent[lastKey])) parent[lastKey] = [];
        parent[lastKey].push(this.parseValue(val));
      } else if (line.includes(': ')) {
        const colonIdx = line.indexOf(': ');
        const key = line.slice(0, colonIdx);
        const val = line.slice(colonIdx + 2).trim();
        parent[key] = val ? this.parseValue(val) : {};
        lastKey = key;
        if (!val) stack.push({ obj: parent[key], indent });
      } else if (line.endsWith(':')) {
        const key = line.slice(0, -1);
        parent[key] = {};
        lastKey = key;
        stack.push({ obj: parent[key], indent });
      }
    }
    return root;
  }

  parseValue(v) {
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (v === 'null' || v === '~') return null;
    if (!isNaN(v) && v !== '') return Number(v);
    return v.replace(/^['"]|['"]$/g, '');
  }

  toYAML(obj, depth) {
    const indent = '  '.repeat(depth);
    if (Array.isArray(obj)) return obj.map(v => `${indent}- ${typeof v === 'object' ? '\n' + this.toYAML(v, depth+1) : v}`).join('\n');
    if (typeof obj === 'object' && obj !== null) {
      return Object.entries(obj).map(([k, v]) => {
        if (typeof v === 'object' && v !== null) return `${indent}${k}:\n${this.toYAML(v, depth+1)}`;
        return `${indent}${k}: ${v}`;
      }).join('\n');
    }
    return String(obj);
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
        <button class="btn btn-primary" id="${this.toolId}-process">YAML → JSON</button>
        <button class="btn btn-primary" id="${this.toolId}-j2y">JSON → YAML</button>
        <button class="btn" id="${this.toolId}-copy">Copy</button>
        <button class="btn" id="${this.toolId}-clear">Clear</button>
      </div>`;
  }

  setupEventListeners() {
    super.setupEventListeners();
    document.getElementById(`${this.toolId}-j2y`).addEventListener('click', () => this.jsonToYaml());
  }
}
