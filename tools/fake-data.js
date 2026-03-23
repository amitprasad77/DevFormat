import { BaseTool } from './base-tool.js';

const FIRST = ['Alice','Bob','Charlie','Diana','Ethan','Fiona','George','Hannah','Ivan','Julia','Kevin','Laura','Mike','Nina','Oscar','Paula','Quinn','Rachel','Sam','Tina','Uma','Victor','Wendy','Xander','Yara','Zoe','Liam','Emma','Noah','Olivia','Ava','Sophia','Mason','Isabella','James','Mia','Logan','Charlotte','Lucas','Amelia'];
const LAST  = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson','Moore','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Young','Lee','Walker','Hall','Allen','King','Wright','Scott','Green','Baker','Adams','Nelson','Carter','Mitchell','Perez','Roberts','Turner','Phillips','Campbell','Parker','Evans','Edwards'];
const DOMAINS = ['gmail.com','yahoo.com','outlook.com','proton.me','icloud.com','hotmail.com','example.com','dev.io'];
const STREETS = ['Main St','Oak Ave','Maple Dr','Cedar Ln','Pine Rd','Elm St','Washington Blvd','Park Ave','Lake Dr','River Rd'];
const CITIES  = ['New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia','San Antonio','San Diego','Dallas','San Jose','Austin','Jacksonville','Fort Worth','Columbus','Charlotte'];
const STATES  = ['NY','CA','IL','TX','AZ','PA','FL','OH','NC','GA','MI','WA','CO','MA','VA'];
const COMPANIES = ['Acme Corp','Globex','Initech','Umbrella Ltd','Stark Industries','Wayne Enterprises','Hooli','Pied Piper','Dunder Mifflin','Vandelay Industries'];
const TLDS = ['.com','.io','.dev','.net','.org','.co'];

const rnd = arr => arr[Math.floor(Math.random() * arr.length)];
const rndInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function genPerson() {
  const first = rnd(FIRST), last = rnd(LAST);
  const email = `${first.toLowerCase()}.${last.toLowerCase()}${rndInt(1,99)}@${rnd(DOMAINS)}`;
  const phone = `+1 (${rndInt(200,999)}) ${rndInt(100,999)}-${rndInt(1000,9999)}`;
  const dob = `${rndInt(1960,2005)}-${String(rndInt(1,12)).padStart(2,'0')}-${String(rndInt(1,28)).padStart(2,'0')}`;
  const addr = `${rndInt(1,9999)} ${rnd(STREETS)}, ${rnd(CITIES)}, ${rnd(STATES)} ${rndInt(10000,99999)}`;
  const company = rnd(COMPANIES);
  const username = `${first.toLowerCase()}${last.toLowerCase().slice(0,3)}${rndInt(10,99)}`;
  return { name:`${first} ${last}`, email, phone, dob, address:addr, company, username };
}

function genCreditCard() {
  const num = Array.from({length:16}, () => rndInt(0,9)).join('').replace(/(.{4})/g,'$1 ').trim();
  const exp = `${String(rndInt(1,12)).padStart(2,'0')}/${rndInt(25,30)}`;
  const cvv = String(rndInt(100,999));
  return { number:num, expiry:exp, cvv, type: rnd(['Visa','Mastercard','Amex','Discover']) };
}

function genCompany() {
  const name = rnd(COMPANIES);
  const domain = name.toLowerCase().replace(/[^a-z]/g,'') + rnd(TLDS);
  const website = `https://www.${domain}`;
  const email = `contact@${domain}`;
  const phone = `+1 (${rndInt(200,999)}) ${rndInt(100,999)}-${rndInt(1000,9999)}`;
  return { name, domain, website, email, phone };
}

export class FakeData extends BaseTool {
  constructor(toast) { super('fake-data', toast); }

  render(container) {
    this.container = container;
    container.innerHTML = `
      <div class="tool-panel glass-panel" style="padding:1.5rem;margin-bottom:1rem">
        <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-end">
          <div class="form-group" style="margin:0">
            <label class="form-label">Type</label>
            <select id="fd-type" class="form-control">
              <option value="person">Person</option>
              <option value="company">Company</option>
              <option value="card">Credit Card</option>
            </select>
          </div>
          <div class="form-group" style="margin:0">
            <label class="form-label">Count</label>
            <input type="number" id="fd-count" class="form-control" value="5" min="1" max="50" style="width:80px">
          </div>
          <div class="form-group" style="margin:0">
            <label class="form-label">Format</label>
            <select id="fd-format" class="form-control">
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          <button class="btn btn-primary" id="fd-generate">Generate</button>
        </div>
      </div>
      <div class="tool-panel glass-panel" style="padding:1.5rem">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
          <h3 style="margin:0">Output</h3>
          <button class="btn btn-sm" id="fd-copy">Copy</button>
        </div>
        <textarea id="fd-output" class="form-control tool-textarea" readonly></textarea>
      </div>`;

    document.getElementById('fd-generate').addEventListener('click', () => this.generate());
    document.getElementById('fd-copy').addEventListener('click', () => this.copy());
    this.generate();
  }

  generate() {
    const type = document.getElementById('fd-type').value;
    const count = Math.min(50, parseInt(document.getElementById('fd-count').value) || 5);
    const format = document.getElementById('fd-format').value;
    const genFn = type === 'person' ? genPerson : type === 'company' ? genCompany : genCreditCard;
    const data = Array.from({length: count}, genFn);

    let output;
    if (format === 'json') {
      output = JSON.stringify(data, null, 2);
    } else {
      const keys = Object.keys(data[0]);
      output = [keys.join(','), ...data.map(d => keys.map(k => `"${d[k]}"`).join(','))].join('\n');
    }
    document.getElementById('fd-output').value = output;
  }

  async copy() {
    const val = document.getElementById('fd-output').value;
    if (!val) return;
    try { await navigator.clipboard.writeText(val); this.toastSystem.success('Copied!'); }
    catch { this.toastSystem.error('Copy failed'); }
  }
}
