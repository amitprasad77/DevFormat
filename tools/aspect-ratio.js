import { BaseTool } from './base-tool.js';

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

export class AspectRatio extends BaseTool {
  constructor(toast) { super('aspect-ratio', toast); }

  render(container) {
    this.container = container;
    const presets = ['16:9','4:3','1:1','21:9','9:16','3:2','5:4','2:1','4:5','3:4'];
    container.innerHTML = `
      <div class="tool-panel glass-panel" style="padding:1.5rem;margin-bottom:1rem">
        <h3>Calculate Missing Dimension</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:1rem;margin-bottom:1rem">
          <div class="form-group" style="margin:0">
            <label class="form-label">Width</label>
            <input type="number" id="ar-w" class="form-control" placeholder="1920" min="1" step="1">
          </div>
          <div class="form-group" style="margin:0">
            <label class="form-label">Height</label>
            <input type="number" id="ar-h" class="form-control" placeholder="1080" min="1" step="1">
          </div>
          <div class="form-group" style="margin:0">
            <label class="form-label">Ratio W</label>
            <input type="number" id="ar-rw" class="form-control" placeholder="16" min="1" step="1">
          </div>
          <div class="form-group" style="margin:0">
            <label class="form-label">Ratio H</label>
            <input type="number" id="ar-rh" class="form-control" placeholder="9" min="1" step="1">
          </div>
        </div>
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap">
          <button class="btn btn-primary" id="ar-calc-h">Calculate Height</button>
          <button class="btn btn-primary" id="ar-calc-w">Calculate Width</button>
          <button class="btn" id="ar-simplify">Simplify Ratio</button>
        </div>
        <div id="ar-result" style="margin-top:1rem;font-size:1.1rem;font-weight:600;color:var(--accent-primary);min-height:28px"></div>
      </div>

      <div class="tool-panel glass-panel" style="padding:1.5rem;margin-bottom:1rem">
        <h3>Common Presets</h3>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
          ${presets.map(r => `<button class="btn btn-sm" data-ratio="${r}">${r}</button>`).join('')}
        </div>
      </div>

      <div class="tool-panel glass-panel" style="padding:1.5rem">
        <h3>Visual Preview</h3>
        <div id="ar-preview" style="display:flex;align-items:flex-end;gap:1rem;flex-wrap:wrap;min-height:120px"></div>
      </div>`;

    document.getElementById('ar-calc-h').addEventListener('click', () => this.calcH());
    document.getElementById('ar-calc-w').addEventListener('click', () => this.calcW());
    document.getElementById('ar-simplify').addEventListener('click', () => this.simplify());
    container.querySelectorAll('[data-ratio]').forEach(btn => {
      btn.addEventListener('click', () => {
        const [rw, rh] = btn.dataset.ratio.split(':').map(Number);
        document.getElementById('ar-rw').value = rw;
        document.getElementById('ar-rh').value = rh;
        this.updatePreview(rw, rh);
      });
    });
    ['ar-w','ar-h','ar-rw','ar-rh'].forEach(id => document.getElementById(id).addEventListener('input', () => this.autoCalc()));
  }

  autoCalc() {
    const w = parseFloat(document.getElementById('ar-w').value);
    const h = parseFloat(document.getElementById('ar-h').value);
    const rw = parseFloat(document.getElementById('ar-rw').value);
    const rh = parseFloat(document.getElementById('ar-rh').value);
    if (w && h && !rw && !rh) this.simplify();
    if (w && rw && rh && !h) this.calcH();
    if (h && rw && rh && !w) this.calcW();
  }

  calcH() {
    const w = parseFloat(document.getElementById('ar-w').value);
    const rw = parseFloat(document.getElementById('ar-rw').value);
    const rh = parseFloat(document.getElementById('ar-rh').value);
    if (!w || !rw || !rh) { this.toastSystem.warning('Enter width and ratio'); return; }
    const h = Math.round(w * rh / rw);
    document.getElementById('ar-h').value = h;
    document.getElementById('ar-result').textContent = `Height = ${h}px`;
    this.updatePreview(rw, rh);
  }

  calcW() {
    const h = parseFloat(document.getElementById('ar-h').value);
    const rw = parseFloat(document.getElementById('ar-rw').value);
    const rh = parseFloat(document.getElementById('ar-rh').value);
    if (!h || !rw || !rh) { this.toastSystem.warning('Enter height and ratio'); return; }
    const w = Math.round(h * rw / rh);
    document.getElementById('ar-w').value = w;
    document.getElementById('ar-result').textContent = `Width = ${w}px`;
    this.updatePreview(rw, rh);
  }

  simplify() {
    const w = parseFloat(document.getElementById('ar-w').value);
    const h = parseFloat(document.getElementById('ar-h').value);
    if (!w || !h) { this.toastSystem.warning('Enter width and height'); return; }
    const d = gcd(Math.round(w), Math.round(h));
    const rw = w / d, rh = h / d;
    document.getElementById('ar-rw').value = rw;
    document.getElementById('ar-rh').value = rh;
    document.getElementById('ar-result').textContent = `Ratio = ${rw}:${rh}`;
    this.updatePreview(rw, rh);
  }

  updatePreview(rw, rh) {
    const maxW = 200;
    const scale = maxW / rw;
    const pw = Math.round(rw * scale);
    const ph = Math.round(rh * scale);
    document.getElementById('ar-preview').innerHTML = `
      <div style="width:${pw}px;height:${ph}px;background:linear-gradient(135deg,var(--accent-primary),var(--success));border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:600;font-size:0.9rem;flex-shrink:0">${rw}:${rh}</div>
      <div style="color:var(--text-secondary);font-size:0.9rem">
        <div>${pw} × ${ph} (preview)</div>
        <div style="color:var(--text-muted);margin-top:0.25rem">Ratio: ${rw}:${rh}</div>
        <div style="color:var(--text-muted)">Decimal: ${(rw/rh).toFixed(4)}</div>
      </div>`;
  }
}
