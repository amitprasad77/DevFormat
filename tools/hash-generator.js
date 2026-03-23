// Hash Generator Tool
import { BaseTool } from './base-tool.js';

export class HashGenerator extends BaseTool {
  constructor(toastSystem) {
    super('hash-generator', toastSystem);
  }

  getInputPlaceholder() {
    return 'Enter text to hash...';
  }

  async process() {
    const input = this.inputElement.value;
    if (!input) { this.toastSystem.warning('Please enter some text'); return; }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);

      const [sha256, sha1, sha512] = await Promise.all([
        crypto.subtle.digest('SHA-256', data),
        crypto.subtle.digest('SHA-1', data),
        crypto.subtle.digest('SHA-512', data),
      ]);

      const toHex = (buf) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');

      this.outputElement.value =
`SHA-256:
${toHex(sha256)}

SHA-1:
${toHex(sha1)}

SHA-512:
${toHex(sha512)}`;

      this.toastSystem.success('Hashes generated!');
    } catch (error) {
      this.toastSystem.error('Failed to generate hashes: ' + error.message);
    }
  }

  getTemplate() {
    return `
      <div class="tool-layout">
        <div class="tool-panel">
          <h3>Input</h3>
          <textarea class="form-control tool-textarea" id="${this.toolId}-input" placeholder="${this.getInputPlaceholder()}"></textarea>
        </div>
        <div class="tool-panel">
          <h3>Output</h3>
          <textarea class="form-control tool-textarea" id="${this.toolId}-output" placeholder="Hashes will appear here..." readonly></textarea>
        </div>
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" id="${this.toolId}-process">Generate Hashes</button>
        <button class="btn" id="${this.toolId}-copy">Copy Output</button>
        <button class="btn" id="${this.toolId}-clear">Clear</button>
      </div>
    `;
  }
}
