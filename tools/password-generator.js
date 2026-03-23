// Password Generator Tool
import { BaseTool } from './base-tool.js';

export class PasswordGenerator extends BaseTool {
  constructor(toastSystem) {
    super('password-gen', toastSystem);
  }

  generate() {
    const length = parseInt(document.getElementById(`${this.toolId}-length`).value) || 16;
    const upper = document.getElementById(`${this.toolId}-upper`).checked;
    const lower = document.getElementById(`${this.toolId}-lower`).checked;
    const numbers = document.getElementById(`${this.toolId}-numbers`).checked;
    const symbols = document.getElementById(`${this.toolId}-symbols`).checked;
    const count = parseInt(document.getElementById(`${this.toolId}-count`).value) || 1;

    if (!upper && !lower && !numbers && !symbols) {
      this.toastSystem.warning('Select at least one character type');
      return;
    }

    let charset = '';
    if (upper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) charset += '0123456789';
    if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const passwords = Array.from({ length: count }, () => {
      const arr = new Uint32Array(length);
      crypto.getRandomValues(arr);
      return Array.from(arr).map(n => charset[n % charset.length]).join('');
    });

    this.outputElement.value = passwords.join('\n');
    this.updateStrength(passwords[0]);
    this.toastSystem.success(`${count} password${count > 1 ? 's' : ''} generated!`);
  }

  updateStrength(pwd) {
    let score = 0;
    if (pwd.length >= 12) score++;
    if (pwd.length >= 16) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#10b981'];
    const el = document.getElementById(`${this.toolId}-strength`);
    el.textContent = `Strength: ${labels[score] || 'Very Weak'}`;
    el.style.color = colors[score] || '#ef4444';
  }

  process() { this.generate(); }

  getTemplate() {
    const checkbox = (id, label, checked = true) =>
      `<label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer">
        <input type="checkbox" id="${this.toolId}-${id}" ${checked ? 'checked' : ''}> ${label}
      </label>`;

    return `
      <div class="tool-layout">
        <div class="tool-panel">
          <h3>Settings</h3>
          <div style="display:flex;flex-direction:column;gap:1rem">
            <div>
              <label class="form-label">Length: <strong id="${this.toolId}-len-display">16</strong></label>
              <input type="range" id="${this.toolId}-length" min="4" max="128" value="16" style="width:100%;accent-color:var(--accent-primary)"
                oninput="document.getElementById('${this.toolId}-len-display').textContent=this.value">
            </div>
            <div>
              <label class="form-label">How many passwords</label>
              <input type="number" class="form-control" id="${this.toolId}-count" value="1" min="1" max="20" style="width:100px">
            </div>
            <div style="display:flex;flex-direction:column;gap:0.5rem">
              ${checkbox('upper','Uppercase (A-Z)')}
              ${checkbox('lower','Lowercase (a-z)')}
              ${checkbox('numbers','Numbers (0-9)')}
              ${checkbox('symbols','Symbols (!@#$...)')}
            </div>
            <div id="${this.toolId}-strength" style="font-weight:600;font-size:0.9rem"></div>
          </div>
        </div>
        <div class="tool-panel">
          <h3>Generated Passwords</h3>
          <textarea class="form-control tool-textarea" id="${this.toolId}-output" readonly placeholder="Click Generate..."></textarea>
        </div>
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" id="${this.toolId}-process">Generate</button>
        <button class="btn" id="${this.toolId}-copy">Copy</button>
        <button class="btn" id="${this.toolId}-clear">Clear</button>
      </div>`;
  }
}
