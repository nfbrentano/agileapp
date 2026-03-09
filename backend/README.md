
***

## Conteúdo para `backend/README.md`

```md
# AgileApp — Backend (API)

Backend do **AgileApp**, responsável por autenticação, regras de negócio, persistência, métricas (ex.: sprint reports) e integrações (webhooks, jobs). Este projeto faz parte do monorepo `agileapp`.

## Stack

- Node.js
- Express
- Prisma ORM
- TypeScript (projeto principal do monorepo)

## Serviços dependentes (infra)

O backend normalmente depende de:

- PostgreSQL (banco principal)
- Redis (cache/filas/locks, conforme implementado)
- Minio (S3) para storage local

A forma mais simples de subir tudo é via `docker-compose` na raiz do repositório.

## Como rodar (desenvolvimento)

1) Na raiz do monorepo, crie o `.env` e suba a infra:

```bash
cp .env.example .env
docker-compose up -d