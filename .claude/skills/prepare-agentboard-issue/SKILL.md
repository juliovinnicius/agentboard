---
name: prepare-agentboard-issue
description: "Prepara uma issue do Linear do time AgentBoard para execução por um agente: completa o handoff, valida dependências e critérios, e só então aplica agent:ready e move Triagem para ToDo. Use depois de triage-agentboard e antes de implement-agentboard-issue; não implementa código."
---

# prepare-agentboard-issue

Transforma uma issue já triada do Linear em uma issue executável por um
agente, sem implementar nada. Pressupõe que `triage-agentboard` já rodou
(título normalizado, critérios de aceite presentes, estado `Triagem`); se não
rodou, rode as verificações abaixo mesmo assim e aponte a lacuna.

## Pré-requisito: MCP do Linear

Depende das ferramentas `mcp__linear__get_issue`, `mcp__linear__save_issue`,
`mcp__linear__list_issue_labels`, `mcp__linear__create_issue_label`,
`mcp__linear__save_comment`, `mcp__linear__list_issue_statuses`. Se não
estiverem disponíveis, pare e explique como configurar o conector do Linear
(ver a mesma seção em `triage-agentboard/SKILL.md`) — não use GitHub Issues
como substituto.

## Entrada

Identificador da issue (`AGB-N`).

Valide o identificador como `AGB-[1-9][0-9]*`. Não aceite apenas um número e
não converta `#N` implicitamente.

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

4. **Gravar uma seção "Handoff para o agente"** na descrição da issue com:
   Objetivo, Escopo, Fora do escopo, Dependências, Critérios de aceite,
   Arquivos prováveis e Comandos de verificação. Mostre o diff ao usuário e
   confirme antes de gravar com `mcp__linear__save_issue`, exceto quando o
   pedido já autorizar claramente a atualização. Se a seção já existir,
   substitua-a por patch em vez de duplicar ou reenviar texto desatualizado.

5. **Aplicar a label `agent:ready`** somente se todos os itens acima
   estiverem completos e sem ambiguidade — ou seja, um agente conseguiria
   implementar sem precisar perguntar nada a mais.
   - Verifique se a label existe no time com `mcp__linear__list_issue_labels`
     (`team: "AGB"`); crie com `mcp__linear__save_issue_label` ou
     `mcp__linear__create_issue_label` somente se ainda não existir.
   - Releia a issue imediatamente antes da transição. Aplique `agent:ready`,
     remova `needs:spec`/`agent:blocked` quando seus motivos tiverem sido
     resolvidos e mova **Triagem → ToDo** com `mcp__linear__save_issue`.
   - Releia a issue depois da escrita e só declare sucesso se estado e labels
     tiverem os valores esperados.

   Se algo ainda faltar, **não aplique `agent:ready` nem mova para `ToDo`**:
   aplique `needs:spec` quando faltarem decisões/aceites ou `agent:blocked`
   quando houver uma dependência externa — criando a label somente se ainda
   não existir — e deixe um comentário com marcador
   `<!-- agentboard-readiness -->` listando exatamente o bloqueio. Antes de
   comentar, consulte os comentários e atualize/reuse o registro existente
   com esse marcador para que retries sejam idempotentes.

## Limites

- Não implementa código, não cria branch/PR.
- Não aplica `agent:ready` "por otimismo" — se restar qualquer decisão de
  produto em aberto, a issue não está pronta.
- Não simula esse fluxo com labels ou estados do GitHub — todo estado e toda
  label vivem no Linear.
- Toda edição de issue, todo comentário e toda label são ações visíveis:
  confirme com o usuário antes de gravar, salvo quando a própria invocação da
  skill já autorizar claramente aquela gravação.
