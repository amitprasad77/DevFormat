import { BaseTool } from './base-tool.js';

export class WordFrequency extends BaseTool {
  constructor(toast) { super('word-freq', toast); }

  render(container) {
    this.container = container;
    container.innerHTML = `
      <div class="tool-layout">
        <div class="tool-panel glass-panel">
          <h3>Input Text</h3>
          <textarea id="wf-input" class="form-control tool-textarea" placeholder="Paste your text here…"></textarea>
          <div style="margin-top:1rem;display:flex;gap:1rem;flex-wrap:wrap;align-items:center">
            <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-size:0.9rem">
              <input type="checkbox" id="wf-case" style="width:16px;height:16px"> Case-sensitive
            </label>
            <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-size:0.9rem">
              <input type="checkbox" id="wf-stop" checked style="width:16px;height:16px"> Ignore stop words
            </label>
            <button class="btn btn-primary" id="wf-analyze">Analyze</button>
          </div>
        </div>
        <div class="tool-panel glass-panel">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
            <h3 style="margin:0">Word Frequency</h3>
            <span id="wf-stats" style="font-size:0.85rem;color:var(--text-muted)"></span>
          </div>
          <div id="wf-results" style="overflow-y:auto;max-height:420px"></div>
        </div>
      </div>`;

    document.getElementById('wf-analyze').addEventListener('click', () => this.analyze());
    document.getElementById('wf-input').addEventListener('input', () => this.analyze());
  }

  analyze() {
    const text = document.getElementById('wf-input').value;
    const caseSensitive = document.getElementById('wf-case').checked;
    const ignoreStop = document.getElementById('wf-stop').checked;
    const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','was','are','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','this','that','these','those','i','you','he','she','it','we','they','me','him','her','us','them','my','your','his','its','our','their','what','which','who','when','where','why','how','all','each','every','both','few','more','most','other','some','such','no','not','only','same','so','than','too','very','just','as','if','then','there','here']);

    if (!text.trim()) { document.getElementById('wf-results').innerHTML = ''; return; }

    const words = (caseSensitive ? text : text.toLowerCase())
      .replace(/[^a-zA-Z0-9'\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1 && (!ignoreStop || !stopWords.has(w.toLowerCase())));

    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    const max = sorted[0]?.[1] || 1;

    document.getElementById('wf-stats').textContent = `${words.length} words · ${sorted.length} unique`;
    document.getElementById('wf-results').innerHTML = sorted.slice(0, 100).map(([word, count]) => `
      <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem">
        <span style="width:120px;font-family:'Fira Code',monospace;font-size:0.85rem;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${word}</span>
        <div style="flex:1;background:var(--bg-tertiary);border-radius:4px;height:8px;overflow:hidden">
          <div style="width:${(count/max*100).toFixed(1)}%;background:var(--accent-primary);height:100%;border-radius:4px;transition:width 0.3s"></div>
        </div>
        <span style="width:32px;text-align:right;font-size:0.85rem;color:var(--text-muted)">${count}</span>
      </div>`).join('');
  }
}
