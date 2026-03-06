# Guia de Instalação e Execução Local - AgileApp

Este guia fornece instruções detalhadas para configurar e rodar o AgileApp em sua máquina local.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:
*   **Docker** e **Docker Compose**
*   **Node.js** (v18 ou superior)
*   **NPM** ou **Yarn**

---

## 🐳 Opção A: Execução via Docker (Recomendado)

Esta é a maneira mais simples de rodar todo o ecossistema (Database, S3, Backend e Frontend).

1.  **Preparar o Ambiente**:
    ```bash
    cp .env.example .env
    ```
2.  **Subir os Containers**:
    ```bash
    docker-compose up --build -d
    ```
3.  **Acesso**:
    *   Frontend: `http://localhost:3000`
    *   Backend: `http://localhost:3001`
    *   Minio (S3): `http://localhost:9001` (User/Pass: `minioadmin`)

---

## 💻 Opção B: Execução Manual (Desenvolvimento)

Ideal para quando você deseja depurar o código ou fazer alterações frequentes.

### 1. Infraestrutura de Apoio
Suba apenas o Banco de Dados e o Minio para evitar instalar dependências pesadas localmente:
```bash
docker-compose up -d db minio createbuckets
```

### 2. Configurar e Rodar o Backend
1.  Navegue até a pasta: `cd backend`
2.  Instale as dependências: `npm install`
3.  Configure o arquivo `.env`:
    *   Copie do exemplo: `cp .env.example .env` (dentro de `backend/`)
    *   Garanta que `DATABASE_URL` aponta para `localhost:5432`.
4.  Execute as migrações do banco:
    ```bash
    npx prisma migrate dev
    ```
5.  Inicie o servidor: `npm run dev`

### 3. Configurar e Rodar o Frontend
1.  Navegue até a pasta (em outro terminal): `cd frontend`
2.  Instale as dependências: `npm install`
3.  Configure o arquivo `.env`:
    *   Crie um `.env` com:
        ```env
        VITE_API_URL=http://localhost:3001
        ```
4.  Inicie o servidor: `npm run dev` (Acessível em `http://localhost:5173`)

---

## 🛠️ Variáveis de Ambiente Importantes

*   `DATABASE_URL`: String de conexão com o PostgreSQL.
*   `JWT_SECRET`: Chave para geração de tokens de acesso.
*   `GOOGLE_CLIENT_ID` / `APPLE_CLIENT_ID`: Credenciais para login social (Opcional).
*   `S3_ENDPOINT`: No Docker use `http://minio:9000`, localmente use `http://localhost:9000`.

## 🧪 Verificação
Após iniciar, você pode testar a conexão API executando:
```bash
curl http://localhost:3001/api/health
```

---
*Em caso de dúvidas, consulte o arquivo [BUSINESS_RULES.md](./BUSINESS_RULES.md) para entender a lógica das pastas.*
