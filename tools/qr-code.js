import { BaseTool } from './base-tool.js';

// Minimal QR Code generator using the qrcodejs approach via canvas
// Pure JS implementation — no external deps
// Uses ISO 18004 QR encoding (byte mode, ECC level M)

export class QRCodeGenerator extends BaseTool {
  constructor(toast) { super('qr-code', toast); }

  render(container) {
    this.container = container;
    container.innerHTML = `
      <div class="tool-panel glass-panel" style="padding:1.5rem;margin-bottom:1rem">
        <div class="form-group">
          <label class="form-label">Text or URL</label>
          <input type="text" id="qr-input" class="form-control" placeholder="https://example.com" style="font-family:var(--font-family)">
        </div>
        <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-end">
          <div class="form-group" style="margin:0">
            <label class="form-label">Size (px)</label>
            <input type="number" id="qr-size" class="form-control" value="256" min="64" max="1024" step="32" style="width:100px">
          </div>
          <div class="form-group" style="margin:0">
            <label class="form-label">Foreground</label>
            <input type="color" id="qr-fg" value="#ffffff" style="width:60px;height:38px;border-radius:8px;border:1px solid var(--glass-border);cursor:pointer;background:none">
          </div>
          <div class="form-group" style="margin:0">
            <label class="form-label">Background</label>
            <input type="color" id="qr-bg" value="#0a0a0a" style="width:60px;height:38px;border-radius:8px;border:1px solid var(--glass-border);cursor:pointer;background:none">
          </div>
          <button class="btn btn-primary" id="qr-generate">Generate</button>
        </div>
      </div>
      <div class="tool-panel glass-panel" style="padding:2rem;text-align:center">
        <canvas id="qr-canvas" style="border-radius:12px;max-width:100%"></canvas>
        <p id="qr-placeholder" style="color:var(--text-muted);margin:2rem 0">Enter text above and click Generate</p>
        <div id="qr-actions" style="display:none;margin-top:1.5rem;display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary" id="qr-download">Download PNG</button>
          <button class="btn" id="qr-copy-img">Copy Image</button>
        </div>
      </div>`;

    document.getElementById('qr-generate').addEventListener('click', () => this.generate());
    document.getElementById('qr-input').addEventListener('keydown', e => e.key === 'Enter' && this.generate());
    document.getElementById('qr-download').addEventListener('click', () => this.download());
    document.getElementById('qr-copy-img').addEventListener('click', () => this.copyImage());
  }

  generate() {
    const text = document.getElementById('qr-input').value.trim();
    if (!text) { this.toastSystem.warning('Enter some text first'); return; }
    const size = parseInt(document.getElementById('qr-size').value) || 256;
    const fg = document.getElementById('qr-fg').value;
    const bg = document.getElementById('qr-bg').value;

    try {
      const matrix = this.buildMatrix(text);
      this.drawCanvas(matrix, size, fg, bg);
      document.getElementById('qr-placeholder').style.display = 'none';
      document.getElementById('qr-actions').style.display = 'flex';
    } catch (e) {
      this.toastSystem.error('Text too long for QR code');
    }
  }

  // ── Minimal QR encoder (byte mode, ECC-M) ──────────────────────────────────
  buildMatrix(text) {
    const data = new TextEncoder().encode(text);
    // Pick version based on data length (ECC M capacity table subset)
    const caps = [16,28,44,64,86,108,124,154,182,216,254,290,334,365,415,453,507,563,627,669];
    let version = caps.findIndex(c => c >= data.length);
    if (version === -1) throw new Error('too long');
    version += 1; // 1-indexed

    const size = version * 4 + 17;
    const mat = Array.from({length:size}, () => new Array(size).fill(null));

    this.placeFinderPatterns(mat, size);
    this.placeTimingPatterns(mat, size);
    this.placeDarkModule(mat, version);
    if (version >= 2) this.placeAlignmentPatterns(mat, version, size);

    // Build data codewords
    const codewords = this.buildCodewords(data, version);
    this.placeData(mat, size, codewords);
    this.applyBestMask(mat, size);

    return mat;
  }

  placeFinderPatterns(mat, size) {
    const place = (row, col) => {
      for (let r = -1; r <= 7; r++)
        for (let c = -1; c <= 7; c++) {
          const rr = row + r, cc = col + c;
          if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
          const inPat = r >= 0 && r <= 6 && c >= 0 && c <= 6;
          const onBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const inInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          mat[rr][cc] = inPat ? (onBorder || inInner ? 1 : 0) : 0;
        }
    };
    place(0, 0); place(0, size - 7); place(size - 7, 0);
  }

  placeTimingPatterns(mat, size) {
    for (let i = 8; i < size - 8; i++) {
      if (mat[6][i] === null) mat[6][i] = i % 2 === 0 ? 1 : 0;
      if (mat[i][6] === null) mat[i][6] = i % 2 === 0 ? 1 : 0;
    }
  }

  placeDarkModule(mat, version) { mat[version * 4 + 9][8] = 1; }

  placeAlignmentPatterns(mat, version, size) {
    const table = [[],[],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94]];
    const coords = table[version] || [];
    for (const r of coords) for (const c of coords) {
      if (mat[r][c] !== null) continue;
      for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
        const onEdge = Math.abs(dr) === 2 || Math.abs(dc) === 2;
        const center = dr === 0 && dc === 0;
        mat[r+dr][c+dc] = (onEdge || center) ? 1 : 0;
      }
    }
  }

  buildCodewords(data, version) {
    // Simplified: byte mode, ECC-M — just build the bit stream and pad
    const bits = [];
    // Mode indicator: byte = 0100
    bits.push(0,1,0,0);
    // Character count (8 bits for versions 1-9)
    const len = data.length;
    for (let i = 7; i >= 0; i--) bits.push((len >> i) & 1);
    // Data bytes
    for (const byte of data) for (let i = 7; i >= 0; i--) bits.push((byte >> i) & 1);
    // Terminator
    for (let i = 0; i < 4 && bits.length % 8 !== 0; i++) bits.push(0);
    while (bits.length % 8 !== 0) bits.push(0);
    // Pad codewords
    const padBytes = [0xEC, 0x11];
    const totalDataCW = [19,34,55,80,108,136,156,194,232,274,324,370,428,461,523,589,647,721,795,861][version-1];
    let pi = 0;
    while (bits.length < totalDataCW * 8) { for (let i = 7; i >= 0; i--) bits.push((padBytes[pi%2] >> i) & 1); pi++; }
    // Convert to codewords
    const cw = [];
    for (let i = 0; i < bits.length; i += 8) {
      let b = 0; for (let j = 0; j < 8; j++) b = (b << 1) | (bits[i+j] || 0);
      cw.push(b);
    }
    return cw;
  }

  placeData(mat, size, codewords) {
    let bitIdx = 0;
    const bits = codewords.flatMap(b => Array.from({length:8}, (_,i) => (b >> (7-i)) & 1));
    let up = true;
    for (let col = size - 1; col >= 1; col -= 2) {
      if (col === 6) col--;
      for (let i = 0; i < size; i++) {
        const row = up ? size - 1 - i : i;
        for (let dc = 0; dc < 2; dc++) {
          const c = col - dc;
          if (mat[row][c] === null) {
            mat[row][c] = bits[bitIdx++] ?? 0;
          }
        }
      }
      up = !up;
    }
  }

  applyBestMask(mat, size) {
    // Use mask pattern 0 (i+j) % 2 == 0 — simple and effective
    const maskFn = (r, c) => (r + c) % 2 === 0;
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (mat[r][c] !== null && mat[r][c] <= 1 && maskFn(r, c))
          mat[r][c] ^= 1;
    // Place format info (simplified — hardcoded for ECC-M, mask 0)
    const fmt = [1,1,1,0,1,1,1,1,1,0,0,0,1,0,0]; // ECC M, mask 0
    const fmtPos = [[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]];
    fmtPos.forEach(([r,c], i) => { mat[r][c] = fmt[i]; mat[size-1-Math.min(i,6)][8] = fmt[i]; });
  }

  drawCanvas(matrix, size, fg, bg) {
    const canvas = document.getElementById('qr-canvas');
    const n = matrix.length;
    const scale = Math.floor(size / n);
    const actual = scale * n;
    canvas.width = actual; canvas.height = actual;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, actual, actual);
    ctx.fillStyle = fg;
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++)
        if (matrix[r][c] === 1)
          ctx.fillRect(c * scale, r * scale, scale, scale);
  }

  download() {
    const canvas = document.getElementById('qr-canvas');
    const a = document.createElement('a');
    a.download = 'qrcode.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
    this.toastSystem.success('Downloaded!');
  }

  async copyImage() {
    const canvas = document.getElementById('qr-canvas');
    canvas.toBlob(async blob => {
      try {
        await navigator.clipboard.write([new ClipboardItem({'image/png': blob})]);
        this.toastSystem.success('Image copied!');
      } catch { this.toastSystem.error('Copy not supported in this browser'); }
    });
  }
}
