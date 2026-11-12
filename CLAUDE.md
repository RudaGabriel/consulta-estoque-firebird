# Regras do projeto (para o Claude)

- **Idioma:** sempre pt-BR: respostas, código, comentários, mensagens de commit e PR, textos da tela.
- **Autor e créditos:** Ruda Gabriel. `@author Ruda Gabriel` no cabeçalho de cada arquivo, topo e seção "Créditos" do README, topo do CHANGELOG e rodapé da página do sistema. Os créditos ficam sempre explícitos.
- **Projeto autônomo e neutro:** não citar outros projetos ou repositórios nem nomes de terceiros (fabricante ou produto do ERP). Na documentação, nos textos da tela, no log e nos comentários, usar "ERP". Exceção: nomes de pasta e de arquivo que a busca automática do banco precisa para funcionar (ex.: `SMALL.FDB`, pastas de instalação) e os caminhos usados como dados de teste.
- **Somente leitura no banco:** nunca escrever no Firebird do ERP. Só `SELECT`, em transação desfeita com rollback.
- **Banco pela rede primeiro:** a busca automática procura o servidor da rede antes do Firebird desta máquina (`127.0.0.1` é a última opção) e só aceita arquivos chamados `SMALL.FDB`. Nunca abrir `.FDB` por compartilhamento (só ler `.ini`).
- **Código à prova de erros:** antes de entregar, procurar bugs e cenários de erro no próprio diff (rede caindo, servidor desligado, banco sem a tabela, config estragado, navegador sem `localStorage`) e corrigir. Toda leitura de rede tem prazo; nada pode congelar a tela.
- **JavaScript da tela dentro de template literal** (`consulta-estoque.js`): não usar `${` nem crase no código do cliente; quebras de linha em strings como `\\n`. O motor também vai embutido (`_ENGINE_SRC`), espelhando o `estoque-engine.js`.
- **Informações desatualizadas (sempre conferir):** a cada mudança, e sempre que mexer no projeto, procurar e corrigir no mesmo PR tudo o que ficou velho:
  - README (o que o sistema faz, telas, opções, chaves do `config.json` com padrões e faixas, rotas da API, arquivos, quantidade de testes, solução de problemas);
  - CHANGELOG (lista "Arquivos" com a versão atual de cada um);
  - cabeçalhos dos arquivos (versão e entrada atual);
  - comentários que descrevem um comportamento que mudou;
  - textos e validações da tela que precisam bater com o servidor (ex.: faixas de porta).

  Conferir cada afirmação contra o código, nunca de memória.
- **Ortografia e linguagem formal (sempre conferir):** a cada mudança, e sempre que mexer no projeto, revisar a ortografia, a acentuação, a concordância e o plural de todo texto visível: tela, títulos, botões, dicas (`title`), placeholders, mensagens, avisos, log, README, CHANGELOG e mensagens de commit e PR. A linguagem deve ser formal e clara; o que estiver informal ou errado é reescrito. Atenção especial a textos montados no código (ex.: plural com `n === 1 ? ... : ...`, nunca "palavra" + "ões"). Conferir os textos na página renderizada (Playwright), não só no código.
- **Textos que não podem quebrar o layout:** botões e rótulos de uma linha usam reticências (`text-overflow:ellipsis`, `white-space:nowrap`) com o texto completo no `title`, em vez de quebrar a linha ou empurrar o botão para outra linha. Testar em larguras diferentes (ex.: 1600, 1280, 1100 e 600 px).
- **Changelog:** o cabeçalho de cada arquivo traz só a entrada da versão atual, mais a linha "Histórico completo das versões: CHANGELOG.md no repositório.". O histórico completo fica no `CHANGELOG.md`: nova entrada no topo da seção do arquivo e versão atualizada na lista "Arquivos". Toda mudança de código sobe a versão do arquivo.
- **README sempre atualizado:** toda mudança que o usuário perceba atualiza o `README.md` no mesmo PR. Escrito para quem não é técnico.
- **Exemplos neutros:** placeholders, testes e documentação sem nomes de pessoas, clientes, lojas ou marcas (ex.: "PRODUTO CARO", "FORNECEDOR A", "SERVIDOR").
- **Arquivos do Windows:** `.bat` em ASCII com CRLF.
- **Antes de entregar:** `node -c consulta-estoque.js`, `node validar-client.js` e `node --test consulta-estoque_test.js` verdes. Quando a tela mudar, validar com Playwright usando um Firebird simulado.
- **Pull requests:** depois de abrir o PR e com os testes verdes, **fazer o merge automaticamente** (pedido do dono do repositório), sem esperar aprovação manual.
