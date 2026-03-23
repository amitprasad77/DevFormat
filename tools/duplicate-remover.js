import { BaseTool } from './base-tool.js';

export class DuplicateRemover extends BaseTool {
  constructor(toast) { super('dup-remover', toast); }

  render(container) {
    this.container = container;
    container.innerHTML = `
      <div class="tool-layout">
        <div class="tool-panel glass-panel">
          <h3>Input</h3>
          <textarea id="dr-input" class="form-control tool-textarea" placeholder="Paste lines here — duplicates will be removed…"></textarea>
        </div>
        <div class="tool-panel glass-panel">
          <h3>Output</h3>
          <textarea id="dr-output" class="form-control tool-textarea" readonly placeholder="Unique lines will appear here…"></textarea>
        </div>
      </div>
      <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;justify-content:center;margin-top:1rem">
        <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-size:0.9rem">
          <input type="checkbox" id="dr-case" style="width:16px;height:16px"> Case-insensitive
        </label>
        <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-size:0.9rem">
          <input type="checkbox" id="dr-trim" checked style="width:16px;height:16px"> Trim whitespace
        </label>
        <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-size:0.9rem">
          <input type="checkbox" id="dr-empty" checked style="width:16px;height:16px"> Remove empty lines
        </label>
        <button class="btn btn-primary" id="dr-run">Remove Duplicates</button>
        <button class="btn" id="dr-copy">Copy Output</button>
        <button class="btn" id="dr-clear">Clear</button>
      </div>
      <div id="dr-stats" style="text-align:center;margin-top:0.75rem;font-size:0.85rem;color:var(--text-muted)"></div>`;

    document.getElementById('dr-run').addEventListener('click', () => this.process());
    document.getElementById('dr-input').addEventListener('input', () => this.process());
    document.getElementById('dr-case').addEventListener('change', () => this.process());
    document.getElementById('dr-trim').addEventListener('change', () => this.process());
    document.getElementById('dr-empty').addEventListener('change', () => this.process());
    document.getElementById('dr-copy').addEventListener('click', () => this.copy());
    document.getElementById('dr-clear').addEventListener('click', () => {
      document.getElementById('dr-input').value = '';
      document.getElementById('dr-output').value = '';
      document.getElementById('dr-stats').textContent = '';
    });
  }

  process() {
    const raw = document.getElementById('dr-input').value;
    const caseInsensitive = document.getElementById('dr-case').checked;
    const trim = document.getElementById('dr-trim').checked;
    const removeEmpty = document.getElementById('dr-empty').checked;

    let lines = raw.split('\n');
    if (trim) lines = lines.map(l => l.trim());
    if (removeEmpty) lines = lines.filter(l => l.length > 0);

    const seen = new Set();
    const unique = lines.filter(l => {
      const key = caseInsensitive ? l.toLowerCase() : l;
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });

    document.getElementById('dr-output').value = unique.join('\n');
    const removed = lines.length - unique.length;
    document.getElementById('dr-stats').textContent =
      `${lines.length} lines in → ${unique.length} unique · ${removed} duplicate${removed !== 1 ? 's' : ''} removed`;
  }

  async copy() {
    const val = document.getElementById('dr-output').value;
    if (!val) return;
    try { await navigator.clipboard.writeText(val); this.toastSystem.success('Copied!'); }
    catch { this.toastSystem.error('Copy failed'); }
  }
}
