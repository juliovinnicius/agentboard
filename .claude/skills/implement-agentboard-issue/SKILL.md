---
name: implement-agentboard-issue
description: Implementa uma issue do Linear (time AgentBoard, ex. AGB-10) marcada agent:ready - lê a issue e dependências no Linear, faz uma alteração focada no GitHub, roda lint/testes/typecheck/build proporcionais à área tocada, e abre um PR referenciando o identificador AGB-N com a URL da issue. Nunca faz merge automaticamente. Use quando o usuário pedir para implementar/resolver uma issue específica do Linear.
---

# implement-agentboard-issue

Implementa uma única issue do Linear com uma mudança focada no GitHub e abre
PR — não decide sozinho fazer merge. O Linear é a fonte canônica de status,
prioridade, labels e descrição; o GitHub é usado só para branch, commit, PR e
CI.

## Pré-requisito: MCP do Linear

Depende de `mcp__linear__get_issue`, `mcp__linear__list_comments`,
`mcp__linear__save_issue`, `mcp__linear__save_comment`,
`mcp__linear__create_attachment` (ou `create_attachment_from_upload`),
`mcp__linear__list_issue_statuses`. Se essas ferramentas não estiverem
disponíveis, pare e explique como configurar o conector do Linear (ver
`triage-agentboard/SKILL.md`) — não use GitHub Issues como substituto para ler
ou gravar estado de tarefas.

## Entrada

Identificador da issue (`AGB-N`).

Valide o identificador como `AGB-[1-9][0-9]*`. Não aceite apenas um número e
não converta `#N` implicitamente.

## Passos

1. **Ler a issue, comentários e dependências no Linear**:
   `mcp__linear__get_issue` (incluindo relações) +
   `mcp__linear__list_comments`. A issue precisa estar em `ToDo`, ter
   `agent:ready`, não ter `agent:blocked`/`needs:spec` e possuir critérios de
   aceite objetivos. Se qualquer guard falhar, pare e recomende
   `prepare-agentboard-issue`; uma confirmação genérica do usuário não
   substitui readiness. Para cada relação `blockedBy` e referência
   `Depende de AGB-M`, confirme no Linear que a dependência está em `Done`.

2. **Preparar o branch**: rode `git status` primeiro.
   - Se a worktree estiver limpa, atualize `main` (`git pull`) e crie um
     branch focado. Prefira `gitBranchName` retornado pelo Linear; sem ele,
     use `agb-<n>-<slug-curto>`. Antes de criar, verifique se o branch local ou
     remoto e um PR correspondente já existem, reutilizando-os em retries.
   - Se houver mudanças existentes (staged, não staged ou untracked),
     identifique quais arquivos estão envolvidos e compare com os arquivos
     prováveis desta issue (seção "Handoff para o agente" no Linear, se
     existir, ou os arquivos que você mesmo vai tocar):
     - Mudanças **não relacionadas** a esta issue: não bloqueiam. Prossiga,
       mas não as inclua no commit desta tarefa — adicione arquivos
       específicos ao stage, nunca `git add -A`/`git add .`. Não faça stash
       nem descarte dessas mudanças.
     - Mudanças **relacionadas ou sobrepostas** aos arquivos que esta issue
       provavelmente vai tocar: há risco real de misturar ou sobrescrever
       trabalho em andamento — pare, explique o conflito ao usuário (quais
       arquivos, o que parece estar em progresso) e peça direção antes de
       continuar.
   - Nunca rode `git checkout .`, `git restore .`, `git reset --hard`,
     `git clean` ou qualquer variante que descarte alterações existentes,
     sejam suas ou de outra tarefa.

3. **Atualizar a issue para `In Progress`** no Linear (`mcp__linear__save_issue`)
   assim que o branch estiver criado e o trabalho for começar. Releia a issue
   depois da escrita; se o estado não for `In Progress`, pare antes de editar
   código. Mover para `In Progress` faz parte da execução autorizada.

4. **Implementar a mudança mínima** que satisfaz os critérios de aceite da
   issue — sem refatorações não relacionadas, sem features extras, sem
   abstrações antecipando necessidades futuras. Se a issue tiver uma seção
   "Handoff para o agente" (de `prepare-agentboard-issue`), siga os arquivos e
   escopo listados lá.

5. **Verificar proporcionalmente à área tocada**:
   - só `backend/`: `npm run lint && npm run test && npm run build` (mais
     `npm run test:e2e` se rotas HTTP mudaram) dentro de `backend/`.
   - só `frontend/`: `npm run lint && npm run typecheck && npm run build`
     dentro de `frontend/`.
   - ambos: os targets de raiz (`make lint`, `make test`, `make build`).

   Não declare a tarefa pronta sem citar a saída real desses comandos — sem
   números ou "PASS" inventados.

6. **Commitar** com mensagem descritiva (o quê e por quê, não uma narração do
   diff) e o trailer de atribuição já configurado nesta sessão.

7. **Fazer push e abrir o PR** (`gh pr create`). Abrir o PR (e o push que o
   antecede) fazem parte do que esta skill entrega ao ser invocada para
   implementar uma issue — não é preciso confirmar de novo nesse ponto,
   exceto se o usuário tiver pedido explicitamente só a implementação local
   sem PR.

   Corpo do PR:
   - Identificador e link da issue: `AGB-<n>` com a URL retornada por
     `mcp__linear__get_issue` (campo de URL da issue). Não use palavras-chave
     de fechamento de GitHub Issues: a tarefa existe no Linear;
   - Resumo da mudança;
   - Mapeamento explícito para cada critério de aceite da issue
     (atendido/como);
   - Evidência: comandos rodados e resultado real (colar saída relevante);
   - Riscos e possíveis follow-ups.

8. **Vincular o PR à issue no Linear**: registre a URL do PR na issue com
   `mcp__linear__create_attachment` (ou, se não for aplicável, um comentário
   com `mcp__linear__save_comment` contendo o link e o marcador
   `<!-- agentboard-implementation -->`). Verifique antes anexos e comentários:
   reutilize/atualize o registro existente em vez de duplicar. Inclua os
   comandos executados, resultados reais e riscos conhecidos.

9. **Mover a issue para `In Review`** somente depois que o PR estiver aberto
   **e** a CI (`.github/workflows/ci.yml`) estiver verde — confirme o status
   real com `gh pr checks <n>` (ou equivalente); nunca presuma que a CI vai
   passar. Se a CI ainda estiver rodando, diga isso ao usuário e não mova o
   estado ainda; se falhar, corrija ou reporte o bloqueio. Após a escrita,
   releia a issue e confirme `In Review`.

## Limites

- Nunca roda `gh pr merge` nem qualquer variante de merge/squash automático.
- Nunca move a issue para `Done` — isso é decidido por `review-agentboard-pr`
  (ou pelo usuário) depois do merge.
- Nunca força push nem reescreve histórico de branches que não sejam os que
  esta própria execução criou.
- Não simula estado do Linear usando labels do GitHub — todo estado e toda
  label vivem no Linear, nunca em `status:*` do GitHub.
- Se os critérios de aceite forem ambíguos ou a mudança necessária for maior
  que uma issue deveria cobrir, pare e reporte em vez de adivinhar escopo.
- Segue as políticas de segredo da organização: nunca aceita ou grava valores
  literais de credenciais em código, commits, comentários do Linear ou no
  corpo do PR.
