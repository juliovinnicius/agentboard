# AgentBoard - developer entry points.
# Frontend and backend run on the host; only PostgreSQL runs in Docker.

.DEFAULT_GOAL := help
.PHONY: help env install db-up db-down db-logs backend frontend lint test build

help: ## List the available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-10s %s\n", $$1, $$2}'

env: ## Create .env files from the examples (existing files are kept)
	@[ -f .env ] || cp .env.example .env
	@[ -f backend/.env ] || cp backend/.env.example backend/.env
	@[ -f frontend/.env.local ] || cp frontend/.env.example frontend/.env.local
	@echo "Review .env, backend/.env and frontend/.env.local before starting."

install: ## Install backend and frontend dependencies
	cd backend && npm install
	cd frontend && npm install

db-up: ## Start PostgreSQL and wait for the healthcheck
	docker compose up -d --wait

db-down: ## Stop PostgreSQL (the data volume is kept)
	docker compose down

db-logs: ## Follow the PostgreSQL logs
	docker compose logs -f postgres

backend: ## Start the API in watch mode on http://localhost:3001
	cd backend && npm run start:dev

frontend: ## Start the web app in dev mode on http://localhost:3000
	cd frontend && npm run dev

lint: ## Lint both projects
	cd backend && npm run lint
	cd frontend && npm run lint

test: ## Run the backend unit and e2e tests
	cd backend && npm run test
	cd backend && npm run test:e2e

build: ## Build both projects
	cd backend && npm run build
	cd frontend && npm run build
