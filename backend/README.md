# AgileApp — Backend (API)

Backend do **AgileApp**, responsável por autenticação, regras de negócio, persistência, métricas de sprint e integrações (webhooks, jobs recorrentes). Este projeto faz parte do monorepo `agileapp`. (Veja a visão geral na [raiz do repositório](../README.md).)

## Stack

- Node.js
- Express
- Prisma ORM
- TypeScript

## Serviços dependentes (infra)

| Serviço | Uso | Porta padrão |
|---|---|---|
| PostgreSQL | Banco principal | 5432 |
| Redis | Cache / filas / locks | 6379 |
| Minio (S3) | Storage de arquivos | 9000 / 9001 |

A forma mais simples de subir tudo é via `docker-compose` na raiz do repositório.

## Como rodar (desenvolvimento)

1. Na raiz do monorepo, crie o `.env` e suba a infra:

```bash
cp .env.example .env
docker-compose up -d
```

2. Instale dependências e rode o backend:

```bash
cd backend
npm install
npm run dev
```

3. A API estará disponível em: http://localhost:3000

## Variáveis de ambiente

Configure no `.env` da raiz (baseado em `.env.example`). Exemplo com valores fictícios:

```env
# Banco de dados
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agileapp?schema=public

# JWT (use valores fortes em produção)
JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Redis
REDIS_URL=redis://localhost:6379

# Minio / S3 local
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=agileapp

# Webhooks
WEBHOOK_SECRET=change-me
```

> Nunca commite valores reais de segredos. Mantenha segredos no `.env` local.

## Prisma (banco de dados)

Aplicar migrations e sincronizar o banco:

```bash
cd backend
npx prisma migrate dev
```

Inspecionar dados localmente:

```bash
npx prisma studio
```

Gerar o client após mudanças no schema:

```bash
npx prisma generate
```

## Autenticação

O projeto implementa autenticação full-stack com:

- Login via **Email/Senha**, **Google** e **Apple**
- Tokens **JWT** com rotação de Refresh Tokens
- Proteção de rotas autenticadas

> Certifique-se de configurar `JWT_ACCESS_SECRET` e `JWT_REFRESH_SECRET` no `.env` antes de testar o login.

## Webhooks (Outbound)

O backend suporta webhooks outbound com:

- Assinatura **HMAC SHA-256** para verificação de integridade
- Retries automáticos em caso de falha no destino

Configure no `.env`:

```env
WEBHOOK_SECRET=change-me
```

> No consumidor do webhook, **sempre valide a assinatura HMAC** antes de processar o payload.

## Jobs recorrentes (CRON)

O projeto suporta cards recorrentes (diário/semanal/mensal) via CRON. Para funcionar corretamente:

- O processo de jobs/scheduler precisa estar ativo
- Redis e banco precisam estar acessíveis
- Verifique se há variáveis de ambiente específicas para habilitar o scheduler

## Métricas e relatórios de sprint

Ao fechar um sprint, o backend gera automaticamente:

- **Velocity** (pontos entregues vs planejados)
- **Taxa de conclusão**
- **Cycle Time** e **Lead Time**

Relatórios podem ser compartilhados via tokens seguros (público/privado).

## SLA de estagnação

Tarefas que demoram mais que a média histórica da coluna recebem alerta visual (🐢). A lógica roda no backend com base no histórico de movimentações.

## Scripts

```bash
npm run dev       # desenvolvimento (hot reload)
npm run build     # build de produção
npm run start     # inicia o servidor em produção
```

## Troubleshooting

| Problema | Solução |
|---|---|
| Erro de conexão no banco | Confirme `DATABASE_URL` e se o Postgres está de pé no `docker-compose` |
| Prisma falhando | Valide se rodou `prisma migrate dev` e se o schema aponta para o banco correto |
| 401 em rotas autenticadas | Verifique se o token JWT está sendo enviado no header `Authorization: Bearer <token>` |
| Webhooks não chegando | Verifique `WEBHOOK_SECRET`, URL de destino, retries e se o endpoint responde em menos de 5s |
| Jobs não executando | Confirme se o worker/scheduler está ativo e se Redis está acessível |
| Porta 3000 ocupada | Finalize o processo ou altere a porta nas variáveis de ambiente |