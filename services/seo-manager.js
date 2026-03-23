// SEO Manager - Dynamic meta tag management for each route
export class SEOManager {
  constructor() {
    this.defaultMeta = {
      title: 'DevFormat - Free Developer Tools Platform',
      description: 'Free online developer tools for JSON formatting, Base64 encoding, XML formatting, and URL encoding. Fast, secure, and works offline.',
      keywords: 'json formatter, base64 encoder, xml formatter, url encoder, developer tools, online tools',
      author: 'DevFormat',
      viewport: 'width=device-width, initial-scale=1.0'
    };

    this.routeMeta = {
      '/': {
        title: 'DevFormat - Free Developer Tools Platform',
        description: 'Free online developer tools for JSON formatting, Base64 encoding, XML formatting, and URL encoding. Fast, secure, and works offline.',
        keywords: 'json formatter, base64 encoder, xml formatter, url encoder, developer tools, online tools'
      },
      '/json-formatter': {
        title: 'JSON Formatter - Format, Validate & Minify JSON Online | DevFormat',
        description: 'Free online JSON formatter and validator. Format, beautify, minify and validate JSON data instantly. No registration required.',
        keywords: 'json formatter, json validator, json beautifier, json minifier, format json online'
      },
      '/base64-encoder': {
        title: 'Base64 Encoder/Decoder - Encode & Decode Base64 Online | DevFormat',
        description: 'Free online Base64 encoder and decoder. Convert text to Base64 and decode Base64 to text instantly. Secure and fast.',
        keywords: 'base64 encoder, base64 decoder, base64 converter, encode base64, decode base64'
      },
      '/xml-formatter': {
        title: 'XML Formatter - Format & Validate XML Online | DevFormat',
        description: 'Free online XML formatter and validator. Format, beautify and validate XML documents instantly. Clean and intuitive interface.',
        keywords: 'xml formatter, xml validator, xml beautifier, format xml online, xml pretty print'
      },
      '/url-encoder': {
        title: 'URL Encoder/Decoder - Encode & Decode URLs Online | DevFormat',
        description: 'Free online URL encoder and decoder. Encode special characters for URLs and decode URL-encoded strings instantly.',
        keywords: 'url encoder, url decoder, url encode, url decode, percent encoding'
      },
      '/jwt-decoder': {
        title: 'JWT Decoder - Decode & Inspect JWT Tokens | DevFormat',
        description: 'Free online JWT decoder. Decode and inspect JSON Web Tokens, view header, payload, and check expiry instantly.',
        keywords: 'jwt decoder, json web token, jwt inspector, decode jwt, jwt expiry'
      },
      '/markdown-preview': {
        title: 'Markdown Preview - Live Markdown to HTML | DevFormat',
        description: 'Free online Markdown editor with live HTML preview. Write Markdown and see the rendered output instantly.',
        keywords: 'markdown preview, markdown editor, markdown to html, live markdown'
      },
      '/hash-generator': {
        title: 'Hash Generator - SHA-256, SHA-1, SHA-512 | DevFormat',
        description: 'Free online hash generator. Generate SHA-256, SHA-1, and SHA-512 cryptographic hashes instantly.',
        keywords: 'hash generator, sha256, sha1, sha512, cryptographic hash, checksum'
      },
      '/regex-tester': {
        title: 'Regex Tester - Test Regular Expressions Online | DevFormat',
        description: 'Free online regex tester. Test and debug regular expressions with live match highlighting.',
        keywords: 'regex tester, regular expression, regex debugger, regex matcher'
      },
      '/color-converter': {
        title: 'Color Converter - HEX, RGB, HSL | DevFormat',
        description: 'Free online color converter. Convert between HEX, RGB, and HSL color formats instantly.',
        keywords: 'color converter, hex to rgb, rgb to hsl, color picker, color format'
      },
      '/diff-checker': {
        title: 'Diff Checker - Compare Text Online | DevFormat',
        description: 'Free online diff checker. Compare two text blocks side by side and highlight differences.',
        keywords: 'diff checker, text compare, file diff, text difference, compare strings'
      }
    };
  }

  updateMeta(route) {
    const meta = this.routeMeta[route] || this.defaultMeta;
    
    // Update title
    document.title = meta.title;
    
    // Update meta tags
    this.setMetaTag('description', meta.description);
    this.setMetaTag('keywords', meta.keywords);
    this.setMetaTag('author', this.defaultMeta.author);
    
    // Update Open Graph tags
    this.setMetaProperty('og:title', meta.title);
    this.setMetaProperty('og:description', meta.description);
    this.setMetaProperty('og:type', 'website');
    this.setMetaProperty('og:url', window.location.href);
    
    // Update Twitter Card tags
    this.setMetaTag('twitter:card', 'summary');
    this.setMetaTag('twitter:title', meta.title);
    this.setMetaTag('twitter:description', meta.description);
    
    // Update canonical URL
    this.setCanonicalUrl(route);
  }

  setMetaTag(name, content) {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = name;
      document.head.appendChild(meta);
    }
    meta.content = content;
  }

  setMetaProperty(property, content) {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.content = content;
  }

  setCanonicalUrl(route) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    
    const baseUrl = window.location.origin + window.location.pathname;
    canonical.href = route === '/' ? baseUrl : `${baseUrl}#${route}`;
  }

  generateSitemap() {
    const baseUrl = window.location.origin + window.location.pathname;
    const routes = Object.keys(this.routeMeta);
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${route === '/' ? baseUrl : `${baseUrl}#${route}`}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;
    
    return sitemap;
  }

  generateRobotsTxt() {
    const baseUrl = window.location.origin + window.location.pathname;
    return `User-agent: *
Allow: /

Sitemap: ${baseUrl}sitemap.xml`;
  }
}