import { BaseTool } from './base-tool.js';

// Pure JS bcrypt simulation using SHA-256 as the underlying primitive
// NOTE: This is a DEMONSTRATION tool — not a production bcrypt implementation.
// Real bcrypt requires a native library. This simulates the cost factor delay
// and output format for educational purposes.

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

const BCRYPT_CHARS = './ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

async function simulateBcrypt(password, cost) {
  // Generate a random 22-char salt (bcrypt format)
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = Array.from(saltBytes).map(b => BCRYPT_CHARS[b % 64]).join('').slice(0, 22);

  // Simulate cost factor iterations (2^cost rounds of SHA-256)
  const rounds = Math.min(Math.pow(2, cost), 1024); // cap for browser performance
  let hash = await sha256(password + salt);
  for (let i = 1; i < rounds; i++) hash = await sha256(hash + password);

  // Format as bcrypt-like string
  const hashPart = hash.slice(0, 31).split('').map((c, i) => BCRYPT_CHARS[parseInt(c, 16) % 64]).join('');
  return `$2b$${String(cost).padStart(2,'0')}$${salt}${hashPart}`;
}

async function simulateVerify(password, hash) {
  // Extract cost and salt from hash
  const parts = hash.split('$');
  if (parts.length < 4 || !parts[2] || !parts[3]) return false;
  const cost = parseInt(parts[2]);
  const saltAndHash = parts[3];
  const salt = saltAndHash.slice(0, 22);

  const rounds = Math.min(Math.pow(2, cost), 1024);
  let h = await sha256(password + salt);
  for (let i = 1; i < rounds; i++) h = await sha256(h + password);
  const hashPart = h.slice(0, 31).split('').map(c => BCRYPT_CHARS[parseInt(c, 16) % 64]).join('');
  const expected = `$2b$${String(cost).padStart(2,'0')}$${salt}${hashPart}`;
  return expected === hash;
}

export class BcryptSimulator extends BaseTool {
  constructor(toast) { super('bcrypt', toast); }

  render(container) {
    this.container = container;
    container.innerHTML = `
      <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:8px;padding:1rem;margin-bottom:1.5rem;font-size:0.85rem;color:var(--warning)">
        ⚠️ Educational tool only. This simulates bcrypt's format and cost factor using SHA-256 — not a real bcrypt implementation. Do not use for production security.
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem">
        <div class="tool-panel glass-panel" style="padding:1.5rem">
          <h3>Hash Password</h3>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" id="bc-pass" class="form-control" placeholder="Enter password" style="font-family:var(--font-family)">
          </div>
          <div class="form-group">
            <label class="form-label">Cost Factor: <span id="bc-cost-val">10</span></label>
            <input type="range" id="bc-cost" min="4" max="14" value="10" style="width:100%;accent-color:var(--accent-primary)">
            <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-muted)"><span>4 (fast)</span><span>14 (slow)</span></div>
          </div>
          <button class="btn btn-primary" id="bc-hash">Hash</button>
          <div id="bc-spinner" style="display:none;margin-top:1rem;color:var(--text-muted);font-size:0.9rem">⏳ Hashing…</div>
          <div id="bc-result" style="margin-top:1rem;font-family:'Fira Code',monospace;font-size:0.75rem;word-break:break-all;padding:0.75rem;background:var(--bg-tertiary);border-radius:8px;display:none"></div>
          <button class="btn btn-sm" id="bc-copy" style="margin-top:0.5rem;display:none">Copy Hash</button>
        </div>
        <div class="tool-panel glass-panel" style="padding:1.5rem">
          <h3>Verify Password</h3>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" id="bc-vpass" class="form-control" placeholder="Enter password" style="font-family:var(--font-family)">
          </div>
          <div class="form-group">
            <label class="form-label">Hash</label>
            <input type="text" id="bc-vhash" class="form-control" placeholder="\$2b\$10\$..." style="font-family:'Fira Code',monospace;font-size:0.8rem">
          </div>
          <button class="btn btn-primary" id="bc-verify">Verify</button>
          <div id="bc-vresult" style="margin-top:1rem;font-size:1.1rem;font-weight:600;min-height:32px"></div>
        </div>
      </div>`;

    document.getElementById('bc-cost').addEventListener('input', e => {
      document.getElementById('bc-cost-val').textContent = e.target.value;
    });
    document.getElementById('bc-hash').addEventListener('click', () => this.hash());
    document.getElementById('bc-verify').addEventListener('click', () => this.verify());
    document.getElementById('bc-copy').addEventListener('click', () => this.copy());
  }

  async hash() {
    const pass = document.getElementById('bc-pass').value;
    if (!pass) { this.toastSystem.warning('Enter a password'); return; }
    const cost = parseInt(document.getElementById('bc-cost').value);
    document.getElementById('bc-spinner').style.display = 'block';
    document.getElementById('bc-result').style.display = 'none';
    document.getElementById('bc-copy').style.display = 'none';
    const hash = await simulateBcrypt(pass, cost);
    document.getElementById('bc-spinner').style.display = 'none';
    document.getElementById('bc-result').textContent = hash;
    document.getElementById('bc-result').style.display = 'block';
    document.getElementById('bc-copy').style.display = 'inline-flex';
    this._hash = hash;
    this.toastSystem.success('Hash generated');
  }

  async verify() {
    const pass = document.getElementById('bc-vpass').value;
    const hash = document.getElementById('bc-vhash').value.trim();
    if (!pass || !hash) { this.toastSystem.warning('Enter both password and hash'); return; }
    const ok = await simulateVerify(pass, hash);
    const el = document.getElementById('bc-vresult');
    el.textContent = ok ? '✅ Password matches' : '❌ Password does not match';
    el.style.color = ok ? 'var(--success)' : 'var(--error)';
  }

  async copy() {
    if (!this._hash) return;
    try { await navigator.clipboard.writeText(this._hash); this.toastSystem.success('Copied!'); }
    catch { this.toastSystem.error('Copy failed'); }
  }
}
