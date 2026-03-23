import { BaseTool } from './base-tool.js';

// Minimal JSON Schema validator (draft-07 subset: type, required, properties, items, enum, minLength, maxLength, minimum, maximum, pattern)
function validate(schema, data, path = '') {
  const errors = [];

  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    const actual = data === null ? 'null' : Array.isArray(data) ? 'array' : typeof data;
    if (!types.includes(actual)) errors.push(`${path || 'root'}: expected ${types.join('|')}, got ${actual}`);
  }

  if (schema.enum && !schema.enum.some(v => JSON.stringify(v) === JSON.stringify(data))) {
    errors.push(`${path || 'root'}: value not in enum [${schema.enum.map(v => JSON.stringify(v)).join(', ')}]`);
  }

  if (typeof data === 'string') {
    if (schema.minLength !== undefined && data.length < schema.minLength)
      errors.push(`${path}: length ${data.length} < minLength ${schema.minLength}`);
    if (schema.maxLength !== undefined && data.length > schema.maxLength)
      errors.push(`${path}: length ${data.length} > maxLength ${schema.maxLength}`);
    if (schema.pattern && !new RegExp(schema.pattern).test(data))
      errors.push(`${path}: does not match pattern "${schema.pattern}"`);
  }

  if (typeof data === 'number') {
    if (schema.minimum !== undefined && data < schema.minimum)
      errors.push(`${path}: ${data} < minimum ${schema.minimum}`);
    if (schema.maximum !== undefined && data > schema.maximum)
      errors.push(`${path}: ${data} > maximum ${schema.maximum}`);
  }

  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    if (schema.required) {
      schema.required.forEach(key => {
        if (!(key in data)) errors.push(`${path || 'root'}: missing required property "${key}"`);
      });
    }
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([key, subSchema]) => {
        if (key in data) errors.push(...validate(subSchema, data[key], `${path}.${key}`));
      });
    }
  }

  if (Array.isArray(data) && schema.items) {
    data.forEach((item, i) => errors.push(...validate(schema.items, item, `${path}[${i}]`)));
  }

  return errors;
}

export class JSONSchemaValidator extends BaseTool {
  constructor(toast) { super('json-schema', toast); }

  render(container) {
    this.container = container;
    container.innerHTML = `
      <div class="tool-layout">
        <div class="tool-panel glass-panel">
          <h3>JSON Schema</h3>
          <textarea id="schema-input" class="form-control tool-textarea" placeholder='{\n  "type": "object",\n  "required": ["name"],\n  "properties": {\n    "name": { "type": "string", "minLength": 1 },\n    "age":  { "type": "number", "minimum": 0 }\n  }\n}'></textarea>
        </div>
        <div class="tool-panel glass-panel">
          <h3>JSON Data</h3>
          <textarea id="data-input" class="form-control tool-textarea" placeholder='{\n  "name": "Alice",\n  "age": 30\n}'></textarea>
        </div>
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" id="schema-validate">Validate</button>
        <button class="btn" id="schema-clear">Clear</button>
      </div>
      <div id="schema-result" style="margin-top:1.5rem"></div>`;

    document.getElementById('schema-validate').addEventListener('click', () => this.run());
    document.getElementById('schema-clear').addEventListener('click', () => {
      document.getElementById('schema-input').value = '';
      document.getElementById('data-input').value = '';
      document.getElementById('schema-result').innerHTML = '';
    });
  }

  run() {
    const schemaRaw = document.getElementById('schema-input').value.trim();
    const dataRaw = document.getElementById('data-input').value.trim();
    const result = document.getElementById('schema-result');

    let schema, data;
    try { schema = JSON.parse(schemaRaw); } catch (e) {
      result.innerHTML = `<div class="glass-panel" style="padding:1rem;border-left:4px solid var(--error)">❌ Invalid schema JSON: ${e.message}</div>`;
      return;
    }
    try { data = JSON.parse(dataRaw); } catch (e) {
      result.innerHTML = `<div class="glass-panel" style="padding:1rem;border-left:4px solid var(--error)">❌ Invalid data JSON: ${e.message}</div>`;
      return;
    }

    const errors = validate(schema, data);
    if (errors.length === 0) {
      result.innerHTML = `<div class="glass-panel" style="padding:1rem;border-left:4px solid var(--success)">✅ Valid — data matches the schema.</div>`;
      this.toastSystem.success('Valid JSON');
    } else {
      result.innerHTML = `<div class="glass-panel" style="padding:1rem;border-left:4px solid var(--error)">
        <strong style="color:var(--error)">❌ ${errors.length} error${errors.length>1?'s':''}</strong>
        <ul style="margin-top:0.75rem;padding-left:1.25rem">${errors.map(e => `<li style="margin-bottom:0.4rem;font-family:'Fira Code',monospace;font-size:0.85rem">${e}</li>`).join('')}</ul>
      </div>`;
      this.toastSystem.error(`${errors.length} validation error${errors.length>1?'s':''}`);
    }
  }
}
