import { BaseTool } from './base-tool.js';

const UNITS = [
  { label: 'Bits (b)',      factor: 1 / 8 },
  { label: 'Bytes (B)',     factor: 1 },
  { label: 'Kilobytes (KB)',factor: 1024 },
  { label: 'Megabytes (MB)',factor: 1024 ** 2 },
  { label: 'Gigabytes (GB)',factor: 1024 ** 3 },
  { label: 'Terabytes (TB)',factor: 1024 ** 4 },
  { label: 'Petabytes (PB)',factor: 1024 ** 5 },
];

export class ByteConverter extends BaseTool {
  constructor(toast) { super('byte-converter', toast); }

  render(container) {
    this.container = container;
    const rows = UNITS.map((u, i) => `
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:0.75rem">
        <label style="width:160px;font-size:0.9rem;color:var(--text-secondary)">${u.label}</label>
        <input type="number" id="byte-${i}" class="form-control" style="flex:1" placeholder="0" min="0" step="any">
      </div>`).join('');

    container.innerHTML = `
      <div class="tool-panel glass-panel" style="padding:1.5rem">
        <p style="color:var(--text-muted);margin-bottom:1.5rem;font-size:0.9rem">Type in any field to convert all units instantly.</p>
        ${rows}
      </div>`;

    UNITS.forEach((_, i) => {
      document.getElementById(`byte-${i}`).addEventListener('input', (e) => {
        const bytes = parseFloat(e.target.value) * UNITS[i].factor;
        UNITS.forEach((u, j) => {
          if (j !== i) {
            const el = document.getElementById(`byte-${j}`);
            el.value = isNaN(bytes) ? '' : this.fmt(bytes / u.factor);
          }
        });
      });
    });
  }

  fmt(n) {
    if (n === 0) return '0';
    if (Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-6 && n !== 0)) return n.toExponential(6);
    return parseFloat(n.toPrecision(10)).toString();
  }
}
