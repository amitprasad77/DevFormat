import { BaseTool } from './base-tool.js';

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b), l = (max+min)/2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min; s = l > 0.5 ? d/(2-max-min) : d/(max+min);
    switch(max) { case r: h=(g-b)/d+(g<b?6:0); break; case g: h=(b-r)/d+2; break; case b: h=(r-g)/d+4; }
    h /= 6;
  }
  return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1-l);
  const f = n => { const k = (n+h/30)%12; const c = l - a*Math.max(Math.min(k-3,9-k,1),-1); return Math.round(255*c).toString(16).padStart(2,'0'); };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function genPalette(hex, type) {
  const [h, s, l] = hexToHsl(hex);
  const palettes = {
    complementary: [[h,s,l],[h,Math.max(s-10,10),Math.min(l+20,90)],[(h+180)%360,s,l],[(h+180)%360,Math.max(s-10,10),Math.min(l+20,90)],[h,Math.max(s-20,10),Math.max(l-20,10)]],
    analogous: [[(h-30+360)%360,s,l],[(h-15+360)%360,s,l],[h,s,l],[(h+15)%360,s,l],[(h+30)%360,s,l]],
    triadic: [[h,s,l],[(h+120)%360,s,l],[(h+240)%360,s,l],[h,Math.max(s-15,10),Math.min(l+15,90)],[(h+120)%360,Math.max(s-15,10),Math.min(l+15,90)]],
    tetradic: [[h,s,l],[(h+90)%360,s,l],[(h+180)%360,s,l],[(h+270)%360,s,l],[h,Math.max(s-20,10),Math.min(l+20,90)]],
    monochromatic: [[h,s,Math.max(l-30,5)],[h,s,Math.max(l-15,10)],[h,s,l],[h,s,Math.min(l+15,90)],[h,s,Math.min(l+30,95)]],
    shades: [[h,s,10],[h,s,25],[h,s,40],[h,s,55],[h,s,70],[h,s,85]],
  };
  return (palettes[type] || palettes.complementary).map(([hh,ss,ll]) => hslToHex(hh,ss,ll));
}

function contrastColor(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return (0.299*r + 0.587*g + 0.114*b) > 128 ? '#000000' : '#ffffff';
}

export class ColorPalette extends BaseTool {
  constructor(toast) { super('color-palette', toast); }

  render(container) {
    this.container = container;
    container.innerHTML = `
      <div class="tool-panel glass-panel" style="padding:1.5rem;margin-bottom:1rem">
        <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-end">
          <div class="form-group" style="margin:0">
            <label class="form-label">Base Color</label>
            <div style="display:flex;gap:0.5rem;align-items:center">
              <input type="color" id="cp-color" value="#3b82f6" style="width:60px;height:38px;border-radius:8px;border:1px solid var(--glass-border);cursor:pointer;background:none">
              <input type="text" id="cp-hex" class="form-control" value="#3b82f6" style="width:110px;font-family:'Fira Code',monospace">
            </div>
          </div>
          <div class="form-group" style="margin:0">
            <label class="form-label">Palette Type</label>
            <select id="cp-type" class="form-control">
              <option value="complementary">Complementary</option>
              <option value="analogous">Analogous</option>
              <option value="triadic">Triadic</option>
              <option value="tetradic">Tetradic</option>
              <option value="monochromatic">Monochromatic</option>
              <option value="shades">Shades</option>
            </select>
          </div>
          <button class="btn btn-primary" id="cp-generate">Generate</button>
        </div>
      </div>
      <div id="cp-output" class="tool-panel glass-panel" style="padding:1.5rem"></div>`;

    document.getElementById('cp-color').addEventListener('input', e => { document.getElementById('cp-hex').value = e.target.value; this.generate(); });
    document.getElementById('cp-hex').addEventListener('input', e => { if (/^#[0-9a-f]{6}$/i.test(e.target.value)) { document.getElementById('cp-color').value = e.target.value; this.generate(); } });
    document.getElementById('cp-type').addEventListener('change', () => this.generate());
    document.getElementById('cp-generate').addEventListener('click', () => this.generate());
    this.generate();
  }

  generate() {
    const hex = document.getElementById('cp-hex').value;
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return;
    const type = document.getElementById('cp-type').value;
    const colors = genPalette(hex, type);
    const [h, s, l] = hexToHsl(hex);

    document.getElementById('cp-output').innerHTML = `
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-bottom:1.5rem">
        ${colors.map(c => `
          <div style="flex:1;min-width:100px;cursor:pointer" onclick="navigator.clipboard.writeText('${c}');this.querySelector('.cp-label').textContent='Copied!'">
            <div style="height:100px;background:${c};border-radius:10px;margin-bottom:0.5rem;box-shadow:0 4px 12px rgba(0,0,0,0.3)"></div>
            <div style="text-align:center;font-family:'Fira Code',monospace;font-size:0.8rem;color:var(--text-secondary)" class="cp-label">${c}</div>
            <div style="text-align:center;font-size:0.75rem;color:var(--text-muted)">${hexToHsl(c).join('° ')}</div>
          </div>`).join('')}
      </div>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        ${colors.map(c => `<code style="background:${c};color:${contrastColor(c)};padding:0.3rem 0.75rem;border-radius:6px;font-size:0.85rem;cursor:pointer" onclick="navigator.clipboard.writeText('${c}')">${c}</code>`).join('')}
      </div>
      <p style="margin-top:1rem;font-size:0.8rem;color:var(--text-muted)">Click any swatch or code to copy the hex value.</p>`;
  }
}
