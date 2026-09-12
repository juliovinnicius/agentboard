---
name: triage-agentboard
description: Faz a triagem de uma issue do Linear (time AgentBoard, chave AGB, ex. AGB-10) - consulta a issue via MCP do Linear, detecta duplicatas e dependências dentro do time, estrutura contexto/problema/escopo/critérios de aceite e recomenda prioridade. Não escreve código nem cria issue no GitHub. Use quando o usuário pedir para triar, organizar ou preparar uma issue do Linear (AGB-N ou um rascunho) antes de qualquer implementação.
---

# triage-agentboard

Triagem de uma issue do time **AgentBoard** (chave `AGB`) no Linear, projeto
**AgentBoard — MVP**. O Linear é a fonte canônica de tarefas; o repositório
GitHub `juliovinnicius/agentboard` não é tocado por esta skill. O resultado é
uma issue Linear bem estruturada e classificada — nada de código, branch ou
PR.

## Pré-requisito: MCP do Linear

Esta skill depende das ferramentas MCP do Linear (`mcp__linear__get_issue`,
`mcp__linear__list_issues`, `mcp__linear__list_comments`,
`mcp__linear__save_issue`, `mcp__linear__list_issue_statuses`, etc.). Se essas
ferramentas não estiverem disponíveis nesta sessão, **pare e explique como
configurar o conector do Linear** (ver "Configuração do MCP do Linear" ao
final) — nunca use GitHub Issues como substituto.

## Entrada

- Um identificador de issue existente no formato `AGB-N`, ou
- Um texto solto/rascunho que o usuário colou na conversa (ainda sem issue
  criada no Linear).

Se vier só um rascunho, pergunte apenas se o "o quê" for genuinamente
ambíguo; caso contrário assuma o objetivo mais razoável, prossiga e declare a
suposição em uma linha.

Quando vier um identificador, valide-o como `AGB-[1-9][0-9]*` antes de chamar
o Linear. Não aceite apenas um número e não converta `#N` implicitamente.

## Contexto do projeto a considerar

O repo está na etapa de fundação (ver `README.md`/`AGENTS.md`): frontend
Next.js, backend NestJS, Postgres via Docker, sem autenticação, sem modelos
de domínio. **CI já existe e está verde** (`.github/workflows/ci.yml`, lint +
testes + build dos dois pacotes) — não trate CI como algo ausente ou como uma
dependência em aberto. Qualquer issue que pressuponha peças de fundação ainda
inexistentes (auth, `User`/`Project`/`Task`, integrações de IA, containers de
aplicação) depende de trabalho que ainda não existe — isso é uma dependência
a sinalizar, não a resolver aqui.

## Passos

1. **Coletar contexto**: leia a issue com `mcp__linear__get_issue`
   (identificador `AGB-N`) e os comentários com `mcp__linear__list_comments`.
   Explore o repo (`rg`/`rg --files`) só o suficiente para confirmar se a área
   citada (backend, frontend, infra) existe hoje.

2. **Normalizar título**: frase curta, no imperativo, sem vaguidade
   ("Adicionar endpoint de listagem de tarefas" em vez de "Tarefas"). Prefixe
   com a área quando ajudar (`backend:`, `frontend:`, `infra:`).

3. **Normalizar descrição** na estrutura:
   - **Contexto** — por que isso importa agora.
   - **Problema / necessidade** — o que falta ou está quebrado.
   - **Fora do escopo** — o que essa issue deliberadamente não cobre.

4. **Detectar duplicatas dentro do time AgentBoard**: busque por palavras-chave
   com `mcp__linear__list_issues` filtrando pelo time `AGB`. Se houver uma
   issue claramente equivalente, reporte o link ao usuário e pergunte antes
   de marcar como `Duplicate` — mudar o estado de uma issue no Linear é uma
   ação visível, não faça sem confirmação.

5. **Detectar dependências e bloqueios**: verifique relações da issue no
   Linear (bloqueada por / bloqueia, relacionada a — conforme exposto por
   `mcp__linear__get_issue`), referências no corpo/comentários a outras
   issues `AGB-M`, e se a issue assume alguma peça de fundação ainda não
   implementada (ver seção acima). Liste as dependências encontradas
   (`Depende de AGB-M`) e marque como bloqueada se aplicável.

6. **Adicionar critérios de aceite**: lista de itens observáveis e testáveis
   (checklist), específicos o bastante para orientar verificação depois
   (ex.: "GET /api/v1/tasks retorna 200 com lista vazia quando não há
   tarefas", não "endpoint funciona").

7. **Recomendar prioridade** (escala nativa do Linear: Urgent/High/Medium/
   Low/No priority) com uma linha de justificativa (bloqueia fundação vs.
   melhoria incremental vs. nice-to-have).

8. **Aplicar a mudança**: monte o corpo final da descrição e mostre o diff ao
   usuário; após confirmação, grave com `mcp__linear__save_issue`
   (descrição e prioridade) e mova o estado para **Triagem** somente quando
   autorizado. Gravar no Linear é uma ação visível — sempre confirme antes,
   exceto quando o próprio pedido do usuário já autorizar claramente essa
   gravação (ex.: "triar e já salvar a AGB-10").

## Limites

- Nunca escreve, edita ou sugere diffs de código de produção.
- Nunca cria branch, commit ou PR no GitHub.
- Nunca cria issue no GitHub — issues vivem exclusivamente no Linear.
- Não simula estado do Linear usando labels do GitHub (`status:*` etc.) —
  todo estado de fluxo é lido e gravado no Linear.
- Não move a issue além de `Triagem` (decidir `ToDo`, `In Progress` etc. é
  responsabilidade de `prepare-for-codex`/`implement-agentboard-issue`).
- Não invente critérios de aceite que o autor da issue não sustentaria — se
  algo for ambíguo, deixe como pergunta aberta na própria issue em vez de
  adivinhar.

## Configuração do MCP do Linear

Se as ferramentas `mcp__linear__*` não aparecerem na lista de ferramentas
desta sessão do Codex:

1. Oriente o usuário a configurar o MCP local com
   `codex mcp add linear --url https://mcp.linear.app/mcp` e concluir o login.
2. Confirme que a autenticação usa um workspace que inclua o time
   **AgentBoard** (`AGB`).
3. Depois de conectado, confirme o acesso chamando `mcp__linear__get_team`
   com a query `AGB` antes de prosseguir com a triagem.

Não prossiga a triagem usando GitHub Issues como alternativa — isso reintroduz o
problema que esta skill existe para evitar.
