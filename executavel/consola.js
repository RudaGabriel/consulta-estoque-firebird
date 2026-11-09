"use strict";

/**
 * consola.js
 *
 * @author Ruda Gabriel
 *
 * @version 1.0.0
 * @changelog
 *   1.0.0 - 2026-11-09 - Primeira versão. Painel interativo do executável do
 *     Consulta Estoque (menu no console) e o "modo sempre ativo", protegido
 *     por um código definido pelo usuário:
 *       - inicia com o Windows (entrada em HKCU\...\Run, sem administrador);
 *       - um guardião reabre o SERVIDOR se ele cair ou for fechado;
 *       - pede o código para encerrar pelo menu; sem o código, a janela é
 *         apenas minimizada.
 *     LIMITE DE PROJETO (intencional, não é falta): nada aqui impede o dono
 *     ou o administrador do PC de encerrar o programa. O guardião NUNCA se
 *     reergue sozinho — ele reabre apenas o servidor, e para de vez quando o
 *     código desliga o modo (config.sempreAtivo = false) ou quando é fechado
 *     no Gerenciador de Tarefas. O programa não bloqueia o Gerenciador de
 *     Tarefas, não se esconde e não se marca como processo crítico.
 *
 * Carregado apenas pelo executável (consulta-estoque.js, modo .exe). Recebe
 * do servidor tudo de que precisa por `deps`, para não duplicar lógica.
 */

const crypto = require("crypto");

// ── Helpers puros (também exportados, para os testes) ──────────────────────
function gerarSalt() {
    return crypto.randomBytes(8).toString("hex");
}

// Guarda só o hash do código (nunca o texto puro) no config.json.
function hashCodigo(codigo, salt) {
    return crypto.createHash("sha256").update(String(salt) + ":" + String(codigo)).digest("hex");
}

// Monta o menu como texto. Separado de qualquer E/S para poder ser testado.
// st: { appName, porta, itens, conectado, erro, sempreAtivo }
function renderMenu(st) {
    const W = 56;
    const temCor = !!(process.stdout && process.stdout.isTTY);
    const cor = (txt, c) => temCor ? ("\u001b[" + c + "m" + txt + "\u001b[0m") : String(txt);
    const borda = (e, m, d) => "  " + e + "═".repeat(W) + d;
    const top = borda("╔", 0, "╗");
    const meio = borda("╠", 0, "╣");
    const base = borda("╚", 0, "╝");
    const linha = (txt) => {
        const cru = " " + String(txt);
        const vis = cru.length >= W ? cru.slice(0, W) : cru + " ".repeat(W - cru.length);
        return "  ║" + vis + "║";
    };
    const out = [];
    out.push(top);
    out.push(cor(linha(st.appName + "   —   Consulta de Estoque"), "96;1"));
    out.push(meio);
    if (st.conectado) {
        out.push(cor(linha(" ●  Servidor ativo    http://localhost:" + st.porta), "92"));
    } else {
        out.push(cor(linha(" ●  Servidor no ar (sem banco)   porta " + st.porta), "93"));
    }
    out.push(linha(" Itens carregados: " + st.itens + (st.erro ? "   — " + st.erro : "")));
    out.push(linha(" Modo sempre ativo: " + (st.sempreAtivo
        ? cor("LIGADO", "92;1") : "desligado")));
    out.push(meio);
    out.push(linha(" [1] Abrir a janela do aplicativo"));
    out.push(linha(" [2] Abrir a pasta de dados"));
    out.push(linha(" [3] Atualizar (recarregar o banco)"));
    out.push(linha(" [4] Ver as últimas mensagens"));
    out.push(linha(" [5] Alterar a porta"));
    out.push(linha(" [6] Modo sempre ativo (código)..."));
    out.push(linha(" [0] Sair"));
    out.push(base);
    return out.join("\n") + "\n";
}

// ── Painel interativo + guardião ───────────────────────────────────────────
// deps reúne tudo que vem do servidor; ver a chamada em consulta-estoque.js.
function criarPainel(deps) {
    const { fs, path } = deps;
    const ehWindows = process.platform === "win32";
    const RUN_KEY = "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run";
    const RUN_NOME = "ConsultaEstoque";
    const PID_GUARDIAO = path.join(deps.PASTA_DADOS, "guardiao.pid");

    function escrever(txt) {
        try { process.stdout.write(txt); } catch (_) {}
    }

    // Executa um comando sem janela, sem travar se o programa não existir
    // (ex.: reg/explorer fora do Windows). onPronto(sucesso).
    function _rodar(cmd, args, onPronto) {
        try {
            const { spawn } = require("child_process");
            const f = spawn(cmd, args, { windowsHide: true, stdio: "ignore" });
            f.on("error", () => onPronto && onPronto(false));
            f.on("exit", c => onPronto && onPronto(c === 0));
        } catch (_) { if (onPronto) onPronto(false); }
    }

    // Caminho de autostart: o próprio .exe com a flag de início automático.
    function _comandoAutostart() {
        if (deps.ehExecutavel) return "\"" + deps.execPath + "\" --inicio-automatico";
        return "\"" + deps.execPath + "\" \"" + deps.scriptPath + "\" --inicio-automatico";
    }
    function instalarInicioWindows(onPronto) {
        if (!ehWindows) return onPronto && onPronto(false);
        _rodar("reg", ["add", RUN_KEY, "/v", RUN_NOME, "/t", "REG_SZ", "/d", _comandoAutostart(), "/f"], onPronto);
    }
    function removerInicioWindows(onPronto) {
        if (!ehWindows) return onPronto && onPronto(false);
        _rodar("reg", ["delete", RUN_KEY, "/v", RUN_NOME, "/f"], onPronto);
    }

    // Minimiza a janela do console (best-effort). Não esconde o processo: ele
    // continua visível no Gerenciador de Tarefas e na barra de tarefas.
    function minimizarJanela() {
        if (!ehWindows) return;
        const ps = [
            "try {",
            "Add-Type -Namespace Est -Name Win -MemberDefinition '",
            "[DllImport(\"kernel32.dll\")] public static extern System.IntPtr GetConsoleWindow();",
            "[DllImport(\"user32.dll\")] public static extern bool ShowWindowAsync(System.IntPtr h, int n);';",
            "[void][Est.Win]::ShowWindowAsync([Est.Win]::GetConsoleWindow(), 6)",
            "} catch { }"
        ].join(" ");
        const cod = Buffer.from(ps, "utf16le").toString("base64");
        _rodar("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-EncodedCommand", cod]);
    }

    function abrirPasta() {
        if (ehWindows) return _rodar("explorer.exe", [deps.PASTA_DADOS]);
        if (process.platform === "darwin") return _rodar("open", [deps.PASTA_DADOS]);
        _rodar("xdg-open", [deps.PASTA_DADOS]);
    }

    // Spawn de uma nova instância do SERVIDOR (usada só pelo guardião).
    function _spawnServidor() {
        try {
            const { spawn } = require("child_process");
            const args = deps.ehExecutavel
                ? ["--sempre-ativo", "--sem-navegador"]
                : [deps.scriptPath, "--sempre-ativo", "--sem-navegador"];
            const f = spawn(deps.execPath, args, { detached: true, stdio: "ignore", cwd: deps.PASTA_DADOS });
            f.unref();
        } catch (e) {
            deps.logTs("Guardião: falha ao reabrir o servidor (" + (e && e.message) + ").");
        }
    }

    // ── Guardião: reabre o servidor se ele cair. Nunca se reergue sozinho. ──
    function _guardiaoJaRodando() {
        try {
            const pid = parseInt(String(fs.readFileSync(PID_GUARDIAO, "utf8")).trim(), 10);
            if (!pid || pid === process.pid) return false;
            process.kill(pid, 0); // lança se o processo não existe
            return true;
        } catch (_) { return false; }
    }

    function rodarGuardiao() {
        if (_guardiaoJaRodando()) { process.exit(0); }
        try { fs.writeFileSync(PID_GUARDIAO, String(process.pid)); } catch (_) {}
        try { process.title = deps.APP_NAME + " - guardião"; } catch (_) {}
        minimizarJanela();
        deps.logTs("Guardião ativo: mantém o servidor no ar. Feche esta janela para parar o guardião.");
        let falhas = 0;
        const sair = () => { try { fs.unlinkSync(PID_GUARDIAO); } catch (_) {}; process.exit(0); };
        const tick = () => {
            // O código desligou o modo? O guardião encerra na hora.
            if (!deps.lerConfig().sempreAtivo) return sair();
            deps.verificarInstancia(ativa => {
                if (ativa) { falhas = 0; }
                else if (++falhas >= 2) { falhas = 0; _spawnServidor(); }
                setTimeout(tick, 5000).unref();
            });
        };
        tick();
        // Mantém o processo vivo mesmo sem handles pendentes.
        setInterval(() => {}, 1 << 30).unref();
    }

    function _iniciarGuardiaoDestacado() {
        try {
            const { spawn } = require("child_process");
            const args = deps.ehExecutavel ? ["--guardiao"] : [deps.scriptPath, "--guardiao"];
            const f = spawn(deps.execPath, args, { detached: true, stdio: "ignore", cwd: deps.PASTA_DADOS });
            f.unref();
        } catch (_) {}
    }

    // ── Menu interativo ────────────────────────────────────────────────────
    function iniciarMenu() {
        const readline = require("readline");
        let _encerrando = false;
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const pergunta = q => new Promise(res => rl.question(q, res));
        const limpar = () => { if (process.stdout.isTTY) escrever("\u001b[2J\u001b[H"); else escrever("\n"); };
        const pausa = () => pergunta("\n  Pressione Enter para voltar ao menu... ");

        function estadoMenu() {
            const e = deps.estado();
            return {
                appName: deps.APP_NAME, porta: e.porta, itens: e.itens,
                conectado: e.conectado, erro: e.erro,
                sempreAtivo: !!deps.lerConfig().sempreAtivo
            };
        }

        async function pedirCodigoNovo() {
            escrever("\n  Defina um código para ligar/desligar o modo sempre ativo.\n");
            escrever("  Guarde-o: sem ele, o modo não pode ser desligado pelo menu.\n\n");
            const c1 = (await pergunta("  Novo código (mínimo 4 caracteres): ")).trim();
            if (c1.length < 4) { escrever("\n  Código muito curto. Operação cancelada.\n"); return null; }
            const c2 = (await pergunta("  Repita o código: ")).trim();
            if (c1 !== c2) { escrever("\n  Os códigos não conferem. Operação cancelada.\n"); return null; }
            return c1;
        }

        function codigoConfere(codigo) {
            const c = deps.lerConfig();
            if (!c.sempreAtivoHash || !c.sempreAtivoSalt) return false;
            return hashCodigo(codigo, c.sempreAtivoSalt) === c.sempreAtivoHash;
        }

        async function ligarSempreAtivo() {
            const codigo = await pedirCodigoNovo();
            if (!codigo) return;
            const salt = gerarSalt();
            deps.salvarConfig(Object.assign(deps.lerConfig(), {
                sempreAtivo: true,
                sempreAtivoSalt: salt,
                sempreAtivoHash: hashCodigo(codigo, salt)
            }));
            await new Promise(res => instalarInicioWindows(ok => {
                escrever(ok ? "\n  Iniciar com o Windows: ativado.\n"
                            : "\n  Aviso: não foi possível ativar o início com o Windows.\n");
                res();
            }));
            _iniciarGuardiaoDestacado();
            escrever("  Modo sempre ativo LIGADO. O servidor será reaberto se cair,\n");
            escrever("  e fechar a janela sem o código apenas a minimiza.\n");
            escrever("  Você sempre pode encerrar tudo pelo Gerenciador de Tarefas.\n");
        }

        async function desligarSempreAtivo() {
            const codigo = (await pergunta("\n  Digite o código para desligar: ")).trim();
            if (!codigoConfere(codigo)) { escrever("\n  Código incorreto.\n"); return; }
            // O guardião encerra sozinho no próximo ciclo ao ver sempreAtivo=false.
            deps.salvarConfig(Object.assign(deps.lerConfig(), { sempreAtivo: false }));
            await new Promise(res => removerInicioWindows(() => res()));
            escrever("\n  Modo sempre ativo desligado. O início com o Windows foi removido\n");
            escrever("  e o guardião vai encerrar em instantes.\n");
        }

        async function submenuSempreAtivo() {
            limpar();
            const ligado = !!deps.lerConfig().sempreAtivo;
            escrever("\n  MODO SEMPRE ATIVO\n");
            escrever("  -----------------\n");
            escrever("  Mantém o Consulta Estoque no ar: inicia com o Windows e o\n");
            escrever("  servidor é reaberto se cair. Protegido por um código seu.\n\n");
            if (!ligado) {
                escrever("  Situação: desligado.\n\n");
                escrever("  [1] Ligar o modo sempre ativo\n  [0] Voltar\n\n");
                const op = (await pergunta("  Escolha: ")).trim();
                if (op === "1") { await ligarSempreAtivo(); await pausa(); }
            } else {
                escrever("  Situação: LIGADO.\n\n");
                escrever("  [1] Desligar o modo sempre ativo (pede o código)\n  [0] Voltar\n\n");
                const op = (await pergunta("  Escolha: ")).trim();
                if (op === "1") { await desligarSempreAtivo(); await pausa(); }
            }
        }

        // Saída: sem o modo, sai direto. Com o modo, o código desliga tudo e
        // sai; sem o código, a janela só minimiza (não fecha).
        async function tratarSaida() {
            if (!deps.lerConfig().sempreAtivo) return true;
            escrever("\n  O modo sempre ativo está LIGADO.\n");
            const codigo = (await pergunta("  Digite o código para encerrar (ou Enter para só minimizar): ")).trim();
            if (codigo && codigoConfere(codigo)) {
                deps.salvarConfig(Object.assign(deps.lerConfig(), { sempreAtivo: false }));
                await new Promise(res => removerInicioWindows(() => res()));
                return true;
            }
            escrever("\n  Mantendo o servidor no ar. A janela será minimizada.\n");
            minimizarJanela();
            return false;
        }

        async function loop() {
            limpar();
            escrever(renderMenu(estadoMenu()));
            const op = (await pergunta("  Escolha uma opção: ")).trim();
            switch (op) {
                case "1":
                    deps.abrirNavegador("http://localhost:" + deps.estado().porta);
                    escrever("\n  Abrindo a janela do aplicativo...\n"); await pausa();
                    break;
                case "2":
                    abrirPasta();
                    escrever("\n  Abrindo a pasta de dados:\n  " + deps.PASTA_DADOS + "\n"); await pausa();
                    break;
                case "3":
                    escrever("\n  " + (deps.solicitarRecarga("menu") === "agendada"
                        ? "Recarga agendada (uma carga já está em andamento)."
                        : "Recarregando os dados do banco...") + "\n"); await pausa();
                    break;
                case "4": {
                    const n = deps.bufferLog.length;
                    escrever("\n  Últimas mensagens:\n\n");
                    escrever((n ? deps.bufferLog.slice(-25).map(l => "  " + l).join("\n")
                                : "  (sem mensagens ainda)") + "\n"); await pausa();
                    break;
                }
                case "5": {
                    const v = (await pergunta("\n  Nova porta (1024 a 65535): ")).trim();
                    const p = parseInt(v, 10);
                    if (Number.isInteger(p) && p >= 1024 && p <= 65535) {
                        deps.salvarConfig(Object.assign(deps.lerConfig(), { portaEstoque: p }));
                        escrever("\n  Porta salva: " + p + ". Reinicie o programa para aplicar.\n");
                    } else {
                        escrever("\n  Porta inválida. Nada foi alterado.\n");
                    }
                    await pausa();
                    break;
                }
                case "6":
                    await submenuSempreAtivo();
                    break;
                case "0":
                    if (await tratarSaida()) { rl.close(); return deps.encerrar("menu: saída", 0); }
                    break;
                default:
                    break;
            }
            setImmediate(loop);
        }

        // Ctrl+C: mesma regra da opção [0].
        rl.on("SIGINT", async () => {
            if (await tratarSaida()) { _encerrando = true; rl.close(); deps.encerrar("menu: Ctrl+C", 0); }
        });
        // Entrada encerrada (EOF) sem o modo sempre ativo: encerra o programa em
        // vez de girar o laço. Com o modo ligado, o guardião mantém o servidor.
        rl.on("close", () => {
            if (!_encerrando && !deps.lerConfig().sempreAtivo) { _encerrando = true; deps.encerrar("entrada encerrada", 0); }
        });
        loop();
    }

    return { iniciarMenu, rodarGuardiao, minimizar: minimizarJanela };
}

module.exports = { gerarSalt, hashCodigo, renderMenu, criarPainel };
