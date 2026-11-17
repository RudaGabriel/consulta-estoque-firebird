/**
 * rotular.js
 *
 * @author Ruda Gabriel
 * @version 1.1.0
 * @changelog
 *   1.1.0 - 2026-11-17 - Alinha cada palavra lida ao gabarito por distância de
 *     edição (números riscados e textos são pulados).
 * Histórico completo das versões: CHANGELOG.md no repositório.
 *
 * Separa os dígitos de uma foto e os rotula com um gabarito (lista de colunas
 * de códigos). Cada palavra é lida pelos modelos atuais e alinhada ao
 * gabarito da coluna por distância de edição (palavras a mais, como números
 * riscados, são puladas). Só entram palavras cuja divisão bate com o número
 * de dígitos do gabarito.
 * Uso: node rotular.js ../../ocr-digitos.js ../../ocr-digitos-modelos.js foto.rgba gabarito.json saida.json
 */
const fs = require('fs'); const O = require(process.argv[2]);
O.MODELOS = new Function(fs.readFileSync(process.argv[3], 'utf8') + '; return OCR_DIGITOS_MODELOS;')();
const buf = fs.readFileSync(process.argv[4]); const w = buf.readUInt32LE(0), h = buf.readUInt32LE(4);
const img = { width: w, height: h, data: new Uint8ClampedArray(buf.buffer, buf.byteOffset + 8, w * h * 4) };
const gab = JSON.parse(fs.readFileSync(process.argv[5], 'utf8'));
const red = O._reduzir(img), t = O._mapaTinta(red), seg = O._segmentar(red, t);
const pal = seg.palavras.slice().sort((a, b) => a.x - b.x); const cols = [];
pal.forEach(p => { const cx = p.x + p.w / 2; let a = cols.find(c => Math.abs(c.cx - cx) < seg.Hd * 2.2); if (!a) { a = { cx, itens: [] }; cols.push(a); } a.itens.push(p); a.cx = a.itens.reduce((s, q) => s + q.x + q.w / 2, 0) / a.itens.length; });
cols.sort((a, b) => a.cx - b.cx); cols.forEach(c => c.itens.sort((a, b) => a.y - b.y));
function lev(a, b) { const d = []; for (let i = 0; i <= a.length; i++) { d[i] = [i]; } for (let j = 0; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1)); return d[a.length][b.length]; }
// Cada coluna do gabarito casa com a coluna detectada mais parecida (pela leitura).
const lidos = cols.map(c => c.itens.map(p => O._decidirHipoteses(O._hipoteses(p.glifos, seg, t), null).texto));
function alinhar(L, G) { // DP: casa palavras lidas (L) com o gabarito (G), pulando sobras dos dois lados
  const n = L.length, m = G.length, D = [], T = [];
  for (let i = 0; i <= n; i++) { D[i] = []; T[i] = []; for (let j = 0; j <= m; j++) { D[i][j] = Infinity; } }
  D[0][0] = 0;
  for (let i = 0; i <= n; i++) for (let j = 0; j <= m; j++) {
    if (i < n && D[i][j] + 1 < D[i+1][j]) { D[i+1][j] = D[i][j] + 1; T[i+1][j] = 'L'; }
    if (j < m && D[i][j] + 1 < D[i][j+1]) { D[i][j+1] = D[i][j] + 1; T[i][j+1] = 'G'; }
    if (i < n && j < m) { const c = lev(L[i], G[j]) / Math.max(L[i].length, G[j].length, 1) * 1.5; if (D[i][j] + c < D[i+1][j+1]) { D[i+1][j+1] = D[i][j] + c; T[i+1][j+1] = 'M'; } }
  }
  const pares = []; let i = n, j = m;
  while (i > 0 || j > 0) { const k = T[i][j]; if (k === 'M') { pares.push([i-1, j-1]); i--; j--; } else if (k === 'L') i--; else j--; }
  return { custo: D[n][m], pares: pares.reverse() };
}
function mascara(g) { const ids = {}; g.ids.forEach(i => ids[i] = 1); const m = []; for (let y = g.y; y < g.y + g.h; y++) { const l = []; for (let x = g.x; x < g.x + g.w; x++) l.push(ids[seg.rotulos[y * seg.W + x]] ? 1 : 0); m.push(l); } return m; }
function partesExatas(p, n) {
  const gs = p.glifos; if (gs.length > n) return null;
  let alvo = gs.map(g => Math.max(1, Math.round(g.w / (seg.Hd * 0.62))));
  while (alvo.reduce((a, b) => a + b, 0) > n) { let i = alvo.indexOf(Math.max(...alvo)); if (alvo[i] <= 1) return null; alvo[i]--; }
  while (alvo.reduce((a, b) => a + b, 0) < n) { let melhor = 0, v = -1; gs.forEach((g, i) => { const r = g.w / alvo[i]; if (r > v) { v = r; melhor = i; } }); alvo[melhor]++; }
  const out = []; gs.forEach((g, i) => O._dividirGlifo(g, seg, alvo[i]).forEach(q => out.push(q))); return out;
}
const amostras = []; let usadas = 0, puladas = 0;
gab.forEach((G, gi) => {
  let melhor = null;
  cols.forEach((c, ci) => { const a = alinhar(lidos[ci], G); if (!melhor || a.custo < melhor.custo) melhor = { ci, ...a }; });
  if (!melhor) return;
  melhor.pares.forEach(([li, gj]) => {
    const p = cols[melhor.ci].itens[li], cod = G[gj];
    if (lev(lidos[melhor.ci][li], cod) > 2) { puladas++; return; }      // casamento duvidoso
    const partes = partesExatas(p, cod.length);
    if (!partes) { puladas++; return; }
    partes.forEach((q, k) => amostras.push({ col: gi, rot: +cod[k], m: mascara(q) })); usadas++;
  });
});
console.log('palavras rotuladas', usadas, 'puladas', puladas, 'amostras', amostras.length);
fs.writeFileSync(process.argv[6], JSON.stringify(amostras));
