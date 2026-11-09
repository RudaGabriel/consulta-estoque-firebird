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
4. Para encerrar, pressione **Ctrl+C** ou feche a janela. Os dados pendentes são gravados antes de sair.

Os arquivos de dados (`config.json`, `usados-estoque.json` e `lista-personalizada.json`) ficam **na mesma pasta do `.exe`**. Para atualizar o sistema, basta substituir o `.exe`; os dados são mantidos.

### Comportamentos do executável

- **Segunda execução:** se o servidor já estiver aberto, o `.exe` apenas abre o navegador nele e fecha a nova janela.
- **Navegador:** para não abrir o navegador ao iniciar, adicione `"abrirNavegador": false` ao `config.json` ou execute com `--sem-navegador`.
- **Erro ao iniciar** (ex.: porta usada por outro programa): a janela permanece aberta até você pressionar Enter, para que a mensagem possa ser lida.
- **Aviso do Windows:** como o executável não tem assinatura digital paga, o Windows pode exibir "O Windows protegeu o computador". Clique em **Mais informações** e depois em **Executar assim mesmo**. A integridade do arquivo pode ser conferida pelo `SHA256SUMS.txt`.

## Como gerar o executável

### Pelo GitHub (recomendado)

Na aba **Actions** do repositório, abra **Gerar executável** e clique em **Run workflow**. Ao terminar, os `.exe` ficam disponíveis em **Artifacts**, na página da execução. Ao publicar uma tag `v*` (ex.: `v5.45.0`), o mesmo processo cria uma *Release* com os arquivos anexados.

### Localmente

Requer o Node.js 22 ou superior, em Windows ou Linux:

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
