# RandoChat Clone

Este projeto é um clone do RandoChat, uma aplicação de chat aleatório em tempo real desenvolvida com tecnologias modernas de web. O objetivo é permitir que usuários encontrem parceiros aleatórios para conversar, troquem mensagens de texto e imagens, e gerenciem seus perfis.

## 🚀 Tecnologias Utilizadas

O projeto foi construído sobre uma base sólida utilizando as seguintes tecnologias:

*   **Framework Fullstack:** [Next.js 15](https://nextjs.org/) (App Router)
*   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
*   **Estilização:** [Tailwind CSS 4](https://tailwindcss.com/) & [Shadcn/ui](https://ui.shadcn.com/)
*   **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/)
*   **ORM:** [Prisma](https://www.prisma.io/)
*   **Autenticação:** [Better Auth](https://www.better-auth.com/)
*   **Tempo Real & Presença:** [Supabase](https://supabase.com/) (Presence)
*   **Gerenciamento de Estado (URL):** [Nuqs](https://nuqs.47ng.com/)
*   **Gerenciador de Pacotes:** [Bun](https://bun.sh/)
*   **Utilitários:**
    *   `framer-motion`: Para animações.
    *   `lucide-react`: Para ícones.
    *   `sonner`: Para notificações (toasts).
    *   `zod`: Para validação de esquemas.

## ✨ Funcionalidades Principais

1.  **Chat Aleatório (Random Chat):**
    *   Algoritmo para encontrar usuários online disponíveis para conversar.
    *   Integração com Supabase Presence para detectar usuários online em tempo real.

2.  **Mensagens em Tempo Real:**
    *   Troca instantânea de mensagens entre usuários.
    *   Indicador de "Digitando..." (Typing Indicator).
    *   Status de leitura de mensagens.

3.  **Compartilhamento de Imagens:**
    *   Envio de imagens no chat.
    *   Otimização e compressão de imagens no lado do cliente (Client-side compression) antes do upload para economizar banda e armazenamento.

4.  **Sistema de Contas e Perfil:**
    *   Autenticação de usuários via Better Auth.
    *   Página de perfil para edição de avatar e informações pessoais.
    *   Configurações de privacidade (ex: ocultar status online).

5.  **Interface Moderna e Responsiva:**
    *   Design responsivo (Mobile-first) adaptado para Desktop e Mobile.
    *   Tema escuro/claro (Dark Mode).
    *   Componentes de UI acessíveis e reutilizáveis (Shadcn/ui).

## 📂 Estrutura do Banco de Dados (Prisma)

O banco de dados PostgreSQL possui as seguintes entidades principais:

*   **User:** Armazena dados do usuário (nome, email, avatar, etc.).
*   **Conversation:** Representa uma conversa 1:1 entre dois usuários.
*   **Message:** Armazena o conteúdo das mensagens (texto ou URL de imagem) vinculadas a uma conversa.
*   **FavoriteConversation:** Permite que usuários favoritem conversas específicas.
*   **Session / Account:** Gerenciamento de sessões e contas vinculadas (Auth).
*   **RateLimit:** Controle de taxa para ações específicas (como buscar novos parceiros).

## 📁 Estrutura de Pastas Importantes

*   `src/app`: Rotas da aplicação (App Router).
    *   `(auth)`: Rotas de autenticação (login, registro).
    *   `home`: Área principal logada (chat, perfil, configurações).
*   `src/components`: Componentes React reutilizáveis (UI, layout, features).
*   `src/lib`: Utilitários e lógica de negócios (ações de chat, autenticação, status online).
*   `prisma`: Schema do banco de dados e migrações.

## 🛠️ Como Executar

Certifique-se de ter o **Bun** instalado.

1.  **Instalar dependências:**
    ```bash
    bun install
    ```

2.  **Configurar variáveis de ambiente:**
    Crie um arquivo `.env` baseado no `.env.exemple` e preencha as chaves necessárias (Database URL, Better Auth Secret, Supabase Keys, etc.).

3.  **Rodar o servidor de desenvolvimento:**
    ```bash
    bun dev
    ```

O projeto estará acessível em `http://localhost:3000`.
