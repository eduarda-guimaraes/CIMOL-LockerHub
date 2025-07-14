# Arquivo: Dockerfile

# --- Estágio 1: O "Builder" (nossa cozinha de preparo) ---
FROM node:lts-alpine AS builder

WORKDIR /app

# --- MODIFICAÇÃO AQUI: Declarando e definindo a variável de ambiente para o build ---
# Declara um argumento que pode ser passado no comando 'docker build'
ARG MONGO_URI
# Define a variável de ambiente DENTRO do container de build com o valor do argumento
ENV MONGO_URI=$MONGO_URI

# Adicione as outras variáveis de ambiente necessárias para o build
ARG JWT_SECRET
ENV JWT_SECRET=$JWT_SECRET

ARG JWT_REFRESH_SECRET
ENV JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET

COPY application/package*.json ./

RUN npm install

COPY application/ ./

RUN npm run build


# --- Estágio 2: O "Runner" (nossa cozinha de servir, limpa e final) ---
FROM node:lts-alpine

WORKDIR /app

ENV NODE_ENV=production

# As variáveis de ambiente para o estágio final serão passadas ao rodar o container,
# não aqui no Dockerfile, para máxima segurança.

COPY --from=builder /app/package*.json ./

RUN npm install --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

EXPOSE 3000

CMD ["npm", "start"]