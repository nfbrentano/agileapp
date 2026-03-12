# 📖 Guia do Usuário - AgileApp

Bem-vindo ao AgileApp! Este guia ajudará você a navegar pelas funcionalidades da plataforma, desde a criação do seu primeiro board até o acompanhamento de métricas avançadas.

---

## 1. Primeiros Passos
### Login e Autenticação
- **Acesso**: Você pode entrar usando seu e-mail e senha ou utilizar **Google/Apple OAuth** para um acesso mais rápido.
- **Perfil**: No menu de perfil, você pode ver suas atividades recentes e gerenciar suas integrações.

---

## 2. Gestão de Times e Boards
### Criando um Time
- Vá para a Dashboard principal e clique em "Novo Time".
- Escolha entre os modos **Kanban** (fluxo contínuo) ou **Scrum** (planejamento por sprints).

### Configurando Colunas
- No menu de configurações do board, você pode adicionar, remover ou renomear colunas.
- **WIP Limits**: Defina o limite de "Trabalho em Progresso" para cada coluna para evitar sobrecarga do time.

---

## 3. Gerenciamento de Tarefas (Cards)
### Criando Cards
- Clique em "+" em qualquer coluna para criar uma nova tarefa.
- Adicione descrição, prioridade (`Baixa`, `Média`, `Alta`, `Urgente`) e responsáveis.

### Funcionalidades Avançadas do Card
- **Sub-tasks**: Quebre tarefas grandes em itens menores. O progresso do card será atualizado automaticamente.
- **Dependências (Blockers)**: Marque se um card está bloqueado por outro. O sistema impedirá a movimentação do card bloqueado até que o impedimento seja resolvido.
- **Recorrência**: Configure cards para serem criados automaticamente (diário, semanal ou mensal) — ideal para reuniões ou backups.

---

## 4. Eficiência e Alertas
### Alerta de Estagnação (A Tartaruga 🐢)
- Se um card ficar parado em uma coluna por mais tempo que a média histórica do time, um ícone de tartaruga aparecerá. Isso ajuda o time a focar onde o fluxo está travado.

### Histórico e Logs
- Cada movimentação de card gera um registro histórico, permitindo auditar quem moveu o que e quando.

---

## 5. Scrum e Métricas
### Ciclo de Sprint
- No modo Scrum, você pode criar uma **Sprint**, selecionar os cards do Backlog e iniciá-la.
- Ao encerrar a Sprint, um relatório de performance é gerado automaticamente.

### Dashboard de Métricas
- Visualize gráficos de **Cycle Time** (tempo de execução) e **Velocity** (velocidade do time) para tomar decisões baseadas em dados.

---

## 6. Integrações e Automação
### Webhooks
- Conecte o AgileApp ao seu Slack ou Discord.
- O sistema enviará notificações em tempo real sempre que um card for criado, movido ou concluído.

---

*Dúvidas técnicas? Consulte o [README.md principal](./README.md) ou procure os guias técnicos em cada pasta.*
