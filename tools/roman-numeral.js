import { BaseTool } from './base-tool.js';

const MAP = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];

function toRoman(n) {
  if (!Number.isInteger(n) || n < 1 || n > 3999) return null;
  let result = '';
  for (const [val, sym] of MAP) { while (n >= val) { result += sym; n -= val; } }
  return result;
}

function fromRoman(s) {
  const vals = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
  s = s.toUpperCase().trim();
  if (!/^[IVXLCDM]+$/.test(s)) return null;
  let result = 0;
  for (let i = 0; i < s.length; i++) {
    const cur = vals[s[i]], next = vals[s[i+1]];
    result += next > cur ? -cur : cur;
  }
  return result;
}

export class RomanNumeral extends BaseTool {
  constructor(toast) { super('roman', toast); }

  render(container) {
    this.container = container;
    container.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem">
        <div class="tool-panel glass-panel" style="padding:1.5rem">
          <h3>Number → Roman</h3>
          <input type="number" id="roman-num" class="form-control" placeholder="e.g. 2024" min="1" max="3999" style="margin-bottom:1rem;font-family:var(--font-family)">
          <div id="roman-out" style="font-size:2.5rem;font-weight:700;color:var(--accent-primary);font-family:'Fira Code',monospace;min-height:60px;letter-spacing:0.1em"></div>
          <button class="btn btn-sm" id="roman-copy1" style="margin-top:1rem">Copy</button>
        </div>
        <div class="tool-panel glass-panel" style="padding:1.5rem">
          <h3>Roman → Number</h3>
          <input type="text" id="roman-rom" class="form-control" placeholder="e.g. MMXXIV" style="margin-bottom:1rem;font-family:'Fira Code',monospace;text-transform:uppercase">
          <div id="roman-num-out" style="font-size:2.5rem;font-weight:700;color:var(--success);font-family:'Fira Code',monospace;min-height:60px"></div>
          <button class="btn btn-sm" id="roman-copy2" style="margin-top:1rem">Copy</button>
        </div>
      </div>
      <div class="tool-panel glass-panel" style="padding:1.5rem;margin-top:1.5rem">
        <h3>Reference Table</h3>
        <div style="display:flex;flex-wrap:wrap;gap:0.75rem">
          ${MAP.map(([v,s]) => `<div class="glass-panel" style="padding:0.5rem 1rem;text-align:center"><div style="font-family:'Fira Code',monospace;font-size:1.1rem;color:var(--accent-primary)">${s}</div><div style="font-size:0.8rem;color:var(--text-muted)">${v}</div></div>`).join('')}
        </div>
      </div>`;

    document.getElementById('roman-num').addEventListener('input', e => {
      const n = parseInt(e.target.value);
      const r = toRoman(n);
      document.getElementById('roman-out').textContent = r || (e.target.value ? '—' : '');
    });
    document.getElementById('roman-rom').addEventListener('input', e => {
      const n = fromRoman(e.target.value);
      document.getElementById('roman-num-out').textContent = n !== null ? n : (e.target.value ? '—' : '');
    });
    document.getElementById('roman-copy1').addEventListener('click', async () => {
      const v = document.getElementById('roman-out').textContent;
      if (v && v !== '—') { await navigator.clipboard.writeText(v); this.toastSystem.success('Copied!'); }
    });
    document.getElementById('roman-copy2').addEventListener('click', async () => {
      const v = document.getElementById('roman-num-out').textContent;
      if (v && v !== '—') { await navigator.clipboard.writeText(v); this.toastSystem.success('Copied!'); }
    });
  }
}
