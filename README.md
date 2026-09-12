# AgentBoard

Laboratório de desenvolvimento assistido por IA. Este repositório está na
**etapa de fundação**: um frontend rodando, uma API rodando, um container
PostgreSQL e as ferramentas de qualidade ao redor deles. Ainda não há domínio
de negócio — sem autenticação, sem modelos, sem funcionalidades.

## Stack

| Camada    | Ferramentas                                                                             |
| --------- | --------------------------------------------------------------------------------------- |
| Frontend  | Next.js 16 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui, ESLint, Prettier         |
| Backend   | NestJS 12, TypeScript, Prisma 7, Swagger, class-validator/transformer, ESLint, Prettier  |
| Banco de dados | PostgreSQL 18 em Docker                                                             |
| Ferramental | Docker Compose, Makefile, monorepo simples: dois pacotes npm independentes             |

## Estrutura do repositório

```text
agentboard/
├── backend/            API NestJS
│   ├── prisma/         schema (apenas conexão, ainda sem modelos)
│   └── src/
│       ├── common/     partes transversais (filtro global de exceções)
│       ├── config/     validação de ambiente
│       ├── health/     GET /api/v1/health
│       └── prisma/     PrismaService / PrismaModule
├── frontend/           app Next.js
│   └── src/
│       ├── app/        pontos de entrada do App Router
│       ├── components/ componentes compartilhados (ui/ gerado pelo shadcn)
│       ├── features/   código por funcionalidade (health/)
│       ├── hooks/      hooks React
│       ├── lib/        helpers agnósticos de framework
│       ├── services/   acesso HTTP à API
│       └── types/      tipos compartilhados
├── docker-compose.yml  apenas PostgreSQL local
└── Makefile            pontos de entrada para desenvolvimento
```

## Pré-requisitos

- Node.js 22 LTS ou mais recente (desenvolvido no Node 24)
- npm 10+
- Docker com Compose v2

## 1. Variáveis de ambiente

```bash
make env
```

Isso copia os três exemplos caso ainda não existam:

| Arquivo                | Usado por          | Chaves                                                     |
| ---------------------- | ------------------ | ----------------------------------------------------------- |
| `.env`                 | docker-compose     | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` |
| `backend/.env`         | NestJS e Prisma    | `DATABASE_URL`, `PORT`, `CORS_ORIGIN`, `NODE_ENV`           |
| `frontend/.env.local`  | Next.js            | `NEXT_PUBLIC_API_URL`                                       |

Depois edite-os: defina uma senha local em `.env` e use o mesmo usuário, senha,
banco de dados e porta na `DATABASE_URL` do `backend/.env`. Nenhum desses
arquivos é versionado — apenas os arquivos `.env.example` são.

## 2. Iniciar o PostgreSQL

```bash
make db-up     # docker compose up -d --wait
make db-logs   # acompanhar os logs do container
make db-down   # parar, mantendo o volume de dados
```

`make db-up` só retorna depois que o healthcheck do container passa.

## 3. Instalar dependências

```bash
make install
```

O `postinstall` do backend executa `prisma generate`, que escreve o client em
`backend/src/generated/prisma` (ignorado pelo git).

## 4. Iniciar o backend

```bash
make backend   # cd backend && npm run start:dev
```

## 5. Iniciar o frontend

```bash
make frontend  # cd frontend && npm run dev
```

A página inicial exibe `AgentBoard / AI Assisted Development Lab` e chama o
endpoint de health, mostrando `Backend Status: Online` ou `Backend Status: Offline`.

## URLs locais

```text
Frontend:
http://localhost:3000

Backend:
http://localhost:3001

Swagger:
http://localhost:3001/api/docs

Health:
http://localhost:3001/api/v1/health
```

O endpoint de health responde:

```json
{ "status": "ok" }
```

## Scripts

### Backend (`cd backend`)

```bash
npm run start:dev      # modo watch
npm run build          # nest build
npm run lint           # eslint
npm run test           # testes unitários vitest
npm run test:e2e       # testes e2e vitest
npm run format         # prettier --write
npm run prisma:generate
npm run prisma:migrate # quando existirem modelos de domínio
```

### Frontend (`cd frontend`)

```bash
npm run dev
npm run build
npm run lint
npm run typecheck      # next typegen && tsc --noEmit
npm run format
```

### Raiz do repositório

```bash
make help      # lista todos os targets
make lint      # lint dos dois projetos
make test      # testes unitários + e2e do backend
make build     # build dos dois projetos
```

## Convenções da API

- Prefixo global `/api`, versionamento por URI com `v1` como padrão, então as
  rotas ficam em `/api/v1/...`.
- Swagger UI em `/api/docs`, fora do prefixo de versão.
- Um `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`,
  conversão implícita) valida e transforma todo DTO.
- Um filtro global de exceções converte erros lançados em
  `{ statusCode, message, error, path, timestamp }` e nunca vaza stack traces.
  Requisições que não correspondem a nenhuma rota ainda são respondidas pelo
  404 padrão do Express.
- `CORS_ORIGIN` aceita uma lista de origens separadas por vírgula, ou `*`.
- A inicialização falha rapidamente com uma mensagem legível quando o ambiente
  é inválido (veja `backend/src/config/env.validation.ts`).

## Fora do escopo desta etapa

Autenticação, modelos de domínio (`User`, `Project`, `Task`, ...), integrações
de IA, CI, serviços de aplicação em containers e qualquer interface além da
página inicial.
