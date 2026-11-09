# Consulta Estoque — Executável para Windows

> Desenvolvido por **Ruda Gabriel**

Esta pasta gera o **executável único** do Consulta Estoque: um só arquivo `.exe` que já traz o Node.js e o `node-firebird` embutidos. O PC que vai rodar o servidor **não precisa ter nada instalado**: nem Node.js, nem npm, nem o `.bat`.

## Qual arquivo usar

| Arquivo | Para quem |
|---|---|
| `ConsultaEstoque-<versão>-win-x64.exe` | Windows 10 ou 11 de **64 bits** (a grande maioria dos PCs). |
| `ConsultaEstoque-<versão>-win-x86.exe` | Windows 10 de **32 bits** (PCs antigos ou mais fracos). |

Para descobrir qual é o seu: **Configurações > Sistema > Sobre > Tipo de sistema**.

> **Windows 7 e 8.1 não são suportados:** as versões atuais do Node.js não rodam mais nesses sistemas. Nesses PCs, use o `consulta-estoque.bat` com uma versão antiga do Node.js.

## Como usar

1. Crie uma pasta para o sistema (ex.: `C:\ConsultaEstoque`) e copie o `.exe` para ela.
2. Dê dois cliques no `.exe`. Ele:
   - abre uma janela com as mensagens do servidor;
   - procura o banco do Small Commerce (`SMALL.FDB`) e conecta;
   - abre o navegador em `http://localhost:7888`.
3. Nos outros PCs da rede, acesse `http://IP-DESTE-PC:7888`.
4. Para encerrar, use o menu (**[0] Sair**), pressione **Ctrl+C** ou feche a janela. Os dados pendentes são gravados antes de sair.

### Menu do executável

Ao abrir o `.exe`, aparece um menu no console com:

| Opção | Faz |
|---|---|
| **[1]** | Abre a interface na janela de aplicativo. |
| **[2]** | Abre a pasta onde ficam os dados. |
| **[3]** | Recarrega os dados do banco (igual ao botão "Atualizar"). |
| **[4]** | Mostra as últimas mensagens do servidor. |
| **[5]** | Altera a porta (aplicada ao reiniciar). |
| **[6]** | Liga ou desliga o **modo sempre ativo** (abaixo). |
| **[0]** | Encerra o servidor. |

### Modo sempre ativo (opcional, com código)

Mantém o Consulta Estoque no ar o tempo todo, para que a página esteja sempre disponível na loja. Ao ligar pela opção **[6]**, você define um **código**. A partir daí:

- o servidor **inicia junto com o Windows** (sem precisar de administrador);
- um **guardião** reabre o servidor automaticamente se ele cair;
- fechar a janela **sem o código** apenas a **minimiza** — o servidor continua rodando;
- para **desligar o modo** ou **encerrar de vez**, é preciso digitar o **código**.

O modo é pensado para evitar que o servidor seja fechado **por acidente**, e é sempre reversível: você pode desligá-lo com o código e, em último caso, encerrar os processos (`ConsultaEstoque` e o guardião) pelo **Gerenciador de Tarefas**. O guardião reabre apenas o servidor; ele não se reinicia sozinho e para assim que o modo é desligado. O programa **não** bloqueia o Gerenciador de Tarefas, **não** se esconde e **não** se marca como processo crítico.

> Anote o código em um lugar seguro: sem ele, o modo sempre ativo não pode ser desligado pelo menu (só encerrando os processos pelo Gerenciador de Tarefas e apagando a entrada de inicialização).

Os arquivos de dados (`config.json`, `usados-estoque.json` e `lista-personalizada.json`) ficam **na mesma pasta do `.exe`**. Para atualizar o sistema, basta substituir o `.exe`; os dados são mantidos.

### Comportamentos do executável

- **Flags de linha de comando:** `--navegador-comum` (abre no navegador em vez da janela de aplicativo), `--sem-menu` (roda sem o menu), `--sem-navegador` (não abre nada), `--inicio-automatico` e `--guardiao` (usadas internamente pelo modo sempre ativo).
- **Segunda execução:** se o servidor já estiver aberto, o `.exe` apenas abre o navegador nele e fecha a nova janela.
- **Navegador:** para não abrir o navegador ao iniciar, adicione `"abrirNavegador": false` ao `config.json` ou execute com `--sem-navegador`.
- **Erro ao iniciar** (ex.: porta usada por outro programa): a janela permanece aberta até você pressionar Enter, para que a mensagem possa ser lida.
- **Aviso do Windows:** como o executável não tem assinatura digital paga, o Windows pode exibir "O Windows protegeu o computador". Clique em **Mais informações** e depois em **Executar assim mesmo**. A integridade do arquivo pode ser conferida pelo `SHA256SUMS.txt`.

## Como gerar o executável

### Com dois cliques (recomendado)

Dê dois cliques em **`gerar-executavel.bat`**, nesta pasta. Não é preciso instalar nada nem digitar comandos. Ele:

1. Na primeira vez, baixa um **Node.js portátil** (cerca de 30 MB) para dentro desta pasta, sem instalar nada no Windows e sem pedir administrador, e confere o SHA-256 com a lista oficial do nodejs.org.
2. Na primeira vez, instala as ferramentas de construção.
3. Gera os executáveis de **64 e 32 bits**.
4. Abre a pasta **`dist`** com os arquivos prontos.

Das próximas vezes, o processo é mais rápido, porque o Node.js portátil e as ferramentas já estão na pasta. É necessária conexão com a internet na primeira execução. Sem ela, o `.bat` tenta usar um Node.js 22 ou superior já instalado no PC.

### Pelo GitHub

Na aba **Actions** do repositório, abra **Gerar executável** e clique em **Run workflow**. Ao terminar, os `.exe` ficam disponíveis em **Artifacts**, na página da execução. Ao publicar uma tag `v*` (ex.: `v5.45.0`), o mesmo processo cria uma *Release* com os arquivos anexados.

### Por linha de comando

Para quem já tem o Node.js 22 ou superior, em Windows ou Linux:

```bash
cd executavel
npm install
npm run construir
```

Os arquivos são gerados em `executavel/dist/`, junto com o `SHA256SUMS.txt`.

| Comando | Gera |
|---|---|
| `npm run construir` | 64 e 32 bits |
| `npm run construir:x64` | Somente 64 bits |
| `npm run construir:x86` | Somente 32 bits |
| `node construir.js --alvos=linux-x64` | Binário Linux, para teste (só em Linux x64) |

## Como funciona

O `construir.js` usa o recurso oficial do Node.js para executáveis únicos (*Single Executable Applications*, SEA):

1. **esbuild:** junta o `consulta-estoque.js` e o `node-firebird` em um único script.
2. **Blob SEA:** o Node gera o blob do aplicativo a partir desse script.
3. **node.exe oficial:** baixa do nodejs.org o `node.exe` de cada arquitetura, na mesma versão do Node usada na construção, e confere o SHA-256 com a lista publicada.
4. **resedit:** grava nome, descrição, versão e autor nas propriedades do arquivo e remove a assinatura original do Node, que a injeção invalidaria.
5. **postject:** injeta o blob no `node.exe`, gerando o executável final.

A versão do executável é a mesma do `@version` do `consulta-estoque.js`.

## Créditos

Desenvolvido por **Ruda Gabriel**.
