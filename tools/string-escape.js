// String Escape / Unescape Tool
import { BaseTool } from './base-tool.js';

export class StringEscape extends BaseTool {
  constructor(toastSystem) { super('string-escape', toastSystem); }
  getInputPlaceholder() { return 'Hello "World"\nNew line\tTab'; }

  process() { this.escape('js'); }

  escape(type) {
    const input = this.inputElement.value;
    if (!input) { this.toastSystem.warning('Enter some text'); return; }
    const transforms = {
      js: s => s.replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/'/g,"\\'").replace(/\n/g,'\\n').replace(/\r/g,'\\r').replace(/\t/g,'\\t'),
      json: s => JSON.stringify(s).slice(1,-1),
      html: s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'),
      url: s => encodeURIComponent(s),
      csv: s => s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g,'""')}"` : s,
    };
    this.outputElement.value = (transforms[type] || transforms.js)(input);
    this.toastSystem.success('Escaped!');
  }

  unescape(type) {
    const input = this.inputElement.value;
    if (!input) { this.toastSystem.warning('Enter some text'); return; }
    try {
      const transforms = {
        js: s => s.replace(/\\n/g,'\n').replace(/\\r/g,'\r').replace(/\\t/g,'\t').replace(/\\"/g,'"').replace(/\\'/g,"'").replace(/\\\\/g,'\\'),
        json: s => JSON.parse(`"${s}"`),
        html: s => { const el = document.createElement('div'); el.innerHTML = s; return el.textContent; },
        url: s => decodeURIComponent(s),
      };
      this.outputElement.value = (transforms[type] || transforms.js)(input);
      this.toastSystem.success('Unescaped!');
    } catch (e) { this.toastSystem.error('Failed: ' + e.message); }
  }

  getTemplate() {
    const btn = (id, label, action) =>
      `<button class="btn ${action==='escape'?'btn-primary':''}" id="${this.toolId}-${id}">${label}</button>`;
    return `
      <div class="tool-layout">
        <div class="tool-panel"><h3>Input</h3>
          <textarea class="form-control tool-textarea" id="${this.toolId}-input" placeholder="${this.getInputPlaceholder()}"></textarea>
        </div>
        <div class="tool-panel"><h3>Output</h3>
          <textarea class="form-control tool-textarea" id="${this.toolId}-output" readonly placeholder="Result appears here..."></textarea>
        </div>
      </div>
      <div style="margin:1rem 0">
        <p class="form-label" style="margin-bottom:0.5rem">Escape</p>
        <div class="tool-actions" style="justify-content:flex-start">
          ${btn('esc-js','JS String','escape')}${btn('esc-json','JSON','escape')}${btn('esc-html','HTML','escape')}${btn('esc-url','URL','escape')}${btn('esc-csv','CSV','escape')}
        </div>
      </div>
      <div style="margin:1rem 0">
        <p class="form-label" style="margin-bottom:0.5rem">Unescape</p>
        <div class="tool-actions" style="justify-content:flex-start">
          ${btn('unesc-js','JS String','')}${btn('unesc-json','JSON','')}${btn('unesc-html','HTML','')}${btn('unesc-url','URL','')}
        </div>
      </div>
      <div class="tool-actions">
        <button class="btn" id="${this.toolId}-copy">Copy</button>
        <button class="btn" id="${this.toolId}-clear">Clear</button>
      </div>`;
  }

  setupEventListeners() {
    [['esc-js','js'],['esc-json','json'],['esc-html','html'],['esc-url','url'],['esc-csv','csv']].forEach(([id,t]) =>
      document.getElementById(`${this.toolId}-${id}`).addEventListener('click', () => this.escape(t)));
    [['unesc-js','js'],['unesc-json','json'],['unesc-html','html'],['unesc-url','url']].forEach(([id,t]) =>
      document.getElementById(`${this.toolId}-${id}`).addEventListener('click', () => this.unescape(t)));
    document.getElementById(`${this.toolId}-copy`).addEventListener('click', () => this.copyOutput());
    document.getElementById(`${this.toolId}-clear`).addEventListener('click', () => this.clear());
    this.inputElement.addEventListener('input', () => this.saveState());
  }
}
