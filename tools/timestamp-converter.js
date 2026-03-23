// Timestamp Converter Tool
import { BaseTool } from './base-tool.js';

export class TimestampConverter extends BaseTool {
  constructor(toastSystem) {
    super('timestamp', toastSystem);
  }

  process() {
    const input = document.getElementById(`${this.toolId}-input`).value.trim();
    if (!input) { this.toastSystem.warning('Enter a timestamp or date'); return; }
    this.convert(input);
  }

  convert(input) {
    try {
      let date;
      // Unix timestamp (seconds or ms)
      if (/^\d+$/.test(input)) {
        const num = parseInt(input);
        date = new Date(num > 1e10 ? num : num * 1000);
      } else {
        date = new Date(input);
      }

      if (isNaN(date.getTime())) throw new Error('Invalid date or timestamp');

      const unix = Math.floor(date.getTime() / 1000);
      const unixMs = date.getTime();

      document.getElementById(`${this.toolId}-unix`).value = unix;
      document.getElementById(`${this.toolId}-unix-ms`).value = unixMs;
      document.getElementById(`${this.toolId}-utc`).value = date.toUTCString();
      document.getElementById(`${this.toolId}-iso`).value = date.toISOString();
      document.getElementById(`${this.toolId}-local`).value = date.toLocaleString();
      document.getElementById(`${this.toolId}-relative`).value = this.getRelative(date);

      this.toastSystem.success('Converted!');
    } catch (e) {
      this.toastSystem.error(e.message);
    }
  }

  getRelative(date) {
    const diff = Date.now() - date.getTime();
    const abs = Math.abs(diff);
    const future = diff < 0;
    const units = [
      [60000, 'minute'], [3600000, 'hour'], [86400000, 'day'],
      [2592000000, 'month'], [31536000000, 'year']
    ];
    let label = 'just now';
    for (let i = 0; i < units.length; i++) {
      const [ms, name] = units[i];
      const next = units[i + 1];
      if (!next || abs < next[0]) {
        const n = Math.round(abs / ms);
        if (n > 0) label = future ? `in ${n} ${name}${n > 1 ? 's' : ''}` : `${n} ${name}${n > 1 ? 's' : ''} ago`;
        break;
      }
    }
    return label;
  }

  nowUnix() {
    document.getElementById(`${this.toolId}-input`).value = Math.floor(Date.now() / 1000);
    this.process();
  }

  getTemplate() {
    const field = (id, label) => `
      <div>
        <label class="form-label" style="font-size:0.8rem">${label}</label>
        <div style="display:flex;gap:0.5rem">
          <input type="text" class="form-control" id="${this.toolId}-${id}" readonly placeholder="—">
          <button class="btn" title="Copy" onclick="navigator.clipboard.writeText(document.getElementById('${this.toolId}-${id}').value).then(()=>window.devFormatApp?.toastSystem?.success('Copied!'))">⎘</button>
        </div>
      </div>`;

    return `
      <div style="display:flex;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap;align-items:flex-end">
        <div style="flex:1;min-width:200px">
          <label class="form-label">Input (Unix timestamp or any date string)</label>
          <input type="text" class="form-control" id="${this.toolId}-input" placeholder="e.g. 1700000000 or 2024-01-15">
        </div>
        <button class="btn btn-primary" id="${this.toolId}-process">Convert</button>
        <button class="btn" id="${this.toolId}-now">Now</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem">
        ${field('unix','Unix (seconds)')}
        ${field('unix-ms','Unix (milliseconds)')}
        ${field('utc','UTC String')}
        ${field('iso','ISO 8601')}
        ${field('local','Local Time')}
        ${field('relative','Relative')}
      </div>`;
  }

  setupElements() {
    this.inputElement = document.getElementById(`${this.toolId}-input`);
    this.outputElement = { value: '' };
  }

  setupEventListeners() {
    document.getElementById(`${this.toolId}-process`).addEventListener('click', () => this.process());
    document.getElementById(`${this.toolId}-now`).addEventListener('click', () => this.nowUnix());
    this.inputElement.addEventListener('keydown', e => { if (e.key === 'Enter') this.process(); });
  }
}
