import { BaseTool } from './base-tool.js';

export class PercentageCalc extends BaseTool {
  constructor(toast) { super('pct-calc', toast); }

  render(container) {
    this.container = container;
    container.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.5rem">

        ${this.card('What is X% of Y?', `
          <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap">
            <input type="number" id="p1-x" class="form-control" placeholder="X" style="width:80px" step="any">
            <span style="color:var(--text-muted)">% of</span>
            <input type="number" id="p1-y" class="form-control" placeholder="Y" style="width:100px" step="any">
            <span style="color:var(--text-muted)">=</span>
            <span id="p1-r" style="font-size:1.3rem;font-weight:700;color:var(--accent-primary);min-width:80px">—</span>
          </div>`, 'p1')}

        ${this.card('X is what % of Y?', `
          <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap">
            <input type="number" id="p2-x" class="form-control" placeholder="X" style="width:100px" step="any">
            <span style="color:var(--text-muted)">is</span>
            <span id="p2-r" style="font-size:1.3rem;font-weight:700;color:var(--accent-primary);min-width:60px">—</span>
            <span style="color:var(--text-muted)">% of</span>
            <input type="number" id="p2-y" class="form-control" placeholder="Y" style="width:100px" step="any">
          </div>`, 'p2')}

        ${this.card('% Change from X to Y', `
          <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap">
            <input type="number" id="p3-x" class="form-control" placeholder="From" style="width:100px" step="any">
            <span style="color:var(--text-muted)">→</span>
            <input type="number" id="p3-y" class="form-control" placeholder="To" style="width:100px" step="any">
            <span style="color:var(--text-muted)">=</span>
            <span id="p3-r" style="font-size:1.3rem;font-weight:700;min-width:80px">—</span>
          </div>`, 'p3')}

        ${this.card('Increase X by Y%', `
          <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap">
            <input type="number" id="p4-x" class="form-control" placeholder="Value" style="width:100px" step="any">
            <span style="color:var(--text-muted)">+</span>
            <input type="number" id="p4-y" class="form-control" placeholder="%" style="width:80px" step="any">
            <span style="color:var(--text-muted)">% =</span>
            <span id="p4-r" style="font-size:1.3rem;font-weight:700;color:var(--success);min-width:80px">—</span>
          </div>`, 'p4')}

        ${this.card('Decrease X by Y%', `
          <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap">
            <input type="number" id="p5-x" class="form-control" placeholder="Value" style="width:100px" step="any">
            <span style="color:var(--text-muted)">−</span>
            <input type="number" id="p5-y" class="form-control" placeholder="%" style="width:80px" step="any">
            <span style="color:var(--text-muted)">% =</span>
            <span id="p5-r" style="font-size:1.3rem;font-weight:700;color:var(--error);min-width:80px">—</span>
          </div>`, 'p5')}

        ${this.card('Tip Calculator', `
          <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;margin-bottom:0.5rem">
            <span style="color:var(--text-muted)">Bill</span>
            <input type="number" id="p6-bill" class="form-control" placeholder="100" style="width:100px" step="any">
            <span style="color:var(--text-muted)">Tip</span>
            <input type="number" id="p6-tip" class="form-control" value="15" style="width:70px" step="any">
            <span style="color:var(--text-muted)">%</span>
          </div>
          <div style="font-size:0.9rem;color:var(--text-secondary)">Tip: <span id="p6-t" style="color:var(--accent-primary);font-weight:600">—</span> &nbsp; Total: <span id="p6-r" style="color:var(--success);font-weight:600">—</span></div>`, 'p6')}
      </div>`;

    // Wire up all calculators
    ['p1-x','p1-y'].forEach(id => document.getElementById(id).addEventListener('input', () => {
      const x = parseFloat(document.getElementById('p1-x').value), y = parseFloat(document.getElementById('p1-y').value);
      document.getElementById('p1-r').textContent = isNaN(x)||isNaN(y) ? '—' : this.fmt(x/100*y);
    }));
    ['p2-x','p2-y'].forEach(id => document.getElementById(id).addEventListener('input', () => {
      const x = parseFloat(document.getElementById('p2-x').value), y = parseFloat(document.getElementById('p2-y').value);
      document.getElementById('p2-r').textContent = isNaN(x)||isNaN(y)||y===0 ? '—' : this.fmt(x/y*100)+'%';
    }));
    ['p3-x','p3-y'].forEach(id => document.getElementById(id).addEventListener('input', () => {
      const x = parseFloat(document.getElementById('p3-x').value), y = parseFloat(document.getElementById('p3-y').value);
      if (isNaN(x)||isNaN(y)||x===0) { document.getElementById('p3-r').textContent='—'; return; }
      const pct = (y-x)/Math.abs(x)*100;
      const el = document.getElementById('p3-r');
      el.textContent = (pct>=0?'+':'')+this.fmt(pct)+'%';
      el.style.color = pct >= 0 ? 'var(--success)' : 'var(--error)';
    }));
    ['p4-x','p4-y'].forEach(id => document.getElementById(id).addEventListener('input', () => {
      const x = parseFloat(document.getElementById('p4-x').value), y = parseFloat(document.getElementById('p4-y').value);
      document.getElementById('p4-r').textContent = isNaN(x)||isNaN(y) ? '—' : this.fmt(x*(1+y/100));
    }));
    ['p5-x','p5-y'].forEach(id => document.getElementById(id).addEventListener('input', () => {
      const x = parseFloat(document.getElementById('p5-x').value), y = parseFloat(document.getElementById('p5-y').value);
      document.getElementById('p5-r').textContent = isNaN(x)||isNaN(y) ? '—' : this.fmt(x*(1-y/100));
    }));
    ['p6-bill','p6-tip'].forEach(id => document.getElementById(id).addEventListener('input', () => {
      const bill = parseFloat(document.getElementById('p6-bill').value), tip = parseFloat(document.getElementById('p6-tip').value);
      if (isNaN(bill)||isNaN(tip)) { document.getElementById('p6-t').textContent='—'; document.getElementById('p6-r').textContent='—'; return; }
      const tipAmt = bill*tip/100;
      document.getElementById('p6-t').textContent = this.fmt(tipAmt);
      document.getElementById('p6-r').textContent = this.fmt(bill+tipAmt);
    }));
  }

  card(title, body) {
    return `<div class="tool-panel glass-panel" style="padding:1.5rem">
      <h3 style="margin-bottom:1rem;font-size:1rem;color:var(--text-secondary)">${title}</h3>
      ${body}
    </div>`;
  }

  fmt(n) { return parseFloat(n.toPrecision(8)).toString(); }
}
