# Etapa 1: Builder
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json ./

# Instalar dependências do projeto (inclusive Prisma)
RUN npm install

# Copiar o esquema do Prisma e gerar o cliente
COPY prisma ./prisma/
RUN npx prisma generate

# Copiar o restante do código para a etapa de build
COPY . .

# Construir a aplicação Next.js
RUN npm run build

# Etapa 2: Runtime (Imagem final)
FROM node:18-alpine AS runner

# Definir diretório de trabalho
WORKDIR /app

# Copiar apenas os arquivos necessários da etapa builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expor a porta do Next.js
EXPOSE 3000

# Comando para iniciar a aplicação
CMD npm run start
