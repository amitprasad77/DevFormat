// Diff Checker Tool
import { BaseTool } from './base-tool.js';

export class DiffChecker extends BaseTool {
  constructor(toastSystem) {
    super('diff-checker', toastSystem);
  }

  process() {
    const left = document.getElementById(`${this.toolId}-left`).value;
    const right = document.getElementById(`${this.toolId}-right`).value;
    const output = document.getElementById(`${this.toolId}-output`);

    if (!left && !right) { this.toastSystem.warning('Enter text in both panels'); return; }

    const leftLines = left.split('\n');
    const rightLines = right.split('\n');
    const maxLen = Math.max(leftLines.length, rightLines.length);

    let added = 0, removed = 0, changed = 0;
    let html = '<div style="font-family:var(--font-mono,\'Fira Code\',monospace);font-size:0.85rem;line-height:1.6">';

    for (let i = 0; i < maxLen; i++) {
      const l = leftLines[i] ?? '';
      const r = rightLines[i] ?? '';
      const lineNum = `<span style="color:var(--text-muted);user-select:none;margin-right:1rem;min-width:2rem;display:inline-block">${i + 1}</span>`;

      if (l === r) {
        html += `<div style="padding:1px 8px">${lineNum}${escHtml(l)}</div>`;
      } else if (l && !r) {
        removed++;
        html += `<div style="background:rgba(239,68,68,0.15);padding:1px 8px;border-left:3px solid var(--error)">- ${lineNum}${escHtml(l)}</div>`;
      } else if (!l && r) {
        added++;
        html += `<div style="background:rgba(16,185,129,0.15);padding:1px 8px;border-left:3px solid var(--success)">+ ${lineNum}${escHtml(r)}</div>`;
      } else {
        changed++;
        html += `<div style="background:rgba(239,68,68,0.15);padding:1px 8px;border-left:3px solid var(--error)">- ${lineNum}${escHtml(l)}</div>`;
        html += `<div style="background:rgba(16,185,129,0.15);padding:1px 8px;border-left:3px solid var(--success)">+ ${lineNum}${escHtml(r)}</div>`;
      }
    }

    html += '</div>';
    output.innerHTML = html;

    const total = added + removed + changed;
    if (total === 0) {
      this.toastSystem.success('Files are identical!');
    } else {
      this.toastSystem.info(`${added} added, ${removed} removed, ${changed} changed`);
    }
  }

  getTemplate() {
    return `
      <div class="tool-layout">
        <div class="tool-panel">
          <h3>Original</h3>
          <textarea class="form-control tool-textarea" id="${this.toolId}-left" placeholder="Paste original text here..."></textarea>
        </div>
        <div class="tool-panel">
          <h3>Modified</h3>
          <textarea class="form-control tool-textarea" id="${this.toolId}-right" placeholder="Paste modified text here..."></textarea>
        </div>
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" id="${this.toolId}-process">Compare</button>
        <button class="btn" id="${this.toolId}-clear">Clear</button>
      </div>
      <div style="margin-top:1.5rem;">
        <label class="form-label">Diff Output</label>
        <div id="${this.toolId}-output" class="form-control" style="min-height:200px;overflow-y:auto;white-space:pre-wrap;"></div>
      </div>
    `;
  }

  setupElements() {
    this.inputElement = document.getElementById(`${this.toolId}-left`);
    this.outputElement = { value: '' };
  }

  setupEventListeners() {
    document.getElementById(`${this.toolId}-process`).addEventListener('click', () => this.process());
    document.getElementById(`${this.toolId}-clear`).addEventListener('click', () => {
      document.getElementById(`${this.toolId}-left`).value = '';
      document.getElementById(`${this.toolId}-right`).value = '';
      document.getElementById(`${this.toolId}-output`).innerHTML = '';
      this.storage.clear(this.toolId);
    });
  }
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
