import { BaseTool } from './base-tool.js';

const SCALES = [
  { id: 'c', label: 'Celsius (°C)',    toK: v => v + 273.15,          fromK: k => k - 273.15 },
  { id: 'f', label: 'Fahrenheit (°F)', toK: v => (v + 459.67) * 5/9,  fromK: k => k * 9/5 - 459.67 },
  { id: 'k', label: 'Kelvin (K)',      toK: v => v,                    fromK: k => k },
  { id: 'r', label: 'Rankine (°R)',    toK: v => v * 5/9,              fromK: k => k * 9/5 },
  { id: 'de',label: 'Delisle (°De)',   toK: v => 373.15 - v * 2/3,    fromK: k => (373.15 - k) * 3/2 },
  { id: 'n', label: 'Newton (°N)',     toK: v => v * 100/33 + 273.15, fromK: k => (k - 273.15) * 33/100 },
  { id: 're',label: 'Réaumur (°Ré)',   toK: v => v * 5/4 + 273.15,    fromK: k => (k - 273.15) * 4/5 },
  { id: 'ro',label: 'Rømer (°Rø)',     toK: v => (v - 7.5) * 40/21 + 273.15, fromK: k => (k - 273.15) * 21/40 + 7.5 },
];

export class TemperatureConverter extends BaseTool {
  constructor(toast) { super('temp-converter', toast); }

  render(container) {
    this.container = container;
    const rows = SCALES.map(s => `
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:0.75rem">
        <label style="width:180px;font-size:0.9rem;color:var(--text-secondary)">${s.label}</label>
        <input type="number" id="temp-${s.id}" class="form-control" style="flex:1" placeholder="0" step="any" data-id="${s.id}">
      </div>`).join('');

    container.innerHTML = `
      <div class="tool-panel glass-panel" style="padding:1.5rem">
        <p style="color:var(--text-muted);margin-bottom:1.5rem;font-size:0.9rem">Type in any field to convert all scales instantly.</p>
        ${rows}
      </div>`;

    SCALES.forEach(s => {
      document.getElementById(`temp-${s.id}`).addEventListener('input', e => {
        const val = parseFloat(e.target.value);
        if (isNaN(val)) { SCALES.forEach(x => { if (x.id !== s.id) document.getElementById(`temp-${x.id}`).value = ''; }); return; }
        const kelvin = s.toK(val);
        SCALES.forEach(x => {
          if (x.id !== s.id) document.getElementById(`temp-${x.id}`).value = this.fmt(x.fromK(kelvin));
        });
      });
    });
  }

  fmt(n) { return parseFloat(n.toPrecision(8)).toString(); }
}
