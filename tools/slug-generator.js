import { BaseTool } from './base-tool.js';

export class SlugGenerator extends BaseTool {
  constructor(toast) { super('slug-gen', toast); }

  render(container) {
    this.container = container;
    container.innerHTML = `
      <div class="tool-panel glass-panel" style="padding:1.5rem;margin-bottom:1rem">
        <div class="form-group">
          <label class="form-label">Input Text</label>
          <input type="text" id="slug-input" class="form-control" placeholder="My Awesome Blog Post Title!" style="font-family:var(--font-family)">
        </div>
        <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-end">
          <div class="form-group" style="margin:0">
            <label class="form-label">Separator</label>
            <select id="slug-sep" class="form-control" style="width:100px">
              <option value="-">Hyphen (-)</option>
              <option value="_">Underscore (_)</option>
              <option value=".">Dot (.)</option>
            </select>
          </div>
          <div class="form-group" style="margin:0;display:flex;align-items:center;gap:0.5rem;padding-top:1.5rem">
            <input type="checkbox" id="slug-lower" checked style="width:16px;height:16px">
            <label for="slug-lower" style="font-size:0.9rem;cursor:pointer">Lowercase</label>
          </div>
        </div>
      </div>
      <div class="tool-panel glass-panel" style="padding:1.5rem">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
          <h3 style="margin:0">Result</h3>
          <button class="btn btn-sm" id="slug-copy">Copy</button>
        </div>
        <div id="slug-output" style="font-family:'Fira Code',monospace;font-size:1.1rem;padding:1rem;background:var(--bg-tertiary);border-radius:8px;word-break:break-all;min-height:48px;color:var(--accent-primary)"></div>
      </div>`;

    const update = () => this.generate();
    document.getElementById('slug-input').addEventListener('input', update);
    document.getElementById('slug-sep').addEventListener('change', update);
    document.getElementById('slug-lower').addEventListener('change', update);
    document.getElementById('slug-copy').addEventListener('click', () => this.copy());
  }

  generate() {
    const input = document.getElementById('slug-input').value;
    const sep = document.getElementById('slug-sep').value;
    const lower = document.getElementById('slug-lower').checked;

    let slug = input
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[^a-zA-Z0-9\s-_]/g, '')                 // remove special chars
      .trim()
      .replace(/[\s_-]+/g, sep);                         // collapse whitespace/separators

    if (lower) slug = slug.toLowerCase();
    document.getElementById('slug-output').textContent = slug;
  }

  async copy() {
    const val = document.getElementById('slug-output').textContent;
    if (!val) return;
    try { await navigator.clipboard.writeText(val); this.toastSystem.success('Copied!'); }
    catch { this.toastSystem.error('Copy failed'); }
  }
}
