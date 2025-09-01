# GabyMakes - API do E-commerce

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

<p align="center">
  API RESTful para o e-commerce GabyMakes, desenvolvida com <strong>NestJS</strong> para gerenciar produtos, usuários, pedidos e pagamentos.
</p>

<p align="center">
    <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"/>
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
    <img src="https://img.shields.io/badge/TypeORM-E8225A?style=for-the-badge" alt="TypeORM"/>
    <img src="https://img.shields.io/badge/Mercado_Pago-009EE3?style=for-the-badge&logo=mercado-pago&logoColor=white" alt="Mercado Pago"/>
    <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel"/>
</p>

---

## 🎯 Sobre o Projeto

A **GabyMakes API** é o backend robusto que alimenta a plataforma de e-commerce GabyMakes. Construída com NestJS, a API oferece um conjunto completo de endpoints para gerenciar todas as operações da loja, desde o cadastro de produtos e autenticação de usuários até o processamento de pagamentos e o gerenciamento de pedidos.

A arquitetura é modular e escalável, seguindo as melhores práticas de desenvolvimento para garantir segurança, performance e manutenibilidade.

> Este repositório contém o código-fonte da **API backend**. O website que consome esta API está em um repositório separado.
>
> **Repositório do Frontend:** 🌐 [GabyMakes Website](https://github.com/CristianoMends/gabymakes-website)

---

## ✨ Funcionalidades Principais

* **Autenticação e Autorização**:
    * Sistema completo de autenticação com `e-mail/senha` e `Google OAuth`.
    * Proteção de rotas com `JWT (JSON Web Tokens)` e guards de autorização.
    * Controle de acesso baseado em `cargos (Roles)` para rotas administrativas.

* **Gerenciamento de Produtos (CRUD)**:
    * Criação, listagem, atualização e exclusão de produtos.
    * Busca avançada de produtos com filtros e paginação.

* **Controle de Conteúdo da Home**:
    * Gerenciamento de `Banners` promocionais.
    * Gerenciamento de seções de `Destaques` para exibição de produtos específicos na página inicial.

* **Sistema de Pedidos e Pagamentos**:
    * Criação e gerenciamento de `pedidos` associados a usuários e produtos.
    * Integração com a API do **Mercado Pago** para processamento de pagamentos.
    * Webhook para receber e processar o `status do pagamento` (aprovado, pendente, etc.).

* **Gerenciamento de Carrinho**:
    * Adicionar, remover e atualizar a quantidade de itens no carrinho de um usuário.

* **Upload de Arquivos**:
    * Sistema de upload de imagens para produtos, banners e destaques.
    * Estratégia de armazenamento configurável: `localmente` ou na nuvem com **Vercel Blob**.

* **Notificações por E-mail**:
    * Envio de e-mails de confirmação de compra para o cliente e para o dono da loja usando `Nodemailer` e templates `Handlebars`.

---

## 🚀 Tecnologias Utilizadas

* **Framework**: [NestJS](https://nestjs.com/)
* **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
* **Banco de Dados**: [PostgreSQL](https://www.postgresql.org/)
* **ORM**: [TypeORM](https://typeorm.io/)
* **Autenticação**: [Passport.js](http://www.passportjs.org/) (com estratégias `JWT` e `Local`)
* **Pagamentos**: SDK do [Mercado Pago](https://github.com/mercadopago/sdk-nodejs)
* **Deploy**: Configurado para deploy na [Vercel](https://vercel.com/)

---

## ⚙️ Configuração do Ambiente

### Pré-requisitos

* [Node.js](https://nodejs.org/en/) (v18 ou superior)
* Um gerenciador de pacotes ([npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/) ou [pnpm](https://pnpm.io/))
* Uma instância do PostgreSQL rodando (localmente ou na nuvem).
* Credenciais do Mercado Pago e do Google OAuth.

### Passos para Instalação

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/CristianoMends/gabymakes-servidor.git](https://github.com/CristianoMends/gabymakes-servidor.git)
    cd gabymakes-servidor
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    * Crie um arquivo `.env` na raiz do projeto.
    * Preencha as variáveis com suas credenciais, seguindo o exemplo abaixo:
        ```env
        # Banco de Dados
        DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

        # Autenticação
        JWT_SECRET="SEU_SEGREDO_JWT"
        GOOGLE_CLIENT_ID="SEU_CLIENT_ID_GOOGLE"
        GOOGLE_CLIENT_SECRET="SEU_CLIENT_SECRET_GOOGLE"

        # Pagamentos
        MERCADO_PAGO_ACCESS_TOKEN="SEU_TOKEN_DE_ACESSO_MP"
        
        # Estratégia de Upload ('local' ou 'vercel')
        UPLOAD_STRATEGY="local"

        # E-mail (Nodemailer)
        EMAIL_HOST="smtp.example.com"
        EMAIL_PORT=587
        EMAIL_USER="seu-email@example.com"
        EMAIL_PASS="sua-senha-de-app"
        EMAIL_FROM='"GabyMakes" <seu-email@example.com>'
        ```

### Rodando a Aplicação

```bash
# Modo de desenvolvimento (com watch)
npm run start:dev

# Modo de produção
npm run start:prod
```

A API estará disponível em http://localhost:3000.

