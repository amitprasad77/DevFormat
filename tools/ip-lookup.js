// IP Info Lookup Tool
import { BaseTool } from './base-tool.js';

export class IPLookup extends BaseTool {
  constructor(toastSystem) { super('ip-lookup', toastSystem); }
  getInputPlaceholder() { return 'Enter IP address or leave blank for your IP'; }

  async process() {
    const input = this.inputElement.value.trim();
    const url = input ? `https://ipapi.co/${input}/json/` : 'https://ipapi.co/json/';
    this.outputElement.value = 'Looking up...';
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Lookup failed');
      const d = await res.json();
      if (d.error) throw new Error(d.reason || 'Not found');
      this.outputElement.value = [
        `IP Address : ${d.ip}`,
        `City       : ${d.city || '—'}`,
        `Region     : ${d.region || '—'}`,
        `Country    : ${d.country_name || '—'} (${d.country || '—'})`,
        `Postal     : ${d.postal || '—'}`,
        `Latitude   : ${d.latitude || '—'}`,
        `Longitude  : ${d.longitude || '—'}`,
        `Timezone   : ${d.timezone || '—'}`,
        `ISP/Org    : ${d.org || '—'}`,
        `ASN        : ${d.asn || '—'}`,
      ].join('\n');
      this.toastSystem.success('IP info retrieved!');
    } catch (e) {
      this.outputElement.value = '';
      this.toastSystem.error('Lookup failed: ' + e.message);
    }
  }
}
