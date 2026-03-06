# Regras de Negócio por Pasta - AgileApp

Este documento descreve a organização do projeto e as regras de negócio implementadas em cada diretório.

## 📁 Backend (`/backend`)

### 🛰️ `src/services` (Lógica Central)
*   **`webhook.service.ts`**:
    *   **Assinatura HMAC**: Autentica payloads usando SHA256 se um segredo estiver configurado.
    *   **Retry Automático**: Implementa backoff exponencial (tentativas em 30s e 5m) para falhas de entrega.
*   **`stagnation.service.ts`**:
    *   **SLA (Service Level Agreement)**: Monitora o tempo médio das colunas. Marca cards como "estagnados" 🐢 se o tempo atual exceder a `média * fator_do_time`.
*   **`recurrence.service.ts`**:
    *   **Automação de Rotina**: Job diário que clona cards recorrentes (Diário, Semanal, Mensal) para a primeira coluna do board.
*   **`attachment.service.ts`**:
    *   **Gestão de Arquivos**: Integração com S3 (Minio) para upload/download de anexos com validação de bucket.
*   **`dependency.service.ts`**:
    *   **Bloqueios**: Gerencia relações de predecessores e sucessores entre cards.

### 🎮 `src/controllers` (Fluxos de Entrada)
*   **`card.controller.ts`**:
    *   **Limite de WIP**: Impede a movimentação para colunas que excederam o limite de trabalho em progresso (com override de Admin).
    *   **Trava de Bloqueio**: Impede mover cards que possuem dependências ativas.
    *   **Trava de Sub-tasks**: Impede concluir um card pai se houver sub-tasks pendentes.
*   **`sprint.controller.ts`**:
    *   **Fechamento de Sprint**: Gera relatórios de performance (Velocity, Completion Rate) e move cards não finalizados automaticamente para o backlog.
*   **`auth.controller.ts`**:
    *   **Refresh Token**: Rotação automática de tokens para manter sessões seguras sem logins frequentes.

### 🗄️ `prisma/`
*   **`schema.prisma`**: Coração dos dados. Define integridade referencial entre Times, Colunas, Cards e Históricos.

---

## 📁 Frontend (`/frontend`)

### 🛠️ `src/services`
*   **`api.ts`**:
    *   **Interceptor de 401**: Se um token expira, o interceptor tenta renová-lo via Refresh Token antes de deslogar o usuário.
*   **`webhookService.ts`**: Abstração para gestão de URLs, eventos e logs de entrega.

### 🧱 `src/components`
*   **`DraggableCard`**:
    *   **Feedback Visual**: Exibe progresso de sub-tasks, status de estagnação e ícones de recorrência.
*   **`WebhookSettings`**:
    *   **Segurança**: Interface para gerar segredos de assinatura e auditar falhas em tempo real (Logs).

### 📄 `src/pages`
*   **`BoardPage`**:
    *   **Modos Kanban/Scrum**: Adapta a visualização e comportamentos (ex: Sprint vs Fluxo Contínuo) com base no perfil do time.
*   **`SprintReportPage`**:
    *   **Transparência**: Exibição de KPIs e possibilidade de compartilhamento público via Token único.
