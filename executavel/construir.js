"use strict";

/**
 * construir.js
 *
 * @author Ruda Gabriel
 *
 * @version 1.0.0
 * @changelog
 *   1.0.0 - 2026-11-09 - Primeira versão. Gera o executável único do
 *     Consulta Estoque com o Node SEA (Single Executable Application):
 *     consulta-estoque.js + node-firebird empacotados com o esbuild num só
 *     script, injetado no node.exe oficial (baixado do nodejs.org e conferido
 *     pelo SHA-256 publicado). Alvos: Windows 64 bits e 32 bits; linux-x64
 *     opcional, para teste. Propriedades do arquivo (nome, versão, autor)
 *     gravadas com o resedit.
 *
 * USO (na pasta executavel/):
 *   npm install
 *   npm run construir                       → dist/ com win-x64 e win-x86
 *   node construir.js --alvos=win-x64       → só 64 bits
 *   node construir.js --alvos=linux-x64     → binário Linux, para teste local
 *
 * REQUISITOS: Node.js 22 ou superior. O node.exe embutido é da MESMA versão do
 * Node que executa este script (o blob SEA só roda na versão que o gerou).
 */

const fs     = require("fs");
const path   = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const RAIZ   = path.resolve(__dirname, "..");
const DIST   = path.join(__dirname, "dist");
const CACHE  = path.join(__dirname, ".cache");
const TEMP   = path.join(__dirname, ".construcao");
const NODE_V = process.version;                              // ex.: v22.23.4
const FUSIVEL_SEA = "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2";
const ALVOS_VALIDOS = ["win-x64", "win-x86", "linux-x64"];

function sair(msg) {
    console.error("\n[ERRO] " + msg);
    process.exit(1);
}

function lerAlvos() {
    const arg = process.argv.find(a => a.startsWith("--alvos="));
    const alvos = arg ? arg.slice(8).split(",").map(s => s.trim()).filter(Boolean) : ["win-x64", "win-x86"];
    for (const a of alvos) {
        if (ALVOS_VALIDOS.indexOf(a) === -1) sair("Alvo inválido: " + a + " (válidos: " + ALVOS_VALIDOS.join(", ") + ").");
    }
    if (alvos.indexOf("linux-x64") !== -1 && !(process.platform === "linux" && process.arch === "x64")) {
        sair("O alvo linux-x64 só pode ser gerado em Linux x64 (usa o próprio Node desta máquina).");
    }
    return alvos;
}

// Versão do aplicativo = @version do cabeçalho do consulta-estoque.js.
function lerVersaoApp() {
    const src = fs.readFileSync(path.join(RAIZ, "consulta-estoque.js"), "utf8");
    const m = /@version\s+(\d+)\.(\d+)\.(\d+)/.exec(src);
    if (!m) sair("@version não encontrado no cabeçalho do consulta-estoque.js.");
    return { texto: m[1] + "." + m[2] + "." + m[3], partes: [Number(m[1]), Number(m[2]), Number(m[3])] };
}

function sha256(buf) {
    return crypto.createHash("sha256").update(buf).digest("hex");
}

async function baixar(url, tentativas) {
    let ultimoErro = null;
    for (let i = 1; i <= tentativas; i++) {
        try {
            const r = await fetch(url);
            if (!r.ok) throw new Error("HTTP " + r.status);
            return Buffer.from(await r.arrayBuffer());
        } catch (e) {
            ultimoErro = e;
            if (i < tentativas) await new Promise(res => setTimeout(res, 2000 * i));
        }
    }
    throw new Error("falha ao baixar " + url + ": " + (ultimoErro && ultimoErro.message));
}

let _somas = null;
async function somasOficiais() {
    if (!_somas) {
        const txt = (await baixar("https://nodejs.org/dist/" + NODE_V + "/SHASUMS256.txt", 3)).toString("utf8");
        _somas = new Map();
        for (const linha of txt.split("\n")) {
            const m = /^([0-9a-f]{64})\s+(\S+)$/.exec(linha.trim());
            if (m) _somas.set(m[2], m[1]);
        }
    }
    return _somas;
}

// node.exe oficial do alvo, com cache local conferido pelo SHA-256 publicado.
async function nodeExeOficial(alvo) {
    const nome = alvo + "/node.exe";
    const esperado = (await somasOficiais()).get(nome);
    if (!esperado) sair("O nodejs.org não publica " + nome + " para " + NODE_V + ".");
    const arq = path.join(CACHE, NODE_V + "-" + alvo + "-node.exe");
    if (fs.existsSync(arq) && sha256(fs.readFileSync(arq)) === esperado) return fs.readFileSync(arq);
    console.log("  Baixando " + nome + " (" + NODE_V + ")...");
    const buf = await baixar("https://nodejs.org/dist/" + NODE_V + "/" + nome, 3);
    if (sha256(buf) !== esperado) sair("SHA-256 do " + nome + " não confere com o publicado pelo nodejs.org.");
    fs.writeFileSync(arq, buf);
    return buf;
}

// Remove a assinatura digital do node.exe (a injeção a invalidaria) e grava
// nome, descrição, autor e versão nas propriedades do arquivo.
function ajustarPropriedadesWindows(buf, versao, alvo) {
    const ResEdit = require("resedit");
    const exe = ResEdit.NtExecutable.from(buf, { ignoreCert: true });
    const res = ResEdit.NtExecutableResource.from(exe);
    const vi  = ResEdit.Resource.VersionInfo.fromEntries(res.entries)[0];
    if (vi) {
        const [a, b, c] = versao.partes;
        const nomeArq = "ConsultaEstoque-" + versao.texto + "-" + alvo + ".exe";
        const valores = {
            CompanyName:      "Ruda Gabriel",
            FileDescription:  "Consulta Estoque - estoque disponível do Small Commerce (Firebird)",
            ProductName:      "Consulta Estoque",
            LegalCopyright:   "Ruda Gabriel",
            InternalName:     "ConsultaEstoque",
            OriginalFilename: nomeArq,
            FileVersion:      versao.texto,
            ProductVersion:   versao.texto
        };
        for (const idioma of vi.getAllLanguagesForStringValues()) vi.setStringValues(idioma, valores);
        vi.setFileVersion(a, b, c, 0);
        vi.setProductVersion(a, b, c, 0);
        vi.outputToResourceEntries(res.entries);
    }
    res.outputResource(exe);
    return Buffer.from(exe.generate());
}

async function main() {
    const maior = Number(NODE_V.slice(1).split(".")[0]);
    if (!(maior >= 22)) sair("Use o Node.js 22 ou superior para construir (atual: " + NODE_V + ").");
    let esbuild, postject;
    try {
        esbuild  = require("esbuild");
        postject = require("postject");
        require.resolve("resedit");
        require.resolve("node-firebird");
    } catch (_) {
        sair("Dependências ausentes. Execute \"npm install\" na pasta executavel/.");
    }

    const alvos  = lerAlvos();
    const versao = lerVersaoApp();
    for (const d of [DIST, CACHE, TEMP]) fs.mkdirSync(d, { recursive: true });

    console.log("Consulta Estoque " + versao.texto + " | Node " + NODE_V + " | alvos: " + alvos.join(", "));

    // 1) Um único script com o servidor e o node-firebird.
    console.log("1/3 Empacotando o servidor com o esbuild...");
    const bundle = path.join(TEMP, "consulta-estoque.bundle.js");
    esbuild.buildSync({
        entryPoints: [path.join(RAIZ, "consulta-estoque.js")],
        bundle:      true,
        platform:    "node",
        target:      "node22",
        format:      "cjs",
        outfile:     bundle,
        nodePaths:   [path.join(__dirname, "node_modules")],
        legalComments: "none",
        logLevel:    "error"
    });

    // 2) Blob SEA (sem cache de código: o mesmo blob serve para 64 e 32 bits).
    console.log("2/3 Gerando o blob SEA...");
    const blob = path.join(TEMP, "sea-prep.blob");
    const configSea = path.join(TEMP, "sea-config.json");
    fs.writeFileSync(configSea, JSON.stringify({
        main: bundle,
        output: blob,
        disableExperimentalSEAWarning: true,
        useSnapshot: false,
        useCodeCache: false
    }, null, 2));
    execFileSync(process.execPath, ["--experimental-sea-config", configSea], { stdio: "inherit" });
    const dadosBlob = fs.readFileSync(blob);

    // 3) Um executável por alvo.
    console.log("3/3 Gerando os executáveis...");
    const somas = [];
    for (const alvo of alvos) {
        const ehWindows = alvo.startsWith("win-");
        const nomeArq = "ConsultaEstoque-" + versao.texto + "-" + alvo + (ehWindows ? ".exe" : "");
        const saida = path.join(DIST, nomeArq);
        let base = ehWindows ? await nodeExeOficial(alvo) : fs.readFileSync(process.execPath);
        if (ehWindows) base = ajustarPropriedadesWindows(base, versao, alvo);
        fs.writeFileSync(saida, base);
        await postject.inject(saida, "NODE_SEA_BLOB", dadosBlob, { sentinelFuse: FUSIVEL_SEA });
        if (!ehWindows) fs.chmodSync(saida, 0o755);
        const final = fs.readFileSync(saida);
        somas.push(sha256(final) + "  " + nomeArq);
        console.log("  OK " + nomeArq + " (" + (final.length / 1048576).toFixed(1) + " MB)");
    }
    fs.writeFileSync(path.join(DIST, "SHA256SUMS.txt"), somas.join("\n") + "\n");
    console.log("\nPronto. Arquivos em: " + DIST);
}

main().catch(e => sair(e && (e.stack || e.message) || String(e)));
