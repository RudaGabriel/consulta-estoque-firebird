/**
 * ocr-digitos.js
 *
 * @author Ruda Gabriel
 *
 * @version 1.1.0
 * @changelog
 *   1.1.0 - 2026-11-17 - Mais precisão e nenhum código esquecido:
 *     - Linhas das colunas tortas também são apagadas (caminho de tinta que
 *       pode desviar 1 pixel por linha), e dígitos nunca são juntados através
 *       de uma linha apagada (códigos de colunas vizinhas ficavam colados).
 *     - Decisão por hipóteses: cada glifo largo pode ser 1, 2 ou 3 dígitos;
 *       todas as combinações são lidas e vence a leitura mais provável que
 *       existe no banco. Duas leituras plausíveis que existem → "confira".
 *     - Códigos escritos sem tirar a caneta (um glifo só, largo) e códigos
 *       perto da borda da foto não são mais descartados; palavras com mais
 *       de 6 glifos são divididas no maior vão; código de 1–2 dígitos nunca
 *       sai como "certo".
 * Histórico completo das versões: CHANGELOG.md no repositório.
 * Histórico completo das versões: CHANGELOG.md no repositório.
 *
 * USO (navegador ou Node):
 *   OcrDigitos.lerImagem({ width, height, data }, {
 *       codigosExistentes: ["08395", ...],   // opcional, melhora muito
 *       aoProgredir: function(fracao, texto) {}
 *   }).then(function(resultado) { ... });
 *
 *   resultado.codigos  → [{ texto, confianca, status, caixa, alternativas }]
 *     status: "ok" (lido com segurança), "corrigido" (ajustado pelo banco),
 *             "duvida" (lido, mas com baixa confiança), "ilegivel".
 *     caixa:  { x, y, w, h } nas coordenadas da imagem original.
 *
 * Não depende de nenhuma biblioteca e não acessa a internet.
 */

/* global self */
(function (root, factory) {
    "use strict";
    var api = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = api;
    else root.OcrDigitos = api;
}(typeof globalThis !== "undefined" ? globalThis : (typeof self !== "undefined" ? self : this), function () {
    "use strict";

    var LADO_MAX = 1700;          // a foto é reduzida até este lado maior
    var CLASSES  = 11;            // 0–9 + "não é dígito"
    var CLASSE_LIXO = 10;

    // ── Utilitários de imagem ────────────────────────────────────────────────
    function _reduzir(img) {
        var w = img.width, h = img.height, d = img.data;
        var esc = Math.min(1, LADO_MAX / Math.max(w, h));
        var W = Math.max(1, Math.round(w * esc)), H = Math.max(1, Math.round(h * esc));
        var r = new Float32Array(W * H), g = new Float32Array(W * H), b = new Float32Array(W * H);
        // Média por área (evita serrilhado ao reduzir).
        var fx = w / W, fy = h / H;
        for (var y = 0; y < H; y++) {
            var y0 = Math.floor(y * fy), y1 = Math.max(y0 + 1, Math.floor((y + 1) * fy));
            for (var x = 0; x < W; x++) {
                var x0 = Math.floor(x * fx), x1 = Math.max(x0 + 1, Math.floor((x + 1) * fx));
                var sr = 0, sg = 0, sb = 0, n = 0;
                for (var yy = y0; yy < y1 && yy < h; yy++) {
                    var base = yy * w;
                    for (var xx = x0; xx < x1 && xx < w; xx++) {
                        var k = (base + xx) * 4;
                        sr += d[k]; sg += d[k + 1]; sb += d[k + 2]; n++;
                    }
                }
                var i = y * W + x;
                r[i] = sr / n; g[i] = sg / n; b[i] = sb / n;
            }
        }
        return { W: W, H: H, r: r, g: g, b: b, escala: esc };
    }

    // Média em caixa (separável, por somas acumuladas) — O(W×H) qualquer raio.
    function _borrar(src, W, H, raio) {
        var tmp = new Float32Array(W * H), out = new Float32Array(W * H);
        var x, y, s, i;
        for (y = 0; y < H; y++) {
            s = 0; var linha = y * W;
            var acum = new Float64Array(W + 1);
            for (x = 0; x < W; x++) { s += src[linha + x]; acum[x + 1] = s; }
            for (x = 0; x < W; x++) {
                var a = Math.max(0, x - raio), z = Math.min(W, x + raio + 1);
                tmp[linha + x] = (acum[z] - acum[a]) / (z - a);
            }
        }
        var col = new Float64Array(H + 1);
        for (x = 0; x < W; x++) {
            s = 0;
            for (y = 0; y < H; y++) { s += tmp[y * W + x]; col[y + 1] = s; }
            for (y = 0; y < H; y++) {
                var a2 = Math.max(0, y - raio), z2 = Math.min(H, y + raio + 1);
                out[y * W + x] = (col[z2] - col[a2]) / (z2 - a2);
            }
        }
        return out;
    }

    // Máximo local (dilatação em níveis de cinza) separável, janela 2r+1.
    function _maximoLocal(src, W, H, raio) {
        var tmp = new Float32Array(W * H), out = new Float32Array(W * H);
        var x, y, k, m;
        for (y = 0; y < H; y++) {
            for (x = 0; x < W; x++) {
                m = -Infinity;
                var a = Math.max(0, x - raio), z = Math.min(W - 1, x + raio);
                for (k = a; k <= z; k++) if (src[y * W + k] > m) m = src[y * W + k];
                tmp[y * W + x] = m;
            }
        }
        for (x = 0; x < W; x++) {
            for (y = 0; y < H; y++) {
                m = -Infinity;
                var a2 = Math.max(0, y - raio), z2 = Math.min(H - 1, y + raio);
                for (k = a2; k <= z2; k++) if (tmp[k * W + x] > m) m = tmp[k * W + x];
                out[y * W + x] = m;
            }
        }
        return out;
    }

    // ── 1. Tinta: mais escura que o papel em volta e azulada ─────────────────
    // "fundo" = brilho do papel estimado localmente (máximo + média), assim
    // sombra e iluminação desigual não viram tinta. A mão (vermelha) e a mesa
    // (cinza) ficam de fora pela cor.
    function _mapaTinta(red) {
        var W = red.W, H = red.H, n = W * H;
        var lum = new Float32Array(n);
        for (var i = 0; i < n; i++) lum[i] = 0.30 * red.r[i] + 0.59 * red.g[i] + 0.11 * red.b[i];
        var raio = Math.max(6, Math.round(Math.min(W, H) / 60));
        var fundo = _borrar(_maximoLocal(lum, W, H, Math.round(raio / 2)), W, H, raio);
        var tinta = new Float32Array(n);
        for (var j = 0; j < n; j++) {
            var f = fundo[j];
            if (f < 60) { tinta[j] = 0; continue; }                 // região escura: não é papel
            var escuro = (f - lum[j]) / f;                          // 0..1
            var azul   = red.b[j] - red.r[j];                       // tinta azul/roxa > 0
            if (azul < -6) escuro *= 0.15;                          // pele/objetos avermelhados
            tinta[j] = escuro > 0 ? escuro : 0;
        }
        return tinta;
    }

    // Limiar de Otsu sobre os valores de tinta (histograma de 256 faixas).
    function _otsu(v) {
        var hist = new Float64Array(256), n = v.length, i;
        for (i = 0; i < n; i++) hist[Math.min(255, Math.max(0, Math.round(v[i] * 255)))]++;
        var total = n, soma = 0;
        for (i = 0; i < 256; i++) soma += i * hist[i];
        var sB = 0, wB = 0, melhor = 0, limiar = 64;
        for (i = 0; i < 256; i++) {
            wB += hist[i]; if (!wB) continue;
            var wF = total - wB; if (!wF) break;
            sB += i * hist[i];
            var mB = sB / wB, mF = (soma - sB) / wF;
            var entre = wB * wF * (mB - mF) * (mB - mF);
            if (entre > melhor) { melhor = entre; limiar = i; }
        }
        return limiar / 255;
    }

    // ── 2. Componentes conectados (8 vizinhos) ───────────────────────────────
    function _componentes(bin, W, H) {
        var rot = new Int32Array(W * H), lista = [], pilha = new Int32Array(W * H);
        var atual = 0;
        for (var p = 0; p < W * H; p++) {
            if (!bin[p] || rot[p]) continue;
            atual++;
            var topo = 0; pilha[topo++] = p; rot[p] = atual;
            var minX = W, minY = H, maxX = 0, maxY = 0, area = 0;
            while (topo) {
                var q = pilha[--topo], qx = q % W, qy = (q - qx) / W;
                area++;
                if (qx < minX) minX = qx; if (qx > maxX) maxX = qx;
                if (qy < minY) minY = qy; if (qy > maxY) maxY = qy;
                for (var dy = -1; dy <= 1; dy++) {
                    var ny = qy + dy; if (ny < 0 || ny >= H) continue;
                    for (var dx = -1; dx <= 1; dx++) {
                        var nx = qx + dx; if (nx < 0 || nx >= W) continue;
                        var r = ny * W + nx;
                        if (bin[r] && !rot[r]) { rot[r] = atual; pilha[topo++] = r; }
                    }
                }
            }
            lista.push({ id: atual, x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1, area: area });
        }
        return { rotulos: rot, lista: lista };
    }

    function _mediana(arr) {
        if (!arr.length) return 0;
        var a = arr.slice().sort(function (p, q) { return p - q; });
        return a[Math.floor(a.length / 2)];
    }

    // Apaga traços verticais/horizontais muito longos (linhas das colunas).
    // Apaga traços longos quase verticais ou quase horizontais (linhas das
    // colunas, também quando a linha é torta, sublinhados, borda de outra
    // folha). Programação dinâmica: comprimento do caminho de tinta que anda
    // 1 pixel por linha podendo desviar até 1 pixel para o lado. Pixel em
    // caminho com "compr" ou mais vira linha.
    function _apagarLinhasLongas(bin, W, H, compr) {
        var n = W * H, x, y, i, k;
        var a = new Uint16Array(n), b = new Uint16Array(n), marca = new Uint8Array(n);
        // vertical: de cima para baixo e de baixo para cima
        for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
            i = y * W + x; if (!bin[i]) continue;
            var m = 0;
            if (y > 0) for (k = -1; k <= 1; k++) { var xx = x + k; if (xx >= 0 && xx < W && a[i - W + k] > m) m = a[i - W + k]; }
            a[i] = m + 1;
        }
        for (y = H - 1; y >= 0; y--) for (x = 0; x < W; x++) {
            i = y * W + x; if (!bin[i]) continue;
            var m2 = 0;
            if (y < H - 1) for (k = -1; k <= 1; k++) { var x2 = x + k; if (x2 >= 0 && x2 < W && b[i + W + k] > m2) m2 = b[i + W + k]; }
            b[i] = m2 + 1;
            if (a[i] + b[i] - 1 >= compr) marca[i] = 1;
        }
        // horizontal (traço mais longo exigido)
        var ch = Math.round(compr * 1.3);
        a.fill(0); b.fill(0);
        for (x = 0; x < W; x++) for (y = 0; y < H; y++) {
            i = y * W + x; if (!bin[i]) continue;
            var m3 = 0;
            if (x > 0) for (k = -1; k <= 1; k++) { var yy = y + k; if (yy >= 0 && yy < H && a[yy * W + x - 1] > m3) m3 = a[yy * W + x - 1]; }
            a[i] = m3 + 1;
        }
        for (x = W - 1; x >= 0; x--) for (y = 0; y < H; y++) {
            i = y * W + x; if (!bin[i]) continue;
            var m4 = 0;
            if (x < W - 1) for (k = -1; k <= 1; k++) { var y2 = y + k; if (y2 >= 0 && y2 < H && b[y2 * W + x + 1] > m4) m4 = b[y2 * W + x + 1]; }
            b[i] = m4 + 1;
            if (a[i] + b[i] - 1 >= ch) marca[i] = 1;
        }
        // Guarda onde havia linha (para não juntar dígitos através dela).
        for (i = 0; i < n; i++) if (marca[i]) bin[i] = 0;
        return marca;
    }

    // ── 3. Segmentação: componentes → dígitos → códigos ─────────────────────
    function _segmentar(red, tinta) {
        var W = red.W, H = red.H, n = W * H, i;
        var lim = Math.max(0.16, Math.min(0.45, _otsu(tinta) * 0.9));
        var bin = new Uint8Array(n);
        for (i = 0; i < n; i++) bin[i] = tinta[i] > lim ? 1 : 0;

        // Altura típica de um dígito: mediana das alturas dos componentes
        // com tamanho e proporção de dígito.
        var cc0 = _componentes(bin, W, H);
        var alturas = cc0.lista.filter(function (c) {
            return c.h >= 8 && c.h <= H / 6 && c.h / c.w >= 0.7 && c.h / c.w <= 5 && c.area >= c.h * 1.2;
        }).map(function (c) { return c.h; });
        var Hd = _mediana(alturas) || Math.max(10, Math.round(H / 40));

        // Linhas das colunas: traços verticais bem mais longos que um dígito.
        var linhaApagada = _apagarLinhasLongas(bin, W, H, Math.round(Hd * 2.4));
        // Existe linha apagada no vão entre dois glifos? (coluna da folha)
        function temLinhaEntre(G, K) {
            var x0 = Math.min(G.x + G.w, K.x), x1 = Math.max(G.x + G.w, K.x);
            var y0 = Math.max(G.y, K.y), y1 = Math.min(G.y + G.h, K.y + K.h);
            if (y1 <= y0) { y0 = Math.min(G.y, K.y); y1 = Math.max(G.y + G.h, K.y + K.h); }
            for (var xx = Math.max(0, x0 - 1); xx <= Math.min(W - 1, x1 + 1); xx++) {
                var cnt = 0;
                for (var yy = y0; yy < y1; yy++) if (linhaApagada[yy * W + xx]) cnt++;
                if (cnt >= (y1 - y0) * 0.5) return true;
            }
            return false;
        }
        var cc = _componentes(bin, W, H);

        // Filtros: ruído pequeno, borrões grandes (hachura), faixas finas.
        var glifos = [], descartados = [];
        cc.lista.forEach(function (c) {
            if (c.h < Hd * 0.28 && c.w < Hd * 0.28) return;        // pontos, sujeira
            if (c.area < Hd * Hd * 0.03) return;
            var dens = c.area / (c.w * c.h);
            // Hachura, risco grande ou mancha: fora. Guardados para avisar quando
            // encostam num código (um dígito pode ter grudado neles).
            if (c.h > Hd * 2.1 || c.w > Hd * 4.5 || (c.h > Hd * 1.3 && dens > 0.45)) { descartados.push(c); return; }
            glifos.push({ x: c.x, y: c.y, w: c.w, h: c.h, area: c.area, ids: [c.id] });
        });

        // Junta pedaços do mesmo dígito (traço quebrado): muita sobreposição
        // horizontal e próximos na vertical.
        var mudou = true;
        while (mudou) {
            mudou = false;
            for (var a = 0; a < glifos.length && !mudou; a++) {
                for (var b = a + 1; b < glifos.length && !mudou; b++) {
                    var A = glifos[a], B = glifos[b];
                    var sobX = Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x);
                    var menorW = Math.min(A.w, B.w);
                    var gapY = Math.max(A.y, B.y) - Math.min(A.y + A.h, B.y + B.h);
                    var hJunto = Math.max(A.y + A.h, B.y + B.h) - Math.min(A.y, B.y);
                    if (sobX > menorW * 0.6 && gapY < Hd * 0.35 && hJunto < Hd * 1.45 &&
                        (A.h < Hd * 0.75 || B.h < Hd * 0.75)) {
                        var x0 = Math.min(A.x, B.x), y0 = Math.min(A.y, B.y);
                        var x1 = Math.max(A.x + A.w, B.x + B.w), y1 = Math.max(A.y + A.h, B.y + B.h);
                        glifos[a] = { x: x0, y: y0, w: x1 - x0, h: y1 - y0, area: A.area + B.area, ids: A.ids.concat(B.ids) };
                        glifos.splice(b, 1);
                        mudou = true;
                    }
                }
            }
        }
        // Pedaço pequeno que sobrou sozinho (ex.: ponto em "66.66") sai, e
        // também o que encosta na borda da foto (objeto cortado, fora do
        // papel) — senão ele arrasta o código vizinho para a borda junto.
        glifos = glifos.filter(function (g) {
            if (g.h < Hd * 0.45 && g.w < Hd * 0.45) return false;
            return !(g.x <= 1 || g.y <= 1 || g.x + g.w >= W - 1 || g.y + g.h >= H - 1);
        });

        // Palavras (códigos): glifos lado a lado, na mesma altura, com espaço
        // pequeno entre eles.
        glifos.sort(function (p, q) { return p.x - q.x; });
        var pai = glifos.map(function (_, k) { return k; });
        function raiz(k) { while (pai[k] !== k) { pai[k] = pai[pai[k]]; k = pai[k]; } return k; }
        for (var u = 0; u < glifos.length; u++) {
            for (var v = u + 1; v < glifos.length; v++) {
                var G = glifos[u], K = glifos[v];
                var gap = K.x - (G.x + G.w);
                if (gap > Hd * 0.75) break;                         // ordenado por x: os próximos estão mais longe
                var cG = G.y + G.h / 2, cK = K.y + K.h / 2;
                var hm = Math.max(G.h, K.h);
                if (Math.abs(cG - cK) < hm * 0.45 && gap > -Hd * 0.35 && !temLinhaEntre(G, K)) pai[raiz(v)] = raiz(u);
            }
        }
        var grupos = {};
        glifos.forEach(function (g, k) { var r = raiz(k); (grupos[r] = grupos[r] || []).push(g); });

        var palavrasDescartadas = [];
        // Mais de 6 glifos não é um código só: divide no maior vão (repetindo).
        var listaGrupos = [];
        Object.keys(grupos).forEach(function (k) {
            var pilhaG = [grupos[k].sort(function (p, q) { return p.x - q.x; })];
            while (pilhaG.length) {
                var gs0 = pilhaG.pop();
                if (gs0.length <= 6) { listaGrupos.push(gs0); continue; }
                var maior = -Infinity, corte = 1;
                for (var gi2 = 1; gi2 < gs0.length; gi2++) {
                    var vao = gs0[gi2].x - (gs0[gi2 - 1].x + gs0[gi2 - 1].w);
                    if (gi2 >= 2 && gs0.length - gi2 >= 2 && vao > maior) { maior = vao; corte = gi2; }
                }
                pilhaG.push(gs0.slice(0, corte), gs0.slice(corte));
            }
        });
        var palavras = listaGrupos.map(function (gs) {
            var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
            gs.forEach(function (g) { x0 = Math.min(x0, g.x); y0 = Math.min(y0, g.y); x1 = Math.max(x1, g.x + g.w); y1 = Math.max(y1, g.y + g.h); });
            return { glifos: gs, x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
        }).filter(function (p) {
            var ok = _palavraValida(p);
            if (!ok) palavrasDescartadas.push(p);
            return ok;
        });
        function _palavraValida(p) {
            if (p.h < Hd * 0.5) return false;
            // Código tem 2+ dígitos; um glifo só vale se for largo (dígitos com
            // os traços ligados, como "955" escrito sem tirar a caneta).
            if (p.glifos.length < 2 && p.w < p.h * 1.0) return false;
            // Encostado na borda da foto: pode ser objeto fora do papel. Fica,
            // mas só é aceito se a leitura for confirmada no estoque (ver lerImagem).
            p.naBorda = p.x <= 2 || p.y <= 2 || p.x + p.w >= W - 2 || p.y + p.h >= H - 2;
            if (p.h > Hd * 2.2) return false;
            // Mancha escura (sombra, objeto fora do papel) não é código.
            var areaG = 0, caixaG = 0;
            p.glifos.forEach(function (g) { areaG += g.area || 0; caixaG += g.w * g.h; });
            return !caixaG || areaG / caixaG < 0.55;
        }

        // Código encostado num pedaço descartado: pode ter perdido dígito.
        palavras.forEach(function (p) {
            p.suspeito = descartados.some(function (d) {
                var sobY = Math.min(p.y + p.h, d.y + d.h) - Math.max(p.y, d.y);
                if (sobY < p.h * 0.3) return false;
                // Distância horizontal entre as caixas (negativa = se sobrepõem).
                var dist = Math.max(d.x - (p.x + p.w), p.x - (d.x + d.w));
                return dist < Hd * 0.25;
            });
        });
        return { bin: bin, rotulos: cc.rotulos, Hd: Hd, palavras: palavras, W: W, H: H,
                 descartados: descartados, palavrasDescartadas: palavrasDescartadas };
    }

    // Divide um glifo largo (dígitos encostados) pelos vales da projeção.
    function _dividirGlifo(g, seg, nPartes) {
        var Hd = seg.Hd, partes = nPartes || Math.round(g.w / (Hd * 0.62));
        if (partes < 2) return [g];
        partes = Math.min(partes, 6);
        var W = seg.W, rot = seg.rotulos, proj = new Float64Array(g.w);
        var ids = {}; g.ids.forEach(function (id) { ids[id] = true; });
        for (var y = g.y; y < g.y + g.h; y++) for (var x = g.x; x < g.x + g.w; x++) if (ids[rot[y * W + x]]) proj[x - g.x]++;
        var cortes = [];
        for (var p = 1; p < partes; p++) {
            var alvo = Math.round(g.w * p / partes), janela = Math.round(g.w / partes / 2.5), melhor = alvo, val = Infinity;
            for (var c = Math.max(1, alvo - janela); c <= Math.min(g.w - 2, alvo + janela); c++) if (proj[c] < val) { val = proj[c]; melhor = c; }
            cortes.push(melhor);
        }
        var res = [], ini = 0;
        cortes.concat([g.w]).forEach(function (fim) {
            res.push({ x: g.x + ini, y: g.y, w: Math.max(1, fim - ini), h: g.h, ids: g.ids, recorte: true });
            ini = fim;
        });
        return res;
    }

    // ── 4. Recorte 28×28 no padrão dos dígitos de treino ────────────────────
    // Caixa 20×20 mantendo a proporção, centralizada pelo centro de massa,
    // com espessura do traço normalizada (~2 px no 28×28).
    function _recorte28(g, seg, tinta) {
        var W = seg.W, rot = seg.rotulos, ids = {};
        g.ids.forEach(function (id) { ids[id] = true; });
        var gw = g.w, gh = g.h, m = new Float32Array(gw * gh), x, y, area = 0, borda = 0;
        for (y = 0; y < gh; y++) for (x = 0; x < gw; x++) {
            var p = (g.y + y) * W + (g.x + x);
            if (ids[rot[p]]) { m[y * gw + x] = 1; area++; }
        }
        for (y = 0; y < gh; y++) for (x = 0; x < gw; x++) {
            if (!m[y * gw + x]) continue;
            if (x === 0 || y === 0 || x === gw - 1 || y === gh - 1 || !m[y * gw + x - 1] || !m[y * gw + x + 1] || !m[(y - 1) * gw + x] || !m[(y + 1) * gw + x]) borda++;
        }
        var lado = Math.max(gw, gh), esc = 20 / lado;
        // Espessura atual (em px do 28×28) ≈ 2×área/perímetro × escala.
        var esp = borda ? (2 * area / borda) * esc : 2;
        var dil = Math.max(0, Math.min(3, Math.round((2.3 - esp) / (2 * esc))));
        if (dil > 0) {
            var m2 = new Float32Array(gw * gh);
            for (y = 0; y < gh; y++) for (x = 0; x < gw; x++) {
                var on = 0;
                for (var dy = -dil; dy <= dil && !on; dy++) for (var dx = -dil; dx <= dil && !on; dx++) {
                    var yy = y + dy, xx = x + dx;
                    if (yy >= 0 && yy < gh && xx >= 0 && xx < gw && m[yy * gw + xx]) on = 1;
                }
                m2[y * gw + x] = on;
            }
            m = m2;
        }
        var nw = Math.max(1, Math.round(gw * esc)), nh = Math.max(1, Math.round(gh * esc));
        var peq = new Float32Array(nw * nh);
        for (y = 0; y < nh; y++) for (x = 0; x < nw; x++) {
            var sx0 = x / esc, sx1 = (x + 1) / esc, sy0 = y / esc, sy1 = (y + 1) / esc, s = 0, cnt = 0;
            for (var yy2 = Math.floor(sy0); yy2 < Math.ceil(sy1); yy2++) for (var xx2 = Math.floor(sx0); xx2 < Math.ceil(sx1); xx2++) {
                if (yy2 < gh && xx2 < gw) { s += m[yy2 * gw + xx2]; } cnt++;
            }
            peq[y * nw + x] = cnt ? s / cnt : 0;
        }
        var cx = 0, cy = 0, tot = 0;
        for (y = 0; y < nh; y++) for (x = 0; x < nw; x++) { var vv = peq[y * nw + x]; cx += vv * x; cy += vv * y; tot += vv; }
        cx = tot ? cx / tot : nw / 2; cy = tot ? cy / tot : nh / 2;
        var ox = Math.round(14 - cx), oy = Math.round(14 - cy);
        ox = Math.max(0, Math.min(28 - nw, ox)); oy = Math.max(0, Math.min(28 - nh, oy));
        var out = new Float32Array(784);
        for (y = 0; y < nh; y++) for (x = 0; x < nw; x++) out[(y + oy) * 28 + (x + ox)] = Math.min(1, peq[y * nw + x]);
        return out;
    }

    // ── 5. Rede neural (inferência em JS puro) ───────────────────────────────
    // Arquitetura: conv3×3(16) → ReLU → max2 → conv3×3(32) → ReLU → max2 →
    // densa(800→64) → ReLU → densa(64→11). Pesos int8 por tensor (base64).
    function _b64ParaBytes(b64) {
        if (typeof atob === "function") {
            var bin = atob(b64), out = new Uint8Array(bin.length);
            for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
            return out;
        }
        return new Uint8Array(Buffer.from(b64, "base64"));
    }
    function _carregarModelo(desc) {
        var bytes = _b64ParaBytes(desc.dados), ofs = 0, tensores = {};
        desc.tensores.forEach(function (t) {
            var n = t.n, arr = new Float32Array(n);
            for (var i = 0; i < n; i++) { var b = bytes[ofs + i]; arr[i] = (b > 127 ? b - 256 : b) * t.escala; }
            ofs += n;
            tensores[t.nome] = arr;
        });
        return tensores;
    }
    function _conv(entrada, C, S, pesos, vies, F) {
        var So = S - 2, out = new Float32Array(F * So * So);
        for (var f = 0; f < F; f++) {
            for (var y = 0; y < So; y++) for (var x = 0; x < So; x++) {
                var s = vies[f];
                for (var c = 0; c < C; c++) {
                    var wb = ((f * C) + c) * 9, ib = c * S * S + y * S + x;
                    s += entrada[ib] * pesos[wb] + entrada[ib + 1] * pesos[wb + 1] + entrada[ib + 2] * pesos[wb + 2] +
                         entrada[ib + S] * pesos[wb + 3] + entrada[ib + S + 1] * pesos[wb + 4] + entrada[ib + S + 2] * pesos[wb + 5] +
                         entrada[ib + 2 * S] * pesos[wb + 6] + entrada[ib + 2 * S + 1] * pesos[wb + 7] + entrada[ib + 2 * S + 2] * pesos[wb + 8];
                }
                out[f * So * So + y * So + x] = s > 0 ? s : 0;
            }
        }
        return out;
    }
    function _pool(entrada, C, S) {
        var So = Math.floor(S / 2), out = new Float32Array(C * So * So);
        for (var c = 0; c < C; c++) for (var y = 0; y < So; y++) for (var x = 0; x < So; x++) {
            var b = c * S * S + 2 * y * S + 2 * x;
            out[c * So * So + y * So + x] = Math.max(entrada[b], entrada[b + 1], entrada[b + S], entrada[b + S + 1]);
        }
        return out;
    }
    function _densa(entrada, pesos, vies, nOut, relu) {
        var nIn = entrada.length, out = new Float32Array(nOut);
        for (var o = 0; o < nOut; o++) {
            var s = vies[o], wb = o * nIn;
            for (var i = 0; i < nIn; i++) s += pesos[wb + i] * entrada[i];
            out[o] = relu && s < 0 ? 0 : s;
        }
        return out;
    }
    function _softmax(v) {
        var m = -Infinity, i, s = 0, out = new Float32Array(v.length);
        for (i = 0; i < v.length; i++) if (v[i] > m) m = v[i];
        for (i = 0; i < v.length; i++) { out[i] = Math.exp(v[i] - m); s += out[i]; }
        for (i = 0; i < v.length; i++) out[i] /= s;
        return out;
    }
    function _classificar(modelo, x28) {
        var a = _conv(x28, 1, 28, modelo.c1w, modelo.c1b, 16);
        a = _pool(a, 16, 26);
        a = _conv(a, 16, 13, modelo.c2w, modelo.c2b, 32);
        a = _pool(a, 32, 11);
        a = _densa(a, modelo.d1w, modelo.d1b, 64, true);
        a = _densa(a, modelo.d2w, modelo.d2b, CLASSES, false);
        return _softmax(a);
    }

    var _modelos = null;
    function _obterModelos() {
        if (_modelos) return _modelos;
        var lista = (typeof OCR_DIGITOS_MODELOS !== "undefined") ? OCR_DIGITOS_MODELOS : (api.MODELOS || []);
        _modelos = lista.map(_carregarModelo);
        return _modelos;
    }
    // Conjunto: média das probabilidades das redes (e da imagem levemente
    // deslocada), o que reduz erros isolados de uma rede só.
    function _probDigito(x28) {
        var modelos = _obterModelos(), soma = new Float32Array(CLASSES), n = 0;
        modelos.forEach(function (m) {
            var p = _classificar(m, x28);
            for (var k = 0; k < CLASSES; k++) soma[k] += p[k];
            n++;
        });
        for (var k2 = 0; k2 < CLASSES; k2++) soma[k2] /= (n || 1);
        return soma;
    }

    // Separação guiada pela leitura: um glifo largo pode ser 1 dígito (ex.: um
    // "8" largo) ou vários encostados (ex.: "11"). Testa 1, 2, 3... partes e
    // fica com a divisão que a rede lê com mais confiança (com uma pequena
    // penalidade por parte extra, para não picotar dígito inteiro).
    function _opcoesDivisao(g, seg, tinta) {
        var prop = g.w / Math.max(1, g.h);
        var maxPartes = prop > 1.9 ? 4 : prop > 1.35 ? 3 : prop > 0.8 ? 2 : 1;
        var opcoes = [];
        for (var n = 1; n <= maxPartes; n++) {
            var partes = n === 1 ? [g] : _dividirGlifo(g, seg, n);
            var probs = [], nota = 0;
            for (var k = 0; k < partes.length; k++) {
                var p = _probDigito(_recorte28(partes[k], seg, tinta));
                var maxD = 0;
                for (var d = 0; d < 10; d++) if (p[d] > maxD) maxD = p[d];
                nota += Math.log(Math.max(1e-6, maxD));
                probs.push(p);
            }
            opcoes.push({ probs: probs, nota: nota / partes.length - 0.22 * (n - 1) });
        }
        opcoes.sort(function (a, b) { return b.nota - a.nota; });
        // Só as divisões plausíveis (perto da melhor) viram hipótese.
        return opcoes.filter(function (o, i) { return i === 0 || o.nota >= opcoes[0].nota - 0.9; }).slice(0, 3);
    }

    // Hipóteses do código inteiro: combinações das divisões de cada glifo
    // (no máximo 48), cada uma com a penalidade de não ser a melhor divisão.
    function _hipoteses(glifos, seg, tinta) {
        var porGlifo = glifos.map(function (g) { return _opcoesDivisao(g, seg, tinta); });
        var hips = [{ probs: [], pen: 0 }];
        porGlifo.forEach(function (ops) {
            var novas = [];
            hips.forEach(function (h) {
                ops.forEach(function (o) {
                    novas.push({ probs: h.probs.concat(o.probs), pen: h.pen + (ops[0].nota - o.nota) * o.probs.length });
                });
            });
            novas.sort(function (a, b) { return a.pen - b.pen; });
            hips = novas.slice(0, 48);
        });
        return hips;
    }

    // ── 6. Código: escolhe a leitura e confere com o banco ───────────────────
    function _chave(cod) {
        var c = String(cod == null ? "" : cod), i = 0;
        while (i < c.length - 1 && c.charAt(i) === "0") i++;
        return c.slice(i);
    }
    // Probabilidades por posição → melhores leituras (busca em feixe).
    function _leituras(probs, maxRes) {
        var feixe = [{ txt: "", p: 1 }];
        probs.forEach(function (pr) {
            var novo = [];
            feixe.forEach(function (f) {
                for (var d = 0; d < 10; d++) if (pr[d] > 0.002) novo.push({ txt: f.txt + d, p: f.p * pr[d] });
            });
            novo.sort(function (a, b) { return b.p - a.p; });
            feixe = novo.slice(0, 60);
        });
        return feixe.slice(0, maxRes || 60);
    }
    // Decide o código a partir de várias hipóteses de divisão. Junta as
    // leituras de todas (log-probabilidade menos a penalidade da divisão) e:
    //  • a mais provável existe no banco e é segura → "ok";
    //  • outra leitura plausível existe no banco → "corrigido"/"duvida";
    //  • duas leituras diferentes e plausíveis existem → "duvida" (nunca "ok");
    //  • "1" perdido no começo → sugestão "duvida"; senão "ilegivel".
    function _decidirHipoteses(hips, existe) {
        var mapa = Object.create(null), lixo = 0;
        hips.forEach(function (h, hi) {
            if (!h.probs.length) return;
            h.probs.forEach(function (p) { if (hi === 0) lixo = Math.max(lixo, p[CLASSE_LIXO]); });
            _leituras(h.probs, 40).forEach(function (l) {
                var lp = Math.log(Math.max(1e-30, l.p)) - h.pen;
                if (!mapa[l.txt] || mapa[l.txt].lp < lp) mapa[l.txt] = { txt: l.txt, lp: lp, n: h.probs.length };
            });
        });
        var cands = Object.keys(mapa).map(function (k) { return mapa[k]; }).sort(function (a, b) { return b.lp - a.lp; });
        if (!cands.length) return { texto: "", confianca: 0, status: "ilegivel", alternativas: [] };
        function conf(c) { return Math.exp(c.lp / c.n); }
        var top = cands[0];
        var alternativas = cands.slice(1, 4).map(function (c) { return c.txt; });
        if (!existe) {
            var cf = conf(top);
            return { texto: top.txt, confianca: cf, status: cf >= 0.85 && lixo < 0.5 ? "ok" : (cf >= 0.5 ? "duvida" : "ilegivel"), alternativas: alternativas };
        }
        var existentes = cands.filter(function (c) { return existe(c.txt); });
        var escolhido = null, status = null;
        if (existentes.length && existentes[0] === top && conf(top) >= 0.55 && lixo < 0.6) {
            escolhido = top; status = conf(top) >= 0.8 ? "ok" : "duvida";
        } else if (existentes.length && existentes[0].lp >= top.lp + Math.log(0.08) && conf(existentes[0]) >= 0.35) {
            escolhido = existentes[0]; status = conf(escolhido) >= 0.6 ? "corrigido" : "duvida";
        }
        if (escolhido) {
            // Outra leitura existente quase tão provável: ambíguo, confira.
            var rival = existentes[1];
            if (rival && rival.lp >= escolhido.lp + Math.log(0.25)) status = "duvida";
            return { texto: escolhido.txt, confianca: conf(escolhido), status: status,
                     alternativas: escolhido === top ? alternativas : [top.txt] };
        }
        // O "1" do início costuma se perder quando encosta na linha da coluna:
        // se só a versão com "1" na frente existe, sugere — sempre "confira".
        for (var j2 = 0; j2 < Math.min(cands.length, 5); j2++) {
            var c1 = "1" + cands[j2].txt;
            if (existe(c1) && conf(cands[j2]) >= 0.6) {
                return { texto: c1, confianca: conf(cands[j2]) * 0.8, status: "duvida", alternativas: [cands[j2].txt] };
            }
        }
        return { texto: top.txt, confianca: conf(top), status: "ilegivel", alternativas: alternativas };
    }
    // Compatível com a versão anterior: uma hipótese só.
    function _decidirCodigo(probs, existe) { return _decidirHipoteses([{ probs: probs, pen: 0 }], existe); }

    // ── API ──────────────────────────────────────────────────────────────────
    function lerImagem(img, opcoes) {
        opcoes = opcoes || {};
        var aoProgredir = typeof opcoes.aoProgredir === "function" ? opcoes.aoProgredir : function () {};
        var conjunto = null;
        if (opcoes.codigosExistentes && opcoes.codigosExistentes.length) {
            conjunto = Object.create(null);
            opcoes.codigosExistentes.forEach(function (c) { conjunto[_chave(c)] = true; });
        }
        var existe = conjunto ? function (t) { return !!conjunto[_chave(t)]; } : null;
        return new Promise(function (resolve, reject) {
            try {
                if (!img || !img.width || !img.height || !img.data) throw new Error("Imagem inválida.");
                aoProgredir(0.05, "Preparando a imagem...");
                var red = _reduzir(img);
                var tinta = _mapaTinta(red);
                aoProgredir(0.2, "Separando os números...");
                var seg = _segmentar(red, tinta);
                var palavras = seg.palavras.slice();
                // Ordem de leitura: colunas da esquerda para a direita, de cima para baixo.
                palavras.sort(function (a, b) { return a.x - b.x; });
                var colunas = [];
                palavras.forEach(function (p) {
                    var cx = p.x + p.w / 2, alvo = null;
                    for (var c = 0; c < colunas.length; c++) if (Math.abs(colunas[c].cx - cx) < seg.Hd * 2.2) { alvo = colunas[c]; break; }
                    if (!alvo) { alvo = { cx: cx, itens: [] }; colunas.push(alvo); }
                    alvo.itens.push(p);
                    alvo.cx = alvo.itens.reduce(function (s, q) { return s + q.x + q.w / 2; }, 0) / alvo.itens.length;
                });
                colunas.sort(function (a, b) { return a.cx - b.cx; });
                var ordem = [];
                colunas.forEach(function (c) {
                    c.itens.sort(function (a, b) { return a.y - b.y; });
                    c.itens.forEach(function (p) { p.tamColuna = c.itens.length; });
                    ordem = ordem.concat(c.itens);
                });

                var codigos = [], idx = 0, inv = 1 / red.escala;
                function passo() {
                    try {
                        var fim = Math.min(ordem.length, idx + 8);
                        for (; idx < fim; idx++) {
                            var p = ordem[idx];
                            var hips = _hipoteses(p.glifos, seg, tinta);
                            // Restos que a rede reconhece como "não é dígito" (traço solto,
                            // pedaço de hachura) saem; se sobrar pouco, é rabisco/ilegível.
                            var ilegivel = false;
                            hips.forEach(function (h, hi) {
                                var total = h.probs.length;
                                var limpos = h.probs.filter(function (q) { return q[CLASSE_LIXO] < 0.6; });
                                var ruim = limpos.length < 2 || (total - limpos.length) * 2 >= total;
                                if (!ruim) h.probs = limpos;
                                if (h.probs.length > 7) { h.probs = h.probs.slice(0, 7); ruim = true; }
                                if (hi === 0) ilegivel = ruim;
                            });
                            var probs = hips[0].probs;
                            var dec = _decidirHipoteses(hips, existe);
                            if (ilegivel) dec.status = "ilegivel";
                            else if (p.suspeito && dec.status !== "ilegivel") dec.status = "duvida";
                            // Sobra solta fora das colunas (borda da foto, objeto ao
                            // lado do papel) ou pedaço de 1–2 "dígitos" ilegível:
                            // não é código, então não vira círculo vermelho.
                            if (dec.status === "ilegivel" && (p.tamColuna < 3 || probs.length <= 2)) continue;
                            // Código de 1–2 dígitos é raro: nunca "certo". Vindo de um glifo
                            // só (letra, traço), nem é código.
                            if (dec.texto.length <= 2) {
                                if (p.glifos.length < 2) continue;
                                if (dec.status === "ok" || dec.status === "corrigido") dec.status = "duvida";
                            }
                            // Na borda da foto, ou sozinho numa "coluna" de 1–2 itens (texto
                            // solto, letras escritas de lado): só fica se o estoque confirmou.
                            if ((p.naBorda || p.tamColuna < 3) && dec.status !== "ok" && dec.status !== "corrigido") continue;
                            codigos.push({
                                texto: dec.texto, confianca: Math.round(dec.confianca * 1000) / 1000,
                                status: dec.status, alternativas: dec.alternativas,
                                caixa: { x: Math.round(p.x * inv), y: Math.round(p.y * inv), w: Math.round(p.w * inv), h: Math.round(p.h * inv) }
                            });
                        }
                        aoProgredir(0.25 + 0.75 * (idx / Math.max(1, ordem.length)), "Lendo os números (" + idx + " de " + ordem.length + ")...");
                        if (idx < ordem.length) { setTimeout(passo, 0); return; }
                        resolve({ codigos: codigos, alturaDigito: Math.round(seg.Hd * inv) });
                    } catch (e) { reject(e); }
                }
                setTimeout(passo, 0);
            } catch (e) { reject(e); }
        });
    }

    var api = {
        lerImagem: lerImagem,
        MODELOS: [],
        // expostos para testes
        _segmentar: _segmentar, _reduzir: _reduzir, _mapaTinta: _mapaTinta,
        _recorte28: _recorte28, _dividirGlifo: _dividirGlifo,
        _decidirCodigo: _decidirCodigo, _leituras: _leituras, _chave: _chave,
        _hipoteses: _hipoteses, _decidirHipoteses: _decidirHipoteses,
        _classificar: _classificar, _carregarModelo: _carregarModelo
    };
    return api;
}));
