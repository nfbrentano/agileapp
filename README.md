# 🚀 AgileApp - Gerenciamento de Times de Alta Performance

AgileApp é uma plataforma completa para gestão de projetos ágeis, combinando a flexibilidade do Kanban com o rigor do Scrum. Desenvolvido para times que buscam automação, métricas precisas e confiabilidade.

---

## 🏗️ Arquitetura do Sistema

O projeto é dividido em uma estrutura monorepo simplificada:

*   **`/backend`**: API REST robusta construída com **Node.js**, **Express** e **Prisma ORM**.
*   **`/frontend`**: Interface reativa e moderna utilizando **React**, **TypeScript**, **Vite** e **Tailwind CSS**.
*   **`/infrastructure`**: Orquestração via **Docker Compose**, incluindo PostgreSQL, Minio (S3) e Redis.

---

## ✨ Funcionalidades Principais

### 📋 Board Inteligente
*   **Modos Kanban & Scrum**: Suporte a sprints, backlogs e fluxo contínuo.
*   **WIP Limits**: Controle de trabalho em progresso para identificar gargalos.
*   **Dependências**: Sistema de bloqueios (blockers) entre tarefas.
*   **Sub-tasks**: Gestão de tarefas filhas com barra de progresso automática.

### ⚙️ Automação & DevOps
*   **Webhooks Outbound**: Integração com Slack/Discord com assinatura **HMAC SHA-256** e retries automáticos.
*   **Cards Recorrentes**: Automação de tarefas diárias/semanais/mensais via CRON jobs.
*   **SLA de Estagnação**: Alertas visuais (🐢) quando uma tarefa demora mais que a média histórica da coluna.

### 📊 Métricas & Transparência
*   **Relatórios de Sprint**: Geração automática de KPIs (Velocity, Taxa de Conclusão) ao fechar sprints.
*   **Público/Privado**: Compartilhamento de relatórios via tokens seguros.
*   **Cycle & Lead Time**: Medição precisa do tempo de valor entregue.

### 🔐 Segurança
*   **Auth Full-stack**: Login via Email/Senha, Google e Apple.
*   **Segurança JWT**: Rotação de Refresh Tokens e proteção de rotas.

---

## 🚀 Como Iniciar

Você pode rodar o AgileApp rapidamente usando Docker ou manualmente para desenvolvimento.

👉 **[Veja o Guia de Instalação Detalhado (INSTALLATION.md)](./INSTALLATION.md)**

### Atalho Docker:
```bash
cp .env.example .env
docker-compose up -d
```

4.  **Acesse as interfaces**:
    *   **Frontend**: `http://localhost:5173`
    *   **Backend API**: `http://localhost:3000`
    *   **Minio Console**: `http://localhost:9001`

---

## 🗺️ Mapa de Documentação

Para facilitar a navegação e o entendimento por desenvolvedores e IAs, o projeto possui documentações localizadas em cada diretório chave:

### ⚙️ Configuração e Infraestrutura
*   **[ENV_GUIDE.md](./ENV_GUIDE.md)**: Guia completo de variáveis de ambiente e segredos.
*   **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)**: Detalhes da arquitetura de containers e persistência.
*   **[INSTALLATION.md](./INSTALLATION.md)**: Passo a passo para setup do ambiente.
*   **[BUSINESS_RULES.md](./BUSINESS_RULES.md)**: Regras de negócio globais do sistema.

### 🧠 Backend (`/backend`)
*   **[Prisma Schema](./backend/prisma/README.md)**: Modelagem de dados, relações e enums (Essencial para IA).
*   **[Controllers](./backend/src/controllers/README.md)**: Padrões de requisição, códigos de erro e side-effects.
*   **[Services](./backend/src/services/README.md)**: Lógica de negócio, webhooks e detecção de estagnação.
*   **[Routes](./backend/src/routes/README.md)**: Mapa da API REST e padrões de segurança.
*   **[Jobs](./backend/src/jobs/README.md)**: Cronogramas de tarefas em segundo plano (Recorrência, Métricas).
*   **[Middlewares](./backend/src/middlewares/README.md)**: Fluxos de autenticação e validação.
*   **[Config](./backend/src/config/README.md)**: Configurações de terceiros (Passport, S3).

### 🎨 Frontend (`/frontend`)
*   **[Public Assets](./frontend/public/README.md)**: Gestão de arquivos estáticos e marketing.
*   **[Components](./frontend/src/components/README.md)**: Biblioteca de componentes UI reutilizáveis.
*   **[Pages](./frontend/src/pages/README.md)**: Estrutura de rotas e visões da aplicação.
*   **[Services](./frontend/src/services/README.md)**: Integração com a API e gerenciamento de estado.
*   **[Layouts](./frontend/src/layouts/README.md)**: Estruturas de grid e navegação global.
*   **[Assets](./frontend/src/assets/README.md)**: Ícones e estilos processados pelo Vite.
*   **[Hooks](./frontend/src/hooks/README.md)**: Lógica reativa customizada.

---

## 📘 Documentação Adicional

Para detalhes técnicos específicos, consulte:
*   [BUSINESS_RULES.md](./BUSINESS_RULES.md) - Mapeamento de regras de negócio por pasta.
*   [WALKTHROUGH.md](./docs/WALKTHROUGH.md) - Guia passo a passo das funcionalidades.

---
*AgileApp - Engineered for Speed, Built for Reliability.*
