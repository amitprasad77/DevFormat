// Cron Expression Parser
import { BaseTool } from './base-tool.js';

export class CronParser extends BaseTool {
  constructor(toastSystem) { super('cron-parser', toastSystem); }
  getInputPlaceholder() { return '*/5 * * * *'; }

  process() {
    const input = this.inputElement.value.trim();
    if (!input) { this.toastSystem.warning('Enter a cron expression'); return; }
    try {
      const result = this.parseCron(input);
      this.outputElement.value = result;
      this.toastSystem.success('Parsed!');
    } catch (e) { this.toastSystem.error(e.message); }
  }

  parseCron(expr) {
    const parts = expr.trim().split(/\s+/);
    if (parts.length < 5 || parts.length > 6) throw new Error('Cron must have 5 or 6 fields');
    const [min, hour, dom, month, dow, year] = parts;

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    const desc = (val, unit, names) => {
      if (val === '*') return `every ${unit}`;
      if (val.startsWith('*/')) return `every ${val.slice(2)} ${unit}s`;
      if (val.includes('-')) { const [a,b] = val.split('-'); return `${unit}s ${a}–${b}`; }
      if (val.includes(',')) return val.split(',').map(v => names ? names[parseInt(v)] || v : v).join(', ');
      return names ? (names[parseInt(val)] || val) : val;
    };

    const lines = [
      `Expression : ${expr}`,
      `─────────────────────────────────`,
      `Minute     : ${desc(min,'minute',null)}`,
      `Hour       : ${desc(hour,'hour',null)}`,
      `Day(month) : ${desc(dom,'day',null)}`,
      `Month      : ${desc(month,'month',months)}`,
      `Day(week)  : ${desc(dow,'weekday',days)}`,
    ];
    if (year) lines.push(`Year       : ${desc(year,'year',null)}`);

    // Generate next 5 run times (approximate)
    lines.push('', '─────────────────────────────────');
    lines.push('Next runs (approximate):');
    const next = this.getNextRuns(expr, 5);
    next.forEach(d => lines.push('  ' + d.toLocaleString()));

    return lines.join('\n');
  }

  getNextRuns(expr, count) {
    const parts = expr.trim().split(/\s+/);
    const [minE, hourE] = parts;
    const results = [];
    const now = new Date();
    let d = new Date(now);
    d.setSeconds(0, 0);
    d.setMinutes(d.getMinutes() + 1);

    const matches = (val, n) => {
      if (val === '*') return true;
      if (val.startsWith('*/')) return n % parseInt(val.slice(2)) === 0;
      if (val.includes(',')) return val.split(',').map(Number).includes(n);
      if (val.includes('-')) { const [a,b] = val.split('-').map(Number); return n >= a && n <= b; }
      return parseInt(val) === n;
    };

    let tries = 0;
    while (results.length < count && tries++ < 10000) {
      if (matches(minE, d.getMinutes()) && matches(hourE, d.getHours())) {
        results.push(new Date(d));
      }
      d.setMinutes(d.getMinutes() + 1);
    }
    return results;
  }
}
