
# AI Ecosystem Platform 🤖🚀

Uma plataforma completa de CMS para Blogs, CRM e Automação de Marketing impulsionada por Inteligência Artificial (Gemini 3).

## 📋 Pré-requisitos

- Node.js 18+
- NPM ou Yarn
- Conta no [The Nile (Database)](https://thenile.dev)
- Conta no [Google AI Studio](https://aistudio.google.com)
- Conta no [Clerk Auth](https://clerk.com)

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd ai-ecosystem-platform
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (veja abaixo).

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

---

## 🔐 Configuração de Variáveis de Ambiente (.env)

Crie um arquivo chamado `.env.local` na raiz do projeto. Este arquivo não deve ser commitado no Git.

### 1. Banco de Dados (The Nile / Postgres)

O sistema aceita os padrões de conexão do Vercel e do Nile. Você deve usar **uma** das opções abaixo. A aplicação prioriza a variável `POSTGRES_URL`.

Copie e cole seus dados de conexão no `.env.local`:

```env
# --- Opção A: Padrão Vercel / Nile (Recomendado) ---
# Esta é a string de conexão completa.
POSTGRES_URL="postgres://user:password@us-west-2.db.thenile.dev/nile_lime_school"

# --- Variáveis Auxiliares Nile (Opcionais se POSTGRES_URL estiver definido) ---
NILEDB_URL="postgres://user:password@us-west-2.db.thenile.dev/nile_lime_school"
NILEDB_POSTGRES_URL="postgres://us-west-2.db.thenile.dev/nile_lime_school"
NILEDB_API_URL="https://us-west-2.api.thenile.dev/v2/databases/..."

# --- Opção B: Credenciais Individuais (Fallback) ---
# Use apenas se não tiver a string completa
NILEDB_USER="seu_usuario_uuid"
NILEDB_PASSWORD="sua_senha"
NILEDB_HOST="us-west-2.db.thenile.dev"
NILEDB_NAME="nile_lime_school"
```

### 2. Inteligência Artificial (Google Gemini)

Necessário para gerar posts, imagens, SEO e usar o chat.

```env
# Chave de API do Google AI Studio
API_KEY="sua_chave_gemini_aqui"
```

### 3. Autenticação (Clerk)

Necessário para login e proteção das rotas administrativas.

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

---

## ⚙️ Configurações Opcionais (Marketing)

Estas variáveis podem ser configuradas posteriormente via **Painel Admin > Configurações**, mas também podem ser definidas via `.env` para inicialização:

```env
# Email (Resend)
RESEND_API_KEY="re_..."

# WhatsApp (Meta Official)
META_ACCESS_TOKEN="EAAb..."
META_PHONE_ID="123456789"

# Integrações
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## 🚀 Deploy

Este projeto é otimizado para deploy na **Vercel**.

1. Instale a Vercel CLI ou conecte seu repositório GitHub na Vercel.
2. Nas configurações do projeto na Vercel, adicione as mesmas variáveis de ambiente definidas acima.
3. O build comando é `npm run build`.

## 📂 Estrutura do Projeto

- `/app`: Rotas e Páginas (Next.js App Router).
- `/app/api`: Endpoints de API (Backend Serverless).
- `/components`: Componentes React reutilizáveis.
- `/services`: Lógica de negócios (Chamadas Nile, Gemini, etc).
- `/lib`: Configurações de clientes (DB, Auth).
- `/types`: Definições de Tipos TypeScript.

## 🤝 Contribuição

1. Faça um Fork do projeto.
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`).
3. Faça o Commit (`git commit -m 'Add some AmazingFeature'`).
4. Faça o Push (`git push origin feature/AmazingFeature`).
5. Abra um Pull Request.
