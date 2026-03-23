# DevFormat

**51 free developer tools, all running in your browser.**

No sign-up. No tracking. No server round-trips. Just open and use.

🌐 **Live:** [devformat.app](https://devformat.app)

---

## Tools

| Category | Tools |
|---|---|
| Formatters | JSON, XML, CSS, HTML, SQL |
| Encoders / Decoders | Base64, URL, HTML Entities, String Escape, Image→Base64 |
| Generators | UUID, Password, Hash (SHA-256/1/512), Lorem Ipsum |
| Converters | YAML↔JSON, JSON↔CSV, Number Base, Byte, CSS Units, Timestamp |
| Inspectors | JWT Decoder, Regex Tester, Diff Checker, JSON Path, JSON Schema Validator |
| Utilities | Color Converter, Markdown Preview, Cron Parser, IP Lookup, Chmod Calculator, Line Sorter, Text Tools |

---

## Tech Stack

- Vanilla HTML, CSS, JavaScript (ES modules)
- Zero dependencies — no npm, no bundler
- Hash-based routing (`#/tool-name`)
- localStorage auto-save per tool
- Dark / light theme toggle
- Fully responsive

## Deploy

### Netlify

1. Push this repo to GitHub
2. Go to [netlify.com](https://netlify.com) → New site from Git
3. Select your repo — build command: *(leave empty)*, publish directory: `.`
4. Deploy

### Vercel

```bash
npx vercel --prod
```

### Local dev

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

---

## Project Structure

```
devformat/
├── index.html              # Shell — nav, footer, app mount point
├── js/app.js               # Router, tool registry, homepage render
├── assets/css/styles.css   # All styles (dark/light theme)
├── components/
│   ├── router.js           # Hash-based SPA router
│   ├── navigation-bar.js   # Sticky nav + theme toggle
│   ├── theme-manager.js    # Dark/light persistence
│   └── toast-system.js     # Toast notifications
├── services/
│   ├── localstorage-manager.js
│   └── seo-manager.js
├── tools/                  # 32 tool modules
├── sitemap.xml
└── robots.txt
```

---

MIT License
