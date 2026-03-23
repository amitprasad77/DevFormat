import { BaseTool } from './base-tool.js';

export class ChmodCalculator extends BaseTool {
  constructor(toast) { super('chmod', toast); }

  render(container) {
    this.container = container;
    container.innerHTML = `
      <div class="tool-panel glass-panel" style="padding:1.5rem;margin-bottom:1rem">
        <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;margin-bottom:1.5rem">
          <div class="form-group" style="margin:0">
            <label class="form-label">Octal</label>
            <input type="text" id="chmod-octal" class="form-control" value="755" maxlength="3" style="width:80px;text-align:center;font-size:1.5rem;font-family:'Fira Code',monospace">
          </div>
          <div class="form-group" style="margin:0">
            <label class="form-label">Symbolic</label>
            <input type="text" id="chmod-symbolic" class="form-control" value="rwxr-xr-x" maxlength="9" style="width:140px;font-family:'Fira Code',monospace" readonly>
          </div>
        </div>
        <div id="chmod-grid" style="display:grid;grid-template-columns:auto repeat(3,1fr);gap:0.5rem 1rem;align-items:center"></div>
      </div>
      <div class="tool-panel glass-panel" style="padding:1.5rem">
        <h3>Command Preview</h3>
        <code id="chmod-cmd" style="font-family:'Fira Code',monospace;font-size:1.1rem;color:var(--accent-primary)">chmod 755 filename</code>
      </div>`;

    this.buildGrid();
    document.getElementById('chmod-octal').addEventListener('input', (e) => this.fromOctal(e.target.value));
  }

  buildGrid() {
    const grid = document.getElementById('chmod-grid');
    const headers = ['', 'Read (4)', 'Write (2)', 'Execute (1)'];
    const rows = ['Owner', 'Group', 'Others'];
    grid.innerHTML = headers.map(h => `<span style="font-weight:600;color:var(--text-secondary);font-size:0.85rem">${h}</span>`).join('');
    rows.forEach((row, ri) => {
      grid.innerHTML += `<span style="font-weight:600">${row}</span>`;
      ['r','w','x'].forEach((bit, bi) => {
        grid.innerHTML += `<label style="display:flex;align-items:center;gap:0.4rem;cursor:pointer">
          <input type="checkbox" id="chmod-${ri}-${bi}" ${this.defaultChecked(ri,bi)} style="width:18px;height:18px;cursor:pointer">
          <span style="font-family:'Fira Code',monospace">${bit}</span></label>`;
      });
    });
    grid.querySelectorAll('input[type=checkbox]').forEach(cb => cb.addEventListener('change', () => this.fromCheckboxes()));
  }

  defaultChecked(ri, bi) {
    // 755 = owner:rwx, group:r-x, others:r-x
    const defaults = [[1,1,1],[1,0,1],[1,0,1]];
    return defaults[ri][bi] ? 'checked' : '';
  }

  fromCheckboxes() {
    let octal = '';
    for (let ri = 0; ri < 3; ri++) {
      let val = 0;
      if (document.getElementById(`chmod-${ri}-0`).checked) val += 4;
      if (document.getElementById(`chmod-${ri}-1`).checked) val += 2;
      if (document.getElementById(`chmod-${ri}-2`).checked) val += 1;
      octal += val;
    }
    document.getElementById('chmod-octal').value = octal;
    this.updateSymbolic(octal);
    document.getElementById('chmod-cmd').textContent = `chmod ${octal} filename`;
  }

  fromOctal(val) {
    if (!/^[0-7]{3}$/.test(val)) return;
    for (let ri = 0; ri < 3; ri++) {
      const n = parseInt(val[ri]);
      document.getElementById(`chmod-${ri}-0`).checked = !!(n & 4);
      document.getElementById(`chmod-${ri}-1`).checked = !!(n & 2);
      document.getElementById(`chmod-${ri}-2`).checked = !!(n & 1);
    }
    this.updateSymbolic(val);
    document.getElementById('chmod-cmd').textContent = `chmod ${val} filename`;
  }

  updateSymbolic(octal) {
    const sym = Array.from(octal).map(d => {
      const n = parseInt(d);
      return `${n&4?'r':'-'}${n&2?'w':'-'}${n&1?'x':'-'}`;
    }).join('');
    document.getElementById('chmod-symbolic').value = sym;
  }
}
