// Text Tools - Word count, case converter, Lorem Ipsum
import { BaseTool } from './base-tool.js';

export class TextTools extends BaseTool {
  constructor(toastSystem) {
    super('text-tools', toastSystem);
  }

  getInputPlaceholder() {
    return 'Type or paste your text here...';
  }

  updateStats() {
    const text = this.inputElement.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const lines = text ? text.split('\n').length : 0;
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0;
    const readTime = Math.max(1, Math.ceil(words / 200));

    document.getElementById(`${this.toolId}-stats`).innerHTML =
      `<span>Words: <strong>${words}</strong></span>
       <span>Chars: <strong>${chars}</strong></span>
       <span>Chars (no spaces): <strong>${charsNoSpace}</strong></span>
       <span>Lines: <strong>${lines}</strong></span>
       <span>Sentences: <strong>${sentences}</strong></span>
       <span>Read time: <strong>~${readTime} min</strong></span>`;
  }

  convert(type) {
    const input = this.inputElement.value;
    if (!input) { this.toastSystem.warning('Enter some text first'); return; }
    const transforms = {
      upper: s => s.toUpperCase(),
      lower: s => s.toLowerCase(),
      title: s => s.replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase()),
      sentence: s => s.replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()),
      camel: s => s.replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => i === 0 ? w.toLowerCase() : w.toUpperCase()).replace(/\s+/g, ''),
      snake: s => s.trim().toLowerCase().replace(/\s+/g, '_'),
      kebab: s => s.trim().toLowerCase().replace(/\s+/g, '-'),
      reverse: s => s.split('').reverse().join(''),
      slug: s => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    };
    this.outputElement.value = (transforms[type] || (s => s))(input);
    this.toastSystem.success('Converted!');
  }

  lorem() {
    const count = parseInt(document.getElementById(`${this.toolId}-lorem-count`).value) || 1;
    const type = document.getElementById(`${this.toolId}-lorem-type`).value;
    const base = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
    const sentences = base.split('. ');
    let result = '';
    if (type === 'words') {
      result = base.split(' ').slice(0, count).join(' ');
    } else if (type === 'sentences') {
      result = Array.from({length: count}, (_, i) => sentences[i % sentences.length]).join(' ');
    } else {
      result = Array.from({length: count}, (_, i) => sentences.slice(i % 3, (i % 3) + 3).join('. ') + '.').join('\n\n');
    }
    this.outputElement.value = result;
    this.toastSystem.success('Lorem ipsum generated!');
  }

  process() { this.convert('upper'); }

  getTemplate() {
    return `
      <div class="tool-layout">
        <div class="tool-panel">
          <h3>Input</h3>
          <textarea class="form-control tool-textarea" id="${this.toolId}-input" placeholder="${this.getInputPlaceholder()}"></textarea>
          <div id="${this.toolId}-stats" style="display:flex;flex-wrap:wrap;gap:1rem;margin-top:0.75rem;font-size:0.8rem;color:var(--text-secondary)"></div>
        </div>
        <div class="tool-panel">
          <h3>Output</h3>
          <textarea class="form-control tool-textarea" id="${this.toolId}-output" readonly placeholder="Result will appear here..."></textarea>
        </div>
      </div>
      <div style="margin:1rem 0">
        <p class="form-label" style="margin-bottom:0.5rem">Case Conversion</p>
        <div class="tool-actions" style="justify-content:flex-start">
          ${['upper:UPPER','lower:lower','title:Title Case','sentence:Sentence case','camel:camelCase','snake:snake_case','kebab:kebab-case','reverse:Reverse','slug:slug'].map(s => {
            const [k,v] = s.split(':');
            return `<button class="btn" id="${this.toolId}-${k}">${v}</button>`;
          }).join('')}
        </div>
      </div>
      <div style="margin:1rem 0;padding:1rem;background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--border-radius)">
        <p class="form-label" style="margin-bottom:0.75rem">Lorem Ipsum Generator</p>
        <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-end">
          <div>
            <label class="form-label" style="font-size:0.8rem">Count</label>
            <input type="number" class="form-control" id="${this.toolId}-lorem-count" value="3" min="1" max="100" style="width:80px">
          </div>
          <div>
            <label class="form-label" style="font-size:0.8rem">Type</label>
            <select class="form-control" id="${this.toolId}-lorem-type">
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </select>
          </div>
          <button class="btn btn-primary" id="${this.toolId}-lorem-btn">Generate</button>
        </div>
      </div>
      <div class="tool-actions">
        <button class="btn" id="${this.toolId}-copy">Copy Output</button>
        <button class="btn" id="${this.toolId}-clear">Clear</button>
      </div>`;
  }

  setupEventListeners() {
    ['upper','lower','title','sentence','camel','snake','kebab','reverse','slug'].forEach(type => {
      document.getElementById(`${this.toolId}-${type}`).addEventListener('click', () => this.convert(type));
    });
    document.getElementById(`${this.toolId}-lorem-btn`).addEventListener('click', () => this.lorem());
    document.getElementById(`${this.toolId}-copy`).addEventListener('click', () => this.copyOutput());
    document.getElementById(`${this.toolId}-clear`).addEventListener('click', () => this.clear());
    this.inputElement.addEventListener('input', () => { this.updateStats(); this.saveState(); });
    this.updateStats();
  }
}
