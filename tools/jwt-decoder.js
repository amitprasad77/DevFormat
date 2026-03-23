// JWT Decoder Tool
import { BaseTool } from './base-tool.js';

export class JWTDecoder extends BaseTool {
  constructor(toastSystem) {
    super('jwt-decoder', toastSystem);
  }

  getInputPlaceholder() {
    return 'Paste your JWT token here (eyJ...)';
  }

  process() {
    const input = this.inputElement.value.trim();
    if (!input) { this.toastSystem.warning('Please enter a JWT token'); return; }

    try {
      const parts = input.split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT: must have 3 parts separated by dots');

      const decode = (str) => {
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4);
        return JSON.parse(atob(padded));
      };

      const header = decode(parts[0]);
      const payload = decode(parts[1]);

      // Check expiry
      let expiryInfo = '';
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        const now = new Date();
        const expired = expDate < now;
        expiryInfo = `\n\n// ⏰ Token ${expired ? '❌ EXPIRED' : '✅ VALID'} — Expires: ${expDate.toLocaleString()}`;
      }

      const result = `// ── HEADER ──────────────────────────
${JSON.stringify(header, null, 2)}

// ── PAYLOAD ─────────────────────────
${JSON.stringify(payload, null, 2)}

// ── SIGNATURE ───────────────────────
// ${parts[2]}
// (Signature cannot be verified client-side)${expiryInfo}`;

      this.outputElement.value = result;
      this.toastSystem.success('JWT decoded!');
    } catch (error) {
      this.outputElement.value = '';
      this.toastSystem.error(`Invalid JWT: ${error.message}`);
    }
  }
}
