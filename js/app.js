// DevFormat Platform - Main Application Entry Point
import { Router } from '../components/router.js';
import { NavigationBar } from '../components/navigation-bar.js';
import { ToastSystem } from '../components/toast-system.js';
import { ThemeManager } from '../components/theme-manager.js';
import { SEOManager } from '../services/seo-manager.js';
import { JSONFormatter } from '../tools/json-formatter.js';
import { Base64Tool } from '../tools/base64-tool.js';
import { XMLFormatter } from '../tools/xml-formatter.js';
import { URLTool } from '../tools/url-tool.js';
import { JWTDecoder } from '../tools/jwt-decoder.js';
import { MarkdownPreview } from '../tools/markdown-preview.js';
import { HashGenerator } from '../tools/hash-generator.js';
import { RegexTester } from '../tools/regex-tester.js';
import { ColorConverter } from '../tools/color-converter.js';
import { DiffChecker } from '../tools/diff-checker.js';
import { TextTools } from '../tools/text-tools.js';
import { PasswordGenerator } from '../tools/password-generator.js';
import { CSSFormatter } from '../tools/css-formatter.js';
import { HTMLFormatter } from '../tools/html-formatter.js';
import { SQLFormatter } from '../tools/sql-formatter.js';
import { NumberBaseConverter } from '../tools/number-base-converter.js';
import { TimestampConverter } from '../tools/timestamp-converter.js';
import { HTMLEntity } from '../tools/html-entity.js';
import { UUIDGenerator } from '../tools/uuid-generator.js';
import { YAMLJSON } from '../tools/yaml-json.js';
import { JSONToCSV } from '../tools/json-to-csv.js';
import { ImageToBase64 } from '../tools/image-to-base64.js';
import { StringEscape } from '../tools/string-escape.js';
import { CronParser } from '../tools/cron-parser.js';
import { IPLookup } from '../tools/ip-lookup.js';
import { JSONPath } from '../tools/json-minifier.js';
import { LoremIpsum } from '../tools/lorem-ipsum.js';
import { ChmodCalculator } from '../tools/chmod-calculator.js';
import { ByteConverter } from '../tools/byte-converter.js';
import { CSSUnitConverter } from '../tools/css-unit-converter.js';
import { JSONSchemaValidator } from '../tools/json-schema-validator.js';
import { LineSorter } from '../tools/line-sorter.js';
import { QRCodeGenerator } from '../tools/qr-code.js';
import { TemperatureConverter } from '../tools/temperature-converter.js';
import { SlugGenerator } from '../tools/slug-generator.js';
import { WordFrequency } from '../tools/word-frequency.js';
import { HTTPStatus } from '../tools/http-status.js';
import { UnitConverter } from '../tools/unit-converter.js';
import { FakeData } from '../tools/fake-data.js';
import { ColorPalette } from '../tools/color-palette.js';
import { ASCIITable } from '../tools/ascii-table.js';
import { PercentageCalc } from '../tools/percentage-calc.js';
import { RomanNumeral } from '../tools/roman-numeral.js';
import { DuplicateRemover } from '../tools/duplicate-remover.js';
import { HTMLToMarkdown } from '../tools/html-to-markdown.js';
import { MIMELookup } from '../tools/mime-lookup.js';
import { JWTBuilder } from '../tools/jwt-builder.js';
import { BcryptSimulator } from '../tools/bcrypt-simulator.js';
import { AspectRatio } from '../tools/aspect-ratio.js';
import { ScientificCalc } from '../tools/scientific-calc.js';
import { MarkdownExport } from '../tools/markdown-export.js';

const TOOLS = {
  'json-formatter':   { title: 'JSON Formatter',        icon: '📄', desc: 'Format, validate, and minify JSON.',                       cls: JSONFormatter },
  'base64-encoder':   { title: 'Base64 Encoder',        icon: '🔐', desc: 'Encode and decode Base64 strings.',                        cls: Base64Tool },
  'xml-formatter':    { title: 'XML Formatter',         icon: '📋', desc: 'Format and validate XML documents.',                       cls: XMLFormatter },
  'url-encoder':      { title: 'URL Encoder',           icon: '🔗', desc: 'Encode and decode URL strings.',                           cls: URLTool },
  'jwt-decoder':      { title: 'JWT Decoder',           icon: '🔑', desc: 'Decode and inspect JWT tokens with expiry check.',         cls: JWTDecoder },
  'markdown-preview': { title: 'Markdown Preview',      icon: '📝', desc: 'Live Markdown to HTML preview.',                           cls: MarkdownPreview },
  'hash-generator':   { title: 'Hash Generator',        icon: '#️⃣', desc: 'Generate SHA-256, SHA-1, and SHA-512 hashes.',             cls: HashGenerator },
  'regex-tester':     { title: 'Regex Tester',          icon: '🔍', desc: 'Test and debug regular expressions live.',                 cls: RegexTester },
  'color-converter':  { title: 'Color Converter',       icon: '🎨', desc: 'Convert between HEX, RGB, and HSL.',                      cls: ColorConverter },
  'diff-checker':     { title: 'Diff Checker',          icon: '↔️', desc: 'Compare two text blocks and highlight differences.',       cls: DiffChecker },
  'text-tools':       { title: 'Text Tools',            icon: '✏️', desc: 'Word count, case converter, Lorem Ipsum generator.',       cls: TextTools },
  'password-gen':     { title: 'Password Generator',    icon: '🔒', desc: 'Generate secure random passwords.',                        cls: PasswordGenerator },
  'css-formatter':    { title: 'CSS Formatter',         icon: '🖌️', desc: 'Beautify and minify CSS stylesheets.',                     cls: CSSFormatter },
  'html-formatter':   { title: 'HTML Formatter',        icon: '🌐', desc: 'Beautify and minify HTML markup.',                         cls: HTMLFormatter },
  'sql-formatter':    { title: 'SQL Formatter',         icon: '🗄️', desc: 'Format and beautify SQL queries.',                         cls: SQLFormatter },
  'number-base':      { title: 'Number Base Converter', icon: '🔢', desc: 'Convert between Binary, Octal, Decimal, and Hex.',         cls: NumberBaseConverter },
  'timestamp':        { title: 'Timestamp Converter',   icon: '🕐', desc: 'Convert Unix timestamps to human-readable dates.',         cls: TimestampConverter },
  'html-entity':      { title: 'HTML Entities',         icon: '🔤', desc: 'Encode and decode HTML entities.',                         cls: HTMLEntity },
  'uuid-gen':         { title: 'UUID Generator',        icon: '🆔', desc: 'Generate cryptographically secure UUIDs v4.',              cls: UUIDGenerator },
  'yaml-json':        { title: 'YAML ↔ JSON',           icon: '📑', desc: 'Convert between YAML and JSON formats.',                   cls: YAMLJSON },
  'json-csv':         { title: 'JSON ↔ CSV',            icon: '📊', desc: 'Convert between JSON arrays and CSV format.',              cls: JSONToCSV },
  'img-base64':       { title: 'Image to Base64',       icon: '🖼️', desc: 'Convert images to Base64 data URIs.',                      cls: ImageToBase64 },
  'string-escape':    { title: 'String Escape',         icon: '🔀', desc: 'Escape/unescape JS, JSON, HTML, URL, and CSV strings.',    cls: StringEscape },
  'cron-parser':      { title: 'Cron Parser',           icon: '⏰', desc: 'Parse cron expressions and preview next run times.',       cls: CronParser },
  'ip-lookup':        { title: 'IP Lookup',             icon: '🌍', desc: 'Look up geolocation and ISP info for any IP address.',     cls: IPLookup },
  'json-path':        { title: 'JSON Path Query',       icon: '🔎', desc: 'Query JSON data using dot/bracket notation.',              cls: JSONPath },
  'lorem-ipsum':      { title: 'Lorem Ipsum',           icon: '📜', desc: 'Generate placeholder text by paragraphs, sentences, or words.', cls: LoremIpsum },
  'chmod':            { title: 'Chmod Calculator',      icon: '🛡️', desc: 'Calculate Unix file permissions with visual checkboxes.',    cls: ChmodCalculator },
  'byte-converter':   { title: 'Byte Converter',        icon: '💽', desc: 'Convert between bits, bytes, KB, MB, GB, TB, and PB.',       cls: ByteConverter },
  'css-units':        { title: 'CSS Unit Converter',    icon: '📐', desc: 'Convert px, rem, em, vw, vh, %, and pt instantly.',          cls: CSSUnitConverter },
  'json-schema':      { title: 'JSON Schema Validator', icon: '✅', desc: 'Validate JSON data against a JSON Schema (draft-07).',       cls: JSONSchemaValidator },
  'line-sorter':      { title: 'Line Sorter',           icon: '📋', desc: 'Sort, reverse, shuffle, deduplicate, and trim lines.',       cls: LineSorter },
  'qr-code':          { title: 'QR Code Generator',     icon: '▦',  desc: 'Generate QR codes from any text or URL. Download as PNG.',   cls: QRCodeGenerator },
  'temp-converter':   { title: 'Temperature Converter', icon: '🌡️', desc: 'Convert between Celsius, Fahrenheit, Kelvin, and more.',     cls: TemperatureConverter },
  'slug-gen':         { title: 'Slug Generator',        icon: '🔗', desc: 'Convert text to URL-friendly slugs.',                        cls: SlugGenerator },
  'word-freq':        { title: 'Word Frequency',        icon: '📊', desc: 'Analyze word frequency and count in any text.',              cls: WordFrequency },
  'http-status':      { title: 'HTTP Status Codes',     icon: '🌐', desc: 'Reference for all HTTP status codes with descriptions.',     cls: HTTPStatus },
  'unit-converter':   { title: 'Unit Converter',        icon: '📏', desc: 'Convert length, weight, volume, speed, time, and more.',     cls: UnitConverter },
  'fake-data':        { title: 'Fake Data Generator',   icon: '🎭', desc: 'Generate fake persons, companies, and credit cards.',        cls: FakeData },
  'color-palette':    { title: 'Color Palette',         icon: '🎨', desc: 'Generate complementary, analogous, and triadic palettes.',   cls: ColorPalette },
  'ascii-table':      { title: 'ASCII Table',           icon: '🔣', desc: 'Full ASCII reference with decimal, hex, binary, and HTML.',  cls: ASCIITable },
  'pct-calc':         { title: 'Percentage Calculator', icon: '💯', desc: 'Calculate percentages, changes, tips, and more.',            cls: PercentageCalc },
  'roman':            { title: 'Roman Numerals',        icon: '🏛️', desc: 'Convert between numbers and Roman numerals (1–3999).',       cls: RomanNumeral },
  'dup-remover':      { title: 'Duplicate Remover',     icon: '🧹', desc: 'Remove duplicate lines from any text, case-insensitive.',    cls: DuplicateRemover },
  'html-md':          { title: 'HTML → Markdown',       icon: '⬇️', desc: 'Convert HTML markup to clean Markdown syntax.',              cls: HTMLToMarkdown },
  'mime-lookup':      { title: 'MIME Type Lookup',      icon: '📂', desc: 'Look up MIME types by extension, type, or description.',     cls: MIMELookup },
  'jwt-builder':      { title: 'JWT Builder',           icon: '🔏', desc: 'Build and sign JWT tokens with custom header and payload.',   cls: JWTBuilder },
  'bcrypt':           { title: 'Bcrypt Simulator',      icon: '🔐', desc: 'Simulate bcrypt hashing and verification (educational).',    cls: BcryptSimulator },
  'aspect-ratio':     { title: 'Aspect Ratio',          icon: '📐', desc: 'Calculate and convert image/video aspect ratios.',           cls: AspectRatio },
  'sci-calc':         { title: 'Scientific Calculator', icon: '🧮', desc: 'Full scientific calculator with trig, log, and more.',       cls: ScientificCalc },
  'md-export':        { title: 'Markdown → HTML',       icon: '📤', desc: 'Convert Markdown to HTML with live preview and export.',     cls: MarkdownExport },
};

class DevFormatApp {
  constructor() {
    this.seoManager = new SEOManager();
    this.themeManager = new ThemeManager();
    this.router = new Router(this.seoManager);
    this.toastSystem = new ToastSystem();
    this.navigationBar = null;
    this.appContainer = document.getElementById('app');
    this.instances = {};
    this.currentTool = null;
    this.init();
  }

  init() {
    this.registerRoutes();
    this.navigationBar = new NavigationBar(this.router, this.themeManager);
    this.setupErrorHandling();
    const initialRoute = window.location.hash.slice(1) || '/';
    this.seoManager.updateMeta(initialRoute);
  }

  registerRoutes() {
    this.router.register('/', () => this.renderHomepage());
    Object.keys(TOOLS).forEach(id => {
      this.router.register(`/${id}`, () => this.renderTool(id));
    });
    this.router.onRouteChange(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  setupErrorHandling() {
    // Global error handler
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      
      // Don't show toast for script loading errors
      if (event.message && event.message.includes('Script error')) {
        return;
      }
      
      this.showErrorMessage('An unexpected error occurred. Please refresh the page.');
      
      // Prevent default error handling
      event.preventDefault();
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.showErrorMessage('An unexpected error occurred. Please try again.');
      
      // Prevent default error handling
      event.preventDefault();
    });

    // Handle clipboard API errors gracefully
    if (!navigator.clipboard) {
      console.warn('Clipboard API not available - using fallback');
    }

    // Handle localStorage errors
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  }

  renderHomepage() {
    const toolCount = Object.keys(TOOLS).length;
    const allCards = Object.entries(TOOLS)
      .map(([id, t]) => `
        <article class="tool-card glass-panel" data-tags="${t.title.toLowerCase()} ${t.desc.toLowerCase()}">
          <div class="tool-card-icon">${t.icon}</div>
          <h3>${t.title}</h3>
          <p>${t.desc}</p>
          <a href="#/${id}" class="btn btn-primary">Open Tool</a>
        </article>`).join('');

    this.appContainer.innerHTML = `
      <div class="container">
        <section class="hero-section">
          <div class="hero-badge">✦ ${toolCount} tools, zero installs</div>
          <h1 class="hero-title">Developer Tools<br><span class="hero-accent">that just work</span></h1>
          <p class="hero-subtitle">Format, convert, encode, and debug — all in your browser. No sign-up, no tracking, no nonsense.</p>
          <div class="hero-search-wrap">
            <input type="search" id="tool-search" class="hero-search" placeholder="Search tools… (e.g. JSON, UUID, Base64)" autocomplete="off" aria-label="Search tools">
          </div>
          <div class="hero-stats">
            <span>${toolCount} Tools</span>
            <span>100% Client-Side</span>
            <span>Zero Dependencies</span>
            <span>Auto-Save</span>
          </div>
        </section>

        <section class="tool-container">
          <div class="tools-grid" id="tools-grid">${allCards}</div>
          <p id="no-results" class="no-results hidden">No tools match your search.</p>
          <div class="features-grid" style="margin-top:3rem">
            <div class="glass-panel" style="padding:2rem;text-align:center"><h3>🚀 Instant</h3><p>No server round-trips. Results appear immediately.</p></div>
            <div class="glass-panel" style="padding:2rem;text-align:center"><h3>🔒 Private</h3><p>Your data never leaves your device.</p></div>
            <div class="glass-panel" style="padding:2rem;text-align:center"><h3>💾 Auto-Save</h3><p>Input is saved and restored automatically.</p></div>
            <div class="glass-panel" style="padding:2rem;text-align:center"><h3>📱 Responsive</h3><p>Works great on desktop and mobile.</p></div>
          </div>
        </section>
      </div>`;

    // Live search
    document.getElementById('tool-search').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const cards = document.querySelectorAll('#tools-grid .tool-card');
      let visible = 0;
      cards.forEach(card => {
        const match = !q || card.dataset.tags.includes(q);
        card.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      document.getElementById('no-results').classList.toggle('hidden', visible > 0);
    });
  }

  renderTool(id) {
    const meta = TOOLS[id];
    if (!meta) return;

    if (!this.instances[id]) {
      this.instances[id] = new meta.cls(this.toastSystem);
    }

    this.appContainer.innerHTML = `
      <div class="container">
        <section class="tool-container">
          <header class="tool-header">
            <h1>${meta.icon} ${meta.title}</h1>
            <p>Fast, secure, and free. All processing happens in your browser.</p>
          </header>
          <div id="tool-content"></div>
        </section>
      </div>`;

    this.currentTool = this.instances[id];
    this.currentTool.render(document.getElementById('tool-content'));
  }

  showErrorMessage(message) {
    // Use the toast system for error messages
    this.toastSystem.error(message);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.devFormatApp = new DevFormatApp();
});

// Export for potential testing
export { DevFormatApp };