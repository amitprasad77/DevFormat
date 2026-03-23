// XML Formatter Tool
import { BaseTool } from './base-tool.js';

export class XMLFormatter extends BaseTool {
  constructor(toastSystem) {
    super('xml-formatter', toastSystem);
  }

  getInputPlaceholder() {
    return 'Paste your XML here...';
  }

  process() {
    const input = this.inputElement.value.trim();
    
    if (!input) {
      this.toastSystem.warning('Please enter some XML');
      return;
    }

    try {
      const formatted = this.formatXML(input);
      this.outputElement.value = formatted;
      this.toastSystem.success('XML formatted successfully!');
    } catch (error) {
      this.outputElement.value = '';
      this.toastSystem.error(`Invalid XML: ${error.message}`);
    }
  }

  formatXML(xml) {
    const PADDING = '  ';
    const reg = /(>)(<)(\/*)/g;
    let formatted = '';
    let pad = 0;

    xml = xml.replace(reg, '$1\n$2$3');
    
    xml.split('\n').forEach((node) => {
      let indent = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (node.match(/^<\/\w/) && pad > 0) {
        pad -= 1;
      } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
        indent = 1;
      } else {
        indent = 0;
      }

      formatted += PADDING.repeat(pad) + node + '\n';
      pad += indent;
    });

    return formatted.trim();
  }
}
