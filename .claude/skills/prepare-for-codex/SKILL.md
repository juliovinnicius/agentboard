---
name: prepare-for-codex
description: Prepara uma issue do Linear (time AgentBoard, ex. AGB-10) já em Triagem para execução autônoma - confirma objetivo/escopo/exclusões, identifica arquivos e componentes prováveis, define comandos de verificação e aplica a label Linear agent:ready quando a issue estiver executável, movendo-a para ToDo. Use depois de triage-agentboard e antes de implement-agentboard-issue.
---

# prepare-for-codex

Transforma uma issue já triada do Linear em uma issue executável por um
agente, sem implementar nada. Pressupõe que `triage-agentboard` já rodou
(título normalizado, critérios de aceite presentes, estado `Triagem`); se não
rodou, rode as verificações abaixo mesmo assim e aponte a lacuna.

## Pré-requisito: MCP do Linear

Depende das ferramentas `mcp__linear__get_issue`, `mcp__linear__save_issue`,
`mcp__linear__list_issue_labels`, `mcp__linear__create_issue_label`,
`mcp__linear__save_comment`, `mcp__linear__list_issue_statuses`. Se não
estiverem disponíveis, pare e explique como configurar o conector do Linear
(ver a mesma seção em `triage-agentboard/SKILL.md`) — não use `gh issue` como
substituto.

## Entrada

Identificador da issue (`AGB-N`).

## Passos

1. **Confirmar objetivo/escopo/exclusões**: leia a issue com
   `mcp__linear__get_issue`. Ela precisa deixar claro:
   - um objetivo único e verificável;
   - escopo em bullets (o que entra);
   - exclusões explícitas (o que não entra) — inclua sempre as exclusões
     globais da etapa atual do projeto (auth, modelos de domínio, integrações
     de IA, containers de aplicação — ver "Fora do escopo desta etapa" no
     `README.md`) quando forem relevantes para a issue. CI **não** é uma
     exclusão desta etapa — já existe e está verde; não a liste como fora de
     escopo.

   Se algum desses três estiver ausente ou vago, redija o texto que falta e
   proponha ao usuário — não presuma decisões de escopo que mudam o
   resultado; se for realmente ambíguo, pergunte.

2. **Identificar arquivos e componentes prováveis**: explore o repositório
   (`backend/src/...`, `frontend/src/...`) e liste os arquivos que
   provavelmente serão criados/tocados, com uma frase de porquê cada um. Use
   os diretórios já existentes como guia (`backend/src/health` como exemplo de
   módulo NestJS, `frontend/src/features` como exemplo de organização por
   funcionalidade).

3. **Definir comandos de verificação**, proporcionais à área tocada:
   - mudanças em `backend/`: `npm run lint`, `npm run test`, `npm run test:e2e`
     (se afetar rotas), `npm run build`, executados em `backend/`.
   - mudanças em `frontend/`: `npm run lint`, `npm run typecheck`,
     `npm run build`, executados em `frontend/`.
   - mudanças que tocam os dois lados: os targets de raiz
     (`make lint`, `make test`, `make build`).
   - lembre que a CI (`.github/workflows/ci.yml`) roda os mesmos passos por
     pacote em todo push/PR — os comandos locais devem espelhar exatamente o
     que a CI executa, não uma versão reduzida.

   Liste os comandos exatos na issue, não uma descrição genérica de "rodar os
   testes".

4. **Gravar uma seção "Handoff para o agente"** na descrição da issue (ou em
   um comentário, se preferir preservar a descrição original) com: Objetivo,
   Escopo, Fora do escopo, Arquivos prováveis, Comandos de verificação. Mostre
   o diff ao usuário e confirme antes de gravar com `mcp__linear__save_issue`
   (descrição) ou `mcp__linear__save_comment` (comentário). Se já existir uma
   seção "Handoff para o agente" de uma execução anterior, substitua-a em vez
   de duplicar.

5. **Aplicar a label `agent:ready`** somente se todos os itens acima
   estiverem completos e sem ambiguidade — ou seja, um agente conseguiria
   implementar sem precisar perguntar nada a mais.
   - Verifique se a label existe no time com `mcp__linear__list_issue_labels`
     (`team: "AGB"`); crie com `mcp__linear__create_issue_label` somente se
     ainda não existir.
   - Aplique a label à issue com `mcp__linear__save_issue` e mova o estado
     para **ToDo**. Confirme com o usuário antes de gravar, exceto quando o
     pedido já autorizar claramente essa gravação (ex.: "prepare a AGB-10 e
     já marque como pronta").

   Se algo ainda faltar, **não aplique `agent:ready` nem mova para `ToDo`**:
   aplique (ou recomende) a label `needs:spec` ou `agent:blocked` — criando-a
   da mesma forma se ainda não existir — e deixe um comentário na issue
   (`mcp__linear__save_comment`) listando exatamente o que está bloqueando o
   status de "pronta para agente".

## Limites

- Não implementa código, não cria branch/PR.
- Não aplica `agent:ready` "por otimismo" — se restar qualquer decisão de
  produto em aberto, a issue não está pronta.
- Não simula esse fluxo com labels ou estados do GitHub — todo estado e toda
  label vivem no Linear.
- Toda edição de issue, todo comentário e toda label são ações visíveis:
  confirme com o usuário antes de gravar, salvo quando a própria invocação da
  skill já autorizar claramente aquela gravação.
