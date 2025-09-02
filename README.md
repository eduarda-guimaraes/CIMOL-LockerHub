# **Cimol LockerHub**

## **Descrição**

O **Cimol LockerHub** é um sistema de gerenciamento de armários, onde usuários podem alugar, devolver e controlar o status dos armários disponíveis. O sistema é dividido em dois módulos principais: a interface de usuário (frontend) e a API (backend). A plataforma utiliza uma arquitetura moderna e escalável com **Node.js**, **Express**, **MongoDB**, **React**, e **Docker**.

## **Funcionalidades**

- **Cadastro de Usuários**: Criação de contas de clientes, com autenticação por e-mail.
- **Cadastro e Gestão de Armários**: Permite que os armários sejam cadastrados no sistema, com informações de disponibilidade e localização.
- **Locação e Devolução de Armários**: Controle do status dos armários, incluindo locação e devolução.
- **Dashboard de Administrador**: Visão geral de armários locados, devolvidos e livres.
- **Controle de Histórico**: Exibição de um histórico de locações e devoluções.
- **Segurança e Autenticação**: Proteção de rotas com autenticação JWT e segurança de dados.

## **Tecnologias Utilizadas**

- **Frontend**: React, Bootstrap, CSS
- **Backend**: Node.js, Express, MongoDB
- **Autenticação**: JWT
- **DevOps**: Docker

# Passos para Rodar Localmente

## Clonar o Repositório

Faça o clone do repositório para sua máquina local:

```bash
git clone https://github.com/eduarda-guimaraes/CIMOL-LockerHub
```

## Instalar Dependências

Navegue até o diretório application e instale as dependências do projeto frontend:

```bash
npm install
cd application
npm install
```

## Rodar o Projeto

Para rodar o sistema em ambiente de desenvolvimento, use o comando abaixo dentro do diretório application:

```bash
npm run dev
```

## Acessar a Aplicação

Abra o navegador e vá até http://localhost:3000 para acessar a aplicação.


