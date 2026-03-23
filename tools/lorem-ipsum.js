import { BaseTool } from './base-tool.js';

const WORDS = ['lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim','ad','minim','veniam','quis','nostrud','exercitation','ullamco','laboris','nisi','aliquip','ex','ea','commodo','consequat','duis','aute','irure','in','reprehenderit','voluptate','velit','esse','cillum','eu','fugiat','nulla','pariatur','excepteur','sint','occaecat','cupidatat','non','proident','sunt','culpa','qui','officia','deserunt','mollit','anim','id','est','laborum'];

function sentence(wordCount = 8) {
  const words = Array.from({ length: wordCount }, () => WORDS[Math.floor(Math.random() * WORDS.length)]);
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(' ') + '.';
}

function paragraph(sentenceCount = 5) {
  return Array.from({ length: sentenceCount }, () => sentence(6 + Math.floor(Math.random() * 6))).join(' ');
}

export class LoremIpsum extends BaseTool {
  constructor(toast) { super('lorem-ipsum', toast); }

  render(container) {
    this.container = container;
    container.innerHTML = `
      <div class="tool-panel glass-panel" style="padding:1.5rem;margin-bottom:1rem">
        <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-end">
          <div class="form-group" style="margin:0;flex:1;min-width:120px">
            <label class="form-label">Type</label>
            <select id="lorem-type" class="form-control">
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </select>
          </div>
          <div class="form-group" style="margin:0;flex:1;min-width:100px">
            <label class="form-label">Count</label>
            <input type="number" id="lorem-count" class="form-control" value="3" min="1" max="100">
          </div>
          <button class="btn btn-primary" id="lorem-generate">Generate</button>
        </div>
      </div>
      <div class="tool-panel glass-panel" style="padding:1.5rem">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
          <h3 style="margin:0">Output</h3>
          <button class="btn btn-sm" id="lorem-copy">Copy</button>
        </div>
        <textarea id="lorem-output" class="form-control tool-textarea" readonly placeholder="Generated text will appear here…"></textarea>
      </div>`;

    document.getElementById('lorem-generate').addEventListener('click', () => this.generate());
    document.getElementById('lorem-copy').addEventListener('click', () => this.copy());
    this.generate();
  }

  generate() {
    const type = document.getElementById('lorem-type').value;
    const count = Math.max(1, parseInt(document.getElementById('lorem-count').value) || 3);
    let result = '';
    if (type === 'paragraphs') result = Array.from({ length: count }, () => paragraph()).join('\n\n');
    else if (type === 'sentences') result = Array.from({ length: count }, () => sentence()).join(' ');
    else result = Array.from({ length: count }, () => WORDS[Math.floor(Math.random() * WORDS.length)]).join(' ');
    document.getElementById('lorem-output').value = result;
  }

  async copy() {
    const val = document.getElementById('lorem-output').value;
    if (!val) return;
    try { await navigator.clipboard.writeText(val); this.toastSystem.success('Copied!'); }
    catch { this.toastSystem.error('Copy failed'); }
  }
}
