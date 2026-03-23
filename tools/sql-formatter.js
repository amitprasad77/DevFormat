// SQL Formatter Tool
import { BaseTool } from './base-tool.js';

export class SQLFormatter extends BaseTool {
  constructor(toastSystem) {
    super('sql-formatter', toastSystem);
  }

  getInputPlaceholder() {
    return 'SELECT id, name, email FROM users WHERE active = 1 ORDER BY name ASC LIMIT 10;';
  }

  process() {
    const input = this.inputElement.value.trim();
    if (!input) { this.toastSystem.warning('Please enter some SQL'); return; }
    this.outputElement.value = this.formatSQL(input);
    this.toastSystem.success('SQL formatted!');
  }

  formatSQL(sql) {
    const keywords = [
      'SELECT','FROM','WHERE','AND','OR','NOT','IN','IS','NULL','LIKE',
      'ORDER BY','GROUP BY','HAVING','LIMIT','OFFSET','JOIN','LEFT JOIN',
      'RIGHT JOIN','INNER JOIN','OUTER JOIN','ON','AS','DISTINCT','COUNT',
      'SUM','AVG','MIN','MAX','INSERT INTO','VALUES','UPDATE','SET',
      'DELETE FROM','CREATE TABLE','DROP TABLE','ALTER TABLE','ADD COLUMN',
      'UNION','UNION ALL','WITH','CASE','WHEN','THEN','ELSE','END',
      'EXISTS','BETWEEN','ASC','DESC'
    ];

    // Normalize whitespace
    let result = sql.replace(/\s+/g, ' ').trim();

    // Uppercase keywords
    keywords.forEach(kw => {
      const re = new RegExp(`\\b${kw}\\b`, 'gi');
      result = result.replace(re, kw);
    });

    // Add newlines before major clauses
    const newlineBefore = ['SELECT','FROM','WHERE','ORDER BY','GROUP BY','HAVING',
      'LIMIT','OFFSET','LEFT JOIN','RIGHT JOIN','INNER JOIN','OUTER JOIN','JOIN',
      'UNION','UNION ALL','INSERT INTO','VALUES','UPDATE','SET','DELETE FROM'];
    newlineBefore.forEach(kw => {
      result = result.replace(new RegExp(`\\b${kw}\\b`, 'g'), `\n${kw}`);
    });

    // Indent AND / OR
    result = result.replace(/\b(AND|OR)\b/g, '\n  $1');

    // Indent SELECT columns
    result = result.replace(/SELECT\n?\s*(.+?)\nFROM/s, (_, cols) => {
      const formatted = cols.split(',').map((c, i) => (i === 0 ? c.trim() : '  ' + c.trim())).join(',\n');
      return `SELECT ${formatted}\nFROM`;
    });

    return result.trim();
  }

  getTemplate() {
    return `
      <div class="tool-layout">
        <div class="tool-panel">
          <h3>Input SQL</h3>
          <textarea class="form-control tool-textarea" id="${this.toolId}-input" placeholder="${this.getInputPlaceholder()}"></textarea>
        </div>
        <div class="tool-panel">
          <h3>Formatted SQL</h3>
          <textarea class="form-control tool-textarea" id="${this.toolId}-output" readonly placeholder="Formatted SQL will appear here..."></textarea>
        </div>
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" id="${this.toolId}-process">Format SQL</button>
        <button class="btn" id="${this.toolId}-copy">Copy Output</button>
        <button class="btn" id="${this.toolId}-clear">Clear</button>
      </div>`;
  }
}
