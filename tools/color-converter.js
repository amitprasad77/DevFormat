// Color Converter Tool
import { BaseTool } from './base-tool.js';

export class ColorConverter extends BaseTool {
  constructor(toastSystem) {
    super('color-converter', toastSystem);
  }

  process() {
    const input = this.inputElement.value.trim();
    if (!input) { this.toastSystem.warning('Enter a color value'); return; }

    try {
      const result = this.convertColor(input);
      this.outputElement.value = result.text;
      document.getElementById(`${this.toolId}-swatch`).style.background = result.hex;
      this.toastSystem.success('Color converted!');
    } catch (e) {
      this.toastSystem.error(e.message);
    }
  }

  convertColor(input) {
    let hex, r, g, b;

    if (/^#([0-9a-f]{3}){1,2}$/i.test(input)) {
      hex = input.length === 4
        ? '#' + [...input.slice(1)].map(c => c + c).join('')
        : input;
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    } else if (/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.test(input)) {
      [, r, g, b] = input.match(/(\d+)/g).map(Number);
      hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    } else {
      throw new Error('Unsupported format. Use #hex or rgb(r,g,b)');
    }

    // RGB → HSL
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
        case gn: h = ((bn - rn) / d + 2) / 6; break;
        default: h = ((rn - gn) / d + 4) / 6;
      }
    }

    return {
      hex,
      text:
`HEX:  ${hex.toUpperCase()}
RGB:  rgb(${r}, ${g}, ${b})
HSL:  hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)
R: ${r}  G: ${g}  B: ${b}`
    };
  }

  getTemplate() {
    return `
      <div class="tool-layout">
        <div class="tool-panel">
          <h3>Input Color</h3>
          <div style="display:flex;gap:1rem;align-items:center;margin-bottom:1rem;">
            <input type="color" id="${this.toolId}-picker" style="width:60px;height:44px;border:none;background:none;cursor:pointer;border-radius:8px;">
            <span style="color:var(--text-secondary);font-size:0.875rem">or type below</span>
          </div>
          <textarea class="form-control tool-textarea" id="${this.toolId}-input" placeholder="#3b82f6&#10;rgb(59, 130, 246)" style="min-height:120px"></textarea>
        </div>
        <div class="tool-panel">
          <h3>Converted Values</h3>
          <div id="${this.toolId}-swatch" style="height:80px;border-radius:var(--border-radius);margin-bottom:1rem;border:1px solid var(--glass-border);background:#3b82f6;transition:background 0.3s"></div>
          <textarea class="form-control tool-textarea" id="${this.toolId}-output" readonly placeholder="Converted values appear here..." style="min-height:120px"></textarea>
        </div>
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" id="${this.toolId}-process">Convert</button>
        <button class="btn" id="${this.toolId}-copy">Copy Output</button>
        <button class="btn" id="${this.toolId}-clear">Clear</button>
      </div>
    `;
  }

  setupEventListeners() {
    super.setupEventListeners();
    const picker = document.getElementById(`${this.toolId}-picker`);
    picker.addEventListener('input', () => {
      this.inputElement.value = picker.value;
      this.process();
    });
  }
}
