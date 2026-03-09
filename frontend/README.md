# AgileApp — Frontend

Frontend do **AgileApp**, a interface web para gerenciamento de projetos ágeis (Kanban + Scrum), com foco em automação e métricas. Este projeto faz parte do monorepo `agileapp` e conversa com o backend via API. (Veja a visão geral na [raiz do repositório](../README.md).)

## Stack

- React + TypeScript
- Vite
- Tailwind CSS

## Pré-requisitos

- Node.js (LTS recomendado)
- npm
- Docker + Docker Compose (para subir os serviços de infraestrutura do monorepo)

## Como rodar (desenvolvimento)

1. Na raiz do monorepo, crie seu `.env` a partir do exemplo:

```bash
cp .env.example .env
```

2. Suba a infraestrutura (Postgres, Redis, Minio):

```bash
docker-compose up -d
```

3. Instale dependências e rode o frontend:

```bash
cd frontend
npm install
npm run dev
```

Acesse o app em: http://localhost:5173

## Build e preview (produção local)

```bash
npm run build
npm run preview
```

## Variáveis de ambiente

Configure no `.env` da raiz (baseado em `.env.example`). Variáveis prefixadas com `VITE_` são expostas ao frontend:

```text
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=change-me
VITE_APPLE_CLIENT_ID=change-me
```

> **Nunca commite valores reais de segredos.** Mantenha segredos no `.env` local.

## Estrutura

```text
src/
├── components/   # Componentes reutilizáveis de UI
├── pages/        # Páginas e telas
├── routes/       # Configuração de rotas
├── services/     # Cliente HTTP e integrações
├── hooks/        # Hooks reutilizáveis
└── styles/       # Estilos globais
```

## Lint e qualidade

O projeto usa ESLint com regras TypeScript-aware. Para projetos em produção, ative `tseslint.configs.recommendedTypeChecked` no `eslint.config.js`.

```bash
npm run lint
```

## Integração com o backend

Durante o desenvolvimento, o frontend aponta para a API local (`VITE_API_URL`). Garanta que o backend esteja rodando antes de testar fluxos autenticados, boards e métricas.

## Troubleshooting

| Problema | Solução |
|----------|---------|
| Porta 5173 ocupada | Finalize o processo ou configure outra porta no `vite.config.ts` |
| CORS / 401 na API | Verifique `VITE_API_URL` e se o backend está rodando |
| CSS do Tailwind não aplicado | Confirme que o Tailwind está configurado no `vite.config.ts` e `tailwind.config.js` |
| Erro de tipo TypeScript | Rode `npm run build` para ver erros completos de tipo |
