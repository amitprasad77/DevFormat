import { BaseTool } from './base-tool.js';

// Minimal Markdown → HTML parser (no deps)
function mdToHtml(md) {
  let html = md
    // Escape HTML entities first
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // Fenced code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><code class="language-${lang}">${code.trimEnd()}</code></pre>`)
    // Headings
    .replace(/^###### (.+)$/gm, '<h6>$1</h6>')
    .replace(/^##### (.+)$/gm, '<h5>$1</h5>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Blockquotes
    .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Images before links
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Unordered lists
    .replace(/^[\*\-] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Paragraphs (lines not already wrapped)
    .replace(/^(?!<[a-z]|$)(.+)$/gm, '<p>$1</p>')
    // Clean up extra newlines
    .replace(/\n{2,}/g, '\n');
  return html;
}

const EXPORT_STYLE = `body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.7;color:#1e293b}h1,h2,h3,h4,h5,h6{font-weight:700;line-height:1.3;margin:1.5em 0 0.5em}h1{font-size:2em;border-bottom:2px solid #e2e8f0;padding-bottom:0.3em}h2{font-size:1.5em;border-bottom:1px solid #e2e8f0;padding-bottom:0.2em}code{background:#f1f5f9;padding:0.2em 0.4em;border-radius:4px;font-family:'Fira Code',monospace;font-size:0.875em}pre{background:#f1f5f9;padding:1em;border-radius:8px;overflow-x:auto}pre code{background:none;padding:0}blockquote{border-left:4px solid #3b82f6;margin:0;padding:0.5em 1em;color:#64748b;background:#f8fafc}a{color:#3b82f6}img{max-width:100%}table{border-collapse:collapse;width:100%}td,th{border:1px solid #e2e8f0;padding:0.5em 0.75em}hr{border:none;border-top:1px solid #e2e8f0;margin:2em 0}`;

export class MarkdownExport extends BaseTool {
  constructor(toast) { super('md-export', toast); }

  render(container) {
    this.container = container;
    container.innerHTML = `
      <div class="tool-layout">
        <div class="tool-panel glass-panel">
          <h3>Markdown Input</h3>
          <textarea id="me-input" class="form-control tool-textarea" placeholder="# Hello World\n\nWrite your **Markdown** here…"></textarea>
        </div>
        <div class="tool-panel glass-panel">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
            <h3 style="margin:0">Preview</h3>
            <div style="display:flex;gap:0.5rem">
              <button class="btn btn-sm" id="me-raw">HTML Source</button>
              <button class="btn btn-sm btn-primary" id="me-preview-btn">Preview</button>
            </div>
          </div>
          <div id="me-preview" class="markdown-preview" style="min-height:400px;overflow-y:auto"></div>
          <textarea id="me-html-out" class="form-control tool-textarea" style="display:none;min-height:400px" readonly></textarea>
        </div>
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" id="me-export-html">⬇ Download HTML</button>
        <button class="btn" id="me-copy-html">Copy HTML</button>
        <button class="btn" id="me-clear">Clear</button>
      </div>`;

    let showRaw = false;
    const input = document.getElementById('me-input');
    input.addEventListener('input', () => this.convert(showRaw));

    document.getElementById('me-raw').addEventListener('click', () => {
      showRaw = true;
      document.getElementById('me-preview').style.display = 'none';
      document.getElementById('me-html-out').style.display = 'block';
      this.convert(true);
    });
    document.getElementById('me-preview-btn').addEventListener('click', () => {
      showRaw = false;
      document.getElementById('me-preview').style.display = 'block';
      document.getElementById('me-html-out').style.display = 'none';
      this.convert(false);
    });
    document.getElementById('me-export-html').addEventListener('click', () => this.exportHTML());
    document.getElementById('me-copy-html').addEventListener('click', () => this.copyHTML());
    document.getElementById('me-clear').addEventListener('click', () => {
      input.value = '';
      document.getElementById('me-preview').innerHTML = '';
      document.getElementById('me-html-out').value = '';
    });
  }

  convert(raw) {
    const md = document.getElementById('me-input').value;
    const html = mdToHtml(md);
    if (raw) {
      document.getElementById('me-html-out').value = html;
    } else {
      document.getElementById('me-preview').innerHTML = html;
    }
    this._html = html;
  }

  exportHTML() {
    const md = document.getElementById('me-input').value;
    if (!md.trim()) { this.toastSystem.warning('Nothing to export'); return; }
    const title = md.match(/^# (.+)$/m)?.[1] || 'Document';
    const full = `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>${title}</title>\n<style>${EXPORT_STYLE}</style>\n</head>\n<body>\n${mdToHtml(md)}\n</body>\n</html>`;
    const blob = new Blob([full], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${title.toLowerCase().replace(/\s+/g,'-')}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
    this.toastSystem.success('HTML file downloaded');
  }

  async copyHTML() {
    if (!this._html) { this.toastSystem.warning('Nothing to copy'); return; }
    try { await navigator.clipboard.writeText(this._html); this.toastSystem.success('HTML copied!'); }
    catch { this.toastSystem.error('Copy failed'); }
  }
}
