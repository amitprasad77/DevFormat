import { BaseTool } from './base-tool.js';

function htmlToMd(html) {
  // Use a temporary DOM element for parsing
  const div = document.createElement('div');
  div.innerHTML = html;
  return nodeToMd(div).trim();
}

function nodeToMd(node, opts = {}) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent.replace(/\n+/g, ' ');
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const tag = node.tagName.toLowerCase();
  const children = () => Array.from(node.childNodes).map(n => nodeToMd(n, opts)).join('');

  switch (tag) {
    case 'h1': return `\n# ${children().trim()}\n`;
    case 'h2': return `\n## ${children().trim()}\n`;
    case 'h3': return `\n### ${children().trim()}\n`;
    case 'h4': return `\n#### ${children().trim()}\n`;
    case 'h5': return `\n##### ${children().trim()}\n`;
    case 'h6': return `\n###### ${children().trim()}\n`;
    case 'p':  return `\n${children().trim()}\n`;
    case 'br': return '  \n';
    case 'hr': return '\n---\n';
    case 'strong': case 'b': return `**${children()}**`;
    case 'em': case 'i': return `_${children()}_`;
    case 's': case 'del': return `~~${children()}~~`;
    case 'code': return opts.inPre ? children() : `\`${children()}\``;
    case 'pre': {
      const lang = node.querySelector('code')?.className?.replace('language-','') || '';
      const code = node.textContent;
      return `\n\`\`\`${lang}\n${code}\n\`\`\`\n`;
    }
    case 'blockquote': return children().split('\n').map(l => `> ${l}`).join('\n') + '\n';
    case 'a': {
      const href = node.getAttribute('href') || '';
      const title = node.getAttribute('title') ? ` "${node.getAttribute('title')}"` : '';
      return `[${children()}](${href}${title})`;
    }
    case 'img': {
      const src = node.getAttribute('src') || '';
      const alt = node.getAttribute('alt') || '';
      return `![${alt}](${src})`;
    }
    case 'ul': return '\n' + Array.from(node.children).map(li => `- ${nodeToMd(li).trim()}`).join('\n') + '\n';
    case 'ol': return '\n' + Array.from(node.children).map((li, i) => `${i+1}. ${nodeToMd(li).trim()}`).join('\n') + '\n';
    case 'li': return children();
    case 'table': return tableToMd(node);
    case 'thead': case 'tbody': case 'tfoot': return children();
    case 'tr': case 'td': case 'th': return children();
    case 'div': case 'section': case 'article': case 'main': case 'header': case 'footer': case 'nav': case 'aside':
      return `\n${children().trim()}\n`;
    case 'span': return children();
    case 'script': case 'style': return '';
    default: return children();
  }
}

function tableToMd(table) {
  const rows = Array.from(table.querySelectorAll('tr'));
  if (!rows.length) return '';
  const cells = rows.map(r => Array.from(r.querySelectorAll('td,th')).map(c => c.textContent.trim().replace(/\|/g,'\\|')));
  const cols = Math.max(...cells.map(r => r.length));
  const pad = row => row.map(c => c || '').concat(Array(cols - row.length).fill(''));
  const header = pad(cells[0]);
  const sep = header.map(() => '---');
  const body = cells.slice(1).map(pad);
  return '\n' + [header, sep, ...body].map(r => `| ${r.join(' | ')} |`).join('\n') + '\n';
}

export class HTMLToMarkdown extends BaseTool {
  constructor(toast) { super('html-md', toast); }

  render(container) {
    this.container = container;
    container.innerHTML = `
      <div class="tool-layout">
        <div class="tool-panel glass-panel">
          <h3>HTML Input</h3>
          <textarea id="hm-input" class="form-control tool-textarea" placeholder="<h1>Hello</h1>\n<p>This is <strong>bold</strong> text.</p>"></textarea>
        </div>
        <div class="tool-panel glass-panel">
          <h3>Markdown Output</h3>
          <textarea id="hm-output" class="form-control tool-textarea" readonly placeholder="Markdown will appear here…"></textarea>
        </div>
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" id="hm-convert">Convert</button>
        <button class="btn" id="hm-copy">Copy Output</button>
        <button class="btn" id="hm-clear">Clear</button>
      </div>`;

    document.getElementById('hm-convert').addEventListener('click', () => this.convert());
    document.getElementById('hm-input').addEventListener('input', () => this.convert());
    document.getElementById('hm-copy').addEventListener('click', () => this.copy());
    document.getElementById('hm-clear').addEventListener('click', () => {
      document.getElementById('hm-input').value = '';
      document.getElementById('hm-output').value = '';
    });
  }

  convert() {
    const html = document.getElementById('hm-input').value.trim();
    if (!html) { document.getElementById('hm-output').value = ''; return; }
    try {
      const md = htmlToMd(html).replace(/\n{3,}/g, '\n\n');
      document.getElementById('hm-output').value = md;
    } catch (e) {
      this.toastSystem.error('Conversion failed: ' + e.message);
    }
  }

  async copy() {
    const val = document.getElementById('hm-output').value;
    if (!val) return;
    try { await navigator.clipboard.writeText(val); this.toastSystem.success('Copied!'); }
    catch { this.toastSystem.error('Copy failed'); }
  }
}
