import { BaseTool } from './base-tool.js';

const CATEGORIES = {
  Length: {
    units: ['Meter','Kilometer','Centimeter','Millimeter','Mile','Yard','Foot','Inch','Nautical Mile','Light Year'],
    toBase: [1, 1000, 0.01, 0.001, 1609.344, 0.9144, 0.3048, 0.0254, 1852, 9.461e15],
  },
  Weight: {
    units: ['Kilogram','Gram','Milligram','Pound','Ounce','Ton (metric)','Stone','Carat'],
    toBase: [1, 0.001, 1e-6, 0.453592, 0.0283495, 1000, 6.35029, 0.0002],
  },
  Volume: {
    units: ['Liter','Milliliter','Cubic Meter','Gallon (US)','Quart (US)','Pint (US)','Cup (US)','Fluid Ounce (US)','Tablespoon','Teaspoon'],
    toBase: [1, 0.001, 1000, 3.78541, 0.946353, 0.473176, 0.236588, 0.0295735, 0.0147868, 0.00492892],
  },
  Area: {
    units: ['Square Meter','Square Kilometer','Square Mile','Square Yard','Square Foot','Square Inch','Hectare','Acre'],
    toBase: [1, 1e6, 2.59e6, 0.836127, 0.092903, 0.00064516, 10000, 4046.86],
  },
  Speed: {
    units: ['m/s','km/h','mph','Knot','ft/s','Mach'],
    toBase: [1, 0.277778, 0.44704, 0.514444, 0.3048, 340.29],
  },
  Time: {
    units: ['Second','Millisecond','Microsecond','Minute','Hour','Day','Week','Month','Year'],
    toBase: [1, 0.001, 1e-6, 60, 3600, 86400, 604800, 2.628e6, 3.156e7],
  },
  Data: {
    units: ['Byte','Kilobyte','Megabyte','Gigabyte','Terabyte','Bit','Kilobit','Megabit','Gigabit'],
    toBase: [1, 1024, 1048576, 1073741824, 1099511627776, 0.125, 128, 131072, 134217728],
  },
  Pressure: {
    units: ['Pascal','Bar','PSI','Atmosphere','Torr','mmHg'],
    toBase: [1, 100000, 6894.76, 101325, 133.322, 133.322],
  },
};

export class UnitConverter extends BaseTool {
  constructor(toast) { super('unit-converter', toast); }

  render(container) {
    this.container = container;
    const catOptions = Object.keys(CATEGORIES).map(c => `<option>${c}</option>`).join('');
    container.innerHTML = `
      <div class="tool-panel glass-panel" style="padding:1.5rem;margin-bottom:1rem">
        <div class="form-group">
          <label class="form-label">Category</label>
          <select id="uc-cat" class="form-control">${catOptions}</select>
        </div>
        <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:1rem;align-items:end">
          <div>
            <label class="form-label">From</label>
            <select id="uc-from-unit" class="form-control"></select>
            <input type="number" id="uc-from-val" class="form-control" style="margin-top:0.5rem" placeholder="0" step="any">
          </div>
          <div style="padding-bottom:0.5rem;font-size:1.5rem;color:var(--text-muted);text-align:center">→</div>
          <div>
            <label class="form-label">To</label>
            <select id="uc-to-unit" class="form-control"></select>
            <input type="number" id="uc-to-val" class="form-control" style="margin-top:0.5rem" placeholder="0" step="any" readonly>
          </div>
        </div>
      </div>
      <div class="tool-panel glass-panel" style="padding:1.5rem">
        <h3>All Units</h3>
        <div id="uc-all" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:0.75rem"></div>
      </div>`;

    document.getElementById('uc-cat').addEventListener('change', () => this.loadCategory());
    document.getElementById('uc-from-val').addEventListener('input', () => this.convert());
    document.getElementById('uc-from-unit').addEventListener('change', () => this.convert());
    document.getElementById('uc-to-unit').addEventListener('change', () => this.convert());
    this.loadCategory();
  }

  loadCategory() {
    const cat = document.getElementById('uc-cat').value;
    const { units } = CATEGORIES[cat];
    const opts = units.map((u, i) => `<option value="${i}">${u}</option>`).join('');
    document.getElementById('uc-from-unit').innerHTML = opts;
    document.getElementById('uc-to-unit').innerHTML = opts;
    document.getElementById('uc-to-unit').selectedIndex = 1;
    this.convert();
  }

  convert() {
    const cat = document.getElementById('uc-cat').value;
    const { toBase } = CATEGORIES[cat];
    const fromIdx = parseInt(document.getElementById('uc-from-unit').value);
    const toIdx = parseInt(document.getElementById('uc-to-unit').value);
    const val = parseFloat(document.getElementById('uc-from-val').value);
    if (isNaN(val)) { document.getElementById('uc-to-val').value = ''; this.renderAll(cat, NaN); return; }
    const base = val * toBase[fromIdx];
    const result = base / toBase[toIdx];
    document.getElementById('uc-to-val').value = this.fmt(result);
    this.renderAll(cat, base);
  }

  renderAll(cat, base) {
    const { units, toBase } = CATEGORIES[cat];
    document.getElementById('uc-all').innerHTML = units.map((u, i) => `
      <div class="glass-panel" style="padding:0.75rem">
        <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.25rem">${u}</div>
        <div style="font-family:'Fira Code',monospace;font-size:0.95rem;color:var(--text-primary)">${isNaN(base) ? '—' : this.fmt(base / toBase[i])}</div>
      </div>`).join('');
  }

  fmt(n) {
    if (!isFinite(n)) return '∞';
    if (Math.abs(n) >= 1e12 || (Math.abs(n) < 1e-6 && n !== 0)) return n.toExponential(4);
    return parseFloat(n.toPrecision(8)).toString();
  }
}
