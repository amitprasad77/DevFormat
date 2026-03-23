// Regex Tester Tool
import { BaseTool } from './base-tool.js';

export class RegexTester extends BaseTool {
  constructor(toastSystem) {
    super('regex-tester', toastSystem);
  }

  test() {
    const pattern = document.getElementById(`${this.toolId}-pattern`).value;
    const flags = document.getElementById(`${this.toolId}-flags`).value;
    const testStr = this.inputElement.value;
    const resultsEl = document.getElementById(`${this.toolId}-results`);

    if (!pattern) { this.toastSystem.warning('Enter a regex pattern'); return; }
    if (!testStr) { this.toastSystem.warning('Enter test string'); return; }

    try {
      const regex = new RegExp(pattern, flags);
      const matches = [...testStr.matchAll(new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'))];

      if (matches.length === 0) {
        resultsEl.innerHTML = `<p style="color:var(--error)">❌ No matches found</p>`;
        this.outputElement.value = 'No matches';
        return;
      }

      let output = `✅ ${matches.length} match${matches.length > 1 ? 'es' : ''} found\n\n`;
      matches.forEach((m, i) => {
        output += `Match ${i + 1}: "${m[0]}" at index ${m.index}\n`;
        if (m.length > 1) {
          m.slice(1).forEach((g, gi) => output += `  Group ${gi + 1}: "${g}"\n`);
        }
      });

      this.outputElement.value = output;

      // Highlight matches in the test string
      const highlighted = testStr.replace(new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'),
        (match) => `<mark style="background:rgba(59,130,246,0.4);border-radius:3px;padding:0 2px">${match}</mark>`);
      resultsEl.innerHTML = highlighted;

      this.toastSystem.success(`${matches.length} match${matches.length > 1 ? 'es' : ''} found!`);
    } catch (error) {
      resultsEl.innerHTML = `<p style="color:var(--error)">❌ Invalid regex: ${error.message}</p>`;
      this.toastSystem.error('Invalid regex: ' + error.message);
    }
  }

  process() { this.test(); }

  getTemplate() {
    return `
      <div style="margin-bottom:1.5rem; display:flex; gap:1rem; flex-wrap:wrap;">
        <div style="flex:1; min-width:200px;">
          <label class="form-label">Pattern</label>
          <input type="text" class="form-control" id="${this.toolId}-pattern" placeholder="e.g. \\d+" style="font-family:var(--font-mono,'Fira Code',monospace)">
        </div>
        <div style="width:120px;">
          <label class="form-label">Flags</label>
          <input type="text" class="form-control" id="${this.toolId}-flags" placeholder="gi" value="g" maxlength="6">
        </div>
      </div>
      <div class="tool-layout">
        <div class="tool-panel">
          <h3>Test String</h3>
          <textarea class="form-control tool-textarea" id="${this.toolId}-input" placeholder="Enter text to test against..."></textarea>
        </div>
        <div class="tool-panel">
          <h3>Results</h3>
          <textarea class="form-control tool-textarea" id="${this.toolId}-output" readonly placeholder="Match results will appear here..."></textarea>
        </div>
      </div>
      <div style="margin-top:1rem;">
        <label class="form-label">Highlighted Matches</label>
        <div id="${this.toolId}-results" class="form-control" style="min-height:80px; white-space:pre-wrap; font-family:var(--font-mono,'Fira Code',monospace); font-size:0.875rem; overflow-y:auto;"></div>
      </div>
      <div class="tool-actions" style="margin-top:1rem;">
        <button class="btn btn-primary" id="${this.toolId}-process">Test Regex</button>
        <button class="btn" id="${this.toolId}-copy">Copy Results</button>
        <button class="btn" id="${this.toolId}-clear">Clear</button>
      </div>
    `;
  }

  setupEventListeners() {
    document.getElementById(`${this.toolId}-process`).addEventListener('click', () => this.test());
    document.getElementById(`${this.toolId}-copy`).addEventListener('click', () => this.copyOutput());
    document.getElementById(`${this.toolId}-clear`).addEventListener('click', () => {
      this.inputElement.value = '';
      this.outputElement.value = '';
      document.getElementById(`${this.toolId}-pattern`).value = '';
      document.getElementById(`${this.toolId}-results`).innerHTML = '';
      this.storage.clear(this.toolId);
    });
    // Live test on input
    this.inputElement.addEventListener('input', () => { this.test(); this.saveState(); });
    document.getElementById(`${this.toolId}-pattern`).addEventListener('input', () => this.test());
    document.getElementById(`${this.toolId}-flags`).addEventListener('input', () => this.test());
  }
}
