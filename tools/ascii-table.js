import { BaseTool } from './base-tool.js';

export class ASCIITable extends BaseTool {
  constructor(toast) { super('ascii-table', toast); }

  render(container) {
    this.container = container;
    container.innerHTML = `
      <div class="tool-panel glass-panel" style="padding:1.5rem;margin-bottom:1rem">
        <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-end">
          <div style="flex:1;min-width:200px">
            <input type="search" id="at-search" class="form-control" placeholder="Search character, decimal, hex, or description…">
          </div>
          <div>
            <select id="at-range" class="form-control">
              <option value="all">All (0–127)</option>
              <option value="printable">Printable (32–126)</option>
              <option value="control">Control (0–31)</option>
              <option value="extended">Extended (128–255)</option>
            </select>
          </div>
        </div>
      </div>
      <div class="tool-panel glass-panel" style="padding:1rem;overflow-x:auto">
        <table id="at-table" style="width:100%;border-collapse:collapse;font-size:0.85rem">
          <thead>
            <tr style="color:var(--text-muted);text-align:left">
              <th style="padding:0.5rem 0.75rem">Dec</th>
              <th style="padding:0.5rem 0.75rem">Hex</th>
              <th style="padding:0.5rem 0.75rem">Oct</th>
              <th style="padding:0.5rem 0.75rem">Bin</th>
              <th style="padding:0.5rem 0.75rem">Char</th>
              <th style="padding:0.5rem 0.75rem">HTML</th>
              <th style="padding:0.5rem 0.75rem">Description</th>
            </tr>
          </thead>
          <tbody id="at-body"></tbody>
        </table>
      </div>`;

    document.getElementById('at-search').addEventListener('input', () => this.renderTable());
    document.getElementById('at-range').addEventListener('change', () => this.renderTable());
    this.renderTable();
  }

  getDesc(code) {
    const ctrl = {0:'NUL (Null)',1:'SOH (Start of Heading)',2:'STX (Start of Text)',3:'ETX (End of Text)',4:'EOT (End of Transmission)',5:'ENQ (Enquiry)',6:'ACK (Acknowledge)',7:'BEL (Bell)',8:'BS (Backspace)',9:'HT (Horizontal Tab)',10:'LF (Line Feed)',11:'VT (Vertical Tab)',12:'FF (Form Feed)',13:'CR (Carriage Return)',14:'SO (Shift Out)',15:'SI (Shift In)',16:'DLE (Data Link Escape)',17:'DC1 (Device Control 1)',18:'DC2 (Device Control 2)',19:'DC3 (Device Control 3)',20:'DC4 (Device Control 4)',21:'NAK (Negative Acknowledge)',22:'SYN (Synchronous Idle)',23:'ETB (End of Transmission Block)',24:'CAN (Cancel)',25:'EM (End of Medium)',26:'SUB (Substitute)',27:'ESC (Escape)',28:'FS (File Separator)',29:'GS (Group Separator)',30:'RS (Record Separator)',31:'US (Unit Separator)',32:'Space',127:'DEL (Delete)'};
    return ctrl[code] || String.fromCharCode(code);
  }

  renderTable() {
    const q = document.getElementById('at-search').value.toLowerCase();
    const range = document.getElementById('at-range').value;
    let [min, max] = range === 'printable' ? [32,126] : range === 'control' ? [0,31] : range === 'extended' ? [128,255] : [0,127];

    const rows = [];
    for (let i = min; i <= max; i++) {
      const char = i >= 32 && i !== 127 ? String.fromCharCode(i) : '';
      const desc = this.getDesc(i);
      const hex = i.toString(16).toUpperCase().padStart(2,'0');
      const oct = i.toString(8).padStart(3,'0');
      const bin = i.toString(2).padStart(8,'0');
      const html = `&#${i};`;
      if (q && !String(i).includes(q) && !hex.toLowerCase().includes(q) && !desc.toLowerCase().includes(q) && !char.includes(q)) continue;
      rows.push(`<tr style="border-top:1px solid var(--glass-border);cursor:pointer" onclick="navigator.clipboard.writeText('${char || i}')">
        <td style="padding:0.5rem 0.75rem;font-family:'Fira Code',monospace">${i}</td>
        <td style="padding:0.5rem 0.75rem;font-family:'Fira Code',monospace;color:var(--accent-primary)">${hex}</td>
        <td style="padding:0.5rem 0.75rem;font-family:'Fira Code',monospace">${oct}</td>
        <td style="padding:0.5rem 0.75rem;font-family:'Fira Code',monospace;font-size:0.75rem">${bin}</td>
        <td style="padding:0.5rem 0.75rem;font-family:'Fira Code',monospace;font-size:1.1rem;text-align:center">${char || '·'}</td>
        <td style="padding:0.5rem 0.75rem;font-family:'Fira Code',monospace;color:var(--text-muted)">${html}</td>
        <td style="padding:0.5rem 0.75rem;color:var(--text-secondary)">${desc}</td>
      </tr>`);
    }
    document.getElementById('at-body').innerHTML = rows.join('') || '<tr><td colspan="7" style="padding:2rem;text-align:center;color:var(--text-muted)">No results</td></tr>';
  }
}
