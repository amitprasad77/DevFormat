import { BaseTool } from './base-tool.js';

export class ScientificCalc extends BaseTool {
  constructor(toast) { super('sci-calc', toast); }

  render(container) {
    this.container = container;
    container.innerHTML = `
      <div class="tool-panel glass-panel" style="padding:1.5rem;max-width:480px;margin:0 auto">
        <div id="sc-history" style="min-height:40px;text-align:right;font-size:0.8rem;color:var(--text-muted);margin-bottom:0.25rem;font-family:'Fira Code',monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"></div>
        <div id="sc-display" style="text-align:right;font-size:2rem;font-weight:600;font-family:'Fira Code',monospace;padding:0.5rem 0;margin-bottom:1rem;min-height:56px;word-break:break-all;color:var(--text-primary)">0</div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:0.4rem">
          ${this.buttons().map(([label, action, style]) =>
            `<button class="sc-btn" data-action="${action}" style="padding:0.7rem 0.3rem;border-radius:8px;border:1px solid var(--glass-border);background:${style||'var(--glass-bg)'};color:var(--text-primary);font-family:'Fira Code',monospace;font-size:0.9rem;cursor:pointer;transition:all 0.15s;font-weight:500" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">${label}</button>`
          ).join('')}
        </div>
        <div style="margin-top:1rem;display:flex;gap:0.5rem;align-items:center">
          <label style="font-size:0.85rem;color:var(--text-muted)">Mode:</label>
          <select id="sc-mode" class="form-control" style="width:auto;font-size:0.85rem">
            <option value="deg">Degrees</option>
            <option value="rad">Radians</option>
          </select>
        </div>
      </div>`;

    this.display = document.getElementById('sc-display');
    this.history = document.getElementById('sc-history');
    this.expr = '';
    this.justCalc = false;

    container.querySelectorAll('.sc-btn').forEach(btn => {
      btn.addEventListener('click', () => this.handle(btn.dataset.action));
    });

    document.addEventListener('keydown', e => this.handleKey(e));
  }

  buttons() {
    const op = 'rgba(59,130,246,0.2)';
    const fn = 'rgba(16,185,129,0.15)';
    const eq = 'var(--accent-primary)';
    const cl = 'rgba(239,68,68,0.2)';
    return [
      ['sin','sin',fn],['cos','cos',fn],['tan','tan',fn],['log','log',fn],['ln','ln',fn],
      ['sin⁻¹','asin',fn],['cos⁻¹','acos',fn],['tan⁻¹','atan',fn],['10ˣ','10x',fn],['eˣ','ex',fn],
      ['x²','sq',fn],['x³','cb',fn],['√','sqrt',fn],['∛','cbrt',fn],['xʸ','pow',op],
      ['π','pi',fn],['e','e',fn],['(','(',op],[')',')',op],['%','pct',op],
      ['7','7'],['8','8'],['9','9'],['÷','/',op],['AC','ac',cl],
      ['4','4'],['5','5'],['6','6'],['×','*',op],['⌫','del',cl],
      ['1','1'],['2','2'],['3','3'],['−','-',op],['=','=',eq],
      ['0','0'],['00','00'],['.','.'],['+','+',op],['±','neg',op],
    ];
  }

  handle(action) {
    const digits = '0123456789';
    if (digits.includes(action) || action === '00') {
      if (this.justCalc) { this.expr = ''; this.justCalc = false; }
      this.expr += action; this.update();
    } else if (action === '.') {
      if (this.justCalc) { this.expr = '0'; this.justCalc = false; }
      // Only add dot if last number doesn't have one
      const parts = this.expr.split(/[\+\-\*\/]/);
      if (!parts[parts.length-1].includes('.')) { this.expr += '.'; this.update(); }
    } else if (['+','-','*','/'].includes(action)) {
      this.justCalc = false;
      this.expr += action; this.update();
    } else if (action === '(') { this.expr += '('; this.update(); }
    else if (action === ')') { this.expr += ')'; this.update(); }
    else if (action === 'pow') { this.expr += '**'; this.update(); }
    else if (action === 'pct') { this.expr += '/100'; this.update(); }
    else if (action === 'neg') {
      if (this.expr && !isNaN(this.expr)) { this.expr = String(-parseFloat(this.expr)); this.update(); }
    }
    else if (action === 'ac') { this.expr = ''; this.display.textContent = '0'; this.history.textContent = ''; }
    else if (action === 'del') { this.expr = this.expr.slice(0,-1); this.update(); }
    else if (action === '=') { this.calculate(); }
    else { this.applyFn(action); }
  }

  applyFn(fn) {
    const val = parseFloat(this.display.textContent);
    if (isNaN(val)) return;
    const deg = document.getElementById('sc-mode').value === 'deg';
    const toRad = v => deg ? v * Math.PI / 180 : v;
    const fromRad = v => deg ? v * 180 / Math.PI : v;
    const fns = {
      sin: v => Math.sin(toRad(v)), cos: v => Math.cos(toRad(v)), tan: v => Math.tan(toRad(v)),
      asin: v => fromRad(Math.asin(v)), acos: v => fromRad(Math.acos(v)), atan: v => fromRad(Math.atan(v)),
      log: v => Math.log10(v), ln: v => Math.log(v),
      '10x': v => Math.pow(10, v), ex: v => Math.exp(v),
      sq: v => v*v, cb: v => v*v*v, sqrt: v => Math.sqrt(v), cbrt: v => Math.cbrt(v),
      pi: () => Math.PI, e: () => Math.E,
    };
    if (fn === 'pi' || fn === 'e') { this.expr = String(fns[fn]()); this.update(); return; }
    const result = fns[fn]?.(val);
    if (result !== undefined) { this.history.textContent = `${fn}(${val})`; this.expr = String(this.fmt(result)); this.update(); this.justCalc = true; }
  }

  calculate() {
    if (!this.expr) return;
    try {
      // Safe eval using Function
      const result = Function('"use strict"; return (' + this.expr + ')')();
      this.history.textContent = this.expr + ' =';
      this.expr = String(this.fmt(result));
      this.display.textContent = this.expr;
      this.justCalc = true;
    } catch {
      this.display.textContent = 'Error';
      this.expr = '';
    }
  }

  update() { this.display.textContent = this.expr || '0'; }

  fmt(n) {
    if (!isFinite(n)) return n;
    const s = parseFloat(n.toPrecision(12));
    return Math.abs(s) < 1e-10 && s !== 0 ? s.toExponential(6) : s;
  }

  handleKey(e) {
    if (!this.container) return;
    const map = { Enter:'=', Backspace:'del', Escape:'ac', '*':'*', '/':'/', '+':'+', '-':'-', '.':'.' };
    if (e.key >= '0' && e.key <= '9') this.handle(e.key);
    else if (map[e.key]) this.handle(map[e.key]);
  }
}
