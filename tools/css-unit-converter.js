import { BaseTool } from './base-tool.js';

export class CSSUnitConverter extends BaseTool {
  constructor(toast) { super('css-units', toast); }

  render(container) {
    this.container = container;
    container.innerHTML = `
      <div class="tool-panel glass-panel" style="padding:1.5rem;margin-bottom:1rem">
        <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-end;margin-bottom:1.5rem">
          <div class="form-group" style="margin:0">
            <label class="form-label">Base font size (px)</label>
            <input type="number" id="css-base" class="form-control" value="16" min="1" style="width:100px">
          </div>
          <div class="form-group" style="margin:0">
            <label class="form-label">Viewport width (px)</label>
            <input type="number" id="css-vw" class="form-control" value="1440" min="1" style="width:120px">
          </div>
          <div class="form-group" style="margin:0">
            <label class="form-label">Viewport height (px)</label>
            <input type="number" id="css-vh" class="form-control" value="900" min="1" style="width:120px">
          </div>
        </div>
        <div style="display:flex;gap:1rem;align-items:flex-end;flex-wrap:wrap">
          <div class="form-group" style="margin:0;flex:1;min-width:120px">
            <label class="form-label">Value</label>
            <input type="number" id="css-value" class="form-control" value="16" step="any">
          </div>
          <div class="form-group" style="margin:0">
            <label class="form-label">From unit</label>
            <select id="css-from" class="form-control">
              <option>px</option><option>rem</option><option>em</option>
              <option>vw</option><option>vh</option><option>%</option><option>pt</option>
            </select>
          </div>
          <button class="btn btn-primary" id="css-convert">Convert</button>
        </div>
      </div>
      <div class="tool-panel glass-panel" style="padding:1.5rem">
        <h3>Results</h3>
        <div id="css-results" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:1rem"></div>
      </div>`;

    document.getElementById('css-convert').addEventListener('click', () => this.convert());
    document.getElementById('css-value').addEventListener('keydown', e => e.key === 'Enter' && this.convert());
    this.convert();
  }

  convert() {
    const val = parseFloat(document.getElementById('css-value').value);
    const from = document.getElementById('css-from').value;
    const base = parseFloat(document.getElementById('css-base').value) || 16;
    const vw = parseFloat(document.getElementById('css-vw').value) || 1440;
    const vh = parseFloat(document.getElementById('css-vh').value) || 900;
    if (isNaN(val)) return;

    // Convert to px first
    let px;
    switch (from) {
      case 'px':  px = val; break;
      case 'rem': px = val * base; break;
      case 'em':  px = val * base; break;
      case 'vw':  px = (val / 100) * vw; break;
      case 'vh':  px = (val / 100) * vh; break;
      case '%':   px = (val / 100) * base; break;
      case 'pt':  px = val * (96 / 72); break;
      default:    px = val;
    }

    const results = {
      px:  px,
      rem: px / base,
      em:  px / base,
      vw:  (px / vw) * 100,
      vh:  (px / vh) * 100,
      '%': (px / base) * 100,
      pt:  px * (72 / 96),
    };

    const container = document.getElementById('css-results');
    container.innerHTML = Object.entries(results).map(([unit, v]) => `
      <div class="glass-panel" style="padding:1rem;text-align:center">
        <div style="font-size:1.4rem;font-weight:700;font-family:'Fira Code',monospace;color:${unit===from?'var(--accent-primary)':'var(--text-primary)'}">${this.fmt(v)}</div>
        <div style="color:var(--text-muted);font-size:0.85rem;margin-top:0.25rem">${unit}</div>
      </div>`).join('');
  }

  fmt(n) { return parseFloat(n.toPrecision(6)).toString(); }
}
