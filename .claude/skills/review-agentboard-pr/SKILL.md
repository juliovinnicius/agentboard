---
name: review-agentboard-pr
description: Revisa um PR do GitHub contra a issue Linear AGB-N, verifica critérios, testes, segurança e CI, e reconcilia In Progress, In Review ou Done. Nunca aprova nem faz merge; Done exige aprovação humana e merge confirmado. Use quando o usuário pedir revisão de um PR do AgentBoard.
---

# review-agentboard-pr

Dá parecer sobre um PR já aberto (tipicamente por `implement-agentboard-issue`)
comparando com a issue Linear de origem. Não implementa correções — reporta
e, no máximo, comenta/solicita mudanças no PR e atualiza o estado da issue no
Linear.

## Pré-requisito: MCP do Linear

Depende de `mcp__linear__get_issue`, `mcp__linear__save_issue`,
`mcp__linear__list_comments`, `mcp__linear__save_comment`,
`mcp__linear__list_issue_statuses`. Se essas ferramentas não estiverem
disponíveis, pare e explique como configurar o conector do Linear (ver
`triage-agentboard/SKILL.md`) — não simule o estado da issue com labels do
GitHub como substituto.

## Entrada

Número ou URL do PR no GitHub.

Quando a entrada for um número, valide que é um inteiro positivo antes de
consultar o GitHub.

## Passos

1. **Coletar contexto**: leia título, corpo, arquivos, commits, autor, URL,
   reviews, checks, estado e `mergedAt` do PR; depois leia o diff. Use `gh` ou
   o conector GitHub disponível. Extraia o identificador `AGB-N` do corpo do
   PR (branch `agb-N-...` ou texto `AGB-N` no corpo) e leia a issue com
   `mcp__linear__get_issue`, incluindo seus critérios de aceite. Se não
   houver identificador Linear localizável, reporte isso como um problema em
   si — não há como validar critérios de aceite sem a issue de origem.

2. **Comparar com os critérios de aceite**: para cada critério, aponte se o
   diff realmente o satisfaz e com qual evidência (teste novo, comando
   rodado). "O código parece cobrir isso" não é evidência suficiente sem um
   teste ou execução que comprove.

3. **Consultar o resultado real da CI**: confirme no status rollup que
   `Backend (lint, test, build)` e `Frontend (lint, typecheck, build)` foram
   concluídos com sucesso. Nunca presuma ou invente um resultado; se estiver
   rodando, permaneça no estado atual e relate isso, e se falhar, cite os jobs.

4. **Procurar regressões**: preste atenção redobrada a mudanças em peças
   compartilhadas do projeto — `ValidationPipe` global, filtro global de
   exceções, `env.validation.ts`, schema do Prisma, `docker-compose.yml`,
   Makefile, `.github/workflows/ci.yml`. Mudança nessas áreas tem raio de
   impacto maior que o PR sugere.

5. **Procurar problemas de segurança**: novo endpoint sem DTO validado por
   `class-validator`, CORS mais permissivo que o necessário, dados sensíveis
   logados ou devolvidos em respostas de erro, segredos literais em código ou
   em exemplos de configuração. Nunca reproduza um segredo encontrado no
   diff, em comentários do PR, ou em qualquer registro no Linear — sinalize
   apenas a localização e recomende rotação imediata.

6. **Procurar ausência de testes**: mudanças em `backend/src/**` sem teste
   correspondente em `test`/`*.spec.ts`, ou lógica de frontend não trivial sem
   cobertura equivalente. Falta de teste é motivo suficiente para devolver o
   PR mesmo que o comportamento pareça correto.

7. **Decidir e aplicar o veredito**: publicar o comentário/parecer no PR e
   atualizar o estado da issue fazem parte do que esta skill entrega ao ser
   invocada para revisar um PR — não é preciso confirmar cada gravação
   individualmente, mas o veredito em si deve ser exposto ao usuário antes ou
   junto da publicação.
   - **Critérios atendidos, ambos os checks verdes, sem regressão, sem achado de
     segurança, testes presentes** → comente o parecer positivo no PR
     (`gh pr review <n> --comment`), mantenha/mova a issue Linear para
     **In Review** (`mcp__linear__save_issue`) e aplique `human:required`
     enquanto não houver aprovação humana válida.
   - **Qualquer lacuna encontrada** (critério não atendido, CI vermelha,
     regressão, achado de segurança, teste faltando) → `gh pr review <n>
     --request-changes` com a lista específica do que falta, devolva a issue
     para **In Progress** (`mcp__linear__save_issue`) e registre no Linear
     (`mcp__linear__save_comment`) exatamente o que está bloqueando. Use o
     marcador `<!-- agentboard-review -->` e atualize o comentário existente
     em retries, em vez de duplicá-lo.

8. **Nunca aprove silenciosamente mudanças críticas**: mudanças que tocam
   segurança, dados, ou as peças compartilhadas do passo 4 exigem que o
   parecer diga isso explicitamente, mesmo quando o veredito geral for
   positivo — esta skill nunca roda `gh pr review <n> --approve` nem
   `gh pr merge` por conta própria.

9. **Fechar o ciclo com segurança**: considere humana apenas uma review mais
   recente em estado `APPROVED`, feita por conta diferente do autor do PR e
   cujo login não termine em `[bot]`.
   - Se os dois checks estão verdes e há aprovação humana, mas o PR ainda não
     foi mergeado, mantenha **In Review**.
   - Se os dois checks estão verdes, há aprovação humana válida e o GitHub
     confirma `state: MERGED` com `mergedAt`, mova a issue para **Done**,
     remova `human:required` e registre no comentário de revisão quem aprovou,
     o instante do merge e os checks verificados.
   - Releia a issue após qualquer transição. Se o postcondition não bater,
     pare e reporte a falha parcial; não anuncie `Done` por inferência.

## Limites

- Não corrige o código do PR; se quiser propor uma correção, deixe como
  comentário para o autor, não como commit direto no branch do PR.
- Não aprova (`--approve`) nem faz merge em nenhuma circunstância.
- Não simula estado do Linear usando labels do GitHub — todo estado vive no
  Linear.
- Mudar o estado da issue e comentar no PR são ações visíveis a outras
  pessoas — se o veredito for incerto, diga isso ao usuário em vez de forçar
  uma decisão binária.
