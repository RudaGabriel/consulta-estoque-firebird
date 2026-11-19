<div align="center">

# 📦 Consulta de Estoque

### Consulta do estoque disponível de um ERP com banco Firebird, com combinações de produtos que somam um valor em R$, Modo Automático e leitura de listas escritas à mão por foto

<img alt="sistema: v5.70.0" src="https://img.shields.io/badge/sistema-v5.70.0-2563EB?style=flat">
<img alt="plataforma: Windows" src="https://img.shields.io/badge/plataforma-Windows%20%28servidor%29%20%C2%B7%20qualquer%20navegador-0078D4?style=flat&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nd2hpdGUnPjxyZWN0IHg9JzMnIHk9JzMnIHdpZHRoPSc4JyBoZWlnaHQ9JzgnLz48cmVjdCB4PScxMycgeT0nMycgd2lkdGg9JzgnIGhlaWdodD0nOCcvPjxyZWN0IHg9JzMnIHk9JzEzJyB3aWR0aD0nOCcgaGVpZ2h0PSc4Jy8%2BPHJlY3QgeD0nMTMnIHk9JzEzJyB3aWR0aD0nOCcgaGVpZ2h0PSc4Jy8%2BPC9zdmc%2B&logoColor=white">
<img alt="idioma: pt-BR" src="https://img.shields.io/badge/idioma-pt--BR-16A34A?style=flat">
<img alt="banco: somente leitura" src="https://img.shields.io/badge/banco-somente%20leitura-DC2626?style=flat&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nbm9uZScgc3Ryb2tlPSd3aGl0ZScgc3Ryb2tlLXdpZHRoPScyLjInIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCc%2BPHBhdGggZD0nTTEyIDIyczgtNCA4LTEwVjVsLTgtMy04IDN2N2MwIDYgOCAxMCA4IDEweicvPjxwYXRoIGQ9J205IDEyIDIgMiA0LTQnLz48L3N2Zz4%3D&logoColor=white">
<img alt="funciona: sem internet" src="https://img.shields.io/badge/funciona-sem%20internet-0891B2?style=flat">
<img alt="testes: 161 passando" src="https://img.shields.io/badge/testes-161%20passando-22C55E?style=flat&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nbm9uZScgc3Ryb2tlPSd3aGl0ZScgc3Ryb2tlLXdpZHRoPScyLjInIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCc%2BPHBhdGggZD0nTTkgMnY2TDQgMTlhMiAyIDAgMCAwIDEuOCAzaDEyLjRhMiAyIDAgMCAwIDEuOC0zTDE1IDhWMicvPjxwYXRoIGQ9J004IDJoOCcvPjxwYXRoIGQ9J003IDE1aDEwJy8%2BPC9zdmc%2B&logoColor=white">
<img alt="licença: proprietária" src="https://img.shields.io/badge/licen%C3%A7a-propriet%C3%A1ria-6B7280?style=flat">

<img alt="Node.js: 18+" src="https://img.shields.io/badge/Node.js-18%2B-339933?style=flat&logo=nodedotjs&logoColor=white">
<img alt="JavaScript: sem framework" src="https://img.shields.io/badge/JavaScript-sem%20framework-F7DF1E?style=flat&logo=javascript&logoColor=black">
<img alt="HTML5" src="https://img.shields.io/badge/HTML5-interface%20web-E34F26?style=flat&logo=html5&logoColor=white">
<img alt="CSS" src="https://img.shields.io/badge/CSS-tema%20escuro-1572B6?style=flat&logo=css&logoColor=white">
<img alt="Firebird: ERP" src="https://img.shields.io/badge/Firebird-banco%20do%20ERP-B71C1C?style=flat&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nbm9uZScgc3Ryb2tlPSd3aGl0ZScgc3Ryb2tlLXdpZHRoPScyLjInIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCc%2BPGVsbGlwc2UgY3g9JzEyJyBjeT0nNScgcng9JzknIHJ5PSczJy8%2BPHBhdGggZD0nTTMgNXYxNGE5IDMgMCAwIDAgMTggMFY1Jy8%2BPHBhdGggZD0nTTMgMTJhOSAzIDAgMCAwIDE4IDAnLz48L3N2Zz4%3D&logoColor=white">
<img alt="node-firebird" src="https://img.shields.io/badge/node--firebird-driver-CB3837?style=flat&logo=npm&logoColor=white">
<img alt="Server-Sent Events" src="https://img.shields.io/badge/SSE-tempo%20real-7C3AED?style=flat">
<img alt="Redes neurais: leitor por foto" src="https://img.shields.io/badge/redes%20neurais-leitor%20por%20foto%2C%20offline-DB2777?style=flat">
<img alt="PyTorch: treino" src="https://img.shields.io/badge/PyTorch-treino%20das%20redes-EE4C2C?style=flat&logo=pytorch&logoColor=white">
<img alt="node:test" src="https://img.shields.io/badge/node%3Atest-testes%20nativos-5FA04E?style=flat&logo=nodedotjs&logoColor=white">
<img alt="Playwright: teste da tela" src="https://img.shields.io/badge/Playwright-teste%20da%20tela-2EAD33?style=flat&logo=playwright&logoColor=white">

**Estoque em tempo real na rede da loja · Combinações que fecham o valor (Agrupar e Combinar) · Modo Automático para listas inteiras · Lista personalizada com leitura por foto · Acha o banco sozinho na rede · Nunca escreve no banco · Grátis e sem internet**

[Instalar](#instalacao) · [Usar](#uso) · [Modo Automático](#automatico) · [Lista personalizada](#lista) · [Leitura por foto](#foto) · [Banco](#banco) · [Configurar](#configuracao) · [Arquivos](#arquivos) · [API](#api) · [Segurança](#seguranca) · [Problemas](#problemas)

</div>

---

## O que é

Um sistema web que roda **num PC da loja** e é aberto **pelo navegador**, nesse computador ou em qualquer outro da mesma rede. Ele lê o estoque do banco Firebird do ERP e ajuda a **montar combinações de produtos que somam um valor em reais**, para fechar valores de cartão, crédito, PIX ou entregas com itens que realmente existem em estoque.

| | |
|---|---|
| 📊 **Estoque disponível** | Só itens com estoque real (> 0), sem inativos e sem os termos **proibidos** que você configurar. Colunas de código, descrição, estoque, código de barras, preço e última venda detectadas sozinhas. |
| 🧮 **Agrupar e Combinar** | Pares e trios de itens diferentes, ou combinações repetindo o mesmo item, que somam o valor procurado (até + R$ 40), respeitando o estoque mínimo. |
| ⚡ **Modo Automático** | Processa uma lista inteira de pedidos de uma vez, pelo preço de venda ou pelo **custo de compra + 10%**, descontando o que cada linha já usou. Confere listas já preenchidas e só refaz o que mudou. |
| 📝 **Lista personalizada** | Códigos fixos com estoque de parada, guardados no servidor e iguais em todos os PCs, com alertas de código esgotado, inativo ou excluído. |
| 📷 **Leitura por foto** | Fotografe uma folha com códigos escritos à mão e a lista se preenche sozinha, com revisão na foto numerada. Grátis, sem internet, nenhuma foto sai do computador. |
| ✅ **Controle de usados** | Item usado vai para o fim da fila e não é sugerido de novo até a fila ser limpa; o estado é compartilhado entre todos os PCs. |
| 🌐 **Acha o banco sozinho** | Procura o servidor **pela rede primeiro** e só por último o Firebird desta máquina. |
| 🔄 **Tempo real** | Todas as abas abertas se atualizam sozinhas (Server-Sent Events) quando os dados mudam. |
| 🔒 **Somente leitura** | Nunca grava nada no banco do ERP. |

<a id="instalacao"></a>

## 🚀 Instalação

> **Requisitos:** Windows (o inicializador `.bat` é para Windows; o servidor em si roda em qualquer sistema com Node.js) · **Node.js 18 ou mais novo** (o `.bat` instala o Node 22 LTS sozinho se não houver nenhum) · módulo **`node-firebird`** (também instalado pelo `.bat`) · acesso de rede ao servidor Firebird (porta **3050** por padrão).

1. Copie os arquivos do projeto para uma pasta do PC que vai rodar o servidor.
2. Dê dois cliques em **`consulta-estoque.bat`**. Ele:
   - instala o Node.js, se necessário (pede permissão de administrador);
   - instala o `node-firebird`, tentando primeiro o cache local e depois a internet;
   - lê a porta do `config.json` (padrão **7888**);
   - roda as verificações de integridade e os testes; se algo falhar, avisa e segue sozinho em 5 segundos;
   - se já houver um servidor antigo na porta, encerra-o sozinho sem perder dados;
   - inicia o servidor e **abre o navegador** em `http://localhost:7888`;
   - se o servidor cair, **reinicia sozinho** (até 5 vezes seguidas).

   **Não é preciso apertar nada na janela.** Em erro grave (Node.js ausente, porta ocupada por outro programa), a mensagem fica na tela e a janela fecha sozinha em 60 segundos.
3. Nos outros PCs da rede, acesse `http://IP-DO-SERVIDOR:7888`.
4. Para encerrar, pressione **0** na janela do `.bat`. Os dados pendentes são gravados antes de sair. **Ctrl+C** e fechar a janela também gravam antes de sair.

Também é possível iniciar manualmente:

```bash
npm install node-firebird
node consulta-estoque.js
```

<details>
<summary><b>🖼️ Ícone da aba (favicon)</b></summary>

Para trocar o ícone que aparece na aba do navegador, coloque um arquivo chamado **`favicon`** na mesma pasta do `consulta-estoque.js`. Formatos aceitos: `.ico`, `.png`, `.svg`, `.webp`, `.jpg`, `.jpeg` ou `.gif`, com até 1 MB. Não é preciso configurar nada nem reiniciar o servidor: basta recarregar a página. Se houver mais de um, vale o primeiro desta ordem: `.ico`, `.png`, `.svg`, `.webp`, `.jpg`, `.jpeg`, `.gif`. Sem o arquivo, o navegador usa o ícone padrão.

</details>

> 💡 O `node-firebird.bat` é um instalador avulso, só do Node.js e do módulo `node-firebird`, útil para preparar a máquina sem iniciar o servidor.

---

<a id="uso"></a>

## 🖥️ Uso no dia a dia

| Recurso | Descrição |
|---|---|
| **Busca** | Por descrição, código ou código de barras (EAN). Aceita filtros de estoque: `>200`, `<10`, e combinados com texto, como `produto>10`. |
| **Busca personalizada** | Vários termos de uma vez (um por linha ou separados por vírgula). Mostra quais termos não encontraram nenhum item. |
| **Busca por valor (R$)** | A tabela mostra só os itens com o **preço exato** informado, em todos os modos. Ligue o **Agrupar** ou o **Combinar** para ver também as combinações que somam o valor, em painéis acima da tabela. |
| **Agrupar** | Encontra **pares e trios de itens diferentes** cuja soma fica entre o valor e o valor + R$ 40, respeitando o estoque mínimo. |
| **Combinar** | Encontra combinações **com repetição do mesmo item** (ex.: `3×08395`) cuja soma fica entre o valor e o valor + R$ 40, respeitando o estoque disponível. Os itens só são marcados como usados depois que você confirma. |
| **Usar** | Copia o código para a área de transferência e marca o item como usado. Antes disso, avisa se o uso deixaria o estoque abaixo do mínimo. |
| **Ordenação** | Por estoque, preço ou data da última venda, crescente ou decrescente (a escolha fica salva no navegador). |
| **Copiar coluna** | Um clique no cabeçalho **Código** ou **Cód. Barras** copia todos os valores do filtro atual, não só as linhas visíveis. |
| **Itens exibidos** | Limite de linhas na tabela. A tabela é desenhada aos poucos, conforme a rolagem, para não travar com milhares de itens. |
| **Atualizar** | Recarrega o estoque do banco na hora. |
| **Limpar itens usados** | Devolve todos os itens usados para o início da fila. Em telas estreitas, o texto do botão encolhe com reticências em vez de quebrar a barra. |
| **Configurações (⚙)** | Host, porta, caminho do `.FDB`, usuário e senha do Firebird, porta HTTP, nome da aplicação, estoque mínimo, máximo de itens e palavras proibidas. Quase tudo é aplicado sem reiniciar o servidor. |

---

<a id="automatico"></a>

## ⚡ Modo Automático

Processa uma **lista inteira de valores** de uma vez. Cole linhas no formato:

```
Pedido 1:
139,00  CREDITO
Pedido 2:
177,00  CREDITO | 23,00  PIX
Pedido 3:
197,00  PIX  [NAO ENCONTRADO]
```

- Cada pedido começa com o **valor** no início da linha. Linhas que não começam com número (como `Pedido 1:` ou o nome do vendedor) são mantidas como títulos.
- Para **mais de uma forma de pagamento** no mesmo pedido, separe por `|` (ex.: `177,00 CREDITO | 23,00 PIX`). Cada valor recebe os seus códigos, e o resultado volta na mesma linha, separado por ` | `.

**Lista que já tem códigos (resultado anterior):** se você colar de volta uma lista já processada, o sistema **não refaz** as linhas. Ele só **confere no estoque atual**, na ordem da lista, se cada código ainda existe e se a quantidade usada cabe sem deixar o estoque negativo, somando o que as linhas anteriores já usaram. Com a lista personalizada ligada, também respeita o estoque de parada de cada código. A linha que passar sai igual. Só é refeita a linha com código que não existe mais, que está sem estoque suficiente ou cuja soma ficou abaixo do valor. Se a linha tiver mais de um resultado, fica o primeiro que passar. No fim, a mensagem mostra quantos pedidos foram mantidos e quantos foram refeitos, com o motivo.

Para cada linha nova (ou refeita), o sistema:

1. **Sincroniza o estoque** com o banco antes de começar, para nunca trabalhar com números velhos.
2. Procura **a combinação de itens que mais se aproxima do valor**: primeiro o valor exato, depois dentro da tolerância de + R$ 40.
3. **Desconta o que já foi usado nas linhas anteriores** da mesma lista, para não sugerir mais unidades do que existem.
4. Se não achar nada, pode **ampliar a faixa** de tolerância e **buscar mais itens no catálogo completo** do banco (até 5 rodadas de 1.000 itens).
5. Escreve o resultado ao lado de cada linha (`[NAO ENCONTRADO]` é substituído pelos códigos encontrados) e **leva a tela até o botão "Copiar resultado"**. Depois de copiar, os códigos podem ser marcados como usados.

**Valor de referência** (escolha no topo do Modo Automático; fica guardada no navegador):

| Opção | O que soma para chegar ao valor pedido |
|---|---|
| **Normal** (padrão) | O **preço de venda** de cada produto, como sempre funcionou. |
| **Custo de compra** | O **custo de compra + 10%** de cada produto. Junta vários produtos (e repete o mesmo, se o estoque permitir) até chegar ao **valor exato ou acima** — nunca abaixo. Até **R$ 3,00 acima** é aceito sozinho; mais que isso, o sistema **pergunta** se quer usar a combinação ou deixar a linha como não encontrada. Cada código sai com o valor usado: `268,00 DEBITO → 10014(R$149,05) 10011(R$99,00) 10002(R$20,02)`. Produtos sem custo de compra no banco ficam de fora. |

**Custo de compra superior ao preço de venda:** no modo custo, se um produto escolhido tem o custo de compra maior que o preço de venda, aparece um aviso com o custo, o valor usado (+10%), o preço atual, a diferença e a margem. Você decide:

- **Excluir o produto da composição** — *Somente nesta consulta*, *Até o fim do dia* ou *Até a correção do preço* (recomendado: o produto volta automaticamente quando o preço for corrigido no ERP).
- **Manter o produto na composição** — *Somente nesta consulta* ou *Até alteração de custo ou preço* (não avisa de novo enquanto custo e preço forem os mesmos; se mudarem, o aviso volta).
- Marque **"Aplicar a mesma decisão aos demais produtos"** para decidir de uma vez por todos os produtos nessa condição.

As decisões ficam no Modo Automático em **Decisões registradas** (botão **Ver**), com **Revogar** em cada produto ou **Revogar todas**.

O custo de compra é lido da coluna `CUSTOCOMPR` do ERP (ou equivalente: `CUSTO_COMPRA`, `PRECO_CUSTO`, `CUSTOMEDIO`...). O log mostra qual coluna foi usada em `Colunas: ... CUSTO=...`.

Opções:

- **Reaproveitar código:** permite repetir o mesmo código em linhas diferentes, até o limite do estoque. Fica indisponível (apagado) só enquanto **Usar lista personalizada** estiver ligado, porque a lista já reaproveita os códigos dela.
- **Usar lista personalizada:** restringe a busca aos códigos que você cadastrou (veja abaixo).

---

<a id="lista"></a>

## 📝 Lista personalizada

É uma lista fixa de códigos (até **1.000**) que o Modo Automático pode usar com prioridade, **mesmo que estejam abaixo do estoque mínimo ou fora do limite de itens carregados**.

- Formato: um código por linha, com **estoque de parada** opcional: `00278, 30` significa "use o 00278 até sobrarem 30 unidades".
- Códigos duplicados são removidos automaticamente.
- Códigos digitados sem os zeros à esquerda (`703`) são reconhecidos como a forma completa do banco (`00703`).
- A lista fica gravada no servidor (`lista-personalizada.json`) e aparece igual em todos os PCs.
- **Alertas automáticos**, com as opções **Excluir** ou **Deixar para depois**, quando um código:
  - não existe mais no banco;
  - está **inativo** no ERP;
  - está com estoque **negativado** ou **zerado**;
  - atingiu o **estoque de parada** configurado.

  O alerta de "não existe mais no banco" só aparece quando o servidor **confirmou** a consulta de todos os códigos. Uma falha de rede ou de banco nunca gera esse alerta.

<a id="foto"></a>

## 📷 Leitura de códigos por foto

Em vez de digitar, você pode **fotografar uma folha com os códigos escritos à mão** (em colunas, como numa lista de papel) e o sistema preenche a lista sozinho.

1. No painel da lista personalizada, clique em **Ler códigos de uma foto** (ou cole a foto com **Ctrl+V**, ou arraste o arquivo para o painel).
2. Em poucos segundos abre a revisão: a foto com cada código marcado e **numerado**, e ao lado a lista com os mesmos números. A lista vem na ordem do que precisa de você: **primeiro os não lidos, depois os para conferir, depois os ajustados pelo estoque e por último os lidos com segurança**.
   - **Verde:** lido com segurança e confirmado no estoque.
   - **Azul:** um dígito estava em dúvida e foi ajustado pelo código que existe no estoque.
   - **Amarelo:** confira (leitura incerta, código fora do estoque ou perto de um risco/hachura, onde um dígito pode ter se perdido).
   - **Círculo vermelho:** não foi possível ler. Digite o código no campo ao lado, olhando o círculo na foto.
3. Clique num código da lista (ou no campo dele) e a foto **destaca esse código por 3 segundos**: o resto escurece e um anel pulsa em volta, para você achar na hora. Clicar em outro código durante o destaque passa para o novo. Corrija o que for preciso e clique em **Adicionar à lista**. Só entram os códigos com a caixa marcada; se alguma caixa estiver desmarcada, o sistema avisa quais são e pergunta se você quer **prosseguir mesmo assim** (ou **voltar e conferir**, o que leva direto ao primeiro deles na foto). Códigos que já estão na lista não são repetidos. Depois, clique em **Salvar lista**.

A leitura é **gratuita e funciona sem internet**: roda no próprio navegador, com redes neurais de dígitos treinadas para este sistema (inclusive com o "1" escrito em forma de "J"). Nenhuma foto sai do computador. Para o melhor resultado, fotografe de frente, com boa luz e a folha inteira. Só números são lidos: letras e palavras (como um título escrito na folha, mesmo de lado), números riscados, pontos e as linhas das colunas são ignorados. Um código lido com segurança que não está no estoque carregado (por exemplo, com estoque zero) aparece em amarelo como **"lido, mas não está no estoque"**, para você decidir. Formatos aceitos: JPG e PNG (fotos HEIC do iPhone precisam ser convertidas).

**Precisão medida** em 10 fotos de listas reais (837 códigos escritos à mão, inclusive fotos reduzidas pelo WhatsApp): **99,3% dos códigos lidos sozinhos**, e **nenhum código marcado em verde estava errado**. Nas 3 folhas que as redes nunca viram no treino, foram 203 de 204 (99,5%). O restante aparece em amarelo ou circulado, para você conferir. Cada código da folha recebe um número; nada é pulado sem aviso. Dígitos encostados (como um "00" escrito sem tirar a caneta) são separados, e um código escrito rente à borda da foto é lido inteiro, mas aparece em amarelo para conferir.

Por que não usar um leitor de texto pronto (como o Tesseract): testado nas mesmas folhas, ele acertou só 9% dos códigos manuscritos, porque é feito para texto impresso. As redes próprias, treinadas com a caligrafia das listas, são muito mais precisas e também funcionam sem internet.

---

<a id="banco"></a>

## 🌐 Como o estoque é lido do banco

- **Somente leitura:** as consultas usam transações `READ UNCOMMITTED`, que são sempre desfeitas (rollback) no final, sem bloquear o ERP.
- **Itens exibidos:** estoque **> 0** (arredondado em 3 casas), descrição preenchida, código único, sem proibidos e sem inativos.
- **Inativos:** a coluna `ATIVO`/`ATIVADO`/`SITUACAO`/`STATUS` é comparada com `N`, `I`, `X` e `F`. Qualquer outro valor conta como ativo.
- **Banco encontrado automaticamente:** se o banco configurado não abrir, o sistema procura sozinho onde ele está e **atualiza a configuração**. A meta é ler o banco **pela rede**: (1) a configuração do próprio ERP (`.ini`/`.cfg` desta máquina, das unidades de rede mapeadas e do compartilhamento `\\SERVIDOR\ERP`, e os atalhos do ERP na Área de Trabalho/Menu Iniciar); (2) os servidores da rede, pelo nome (que não muda quando o IP muda), o configurado, o nome `SERVIDOR` e a varredura (LAN, Tailscale e cabo direto `169.254`), testando caminhos nas unidades `C:` a `H:`; (3) **só por último** o Firebird desta máquina (`127.0.0.1`). Só aceita arquivos chamados `SMALL.FDB` e só conecta num banco que abre **e** tem a tabela de produtos do ERP. O `.FDB` nunca é aberto por compartilhamento (só o `.ini` é lido). Para travar o host, use `"fbHostFixo": true`.
- **Estoque mínimo:** os itens acima do mínimo vêm primeiro. Se faltar item para completar a lista, entram os que estão abaixo do mínimo, mas nunca os zerados.
- **Proibidos:** no padrão de fábrica a lista vem **vazia**. Cadastre os termos da sua loja em **Configurações > Palavras Proibidas** (ou na chave `proibidos` do `config.json`). A comparação é por trecho da descrição, sem diferenciar maiúsculas e minúsculas. O campo aceita um termo por linha; se você colar a lista separada por vírgula, ponto e vírgula, `|` ou como JSON, ela é **convertida automaticamente** (maiúsculas, sem repetidos). Vírgula entre números, como em `1,5KG`, é mantida.
- **Proteções:** cada carga tem tempo máximo de 60 s. Duas cargas nunca rodam ao mesmo tempo. Pedidos feitos durante uma carga ficam na fila e rodam assim que ela termina.

---

<a id="configuracao"></a>

## ⚙️ Configuração

O arquivo é **opcional**: sem ele, o sistema detecta o banco sozinho. Quase todos os campos também podem ser alterados pela tela **Configurações**.

```json
{
  "appName": "Consulta de Estoque",
  "fbHost": "192.168.0.10",
  "fbPort": 3050,
  "fdbPath": "C:\\Dados\\SMALL.FDB",
  "fbUser": "SYSDBA",
  "fbPassword": "sua-senha",
  "portaEstoque": 7888,
  "estoqueMinimo": 5,
  "maxItens": 2000,
  "proibidos": ["MARCA X", "PRODUTO Y"]
}
```

| Campo | Padrão | Descrição |
|---|---|---|
| `appName` | `Consulta de Estoque` | Nome exibido na interface (mudar exige reiniciar). |
| `fbHost` | detectado | IP ou nome do servidor Firebird. A busca automática procura **primeiro o servidor da rede** (pelas unidades mapeadas, pelos `.ini` e atalhos do ERP, pelo nome `SERVIDOR` e pela varredura da rede) e só por último o Firebird desta máquina (`127.0.0.1`). |
| `fbPort` | `3050` | Porta do Firebird, de 1 a 65535. |
| `fdbPath` | detectado | Caminho do `SMALL.FDB` **no servidor do banco**. A busca automática só aceita arquivos chamados `SMALL.FDB`. |
| `fbHostFixo` | `false` | `true` impede a busca automática de trocar o servidor e o caminho configurados. |
| `fbUser` / `fbPassword` | `SYSDBA` / padrão de instalação | Credenciais do Firebird. Sem senha configurada, o log mostra um aviso de segurança. |
| `portaEstoque` | `7888` | Porta HTTP da interface, de 1024 a 65535 (mudar exige reiniciar). |
| `estoqueMinimo` | `5` | Itens abaixo desse valor só entram para completar a lista. Nas sugestões (Agrupar, Combinar e Modo Automático), um item só é usado se, depois do uso, o estoque continuar maior ou igual a esse valor. |
| `maxItens` | `2000` | Itens enviados à interface, de 100 a 20.000. |
| `proibidos` | `[]` | Termos a excluir das sugestões (a lista de fábrica é vazia). |

<details>
<summary><b>Padrão de fábrica</b></summary>

O código não traz nenhum dado de loja: nome da aplicação genérico (`Consulta de Estoque`), host `127.0.0.1` com detecção automática, lista de proibidos vazia e exemplos sem nomes reais. Tudo o que é específico de uma loja fica no `config.json`, nos arquivos gerados em uso e nunca no código. Para **voltar ao padrão de fábrica**, apague `config.json`, `usados-estoque.json` e `lista-personalizada.json` com o servidor parado.

Arquivos com BOM ou com números escritos com zero à esquerda (ex.: `03050`) são aceitos. Ao salvar, os campos de outros módulos que existirem no arquivo são **preservados**.

</details>

---

<a id="arquivos"></a>

## 📁 Arquivos

### Do projeto

| Arquivo | Função |
|---|---|
| `consulta-estoque.js` | Servidor HTTP, acesso ao Firebird e a interface completa (HTML/CSS/JS embutidos). |
| `estoque-engine.js` | Motor de cálculo do Agrupar, do Combinar e do Modo Automático. Uma cópia dele vai **embutida** no `consulta-estoque.js`; o arquivo solto serve para os testes. |
| `consulta-estoque.bat` | Inicializador para Windows: instalação, verificações, início, monitoramento e encerramento limpo. |
| `node-firebird.bat` | Instalador avulso do Node.js e do `node-firebird`. |
| `consulta-estoque_test.js` | Suíte de testes do motor e do servidor. |
| `validar-client.js` | Valida a sintaxe do JavaScript da interface, que fica dentro de uma string do servidor. |
| `favicon.ico` / `.png` / `.svg`... | **Opcional.** Ícone da aba do navegador (veja "Ícone da aba"). |
| `ocr-digitos.js` | Leitor de códigos escritos à mão numa foto (lista personalizada). Roda no navegador; sem ele, só o botão "Ler códigos de uma foto" deixa de funcionar. |
| `ocr-digitos-modelos.js` | As redes neurais treinadas usadas pelo leitor (gerado pelos scripts de `ferramentas/ocr/`). |
| `ferramentas/ocr/` | Scripts para treinar de novo as redes do leitor (Python + PyTorch). Não são usados no dia a dia. |
| `CLAUDE.md` | Regras do projeto para manutenção com o Claude (idioma, créditos, neutralidade, conferência de informações desatualizadas). |

### Gerados em uso

Ficam na mesma pasta do servidor:

| Arquivo | Conteúdo |
|---|---|
| `config.json` | Configurações salvas pela interface ou descobertas pela varredura de rede. |
| `usados-estoque.json` | Códigos marcados como usados. |
| `lista-personalizada.json` | A lista personalizada do Modo Automático. |
| `*.corrompido-<data>` | Cópia de segurança, criada só se um dos arquivos acima estiver corrompido ao iniciar. |

Todos eles estão no `.gitignore` e nunca vão para o repositório (o `config.json` contém a senha do Firebird).

A gravação é **atômica**: o arquivo é escrito por inteiro antes de substituir o anterior, então uma queda de energia não deixa o arquivo pela metade.

---

<a id="api"></a>

## 🔌 API HTTP

<details>
<summary><b>Rotas do servidor</b></summary>

| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Interface web. |
| GET | `/api/codigos` | Todos os códigos conhecidos do banco (usado para conferir a leitura por foto). |
| GET | `/ocr/ocr-digitos.js` e `/ocr/ocr-digitos-modelos.js` | Leitor de códigos por foto e as redes treinadas (baixados só quando o recurso é usado). |
| GET | `/favicon.ico` | Ícone da aba: o arquivo `favicon.*` da pasta do sistema (404 quando não existe). |
| GET | `/api/itens` | Itens, situação da carga e estoque real dos códigos da lista personalizada. |
| GET | `/api/sse` | Eventos em tempo real (`dados`). |
| GET | `/api/status` | Situação do servidor e do banco. |
| GET | `/api/buscar-mais-itens?offset=N` | Próximo lote do catálogo completo (busca estendida). |
| GET / POST | `/api/lista-personalizada` | Lê ou grava a lista personalizada. |
| POST | `/api/marcar-usado` | Marca um código como usado. |
| POST | `/api/resetar-usados` | Limpa os usados. |
| POST | `/api/atualizar` | Recarrega o estoque do banco. |
| GET / POST | `/api/config` | Lê ou grava as configurações (a senha nunca é devolvida). |
| POST | `/api/encerrar` | Encerra o servidor gravando os dados pendentes. **Só aceita pedidos desta própria máquina.** |

Todo `POST` exige o cabeçalho `X-Requested-With: XMLHttpRequest`, uma proteção contra sites externos que tentem enviar comandos pelo navegador.

</details>

---

## 🧰 Tecnologias e bibliotecas

Uma única biblioteca no servidor (`node-firebird`); o resto é o próprio Node.js e o navegador.

| Parte | Tecnologia | Versão | Para quê |
|---|---|---|---|
| Servidor | [Node.js](https://nodejs.org) | 18 ou mais novo (o `.bat` instala o 22 LTS) | Servidor HTTP, leitura do banco e arquivos de dados |
| Banco | [node-firebird](https://www.npmjs.com/package/node-firebird) | mais recente (instalado pelo `.bat`) | Driver Firebird em JavaScript puro, em transações somente leitura |
| Tela | HTML5, CSS e JavaScript sem framework | — | Leve, desenhada aos poucos para não travar com milhares de itens |
| Tempo real | Server-Sent Events | — | Atualiza todas as abas abertas quando os dados mudam |
| Motor de cálculo | `estoque-engine.js` | 1.11.0 | Agrupar, Combinar e Modo Automático (embutido no servidor) |
| Leitura por foto | `ocr-digitos.js` + redes próprias | 1.3.0 | Separação dos números na foto e leitura dos dígitos no navegador, sem internet |
| Treino das redes | [PyTorch](https://pytorch.org) + [MNIST](https://yann.lecun.com/exdb/mnist/) | — | Scripts de `ferramentas/ocr/` (fora do uso diário) |
| Inicializador | `consulta-estoque.bat` (Windows) | 5.33.0 | Instala, verifica, inicia, reinicia sozinho e encerra sem perder dados |
| Testes | `node:test` + `node:assert` | Node 18+ | 161 testes com Firebird simulado |
| Teste da tela | Playwright | — | Fluxos da interface, Modo Automático e leitura por foto |

---

## 🧪 Testes

```bash
node -c consulta-estoque.js        # sintaxe do servidor
node validar-client.js             # sintaxe do JavaScript da interface
node --test consulta-estoque_test.js
```

- **161 testes**, sem banco real: motor de cálculo, servidor (configuração, lista personalizada, SQL gerado, processamento do estoque e carga com um **Firebird simulado**) e leitor por foto (redes, decisão e conferência com o banco).
- A suíte **não conecta no banco, não abre porta e não grava arquivos**, por isso o `.bat` pode executá-la a cada inicialização.

---

<a id="seguranca"></a>

## 🔒 Segurança

- O servidor fica acessível **na rede local** (`0.0.0.0`) de propósito, para os outros PCs da loja usarem. **Não exponha a porta na internet:** não há login.
- A senha do Firebird fica em texto no `config.json`. Proteja a pasta do servidor e troque a senha padrão `masterkey`.
- A interface trata todo texto vindo do banco antes de exibir, para impedir a injeção de HTML (XSS). Os valores enviados ao banco usam parâmetros, e os nomes de tabela e coluna são validados.

---

<a id="problemas"></a>

## 🛠️ Solução de problemas

| Sintoma | O que verificar |
|---|---|
| "Falha na conexão" | `fbHost`, `fbPort`, `fdbPath`, usuário e senha nas Configurações; firewall liberando a porta 3050. |
| "Timeout ao carregar dados" | Banco ou rede lentos. O servidor tenta de novo quando você clica em **Atualizar**. |
| "Porta 7888 já está em uso" | Se for um servidor antigo deste sistema, o `.bat` encerra sozinho, sem perder dados. Se for outro programa, mude `portaEstoque`. |
| Nenhum item aparece | Veja no log a linha `Colunas:`, que mostra a tabela e as colunas detectadas. |
| Clicar na janela do `.bat` trava o sistema | Já resolvido: o `.bat` desativa o "Modo de Edição Rápida" do console logo ao abrir, antes de qualquer verificação. Não é preciso apertar nenhuma tecla em nenhum momento. |

---

O histórico completo de cada arquivo está em [`CHANGELOG.md`](CHANGELOG.md). Dentro dos arquivos, o cabeçalho traz apenas o changelog da versão atual.

<div align="center">

**Desenvolvido por [Ruda Gabriel](https://github.com/RudaGabriel)** — idealização, desenvolvimento e manutenção.

O nome do autor aparece também no rodapé da página do sistema, no cabeçalho de cada arquivo (`@author Ruda Gabriel`) e no `CHANGELOG.md`. Projeto **autônomo**: não depende de nenhum outro projeto ou programa do autor e só lê o banco Firebird do ERP.

© 2026 Ruda Gabriel. Todos os direitos reservados.

</div>
