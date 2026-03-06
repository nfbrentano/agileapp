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

## 📘 Documentação Adicional

Para detalhes técnicos específicos, consulte:
*   [BUSINESS_RULES.md](./BUSINESS_RULES.md) - Mapeamento de regras de negócio por pasta.
*   [walkthrough.md](./backend/docs/walkthrough.md) - Guia passo a passo das funcionalidades.

---
*AgileApp - Engineered for Speed, Built for Reliability.*
