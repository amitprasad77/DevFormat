// Image to Base64 Converter
import { BaseTool } from './base-tool.js';

export class ImageToBase64 extends BaseTool {
  constructor(toastSystem) { super('img-base64', toastSystem); }

  process() { this.toastSystem.info('Drop an image or click "Choose File"'); }

  handleFile(file) {
    if (!file.type.startsWith('image/')) { this.toastSystem.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { this.toastSystem.error('Image too large (max 5MB)'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = e.target.result;
      this.outputElement.value = b64;
      document.getElementById(`${this.toolId}-preview`).src = b64;
      document.getElementById(`${this.toolId}-preview`).style.display = 'block';
      document.getElementById(`${this.toolId}-info`).textContent =
        `${file.name} · ${file.type} · ${(file.size/1024).toFixed(1)} KB · Base64: ${(b64.length/1024).toFixed(1)} KB`;
      this.toastSystem.success('Image converted!');
    };
    reader.readAsDataURL(file);
  }

  getTemplate() {
    return `
      <div class="tool-layout">
        <div class="tool-panel">
          <h3>Image Input</h3>
          <div id="${this.toolId}-drop" style="border:2px dashed var(--glass-border);border-radius:var(--border-radius);padding:2rem;text-align:center;cursor:pointer;transition:border-color 0.2s;min-height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem">
            <div style="font-size:3rem">🖼️</div>
            <p style="color:var(--text-secondary);margin:0">Drag & drop an image here</p>
            <label class="btn btn-primary" style="cursor:pointer">
              Choose File
              <input type="file" id="${this.toolId}-file" accept="image/*" style="display:none">
            </label>
          </div>
          <p id="${this.toolId}-info" style="font-size:0.8rem;color:var(--text-muted);margin-top:0.5rem"></p>
          <img id="${this.toolId}-preview" style="display:none;max-width:100%;max-height:200px;margin-top:1rem;border-radius:var(--border-radius);border:1px solid var(--glass-border)">
        </div>
        <div class="tool-panel">
          <h3>Base64 Output</h3>
          <textarea class="form-control tool-textarea" id="${this.toolId}-output" readonly placeholder="Base64 data URI will appear here..."></textarea>
        </div>
      </div>
      <div class="tool-actions">
        <button class="btn" id="${this.toolId}-copy">Copy Base64</button>
        <button class="btn" id="${this.toolId}-clear">Clear</button>
      </div>`;
  }

  setupElements() {
    this.inputElement = { value: '' };
    this.outputElement = document.getElementById(`${this.toolId}-output`);
  }

  setupEventListeners() {
    const drop = document.getElementById(`${this.toolId}-drop`);
    const fileInput = document.getElementById(`${this.toolId}-file`);

    fileInput.addEventListener('change', e => { if (e.target.files[0]) this.handleFile(e.target.files[0]); });

    drop.addEventListener('dragover', e => { e.preventDefault(); drop.style.borderColor = 'var(--accent-primary)'; });
    drop.addEventListener('dragleave', () => { drop.style.borderColor = 'var(--glass-border)'; });
    drop.addEventListener('drop', e => {
      e.preventDefault();
      drop.style.borderColor = 'var(--glass-border)';
      if (e.dataTransfer.files[0]) this.handleFile(e.dataTransfer.files[0]);
    });

    document.getElementById(`${this.toolId}-copy`).addEventListener('click', () => this.copyOutput());
    document.getElementById(`${this.toolId}-clear`).addEventListener('click', () => {
      this.outputElement.value = '';
      document.getElementById(`${this.toolId}-preview`).style.display = 'none';
      document.getElementById(`${this.toolId}-info`).textContent = '';
      fileInput.value = '';
    });
  }
}
