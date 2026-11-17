/**
 * rotular.js
 *
 * @author Ruda Gabriel
 * @version 1.0.0
 * @changelog
 *   1.0.0 - 2026-11-17 - Primeira versão (treino do leitor de códigos por foto).
 * Histórico completo das versões: CHANGELOG.md no repositório.
 *
 * Separa os dígitos de uma foto e os rotula com um gabarito (lista de colunas de códigos). Uso: node rotular.js ../../ocr-digitos.js foto.rgba gabarito.json reais.json
 */
// Extrai as máscaras de cada dígito da foto, rotuladas pelo gabarito.
const fs=require('fs'); const O=require(process.argv[2]);
const buf=fs.readFileSync(process.argv[3]); const w=buf.readUInt32LE(0), h=buf.readUInt32LE(4);
const img={width:w,height:h,data:new Uint8ClampedArray(buf.buffer,buf.byteOffset+8,w*h*4)};
const gab=JSON.parse(fs.readFileSync(process.argv[4],'utf8'));
const red=O._reduzir(img), t=O._mapaTinta(red), seg=O._segmentar(red,t);
const pal=seg.palavras.slice().sort((a,b)=>a.x-b.x); const cols=[];
pal.forEach(p=>{const cx=p.x+p.w/2; let a=cols.find(c=>Math.abs(c.cx-cx)<seg.Hd*2.2); if(!a){a={cx,itens:[]};cols.push(a);} a.itens.push(p); a.cx=a.itens.reduce((s,q)=>s+q.x+q.w/2,0)/a.itens.length;});
cols.sort((a,b)=>a.cx-b.cx); for(let i=cols.length-1;i>=0;i--) if(cols[i].itens.length<3){console.log('coluna espuria', JSON.stringify(cols[i].itens.map(p=>[p.x,p.y,p.w,p.h]))); cols.splice(i,1);} cols.forEach(c=>c.itens.sort((a,b)=>a.y-b.y));
console.log('colunas', cols.length, cols.map(c=>c.itens.length).join(','), 'gabarito', gab.map(c=>c.length).join(','));
function mascara(g){ const ids={}; g.ids.forEach(i=>ids[i]=1); const m=[]; for(let y=g.y;y<g.y+g.h;y++){const l=[];for(let x=g.x;x<g.x+g.w;x++) l.push(ids[seg.rotulos[y*seg.W+x]]?1:0); m.push(l);} return m; }
// divide os glifos da palavra em exatamente n partes (proporcional à largura)
function partesExatas(p, n){
  const gs=p.glifos; if (gs.length>n) return null;
  let alvo=gs.map(g=>Math.max(1, Math.round(g.w/(seg.Hd*0.62))));
  while(alvo.reduce((a,b)=>a+b,0)>n){ let i=alvo.indexOf(Math.max(...alvo)); if(alvo[i]<=1) return null; alvo[i]--; }
  while(alvo.reduce((a,b)=>a+b,0)<n){ let melhor=0,v=-1; gs.forEach((g,i)=>{const r=g.w/alvo[i]; if(r>v){v=r;melhor=i;}}); alvo[melhor]++; }
  const out=[]; gs.forEach((g,i)=>O._dividirGlifo(g,seg,alvo[i]).forEach(q=>out.push(q))); return out;
}
const amostras=[]; let usadas=0, puladas=[];
cols.forEach((c,ci)=>{
  let lista=c.itens.slice(); const g=gab[ci]||[];
  let gi=0;
  lista.forEach((p,pi)=>{
    const cod=g[gi++]; if(!cod){puladas.push('?');return;}
    const partes=partesExatas(p, cod.length);
    if(!partes){puladas.push(cod);return;}
    partes.forEach((q,k)=>amostras.push({col:ci,rot:+cod[k],m:mascara(q)})); usadas++;
  });
});
console.log('palavras rotuladas',usadas,'puladas',puladas.join(' '),'amostras',amostras.length);
fs.writeFileSync(process.argv[5], JSON.stringify(amostras));
