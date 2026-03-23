import { BaseTool } from './base-tool.js';

// Pure JS JWT builder using Web Crypto API (HMAC-SHA256)
async function buildJWT(header, payload, secret) {
  const enc = new TextEncoder();
  const b64url = obj => btoa(JSON.stringify(obj)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const headerB64 = b64url(header);
  const payloadB64 = b64url(payload);
  const sigInput = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(sigInput));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  return `${sigInput}.${sigB64}`;
}

export class JWTBuilder extends BaseTool {
  constructor(toast) { super('jwt-builder', toast); }

  render(container) {
    this.container = container;
    const defaultPayload = JSON.stringify({ sub: '1234567890', name: 'John Doe', iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 3600 }, null, 2);
    container.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem">
        <div style="display:flex;flex-direction:column;gap:1rem">
          <div class="tool-panel glass-panel" style="padding:1.5rem">
            <h3>Header</h3>
            <textarea id="jb-header" class="form-control" style="min-height:100px;font-family:'Fira Code',monospace">${JSON.stringify({alg:'HS256',typ:'JWT'},null,2)}</textarea>
          </div>
          <div class="tool-panel glass-panel" style="padding:1.5rem">
            <h3>Payload</h3>
            <textarea id="jb-payload" class="form-control" style="min-height:180px;font-family:'Fira Code',monospace">${defaultPayload}</textarea>
            <div style="margin-top:0.75rem;display:flex;gap:0.5rem;flex-wrap:wrap">
              <button class="btn btn-sm" id="jb-add-iat">+ iat (now)</button>
              <button class="btn btn-sm" id="jb-add-exp">+ exp (+1h)</button>
              <button class="btn btn-sm" id="jb-add-nbf">+ nbf (now)</button>
            </div>
          </div>
          <div class="tool-panel glass-panel" style="padding:1.5rem">
            <h3>Secret</h3>
            <input type="text" id="jb-secret" class="form-control" value="your-256-bit-secret" style="font-family:'Fira Code',monospace">
            <p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.5rem;margin-bottom:0">Algorithm: HMAC-SHA256 (HS256)</p>
          </div>
          <button class="btn btn-primary" id="jb-build">Build JWT</button>
        </div>
        <div class="tool-panel glass-panel" style="padding:1.5rem">
          <h3>Generated Token</h3>
          <div id="jb-output" style="font-family:'Fira Code',monospace;font-size:0.8rem;word-break:break-all;min-height:80px;padding:1rem;background:var(--bg-tertiary);border-radius:8px;margin-bottom:1rem;line-height:1.6"></div>
          <div id="jb-parts" style="font-size:0.8rem;margin-bottom:1rem"></div>
          <button class="btn" id="jb-copy">Copy Token</button>
        </div>
      </div>`;

    document.getElementById('jb-build').addEventListener('click', () => this.build());
    document.getElementById('jb-copy').addEventListener('click', () => this.copy());
    document.getElementById('jb-add-iat').addEventListener('click', () => this.addClaim('iat', Math.floor(Date.now()/1000)));
    document.getElementById('jb-add-exp').addEventListener('click', () => this.addClaim('exp', Math.floor(Date.now()/1000) + 3600));
    document.getElementById('jb-add-nbf').addEventListener('click', () => this.addClaim('nbf', Math.floor(Date.now()/1000)));
    this.build();
  }

  addClaim(key, val) {
    try {
      const p = JSON.parse(document.getElementById('jb-payload').value);
      p[key] = val;
      document.getElementById('jb-payload').value = JSON.stringify(p, null, 2);
      this.build();
    } catch { this.toastSystem.error('Invalid payload JSON'); }
  }

  async build() {
    try {
      const header = JSON.parse(document.getElementById('jb-header').value);
      const payload = JSON.parse(document.getElementById('jb-payload').value);
      const secret = document.getElementById('jb-secret').value;
      const token = await buildJWT(header, payload, secret);
      const [h, p, s] = token.split('.');
      document.getElementById('jb-output').innerHTML =
        `<span style="color:#f59e0b">${h}</span>.<span style="color:#10b981">${p}</span>.<span style="color:#3b82f6">${s}</span>`;
      document.getElementById('jb-parts').innerHTML = `
        <div style="margin-bottom:0.4rem"><span style="color:#f59e0b">■</span> Header</div>
        <div style="margin-bottom:0.4rem"><span style="color:#10b981">■</span> Payload</div>
        <div><span style="color:#3b82f6">■</span> Signature</div>`;
      this._token = token;
    } catch (e) {
      this.toastSystem.error('Invalid JSON: ' + e.message);
    }
  }

  async copy() {
    if (!this._token) return;
    try { await navigator.clipboard.writeText(this._token); this.toastSystem.success('Token copied!'); }
    catch { this.toastSystem.error('Copy failed'); }
  }
}
