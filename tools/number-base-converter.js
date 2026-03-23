// Number Base Converter Tool
import { BaseTool } from './base-tool.js';

export class NumberBaseConverter extends BaseTool {
  constructor(toastSystem) {
    super('number-base', toastSystem);
  }

  process() {
    const input = document.getElementById(`${this.toolId}-input`).value.trim();
    const fromBase = parseInt(document.getElementById(`${this.toolId}-from`).value);
    if (!input) { this.toastSystem.warning('Enter a number'); return; }

    try {
      const decimal = parseInt(input, fromBase);
      if (isNaN(decimal)) throw new Error('Invalid number for selected base');

      document.getElementById(`${this.toolId}-bin`).value = decimal.toString(2);
      document.getElementById(`${this.toolId}-oct`).value = decimal.toString(8);
      document.getElementById(`${this.toolId}-dec`).value = decimal.toString(10);
      document.getElementById(`${this.toolId}-hex`).value = decimal.toString(16).toUpperCase();
      this.toastSystem.success('Converted!');
    } catch (e) {
      this.toastSystem.error(e.message);
    }
  }

  getTemplate() {
    return `
      <div style="display:flex;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap;align-items:flex-end">
        <div style="flex:1;min-width:180px">
          <label class="form-label">Input Number</label>
          <input type="text" class="form-control" id="${this.toolId}-input" placeholder="e.g. 255">
        </div>
        <div style="width:160px">
          <label class="form-label">From Base</label>
          <select class="form-control" id="${this.toolId}-from">
            <option value="2">Binary (2)</option>
            <option value="8">Octal (8)</option>
            <option value="10" selected>Decimal (10)</option>
            <option value="16">Hexadecimal (16)</option>
          </select>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin-bottom:1.5rem">
        ${['bin:Binary (Base 2)','oct:Octal (Base 8)','dec:Decimal (Base 10)','hex:Hexadecimal (Base 16)'].map(s => {
          const [id, label] = s.split(':');
          return `<div>
            <label class="form-label">${label}</label>
            <div style="display:flex;gap:0.5rem">
              <input type="text" class="form-control" id="${this.toolId}-${id}" readonly placeholder="—">
              <button class="btn" onclick="navigator.clipboard.writeText(document.getElementById('${this.toolId}-${id}').value).then(()=>window.devFormatApp?.toastSystem?.success('Copied!'))" title="Copy">⎘</button>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" id="${this.toolId}-process">Convert</button>
        <button class="btn" id="${this.toolId}-clear">Clear</button>
      </div>`;
  }

  setupElements() {
    this.inputElement = document.getElementById(`${this.toolId}-input`);
    this.outputElement = { value: '' };
  }

  setupEventListeners() {
    document.getElementById(`${this.toolId}-process`).addEventListener('click', () => this.process());
    document.getElementById(`${this.toolId}-clear`).addEventListener('click', () => {
      ['input','bin','oct','dec','hex'].forEach(id => {
        const el = document.getElementById(`${this.toolId}-${id}`);
        if (el) el.value = '';
      });
    });
    this.inputElement.addEventListener('keydown', e => { if (e.key === 'Enter') this.process(); });
  }
}
