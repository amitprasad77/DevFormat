import { BaseTool } from './base-tool.js';

export class LineSorter extends BaseTool {
  constructor(toast) { super('line-sorter', toast); }

  render(container) {
    this.container = container;
    container.innerHTML = `
      <div class="tool-layout">
        <div class="tool-panel glass-panel">
          <h3>Input</h3>
          <textarea id="ls-input" class="form-control tool-textarea" placeholder="Paste lines here…"></textarea>
        </div>
        <div class="tool-panel glass-panel">
          <h3>Output</h3>
          <textarea id="ls-output" class="form-control tool-textarea" readonly placeholder="Result will appear here…"></textarea>
        </div>
      </div>
      <div class="tool-actions" style="flex-wrap:wrap">
        <button class="btn btn-primary" id="ls-sort-az">Sort A→Z</button>
        <button class="btn btn-primary" id="ls-sort-za">Sort Z→A</button>
        <button class="btn" id="ls-reverse">Reverse</button>
        <button class="btn" id="ls-shuffle">Shuffle</button>
        <button class="btn" id="ls-unique">Remove Duplicates</button>
        <button class="btn" id="ls-trim">Trim Lines</button>
        <button class="btn" id="ls-copy">Copy Output</button>
        <button class="btn" id="ls-clear">Clear</button>
      </div>
      <div id="ls-stats" style="margin-top:1rem;color:var(--text-muted);font-size:0.85rem;text-align:center"></div>`;

    const actions = {
      'ls-sort-az': () => this.process(lines => [...lines].sort((a,b) => a.localeCompare(b))),
      'ls-sort-za': () => this.process(lines => [...lines].sort((a,b) => b.localeCompare(a))),
      'ls-reverse': () => this.process(lines => [...lines].reverse()),
      'ls-shuffle': () => this.process(lines => { const a=[...lines]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a; }),
      'ls-unique':  () => this.process(lines => [...new Set(lines)]),
      'ls-trim':    () => this.process(lines => lines.map(l => l.trim()).filter(l => l)),
      'ls-copy':    () => this.copy(),
      'ls-clear':   () => { document.getElementById('ls-input').value=''; document.getElementById('ls-output').value=''; document.getElementById('ls-stats').textContent=''; },
    };
    Object.entries(actions).forEach(([id, fn]) => document.getElementById(id).addEventListener('click', fn));
  }

  process(fn) {
    const raw = document.getElementById('ls-input').value;
    const lines = raw.split('\n');
    const result = fn(lines);
    document.getElementById('ls-output').value = result.join('\n');
    document.getElementById('ls-stats').textContent = `${result.length} lines`;
  }

  async copy() {
    const val = document.getElementById('ls-output').value;
    if (!val) return;
    try { await navigator.clipboard.writeText(val); this.toastSystem.success('Copied!'); }
    catch { this.toastSystem.error('Copy failed'); }
  }
}
