import { BaseTool } from './base-tool.js';

const MIME_DB = [
  // Text
  ['text/html',['html','htm'],'Web page'],
  ['text/css',['css'],'CSS stylesheet'],
  ['text/javascript',['js','mjs'],'JavaScript'],
  ['text/plain',['txt','log','md'],'Plain text'],
  ['text/csv',['csv'],'CSV spreadsheet'],
  ['text/xml',['xml'],'XML document'],
  ['text/markdown',['md','markdown'],'Markdown'],
  // Application
  ['application/json',['json'],'JSON data'],
  ['application/xml',['xml'],'XML data'],
  ['application/pdf',['pdf'],'PDF document'],
  ['application/zip',['zip'],'ZIP archive'],
  ['application/gzip',['gz','gzip'],'GZIP archive'],
  ['application/x-tar',['tar'],'TAR archive'],
  ['application/x-7z-compressed',['7z'],'7-Zip archive'],
  ['application/x-rar-compressed',['rar'],'RAR archive'],
  ['application/vnd.ms-excel',['xls'],'Excel (legacy)'],
  ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',['xlsx'],'Excel spreadsheet'],
  ['application/vnd.ms-powerpoint',['ppt'],'PowerPoint (legacy)'],
  ['application/vnd.openxmlformats-officedocument.presentationml.presentation',['pptx'],'PowerPoint'],
  ['application/msword',['doc'],'Word (legacy)'],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document',['docx'],'Word document'],
  ['application/octet-stream',['bin','exe','dll'],'Binary data'],
  ['application/wasm',['wasm'],'WebAssembly'],
  ['application/graphql',['graphql','gql'],'GraphQL'],
  ['application/x-www-form-urlencoded',[],'HTML form data'],
  ['multipart/form-data',[],'Multipart form data'],
  ['application/x-sh',['sh'],'Shell script'],
  ['application/sql',['sql'],'SQL script'],
  ['application/yaml',['yaml','yml'],'YAML data'],
  ['application/toml',['toml'],'TOML config'],
  // Image
  ['image/jpeg',['jpg','jpeg'],'JPEG image'],
  ['image/png',['png'],'PNG image'],
  ['image/gif',['gif'],'GIF image'],
  ['image/webp',['webp'],'WebP image'],
  ['image/svg+xml',['svg'],'SVG vector'],
  ['image/avif',['avif'],'AVIF image'],
  ['image/bmp',['bmp'],'BMP image'],
  ['image/tiff',['tiff','tif'],'TIFF image'],
  ['image/x-icon',['ico'],'Icon file'],
  // Audio
  ['audio/mpeg',['mp3'],'MP3 audio'],
  ['audio/ogg',['ogg'],'OGG audio'],
  ['audio/wav',['wav'],'WAV audio'],
  ['audio/webm',['weba'],'WebM audio'],
  ['audio/aac',['aac'],'AAC audio'],
  ['audio/flac',['flac'],'FLAC audio'],
  // Video
  ['video/mp4',['mp4'],'MP4 video'],
  ['video/webm',['webm'],'WebM video'],
  ['video/ogg',['ogv'],'OGG video'],
  ['video/quicktime',['mov'],'QuickTime video'],
  ['video/x-msvideo',['avi'],'AVI video'],
  ['video/x-matroska',['mkv'],'MKV video'],
  // Font
  ['font/woff',['woff'],'WOFF font'],
  ['font/woff2',['woff2'],'WOFF2 font'],
  ['font/ttf',['ttf'],'TrueType font'],
  ['font/otf',['otf'],'OpenType font'],
];

export class MIMELookup extends BaseTool {
  constructor(toast) { super('mime-lookup', toast); }

  render(container) {
    this.container = container;
    container.innerHTML = `
      <div class="tool-panel glass-panel" style="padding:1.5rem;margin-bottom:1rem">
        <input type="search" id="ml-search" class="form-control" placeholder="Search by MIME type, extension, or description… (e.g. json, image, mp4)" style="font-family:var(--font-family)">
      </div>
      <div id="ml-result" style="margin-bottom:1.5rem"></div>
      <div class="tool-panel glass-panel" style="padding:1rem;overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:0.85rem">
          <thead>
            <tr style="color:var(--text-muted);text-align:left">
              <th style="padding:0.5rem 0.75rem">MIME Type</th>
              <th style="padding:0.5rem 0.75rem">Extensions</th>
              <th style="padding:0.5rem 0.75rem">Description</th>
            </tr>
          </thead>
          <tbody id="ml-body"></tbody>
        </table>
      </div>`;

    document.getElementById('ml-search').addEventListener('input', e => this.renderTable(e.target.value));
    this.renderTable('');
  }

  renderTable(q) {
    const filtered = q
      ? MIME_DB.filter(([mime, exts, desc]) =>
          mime.includes(q.toLowerCase()) ||
          exts.some(e => e.includes(q.toLowerCase())) ||
          desc.toLowerCase().includes(q.toLowerCase()))
      : MIME_DB;

    document.getElementById('ml-body').innerHTML = filtered.map(([mime, exts, desc]) => `
      <tr style="border-top:1px solid var(--glass-border);cursor:pointer" onclick="navigator.clipboard.writeText('${mime}')">
        <td style="padding:0.6rem 0.75rem;font-family:'Fira Code',monospace;color:var(--accent-primary);font-size:0.8rem">${mime}</td>
        <td style="padding:0.6rem 0.75rem;font-family:'Fira Code',monospace;color:var(--text-muted);font-size:0.8rem">${exts.map(e => `.${e}`).join(', ') || '—'}</td>
        <td style="padding:0.6rem 0.75rem;color:var(--text-secondary)">${desc}</td>
      </tr>`).join('') || '<tr><td colspan="3" style="padding:2rem;text-align:center;color:var(--text-muted)">No results</td></tr>';
  }
}
